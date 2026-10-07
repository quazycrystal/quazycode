---
algorithm: [BFS, 시뮬레이션]
data_structure: [2차원 배열, 덱, set]
technique: []
---

### 걸린 시간: - (실패 횟수: 4트째)

### 실패 / 성공 이유
- [문제 읽기] 갈 수 없게 되는 건 해당 턴 모든 사람이 움직인 뒤
- [문제 읽기] 베이스캠프로 가는 건 이동이 아님
- [정렬] 베이스캠프는 거리 → 행 → 열 순

### 코드 개선 방법
- [BFS] 편의점에서 역으로 bfs 거리를 구하고, 내 위치 4방 중 거리가 가장 작은 쪽으로 (상좌우하 우선)
- [동시 갱신] 막힐 칸은 temp나 set에 모았다가 턴 끝에 -1
- [시간 복잡도] 20*20 bfs * 30명 * 2

### 코드
정답 코드
```python
from collections import deque

# 함수

def is_range(r, c):
    return 0 <= r < size and 0 <= c < size


# 1. 베이스 캠프 고르기
def get_base(sr, sc):
    v = [[-1] * size for _ in range(size)]
    v[sr][sc] = 0
    q = deque()
    q.append((sr, sc))
    able = []
    while q:
        r, c = q.popleft()
        for dr, dc in ((1, 0), (0, 1), (0, -1), (-1, 0)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == -1:
                if base[nr][nc] != -1:
                    v[nr][nc] = v[r][c] + 1
                    q.append((nr, nc))
                    if base[nr][nc] == 1:
                        able.append((v[nr][nc], nr, nc))

    rr, rc = -100, -100
    # sort 주의 - 거리도 짧고 행렬도 작은 순!
    if able:
        able.sort()
        rr = able[0][1]
        rc = able[0][2]

    return v, (rr, rc)


def move(sr, sc, v, idx):
    mn_dist = 10 ** 18
    pr, pc = -100, -100
    for dr, dc in ((-1, 0), (0, -1), (0, 1), (1, 0)):
        # 우선순위
        nr, nc = sr + dr, sc + dc
        if is_range(nr, nc):
            # -1은 고려하지 말아야 함!
            if v[nr][nc] != -1:
                if v[nr][nc] < mn_dist:
                    mn_dist = v[nr][nc]
                    pr, pc = nr, nc

    p_loc[idx] = (pr, pc)

    return pr, pc

    # 다시 편의점에서 역산


# 입력
size, p_num = map(int, input().split())
base = [list(map(int, input().split())) for _ in range(size)]
convi = [0]
bases = [0]
p_loc = {}
alive = set()  # 동시에 움직이므로 set도 가능

for i in range(1, 1 + p_num):
    cr, cc = map(int, input().split())
    cr, cc = cr - 1, cc - 1
    convi.append((cr, cc))
    alive.add(i)

# 풀이
time = 0

temp = []
while True:
    if not alive:
        break

    time += 1

    # 이동
    for idx in p_loc:
        if idx in alive:
            sr, sc = convi[idx]
            visited, _ = get_base(sr, sc)

            # 사람 위치도
            pplr, pplc = p_loc[idx]
            nr, nc = move(pplr, pplc, visited, idx)

            # 도착 처리
            if (nr, nc) == (sr, sc):
                alive.remove(idx)
                temp.append((sr, sc))

    for r, c in temp:
        base[r][c] = -1
        temp = []

    if time <= p_num:
        cr, cc = convi[time]
        _, pick_base = get_base(cr, cc)

        ppl_sr, ppl_sc = pick_base
        bases.append(pick_base)

        temp.append((ppl_sr, ppl_sc))
        p_loc[time] = (ppl_sr, ppl_sc)

    # 동시에 방문 불가 처리
    for r, c in temp:
        base[r][c] = -1

print(time)
```

매 타임별 bfs 안 돌려서 틀린 코드
```python
from collections import deque

# 함수:
def is_range(r, c):
    return 0 <= r < size and 0 <= c < size

def bfs(sr, sc):
    v = [[-1] * size for _ in range(size)]
    v[sr][sc] = 0
    q = deque()
    q.append((sr, sc))
    sel_convi = []
    best_d = 100000
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (0, -1), (0, 1), (1, 0)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == -1:
                if stat[nr][nc] != -1:
                    v[nr][nc] = v[r][c] + 1
                    q.append((nr, nc)) # 갈 수 없는 곳

                    # 베이스 캠프 고르기 (변수명 ;;)
                    if stat[nr][nc] == 1:
                        if v[nr][nc] <= best_d:
                            if v[nr][nc] < best_d:
                                best_d = v[nr][nc]
                                sel_convi = []
                            sel_convi.append((nr, nc))

    sel_convi.sort()

    print(sel_convi)
    for rr in v:
        print(rr)
    sel = sel_convi[0]
    return v, sel


def move(r, c, idx):
    able = []
    now_dist = 100000
    for dr, dc in ((-1, 0), (0, -1), (0, 1), (1, 0)):
        nr, nc = r + dr, c + dc
        if is_range(nr, nc) and stat[nr][nc] != -1:
            if visited[idx][nr][nc] != -1:
                if visited[idx][nr][nc] <= now_dist:
                    if visited[idx][nr][nc] < now_dist:
                        now_dist = visited[idx][nr][nc]
                        able = []
                    able.append((nr, nc))

    ppl_loc[idx] = able[0]  # 다음 위치 갱신
    visited[idx][able[0][0]][able[0][1]] = -1 # 내 방문 배열에 방문 표시(!)

    return able[0][0], able[0][1]


size, ppl_num = map(int, input().split())
stat = [list(map(int, input().split())) for _ in range(size)]
# 어디 갈 수 있고 뭐가 닫혔는지
convis = deque()
goal_convis = []
for _ in range(ppl_num):
    r, c = map(int, input().split())
    r, c = r - 1, c - 1
    convis.append((r, c))
    goal_convis.append((r, c))
    stat[r][c] = 2

# 각 사람 별 방문 배열
visited = {}  # 돌 때마다 추가
# 사람별 위치
ppl_loc = {}

time = 0
finish = 0

temp = []

while True:
    time += 1  # 1초부터 시작

    for idx in range(1, 1 + ppl_num):
        if idx in visited:
            if idx in ppl_loc:
                mr, mc = ppl_loc[idx]
                nxtr, nxtc = move(mr, mc, idx)
                if (nxtr, nxtc) == goal_convis[idx - 1]:
                    finish += 1
                    temp.append((nxtr, nxtc))
                    ppl_loc.pop(idx)

    for br, bc in temp:  # 이동 후 갈 수 없음 처리
        stat[br][bc] = -1

    temp = []

    # 베이스 캠프 들어감
    if convis:
        sr, sc = convis.popleft()
        v, sel_base = bfs(sr, sc)
        print(sel_base)
        visited[time] = v  # 사람별 방문배열 만들기
        # 사람 위치
        ppl_loc[time] = sel_base
        temp.append(sel_base)  # -1 표시할 것들

    if finish == ppl_num:
        break

print(time)
```