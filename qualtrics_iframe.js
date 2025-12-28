Qualtrics.SurveyEngine.addOnload(function () {
    // --- CONFIGURATION ---
    var task_url = "https://kelvinlim.github.io/eyegaze/";
    var study_id = "${e://Field/study_id}";
    var subject_id = "${e://Field/subject_id}";
    // ---------------------

    var qthis = this;
    var container = qthis.getQuestionContainer();

    // 0. Ensure container has height context for the overlay (fixes mobile cutoff)
    container.style.position = 'relative';
    container.style.minHeight = '650px'; // Minimum height for the task
    container.style.height = '85vh';     // Dynamic height for larger screens

    // 0. Use an overlay to avoid touching the Qualtrics DOM (prevents 'alt' property error)
    var overlay = document.createElement('div');
    overlay.id = 'eyegaze-overlay';
    overlay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 1000; display: flex; flex-direction: column; overflow: hidden;';
    container.appendChild(overlay);

    // 1. Add Loading UI
    var loadingDiv = document.createElement('div');
    loadingDiv.id = 'eyegaze-loading';
    loadingDiv.innerHTML = `
        <div style="text-align: center; padding: 100px 20px; font-family: sans-serif;">
            <h3 style="color: #666;">Loading Eye Gaze Task...</h3>
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #7a0019; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto;"></div>
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
            console.log(`Qualtrics Parent: EYEGAZE_COMPLETE received (v0.1.17). Payload size: ${data.size || 'unknown'} chars.`);

            try {
                // Consolidate all data into a single object for easier Qualtrics management
                var fullResults = {
                    version: "v0.1.17",
                    summary: data.summary || {},
                    trials: typeof data.json === 'string' ? JSON.parse(data.json) : (data.json || []),
                    metadata: {
                        study: study_id,
                        subject: subject_id,
                        timestamp: new Date().toISOString()
                    }
                };

                var consolidatedString = JSON.stringify(fullResults);

                // Character limit protection for Qualtrics (~15-20KB safe limit)
                if (consolidatedString.length > 15000) {
                    console.warn("Qualtrics Parent: Data exceeds safe limit. Storing summary only.");
                    fullResults.trials = "[TRUNCATED DUE TO SIZE]";
                    consolidatedString = JSON.stringify(fullResults);
                }

                // Save EVERYTHING to one single field
                Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_Data', consolidatedString);
                Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_Completed', 'Yes');

                console.log("Qualtrics Parent: All data consolidated into EYEGAZE_Data.");

                // Show completion feedback
                overlay.innerHTML = '<div style="text-align:center; padding:100px 20px; color: #7a0019; font-family: sans-serif;"><h3>✅ Task Completed</h3><p>Saving your data...</p><p style="font-size: 0.9em; color: #666;">If the survey does not advance automatically, click "Next".</p></div>';

                qthis.showNextButton();

                setTimeout(function () {
                    qthis.clickNextButton();
                }, 3000);

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
            loader.innerHTML = '<div style="color: red; padding: 20px; text-align: center; font-family: sans-serif;"><h4>Error loading task</h4><p>Please ensure you are connected to the internet and try refreshing.</p></div>';
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
