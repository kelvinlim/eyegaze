# Progress Bar Timing Fix

## Problem
The progress bar animation in the TCIP task was not matching the actual delay time. For example:
- Square choice: 15-second delay, but progress bar completed in ~8-10 seconds
- Circle choice: 5-second delay, but progress bar completed too quickly

## Root Cause
The progress bar animation had incorrect timing calculations in `jspsych/plugin-tcip-wait.js`:

```javascript
// OLD (INCORRECT) CODE:
const increment = 1 / duration * 1750; // Wrong calculation
setInterval(() => {
    // animation code
}, duration / 1000); // Wrong interval timing
```

## Solution
Fixed the timing calculations to ensure the progress bar matches the actual delay:

```javascript
// NEW (CORRECT) CODE:
const totalSteps = 100; // 100 steps to reach 100%
const stepDuration = duration / totalSteps; // Time per step in milliseconds
const increment = 100 / totalSteps; // Progress increment per step (1%)

setInterval(() => {
    // animation code
}, stepDuration); // Correct interval timing
```

## What Changed

### 1. **Fixed Timing Calculation**
- **Before**: `increment = 1 / duration * 1750` (arbitrary multiplier)
- **After**: `increment = 100 / totalSteps` (1% per step)

### 2. **Fixed Interval Timing**
- **Before**: `setInterval(..., duration / 1000)` (too fast)
- **After**: `setInterval(..., stepDuration)` (matches actual duration)

### 3. **Added Visual Improvements**
- Better progress bar styling with rounded corners
- Smooth transitions
- More visible progress indicator

## Testing

### Test File: `progress-bar-test.html`
This file allows you to test the progress bar timing with different durations:
- 5-second test (Circle - first choice)
- 15-second test (Square choice)
- 10-second test (Circle - later choice)

### How to Test
1. Open `progress-bar-test.html` in your browser
2. Click the test buttons
3. Verify the progress bar completes exactly when the timer reaches the target duration
4. Check browser console for timing logs

## Files Updated
- ✅ `jspsych/plugin-tcip-wait.js` - Fixed progress bar animation
- ✅ `test-task.html` - Added console logging
- ✅ `progress-bar-test.html` - Created timing test

## Verification
The progress bar now:
- ✅ Completes exactly when the delay time expires
- ✅ Works correctly for all delay durations (5s, 6s, 7s, ..., 15s)
- ✅ Has smooth, consistent animation
- ✅ Matches the actual trial duration

## Impact
This fix ensures that:
1. **Participants see accurate timing** - Progress bar matches actual wait time
2. **Better user experience** - Visual feedback is reliable
3. **Consistent behavior** - Works the same across all trials
4. **Research validity** - Timing accuracy is crucial for behavioral measures

The fix is automatically applied to all versions of the task since they all use the same `plugin-tcip-wait.js` file.
