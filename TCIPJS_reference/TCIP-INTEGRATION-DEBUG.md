# TCIP Integration Debug - JavaScript Working but Task Not Loading

Since JavaScript is working in Qualtrics, here are the other potential issues:

## 🔍 Most Likely Issues

### 1. **Iframe Communication Problems**
**Problem**: Task loads but can't communicate with Qualtrics
**Symptoms**: Task appears but no data capture
**Debug**: Check browser console for CORS or postMessage errors

### 2. **Task URL Not Accessible**
**Problem**: `https://casgil.github.io/TCIPJS/` not loading
**Symptoms**: Blank iframe or loading error
**Debug**: Test URL directly in browser

### 3. **Missing Dependencies in Task**
**Problem**: Task files not loading properly
**Symptoms**: Task starts but breaks
**Debug**: Check Network tab in browser console

### 4. **Timing Issues**
**Problem**: Code runs before iframe is ready
**Symptoms**: No communication between iframe and parent
**Debug**: Add delays and check iframe load events

## 🧪 Debugging Steps

### Step 1: Test Task URL Directly
1. Open `https://casgil.github.io/TCIPJS/` in new browser tab
2. Verify task loads and works completely
3. If it doesn't work, the issue is with the task itself

### Step 2: Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for errors when task loads
4. Common errors:
   - `Failed to load resource` (404 errors)
   - `CORS policy` errors
   - `postMessage` errors

### Step 3: Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Reload the Qualtrics page
4. Look for failed requests (red entries)
5. Check if jsPsych files are loading

### Step 4: Test iframe Communication
Add this debug code to your integration:

```javascript
Qualtrics.SurveyEngine.addOnload(function() {
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://casgil.github.io/TCIPJS/';
    iframe.style.cssText = 'width: 100%; height: 600px; border: 1px solid red;';
    
    // Add debug logging
    iframe.onload = function() {
        console.log('✅ Iframe loaded successfully');
        
        // Test communication
        setTimeout(() => {
            try {
                iframe.contentWindow.postMessage({type: 'TEST'}, '*');
                console.log('✅ Message sent to iframe');
            } catch (error) {
                console.error('❌ Error sending message:', error);
            }
        }, 2000);
    };
    
    iframe.onerror = function() {
        console.error('❌ Iframe failed to load');
    };
    
    // Listen for messages
    window.addEventListener('message', function(event) {
        console.log('📨 Message received:', event.origin, event.data);
    });
    
    this.getQuestionContainer().appendChild(iframe);
    this.disableNextButton();
});
```

## 🔧 Common Fixes

### Fix 1: Add iframe Load Delay
```javascript
iframe.onload = function() {
    // Wait for iframe to be fully ready
    setTimeout(() => {
        // Your integration code here
    }, 3000); // 3 second delay
};
```

### Fix 2: Check Task Dependencies
Make sure your task has all required files:
- `jspsych.js`
- `plugin-html-button-response.js`
- `plugin-tcip-wait.js`
- `jspsych.css`

### Fix 3: Use Different Task URL
If GitHub Pages is causing issues, try:
- Host on different platform (Netlify, Vercel)
- Use local hosting for testing
- Check if URL is accessible from different networks

### Fix 4: Simplify Integration
Use the ultra-simple version that doesn't rely on iframe communication:

```javascript
Qualtrics.SurveyEngine.addOnload(function() {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://casgil.github.io/TCIPJS/';
    iframe.style.cssText = 'width: 100%; height: 600px; border: none;';
    
    const continueBtn = document.createElement('button');
    continueBtn.innerHTML = 'Continue Survey (Click after completing task)';
    continueBtn.style.cssText = 'background-color: #007bff; color: white; border: none; padding: 15px 30px; border-radius: 5px; cursor: pointer; margin-top: 20px;';
    
    continueBtn.onclick = function() {
        Qualtrics.SurveyEngine.setEmbeddedData('TCIP_Completed', 'Yes');
        this.enableNextButton();
    }.bind(this);
    
    this.getQuestionContainer().appendChild(iframe);
    this.getQuestionContainer().appendChild(continueBtn);
    this.disableNextButton();
});
```

## 🎯 Specific Issues to Check

### Issue 1: Task URL Accessibility
**Test**: Open `https://casgil.github.io/TCIPJS/` directly
**If fails**: Task needs to be deployed properly

### Issue 2: CORS Policy
**Test**: Check console for CORS errors
**If fails**: Task needs proper CORS headers

### Issue 3: Missing Files
**Test**: Check Network tab for 404 errors
**If fails**: Task files not deployed correctly

### Issue 4: Timing Issues
**Test**: Add delays and check iframe load events
**If fails**: Use setTimeout to wait for iframe readiness

## 🆘 Quick Diagnostic

**Run this test code** to identify the specific issue:

```javascript
Qualtrics.SurveyEngine.addOnload(function() {
    console.log('🔍 Starting TCIP diagnostic...');
    
    // Test 1: Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://casgil.github.io/TCIPJS/';
    iframe.style.cssText = 'width: 100%; height: 600px; border: 2px solid blue;';
    
    // Test 2: Monitor iframe events
    iframe.onload = function() {
        console.log('✅ Iframe loaded');
        
        // Test 3: Check iframe content
        setTimeout(() => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                console.log('✅ Iframe document accessible:', iframeDoc.title);
            } catch (error) {
                console.log('❌ Iframe document not accessible (CORS):', error.message);
            }
        }, 2000);
    };
    
    iframe.onerror = function() {
        console.log('❌ Iframe failed to load');
    };
    
    // Test 4: Listen for messages
    window.addEventListener('message', function(event) {
        console.log('📨 Message from iframe:', event.origin, event.data);
    });
    
    this.getQuestionContainer().appendChild(iframe);
    this.disableNextButton();
    
    // Test 5: Timeout after 10 seconds
    setTimeout(() => {
        console.log('⏰ 10 second timeout reached');
    }, 10000);
});
```

This will tell you exactly what's working and what's not!
