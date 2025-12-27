/**
 * Qualtrics Integration for Two Choice Impulsivity Paradigm (TCIP)
 * 
 * This code embeds the TCIP task into a Qualtrics survey and automatically captures behavioral data.
 * Copy and paste this entire code into a Text/Graphic question's JavaScript section.
 * 
 * EMBEDDED DATA FIELDS CREATED:
 * - TCIP_TotalPoints: Final point total
 * - TCIP_CircleChoices: Number of times circle was chosen
 * - TCIP_SquareChoices: Number of times square was chosen
 * - TCIP_ImpulsivityScore: Ratio of circle to total choices (0-1)
 * - TCIP_CompletionTime: Total time to complete task (seconds)
 * - TCIP_RawData: Complete trial-by-trial data (JSON string)
 * - TCIP_Completed: Task completion status
 */

Qualtrics.SurveyEngine.addOnload(function() {
    // Get question container and clear it
    var questionContainer = this.getQuestionContainer();
    questionContainer.innerHTML = '';
    
    // Create main container
    var mainContainer = document.createElement('div');
    mainContainer.id = 'tcip-main-container';
    mainContainer.style.cssText = 'width: 100%; margin: 0; padding: 10px; background-color: #ffffff;';
    
    // Add task container with loading message
    mainContainer.innerHTML = `
        <div id="iframe-container" style="border: 2px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; min-height: 600px; position: relative; overflow: hidden;">
            <div id="loading-message" style="text-align: center; padding: 30px 15px; font-family: Arial, sans-serif;">
                <h3 style="font-size: clamp(18px, 4vw, 24px); margin: 15px 0;">Loading Impulsivity Task...</h3>
                <p style="font-size: clamp(14px, 3vw, 18px); margin: 10px 0;">Please wait while the task loads.</p>
                <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto;"></div>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Full width responsive design */
            #tcip-main-container {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 5px !important;
            }
            
            #iframe-container {
                position: relative;
                padding-bottom: 80vh; /* Responsive aspect ratio */
            }
            
            #tcip-iframe {
                width: 100% !important;
                height: 100% !important;
                max-width: none !important;
                box-sizing: border-box;
                position: absolute;
                top: 0;
                left: 0;
            }
            
            /* Mobile devices */
            @media (max-width: 768px) {
                #iframe-container {
                    min-height: 600px !important;
                    padding-bottom: 0 !important;
                }
                
                #tcip-iframe {
                    position: relative !important;
                    height: 600px !important;
                }
                
                #loading-message h3 {
                    font-size: 20px;
                }
                
                #loading-message p {
                    font-size: 14px;
                }
            }
            
            /* Tablet devices */
            @media (min-width: 769px) and (max-width: 1024px) {
                #iframe-container {
                    min-height: 700px !important;
                    padding-bottom: 0 !important;
                }
                
                #tcip-iframe {
                    position: relative !important;
                    height: 700px !important;
                }
            }
            
            /* Desktop devices */
            @media (min-width: 1025px) {
                #iframe-container {
                    min-height: 800px !important;
                    padding-bottom: 0 !important;
                }
                
                #tcip-iframe {
                    position: relative !important;
                    height: 800px !important;
                }
            }
        </style>
    `;
    
    // Add to question container
    questionContainer.appendChild(mainContainer);
    
    // Create iframe
    var iframe = document.createElement('iframe');
    iframe.src = 'https://casgil.github.io/TCIPJS/';
    iframe.id = 'tcip-iframe';
    iframe.style.cssText = 'width: 100%; border: none; background-color: white;';
    
    // Variables
    var taskStartTime = null;
    var taskEndTime = null;
    var dataReceived = false;
    var self = this;
    
    // Iframe load handler
    iframe.onload = function() {
        taskStartTime = Date.now();
        
        // Hide loading message
        var loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) {
            loadingMsg.style.display = 'none';
        }
        
        // Inject responsive CSS into iframe
        try {
            setTimeout(function() {
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    // Create responsive stylesheet
                    var style = iframeDoc.createElement('style');
                    style.textContent = `
                        /* Responsive styles for TCIP task */
                        html, body {
                            overflow-x: hidden !important;
                            max-width: 100vw !important;
                        }
                        
                        #jspsych-content {
                            max-width: 100% !important;
                            margin: 10px auto !important;
                            padding: 10px;
                            box-sizing: border-box;
                            overflow-x: hidden !important;
                        }
                        
                        /* Responsive buttons and elements */
                        .jspsych-btn {
                            min-width: 100px;
                            min-height: 100px;
                            max-width: 150px;
                            max-height: 150px;
                            margin: 10px !important;
                            font-size: 14px;
                            box-sizing: border-box;
                        }
                        
                        /* Responsive text */
                        p {
                            font-size: clamp(14px, 2.5vw, 18px);
                            max-width: 100%;
                            box-sizing: border-box;
                        }
                        
                        /* Responsive point display */
                        p[style*="font-size:30px"] {
                            font-size: clamp(16px, 4vw, 24px) !important;
                            padding: 15px !important;
                            width: 100% !important;
                            max-width: 100% !important;
                        }
                        
                        /* Ensure all elements prevent overflow */
                        * {
                            max-width: 100%;
                            box-sizing: border-box;
                        }
                        
                        /* Mobile-specific adjustments */
                        @media (max-width: 768px) {
                            .jspsych-btn {
                                min-width: 80px;
                                min-height: 80px;
                                max-width: 120px;
                                max-height: 120px;
                                margin: 5px !important;
                            }
                            
                            #jspsych-content {
                                margin: 5px auto !important;
                                padding: 5px;
                            }
                            
                            p[style*="font-size:25px"] {
                                font-size: clamp(12px, 3vw, 16px) !important;
                                padding: 10px !important;
                            }
                            
                            p[style*="font-size:30px"] {
                                font-size: 18px !important;
                                padding: 10px !important;
                            }
                        }
                        
                        /* Tablet adjustments */
                        @media (min-width: 769px) and (max-width: 1024px) {
                            .jspsych-btn {
                                min-width: 90px;
                                min-height: 90px;
                                max-width: 130px;
                                max-height: 130px;
                            }
                        }
                    `;
                    iframeDoc.head.appendChild(style);
                    console.log('Responsive CSS injected into iframe');
                }
            }, 100);
        } catch (error) {
            console.warn('Could not inject responsive CSS:', error);
        }
        
        // Send integration message to enable data capture
        setTimeout(function() {
            try {
                iframe.contentWindow.postMessage({
                    type: 'QUALTRICS_INTEGRATION',
                    enableDataCapture: true
                }, 'https://casgil.github.io');
            } catch (error) {
                console.warn('Could not send integration message:', error);
            }
        }, 2000);
    };
    
    // Iframe error handler
    iframe.onerror = function() {
        var iframeContainer = document.getElementById('iframe-container');
        if (iframeContainer) {
            iframeContainer.innerHTML = `
                <div style="text-align: center; padding: 30px 15px; color: red; background-color: #f8d7da; border-radius: 5px;">
                    <h3 style="font-size: clamp(18px, 4vw, 22px); margin: 10px 0;">⚠️ Task Loading Error</h3>
                    <p style="font-size: clamp(14px, 3vw, 16px); margin: 10px 0;">There was an error loading the task.</p>
                    <p style="font-size: clamp(14px, 3vw, 16px); margin: 10px 0;">Please refresh the page or contact the researcher.</p>
                </div>
            `;
        }
        self.enableNextButton();
    };
    
    // Message listener for task completion
    window.addEventListener('message', function(event) {
        // Security check - only accept messages from task domain
        if (event.origin !== 'https://casgil.github.io') {
            return;
        }
        
        // Check for task completion message
        if (event.data && event.data.type === 'TCIP_COMPLETE') {
            taskEndTime = Date.now();
            dataReceived = true;
            
            var data = event.data.data;
            
            // Process the behavioral data
            try {
                var choiceTrials = data.filter(function(trial) { return trial.task === 'choice'; });
                var addTrials = data.filter(function(trial) { return trial.task === 'add'; });
                
                var totalPoints = 0;
                var circleChoices = 0;
                var squareChoices = 0;
                
                // Count choices
                choiceTrials.forEach(function(trial) {
                    if (trial.response === 0) circleChoices++;
                    if (trial.response === 1) squareChoices++;
                });
                
                // Get final points
                if (addTrials.length > 0) {
                    totalPoints = addTrials[addTrials.length - 1].points || 0;
                }
                
                // Calculate derived measures
                var impulsivityScore = (circleChoices + squareChoices) > 0 ? circleChoices / (circleChoices + squareChoices) : 0;
                var completionTime = taskStartTime ? (taskEndTime - taskStartTime) / 1000 : 0;
                
                // Store data as Qualtrics embedded data
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_TotalPoints', totalPoints);
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_CircleChoices', circleChoices);
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_SquareChoices', squareChoices);
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_ImpulsivityScore', impulsivityScore.toFixed(3));
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_CompletionTime', completionTime.toFixed(1));
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_RawData', JSON.stringify(data));
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Completed', 'Yes');
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_StartTime', new Date(taskStartTime).toISOString());
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_EndTime', new Date(taskEndTime).toISOString());
                
                // Show completion message
                mainContainer.innerHTML = `
                    <div style="text-align: center; padding: 30px 15px; color: green; background-color: #d4edda; border-radius: 8px;">
                        <h3 style="font-size: clamp(18px, 4vw, 24px); margin: 10px 0;">✅ Task Completed Successfully!</h3>
                        <p style="font-size: clamp(14px, 3vw, 18px); margin: 10px 0;">Thank you for completing the impulsivity task.</p>
                        <p style="font-size: clamp(14px, 3vw, 18px); margin: 10px 0;">Your responses have been recorded.</p>
                        <div style="margin-top: 20px; padding: 15px; background-color: #c3e6cb; border-radius: 5px; max-width: 500px; margin-left: auto; margin-right: auto;">
                            <p style="margin: 5px 0; font-size: clamp(12px, 2.5vw, 16px);"><strong>Final Score:</strong> ${totalPoints} points</p>
                            <p style="margin: 5px 0; font-size: clamp(12px, 2.5vw, 16px);"><strong>Circle Choices:</strong> ${circleChoices}</p>
                            <p style="margin: 5px 0; font-size: clamp(12px, 2.5vw, 16px);"><strong>Square Choices:</strong> ${squareChoices}</p>
                            <p style="margin: 5px 0; font-size: clamp(12px, 2.5vw, 16px);"><strong>Impulsivity Score:</strong> ${impulsivityScore.toFixed(3)}</p>
                            <p style="margin: 5px 0; font-size: clamp(12px, 2.5vw, 16px);"><strong>Completion Time:</strong> ${completionTime.toFixed(1)} seconds</p>
                        </div>
                    </div>
                `;
                
                // Enable next button
                self.enableNextButton();
                
            } catch (error) {
                console.error('Error processing task data:', error);
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Error', 'Data processing failed');
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Completed', 'Error');
                self.enableNextButton();
            }
        }
    });
    
    // Add iframe to container
    var iframeContainer = document.getElementById('iframe-container');
    iframeContainer.appendChild(iframe);
    
    // Disable next button until task is completed
    this.disableNextButton();
    
    // Timeout after 10 minutes
    setTimeout(function() {
        if (!dataReceived) {
            mainContainer.innerHTML = `
                <div style="text-align: center; padding: 30px 15px; color: orange; background-color: #fff3cd; border-radius: 8px;">
                    <h3 style="font-size: clamp(18px, 4vw, 22px); margin: 10px 0;">⏰ Task Timeout</h3>
                    <p style="font-size: clamp(14px, 3vw, 16px); margin: 10px 0;">The task has taken longer than expected (10 minutes).</p>
                    <p style="font-size: clamp(14px, 3vw, 16px); margin: 10px 0;">Please continue with the survey.</p>
                </div>
            `;
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Error', 'Timeout after 10 minutes');
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Completed', 'Timeout');
            self.enableNextButton();
        }
    }, 600000); // 10 minutes
});
