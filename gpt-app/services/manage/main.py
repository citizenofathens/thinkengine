# services/manage/main.py
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session 
from models import Memo

app = FastAPI()

class MemoUpdate(BaseModel):
    summary: str
    tags: list[str]
    category: str

@app.put("/memo/update/{memo_id}")
def update_memo(memo_id: int, data: MemoUpdate, db: Session = Depends(get_db)):
    memo = db.query(Memo).filter(Memo.id == memo_id).first()
    if not memo:
        raise HTTPException(status_code=404, detail="Memo not found")
    memo.summary = data.summary
    memo.tags = data.tags
    memo.category = data.category
    db.commit()
    return {"message": "Memo updated"}

@app.delete("/memo/delete/{memo_id}")
def delete_memo(memo_id: int, db: Session = Depends(get_db)):
    memo = db.query(Memo).filter(Memo.id == memo_id).first()
    if not memo:
        raise HTTPException(status_code=404, detail="Memo not found")
    db.delete(memo)
    db.commit()
    return {"message": "Memo deleted"}
