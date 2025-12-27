/**
 * IFRAME DEBUG for Qualtrics TCIP Integration
 * 
 * This version will show us exactly what's happening inside the iframe.
 * Use this to debug why the task isn't displaying.
 */

Qualtrics.SurveyEngine.addOnload(function() {
    console.log('🔍 IFRAME DEBUG: Starting...');
    
    // Hide question text
    this.getQuestionContainer().style.display = 'none';
    
    // Create container
    const container = document.createElement('div');
    container.id = 'iframe-debug-container';
    container.style.cssText = 'width: 100%; min-height: 600px; padding: 20px; background-color: #f0f8ff; border: 2px solid #007bff;';
    
    // Add debug info
    container.innerHTML = `
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3>🔍 Iframe Debug Mode</h3>
            <p><strong>Status:</strong> <span id="debug-status">Creating iframe...</span></p>
            <p><strong>Iframe Loaded:</strong> <span id="iframe-loaded">No</span></p>
            <p><strong>Iframe Content:</strong> <span id="iframe-content">Checking...</span></p>
            <p><strong>Messages Sent:</strong> <span id="messages-sent">0</span></p>
            <p><strong>Messages Received:</strong> <span id="messages-received">0</span></p>
        </div>
        <div id="iframe-container" style="border: 2px solid #28a745; border-radius: 5px; min-height: 500px; background-color: white;">
            <div style="text-align: center; padding: 50px; color: #666;">
                <p>Loading iframe...</p>
            </div>
        </div>
    `;
    
    this.getQuestionContainer().appendChild(container);
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://casgil.github.io/TCIPJS/';
    iframe.id = 'tcip-iframe';
    iframe.style.cssText = 'width: 100%; height: 500px; border: none;';
    
    let messagesSent = 0;
    let messagesReceived = 0;
    
    // Update debug info
    function updateStatus(message) {
        console.log('🔍 Status:', message);
        const statusEl = document.getElementById('debug-status');
        if (statusEl) statusEl.textContent = message;
    }
    
    function updateIframeLoaded(status) {
        const loadedEl = document.getElementById('iframe-loaded');
        if (loadedEl) loadedEl.textContent = status;
    }
    
    function updateIframeContent(content) {
        const contentEl = document.getElementById('iframe-content');
        if (contentEl) contentEl.textContent = content;
    }
    
    function updateMessagesSent() {
        messagesSent++;
        const sentEl = document.getElementById('messages-sent');
        if (sentEl) sentEl.textContent = messagesSent;
    }
    
    function updateMessagesReceived() {
        messagesReceived++;
        const receivedEl = document.getElementById('messages-received');
        if (receivedEl) receivedEl.textContent = messagesReceived;
    }
    
    // Iframe load handler
    iframe.onload = function() {
        console.log('🔍 Iframe loaded event triggered');
        updateStatus('Iframe loaded - testing content...');
        updateIframeLoaded('Yes');
        
        // Test iframe content access
        setTimeout(() => {
            try {
                console.log('🔍 Testing iframe content access...');
                
                // Try to access iframe document
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                console.log('🔍 Iframe document:', iframeDoc);
                console.log('🔍 Iframe title:', iframeDoc.title);
                console.log('🔍 Iframe body:', iframeDoc.body);
                
                if (iframeDoc.title) {
                    updateIframeContent(`Title: ${iframeDoc.title}`);
                } else {
                    updateIframeContent('No title found');
                }
                
                // Check if jsPsych is loaded
                try {
                    const jsPsych = iframe.contentWindow.jsPsych;
                    if (jsPsych) {
                        console.log('🔍 jsPsych found in iframe:', jsPsych);
                        updateIframeContent(`Title: ${iframeDoc.title} | jsPsych: Found`);
                    } else {
                        console.log('🔍 jsPsych not found in iframe');
                        updateIframeContent(`Title: ${iframeDoc.title} | jsPsych: Not found`);
                    }
                } catch (error) {
                    console.log('🔍 Cannot access jsPsych:', error.message);
                    updateIframeContent(`Title: ${iframeDoc.title} | jsPsych: Cannot access`);
                }
                
                // Send integration message
                try {
                    iframe.contentWindow.postMessage({
                        type: 'QUALTRICS_INTEGRATION',
                        enableDataCapture: true
                    }, 'https://casgil.github.io');
                    
                    console.log('🔍 Integration message sent');
                    updateMessagesSent();
                    updateStatus('Integration message sent - waiting for response...');
                    
                } catch (error) {
                    console.error('🔍 Error sending message:', error);
                    updateStatus('Error sending message: ' + error.message);
                }
                
            } catch (error) {
                console.error('🔍 Cannot access iframe content:', error);
                updateIframeContent('Cannot access iframe content: ' + error.message);
                updateStatus('Cannot access iframe content - possible CORS issue');
            }
        }, 3000);
    };
    
    // Iframe error handler
    iframe.onerror = function() {
        console.error('🔍 Iframe error event triggered');
        updateStatus('Iframe failed to load');
        updateIframeLoaded('Error');
        updateIframeContent('Failed to load');
    };
    
    // Message listener
    window.addEventListener('message', function(event) {
        console.log('🔍 Message received:', event.origin, event.data);
        updateMessagesReceived();
        
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
    
    // Add iframe to container
    const iframeContainer = document.getElementById('iframe-container');
    iframeContainer.innerHTML = '';
    iframeContainer.appendChild(iframe);
    
    updateStatus('Iframe created and added to page');
    
    // Disable next button
    this.disableNextButton();
    
    // Timeout after 5 minutes
    setTimeout(() => {
        console.log('🔍 5 minute timeout reached');
        if (!container.querySelector('div[style*="color: green"]')) {
            updateStatus('Timeout - check debug info above');
            this.enableNextButton();
        }
    }, 300000); // 5 minutes
});
