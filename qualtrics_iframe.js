/* EYEGAZE EXPERIMENT INTEGRATION v0.1.18 */
console.log("EYEGAZE: Script initialized (v0.1.18)");

Qualtrics.SurveyEngine.addOnload(function () {
    var qthis = this;
    var task_url = "https://kelvinlim.github.io/eyegaze/";
    var study_id = "${e://Field/study_id}";
    var subject_id = "${e://Field/subject_id}";

    // 0. Use QuestionBodyContainer for better isolation from Qualtrics core elements
    var body = qthis.getQuestionBodyContainer();
    if (!body) {
        console.error("EYEGAZE: Could not find QuestionBodyContainer. Falling back to QuestionContainer.");
        body = qthis.getQuestionContainer();
    }

    if (!body) {
        console.error("EYEGAZE: Fatal error - No container found.");
        return;
    }

    // Ensure parent has position: relative for absolute overlay
    body.style.position = 'relative';
    body.style.minHeight = '650px';
    body.style.height = '85vh';

    // 1. Create the Overlay (Absolute isolation)
    var overlay = document.createElement('div');
    overlay.id = 'eyegaze-overlay';
    overlay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 1000; display: flex; flex-direction: column; overflow: hidden; border: 1px solid #eee;';
    body.appendChild(overlay);

    // 2. High-Visibility Version Banner (for easy validation)
    var versionLabel = document.createElement('div');
    versionLabel.style.cssText = 'position: absolute; top: 5px; right: 10px; font-size: 10px; color: #ccc; z-index: 1001; pointer-events: none;';
    versionLabel.innerText = "v0.1.21-parent";
    overlay.appendChild(versionLabel);

    // 3. Loading UI
    var loadingDiv = document.createElement('div');
    loadingDiv.id = 'eyegaze-loading';
    loadingDiv.innerHTML = `
        <div style="text-align: center; padding: 100px 20px; font-family: sans-serif;">
            <p style="font-size: 12px; color: #999; margin-bottom: 20px;">v0.1.21 ready</p>
            <h3 style="color: #666;">Loading Eye Gaze Task...</h3>
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #7a0019; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto;"></div>
        </div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    `;
    overlay.appendChild(loadingDiv);

    // 4. Add Iframe
    var iframe = document.createElement('iframe');
    iframe.src = task_url;
    iframe.id = 'eyegaze-iframe';
    iframe.style.cssText = 'width: 100%; flex-grow: 1; border: none; display: none;';
    overlay.appendChild(iframe);

    // Hide Next Button
    qthis.hideNextButton();

    // 5. Handshake
    iframe.onload = function () {
        loadingDiv.style.display = 'none';
        iframe.style.display = 'block';
        iframe.contentWindow.postMessage({
            type: 'QUALTRICS_CONFIG',
            config: { study: study_id, sub: subject_id }
        }, '*');
    };

    // 6. Completion Listener
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
            console.log(`EYEGAZE: Complete received (v0.1.18). Size: ${data.size || 'unknown'}`);

            try {
                var fullResults = {
                    version: "v0.1.21",
                    summary: data.summary || {},
                    trials: typeof data.json === 'string' ? JSON.parse(data.json) : (data.json || []),
                    metadata: { study: study_id, subject: subject_id, timestamp: new Date().toISOString() }
                };

                var consolidatedString = JSON.stringify(fullResults);
                if (consolidatedString.length > 15000) {
                    fullResults.trials = "[TRUNCATED]";
                    consolidatedString = JSON.stringify(fullResults);
                }

                // Final safety check for Qualtrics API
                if (Qualtrics && Qualtrics.SurveyEngine) {
                    Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_Data', consolidatedString);
                    Qualtrics.SurveyEngine.setEmbeddedData('EYEGAZE_Completed', 'Yes');
                    console.log("EYEGAZE: Data saved.");
                }

                overlay.innerHTML = '<div style="text-align:center; padding:100px 20px; color: #7a0019; font-family: sans-serif;"><h3>✅ Task Completed</h3><p>Saving your data...</p></div>';
                qthis.showNextButton();
                setTimeout(function () { qthis.clickNextButton(); }, 3000);

            } catch (err) {
                console.error("EYEGAZE Error:", err);
                qthis.showNextButton();
            }
        }
    });

    // 7. Timeout
    setTimeout(function () {
        var loader = document.getElementById('eyegaze-loading');
        if (loader && loader.style.display !== 'none') {
            loader.innerHTML = '<p style="color:red; text-align:center;">Load Timeout. Please refresh.</p>';
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
