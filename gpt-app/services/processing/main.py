# services/processing/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from nlp import simple_summarize, extract_keywords

app = FastAPI()


class TextRequest(BaseModel):
    text: str


@app.post("/process")
def process_text(req: TextRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text is empty")

    summary = simple_summarize(req.text)
    keywords = extract_keywords(req.text)
    category = "업무" if "회의" in req.text else "기타"

    return {
        "summary": summary,
        "tags": keywords,
        "category": category
    }
