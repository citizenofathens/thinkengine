from langchain.output_parsers import (
    OutputFixingParser,
    PydanticOutputParser,
)
from langchain_core.prompts import PromptTemplate 
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
from app.utils.utils import is_json_like

import configparser
from langchain_core.pydantic_v1 import BaseModel, Field
from pydantic import BaseModel, Field, create_model



from app.utils.config import get_openai_api_key
openai_api_key = get_openai_api_key()

client = OpenAI(api_key=openai_api_key)
import logging 
def create_example_data(data):
    example_data = {}
    for index, key in enumerate(data.keys(), start=1):
        example_data[key] = f"example{index}"
    return example_data
def extract_metadata(text):
    # Fast, simple keyword extraction: unique words (alphanumeric, Korean, etc.)
    import re
    summary = text.split('.')[0] if '.' in text else text.split('\n')[0]
    keywords = list(set(re.findall(r'\w+', text)))[:5]      
    return summary, keywords

def generate_prompt(meta_template, task: str = "meta_extract"):
    import json
    print('메타프롬프트 in')
    #late.get_meta_extract_template(task)  # 이후 전환
    if isinstance(meta_template, str):
        print('meta_template is a string')
        meta_template_str = meta_template.strip()
        if meta_template_str.startswith("{") or meta_template_str.startswith("["):
            try:
                meta_template = json.loads(meta_template)
            except Exception as e:
                raise ValueError(f"meta_template is a string but not valid JSON: {meta_template}\nError: {e}")
    else:
        logging.info(f"meta_template is not string  {meta_template}")
    print("meta_template:", meta_template) 
    fields = {key: (str, Field(default="default",
                               description='document explainable metadata'))
    for key, value in meta_template.items() if key != "taxonomy"}
    print('fields:', fields)
    DynamicMetadata = create_model('DynamicMetadata', **fields)
    # create_model을 사용하여 Metadata 클래스 동적으로 확장 
    print('dynamic meta 확인', DynamicMetadata.schema_json(indent=2))
    json_schema_data = create_example_data(json.loads(DynamicMetadata.schema_json(indent=2))['properties'])
    print('json_schema_data:', json_schema_data)

    parser = PydanticOutputParser(pydantic_object=DynamicMetadata)
    print('template:', meta_template)
    if task == 'meta_extract':
        prompt = PromptTemplate(
            template="""{prefix} \n메타데이터템플릿:{meta_template}\n문서:{document}\n   1. 전체 문서를 읽고 내용을 이해하세요\
                    2. 제공된 목록의 각 주요 메타데이터와 연관 메타데이터를 확인하세요.\
                    3. 문서의 내용을 메타데이터 템플릿의 밸류 중 어떤 값과 가장 연관 있을까요?\ 
                    4. 메타템플릿의 값의 순서에 상관없이 문서의 내용과 가장 관련이 있는 메타데이터 밸류 1개씩  메타데이터템플릿 리스트에서 결정합니다.\
                    {format_instructions} {suffix}:""",
            input_variables=["prefix", "instruct", "meta_template", "document", "explanation", "suffix"],
            partial_variables={"format_instructions": parser.get_format_instructions()})

    elif task == 'meta_extract_with_explain':
        prompt = PromptTemplate(
            template="{prefix}1. 전체 문서와 설명을 읽고 내용을 이해하세요\
                    2. 제공된 목록의 각 주요 메타데이터와 연관 메타데이터를 확인하세요.\
                    3. 문서의 내용을 메타데이터템플릿 및 연관 메타데이터 목록과 비교하세요.\
                    4. 문서의 내용과 가장 관련이 있는 최상위 메타데이터 1개를 메타데이터템플릿 리스트에서 결정합니다.\
                    \n문서:{document}"
                        "{format_instructions} {suffix}:",
            input_variables=["prefix", "instruct", "document", "suffix"],
        partial_variables = {"format_instructions": parser.get_format_instructions()})

    elif task == 'generate_explain':
        prompt = PromptTemplate(
            template="{prefix} 문서에 대해 상세한 설명을 제공하세요.  {suffix}:",
            input_variables=["prefix", "instruct", "document", "suffix"],
            #     partial_variables={"format_instructions": parser.get_format_instructions()},
            partial_variables={"format_instructions": parser.get_format_instructions()})

    return prompt


def classify_memo(text: str, categories: List[str], use_structured_output: bool = True) -> Dict: 
    with open(r'C:\workspace\thinkengine\gpt-app\domains\llm-categorize-domain\llm-categorizer\src\app\taxonomy_template.json', 'r', encoding='utf-8') as f:        
        schema = json.load(f)
    print('schema:', schema) 
    
    from langchain.chat_models import ChatOpenAI
    
    llm = ChatOpenAI(openai_api_key=openai_api_key, temperature=0.3)
    prompt = generate_prompt(meta_template=schema, task="meta_extract")
    
    suffix = ""
    prefix = "" # if using opensource model 
    logging.info("Prompt generated: %s", prompt.format(prefix=prefix, meta_template=schema, document=text, suffix=suffix))
    
    if openai_api_key:          
        first_chain = prompt | llm
    else:
        first_chain = prompt | llm.bind(temperature=0.3, stop=['<|eot_id|>'])
        
    print(prompt.format(prefix=prefix, meta_template=schema, document=text, suffix=suffix))
    llm_response = first_chain.invoke(
            {"prefix": prefix, "meta_template": schema, "document": text,
             "suffix": suffix})
    print("llm_response:%s", llm_response.content)
    
    try:
        result = json.loads(llm_response.content)
        
        # Convert new schema result to expected structure if using structured output
        if use_structured_output:
            # Extract summary and keywords
            summary, keywords = extract_metadata(text)
            
            # Check if we need to convert the new taxonomy format to the expected result format
            if "domain" in result and "category" not in result.get("classification", {}):
                # Create the classification structure expected by the API
                classification = {}
                lines = text.strip().splitlines()
                domain = result.get("domain", "분류 안됨")
                category = result.get("category", "분류 안됨")
                
                # Assign hierarchical classification to each line
                for idx, line in enumerate(lines, 1):
                    classification[str(idx)] = f"{domain} / {category}"
                
                # Structure the result to match expected format
                result = {
                    "classification": classification,
                    "new_categories": [],
                    "metadata": {
                        "domain": domain,
                        "category": category,
                        "sub_category": result.get("sub_category", ""),
                        "topic": result.get("topic", ""),
                        "subtopic": result.get("subtopic", ""),
                        "tag": result.get("tag", "")
                    }
                }
        
        return result
        
    except Exception as e:
        print(f"Error parsing LLM response: {e}")
        logging.error(f"Error parsing LLM response: {e}")
        
        # Fallback to the old approach if there's an error with the new schema
        if use_structured_output:
            summary, keywords = extract_metadata(text)
            enriched_text = f"요약: {summary}\n키워드: {', '.join(keywords)}\n{text}" 
            
            # Explicit example in the prompt
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

            기존 카테고리: {', '.join(categories)}
            
            메모:
            {text}
            """
            
            # Use function calling if available
            response = client.chat.completions.create(
                model="gpt-4.1-2025-04-14",
                messages=[
                    {"role": "system", "content": "당신은 메모 분류 전문가입니다. 반드시 JSON 스키마에 맞춰 응답하세요."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}  # Force JSON response
            )
            
            # Ensure proper JSON parsing
            content = response.choices[0].message.content.strip()
            if not content:
                print(f"LLM response content is empty. Full response: {response}")
                raise ValueError("LLM response content is empty. Cannot classify memo.")
            try:
                result = json.loads(content)
                # Validate result has required keys
                if "classification" not in result or "new_categories" not in result:
                    print(f"LLM response missing required keys. Content: {content}")
                    raise ValueError("Response missing required keys")
                return result
            except Exception as e:
                print(f"Failed to parse LLM output as JSON. Content: {content}\nError: {e}")
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
                model="gpt-4.1-2025-04-14",
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

