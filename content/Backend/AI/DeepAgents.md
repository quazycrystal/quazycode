### Deep Agents란?

LangChain 위에 만들어진 ==에이전트 하네스(harness)== 라이브러리. 실행은 LangGraph가 담당
`create_agent`가 "모델 + 도구" 루프만 주는 것이라면, Deep Agents는 긴 작업에 필요한 걸 ==기본으로 얹어서== 줌

기본 에이전트는 [[Langchain]] 참고

|기능|설명|
|---|---|
|파일시스템|`ls`, `read_file`, `write_file`, `edit_file`, `glob`, `grep`. 컨텍스트에 다 넣지 않고 ==파일로 빼 두고 필요할 때 읽음==|
|서브에이전트|`task` 도구로 독립된 하위 에이전트에게 작업을 위임. 결과만 요약해서 받음|
|계획|`write_todos`로 할 일 목록을 만들고 진행 상황 추적 (선택, `TodoListMiddleware`)|
|메모리|`AGENTS.md` 같은 파일을 시작할 때 읽어서 지속 컨텍스트로 사용|
|컨텍스트 관리|자동 요약, 프롬프트 캐싱, 스킬(필요할 때만 불러오는 도메인 지식)|
|제어|사람 승인(Human-in-the-loop), 파일 접근 권한|

**언제 쓰나**
- 단계가 많고 오래 걸리는 작업 (리서치, 코드 작성, 문서 분석)
- 중간 결과가 많아서 컨텍스트가 금방 차는 작업
- 단순 질의응답이나 도구 한두 개면 `create_agent`로 충분

### 전체 흐름

|단계|내용|
|---|---|
|1|설치, 모델 정의|
|2|도구 정의 (일반 함수 또는 `@tool`)|
|3|`create_deep_agent(model, tools, system_prompt, ...)`|
|4|(필요 시) 서브에이전트, 백엔드, 사람 승인 설정|
|5|`agent.invoke({"messages": ...})` -> 결과 읽기|

내부에서는 메인 에이전트가 ==계획 -> 파일로 정리 -> 서브에이전트에 위임 -> 결과 종합== 순으로 돌아감

### 1. 준비

```bash
pip install deepagents
```

### 2. 기본 사용

```python
from deepagents import create_deep_agent

def get_weather(city: str) -> str:
    """도시의 날씨를 반환한다."""
    return f"{city}는 맑음"

agent = create_deep_agent(
    model="anthropic:claude-sonnet-5",
    tools=[get_weather],
    system_prompt="너는 도움이 되는 어시스턴트다.",
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "서울 날씨 알려줘"}]}
)
print(result["messages"][-1].text)
```

`create_agent`와 ==입력/출력 형식이 같음== (`{"messages": [...]}`)
`tools`에는 `@tool` 객체뿐 아니라 ==타입 힌트와 docstring이 있는 일반 함수==도 그대로 넣을 수 있음

### 3. 서브에이전트

메인 에이전트가 `task()` 도구로 작업을 넘김. 서브에이전트는 기본적으로 ==위임받은 작업만 보고== 실행하고(전체 대화 기록은 안 봄), 요약된 결과만 돌려줌 -> 메인의 컨텍스트가 깨끗하게 유지됨

```python
research_agent = {
    "name": "researcher",
    "description": "복잡한 주제를 조사한다",
    "system_prompt": "너는 꼼꼼한 리서처다. 결과는 요약해서 돌려줘.",
    "tools": [internet_search],
}

agent = create_deep_agent(
    model="anthropic:claude-sonnet-5",
    subagents=[research_agent],
)
```

|필드|설명|
|---|---|
|`name` (필수)|메인이 `task()`로 부를 때 쓰는 이름|
|`description` (필수)|무엇을 하는지. ==메인이 위임할지 판단하는 근거==라 구체적으로|
|`system_prompt` (필수)|지침. 부모 것을 상속하지 않음|
|`tools`|지정하면 부모 도구 대신 이것만 사용|
|`model`|서브에이전트만 다른 모델 사용|
|`mode`|`"isolated"`(기본, 위임된 작업만 봄) / `"fork"`(부모 대화 기록 상속)|
|`middleware`, `interrupt_on`, `skills`, `response_format`, `permissions`|서브에이전트 단위로 따로 설정|

- 모든 deep agent에는 ==`general-purpose` 서브에이전트가 기본 포함== (메인의 도구, 모델, 스킬을 상속). 같은 이름으로 직접 정의하면 대체됨
- 이미 만들어 둔 LangGraph 그래프는 `CompiledSubAgent`(`name`, `description`, `runnable`)로 넣을 수 있음. 그래프 상태에 `"messages"` 키가 있어야 함

**잘 쓰는 법**
- description을 구체적으로 써야 메인이 언제 위임할지 안다
- 서브에이전트에는 필요한 도구만 준다
- ==원본 데이터가 아니라 요약을 반환==하게 지시한다
- 작업에 맞는 모델을 따로 고른다

### 4. 파일시스템 백엔드

내장 파일 도구가 실제로 어디에 읽고 쓰는지를 정하는 것이 `backend`

|백엔드|저장 위치|특징|
|---|---|---|
|`StateBackend` (기본)|LangGraph 상태|같은 스레드 안에서만 유지, 스레드끼리 공유 안 됨|
|`FilesystemBackend`|로컬 디스크 (root 아래)|`virtual_mode=True`로 root 밖 접근 차단|
|`StoreBackend`|LangGraph `BaseStore` (Redis, Postgres 등)|스레드 간 영구 저장, namespace로 사용자별 분리|
|`CompositeBackend`|경로별로 다른 백엔드|예: 기본은 임시, `/memories/`만 영구|
|`LocalShellBackend`|`FilesystemBackend` + `execute`|호스트에서 셸 명령 실행. ==신뢰하는 로컬 개발에서만==|
|Sandbox|격리된 환경 (LangSmith, Daytona 등)|코드 실행까지 안전하게|

```python
from deepagents.backends import CompositeBackend, StateBackend, StoreBackend

agent = create_deep_agent(
    backend=CompositeBackend(
        default=StateBackend(),
        routes={"/memories/": StoreBackend(namespace=lambda rt: (rt.server_info.user.identity,))},
    )
)
```

`FilesystemBackend`는 에이전트가 파일 안의 비밀 값을 읽고 네트워크 도구로 내보낼 수 있으니, ==`virtual_mode=True`, 사람 승인, 민감 파일 제외==를 같이 쓰는 게 안전

### 5. 사람 승인 (Human-in-the-loop)

`interrupt_on`에 지정한 도구는 ==실행 직전에 멈추고== 승인을 기다림. ==checkpointer가 필수==

```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Command

agent = create_deep_agent(
    model="openai:gpt-5.5",
    interrupt_on={"delete_file": True, "execute": True},
    checkpointer=MemorySaver(),
)

config = {"configurable": {"thread_id": "1"}}
result = agent.invoke({"messages": [("user", "임시 파일 지워줘")]}, config=config)

if result.get("__interrupt__"):
    decisions = [{"type": "approve"}]     # 멈춘 호출 하나당 하나, 순서대로
    result = agent.invoke(Command(resume={"decisions": decisions}), config=config)
```

|결정|동작|
|---|---|
|`approve`|에이전트가 제안한 인자 그대로 실행|
|`edit`|인자를 고쳐서 실행|
|`reject`|실행하지 않고 피드백을 에이전트에게 전달|
|`respond`|사람의 답을 도구 결과처럼 반환 (사람이 도구 역할일 때만)|

처음 호출과 재개 호출에 ==같은 `thread_id`==를 써야 함
`interrupt_on` 값은 `True` / `False` / `InterruptOnConfig`(`allowed_decisions`, 조건 `when`)

### 파라미터 정리

`create_deep_agent(...)`

|파라미터|설명|
|---|---|
|`model`|`"provider:model"` 문자열 또는 모델 객체|
|`tools`|함수, 도구 객체, 딕셔너리|
|`system_prompt`|에이전트 지침|
|`subagents`|서브에이전트 목록|
|`backend`|파일시스템 저장 방식|
|`memory`|시작 시 읽을 파일 (`["./AGENTS.md"]`)|
|`skills`|스킬 디렉터리 경로 (`["./skills/research/"]`), 필요할 때만 로드|
|`middleware`|도구 호출 가로채기 등 공통 처리 (`@wrap_tool_call`)|
|`interrupt_on`|사람 승인이 필요한 도구|
|`permissions`|경로별 읽기/쓰기 권한 (`FilesystemPermission(path="/data/", read=True, write=False)`)|
|`response_format`|구조화 출력 스키마 (`result["structured_response"]`)|
|`checkpointer`|상태 저장 (대화 기억, 승인 재개에 필요)|
|`store`|스레드 간 장기 저장 (`InMemoryStore()`)|
|`context_schema`|호출마다 넘길 컨텍스트 타입 (`TypedDict` 등)|
|`name`|로깅, LangSmith 추적용 이름|

내장 도구: `write_todos`, `ls`, `read_file`, `write_file`, `edit_file`, `delete`, `glob`, `grep`, `task` (+ `execute`는 `LocalShellBackend`/샌드박스에서만)

### create_agent와 비교

|항목|`create_agent`|`create_deep_agent`|
|---|---|---|
|패키지|`langchain`|`deepagents`|
|기본 제공|모델 + 도구 루프|+ 파일시스템, 서브에이전트, 계획, 메모리, 요약|
|적합|짧은 작업, 단순 도구 사용|길고 복잡한 작업|
|제어|직접 구성|기본값이 많아 빠르게 시작, 대신 구조가 무거움|

### 참고

- RAG 튜토리얼도 Deep Agents로 구현돼 있음. 검색한 청크를 파일로 저장하고, 청크마다 서브에이전트에게 분석시킨 뒤 종합하는 구조 ([RAG tutorial](https://docs.langchain.com/oss/python/langchain/rag))
- 기본 RAG 흐름은 [[Langchain]]의 6번 참고
- [Overview](https://docs.langchain.com/oss/python/deepagents/overview)
- [Customization](https://docs.langchain.com/oss/python/deepagents/customization)
- [Subagents](https://docs.langchain.com/oss/python/deepagents/subagents)
- [Backends](https://docs.langchain.com/oss/python/deepagents/backends)
- [Human-in-the-loop](https://docs.langchain.com/oss/python/deepagents/human-in-the-loop)
