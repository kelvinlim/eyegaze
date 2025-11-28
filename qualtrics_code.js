Qualtrics.SurveyEngine.addOnload(function () {
    // Hide the Next button until the task is complete
    this.hideNextButton();

    // --- CONFIGURATION ---
    // URL of your hosted experiment (e.g., GitHub Pages URL)
    // IMPORTANT: Change this to your actual URL
    var experiment_url = "https://kelvinlim.github.io/eyegaze/index.html?qualtrics=true&test=6";
    // ---------------------

    // Get the container where the iframe will be placed
    var q_container = this.getQuestionContainer();

    // Create the iframe
    var iframe = document.createElement('iframe');
    iframe.style.width = "100%";
    iframe.style.height = "800px"; // Adjust height as needed
    iframe.style.border = "none";

    // Pass Qualtrics ResponseID as 'sub' parameter
    // You can also pass other embedded data here if needed
    var response_id = "${e://Field/ResponseID}";
    var study_id = "${e://Field/StudyID}"; // Example: if you have a StudyID field

    // Construct the full URL with parameters
    // Check if the URL already has parameters
    var separator = experiment_url.indexOf('?') > -1 ? '&' : '?';

    // Note: We use encodeURIComponent to ensure parameters are safe
    var full_url = experiment_url + separator + "sub=" + encodeURIComponent(response_id) + "&qualtrics=true";

    if (study_id) {
        full_url += "&study=" + encodeURIComponent(study_id);
    }

    iframe.src = full_url;

    // Append iframe to the question container
    q_container.appendChild(iframe);

    // Listen for messages from the iframe
    var that = this;
    window.addEventListener('message', function (event) {
        // Security check: verify the origin if possible (optional but recommended)
        // if (event.origin !== "https://kelvinlim.github.io") return;

        // Check if the message is from our experiment
        if (event.data && event.data.source === 'eyegaze_task') {
            var experiment_data = event.data.experiment_data;

            // Save data to Embedded Data field
            // Use setJSEmbeddedData if available (Async), otherwise setEmbeddedData (Sync)
            if (Qualtrics.SurveyEngine.setJSEmbeddedData) {
                Qualtrics.SurveyEngine.setJSEmbeddedData('experiment_data', experiment_data).then(function () {
                    console.log("Data saved successfully.");
                    that.showNextButton();
                    that.clickNextButton();
                }).catch(function (err) {
                    console.error("Error saving data:", err);
                    // Attempt to proceed anyway or alert user?
                    // Proceeding is usually safer to avoid getting stuck
                    that.showNextButton();
                    that.clickNextButton();
                });
            } else {
                Qualtrics.SurveyEngine.setEmbeddedData('experiment_data', experiment_data);
                that.showNextButton();
                that.clickNextButton();
            }
        }
    });
});

Qualtrics.SurveyEngine.addOnReady(function () {
    /*Place your JavaScript here to run when the page is fully displayed*/
});

Qualtrics.SurveyEngine.addOnUnload(function () {
    /*Place your JavaScript here to run when the page is unloaded*/
});
