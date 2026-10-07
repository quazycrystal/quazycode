---
algorithm: [시뮬레이션]
data_structure: [3차원 배열, dict, 리스트]
technique: [달팽이, 룩업 테이블]
---

### 걸린 시간: 1차: 2시간 25분 (구상 10분, 구현 2시간 15분) / 재풀이: 55분 (구상 8분, 구현 47분) (실패 횟수: -)

### 실패 / 성공 이유
- [재대입] new_arr.extend로 도망자를 추가해야 하는데 재대입
- [변수] 달팽이 글로벌 변수 8개. 역달팽이 변수에서 r_ 두 글자 누락
- [달팽이] 한 번에 쭉 도는 달팽이는 한 칸씩 끊어 가는 문제에 불편

### 코드 개선 방법
- [룩업 테이블] 달팽이 경로를 (좌표, 방향) 벡터 리스트로 미리 만들고 역달팽이는 뒤집기. 매 턴 인덱스만 +1
- [방향] 다음 방향을 바로 저장해두면 다음 좌표도 바로 나옴
- [디버깅] 위치뿐 아니라 바라보는 방향도 찍기
- [자료구조] 검거 편의를 위해 3중 arr

### 코드
```python
# C 술래잡기 2차

# 함수
def is_range(r, c):
    return 0 <= r < size and 0 <= c < size

# 1. 도망자
direction = {1: (0, 1), 2: (1, 0), 3: (0, -1), 4: (-1, 0)}
# 우, 하, 좌, 상

reverse = {1: 3, 2: 4, 3: 1, 4: 2}

def runner(sulr, sulc):
    for idx in range(1, 1 + r_num):
        if idx in r_loc:
            sr, sc, d = r_loc[idx]

            # 차이가 3 이하인 경우만 위치 이동
            if abs(sulr - sr) + abs(sulc - sc) <= 3:

                dr, dc = direction[d]
                nr, nc = sr + dr, sc + dc
                if not is_range(nr, nc):
                    d = reverse[d]
                    dr, dc = direction[d]
                    nr, nc = sr + dr, sc + dc

                if (nr, nc) != (sulr, sulc):
                    r_loc[idx] = (nr, nc, d)
                else:
                    r_loc[idx] = (sr, sc, d)

    # 검거의 편의를 위해 3중 arr
    now = [[[] for _ in range(size)] for _ in range(size)]
    for i in range(1, 1 + r_num):
        if i in r_loc:
            r, c, _ = r_loc[i]
            now[r][c].append(i)

    return now

def snail():
    vector = []
    # 상, 우, 하, 좌 - 4, 1, 2, 3
    i = 1
    while len(vector) < (pow(size, 2) - 1):
        vector.extend([4] * i)
        vector.extend([1] * i)
        vector.extend([2] * (i+1))
        vector.extend([3] * (i+1))
        i += 2

    vector = vector[:(pow(size, 2) - 1)]

    # 역달팽이도 한 방에!
    r_vector = []
    for d in range((pow(size, 2) - 2), -1, -1):
        r_vector.append(reverse[vector[d]])

    return vector + r_vector

# 2-2. 술래 이동 / 검거
def sul(sulr, sulc, v):
    score = 0
    d = now_time % (2*(pow(size, 2) - 1))
    vd = lookup[d]
    dr, dc = direction[vd]
    nr, nc = sulr + dr, sulc + dc

    # 방향 바뀌었는지 체크 필요!
    nd = (now_time + 1) % (2*(pow(size, 2) - 1))
    vnd = lookup[nd]
    ndr, ndc = direction[vnd]

    # 검거구역
    for dist in range(3):
        nnr, nnc = nr + (ndr * dist), nc + (ndc * dist)
        if is_range(nnr, nnc):
            if trees[nnr][nnc] == 0 and v[nnr][nnc]:
                cnt = len(v[nnr][nnc])
                score += cnt * (now_time+1)
                for index in v[nnr][nnc]:
                    r_loc.pop(index)

    return nr, nc, score


# 입력
size, r_num, t_num, time = map(int, input().split())

# 술래 위치
sulr, sulc = size // 2, size // 2

# 도망자 dict
r_loc = {}
for idx in range(1, 1+r_num):
    r, c, d = map(int, input().split())
    r, c = r-1, c-1 # 1 인덱스
    r_loc[idx] = (r, c, d)

# 나무 arr
trees = [[0] * size for _ in range(size)]
for _ in range(t_num):
    tr, tc = map(int, input().split())
    tr, tc = tr-1, tc-1
    trees[tr][tc] = 1

lookup = snail()

ans = 0
for now_time in range(time):
    # 1. 도망자 이동
    now = runner(sulr, sulc)

    # 2. 술래 이동 / 검거
    sulr, sulc, score = sul(sulr, sulc, now)
    ans += score

print(ans)

snail_d = {1: (-1, 0), 2: (0, 1), 3: (1, 0), 4: (0, -1)}
reverse = {1: 3, 2: 4, 3: 1, 4: 2}


def is_range(r, c):
    return 0 <= r < size and 0 <= c < size


def snail():
    vector_lst = []

    cnt = 1
    while len(vector_lst) < (size * size - 1):
        vector_lst.extend([1] * cnt)
        vector_lst.extend([2] * cnt)
        vector_lst.extend([3] * (cnt + 1))
        vector_lst.extend([4] * (cnt + 1))
        cnt += 2

    vector_lst = vector_lst[:(size * size - 1)]
    # 반대로
    for i in range(size * size-1):
        ori_d = vector_lst[size * size - 2 - i]
        vector_lst.append(reverse[ori_d])

    return vector_lst


# === 도망자 이동 ===
direction = {1: (0, 1), 2: (1, 0), 3: (0, -1), 4: (-1, 0)}
# 우 하 좌 상

def runner(r, c):
    for d in arr[r][c]:
        dr, dc = direction[d]
        nr, nc = r + dr, c + dc
        if not is_range(nr, nc):
            d = reverse[d]
            dr, dc = direction[d]
            nr, nc = r + dr, c + dc

        if (sr, sc) != (nr, nc):
            new_arr[nr][nc].append(d)
        else:
            new_arr[r][c].append(d)


def sul(r, c, time):
    got = 0

    # 현 인덱스 다음 방향 인덱스도 봐야!
    now = (time - 1) % (2 * (size * size - 1))
    nxt = time % (2 * (size * size - 1))

    d = vector_lst[now]
    dr, dc = snail_d[d]
    nr, nc = r + dr, c + dc

    # 다음 방향 바꾸기
    if d != vector_lst[nxt]:
        d = vector_lst[nxt]

    # 칸 처리
    dr, dc = snail_d[d]  # 새로운 방향으로 리뉴얼
    for mul in range(3):
        nnr, nnc = nr + (dr * mul), nc + (dc * mul)

        if is_range(nnr, nnc) and trees[nnr][nnc] == 0:
            got += len(arr[nnr][nnc])
            arr[nnr][nnc] = []

    return nr, nc, got


# 입력
size, runner_num, tree_num, time = map(int, input().split())
arr = [[[] for _ in range(size)] for _ in range(size)]
trees = [[0] * size for _ in range(size)]

# 1 인덱스
for _ in range(runner_num):
    r, c, d = map(int, input().split())
    r, c = r - 1, c - 1
    arr[r][c].append(d)

for _ in range(tree_num):
    r, c = map(int, input().split())
    r, c = r - 1, c - 1
    trees[r][c] = 1

# 미리 백터리스트 만들어 두고 시작
vector_lst = snail()

# 한 칸 앞으로 가는게
sr, sc = size // 2, size // 2

# 반복
ans = 0

for now_time in range(1, time + 1):
    cnt = 0
    new_arr = [[[] for _ in range(size)] for _ in range(size)]
    for r in range(size):
        for c in range(size):
            if arr[r][c]:
                if (abs(sr - r) + abs(sc - c)) <= 3:
                    runner(r, c)
                else:
                    new_arr[r][c].extend(arr[r][c])
            else:
                cnt += 1

    if cnt == (size*size):
        break

    arr = new_arr

    sr, sc, got = sul(sr, sc, now_time)
    ans += got * now_time

print(ans)

# === 고친 이전 코드 ===
from collections import deque
# 함수
def is_range(r, c):
    return 0 <= r < size and 0 <= c < size

# 1. 변형 달팽쓰
snail_dirr = deque([(-1, 0), (0, 1), (1, 0), (0, -1)])
# 상 우 하 좌

def snail(sr, sc):
    global two, cnt, now
    got = 0
    # 한 칸 간 nr,nc를 주면 됨, dr dc 바꾸고 탐색까지
    if (sr, sc) == (0, 0):
        return 0, 0, 0

    else:
        dr, dc = snail_dirr[0]
        nr, nc = sr + dr, sc + dc

        now += 1

        if now == cnt: # 방향 바꾸기
            snail_dirr.rotate(-1)
            now = 0
            two += 1

        if two == 2:
            cnt += 1
            two = 0

        # 탐색: 함수와 위치 바뀔 때 주의!! 디버깅 포인트 미리
        ndr, ndc = snail_dirr[0]
        for can in range(3):
            nxtr, nxtc = nr + (ndr*can), nc + (ndc*can)
            if is_range(nxtr, nxtc):
                if arr[nxtr][nxtc] and trees[nxtr][nxtc] == 0:
                    got += len(arr[nxtr][nxtc])
                    arr[nxtr][nxtc] = []

        return nr, nc, got

r_snail_dirr = deque([(1, 0), (0, 1), (-1, 0), (0, -1)])
# 하 우 상 좌

def reverse_snail(sr, sc):
    global r_now, r_cnt, r_two
    got = 0
    # 한 칸 간 nr,nc를 주면 됨, dr dc 바꾸고 탐색까지
    if (sr, sc) == (size//2, size//2):
        return size//2, size//2, 0

    else:
        dr, dc = r_snail_dirr[0]
        nr, nc = sr + dr, sc + dc

        r_now -= 1

        if r_now == 0:  # 방향 바꾸기
            r_snail_dirr.rotate(-1)
            r_now = r_cnt-1
            r_two += 1

        if r_two == 2:
            r_cnt -= 1
            r_two = 0

        # 탐색: 함수와 위치 바뀔 때 주의!! 디버깅 포인트 미리
        ndr, ndc = r_snail_dirr[0]
        for can in range(3):
            nxtr, nxtc = nr + (ndr * can), nc + (ndc * can)
            if is_range(nxtr, nxtc):
                if arr[nxtr][nxtc] and trees[nxtr][nxtc] == 0:
                    got += len(arr[nxtr][nxtc])
                    arr[nxtr][nxtc] = []

        return nr, nc, got

# 도망자 함수
direction = {1: (0, 1), 2: (1, 0), 3: (0, -1), 4: (-1, 0)} # 우 하 좌 상
reverse = {1: 3, 2: 4, 3: 1, 4: 2}

def runner(r, c):
    for d in arr[r][c]:
        dr, dc = direction[d]
        nr, nc = r + dr, c + dc

        if not is_range(nr, nc): # 범위 밖인 경우에만 여기로 걸리게
            d = reverse[d]
            dr, dc = direction[d]
            nr, nc = r + dr, c + dc

        # 혹시 모르니 새 배열에 담고 갱신
        if (nr, nc) == (sr, sc): # 여기서 sr, sc는 술래 위치
            new_arr[r][c].append(d)
        else:
            new_arr[nr][nc].append(d)



# 입력
size, runner_num, tree_num, time = map(int, input().split())
arr = [[[] for _ in range(size)] for _ in range(size)]
trees = [[0] * size for _ in range(size)]

# 도망자 번호, 방향 넣기
for _ in range(runner_num):
    r, c, d = map(int, input().split()) # 1인덱스
    r, c = r-1, c-1
    arr[r][c].append(d)

# 나무 위치
for _ in range(tree_num):
    tr, tc = map(int, input().split())
    tr, tc = tr-1, tc-1
    trees[tr][tc] = 1

# 달팽이 변수!!===================
two = 0 # 방향 바꾸기 두 번 차면 cnt +=1
cnt = 1 # cnt 다 차면 방향 바꾸기
now = 0 # cnt의 몇 번째 행동 중인지?

# 역 달팽이 변수!!=================
r_two = 0 # 방향 바꾸기 두 번 차면 cnt +=1
r_cnt = size # cnt 다 차면 방향 바꾸기
r_now = size-1 # cnt의 몇 번째 행동 중인지?

sr, sc = size//2, size//2 # 술래 시작점


ans = 0
switch = 0

for now_time in range(1, time+1):
    new_arr = [[[] for _ in range(size)] for _ in range(size)]
    for row in range(size):
        for col in range(size):
            if arr[row][col]:
                if abs(sr - row) + abs(sc - col) <= 3:
                    runner(row, col)
                else:
                    new_arr[row][col].extend(arr[row][col])

    arr = new_arr # 갱신

    got = 0

    # 2. 술래 출동
    if switch == 0:
        sr, sc, got = snail(sr, sc)

        if (sr, sc) == (0, 0):
            switch = 1
            # 역 달팽이 변수 초기화!!=================
            r_two = 0  # 방향 바꾸기 두 번 차면 cnt +=1
            r_cnt = size  # cnt 다 차면 방향 바꾸기
            r_now = size - 1  # cnt의 몇 번째 행동 중인지?
            r_snail_dirr = deque([(1, 0), (0, 1), (-1, 0), (0, -1)])
            # 하 우 상 좌

            # 탐색만 하면 된다
            dr, dc = r_snail_dirr[0] # 튕겨서 아래
            for can in range(3):
                nr, nc = sr + (dr * can), sc + (dc * can)
                if is_range(nr, nc):
                    if arr[nr][nc] and trees[nr][nc] == 0:
                        got += len(arr[nr][nc])
                        arr[nr][nc] = []

    elif switch == 1:
        sr, sc, got = reverse_snail(sr, sc)

        if (sr, sc) == (size//2, size//2):
            switch = 0

            # 달팽이 변수 초기화 !!===================
            two = 0  # 방향 바꾸기 두 번 차면 cnt +=1
            cnt = 1  # cnt 다 차면 방향 바꾸기
            now = 0  # cnt의 몇 번째 행동 중인지?
            snail_dirr = deque([(-1, 0), (0, 1), (1, 0), (0, -1)])

            # 탐색만 하면 된다
            dr, dc = snail_dirr[0] # 튕겨서 위쪽
            for can in range(3):
                nr, nc = sr + (dr * can), sc + (dc * can)
                if is_range(nr, nc):
                    if arr[nr][nc] and trees[nr][nc] == 0:
                        got += len(arr[nr][nc]) # 매 칸마다 더하기!
                        arr[nr][nc] = []



    ans += got * now_time

print(ans)

```
