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
        # 세세한 에러타겟팅
        #generate_prompt(meta_template)
        # Ensure result has expected structure
        if "classification" not in result:
            classification = {}
            main_cat = result.get("main_category", "분류 안됨")
            sub_cat = result.get("sub_category", "분류 안됨")
            lines = request.memo.strip().splitlines()
            # Assign both main and sub categories to each line (or customize as needed)
            for idx, line in enumerate(lines, 1):
                classification[str(idx)] = f"{main_cat} / {sub_cat}"
            result = {
                "classification": classification,
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
    # Defensive: ensure classification is a dict of {str: str}
    classification = result.get("classification", {})
    if not isinstance(classification, dict):
        print(f"classification is not a dict: {classification}")
        classification = {}
    for idx, line in enumerate(lines, 1):
        print(f"Processing line {idx}: {line}")
        idx_str = str(idx)
        cat = classification.get(idx_str, "분류 안됨")
        print(f"Category for line {idx}: {cat}")
        # Defensive: skip empty or weird category names
        if not cat or cat.lower() in ("classification", "classification (0)"):
            print(f"Skipping invalid category: {cat}")
            cat = "분류 안됨"
        if cat not in sidebar:
            print(f"Adding new category: {cat}")
            sidebar[cat] = []
        sidebar[cat].append(line)
        print(f"Adding line {line} to category {cat}")
        # Save category to DB
        category_obj = db.query(Category).filter_by(name=cat).first()
        if not category_obj:
            print(f"Adding new category to DB: {cat}")
            category_obj = Category(name=cat)
            db.add(category_obj)
            db.commit()
            db.refresh(category_obj)
        print(f"Adding MemoCategory to DB: memo_id={memo_obj.id}, category_id={category_obj.id}, sentence_number={idx}, sentence={line}")
        db.add(MemoCategory(memo_id=memo_obj.id, category_id=category_obj.id, sentence_number=idx, sentence=line))
    db.commit()
    db.close()

    # Remove invalid sidebar keys before returning
    invalid_keys = {"classification", "classification (0)", ""}
    filtered_sidebar = {k: v for k, v in sidebar.items() if k not in invalid_keys}
    print(f"Final sidebar keys: {list(filtered_sidebar.keys())}")

    return {
        "result": result,
        "sidebar": filtered_sidebar,
        "metadata": {"summary": summary, "keywords": keywords}
}

# 