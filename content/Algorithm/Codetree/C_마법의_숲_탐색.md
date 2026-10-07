---
algorithm: [BFS, 시뮬레이션]
data_structure: [2차원 배열, 덱]
technique: [패딩]
---

### 걸린 시간: 2시간 54분 (구상 43분, 구현 1시간 57분, 디버깅 14분) (실패 횟수: -)

### 실패 / 성공 이유
- [함수 설계] 골렘 좌표 5개씩 다 넘기다 50분 허비
- [BFS] 출구에서 다른 골렘으로 넘어갈 수 있으니 조건은 양수가 아니라 0이 아닐 때
- [패딩] >3 등호 실수

### 코드 개선 방법
- [함수 설계] center와 출구 방향만 넘기기. 회전은 방향만 바꾸면 됨
- [패딩] 위에 3줄 패딩해 시작점 잡기. 몸이 패딩 구간에 걸리면 초기화
- [출력] 매번 갱신 말고 최종 상태만 arr에 뿌려도 충분
- [습관] 펜 들기 전에 문제와 예제를 꼼꼼히

### 코드
```python
# C 마법의 숲 탐색

# 디버깅 포인트 2: 패딩... >3... 등호 제발

# 시간 복잡도 O(NMK)

from collections import deque

direction = {0: (-1, 0), 1: (0, 1), 2: (1, 0), 3: (0, -1)}


def is_range(r, c):
    return 0 <= r < row + 3 and 0 <= c < col


# 1. 골렘 탄생
def birth(tpl):
    idx, mid_col, exit_d = tpl
    g_loc = [(0, mid_col), (1, mid_col), (2, mid_col),
             (1, mid_col - 1), (1, mid_col + 1)]
    e_loc = ()
    center = (1, mid_col)

    if exit_d == 0:
        e_loc = (0, mid_col)
    elif exit_d == 1:
        e_loc = (1, mid_col + 1)
    elif exit_d == 2:
        e_loc = (2, mid_col)
    elif exit_d == 3:
        e_loc = (1, mid_col - 1)

    for r, c in g_loc:
        if arr[r][c] == 0:
            if (r, c) == e_loc:
                arr[r][c] = -idx
            else:
                arr[r][c] = idx

    return center, idx, exit_d


def down(center, idx, exit_d):
    # check
    go = 0
    ok = 0
    cr, cc = center
    new_center = center

    for nr, nc in ((cr + 1, cc - 1), (cr + 2, cc), (cr + 1, cc + 1)):
        if is_range(nr, nc) and arr[nr][nc] == 0:
            ok += 1

    if ok == 3:
        go = 1
        for r, c in ((cr - 1, cc), (cr, cc), (cr + 1, cc), (cr, cc - 1), (cr, cc + 1)):
            arr[r][c] = 0

        new_center = (cr + 1, cc)
        nr, nc = new_center

        dr, dc = direction[exit_d]
        e_loc = (nr + dr, nc + dc)

        # 새로 그리기
        for r, c in ((nr - 1, nc), (nr, nc), (nr + 1, nc), (nr, nc - 1), (nr, nc + 1)):
            if (r, c) == e_loc:
                arr[r][c] = -idx
            else:
                arr[r][c] = idx

    return go, new_center, idx, exit_d


# 2-1. 서쪽(왼쪽)으로
def left(center, idx, exit_d):
    # check
    go = 0
    ok = 0
    cr, cc = center
    new_center = center

    for nr, nc in ((cr - 1, cc - 1), (cr, cc - 2), (cr + 1, cc - 2), (cr + 1, cc - 1), (cr + 2, cc - 1)):

        if is_range(nr, nc) and arr[nr][nc] == 0:
            ok += 1

    if ok == 5:
        for r, c in ((cr - 1, cc), (cr, cc), (cr + 1, cc), (cr, cc - 1), (cr, cc + 1)):
            arr[r][c] = 0

        go = 1
        new_center = (cr + 1, cc - 1)
        nr, nc = new_center

        exit_d = (exit_d - 1) % 4
        dr, dc = direction[exit_d]
        e_loc = (nr + dr, nc + dc)

        # 새로 그리기
        for r, c in ((nr - 1, nc), (nr, nc), (nr + 1, nc), (nr, nc - 1), (nr, nc + 1)):
            if (r, c) == e_loc:
                arr[r][c] = -idx
            else:
                arr[r][c] = idx

    return go, new_center, idx, exit_d


# 2-2. 동쪽 (오른쪽)으로
def right(center, idx, exit_d):
    # check
    go = 0
    ok = 0
    cr, cc = center
    new_center = center

    for nr, nc in ((cr - 1, cc + 1), (cr, cc + 2), (cr + 1, cc + 2), (cr + 1, cc + 1), (cr + 2, cc + 1)):
        if is_range(nr, nc) and arr[nr][nc] == 0:
            ok += 1

    if ok == 5:
        for r, c in ((cr - 1, cc), (cr, cc), (cr + 1, cc), (cr, cc - 1), (cr, cc + 1)):
            arr[r][c] = 0

        go = 1
        new_center = (cr + 1, cc + 1)
        nr, nc = new_center

        exit_d = (exit_d + 1) % 4
        dr, dc = direction[exit_d]
        e_loc = (nr + dr, nc + dc)

        # 새로 그리기
        for r, c in ((nr - 1, nc), (nr, nc), (nr + 1, nc), (nr, nc - 1), (nr, nc + 1)):
            if (r, c) == e_loc:
                arr[r][c] = -idx
            else:
                arr[r][c] = idx

    return go, new_center, idx, exit_d


# 3. 정령의 이동:
def fairy(center):
    global ans

    sr, sc = center
    v = [[0] * col for _ in range(row + 3)]
    v[sr][sc] = 1
    q = deque()
    q.append((sr, sc))
    while q:
        r, c = q.popleft()

        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == 0:
                if arr[r][c] > 0:
                    if arr[nr][nc] == arr[r][c] or arr[nr][nc] == -(arr[r][c]):
                        q.append((nr, nc))
                        v[nr][nc] = 1

                if arr[r][c] < 0 and arr[nr][nc] != 0:  # 이것도 다른 골렘 출구로도 들어갈 수 있음
                    q.append((nr, nc))
                    v[nr][nc] = 1

    for rr in range(row + 2, 0, -1):
        if sum(v[rr]) > 0:
            break

    ans += (rr - 2)  # 패딩 값 빼기


# 입력
row, col, fairy_num = map(int, input().split())

fairy_lst = []
for i in range(1, 1 + fairy_num):
    c, d = map(int, input().split())
    c = c - 1  # 1인덱스
    fairy_lst.append((i, c, d))  # 정령 번호, 중심 열, 출구 방향 위치

arr = [[0] * col for _ in range(row + 3)]
# 시작 지점 잡기 위한 패딩

# 풀이
ans = 0
time = 0
for tpl in fairy_lst:
    time += 1
    center, idx, exit_d = birth(tpl)

    while True:
        d_able, d_center, d_idx, d_exitd = down(center, idx, exit_d)
        if d_able:
            center, idx, exit_d = d_center, d_idx, d_exitd
            continue

        l_able, l_center, l_idx, l_exitd = left(center, idx, exit_d)
        if l_able:
            center, idx, exit_d = l_center, l_idx, l_exitd
            continue

        r_able, r_center, r_idx, r_exitd = right(center, idx, exit_d)
        if r_able:
            center, idx, exit_d = r_center, r_idx, r_exitd
        else:
            break

    # 넘어가면 초기화
    now_r, now_c = center

    cleared = 0
    if now_r < 4:  # 패딩 한 구간으로 밀려오면 # 제발........
        # 등호.. 부등호.. 제발..
        arr = [[0] * col for _ in range(row + 3)]
        cleared = 1

    if not cleared:
        fairy(center)

print(ans)

```
