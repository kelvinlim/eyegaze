/**
 * SIMPLE TEST CODE FOR QUALTRICS
 * 
 * Use this to test if JavaScript is working in your Qualtrics survey.
 * If this works, then you can use the TCIP integration code.
 */

Qualtrics.SurveyEngine.addOnload(function() {
    // Test 1: Show alert
    alert('JavaScript is working in Qualtrics!');
    
    // Test 2: Add visible content
    const testDiv = document.createElement('div');
    testDiv.innerHTML = '<h3 style="color: green;">✅ JavaScript Test Successful!</h3><p>If you can see this, JavaScript is working.</p>';
    testDiv.style.cssText = 'text-align: center; padding: 20px; background-color: #e8f5e8; border: 2px solid green; border-radius: 5px; margin: 20px 0;';
    
    this.getQuestionContainer().appendChild(testDiv);
    
    // Test 3: Console log
    console.log('✅ Qualtrics JavaScript test successful');
    
    // Test 4: Store test data
    Qualtrics.SurveyEngine.setEmbeddedData('JS_Test', 'Success');
    Qualtrics.SurveyEngine.setEmbeddedData('JS_Test_Time', new Date().toISOString());
    
    // Test 5: Enable next button
    this.enableNextButton();
});
