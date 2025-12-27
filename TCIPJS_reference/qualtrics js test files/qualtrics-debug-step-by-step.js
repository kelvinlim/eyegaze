/**
 * STEP-BY-STEP DEBUG for Qualtrics TCIP Integration
 * 
 * This version will help us identify exactly where the problem is.
 * Use this to debug the loading issue.
 */

Qualtrics.SurveyEngine.addOnload(function() {
    console.log('🔍 STEP 1: Integration starting...');
    
    // Hide question text
    this.getQuestionContainer().style.display = 'none';
    
    // Create container
    const container = document.createElement('div');
    container.id = 'tcip-debug-container';
    container.style.cssText = 'width: 100%; min-height: 600px; padding: 20px; background-color: #f0f8ff; border: 2px solid #007bff;';
    
    // Add debug info
    container.innerHTML = `
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3>🔍 TCIP Debug Mode</h3>
            <p><strong>Step 1:</strong> ✅ Integration started</p>
            <p><strong>Step 2:</strong> <span id="step2">Creating iframe...</span></p>
            <p><strong>Step 3:</strong> <span id="step3">Waiting for iframe load...</span></p>
            <p><strong>Step 4:</strong> <span id="step4">Testing communication...</span></p>
            <p><strong>Messages:</strong> <span id="messages">0</span></p>
            <p><strong>Errors:</strong> <span id="errors">0</span></p>
        </div>
    `;
    
    this.getQuestionContainer().appendChild(container);
    console.log('🔍 STEP 2: Container created and added to page');
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://casgil.github.io/TCIPJS/';
    iframe.id = 'tcip-iframe';
    iframe.style.cssText = 'width: 100%; height: 500px; border: 2px solid #28a745; border-radius: 5px; background-color: white;';
    
    console.log('🔍 STEP 3: Iframe created with src:', iframe.src);
    document.getElementById('step2').textContent = 'Iframe created';
    
    // Test iframe load
    iframe.onload = function() {
        console.log('🔍 STEP 4: Iframe loaded successfully!');
        document.getElementById('step3').textContent = '✅ Iframe loaded';
        document.getElementById('step4').textContent = 'Testing communication...';
        
        // Test if we can access iframe content
        setTimeout(() => {
            try {
                console.log('🔍 STEP 5: Testing iframe access...');
                
                // Try to access iframe content
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                console.log('🔍 Iframe document title:', iframeDoc.title);
                
                // Send test message
                iframe.contentWindow.postMessage({
                    type: 'QUALTRICS_INTEGRATION',
                    enableDataCapture: true
                }, 'https://casgil.github.io');
                
                console.log('🔍 STEP 6: Test message sent to iframe');
                document.getElementById('step4').textContent = '✅ Communication test sent';
                
            } catch (error) {
                console.error('🔍 STEP 6 ERROR: Cannot access iframe:', error);
                document.getElementById('step4').textContent = '❌ Cannot access iframe: ' + error.message;
                document.getElementById('errors').textContent = '1';
            }
        }, 2000);
    };
    
    iframe.onerror = function() {
        console.error('🔍 STEP 4 ERROR: Iframe failed to load');
        document.getElementById('step3').textContent = '❌ Iframe failed to load';
        document.getElementById('errors').textContent = '1';
        
        // Show error message
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: red; background-color: #f8d7da; border-radius: 5px;">
                <h3>❌ Iframe Loading Error</h3>
                <p>The task could not be loaded. This could be due to:</p>
                <ul style="text-align: left; max-width: 400px; margin: 20px auto;">
                    <li>Network connectivity issues</li>
                    <li>Task URL not accessible</li>
                    <li>Browser security settings</li>
                </ul>
                <p><strong>Task URL:</strong> https://casgil.github.io/TCIPJS/</p>
                <p>Please try refreshing the page or contact the researcher.</p>
            </div>
        `;
        this.enableNextButton();
    }.bind(this);
    
    // Add iframe to container
    container.appendChild(iframe);
    console.log('🔍 STEP 3: Iframe added to container');
    
    // Listen for messages
    let messageCount = 0;
    window.addEventListener('message', function(event) {
        messageCount++;
        document.getElementById('messages').textContent = messageCount;
        console.log('🔍 MESSAGE RECEIVED:', event.origin, event.data);
        
        if (event.origin === 'https://casgil.github.io' && event.data && event.data.type === 'TCIP_COMPLETE') {
            console.log('🔍 TASK COMPLETED!');
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; color: green; background-color: #d4edda; border-radius: 5px;">
                    <h3>✅ Task Completed Successfully!</h3>
                    <p>Data has been captured and stored.</p>
                </div>
            `;
            this.enableNextButton();
        }
    }.bind(this));
    
    // Disable next button
    this.disableNextButton();
    
    // Timeout after 5 minutes
    setTimeout(() => {
        console.log('🔍 TIMEOUT: 5 minutes reached');
        if (!container.querySelector('div[style*="color: green"]')) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; color: orange; background-color: #fff3cd; border-radius: 5px;">
                    <h3>⏰ Debug Timeout</h3>
                    <p>5 minutes have passed. Check the debug info above.</p>
                    <p>If iframe loaded but no communication, the issue is with the task itself.</p>
                </div>
            `;
            this.enableNextButton();
        }
    }, 300000); // 5 minutes
});
