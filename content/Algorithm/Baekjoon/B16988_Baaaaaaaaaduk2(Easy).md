---
algorithm: [BFS, 조합]
data_structure: [2차원 배열, 덱]
technique: [가지치기]
---

### 걸린 시간: 1시간 1분 (구상 17분, 구현 27분, 디버깅 17분), 2908ms (실패 횟수: 1회 (93퍼 WA))

### 실패 / 성공 이유
- [가지치기] 주변에 상대 돌이 있는 칸만 후보로 걸렀는데, 주변에 상대 돌이 없어도 골라야 하는 경우가 있음

### 코드 개선 방법
- [전처리] 상대 돌 덩어리의 시작 지점과 넓이를 bfs로 미리 구하기
- [판정] 덩어리마다 빈 칸이 하나라도 닿으면 안 먹힘
- [검증] 과하게 거른 부분은 제출 전에 체크. 큰 테케 넣기

### 코드
```python
# B16988 Baaaaaaaaaaduk2(Easy)

from collections import deque
from itertools import *

# 함수
def is_range(r, c):
    return 0 <= r < row and 0 <= c < col

# 1. 미리 돌 놓기가 가능한 지점들 찾기
def find_spot():
    pos = []
    for r in range(row):
        for c in range(col):
            if arr[r][c] == 0:
                pos.append((r, c)) # 내 주변에 남의 돌이 하나라도 있어야 돌 놓기

    return pos

def bfs(sr, sc, v):
    v[sr][sc] = 1
    q = deque()
    q.append((sr, sc))
    size = 1
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == 0:
                if arr[sr][sc] == arr[nr][nc]:
                    v[nr][nc] = 1
                    q.append((nr, nc))
                    size += 1

    return size

# 2-2. 남 시작 지점, 넓이
def start():
    nam = {}
    v = [[0] * col for _ in range(row)]
    for i in range(row):
        for j in range(col):
            if arr[i][j] == 2 and v[i][j] == 0:
                size = bfs(i, j, v)
                nam[(i, j)] = size
    return nam

# 3. 먹혔는지 판별
def check(sr, sc):
    vc = [[0] * col for _ in range(row)]
    vc[sr][sc] = 1
    q = deque()
    q.append((sr, sc))
    alive = 0
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc):
                # 빈 공간 하나라도 있는지
                if arr[r][c] == 2 and arr[nr][nc] == 0:
                    alive = 1
                    break
                if vc[nr][nc] == 0:
                    if arr[sr][sc] == arr[nr][nc]:
                        vc[nr][nc] = 1
                        q.append((nr, nc))

    return alive


# 입력
row, col = map(int, input().split())
arr = [list(map(int, input().split())) for _ in range(row)]

pos = find_spot()

# 남 돌 시작지점, 넓이 찾기
nam = start()

# 조합 안에서 찾기
mx_ans = sum(nam.values())

ans = 0
for combi in combinations(pos, 2):
    # 가지치기
    if ans == mx_ans:
        break

    # 돌 놓기
    loc_ans = 0
    for cr, cc in combi:
        arr[cr][cc] = 1

    # 덩어리별로 판별
    for pr, pc in nam:
        alive = check(pr, pc)
        if not alive:
            loc_ans += nam[(pr, pc)]

    ans = max(loc_ans, ans)

    # 돌 해제
    for cr, cc in combi:
        arr[cr][cc] = 0

print(ans)
```
