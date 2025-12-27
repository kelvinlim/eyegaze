/**
 * FULL DIAGNOSTIC Qualtrics Integration for TCIP Task
 * 
 * This comprehensive diagnostic version will help us identify exactly why the task isn't displaying.
 * It includes detailed logging, visibility checks, and step-by-step status updates.
 */

Qualtrics.SurveyEngine.addOnload(function() {
    console.log('🔍 FULL DIAGNOSTIC: Starting...');
    console.log('🔍 Step 1: Getting question container...');
    
    // Get question container
    var questionContainer = this.getQuestionContainer();
    console.log('🔍 Question container:', questionContainer);
    console.log('🔍 Question container display:', questionContainer.style.display);
    
    // DON'T hide the question container - this might be causing the blank screen
    // Instead, clear its content
    questionContainer.innerHTML = '';
    console.log('🔍 Step 2: Question container cleared');
    
    // Create main container
    var mainContainer = document.createElement('div');
    mainContainer.id = 'tcip-main-container';
    mainContainer.style.cssText = 'width: 100%; min-height: 600px; padding: 20px; background-color: #f0f8ff; border: 3px solid #007bff;';
    
    // Add diagnostic panel
    mainContainer.innerHTML = `
        <div id="diagnostic-panel" style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 10px 0;">🔍 Full Diagnostic Mode</h3>
            <div style="display: grid; grid-template-columns: 200px 1fr; gap: 10px; font-size: 14px;">
                <strong>Status:</strong> <span id="diag-status">Initializing...</span>
                <strong>Container Added:</strong> <span id="diag-container">No</span>
                <strong>Iframe Created:</strong> <span id="diag-iframe-created">No</span>
                <strong>Iframe Added to DOM:</strong> <span id="diag-iframe-added">No</span>
                <strong>Iframe Loaded:</strong> <span id="diag-iframe-loaded">No</span>
                <strong>Iframe Visible:</strong> <span id="diag-iframe-visible">No</span>
                <strong>Iframe Display:</strong> <span id="diag-iframe-display">-</span>
                <strong>Iframe Size:</strong> <span id="diag-iframe-size">-</span>
                <strong>Message Sent:</strong> <span id="diag-message-sent">No</span>
                <strong>Messages Received:</strong> <span id="diag-messages-received">0</span>
                <strong>Task Completed:</strong> <span id="diag-task-completed">No</span>
            </div>
        </div>
        <div id="iframe-container" style="border: 3px solid #28a745; border-radius: 8px; background-color: #ffffff; min-height: 500px; position: relative;">
            <div id="loading-message" style="text-align: center; padding: 50px;">
                <h3>Loading Impulsivity Task...</h3>
                <p>Please wait while the task loads.</p>
                <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto;"></div>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    // Add to question container
    questionContainer.appendChild(mainContainer);
    console.log('🔍 Step 3: Main container added to question container');
    updateDiag('diag-container', 'Yes', 'green');
    updateDiag('diag-status', 'Main container added');
    
    // Helper function to update diagnostic info
    function updateDiag(id, value, color) {
        var el = document.getElementById(id);
        if (el) {
            el.textContent = value;
            if (color) el.style.color = color;
        }
        console.log('🔍 Diagnostic update:', id, '=', value);
    }
    
    // Create iframe
    console.log('🔍 Step 4: Creating iframe...');
    var iframe = document.createElement('iframe');
    iframe.src = 'https://casgil.github.io/TCIPJS/';
    iframe.id = 'tcip-iframe';
    iframe.style.cssText = 'width: 100%; height: 500px; border: none; background-color: white;';
    
    updateDiag('diag-iframe-created', 'Yes', 'green');
    updateDiag('diag-status', 'Iframe created');
    console.log('🔍 Iframe element:', iframe);
    console.log('🔍 Iframe src:', iframe.src);
    console.log('🔍 Iframe style:', iframe.style.cssText);
    
    // Variables
    var taskStartTime = null;
    var taskEndTime = null;
    var dataReceived = false;
    var messagesReceived = 0;
    var self = this;
    
    // Iframe load handler
    iframe.onload = function() {
        console.log('🔍 Step 5: Iframe loaded event triggered');
        taskStartTime = Date.now();
        
        updateDiag('diag-iframe-loaded', 'Yes', 'green');
        updateDiag('diag-status', 'Iframe loaded successfully');
        
        // Check iframe properties
        console.log('🔍 Iframe offsetWidth:', iframe.offsetWidth);
        console.log('🔍 Iframe offsetHeight:', iframe.offsetHeight);
        console.log('🔍 Iframe display:', window.getComputedStyle(iframe).display);
        console.log('🔍 Iframe visibility:', window.getComputedStyle(iframe).visibility);
        
        updateDiag('diag-iframe-size', iframe.offsetWidth + 'x' + iframe.offsetHeight);
        updateDiag('diag-iframe-display', window.getComputedStyle(iframe).display);
        updateDiag('diag-iframe-visible', iframe.offsetWidth > 0 ? 'Yes' : 'No', iframe.offsetWidth > 0 ? 'green' : 'red');
        
        // Hide loading message
        var loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) {
            loadingMsg.style.display = 'none';
            console.log('🔍 Loading message hidden');
        }
        
        // Send integration message
        setTimeout(function() {
            try {
                console.log('🔍 Step 6: Sending integration message...');
                iframe.contentWindow.postMessage({
                    type: 'QUALTRICS_INTEGRATION',
                    enableDataCapture: true
                }, 'https://casgil.github.io');
                
                updateDiag('diag-message-sent', 'Yes', 'green');
                updateDiag('diag-status', 'Integration message sent - waiting for task...');
                console.log('🔍 Integration message sent successfully');
                
            } catch (error) {
                console.error('🔍 Error sending integration message:', error);
                updateDiag('diag-message-sent', 'Error: ' + error.message, 'red');
                updateDiag('diag-status', 'Error sending message');
            }
        }, 2000);
    };
    
    // Iframe error handler
    iframe.onerror = function() {
        console.error('🔍 Iframe error event triggered');
        updateDiag('diag-iframe-loaded', 'Error', 'red');
        updateDiag('diag-status', 'Iframe failed to load');
        
        var iframeContainer = document.getElementById('iframe-container');
        if (iframeContainer) {
            iframeContainer.innerHTML = `
                <div style="text-align: center; padding: 50px; color: red; background-color: #f8d7da; border-radius: 5px;">
                    <h3>❌ Iframe Loading Error</h3>
                    <p>The task could not be loaded.</p>
                </div>
            `;
        }
        self.enableNextButton();
    };
    
    // Message listener
    window.addEventListener('message', function(event) {
        console.log('🔍 Message received from:', event.origin);
        console.log('🔍 Message data:', event.data);
        
        messagesReceived++;
        updateDiag('diag-messages-received', messagesReceived.toString());
        
        // Check origin
        if (event.origin !== 'https://casgil.github.io') {
            console.log('🔍 Message from unexpected origin, ignoring');
            return;
        }
        
        // Check for completion message
        if (event.data && event.data.type === 'TCIP_COMPLETE') {
            console.log('🔍 Step 7: Task completion message received!');
            taskEndTime = Date.now();
            dataReceived = true;
            
            updateDiag('diag-task-completed', 'Yes', 'green');
            updateDiag('diag-status', 'Task completed - processing data...');
            
            var data = event.data.data;
            console.log('🔍 Task data received:', data.length, 'trials');
            
            // Process data
            try {
                var choiceTrials = data.filter(function(trial) { return trial.task === 'choice'; });
                var addTrials = data.filter(function(trial) { return trial.task === 'add'; });
                
                var totalPoints = 0;
                var circleChoices = 0;
                var squareChoices = 0;
                
                choiceTrials.forEach(function(trial) {
                    if (trial.response === 0) circleChoices++;
                    if (trial.response === 1) squareChoices++;
                });
                
                if (addTrials.length > 0) {
                    totalPoints = addTrials[addTrials.length - 1].points || 0;
                }
                
                var impulsivityScore = (circleChoices + squareChoices) > 0 ? circleChoices / (circleChoices + squareChoices) : 0;
                var completionTime = taskStartTime ? (taskEndTime - taskStartTime) / 1000 : 0;
                
                // Store data
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_TotalPoints', totalPoints);
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_CircleChoices', circleChoices);
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_SquareChoices', squareChoices);
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_ImpulsivityScore', impulsivityScore.toFixed(3));
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_CompletionTime', completionTime.toFixed(1));
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_RawData', JSON.stringify(data));
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Completed', 'Yes');
                
                console.log('🔍 Data stored successfully');
                updateDiag('diag-status', 'Data processed and stored!');
                
                // Show completion message
                mainContainer.innerHTML = `
                    <div style="text-align: center; padding: 50px; color: green; background-color: #d4edda; border-radius: 5px;">
                        <h3>✅ Task Completed Successfully!</h3>
                        <p>Thank you for completing the impulsivity task.</p>
                        <p>Your responses have been recorded.</p>
                        <div style="margin-top: 20px; padding: 15px; background-color: #c3e6cb; border-radius: 5px;">
                            <p><strong>Final Score:</strong> ${totalPoints} points</p>
                            <p><strong>Circle Choices:</strong> ${circleChoices}</p>
                            <p><strong>Square Choices:</strong> ${squareChoices}</p>
                            <p><strong>Impulsivity Score:</strong> ${impulsivityScore.toFixed(3)}</p>
                            <p><strong>Completion Time:</strong> ${completionTime.toFixed(1)} seconds</p>
                        </div>
                    </div>
                `;
                
                self.enableNextButton();
                
            } catch (error) {
                console.error('🔍 Error processing data:', error);
                updateDiag('diag-status', 'Error processing data: ' + error.message);
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Error', 'Data processing failed');
                self.enableNextButton();
            }
        }
    });
    
    // Add iframe to container
    console.log('🔍 Step 4b: Adding iframe to container...');
    var iframeContainer = document.getElementById('iframe-container');
    iframeContainer.appendChild(iframe);
    
    updateDiag('diag-iframe-added', 'Yes', 'green');
    updateDiag('diag-status', 'Iframe added to DOM - loading...');
    console.log('🔍 Iframe added to container');
    
    // Check if iframe is in the DOM
    setTimeout(function() {
        console.log('🔍 Checking iframe in DOM...');
        console.log('🔍 Iframe parent:', iframe.parentElement);
        console.log('🔍 Iframe in document:', document.contains(iframe));
    }, 1000);
    
    // Disable next button
    this.disableNextButton();
    console.log('🔍 Next button disabled');
    
    // Timeout after 10 minutes
    setTimeout(function() {
        if (!dataReceived) {
            console.log('🔍 10 minute timeout reached');
            updateDiag('diag-status', 'Timeout - task took too long');
            
            mainContainer.innerHTML = `
                <div style="text-align: center; padding: 50px; color: orange; background-color: #fff3cd; border-radius: 5px;">
                    <h3>⏰ Task Timeout</h3>
                    <p>The task has taken longer than expected (10 minutes).</p>
                    <p>Please continue with the survey.</p>
                </div>
            `;
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Error', 'Timeout');
            self.enableNextButton();
        }
    }, 600000); // 10 minutes
    
    console.log('🔍 Diagnostic setup complete - waiting for iframe to load...');
});
