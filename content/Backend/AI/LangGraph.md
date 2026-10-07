### LangGraph란?

에이전트의 작업 흐름을 ==그래프(노드 + 엣지)로 직접 설계==하는 저수준 오케스트레이션 프레임워크
LangChain은 모델/도구/에이전트 같은 부품을, LangGraph는 그 부품들을 ==어떤 순서와 조건으로 실행할지==(실행, 상태 관리)를 담당. `create_agent`도 내부적으로는 LangGraph 위에서 돌아감

|`create_agent`|LangGraph|
|---|---|
|"모델 + 도구" 루프 하나를 통째로 줌|흐름(순서, 분기, 반복)을 내가 그림|
|빠르게 시작|세밀한 제어, 여러 에이전트 조합|

**그래프를 쓰는 이유**
- 순서가 정해진 파이프라인 (뉴스 수집 -> 주가 분석 -> 리포트 작성)
- 조건에 따라 분기하거나 반복하는 흐름
- 중간 상태 저장, 사람 승인, 실패 후 이어서 실행 (durable execution)

기본 에이전트는 [[Langchain]], 서브에이전트 방식은 [[DeepAgents]] 참고

### 전체 흐름

|단계|내용|코드|
|---|---|---|
|1|상태(State) 정의|`class State(TypedDict)` 또는 `MessagesState`|
|2|노드 정의|상태를 받아 ==바뀐 부분만 dict로 반환==하는 함수 (또는 에이전트)|
|3|그래프 생성, 노드 등록|`StateGraph(State)`, `add_node`|
|4|엣지 연결|`add_edge`, `add_conditional_edges`|
|5|컴파일|`builder.compile()`|
|6|실행, 출력|`graph.invoke(...)`, `result["messages"][-1].content`|

### 1. 준비

```bash
pip install -U langgraph langchain langchain-anthropic
```

### 2. 상태 (State)

그래프 전체가 공유하는 데이터. 노드는 이 상태를 읽고, ==바꿀 값만 반환==하면 LangGraph가 상태에 반영

```python
from typing_extensions import TypedDict

class State(TypedDict):
    foo: int
    bar: list[str]
```

|정의 방식|특징|
|---|---|
|`TypedDict`|권장|
|`@dataclass`|기본값 지정 가능|
|Pydantic `BaseModel`|검증 포함|

#### 리듀서 (reducer)

키마다 ==노드의 반환값을 상태에 어떻게 합칠지==를 정함
- 지정 안 하면: 덮어쓰기
- 지정하면: 합치기

```python
from operator import add
from typing import Annotated

class State(TypedDict):
    items: Annotated[list[str], add]    # 리스트를 이어 붙임
```

#### messages와 add_messages

대화 기록용 리듀서. ==덮어쓰지 않고 뒤에 이어 붙이고==, 문자열이나 딕셔너리 입력은 메시지 객체로 변환해 줌

```python
from langgraph.graph.message import add_messages
from langchain.messages import AnyMessage

class State(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
```

매번 이렇게 쓰기 번거로워서 미리 만들어 둔 `MessagesState`가 있음. 필드를 더하려면 상속

```python
from langgraph.graph import MessagesState

class State(MessagesState):
    documents: list[str]     # messages는 이미 포함
```

### 3. 노드 (Node)

==상태를 받아서 바뀐 값을 dict로 반환하는 파이썬 함수==

```python
def plain_node(state: State):
    return {"foo": 1}                      # 반환한 키만 갱신됨

def node_with_config(state: State, config: RunnableConfig):
    thread_id = config["configurable"]["thread_id"]
    return state

def node_with_runtime(state: State, runtime: Runtime):
    user_id = runtime.context.user_id      # context_schema로 넘긴 값
    return state
```

```python
builder = StateGraph(State)
builder.add_node("node_name", plain_node)
```

#### 에이전트를 노드로 쓰기

`create_agent`로 만든 에이전트는 이미 컴파일된 그래프이므로 ==함수로 감쌀 필요 없이 `add_node`에 그대로 넣을 수 있음== (부모와 상태 키가 같을 때, 여기서는 `messages`)

```python
builder.add_node("news_agent", news_agent)     # 함수가 아니라 에이전트 자체
```

상태 구조가 다르면 노드 함수 안에서 호출하고 상태를 변환

```python
def call_subgraph(state: State):
    out = subgraph.invoke({"bar": state["foo"]})    # 부모 상태 -> 서브 상태
    return {"foo": out["bar"]}                      # 서브 결과 -> 부모 상태
```

### 4. 엣지 (Edge)

`START`, `END`는 입구와 출구를 나타내는 가상 노드

```python
from langgraph.graph import START, END

builder.add_edge(START, "node_a")      # 시작 -> node_a
builder.add_edge("node_a", "node_b")   # 항상 node_a 다음은 node_b
builder.add_edge("node_b", END)        # 종료
```

#### 조건부 엣지

라우팅 함수가 ==다음에 갈 노드 이름을 반환==

```python
def routing_function(state: State) -> str:
    return "node_b" if state["condition"] else "node_c"

builder.add_conditional_edges("node_a", routing_function)

# 반환값 -> 노드 매핑
builder.add_conditional_edges("node_a", routing_function, {True: "node_b", False: "node_c"})

# 시작점도 조건부로
builder.add_conditional_edges(START, routing_function)
```

#### Command

상태 갱신과 이동을 ==노드 하나에서 동시에== 처리

```python
from typing import Literal
from langgraph.types import Command

def my_node(state: State) -> Command[Literal["next_node"]]:
    return Command(update={"key": "value"}, goto="next_node")
```

사람 승인 후 재개할 때도 `Command(resume=...)`를 씀

#### Send

런타임에 정해지는 개수만큼 노드를 병렬 실행 (map-reduce). 각각 독립된 상태 사본을 받음

```python
from langgraph.types import Send

def continue_to_jokes(state: OverallState):
    return [Send("generate_joke", {"subject": s}) for s in state["subjects"]]

builder.add_conditional_edges("node_a", continue_to_jokes)
```

### 5. 컴파일과 실행

```python
graph = builder.compile()

result = graph.invoke({"messages": [{"role": "user", "content": "안녕"}]})
```

==컴파일해야 실행 가능한 그래프가 됨== (`builder`는 설계도일 뿐)

#### 결과에서 최종 답변 꺼내기

`result`는 마지막 상태 전체이고, `messages`에는 노드가 실행될 때마다 메시지가 쌓임. 마지막 노드가 응답을 `messages`에 추가했다면 ==`[-1]`이 최종 답변==

```python
print(result["messages"][-1].content)

for m in result["messages"]:      # 전체 과정 확인
    m.pretty_print()
```

`[-1]`은 문자열이 아니라 `AIMessage` 객체이고, `.content`(또는 `.text`)가 내용
==마지막 노드가 응답을 messages에 안 넣으면 -1이 중간 메시지==가 되니 마지막 노드의 반환 형태를 확인

### 6. 예제 1: 순차 파이프라인 (투자 리포트)

```python
from langgraph.graph import StateGraph, MessagesState, START, END

def report_node(state: MessagesState):
    # 앞 단계에서 쌓인 messages를 바탕으로 리포트 작성
    answer = model.invoke(
        [("system", "앞선 뉴스와 주가 분석을 종합해 투자 리포트를 써라.")] + state["messages"]
    )
    return {"messages": [answer]}      # messages에 추가해야 [-1]이 리포트가 됨

builder = StateGraph(MessagesState)
builder.add_node("news_agent", news_agent)       # 에이전트 자체를 노드로
builder.add_node("stock_agent", stock_agent)
builder.add_node("reporter", report_node)

builder.add_edge(START, "news_agent")
builder.add_edge("news_agent", "stock_agent")
builder.add_edge("stock_agent", "reporter")
builder.add_edge("reporter", END)

graph = builder.compile()

result = graph.invoke({"messages": "LG(003550.KS) 투자 리포트 작성해줘"})
print(result["messages"][-1].content)
```

```
START -> news_agent -> stock_agent -> reporter -> END
```

`news_agent`와 `stock_agent`는 같은 `messages`를 공유하므로 ==앞 에이전트의 결과를 뒤 에이전트가 그대로 읽음==

### 7. 예제 2: 도구 호출 루프 (직접 구현한 에이전트)

`create_agent`가 내부에서 하는 일을 직접 그린 것. ==조건부 엣지로 반복==을 만드는 전형적인 패턴

```python
from typing import Literal
from langchain.messages import SystemMessage, ToolMessage

model_with_tools = model.bind_tools(tools)
tools_by_name = {t.name: t for t in tools}

def llm_call(state: MessagesState):
    msg = model_with_tools.invoke(
        [SystemMessage("계산을 도와주는 어시스턴트다.")] + state["messages"]
    )
    return {"messages": [msg]}

def tool_node(state: MessagesState):
    result = []
    for call in state["messages"][-1].tool_calls:            # 마지막 AI 메시지의 도구 호출
        observation = tools_by_name[call["name"]].invoke(call["args"])
        result.append(ToolMessage(content=observation, tool_call_id=call["id"]))
    return {"messages": result}

def should_continue(state: MessagesState) -> Literal["tool_node", END]:
    return "tool_node" if state["messages"][-1].tool_calls else END

builder = StateGraph(MessagesState)
builder.add_node("llm_call", llm_call)
builder.add_node("tool_node", tool_node)
builder.add_edge(START, "llm_call")
builder.add_conditional_edges("llm_call", should_continue, ["tool_node", END])
builder.add_edge("tool_node", "llm_call")      # 도구 결과를 보고 다시 판단
agent = builder.compile()
```

```
START -> llm_call -> (도구 호출 있음?) -> tool_node -> llm_call -> ... -> END
                          └ 없음 -> END
```

### 8. 옵션 확장

#### 대화 기억 (checkpointer)

==컴파일할 때 `checkpointer`를 주고==, 호출 시 같은 `thread_id`를 넘기면 이어짐

```python
from langgraph.checkpoint.memory import InMemorySaver

graph = builder.compile(checkpointer=InMemorySaver())

graph.invoke(
    {"messages": [{"role": "user", "content": "내 이름은 철수야"}]},
    {"configurable": {"thread_id": "thread-1"}},
)
```

|저장소|용도|
|---|---|
|checkpointer|스레드 하나 안의 상태 스냅샷 (대화 이어가기, 사람 승인 재개)|
|store (`InMemoryStore`)|스레드 간 공유되는 장기 데이터 (사용자 선호 등). `compile(checkpointer=..., store=...)`|

`InMemorySaver`는 재시작하면 사라짐. 운영은 `PostgresSaver`, `SqliteSaver`

#### 스트리밍

```python
for chunk in graph.stream({"messages": [...]}, stream_mode="updates"):
    print(chunk)
```

|`stream_mode`|내용|
|---|---|
|`values`|각 단계 후 ==전체 상태==|
|`updates`|각 단계에서 ==바뀐 부분만== (노드 이름별)|
|`messages`|LLM 토큰 단위 `(token, metadata)`|
|`custom`|노드에서 `get_stream_writer`로 보낸 값|
|`debug`|디버깅용 전체 정보|

여러 모드는 리스트로 (`stream_mode=["updates", "custom"]`)

#### 입출력 스키마 분리

내부 상태와 외부에 보이는 입출력을 따로 둘 수 있음

```python
builder = StateGraph(OverallState, input_schema=InputState, output_schema=OutputState)
```

#### 재귀 제한

한 번 실행에서 거칠 수 있는 최대 단계 수. 넘으면 `GraphRecursionError` (기본값 1000). 무한 루프 방지용

```python
graph.invoke(inputs, config={"recursion_limit": 25})
```

#### 그래프 시각화

```python
from IPython.display import Image, display
display(Image(graph.get_graph(xray=True).draw_mermaid_png()))
```

### 정리

|개념|한 줄 요약|
|---|---|
|State|그래프 전체가 공유하는 데이터|
|Reducer|노드 반환값을 상태에 합치는 규칙 (`add_messages`는 이어 붙임)|
|Node|상태를 받아 바뀐 값을 dict로 반환하는 함수 또는 에이전트|
|Edge|노드 연결 (`add_edge`, `add_conditional_edges`)|
|`START` / `END`|입구 / 출구|
|`compile()`|설계도를 실행 가능한 그래프로|
|`invoke`|실행해서 최종 상태 반환|
|`result["messages"][-1]`|마지막 노드가 남긴 최종 메시지|

### 참고

- 노드 반환값은 상태 전체가 아니라 ==바꿀 키만==. 키별 리듀서가 합침
- `invoke`의 입력 `{"messages": "문자열"}`은 `add_messages`가 `HumanMessage`로 변환
- [Overview](https://docs.langchain.com/oss/python/langgraph/overview)
- [Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api)
- [Quickstart](https://docs.langchain.com/oss/python/langgraph/quickstart)
- [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
- [Streaming](https://docs.langchain.com/oss/python/langgraph/streaming)
- [Subgraphs](https://docs.langchain.com/oss/python/langgraph/use-subgraphs)
