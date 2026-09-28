"""Helmet / rider detection using the trained YOLO model.

Class names of the trained model (indexes are preserved exactly as trained):
    0 driver_with_helmet
    1 bike
    2 driver
    3 passenger_with_helmet
    4 passenger
    5 driver_without_helmet
    6 passenger_without_helmet
"""

from __future__ import annotations

from typing import Any

import cv2
import numpy as np

from config import (
    DETECTION_CONFIDENCE,
    IOU_THRESHOLD,
    MODEL_MISSING_MESSAGE,
    MODEL_PATH,
)

CLASS_NAMES = [
    "driver_with_helmet",
    "bike",
    "driver",
    "passenger_with_helmet",
    "passenger",
    "driver_without_helmet",
    "passenger_without_helmet",
]

DISPLAY_LABELS = {
    "driver_with_helmet": "Driver with helmet",
    "bike": "Bike",
    "driver": "Driver",
    "passenger_with_helmet": "Passenger with helmet",
    "passenger": "Passenger",
    "driver_without_helmet": "Driver without helmet",
    "passenger_without_helmet": "Passenger without helmet",
}

# BGR colours used for annotation only.
COLOR_OK = (61, 139, 34)
COLOR_VIOLATION = (38, 38, 220)
COLOR_NEUTRAL = (200, 90, 60)


class ModelNotFoundError(RuntimeError):
    """Raised when the trained model weights are not present on disk."""


def is_violation(class_name: str) -> bool:
    return "without" in class_name


def is_bike(class_name: str) -> bool:
    return class_name == "bike"


def display_label(class_name: str) -> str:
    return DISPLAY_LABELS.get(class_name, class_name.replace("_", " ").capitalize())


class HelmetDetector:
    """Thin wrapper around the trained YOLO model."""

    def __init__(self) -> None:
        if not MODEL_PATH.exists():
            raise ModelNotFoundError(MODEL_MISSING_MESSAGE)
        from ultralytics import YOLO  # imported lazily so the app can start without torch

        self.model = YOLO(str(MODEL_PATH))
        names = getattr(self.model, "names", None)
        if isinstance(names, dict) and names:
            self.names = {int(k): str(v) for k, v in names.items()}
        else:
            self.names = dict(enumerate(CLASS_NAMES))

    def _class_name(self, index: int) -> str:
        return self.names.get(index, CLASS_NAMES[index] if index < len(CLASS_NAMES) else "unknown")

    def detect(self, frame: np.ndarray) -> list[dict[str, Any]]:
        """Runs plain detection on a single frame."""
        results = self.model.predict(
            frame, conf=DETECTION_CONFIDENCE, iou=IOU_THRESHOLD, verbose=False
        )
        return self._parse(results)

    def track(self, frame: np.ndarray) -> list[dict[str, Any]]:
        """Runs detection with tracking so riders keep a stable id across frames."""
        try:
            results = self.model.track(
                frame,
                conf=DETECTION_CONFIDENCE,
                iou=IOU_THRESHOLD,
                persist=True,
                verbose=False,
            )
        except Exception:  # noqa: BLE001 - tracker unavailable, fall back to detection
            return self.detect(frame)
        return self._parse(results)

    def _parse(self, results: Any) -> list[dict[str, Any]]:
        detections: list[dict[str, Any]] = []
        for result in results:
            boxes = getattr(result, "boxes", None)
            if boxes is None:
                continue
            xyxy = boxes.xyxy.cpu().numpy() if len(boxes) else []
            confs = boxes.conf.cpu().numpy() if len(boxes) else []
            classes = boxes.cls.cpu().numpy() if len(boxes) else []
            ids = boxes.id.cpu().numpy() if getattr(boxes, "id", None) is not None else None

            for i in range(len(xyxy)):
                x1, y1, x2, y2 = (float(v) for v in xyxy[i][:4])
                detections.append(
                    {
                        "class_name": self._class_name(int(classes[i])),
                        "confidence": round(float(confs[i]), 4),
                        "x1": x1,
                        "y1": y1,
                        "x2": x2,
                        "y2": y2,
                        "tracking_id": str(int(ids[i])) if ids is not None else None,
                    }
                )
        return detections

    def annotate(self, frame: np.ndarray, detections: list[dict[str, Any]]) -> np.ndarray:
        """Draws boxes with clean labels. Confidence values are never drawn."""
        out = frame.copy()
        thickness = max(2, out.shape[1] // 400)
        scale = max(0.5, out.shape[1] / 1300)

        for det in detections:
            name = det["class_name"]
            if is_violation(name):
                color = COLOR_VIOLATION
            elif is_bike(name):
                color = COLOR_NEUTRAL
            else:
                color = COLOR_OK

            p1 = (int(det["x1"]), int(det["y1"]))
            p2 = (int(det["x2"]), int(det["y2"]))
            cv2.rectangle(out, p1, p2, color, thickness)

            label = display_label(name)
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, scale, 1)
            top = max(0, p1[1] - th - 8)
            cv2.rectangle(out, (p1[0], top), (p1[0] + tw + 8, top + th + 8), color, -1)
            cv2.putText(
                out,
                label,
                (p1[0] + 4, top + th + 2),
                cv2.FONT_HERSHEY_SIMPLEX,
                scale,
                (255, 255, 255),
                1,
                cv2.LINE_AA,
            )
        return out


_detector: HelmetDetector | None = None


def load_detector() -> HelmetDetector:
    global _detector
    if _detector is None:
        _detector = HelmetDetector()
    return _detector


def get_detector() -> HelmetDetector:
    if _detector is None:
        return load_detector()
    return _detector
