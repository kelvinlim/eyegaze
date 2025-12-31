# Eyegaze Data Server

A lightweight FastAPI server for saving experimental data from the Eyegaze jsPsych task.

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the Server

```bash
uvicorn main:app --reload
```

The server will start at `http://localhost:8000`

For production:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Verify Server is Running

Visit `http://localhost:8000` in your browser. You should see:
```json
{"status": "ok", "message": "Eyegaze Data Server is running"}
```

## Endpoints

### `POST /save`
Save experiment data to the server.

**Request Body:**
```json
{
    "subject_id": "participant_001",
    "trial_data": "[{\"trial\": 0, ...}]"
}
```

**Response:**
```json
{
    "status": "success",
    "message": "Data saved successfully",
    "filename": "data/participant_001_20250101_120000.json"
}
```

### `GET /`
Health check endpoint.

### `GET /data`
List all saved data files.

## Data Directory

All experiment data is saved in the `data/` directory as JSON files. Filenames follow the pattern:
```
{subject_id}_{YYYYMMDD}_{HHMMSS}.json
```

## CORS Configuration

The server is configured to accept requests from:
- `https://kelvinlim.github.io` (GitHub Pages)
- `http://localhost:8000`
- `http://127.0.0.1:8000`
- Other localhost variants for local development

Add additional origins to the `origins` list in `main.py` as needed.

## Frontend Integration

Update your jsPsych task with:

```javascript
const SAVE_METHOD = 'FASTAPI';
const FASTAPI_ENDPOINT = 'http://localhost:8000/save';
```

See the main eyegaze repository for complete integration details.
