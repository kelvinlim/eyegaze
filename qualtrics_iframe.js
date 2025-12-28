Qualtrics.SurveyEngine.addOnload(function () {
    // --- CONFIGURATION ---
    var task_url = "https://kelvinlim.github.io/eyegaze/";
    var study_id = "${e://Field/study_id}";
    var subject_id = "${e://Field/subject_id}";
    // ---------------------

    var qthis = this;
    var container = qthis.getQuestionContainer();

    // 0. Use an overlay to avoid touching the Qualtrics DOM (prevents 'alt' property error)
    var overlay = document.createElement('div');
    overlay.id = 'eyegaze-overlay';
    overlay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 1000; display: flex; flex-direction: column;';
    container.style.position = 'relative'; // Ensure container is relative for absolute overlay
    container.appendChild(overlay);

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
    overlay.appendChild(loadingDiv);

    // 2. Add Iframe (hidden until loaded)
    var iframe = document.createElement('iframe');
    iframe.src = task_url;
    iframe.id = 'eyegaze-iframe';
    iframe.style.cssText = 'width: 100%; flex-grow: 1; border: none; display: none;';
    overlay.appendChild(iframe);

    // Hide Qualtrics Next button
    qthis.hideNextButton();

    // 3. Handshake and Initialization
    iframe.onload = function () {
        loadingDiv.style.display = 'none';
        iframe.style.display = 'block';

        iframe.contentWindow.postMessage({
            type: 'QUALTRICS_CONFIG',
            config: {
                study: study_id,
                sub: subject_id
            }
        }, '*');
    };

    // 4. Message Listener for Task Completion
    var hasProcessedCompletion = false;

    window.addEventListener('message', function (event) {
        if (hasProcessedCompletion) return;

        var data = event.data;
        if (typeof data === 'string') {
            try {
                var parsed = JSON.parse(data);
                if (parsed && parsed.type) { data = parsed; }
            } catch (e) { }
        }

        if (data && data.type === 'EYEGAZE_COMPLETE') {
            hasProcessedCompletion = true;
            console.log("Qualtrics Parent: EYEGAZE_COMPLETE received (v0.1.12).");

            try {
                // 1. Save Raw Data (using standard setEmbeddedData for Survey Flow compatibility)
                var rawJson = typeof data.json === 'string' ? data.json : JSON.stringify(data.json || {});
                if (rawJson.length > 8000) {
                    rawJson = rawJson.substring(0, 8000) + "... [TRUNCATED]";
                }

                Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_RawData', rawJson);

                // 2. Save Summary Stats
                if (data.summary) {
                    Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_TotalTrials', String(data.summary.total_trials || 0));
                    Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_AvgRT', String(data.summary.avg_rt || 0));
                    Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_Accuracy', String(data.summary.accuracy || 0));
                    Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_YesCount', String(data.summary.yes_count || 0));
                    Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_NoCount', String(data.summary.no_count || 0));
                }

                Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_Completed', 'Yes');
                console.log("Qualtrics Parent: Data saved via setEmbeddedData.");

                // Show completion feedback
                overlay.innerHTML = '<div style="text-align:center; padding:50px; color: green; font-family: sans-serif;"><h3>✅ Task Completed</h3><p>Saving your data...</p><p>If the survey does not advance automatically, click "Next".</p></div>';

                // Show manual next button as a fallback
                qthis.showNextButton();

                setTimeout(function () {
                    console.log("Qualtrics Parent: Attempting manual advance.");
                    qthis.clickNextButton();
                }, 3000); // 3 second delay to ensure data is processed

            } catch (err) {
                console.error("Qualtrics Parent Error:", err);
                overlay.innerHTML = '<div style="text-align:center; padding:50px; color: red; font-family: sans-serif;"><h3>⚠️ Coordination Error</h3><p>The task completed but there was an error saving data.</p></div>';
                qthis.showNextButton();
            }
        }
    });

    // 5. Timeout Protection
    setTimeout(function () {
        var loader = document.getElementById('eyegaze-loading');
        if (loader && loader.parentElement === overlay && loader.style.display !== 'none') {
            loader.innerHTML = '<div style="color: red; padding: 20px;">Error loading task. Please ensure you are connected to the internet and try refreshing.</div>';
            qthis.showNextButton();
        }
    }, 15000);
});

Qualtrics.SurveyEngine.addOnReady(function () {
    /*Place your JavaScript here to run when the page is fully displayed*/
});

Qualtrics.SurveyEngine.addOnUnload(function () {
    /*Place your JavaScript here to run when the page is unloaded*/
});
