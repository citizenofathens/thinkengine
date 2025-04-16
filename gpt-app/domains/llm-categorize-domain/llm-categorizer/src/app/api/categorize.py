from fastapi import router,APIRouter
from app.services.categorize import classify_memo, extract_metadata

import re

router = APIRouter() 

@router.post("/classify")
async def classify(request: MemoRequest):
    summary, keywords = extract_metadata(request.memo)
    try:
        result = classify_memo(request.memo, BASE_CATEGORIES)
    except Exception as e:
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
    "metadata": {"summary": summary, "keywords": keywords}
}

# 