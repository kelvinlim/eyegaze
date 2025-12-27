/**
 * DIRECT Qualtrics Integration for TCIP Task
 * 
 * This version loads the task content directly without iframe.
 * Use this if iframe communication is causing issues.
 */

Qualtrics.SurveyEngine.addOnload(function() {
    // Hide question text
    this.getQuestionContainer().style.display = 'none';
    
    // Create container
    const container = document.createElement('div');
    container.id = 'tcip-direct-container';
    container.style.cssText = 'width: 100%; min-height: 600px; padding: 20px; background-color: #f5f5f5;';
    
    // Add loading message
    container.innerHTML = `
        <div style="text-align: center; padding: 50px;">
            <h3>Loading Impulsivity Task...</h3>
            <p>Please wait while the task loads.</p>
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto;"></div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    this.getQuestionContainer().appendChild(container);
    
    // Disable next button
    this.disableNextButton();
    
    // Load task content via fetch
    fetch('https://casgil.github.io/TCIPJS/')
        .then(response => response.text())
        .then(html => {
            // Extract just the body content
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const bodyContent = doc.body.innerHTML;
            
            // Create a new container for the task
            const taskContainer = document.createElement('div');
            taskContainer.innerHTML = bodyContent;
            
            // Replace loading message with task
            container.innerHTML = '';
            container.appendChild(taskContainer);
            
            // Add completion button
            const completeBtn = document.createElement('button');
            completeBtn.innerHTML = 'Complete Task';
            completeBtn.style.cssText = 'background-color: #28a745; color: white; border: none; padding: 15px 30px; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 20px auto; display: block;';
            
            completeBtn.onclick = function() {
                // Store completion
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Completed', 'Yes');
                Qualtrics.SurveyEngine.setEmbeddedData('TCIP_CompletionTime', new Date().toISOString());
                
                // Show completion message
                container.innerHTML = '<div style="text-align: center; padding: 50px; color: green;"><h3>✓ Task Completed</h3><p>Thank you for completing the task.</p></div>';
                
                // Enable next button
                this.enableNextButton();
            }.bind(this);
            
            container.appendChild(completeBtn);
        })
        .catch(error => {
            console.error('Error loading task:', error);
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; color: red;">
                    <h3>Error Loading Task</h3>
                    <p>There was an error loading the impulsivity task.</p>
                    <button onclick="location.reload()" style="background-color: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Try Again</button>
                </div>
            `;
            this.enableNextButton();
        });
    
    // Timeout after 10 minutes
    setTimeout(() => {
        if (!container.querySelector('div[style*="color: green"]')) {
            container.innerHTML = '<div style="text-align: center; padding: 50px; color: orange;"><h3>Task Timeout</h3><p>Please continue with the survey.</p></div>';
            this.enableNextButton();
        }
    }, 600000);
});
