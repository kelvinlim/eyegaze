# TCIP Qualtrics Integration Guide

This guide explains how to integrate the Two Choice Impulsivity Paradigm (TCIP) task into a Qualtrics survey.

Important: Use `qualtrics-tcip-production.js` for production surveys. All other Qualtrics JS files in this repo are test/fallback utilities only.

## Files Included

1. **`qualtrics-tcip-production.js`** - FINAL production integration script (use this in your survey)
2. Other files in `qualtrics js test files/` - Test/fallback scripts for diagnostics and edge cases
3. **`README-Qualtrics-Integration.md`** - This instruction guide

## Setup Instructions

### Step 1: Update the TCIP Task

1. Replace the content of your `index.html` file with the content from `tcip-qualtrics-modified.html`
2. Deploy the updated task to your web server (e.g., GitHub Pages)
3. Ensure the task is accessible at the URL you'll use in the integration code

### Step 2: Set Up Qualtrics Survey (Production)

1. **Create a new question** in your Qualtrics survey:
   - Question Type: **Text/Graphic**
   - Question Text: Leave blank or add instructions like "Please complete the following task"

2. **Add the integration code**:
   - Click on the question to select it
   - Click the **JavaScript** button in the question options
   - Copy and paste the entire content of `qualtrics-tcip-production.js`
   - Click **Save**

3. **Update the task URL** (if needed):
   - In the integration code, find this line:
     ```javascript
     iframe.src = 'https://casgil.github.io/TCIPJS/';
     ```
   - Replace with your actual task URL

### Step 3: Configure Embedded Data Fields

The integration automatically creates the following embedded data fields in your survey:

- `TCIP_TotalPoints` - Final point total
- `TCIP_CircleChoices` - Number of times circle was chosen  
- `TCIP_SquareChoices` - Number of times square was chosen
- `TCIP_TotalChoices` - Total number of choices made
- `TCIP_AvgDelay` - Average delay for circle choices (seconds)
- `TCIP_ImpulsivityScore` - Ratio of circle to total choices (0-1)
- `TCIP_CompletionTime` - Total time to complete task (seconds)
- `TCIP_StartTime` - Timestamp when task started
- `TCIP_EndTime` - Timestamp when task completed
- `TCIP_RawData` - Complete trial-by-trial data (JSON string)
- `TCIP_TaskCompleted` - Whether task was completed successfully
- `TCIP_DataTimestamp` - When data was processed

## How It Works (Production Script)

1. **Task Loading**: The integration creates an iframe that loads your TCIP task
2. **Data Collection**: The modified task collects all behavioral data as usual
3. **Data Transmission**: When the task completes, it sends the data to the parent window (Qualtrics)
4. **Data Processing**: The integration code processes the raw data into summary statistics
5. **Data Storage**: All data is stored as embedded data fields in Qualtrics

## Data Analysis

### Key Measures

- **Impulsivity Score**: `TCIP_ImpulsivityScore` (0-1, higher = more impulsive)
- **Total Points**: `TCIP_TotalPoints` (participant's final score)
- **Choice Patterns**: `TCIP_CircleChoices` vs `TCIP_SquareChoices`
- **Delay Tolerance**: `TCIP_AvgDelay` (average delay for circle choices)

### Raw Data Structure

The `TCIP_RawData` field contains JSON with trial-by-trial data:

```json
[
  {
    "trial_type": "html-button-response",
    "trial_index": 0,
    "task": "choice",
    "response": 0,
    "delay": 5000,
    "shape": "Circle",
    "rt": 1250,
    "time_elapsed": 2500
  },
  // ... more trials
]
```

## Troubleshooting

### Common Issues

1. **Task doesn't load**:
   - Check that the task URL is correct and accessible
   - Ensure the task is deployed and working independently
   - Check browser console for errors

2. **Data not captured**:
   - Verify the task is using the modified version with iframe support
   - Check that the task completes successfully (15 trials)
   - Look for JavaScript errors in browser console

3. **Embedded data missing**:
   - Ensure the integration code is properly saved in Qualtrics
   - Check that the question is not skipped by participants
   - Verify embedded data fields are enabled in survey settings

### Error Handling

The integration includes several error handling features:

- **Timeout Protection**: Task automatically continues after 10 minutes
- **Manual Continue**: Button appears after 5 minutes if task isn't completed
- **Error Logging**: Errors are logged to browser console and stored as embedded data
- **Graceful Degradation**: Survey continues even if task fails

## Customization

### Modifying the Task URL

To use a different version of the task:

```javascript
iframe.src = 'https://your-domain.com/your-task-path/';
```

### Adding Custom Data Fields

To capture additional data, modify the `processTaskData` function:

```javascript
Qualtrics.SurveyEngine.setEmbeddedData('TCIP_CustomField', customValue);
```

### Styling the Container

Modify the CSS in the integration code to match your survey design:

```javascript
container.style.cssText = `
    width: 100%;
    height: 600px;
    border: 2px solid #your-color;
    border-radius: 10px;
`;
```

## Security Considerations

- The integration uses `postMessage` API for secure cross-origin communication
- Origin checking ensures data only comes from your task domain
- All data transmission is one-way (task to Qualtrics)

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Works with Qualtrics surveys on all devices

## Support

For technical issues:

1. Check browser console for error messages
2. Verify all files are properly deployed
3. Test the task independently before integration
4. Contact the developer with specific error messages

## Version History

- **v1.0**: Initial integration with basic data capture
- **v1.1**: Added error handling and timeout protection
- **v1.2**: Enhanced data processing and summary statistics
- **v1.3**: Production script consolidated as `qualtrics-tcip-production.js`; others marked test-only
