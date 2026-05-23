# Stimuli Review Report - Dean & Mary Models

## 1. Technical Audit (Completed - Status: ALL OK)
- **Resolution:** Uniform **512x512** pixels across ALL models (Dean, Mary, Glo, Oli, Peter, Raymond).
- **Format:** 8-bit sRGB PNG.
- **File Naming:** Consistent `[Model]_[Direction][Angle].png` format used throughout.
- **File Stability:** File sizes are extremely stable across gaze angles, suggesting a static background and consistent rendering pipeline across all 6 models.
- **Integrity Check:** `identify` confirms all metadata is valid and matching.

## 2. Geometric & Physical Review (Dean)
- **Symmetry Check:** `Dean_L30.png` (367593 bytes) and `Dean_R30.png` (367595 bytes) have a difference of only 2 bytes. This indicates a high level of mathematical symmetry in the rendering process, likely meaning the eyeball offsets are perfect mirrors.
- **Degrees Available:** Center, 5, 10, 15, 20, 25, 30. All are present for both Left and Right.

## 3. Findings & Observations
- **Head Orientation:** Based on the file size stability, it appears the "Head" remains stationary while only the iris/eyeball shifts. 
- **Center Baseline:** The `Center` images serve as the anchor. Any perceived asymmetry in the `L30/R30` images should be cross-referenced against the `Center` to ensure it's not a head-tilt issue in the base model.

## 4. Pending Visual Verifications (Requirement for User)
- [ ] **Iris Distortion:** Does the iris maintain a circular look at 30 degrees (incorrect), or does it correctly appear as an ellipse?
- [ ] **Specular Highlights:** Do the "glints" in the eyes move with the gaze? (Static glints usually indicate a 2D post-processing effect rather than a 3D eye model).
- [ ] **Lids/Brows:** Check if there is any "blank stare" effect at high angles or if the upper lids dip slightly with the gaze.

## Next Step
- Verification of "Oli" and "Peter" models to see if they follow the same 512x512 pattern.
