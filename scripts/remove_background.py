#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
from typing import Iterable, Sequence, Tuple

import cv2
import numpy as np
from PIL import Image


SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
WHITE_THRESHOLD = 230
MIN_CONTOUR_AREA_RATIO = 0.001
PADDING = 12


def main() -> None:
    products_dir = Path("/Users/annasmolnikova/Desktop/praktika/assets/img/products")
    output_pattern = "image{index}.png"

    images = sorted(
        [
            path
            for path in products_dir.iterdir()
            if path.suffix.lower() in SUPPORTED_EXTENSIONS and not path.name.startswith("image")
        ]
    )

    if not images:
        print("Нет подходящих файлов для обработки.")
        return

    for index, image_path in enumerate(images, start=1):
        try:
            processed = process_image(image_path)
        except Exception as exc:  # noqa: BLE001
            print(f"Не удалось обработать {image_path.name}: {exc}")
            continue

        output_path = products_dir / output_pattern.format(index=index)
        processed.save(output_path)
        print(f"{image_path.name} -> {output_path.name}")


def process_image(image_path: Path) -> Image.Image:
    rgba = load_image_with_alpha(image_path)
    mask = build_foreground_mask(rgba)
    mask = keep_largest_contour(mask)
    applied = apply_mask(rgba, mask)
    cropped = crop_to_mask(applied, mask)
    rgba_image = cv2.cvtColor(cropped, cv2.COLOR_BGRA2RGBA)
    return Image.fromarray(rgba_image)


def load_image_with_alpha(image_path: Path) -> np.ndarray:
    image = cv2.imread(str(image_path), cv2.IMREAD_UNCHANGED)
    if image is None:
        raise ValueError("невозможно открыть файл")

    if image.ndim == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGRA)
    elif image.shape[2] == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)
    elif image.shape[2] == 4:
        # уже BGRA
        pass
    else:
        raise ValueError(f"неподдерживаемый формат: {image.shape}")

    return image


def build_foreground_mask(rgba: np.ndarray) -> np.ndarray:
    bgr = cv2.cvtColor(rgba, cv2.COLOR_BGRA2BGR)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, otsu = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    non_white = cv2.inRange(
        bgr,
        np.array([0, 0, 0], dtype=np.uint8),
        np.array([WHITE_THRESHOLD, WHITE_THRESHOLD, WHITE_THRESHOLD], dtype=np.uint8),
    )

    mask = cv2.bitwise_or(otsu, non_white)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    mask = cv2.dilate(mask, kernel, iterations=1)
    return mask


def keep_largest_contour(mask: np.ndarray) -> np.ndarray:
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return mask

    h, w = mask.shape[:2]
    total_area = h * w

    contour = max(contours, key=cv2.contourArea)
    if cv2.contourArea(contour) < total_area * MIN_CONTOUR_AREA_RATIO:
        return mask

    result = np.zeros_like(mask)
    cv2.drawContours(result, [contour], -1, color=255, thickness=cv2.FILLED)
    return result


def apply_mask(rgba: np.ndarray, mask: np.ndarray) -> np.ndarray:
    alpha = np.where(mask > 0, 255, 0).astype(np.uint8)
    result = rgba.copy()
    result[..., 3] = alpha
    return result


def crop_to_mask(rgba: np.ndarray, mask: np.ndarray) -> np.ndarray:
    ys, xs = np.where(mask > 0)
    if len(xs) == 0 or len(ys) == 0:
        return rgba

    min_x = max(int(xs.min()) - PADDING, 0)
    max_x = min(int(xs.max()) + PADDING, rgba.shape[1] - 1)
    min_y = max(int(ys.min()) - PADDING, 0)
    max_y = min(int(ys.max()) + PADDING, rgba.shape[0] - 1)

    cropped = rgba[min_y : max_y + 1, min_x : max_x + 1].copy()
    cropped_mask = mask[min_y : max_y + 1, min_x : max_x + 1]
    cropped[..., 3] = np.where(cropped_mask > 0, 255, 0).astype(np.uint8)
    return cropped


if __name__ == "__main__":
    main()

