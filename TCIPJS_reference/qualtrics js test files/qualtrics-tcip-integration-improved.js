/**
 * Qualtrics Integration Code for Two Choice Impulsivity Paradigm (TCIP) - IMPROVED VERSION
 * 
 * This code allows you to embed the TCIP task from https://casgil.github.io/TCIPJS/
 * into a Qualtrics survey and automatically capture the behavioral data.
 * 
 * INSTRUCTIONS FOR USE:
 * 1. In your Qualtrics survey, create a new question (Text/Graphic type)
 * 2. Add this entire code to the JavaScript section of that question
 * 3. The task will run in an iframe and data will be automatically captured
 * 4. Data will be stored as embedded data fields in Qualtrics
 * 
 * EMBEDDED DATA FIELDS CREATED:
 * - TCIP_TotalPoints: Final point total
 * - TCIP_CircleChoices: Number of times circle was chosen
 * - TCIP_SquareChoices: Number of times square was chosen
 * - TCIP_AvgDelay: Average delay for circle choices
 * - TCIP_ImpulsivityScore: Ratio of circle to total choices
 * - TCIP_RawData: Complete trial-by-trial data (JSON string)
 * - TCIP_CompletionTime: Total time to complete task (seconds)
 * - TCIP_StartTime: Timestamp when task started
 * - TCIP_EndTime: Timestamp when task completed
 */

Qualtrics.SurveyEngine.addOnload(function() {
    // Hide the question text/description
    this.getQuestionContainer().style.display = 'none';
    
    console.log('TCIP Qualtrics integration starting...');
    
    // Create container for the iframe
    const container = document.createElement('div');
    container.id = 'tcip-container';
    container.style.cssText = `
        width: 100%;
        height: 600px;
        border: none;
        position: relative;
        background-color: #f5f5f5;
    `;
    
    // Create iframe to load the TCIP task
    const iframe = document.createElement('iframe');
    iframe.src = 'https://casgil.github.io/TCIPJS/';
    iframe.id = 'tcip-iframe';
    iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    
    // Add loading message with better styling
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-message';
    loadingDiv.innerHTML = `
        <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif; background-color: white; border-radius: 8px; margin: 20px;">
            <h3 style="color: #333;">Loading Impulsivity Task...</h3>
            <p style="color: #666;">Please wait while the task loads. This may take a few moments.</p>
            <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto;"></div>
            <p style="color: #999; font-size: 12px;">If this takes too long, please refresh the page.</p>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    // Insert elements into the question
    const questionContainer = this.getQuestionContainer();
    questionContainer.appendChild(container);
    container.appendChild(loadingDiv);
    container.appendChild(iframe);
    
    // Hide iframe initially, show loading
    iframe.style.display = 'none';
    
    // Variables to track task data
    let taskStartTime = null;
    let taskEndTime = null;
    let taskData = null;
    let dataReceived = false;
    let iframeLoaded = false;
    
    // Enhanced message listener with better debugging
    window.addEventListener('message', function(event) {
        console.log('Received message:', event.origin, event.data);
        
        // Security check - ensure message is from expected origin
        if (event.origin !== 'https://casgil.github.io') {
            console.log('Message from unexpected origin:', event.origin);
            return;
        }
        
        // Check if this is our task completion message
        if (event.data && event.data.type === 'TCIP_COMPLETE') {
            console.log('Task completion message received:', event.data);
            taskEndTime = Date.now();
            taskData = event.data.data;
            dataReceived = true;
            
            // Process and store the data
            processTaskData(taskData);
            
            // Hide iframe and show completion message
            iframe.style.display = 'none';
            loadingDiv.innerHTML = `
                <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif; color: #27ae60; background-color: white; border-radius: 8px; margin: 20px;">
                    <h3>✓ Task Completed Successfully!</h3>
                    <p>Thank you for completing the impulsivity task. Your responses have been recorded.</p>
                    <p>You can now continue with the survey.</p>
                </div>
            `;
            
            // Enable next button
            this.enableNextButton();
        }
    }.bind(this));
    
    // Function to process and store task data
    function processTaskData(data) {
        try {
            console.log('Processing task data:', data);
            
            // Calculate summary statistics
            const choiceTrials = data.filter(trial => trial.task === 'choice');
            const addTrials = data.filter(trial => trial.task === 'add');
            
            let totalPoints = 0;
            let circleChoices = 0;
            let squareChoices = 0;
            let totalDelay = 0;
            let delayCount = 0;
            
            // Process each choice trial
            choiceTrials.forEach((trial, index) => {
                if (trial.response === 0) { // Circle chosen
                    circleChoices++;
                    if (trial.delay) {
                        totalDelay += trial.delay / 1000; // Convert to seconds
                        delayCount++;
                    }
                } else if (trial.response === 1) { // Square chosen
                    squareChoices++;
                }
            });
            
            // Get final points from last add trial
            if (addTrials.length > 0) {
                const lastAddTrial = addTrials[addTrials.length - 1];
                totalPoints = lastAddTrial.points || 0;
            }
            
            // Calculate derived measures
            const totalChoices = circleChoices + squareChoices;
            const impulsivityScore = totalChoices > 0 ? circleChoices / totalChoices : 0;
            const avgDelay = delayCount > 0 ? totalDelay / delayCount : 0;
            const completionTime = taskStartTime ? (taskEndTime - taskStartTime) / 1000 : 0;
            
            // Store data as embedded data in Qualtrics
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_TotalPoints', totalPoints);
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_CircleChoices', circleChoices);
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_SquareChoices', squareChoices);
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_TotalChoices', totalChoices);
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_AvgDelay', Math.round(avgDelay * 100) / 100);
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_ImpulsivityScore', Math.round(impulsivityScore * 1000) / 1000);
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_CompletionTime', Math.round(completionTime * 100) / 100);
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_StartTime', new Date(taskStartTime).toISOString());
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_EndTime', new Date(taskEndTime).toISOString());
            
            // Store raw data as JSON string
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_RawData', JSON.stringify(data));
            
            // Store additional summary data
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_TaskCompleted', 'Yes');
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_DataTimestamp', new Date().toISOString());
            
            console.log('TCIP data processed and stored:', {
                totalPoints,
                circleChoices,
                squareChoices,
                impulsivityScore,
                avgDelay,
                completionTime
            });
            
        } catch (error) {
            console.error('Error processing TCIP data:', error);
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Error', 'Data processing failed: ' + error.message);
        }
    }
    
    // Enhanced iframe load handler
    iframe.onload = function() {
        console.log('Iframe loaded successfully');
        iframeLoaded = true;
        taskStartTime = Date.now();
        
        // Hide loading message and show iframe
        loadingDiv.style.display = 'none';
        iframe.style.display = 'block';
        
        // Send message to iframe to enable data transmission
        setTimeout(() => {
            try {
                console.log('Sending integration message to iframe');
                iframe.contentWindow.postMessage({
                    type: 'QUALTRICS_INTEGRATION',
                    enableDataCapture: true
                }, 'https://casgil.github.io');
            } catch (error) {
                console.warn('Could not establish communication with task iframe:', error);
            }
        }, 2000); // Increased delay to ensure iframe is fully ready
    };
    
    // Enhanced error handling
    iframe.onerror = function() {
        console.error('Iframe failed to load');
        loadingDiv.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif; color: #e74c3c; background-color: white; border-radius: 8px; margin: 20px;">
                <h3>⚠️ Task Loading Error</h3>
                <p>There was an error loading the impulsivity task. This could be due to:</p>
                <ul style="text-align: left; max-width: 400px; margin: 20px auto;">
                    <li>Network connectivity issues</li>
                    <li>Browser security settings</li>
                    <li>Task server being temporarily unavailable</li>
                </ul>
                <p>Please try refreshing the page or contact the researcher if the problem persists.</p>
                <button onclick="location.reload()" style="background-color: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">Refresh Page</button>
            </div>
        `;
        
        // Set error flag
        Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Error', 'Task failed to load');
        Qualtrics.SurveyEngine.setEmbeddedData('TCIP_TaskCompleted', 'No');
        this.enableNextButton();
    };
    
    // Disable next button until task is completed
    this.disableNextButton();
    
    // Enhanced timeout protection with status updates
    let timeoutCounter = 0;
    const timeoutInterval = setInterval(() => {
        timeoutCounter += 30; // Check every 30 seconds
        
        if (!dataReceived && timeoutCounter >= 600) { // 10 minutes
            clearInterval(timeoutInterval);
            iframe.style.display = 'none';
            loadingDiv.innerHTML = `
                <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif; color: #e74c3c; background-color: white; border-radius: 8px; margin: 20px;">
                    <h3>⚠️ Task Timeout</h3>
                    <p>The task has taken longer than expected (10 minutes).</p>
                    <p>If you were in the middle of the task, please try again.</p>
                    <p>You can continue with the survey now.</p>
                </div>
            `;
            
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Error', 'Task timeout after 10 minutes');
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_TaskCompleted', 'Timeout');
            this.enableNextButton();
        } else if (!dataReceived && timeoutCounter >= 180) { // 3 minutes - show manual continue
            if (!document.getElementById('manual-continue')) {
                showManualContinueButton();
            }
        }
    }, 30000); // Check every 30 seconds
    
    // Manual continue button
    function showManualContinueButton() {
        const manualContinueDiv = document.createElement('div');
        manualContinueDiv.id = 'manual-continue';
        manualContinueDiv.style.cssText = `
            text-align: center;
            margin-top: 20px;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
        `;
        
        const manualButton = document.createElement('button');
        manualButton.innerHTML = 'Continue Survey (Task Taking Too Long)';
        manualButton.style.cssText = `
            background-color: #e74c3c;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        `;
        
        manualButton.onclick = function() {
            clearInterval(timeoutInterval);
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Error', 'Manual continue after 3 minutes');
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_TaskCompleted', 'Manual Continue');
            this.enableNextButton();
            manualContinueDiv.style.display = 'none';
        }.bind(this);
        
        manualContinueDiv.innerHTML = `
            <p style="color: #666; margin-bottom: 15px;">The task seems to be taking longer than expected.</p>
        `;
        manualContinueDiv.appendChild(manualButton);
        container.appendChild(manualContinueDiv);
    }
    
    // Cleanup function
    this.addOnUnload(function() {
        clearInterval(timeoutInterval);
    });
});

// Optional: Add cleanup when leaving the question
Qualtrics.SurveyEngine.addOnReady(function() {
    console.log('TCIP Qualtrics integration loaded and ready');
});

// Optional: Add unload handler to clean up if needed
Qualtrics.SurveyEngine.addOnUnload(function() {
    console.log('TCIP Qualtrics integration unloaded');
});

