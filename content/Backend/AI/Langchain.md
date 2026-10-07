### LangChain이란?

언어모델을 쓰는 작업 흐름을 표준화한 프레임워크. 모델이 달라도(OpenAI, Anthropic, Ollama ...) 같은 방식으로 호출
단순 호출만 필요하면 각 사 SDK로 충분. ==모델 교체, 도구/에이전트, RAG 연동==이 필요할 때 이점이 큼

**에이전트란?**
관찰 + 계획 => 행동
"행동"은 목표를 이해하고 ==외부 도구를 사용해서== 수행하는 것까지 포함
구성: **모델, 지침(system prompt), 도구**

```
질문 -> 모델이 판단 -> 도구 선택 -> 도구 실행 -> 결과를 보고 다시 판단 -> ... -> 최종 답변
```

이 반복(agent loop)을 `create_agent`가 대신 돌려 줌

### 전체 흐름

기본은 5단계, RAG는 여기서 ==도구 쪽에 검색 단계==가 붙는 것

|단계|기본 에이전트|RAG|
|---|---|---|
|1|모델 정의 `init_chat_model`|모델 정의|
|2|도구 정의 `@tool`|문서 로드 -> 분할 -> 임베딩 -> 벡터스토어에 저장|
|3|`create_agent(model, tools, ...)`|검색 도구 정의 (`@tool` + `similarity_search`)|
|4|`agent.invoke({"messages": ...})`|`create_agent`에 검색 도구 전달|
|5|`result["messages"][-1].text`|`invoke` -> 출력|

### 1. 준비

```bash
pip install langchain langchain-openai        # OpenAI
pip install langchain-anthropic               # Claude
pip install langchain-ollama                  # Ollama (로컬)
```

API 키는 환경변수로 (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`)

```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-..."
```

### 2. 모델 정의

`"provider:model"` 형식 문자열로 초기화

```python
from langchain.chat_models import init_chat_model

model = init_chat_model(
    "anthropic:claude-sonnet-4-6",
    temperature=0.7,   # 높을수록 창의적
    max_tokens=1000,   # 응답 길이 제한
    timeout=30,        # 초
    max_retries=6,     # 기본값 6
)
```

모델 단독 호출 (에이전트 없이)

```python
response = model.invoke("앵무새는 왜 말을 따라 할까?")
print(response.text)

for chunk in model.stream("질문"):        # 스트리밍
    print(chunk.text, end="")

model.batch(["질문1", "질문2"])           # 여러 개 병렬
```

메시지는 딕셔너리 또는 객체로 넘길 수 있음

```python
# 딕셔너리
[{"role": "system", "content": "너는 번역가다"},
 {"role": "user", "content": "I love programming"}]

# 메시지 객체
from langchain.messages import SystemMessage, HumanMessage
[SystemMessage("너는 번역가다"), HumanMessage("I love programming")]
```

|role|객체|설명|
|---|---|---|
|`system`|`SystemMessage`|모델 동작 지침|
|`user`|`HumanMessage`|사용자 입력|
|`assistant`|`AIMessage`|모델 응답 (`.tool_calls`, `.usage_metadata` 포함)|
|`tool`|`ToolMessage`|도구 실행 결과 (`tool_call_id` 필요)|

`.text`는 텍스트 부분, `.content`는 원본(문자열 또는 리스트)

### 3. 도구 정의 (`@tool`)

==일반 파이썬 함수를 LLM이 호출할 수 있는 도구로 바꿈==

```python
from langchain.tools import tool

@tool
def multiply_numbers(a: int, b: int) -> int:
    """입력된 두 정수를 곱해서 반환한다."""   # 설명이 있어야 한다
    return a * b

# 확인용 코드
print(f"Tool 이름: {multiply_numbers.name}")
print(f"설명: {multiply_numbers.description}")
print(multiply_numbers.invoke({"a": 3, "b": 4}))   # 12
```

데코레이터가 함수에서 뽑아 LLM에게 넘기는 정보

|함수의 요소|Tool 정보|
|---|---|
|함수 이름|도구 이름|
|docstring|도구 설명. ==LLM이 언제 쓸지 판단하는 근거==|
|타입 힌트|인자 스키마 (필수. 없으면 입력 스키마를 못 만듦)|

인자 설명까지 주고 싶으면 docstring에 `Args:`를 적고 `parse_docstring=True`

```python
@tool(parse_docstring=True)
def search_database(query: str, limit: int = 10) -> str:
    """고객 DB에서 검색어에 맞는 기록을 찾는다.

    Args:
        query: 검색어
        limit: 최대 결과 수
    """
    return f"'{query}' 결과 {limit}건"
```

복잡한 입력은 Pydantic으로 스키마를 따로 정의 (`args_schema`)

```python
from typing import Literal
from pydantic import BaseModel, Field

class WeatherInput(BaseModel):
    location: str = Field(description="도시 이름")
    units: Literal["celsius", "fahrenheit"] = Field(default="celsius")

@tool(args_schema=WeatherInput)
def get_weather(location: str, units: str = "celsius") -> str:
    """현재 날씨를 반환한다."""
    return f"{location}: 22도 ({units})"
```

LLM이 도구를 직접 쓰는 건 아니고, "이 도구를 이 인자로 호출해 달라"고 요청하면 ==에이전트가 실제로 실행==하고 결과를 다시 모델에게 돌려줌
에이전트 없이 모델에만 붙이려면 `model.bind_tools([get_weather])`

### 4. Agent 생성

```python
from langchain.agents import create_agent

agent = create_agent(
    model=model,                      # 문자열("provider:model")도 가능
    tools=[multiply_numbers],
    system_prompt="너는 계산을 도와주는 어시스턴트다.",
)
```

|파라미터|설명|
|---|---|
|`model`|모델 문자열 또는 초기화된 객체|
|`tools`|도구 리스트|
|`system_prompt`|문자열 또는 `SystemMessage`|
|`response_format`|구조화 출력 스키마 ([[#구조화 출력]])|
|`context_schema`|호출마다 넘길 컨텍스트의 타입 ([[#컨텍스트]])|
|`checkpointer`|대화 기억 저장소 ([[#대화 기억]])|
|`state_schema`|상태에 필드를 추가하고 싶을 때 (`AgentState` 상속)|
|`middleware`|재시도, 개인정보 필터, 사람 승인 같은 공통 처리|
|`name`|멀티 에이전트에서 구분용 이름|

### 5. Agent 실행과 출력

입력은 `{"messages": [...]}` 형태

```python
result = agent.invoke({
    "messages": [{"role": "user", "content": "12와 34를 곱해줘"}]
})
print(result["messages"][-1].text)    # 마지막 메시지가 최종 응답
```

같은 뜻의 다른 표기

```python
{"messages": [{"role": "user", "content": query}]}   # 딕셔너리
{"messages": [("user", query)]}                      # 튜플
{"messages": [HumanMessage(query)]}                  # 객체
```

Sub Agent도 똑같이 호출

```python
result = data_analyst_agent.invoke({
    "messages": [{"role": "user", "content": query}]
})
```

`result["messages"]`에는 사용자 질문, 모델의 도구 호출(`AIMessage.tool_calls`), 도구 결과(`ToolMessage`), 최종 답변이 순서대로 쌓여 있음. 도구를 어떻게 불렀는지 확인할 때 전체를 출력해 보면 됨

```python
for msg in result["messages"]:
    msg.pretty_print()
```

### 6. RAG로 확장

문서를 검색해서 답하게 하려면 ==검색 기능을 도구로 만들어 에이전트에 넘기면 됨==
구성 요소: Document Loader -> Text Splitter -> Embedding -> Vector Store -> Retriever

```bash
pip install langchain-text-splitters langchain-openai
```

#### 6-1. 문서 로드와 분할

```python
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

docs = [Document(page_content="...본문...", metadata={"source": "노트1"})]

splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = splitter.split_documents(docs)
```

`chunk_overlap`은 청크 사이를 겹쳐서 문맥이 끊기는 걸 줄이는 값

#### 6-2. 임베딩과 벡터스토어 저장

```python
from langchain_openai import OpenAIEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vector_store = InMemoryVectorStore(embedding=embeddings)
vector_store.add_documents(documents=splits)
```

`InMemoryVectorStore`는 실습용. 실제로는 Chroma, FAISS 등으로 교체

#### 6-3. 검색 도구 정의

```python
@tool
def search_notes(query: str) -> str:
    """노트에서 질문과 관련된 내용을 검색한다."""
    found = vector_store.similarity_search(query, k=4)   # 가장 비슷한 4개
    return "\n\n".join(
        f"[{d.metadata.get('source', '?')}]\n{d.page_content}" for d in found
    )
```

#### 6-4. Agent 생성과 출력

```python
agent = create_agent(
    model=model,
    tools=[search_notes],
    system_prompt="질문에 답하기 전에 search_notes로 먼저 검색하고, 검색 결과에 있는 내용만 근거로 답한다.",
)

result = agent.invoke({"messages": [("user", "Langchain의 @tool은 뭐야?")]})
print(result["messages"][-1].text)
```

**RAG 방식 구분**

|방식|동작|특징|
|---|---|---|
|2-Step RAG|항상 검색 -> 생성 순서|지연시간 예측 가능, 통제 쉬움 / 유연성 낮음|
|Agentic RAG|에이전트가 검색할지, 몇 번 할지 스스로 결정 (위 예시)|유연함 / 호출 횟수가 늘 수 있음|
|Hybrid|쿼리 개선, 검색 결과 검증, 답변 품질 검사를 중간에 끼움|복잡함|

### 7. 옵션 확장

#### 대화 기억

`checkpointer`를 주고, 호출할 때 ==같은 `thread_id`==를 넘기면 같은 대화로 이어짐

```python
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(model, tools=[multiply_numbers], checkpointer=InMemorySaver())
config = {"configurable": {"thread_id": "1"}}

agent.invoke({"messages": [("user", "내 이름은 철수야")]}, config)
agent.invoke({"messages": [("user", "내 이름이 뭐지?")]}, config)   # 기억함
```

`InMemorySaver`는 개발용(프로세스 끄면 사라짐). 운영은 `PostgresSaver` 같은 DB 기반 사용

#### 컨텍스트

호출할 때마다 달라지는 값(사용자 ID 등)을 넘기는 방법. ==`@dataclass`로 모양을 정의==하고 `context_schema`에 등록

```python
from dataclasses import dataclass
from langchain.tools import tool, ToolRuntime

@dataclass
class Context:
    user_id: str
    user_name: str

@tool
def greet(runtime: ToolRuntime[Context]) -> str:
    """현재 사용자에게 인사한다."""
    return f"안녕하세요, {runtime.context.user_name}님!"

agent = create_agent(model, tools=[greet], context_schema=Context)

agent.invoke(
    {"messages": [("user", "나한테 인사해줘")]},
    context=Context(user_id="1", user_name="Kim"),
)
```

`runtime: ToolRuntime` 파라미터는 실행 시 자동 주입되고, ==모델에게 보내는 스키마에는 포함되지 않음==
`config`, `runtime`은 예약어라 도구 인자 이름으로 못 씀

`ToolRuntime`으로 꺼낼 수 있는 것

|속성|내용|
|---|---|
|`runtime.context`|호출 시 넘긴 불변 컨텍스트|
|`runtime.state`|현재 상태 (`runtime.state["messages"]` 등, 단기 기억)|
|`runtime.store`|장기 기억 (`store.get`, `store.put`)|
|`runtime.stream_writer`|도구 실행 중간 진행 상황 스트리밍|
|`runtime.tool_call_id`|현재 도구 호출 ID|
|`runtime.config`|`RunnableConfig`|

도구가 `Command(update={...})`를 반환하면 상태를 직접 바꿀 수 있음. 이때 `messages`에 `ToolMessage`(`tool_call_id=runtime.tool_call_id`)를 같이 넣어야 함

#### 구조화 출력

응답을 정해진 스키마로 받고 싶을 때. ==결과는 `result["structured_response"]`==

```python
from pydantic import BaseModel, Field

class Person(BaseModel):
    name: str
    age: int = Field(ge=0, le=120)

agent = create_agent(model, tools=[], response_format=Person)
result = agent.invoke({"messages": [("user", "철수는 25살이다")]})
print(result["structured_response"])   # Person(name='철수', age=25)
```

`response_format`에 넣을 수 있는 값

|값|의미|
|---|---|
|스키마 타입 (`type[StructuredResponseT]`)|모델 기능에 따라 ==최적 전략을 자동 선택==|
|`ToolStrategy[StructuredResponseT]`|도구 호출을 이용해 구조화 출력|
|`ProviderStrategy[StructuredResponseT]`|공급자(OpenAI 등) 기본 구조화 출력 사용|
|`None`|구조화 출력 없음|

```python
from langchain.agents.structured_output import ToolStrategy, ProviderStrategy

create_agent(model, tools=[], response_format=ToolStrategy(Person))
```

|전략|옵션|
|---|---|
|`ToolStrategy`|`schema`, `tool_message_content`(도구 응답 메시지 문구), `handle_errors`(`True`/문자열/예외 타입/함수/`False`)|
|`ProviderStrategy`|`schema`, `strict`(엄격한 스키마 준수, langchain>=1.2)|

스키마 타입별 반환값

|스키마|`structured_response`|
|---|---|
|Pydantic `BaseModel`|검증된 인스턴스|
|`@dataclass`|dict|
|`TypedDict`|dict|
|JSON Schema|dict|
|Union (`ToolStrategy`만)|여러 스키마 중 선택|

에이전트 없이 모델만 쓸 때는 `model.with_structured_output(Person)`

### Annotation 정리

|Annotation|출처|역할|
|---|---|---|
|`@tool`|`langchain.tools`|함수를 도구로 변환. 타입 힌트 필수, docstring이 설명|
|`@tool("이름")`|〃|도구 이름 지정 (함수 이름 대신)|
|`@tool("이름", description="...")`|〃|설명을 docstring 대신 직접 지정|
|`@tool(parse_docstring=True)`|〃|docstring의 `Args:`를 인자 설명으로 파싱|
|`@tool(args_schema=스키마)`|〃|Pydantic 모델로 입력 스키마 지정|
|`@tool(return_direct=True)`|〃|도구 결과를 모델 거치지 않고 바로 반환|
|`@dataclass`|파이썬 표준 `dataclasses`|LangChain 기능이 아님. 컨텍스트/출력 스키마의 모양 정의 (`__init__`, `__repr__`, `__eq__` 자동 생성)|
|`runtime: ToolRuntime[T]`|`langchain.tools`|데코레이터는 아니고 도구 파라미터. context, state, store 접근|

Pydantic `Field`로 쓰는 제약 (JSON schema로 변환돼 LLM에도 전달)

| 인자   | 뜻                                      | 기호     |
| ---- | -------------------------------------- | ------ |
| `ge` | **g**reater than or **e**qual (크거나 같다) | `>=`   |
| `le` | **l**ess than or **e**qual (작거나 같다)    | `<=`   |
| `gt` | greater than                           | `>`    |
| `lt` | less than                              | `<`    |
| `eq` | equal                                  | (`==`) |
| `ne` | not equal                              | (`!=`) |

`Field(description="...")`은 LLM에게 인자 설명을 줌, `Field(default=...)`는 기본값

### 참고

**로컬 모델 (llama.cpp, Ollama)**
무료, 오프라인, 데이터가 밖으로 안 나감 / 상용 모델보다 성능은 낮음
`ollama pull llama3.1` 후 `init_chat_model("ollama:llama3.1")`

**프롬프트 템플릿 + 체인 (LCEL)**
에이전트 없이 `|`로 이어 붙이는 방식

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_messages([
    ("system", "너는 {role}이다."),
    ("human", "{question}"),
])
chain = prompt | model | StrOutputParser()
chain.invoke({"role": "번역가", "question": "Hello를 한국어로"})
```

**인코더 / 디코더**
- 인코더: 구글 (BERT). 문장 이해에 강함
- 디코더: GPT (OpenAI). 텍스트 생성에 강함, 생성형 AI의 기반

**링크**
- [Agents](https://docs.langchain.com/oss/python/langchain/agents)
- [Tools](https://docs.langchain.com/oss/python/langchain/tools)
- [Models](https://docs.langchain.com/oss/python/langchain/models)
- [Messages](https://docs.langchain.com/oss/python/langchain/messages)
- [Structured output](https://docs.langchain.com/oss/python/langchain/structured-output)
- [Short-term memory](https://docs.langchain.com/oss/python/langchain/short-term-memory)
- [Retrieval](https://docs.langchain.com/oss/python/langchain/retrieval)
- [RAG tutorial](https://docs.langchain.com/oss/python/langchain/rag)
