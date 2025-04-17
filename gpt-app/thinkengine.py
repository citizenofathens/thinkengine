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

from db import SessionLocal, Memo, Category, MemoCategory, init_db
import os
from datetime import datetime
import json
# --- Config ---
os.getenv("OPENAI_API_KEY")  # 또는 직접 API Key를 입력할 수 있음

config = configparser.ConfigParser()

# ini 파일 읽기
config.read('api_key.ini')

# 값 가져오기
openai_api_key = config['OPENAI_API_KEY']['OPEN_API_KEY']

# --- Config ---
client = OpenAI(api_key=openai_api_key)

# --- FastAPI 앱 생성 ---
app = FastAPI() 

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or set to ["http://localhost:5173"] for your Svelte dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- 입력 데이터 모델 ---
class MemoRequest(BaseModel):
    memo: str

# --- 기존 분류 체계 ---
BASE_CATEGORIES = [
    "AI 개발", "콘텐츠 제작", "마케팅 전략", "개인 회고",
    "트레이딩 분석", "스토리텔링 설계", "UI/UX 디자인",
    "보안 위험", "YouTube 기획"
]

import re

def is_json_like(s):
    # Simple check for JSON-like string (dict or list)
    s = s.strip()
    return (s.startswith("{") and s.endswith("}")) or (s.startswith("[") and s.endswith("]"))

def classify_memo(text: str, categories: List[str]) -> Dict:
    prompt = f"""
    당신은 분류 전문가입니다. 아래 메모를 문장 단위로 분리하고, 가능한 한 기존 카테고리에 매핑하세요.
    만약 어떤 문장이 기존 카테고리와 맞지 않는다면, 새로운 카테고리를 생성하되, 중복되지 않고 간결하게 지어주세요.

    기존 카테고리: {', '.join(categories)}

    메모:
    """
    for i, line in enumerate(text.strip().splitlines(), 1):
        prompt += f"{i}. {line}\n"

    prompt += "\n각 문장을 하나의 카테고리로 분류해서 JSON 형식으로 출력하세요. 예시: {1: 'AI 개발', 2: '새로운 카테고리: 콘텐츠 확산 전략'}"

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    content = response.choices[0].message.content.strip()
    if not is_json_like(content):
        # Return a helpful error to the frontend
        raise ValueError(f"LLM did not return JSON. Raw output: {content}")
    try:
        content_json = content.replace("'", '"') if "'" in content and '"' not in content else content
        return json.loads(content_json)
    except Exception as e:
        raise ValueError(f"Failed to parse LLM output as JSON: {content}\nError: {e}")

import re
def extract_metadata(text):
    # Fast, simple keyword extraction: unique words (alphanumeric, Korean, etc.)
    import re
    summary = text.split('.')[0] if '.' in text else text.split('\n')[0]
    keywords = list(set(re.findall(r'\w+', text)))[:5]
    return summary, keywords


def classify_memo(text: str, categories: List[str], use_structured_output: bool = True) -> Dict:
    if use_structured_output:
        summary, keywords = extract_metadata(text)
        enriched_text = f"요약: {summary}\n키워드: {', '.join(keywords)}\n{text}"

        schema = {
    "type": "object",
    "properties": {
        "classification": {
            "type": "object",
            "description": "Map from sentence number (as string, starting from 1) to category name.",
            "additionalProperties": { "type": "string" }
        },
        "new_categories": {
            "type": "array",
            "items": { "type": "string" }
        }
    },
    "required": ["classification", "new_categories"],
    "additionalProperties": False
}
       
        prompt = f"""
        당신은 분류 전문가입니다. 아래 메모의 각 문장을 기존 카테고리 중 하나에 분류하거나, 기존 카테고리에 맞지 않으면 새로운 카테고리명을 직접 만들어서 분류하세요.
        아래 JSON 스키마의 키 이름(classification, new_categories)과 구조를 반드시 그대로 사용하세요.
        각 문장은 1부터 시작하는 번호로 매핑하세요.

        반드시 아래와 같은 JSON 형식으로만 응답하세요. 예시:
        {{
        "classification": {{
            "1": "카테고리명",
            "2": "카테고리명"
        }},
        "new_categories": [
            "새로운카테고리"
        ]
        }}

        메모:
        {text}
        """
        response = client.chat.completions.create(
            model="gpt-4o-2024-08-06",
            messages=[
                {"role": "system", "content": "당신은 메모 분류 전문가입니다. 반드시 JSON 스키마에 맞춰 한국어로만 응답하세요."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content.strip()
        try:
            return json.loads(content)
        except Exception as e:
            raise ValueError(f"Failed to parse LLM output as JSON: {content}\nError: {e}")


    else:
        summary, keywords = extract_metadata(text)
        enriched_text = f"요약: {summary}\n키워드: {', '.join(keywords)}\n{text}"
        
        prompt = f"""
        당신은 분류 전문가입니다. 아래 메모를 문장 단위로 분리하고, 가능한 한 기존 카테고리에 매핑하세요.
        만약 어떤 문장이 기존 카테고리와 맞지 않는다면, 새로운 카테고리를 생성하되, 중복되지 않고 간결하게 지어주세요.
        반드시 JSON 형식(예: {{1: 'AI 개발', 2: '새로운 카테고리: 콘텐츠 확산 전략'}})으로만 응답하세요. 설명 없이 결과만 출력하세요.

        기존 카테고리: {', '.join(categories)}

        메모:
        {enriched_text}
        """

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "당신은 메모 분류 전문가입니다. 반드시 JSON 형식으로만 응답하세요. 설명 없이 결과만 출력하세요."},
                {"role": "user", "content": prompt}
            ]
        )
        content = response.choices[0].message.content.strip()
        import re
        json_match = re.search(r'(\{[\s\S]*\})', content)
        if not json_match:
            raise ValueError(f"LLM did not return JSON. Raw output: {content}")
        json_str = json_match.group(1)
        json_str = json_str.replace("'", '"') if "'" in json_str and '"' not in json_str else json_str
        try:
            return json.loads(json_str)
        except Exception as e:
            raise ValueError(f"Failed to parse LLM output as JSON: {json_str}\nOriginal output: {content}\nError: {e}")
@app.post("/classify")
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

# --- 메모 업로드 엔드포인트 ---
# @app.post("/classify")
# async def classify(request: MemoRequest):
#     summary, keywords = extract_metadata(request.memo)
#     try:
#         result = classify_memo(request.memo, BASE_CATEGORIES)
#         if not result or not isinstance(result, dict):
#             return {"error": "Memo could not be classified. Please provide more detailed input.", "metadata": {"summary": summary, "keywords": keywords}}
#     except Exception as e:
#         return {"error": str(e), "metadata": {"summary": summary, "keywords": keywords}}

#     # Process the result based on its structure
#     new_tags = set()
    
#     # Check if we're getting the new structured format with classification and new_categories
#     if "classification" in result and "new_categories" in result:
#         # The new structure returns categorization in a different format
#         categorization = result["classification"]
#         # Add any new categories that were created
#         for tag in result["new_categories"]:
#             if tag:  # Ensure the tag is not empty
#                 new_tags.add(tag)
#     else:
#         # Original format processing - each value in the result dict is a category
#         for tag in result.values():
#             if isinstance(tag, str) and tag.startswith("새로운 카테고리: "):
#                 new_tags.add(tag.replace("새로운 카테고리: ", ""))

#     if new_tags:
#         os.makedirs("metadata", exist_ok=True)
#         with open("metadata/new_tags.json", "a", encoding="utf-8") as f:
#             for tag in new_tags:
#                 f.write(json.dumps({"tag": tag, "created": datetime.now().isoformat()}) + "\n")

#     # Generate the markdown file
#     today = datetime.now().strftime("%Y-%m-%d")
#     filename = f"obsidian_memos/{today}-{uuid.uuid4().hex[:8]}.md"
#     os.makedirs("obsidian_memos", exist_ok=True)

#     with open(filename, "w", encoding="utf-8") as f:
#         f.write(f"# 메모 분류 결과 ({today})\n\n")
        
#         # Process based on the structure of result
#         if "classification" in result:
#             # New structure - classification is a dict with line numbers as keys
#             for idx, line in enumerate(request.memo.strip().splitlines(), 1):
#                 idx_str = str(idx)  # Convert to string to use as key
#                 if idx_str in result["classification"]:
#                     category = result["classification"][idx_str]
#                 else:
#                     category = "분류 안됨"
#                 f.write(f"## {category}\n- {line}\n\n")
#         else:
#             # Original structure
#             for idx, line in enumerate(request.memo.strip().splitlines(), 1):
#                 category = result.get(str(idx) if isinstance(idx, int) else idx, '분류 안됨')
#                 if isinstance(category, str) and category.startswith("새로운 카테고리: "):
#                     tag = category.replace("새로운 카테고리: ", "")
#                 else:
#                     tag = category
#                 f.write(f"## {tag}\n- {line}\n\n")

#     return {
#         "result": result,
#         "saved_file": filename,
#         "new_tags": list(new_tags),
#         "metadata": {"summary": summary, "keywords": keywords}
#     }