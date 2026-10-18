"""
Gera a narração das práticas guiadas com voz neural, no computador do mantenedor, a partir de
docs/roteiro-narracao.md. Saída: public/audio/practices/<prática>-<fase>.mp3 (só a voz; o app toca
o "Som de fundo"). Veja docs/roteiro-narracao.md, seção "Voz neural".

Requisitos: Python 3.10+, ffmpeg (com rubberband e libmp3lame) e `pip install soundfile numpy`.

Kokoro (padrão, roda sem internet): `pip install kokoro-onnx`, com `onnx/model.onnx` e `voices/pm_alex.bin`
de onnx-community/Kokoro-82M-v1.0-ONNX (Apache-2.0):

    python3 scripts/gerar-narracao.py --model model.onnx --voice pm_alex.bin

Azure (voz mais natural; só o texto do roteiro sai do computador), com a chave só no terminal:

    AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=brazilsouth python3 scripts/gerar-narracao.py --engine azure
"""

import argparse
import re
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
SR = 24000

# Ritmo medido nos áudios de referência (meditações guiadas em português). A frase sai inteira, do jeito
# que a voz neural fala: sem cortar pausas no meio, sem mudar o tom da voz e sem esticar a fala, que é o
# que deixava a narração travada e robótica.
SPEED = 0.86  # voz calma
SENTENCE_S = 1.1  # silêncio entre frases da mesma fala
INHALE_S = 1.8  # puxar o ar entre uma vibração e outra
MIN_GAP_S, MAX_GAP_S = 1.6, 8.0  # silêncio entre falas: quase nunca passa de 8 s
LEAD_S = 0.6  # silêncio no começo de cada arquivo
FILL = 0.93  # a fala termina antes do fim da fase, para a próxima não cortar
FADE_S = 0.015  # cada pedaço entra e sai suave, sem estalo

# Nomes vibrados: escritos em fonemas (IPA do eSpeak), com as vogais longas, depois esticados de leve.
NAMES = {
    'É-rei-iê': 'ˈeː xˈeːɪ jˈeː',
    'Ie-o-vá E-lo-rím': 'ˌieoːvˈaː ˌeloːxˈiːm',
    'Ie-o-vá E-lo-á Ve-da-át': 'ˌieoːvˈaː ˌeloːˈaː vedaˈaːt',
    'Xa-dái El Rái': 'ʃadˈaːɪ ˈɛːl xˈaːɪ',
    'A-do-nái Ra-A-rets': 'ˌadoːnˈaːɪ xaˈaːɾets',
}
NAME_SPEED = 0.6
NAME_STRETCH = 1.8  # esticar mais que isso deixa o som metálico


def parse_script(md: str):
    """Lê o roteiro: [(arquivo, segundos, [fala | ('vibrar', nome, vezes)])]."""
    phases = []
    for line in md.splitlines():
        head = re.match(r'### `([\w-]+\.mp3)` · .* · até (\d+) s', line)
        if head:
            phases.append((head.group(1), int(head.group(2)), []))
            continue
        if not phases or not line.startswith('- '):
            continue
        name = re.match(r'- \*\(vibrar (\d+) vezes.*\)\* \*\*(.+)\*\*', line)
        phases[-1][2].append(('vibrar', name.group(2), int(name.group(1))) if name else line[2:].strip())
    return phases


def silence(seconds: float) -> np.ndarray:
    return np.zeros(int(seconds * SR), dtype=np.float32)


def trim(a: np.ndarray, thr: float = 0.004) -> np.ndarray:
    # Corta só o silêncio das pontas, com folga para não comer o fim das palavras nem o respiro.
    idx = np.flatnonzero(np.abs(a) > thr)
    return fade(a[max(0, idx[0] - 480) : idx[-1] + 2400]) if len(idx) else a[:0]


def fade(a: np.ndarray) -> np.ndarray:
    n = min(int(FADE_S * SR), len(a) // 2)
    if n:
        ramp = np.linspace(0, 1, n, dtype=np.float32)
        a = a.copy()
        a[:n] *= ramp
        a[-n:] *= ramp[::-1]
    return a


def ffmpeg_filter(a: np.ndarray, af: str) -> np.ndarray:
    with tempfile.TemporaryDirectory() as d:
        src, dst = Path(d, 'a.wav'), Path(d, 'b.wav')
        sf.write(src, a, SR)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', af, '-ar', str(SR), '-ac', '1', dst], check=True)
        b, _ = sf.read(dst, dtype='float32')
    return b


class KokoroVoice:
    """Voz neural local (Kokoro-82M, Apache-2.0). Roda sem internet."""

    def __init__(self, model: str, voice: str):
        from kokoro_onnx import Kokoro

        with tempfile.TemporaryDirectory() as d:
            voices = Path(d, 'vozes.npz')
            np.savez(voices, pm_alex=np.fromfile(voice, dtype=np.float32).reshape(-1, 1, 256))
            self.k = Kokoro(model, str(voices))

    def say(self, sentence: str, speed: float) -> np.ndarray:
        return self.k.create(sentence, voice='pm_alex', speed=speed, lang='pt-br')[0]

    def name(self, name: str) -> np.ndarray:
        return self.k.create(NAMES[name], voice='pm_alex', speed=NAME_SPEED, is_phonemes=True)[0]


class AzureVoice:
    """Voz neural da Microsoft (Azure Speech), mais natural em português. Só o texto do roteiro sai do
    computador. Precisa de AZURE_SPEECH_KEY e AZURE_SPEECH_REGION (nunca no repositório); o plano gratuito
    F0 e o Azure for Students cobrem este roteiro com folga. Ver docs/roteiro-narracao.md."""

    def __init__(self, voice: str):
        import os

        self.voice = voice
        self.key = os.environ['AZURE_SPEECH_KEY']
        self.url = f"https://{os.environ['AZURE_SPEECH_REGION']}.tts.speech.microsoft.com/cognitiveservices/v1"

    def _ssml(self, inner: str) -> np.ndarray:
        import io
        import urllib.request

        ssml = (
            '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR">'
            f'<voice name="{self.voice}">{inner}</voice></speak>'
        )
        req = urllib.request.Request(
            self.url,
            data=ssml.encode('utf-8'),
            headers={
                'Ocp-Apim-Subscription-Key': self.key,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
                'User-Agent': 'rotina-magica-narracao',
            },
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            audio, rate = sf.read(io.BytesIO(r.read()), dtype='float32')
        assert rate == SR
        return audio

    def say(self, sentence: str, speed: float) -> np.ndarray:
        from xml.sax.saxutils import escape

        # Pausa de quem guia uma meditação nas vírgulas; o resto da entonação é da própria voz.
        text = escape(sentence).replace(', ', ', <break time="450ms"/>')
        return self._ssml(f'<prosody rate="{round((speed - 1) * 100)}%" pitch="-4%">{text}</prosody>')

    def name(self, name: str) -> np.ndarray:
        import urllib.error

        try:
            inner = f'<phoneme alphabet="ipa" ph="{NAMES[name]}">{name}</phoneme>'
            return self._ssml(f'<prosody rate="-45%" pitch="-6%">{inner}</prosody>')
        except urllib.error.HTTPError:  # fonema recusado: fala as sílabas como estão escritas
            return self._ssml(f'<prosody rate="-45%" pitch="-6%">{name.replace("-", " ")}</prosody>')


def speak(v, text: str, speed: float) -> np.ndarray:
    sentences = [s.strip() for s in re.findall(r'[^.!?:]+[.!?:]*', text) if s.strip()]
    parts = []
    for s in sentences:
        parts += [trim(v.say(s, speed)), silence(SENTENCE_S)]
    return np.concatenate(parts[:-1])


def intone(v, name: str, times: int) -> np.ndarray:
    # Esticar as vogais e um vibrato leve dão a sensação de som sustentado e vibrando.
    long = fade(ffmpeg_filter(trim(v.name(name)), f'rubberband=tempo={1 / NAME_STRETCH}:formant=preserved:transients=smooth:detector=soft:window=long,vibrato=f=5:d=0.02'))
    return np.concatenate(sum(([long, silence(INHALE_S)] for _ in range(times)), [])[:-1])


def render(k, seconds: int, guide) -> np.ndarray:
    for speed in (SPEED, SPEED + 0.05, SPEED + 0.1):
        blocks = [intone(k, g[1], g[2]) if isinstance(g, tuple) else speak(k, g, speed) for g in guide]
        speech = sum(len(b) for b in blocks) / SR
        room = seconds * FILL - LEAD_S - speech
        if room >= MIN_GAP_S * (len(blocks) - 1):
            break
    gap = min(MAX_GAP_S, room / max(1, len(blocks) - 1)) if len(blocks) > 1 else 0
    if room < MIN_GAP_S * (len(blocks) - 1):
        raise SystemExit(f'Fala longa demais para {seconds} s: encurte o roteiro')
    out = [silence(LEAD_S)]
    for b in blocks:
        out += [b, silence(gap)]
    return np.concatenate(out[:-1])


def room(a: np.ndarray, seconds: float = 1.1, wet: float = 0.16) -> np.ndarray:
    """Reverberação de sala pequena e quente (resposta sintética), como numa gravação de meditação."""
    rng = np.random.default_rng(7)
    n = int(seconds * SR)
    ir = rng.standard_normal(n).astype(np.float32) * np.exp(-6.9 * np.arange(n) / n).astype(np.float32)
    ir = np.convolve(ir, np.ones(6, dtype=np.float32) / 6, mode='same')  # tira o brilho do eco
    ir[: int(0.02 * SR)] = 0  # 20 ms antes das primeiras reflexões
    ir /= np.sqrt(np.sum(ir**2))
    size = 1 << int(np.ceil(np.log2(len(a) + n)))
    tail = np.fft.irfft(np.fft.rfft(a, size) * np.fft.rfft(ir, size), size)[: len(a)].astype(np.float32)
    return a + wet * tail


def master(a: np.ndarray) -> np.ndarray:
    a = ffmpeg_filter(room(a), 'highpass=f=70,equalizer=f=180:t=q:w=1:g=2,equalizer=f=6500:t=q:w=1.5:g=-3')
    voiced = a[np.abs(a) > 0.01]
    rms = np.sqrt(np.mean(voiced**2)) if len(voiced) else 1
    a = a * (10 ** (-20 / 20) / rms)  # fala em torno de -20 dBFS
    peak = np.abs(a).max()
    return a * min(1.0, 0.85 / peak) if peak else a


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--engine', choices=['kokoro', 'azure'], default='kokoro')
    ap.add_argument('--model', help='kokoro: model.onnx')
    ap.add_argument('--voice', help='kokoro: pm_alex.bin (510 x 256 floats); azure: nome da voz (padrão pt-BR-AntonioNeural)')
    ap.add_argument('--only', help='gera só os arquivos que começam assim (ex.: pilar)')
    args = ap.parse_args()
    if args.engine == 'azure':
        k = AzureVoice(args.voice or 'pt-BR-AntonioNeural')
    else:
        if not (args.model and args.voice):
            ap.error('kokoro precisa de --model e --voice')
        k = KokoroVoice(args.model, args.voice)
    out_dir = ROOT / 'public' / 'audio' / 'practices'
    out_dir.mkdir(parents=True, exist_ok=True)
    for file, seconds, guide in parse_script((ROOT / 'docs' / 'roteiro-narracao.md').read_text(encoding='utf-8')):
        if args.only and not file.startswith(args.only):
            continue
        a = master(render(k, seconds, guide))
        with tempfile.TemporaryDirectory() as d:
            wav = Path(d, 'a.wav')
            sf.write(wav, a, SR)
            subprocess.run(
                ['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ac', '1', '-c:a', 'libmp3lame', '-q:a', '6', out_dir / file],
                check=True,
            )
        print(f'{file}: {len(a) / SR:.1f} s de {seconds} s')


if __name__ == '__main__':
    main()
