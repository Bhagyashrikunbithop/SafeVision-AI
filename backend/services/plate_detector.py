"""Number-plate detection.

Helmet detection alone cannot read a plate, so plate localisation is a
separate, self-contained module. It uses a dedicated YOLO plate model when
one is configured, and otherwise falls back to a contour-based search in the
lower region of the associated bike box.
"""

from __future__ import annotations

from typing import Any

import cv2
import numpy as np

from config import PLATE_CONFIDENCE, PLATE_MODEL_PATH

Box = tuple[int, int, int, int]

_plate_model: Any | None = None
_plate_model_loaded = False


def _load_plate_model() -> Any | None:
    global _plate_model, _plate_model_loaded
    if _plate_model_loaded:
        return _plate_model
    _plate_model_loaded = True
    if PLATE_MODEL_PATH and PLATE_MODEL_PATH.exists():
        try:
            from ultralytics import YOLO

            _plate_model = YOLO(str(PLATE_MODEL_PATH))
        except Exception as exc:  # noqa: BLE001
            print(f"[SafeVision] Plate model could not be loaded: {exc}")
            _plate_model = None
    return _plate_model


def _clamp_box(box: Box, width: int, height: int) -> Box:
    x1, y1, x2, y2 = box
    x1 = max(0, min(x1, width - 1))
    y1 = max(0, min(y1, height - 1))
    x2 = max(x1 + 1, min(x2, width))
    y2 = max(y1 + 1, min(y2, height))
    return x1, y1, x2, y2


def _detect_with_model(region: np.ndarray) -> Box | None:
    model = _load_plate_model()
    if model is None or region.size == 0:
        return None
    try:
        results = model.predict(region, conf=PLATE_CONFIDENCE, verbose=False)
    except Exception as exc:  # noqa: BLE001
        print(f"[SafeVision] Plate detection failed: {exc}")
        return None

    best: Box | None = None
    best_conf = 0.0
    for result in results:
        boxes = getattr(result, "boxes", None)
        if boxes is None or len(boxes) == 0:
            continue
        xyxy = boxes.xyxy.cpu().numpy()
        confs = boxes.conf.cpu().numpy()
        for i in range(len(xyxy)):
            conf = float(confs[i])
            if conf > best_conf:
                best_conf = conf
                x1, y1, x2, y2 = (int(v) for v in xyxy[i][:4])
                best = (x1, y1, x2, y2)
    return best


def _detect_with_contours(region: np.ndarray) -> Box | None:
    """Geometric fallback: look for a bright, wide, rectangular patch."""
    if region.size == 0:
        return None
    height, width = region.shape[:2]
    if height < 20 or width < 20:
        return None

    gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    edges = cv2.Canny(gray, 60, 180)
    edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (9, 3)))

    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    best: Box | None = None
    best_score = 0.0
    region_area = float(height * width)

    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if h == 0 or w < 18 or h < 8:
            continue
        ratio = w / float(h)
        area = w * h
        if not 1.6 <= ratio <= 6.5:
            continue
        if area < region_area * 0.005 or area > region_area * 0.45:
            continue
        # Prefer patches lower in the region (plates sit below the rider).
        score = (area / region_area) * (0.5 + (y + h / 2) / height)
        if score > best_score:
            best_score = score
            best = (x, y, x + w, y + h)
    return best


def detect_plate_box(frame: np.ndarray, bike_box: Box) -> Box | None:
    """Returns the plate box in frame coordinates, or None when not found."""
    frame_h, frame_w = frame.shape[:2]
    x1, y1, x2, y2 = _clamp_box(bike_box, frame_w, frame_h)

    # Plates are on the lower half of the bike; search there with a margin.
    search_y1 = y1 + int((y2 - y1) * 0.35)
    search = frame[search_y1:y2, x1:x2]
    if search.size == 0:
        return None

    local = _detect_with_model(search) or _detect_with_contours(search)
    if local is None:
        return None

    lx1, ly1, lx2, ly2 = local
    return _clamp_box((x1 + lx1, search_y1 + ly1, x1 + lx2, search_y1 + ly2), frame_w, frame_h)


def crop_plate(frame: np.ndarray, plate_box: Box) -> np.ndarray:
    x1, y1, x2, y2 = _clamp_box(plate_box, frame.shape[1], frame.shape[0])
    return frame[y1:y2, x1:x2]
