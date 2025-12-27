/**
 * FINAL Qualtrics Integration for TCIP Task
 * 
 * Clean version without loops - just loads the task in iframe.
 * Copy and paste this entire code into your Qualtrics Text/Graphic question's JavaScript section.
 */

Qualtrics.SurveyEngine.addOnload(function() {
    console.log('✅ TCIP Integration starting...');
    
    // Hide question text
    var questionContainer = this.getQuestionContainer();
    questionContainer.style.display = 'none';
    
    // Create container
    var container = document.createElement('div');
    container.id = 'tcip-container';
    container.style.cssText = 'width: 100%; min-height: 600px; padding: 20px; background-color: #ffffff;';
    
    // Add loading message
    container.innerHTML = `
        <div id="loading-message" style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
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
    
    questionContainer.appendChild(container);
    
    // Create iframe
    var iframe = document.createElement('iframe');
    iframe.src = 'https://casgil.github.io/TCIPJS/';
    iframe.id = 'tcip-iframe';
    iframe.style.cssText = 'width: 100%; height: 600px; border: none; display: none;';
    
    // Variables
    var taskStartTime = null;
    var taskEndTime = null;
    var dataReceived = false;
    var self = this;
    
    // Iframe load handler
    iframe.onload = function() {
        console.log('✅ Iframe loaded successfully');
        taskStartTime = Date.now();
        
        // Hide loading message and show iframe
        var loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) loadingMsg.style.display = 'none';
        iframe.style.display = 'block';
        
        // Send integration message
        setTimeout(function() {
            try {
                console.log('📤 Sending integration message...');
                iframe.contentWindow.postMessage({
                    type: 'QUALTRICS_INTEGRATION',
                    enableDataCapture: true
                }, 'https://casgil.github.io');
                console.log('✅ Integration message sent');
            } catch (error) {
                console.warn('⚠️ Could not send message:', error);
            }
        }, 2000);
    };
    
    // Iframe error handler
    iframe.onerror = function() {
        console.error('❌ Iframe failed to load');
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: red; background-color: #f8d7da; border-radius: 5px;">
                <h3>⚠️ Task Loading Error</h3>
                <p>There was an error loading the task.</p>
                <p>Please refresh the page or contact the researcher.</p>
            </div>
        `;
        self.enableNextButton();
    };
    
    // Message listener
    window.addEventListener('message', function(event) {
        console.log('📨 Message received:', event.origin, event.data);
        
        // Check origin
        if (event.origin !== 'https://casgil.github.io') {
            return;
        }
        
        // Check for completion message
        if (event.data && event.data.type === 'TCIP_COMPLETE') {
            console.log('🎉 Task completed!');
            taskEndTime = Date.now();
            dataReceived = true;
            
            var data = event.data.data;
            
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
                
                console.log('✅ Data stored:', totalPoints, 'points,', circleChoices, 'circles,', squareChoices, 'squares');
                
                // Show completion message
                container.innerHTML = `
                    <div style="text-align: center; padding: 50px; color: green; background-color: #d4edda; border-radius: 5px;">
                        <h3>✅ Task Completed Successfully!</h3>
                        <p>Thank you for completing the impulsivity task.</p>
                        <p>Your responses have been recorded.</p>
                        <div style="margin-top: 20px; padding: 15px; background-color: #c3e6cb; border-radius: 5px;">
                            <p><strong>Final Score:</strong> ${totalPoints} points</p>
                            <p><strong>Impulsivity Score:</strong> ${impulsivityScore.toFixed(3)}</p>
                        </div>
                    </div>
                `;
                
                self.enableNextButton();
                
            } catch (error) {
                console.error('❌ Error processing data:', error);
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Error', 'Data processing failed');
                self.enableNextButton();
            }
        }
    });
    
    // Add iframe to container
    container.appendChild(iframe);
    
    // Disable next button
    this.disableNextButton();
    
    // Timeout after 10 minutes
    setTimeout(function() {
        if (!dataReceived) {
            console.log('⏰ Timeout');
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; color: orange; background-color: #fff3cd; border-radius: 5px;">
                    <h3>⏰ Task Timeout</h3>
                    <p>The task has taken longer than expected.</p>
                    <p>Please continue with the survey.</p>
                </div>
            `;
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Error', 'Timeout');
            self.enableNextButton();
        }
    }, 600000); // 10 minutes
});
