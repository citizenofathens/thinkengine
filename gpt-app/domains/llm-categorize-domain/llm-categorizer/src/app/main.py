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
from app.database.db import SessionLocal, Memo, Category, MemoCategory, init_db

from app.api.categorize import classify_memo,extract_metadata
from app.api.categorize import router
import logging  

# --- Config ---
#os.getenv("OPENAI_API_KEY")  # 또는 직접 API Key를 입력할 수 있음
config = configparser.ConfigParser()
logging.basicConfig(level=logging.DEBUG)


config.read(os.path.join(os.path.dirname(__file__), 'api_key.ini'))

# 값 가져오기
if 'OPENAI_API_KEY' not in config or 'OPEN_API_KEY' not in config['OPENAI_API_KEY']:
    raise RuntimeError("Missing [OPENAI_API_KEY] section or OPEN_API_KEY in api_key.ini")
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

app.include_router(router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}