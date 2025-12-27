/**
 * ULTRA SIMPLE Qualtrics Integration for TCIP Task
 * 
 * This version just embeds the task and provides a manual continue button.
 * No automatic data capture - you'll need to collect data separately.
 */

Qualtrics.SurveyEngine.addOnload(function() {
    // Hide question text
    this.getQuestionContainer().style.display = 'none';
    
    // Create container
    const container = document.createElement('div');
    container.style.cssText = 'text-align: center; padding: 20px;';
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://casgil.github.io/TCIPJS/';
    iframe.style.cssText = 'width: 100%; height: 600px; border: 1px solid #ccc; border-radius: 5px;';
    
    // Create continue button
    const continueBtn = document.createElement('button');
    continueBtn.innerHTML = 'Continue Survey (Click after completing the task)';
    continueBtn.style.cssText = 'background-color: #007bff; color: white; border: none; padding: 15px 30px; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 20px;';
    
    continueBtn.onclick = function() {
        // Store completion flag
        Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Completed', 'Yes');
        Qualtrics.SurveyEngine.setEmbeddedData('TCIP_CompletionTime', new Date().toISOString());
        
        // Hide iframe and button
        iframe.style.display = 'none';
        continueBtn.style.display = 'none';
        
        // Show completion message
        container.innerHTML = '<div style="color: green; font-size: 18px;"><h3>✓ Task Completed</h3><p>Thank you for completing the task. You may continue with the survey.</p></div>';
        
        // Enable next button
        this.enableNextButton();
    }.bind(this);
    
    // Add elements
    container.appendChild(iframe);
    container.appendChild(continueBtn);
    this.getQuestionContainer().appendChild(container);
    
    // Disable next button initially
    this.disableNextButton();
    
    // Auto-enable after 15 minutes (safety net)
    setTimeout(() => {
        if (continueBtn.style.display !== 'none') {
            continueBtn.click();
        }
    }, 900000); // 15 minutes
});
