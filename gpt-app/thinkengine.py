from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List, Dict
import openai
import uuid
import os
from datetime import datetime
import json
import streamlit as st
import configparser
from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List, Dict
import uuid
import os
from datetime import datetime
import json
import streamlit as st
from openai import OpenAI

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

# --- 입력 데이터 모델 ---
class MemoRequest(BaseModel):
    memo: str

# --- 기존 분류 체계 ---
BASE_CATEGORIES = [
    "AI 개발", "콘텐츠 제작", "마케팅 전략", "개인 회고",
    "트레이딩 분석", "스토리텔링 설계", "UI/UX 디자인",
    "보안 위험", "YouTube 기획"
]

# --- GPT 분류 함수 ---
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
    content = response.choices[0].message.content
    return eval(content)  # 실제 서비스에서는 json.loads + 안전 파싱 권장

# --- 메모 업로드 엔드포인트 ---
@app.post("/classify")
async def classify(request: MemoRequest):
    result = classify_memo(request.memo, BASE_CATEGORIES)

    # 새로운 카테고리 추출 및 저장
    new_tags = set()
    for tag in result.values():
        if tag.startswith("새로운 카테고리: "):
            new_tags.add(tag.replace("새로운 카테고리: ", ""))

    if new_tags:
        os.makedirs("metadata", exist_ok=True)
        with open("metadata/new_tags.json", "a", encoding="utf-8") as f:
            for tag in new_tags:
                f.write(json.dumps({"tag": tag, "created": datetime.now().isoformat()}) + "\n")

    # 저장용 파일 생성 (Obsidian 연동 예시)
    today = datetime.now().strftime("%Y-%m-%d")
    filename = f"obsidian_memos/{today}-{uuid.uuid4().hex[:8]}.md"
    os.makedirs("obsidian_memos", exist_ok=True)

    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"# 메모 분류 결과 ({today})\n\n")
        for idx, line in enumerate(request.memo.strip().splitlines(), 1):
            category = result.get(idx, '분류 안됨')
            tag = category.replace("새로운 카테고리: ", "")
            f.write(f"## {tag}\n- {line}\n\n")

    return {"result": result, "saved_file": filename, "new_tags": list(new_tags)}

# --- Streamlit 인터페이스 ---
def run_streamlit_ui():
    st.set_page_config(page_title="메모 분류기", layout="wide")
    st.title("📝 AI 메모 자동 분류기")

    memo_input = st.text_area("👉 자유롭게 메모를 입력하세요:", height=300)

    if st.button("🚀 분류 시작"):
        if memo_input.strip() == "":
            st.warning("메모를 입력해주세요.")
            return

        with st.spinner("GPT가 분류 중입니다..."):
            result = classify_memo(memo_input, BASE_CATEGORIES)

            new_tags = [tag.replace("새로운 카테고리: ", "") for tag in result.values() if tag.startswith("새로운 카테고리: ")]

            st.subheader("📂 분류 결과")
            for idx, line in enumerate(memo_input.strip().splitlines(), 1):
                category = result.get(idx, '분류 안됨')
                if category.startswith("새로운 카테고리: "):
                    tag = category.replace("새로운 카테고리: ", "")
                else:
                    tag = category
                st.markdown(f"**{tag}**: {line}")

            if new_tags:
                st.markdown("---")
                st.subheader("✨ 새로 생성된 카테고리")
                for tag in new_tags:
                    st.markdown(f"- `{tag}`")

# Streamlit 실행 조건 분리 (파일 직접 실행 시)
if __name__ == "__main__":
    run_streamlit_ui()
