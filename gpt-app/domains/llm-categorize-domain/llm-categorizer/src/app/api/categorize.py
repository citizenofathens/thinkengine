from fastapi import APIRouter
from app.services.categorize import classify_memo, extract_metadata
from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List, Dict
import openai
import uuid
import os
from datetime import datetime
import json
import configparser
from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List, Dict
import uuid
import os
from datetime import datetime
import json
from openai import OpenAI 
import os 
import re
from app.database.db import SessionLocal, Memo, Category, MemoRequest ,MemoCategory, init_db
router = APIRouter() 
import logging 
logger = logging.getLogger("categorizer") 
from app.constants import BASE_CATEGORIES
 
config = configparser.ConfigParser()

config.read(os.path.join(os.path.dirname(__file__), '../api_key.ini'))

# 값 가져오기
if 'OPENAI_API_KEY' not in config or 'OPEN_API_KEY' not in config['OPENAI_API_KEY']:
    raise RuntimeError("Missing [OPENAI_API_KEY] section or OPEN_API_KEY in api_key.ini")
openai_api_key = config['OPENAI_API_KEY']['OPEN_API_KEY']



@router.post("/classify")
async def classify(request: MemoRequest):
    client = OpenAI(api_key=openai_api_key)
    logger.info("Classifying memo: %s", request.memo)
    print(f"Received classify request: {request.memo}")
    logging.info(f"Received classify request: {request.memo}")
    summary, keywords = extract_metadata(request.memo)
    logging.info(f"Summary: {summary}, Keywords: {keywords}")

    try:
        result = classify_memo(request.memo, BASE_CATEGORIES)
        print(f"Classification result: {result}")
        logging.info(f"Classification result: {result}")
        
        # Ensure result has expected structure
        if "classification" not in result:
            result = {
                "classification": {},
                "new_categories": []
            }
    except Exception as e:
        print(f"Classification error: {e}") 
        logging.error(f"Classification error: {e}")

        return {"error": str(e), "metadata": {"summary": summary, "keywords": keywords}}

    # DB integration
    init_db()
    db = SessionLocal()
    memo_obj = Memo(text=request.memo, created_at=datetime.now(), result_json=result)
    db.add(memo_obj)
    db.commit()
    db.refresh(memo_obj)

    # Organize sidebar data
    sidebar = {}
    lines = request.memo.strip().splitlines()
    if "classification" in result:
        for idx, line in enumerate(lines, 1):
            idx_str = str(idx)
            cat = result["classification"].get(idx_str, "분류 안됨")
            if cat not in sidebar:
                sidebar[cat] = []
            sidebar[cat].append(line)
            # Save category to DB
            category_obj = db.query(Category).filter_by(name=cat).first()
            if not category_obj:
                category_obj = Category(name=cat)
                db.add(category_obj)
                db.commit()
                db.refresh(category_obj)
            db.add(MemoCategory(memo_id=memo_obj.id, category_id=category_obj.id, sentence_number=idx, sentence=line))
    else:
        for idx, line in enumerate(lines, 1):
            cat = result.get(str(idx), '분류 안됨')
            if cat.startswith("새로운 카테고리: "):
                tag = cat.replace("새로운 카테고리: ", "")
            else:
                tag = cat
            if tag not in sidebar:
                sidebar[tag] = []
            sidebar[tag].append(line)
            # Save category to DB
            category_obj = db.query(Category).filter_by(name=tag).first()
            if not category_obj:
                category_obj = Category(name=tag)
                db.add(category_obj)
                db.commit()
                db.refresh(category_obj)
            db.add(MemoCategory(memo_id=memo_obj.id, category_id=category_obj.id, sentence_number=idx, sentence=line))
    db.commit()
    db.close()

    return {
        "result": result,
        "sidebar": sidebar,
        "metadata": {"summary": summary, "keywords": keywords}
}

# 