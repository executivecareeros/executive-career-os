from pathlib import Path
import wave
import numpy as np

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "ORENDALIS_EPISODE_1_ORIGINAL_SCORE.wav"
SR, DURATION = 48_000, 84.0
N = int(SR * DURATION)
t = np.arange(N, dtype=np.float64) / SR
left = np.zeros(N, dtype=np.float64)
right = np.zeros(N, dtype=np.float64)

def fade_window(start, end, attack=1.0, release=1.0):
    w = np.zeros(N)
    active = (t >= start) & (t <= end)
    w[active] = 1.0
    if attack:
        idx = (t >= start) & (t < start + attack)
        w[idx] = 0.5 - 0.5 * np.cos(np.pi * (t[idx] - start) / attack)
    if release:
        idx = (t > end - release) & (t <= end)
        w[idx] = 0.5 - 0.5 * np.cos(np.pi * (end - t[idx]) / release)
    return w

def add_tone(freq, start, end, amp, pan=0.0, attack=1.0, release=1.0, drift=0.0):
    global left, right
    w = fade_window(start, end, attack, release)
    phase = 2 * np.pi * (freq * t + drift * np.sin(2*np.pi*0.07*t))
    sig = amp * np.sin(phase) * w
    left += sig * np.sqrt((1-pan)/2)
    right += sig * np.sqrt((1+pan)/2)

def add_pulse(at, freq=58, amp=0.16, length=0.34, pan=0.0):
    global left, right
    idx = (t >= at) & (t < at + length)
    local = t[idx] - at
    env = np.exp(-local * 11)
    sig = amp * (np.sin(2*np.pi*freq*local) + .28*np.sin(2*np.pi*freq*2*local)) * env
    left[idx] += sig * np.sqrt((1-pan)/2)
    right[idx] += sig * np.sqrt((1+pan)/2)

def add_click(at, pan=0.0, amp=.07):
    global left, right
    length = .022
    idx = (t >= at) & (t < at + length)
    local = t[idx] - at
    rng = np.random.default_rng(int(at*1000)+17)
    sig = amp * rng.normal(0, 1, idx.sum()) * np.exp(-local*170)
    left[idx] += sig * np.sqrt((1-pan)/2)
    right[idx] += sig * np.sqrt((1+pan)/2)

# Thinking space: barely audible mechanical room tone and cursor activity.
add_tone(38, 0, 36, .025, -.2, 2, 3, .08)
add_tone(76, 0, 36, .012, .25, 2, 3, .03)
for at in np.arange(.35, 2.5, .16): add_click(float(at), pan=-.35 + .7*((at*10)%1), amp=.028)
add_pulse(2.62, 44, .22, .7)

# Fragmentation: restrained pulse accelerates without becoming a trailer rhythm.
at = 9.0
while at < 35.5:
    progress = (at-9)/26.5
    interval = .92 - .38*progress
    add_pulse(at, 52 + 8*progress, .09 + .045*progress, .28, pan=np.sin(at)*.25)
    at += interval
for at in [9.2, 10.1, 11.0, 15.3, 16.2, 17.1, 18.0, 19.0, 20.0, 21.0, 22.0]:
    add_click(at, pan=np.sin(at)*.5, amp=.042)

# Pivot: low noise falls away; a single harmonic bridge opens the space.
add_tone(110.0, 34.0, 47.0, .035, 0, 3.5, 2.5, .05)
add_tone(164.81, 38.0, 48.0, .026, -.25, 3, 2, .04)

# Intelligence: warm, consonant, slow-moving editorial bed.
for freq, pan, amp in [(146.83,-.28,.055),(220.0,.24,.042),(293.66,-.08,.026),(369.99,.32,.018)]:
    add_tone(freq, 44.0, 72.5, amp, pan, 3.2, 4.0, .08)
for at in np.arange(46, 67, 3.0): add_pulse(float(at), 73, .055, .42, pan=.15)

# Apply / decide: two deliberate sonic states, with the second resolving upward.
add_tone(196.0, 66.5, 73.5, .036, -.2, .8, 1.5)
add_tone(246.94, 69.4, 76.5, .045, .22, .8, 2.0)
add_pulse(67.1, 58, .13, .45, -.25)
add_pulse(71.0, 73, .15, .55, .25)

# Final argument and end card: restraint, then a small mint-like harmonic signature.
add_tone(110, 72.5, 82.0, .035, 0, 1.5, 4.5)
add_tone(220, 77.0, 83.4, .03, -.2, 1.8, 2.4)
add_tone(277.18, 80.7, 83.7, .028, .2, .35, 2.4)
add_tone(329.63, 81.2, 83.8, .022, .35, .35, 2.4)
add_pulse(81.05, 73, .11, .65)

# Gentle saturation and safe master headroom.
stereo = np.stack([left, right], axis=1)
stereo = np.tanh(stereo * 1.35)
peak = np.max(np.abs(stereo)) or 1.0
stereo *= .72 / peak
pcm = (stereo * 32767).astype(np.int16)

with wave.open(str(OUT), "wb") as wav:
    wav.setnchannels(2)
    wav.setsampwidth(2)
    wav.setframerate(SR)
    wav.writeframes(pcm.tobytes())

print(OUT)
