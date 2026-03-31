from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import docker
import os

app = FastAPI()
client = docker.from_env()
templates = Jinja2Templates(directory="app/templates")

@app.get("/", response_class=HTMLResponse)
async def read_item(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/containers")
async def get_containers():
    try:
        containers = client.containers.list(all=True, filters={"label": "com.lighthouse.enable=true"})
        return [
            {
                "Id": c.id,
                "Names": [c.name],
                "Image": c.image.tags[0] if c.image.tags else "unknown",
                "State": c.status,
                "Status": c.attrs['Status'],
                "Labels": c.labels
            }
            for c in containers
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/lighthouse/logs")
async def get_logs():
    try:
        # Finde den Lighthouse-Container (entweder nach Image oder Name)
        all_containers = client.containers.list(all=True)
        lighthouse = next((c for c in all_containers if "lighthouse" in c.image.tags[0].lower() or "lighthouse" in c.name.lower()), None)
        
        if not lighthouse:
            return "Lighthouse container not found"
            
        logs = lighthouse.logs(tail=100, timestamps=True)
        return logs.decode("utf-8")
    except Exception as e:
        return f"Error fetching logs: {str(e)}"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8085)
