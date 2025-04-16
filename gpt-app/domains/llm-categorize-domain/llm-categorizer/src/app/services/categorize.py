
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
            "description": "문장 번호별로 카테고리명을 매핑 (새로운 카테고리는 실제 이름으로)",
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
        새로운 카테고리는 반드시 실제 이름(예: '학습 전략', '개인 습관')으로만 작성하세요. 
        결과는 아래 JSON 스키마에 맞춰 한국어로만 응답하세요.

        기존 카테고리: {', '.join(categories)}

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

