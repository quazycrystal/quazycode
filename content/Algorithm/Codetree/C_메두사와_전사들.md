---
algorithm: [BFS, 시뮬레이션]
data_structure: [2차원 배열, 덱, set]
technique: [룩업 테이블]
---

### 걸린 시간: 구상 38분, 구현 3시간 8분 (총 3시간 45분), 다음날 디버깅 10분 (실패 횟수: -)

### 실패 / 성공 이유
- [문제 읽기] 전사 첫 이동은 상하좌우, 둘째는 좌우상하 우선
- [시야] 사람이 뒤를 가리려면 메두사 시선이 닿아야 함
- [방향] 사람 그림자 bfs는 메두사 방향 + 대각선 하나. 상대 위치마다 달라 헷갈림
- [표시] 돌 된 전사 자리에 다른 전사가 들어오면 구분 불가

### 코드 개선 방법
- [시야] 메두사 시선에 닿은 사람만 큐에 넣고 그 사람들 그림자만 계산
- [자료구조] 산 사람은 set에 인덱스. for idx in alive
- [동시 갱신] 이동은 새 arr에 기록. 돌 상태는 arr를 따로
- [습관] 안 하던 방식은 시험 중에 시도하지 않기

### 코드

```python

from collections import deque

# 함수
direction = {0: (-1, 0), 1: (1, 0), 2: (0, -1), 3: (0, 1)}
side = {0: [(-1, 0), (-1, -1), (-1, 1)], 1: [(1, 0), (1, -1), (1, 1)],
        2: [(0, -1), (-1, -1), (1, -1)], 3: [(0, 1), (-1, 1), (1, 1)]}

h_direction = {0: [(-1, 0)], 1: [(1, 0)], 2: [(0, -1)], 3: [(0, 1)],
               4: [(-1, -1)],
               5: [(-1, 1)],
               6: [(1, -1)],
               7: [(1, 1)]}

# 상하좌우!
def is_range(r, c):
    return 0 <= r < size and 0 <= c < size


# 1. 메두사 이동 경로 알려주기
def med_move(sr, sc):
    v = [[-1] * size for _ in range(size)]
    v[sr][sc] = 1
    q = deque()
    q.append((sr, sc, []))
    trail = []
    while q:
        r, c, old_lst = q.popleft()
        if (r, c) == (er, ec):
            trail = old_lst
            break
        for d in range(4):
            dr, dc = direction[d]
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == -1:
                if road[nr][nc] == 0:
                    new_lst = old_lst[:]
                    new_lst.append((nr, nc))
                    q.append((nr, nc, new_lst))
                    v[nr][nc] = v[r][c] + 1

    if v[er][ec] == -1:
        return -1
    else:
        return deque(trail)


# 2. 메두사의 시야각 보여준다
def med_sight(sr, sc, md):
    v = [[0] * size for _ in range(size)]
    v[sr][sc] = 0
    q = deque()
    q.append((sr, sc))
    while q:
        r, c, = q.popleft()
        for dr, dc in side[md]:
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == 0:
                q.append((nr, nc))
                v[nr][nc] = 1

    return v


# 3. 사람이 어떻게 시야각 가리는지
def h_sight(hr, hc, md):
    v = [[0] * size for _ in range(size)]
    v[hr][hc] = 1
    q = deque()
    q.append((hr, hc))
    # 방향 정하기
    h_dirr = []
    r_diff = (sr - hr)
    c_diff = (sc - hc)

    lst = []
    if r_diff > 0:
        # 메두사가 아래에
        h_dirr.append(0)  # 위로
    elif r_diff < 0:
        # 메두사가 위에
        h_dirr.append(1)  # 아래로

    if c_diff > 0:
        # 메두사가 오른쪽에
        h_dirr.append(2)  # 왼쪽으로
    elif c_diff < 0:
        # 메두사가 왼쪽에
        h_dirr.append(3)  # 오른쪽으로

    if len(h_dirr) == 1:
        lst = h_direction[h_dirr[0]]
    else:
        nowd = direction[md]
        if h_dirr == [0, 2]:
            lst.append(nowd)
            lst.extend(h_direction[4])

        elif h_dirr == [0, 3]:
            lst.append(nowd)
            lst.extend(h_direction[5])

        elif h_dirr == [1, 2]:
            lst.append(nowd)
            lst.extend(h_direction[6])

        elif h_dirr == [1, 3]:
            lst.append(nowd)
            lst.extend(h_direction[7])

    while q:
        r, c, = q.popleft()
        for dr, dc in lst:
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == 0:
                q.append((nr, nc))
                v[nr][nc] = 1
                if med_view[nr][nc] == 1:
                    med_view[nr][nc] = 0

# 4. 메두사 lookup
def med_look(sr, sc):
    v = [[-1] * size for _ in range(size)]
    v[sr][sc] = 0
    q = deque()
    q.append((sr, sc))
    while q:
        r, c, = q.popleft()
        for d in range(4):
            dr, dc = direction[d]
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == -1:
                q.append((nr, nc))
                v[nr][nc] = v[r][c] + 1

    return v

def h_move1(hr, hc, idx):
    dead = 0
    move = 1
    pr, pc = -100, -100
    dist = lookup[hr][hc]
    for d in range(4):
        dr, dc = direction[d]
        nr, nc = hr + dr, hc + dc
        if is_range(nr, nc) and lookup[nr][nc] < dist:
            if pick_view[nr][nc] == 0:
                pr, pc = nr, nc
                break

    if (pr, pc) == (sr, sc):
        dead = 1
        h_state[idx] = 2

    if (pr, pc) == (-100, -100):
        pr, pc = hr, hc
        move = 0

    return dead, (pr, pc), move

def h_move2(hr, hc, idx):
    dead = 0
    move = 1
    pr, pc = -100, -100
    dist = lookup[hr][hc]
    for d in [2, 3, 0, 1]: # 좌 우 상 하
        dr, dc = direction[d]
        nr, nc = hr + dr, hc + dc
        if is_range(nr, nc) and lookup[nr][nc] < dist:
            if pick_view[nr][nc] == 0:
                pr, pc = nr, nc
                break

    if (pr, pc) == (sr, sc):
        dead = 1
        h_state[idx] = 2

    if (pr, pc) == (-100, -100):
        pr, pc = hr, hc
        move = 0

    return dead, (pr, pc), move
# 입력
size, h_num = map(int, input().split())
sr, sc, er, ec = map(int, input().split())
temp = list(map(int, input().split()))

# 전사 상태
h_loc = {}
h_state = {}
i = 1
for h in range(0, len(temp), 2):
    h_loc[i] = (temp[h], temp[h + 1])
    h_state[i] = 0
    i += 1

# 길 상태 - 도로가 0
road = [list(map(int, input().split())) for _ in range(size)]

trail = med_move(sr, sc)

if trail == -1:
    print(trail)
else:
    time = 0
    while trail:
    # while time < 1:
        points = [0, 0, 0]
        time += 1
        sr, sc = trail.popleft()
        if (sr, sc) == (er, ec):
            print(0)
            break

        # 이동 했을 때 전사가 있으면 죽인다
        for hi in range(1, 1+ h_num):
            hhr, hhc = h_loc[hi]
            if (sr, sc) == (hhr, hhc):
                if h_state[hi] == 0:
                    h_state[hi] = 2

        pick_view = []
        mx_dol = -1
        for md in range(4):
            med_view = med_sight(sr, sc, md)
            dol = 0

            for idx in range(1, 1 + h_num):
                if h_state[idx] == 0:
                    hr, hc = h_loc[idx]
                    if med_view[hr][hc] == 1:
                        h_sight(hr, hc, md)

            for i in range(1, 1 + h_num):
                if h_state[i] == 0:
                    dolr, dolc = h_loc[i]
                    if med_view[dolr][dolc] == 1:
                        dol += 1

            if dol > mx_dol:
                mx_dol = dol
                pick_view = med_view

        # == 최대 돌 골라짐 ==
        for i in range(1, 1 + h_num):
            if h_state[i] == 0:
                hsr, hsc = h_loc[i]
                if pick_view[hsr][hsc] == 1:
                    h_state[i] = 1

        # 사람들 스턴 처리
        points[1] = mx_dol # 돌 전사
        lookup = med_look(sr, sc)

        for index in range(1, 1 + h_num):
            if h_state[index] == 0:
                mr, mc = h_loc[index]
                dead, nxt, move = h_move1(mr, mc, index)

                points[0] += move
                h_loc[index] = nxt

                if dead == 1:
                    points[2] += 1

                else:
                    if nxt != (mr, mc):
                        dead1, nxt1, move1 = h_move2(nxt[0], nxt[1], index)
                        points[0] += move1
                        h_loc[index] = nxt1

                        if dead1 == 1:
                            points[2] += 1

        # 돌 해제
        for ii in range(1, 1 + h_num):
            if h_state[ii] == 1:
                h_state[ii] = 0

        print(*points)
```
