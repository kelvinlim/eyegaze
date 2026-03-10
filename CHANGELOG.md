# Changelog

## 2026-03-10

### Added
- **Trial-level correctness scoring**: Each `gaze_perception` trial now includes a `correct` boolean field computed in real-time via `on_finish`. Logic: gaze "Center" → correct response is "Yes" (f/button 0); any other gaze → correct response is "No" (j/button 1).
