---
algorithm: [BFS]
data_structure: [2차원 배열, 3차원 배열, 덱]
technique: [룩업 테이블, 배열 회전, 상대 좌표]
---

### 걸린 시간: 6시간 내외 (실패 횟수: 시간 내 못 품 (2시간 더 들여서 해결))

### 실패 / 성공 이유
- [방문 처리] 단순 v 배열로는 면 사이 이동이 안 되고 탐색 순서에 따라 달라짐 (포털을 만들어야 함)
- [인덱스] 면 회전과 r, c 변환이 꼬임

### 코드 개선 방법
- [룩업 테이블] 바닥은 굳이 다 가보지 않아도 된다 - bfs 여러 번 돌렸는데 안 그래도 됨
  시간 이상 현상 확산 시간 테이블을 만들고, 도착 시간이 그보다 크면 못 감
- [좌표 변환] 면별로 회전(동 270, 서 90, 북 180)해 펼치고 좌표 변환 함수로 연결
- [디버깅] 숫자를 만들어 빨리 찍기

### 코드
```python

from collections import deque


def is_range(r, c, size):
    return 0 <= r < size and 0 <= c < size


# 단면도 받아서 넣기
def get_s_arr():
    sr, sc = -100, -100

    for t in range(5):
        part = [list(map(int, input().split())) for _ in range(s_size)]
        fir = s_size
        sec = (s_size * 2)

        if t == 0:
            # 동쪽, 270도 시계 회전
            part = [list(line) for line in zip(*part)][::-1]
            for r in range(fir):
                for c in range(fir):
                    s_arr[r + fir][c + sec] = part[r][c]

        elif t == 1:
            # 서쪽, 90도 시계 회전
            part = [list(line[::-1]) for line in zip(*part)]
            for r in range(fir):
                for c in range(fir):
                    s_arr[r + fir][c] = part[r][c]

        elif t == 2:
            # 남쪽, 회전 없음
            for r in range(fir):
                for c in range(fir):
                    s_arr[r + sec][c + fir] = part[r][c]

        elif t == 3:
            # 북쪽, 180도 회전
            part = [line[::-1] for line in part[::-1]]
            for r in range(fir):
                for c in range(fir):
                    s_arr[r][c + fir] = part[r][c]

        elif t == 4:
            # 윗면, 회전 없음
            for r in range(fir):
                for c in range(fir):
                    s_arr[r + fir][c + fir] = part[r][c]
                    if part[r][c] == 2:
                        sr, sc = r + fir, c + fir

    return sr, sc


def change_jwa(r, c):
    fir = s_size
    sec = (s_size * 2)
    thr = (s_size * 3)

    if 0 <= r <= fir and 0 <= c <= fir:
        nr, nc = c, r
    elif sec - 1 <= r <= thr - 1 and sec - 1 <= c <= thr - 1:
        nr, nc = c, r

    elif r == fir or r == sec - 1:
        if r == fir:
            nc = sec - 1
            nr = thr - 1 - c
        else:
            nc = fir
            nr = thr - 1 - c

    elif c == fir or c == sec - 1:
        if c == fir:
            nr = sec - 1
            nc = thr - 1 - r
        else:
            nr = fir
            nc = thr - 1 - r

    return nr, nc


# 1. 출발지인 시간의 벽에서 바닥으로 이어지는 출구 찾기
def find(sr, sc):
    v = [[-1] * (s_size * 3) for _ in range(s_size * 3)]
    v[sr][sc] = 0
    q = deque()
    q.append((sr, sc))
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc, (s_size * 3)):

                if s_arr[nr][nc] == -1:
                    # print("not change", r, c)
                    nr, nc = change_jwa(r, c)
                    # print("change", nr, nc)

                if v[nr][nc] == -1:
                    if s_arr[nr][nc] == 0:
                        v[nr][nc] = v[r][c] + 1
                        q.append((nr, nc))

    return v


# 벽 탈출구 찾기
direction = {0: (0, 1), 1: (0, -1), 2: (1, 0), 3: (-1, 0)}


def find_exit(sr, sc):
    v = [[0] * b_size for _ in range(b_size)]
    v[sr][sc] = 1
    q = deque()
    q.append((sr, sc))
    wr, wc = 100, 100

    while q:
        r, c = q.popleft()
        for d in range(4):
            dr, dc = direction[d]
            nr, nc = r + dr, c + dc
            if is_range(nr, nc, b_size):

                if b_arr[r][c] != 3 and b_arr[nr][nc] == 3:
                    if wr > nr and wc > nc:
                        wr, wc = nr, nc

                if b_arr[r][c] == 3:
                    if b_arr[nr][nc] == 0:
                        return (r - wr, c - wc), d, (nr, nc)

                if v[nr][nc] == 0:
                    v[nr][nc] = 1
                    q.append((nr, nc))

    return -1, -1, -1


# 벽 출구 기준으로 몇 칸이나 왔는지 본다
def count_dist(sang, dirr):
    # visited 배열에서 필요한 위치에 접근
    r, c = sang
    fir = s_size
    sec = (s_size * 2)
    thr = (s_size * 3)

    ans_dist = 0

    if dirr == 0:
        # 오른쪽
        ans_dist = visited[fir + r][thr - 1]

    elif dirr == 1:
        # 왼쪽
        ans_dist = visited[fir + r][0]

    elif dirr == 2:
        # 아래
        ans_dist = visited[thr - 1][fir + c] # r, c 미쳤넹

    elif dirr == 3:
        # 위
        ans_dist = visited[0][fir + c]

    return ans_dist


def floor(tpl):
    sr, sc = tpl
    v = [[0] * b_size for _ in range(b_size)]
    v[sr][sc] = (wall_dist + 1)
    q = deque()
    q.append((sr, sc))
    gr, gc = -100, -100
    while q:
        r, c = q.popleft()
        for d in range(4):
            dr, dc = direction[d]
            nr, nc = r + dr, c + dc
            if is_range(nr, nc, b_size) and v[nr][nc] == 0:
                if b_arr[nr][nc] == 0:
                    v[nr][nc] = v[r][c] + 1
                    q.append((nr, nc))

                elif b_arr[nr][nc] == 4:
                    v[nr][nc] = v[r][c] + 1
                    gr, gc = nr, nc
    if (gr, gc) == (-100, -100):
        return -1
    else:
        return v[gr][gc]


# 시간 왜곡 퍼뜨리기
def twist_spread(idx):
    tr, tc, twist_d, time_span = twist[-idx]
    times = pos_ans // time_span

    dr, dc = direction[twist_d]
    for t in range(1, times + 1):
        nr, nc = tr + (dr * t), tc + (dc * t)
        if is_range(nr, nc, b_size):
            if b_arr[nr][nc] == 0:
                b_arr[nr][nc] = -idx


# 입력
b_size, s_size, twist_num = map(int, input().split())
b_arr = [list(map(int, input().split())) for _ in range(b_size)]
s_arr = [[-1] * (s_size * 3) for _ in range(s_size * 3)]

# 각 전개도 면 받기
sr, sc = get_s_arr()
visited = find(sr, sc)

# 공간 왜곡 받기
twist = {}
for idx in range(1, twist_num + 1):
    tr, tc, twist_d, time_span = map(int, input().split())
    b_arr[tr][tc] = -idx
    twist[-idx] = (tr, tc, twist_d, time_span)

sang, dirr, land_s = find_exit(0, 0)  # 상대 좌표 넘겨줘요

if sang == -1:
    print(-1)
else:
    wall_dist = count_dist(sang, dirr)
    if wall_dist == -1:
        print(-1)

    # === 여기까지가 벽 거리 구하기 ===

    else:
        prev_ans = 0

        while True:
            pos_ans = floor(land_s)
            if pos_ans == -1:
                prev_ans = -1
                break

            for idx in range(1, twist_num + 1):
                twist_spread(idx)

            if prev_ans == pos_ans:
                break

            prev_ans = pos_ans

        print(prev_ans)
```
