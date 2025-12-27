/**
 * DIAGNOSTIC TCIP Integration for Qualtrics
 * 
 * This version includes extensive logging to identify exactly what's failing.
 * Use this to debug why the task isn't working.
 */

Qualtrics.SurveyEngine.addOnload(function() {
    console.log('🔍 Starting TCIP diagnostic integration...');
    
    // Hide question text
    this.getQuestionContainer().style.display = 'none';
    
    // Create container
    const container = document.createElement('div');
    container.id = 'tcip-diagnostic-container';
    container.style.cssText = 'width: 100%; min-height: 600px; padding: 20px; background-color: #f5f5f5; border: 2px solid #007bff;';
    
    // Add diagnostic info
    container.innerHTML = `
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3>🔍 TCIP Diagnostic Mode</h3>
            <p><strong>Status:</strong> <span id="status">Initializing...</span></p>
            <p><strong>Iframe Status:</strong> <span id="iframe-status">Not loaded</span></p>
            <p><strong>Messages Received:</strong> <span id="message-count">0</span></p>
            <p><strong>Errors:</strong> <span id="error-count">0</span></p>
        </div>
    `;
    
    this.getQuestionContainer().appendChild(container);
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://casgil.github.io/TCIPJS/';
    iframe.id = 'tcip-iframe';
    iframe.style.cssText = 'width: 100%; height: 500px; border: 2px solid #28a745; border-radius: 5px;';
    
    // Variables for tracking
    let iframeLoaded = false;
    let messageCount = 0;
    let errorCount = 0;
    let taskData = null;
    let dataReceived = false;
    
    // Update status function
    function updateStatus(message) {
        console.log('📊 Status:', message);
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = message;
    }
    
    // Update iframe status
    function updateIframeStatus(message) {
        console.log('🖼️ Iframe:', message);
        const iframeStatusEl = document.getElementById('iframe-status');
        if (iframeStatusEl) iframeStatusEl.textContent = message;
    }
    
    // Update message count
    function updateMessageCount() {
        messageCount++;
        const messageCountEl = document.getElementById('message-count');
        if (messageCountEl) messageCountEl.textContent = messageCount;
    }
    
    // Update error count
    function updateErrorCount() {
        errorCount++;
        const errorCountEl = document.getElementById('error-count');
        if (errorCountEl) errorCountEl.textContent = errorCount;
    }
    
    // Iframe load handler
    iframe.onload = function() {
        console.log('✅ Iframe loaded successfully');
        iframeLoaded = true;
        updateIframeStatus('Loaded successfully');
        updateStatus('Iframe loaded, testing communication...');
        
        // Test iframe communication
        setTimeout(() => {
            try {
                console.log('📤 Sending test message to iframe...');
                iframe.contentWindow.postMessage({
                    type: 'QUALTRICS_INTEGRATION',
                    enableDataCapture: true
                }, 'https://casgil.github.io');
                updateStatus('Test message sent to iframe');
            } catch (error) {
                console.error('❌ Error sending message to iframe:', error);
                updateErrorCount();
                updateStatus('Error sending message to iframe');
            }
        }, 2000);
    };
    
    // Iframe error handler
    iframe.onerror = function() {
        console.error('❌ Iframe failed to load');
        updateIframeStatus('Failed to load');
        updateErrorCount();
        updateStatus('Iframe failed to load - check URL');
    };
    
    // Message listener
    window.addEventListener('message', function(event) {
        console.log('📨 Message received:', event.origin, event.data);
        updateMessageCount();
        
        // Check origin
        if (event.origin !== 'https://casgil.github.io') {
            console.log('⚠️ Message from unexpected origin:', event.origin);
            return;
        }
        
        // Check message type
        if (event.data && event.data.type === 'TCIP_COMPLETE') {
            console.log('🎉 Task completion message received!');
            taskData = event.data.data;
            dataReceived = true;
            updateStatus('Task completed! Processing data...');
            
            // Process data
            try {
                const choiceTrials = taskData.filter(trial => trial.task === 'choice');
                const addTrials = taskData.filter(trial => trial.task === 'add');
                
                let totalPoints = 0;
                let circleChoices = 0;
                let squareChoices = 0;
                
                choiceTrials.forEach(trial => {
                    if (trial.response === 0) circleChoices++;
                    if (trial.response === 1) squareChoices++;
                });
                
                if (addTrials.length > 0) {
                    totalPoints = addTrials[addTrials.length - 1].points || 0;
                }
                
                const impulsivityScore = (circleChoices + squareChoices) > 0 ? circleChoices / (circleChoices + squareChoices) : 0;
                
                // Store data
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_TotalPoints', totalPoints);
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_CircleChoices', circleChoices);
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_SquareChoices', squareChoices);
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_ImpulsivityScore', impulsivityScore);
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_RawData', JSON.stringify(taskData));
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Completed', 'Yes');
                
                console.log('✅ Data stored successfully:', {
                    totalPoints,
                    circleChoices,
                    squareChoices,
                    impulsivityScore
                });
                
                updateStatus('Data processed and stored successfully!');
                
                // Show completion message
                iframe.style.display = 'none';
                container.innerHTML = `
                    <div style="text-align: center; padding: 50px; color: green; background-color: #d4edda; border-radius: 5px;">
                        <h3>✅ Task Completed Successfully!</h3>
                        <p>Data has been captured and stored.</p>
                        <p><strong>Points:</strong> ${totalPoints}</p>
                        <p><strong>Circle Choices:</strong> ${circleChoices}</p>
                        <p><strong>Square Choices:</strong> ${squareChoices}</p>
                        <p><strong>Impulsivity Score:</strong> ${impulsivityScore.toFixed(3)}</p>
                    </div>
                `;
                
                this.enableNextButton();
                
            } catch (error) {
                console.error('❌ Error processing data:', error);
                updateErrorCount();
                updateStatus('Error processing data: ' + error.message);
            }
        } else {
            console.log('📨 Other message received:', event.data);
        }
    }.bind(this));
    
    // Add iframe to container
    container.appendChild(iframe);
    
    // Disable next button
    this.disableNextButton();
    
    // Timeout after 10 minutes
    setTimeout(() => {
        if (!dataReceived) {
            console.log('⏰ 10 minute timeout reached');
            updateStatus('Timeout - task took too long');
            
            iframe.style.display = 'none';
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; color: orange; background-color: #fff3cd; border-radius: 5px;">
                    <h3>⏰ Task Timeout</h3>
                    <p>The task has taken longer than expected.</p>
                    <p>Please continue with the survey.</p>
                </div>
            `;
            
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Error', 'Timeout');
            this.enableNextButton();
        }
    }, 600000); // 10 minutes
    
    // Manual continue button (appears after 5 minutes)
    setTimeout(() => {
        if (!dataReceived) {
            const manualBtn = document.createElement('button');
            manualBtn.innerHTML = 'Continue Survey (Task Taking Too Long)';
            manualBtn.style.cssText = 'background-color: #dc3545; color: white; border: none; padding: 15px 30px; border-radius: 5px; cursor: pointer; margin-top: 20px;';
            
            manualBtn.onclick = function() {
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Error', 'Manual continue');
                this.enableNextButton();
            }.bind(this);
            
            container.appendChild(manualBtn);
        }
    }, 300000); // 5 minutes
});
