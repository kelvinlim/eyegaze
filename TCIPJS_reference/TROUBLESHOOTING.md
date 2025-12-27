# TCIP Qualtrics Integration - Troubleshooting Guide

## Problem: Task Does Not Start in Qualtrics

If your TCIP task is not starting when embedded in Qualtrics, follow these troubleshooting steps:

## 🔧 Immediate Solutions

### 1. **Use the Production Integration Code**
For live surveys, use `qualtrics-tcip-production.js` (FINAL). If you are diagnosing issues, you may temporarily use test scripts like `qualtrics-tcip-integration-improved.js`. The production script is the recommended default.

Test script includes:
- Better error handling and debugging
- Enhanced timeout protection
- Improved iframe loading detection
- Manual continue options

### 2. **Test the Task Independently**
Before using in Qualtrics, test the task works:
1. Open `test-task.html` in your browser
2. Complete the full task
3. Verify data is saved as `mydata.csv`
4. If this works, the issue is with the Qualtrics integration

### 3. **Use the Simplified Task Version**
Replace your `index.html` with `index-simplified.html` which:
- Removes dependencies on missing files (`main.js`)
- Removes unnecessary TaskFlow integration
- Includes better iframe compatibility
- Has improved styling for embedded use

## 🐛 Common Issues & Solutions

### Issue 1: "Loading..." Message Stays Forever

**Symptoms:** Task shows loading message but never starts

**Solutions:**
1. **Check Browser Console** (F12 → Console tab)
   - Look for JavaScript errors
   - Check for network errors (404, CORS issues)

2. **Verify Task URL**
   - Ensure `https://casgil.github.io/TCIPJS/` is accessible
   - Test the URL directly in a new browser tab

3. **Check iframe Security**
   - Some browsers block iframes from different domains
   - Try in different browsers (Chrome, Firefox, Safari)

### Issue 2: Task Loads But Doesn't Start

**Symptoms:** Task loads but instructions don't appear

**Solutions:**
1. **Missing Dependencies**
   - Ensure all jsPsych files are accessible
   - Check that `plugin-tcip-wait.js` is loading correctly

2. **JavaScript Errors**
   - Open browser console (F12)
   - Look for red error messages
   - Common issues: undefined variables, missing functions

### Issue 3: Data Not Captured

**Symptoms:** Task completes but no embedded data is created

**Solutions:**
1. **Check Message Communication**
   - Ensure iframe can communicate with parent window
   - Verify `postMessage` API is working

2. **Verify Integration Code**
   - Make sure you're using the improved version
   - Check that the message listener is properly set up

## 🔍 Debugging Steps

### Step 1: Enable Console Logging
Add this to your Qualtrics integration code for debugging:

```javascript
// Add this at the beginning of your integration code
console.log('TCIP Integration starting...');
console.log('Qualtrics version:', Qualtrics.version);
console.log('Current question:', this.getQuestionContainer());
```

### Step 2: Check Network Requests
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Refresh the Qualtrics page
4. Look for failed requests (red entries)
5. Check if jsPsych files are loading correctly

### Step 3: Test iframe Communication
Add this test code to verify iframe communication works:

```javascript
// Test iframe communication
iframe.onload = function() {
    console.log('Iframe loaded, testing communication...');
    
    // Send test message
    iframe.contentWindow.postMessage({
        type: 'TEST_MESSAGE',
        test: true
    }, '*');
    
    // Listen for response
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'TEST_RESPONSE') {
            console.log('✅ Iframe communication working!');
        }
    });
};
```

## 🚀 Quick Fix Checklist

- [ ] **Use `qualtrics-tcip-production.js`** for production surveys
- [ ] If debugging, you may try `qualtrics-tcip-integration-improved.js` (test-only)
- [ ] **Replace `index.html` with `index-simplified.html`** (removes missing dependencies)
- [ ] **Test task independently** with `test-task.html` first
- [ ] **Check browser console** for error messages
- [ ] **Verify task URL** is accessible (`https://casgil.github.io/TCIPJS/`)
- [ ] **Try different browser** (Chrome, Firefox, Safari)
- [ ] **Clear browser cache** and try again
- [ ] **Check Qualtrics question type** (must be Text/Graphic with JavaScript)

## 📋 Alternative Solutions

### Option 1: Direct Embedding (No iframe)
If iframe issues persist, you can embed the task directly:

1. Copy the HTML content from `index-simplified.html`
2. Paste it directly into a Qualtrics Text/Graphic question
3. Remove the iframe wrapper from the integration code
4. Modify the integration code to work with direct embedding

### Option 2: External Link
As a fallback, you can:
1. Create a simple question with a link to the task
2. Have participants complete the task in a new window
3. Use a completion code or separate data collection method

### Option 3: Use Different Hosting
If GitHub Pages is causing issues:
1. Host the task on a different platform (Netlify, Vercel, etc.)
2. Update the URL in the integration code
3. Ensure CORS headers are properly configured

## 🆘 Getting Help

If none of these solutions work:

1. **Collect Debug Information:**
   - Browser type and version
   - Error messages from console
   - Screenshots of the issue
   - Steps to reproduce

2. **Test Environment:**
   - Try in different browsers
   - Test on different devices
   - Check if it works in Qualtrics preview vs. live survey

3. **Contact Information:**
   - Provide the specific error messages
   - Include your Qualtrics survey setup details
   - Mention which solutions you've already tried

## 📝 Version History

- **v1.0**: Original integration (basic iframe embedding)
- **v1.1**: Added error handling and timeout protection
- **v1.2**: Enhanced debugging and simplified task version
- **v1.3**: Improved integration with better iframe communication


