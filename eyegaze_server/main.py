from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import json
from datetime import datetime

app = FastAPI(title="Eyegaze Data Server", version="1.0.0")

# Configure CORS to allow requests from Qualtrics and local development
# Use wildcard with credentials disabled for simpler local/test setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allow_headers=["*"],
)


class ExperimentData(BaseModel):
    subject_id: str
    trial_data: str


@app.on_event("startup")
async def startup_event():
    """Ensure data directory exists on startup."""
    if not os.path.exists('data'):
        os.makedirs('data')
        print("Created 'data' directory for storing experiment results.")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Eyegaze Data Server is running"}


@app.options("/save")
async def options_save():
    """Handle CORS preflight requests for /save endpoint."""
    return JSONResponse(
        content={"status": "ok"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
            "Access-Control-Allow-Headers": "*",
        }
    )


@app.post("/save")
async def save_data(data: ExperimentData):
    """
    Save experiment data to a JSON file.
    
    Args:
        data: ExperimentData containing subject_id and trial_data
    
    Returns:
        dict: Status confirmation and filename
    """
    try:
        # Ensure data directory exists
        if not os.path.exists('data'):
            os.makedirs('data')
        
        # Validate input
        if not data.subject_id or data.subject_id.strip() == "":
            raise ValueError("subject_id cannot be empty")
        
        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"data/{data.subject_id}_{timestamp}.json"
        
        # Parse trial_data if it's a JSON string
        try:
            if isinstance(data.trial_data, str):
                trial_data_obj = json.loads(data.trial_data)
            else:
                trial_data_obj = data.trial_data
        except json.JSONDecodeError:
            raise ValueError("trial_data must be valid JSON")
        
        # Save to file with pretty formatting
        with open(filename, 'w') as f:
            json.dump(trial_data_obj, f, indent=2)
        
        print(f"Successfully saved data to {filename}")
        
        return JSONResponse(
            content={
                "status": "success",
                "message": "Data saved successfully",
                "filename": filename
            },
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            }
        )
    
    except ValueError as e:
        print(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error saving data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving data: {str(e)}")


@app.get("/data")
async def list_data():
    """List all saved data files."""
    try:
        if not os.path.exists('data'):
            return {"files": []}
        
        files = os.listdir('data')
        return {"files": files, "count": len(files)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
