# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web-based psychology experiment built with **jsPsych 8.0.0** that measures participants' ability to interpret gaze direction. Participants view face images with varying gaze angles and respond whether the person is "looking at you." Deployed via GitHub Pages at `https://kelvinlim.github.io/eyegaze/`.

## Development Commands

```bash
# Serve frontend locally (no build step — static JS/HTML)
python3 -m http.server 8001
# Then visit: http://localhost:8001?test=1

# Run FastAPI backend
cd eyegaze_server
pip install -r requirements.txt
uvicorn main:app --reload

# Utility scripts
python3 copy_images.py        # Batch resize stimuli
python3 create_fixation.py    # Generate fixation cross SVG
```

**URL parameters for testing:** `?test=1` (10 trials/block), `?test=N` or `?trials=N` (custom count), `?study=NAME`, `?sub=ID`

## Architecture

### Frontend (root directory)
- **`index.html`** — Entry point. Loads jsPsych 8.0.0 from CDN, defines responsive CSS, creates `#jspsych-target` div.
- **`main.js`** (~377 lines) — Core experiment logic. Single exported function `initEyegazeTask(config)` builds the full jsPsych timeline: preload → instructions → 6 blocks (one face model each, shuffled) → data save.
  - Detects touch vs keyboard devices, adapts UI (buttons vs F/J keys)
  - Each trial: 1000ms fixation → 200ms stimulus → 1800ms response window
  - Trial `on_finish` computes `correct` boolean: "Center" gaze → "Yes" is correct; all other gazes → "No" is correct
  - Stimuli: 6 models × 13 gaze angles = 78 PNG images in `images/`

### Backend (`eyegaze_server/`)
- **`main.py`** — FastAPI app with `POST /save` (saves trial data as JSON) and `GET /data` (lists saved files). CORS configured for GitHub Pages and localhost.
- Data saved to `eyegaze_server/data/[subject_id]_[timestamp].json`

### Integration Patterns
Three ways the experiment communicates results to a host:

1. **TaskShare** (primary) — Listens for `TASK_CONFIG` postMessage from parent, sends `EYEGAZE_COMPLETE` + progress messages back. Config in `taskshare.json`.
2. **Qualtrics** — `qualtrics_iframe.js` embeds experiment in iframe, receives data via postMessage, stores in Qualtrics Embedded Data fields.
3. **FastAPI** — Standalone mode, POSTs data directly to backend server. Controlled by `SAVE_METHOD` constant in `main.js`.

### Data Flow
Experiment completion → `on_finish` callback → if in iframe: `postMessage('EYEGAZE_COMPLETE', data)` to parent; if standalone + FastAPI: `fetch('/save', {subject_id, trial_data})`.

## Conventions

- **Git commits:** Use conventional commit format (`type(scope): description`)
- **Semantic versioning** for releases
- No build system or package manager — pure static files + optional Python backend
- Face model names: Dean, Peter, Raymond, Glo, Mary, Oli
- Gaze angles: Center, L5, R5, L10, R10 ... L30, R30
