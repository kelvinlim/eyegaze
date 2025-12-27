/**
 * DIRECT URL TEST for Qualtrics
 * 
 * This version tests if the task URL is accessible and what content it returns.
 * Use this to check if the problem is with the URL or the task itself.
 */

Qualtrics.SurveyEngine.addOnload(function() {
    console.log('🔍 URL DIRECT TEST: Starting...');
    
    // Hide question text
    this.getQuestionContainer().style.display = 'none';
    
    // Create container
    const container = document.createElement('div');
    container.id = 'url-test-container';
    container.style.cssText = 'width: 100%; min-height: 600px; padding: 20px; background-color: #f8f9fa; border: 2px solid #6c757d;';
    
    // Add test info
    container.innerHTML = `
        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3>🔍 Direct URL Test</h3>
            <p><strong>Testing URL:</strong> https://casgil.github.io/TCIPJS/</p>
            <p><strong>Status:</strong> <span id="test-status">Testing...</span></p>
            <p><strong>Response:</strong> <span id="test-response">Waiting...</span></p>
            <p><strong>Content Preview:</strong> <span id="content-preview">Loading...</span></p>
        </div>
        <div id="test-results" style="border: 2px solid #28a745; border-radius: 5px; min-height: 400px; background-color: white; padding: 20px;">
            <div style="text-align: center; padding: 50px; color: #666;">
                <p>Loading test results...</p>
            </div>
        </div>
    `;
    
    this.getQuestionContainer().appendChild(container);
    
    // Test URL accessibility
    const testUrl = 'https://casgil.github.io/TCIPJS/';
    console.log('🔍 Testing URL:', testUrl);
    
    // Method 1: Fetch test
    fetch(testUrl)
        .then(response => {
            console.log('🔍 Fetch response:', response.status, response.statusText);
            document.getElementById('test-response').textContent = `${response.status} ${response.statusText}`;
            
            if (response.ok) {
                document.getElementById('test-status').textContent = '✅ URL is accessible';
                document.getElementById('test-status').style.color = 'green';
                
                // Get response text
                return response.text();
            } else {
                document.getElementById('test-status').textContent = '❌ URL returned error';
                document.getElementById('test-status').style.color = 'red';
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        })
        .then(html => {
            console.log('🔍 Response HTML length:', html.length);
            console.log('🔍 Response HTML preview:', html.substring(0, 500));
            
            // Check for key elements
            const hasJsPsych = html.includes('jspsych');
            const hasTCIP = html.includes('TCIP') || html.includes('Impulsivity');
            const hasScripts = html.includes('<script');
            
            document.getElementById('content-preview').innerHTML = `
                <strong>HTML Length:</strong> ${html.length} characters<br>
                <strong>Contains jsPsych:</strong> ${hasJsPsych ? '✅ Yes' : '❌ No'}<br>
                <strong>Contains TCIP:</strong> ${hasTCIP ? '✅ Yes' : '❌ No'}<br>
                <strong>Contains Scripts:</strong> ${hasScripts ? '✅ Yes' : '❌ No'}
            `;
            
            // Show HTML preview
            const resultsDiv = document.getElementById('test-results');
            resultsDiv.innerHTML = `
                <h4>HTML Content Preview:</h4>
                <pre style="background-color: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; font-size: 12px;">${html.substring(0, 2000)}...</pre>
            `;
            
            // If URL is accessible, try to load iframe
            loadIframe();
        })
        .catch(error => {
            console.error('🔍 Fetch error:', error);
            document.getElementById('test-status').textContent = '❌ URL not accessible';
            document.getElementById('test-status').style.color = 'red';
            document.getElementById('test-response').textContent = error.message;
            
            const resultsDiv = document.getElementById('test-results');
            resultsDiv.innerHTML = `
                <div style="text-align: center; padding: 50px; color: red; background-color: #f8d7da; border-radius: 5px;">
                    <h3>❌ URL Test Failed</h3>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p>This means the task cannot be loaded. Possible solutions:</p>
                    <ul style="text-align: left; max-width: 400px; margin: 20px auto;">
                        <li>Check if the task is deployed correctly</li>
                        <li>Verify the URL is accessible</li>
                        <li>Try a different hosting platform</li>
                        <li>Check network connectivity</li>
                    </ul>
                </div>
            `;
            this.enableNextButton();
        });
    
    function loadIframe() {
        console.log('🔍 Loading iframe...');
        
        const iframe = document.createElement('iframe');
        iframe.src = testUrl;
        iframe.style.cssText = 'width: 100%; height: 400px; border: 2px solid #28a745; border-radius: 5px;';
        
        iframe.onload = function() {
            console.log('🔍 Iframe loaded successfully');
            
            // Test iframe content
            setTimeout(() => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    console.log('🔍 Iframe document title:', iframeDoc.title);
                    console.log('🔍 Iframe document body preview:', iframeDoc.body.innerHTML.substring(0, 200));
                    
                    if (iframeDoc.title.includes('Two Choice Impulsivity Paradigm')) {
                        document.getElementById('test-response').textContent = '✅ Task loaded correctly in iframe';
                        document.getElementById('test-response').style.color = 'green';
                    } else {
                        document.getElementById('test-response').textContent = '⚠️ Task loaded but title unexpected';
                        document.getElementById('test-response').style.color = 'orange';
                    }
                } catch (error) {
                    console.error('🔍 Cannot access iframe content:', error);
                    document.getElementById('test-response').textContent = '❌ Cannot access iframe content (CORS)';
                    document.getElementById('test-response').style.color = 'red';
                }
            }, 2000);
        };
        
        iframe.onerror = function() {
            console.error('🔍 Iframe failed to load');
            document.getElementById('test-response').textContent = '❌ Iframe failed to load';
            document.getElementById('test-response').style.color = 'red';
        };
        
        const resultsDiv = document.getElementById('test-results');
        resultsDiv.innerHTML = '<h4>Iframe Test:</h4>';
        resultsDiv.appendChild(iframe);
    }
    
    // Disable next button initially
    this.disableNextButton();
    
    // Enable next button after 2 minutes
    setTimeout(() => {
        this.enableNextButton();
    }, 120000); // 2 minutes
});
