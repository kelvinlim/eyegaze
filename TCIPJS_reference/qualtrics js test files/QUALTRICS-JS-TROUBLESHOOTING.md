# Qualtrics JavaScript Not Running - Troubleshooting Guide

## 🔍 Common Causes & Solutions

### 1. **Wrong Question Type**
**Problem**: JavaScript only works in certain question types
**Solution**: 
- ✅ Use **Text/Graphic** question type
- ❌ Don't use Multiple Choice, Text Entry, etc.

### 2. **JavaScript Not Enabled**
**Problem**: JavaScript is disabled in survey settings
**Solution**:
1. Go to **Survey Options** → **Security**
2. Make sure **"Allow JavaScript"** is checked
3. Save and republish survey

### 3. **Wrong JavaScript Section**
**Problem**: Code placed in wrong location
**Solution**:
1. Click on your question
2. Click **JavaScript** button (not HTML)
3. Paste code in the JavaScript section
4. Click **Save**

### 4. **Survey Not Republished**
**Problem**: Changes not saved to live survey
**Solution**:
1. Make your changes
2. Click **Publish** button
3. Choose **"Republish"** option
4. Test the live survey (not just preview)

### 5. **Browser Security Issues**
**Problem**: Browser blocking JavaScript
**Solution**:
- Try different browser (Chrome, Firefox, Safari)
- Clear browser cache
- Disable ad blockers temporarily
- Check browser console for errors (F12)

## 🧪 Testing Steps

### Step 1: Verify JavaScript is Running
Add this test code to your question:

```javascript
Qualtrics.SurveyEngine.addOnload(function() {
    alert('JavaScript is working!');
    console.log('JavaScript loaded successfully');
});
```

**Expected result**: You should see an alert popup when the question loads.

### Step 2: Check Browser Console
1. Open browser Developer Tools (F12)
2. Go to **Console** tab
3. Look for error messages (red text)
4. Common errors:
   - `Qualtrics is not defined`
   - `CORS error`
   - `Blocked by security policy`

### Step 3: Verify Question Setup
1. **Question Type**: Must be Text/Graphic
2. **JavaScript Section**: Code in JavaScript, not HTML
3. **Survey Published**: Changes saved and republished
4. **Live Survey**: Testing live survey, not preview

## 🔧 Quick Fixes

### Fix 1: Enable JavaScript in Survey
```
Survey Options → Security → Allow JavaScript → Save → Republish
```

### Fix 2: Use Correct Question Type
```
Create New Question → Text/Graphic → Add JavaScript
```

### Fix 3: Check Code Placement
```
Question → JavaScript Button → Paste Code → Save
```

### Fix 4: Force Republish
```
Survey → Publish → Republish → Test Live Survey
```

## 🐛 Debugging Code

### Test if Qualtrics is Available
```javascript
Qualtrics.SurveyEngine.addOnload(function() {
    if (typeof Qualtrics !== 'undefined') {
        console.log('✅ Qualtrics is available');
    } else {
        console.log('❌ Qualtrics is not available');
    }
});
```

### Test if Question is Loading
```javascript
Qualtrics.SurveyEngine.addOnload(function() {
    console.log('✅ Question loaded');
    this.getQuestionContainer().style.border = '5px solid red';
});
```

### Test if JavaScript Section Works
```javascript
// This should work in any Text/Graphic question
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded');
    alert('JavaScript is working!');
});
```

## 📋 Checklist

Before asking for help, verify:

- [ ] **Question Type**: Text/Graphic (not Multiple Choice, etc.)
- [ ] **JavaScript Enabled**: Survey Options → Security → Allow JavaScript
- [ ] **Code Location**: JavaScript section (not HTML section)
- [ ] **Survey Published**: Changes saved and republished
- [ ] **Testing Method**: Live survey (not preview)
- [ ] **Browser**: Different browsers tested
- [ ] **Console**: No error messages in browser console
- [ ] **Test Code**: Simple alert() works

## 🆘 If Nothing Works

### Alternative 1: Use HTML Instead
If JavaScript won't work, try embedding the task directly in HTML:

```html
<iframe src="https://casgil.github.io/TCIPJS/" width="100%" height="600px" frameborder="0"></iframe>
```

### Alternative 2: Use External Link
Create a simple question with a link to the task:

```html
<p>Please complete this task: <a href="https://casgil.github.io/TCIPJS/" target="_blank">Click here to start the task</a></p>
```

### Alternative 3: Contact Qualtrics Support
If JavaScript is enabled but still not working, contact Qualtrics support with:
- Your survey ID
- Specific question where JavaScript should run
- Browser and version you're testing with

## 🎯 Most Common Solution

**90% of the time, the issue is one of these**:

1. **JavaScript not enabled in survey settings**
2. **Using wrong question type** (not Text/Graphic)
3. **Not republishing the survey** after making changes
4. **Testing in preview instead of live survey**

Try these in order - one of them will likely fix your issue!
