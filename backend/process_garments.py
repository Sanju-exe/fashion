"""
Fast, high-precision OpenCV GrabCut & Alpha Matting for Garment Cutouts.
Runs locally in seconds without large model downloads.
"""

import os
import cv2
import numpy as np
from PIL import Image

REAL_DIR = os.path.abspath("public/clothes/real")
OUTPUT_DIR = os.path.abspath("public/clothes/real_cutouts")
os.makedirs(OUTPUT_DIR, exist_ok=True)

SHIRTS = [
    {
        "src": "shirt1.jpeg", 
        "out": "cutout_shirt1.png",
        "rect_margin": (0.05, 0.12, 0.90, 0.86), # (x_min, y_min, w, h)
        "hanger_clear": (0.35, 0.65, 0.14)
    },
    {
        "src": "shirt2.jpeg", 
        "out": "cutout_shirt2.png",
        "rect_margin": (0.04, 0.08, 0.92, 0.86),
        "hanger_clear": None
    },
    {
        "src": "shirt3.jpeg", 
        "out": "cutout_shirt3.png",
        "rect_margin": (0.06, 0.10, 0.88, 0.85),
        "hanger_clear": (0.35, 0.65, 0.15)
    },
    {
        "src": "shirt4.jpeg", 
        "out": "cutout_shirt4.png",
        "rect_margin": (0.01, 0.01, 0.98, 0.88),
        "hanger_clear": None
    },
    {
        "src": "shirt5.jpeg", 
        "out": "cutout_shirt5.png",
        "rect_margin": (0.02, 0.08, 0.95, 0.86),
        "hanger_clear": None
    },
]

def segment_garment(shirt_info):
    src_path = os.path.join(REAL_DIR, shirt_info["src"])
    out_path = os.path.join(OUTPUT_DIR, shirt_info["out"])
    if not os.path.exists(src_path):
        print(f"Skipping {src_path}, not found")
        return

    print(f"Segmenting {shirt_info['src']}...")
    img = cv2.imread(src_path)
    h, w = img.shape[:2]

    # 1. GrabCut initialization
    mask = np.zeros((h, w), np.uint8)
    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)

    rx, ry, rw, rh = shirt_info["rect_margin"]
    rect = (int(rx * w), int(ry * h), int(rw * w), int(rh * h))

    # Mark definite background border
    border = 6
    mask[:border, :] = cv2.GC_BGD
    mask[-border:, :] = cv2.GC_BGD
    mask[:, :border] = cv2.GC_BGD
    mask[:, -border:] = cv2.GC_BGD

    cv2.grabCut(img, mask, rect, bgd_model, fgd_model, 4, cv2.GC_INIT_WITH_RECT)

    # 2. Extract foreground mask
    fg_mask = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')

    # Remove hanger if specified
    if shirt_info["hanger_clear"]:
        x1_r, x2_r, y_r = shirt_info["hanger_clear"]
        fg_mask[:int(y_r * h), int(x1_r * w):int(x2_r * w)] = 0

    # 3. Morphological cleanup and edge feathering
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel)
    fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, kernel)

    # Keep only largest connected component (the shirt)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(fg_mask)
    if num_labels > 1:
        largest_label = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        fg_mask = (labels == largest_label).astype('uint8')

    # Feather edges with Gaussian blur for smooth natural border
    alpha = (fg_mask * 255).astype(np.uint8)
    alpha = cv2.GaussianBlur(alpha, (7, 7), 0)

    # 4. Construct RGBA image
    b, g, r = cv2.split(img)
    rgba = cv2.merge([b, g, r, alpha])

    cv2.imwrite(out_path, rgba)
    print(f"Successfully created: {out_path} ({w}x{h})")

if __name__ == "__main__":
    for s in SHIRTS:
        segment_garment(s)
    print("Garment cutouts generation complete.")
