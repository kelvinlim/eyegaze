// This function will be called when the DOM is ready
window.onload = function() {

    // Initialize jsPsych
    const jsPsych = initJsPsych({
        // When the experiment is finished, display the data in a format
        // that Qualtrics can easily save.
        on_finish: function() {
            jsPsych.data.displayData();
        }
    });

    // --- Stimuli Configuration ---
    // Using a single model for testing, as in your last version
    //const models = ['Dean', 'Peter', 'Raymond', 'Glo', 'Mary', 'Oli'];
    const models = ['Oli'];
    const gazes = ['Center', 'L5', 'R5', 'L10', 'R10', 'L15', 'R15', 'L20', 'R20', 'L25', 'R25', 'L30', 'R30'];
    const image_path = 'images/'; // Path to your images folder

    // Generate all possible image paths
    let all_image_files = [];
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

        // 1. Instruction Screen (UPDATED for touch)
        const instructions = {
            type: jsPsychHtmlButtonResponse,
            stimulus: '<h2>Do you feel as if the person in the picture is looking at you?</h2><p>Tap "Yes" or "No" during the trials.</p>',
            choices: ['Tap here to continue'],
            response_ends_trial: true
        };
        timeline.push(instructions);

        // 2. Trials Section (30 trials per block)

        // Generate the 13 image paths for the current model
        const block_images = gazes.map(gaze => `${image_path}${model}_${gaze}.png`);

        // Create 30 trials by randomly sampling *with replacement* from the 13 images
        const trial_stimuli = jsPsych.randomization.sampleWithReplacement(block_images, 30);

        // Create timeline variables from the sampled stimuli
        const timeline_variables = trial_stimuli.map(stim => ({ stimulus: stim }));

        // Define the single trial structure (UPDATED for touch)
        const trial = {
            type: jsPsychImageButtonResponse, // Use the button plugin
            stimulus: jsPsych.timelineVariable('stimulus'),
            prompt: '<div style="font-size: 48px;">+</div>', // Fixation cross appears with buttons
            choices: ['Yes', 'No'], // Button labels

            render_on_canvas: false,

            // --- Timing Breakdown ---
            stimulus_duration: 200,      // Image shown for 200ms
            trial_duration: 2500,        // Full trial duration including response time
            post_trial_gap: 500,         // Blank screen for 500ms after trial ends

            // End the trial when a button is pressed
            response_ends_trial: true, 

            // Add extra data to each trial for easier analysis
            data: {
                task: 'gaze_perception',
                model: model,
                block_number: block_index + 1,
                image_file: jsPsych.timelineVariable('stimulus')
            }
        };

        // Create the full block of trials using the timeline variables
        const trial_block = {
            timeline: [trial],
            timeline_variables: timeline_variables,
            randomize_order: false // Already randomized by sampling above
        };
        timeline.push(trial_block);

        // 3. Rest Screen (No changes needed)
        const rest_screen = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '<p>End of block. Please take a short rest.</p>',
            trial_duration: 1000,
            response_ends_trial: false
        };
        timeline.push(rest_screen);

    }); // End of block creation loop

    // --- Run the Experiment ---
    jsPsych.run(timeline);

}; // End of window.onload function