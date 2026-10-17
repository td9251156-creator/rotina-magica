"""
Gera a narração das práticas guiadas com voz neural, no computador do mantenedor, a partir de
docs/roteiro-narracao.md. Saída: public/audio/practices/<prática>-<fase>.mp3 (só a voz; o app toca
o "Som de fundo"). Nada é enviado para fora: tudo roda local.

Requisitos: Python 3.10+, ffmpeg (com rubberband e libmp3lame) e `pip install kokoro-onnx soundfile`.
Modelo: Kokoro-82M v1.0 em ONNX (Apache-2.0), `onnx/model.onnx` e `voices/pm_alex.bin` do repositório
onnx-community/Kokoro-82M-v1.0-ONNX. Veja docs/roteiro-narracao.md, seção "Voz neural":

    python3 scripts/gerar-narracao.py --model model.onnx --voice pm_alex.bin
"""

import argparse
import re
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent
SR = 24000

# Ritmo medido nos áudios de referência (meditações guiadas em português).
SPEED = 0.84  # voz calma
COMMA_S = 0.6  # silêncio numa vírgula
SENTENCE_S = 1.3  # silêncio entre frases da mesma fala
INHALE_S = 1.8  # puxar o ar entre uma vibração e outra
MIN_GAP_S, MAX_GAP_S = 1.6, 8.0  # silêncio entre falas: quase nunca passa de 8 s
LEAD_S = 0.5  # silêncio no começo de cada arquivo
FILL = 0.93  # a fala termina antes do fim da fase, para a próxima não cortar
PITCH = 0.84  # mais grave, perto dos ~115 Hz das referências, com o timbre preservado

# Nomes vibrados: escritos em fonemas (IPA do eSpeak), com as vogais longas, depois esticados.
NAMES = {
    'É-rei-iê': 'ˈeː xˈeːɪ jˈeː',
    'Ie-o-vá E-lo-rím': 'ˌieoːvˈaː ˌeloːxˈiːm',
    'Ie-o-vá E-lo-á Ve-da-át': 'ˌieoːvˈaː ˌeloːˈaː vedaˈaːt',
    'Xa-dái El Rái': 'ʃadˈaːɪ ˈɛːl xˈaːɪ',
    'A-do-nái Ra-A-rets': 'ˌadoːnˈaːɪ xaˈaːɾets',
}
NAME_SPEED = 0.55
NAME_STRETCH = 3.0  # cada nome passa a durar uns 5 segundos, como nas referências
NAME_PITCH = 0.9  # e sai um pouco mais grave que a fala


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


def trim(a: np.ndarray, thr: float = 0.01) -> np.ndarray:
    idx = np.flatnonzero(np.abs(a) > thr)
    return a[max(0, idx[0] - 240) : idx[-1] + 480] if len(idx) else a[:0]


def widen_pauses(a: np.ndarray) -> np.ndarray:
    """Alarga as pausas curtas que a voz faz nas vírgulas, no ritmo de quem guia uma meditação."""
    hop = SR // 100
    env = np.array([np.abs(a[i : i + hop]).max(initial=0) for i in range(0, len(a), hop)])
    quiet = env < 0.012
    out, start, i = [], 0, 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            if 12 <= j - i and i > 0 and j < len(quiet):  # pausa de 120 ms ou mais no meio da frase
                mid = (i + j) // 2 * hop
                out += [a[start:mid], silence(max(0.0, COMMA_S - (j - i) / 100))]
                start = mid
            i = j
        else:
            i += 1
    out.append(a[start:])
    return np.concatenate(out)


def ffmpeg_filter(a: np.ndarray, af: str) -> np.ndarray:
    with tempfile.TemporaryDirectory() as d:
        src, dst = Path(d, 'a.wav'), Path(d, 'b.wav')
        sf.write(src, a, SR)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', af, '-ar', str(SR), '-ac', '1', dst], check=True)
        b, _ = sf.read(dst, dtype='float32')
    return b


def speak(k: Kokoro, text: str, speed: float) -> np.ndarray:
    sentences = [s.strip() for s in re.findall(r'[^.!?:]+[.!?:]*', text) if s.strip()]
    parts = []
    for s in sentences:
        audio, _ = k.create(s, voice='pm_alex', speed=speed, lang='pt-br')
        parts += [widen_pauses(trim(audio)), silence(SENTENCE_S)]
    return np.concatenate(parts[:-1])


def intone(k: Kokoro, name: str, times: int) -> np.ndarray:
    audio, _ = k.create(NAMES[name], voice='pm_alex', speed=NAME_SPEED, is_phonemes=True)
    # Esticar as vogais e um vibrato leve dão a sensação de som sustentado e vibrando.
    long = ffmpeg_filter(trim(audio), f'rubberband=tempo={1 / NAME_STRETCH}:pitch={NAME_PITCH}:formant=preserved:transients=smooth,vibrato=f=5:d=0.05')
    return np.concatenate(sum(([long, silence(INHALE_S)] for _ in range(times)), [])[:-1])


def render(k: Kokoro, seconds: int, guide) -> np.ndarray:
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


def master(a: np.ndarray) -> np.ndarray:
    a = ffmpeg_filter(a, f'rubberband=pitch={PITCH}:formant=preserved,highpass=f=70,aecho=0.8:0.7:45|85:0.18|0.1')
    voiced = a[np.abs(a) > 0.01]
    rms = np.sqrt(np.mean(voiced**2)) if len(voiced) else 1
    a = a * (10 ** (-20 / 20) / rms)  # fala em torno de -20 dBFS
    peak = np.abs(a).max()
    return a * min(1.0, 0.85 / peak) if peak else a


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', required=True)
    ap.add_argument('--voice', required=True, help='pm_alex.bin (510 x 256 floats)')
    ap.add_argument('--only', help='gera só os arquivos que começam assim (ex.: pilar)')
    args = ap.parse_args()
    with tempfile.TemporaryDirectory() as d:
        voices = Path(d, 'vozes.npz')
        np.savez(voices, pm_alex=np.fromfile(args.voice, dtype=np.float32).reshape(-1, 1, 256))
        k = Kokoro(args.model, str(voices))
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
