"""Render the Violencia Digital webinar cover at 3840x2160 (4K UHD)."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_PNG = ROOT / "public/images/violencia-digital/webinar-poster-4k.png"
OUT_JPG = ROOT / "public/images/violencia-digital/webinar-poster-4k.jpg"
FONTS = ROOT / "scripts/fonts"
LOGO = ROOT / "public/images/regulatel-logo.png"
MAP_SRC = ROOT / "public/images/homepage/mapa-mundi-home.png"

W, H = 3840, 2160
NAVY = (0, 58, 122)
NAVY_DEEP = (0, 42, 92)
NAVY_FOOTER = (0, 48, 104)
WHITE = (255, 255, 255)
HEADER = (245, 245, 245)
LIME = (197, 220, 11)
GOLD = (245, 212, 58)
BLUE = (68, 137, 198)
TEAL = (120, 190, 230)
TEXT_NAVY = (22, 61, 89)


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), size)


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_w: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    line = ""
    for word in words:
        trial = word if not line else f"{line} {word}"
        if draw.textlength(trial, font=fnt) <= max_w:
            line = trial
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def rounded_rect(draw: ImageDraw.ImageDraw, box, radius: int, fill, outline=None, width: int = 0):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_header_wave(base: Image.Image) -> None:
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    pts = [(0, 0), (W, 0)]
    for x in range(W, -1, -6):
        t = x / W
        y = int(430 + 70 * math.sin(t * math.pi * 0.92) + 180 * (t**1.35) - 40)
        pts.append((x, y))
    pts.append((0, 430))
    draw.polygon(pts, fill=HEADER + (255,))
    base.alpha_composite(overlay)


def dotted_americas() -> Image.Image:
    src = Image.open(MAP_SRC).convert("L")
    # Crop western hemisphere (Americas) from the world map.
    crop = src.crop((0, int(src.height * 0.08), int(src.width * 0.42), int(src.height * 0.92)))
    crop = crop.resize((1680, 1680), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", crop.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(out)
    gap, r = 22, 6
    for y in range(r, crop.height, gap):
        for x in range(r, crop.width, gap):
            if crop.getpixel((x, y)) < 200:
                d.ellipse((x - r, y - r, x + r, y + r), fill=TEAL + (78,))
    return out


def draw_circuit(draw: ImageDraw.ImageDraw) -> None:
    color = (170, 210, 240, 90)
    ox, oy = 2680, 40
    nodes = [
        (0, 80), (180, 40), (340, 90), (520, 30), (720, 70),
        (120, 160), (300, 200), (480, 150), (660, 210), (860, 160),
        (220, 280), (430, 260), (640, 300), (820, 250),
    ]
    for a, b in zip(nodes, nodes[1:]):
        draw.line((ox + a[0], oy + a[1], ox + b[0], oy + b[1]), fill=color, width=3)
    for x, y in nodes:
        draw.ellipse((ox + x - 6, oy + y - 6, ox + x + 6, oy + y + 6), fill=BLUE + (110,))


def draw_shield(draw: ImageDraw.ImageDraw) -> None:
    cx, cy, s = 3280, 210, 86
    shield = [
        (cx, cy - s),
        (cx + int(s * 0.86), cy - int(s * 0.42)),
        (cx + int(s * 0.78), cy + int(s * 0.28)),
        (cx, cy + s),
        (cx - int(s * 0.78), cy + int(s * 0.28)),
        (cx - int(s * 0.86), cy - int(s * 0.42)),
    ]
    draw.line(shield + [shield[0]], fill=BLUE + (160,), width=7, joint="curve")
    # Padlock
    draw.rounded_rectangle((cx - 22, cy - 4, cx + 22, cy + 32), 7, outline=BLUE + (190,), width=6)
    draw.arc((cx - 16, cy - 28, cx + 16, cy + 4), 200, 340, fill=BLUE + (190,), width=6)


def draw_people(draw: ImageDraw.ImageDraw, x: int, y: int, color, scale: float = 1.0) -> None:
    s = scale
    heads = [(-38 * s, 0), (0, -8 * s), (38 * s, 0)]
    for hx, hy in heads:
        r = 12 * s
        draw.ellipse((x + hx - r, y + hy - r, x + hx + r, y + hy + r), outline=color, width=max(3, int(4 * s)))
        draw.arc(
            (x + hx - 18 * s, y + hy + 8 * s, x + hx + 18 * s, y + hy + 38 * s),
            200,
            340,
            fill=color,
            width=max(3, int(4 * s)),
        )


def draw_calendar(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    rounded_rect(draw, (x, y + 10, x + 78, y + 78), 12, fill=None, outline=BLUE, width=6)
    draw.line((x + 10, y + 32, x + 68, y + 32), fill=BLUE, width=5)
    draw.rectangle((x + 18, y, x + 26, y + 18), fill=BLUE)
    draw.rectangle((x + 52, y, x + 60, y + 18), fill=BLUE)
    draw.polygon([(x + 48, y + 44), (x + 62, y + 58), (x + 44, y + 64)], fill=LIME)


def draw_clock(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    draw.ellipse((x, y + 4, x + 78, y + 82), outline=BLUE, width=6)
    draw.line((x + 39, y + 18, x + 39, y + 44), fill=BLUE, width=6)
    draw.line((x + 39, y + 44, x + 58, y + 56), fill=BLUE, width=6)


def draw_globe_people(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    draw.ellipse((x, y, x + 92, y + 92), outline=GOLD, width=5)
    draw.arc((x + 22, y, x + 70, y + 92), 270, 90, fill=GOLD, width=4)
    draw.line((x + 8, y + 46, x + 84, y + 46), fill=GOLD, width=4)
    draw_people(draw, x + 46, y + 38, GOLD, 0.72)


def render() -> Image.Image:
    img = Image.new("RGBA", (W, H), NAVY + (255,))
    # Vertical-ish gradient
    grad = Image.new("RGBA", (W, H))
    gd = ImageDraw.Draw(grad)
    for y in range(H):
        t = y / H
        r = int(0 + 8 * t)
        g = int(64 - 22 * t)
        b = int(135 - 28 * t)
        gd.line((0, y, W, y), fill=(r, g, b, 255))
    img = Image.alpha_composite(img, grad)

    americas = dotted_americas()
    img.alpha_composite(americas, (2280, 280))

    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((2700, 420, 3900, 1700), fill=(40, 120, 180, 40))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(80)))

    draw_header_wave(img)
    layer = ImageDraw.Draw(img)
    draw_circuit(layer)
    draw_shield(layer)

    logo = Image.open(LOGO).convert("RGBA")
    logo = logo.crop(logo.getbbox())
    logo_h = 236
    logo_w = int(logo.width * (logo_h / logo.height))
    logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    img.alpha_composite(logo, (160, 78))

    f_title = font("Montserrat-ExtraBold.ttf", 92)
    f_sub = font("Montserrat-SemiBold.ttf", 42)
    f_card_label = font("Montserrat-Bold.ttf", 36)
    f_card_body = font("Montserrat-SemiBold.ttf", 34)
    f_group = font("Montserrat-SemiBold.ttf", 30)
    f_foot_label = font("Montserrat-Bold.ttf", 32)
    f_foot_body = font("Montserrat-SemiBold.ttf", 32)

    title = "Webinar regional sobre violencia digital y el rol de los entes reguladores"
    lines = wrap(layer, title, f_title, 2100)
    y = 560
    for line in lines:
        layer.text((168, y), line, font=f_title, fill=WHITE)
        y += 118

    y += 18
    draw_people(layer, 210, y + 28, GOLD, 1.05)
    layer.line((268, y + 8, 268, y + 62), fill=GOLD, width=4)
    layer.text(
        (292, y + 14),
        "Perspectiva de paridad, derechos humanos e interseccionalidad",
        font=f_sub,
        fill=GOLD,
    )

    card = (150, 1488, 2288, 1728)
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        (card[0] + 10, card[1] + 16, card[2] + 10, card[3] + 16), 36, fill=(0, 20, 40, 70)
    )
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(18)))
    layer = ImageDraw.Draw(img)
    rounded_rect(layer, card, 36, fill=WHITE)
    layer.line((1218, 1524, 1218, 1692), fill=(220, 226, 232), width=3)

    draw_calendar(layer, 196, 1548)
    layer.text((300, 1556), "Fecha:", font=f_card_label, fill=TEXT_NAVY)
    layer.text((300, 1608), "jueves 20 de agosto de 2026", font=f_card_body, fill=TEXT_NAVY)

    draw_clock(layer, 1288, 1546)
    layer.text((1392, 1556), "Hora:", font=f_card_label, fill=TEXT_NAVY)
    layer.text((1392, 1608), "10:00 a.m. – 11:30 a.m.", font=f_card_body, fill=TEXT_NAVY)
    layer.text((1392, 1654), "(hora de República Dominicana)", font=font("Montserrat-SemiBold.ttf", 26), fill=TEXT_NAVY)

    draw_globe_people(layer, 2380, 1528)
    group = wrap(
        layer,
        "Actividad del Grupo de Trabajo de Paridad en la Sociedad de la Información",
        f_group,
        1180,
    )
    gy = 1544
    for line in group:
        layer.text((2500, gy), line, font=f_group, fill=WHITE)
        gy += 42

    layer.rectangle((0, 1968, W, H), fill=NAVY_FOOTER)
    fx, fy = 160, 2034
    layer.text((fx, fy), "Coordinadores del grupo:", font=f_foot_label, fill=GOLD)
    fx += int(layer.textlength("Coordinadores del grupo: ", font=f_foot_label))
    layer.text((fx, fy), "CONATEL, Paraguay", font=f_foot_body, fill=WHITE)
    fx += int(layer.textlength("CONATEL, Paraguay", font=f_foot_body)) + 28
    layer.text((fx, fy), "|", font=f_foot_body, fill=GOLD)
    fx += 36
    layer.text((fx, fy), "Miembros:", font=f_foot_label, fill=GOLD)
    fx += int(layer.textlength("Miembros: ", font=f_foot_label))
    layer.text((fx, fy), "ATT, Bolivia  •  INDOTEL, República Dominicana", font=f_foot_body, fill=WHITE)

    return img.convert("RGB")


def main() -> None:
    poster = render()
    OUT_PNG.parent.mkdir(parents=True, exist_ok=True)
    poster.save(OUT_PNG, "PNG", optimize=True)
    poster.save(OUT_JPG, "JPEG", quality=94, optimize=True, subsampling=1)
    print(f"PNG {OUT_PNG} {OUT_PNG.stat().st_size} {poster.size}")
    print(f"JPG {OUT_JPG} {OUT_JPG.stat().st_size}")


if __name__ == "__main__":
    main()
