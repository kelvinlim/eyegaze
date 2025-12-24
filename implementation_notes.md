# Gaze Perception Task - Implementation Notes

## Overview
This project implements a Gaze Perception Task using `jsPsych`. It supports both touch devices (mobile/tablet) and keyboard input (desktop) via a unified codebase.

## Key Features

### 1. Unified Logic (`main.js`)
- The logic for both mobile and keyboard versions is consolidated in `main.js`.
- **Device Detection**: The script automatically detects touch capabilities and serves the appropriate input method:
    - **Touch**: Buttons for "Yes" / "No".
    - **Keyboard**: Keys **F** (Yes) and **J** (No).

### 2. Trial Flow & Timing
The trial structure has been standardized as follows:
1.  **Stimulus (Face)**: 200ms
2.  **Fixation Cross**: 1800ms (Appears immediately after stimulus)
3.  **Post-Trial Gap**: 500ms (Blank screen)
4.  **Response**:
    - Participants can respond at any time during the trial.
    - **Response Ends Trial**: `true` (The trial advances immediately upon response).

### 3. Fixation Cross
- **Implementation**: CSS background image trick.
- **File**: `images/fixation_cross.svg` (512x512px).
- **Behavior**: The `.fixation-trial` CSS class sets the cross as the background. It is revealed when the stimulus image is removed after 200ms.

### 4. URL Parameters for Testing
You can configure the experiment using URL parameters:
- **Default**: 30 trials per block.
- **Test Mode**: `?test=true` (Sets trials to 10).
- **Custom Count**: `?test=N` or `?trials=N` (Sets trials to N).
    - Example: `index.html?test=5` runs 5 trials per block.
- **Data Tagging**:
    - `?study=NAME`: Adds `study: NAME` to the output data.
    - `?sub=ID`: Adds `sub: ID` to the output data.
    - Example: `index.html?study=pilot&sub=001`

### 5. Qualtrics Integration
- **Method**: Iframe embedding (more robust than direct injection).
- **Data Transfer**: Uses `window.parent.postMessage()` to send data (JSON) to the parent Qualtrics window.
- **Qualtrics Script**: `qualtrics_iframe.js` contains the code to be placed in the Qualtrics "Question JavaScript" editor.
    - Creates an iframe pointing to the GitHub Pages URL.
    - Listens for the `EYEGAZE_COMPLETE` message.
    - Saves data to `experiment_data` Embedded Data field.
- **Setup Guide**: See `QUALTRICS_SETUP.md` for detailed instructions.

## File Structure
- `index.html`: Entry point. Loads `main.js` and CSS.
- `main.js`: Core experiment logic.
- `qualtrics_code.js`: Script for Qualtrics.
- `images/`: Contains stimuli and `fixation_cross.svg`.
