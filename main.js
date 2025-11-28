// This function will be called when the DOM is ready
window.onload = function () {

    // Check for touch capability
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    console.log(isTouchDevice ? 'Touch device detected.' : 'Keyboard device detected.');

    // Initialize jsPsych
    const jsPsych = initJsPsych({
        // When the experiment is finished, display the data in a format
        // that Qualtrics can easily save.
        on_finish: function () {
            // Check if running inside an iframe (Qualtrics) OR forced via URL
            const urlParams = new URLSearchParams(window.location.search);
            const isQualtrics = (window.self !== window.top) || (urlParams.get('qualtrics') === 'true');

            if (isQualtrics) {
                // Get data as CSV
                const csvData = jsPsych.data.get().csv();
                console.log("Sending data to Qualtrics...");
                // Send data to parent window
                window.parent.postMessage({
                    experiment_data: csvData,
                    source: 'eyegaze_task'
                }, '*');
            } else {
                // Local testing
                jsPsych.data.displayData();
            }
        }
    });

    // Capture URL parameters for data
    const urlParams = new URLSearchParams(window.location.search);
    const study_id = urlParams.get('study');
    const subject_id = urlParams.get('sub');

    if (study_id) {
        jsPsych.data.addProperties({ study: study_id });
    }
    if (subject_id) {
        jsPsych.data.addProperties({ sub: subject_id });
    }

    // --- Stimuli Configuration ---
    // Using a single model for testing, as in your last version
    //const models = ['Dean', 'Peter', 'Raymond', 'Glo', 'Mary', 'Oli'];
    const models = ['Oli'];
    const gazes = ['Center', 'L5', 'R5', 'L10', 'R10', 'L15', 'R15', 'L20', 'R20', 'L25', 'R25', 'L30', 'R30'];
    const image_path = 'images/'; // Path to your images folder

    // Generate all possible image paths
    let all_image_files = ['images/fixation_cross.svg']; // Add fixation cross
    for (const model of models) {
        for (const gaze of gazes) {
            all_image_files.push(`${image_path}${model}_${gaze}.png`);
        }
    }

    // --- Main Timeline ---
    const timeline = [];

    // --- Preload all images ---
    // This is crucial for smooth presentation and accurate timing.
    const preload = {
        type: jsPsychPreload,
        images: all_image_files,
        message: 'Loading resources, please wait...'
    };
    timeline.push(preload);


    // --- Block and Trial Creation Loop ---
    // Loop through each model to create one block per model.
    models.forEach((model, block_index) => {

        // 1. Instruction Screen
        let instructions;
        if (isTouchDevice) {
            instructions = {
                type: jsPsychHtmlButtonResponse,
                stimulus: '<h2>Do you feel as if the person in the picture is looking at you?</h2><p>Tap "Yes" or "No" during the trials.</p>',
                choices: ['Tap here to continue'],
                response_ends_trial: true
            };
        } else {
            instructions = {
                type: jsPsychHtmlKeyboardResponse,
                stimulus: '<h2>Do you feel as if the person in the picture is looking at you?</h2> <h2>Press F for Yes and J for No.</h2><p>Press G to continue.</p>',
                choices: ['g'],
                response_ends_trial: true
            };
        }
        timeline.push(instructions);

        // 2. Trials Section

        // Determine number of trials from URL
        const urlParams = new URLSearchParams(window.location.search);
        let trials_per_block = 30; // Default

        if (urlParams.has('trials')) {
            trials_per_block = parseInt(urlParams.get('trials'));
        } else if (urlParams.has('test')) {
            const testVal = urlParams.get('test');
            if (testVal === 'true') {
                trials_per_block = 10;
            } else if (!isNaN(parseInt(testVal))) {
                trials_per_block = parseInt(testVal);
            }
        }
        console.log(`Trials per block: ${trials_per_block}`);

        // Generate the 13 image paths for the current model
        const block_images = gazes.map(gaze => `${image_path}${model}_${gaze}.png`);

        // Create trials by randomly sampling *with replacement*
        const trial_stimuli = jsPsych.randomization.sampleWithReplacement(block_images, trials_per_block);

        // Create timeline variables from the sampled stimuli
        const timeline_variables = trial_stimuli.map(stim => ({ stimulus: stim }));

        // Define the single trial structure
        let trial;
        if (isTouchDevice) {
            trial = {
                type: jsPsychImageButtonResponse, // Use the button plugin
                stimulus: jsPsych.timelineVariable('stimulus'),
                prompt: '<p style="font-size: 24px;">Looking at me?</p>',
                choices: ['Yes', 'No'], // Button labels
                render_on_canvas: false,
                stimulus_duration: 200,      // Image shown for 200ms
                trial_duration: 2000,        // 200ms stimulus + 1800ms fixation
                post_trial_gap: 500,         // Blank screen for 500ms after trial ends
                response_ends_trial: true,   // End the trial when a button is pressed
                css_classes: ['fixation-trial'], // Show fixation cross in background
                data: {
                    task: 'gaze_perception',
                    model: model,
                    block_number: block_index + 1,
                    image_file: jsPsych.timelineVariable('stimulus'),
                    input_type: 'touch'
                }
            };
        } else {
            trial = {
                type: jsPsychImageKeyboardResponse,
                stimulus: jsPsych.timelineVariable('stimulus'),
                prompt: '<div style="font-size: 48px;">Looking at me? f or j</div>', // f / j prompt
                choices: ['f', 'j'], // 'f' for Yes, 'j' for No
                stimulus_duration: 200,    // Image shown for 200ms
                trial_duration: 2000,      // 200ms stimulus + 1800ms fixation
                post_trial_gap: 500,       // Blank screen for 500ms
                response_ends_trial: true, // UPDATED: End trial on response
                css_classes: ['fixation-trial'], // Show fixation cross in background
                data: {
                    task: 'gaze_perception',
                    model: model,
                    block_number: block_index + 1,
                    image_file: jsPsych.timelineVariable('stimulus'),
                    input_type: 'keyboard'
                }
            };
        }

        // Create the full block of trials using the timeline variables
        const trial_block = {
            timeline: [trial],
            timeline_variables: timeline_variables,
            randomize_order: false // Already randomized by sampling above
        };
        timeline.push(trial_block);

        // 3. Rest Screen
        let rest_screen;
        if (isTouchDevice) {
            rest_screen = {
                type: jsPsychHtmlKeyboardResponse, // Note: using keyboard response for rest might be tricky on mobile if no buttons are shown, but original code used keyboard response for rest in mobile file too? 
                // Wait, original mobile file used jsPsychHtmlKeyboardResponse for rest screen?
                // Let's check the original mobile file content.
                // Line 100 in main_mobile.js: type: jsPsychHtmlKeyboardResponse
                // This might be a bug in the original code if it expects a tap, but maybe it just times out?
                // trial_duration is 1000. So it just waits.
                stimulus: '<p>End of block. Please take a short rest.</p>',
                trial_duration: 1000,
                response_ends_trial: false
            };
        } else {
            rest_screen = {
                type: jsPsychHtmlKeyboardResponse,
                stimulus: '<p>End of block. Please take a short rest.</p>',
                trial_duration: 1000,
                response_ends_trial: false
            };
        }
        // Since they are identical, we can just use one.
        timeline.push(rest_screen);

    }); // End of block creation loop

    // --- Run the Experiment ---
    jsPsych.run(timeline);

}; // End of window.onload function
