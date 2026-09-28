"""Number-plate OCR.

Reads characters from a plate crop. When no OCR engine is installed, or the
read is not confident enough, the plate is reported as not readable rather
than guessing a value.
"""

from __future__ import annotations

import re
from typing import Any

import cv2
import numpy as np

from config import OCR_MIN_CONFIDENCE

PLATE_PATTERN = re.compile(r"[A-Z0-9]")

_reader: Any | None = None
_reader_loaded = False


def _get_reader() -> Any | None:
    """Lazily loads EasyOCR when available."""
    global _reader, _reader_loaded
    if _reader_loaded:
        return _reader
    _reader_loaded = True
    try:
        import easyocr

        _reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    except Exception as exc:  # noqa: BLE001
        print(f"[SafeVision] OCR engine unavailable, plates will be reported as not readable: {exc}")
        _reader = None
    return _reader


def preprocess(crop: np.ndarray) -> np.ndarray:
    """Upscales, denoises and thresholds a plate crop to help OCR."""
    if crop.size == 0:
        return crop
    height = crop.shape[0]
    if height < 64:
        factor = max(2, int(round(64 / max(height, 1))))
        crop = cv2.resize(crop, None, fx=factor, fy=factor, interpolation=cv2.INTER_CUBIC)

    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 7, 60, 60)
    gray = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return binary


def normalize_plate_text(raw: str) -> str:
    cleaned = "".join(PLATE_PATTERN.findall(raw.upper()))
    return cleaned


def read_plate(crop: np.ndarray) -> tuple[str | None, float | None]:
    """Returns (plate_text, confidence). plate_text is None when unreadable."""
    reader = _get_reader()
    if reader is None or crop.size == 0:
        return None, None

    prepared = preprocess(crop)
    try:
        results = reader.readtext(prepared)
    except Exception as exc:  # noqa: BLE001
        print(f"[SafeVision] OCR failed on a plate crop: {exc}")
        return None, None

    best_text = ""
    best_conf = 0.0
    for _box, text, conf in results:
        candidate = normalize_plate_text(str(text))
        if len(candidate) < 4:
            continue
        if float(conf) > best_conf:
            best_conf = float(conf)
            best_text = candidate

    if not best_text or best_conf < OCR_MIN_CONFIDENCE:
        return None, round(best_conf, 4) if best_conf else None
    return best_text, round(best_conf, 4)
