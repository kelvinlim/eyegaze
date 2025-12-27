/**
 * FIXED Qualtrics Integration for TCIP Task
 * 
 * This version fixes the hideQuestion() error and uses proper Qualtrics methods.
 * Use this version - it should work without errors.
 */

Qualtrics.SurveyEngine.addOnload(function() {
    console.log('✅ Starting TCIP integration...');
    
    // Hide question text (fixed method)
    this.getQuestionContainer().style.display = 'none';
    
    // Create container
    const container = document.createElement('div');
    container.id = 'tcip-container';
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
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://casgil.github.io/TCIPJS/';
    iframe.style.cssText = 'width: 100%; height: 500px; border: none; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);';
    
    // Variables
    let taskStartTime = null;
    let taskEndTime = null;
    let dataReceived = false;
    
    // Iframe load handler
    iframe.onload = function() {
        console.log('✅ Iframe loaded successfully');
        taskStartTime = Date.now();
        
        // Hide loading message and show iframe
        container.innerHTML = '';
        container.appendChild(iframe);
        
        // Send integration message
        setTimeout(() => {
            try {
                iframe.contentWindow.postMessage({
                    type: 'QUALTRICS_INTEGRATION',
                    enableDataCapture: true
                }, 'https://casgil.github.io');
                console.log('✅ Integration message sent');
            } catch (error) {
                console.warn('⚠️ Could not send integration message:', error);
            }
        }, 2000);
    };
    
    // Iframe error handler
    iframe.onerror = function() {
        console.error('❌ Iframe failed to load');
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: red; background-color: #f8d7da; border-radius: 5px;">
                <h3>⚠️ Task Loading Error</h3>
                <p>There was an error loading the impulsivity task.</p>
                <p>Please try refreshing the page or contact the researcher.</p>
            </div>
        `;
        this.enableNextButton();
    }.bind(this);
    
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
            
            const data = event.data.data;
            
            // Process data
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
                
                console.log('✅ Data stored:', {
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
                    </div>
                `;
                
                this.enableNextButton();
                
            } catch (error) {
                console.error('❌ Error processing data:', error);
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Error', 'Data processing failed');
                this.enableNextButton();
            }
        }
    }.bind(this));
    
    // Disable next button initially
    this.disableNextButton();
    
    // Timeout after 10 minutes
    setTimeout(() => {
        if (!dataReceived) {
            console.log('⏰ 10 minute timeout');
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
});
