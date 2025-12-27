# Simple Qualtrics Integration Options

Note: The FINAL production script is `qualtrics-tcip-production.js`. The options in this guide are test/fallback approaches for environments where the production script cannot be used as-is.

Since the complex integration isn't working, here are 3 simple alternatives:

## Option 1: Simple Integration (`qualtrics-tcip-simple.js`) — TEST ONLY
**Best for**: Automatic data capture with minimal code

**What it does**:
- Embeds task in iframe
- Automatically captures data when task completes
- Stores basic metrics in Qualtrics

**How to use**:
1. Copy `qualtrics-tcip-simple.js` into Qualtrics Text/Graphic question
2. Task runs automatically
3. Data is captured when task finishes

**Data captured**:
- `TCIP_TotalPoints` - Final points
- `TCIP_CircleChoices` - Number of circle choices
- `TCIP_SquareChoices` - Number of square choices  
- `TCIP_ImpulsivityScore` - Impulsivity ratio
- `TCIP_RawData` - Complete trial data
- `TCIP_Completed` - Completion flag

---

## Option 2: Ultra Simple (`qualtrics-tcip-ultra-simple.js`) — TEST ONLY
**Best for**: When automatic data capture fails

**What it does**:
- Embeds task in iframe
- Provides manual "Continue" button
- No automatic data capture
- Participant clicks button when done

**How to use**:
1. Copy `qualtrics-tcip-ultra-simple.js` into Qualtrics
2. Participant completes task
3. Participant clicks "Continue Survey" button
4. Only stores completion flag

**Data captured**:
- `TCIP_Completed` - Completion flag
- `TCIP_CompletionTime` - When completed

---

## Option 3: Direct Integration (`qualtrics-tcip-direct.js`) — TEST ONLY
**Best for**: When iframe communication fails

**What it does**:
- Loads task content directly (no iframe)
- Provides manual completion button
- Works even with strict iframe policies

**How to use**:
1. Copy `qualtrics-tcip-direct.js` into Qualtrics
2. Task loads directly in the question
3. Participant clicks "Complete Task" when done

**Data captured**:
- `TCIP_Completed` - Completion flag
- `TCIP_CompletionTime` - When completed

---

## 🎯 Recommended Approach

**Try in this order** (use production first):

0. **Production**: Use `qualtrics-tcip-production.js` (recommended for real surveys)
1. If needed, **Option 1** (`qualtrics-tcip-simple.js`)
   - If it works, you get automatic data capture
   - If it fails, move to Option 2

2. **If Option 1 fails, try Option 2** (`qualtrics-tcip-ultra-simple.js`)
   - Manual completion but still embedded
   - If this fails, move to Option 3

3. **If Option 2 fails, use Option 3** (`qualtrics-tcip-direct.js`)
   - Most reliable but no automatic data capture
   - You'll need to collect data separately

## 🔧 Setup Instructions

### For any option:
1. **Create a Text/Graphic question** in Qualtrics
2. **Add JavaScript** to the question
3. **Copy the chosen integration code** into the JavaScript section
4. **Save and test** the question

### Testing:
1. **Preview the question** in Qualtrics
2. **Complete the task** 
3. **Check embedded data** in survey responses
4. **Verify data capture** is working

## 🐛 Troubleshooting

### If Option 1 doesn't work:
- Check browser console for errors
- Verify task URL is accessible
- Try Option 2 instead

### If Option 2 doesn't work:
- Check if iframe is blocked
- Try Option 3 instead

### If Option 3 doesn't work:
- Check network connectivity
- Verify task URL is accessible
- Consider hosting task on different domain

## 📊 Data Collection

### With automatic capture (Option 1):
- All behavioral data is automatically stored
- Ready for analysis immediately

### With manual capture (Options 2 & 3):
- Only completion status is stored
- You'll need to collect behavioral data separately
- Consider using completion codes or separate data collection

## 🎉 Success Indicators

**Option 1 working**: Task completes automatically and data appears in embedded fields

**Option 2 working**: Task loads and manual continue button appears

**Option 3 working**: Task content loads directly in the question

Choose the option that works best for your setup!
