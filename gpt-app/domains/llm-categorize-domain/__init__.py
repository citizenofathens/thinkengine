import json
import os
import logging
import re
from typing import Dict, List, Optional
from openai import OpenAI

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Base categories
BASE_CATEGORIES = [
    "AI 개발", "콘텐츠 제작", "마케팅 전략", "개인 회고",
    "트레이딩 분석", "스토리텔링 설계", "UI/UX 디자인",
    "보안 위험", "YouTube 기획"
]

def extract_metadata(text):
    """Extract basic metadata from text"""
    summary = text.split('.')[0] if '.' in text else text.split('\n')[0]
    keywords = list(set(re.findall(r'\w+', text)))[:5]      
    return summary, keywords

def fix_json(json_str):
    """Fix common JSON issues that cause parsing errors"""
    # Replace single quotes with double quotes (common mistake in JSON)
    fixed = re.sub(r"'([^']*)':", r'"\1":', json_str)
    # Fix trailing commas in lists/objects (not allowed in JSON)
    fixed = re.sub(r",\s*}", "}", fixed)
    fixed = re.sub(r",\s*\]", "]", fixed)
    # Add double quotes around property names that are missing them
    fixed = re.sub(r"([{,])\s*(\w+):", r'\1"\2":', fixed)
    return fixed

def categorize_memo(memo_text: str, categories: Optional[List[str]] = None) -> Dict:
    """
    Categorize a memo using OpenAI.
    
    Args:
        memo_text: Text to categorize
        categories: Optional list of categories to use
    
    Returns:
        Dict with classification results
    """
    if not memo_text:
        return {"error": "Empty memo text provided"}
    
    # Get API key from environment or from a config file
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        try:
            import configparser
            config = configparser.ConfigParser()
            ini_path = os.path.join(os.path.dirname(__file__), 'llm-categorizer/src/app/api_key.ini')
            config.read(ini_path)
            api_key = config['OPENAI_API_KEY']['OPEN_API_KEY']
        except Exception as e:
            logger.error(f"Failed to load API key: {e}")
            return {"error": "API key not found"}
    
    # Use categories if provided, otherwise use BASE_CATEGORIES
    cats = categories if categories else BASE_CATEGORIES
    
    try:
        # Extract metadata
        summary, keywords = extract_metadata(memo_text)
        enriched_text = f"요약: {summary}\n키워드: {', '.join(keywords)}\n{memo_text}"
        
        # Create the prompt
        prompt = f"""
        당신은 분류 전문가입니다. 아래 메모를 기존 카테고리 중 하나에 분류하거나, 
        기존 카테고리에 맞지 않으면 새로운 카테고리명을 직접 만들어서 분류하세요.
        
        반드시 이 형식으로만 응답하세요(유효한 JSON):
        {{
          "classification": {{
            "1": "카테고리명",
            "2": "카테고리명"
          }},
          "new_categories": []
        }}
        
        다른 설명이나 텍스트를 추가하지 마세요. 오직 JSON만 응답하세요.
        모든 키와 값은 반드시 쌍따옴표로 감싸야 합니다.
        
        기존 카테고리: {', '.join(cats)}
        
        메모:
        {enriched_text}
        """
        
        # Call OpenAI API with explicit JSON output format
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "당신은 메모 분류 전문가입니다. 반드시 유효한 JSON 형식으로만 응답하세요. 모든 키와 값은 반드시 쌍따옴표로 감싸야 합니다."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}  # Force JSON response
        )
        
        # Extract content
        content = response.choices[0].message.content.strip()
        logger.info(f"AI response: {content[:100]}...")
        
        # Try to fix any JSON issues if present
        try:
            # First try direct parsing
            result = json.loads(content)
        except json.JSONDecodeError as e:
            logger.warning(f"Initial JSON parsing failed: {e}. Attempting to fix JSON.")
            # Try to fix the JSON and parse again
            fixed_content = fix_json(content)
            # Extract just the JSON part if there's text around it
            json_match = re.search(r'(\{[\s\S]*\})', fixed_content)
            if json_match:
                fixed_content = json_match.group(1)
            logger.info(f"Fixed JSON: {fixed_content[:100]}...")
            result = json.loads(fixed_content)
        
        # Ensure required keys exist
        if "classification" not in result:
            result["classification"] = {"1": "분류 안됨"}
        if "new_categories" not in result:
            result["new_categories"] = []
            
        # Add metadata
        result["metadata"] = {
            "summary": summary,
            "keywords": keywords
        }
            
        return result
        
    except Exception as e:
        logger.error(f"Error in categorize_memo: {e}")
        # Return a safe fallback result
        return {
            "error": str(e),
            "classification": {"1": "분류 안됨"},
            "new_categories": [],
            "metadata": {
                "summary": memo_text[:50] + "..." if len(memo_text) > 50 else memo_text,
                "keywords": []
            }
        }

# Make these available as part of the module's public API
__all__ = ['categorize_memo', 'BASE_CATEGORIES']
