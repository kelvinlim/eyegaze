// ===== DATA SAVING CONFIGURATION =====
// Toggle between 'FASTAPI' and 'QUALTRICS' modes
const SAVE_METHOD = 'FASTAPI'; // Options: 'QUALTRICS', 'FASTAPI'
const FASTAPI_ENDPOINT = 'http://localhost:8000/save'; // Change to production URL as needed

// ===== FASTAPI DATA SAVING FUNCTION =====
/**
 * Save experiment data to the FastAPI server
 * @param {string} subject_id - The participant ID
 * @param {string} data_string - JSON stringified trial data
 */
function saveDataToServer(subject_id, data_string) {
    console.log("Attempting to save data to FastAPI server...");

    fetch(FASTAPI_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            subject_id: subject_id,
            trial_data: data_string
        })
    })
        .then(response => {
            if (response.ok) {
                console.log("Data saved successfully to server!");
                alert("✓ Data saved successfully!");
                return response.json();
            } else {
                console.error(`Server error: ${response.status}`);
                alert("✗ Server error: Data not saved. Status: " + response.status);
            }
        })
        .then(data => {
            if (data) {
                console.log("Server response:", data);
            }
        })
        .catch(error => {
            console.error('Network error:', error);
            alert("✗ Network error: Unable to connect to server. Data NOT saved.");
        });
}

// Define the initialization function globally
window.initEyegazeTask = function (config) {
    const study_id = config.study || 'default_study';
    const subject_id = config.sub || 'default_sub';
    const image_base_url = config.imageBaseUrl || '';
    const trials_per_block_override = config.trialsPerBlock || null;
    const qthis = null; // No longer used in Iframe mode

    // Check for touch capability
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // Initialize jsPsych
    const jsPsych = initJsPsych({
        display_element: 'display_stage', // Target specific div
        on_finish: function () {
            // Get data
            const all_data = jsPsych.data.get();
            const gaze_trials = all_data.filter({ task: 'gaze_perception' });

            // Calculate summary stats
            const total_trials = gaze_trials.count();
            const avg_rt = gaze_trials.select('rt').mean() || 0;
            const yes_count = gaze_trials.filterCustom(trial => {
                return isTouchDevice ? trial.response === 0 : trial.response === 'f';
            }).count();
            const no_count = gaze_trials.filterCustom(trial => {
                return isTouchDevice ? trial.response === 1 : trial.response === 'j';
            }).count();

            // Accuracy: defined here as correctly identifying "Center" gaze as "Yes" (response 0 or 'f')
            const center_trials = gaze_trials.filter({ gaze: 'Center' });
            const correct_center = center_trials.filterCustom(trial => {
                return isTouchDevice ? trial.response === 0 : trial.response === 'f';
            }).count();
            const accuracy = center_trials.count() > 0 ? (correct_center / center_trials.count()) * 100 : 0;

            const summary_stats = {
                total_trials: total_trials,
                avg_rt: Math.round(avg_rt),
                yes_count: yes_count,
                no_count: no_count,
                accuracy: Math.round(accuracy * 10) / 10
            };

            // Get full trial data
            const full_json = all_data.json();
            const payload_size = full_json.length;
            console.log(`Final payload size: ${payload_size} characters.`);

            // ===== DATA SAVING LOGIC =====
            // Determine which save method to use
            if (SAVE_METHOD === 'FASTAPI') {
                // Save to FastAPI server
                console.log("Using FastAPI save method (v0.1.20)...");
                saveDataToServer(subject_id, full_json);
            }

            // Check if in Iframe
            if (window.self !== window.top) {
                console.log("Sending all data to parent (v0.1.20)...");
                const payload = {
                    type: 'EYEGAZE_COMPLETE',
                    json: full_json,
                    summary: summary_stats,
                    size: payload_size // Send size info for debugging
                };

                // Send as object
                window.parent.postMessage(payload, '*');

                // Redundant send as string for robustness in some environments
                window.parent.postMessage(JSON.stringify(payload), '*');
            } else {
                // Local testing
                console.log("Local run finished.");
                console.log("Summary Stats:", summary_stats);
                jsPsych.data.displayData();
            }
        }
    });

    // Add properties
    jsPsych.data.addProperties({
        study: study_id,
        sub: subject_id
    });

    // --- Stimuli Configuration ---
    const models = ['Dean', 'Peter', 'Raymond', 'Glo', 'Mary', 'Oli'];

    // Shuffle models
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    shuffleArray(models);

    // Full list of gaze angles based on file listing
    const gazes = ['Center', 'L5', 'R5', 'L10', 'R10', 'L15', 'R15', 'L20', 'R20', 'L25', 'R25', 'L30', 'R30'];

    // Helper to build image path
    function getImagePath(model, gaze) {
        // Use .png extension as found in directory
        return `${image_base_url}images/${model}_${gaze}.png`;
    }

    // Preload images
    const images_to_preload = [];
    models.forEach(model => {
        gazes.forEach(gaze => {
            images_to_preload.push(getImagePath(model, gaze));
        });
    });
    images_to_preload.push(`${image_base_url}images/fixation_cross.svg`);

    // --- Timeline ---
    const timeline = [];

    // Preload
    timeline.push({
        type: jsPsychPreload,
        images: images_to_preload
    });

    // Instructions
    let instruction_trial;
    if (isTouchDevice) {
        instruction_trial = {
            type: jsPsychHtmlButtonResponse,
            stimulus: `<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif;">
                    <h1 style="font-size: clamp(24px, 5vw, 36px); margin-bottom: 20px;">Gaze Perception Task</h1>
                    <p style="font-size: clamp(16px, 4vw, 20px); line-height: 1.5;">In this task, you will see faces.</p>
                    <p style="font-size: clamp(16px, 4vw, 20px); line-height: 1.5;">Your job is to decide if the person is <b>looking at you</b>.</p>
                    <p style="font-size: clamp(16px, 4vw, 20px); line-height: 1.5; margin-top: 30px;">
                        If looking at you press <b>Yes</b>. If not looking at you press <b>No</b>.
                    </p>
                </div>`,
            choices: ['Continue'],
            on_load: () => {
                window.scrollTo(0, 0);
            }
        };
    } else {
        instruction_trial = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: `
                <h1>Gaze Perception Task</h1>
                <p>In this task, you will see faces.</p>
                <p>Your job is to decide if the person is looking <b>at you</b> or <b>away from you</b>.</p>
                <p>Press <b>F</b> if they are looking at you (Yes).</p>
                <p>Press <b>J</b> if they are looking away (No).</p>
                <p>Press the <b>Space bar</b> or click <b>Start</b> to begin.</p>
                <p><button id="start-btn" class="jspsych-btn" style="margin-top: 20px;">Start</button></p>
            `,
            // Accept common space key identifiers across browsers
            choices: [' ', 'Spacebar', 'Space', 'space'],
            on_load: () => {
                window.scrollTo(0, 0);
                const btn = document.getElementById('start-btn');
                if (btn) {
                    btn.addEventListener('click', () => jsPsych.finishTrial());
                }
            }
        };
    }

    timeline.push(instruction_trial);

    // Trials per block logic
    let trials_per_block = 2;
    if (trials_per_block_override) {
        trials_per_block = trials_per_block_override;
    } else {
        // Fallback to URL params if not in config (for local testing)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('trials')) trials_per_block = parseInt(urlParams.get('trials'));
        else if (urlParams.has('test')) {
            const testVal = urlParams.get('test');
            trials_per_block = (testVal === 'true') ? 10 : parseInt(testVal);
        }
    }

    // --- Create Blocks ---
    models.forEach((currentModel, index) => {
        const block_number = index + 1;

        // Pre-block fixation (1 second)
        const pre_block_fixation = {
            type: jsPsychImageKeyboardResponse,
            stimulus: `${image_base_url}images/fixation_cross.svg`,
            choices: "NO_KEYS",
            trial_duration: 1000,
            data: { task: 'pre_block_fixation', block: block_number }
        };
        timeline.push(pre_block_fixation);

        const trial_stimuli = [];
        for (let i = 0; i < trials_per_block; i++) {
            const gaze = gazes[Math.floor(Math.random() * gazes.length)];
            trial_stimuli.push({
                stimulus: getImagePath(currentModel, gaze),
                model: currentModel,
                gaze: gaze
            });
        }

        const trial = {
            type: isTouchDevice ? jsPsychImageButtonResponse : jsPsychImageKeyboardResponse,
            stimulus: jsPsych.timelineVariable('stimulus'),
            prompt: isTouchDevice
                ? '<p style="font-size: 24px;">Looking at me?</p>'
                : '<div style="font-size: 32px; margin-top: 20px; line-height: 1.4;">Looking at me? F (Yes) or J (No)</div>',
            choices: isTouchDevice ? ['Yes', 'No'] : ['f', 'j'],
            stimulus_duration: 200,
            post_trial_gap: 500,
            response_ends_trial: true,
            css_classes: ['fixation-trial'], // Add class for fixation cross background
            data: {
                task: 'gaze_perception',
                model: jsPsych.timelineVariable('model'),
                gaze: jsPsych.timelineVariable('gaze'),
                block_number: block_number
            }
        };

        const trial_procedure = {
            timeline: [trial],
            timeline_variables: trial_stimuli,
            randomize_order: true
        };

        timeline.push(trial_procedure);

        // Rest screen (except after the last block)
        if (block_number < models.length) {
            let rest_trial;
            if (isTouchDevice) {
                rest_trial = {
                    type: jsPsychHtmlButtonResponse,
                    stimulus: `<h1>Block ${block_number} Finished</h1><p>Take a short break.</p>`,
                    choices: ['Continue']
                };
            } else {
                rest_trial = {
                    type: jsPsychHtmlKeyboardResponse,
                    stimulus: `<h1>Block ${block_number} Finished</h1><p>Take a short break.</p><p>Press the <b>Space bar</b> to continue.</p>`,
                    choices: [' ']
                };
            }
            timeline.push(rest_trial);
        }
    });

    // Run
    jsPsych.run(timeline);
};

// --- Qualtrics Message Listener ---
// Listen for configuration messages from Qualtrics parent
window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'QUALTRICS_CONFIG') {
        processConfig(event.data.config);
    }
});

function processConfig(config) {
    if (window.eyegazeStarted) return;
    window.eyegazeStarted = true;

    // Create display_stage if it doesn't exist
    if (!document.getElementById('display_stage')) {
        const target = document.getElementById('jspsych-target') || document.body;
        if (target.id !== 'display_stage') {
            target.id = 'display_stage';
        }
    }

    window.initEyegazeTask(config || {});
}

// Auto-run if local (not in Qualtrics)
// We check if we are in a standalone mode after a short delay
setTimeout(() => {
    if (!window.eyegazeStarted && !window.Qualtrics) {
        // Check for standalone index.html
        if (document.getElementById('jspsych-target')) {
            const urlParams = new URLSearchParams(window.location.search);
            processConfig({
                study: urlParams.get('study'),
                sub: urlParams.get('sub'),
                imageBaseUrl: '',
                trialsPerBlock: null
            });
        }
    }
}, 500);
