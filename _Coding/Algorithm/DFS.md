### DFS?
[[Algorithm/알고리즘] DFS - 깊이 우선 탐색 알고리즘 이해하기](https://mayquartet.tistory.com/62)
깊이 우선 탐색 (Depth First Search)
[[Tree]]와 같은 비선형 자료구조에서 탐색하는 방법
==모든 자료를 빠짐없이== 검색하는 것이 중요함. 

### 로직
일단 한 방향 정해서 가장 깊은 곳 까지 감
그리고 갈 곳 없으면, 가장 마지막에 마주친 정점으로 돌아옴 (그래서 노드를 Stack에 저장)
그리고 방문한 적 없는 가장 마지막 정점으로 온다.

### ==양방향 노드 주의!!!!!!!!!!!!! 받을 때 양쪽으로 받아야 함!!!!!!!!!!==
빡구현이랑 재귀랑 다름
재귀는 자동으로 nxt가 s에 들어가므로 다 s로 써도 되지만, 빡구현은 s를 cur이나 다른 변수에 받아다가 써야 함
빡구현 for-else 쓰기, 결국 루프에 들어가면 내 위치 바꾸기, 방문 표시, 스택에 내 현 위치 넣기
만약 들렀던 곳이면 pop하면서 현 위치 바꾸기

### DFS와 [[DP]]간 관계
- **DFS**는 목표
노드의 깊이 방향으로 파고 들어가서 노드나 경로를 탐색하겠다는 목표
-> 그 목표를 이루기 위한 방법으로 재귀 함수를 사용할 수 있음

- **DP**는 방법
복잡한 문제를 최적화 하는 방법
-> 계속 재귀 함수를 부르는 것은 비효율적이니, Memoization이나 반복문을 통해 최적화
-> DFS로 경로를 탐색하되, 한 번 가본 길은 DP로 기록해두어 두 번 다시 계산하지 않는다!

| **비교 항목**  | **재귀 (recursive, 실제 위치 변동)** <br>[[Regression]]<br>Top-Down                                         | **반복문 (iterative, 장부 정리)**<br>[[DP]]<br>Bottom-Up                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **멈추는 지점** | 함수가 끝날 때 (리턴)                                                                                       | 장부(Stack)가 텅 빌 때                                                                                                               |
| **기억 장소**  | 컴퓨터 내부 메모리 (Call Stack)                                                                             | 내가 만든 리스트 (Stack)                                                                                                              |
| **장점**     | 코드가 간결하고 수학적 증명이 쉬움                                                                                 | 메모리 사용량을 직접 제어 가능, 속도가 미세하게 빠름                                                                                                 |
| **위험성**    | 너무 깊이 들어가면 에러 발생 (`RecursionError`)                                                                 | 장부 관리를 잘못하면 무한 루프에 빠질 수 있음, <br>미리 최종 데이터 크기를 알아야 함 (그만큼 반복을 할 테니까)                                                            |
| **사용 변수**  | 현재 노드 위치 변수 (now),<br>다음 노드 위치 변수 (next),<br>할 일을 넣어둔 장부 Stack (stack),<br>방문 노드 표시 Stack (visited) | 한 노드에서 갈 수 있는 노드를 모두 담은 이중 List (node_list),<br>현재 노드 위치 변수 (now), <br>할 일을 넣어둔 장부 Stack (stack), <br>방문 노드 표시 Stack (visited) |

### 예시 
(feat. 4871 그래프 경로)
##### Top-Down (재귀)

##### Bottom-Up (반복문)
장부 정리 방식으로, 다음에 방문할 노드 리스트를 할 일 장부 Stack에 넣음
`.extend()` 메소드를 이용해 이중 리스트가 생기지 않게 관리

```python

T = int(input())

for test_case in range(1, T + 1):

    v, e = map(int, input().split()) # v: 노드 갯수 e: 간선 갯수
    # node_list = [[]] * v 이것도 shallow copy
    node_list = [[] for _ in range (v+1)] 
    # 노드 하나에서 여러 노드로 갈 수도 있으므로 
	# 노드 갯수+1만큼 리스트 만듦 (index 관리의 용이성을 위해 index 0은 비워두기로 하고 노드 수를 그대로 index로 이용)
    for _ in range (e):
        a, b = map(int, input().split()) 
        node_list[a].append(b) 
    s, g = map(int, input().split()) # s: 출발, g: 도착
    stack = [s] # 사용자님의 'check'와 같은 역할
    visited = [False] * (v + 1)
    #visited[s] = True
    answer = 0

    while stack:
        now = stack.pop()
        #print(now)
        if now == g:
            visited[now] = True
            answer = 1
            break
        else:
            if not visited[now]:
                visited[now] = True # 위에다가 넣으면 if not visited의 경우가 사라짐
                stack.extend(node_list[now])
                #print (node_list[now])
```

![[20260127091945.png]]

![[20260127093257.png]]

![[20260127094301.png]]

### Backtraking
