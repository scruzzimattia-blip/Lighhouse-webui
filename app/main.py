from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import docker
import os
import traceback

app = FastAPI()
client = docker.from_env()
templates = Jinja2Templates(directory="app/templates")

@app.get("/", response_class=HTMLResponse)
async def read_item(request: Request):
    return templates.TemplateResponse(request, "index.html")

@app.get("/api/containers")
async def get_containers():
    try:
        containers = client.containers.list(all=True, filters={"label": "com.lighthouse.enable=true"})
        result = []
        for c in containers:
            image_tag = "unknown"
            if c.image.tags:
                image_tag = c.image.tags[0]
            
            result.append({
                "Id": c.id,
                "Names": [c.name],
                "Image": image_tag,
                "State": c.status,
                "Status": c.attrs.get('State', {}).get('Status', 'unknown') if 'State' in c.attrs else c.attrs.get('Status', 'unknown'),
                "Labels": c.labels
            })
        return result
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/lighthouse/logs")
async def get_logs():
    try:
        # Finde den Lighthouse-Container (entweder nach Image oder Name)
        all_containers = client.containers.list(all=True)
        lighthouse = None
        for c in all_containers:
            image_tags = [t.lower() for t in c.image.tags] if c.image.tags else []
            if any("lighthouse" in t for t in image_tags) or "lighthouse" in c.name.lower():
                lighthouse = c
                break
        
        if not lighthouse:
            return "Lighthouse container not found"
            
        logs = lighthouse.logs(tail=100, timestamps=True)
        return logs.decode("utf-8")
    except Exception as e:
        traceback.print_exc()
        return f"Error fetching logs: {str(e)}"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8085)
