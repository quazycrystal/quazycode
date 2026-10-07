---
algorithm: [시뮬레이션]
data_structure: [2차원 배열]
technique: [델타 탐색]
---

### 걸린 시간: 1시간 40분 (구상 15분, 구현 1시간 25분) + 새로 짠 1시간 10분, 약 2시간 50분 (실패 횟수: -)

### 실패 / 성공 이유
- [문제 읽기] 제초제는 bfs로 퍼지는 게 아니라 대각선 한 방향으로 쭉 감
- [초기값] 벽을 101처럼 애매한 값으로 둬서 제초제 연산에 벽이 오염됨
- [변수] 마지막에 select_v가 아니라 arr를 써야 함
- [속도] 제초제 구간 구현 시작이 1시간 14분으로 느림

### 코드 개선 방법
- [초기값] 기본값은 inf처럼 크게. 벽은 큰 음수로 해서 아무리 더해도 양수가 안 되게
- [표시] 음수는 제초제 남은 해, 1년마다 +1
- [순서] 성장 → 번식은 분리. 번식은 주변 빈 칸 수를 미리 받아두고 동시에
- [정렬] 행·열 순으로 돌면 sort 없이 우선순위 충족
- [습관] 예제를 한 번 더 손으로 보기. 단위 테스트 좋았음

### 코드
```python
# C 코드 트리 나무박멸

from collections import deque

size, time, p_range, p_last = map(int, input().split())
arr = [list(map(int, input().split())) for _ in range(size)]
INF = float("inf")


def is_range(r, c):
    return 0 <= r < size and 0 <= c < size


def grow():
    tree_lst = []
    tree_set = set()
    for r in range(size):
        for c in range(size):
            # 나무 성장
            if INF > arr[r][c] > 0:
                tree_set.add((r, c))
                cnt = 0
                nxt_grow = 0

                for dr, dc in ((0, -1), (0, 1), (-1, 0), (1, 0)):
                    nr, nc = r + dr, c + dc
                    if is_range(nr, nc):
                        if INF > arr[nr][nc] > 0:
                            cnt += 1
                        if arr[nr][nc] == 0:
                            nxt_grow += 1

                tree_lst.append((r, c, nxt_grow))  # 나무 리스트 반환

                arr[r][c] += cnt

    return tree_lst, tree_set  # ok


def spread(t_lst, t_set):
    for tree_r, tree_c, num in t_lst:
        if num != 0:
            new_tree = arr[tree_r][tree_c] // num  # 미리 주변 빈 칸 받아오고
            for dr, dc in ((0, -1), (0, 1), (-1, 0), (1, 0)):
                nr, nc = tree_r + dr, tree_c + dc

                if is_range(nr, nc):
                    if INF > arr[nr][nc] >= 0 and (nr, nc) not in t_set:
                        # 원래 있는 곳 제외...
                        arr[nr][nc] += new_tree


def pesticide(sr, sc):
    # 3. 제초제 어디 뿌릴 지 결정
    v = [[0] * size for _ in range(size)]
    v[sr][sc] = 1
    sm = arr[sr][sc]  # 퍼져 나가 죽인 나무 수

    for i in range(4):
        r, c = sr, sc

        if i == 0:
            dr, dc = -1, -1
        elif i == 1:
            dr, dc = 1, -1
        elif i == 2:
            dr, dc = -1, 1
        else:
            dr, dc = 1, 1

        flag = 0
        for k in range(p_range):
            if flag == 1:
                break
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == 0:
                if INF > arr[nr][nc] > 0:
                    sm += arr[nr][nc]
                    pass
                else:
                    flag = 1

                v[nr][nc] = 1

            r, c = nr, nc

    return sm, v


ans_sm = 0

# 데이터 전처리, 벽만 1000이상 값으로
for r in range(size):
    for c in range(size):
        if arr[r][c] == -1:
            arr[r][c] = INF

while time > 0:
    time -= 1
    t, ts = grow()
    spread(t, ts)

    max_sm = 0
    select_v = [[0] * size for _ in range(size)]
    for row in range(size):
        for col in range(size): # 여기서 sort 안 써도 행 열 빠른거부터 집힘
            if INF > arr[row][col] > 0:
                sm, v = pesticide(row, col)
                if max_sm < sm:
                    max_sm = sm
                    select_v = v

    ans_sm += max_sm

    for i in range(size):
        for j in range(size):
            if arr[i][j] < 0:
                arr[i][j] += 1  # 음수는 제초제 뿌린 곳 - 1년 지날 때 마다 추가
                # 벽은 큰 음수로 해서 아무리 추가해도 양수 안 되게

            if select_v[i][j] == 1 and INF > arr[i][j]:  # select_v가 아니라 arr
                arr[i][j] = -p_last

print(ans_sm)

```
