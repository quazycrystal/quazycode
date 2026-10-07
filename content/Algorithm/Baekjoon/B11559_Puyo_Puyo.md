---
algorithm: [BFS, 시뮬레이션]
data_structure: [2차원 배열, 덱]
technique: [중력, 배열 회전]
---

### 걸린 시간: - (실패 횟수: -)

### 실패 / 성공 이유
- [문제 읽기] 터질 그룹이 여럿이면 동시에 터지고 한 번의 연쇄로 셈. '그룹'은 개수가 아니라 종류
- [동시 갱신] 같은 색 다른 그룹일 수 있으니 다 모은 뒤 한 번에 터뜨리기

### 코드 개선 방법
- [중력] 덱 중간 인덱스 접근은 느림. 열마다 남은 뿌요를 모아 아래부터 다시 채움
- [배열 회전] 시계 90도 회전하면 열을 행처럼 다룰 수 있음
- [함수 설계] 터뜨리기 / 중력 함수 분리 (112ms)

### 코드
`W7/B11559_Puyo Puyo.py`

```python
from collections import deque

# 터뜨리면서 돌리면 "모든 경우에서" 다 잘 터지나?

# 입력
arr = [list(input()) for _ in range(12)]


# 함수
def bfs(lst):
    v = [line[:] for line in arr]

    cnt = 0  # 유효 배열,,,
    for sr, sc, color in lst:
        v2 = [line[:] for line in v]
        chunk = 0  # chunk 일 때만 배열 갱신해야 함
        v2[sr][sc] = '.'

        q = deque()
        q.append((sr, sc))
        while q:
            chunk += 1
            r, c = q.popleft()

            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < 12 and 0 <= nc < 6:
                    if v2[nr][nc] == color:  # 어차피 방문한 곳이면 여기서 걸러짐
                        v2[nr][nc] = "."
                        q.append((nr, nc))

        if chunk >= 4:
            cnt += 1
            v = v2

    if cnt != 0:
        return v
    else:
        return 0


ans = 0

while True:
    lst = []

    for row in range(12):
        for col in range(6):
            if arr[row][col] != ".":
                color = arr[row][col]
                lst.append((row, col, color))  # 같은 색 다른 그룹일 수도 있으니까 일단 느

    visit = bfs(lst)  # 동시에!!!

    if visit != 0:
        ans += 1

        # 바뀐 배열 보고 돌려버려
        temp_arr = []
        for change_col in range(6):
            temp = []
            for change_row in range(12):  #
                if visit[change_row][change_col] != '.':
                    temp.append(arr[change_row][change_col])

            if len(temp) < 12:
                temp = ["."] * (12 - len(temp)) + temp

            temp_arr.append(temp)

        # 시계 90도 회전하면 원하는 arr
        arr = [list(line[::-1]) for line in zip(*temp_arr)]

    else:
        break

print(ans)

```

`W11/B11559_Puyo Puyo.py`

```python
from collections import deque

# 함수
def is_range(r, c):
    return 0 <= r < 12 and 0 <= c < 6

# 1. 터뜨리기 함수
def bfs_pop(sr, sc):
    popped = 0
    pop_lst = []
    color = arr[sr][sc]
    v[sr][sc] = 1
    q = deque()
    q.append((sr, sc))
    pop_lst.append((sr, sc))
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == 0:
                if arr[nr][nc] == color:
                    v[nr][nc] = 1
                    q.append((nr, nc))
                    pop_lst.append((nr, nc))

    if len(pop_lst) >= 4:
        popped += 1
        for pr, pc in pop_lst:
            arr[pr][pc] = "."

    return popped

# 2. 중력 함수
def gravity():
    arr_copy = [["."] * 6 for _ in range(12)]

    for col in range(6):
        line = []
        for row in range(12):
            if arr[row][col] != ".":
                line.append(arr[row][col])

        # 다시 역으로 채움
        for r_row in range(11, -1, -1):
            if line:
                arr_copy[r_row][col] = line.pop()

    return arr_copy

# 입력
arr = [list(input()) for _ in range(12)]

# 풀이
ans = 0
while True:
    cnt = 0
    v = [[0] * 6 for _ in range(12)]

    for r in range(12):
        for c in range(6):
            if v[r][c] == 0 and arr[r][c] != ".":
                popped = bfs_pop(r, c)
                cnt += popped

    if cnt == 0:
        break
    else:
        ans += 1
        arr_copy = gravity()
        arr = arr_copy

print(ans)
```
