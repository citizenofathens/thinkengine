# services/query/main.py
from fastapi import FastAPI, Query, Depends
from typing import Optional
from sqlalchemy.orm import Session
from db import get_db

from models import Memo

app = FastAPI()

@app.get("/memo/search")
def search_memos(
    keyword: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Memo)

    if keyword:
        query = query.filter(Memo.original_text.ilike(f"%{keyword}%"))
    if category:
        query = query.filter(Memo.category == category)

    return query.all()
