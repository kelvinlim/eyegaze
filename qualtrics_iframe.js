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
        console.log("Qualtrics Parent: Message received from origin:", event.origin);

        var data = event.data;

        // Handle case where message might be a stringified JSON
        if (typeof data === 'string') {
            try {
                var parsed = JSON.parse(data);
                if (parsed && parsed.type) {
                    data = parsed;
                    console.log("Qualtrics Parent: Parsed stringified message.");
                }
            } catch (e) {
                // Not JSON, ignore
            }
        }

        if (data && data.type === 'EYEGAZE_COMPLETE') {
            console.log("Qualtrics Parent: EYEGAZE_COMPLETE received.");

            try {
                // 1. Save Raw Data
                var rawJson = typeof data.json === 'string' ? data.json : JSON.stringify(data.json || {});

                // Qualtrics has a ~20KB limit for embedded data in some contexts
                if (rawJson.length > 15000) {
                    console.warn("Qualtrics Parent: Raw data is large (" + rawJson.length + " chars). Truncating for safety.");
                    rawJson = rawJson.substring(0, 15000) + "... [TRUNCATED]";
                }

                Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_RawData', rawJson);
                console.log("Qualtrics Parent: Saved EYEGAZE_RawData (length: " + rawJson.length + ")");

                // 2. Save Summary Stats (Explicitly convert to strings)
                if (data.summary) {
                    Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_TotalTrials', String(data.summary.total_trials || 0));
                    Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_AvgRT', String(data.summary.avg_rt || 0));
                    Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_Accuracy', String(data.summary.accuracy || 0));
                    Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_YesCount', String(data.summary.yes_count || 0));
                    Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_NoCount', String(data.summary.no_count || 0));
                    console.log("Qualtrics Parent: Saved summary stats:", data.summary);
                }

                Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_Completed', 'Yes');
                console.log("Qualtrics Parent: Data saving process finished.");

                // Show completion feedback and advance
                container.innerHTML = '<div style="text-align:center; padding:50px; color: green; font-family: sans-serif;"><h3>✅ Task Completed</h3><p>Saving your data and moving to the next section...</p></div>';

                setTimeout(function () {
                    console.log("Qualtrics Parent: Clicking next button.");
                    qthis.clickNextButton();
                }, 2000);

            } catch (err) {
                console.error("Qualtrics Parent: Error processing completion message:", err);
                Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_Completed', 'Error');
                container.innerHTML = '<div style="text-align:center; padding:50px; color: red; font-family: sans-serif;"><h3>⚠️ Coordination Error</h3><p>The task completed but there was an error saving data. Please proceed.</p></div>';
                qthis.showNextButton();
            }
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
