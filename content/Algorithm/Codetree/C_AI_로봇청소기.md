---
algorithm: [BFS, 시뮬레이션]
data_structure: [2차원 배열, 덱]
technique: []
---

### 걸린 시간: 3시간 11분 (구상 22분, 구현 58분, 디버깅 1시간 51분) (실패 횟수: -)

### 실패 / 성공 이유
- [조건] 물건도 아니고 청소기도 아니어야 → and/or 혼동 (30분)
- [BFS] 내 위치가 더러운 곳일 수 있음. 거리 0 처리 누락 (43분)
- [범위] 0 <= x <= 20을 x <= 20으로 써서 -1이 안 걸러짐 (37분)
- [디버깅] 고치다 남은 코드 쪼가리가 들어감

### 코드 개선 방법
- [조건] 빼야 할 조건은 continue로 먼저 거르기
- [정렬] (거리, 행, 열)
- [동시 갱신] 확산량은 다 구한 뒤 원본에 추가
- [검증] 먼지 0 테케

### 코드
```python
# C AI 로봇 청소기

# 한 줄 리뷰: 레전드로구나

# 시간 복잡도: N^2 * 로봇 갯수 k * 테스트 횟수 l
from collections import deque


# 함수

def is_range(r, c):
    return 0 <= r < size and 0 <= c < size


# 1. 이동 하는 함수
def move(sr, sc, idx):
    v = [[-1] * size for _ in range(size)]
    v[sr][sc] = 0
    if arr[sr][sc] > 0:
        pos = [(sr, sc)]

    else:
        q = deque()
        q.append((sr, sc))

        # 가능한 이동 다 모아
        pos = []
        mn_dist = 10 ** 18
        while q:

            r, c = q.popleft()
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = r + dr, c + dc
                if is_range(nr, nc) and v[nr][nc] == -1:
                    if arr[nr][nc] == -1:
                        continue

                    if r_arr[nr][nc] == 1:
                        continue

                    q.append((nr, nc))
                    v[nr][nc] = v[r][c] + 1
                    if arr[nr][nc] > 0:
                        if mn_dist >= v[nr][nc]:
                            if mn_dist > v[nr][nc]:
                                mn_dist = v[nr][nc]
                                pos = []
                            pos.append((nr, nc))

    if pos:
        pos.sort()  # 거리 작고, 행, 열 작고
        r_arr[sr][sc] = 0  # 일단 내 위치 지워
        r_loc[idx] = pos[0]
        nxtr, nxtc = pos[0]
        r_arr[nxtr][nxtc] = 1
        return 0

    else:
        return 1


# 2. 청소하기 - 우, 하, 좌, 상
lookup = {0: [(0, 0), (0, 1), (-1, 0), (1, 0)],
          1: [(0, 0), (1, 0), (0, -1), (0, 1)],
          2: [(0, 0), (0, -1), (-1, 0), (1, 0)],
          3: [(0, 0), (-1, 0), (0, -1), (0, 1)]}


def clean(sr, sc):
    mx_sm = 0
    p_nxt = []
    for d in range(4):
        loc_sm = 0
        loc_nxt = []
        for dr, dc in lookup[d]:
            nr, nc = sr + dr, sc + dc
            if is_range(nr, nc):

                if 0 <= arr[nr][nc] <= 20:
                    loc_sm += arr[nr][nc]
                elif 20 < arr[nr][nc]:  # 범위!!!!!!!!! crazy 여기서 -1 안 걸러진 듯
                    loc_sm += 20  # 한 격자당 20까지만 처리 가능
                loc_nxt.append((nr, nc))

        if loc_sm > mx_sm:
            mx_sm = loc_sm
            p_nxt = loc_nxt

    for pr, pc in p_nxt:
        if 0 <= arr[pr][pc] <= 20:
            arr[pr][pc] = 0
        elif 20 < arr[pr][pc]:
            arr[pr][pc] -= 20  # 한 격자당 20까지만 처리 가능


# 3. 먼지 축적
def dust():
    for r in range(size):
        for c in range(size):
            if arr[r][c] > 0:
                arr[r][c] += 5


# 4. 먼지 확산
def spread():
    new_arr = [[0] * size for _ in range(size)]
    for r in range(size):
        for c in range(size):
            if arr[r][c] == 0:
                sm = 0
                for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    nr, nc = r + dr, c + dc
                    if is_range(nr, nc) and arr[nr][nc] > 0:
                        sm += arr[nr][nc]

                new_arr[r][c] += (sm // 10)

    # 추가량 정해졌으면 원본에 추가
    for i in range(size):
        for j in range(size):
            if new_arr[i][j] > 0:
                arr[i][j] += new_arr[i][j]


# 5. 정답 내는 함수, -1 제외 주의
def add_up():
    ans = 0
    for i in range(size):
        for j in range(size):
            if arr[i][j] > -1:
                ans += arr[i][j]
    return ans


# 입력
size, r_num, time = map(int, input().split())
arr = [list(map(int, input().split())) for _ in range(size)]

# 로봇 위치
r_loc = {}
r_arr = [[0] * size for _ in range(size)]

for i in range(1, 1 + r_num):
    rr, rc = map(int, input().split())
    rr, rc = rr - 1, rc - 1  # 1 인덱스
    r_loc[i] = (rr, rc)
    r_arr[rr][rc] = 1

# 풀이
for now_time in range(time):

    # 1. 이동 - 순차
    for idx in range(1, 1 + r_num):
        sr, sc = r_loc[idx]
        finish = move(sr, sc, idx)

        if finish:
            continue

    # 2. 청소 - 순차
    for idx in range(1, 1 + r_num):
        nsr, nsc = r_loc[idx]
        clean(nsr, nsc)

    # 3. 먼지 축적
    dust()

    # 4. 먼지 확산
    spread()

    # 5. 정답
    ans = add_up()
    print(ans)
```
