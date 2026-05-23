# Review Plan: Synthetic Gaze Stimuli

This document outlines the systematic review of synthetic face stimuli for the eyegaze task, based on the goals in [SyntheticEyegazeFaces.md](SyntheticEyegazeFaces.md).

## 1. Geometric & Physical Accuracy (Phase 1)
*Goal: Ensure the eyeball "physics" and iris rotation are consistent across angles.*

- [ ] **Limbal Tracking:** Does the iris maintain a realistic elliptical shape during rotation (foreshortening), or is it a simple translation?
- [ ] **Sclera Visibility:** Is the amount of sclera revealed on the trailing/leading edges physiologically plausible for 5°, 10°, 20°, and 30° offsets?
- [ ] **Eyelid Interaction:** Do the eyelids deform naturally as the gaze shifts (especially for vertical or large horizontal shifts)?
- [ ] **Calibration Check:** Compare 5/10/20/30 degree increments across different models (Dean, Glo, etc.) to ensure the "degree" mapping is identical.

## 2. Integration & Naturalism (Phase 2)
*Goal: Evaluate how well the "eyeball model" fits into the "generic neutral face".*

- [ ] **Occlusion & Shadows:** Are there realistic shadows cast by the brow/eyelids onto the sclera?
- [ ] **Corneal Reflections (Catchlights):** Do catchlights move correctly or stay fixed? (Fixed catchlights often break the "gaze" illusion).
- [ ] **Neutrality Baseline:** Are the "neutral" faces truly neutral? Look for unintended micro-expressions (e.g., subtle smirks or squinting) that could bias "Looking at you" responses.
- [ ] **Face-Gaze Alignment:** Ensure the head is perfectly centered/orthogonal if the task relies on pure gaze angle.

## 3. Diversity & Affective Control (Phase 3)
*Goal: Review calibrated levels of emotion and demographic representation.*

- [ ] **Demographic Balance:** Audit current models (Dean, Mary, Glo, etc.) for race, age, and gender representation.
- [ ] **Emotional Calibration:**
    - [ ] **Scorn/Anger:** Check if the gaze shift changes the perceived intensity of the emotion (e.g., does looking away make "Angry" look "Sullen"?).
    - [ ] **Consistency:** Is "L10 Happy" the same level of valence as "R10 Happy"?
- [ ] **Uncanny Valley Assessment:** Identify stimuli that look "glitchy" or non-human, as these can increase participant reaction times.

## 4. Technical Specifications
- [ ] **Consistency:** Resolution (e.g., 800x600), background color consistency, and file naming (`Model_Angle.png`).
- [ ] **L/R Symmetry:** Mirror-verify that `L10` is a geometrically perfect mirror of `R10` (if intended).
