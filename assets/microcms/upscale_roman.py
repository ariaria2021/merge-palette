"""Make black transparent, then upscale white roman glyphs to 512px PNGs.

Uses only the Python standard library. Source PNGs must be 8-bit RGBA, as
verified when they were downloaded from microCMS.
"""
from __future__ import annotations

import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).parent
SOURCE = ROOT / 'source' / 'roman-original'
OUTPUT = ROOT / 'upload' / 'roman'
CANVAS = 512
ART_LIMIT = 400
PNG_SIGNATURE = b'\x89PNG\r\n\x1a\n'


def chunks(data: bytes):
    cursor = len(PNG_SIGNATURE)
    while cursor < len(data):
        length = struct.unpack_from('>I', data, cursor)[0]
        kind = data[cursor + 4:cursor + 8]
        body = data[cursor + 8:cursor + 8 + length]
        crc = struct.unpack_from('>I', data, cursor + 8 + length)[0]
        if zlib.crc32(kind + body) != crc:
            raise ValueError(f'Invalid PNG chunk: {kind!r}')
        yield kind, body
        cursor += length + 12
        if kind == b'IEND':
            break


def read_rgba(path: Path) -> tuple[int, int, list[bytes]]:
    data = path.read_bytes()
    if not data.startswith(PNG_SIGNATURE):
        raise ValueError(f'Not a PNG: {path}')
    parts = list(chunks(data))
    head = next(body for kind, body in parts if kind == b'IHDR')
    width, height, depth, color, compression, filtering, interlace = struct.unpack('>IIBBBBB', head)
    if (depth, color, compression, filtering, interlace) != (8, 6, 0, 0, 0):
        raise ValueError(f'Expected non-interlaced RGBA8: {path}')
    raw = zlib.decompress(b''.join(body for kind, body in parts if kind == b'IDAT'))
    stride = width * 4
    rows = []
    previous = bytes(stride)
    cursor = 0
    for _ in range(height):
        mode = raw[cursor]
        cursor += 1
        filtered = raw[cursor:cursor + stride]
        cursor += stride
        row = bytearray(stride)
        for position, byte in enumerate(filtered):
            left = row[position - 4] if position >= 4 else 0
            above = previous[position]
            upper_left = previous[position - 4] if position >= 4 else 0
            if mode == 0:
                predictor = 0
            elif mode == 1:
                predictor = left
            elif mode == 2:
                predictor = above
            elif mode == 3:
                predictor = (left + above) // 2
            elif mode == 4:
                estimate = left + above - upper_left
                distances = (abs(estimate - left), abs(estimate - above), abs(estimate - upper_left))
                predictor = (left, above, upper_left)[distances.index(min(distances))]
            else:
                raise ValueError(f'Unknown PNG filter {mode} in {path}')
            row[position] = (byte + predictor) & 255
        previous = bytes(row)
        rows.append(previous)
    return width, height, rows


def png_chunk(kind: bytes, body: bytes) -> bytes:
    return struct.pack('>I', len(body)) + kind + body + struct.pack('>I', zlib.crc32(kind + body))


def write_rgba(path: Path, width: int, height: int, rows: list[bytes]) -> None:
    header = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    scanlines = b''.join(b'\0' + row for row in rows)
    path.write_bytes(PNG_SIGNATURE + png_chunk(b'IHDR', header)
                     + png_chunk(b'IDAT', zlib.compress(scanlines, 9))
                     + png_chunk(b'IEND', b''))


def upscale(path: Path) -> tuple[Path, int]:
    width, height, original = read_rgba(path)
    pixels = []
    for row in original:
        normalized = bytearray()
        for position in range(0, len(row), 4):
            r, g, b, alpha = row[position:position + 4]
            if alpha == 0 or max(r, g, b) <= 1:
                normalized.extend((0, 0, 0, 0))
            elif min(r, g, b) >= 254:
                normalized.extend((255, 255, 255, alpha))
            else:
                raise ValueError(f'Unexpected non-black/white pixel in {path}: {(r, g, b, alpha)}')
        pixels.append(bytes(normalized))
    factor = ART_LIMIT // max(width, height)
    if factor < 1:
        raise ValueError(f'Source is too large for integer upscaling: {path}')
    art_width, art_height = width * factor, height * factor
    left, top = (CANVAS - art_width) // 2, (CANVAS - art_height) // 2
    background = bytes((124, 118, 150, 255)) if "thumbnail" in path.name else bytes((0, 0, 0, 0))
    blank = background * CANVAS
    rows = [blank for _ in range(CANVAS)]
    for y in range(art_height):
        source = pixels[y // factor]
        expanded = b''.join(source[x * 4:x * 4 + 4] * factor for x in range(width))
        if 'thumbnail' in path.name:
            composed = bytearray(expanded)
            for offset in range(0, len(composed), 4):
                if composed[offset + 3] == 0:
                    composed[offset:offset + 4] = background
            expanded = bytes(composed)
        rows[top + y] = blank[:left * 4] + expanded + blank[(left + art_width) * 4:]
    name = path.name.replace('-original', '')
    target = OUTPUT / name
    write_rgba(target, CANVAS, CANVAS, rows)
    # Confirm the white glyph and transparent background at every output block.
    _, _, result = read_rgba(target)
    for y in range(height):
        for x in range(width):
            expected = pixels[y][x * 4:x * 4 + 4]
            if 'thumbnail' in path.name and expected[3] == 0:
                expected = background
            sample = result[top + y * factor + factor // 2][(left + x * factor + factor // 2) * 4:][:4]
            if sample != expected:
                raise AssertionError(f'Pixel changed: {path}, {x}, {y}')
    return target, factor


if __name__ == '__main__':
    OUTPUT.mkdir(parents=True, exist_ok=True)
    files = sorted(SOURCE.glob('*.png'))
    if len(files) != 13:
        raise SystemExit(f'Expected 13 original roman images, found {len(files)}')
    for original in files:
        result, factor = upscale(original)
        print(f'{original.name} -> {result.name} (nearest-neighbor x{factor})')
