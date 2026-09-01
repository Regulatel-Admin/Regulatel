"""
Carousel banners: full poster on the right (never cover-cropped),
soft atmosphere behind the card, feathered join so there is no knife cut.
"""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(
    r"C:\Users\diego\.cursor\projects\c-Users-diego-OneDrive-Desktop-Por-Revisar-webage-regulatel\assets"
)
OUT_DIR = ROOT / "public" / "images"


def _smoothstep(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return t * t * (3.0 - 2.0 * t)


def _h_mask(width: int, height: int, fade: int) -> Image.Image:
    """Alpha 0 at the left edge, 255 after `fade` pixels (smoothstep)."""
    fade = max(1, min(fade, width - 1))
    row = Image.new("L", (width, 1), 255)
    for x in range(fade):
        row.putpixel((x, 0), int(255 * _smoothstep(x / fade)))
    return row.resize((width, height), Image.Resampling.BILINEAR)


def assemble(
    src: Image.Image,
    canvas_w: int,
    canvas_h: int,
    inset_right: int = 0,
    fade_ratio: float = 0.32,
    zoom: float = 1.0,
    keep_bottom: bool = False,
) -> Image.Image:
    navy = src.getpixel((src.size[0] - 24, 24))
    scale = (canvas_h / src.height) * zoom
    art = src.resize((max(1, round(src.width * scale)), max(1, round(src.height * scale))), Image.Resampling.LANCZOS)
    if art.size[1] > canvas_h:
        extra = art.size[1] - canvas_h
        top = extra if keep_bottom else extra // 2
        art = art.crop((0, top, art.size[0], top + canvas_h))
    if canvas_h >= 1000:
        art = art.filter(ImageFilter.UnsharpMask(radius=1.3, percent=70, threshold=2))
    art_x = max(0, canvas_w - art.size[0] - inset_right)
    fade = max(64, int(art.size[0] * fade_ratio))

    # Atmosphere continues UNDER the fade so nothing is pasted as a hard rectangle.
    strip_w = max(8, min(art.size[0] // 3, art.size[0] - 1))
    strip = art.crop((0, 0, strip_w, canvas_h))
    left_w = min(canvas_w, art_x + fade)
    left = strip.resize((max(1, left_w), canvas_h), Image.Resampling.LANCZOS).filter(
        ImageFilter.GaussianBlur(max(14, canvas_h // 36))
    )
    left = Image.blend(left, Image.new("RGB", left.size, navy), 0.14)
    left = ImageEnhance.Brightness(left).enhance(0.92)

    canvas = Image.new("RGB", (canvas_w, canvas_h), navy)
    canvas.paste(left, (0, 0))

    art_rgba = art.convert("RGBA")
    art_rgba.putalpha(_h_mask(art.size[0], canvas_h, fade))
    out = canvas.convert("RGBA")
    out.alpha_composite(art_rgba, (art_x, 0))
    return out.convert("RGB")


def save_jpeg(img: Image.Image, path: Path, quality: int = 92) -> None:
    img.save(
        path,
        "JPEG",
        quality=quality,
        optimize=True,
        progressive=True,
        subsampling=0 if quality >= 95 else 2,
    )
    print(f"saved {path.name:55} {img.size[0]}x{img.size[1]}  {path.stat().st_size/1024:7.0f} KB")


def main() -> None:
    os.chdir(ROOT)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    jobs = [
        (ASSETS / "cumbre-punta-cana-carousel.png", OUT_DIR / "cumbre-regulatel-asiet-comtelca-2025-carousel.jpg", 3840, 1120, 0, 0.22, 96, 1.12, True),
        (ASSETS / "cumbre-prai-carousel.png", OUT_DIR / "cumbre-regulatel-prai-2025-carousel.jpg", 3840, 1120, 400, 0.24, 96, 1.0, False),
        (ASSETS / "cumbre-regulatel-ASIET-carousel.png", OUT_DIR / "cumbre-regulatel-ASIET.jpg", 1920, 560, 0, 0.42, 92, 1.0, False),
    ]
    for src_path, out_path, cw, ch, inset, fade_ratio, quality, zoom, keep_bottom in jobs:
        src = Image.open(src_path).convert("RGB")
        save_jpeg(
            assemble(src, cw, ch, inset_right=inset, fade_ratio=fade_ratio, zoom=zoom, keep_bottom=keep_bottom),
            out_path,
            quality=quality,
        )


if __name__ == "__main__":
    main()
