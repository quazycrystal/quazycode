---
algorithm: [BFS, 시뮬레이션, 정렬]
data_structure: [2차원 배열, 덱, set]
technique: []
---

### 걸린 시간: 3시간 45분 (구상 30분, 구현 1시간 반, 디버깅 1시간 45분) (실패 횟수: 실패 (끝나고 30분 더 보고 찾음))

### 실패 / 성공 이유
- [문제 읽기] 그룹은 혼자여도 성립. 나 말고도 있어야 한다고 생각해 와리가리
- [문제 읽기] 전파 그룹은 단일 / 이중 / 삼중 3개뿐인데 그룹 안에도 순서가 있다고 보고 7개로 나눠 순차 처리
- [자료구조] 민트초코우유는 이중끼리 만나도 생김. 조합 함수를 만들다 set으로 선회 (50분)

### 코드 개선 방법
- [자료구조] 음식은 set으로 두고 합집합. 원소 수(1, 2, 3)로 그룹 판정
- [정렬] 그룹 내 대표는 (신앙심 큰, r 작은, c 작은) 순
- [전파] 전파당한 학생은 방어 모드, 이번 턴에 전파받지 않았을 때만 전파
- [습관] 막히면 끼워맞추지 말고 다른 방법을 생각

### 코드
```python
from collections import deque

def morning():
    for r in range(size):
        for c in range(size):
            sinang[r][c] += 1

# 2. 그룹 찾기
direction = {0: (-1, 0), 1: (1, 0), 2: (0, -1), 3: (0, 1)}


def is_range(r, c):
    return 0 <= r < size and 0 <= c < size

# 상하좌우
def find_group(sr, sc, g):
    found = []
    v[sr][sc] = 1
    q = deque()
    q.append((sr, sc))
    found.append((sinang[sr][sc], sr, sc))
    while q:
        r, c = q.popleft()
        for d in range(4):
            dr, dc = direction[d]
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == 0:
                if group[nr][nc] == g:
                    q.append((nr, nc))
                    found.append((sinang[nr][nc], nr, nc))
                    v[nr][nc] = 1

    return found


# 3. 값 조정, 대표 빼주는 친구
def rebalance(found):
    found.sort(key=lambda x: (x[0], -x[1], -x[2]))
    pick = found.pop()
    length = len(found)
    # 나머지 다 -1
    for _, r, c in found:
        sinang[r][c] -= 1

    # 대표 + (N-1)
    pr, pc = pick[1], pick[2]
    sinang[pr][pc] += length
    pick = (sinang[pr][pc], pr, pc)

    return pick


# 4. 답 뽑을 때 그룹 바꿔주기
def change_group(g_set):
    if g_set == {1}:  # 민트
        return 6

    if g_set == {2}:  # 초코
        return 5

    if g_set == {3}:  # 우유
        return 4

    if g_set == {2, 3}:  # 초코 우유
        return 3

    if g_set == {1, 3}:  # 민트 우유
        return 2

    if g_set == {1, 2}:  # 민트 초코
        return 1

    if g_set == {1, 2, 3}:
        return 0

# 5. 강한 전파 / 약한 전파 판별
def fight(g, power, yr, yc):
    # 전파 당하면 방어 모드
    defence[yr][yc] = 1

    # 5-1) 강한 전파
    if power > sinang[yr][yc]:
        group[yr][yc] = g
        power -= (sinang[yr][yc] + 1)
        sinang[yr][yc] += 1

    # 5-2) 약한 전파
    else:
        group[yr][yc] = group[yr][yc].union(g)
        sinang[yr][yc] += power
        power = 0

    return power

# 6. 신앙 퍼뜨리는 함수
def spread(g, power, xr, xc):
    d = power % 4
    dr, dc = direction[d]

    sinang[xr][xc] = 1
    power -= 1

    while True:
        nr, nc = xr + dr, xc + dc
        if not is_range(nr, nc):
            break
        else:
            if group[nr][nc] != g:
                if power > 0:
                    power = fight(g, power, nr, nc)

            xr, xc = nr, nc

        if power <= 0:
            break


# 7. 답 내는 신앙 함수
def scoring():
    global score
    for i in range(size):
        for j in range(size):
            g = group[i][j]
            ng = change_group(g)
            score[ng] += sinang[i][j]


# 입력
size, time = map(int, input().split())
group = [[set() for _ in range(size)] for _ in range(size)]

# 종류 입력 받기
temp = [list(input()) for _ in range(size)]

for i in range(size):
    for j in range(size):
        if temp[i][j] == "T":
            group[i][j].add(1)

        elif temp[i][j] == "C":
            group[i][j].add(2)

        elif temp[i][j] == "M":
            group[i][j].add(3)

# 신앙심 입력 받기
sinang = [list(map(int, input().split())) for _ in range(size)]

for now_time in range(time):
    # 아침
    morning()

    # 점심
    rep = [[] for _ in range(3)]
    score = [0] * 7

    v = [[0] * size for _ in range(size)]
    for r in range(size):
        for c in range(size):
            if v[r][c] == 0:
                g = group[r][c]
                found = find_group(r, c, g)

                if found != -1:
                    pick = rebalance(found)
                    if len(g) == 1:
                        rep[0].append(pick)
                    elif len(g) == 2:
                        rep[1].append(pick)
                    else:
                        rep[2].append(pick)


    # 그룹 별 우선순위 미리 정렬
    for rr in rep:
        rr.sort(key=lambda x: (-x[0], x[1], x[2]))  # 같은 그룹 내에서도 신앙 - r - c

    # 저녁
    defence = [[0] * size for _ in range(size)]

    for i in range(3):
        lst = rep[i]
        for s, r, c in lst:
            if defence[r][c] == 0:
                # 이번 턴에 전파 받지 않았다면
                spread(group[r][c], s, r, c)

    # 정답
    scoring()
    print(*score)

```
