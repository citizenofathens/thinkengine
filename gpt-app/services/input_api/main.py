# services/input_api/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx

app = FastAPI()

PROCESSING_URL = "http://processing:8001/process"
STORAGE_URL = "http://storage:8002/store"

class MemoInput(BaseModel):
    text: str

@app.post("/memo/create")
async def create_memo(memo: MemoInput):
    async with httpx.AsyncClient() as client:
        try:
            processing_resp = await client.post(PROCESSING_URL, json={"text": memo.text})
            processing_resp.raise_for_status()
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Processing failed: {e}")

        processed_data = processing_resp.json()
        store_payload = {
            "original_text": memo.text,
            **processed_data
        }

        try:
            storage_resp = await client.post(STORAGE_URL, json=store_payload)
            storage_resp.raise_for_status()
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Storage failed: {e}")

        return {"message": "Memo processed and stored!", "data": storage_resp.json()}
