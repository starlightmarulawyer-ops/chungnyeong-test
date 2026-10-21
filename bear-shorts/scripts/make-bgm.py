"""Synthesize a short, bouncy marimba loop used as background music.

Usage: python3 scripts/make-bgm.py bgm.wav  (then encode it to public/bgm.m4a)
"""
import sys
import wave

import numpy as np

SR = 48000
BPM = 120
DURATION = 12.5
BEAT = 60 / BPM
EIGHTH = BEAT / 2

# C - Am - F - G, one chord per bar (4 beats)
CHORDS = [
    [60, 64, 67],
    [57, 60, 64],
    [53, 57, 60],
    [55, 59, 62],
]
# Arpeggio pattern over the chord tones (index, octave shift) per 8th note
PATTERN = [(0, 12), (2, 0), (1, 12), (2, 0), (0, 24), (2, 0), (1, 12), (2, 12)]


def midi_to_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def marimba(freq, length, amp):
    t = np.arange(int(SR * length)) / SR
    body = np.sin(2 * np.pi * freq * t) * np.exp(-t * 7)
    overtone = 0.25 * np.sin(2 * np.pi * freq * 3.93 * t) * np.exp(-t * 28)
    attack = np.minimum(t / 0.004, 1)
    return amp * attack * (body + overtone)


def bass(freq, length, amp):
    t = np.arange(int(SR * length)) / SR
    tone = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2 * t)
    return amp * np.minimum(t / 0.01, 1) * np.exp(-t * 4) * tone


def shaker(length, amp, rng):
    n = int(SR * length)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # crude high-pass: difference of noise
    noise = np.diff(noise, prepend=0)
    return amp * noise * np.exp(-t * 60)


def add(buf, sig, start, pan):
    i = int(start * SR)
    j = min(i + len(sig), buf.shape[0])
    if i >= buf.shape[0]:
        return
    left = np.cos((pan + 1) * np.pi / 4)
    right = np.sin((pan + 1) * np.pi / 4)
    buf[i:j, 0] += sig[: j - i] * left
    buf[i:j, 1] += sig[: j - i] * right


def main(out_path):
    rng = np.random.default_rng(7)
    total = int(SR * DURATION)
    buf = np.zeros((total, 2))
    n_eighths = int(DURATION / EIGHTH)
    for k in range(n_eighths):
        start = k * EIGHTH
        bar = (k // 8) % len(CHORDS)
        chord = CHORDS[bar]
        idx, octave = PATTERN[k % 8]
        note = chord[idx] + octave
        add(buf, marimba(midi_to_hz(note), 0.9, 0.22), start, -0.25 if k % 2 else 0.25)
        if k % 4 == 0:
            add(buf, bass(midi_to_hz(chord[0] - 24), 0.9, 0.35), start, 0)
        if k % 2 == 1:
            add(buf, shaker(0.08, 0.035, rng), start, 0.4)

    fade = int(SR * 0.6)
    buf[-fade:] *= np.linspace(1, 0, fade)[:, None]
    buf *= 10 ** (-6 / 20) / np.max(np.abs(buf))

    pcm = (buf * 32767).astype(np.int16)
    with wave.open(out_path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    main(sys.argv[1])
