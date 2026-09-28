"""Generate original geometric tile art and its microCMS registration sheet."""
from __future__ import annotations

import colorsys
import csv
import math
from pathlib import Path

ROOT = Path(__file__).parent
SOURCE = ROOT / "source"
SIZE = 512
VALUES = [2 ** (index + 1) for index in range(12)]
THEMES = [
    ("crystal", "光の結晶", ["芽晶", "淡晶", "水晶", "翠晶", "碧晶", "藍晶", "紫晶", "紅晶", "金晶", "虹晶", "星晶", "光晶"]),
    ("night-sky", "夜空のしるし", ["星屑", "微光", "双星", "四つ星", "星環", "輝星", "星輪", "光冠", "星雲", "銀河", "星座", "宇宙"]),
]


def hsl(hue: float, saturation: float, lightness: float) -> str:
    r, g, b = colorsys.hls_to_rgb(hue % 1, lightness, saturation)
    return f"#{round(r * 255):02X}{round(g * 255):02X}{round(b * 255):02X}"


def polygon(cx: float, cy: float, radius: float, count: int, offset: float = 0) -> str:
    return " ".join(
        f"{cx + math.cos(2 * math.pi * i / count + offset) * radius:.1f},{cy + math.sin(2 * math.pi * i / count + offset) * radius:.1f}"
        for i in range(count)
    )


def crystal(index: int, hue: float) -> str:
    sides = 5 + index // 3
    outer = polygon(256, 254, 173, sides, -math.pi / 2)
    middle = polygon(256, 254, 126, sides, -math.pi / 2)
    inner = polygon(256, 254, 78 + index * 2, sides, -math.pi / 2)
    pale = hsl(hue, .68, .88)
    main = hsl(hue, .68, .60)
    deep = hsl(hue, .62, .38)
    shards = []
    for i in range(sides):
        a = 2 * math.pi * i / sides - math.pi / 2
        b = 2 * math.pi * (i + 1) / sides - math.pi / 2
        x1, y1 = 256 + math.cos(a) * 173, 254 + math.sin(a) * 173
        x2, y2 = 256 + math.cos(b) * 173, 254 + math.sin(b) * 173
        shade = pale if i % 3 == 0 else main if i % 3 == 1 else deep
        shards.append(f'<polygon points="256,254 {x1:.1f},{y1:.1f} {x2:.1f},{y2:.1f}" fill="{shade}" opacity=".82"/>')
    dots = []
    for i in range(min(index + 1, 12)):
        a = 2 * math.pi * i / max(index + 1, 3) - math.pi / 2
        x, y = 256 + math.cos(a) * 224, 254 + math.sin(a) * 224
        dots.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{5 + index // 4}" fill="{pale}" opacity=".9"/>')
    return (
        f'<circle cx="256" cy="254" r="183" fill="{main}" opacity=".14"/>'
        + f'<polygon points="{outer}" fill="{deep}" stroke="{pale}" stroke-width="8" stroke-linejoin="round"/>'
        + ''.join(shards)
        + f'<polygon points="{middle}" fill="none" stroke="{pale}" stroke-width="8" opacity=".85"/>'
        + f'<polygon points="{inner}" fill="{pale}" opacity=".96"/>'
        + f'<polygon points="{polygon(256, 254, 32 + index, sides, -math.pi / 2)}" fill="white" opacity=".86"/>'
        + ''.join(dots)
    )


def star(cx: float, cy: float, outer: float, inner: float, tips: int = 5) -> str:
    points = []
    for i in range(tips * 2):
        radius = outer if i % 2 == 0 else inner
        angle = -math.pi / 2 + math.pi * i / tips
        points.append(f"{cx + math.cos(angle) * radius:.1f},{cy + math.sin(angle) * radius:.1f}")
    return " ".join(points)


def sky(index: int, hue: float) -> str:
    bright = hsl(hue, .90, .78)
    glow = hsl(hue, .78, .63)
    dark = hsl(hue, .68, .34)
    count = 2 + index
    orbit = 148 + index * 2
    parts = [f'<circle cx="256" cy="256" r="184" fill="{glow}" opacity=".13"/>']
    if index >= 4:
        parts.append(f'<circle cx="256" cy="256" r="{orbit}" fill="none" stroke="{bright}" stroke-width="{3 + index // 4}" opacity=".8"/>')
    for i in range(count):
        angle = 2 * math.pi * i / count - math.pi / 2 + index * .18
        x, y = 256 + math.cos(angle) * orbit, 256 + math.sin(angle) * orbit
        size = 10 + (i + index) % 3 * 4
        parts.append(f'<polygon points="{star(x, y, size, size * .34, 4)}" fill="{bright}"/>')
    parts.append(f'<circle cx="256" cy="256" r="{117 + index * 3}" fill="{dark}" stroke="{bright}" stroke-width="7"/>')
    parts.append(f'<circle cx="233" cy="227" r="{92 + index * 2}" fill="{glow}" opacity=".55"/>')
    parts.append(f'<polygon points="{star(256, 250, 101 + index * 2, 42 + index, 5 + index // 4)}" fill="{bright}" stroke="white" stroke-width="5" stroke-linejoin="round"/>')
    parts.append(f'<circle cx="256" cy="250" r="{18 + index // 2}" fill="white"/>')
    return ''.join(parts)


def svg(content: str) -> str:
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{SIZE}" height="{SIZE}" viewBox="0 0 {SIZE} {SIZE}">{content}</svg>\n'


with (ROOT / "registration.csv").open("w", newline="", encoding="utf-8-sig") as file:
    writer = csv.writer(file)
    writer.writerow(["themeId", "themeName", "themeThumbnail", "value", "label", "image", "backgroundColor"])
    for theme_id, theme_name, labels in THEMES:
        folder = SOURCE / theme_id
        folder.mkdir(parents=True, exist_ok=True)
        thumbnail = f"{theme_id}-thumbnail.png"
        for index, (value, label) in enumerate(zip(VALUES, labels)):
            hue = ((.47 + index * .079) if theme_id == "crystal" else (.63 + index * .046)) % 1
            background = hsl(hue, .48, .34 if theme_id == "crystal" else .29)
            picture = crystal(index, hue) if theme_id == "crystal" else sky(index, hue)
            (folder / f"{theme_id}-{value:04d}.svg").write_text(svg(picture), encoding="utf-8")
            writer.writerow([theme_id, theme_name, thumbnail, value, label, f"{theme_id}-{value:04d}.png", background])
        hero_hue = .54 if theme_id == "crystal" else .68
        hero = crystal(10, hero_hue) if theme_id == "crystal" else sky(10, hero_hue)
        (folder / f"{theme_id}-thumbnail.svg").write_text(svg(hero), encoding="utf-8")

print("Generated 26 original SVG sources and registration.csv")
