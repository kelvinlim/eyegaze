/**
 * SIMPLE Qualtrics Integration for TCIP Task
 * 
 * Minimal code to embed the TCIP task in Qualtrics.
 * Just copy and paste this into a Text/Graphic question's JavaScript section.
 */

Qualtrics.SurveyEngine.addOnload(function() {
    // Hide question text
    this.getQuestionContainer().style.display = 'none';
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://casgil.github.io/TCIPJS/';
    iframe.style.cssText = 'width: 100%; height: 600px; border: none;';
    
    // Add to page
    this.getQuestionContainer().appendChild(iframe);
    
    // Disable next button initially
    this.disableNextButton();
    
    // Listen for task completion
    window.addEventListener('message', function(event) {
        if (event.origin === 'https://casgil.github.io' && event.data && event.data.type === 'TCIP_COMPLETE') {
            // Store basic data
            const data = event.data.data;
            const choiceTrials = data.filter(trial => trial.task === 'choice');
            const addTrials = data.filter(trial => trial.task === 'add');
            
            // Calculate simple metrics
            let totalPoints = 0;
            let circleChoices = 0;
            let squareChoices = 0;
            
            choiceTrials.forEach(trial => {
                if (trial.response === 0) circleChoices++;
                if (trial.response === 1) squareChoices++;
            });
            
            if (addTrials.length > 0) {
                totalPoints = addTrials[addTrials.length - 1].points || 0;
            }
            
            const impulsivityScore = (circleChoices + squareChoices) > 0 ? circleChoices / (circleChoices + squareChoices) : 0;
            
            // Store in Qualtrics
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_TotalPoints', totalPoints);
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_CircleChoices', circleChoices);
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_SquareChoices', squareChoices);
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_ImpulsivityScore', impulsivityScore);
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_RawData', JSON.stringify(data));
            Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Completed', 'Yes');
            
            // Show completion message
            iframe.style.display = 'none';
            this.getQuestionContainer().innerHTML = '<div style="text-align: center; padding: 50px; color: green;"><h3>Task Completed!</h3><p>Thank you for completing the task.</p></div>';
            
            // Enable next button
            this.enableNextButton();
        }
    }.bind(this));
    
    // Timeout after 10 minutes
    setTimeout(() => {
        if (!this.getQuestionContainer().querySelector('div[style*="color: green"]')) {
            this.getQuestionContainer().innerHTML = '<div style="text-align: center; padding: 50px; color: red;"><h3>Task Timeout</h3><p>Please continue with the survey.</p></div>';
            this.enableNextButton();
        }
    }, 600000);
});
