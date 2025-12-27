/**
 * DIRECT URL TEST for Qualtrics
 * 
 * This version tests the task URL directly without iframe to see if it's accessible.
 */

Qualtrics.SurveyEngine.addOnload(function() {
    console.log('🔍 DIRECT URL TEST: Starting...');
    
    // Hide question text
    this.getQuestionContainer().style.display = 'none';
    
    // Create container
    const container = document.createElement('div');
    container.id = 'direct-test-container';
    container.style.cssText = 'width: 100%; min-height: 600px; padding: 20px; background-color: #f8f9fa; border: 2px solid #6c757d;';
    
    // Add test info
    container.innerHTML = `
        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3>🔍 Direct URL Test</h3>
            <p><strong>Testing URL:</strong> https://casgil.github.io/TCIPJS/</p>
            <p><strong>Status:</strong> <span id="test-status">Testing...</span></p>
            <p><strong>Response:</strong> <span id="test-response">Waiting...</span></p>
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
            const hasBody = html.includes('<body');
            
            // Show results
            const resultsDiv = document.getElementById('test-results');
            resultsDiv.innerHTML = `
                <h4>URL Test Results:</h4>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p><strong>HTML Length:</strong> ${html.length} characters</p>
                    <p><strong>Contains jsPsych:</strong> ${hasJsPsych ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>Contains TCIP:</strong> ${hasTCIP ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>Contains Scripts:</strong> ${hasScripts ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>Contains Body:</strong> ${hasBody ? '✅ Yes' : '❌ No'}</p>
                </div>
                <h4>HTML Content Preview:</h4>
                <pre style="background-color: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; font-size: 12px; max-height: 300px;">${html.substring(0, 2000)}...</pre>
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
            document.getElementById('test-response').textContent = '✅ Iframe loaded successfully';
            document.getElementById('test-response').style.color = 'green';
        };
        
        iframe.onerror = function() {
            console.error('🔍 Iframe failed to load');
            document.getElementById('test-response').textContent = '❌ Iframe failed to load';
            document.getElementById('test-response').style.color = 'red';
        };
        
        const resultsDiv = document.getElementById('test-results');
        resultsDiv.innerHTML += '<h4>Iframe Test:</h4>';
        resultsDiv.appendChild(iframe);
    }
    
    // Disable next button initially
    this.disableNextButton();
    
    // Enable next button after 2 minutes
    setTimeout(() => {
        this.enableNextButton();
    }, 120000); // 2 minutes
});
