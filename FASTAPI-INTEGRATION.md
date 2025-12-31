# Eyegaze Task Data Saving Integration Guide

## Overview

This document describes the implementation of a FastAPI backend server for saving Eyegaze jsPsych task data. The system has been configured to support both **FastAPI** (new) and **Qualtrics** (legacy) data saving modes.

## Architecture

### Backend: FastAPI Server

**Location:** `/home/kelvin/Projects/eyegaze/eyegaze_server/`

**Files:**
- `main.py` - FastAPI application with `/save` endpoint
- `requirements.txt` - Python dependencies
- `README.md` - Server setup instructions

**Key Features:**
- CORS support for cross-origin requests (GitHub Pages, localhost)
- JSON data persistence to `/data` directory
- Unique filename generation using timestamps
- Input validation and error handling
- Health check endpoint (`GET /`)
- Data listing endpoint (`GET /data`)

### Frontend: jsPsych Task

**Location:** `/home/kelvin/Projects/eyegaze/main.js`

**Configuration Variables:**
- `SAVE_METHOD` - Toggle between 'FASTAPI' and 'QUALTRICS'
- `FASTAPI_ENDPOINT` - URL of the data saving endpoint

**New Functions:**
- `saveDataToServer(subject_id, data_string)` - Sends data to FastAPI server

**Modified Logic:**
- Updated `on_finish` callback to conditionally save data based on `SAVE_METHOD`

---

## Installation & Setup

### Step 1: Install FastAPI Backend

1. Navigate to the server directory:
```bash
cd /home/kelvin/Projects/eyegaze/eyegaze_server
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Ensure the server creates a `data/` directory on startup (automatic).

### Step 2: Run the Server

**For local development (with auto-reload):**
```bash
uvicorn main:app --reload
```

**For production:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The server will be available at `http://localhost:8000`

### Step 3: Verify Server Status

Visit `http://localhost:8000` in your browser. You should see:
```json
{"status": "ok", "message": "Eyegaze Data Server is running"}
```

---

## Testing the Integration

### Local Testing (Standalone Mode)

1. **Start the FastAPI server:**
   ```bash
   cd /home/kelvin/Projects/eyegaze/eyegaze_server
   uvicorn main:app --reload
   ```

2. **Ensure frontend is configured for FastAPI:**
   - Open `main.js`
   - Verify `SAVE_METHOD = 'FASTAPI'`
   - Verify `FASTAPI_ENDPOINT = 'http://localhost:8000/save'`

3. **Open the task locally:**
   ```bash
   # Option A: Use Python's built-in server
   cd /home/kelvin/Projects/eyegaze
   python3 -m http.server 8001
   ```
   Then visit: `http://localhost:8001?sub=test_participant_001&study=eyegaze_test`

4. **Complete the task:**
   - Perform the gaze perception task
   - When the task finishes, you should see: `✓ Data saved successfully!`
   - Check the browser console (F12) for:
     - `"Attempting to save data to FastAPI server..."`
     - `"Data saved successfully to server!"`
     - Response with filename

5. **Verify data was saved:**
   ```bash
   ls /home/kelvin/Projects/eyegaze/eyegaze_server/data/
   # Should show file like: test_participant_001_20250101_120000.json
   ```

6. **Inspect saved data:**
   ```bash
   cat /home/kelvin/Projects/eyegaze/eyegaze_server/data/test_participant_001_20250101_120000.json
   # Should contain the pruned trial data
   ```

### Testing with CORS Errors

If you see CORS errors:
1. Check browser console for the origin making the request
2. Add that origin to the `origins` list in `main.py`
3. Restart the server

Common origins to add:
- `https://kelvinlim.github.io` (GitHub Pages)
- `http://localhost:3000` (if using a development server)
- `http://localhost:5173` (Vite development)

### API Testing with curl

**Save data:**
```bash
curl -X POST http://localhost:8000/save \
  -H "Content-Type: application/json" \
  -d '{
    "subject_id": "test_001",
    "trial_data": "[{\"trial\": 0, \"rt\": 500}, {\"trial\": 1, \"rt\": 450}]"
  }'
```

**Expected response:**
```json
{
  "status": "success",
  "message": "Data saved successfully",
  "filename": "data/test_001_20250101_120000.json"
}
```

**List saved files:**
```bash
curl http://localhost:8000/data
```

---

## Configuration Guide

### Switching Save Methods

In `main.js`, change the `SAVE_METHOD` variable:

**For FastAPI (default):**
```javascript
const SAVE_METHOD = 'FASTAPI';
const FASTAPI_ENDPOINT = 'http://localhost:8000/save';
```

**For Qualtrics (legacy):**
```javascript
const SAVE_METHOD = 'QUALTRICS';
// Existing Qualtrics logic will be executed
```

### Changing the Server Endpoint (Production)

To point to a remote server:
```javascript
const FASTAPI_ENDPOINT = 'https://your-domain.com/save';
```

Make sure to:
1. Add the domain to CORS origins in `main.py`
2. Update the CORS allowed origins list
3. Restart the server

---

## Data Format

### Request to `/save` Endpoint

```json
{
  "subject_id": "participant_001",
  "trial_data": "[{\"rt\": 500, \"response\": \"f\", ...}, ...]"
}
```

### Response from `/save` Endpoint

```json
{
  "status": "success",
  "message": "Data saved successfully",
  "filename": "data/participant_001_20250101_120000.json"
}
```

### Saved Data File Format

The trial data is saved as a JSON array of trial objects:
```json
[
  {
    "rt": 500,
    "response": "f",
    "correct": true,
    "stimulus": "center_0.png",
    "model": "Dean"
  },
  {
    "rt": 450,
    "response": "j",
    "correct": false,
    "stimulus": "left_5.png",
    "model": "Peter"
  }
]
```

---

## Troubleshooting

### Issue: "Network error: Unable to connect to server"

**Cause:** Server is not running or endpoint URL is incorrect

**Solution:**
1. Verify server is running: `uvicorn main:app --reload`
2. Check endpoint URL in `main.js` matches server location
3. Check firewall rules allow localhost:8000

### Issue: CORS Error in Browser Console

**Cause:** Origin not in allowed CORS origins list

**Solution:**
1. Open browser console and note the origin (e.g., `http://example.com`)
2. Add it to the `origins` list in `main.py`
3. Restart the server

### Issue: "Data saved successfully" but no file created

**Cause:** Permission issues or directory doesn't exist

**Solution:**
1. Verify `data/` directory exists: `ls -la /home/kelvin/Projects/eyegaze/eyegaze_server/`
2. Check directory permissions: `chmod 755 /home/kelvin/Projects/eyegaze/eyegaze_server/data/`
3. Check server logs for error messages

### Issue: 400 Bad Request Error

**Cause:** Invalid JSON or missing required fields

**Solution:**
1. Ensure `subject_id` is not empty
2. Ensure `trial_data` is valid JSON
3. Check the server console for detailed error message

---

## File Structure

```
/home/kelvin/Projects/eyegaze/
├── eyegaze_server/          # NEW: FastAPI backend
│   ├── main.py             # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── README.md           # Server documentation
│   └── data/               # Data storage directory (created on startup)
│
├── main.js                 # MODIFIED: Added FastAPI integration
├── index.html              # No changes needed
└── ... (other files)
```

---

## Summary of Changes

### Backend (NEW)
- ✅ Created FastAPI application with `/save` endpoint
- ✅ Configured CORS for local and GitHub Pages
- ✅ Automatic `data/` directory creation
- ✅ JSON data persistence with timestamp-based filenames
- ✅ Input validation and error handling

### Frontend (MODIFIED)
- ✅ Added `SAVE_METHOD` configuration variable
- ✅ Added `FASTAPI_ENDPOINT` configuration variable
- ✅ Created `saveDataToServer()` function with error handling
- ✅ Updated `on_finish` callback to support FastAPI saving
- ✅ Maintained backward compatibility with Qualtrics integration

---

## Next Steps

1. **Immediate:** Test locally with the setup steps above
2. **Integration:** Deploy server to production environment
3. **GitHub Pages:** Update `FASTAPI_ENDPOINT` in `main.js` to production URL
4. **Monitoring:** Set up log monitoring for data saves
5. **Backup:** Implement automated backup of the `data/` directory

---

## Support & Questions

For issues or questions about the integration:
1. Check browser console (F12) for error messages
2. Check server console for HTTP request logs
3. Review the [FastAPI Documentation](https://fastapi.tiangolo.com/)
4. Check [CORS Documentation](https://fastapi.tiangolo.com/tutorial/cors/)
