// This function will be called when the DOM is ready
window.onload = function () {

    // Define the initialization function globally
    window.initEyegazeTask = function (config) {
        const study_id = config.study || 'default_study';
        const subject_id = config.sub || 'default_sub';
        const image_base_url = config.imageBaseUrl || '';
        const trials_per_block_override = config.trialsPerBlock || null;

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
                                // Click next button (assumes qthis is available or we find the button)
                                // In direct injection, we often pass the 'this' context or find the button
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
