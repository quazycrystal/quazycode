---
algorithm: [DFS, 백트래킹]
data_structure: [그래프]
technique: [가지치기]
---

### 걸린 시간: - (실패 횟수: -)

### 실패 / 성공 이유
- [DFS] 길이 5인 경로만 찾으면 됨. 여러 경로를 다 가봐야 해서 방문을 되돌려야 함
- [인접 리스트] 양방향

### 코드 개선 방법
- [가지치기] 답을 찾으면 바로 return

### 코드
```python
def dfs(s, cnt):
    global ans
    # 가지치기
    if ans == 1:
        return

    if cnt == 5: # 여기서 return 되면 ans = 1
        ans = 1
        return

    v[s] = 1
    for nxt in adj[s]:
        if v[nxt] == 0:
            dfs(nxt, cnt+1)

    v[s] = 0

# 입력
nodes, edges = map(int, input().split())
adj = [[] for _ in range(nodes)]
ans = 0

for _ in range(edges):
    parents, child = map(int, input().split())
    adj[parents].append(child) # 양방향 친구 추가, a와 b가 친구
    adj[child].append(parents)

for i in range(nodes):
    v = [0] * nodes
    dfs(i, 1) # 시작도 사람 하나로 친다

print(ans)

```
