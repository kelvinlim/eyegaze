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
            const data = jsPsych.data.get();
            const json_data = data.json();

            // Check if in Iframe
            if (window.self !== window.top) {
                console.log("Sending data to parent window...");
                window.parent.postMessage({
                    type: 'EYEGAZE_COMPLETE',
                    json: json_data
                }, '*'); // You can restrict targetOrigin to your Qualtrics domain for security
            } else {
                // Local testing
                console.log("Local run finished.");
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
            stimulus: `
                <h1>Gaze Perception Task</h1>
                <p>In this task, you will see faces.</p>
                <p>Your job is to decide if the person is looking <b>at you</b> or <b>away from you</b>.</p>
                <p>Tap <b>Yes</b> if they are looking at you.</p>
                <p>Tap <b>No</b> if they are looking away.</p>
                <p>Tap "Start" to begin.</p>
            `,
            choices: ['Start']
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
                <p>Press the <b>Space bar</b> to begin.</p>
            `,
            choices: [' ']
        };
    }

    timeline.push(instruction_trial);

    // Trials per block logic
    let trials_per_block = 30;
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
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '<div style="font-size: 60px; line-height: 1; display: flex; align-items: center; justify-content: center; height: 100vh;">+</div>',
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

// Auto-run if local (not in Qualtrics)
// We check if 'display_stage' exists, if not we create it or assume body
if (!window.Qualtrics) {
    // Wait for DOM
    window.onload = function () {
        // Check if we are in the standalone index.html
        if (document.getElementById('jspsych-target')) {
            // Create display_stage for compatibility
            const target = document.getElementById('jspsych-target');
            target.id = 'display_stage'; // Rename it

            // Parse URL params for local config
            const urlParams = new URLSearchParams(window.location.search);
            window.initEyegazeTask({
                study: urlParams.get('study'),
                sub: urlParams.get('sub'),
                imageBaseUrl: '', // Local relative paths
                trialsPerBlock: null // Let function parse URL
            });
        }
    };
}
