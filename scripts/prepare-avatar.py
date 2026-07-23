"""
Turn a studio headshot with a plain white background into a transparent PNG.

Usage
-----
    pip install pillow
    python scripts/prepare-avatar.py public/punith-raw.png

Writes public/punith.png, which is what the site loads.

Why flood fill instead of "delete every white pixel"
----------------------------------------------------
A brightness threshold would also erase the white shirt, punching a hole
through the middle of the subject. Instead this walks inward from the image
border and only removes white that is *connected* to the edge. The shirt is
enclosed by the suit, so the fill never reaches it.
"""

from __future__ import annotations

import sys
from collections import deque
from pathlib import Path

try:
    from PIL import Image, ImageFilter
except ImportError:
    sys.exit("Pillow is required.  Run:  pip install pillow")


# How far a pixel may drift from pure white and still count as background.
# Raise if a grey halo survives; lower if edges of hair start disappearing.
TOLERANCE = 32

# Softens the cutout edge so it doesn't look like scissors were involved.
FEATHER_RADIUS = 0.8

# Width (px) of the widest "leak" the guard should seal. If the background can
# reach your shirt through a thin bright gap — say between collar and lapel —
# the fill would hollow out your torso. Eroding the mask by this much snaps
# such channels before deciding what is really background. Raise it if you see
# a hole appear; lower it if thin gaps that SHOULD be transparent survive.
LEAK_GUARD = 5


def is_background(pixel: tuple[int, int, int], tolerance: int) -> bool:
    r, g, b = pixel[:3]
    return r >= 255 - tolerance and g >= 255 - tolerance and b >= 255 - tolerance


def reachable_from_edges(mask: Image.Image) -> Image.Image:
    """
    Keep only the white areas of `mask` connected to the top, left or right
    edge. The bottom is excluded — see the note in remove_background.
    """
    width, height = mask.size
    pixels = mask.load()
    out = Image.new("L", (width, height), 0)
    out_pixels = out.load()

    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def seed(x: int, y: int) -> None:
        if pixels[x, y] > 127 and not visited[y * width + x]:
            visited[y * width + x] = 1
            queue.append((x, y))

    for x in range(width):
        seed(x, 0)
    for y in range(height):
        seed(0, y)
        seed(width - 1, y)

    while queue:
        x, y = queue.popleft()
        out_pixels[x, y] = 255
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height:
                if pixels[nx, ny] > 127 and not visited[ny * width + nx]:
                    visited[ny * width + nx] = 1
                    queue.append((nx, ny))

    return out


def remove_background(image: Image.Image, tolerance: int = TOLERANCE) -> Image.Image:
    image = image.convert("RGBA")
    width, height = image.size
    pixels = image.load()

    # Breadth-first flood fill seeded from every border pixel.
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def seed(x: int, y: int) -> None:
        if is_background(pixels[x, y], tolerance):
            index = y * width + x
            if not visited[index]:
                visited[index] = 1
                queue.append((x, y))

    # Seed from the top, left and right edges only.
    #
    # The bottom edge is deliberately excluded: in a headshot the subject is
    # always cropped there, so a white shirt runs right off the bottom of the
    # frame. Seeding it lets the fill climb up inside the shirt and delete the
    # torso. Background in the bottom corners is still removed, because the
    # fill reaches it by flowing down from the left and right edges.
    for x in range(width):
        seed(x, 0)
    for y in range(height):
        seed(0, y)
        seed(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height:
                index = ny * width + nx
                if not visited[index] and is_background(pixels[nx, ny], tolerance):
                    visited[index] = 1
                    queue.append((nx, ny))

    # Candidate background as a mask (white = background).
    candidate = Image.new("L", (width, height), 0)
    candidate_pixels = candidate.load()
    for y in range(height):
        row = y * width
        for x in range(width):
            if visited[row + x]:
                candidate_pixels[x, y] = 255

    # --- leak guard -------------------------------------------------------
    # Erode, keep only what still reaches an edge, then dilate back. A thin
    # channel into the shirt breaks during erosion, so the region beyond it is
    # no longer edge-connected and gets restored as subject.
    if LEAK_GUARD > 1:
        size = LEAK_GUARD if LEAK_GUARD % 2 else LEAK_GUARD + 1
        eroded = candidate.filter(ImageFilter.MinFilter(size))
        sealed = reachable_from_edges(eroded).filter(ImageFilter.MaxFilter(size))

        # Dilation can spill past the original boundary — clamp it back.
        sealed_pixels = sealed.load()
        for y in range(height):
            for x in range(width):
                if candidate_pixels[x, y] == 0:
                    sealed_pixels[x, y] = 0

        recovered = sum(
            1
            for y in range(height)
            for x in range(width)
            if candidate_pixels[x, y] and not sealed_pixels[x, y]
        )
        if recovered:
            print(f"  leak guard restored {recovered:,} px the fill had leaked into")
        candidate = sealed

    # Build the alpha channel, then feather it.
    candidate_pixels = candidate.load()
    alpha = Image.new("L", (width, height), 255)
    alpha_pixels = alpha.load()
    removed = 0
    for y in range(height):
        for x in range(width):
            if candidate_pixels[x, y]:
                alpha_pixels[x, y] = 0
                removed += 1

    alpha = alpha.filter(ImageFilter.GaussianBlur(FEATHER_RADIUS))
    image.putalpha(alpha)

    pct = removed / (width * height) * 100
    print(f"  removed {removed:,} background pixels ({pct:.1f}% of the image)")
    if pct < 5:
        print("  ⚠ that seems low — is the background actually white? try raising TOLERANCE")

    return image


def trim_and_square(image: Image.Image, padding: float = 0.06) -> Image.Image:
    """Crop to the subject, then pad out to a square so the circle crop is centred."""
    bbox = image.getbbox()
    if bbox:
        image = image.crop(bbox)

    width, height = image.size
    side = int(max(width, height) * (1 + padding))

    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(image, ((side - width) // 2, (side - height) // 2))
    return square


def main() -> None:
    source = Path(sys.argv[1] if len(sys.argv) > 1 else "public/punith-raw.png")
    destination = Path(sys.argv[2] if len(sys.argv) > 2 else "public/punith.png")

    if not source.exists():
        sys.exit(f"Couldn't find {source}. Save your photo there first.")

    print(f"Reading {source}…")
    image = Image.open(source)
    print(f"  {image.size[0]}×{image.size[1]} {image.mode}")

    image = remove_background(image)
    image = trim_and_square(image)

    # 640px is plenty — the largest the site renders it is 160px, doubled for
    # high-DPI screens.
    if image.size[0] > 640:
        image = image.resize((640, 640), Image.LANCZOS)

    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "PNG", optimize=True)
    print(f"✓ Wrote {destination} ({destination.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
