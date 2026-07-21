from pathlib import Path
import os
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent
TAKES = ROOT / ".cinematic-voice-takes"
TAKES.mkdir(exist_ok=True)
OUT = ROOT / "ORENDALIS_EPISODE_1_CINEMATIC_NARRATION_V2.wav"

# Every line is directed independently. Starts follow picture, not sentence density.
# The final public cut may replace the selected system voice with a commissioned actor
# without changing the approved timing or editorial intent.
SEGMENTS = [
    (0.20, 188, "Looking for your next executive role?"),
    (2.55, 184, "That’s not the real problem."),
    (7.35, 190, "The roles are everywhere."),
    (9.20, 205, "LinkedIn. Job boards. Recruiters. Company sites."),
    (13.85, 198, "But the truth about a career decision lives somewhere else."),
    (17.50, 215, "In a CV version. A saved link. An interview note. A salary file. A conversation you meant to revisit."),
    (25.10, 198, "More access created more fragments. Not more clarity."),
    (29.30, 190, "Because the problem isn’t a shortage of jobs."),
    (32.60, 178, "It’s a shortage of intelligence."),
    (35.15, 192, "What if every opportunity arrived with context?"),
    (38.80, 205, "Why it fits. Why it may not. What is confirmed. What is unknown. What deserves your attention next."),
    (46.05, 184, "That is Executive Intelligence."),
    (48.70, 195, "Most platforms help people apply."),
    (51.40, 180, "Orendalis helps executives decide."),
    (54.55, 180, "The executive hiring process is broken."),
    (57.80, 174, "It’s time to expect better."),
]

ffmpeg = os.environ.get("FFMPEG") or shutil.which("ffmpeg")
if not ffmpeg:
    candidate = Path("/private/tmp/orendalis-video-deps/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1")
    if candidate.exists():
        ffmpeg = str(candidate)
if not ffmpeg:
    raise SystemExit("Set FFMPEG to an ffmpeg executable.")

inputs = []
filters = []
for index, (start, rate, line) in enumerate(SEGMENTS):
    take = TAKES / f"take-{index:02d}.aiff"
    subprocess.run(["say", "-v", "Eddy (İngilizce (ABD))", "-r", str(rate), line, "-o", str(take)], check=True)
    inputs.extend(["-i", str(take)])
    delay = int(start * 1000)
    filters.append(
        f"[{index}:a]aresample=48000,aformat=channel_layouts=mono,"
        f"highpass=f=70,lowpass=f=12000,adelay={delay},volume=0.88[v{index}]"
    )

labels = "".join(f"[v{i}]" for i in range(len(SEGMENTS)))
filter_graph = ";".join(filters) + ";" + labels + (
    f"amix=inputs={len(SEGMENTS)}:duration=longest:normalize=0,"
    "acompressor=threshold=-20dB:ratio=2.2:attack=20:release=220:makeup=2dB,"
    "equalizer=f=180:t=q:w=1.1:g=1.3,equalizer=f=4200:t=q:w=1.2:g=1.0,"
    "loudnorm=I=-18:TP=-2:LRA=6,apad=pad_dur=64,atrim=0:64,aresample=48000[narration]"
)

command = [ffmpeg, "-y", *inputs, "-filter_complex", filter_graph,
           "-map", "[narration]", "-c:a", "pcm_s24le", "-ar", "48000", "-ac", "1", str(OUT)]
subprocess.run(command, check=True)
print(OUT)
