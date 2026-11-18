"""Cinematic storyteller bed (piano arpeggio + warm string pad + soft cello), synthesized.
usage: music.py <out.wav> <t_start> <t_end> <total_len>"""
import sys, numpy as np, soundfile as sf
from scipy.signal import fftconvolve, butter, sosfiltfilt
out, T0, T1, TOT = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4])
SR = 48000; rs = np.random.default_rng(7)
BPM = 72; BEAT = 60 / BPM; BAR = 4 * BEAT
n_tot = int(TOT * SR); mus = np.zeros((int((T1 - T0 + 4) * SR), 2))
NOTE = {'E2':82.41,'F2':87.31,'G2':98.0,'A2':110.0,'C3':130.81,'E3':164.81,'F3':174.61,'G3':196.0,'G#3':207.65,'A3':220.0,'B3':246.94,
        'C4':261.63,'D4':293.66,'E4':329.63,'F4':349.23,'G4':392.0,'G#4':415.3,'A4':440.0,'B4':493.88,'C5':523.25,'D5':587.33,'E5':659.26}
PROG = [  # bass, pad voicing, arpeggio tones
 ('A2',['A3','C4','E4'],['A4','C5','E5','C5']),
 ('F2',['F3','A3','C4'],['F4','A4','C5','A4']),
 ('C3',['G3','C4','E4'],['E4','G4','C5','G4']),
 ('G2',['G3','B3','D4'],['D4','G4','B4','G4']),
 ('A2',['A3','C4','E4'],['A4','C5','E5','C5']),
 ('F2',['F3','A3','C4'],['F4','A4','C5','A4']),
 ('G2',['G3','B3','D4'],['G4','B4','D5','B4']),
 ('E2',['G#3','B3','E4'],['E4','G#4','B4','E5']),
 ('A2',['A3','C4','E4'],['A4','C5','E5','C5'])]
def env(n, a, r):
    t = np.arange(n) / SR; e = np.minimum(1, t / a); rel = int(r * SR)
    if rel < n: e[-rel:] *= np.linspace(1, 0, rel) ** 1.5
    return e
def add(buf, t, y, pan=0.):
    i = max(0, int(t * SR))
    if i >= len(buf): return
    j = min(len(buf), i + len(y)); y = y[:j - i]
    buf[i:j, 0] += y * np.sqrt((1 - pan) / 2); buf[i:j, 1] += y * np.sqrt((1 + pan) / 2)
def pad(f, d):
    n = int(d * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for det in (-7, -2, 3, 8):
        ff = f * 2 ** (det / 1200); ph = rs.uniform(0, 2 * np.pi)
        for h in range(1, 13):
            if ff * h > 6000: break
            y += np.sin(2 * np.pi * ff * h * t + ph * h) / h * np.exp(-(ff * h) / 1400)
    return y * env(n, 1.1, 1.4) * (1 + .06 * np.sin(2 * np.pi * .23 * t))
def piano(f, vel, d=2.6):
    n = int(d * SR); t = np.arange(n) / SR; y = np.zeros(n); B = .00035
    for h in range(1, 13):
        fh = f * h * np.sqrt(1 + B * h * h)
        if fh > 9000: break
        a = vel / h ** 1.7 * np.exp(-(h - 1) * .12)
        dec = np.exp(-t * (1.0 + .45 * h)) * .7 + .3 * np.exp(-t * (.35 + .12 * h))
        y += a * np.sin(2 * np.pi * fh * t) * dec
    y *= np.minimum(1, t / .004); y[-int(.2 * SR):] *= np.linspace(1, 0, int(.2 * SR))
    return y
def cello(f, d):
    n = int(d * SR); t = np.arange(n) / SR
    vib = 1 + .003 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 1.2)
    y = sum(np.sin(2 * np.pi * f * h * np.cumsum(vib) / SR) / h ** 1.3 for h in range(1, 7))
    return y * env(n, .9, 1.2)
dry = np.zeros_like(mus); pianob = np.zeros_like(mus)
nb = int(np.ceil((T1 - T0) / BAR)) + 1
for b in range(nb):
    bass, voic, arp = PROG[b % len(PROG)]; tb = b * BAR
    for k, nm in enumerate(voic): add(dry, tb, pad(NOTE[nm], BAR + 1.4) * .16, [-.4, 0, .4][k])
    add(dry, tb, cello(NOTE[bass] * 2, BAR + 1.0) * .22 * min(1, b / 2 + .3), -.1)
    # piano: bar 0 sparse, then gentle eighth-note arpeggio
    steps = [0, 4] if b == 0 else range(8)
    for s in steps:
        nm = arp[s % 4]; vel = (.55 if s % 4 == 0 else .38) * (.8 + .2 * rs.random())
        add(pianob, tb + s * BEAT / 2 + rs.uniform(-.008, .008), piano(NOTE[nm], vel), .25 if s % 2 else -.15)
    if b in (2, 5, 7):  # a small melodic answer on top
        add(pianob, tb + 3 * BEAT, piano(NOTE[arp[2]] * 2 if NOTE[arp[2]] < 600 else NOTE[arp[2]], .32), .3)
mix = dry + pianob * .9
sos = butter(2, 120, 'highpass', fs=SR, output='sos'); mix = sosfiltfilt(sos, mix, axis=0)
# reverb: decaying filtered noise IR, decorrelated L/R
ir_n = int(2.8 * SR); tt = np.arange(ir_n) / SR
irs = []
for c in range(2):
    nz = rs.standard_normal(ir_n) * np.exp(-tt / .75)
    nz = sosfiltfilt(butter(2, 5000, 'lowpass', fs=SR, output='sos'), nz); nz[:int(.012 * SR)] = 0; irs.append(nz / np.abs(nz).max())
wet = np.stack([fftconvolve(mix[:, c], irs[c])[:len(mix)] for c in range(2)], 1)
mix = mix * .72 + wet / (np.abs(wet).max() + 1e-9) * np.abs(mix).max() * .55
L = int((T1 - T0) * SR); mix = mix[:L]
fi, fo = int(1.6 * SR), int(1.8 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None] ** 2; mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
full = np.zeros((n_tot, 2)); i0 = int(T0 * SR); full[i0:i0 + len(mix)] = mix[:max(0, min(len(mix), n_tot - i0))]
full /= np.abs(full).max() + 1e-9; full *= 10 ** (-3 / 20)
sf.write(out, full, SR, subtype='FLOAT'); print('music', round(T0, 2), '->', round(T1, 2), 'bars', nb)
