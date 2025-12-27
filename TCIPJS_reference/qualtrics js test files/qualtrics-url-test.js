/**
 * URL TEST for Qualtrics TCIP Integration
 * 
 * This version tests if the task URL is accessible and loads properly.
 * Use this to check if the problem is with the URL or the task itself.
 */

Qualtrics.SurveyEngine.addOnload(function() {
    console.log('🔍 URL TEST: Starting...');
    
    // Hide question text
    this.getQuestionContainer().style.display = 'none';
    
    // Create container
    const container = document.createElement('div');
    container.id = 'url-test-container';
    container.style.cssText = 'width: 100%; min-height: 600px; padding: 20px; background-color: #f8f9fa; border: 2px solid #6c757d;';
    
    // Add test info
    container.innerHTML = `
        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3>🔍 URL Accessibility Test</h3>
            <p><strong>Testing URL:</strong> https://casgil.github.io/TCIPJS/</p>
            <p><strong>Status:</strong> <span id="status">Testing...</span></p>
            <p><strong>Response:</strong> <span id="response">Waiting...</span></p>
            <p><strong>Error:</strong> <span id="error">None</span></p>
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
            document.getElementById('response').textContent = `${response.status} ${response.statusText}`;
            
            if (response.ok) {
                document.getElementById('status').textContent = '✅ URL is accessible';
                document.getElementById('status').style.color = 'green';
                
                // If URL is accessible, try to load iframe
                loadIframe();
            } else {
                document.getElementById('status').textContent = '❌ URL returned error';
                document.getElementById('status').style.color = 'red';
                showError('URL returned error: ' + response.status);
            }
        })
        .catch(error => {
            console.error('🔍 Fetch error:', error);
            document.getElementById('status').textContent = '❌ URL not accessible';
            document.getElementById('status').style.color = 'red';
            document.getElementById('error').textContent = error.message;
            showError('Cannot access URL: ' + error.message);
        });
    
    function loadIframe() {
        console.log('🔍 Loading iframe...');
        
        const iframe = document.createElement('iframe');
        iframe.src = testUrl;
        iframe.style.cssText = 'width: 100%; height: 500px; border: 2px solid #28a745; border-radius: 5px;';
        
        iframe.onload = function() {
            console.log('🔍 Iframe loaded successfully');
            document.getElementById('status').textContent = '✅ Iframe loaded successfully';
            document.getElementById('status').style.color = 'green';
            
            // Test iframe content
            setTimeout(() => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    console.log('🔍 Iframe document title:', iframeDoc.title);
                    console.log('🔍 Iframe document body:', iframeDoc.body.innerHTML.substring(0, 100));
                    
                    if (iframeDoc.title.includes('Two Choice Impulsivity Paradigm')) {
                        document.getElementById('response').textContent = '✅ Task loaded correctly';
                        document.getElementById('response').style.color = 'green';
                    } else {
                        document.getElementById('response').textContent = '⚠️ Task loaded but title unexpected';
                        document.getElementById('response').style.color = 'orange';
                    }
                } catch (error) {
                    console.error('🔍 Cannot access iframe content:', error);
                    document.getElementById('response').textContent = '❌ Cannot access iframe content (CORS)';
                    document.getElementById('response').style.color = 'red';
                }
            }, 2000);
        };
        
        iframe.onerror = function() {
            console.error('🔍 Iframe failed to load');
            document.getElementById('status').textContent = '❌ Iframe failed to load';
            document.getElementById('status').style.color = 'red';
            showError('Iframe failed to load');
        };
        
        container.appendChild(iframe);
    }
    
    function showError(message) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: red; background-color: #f8d7da; border-radius: 5px;">
                <h3>❌ URL Test Failed</h3>
                <p><strong>Error:</strong> ${message}</p>
                <p><strong>URL:</strong> ${testUrl}</p>
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
    }
    
    // Disable next button initially
    this.disableNextButton();
    
    // Enable next button after 2 minutes
    setTimeout(() => {
        this.enableNextButton();
    }, 120000); // 2 minutes
});
