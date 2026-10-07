---
algorithm: [시뮬레이션]
data_structure: [3차원 배열, 2차원 배열, 리스트]
technique: []
---

### 걸린 시간: W9: 1시간 (구상 2분, 구현 38분, 디버깅 20분) / W10: 풀이 1시간 38분, 디버깅 2시간 반 (실패 횟수: -)

### 실패 / 성공 이유
- [변수 오염] 방향을 d에 바로 누적해 delta가 2중으로 더해짐 (0, 1, 3, 6...). 머릿속으로만 맞다고 컨펌
- [초기화] 초기 arr에 위치를 안 찍어 첫 턴에 덮어씌워짐
- [갱신] 진 사람이 도망칠 때 nd 갱신 누락
- [문제 읽기] 총 줍기 설명이 단계마다 달라 보여 함수를 다시 짬

### 코드 개선 방법
- [변수] nd처럼 새 변수로 분리. (d + i) % 4
- [검증] 눈으로 맞다 말고 tc를 만들어 찍어보기
- [순서] 진 쪽이 총 내려놓고 이동 → 이긴 쪽이 총 교체

### 코드
`W9/C_싸움땅.py`

```python
# C 싸움땅 2차

# 함수
direction = {0: (-1, 0), 1: (0, 1), 2: (1, 0), 3: (0, -1)}
reverse = {0: 2, 1: 3, 2: 0, 3: 1}
# 상 우 하 좌

def is_range(r, c):
    return 0 <= r < size and 0 <= c < size

# 1. 총 줍는 함수
def gun(r, c, idx):
    old_gun = p_info[idx][2]
    if guns[r][c]:
        guns[r][c].sort()
        mx = guns[r][c][-1]
        if mx > old_gun:
            p_info[idx][2] = mx
            guns[r][c].pop()
            if old_gun > 0:
                guns[r][c].append(old_gun)

# 2. 플레이어 이동 함수
def move(idx):
    r, c = p_loc[idx]
    d = p_info[idx][0]
    dr, dc = direction[d]
    nr, nc = r + dr, c + dc
    if not is_range(nr, nc):
        d = reverse[d]
        dr, dc = direction[d]
        nr, nc = r + dr, c + dc

    p_arr[r][c] = 0
    p_loc[idx] = (nr, nc)
    p_info[idx][0] = d

    # 충돌 여부!
    if p_arr[nr][nc] > 0:
        return (p_arr[nr][nc], idx)
    else:
        p_arr[nr][nc] = idx
        gun(nr, nc, idx)
        return (-100, -100)



# 2. 싸워서 승자 패자 가르는 함수
def fight(tpl):
    p1, p2 = tpl
    r, c = p_loc[p1]
    _, pow1, gun1 = p_info[p1]
    _, pow2, gun2 = p_info[p2]

    power1 = pow1 + gun1
    power2 = pow2 + gun2

    # 승패
    win, lose = 0, 0
    if power1 > power2:
        win = p1
    elif power1 == power2:
        if pow1 > pow2:
            win = p1
        else:
            win = p2
    else:
        win = p2

    if win == p1:
        lose = p2
    else:
        # 새로 온 애가 이겼다!
        p_arr[r][c] = p2
        lose = p1

    # 승점 쌓기
    ans[win] += abs(power1 - power2)

    # 진 애는 총 내려놓기
    put_down = p_info[lose][2]
    if put_down > 0:
        guns[r][c].append(put_down)
    p_info[lose][2] = 0

    # 이긴 애는 총 잡기
    gun(r, c, win)

    return lose

# 3. 패자 처리
def loser(idx):
    r, c = p_loc[idx]
    d, _, _ = p_info[idx]

    pr, pc = -100, -100
    for diff in range(4):
        nd = (d+diff) % 4
        dr, dc = direction[nd]
        nr, nc = r + dr, c + dc
        if is_range(nr, nc) and p_arr[nr][nc] == 0:
            p_arr[nr][nc] = idx
            p_info[idx][0] = nd
            p_loc[idx] = (nr, nc)
            pr, pc = nr, nc
            break

    gun(pr, pc, lose)


# 입력
size, p_num, time = map(int, input().split())

# 총 입력
guns = [[[] for _ in range(size)] for _ in range(size)]

for i in range(size):
    line = list(map(int, input().split()))
    for j in range(size):
        if line[j] > 0:
            guns[i][j].append(line[j])

# 사람 입력 - 1 인덱스
p_loc = {}
p_info = {}
p_arr = [[0] * size for _ in range(size)]

for idx in range(1, 1+p_num):
    r, c, d, s = map(int, input().split())
    r, c = r-1, c-1
    p_loc[idx] = (r, c)
    p_info[idx] = [d, s, 0]
    p_arr[r][c] = idx # 초기화로 이미 찍고 가야 했음!

# 풀이
ans = [0] * (p_num + 1)
for now_time in range(1, 1+time):
    for i in range(1, 1+p_num):
        tpl = move(i)
        if tpl != (-100, -100):
            lose = fight(tpl)
            loser(lose)

print(*ans[1:])

# C 싸움땅
direction = {0: (-1, 0), 1: (0, 1), 2: (1, 0), 3: (0, -1)}
reverse = {0: 2, 1: 3, 2: 0, 3: 1}

def is_range(r, c):
    return 0 <= r < size and 0 <= c < size

# 이동 함수 - 3중 어레이만 갱신, 나가서 총 바꾸자
def move(idx, r, c, d, power, now_gun):
    # 들어 오자 마자 현재 위치 지우기
    players[r][c] = 0

    dr, dc = direction[d]
    nr, nc = r + dr, c + dc

    winner = -1
    loser = -1

    if not is_range(nr, nc):

        d = reverse[d]
        # 방향 갱신
        info[idx][0] = d
        dr, dc = direction[d]
        nr, nc = r + dr, c + dc

    if players[nr][nc]:

        op = players[nr][nc]
        # 싸우고,  누구 쫓아낼 지
        _, op_power, op_gun = info[op]

        points = (power + now_gun) - (op_power + op_gun)
        if points > 0:
            winner = idx
            loser = op

        elif points == 0:
            if power > op_power:
                winner = idx
                loser = op
            else:
                winner = op
                loser = idx
        else:
            winner = op
            loser = idx

        if winner == idx:
            # 패자 총 내려놓기
            down_gun = info[loser][2]
            guns[nr][nc].append(down_gun)
            info[loser][2] = 0

            # 격자 갱신
            players[nr][nc] = idx
            players_loc[idx] = (nr, nc)  # 이거 갱신

            # 총 잡고 싸워야 함
            if guns[nr][nc]:
                guns[nr][nc].sort()
                biggest = guns[nr][nc][-1]
                if biggest > now_gun:  # 총 바꾸기
                    guns[nr][nc].pop()
                    if now_gun > 0:
                        guns[nr][nc].append(now_gun)
                    info[idx][2] = biggest

        # 포인트 추가요
        point[winner-1] += abs(points)

    else:
        # 총 잡고 싸워야 함
        if guns[nr][nc]:
            guns[nr][nc].sort()
            biggest = guns[nr][nc][-1]
            if biggest > now_gun:  # 총 바꾸기
                guns[nr][nc].pop()
                if now_gun > 0:
                    guns[nr][nc].append(now_gun)
                info[idx][2] = biggest

        players[nr][nc] = idx
        players_loc[idx] = (nr, nc) # 이거 갱신

    return winner, loser, nr, nc

# 진 자
def loser_move(r, c, idx):
    # 움직이고 총 뽑까지
    d = info[idx][0]
    nr, nc = 0, 0
    for i in range(4):
        d = (d+i)%4

        dr, dc = direction[d]
        nr, nc = r + dr, c + dc
        if is_range(nr, nc) and players[nr][nc] == 0:
            players[nr][nc] = idx
            players_loc[idx] = (nr, nc)  # 이거 갱신
            # 방향도 갱신 해야겠지
            info[idx][0] = d
            break

    if guns[nr][nc]:
        guns[nr][nc].sort()
        biggest = guns[nr][nc][-1]
        if biggest > now_gun:  # 총 바꾸기
            guns[nr][nc].pop()
            if now_gun > 0:
                guns[nr][nc].append(now_gun)
            info[idx][2] = biggest

# 입력
size, player_num, rounds = map(int, input().split())

# 총 입력
guns = [[[] for _ in range(size)] for _ in range(size)]
for i in range(size):
    lines = list(map(int, input().split()))
    for j in range(size):
        if lines[j] > 0:
            guns[i][j].append(lines[j])

# 사람 입력
players = [[0] * size for _ in range(size)]
info = {}
players_loc = {}
point = [0] * (player_num)

for idx in range(player_num):
    r, c, d, power = map(int, input().split())
    r, c = r-1, c-1
    players[r][c] = (idx+1)
    players_loc[idx+1] = (r, c)
    info[idx+1] = [d, power, 0]

for now_time in range(rounds):
    # players_loc 순회하면서 움직여야 하는 것
    for i in range(1, 1+player_num):
        r, c = players_loc[i]
        d, power, now_gun = info[i]

        winner, loser, nr, nc = move(i, r, c, d, power, now_gun)
        if loser != -1:
            loser_move(nr, nc, loser)

    print("players")
    for rr in players:
        print(rr)

    print("guns")
    for rr in guns:
        print(rr)

    print(info)

print(*point)
```

`W10/C_싸움땅.py`

```python
# 함수
def is_range(r, c):
    return 0 <= r < size and 0 <= c < size

# 1. 기본 이동 로직
def move(idx):
    r, c = p_loc[idx]
    d = p_data[idx][0]

    # 원래 자리 비우기
    p_arr[r][c] = 0

    dr, dc = direction[d]
    nr, nc = r + dr, c + dc
    if not is_range(nr, nc):
        d = reverse[d]
        p_data[idx][0] = d
        dr, dc = direction[d]
        nr, nc = r + dr, c + dc

    p_loc[idx] = [nr, nc]

    # 사람 있는지만 체크
    if p_arr[nr][nc] > 0:
        return (p_arr[nr][nc], idx)
    else:
        p_arr[nr][nc] = idx # 사람 없을때만 자리 채움
        return -1

# 2. 총 로직

# 여기는 최대 큰 거라고 되어있는데
def gun_change(sr, sc, idx):
    now_gun = p_data[idx][2]

    if guns[sr][sc]:

        guns[sr][sc].sort()
        mx_gun = guns[sr][sc][-1]

        if mx_gun > now_gun:
            p_data[idx][2] = mx_gun
            guns[sr][sc].pop()

            if now_gun > 0:
                guns[sr][sc].append(now_gun)


# 3. 싸우는 로직
def fight(idx1, idx2):
    # 현재 arr에는 먼저 도착한 친구가 들어있음

    r, c = p_loc[idx1]

    sm1, power1 = (p_data[idx1][1] + p_data[idx1][2]), p_data[idx1][1]
    sm2, power2 = (p_data[idx2][1] + p_data[idx2][2]), p_data[idx2][1]

    win = -100
    lose = -100

    if sm1 > sm2:
        win = idx1
    else:
        if sm1 == sm2:
            if power1 > power2:
                win = idx1
            else:
                win = idx2
        else:
            win = idx2

    if win == idx1:
        lose = idx2
    else:
        lose = idx1

    # 포인트 적립
    points[win] += abs(sm1-sm2)

    # 진 애 총 내려놓고
    put_down = p_data[lose][2]
    p_data[lose][2] = 0
    if put_down > 0:
        guns[r][c].append(put_down)

    # 이긴 애 맞춰 arr 갱신
    if win == idx2:
        p_arr[r][c] = idx2

    return lose, win

# 4. 진 애 처리 로직
def loser(idx):
    # 좌표, arr 모두 바꿔줘야
    r, c = p_loc[idx]
    d = p_data[idx][0]

    pr, pc = -100, -100
    cnt = 0
    for turn in range(4):
        nd = (d + turn) % 4 # 시계방향 90
        dr, dc = direction[nd]
        nr, nc = r + dr, c + dc
        cnt += 1

        if now_time == 0 and idx == 6:
            print(nd)

        if is_range(nr, nc) and p_arr[nr][nc] == 0:
            p_loc[idx] = [nr, nc]
            p_data[idx][0] = nd
            p_arr[nr][nc] = idx
            pr, pc = nr, nc
            break
    print("-----")

    return pr, pc


# 입력
size, p_num, time = map(int, input().split())
guns = [[[] for _ in range(size)] for _ in range(size)]

# 총 입력
for i in range(size):
    line = list(map(int, input().split()))
    for j in range(size):
        if line[j] > 0:
            guns[i][j].append(line[j])

# 사람 입력
p_loc = {}
p_data = {} # 방향, 본인 능력, 총
p_arr = [[0] * size for _ in range(size)]

points = [0] * (p_num + 1)

# 방향
direction = {0: (-1, 0), 1: (0, 1), 2: (1, 0), 3: (0, -1)}
reverse = {0: 2, 1: 3, 2: 0, 3: 1}
# 상 우 하 좌, 시계 방향

for idx in range(1, 1 + p_num):
    r, c, d, s = map(int, input().split())
    r, c = r-1, c-1
    p_loc[idx] = [r, c]
    p_arr[r][c] = idx
    p_data[idx] = [d, s, 0]


# 풀이
for rr in p_arr:
    print(rr)

print("rrr")
for now_time in range(time):
    for i in range(1, 1 + p_num):
        clash = move(i)
        if clash == -1:
            sr, sc = p_loc[i]
            gun_change(sr, sc, i)

        else:
            idx1, idx2 = clash
            lose, win = fight(idx1, idx2)

            nr, nc = loser(lose)
            gun_change(nr, nc, lose)

            wr, wc = p_loc[win]
            gun_change(wr, wc, win)

    for rr in p_arr:
        print(rr)
print(*points[1:])

for rr in p_arr:
    print(rr)
```
