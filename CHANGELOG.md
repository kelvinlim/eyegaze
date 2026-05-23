# Changelog

## 2026-05-22

### Changed
- **Instruction screen centering**: Updated instruction trials to use explicit centering wrappers (`instruction-center`, `instruction-center__inner`) so intro text aligns with the true screen midpoint on desktop and touch flows.
- **Instruction trial CSS targeting**: Added an instruction-only class (`instruction-screen`) and focused centering rules to avoid affecting non-instruction trial layouts.
- **Stimulus alignment selector coverage**: Expanded layout selectors to cover both `#jspsych-content` and `.jspsych-content` variants to improve compatibility across jsPsych render paths.
- **Script cache-busting update**: Bumped the `main.js` query version in `index.html` to ensure GitHub Pages clients fetch the updated behavior after deployment.

## 2026-03-14

### Added
- **Stimulus set selection (`stimset`)**: New `STIM_SETS` config in `main.js` supports switching between `ai` (AI-generated 512x512 faces) and `orig` (original 300x400 photo stimuli) via URL param `?stimset=ai|orig` or TaskShare `config_params`.
- **Original photo stimuli (`images_orig/`)**: Converted original BMP photos to PNG format (300x400, 3:4 portrait). Models: Dean, Bro2, Raymond (male), Glo, Sherry, Oli (female) — maintaining the 3M/3F distribution of the AI set.
- **Conversion script (`convert_original_pics.sh`)**: Reproduces the BMP→PNG conversion from `original_pics/` to `images_orig/`, including filename remapping from `{Gaze}_{Model}.bmp` to `{Model}_{Gaze}.png`.
- **`taskshare.json` config_schema**: Documents accepted task parameters (`stimset`, `study`, `trialsPerBlock`) so the TaskShare UI can render config forms automatically.
- **`stimset` recorded in trial data**: Added to `jsPsych.data.addProperties` so each trial row identifies which stimulus set was used.

### Changed
- **Image directory rename**: `images/` → `images_ai/` for clarity alongside the new `images_orig/` directory.
- **Unified `trialsPerBlock` parsing**: URL params (`?test=N`, `?trials=N`) are now parsed once in the standalone auto-run block and passed through `processConfig`, eliminating duplicate parsing inside `initEyegazeTask`.

## 2026-03-10

### Added
- **Trial-level correctness scoring**: Each `gaze_perception` trial now includes a `correct` boolean field computed in real-time via `on_finish`. Logic: gaze "Center" → correct response is "Yes" (f/button 0); any other gaze → correct response is "No" (j/button 1).
