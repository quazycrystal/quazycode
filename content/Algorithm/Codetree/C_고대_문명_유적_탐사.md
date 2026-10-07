---
algorithm: [BFS, 완전탐색, 정렬]
data_structure: [2차원 배열, 덱]
technique: [배열 회전]
---

### 걸린 시간: - (실패 횟수: -)

### 실패 / 성공 이유
- [정렬] 기준이 회전 각도 → 열 → 행 순. 행/열이 헷갈림
- [변수] 함수 밖 v를 안에서 접근하다 name error

### 코드 개선 방법
- [BFS] v는 함수 안에서 만들어 반환하고 밖에서 덮어씌우기
- [채우기] 0으로 만들 좌표만 모아 sort(lambda)로 순서를 정해 채우기
- [완전탐색] 3*3 중심 9곳 * 회전 3가지. 각도 작은 것부터
- [검증] 처음부터 못 터지는 케이스, 한꺼번에 터지는 케이스

### 코드
```python
# C 고대 문명 유적 탐사

# 함수
from collections import deque

def is_range(r, c):
    return 0 <= r < 5 and 0 <= c < 5

# 그냥 반복문 밖에 빼고, 각도, 좌표 넣어주자
def arr_turn(ang, r, c, arr):

    arr_copy = [line[:] for line in arr]
    slice = [line[c: c + 3] for line in arr[r: r + 3]]
    if ang == 0:  # 90도 회전
        slice = [list(line[::-1]) for line in zip(*slice)]
    elif ang == 1:  # 180도 회전
        slice = [line[::-1] for line in slice[::-1]]
    elif ang == 2: # 270도 회전
        slice = [list(line) for line in zip(*slice)][::-1]

    for nr in range(3):
        for nc in range(3):
            arr_copy[nr + r][nc + c] = slice[nr][nc]

    return arr_copy


# 2-1) 매 for문마다 돌 bfs
def bfs(sr, sc, num, copy_arr, v):
    cnt = 1
    jwa = [(sr, sc)]
    v[sr][sc] = 1
    q = deque()
    q.append((sr, sc))
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == 0:
                if copy_arr[nr][nc] == num:
                    q.append((nr, nc))
                    v[nr][nc] = 1
                    cnt += 1
                    jwa.append((nr, nc))
    if cnt >= 3:  # 터져야 하는 애면
        for popr, popc in jwa:
            copy_arr[popr][popc] = 0
    else:
        cnt = 0  # 안 터지면 걍 0

    return cnt, v

# 3. 유물 채우는 함수
def fill(pop_arr):
    add_score = 0

    while True:
        # 채운다
        pop_copy = [line[:] for line in pop_arr]

        for col in range(5):
            for row in range(4, -1, -1):
                if pop_copy[row][col] == 0:
                    pop_copy[row][col] = fills.popleft()

        # 터뜨린다
        v = [[0] * 5 for _ in range(5)]
        sm = 0

        for i in range(5):
            for j in range(5):
                if v[i][j] == 0:
                    num = pop_copy[i][j]
                    score, v = bfs(i, j, num, pop_copy, v)

                    sm += score

        pop_arr = pop_copy

        if sm > 0:
            add_score += sm
        else:
            break

    return pop_arr, add_score

# 입력
time, fill_num = map(int, input().split())
arr = [list(map(int, input().split())) for _ in range(5)]
fills = deque(list(map(int, input().split()))) # 덱 비는 경우 없다고 했음

# 풀이
ans = []
for now_time in range(1, 1 + time):
    # 매 턴 새로 뽑히는 배열 / 점수
    best_arr = []
    best_score = 0
    for ang in range(3):
        for c in range(3): # 열이 작은 구간 -> 행이 작은 구간;;;
            # 행열 너무 헷갈리네 진짜;;
            for r in range(3):
                arr_copy = arr_turn(ang, r, c, arr)

                # 2. 유물 1차 가치, 최대 배열
                v = [[0] * 5 for _ in range(5)]
                sm = 0

                for i in range(5):
                    for j in range(5):
                        if v[i][j] == 0:
                            num = arr_copy[i][j]
                            score, v = bfs(i, j, num, arr_copy, v)
                            sm += score

                if sm > best_score:
                    best_score = sm
                    best_arr = arr_copy

    # break point: 온몸 비틀기 해도 연결 되는 부분 없으면 종료
    if best_score == 0:
        break

    # ===== 유물 1차 획득 =====

    # N차로 채우고, 획득하고
    final_arr, add_score = fill(best_arr)
    best_score += add_score

    # 턴 종료시 얻은 모든 점수 ans 리스트에
    ans.append(best_score)
    arr = final_arr

print(*ans)
```
