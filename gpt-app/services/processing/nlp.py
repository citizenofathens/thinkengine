# services/processing/nlp.py
def simple_summarize(text: str) -> str:
    # 임시 요약 로직: 첫 문장
    return text.split('.')[0] + '.' if '.' in text else text[:50]

def extract_keywords(text: str) -> list:
    # 임시 태그 추출: 단어 길이 2 이상, 중복 제거
    words = text.replace('.', '').split()
    return list(set([word for word in words if len(word) >= 2]))[:5]
