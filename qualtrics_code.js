Qualtrics.SurveyEngine.addOnload(function () {
    /*Place your JavaScript here to run when the page loads*/
    var qthis = this;

    // Hide buttons
    qthis.hideNextButton();

    // --- CONFIGURATION ---
    // URL of your hosted experiment folder (must end with /)
    var repo_url = "https://kelvinlim.github.io/eyegaze/";
    // ---------------------

    // Define resources to load
    // Note: We are using jsPsych 8.0.0 from CDN for plugins, but loading main.js from repo
    var requiredResources = [
        "https://unpkg.com/jspsych@8.0.0",
        "https://unpkg.com/@jspsych/plugin-html-button-response@2.0.0",
        "https://unpkg.com/@jspsych/plugin-image-button-response@2.0.0",
        "https://unpkg.com/@jspsych/plugin-image-keyboard-response@2.0.0",
        "https://unpkg.com/@jspsych/plugin-html-keyboard-response@2.0.0",
        "https://unpkg.com/@jspsych/plugin-preload@2.0.0",
        "https://unpkg.com/jspsych@8.0.0/css/jspsych.css",
        repo_url + "main.js" // Load our experiment script last
    ];

    function loadScript(idx) {
        console.log("Loading ", requiredResources[idx]);
        var url = requiredResources[idx];

        if (url.endsWith(".css")) {
            jQuery("head").append("<link rel='stylesheet' type='text/css' href='" + url + "'>");
            if ((idx + 1) < requiredResources.length) {
                loadScript(idx + 1);
            } else {
                initExp();
            }
        } else {
            jQuery.getScript(url, function () {
                if ((idx + 1) < requiredResources.length) {
                    loadScript(idx + 1);
                } else {
                    initExp();
                }
            });
        }
    }

    // Check if running in Qualtrics and not in preview mode (optional check)
    if (window.Qualtrics) {
        loadScript(0);
    }

    // Create display stage
    jQuery("<div id='display_stage_background'></div>").appendTo('body');
    jQuery("<div id='display_stage'></div>").appendTo('body');

    // Add CSS for display stage
    jQuery("<style>")
        .prop("type", "text/css")
        .html(`
            #display_stage_background {
                position: fixed;
                left: 0;
                top: 0;
                min-height: 100%;
                width: 100%;
                z-index: 10;
                background-color: white;
            }
            #display_stage {
                position: fixed;
                left: 0;
                top: 0;
                min-height: 100%;
                width: 100%;
                z-index: 11;
            }
            .fixation-trial {
                background-image: url('${repo_url}images/fixation_cross.svg');
                background-repeat: no-repeat;
                background-position: center;
                background-size: 100px 100px; /* Adjust size as needed */
            }
        `)
        .appendTo("head");

    function initExp() {
        // Get Qualtrics data
        var response_id = "${e://Field/ResponseID}";
        var study_id = "${e://Field/StudyID}";

        // Run the experiment
        // initEyegazeTask is defined in main.js
        if (window.initEyegazeTask) {
            window.initEyegazeTask({
                study: study_id,
                sub: response_id,
                imageBaseUrl: repo_url,
                trialsPerBlock: 30 // Set default or read from Embedded Data
            });
        } else {
            console.error("initEyegazeTask not found!");
        }
    }
});

Qualtrics.SurveyEngine.addOnReady(function () {
    /*Place your JavaScript here to run when the page is fully displayed*/
});

Qualtrics.SurveyEngine.addOnUnload(function () {
    /*Place your JavaScript here to run when the page is unloaded*/
});
