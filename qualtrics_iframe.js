Qualtrics.SurveyEngine.addOnload(function () {
    // --- CONFIGURATION ---
    var task_url = "https://kelvinlim.github.io/eyegaze/";
    var study_id = "${e://Field/study_id}"; // Example of pulling from Qualtrics
    var subject_id = "${e://Field/subject_id}";
    // ---------------------

    var qthis = this;
    var container = qthis.getQuestionContainer();
    container.innerHTML = '';
    container.style.cssText = 'width: 100%; margin: 0; padding: 0; min-height: 600px; position: relative;';

    // 1. Add Loading UI
    var loadingDiv = document.createElement('div');
    loadingDiv.id = 'eyegaze-loading';
    loadingDiv.innerHTML = `
        <div style="text-align: center; padding: 50px 20px; font-family: sans-serif;">
            <h3>Loading Experiment...</h3>
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto;"></div>
        </div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    `;
    container.appendChild(loadingDiv);

    // 2. Add Iframe (hidden until loaded)
    var iframe = document.createElement('iframe');
    iframe.src = task_url;
    iframe.id = 'eyegaze-iframe';
    iframe.style.cssText = 'width: 100%; height: 80vh; min-height: 600px; border: none; display: none;';
    container.appendChild(iframe);

    // Hide Qualtrics Next button
    qthis.hideNextButton();

    // 3. Handshake and Initialization
    iframe.onload = function () {
        loadingDiv.style.display = 'none';
        iframe.style.display = 'block';

        // Send configuration to the task
        iframe.contentWindow.postMessage({
            type: 'QUALTRICS_CONFIG',
            config: {
                study: study_id,
                sub: subject_id
            }
        }, '*');
    };

    // 4. Message Listener for Task Completion
    window.addEventListener('message', function (event) {
        // Optional: origin check
        // if (event.origin !== "https://kelvinlim.github.io") return;

        var data = event.data;

        if (data && data.type === 'EYEGAZE_COMPLETE') {
            console.log("Task complete. Processing data...");

            // Save Raw Data
            Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_RawData', data.json);

            // Save Summary Stats (Individual fields)
            if (data.summary) {
                Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_TotalTrials', data.summary.total_trials);
                Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_AvgRT', data.summary.avg_rt);
                Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_Accuracy', data.summary.accuracy);
                Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_YesCount', data.summary.yes_count);
                Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_NoCount', data.summary.no_count);
            }

            Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_Completed', 'Yes');

            // Show completion feedback and advance
            container.innerHTML = '<div style="text-align:center; padding:50px; color: green;"><h3>✅ Task Completed</h3><p>Saving your data and moving to the next section...</p></div>';

            setTimeout(function () {
                qthis.clickNextButton();
            }, 1500);
        }
    });

    // 5. Timeout Protection (Error handling)
    setTimeout(function () {
        var loader = document.getElementById('eyegaze-loading');
        if (loader && loader.style.display !== 'none') {
            loader.innerHTML = '<div style="color: red; padding: 20px;">Error loading task. Please ensure you are connected to the internet and try refreshing.</div>';
            qthis.showNextButton();
        }
    }, 15000); // 15 seconds load timeout
});

Qualtrics.SurveyEngine.addOnReady(function () {
    /*Place your JavaScript here to run when the page is fully displayed*/
});

Qualtrics.SurveyEngine.addOnUnload(function () {
    /*Place your JavaScript here to run when the page is unloaded*/
});
