---
algorithm: [BFS, 시뮬레이션]
data_structure: [2차원 배열, 덱, dict]
technique: []
---

### 걸린 시간: 2트: 구상 13분, 구현 1시간 5분, 디버깅 2시간 (실패 횟수: -)

### 실패 / 성공 이유
- [방향] 공이 날아오는 방향(축 2개)을 잘못 봄. 당했던 곳이라 의식하고 있다는 이유로 가장 늦게 의심
- [문제 읽기] 3, 4번째 구간은 역으로 읽어 들어감을 놓침
- [방향 전환] 뒤집히면 꼬리가 머리가 됨
- [엣지 케이스] 도로가 꽉 차면 머리와 꼬리가 맞닿아 bfs로 몸통을 찾으면 꼬리가 중간에 섞임

### 코드 개선 방법
- [디버깅] 의심 가는 값(공 방향)을 가장 먼저 찍기
- [BFS] 머리에서 방향을 정하고 몸통 → 꼬리 순으로 탐색
- [방향 전환] 맞은 팀은 리스트 reverse
- [습관] 조급함 대신 루틴. 틀려도 찾을 수 있다는 확신

### 코드
```python
from collections import deque


# 함수

def is_range(r, c):
    return 0 <= r < size and 0 <= c < size


# 1. 경로 따는 함수
def track(sr, sc, v, idx):
    v[sr][sc] = 1
    q = deque()
    q.append((sr, sc))
    snake = deque([(sr, sc)])
    length = 1
    while q:
        r, c = q.popleft()
        t_val = 5
        t_r, t_c = -100, -100
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == 0:
                if arr[nr][nc] > 0:
                    if t_val > arr[nr][nc]:
                        t_val = arr[nr][nc]
                        t_r, t_c = nr, nc

        # 갱신 된 경우에만!
        if (t_r, t_c) != (-100, -100):
            v[t_r][t_c] = 1
            if 1 <= t_val < 4:
                length += 1
            q.append((t_r, t_c))
            snake.append((t_r, t_c))

    # 경로 넣기
    snakes[idx] = snake
    # 뱀 정보 채우기 - 초기 방향 무조건 1
    s_info[idx] = [1, length]


# 2. 뱀 이동이어라
def move(idx):
    d, length = s_info[idx]
    snakes[idx].rotate(d)
    snake = list(snakes[idx])

    for i in range(length):
        r, c = snake[i]
        arr[r][c] = i + 1
        idx_arr[r][c] = idx


# 3. 공 맞아요
def ball(now_time):
    rd, turn = divmod((now_time - 1), size)
    rd = rd % 4

    score = 0
    idx = 0

    if rd == 0:
        for c in range(size):
            if arr[turn][c] > 0:
                score = pow(arr[turn][c], 2)
                idx = idx_arr[turn][c]
                break

    elif rd == 1:
        for r in range(size - 1, -1, -1):
            if arr[r][turn] > 0:
                score = pow(arr[r][turn], 2)
                idx = idx_arr[r][turn]
                break

    elif rd == 2:
        for c in range(size - 1, -1, -1):
            if arr[size - turn - 1][c] > 0:
                score = pow(arr[size - turn - 1][c], 2)
                idx = idx_arr[size - turn - 1][c]
                break

    elif rd == 3:
        for r in range(size):
            if arr[r][size - turn - 1] > 0:
                score = pow(arr[r][size - turn - 1], 2)
                idx = idx_arr[r][size - turn - 1]
                break

    return score, idx


# 4. 방향 / 좌표 바꿔줘용
def change(idx):
    d, length = s_info[idx]

    snake = list(snakes[idx])
    snake.reverse()
    snake = deque(snake)

    # 꼬리였던 애를 맨 앞으로
    snake.rotate(length)
    snakes[idx] = snake

    for i in range(length):
        r, c = snake[i]
        arr[r][c] = i + 1
        idx_arr[r][c] = idx


# 입력
size, g_num, time = map(int, input().split())
arr = [list(map(int, input().split())) for _ in range(size)]

v = [[0] * size for _ in range(size)]

# 뱀 방향, 길, 경로 전체 저장
snakes = {}
s_info = {}

idx = 1
for i in range(size):
    for j in range(size):
        if arr[i][j] == 1 and v[i][j] == 0:
            track(i, j, v, idx)
            idx += 1

# 풀이
ans = 0
for now_time in range(1, 1 + time):
    arr = [[0] * size for _ in range(size)]
    idx_arr = [[0] * size for _ in range(size)]

    # 1. 뱀 이동
    for ii in range(1, 1 + g_num):
        move(ii)

    # 2. 공 맞 처리
    score, hit_idx = ball(now_time)
    ans += score

    # 3. 방향 전환
    if hit_idx > 0:
        change(hit_idx)

print(ans)

from collections import deque

# 함수
def is_range(r, c):
    return 0 <= r < size and 0 <= c < size

# 그루핑 bfs
def group(sr, sc, idx):
    road[sr][sc] = idx
    q = deque()
    q.append((sr, sc))
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc):
                if arr[nr][nc] > 0 and road[nr][nc] == 0:
                    road[nr][nc] = idx
                    q.append((nr, nc))

def find_snake(headr, headc, idx):
    v = [[0] * size for _ in range(size)]
    v[headr][headc] = idx
    q = deque()
    q.append((headr, headc))
    temp = ()
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc):
                if 4 > arr[nr][nc] > 0 and v[nr][nc] == 0:
                    v[nr][nc] = idx

                    if arr[nr][nc] == 2:
                        snakes[idx].append((nr, nc)) # q 순서만 빨라지고
                        q.append((nr, nc))

                    if arr[nr][nc] == 3:
                        temp = (nr, nc)

    snakes[idx].append(temp)

    # visual 보드 갱신 - 첫 위치 그리기
    for s_name, tpl in enumerate(snakes[idx]):
        #print(s_name, idx)
        vr, vc = tpl
        visual[vr][vc] = s_name + 1

# 이건 visual에서 읽어오는 계속 쓰는 함수
def find_snake2(headr, headc, idx, length):

    #print("length", length)
    v = [[0] * size for _ in range(size)]
    v[headr][headc] = idx
    q = deque()
    q.append((headr, headc))
    temp = ()
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc):
                if visual[nr][nc] > 0 and v[nr][nc] == 0:
                    v[nr][nc] = idx
                    if visual[nr][nc] == 1: # 머리(꼬리) 읽으면 안 됨
                        temp = (nr, nc)

                    else:
                        snakes[idx].append((nr, nc))  # q 순서만 빨라지고
                        q.append((nr, nc))
    if temp:
        snakes[idx].append(temp)

    for vr, vc in snakes[idx]:
        visual[vr][vc] = 0

    # visual 보드 갱신 - 첫 위치 그리기
    for i, tpl in enumerate(snakes[idx]):
        vr, vc = tpl
        visual[vr][vc] = i + 1


# 이동 로직
def move(idx):
    r, c = snakes[idx][0]  # 머리 위치
    # 걍 매번 찾고... 매번 하자 걍

    # 다음 방향 찾아서 갱신
    for nxtd in (1, 2, 3, 4):
        ndr, ndc = direction[nxtd]
        nxtr, nxtc = r + ndr, c + ndc # 그 다음 방향 갱신
        if is_range(nxtr, nxtc) and road[nxtr][nxtc] == idx:
            #print("nxtr, nxtc", nxtr, nxtc)
            if visual[nxtr][nxtc] == 0 or visual[nxtr][nxtc] == len(snakes[idx]):
                now_dirr[idx] = nxtd

    dr, dc = direction[now_dirr[idx]]

    nr, nc = r + dr, c + dc
    # visual 보드 갱신 - 원래 위치 지우고
    for vr, vc in snakes[idx]:
        visual[vr][vc] = 0

    # 머리 늘리고 꼬리 자르고
    if is_range(nr, nc):
        snakes[idx].insert(0, (nr, nc)) # 요기는 한 칸만 가야지
        snakes[idx].pop()
    else:
        print("red flag")

    # visual 보드 갱신 - 다음 위치 그리기
    for i, tpl in enumerate(snakes[idx]):
        vr, vc = tpl
        visual[vr][vc] = i+1


def ball_hit(t, num):
    # 여기 들어오는 건 타입(열 행 어느 방향?) 탐색할 열 또는 행
    score = 0
    hit = ()
    if t == 0:
        for col in range(size):
            if visual[num][col] > 0:
                score = visual[num][col] ** 2
                hit = (num, col)
                break

    if t == 1:
        for r_row in range(size-1, -1, -1):
            if visual[r_row][num] > 0:
                score = visual[r_row][num] ** 2
                hit = (r_row, num)
                break

    if t == 2:
        for r_col in range(size-1, -1, -1):
            if visual[num][r_col] > 0:
                score = visual[num][r_col] ** 2
                hit = (num, r_col)
                break

    if t == 3:
        for row in range(size):
            if visual[row][num] > 0:
                score = visual[row][num] ** 2
                hit = (row, num)
                break

    # 맞은 그룹 친구들 방향 바꿔줘야 함;;
    if hit:
        hr, hc = hit
        hit_group = road[hr][hc]

        # 딕셔너리 뒤집기
        length = len(snakes[idx])
        # snakes[hit_group].reverse()
        newheadr, newheadc = snakes[hit_group][-1]
        snakes[hit_group] = [snakes[hit_group][-1]]
        #print(newheadr, newheadc)

        # 방향 바꿔주기
        find_snake2(newheadr, newheadc, hit_group, length)

    return score

# 입력
size, team_num, time = map(int, input().split())
arr = [list(map(int, input().split())) for _ in range(size)]

road = [[0] * size for _ in range(size)]
group_idx = 1
for i in range(size):
    for j in range(size):
        if arr[i][j] > 0 and road[i][j] == 0:
            group(i, j, group_idx)
            group_idx += 1

# === road 그루핑 완료, 그거 기반 팀 나누기 ===
direction = {1: (-1, 0), 2: (1, 0), 3: (0, -1), 4: (0, 1)} # 상하 좌우로,,,
reverse = {1:2, 2:1, 3:4, 4:3}

snakes = {}
now_dirr = {}
# 공 판정 위한 시각화 보드
visual = [[0] * size for _ in range(size)]

# key 생성
for idx in range(1, group_idx):
    snakes[idx] = []
    now_dirr[idx] = 0

# 머리와, 방향만 찾아요
for r in range(size):
    for c in range(size):
        if arr[r][c] == 1 and road[r][c] > 0:
            g_idx = road[r][c]
            snakes[g_idx].append((r, c)) # 좌표는 일단 올려

            # 방향 탐색 안 해도 함수에서 해 줌

            # 몸통 찾기
            find_snake(r, c, g_idx)

ans = 0

for now_time in range(time):
    # 이동
    for idx in range(1, group_idx):
        move(idx)

    t, num = divmod(now_time, size)
    t = t % 4

    if t == 2 or t == 3:
        num = size-1-num

    score = ball_hit(t, num)
    ans += score

print(ans)

```
