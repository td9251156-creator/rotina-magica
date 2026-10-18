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
    F0 e o Azure for Students cobrem este roteiro com folga. Ver docs/roteiro-narracao.md.

    Cada fala vai inteira num pedido só, com as pausas dentro do SSML: a voz mantém a entonação de uma
    frase para a outra, como uma pessoa lendo. Sem mudar o tom, sem esticar e sem eco artificial, que é o
    que denuncia a voz de IA."""

    speed = 1.0  # no ritmo natural da voz: desacelerar com prosody deixa a fala arrastada e artificial
    dry = True  # a voz já sai limpa de estúdio: sem reverberação nem equalização
    sentence_s = 0.7  # entre frases da mesma fala: a voz emenda como quem conversa
    max_gap_s = 5.0  # entre falas: pausas longas demais quebram o fio

    def __init__(self, voice: str | None):
        import os

        self.key = os.environ['AZURE_SPEECH_KEY']
        self.base = f"https://{os.environ['AZURE_SPEECH_REGION']}.tts.speech.microsoft.com/cognitiveservices"
        self.listed = {v['ShortName']: v for v in self.voices()}
        self.use(voice or self._best_voice(list(self.listed)))

    def use(self, voice: str) -> None:
        self.voice = voice
        # Estilo calmo, quando a voz tem: soa como quem conduz um relaxamento, não como quem lê notícia.
        styles = self.listed.get(voice, {}).get('StyleList', [])
        self.style = next((st for st in ('calm', 'gentle', 'relaxed', 'empathetic') if st in styles), None)
        print(f'voz: {self.voice}' + (f' (estilo {self.style})' if self.style else ''))

    def _get(self, path: str):
        import json
        import urllib.request

        req = urllib.request.Request(f'{self.base}/{path}', headers={'Ocp-Apim-Subscription-Key': self.key})
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r)

    def voices(self) -> list[dict]:
        """Vozes que falam português do Brasil nesta região (as multilíngues também)."""
        return [
            v for v in self._get('voices/list')
            if v['Locale'] == 'pt-BR' or 'pt-BR' in v.get('SecondaryLocaleList', [])
        ]

    def _best_voice(self, names: list[str]) -> str:
        """A mais natural que a região tiver: HD, depois multilíngue masculina, depois a Antonio."""
        for want in ('pt-BR-Macerio:DragonHDLatestNeural', 'pt-BR-MacerioMultilingualNeural', 'pt-BR-AntonioNeural'):
            if want in names:
                return want
        hd = [n for n in names if 'DragonHD' in n]
        return hd[0] if hd else 'pt-BR-AntonioNeural'

    def _ssml(self, inner: str) -> np.ndarray:
        import io
        import urllib.error
        import urllib.request

        body = f'<lang xml:lang="pt-BR">{inner}</lang>' if 'Multilingual' in self.voice or 'DragonHD' in self.voice else inner
        if self.style:
            body = f'<mstts:express-as style="{self.style}">{body}</mstts:express-as>'
        ssml = (
            '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" '
            'xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="pt-BR">'
            f'<voice name="{self.voice}">{body}</voice></speak>'
        )
        req = urllib.request.Request(
            f'{self.base}/v1',
            data=ssml.encode('utf-8'),
            headers={
                'Ocp-Apim-Subscription-Key': self.key,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
                'User-Agent': 'rotina-magica-narracao',
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                audio, rate = sf.read(io.BytesIO(r.read()), dtype='float32')
        except urllib.error.HTTPError as e:
            if e.code != 400 or not self.style:
                raise
            print(f'estilo {self.style} recusado: segue sem estilo')
            self.style = None
            return self._ssml(inner)
        assert rate == SR
        return audio

    def say_block(self, text: str, speed: float) -> np.ndarray:
        return self._ssml(self._fala(text, speed))

    def _fala(self, text: str, speed: float) -> str:
        from xml.sax.saxutils import escape

        sentences = [escape(s.strip()) for s in re.findall(r'[^.!?:]+[.!?:]*', text) if s.strip()]
        body = f' {pause(self.sentence_s)} '.join(sentences)
        return f'<prosody rate="{round((speed - 1) * 100)}%">{body}</prosody>'

    def _nome(self, name: str, times: int, ipa: bool) -> str:
        said = f'<phoneme alphabet="ipa" ph="{NAMES[name]}">{name}</phoneme>' if ipa else name.replace('-', ' ')
        return f' {pause(INHALE_S)} '.join([f'<prosody rate="-40%">{said}</prosody>'] * times)

    def say_phase(self, guide, gap: float, speed: float) -> np.ndarray:
        """A fase inteira num áudio só: a voz respira entre as falas como numa gravação contínua."""
        import urllib.error

        def ssml(ipa: bool) -> str:
            parts = [self._nome(g[1], g[2], ipa) if isinstance(g, tuple) else self._fala(g, speed) for g in guide]
            return f' {pause(gap)} '.join(parts)

        try:
            return self._ssml(ssml(True))
        except urllib.error.HTTPError:  # fonema recusado: fala as sílabas como estão escritas
            return self._ssml(ssml(False))

    def name(self, name: str) -> np.ndarray:
        import urllib.error

        try:
            inner = f'<phoneme alphabet="ipa" ph="{NAMES[name]}">{name}</phoneme>'
            return self._ssml(f'<prosody rate="-40%">{inner}</prosody>')
        except urllib.error.HTTPError:  # fonema recusado: fala as sílabas como estão escritas
            return self._ssml(f'<prosody rate="-40%">{name.replace("-", " ")}</prosody>')


def pause(seconds: float) -> str:
    """Pausa em SSML (o Azure aceita até 5 s por pausa, então as maiores viram várias)."""
    ms = int(seconds * 1000)
    return ' '.join(f'<break time="{min(5000, ms - i)}ms"/>' for i in range(0, ms, 5000)) if ms > 0 else ''


def speak(v, text: str, speed: float) -> np.ndarray:
    if hasattr(v, 'say_block'):
        return fade(trim(v.say_block(text, speed)))
    sentences = [s.strip() for s in re.findall(r'[^.!?:]+[.!?:]*', text) if s.strip()]
    parts = []
    for s in sentences:
        parts += [trim(v.say(s, speed)), silence(SENTENCE_S)]
    return np.concatenate(parts[:-1])


def intone(v, name: str, times: int) -> np.ndarray:
    if getattr(v, 'dry', False):  # a voz do Azure já alonga o nome; esticar por cima soa metálico
        long = fade(trim(v.name(name)))
        return np.concatenate(sum(([long, silence(INHALE_S)] for _ in range(times)), [])[:-1])
    # Esticar as vogais e um vibrato leve dão a sensação de som sustentado e vibrando.
    long = fade(ffmpeg_filter(trim(v.name(name)), f'rubberband=tempo={1 / NAME_STRETCH}:formant=preserved:transients=smooth:detector=soft:window=long,vibrato=f=5:d=0.02'))
    return np.concatenate(sum(([long, silence(INHALE_S)] for _ in range(times)), [])[:-1])


def render(k, seconds: int, guide) -> np.ndarray:
    base = getattr(k, 'speed', SPEED)
    for speed in (base, base + 0.04, base + 0.08):
        blocks = [intone(k, g[1], g[2]) if isinstance(g, tuple) else speak(k, g, speed) for g in guide]
        speech = sum(len(b) for b in blocks) / SR
        room = seconds * FILL - LEAD_S - speech
        if room >= MIN_GAP_S * (len(blocks) - 1):
            break
    gap = min(getattr(k, 'max_gap_s', MAX_GAP_S), room / max(1, len(blocks) - 1)) if len(blocks) > 1 else 0
    if room < MIN_GAP_S * (len(blocks) - 1):
        raise SystemExit(f'Fala longa demais para {seconds} s: encurte o roteiro')
    if hasattr(k, 'say_phase'):
        whole = np.concatenate([silence(LEAD_S), fade(trim(k.say_phase(guide, gap, speed)))])
        if len(whole) / SR <= seconds * FILL:
            return whole
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


def master(a: np.ndarray, dry: bool = False) -> np.ndarray:
    if not dry:
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
    ap.add_argument('--voice', help='kokoro: pm_alex.bin (510 x 256 floats); azure: nome da voz (padrão: a mais natural da região)')
    ap.add_argument('--listar-vozes', action='store_true', help='azure: mostra as vozes em português e sai')
    ap.add_argument('--only', help='gera só os arquivos que começam assim (ex.: pilar)')
    ap.add_argument('--amostras', action='store_true', help='azure: um trecho com cada voz em português, para comparar')
    ap.add_argument('--extras', help='JSON de scripts/narracao-textos.ts: avisos curtos e passos das vivências')
    args = ap.parse_args()
    if args.engine == 'azure':
        k = AzureVoice(args.voice or ('pt-BR-AntonioNeural' if args.listar_vozes else None))
        if args.listar_vozes:
            for v in k.voices():
                print(v['ShortName'], v['Gender'], v.get('VoiceType', ''), ','.join(v.get('StyleList', [])))
            return
    else:
        if not (args.model and args.voice):
            ap.error('kokoro precisa de --model e --voice')
        k = KokoroVoice(args.model, args.voice)
    if args.amostras:
        return amostras(k)
    out_dir = ROOT / 'public' / 'audio' / 'practices'
    out_dir.mkdir(parents=True, exist_ok=True)
    for file, seconds, guide in parse_script((ROOT / 'docs' / 'roteiro-narracao.md').read_text(encoding='utf-8')):
        if args.only and not file.startswith(args.only):
            continue
        a = master(render(k, seconds, guide), getattr(k, 'dry', False))
        save(a, out_dir / file)
        print(f'{file}: {len(a) / SR:.1f} s de {seconds} s')
    if args.extras:
        import json

        items = json.loads(Path(args.extras).read_text(encoding='utf-8'))
        audio = ROOT / 'public' / 'audio'
        for item in items:
            a = master(np.concatenate([silence(0.2), speak(k, item['text'], getattr(k, 'speed', SPEED))]), getattr(k, 'dry', False))
            (audio / item['path']).parent.mkdir(parents=True, exist_ok=True)
            save(a, audio / item['path'])
        # O teste confere este índice contra o texto do app: mudou um passo, gere de novo.
        (audio / 'textos.json').write_text(json.dumps(items, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        print(f'{len(items)} avisos e passos das vivências')


AMOSTRA = [
    'Encontre uma posição confortável. E deixe os olhos se fecharem, no seu tempo.',
    'Puxe o ar pelo nariz. E, ao soltar, os ombros podem descer.',
    'Você já sabe imaginar. Faz isso todo dia, sem perceber.',
    'Não sei se a calma chega primeiro nas mãos, ou no peito.',
]


def amostras(k) -> None:
    """O mesmo trecho com cada voz que fala português nesta região, para escolher ouvindo
    (public/amostras.html). Vozes nativas primeiro, depois as multilíngues."""
    import json

    out = ROOT / 'public' / 'audio' / 'amostras'
    out.mkdir(parents=True, exist_ok=True)
    voices = sorted(k.listed.values(), key=lambda v: (v['Locale'] != 'pt-BR', 'DragonHD' not in v['ShortName'], v['ShortName']))
    index = []
    for v in voices[:24]:
        try:
            k.use(v['ShortName'])
            a = master(np.concatenate([silence(0.3), fade(trim(k.say_phase(AMOSTRA, 2.0, k.speed)))]), True)
        except Exception as e:  # voz que a região lista mas não sintetiza: pula
            print(f"{v['ShortName']}: {e}")
            continue
        file = f"{v['ShortName'].replace(':', '-')}.mp3"
        save(a, out / file)
        index.append({'voz': v['ShortName'], 'genero': v.get('Gender', ''), 'tipo': v.get('VoiceType', ''), 'arquivo': file})
    (out / 'index.json').write_text(json.dumps(index, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'{len(index)} amostras')


def save(a: np.ndarray, path: Path) -> None:
    with tempfile.TemporaryDirectory() as d:
        wav = Path(d, 'a.wav')
        sf.write(wav, a, SR)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-ac', '1', '-c:a', 'libmp3lame', '-q:a', '6', path], check=True)


if __name__ == '__main__':
    main()
