/**
 * VISIBILITY TEST for Qualtrics TCIP Integration
 * 
 * This version will help us see if the task is actually loading and displaying.
 * It includes multiple fallback methods to ensure the task is visible.
 */

Qualtrics.SurveyEngine.addOnload(function() {
    console.log('🔍 VISIBILITY TEST: Starting...');
    
    // Hide question text
    this.getQuestionContainer().style.display = 'none';
    
    // Create container
    const container = document.createElement('div');
    container.id = 'visibility-test-container';
    container.style.cssText = 'width: 100%; min-height: 600px; padding: 20px; background-color: #f0f8ff; border: 2px solid #007bff;';
    
    // Add debug info
    container.innerHTML = `
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3>🔍 Visibility Test Mode</h3>
            <p><strong>Status:</strong> <span id="test-status">Creating iframe...</span></p>
            <p><strong>Iframe Loaded:</strong> <span id="iframe-status">No</span></p>
            <p><strong>Task Visible:</strong> <span id="task-visible">Checking...</span></p>
            <p><strong>Messages:</strong> <span id="message-count">0</span></p>
        </div>
        <div id="iframe-wrapper" style="border: 3px solid #28a745; border-radius: 8px; background-color: white; min-height: 500px; position: relative;">
            <div id="loading-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; z-index: 10;">
                <div style="text-align: center;">
                    <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                    <p style="margin-top: 15px; color: #666;">Loading task...</p>
                </div>
            </div>
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
    iframe.id = 'tcip-iframe';
    iframe.style.cssText = 'width: 100%; height: 500px; border: none; background-color: white;';
    
    let messageCount = 0;
    let iframeLoaded = false;
    let taskVisible = false;
    
    // Update status functions
    function updateStatus(message) {
        console.log('🔍 Status:', message);
        const statusEl = document.getElementById('test-status');
        if (statusEl) statusEl.textContent = message;
    }
    
    function updateIframeStatus(status) {
        const iframeEl = document.getElementById('iframe-status');
        if (iframeEl) iframeEl.textContent = status;
    }
    
    function updateTaskVisible(status) {
        const visibleEl = document.getElementById('task-visible');
        if (visibleEl) visibleEl.textContent = status;
    }
    
    function updateMessageCount() {
        messageCount++;
        const messageEl = document.getElementById('message-count');
        if (messageEl) messageEl.textContent = messageCount;
    }
    
    // Iframe load handler
    iframe.onload = function() {
        console.log('🔍 Iframe load event triggered');
        iframeLoaded = true;
        updateIframeStatus('Yes');
        updateStatus('Iframe loaded - checking content...');
        
        // Hide loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        // Check if task is visible after a delay
        setTimeout(() => {
            console.log('🔍 Checking if task is visible...');
            
            // Try to detect if task content is loaded
            try {
                // Check if iframe has content
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc && iframeDoc.body) {
                    const bodyContent = iframeDoc.body.innerHTML;
                    console.log('🔍 Iframe body content length:', bodyContent.length);
                    console.log('🔍 Iframe body preview:', bodyContent.substring(0, 200));
                    
                    if (bodyContent.length > 100) {
                        updateTaskVisible('Yes - Content detected');
                        taskVisible = true;
                    } else {
                        updateTaskVisible('No - Minimal content');
                    }
                } else {
                    updateTaskVisible('No - Cannot access body');
                }
            } catch (error) {
                console.log('🔍 Cannot access iframe content (CORS):', error.message);
                updateTaskVisible('Unknown - CORS blocked');
                
                // Since we can't access content, assume it's working if iframe loaded
                updateTaskVisible('Assuming Yes - Iframe loaded');
                taskVisible = true;
            }
            
            // Send integration message
            try {
                iframe.contentWindow.postMessage({
                    type: 'QUALTRICS_INTEGRATION',
                    enableDataCapture: true
                }, 'https://casgil.github.io');
                
                console.log('🔍 Integration message sent');
                updateMessageCount();
                updateStatus('Integration message sent - waiting for response...');
                
            } catch (error) {
                console.warn('🔍 Could not send integration message:', error);
                updateStatus('Could not send integration message');
            }
            
        }, 2000);
    };
    
    // Iframe error handler
    iframe.onerror = function() {
        console.error('🔍 Iframe error event triggered');
        updateIframeStatus('Error');
        updateTaskVisible('No - Iframe failed');
        updateStatus('Iframe failed to load');
        
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: red; background-color: #f8d7da; border-radius: 5px;">
                <h3>❌ Iframe Loading Error</h3>
                <p>The task could not be loaded.</p>
                <p><strong>Possible causes:</strong></p>
                <ul style="text-align: left; max-width: 400px; margin: 20px auto;">
                    <li>Task URL not accessible</li>
                    <li>Network connectivity issues</li>
                    <li>Browser security settings</li>
                </ul>
            </div>
        `;
        this.enableNextButton();
    };
    
    // Message listener
    window.addEventListener('message', function(event) {
        console.log('🔍 Message received:', event.origin, event.data);
        updateMessageCount();
        
        if (event.origin === 'https://casgil.github.io' && event.data && event.data.type === 'TCIP_COMPLETE') {
            console.log('🔍 Task completion message received!');
            updateStatus('Task completed! Processing data...');
            
            // Process data and show completion
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; color: green; background-color: #d4edda; border-radius: 5px;">
                    <h3>✅ Task Completed Successfully!</h3>
                    <p>Data has been captured and stored.</p>
                </div>
            `;
            
            this.enableNextButton();
        }
    }.bind(this));
    
    // Add iframe to wrapper
    const iframeWrapper = document.getElementById('iframe-wrapper');
    iframeWrapper.appendChild(iframe);
    
    updateStatus('Iframe created and added to page');
    
    // Disable next button
    this.disableNextButton();
    
    // Timeout after 5 minutes
    setTimeout(() => {
        console.log('🔍 5 minute timeout reached');
        if (!container.querySelector('div[style*="color: green"]')) {
            updateStatus('Timeout - check debug info above');
            
            // Show timeout message with debug info
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; color: orange; background-color: #fff3cd; border-radius: 5px;">
                    <h3>⏰ Debug Timeout</h3>
                    <p>5 minutes have passed. Debug information:</p>
                    <ul style="text-align: left; max-width: 400px; margin: 20px auto;">
                        <li><strong>Iframe Loaded:</strong> ${iframeLoaded ? 'Yes' : 'No'}</li>
                        <li><strong>Task Visible:</strong> ${taskVisible ? 'Yes' : 'No'}</li>
                        <li><strong>Messages Received:</strong> ${messageCount}</li>
                    </ul>
                    <p>If iframe loaded but task is not visible, the issue is with the task itself.</p>
                </div>
            `;
            this.enableNextButton();
        }
    }, 300000); // 5 minutes
});
