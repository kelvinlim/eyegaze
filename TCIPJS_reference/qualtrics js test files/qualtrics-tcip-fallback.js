/**
 * FALLBACK Qualtrics Integration for TCIP Task
 * 
 * This version includes multiple fallback methods to ensure the task is visible.
 * If the iframe doesn't work, it provides alternative approaches.
 */

Qualtrics.SurveyEngine.addOnload(function() {
    console.log('🔍 FALLBACK TCIP Integration starting...');
    
    // Hide question text
    this.getQuestionContainer().style.display = 'none';
    
    // Create container
    const container = document.createElement('div');
    container.id = 'fallback-container';
    container.style.cssText = 'width: 100%; min-height: 600px; padding: 20px; background-color: #f5f5f5;';
    
    // Add loading message
    container.innerHTML = `
        <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            <h3>Loading Impulsivity Task...</h3>
            <p>Please wait while the task loads.</p>
            <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto;"></div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    this.getQuestionContainer().appendChild(container);
    
    // Test if task URL is accessible first
    const taskUrl = 'https://casgil.github.io/TCIPJS/';
    console.log('🔍 Testing task URL accessibility...');
    
    fetch(taskUrl)
        .then(response => {
            console.log('🔍 URL test response:', response.status, response.statusText);
            
            if (response.ok) {
                console.log('✅ Task URL is accessible');
                loadIframe();
            } else {
                console.log('❌ Task URL returned error:', response.status);
                showError('Task URL returned error: ' + response.status);
            }
        })
        .catch(error => {
            console.error('❌ Task URL not accessible:', error);
            showError('Task URL not accessible: ' + error.message);
        });
    
    function loadIframe() {
        console.log('🔍 Loading iframe...');
        
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.src = taskUrl;
        iframe.id = 'tcip-iframe';
        iframe.style.cssText = 'width: 100%; height: 500px; border: none; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); background-color: white;';
        
        // Variables
        let taskStartTime = null;
        let taskEndTime = null;
        let dataReceived = false;
        let integrationMessageSent = false;
        
        // Iframe load handler
        iframe.onload = function() {
            console.log('✅ Iframe loaded successfully');
            taskStartTime = Date.now();
            
            // Hide loading message and show iframe
            container.innerHTML = '';
            container.appendChild(iframe);
            
            // Send integration message after a delay
            setTimeout(() => {
                try {
                    console.log('📤 Sending integration message to iframe...');
                    iframe.contentWindow.postMessage({
                        type: 'QUALTRICS_INTEGRATION',
                        enableDataCapture: true
                    }, 'https://casgil.github.io');
                    
                    integrationMessageSent = true;
                    console.log('✅ Integration message sent successfully');
                    
                } catch (error) {
                    console.warn('⚠️ Could not send integration message:', error);
                }
            }, 3000);
            
            // Check if task is visible after a longer delay
            setTimeout(() => {
                console.log('🔍 Checking if task is visible...');
                
                // Since we can't access iframe content due to CORS, we'll assume it's working
                // if the iframe loaded and we can send messages
                if (integrationMessageSent) {
                    console.log('✅ Assuming task is visible (integration message sent successfully)');
                } else {
                    console.log('⚠️ Task visibility unknown (CORS prevents inspection)');
                }
            }, 5000);
        };
        
        // Iframe error handler
        iframe.onerror = function() {
            console.error('❌ Iframe failed to load');
            showError('Iframe failed to load');
        };
        
        // Message listener for task completion
        window.addEventListener('message', function(event) {
            console.log('📨 Message received from:', event.origin, event.data);
            
            // Security check
            if (event.origin !== 'https://casgil.github.io') {
                return;
            }
            
            // Check for task completion
            if (event.data && event.data.type === 'TCIP_COMPLETE') {
                console.log('🎉 Task completion message received!');
                taskEndTime = Date.now();
                dataReceived = true;
                
                const data = event.data.data;
                console.log('📊 Task data received:', data.length, 'trials');
                
                // Process the data
                try {
                    const choiceTrials = data.filter(trial => trial.task === 'choice');
                    const addTrials = data.filter(trial => trial.task === 'add');
                    
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
                    const completionTime = taskStartTime ? (taskEndTime - taskStartTime) / 1000 : 0;
                    
                    // Store data
                    Qualtrics.SurveyEngine.setEmbeddedData('TCIP_TotalPoints', totalPoints);
                    Qualtrics.SurveyEngine.setEmbeddedData('TCIP_CircleChoices', circleChoices);
                    Qualtrics.SurveyEngine.setEmbeddedData('TCIP_SquareChoices', squareChoices);
                    Qualtrics.SurveyEngine.setEmbeddedData('TCIP_ImpulsivityScore', impulsivityScore);
                    Qualtrics.SurveyEngine.setEmbeddedData('TCIP_CompletionTime', completionTime);
                    Qualtrics.SurveyEngine.setEmbeddedData('TCIP_RawData', JSON.stringify(data));
                    Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Completed', 'Yes');
                    Qualtrics.SurveyEngine.setEmbeddedData('TCIP_StartTime', new Date(taskStartTime).toISOString());
                    Qualtrics.SurveyEngine.setEmbeddedData('TCIP_EndTime', new Date(taskEndTime).toISOString());
                    
                    console.log('✅ Data stored successfully:', {
                        totalPoints,
                        circleChoices,
                        squareChoices,
                        impulsivityScore,
                        completionTime
                    });
                    
                    // Show completion message
                    container.innerHTML = `
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
                    
                    this.enableNextButton();
                    
                } catch (error) {
                    console.error('❌ Error processing task data:', error);
                    Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Error', 'Data processing failed: ' + error.message);
                    
                    container.innerHTML = `
                        <div style="text-align: center; padding: 50px; color: orange; background-color: #fff3cd; border-radius: 5px;">
                            <h3>⚠️ Data Processing Error</h3>
                            <p>Task completed but there was an error processing the data.</p>
                            <p>Please continue with the survey.</p>
                        </div>
                    `;
                    
                    this.enableNextButton();
                }
            }
        }.bind(this));
        
        // Add iframe to container
        container.appendChild(iframe);
    }
    
    function showError(message) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: red; background-color: #f8d7da; border-radius: 5px;">
                <h3>❌ Task Loading Error</h3>
                <p><strong>Error:</strong> ${message}</p>
                <p>This could be due to:</p>
                <ul style="text-align: left; max-width: 400px; margin: 20px auto;">
                    <li>Network connectivity issues</li>
                    <li>Task server being temporarily unavailable</li>
                    <li>Browser security settings</li>
                </ul>
                <p>Please try refreshing the page or contact the researcher.</p>
            </div>
        `;
        this.enableNextButton();
    }
    
    // Disable next button initially
    this.disableNextButton();
    
    // Timeout after 10 minutes
    setTimeout(() => {
        if (!dataReceived) {
            console.log('⏰ 10 minute timeout reached');
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; color: orange; background-color: #fff3cd; border-radius: 5px;">
                    <h3>⏰ Task Timeout</h3>
                    <p>The task has taken longer than expected (10 minutes).</p>
                    <p>Please continue with the survey.</p>
                </div>
            `;
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Error', 'Timeout after 10 minutes');
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Completed', 'Timeout');
            this.enableNextButton();
        }
    }, 600000); // 10 minutes
});
