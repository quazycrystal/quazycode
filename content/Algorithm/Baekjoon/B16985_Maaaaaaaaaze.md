---
algorithm: [BFS, 순열, 완전탐색]
data_structure: [3차원 배열, 덱]
technique: [룩업 테이블, 가지치기]
---

### 걸린 시간: 1시간 9분 (구상 13분, 구현 56분), 3300ms → 리팩토링 512ms (실패 횟수: -)

### 실패 / 성공 이유
- [속도] bfs 안에서 for를 두 번 더 돌려 3300ms

### 코드 개선 방법
- [룩업 테이블] 판마다 회전 4방향을 미리 만들어두기
- [가지치기] 입구나 출구가 막혀 있으면 break. 최단 거리 12가 나오면 바로 종료
- [중복 제거] 모든 판을 다 돌리면 입구·출구는 한 위치만 봐도 됨
- [복사] 읽기만 하니 2차원 판을 그대로 넣어 3차원 구성

### 코드
```python
# B16985 Maaaaaaaaaaaze

# 리팩토링: 15분 (총 1시간 24분)

from itertools import *
from collections import deque

# 함수
def is_range(r, c, h):
    return 0 <= r < 5 and 0 <= c < 5 and  0 <= h < 5

# 1. 판 뽑자
def pick_pan(pan_num, pan_dgr, i):
    ppan = []
    if pan_dgr == 0:
        ppan = pan0[pan_num] # 값 바꾸면 원본도 바뀐다,,,
        # 어차피 읽기만 할 거라 상관은 없음
    if pan_dgr == 1:
        ppan = pan90[pan_num]
    if pan_dgr == 2:
        ppan = pan180[pan_num]
    if pan_dgr == 3:
        ppan = pan270[pan_num]

    if i == 0 and ppan[0][0] == 0: # 입구부터 입장 불가!
        return False
    elif i == 4 and ppan[4][4] == 0: # 출구도 나올 수가 없어
        return False
    else:
        maze.append(ppan)
        return True

# 2. 3차원 bfs
def bfs3(start):
    sr, sc, sh = start
    v = [[[-1 for _ in range(5)] for _ in range(5)] for _ in range(5)]
    v[sr][sc][sh] = 0
    q = deque()
    q.append((sr, sc, sh))
    while q:
        r, c, h = q.popleft()
        if (r, c, h) == finish:
            break

        for dr, dc, dh in ((-1, 0, 0), (1, 0, 0),
                           (0, -1, 0), (0, 1, 0),
                           (0, 0, -1), (0, 0, 1)):
            nr, nc, nh = r + dr, c + dc, h + dh
            if is_range(nr, nc, nh) and v[nr][nc][nh] == -1:
                if maze[nr][nc][nh] == 1:
                    v[nr][nc][nh] = v[r][c][h] + 1
                    q.append((nr, nc, nh))

    return v[4][4][4]

# 입력
pan0 = {}
pan90 = {}
pan180 = {}
pan270 = {}
for idx in range(1, 6):
    arr = [list(map(int, input().split())) for _ in range(5)]

    pan0[idx] = arr
    pan90[idx] = [list(line[::-1]) for line in zip(*arr)]
    pan180[idx] = [line[::-1] for line in arr[::-1]]
    pan270[idx] = [list(line) for line in zip(*arr)][::-1]

start = (0, 0, 0)
finish = (4, 4, 4)

ans = 10**18
# 순서 섞는 경우의 수
for pans in permutations(range(1, 6)):
    # 회전하는 경우의 수
    for dgr in product(range(4), repeat = 5):
        maze = [] # 그냥 2차원 판 가져다 넣기
        ok = 1
        for i in range(5):
            pan_num = pans[i]
            pan_dgr = dgr[i]
            if not pick_pan(pan_num, pan_dgr, i):
                ok = 0
                break

        # 여기서 미로 생성 완료!
        if ok:
            dist = bfs3(start)
            if dist >= 0:
                ans = min(ans, dist)

        if ans == 12:
            break

    if ans == 12:
        break

if ans == 10**18:
    ans = -1

print(ans)

# 원본 코드 =====================

from itertools import *
from collections import deque

# 함수
def is_range(r, c, h):
    return 0 <= r < 5 and 0 <= c < 5 and  0 <= h < 5

# 1. 판 뽑자
def pick_pan(pan_num, pan_dgr, i):
    ppan = []
    if pan_dgr == 0:
        ppan = pan0[pan_num]
    if pan_dgr == 1:
        ppan = pan90[pan_num]
    if pan_dgr == 2:
        ppan = pan180[pan_num]
    if pan_dgr == 3:
        ppan = pan270[pan_num]

    for r in range(5):
        for c in range(5):
            maze[r][c].append(ppan[r][c])

    if i == 0 and ppan[0][0] == 0: # 입구부터 입장 불가!
        return False
    elif i == 4 and ppan[4][4] == 0: # 출구도 나올 수가 없어
        return False
    else:
        return True

# 2. 3차원 bfs
def bfs3(start):
    sr, sc, sh = start
    v = [[[-1 for _ in range(5)] for _ in range(5)] for _ in range(5)]
    v[sr][sc][sh] = 0
    q = deque()
    q.append((sr, sc, sh))
    while q:
        r, c, h = q.popleft()
        if (r, c, h) == finish:
            break

        for dr, dc, dh in ((-1, 0, 0), (1, 0, 0),
                           (0, -1, 0), (0, 1, 0),
                           (0, 0, -1), (0, 0, 1)):
            nr, nc, nh = r + dr, c + dc, h + dh
            if is_range(nr, nc, nh) and v[nr][nc][nh] == -1:
                if maze[nr][nc][nh] == 1:
                    v[nr][nc][nh] = v[r][c][h] + 1
                    q.append((nr, nc, nh))

    return v[4][4][4]

# 입력
pan0 = {}
pan90 = {}
pan180 = {}
pan270 = {}
for idx in range(1, 6):
    arr = [list(map(int, input().split())) for _ in range(5)]

    pan0[idx] = arr
    pan90[idx] = [list(line[::-1]) for line in zip(*arr)]
    pan180[idx] = [line[::-1] for line in arr[::-1]]
    pan270[idx] = [list(line) for line in zip(*arr)][::-1]

start = (0, 0, 0)
finish = (4, 4, 4)

ans = 10**18
# 순서 섞는 경우의 수
for pans in permutations(range(1, 6)):
    # 회전하는 경우의 수
    for dgr in product(range(4), repeat = 5):
        # 이렇게 다 해버리면 출구 입구 한 위치만 지정해도 되겠다
        maze = [[[] for _ in range(5)] for _ in range(5)]
        ok = 1
        for i in range(5):
            pan_num = pans[i]
            pan_dgr = dgr[i]
            if not pick_pan(pan_num, pan_dgr, i):
                ok = 0
                break

        # 여기서 미로 생성 완료!
        if ok:
            dist = bfs3(start)
            if dist >= 0:
                ans = min(ans, dist)

if ans == 10**18:
    ans = -1

print(ans)
```
