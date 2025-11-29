Qualtrics.SurveyEngine.addOnload(function () {
    // --- CONFIGURATION ---
    // URL of your hosted experiment (must end with / or be the full path to index.html)
    var task_url = "https://kelvinlim.github.io/eyegaze/";
    // ---------------------

    var qthis = this;
    var container = qthis.getQuestionContainer();

    // Clear container and add Iframe
    container.innerHTML = '';
    container.style.cssText = 'width: 100%; margin: 0; padding: 0;';

    var iframe = document.createElement('iframe');
    iframe.src = task_url;
    iframe.id = 'eyegaze-iframe';
    iframe.style.cssText = 'width: 100%; min-height: 600px; border: none; overflow: hidden;';
    container.appendChild(iframe);

    // Hide Next button
    qthis.hideNextButton();

    // Listen for messages from the iframe
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

    eventer(messageEvent, function (e) {
        // Security check: ensure message comes from your experiment domain
        // if (e.origin !== "https://kelvinlim.github.io") return; 

        var data = e.data;

        if (data && data.type === 'EYEGAZE_COMPLETE') {
            console.log("Eyegaze task complete. Saving data...");

            var experiment_data = data.json; // JSON string of data

            // Save to Qualtrics Embedded Data
            // Make sure 'experiment_data' is defined in Survey Flow
            Qualtrics.SurveyEngine.setEmbeddedData('experiment_data', experiment_data);

            // Also save specific fields if needed
            // Qualtrics.SurveyEngine.setEmbeddedData('accuracy', data.accuracy);

            // Show completion message or click next
            container.innerHTML = '<div style="text-align:center; padding:20px;">Task completed. Proceeding...</div>';
            qthis.clickNextButton();
        }
    }, false);
});

Qualtrics.SurveyEngine.addOnReady(function () {
    /*Place your JavaScript here to run when the page is fully displayed*/
});

Qualtrics.SurveyEngine.addOnUnload(function () {
    /*Place your JavaScript here to run when the page is unloaded*/
});
