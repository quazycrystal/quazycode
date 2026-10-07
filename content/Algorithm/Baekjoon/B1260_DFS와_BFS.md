---
algorithm: [DFS, BFS, 재귀]
data_structure: [그래프, 덱]
technique: []
---

### 걸린 시간: - (실패 횟수: -)

### 실패 / 성공 이유
- [방문 처리] dfs와 bfs가 v를 공유하면 안 됨
- [인접 리스트] 양방향, 작은 노드부터 방문하려면 sort

### 코드 개선 방법
- [템플릿] bfs 초기화(방문 표시, 큐 만들기, 큐에 넣기) 후 pop한 현재 위치에서 방문 표시 + 조건 + 큐 추가

### 코드
```python
def dfs(s): # 재귀의 경우 모듈에는 방문 체크만
    global d_ans
    v1[s] = 1
    d_ans.append(s) # 여기는 s가 계속 초기화되니 ok
    # 초기화
    for nxt in adj[s]:
        if v1[nxt] == 0:
            dfs(nxt) # 어차피 방문은 재귀해서 해 줌

def bfs(s): # 모듈 2개, q에 넣기, 방문 표시
    global b_ans
    v2[s] = 1 # 방문 처리
    q = []
    q.append(s)
    while q:
        cur = q.pop(0)
        b_ans.append(cur) # s 아님!!
        for nxt in adj[cur]: # s 아님!!
            if v2[nxt] == 0:
                q.append(nxt)
                v2[nxt] = 1
                # 방문 표시, 조건, 큐에 추가, 범위


# 입력
node, edge, srt = map(int,input().split())

# 모듈 2개 - 인접(배열)과 방문록
adj = [[] for _ in range(node + 1)] # 내용 없을 땐 곱하기로 안 됨

v1 = [0] * (node + 1)
v2 = [0] * (node + 1)

# 인접 리스트 채우기
for _ in range(edge):
    t = list(map(int, input().split()))
    # print(t)
    adj[t[0]].append(t[1])
    adj[t[1]].append(t[0]) # 양 방향

for i in range(node + 1):
    adj[i].sort() # 작은 노드부터 방문

# 출력 각각 dfs, bfs
d_ans = []
b_ans = []

dfs(srt)
bfs(srt)

print(*d_ans)
print(*b_ans)







```
