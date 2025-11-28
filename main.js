// Define the initialization function globally
window.initEyegazeTask = function (config) {
    const study_id = config.study || 'default_study';
    const subject_id = config.sub || 'default_sub';
    const image_base_url = config.imageBaseUrl || '';
    const trials_per_block_override = config.trialsPerBlock || null;

    // Check for touch capability
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // Initialize jsPsych
    const jsPsych = initJsPsych({
        display_element: 'display_stage', // Target specific div
        on_finish: function () {
            // Check if running in Qualtrics (Direct Injection)
            if (window.Qualtrics && window.Qualtrics.SurveyEngine) {
                const csvData = jsPsych.data.get().csv();
                console.log("Saving data to Qualtrics (Direct)...");

                // Use setJSEmbeddedData if available
                if (Qualtrics.SurveyEngine.setJSEmbeddedData) {
                    Qualtrics.SurveyEngine.setJSEmbeddedData('experiment_data', csvData)
                        .then(() => {
                            console.log("Data saved.");
                            // Click next button
                            jQuery('#NextButton').click();
                        })
                        .catch((err) => {
                            console.error("Error saving:", err);
                            jQuery('#NextButton').click();
                        });
                } else {
                    Qualtrics.SurveyEngine.setEmbeddedData('experiment_data', csvData);
                    jQuery('#NextButton').click();
                }
            } else {
                // Local testing
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
    const gazes = ['direct', 'averted'];

    // Helper to build image path
    function getImagePath(model, gaze) {
        return `${image_base_url}images/${model}_${gaze}.jpg`;
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
    timeline.push({
        type: jsPsychHtmlButtonResponse,
        stimulus: `
            <h1>Gaze Perception Task</h1>
            <p>In this task, you will see faces.</p>
            <p>Your job is to decide if the person is looking <b>at you</b> or <b>away from you</b>.</p>
            <p>Click "Start" to begin.</p>
        `,
        choices: ['Start']
    });

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

    // Create trials
    const trial_stimuli = [];
    for (let i = 0; i < trials_per_block; i++) {
        const model = models[Math.floor(Math.random() * models.length)];
        const gaze = gazes[Math.floor(Math.random() * gazes.length)];
        trial_stimuli.push({
            stimulus: getImagePath(model, gaze),
            model: model,
            gaze: gaze
        });
    }

    const trial = {
        type: isTouchDevice ? jsPsychImageButtonResponse : jsPsychImageKeyboardResponse,
        stimulus: jsPsych.timelineVariable('stimulus'),
        prompt: isTouchDevice
            ? '<p style="font-size: 24px;">Looking at me?</p>'
            : '<div style="font-size: 48px;">Looking at me? F (Yes) or J (No)</div>',
        choices: isTouchDevice ? ['Yes', 'No'] : ['f', 'j'],
        stimulus_duration: 200,
        trial_duration: 2000, // 200ms stim + 1800ms fixation
        post_trial_gap: 500,
        response_ends_trial: true,
        css_classes: ['fixation-trial'], // Add class for fixation cross background
        data: {
            task: 'gaze_perception',
            model: jsPsych.timelineVariable('model'),
            gaze: jsPsych.timelineVariable('gaze'),
            block_number: 1
        }
    };

    const trial_procedure = {
        timeline: [trial],
        timeline_variables: trial_stimuli,
        randomize_order: true
    };

    timeline.push(trial_procedure);

    // Rest screen
    timeline.push({
        type: jsPsychHtmlButtonResponse,
        stimulus: '<h1>Block Finished</h1><p>Take a short break.</p>',
        choices: ['Continue']
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
