---
algorithm: [BFS, 시뮬레이션]
data_structure: [2차원 배열, 덱]
technique: [배열 회전, 룩업 테이블]
---

### 걸린 시간: 1시간 41분 (구상 7분, 구현 1시간 34분) (실패 횟수: -)

### 실패 / 성공 이유
- [접근] 벽 아이디어에 꽂혀 좌표 기반으로 인접 체크. 그룹 기반이어야 했음
- [시간 복잡도] 그룹 쌍 900C2 안에서 또 완탐 → 터짐. 900으로 착각

### 코드 개선 방법
- [룩업 테이블] bfs로 그룹 번호·크기를 매기고, 인접 변은 (그룹a, 그룹b) 카운트를 한 번 순회로
- [중복 방지] 나보다 큰 그룹 쪽만 세기
- [배열 회전] 십자는 반시계, 네 덩어리는 각각 시계 90도

### 코드
```python
#
from collections import deque
from itertools import *

# 함수
DEBUG = 1


def debug(*args):
    if DEBUG:
        print(*args)


def is_range(r, c):
    return 0 <= r < size and 0 <= c < size


def find_adj(sr, sc, color, times):
    cnt = 0  # 한 그룹에 몇 칸??
    v[sr][sc] = times
    cnt += 1
    q = deque()
    q.append((sr, sc))
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc):

                if v[nr][nc] == 0 and arr[nr][nc] == color:  # 색 같은 부분만 탐방
                    # 인접한 값에 나보다 크면 넣자
                    v[nr][nc] = times
                    cnt += 1  # v 방문 배열에 표시하는 만큼 느니까
                    q.append((nr, nc))
    return cnt


# 2. 배열 돌리고 돌리고...
def turn(arr):
    arr_copy = [[0] * size for _ in range(size)]
    mid = size // 2

    mid_row = arr[mid]
    mid_col = [line[mid] for line in arr]

    arr_copy[mid] = mid_col
    for r in range(size):
        arr_copy[r][mid] = mid_row[size - 1 - r]

    left_top = [line[:mid] for line in arr[:mid]]
    right_top = [line[mid + 1:] for line in arr[:mid]]
    left_bott = [line[:mid] for line in arr[mid + 1:]]
    right_bott = [line[mid + 1:] for line in arr[mid + 1:]]

    left_top = [list(line[::-1]) for line in zip(*left_top)]
    right_top = [list(line[::-1]) for line in zip(*right_top)]
    left_bott = [list(line[::-1]) for line in zip(*left_bott)]
    right_bott = [list(line[::-1]) for line in zip(*right_bott)]

    # row, col 이슈;;;; 젭알

    for row in range(0, mid):
        for col in range(0, mid):
            arr_copy[row][col] = left_top[row][col]

    # 오른쪽 위
    for row in range(0, mid):
        for col in range(mid + 1, size):
            arr_copy[row][col] = right_top[row][col - mid - 1]

    # 왼쪽 아래
    for row in range(mid + 1, size):
        for col in range(0, mid):
            arr_copy[row][col] = left_bott[row - mid - 1][col]

    # 오른쪽 아래
    for row in range(mid + 1, size):
        for col in range(mid + 1, size):
            arr_copy[row][col] = right_bott[row - mid - 1][col - mid - 1]

    return arr_copy


# 입력
size = int(input())
arr = [list(map(int, input().split())) for _ in range(size)]

ans = 0
for _ in range(4):
    times = 0
    group_start = []  # 그룹 별 색, 시작 좌표
    v = [[0] * size for _ in range(size)]
    for i in range(size):
        for j in range(size):
            if v[i][j] == 0:
                times += 1
                color = arr[i][j]
                cans = find_adj(i, j, color, times)
                group_start.append((color, times, cans))

    adj = [[0] * (times+1) for _ in range(times+1)]

    # 다 돌고 각각이
    for i in range(size):
        for j in range(size):
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = i + dr, j + dc
                if is_range(nr, nc):
                    if arr[nr][nc] > arr[i][j]: # 값 자체가 클 때
                        # 그룹 인덱스에서 보자
                        check_group = v[nr][nc] # 그룹 넘버는 1부터 시작하고, 리스트 0 그냥 안 쓸래
                        # print(check_group)
                        now_group = v[i][j]
                        adj[now_group][check_group] += 1

    joa = 0
    for combi in combinations(group_start, 2):
        color1, group1, cans1 = combi[0]
        color2, group2, cans2 = combi[1]

        look_color = max(color1, color2)

        ajd_lines = 0
        # 색깔, 그룹 넘버, 몇 칸인지 - 인접 변 수 구하려고
        search_group = 0
        not_search_group = 0
        if look_color == color1:
            search_group = group1
            not_search_group = group2
        else:
            search_group = group2
            not_search_group = group1

        ajd_lines = adj[not_search_group][search_group]
        if ajd_lines == 0:
            continue

        # === 인접 라인 수 잘 구해짐 ===
        joa += (cans1 + cans2) * color1 * color2 * ajd_lines
    ans += joa

    arr = turn(arr)

print(ans)

```
