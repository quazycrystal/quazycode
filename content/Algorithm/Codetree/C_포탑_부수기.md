---
algorithm: [BFS, 시뮬레이션, 정렬]
data_structure: [2차원 배열, 덱, set]
technique: []
---

### 걸린 시간: 1시간 12분 (구상 15분, 구현·검증 46분, 디버깅 11분) (실패 횟수: 1회 (WA))

### 실패 / 성공 이유
- [엣지 케이스] 포탑이 하나 남았을 때 처리 누락. 체크리스트에는 있었음
- [알고리즘 선택] 1트: 레이저 경로를 백트래킹 → 최단 보장 X, 4^100
- [정렬] 행+열 합 다음 열인데 열 기준만 봄

### 코드 개선 방법
- [BFS] 최단 경로는 bfs. 경로를 들고 다니거나 역추적. 우하좌상 순 탐색이면 먼저 도착한 게 우선순위 경로
- [정렬] lambda로 (공격력, 최근 공격, 행+열, 열) 기준을 한 번에
- [복사] set 복사는 set(s)
- [습관] 체크리스트를 코드 위 주석으로 적고 시작

### 코드
성공 코드
```python
from collections import deque

# 0. 공격자 / 방어자 선정 함수
def find_potab():
    potabs = []

    for r in range(row):
        for c in range(col):
            if arr[r][c] > 0:
                potabs.append((arr[r][c], prev_shoot[r][c], r, c))

    potabs.sort(key = lambda x: (x[0], -x[1], -(x[3] + x[2]), -x[3]))
    # 결국 sorting???? 어휴 진짜

    weak = (potabs[0][2], potabs[0][3])
    strong = (potabs[-1][2], potabs[-1][3])
    return weak, strong


direction = {1: (0, 1), 2: (1, 0), 3: (0, -1), 4: (-1, 0)}

def laser(sr, sc, gr, gc):
    # 둥기둥기 bfs, 경로 다 들어있다
    v[sr][sc] = 0
    q = deque()
    q.append((sr, sc, {(sr, sc)}))
    while q:
        r, c, old_set = q.popleft()
        if (r, c) == (gr, gc):
            return old_set # 우선 순위별 탐색이므로 가장 빨리 도착하는 게 사전순으로도 빠름

        for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0)):
            # 아이고,,, 벽은 못 감
            nr, nc = (r + dr) % row, (c + dc) % col
            if v[nr][nc] == -1 and arr[nr][nc] > 0:
                new_set = set(old_set) # set 복사하려면 생성자 안에 넣기
                new_set.add((nr, nc))
                q.append((nr, nc, new_set))
                v[nr][nc] = v[r][c] + 1

    return {(sr, sc)}

# 2. 포탄 공격 -  방위 탐방, 이건 금방
def bomb(gr, gc):
    arr[gr][gc] -= hit_power
    influenced.add((gr, gc)) # 위에서 시작점은 더해져서 오게 됨

    for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0),
                   (1, 1), (-1, -1), (1, -1), (-1, 1)):
        nr, nc = (gr + dr) % row, (gc + dc) % col
        if (nr, nc) != (sr, sc):  # 공격한 쪽은 피해 없음!!!
            if arr[nr][nc] > 0:
                arr[nr][nc] -= half_hit
                influenced.add((nr, nc))


# 입력
row, col, time = map(int, input().split())
arr = [list(map(int, input().split())) for _ in range(row)]

# 최근에 한 공격 배열 - 공격한 애만 바꾸기
prev_shoot = [[0] * col for _ in range(row)]

for now_time in range(1, 1 + time):
    weak, strong = find_potab()
    # print("weak, strong", weak, strong)
    if weak == strong:
        break

    # 공격 배열 추가
    sr, sc = weak[0], weak[1]
    gr, gc = strong[0], strong[1]

    prev_shoot[sr][sc] = now_time


    # 레이저 공격 용
    influenced = set()
    # 영향 받은 애들 저장

    v = [[-1] * col for _ in range(row)]
    influenced = laser(sr, sc, gr, gc)

    # 공격력
    hit_power = arr[sr][sc] + row + col
    arr[sr][sc] = hit_power
    # print(hit_power)
    half_hit = hit_power // 2

    if len(influenced) > 1:
        for lr, lc in influenced:
            if (lr, lc) == (gr, gc):
                arr[lr][lc] -= hit_power
            elif (lr, lc) != (sr, sc) and (lr, lc) != (gr, gc):
                arr[lr][lc] -= half_hit

    else:  # 안되면 포탄 공격
        bomb(gr, gc)

    for i in range(row):
        for j in range(col):
            if arr[i][j] < 0:
                arr[i][j] = 0
            if (i, j) not in influenced and arr[i][j] > 0:
                arr[i][j] += 1

# 답
ans = 0
for rr in arr:
    # print(rr)
    loc_ans = max(rr)
    ans = max(loc_ans, ans)

print(ans)
```

백트래킹 해서 실패한 코드
```python
# C 포탑 부수기

from collections import deque

def pick():
    towers = []
    for r in range(row):
        for c in range(col):
            if arr[r][c] > 0:
                power = arr[r][c]
                last_attack = recent[r][c]
                towers.append((power, last_attack, r, c))

    if len(towers) > 1: # 타워 하나면 시뮬레이션 끝
        towers.sort(key=lambda x: (x[0], -x[1], -(x[2] + x[3]), -x[3]))

        attack = (towers[0][2], towers[0][3])
        # recent 갱신
        recent[attack[0]][attack[1]] = nowtime
        # 핸디캡 적용으로 강해짐
        arr[attack[0]][attack[1]] += (row+col)

        defence = (towers[-1][2], towers[-1][3])

        return attack, defence
    else:
        return -100, -100 # 이거 체크리스트에 있었던 것, 엣지케이스 처리

# 2. 레이저 공격
def laser(attack, defence):
    sr, sc = attack
    gr, gc = defence
    v = [[(-1, -1)] * col for _ in range(row)]
    v[sr][sc] = (0, 0)
    q = deque()
    q.append((sr, sc))
    while q:
        r, c = q.popleft()
        if (r, c) == (gr, gc):
            break

        for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0)):
            # 우선순위 주의! 우하좌상
            nr, nc = (r + dr) % row, (c + dc) % col
            if v[nr][nc] == (-1, -1) and arr[nr][nc] > 0:
                v[nr][nc] = (dr, dc)
                q.append((nr, nc))

    # 역추적 해보자
    if v[gr][gc] == (-1, -1): # 도착 못 한 경우
        return set()
    else:
        affected = {(gr, gc)}
        cr, cc = gr, gc
        while True:
            # 역으로 가니까 빼줘야지
            nxtr, nxtc = (cr - v[cr][cc][0]) % row, (cc - v[cr][cc][1]) % col
            if (nxtr, nxtc) == (sr, sc):
                affected.add((sr, sc))
                break
            else:
                cr, cc = nxtr, nxtc
                affected.add((cr, cc))

        return affected

# 3. 폭탄이어라
def bomb(attack, defence):
    er, ec = defence
    affected = {attack, defence}
    for dr, dc in ((0, 1), (1, 0), (0, -1), (-1, 0),
                   (1, 1), (-1, -1), (-1, 1), (1, -1)):
        nr, nc = (er + dr) % row, (ec + dc) % col
        if arr[nr][nc] > 0:
            affected.add((nr, nc))
    return affected

# 4. 힘 까기, 남은 애들 올려주기
def rebalance(affected, attack, defence):
    sr, sc = attack
    full = arr[sr][sc]
    half = arr[sr][sc] // 2
    for r in range(row):
        for c in range(col):
            if (r, c) in affected:
                if (r, c) == attack:
                    pass
                elif (r, c) == defence:
                    arr[r][c] -= full
                else:
                    arr[r][c] -= half
            else:
                if arr[r][c] > 0:
                    arr[r][c] += 1

# 5. 답!
def get_ans():
    ans = 0
    for rr in arr:
        ans = max(ans, max(rr))
    return ans


# 입력
row, col, times = map(int, input().split())
arr = [list(map(int, input().split())) for _ in range(row)]
recent = [[0] * col for _ in range(row)]

for nowtime in range(1, 1+times):
    # 1. 공격자, 수비자 선정
    attack, defence = pick()
    if attack == -100:
        break
    else:
        # 2. 레이저 공격
        l_affected = laser(attack, defence)
        if l_affected:
            rebalance(l_affected, attack, defence)

        else:
            # 3. 폭탄 공격
            b_affected = bomb(attack, defence)
            rebalance(b_affected, attack, defence)

print(get_ans())

# v 배열도 만들고 있는데? - 백트하면 4**100;;; 제발
```
