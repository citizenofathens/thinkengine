# services/storage/main.py
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db import SessionLocal, Base, engine
from models import Memo

Base.metadata.create_all(bind=engine)

app = FastAPI()

class MemoIn(BaseModel):
    original_text: str
    summary: str
    tags: list[str]
    category: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/store")
def store_memo(memo: MemoIn, db: Session = Depends(get_db)):
    db_memo = Memo(
        original_text=memo.original_text,
        summary=memo.summary,
        tags=memo.tags,
        category=memo.category
    )
    db.add(db_memo)
    db.commit()
    db.refresh(db_memo)
    return {
        "id": db_memo.id,
        "summary": db_memo.summary,
        "tags": db_memo.tags,
        "category": db_memo.category,
        "created_at": db_memo.created_at.isoformat()
    }
