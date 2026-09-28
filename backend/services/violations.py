"""Associates helmet violations with bikes and their number plates.

A violation detection (a rider without a helmet) is matched to the bike whose
box overlaps it most. The plate of that bike is then located and read. When
the plate cannot be read, the violation carries number_plate = None and a
NOT_READABLE status — no value is ever invented.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import numpy as np

from services.detector import is_bike, is_violation
from services.ocr import read_plate
from services.plate_detector import crop_plate, detect_plate_box

Box = tuple[int, int, int, int]


def _box_of(det: dict[str, Any]) -> Box:
    return int(det["x1"]), int(det["y1"]), int(det["x2"]), int(det["y2"])


def _overlap_ratio(inner: Box, outer: Box) -> float:
    ix1 = max(inner[0], outer[0])
    iy1 = max(inner[1], outer[1])
    ix2 = min(inner[2], outer[2])
    iy2 = min(inner[3], outer[3])
    if ix2 <= ix1 or iy2 <= iy1:
        return 0.0
    intersection = (ix2 - ix1) * (iy2 - iy1)
    inner_area = max(1, (inner[2] - inner[0]) * (inner[3] - inner[1]))
    return intersection / float(inner_area)


def _center_distance(a: Box, b: Box) -> float:
    ax = (a[0] + a[2]) / 2
    ay = (a[1] + a[3]) / 2
    bx = (b[0] + b[2]) / 2
    by = (b[1] + b[3]) / 2
    return float(((ax - bx) ** 2 + (ay - by) ** 2) ** 0.5)


def _associated_bike(violation: dict[str, Any], bikes: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not bikes:
        return None
    vbox = _box_of(violation)
    best = None
    best_overlap = 0.0
    for bike in bikes:
        overlap = _overlap_ratio(vbox, _box_of(bike))
        if overlap > best_overlap:
            best_overlap = overlap
            best = bike
    if best is not None and best_overlap > 0.1:
        return best
    # No overlap: fall back to the nearest bike by centre distance.
    return min(bikes, key=lambda b: _center_distance(vbox, _box_of(b)))


def build_violations(
    frame: np.ndarray,
    detections: list[dict[str, Any]],
    *,
    read_plates: bool = True,
    timestamp: str | None = None,
) -> list[dict[str, Any]]:
    """Builds violation records for one frame."""
    now = timestamp or datetime.now(timezone.utc).isoformat()
    bikes = [d for d in detections if is_bike(d["class_name"])]
    violations: list[dict[str, Any]] = []

    for det in detections:
        if not is_violation(det["class_name"]):
            continue

        bike = _associated_bike(det, bikes)
        plate_text: str | None = None
        plate_conf: float | None = None

        if read_plates and bike is not None:
            plate_box = detect_plate_box(frame, _box_of(bike))
            if plate_box is not None:
                plate_text, plate_conf = read_plate(crop_plate(frame, plate_box))

        violations.append(
            {
                "vehicle_type": "bike",
                "helmet_status": det["class_name"],
                "number_plate": plate_text,
                "number_plate_status": "READABLE" if plate_text else "NOT_READABLE",
                "number_plate_confidence": plate_conf,
                "detection_confidence": det.get("confidence"),
                "tracking_id": det.get("tracking_id"),
                "first_detected_at": now,
                "last_detected_at": now,
            }
        )
    return violations


def merge_tracked_violations(
    accumulated: dict[str, dict[str, Any]],
    frame_violations: list[dict[str, Any]],
) -> None:
    """Aggregates per-frame violations by tracking id, in place.

    A rider seen across many frames becomes a single record. A readable plate
    found in any frame is kept for that rider.
    """
    for violation in frame_violations:
        key = violation.get("tracking_id") or (
            f"{violation['helmet_status']}:{len(accumulated)}"
        )
        existing = accumulated.get(key)
        if existing is None:
            accumulated[key] = dict(violation)
            continue

        existing["last_detected_at"] = violation["last_detected_at"]
        if existing["number_plate_status"] != "READABLE" and violation["number_plate"]:
            existing["number_plate"] = violation["number_plate"]
            existing["number_plate_status"] = "READABLE"
            existing["number_plate_confidence"] = violation["number_plate_confidence"]
        if (violation.get("detection_confidence") or 0) > (
            existing.get("detection_confidence") or 0
        ):
            existing["detection_confidence"] = violation["detection_confidence"]


def summarize(
    detections: list[dict[str, Any]],
    violations: list[dict[str, Any]],
    plates_found: int,
) -> dict[str, int]:
    helmet = sum(1 for d in detections if "with_helmet" in d["class_name"])
    no_helmet = sum(1 for d in detections if is_violation(d["class_name"]))
    bikes = sum(1 for d in detections if is_bike(d["class_name"]))
    readable = sum(1 for v in violations if v["number_plate_status"] == "READABLE")
    return {
        "total_objects": len(detections),
        "helmet_count": helmet,
        "no_helmet_count": no_helmet,
        "bike_count": bikes,
        "number_plate_count": plates_found,
        "readable_plate_count": readable,
        "violation_count": len(violations),
    }
