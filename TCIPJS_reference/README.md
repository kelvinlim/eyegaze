# Two Choice Impulsivity Paradigm (TCIP) - JavaScript Implementation

A web-based implementation of the Two Choice Impulsivity Paradigm for measuring delay discounting and impulsivity in psychological research.

## 📋 Overview

The Two Choice Impulsivity Paradigm (TCIP) is a behavioral task that measures impulsivity by presenting participants with choices between:
- **Circle**: Smaller, immediate reward (5 points) with increasing delay
- **Square**: Larger, delayed reward (15 points) with fixed delay

This implementation uses jsPsych framework and can be integrated into Qualtrics surveys for automated data collection.

## 👀 What Participants See

Participants complete a short decision-making task:

- Choose between two shapes each trial:
  - Circle: 5 points after a wait that gets 1s longer each time (5s, 6s, 7s, … up to 15s)
  - Square: 15 points after a fixed 15s wait every time
- Points are shown at the top-left; there are 15 total choices per session.
- After choosing, a countdown appears; when the wait ends, participants click the shape again to collect points.
- On the first screen, repeat participants can select “Skip Instructions” to jump straight to the task.

## 🎯 Key Features

- **15 trials** per session
- **Progressive delay system** for circle choices (5s → 6s → 7s → ... → 15s max)
- **Skip instructions option** on the first screen for repeat participants
- **Real-time point tracking** with visual feedback
- **Progress bar animation** during waiting periods
- **Qualtrics integration** with automatic or simplified data capture
- **Responsive design** for all screen sizes

## 📁 Project Structure

```
TCIPJS/
├── index.html                    # Main task interface
├── config.json                   # Configuration file
├── jspsych/                      # jsPsych library and plugins
│   ├── jspsych.js               # Core jsPsych library
│   ├── plugin-tcip-wait.js      # Custom wait plugin with progress bar
│   └── [other plugins]          # Standard jsPsych plugins
├── lib/taskflow/                # Integration library
│   └── client.js               # API client for research platforms
├── qualtrics-tcip-production.js # Qualtrics integration code
└── README.md                    # This file
```

## 🚀 Quick Start

### Standalone Usage

1. **Deploy the task** to a web server (e.g., GitHub Pages)
2. **Open `index.html`** in a web browser
3. **Complete the task** - data saves automatically as `mydata.csv`

### Qualtrics Integration

There are multiple integration paths depending on your organization's iframe policies and needs. In all cases, host this repository (e.g., GitHub Pages) and use that URL in Qualtrics.

Recommended paths (production vs. test-only):

1) Production integration (automatic capture) — FINAL
- Use `qualtrics-tcip-production.js` in a Text/Graphic question's JavaScript (this is the production-supported file)
- The task runs in an iframe and, upon completion, sends data via `postMessage` with type `TCIP_COMPLETE`
- The script processes trial data and stores summary metrics as Embedded Data

2) Simple/backup options — TEST ONLY
- See `SIMPLE-INTEGRATION-GUIDE.md` for test/fallback options:
  - `qualtrics-tcip-simple.js` (automatic capture, minimal code)
  - `qualtrics-tcip-ultra-simple.js` (manual continue, no auto capture)
  - `qualtrics-tcip-direct.js` (loads task directly without iframe)

3) Full guide
- See `README-Qualtrics-Integration.md` for step-by-step setup, embedded data fields, troubleshooting, and customization.

## 📊 Data Collection

### Standalone Data
- **File**: `mydata.csv` (automatically downloaded)
- **Format**: CSV with trial-by-trial data
- **Fields**: Response, reaction time, delay, points, etc.

### Qualtrics Embedded Data
- `TCIP_TotalPoints` - Final point total
- `TCIP_CircleChoices` - Number of circle choices
- `TCIP_SquareChoices` - Number of square choices
- `TCIP_ImpulsivityScore` - Impulsivity ratio (0-1)
- `TCIP_CompletionTime` - Total time to complete (seconds)
- `TCIP_RawData` - Complete trial-by-trial data (JSON)
- `TCIP_Completed` - Task completion status

Note: When run inside Qualtrics, the task posts `TCIP_COMPLETE` with full trial data to the parent window. The integration scripts in `qualtrics js test files/` handle parsing and storing embedded data.

## 🔧 Technical Details

### Dependencies
- **jsPsych 7.0+** - Psychology experiment framework
- **Custom Plugin** - `plugin-tcip-wait.js` for progress bar animation
- **Modern Browser** - Chrome, Firefox, Safari, Edge

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### Mobile Support
- ✅ Responsive design
- ✅ Touch-friendly interface
- ✅ Adaptive sizing

## 📈 Behavioral Measures

### Primary Measures
- **Impulsivity Score**: Ratio of circle to total choices (0-1)
- **Total Points**: Final accumulated points
- **Choice Patterns**: Circle vs. square preference
- **Delay Tolerance**: Average delay for circle choices

### Derived Measures
- **Reaction Times**: Response speed for each choice
- **Completion Time**: Total task duration
- **Choice Consistency**: Behavioral patterns across trials

## 🎨 Customization

### Task Parameters
```javascript
const trials = 15;        // Number of trials
const initialDelay = 5000; // Initial circle delay (ms)
const maxDelay = 15000;    // Maximum circle delay (ms)
const squareDelay = 15000; // Square delay (ms)
```

### Styling
- **CSS Variables**: Customize colors and fonts
- **Responsive Breakpoints**: Mobile, tablet, desktop
- **Progress Bar**: Customizable animation timing

## 🔬 Research Applications

### Clinical Research
- **ADHD Assessment**: Impulsivity measurement
- **Addiction Studies**: Delay discounting patterns
- **Personality Research**: Impulsivity traits

### Educational Research
- **Self-Control Studies**: Academic performance
- **Decision Making**: Risk-taking behavior
- **Cognitive Development**: Age-related changes

## 📚 Citation

If you use this implementation in your research, please cite the task and the foundational behavioral measures paper:

```
Two Choice Impulsivity Paradigm (TCIP) - JavaScript Implementation
[Your Institution/Author]
[Year]
```

And reference:

```
Dougherty, D. M., Mathias, C. W., Marsh, D. M., & Jagar, A. A. (2005).
Laboratory behavioral measures of impulsivity. Behavior Research Methods,
37(1), 82–90.
```

## 🛠️ Development

### Local Development
1. **Clone repository**
2. **Open `index.html`** in browser
3. **Modify code** as needed
4. **Test changes** locally

### Deployment
1. **Upload to web server** (GitHub Pages, Netlify, etc.)
2. **Test URL accessibility**
3. **Update Qualtrics integration** if needed

## 🐛 Troubleshooting

### Common Issues
- **Task not loading**: Check URL accessibility
- **Data not captured**: Verify Qualtrics JavaScript settings
- **Progress bar timing**: Check `plugin-tcip-wait.js` calculations
- **Mobile display**: Test responsive breakpoints

### Debug Mode
Use the diagnostic versions for troubleshooting:
- `qualtrics-tcip-full-diagnostic.js` - Comprehensive debugging
- Browser console logs for detailed error information

## 📄 License

This project is open source. Please check with your institution for usage guidelines.

## 🤝 Contributing

Contributions are welcome! Please:
1. **Fork the repository**
2. **Create a feature branch**
3. **Test thoroughly**
4. **Submit a pull request**

## 📞 Support

For technical support or questions:
- **Check troubleshooting guide** in project files
- **Review browser console** for error messages
- **Test with diagnostic versions** for detailed debugging

---

**Version**: 1.1  
**Last Updated**: 2025  
**Framework**: jsPsych 7.0+  
**Compatibility**: Modern browsers, mobile devices
