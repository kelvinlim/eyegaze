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
    // Loop through each model to create one block per model (6 blocks total).
    models.forEach((model, block_index) => {

        // 1. Instruction Screen (3000ms)
        const instructions = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: '<h2>Do you feel as if the person in the picture is looking at you?</h2> <h2>Press Y for Yes and N for No.</h2><p>Press G to continue.</p>',
            choices: ['g'],
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

        // Define the single trial structure
        const trial = {
            type: jsPsychImageKeyboardResponse,
            stimulus: jsPsych.timelineVariable('stimulus'),
            prompt: '<div style="font-size: 48px;">Looking at me? y or n</div>', // y / n prompt
            choices: ['y', 'n'], // 'y' for Yes, 'n' for No

            // --- Timing Breakdown (Total Trial = 2500ms) ---
            stimulus_duration: 200,    // Image shown for 200ms
            trial_duration: 2000,      // Image (200ms) + Fixation (1800ms)
            post_trial_gap: 500,       // Blank screen for 500ms

            // Allow response anytime but don't end the trial early
            response_ends_trial: false,

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

        // 3. Rest Screen (1000ms)
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