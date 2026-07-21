from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math

ROOT = Path(__file__).resolve().parent
FRAMES = ROOT / ".animatic-frames"
FRAMES.mkdir(exist_ok=True)

W, H, FPS, DURATION = 1280, 720, 12, 84
NAVY, BLACK, WHITE = "#0B1220", "#070A0F", "#F7F9FC"
BLUE, MINT, MUTED, STONE = "#6D8CFF", "#7DE2C6", "#8B95A5", "#E8DFD3"

FONT_REG = "/System/Library/Fonts/SFNS.ttf"
FONT_BOLD = "/System/Library/Fonts/SFNS.ttf"

def font(size, bold=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size)

def ease(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)

def centered(draw, text, y, size, color=WHITE, bold=False, tracking=0):
    f = font(size, bold)
    if not tracking:
        box = draw.textbbox((0, 0), text, font=f)
        draw.text(((W - (box[2] - box[0])) / 2, y), text, font=f, fill=color)
        return
    widths = [draw.textlength(c, font=f) for c in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = (W - total) / 2
    for c, cw in zip(text, widths):
        draw.text((x, y), c, font=f, fill=color)
        x += cw + tracking

def wrap(draw, text, max_width, f):
    words, lines, line = text.split(), [], ""
    for word in words:
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=f) <= max_width:
            line = trial
        else:
            lines.append(line); line = word
    if line: lines.append(line)
    return lines

def paragraph(draw, text, y, size, color=WHITE, width=900, leading=1.18, bold=False):
    f = font(size, bold)
    lines = wrap(draw, text, width, f)
    for i, line in enumerate(lines):
        centered(draw, line, y + i * size * leading, size, color, bold)

def mark(draw, cx, cy, scale=1.0, alpha=255):
    c_blue = (*ImageColor(BLUE), alpha)
    c_mint = (*ImageColor(MINT), alpha)
    draw.arc((cx-48*scale, cy-48*scale, cx+48*scale, cy+48*scale), 35, 325,
             fill=c_blue, width=max(2, int(7*scale)))
    draw.line((cx-10*scale, cy+13*scale, cx+28*scale, cy-25*scale), fill=c_blue,
              width=max(2, int(7*scale)))
    draw.polygon([(cx+28*scale, cy-25*scale), (cx+9*scale, cy-22*scale),
                  (cx+25*scale, cy-6*scale)], fill=c_blue)
    draw.ellipse((cx-32*scale, cy+23*scale, cx-20*scale, cy+35*scale), fill=c_mint)

def ImageColor(hex_value):
    hex_value = hex_value.lstrip("#")
    return tuple(int(hex_value[i:i+2], 16) for i in (0, 2, 4))

def base(t):
    image = Image.new("RGB", (W, H), BLACK)
    d = ImageDraw.Draw(image)
    # Restrained spatial grid: nearly invisible, more present after the pivot.
    opacity = int(12 + 12 * ease((t - 36) / 12))
    grid = (opacity, opacity + 5, opacity + 12)
    for x in range(0, W, 80): d.line((x, 0, x, H), fill=grid, width=1)
    for y in range(0, H, 80): d.line((0, y, W, y), fill=grid, width=1)
    return image, d

def fragment(draw, x, y, w, h, title, detail, progress):
    x += (1-progress) * 90
    fill = "#101725"
    draw.rounded_rectangle((x, y, x+w, y+h), radius=18, fill=fill, outline="#273248", width=2)
    draw.ellipse((x+22, y+22, x+34, y+34), fill=MINT)
    draw.text((x+48, y+16), title, font=font(22, True), fill=WHITE)
    draw.text((x+22, y+54), detail, font=font(16), fill=MUTED)

def scene(t):
    img, d = base(t)
    # 01 — interruption
    if t < 3:
        typed = "Looking for your next executive role?"
        n = min(len(typed), int(t * 17))
        centered(d, typed[:n], 312, 39, WHITE, False)
        cursor_x = W/2 + min(350, d.textlength(typed[:n], font=font(39))/2) + 6
        if int(t*4) % 2 == 0: d.rectangle((cursor_x, 310, cursor_x+3, 354), fill=MINT)
        if t > 2.25:
            p = ease((t-2.25)/0.6)
            d.line((330, 340, 950, 340), fill=BLUE, width=max(1, int(4*p)))
    elif t < 9:
        centered(d, "THAT’S NOT THE REAL PROBLEM.", 302, 43, WHITE, True, 1)
        d.line((475, 374, 805, 374), fill=BLUE, width=3)
    elif t < 15:
        p = ease((t-9)/1.8)
        fragment(d, 110, 150, 330, 135, "JOB BOARDS", "Saved roles · alerts · tabs", p)
        fragment(d, 475, 292, 330, 135, "RECRUITERS", "Messages · calls · follow-ups", p)
        fragment(d, 840, 155, 330, 135, "COMPANY CAREERS", "More tabs · different records", p)
        centered(d, "THE ROLES ARE EVERYWHERE.", 548, 30, WHITE, True, 2)
    elif t < 26:
        labels = ["RECRUITER EMAIL", "CV_V12_FINAL.PDF", "COMPENSATION NOTES", "INTERVIEW NOTES", "SAVED LINK", "FOLLOW-UP", "APPLICATION STATUS", "CALENDAR"]
        for i, label in enumerate(labels):
            phase = max(0, min(1, (t-15-i*.45)/1.2))
            x = 110 + (i%4)*275
            y = 150 + (i//4)*155
            fragment(d, x, y, 245, 112, label, "A separate fragment", ease(phase))
        centered(d, "MORE ACCESS CREATED MORE FRAGMENTS.", 535, 32, STONE, True, 1)
    elif t < 36:
        centered(d, "NOT A SHORTAGE OF JOBS.", 247, 38, MUTED, True, 1)
        p = ease((t-30)/2)
        if p > 0:
            centered(d, "A SHORTAGE OF INTELLIGENCE.", 335, 48, WHITE, True, 1)
            d.line((345, 410, 935, 410), fill=BLUE, width=max(1, int(4*p)))
    elif t < 45:
        paragraph(d, "What if every opportunity arrived with context?", 292, 45, WHITE, 940, bold=True)
        centered(d, "EVIDENCE  ·  FIT  ·  UNKNOWNS  ·  NEXT ACTION", 430, 21, MINT, True, 3)
    elif t < 52:
        p = ease((t-45)/2)
        mark(d, 640, 180, .65 + .15*p)
        for i, label in enumerate(["COMPANY INTELLIGENCE", "OPPORTUNITY INTELLIGENCE", "CAREER BLUEPRINT"]):
            x = 185 + i*340
            d.rounded_rectangle((x, 325, x+270, 420), radius=18, fill="#111A2A", outline=BLUE, width=2)
            centered_local = x + 135
            tw = d.textlength(label, font=font(17, True))
            d.text((centered_local-tw/2, 361), label, font=font(17, True), fill=WHITE)
        centered(d, "ONE COHERENT DECISION SYSTEM", 500, 27, BLUE, True, 2)
    elif t < 59:
        centered(d, "WHY IT FITS.", 175, 34, WHITE, True, 2)
        centered(d, "WHY IT MAY NOT.", 258, 34, WHITE, True, 2)
        centered(d, "WHAT IS CONFIRMED.", 341, 34, MINT, True, 2)
        centered(d, "WHAT IS UNKNOWN.", 424, 34, MUTED, True, 2)
        centered(d, "WHAT DESERVES YOUR ATTENTION NEXT.", 507, 34, BLUE, True, 1)
    elif t < 67:
        d.rounded_rectangle((190, 135, 1090, 555), radius=28, fill="#0F1726", outline="#293653", width=2)
        d.text((240, 185), "ATLAS DECISION ADVISOR", font=font(21, True), fill=BLUE)
        d.text((240, 245), "Strong opportunity", font=font(41, True), fill=WHITE)
        d.text((240, 315), "Evidence supports the fit. Two unknowns remain.", font=font(26), fill=STONE)
        d.text((240, 385), "FOR", font=font(16, True), fill=MINT)
        d.text((240, 420), "Commercial scope · market alignment · leadership evidence", font=font(21), fill=WHITE)
        d.text((240, 475), "NEXT", font=font(16, True), fill=BLUE)
        d.text((320, 471), "Confirm reporting line and geographic eligibility", font=font(21), fill=WHITE)
    elif t < 73:
        centered(d, "MOST PLATFORMS HELP PEOPLE", 218, 27, MUTED, True, 2)
        centered(d, "APPLY", 280, 58, WHITE, True, 5)
        centered(d, "ORENDALIS HELPS EXECUTIVES", 394, 27, MUTED, True, 2)
        centered(d, "DECIDE", 456, 58, BLUE, True, 5)
    elif t < 81:
        centered(d, "THE EXECUTIVE HIRING PROCESS", 250, 31, MUTED, True, 2)
        centered(d, "IS BROKEN.", 320, 64, WHITE, True, 3)
        if t > 77:
            centered(d, "IT’S TIME TO EXPECT BETTER.", 441, 28, MINT, True, 2)
    else:
        mark(d, 640, 238, .85)
        centered(d, "EXECUTIVE INTELLIGENCE", 353, 24, BLUE, True, 4)
        centered(d, "ORENDALIS", 405, 50, WHITE, True, 8)
        centered(d, "orendalis.com", 492, 23, MUTED, False, 2)

    # Frame-safe production watermark, deliberately absent from the final end card.
    if t < 81:
        d.text((45, 668), "EPISODE 1 · APPROVAL ANIMATIC", font=font(13, True), fill="#526078")
        d.text((1060, 668), f"{int(t):02d}:00", font=font(13), fill="#526078")
    return img

for frame in range(DURATION * FPS):
    t = frame / FPS
    scene(t).save(FRAMES / f"frame-{frame:05d}.png", optimize=True)

print(FRAMES)
