---
algorithm: [시뮬레이션, BFS]
data_structure: [2차원 배열, 덱, dict, set]
technique: []
---

### 걸린 시간: 3트 1시간 10분 후 정지 (2:34 - 3:44) (실패 횟수: 3)

### 실패 / 성공 이유
- [연쇄 작용] 밀릴 때 끝에서부터 밀어야 하는데 앞에서부터 밀어 덮어씀
- [연쇄 작용] 산타가 연속으로 있어야 밀림. 중간에 빈 칸이 있으면 거기서 멈춤
- [충돌] 루돌프 턴·산타 턴 모두 충돌 가능. 부딪히자마자 처리해야 하는데 다 움직인 뒤 처리
- [우선순위] 산타는 상우하좌 순, 가까워질 때만 이동
- [방향] 루돌프는 8방. 거리 공식 때문에 대각선과 상우하좌 값이 달라짐

### 코드 개선 방법
- [자료구조] arr는 산타만 관리. dict로는 충돌 관리가 어려움
- [자료구조] 산타 상태(기절·탈락·생존)는 set으로
- [문제 읽기] 문제를 관조적으로 3번 읽기

### 코드

```python
from collections import deque

def is_range(r, c):
    return 0 <= r < size and 0 <= c < size

# 1. 가장 가까운 산타 찾기
def find_santa(sr, sc):
    pos = []
    v = [[-1] * size for _ in range(size)]
    v[sr][sc] = 0
    q = deque()
    q.append((sr, sc))
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc):
                q.append((nr, nc))
                v[nr][nc] = pow((nr-sr), 2) +


# 사슴 위치
d_r, d_c = map(int, input().split())
d_r, d_c = d_r - 1, d_c - 1

# 산타 위치
s_loc = {}
for _ in range(s_num):
    idx, sr, sc = map(int, input().split())
    sr, sc = sr-1, sc-1
    s_loc[idx] = (sr, sc)

from collections import deque

def is_range(r, c):
    return 0 <= r < size and 0 <= c < size

# 0. 산타 찾기
def find_santa(sr, sc):
    v = [[-1] * size for _ in range(size)]
    v[sr][sc] = 0
    q = deque()
    q.append((sr, sc))
    v_mn = 10**18
    pr, pc = -100, -100
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == -1:
                v[nr][nc] = (sr-nr)**2 + (sc-nc)**2
                q.append((nr, nc))

                if s_arr[nr][nc] > 0:
                    if v[nr][nc] <= v_mn:
                        if v[nr][nc] < v_mn:
                            v_mn = v[nr][nc]
                            pr, pc = nr, nc
                        else:
                            if nr > pr:
                                pr, pc = nr, nc
                            elif nr == pr and nc > pc:
                                pr, pc = nr, nc

    return pr, pc

# 1. 사슴 움직임
direction = {0: (-1, 0), 1: (0, 1), 2: (1, 0), 3: (0, -1),
             4: (-1, -1), 5: (1, 1), 6: (-1, 1), 7: (1, -1)}
def deer_move(sar, sac, der, dec):
    pdr, pdc = der, dec
    pd = 8
    mn_dist = 10**18
    for d in range(8):
        dr, dc = direction[d]
        nr, nc = der + dr, dec + dc
        if is_range(nr, nc):
            dist = (sar-nr)**2 + (sac-nc)**2
            if dist < mn_dist: # 공식 때문에 무조건 대각선 / 상우하좌값이 달라짐
                mn_dist = dist
                pd = d
                pdr, pdc = nr, nc

    d_arr[der][dec] = 0
    d_arr[pdr][pdc] = 1

    if s_arr[pdr][pdc] > 0:
        return pdr, pdc, pd, 1
    else:
        return pdr, pdc, pd, 0

# 2. 산타 움직임
def santa_move(idx):
    # 기절 / 사망 아니면
    r, c = s_loc[idx]
    pd = 8
    pdr, pdc = r, c
    mn_dist = (der-r)**2 + (dec-c)**2
    # 내 위치에서 이동이 가능한지
    for d in range(4):
        dr, dc = direction[d]
        nr, nc = r + dr, c + dc

        if is_range(nr, nc) and s_arr[nr][nc] == 0:
            # 다른 산타나 판 밖으로는 금지
            dist = (der-nr)**2 + (dec-nc)**2
            if dist < mn_dist: # 현 위치에서 가까워져야만 갱신

                mn_dist = dist
                pdr, pdc = nr, nc
                pd = d

    s_arr[r][c] = 0
    s_loc[idx] = [pdr, pdc]
    s_arr[pdr][pdc] = idx

    if d_arr[pdr][pdc] > 0:
        return pdr, pdc, pd, 1
    else:
        return pdr, pdc, pd, 0

# 3. 충돌
def clash(r, c, d, t):
    # 루돌프 == 1, 산타 == 2
    if t == 1:
        idx = s_arr[r][c]
        s_arr[r][c] = 0
        s_live[idx][0] += d_power
        dr, dc = direction[d]
        nr, nc = r + (dr * d_power), c + (dc * d_power)

        if not is_range(nr, nc):
            s_live[idx][1] = 2
            return -1, -1

        else:
            s_loc[idx] = [nr, nc]
            return nr, nc

    elif t == 2:
        print(r, c)
        idx = s_arr[r][c]
        s_arr[r][c] = 0
        s_live[idx][0] += s_power
        dr, dc = direction[d]
        nr, nc = r - (dr * s_power), c - (dc * s_power)
        # 갔던 방향 역으로

        if not is_range(nr, nc):
            s_live[idx][1] = 2
            return -1, -1
        else:
            s_loc[idx] = [nr, nc]
            return nr, nc

# 4. 밀려남
def push(landr, landc):
    # 도착한 자리에 누구 있으면 체크
    while True:
        sa

# 입력
size, time, s_num, d_power, s_power = map(int, input().split())
der, dec = map(int, input().split())
der, dec = der - 1, dec - 1

s_loc = {}
s_live = {}
s_arr = [[0] * size for _ in range(size)]
d_arr = [[0] * size for _ in range(size)]
d_arr[der][dec] = 1
i_lst = []

for _ in range(s_num):
    idx, r, c = map(int, input().split())
    i_lst.append(idx)
    r, c = r-1, c-1
    s_loc[idx] = [r, c]
    s_arr[r][c] = idx
    s_live[idx] = [0, 0]

i_lst.sort() # 오름차순 인덱스

for rr in s_arr:
    print(rr)
for now_time in range(time):
    pr, pc = find_santa(der, dec)
    if (pr, pc) == (-100, -100):
        break # 산타 없음
    else:
        new_der, new_dec, ded, d_crash = deer_move(pr, pc, der, dec)
        der, dec = new_der, new_dec
        if d_crash:
            clash(der, dec, ded, 1)

        for i in i_lst:
            if s_live[i][1] == 0:
                if s_live[i][1] == 0:
                    lr, lc = s_loc[i]
                    new_sr, new_sc, sad, s_crash = santa_move(i)
                    if s_crash:
                        c_sar, c_sac = clash(der, dec, sad, 2)
                        if (c_sar, c_sac) != (-1, -1):




        print(pr, pc)
        print("deer")
        for rr in d_arr:
            print(rr)
        print("santa")
        for rr in s_arr:
            print(rr)
        



from collections import deque


def is_range(r, c):
    return 0 <= r < size and 0 <= c < size


# 1. 사슴 움직이는 함수
def deer_move(sr, sc):
    global deer_loc
    # 산타 고르기
    v = [[-1] * size for _ in range(size)]
    v[sr][sc] = 0
    q = deque()
    q.append((sr, sc))
    mx_dist = 10 ** 18
    chose = []
    while q:
        r, c = q.popleft()

        if v[r][c] > mx_dist:
            break

        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == -1:
                v[nr][nc] = (sr - nr) ** 2 + (sc - nc) ** 2
                q.append((nr, nc))
                # 이 거리가 가장 가까운 친구
                if s_visual[nr][nc] > 0 and v[nr][nc] <= mx_dist:
                    mx_dist = v[nr][nc]
                    chose.append((nr, nc))

    chose.sort(key=lambda x: (-x[0], -x[1]))

    # 가장 가까운 쪽으로 가기
    mn_dist = 10 ** 18
    p_deer = []

    gr, gc = chose[0]  # 가야 할 곳
    for d in range(8):
        mr, mc = deer_d[d]
        nxtr, nxtc = sr + mr, sc + mc
        dist = (gr - nxtr) ** 2 + (gc - nxtc) ** 2
        if dist < mn_dist:
            mn_dist = dist
            p_deer = [nxtr, nxtc, d]

    # 루돌프 위치 갱신
    deer_loc = p_deer
    d_visual[sr][sc] = 0
    d_visual[p_deer[0]][p_deer[1]] = 1

    # 만약 이동한 산타 칸에 누가 있으면
    if s_visual[p_deer[0]][p_deer[1]] > 0:
        return 1
    else:
        return 0


# 2. 산타 움직이는 함수
def santa_move(sr, sc):
    # 루돌프 룩 업 만들기
    v = [[-1] * size for _ in range(size)]
    v[sr][sc] = 0
    q = deque()
    q.append((sr, sc))
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == -1:
                v[nr][nc] = (sr - nr) ** 2 + (sc - nc) ** 2
                q.append((nr, nc))

    # 모든 산타 이동
    santa_flag = 0
    for idx in range(1, 1 + santa_num):
        if santa_score[idx][1] == 1:
            santa_score[idx][1] = 0  # 기절 해제

        # elif 처리로 방지
        elif santa_score[idx][1] == 0:
            rr, cc, d = santa_loc[idx]
            now_v = v[rr][cc]
            p_jwa = []
            for sd in (1, 2, 3, 4):
                ddr, ddc = santa_d[sd]
                snr, snc = rr + ddr, cc + ddc
                if is_range(snr, snc) and s_visual[snr][snc] == 0:
                    if v[snr][snc] < now_v:
                        now_v = v[snr][snc]
                        p_jwa = [snr, snc, sd]

            if p_jwa:
                santa_loc[idx] = p_jwa
                s_visual[rr][cc] = 0
                s_visual[p_jwa[0]][p_jwa[1]] = idx

                # 만약 이동한 산타 칸에 누가 있으면
                if d_visual[p_jwa[0]][p_jwa[1]] > 0:
                    santa_flag = 1

    return santa_flag


# 3. 충돌 처리 함수
def clash(deer_flag, santa_flag):
    der, dec, ded = deer_loc
    idx = s_visual[der][dec]
    sar, sac, sad = santa_loc[idx]

    dr, dc = 0, 0

    # 일단 현 위치 지운다
    s_visual[sar][sac] = 0
    # 기절
    santa_score[idx][1] = 1

    if deer_flag:
        santa_score[idx][0] += d_power
        dr, dc = deer_d[ded]
        nr, nc = sar + (dr * d_power), sac + (dc * d_power)

    if santa_flag:
        santa_score[idx][0] += s_power
        dr, dc = santa_d[sad]
        nr, nc = sar - (dr * s_power), sac - (dc * s_power)

    return idx, nr, nc, dr, dc


# 4. 밀려남 처리
def push(idx, nr, nc, dr, dc):
    influenced = []
    stat = 0

    if not is_range(nr, nc):
        santa_score[idx][1] = 2  # 범위 밖이면 사망처리

    else:
        santa_loc[idx][0] = nr
        santa_loc[idx][1] = nc
        # 이동은 하긴 함

        if s_visual[nr][nc] == 0:
            s_visual[nr][nc] = idx
            stat = 1

        else:
            # 해당 방향으로 다 밀려난다
            stat = 2
            sr, sc = nr, nc
            influenced.append(s_visual[sr][sc])
            while True:
                stepr, stepc = sr - dr, sc - dc  # 반대방향으로 가서...?
                if is_range(stepr, stepc):
                    if s_visual[stepr][stepc] > 0:
                        influenced.append(s_visual[stepr][stepc])
                        sc, sr = stepr, stepc
                    else:
                        break  # 빈 칸 나와도 더 볼 필요가 없음
                else:
                    break

            # 정보 다 옮겼으니까 덮어씌우기
            s_visual[nr][nc] = idx

            print(influenced)

    return stat, influenced, dr, dc


# 5. 밀려남 이동 처리
def push_work(influenced, dr, dc):
    influenced.reverse()

    for idx in influenced:  # 먼 곳 부터
        r, c, d = santa_loc[idx]
        # 방향은 안 바꾸기로...
        nr, nc = r - dr, c - dc
        santa_loc[idx] = [nr, nc, d]

        if is_range(nr, nc):
            s_visual[nr][nc] = idx

        else:
            santa_score[idx][1] = 2  # 사망 처리


# 입력
size, time, santa_num, d_power, s_power = map(int, input().split())
sr, sc = map(int, input().split())
sr, sc = sr - 1, sc - 1
d_visual = [[0] * size for _ in range(size)]
s_visual = [[0] * size for _ in range(size)]

d_visual[sr][sc] = 1  # 루돌프 표시

deer_d = {1: (-1, 0), 2: (-1, 1), 3: (0, 1), 4: (1, 1),
          5: (1, 0), 6: (1, -1), 7: (0, -1), 0: (-1, -1)}
# 위 부터 시계 방향
santa_d = {1: (-1, 0), 2: (0, 1), 3: (1, 0), 4: (0, -1)}
# 상 우 하 좌 우선 순위

# 주의!!! loc에다가 방향까지 저장
deer_loc = [sr, sc, -1]
santa_loc = {}
santa_score = {}

for _ in range(1, 1 + santa_num):
    idx, r, c = map(int, input().split())
    r, c = r - 1, c - 1
    santa_loc[idx] = [r, c, -1]
    santa_score[idx] = [0, 0]
    s_visual[r][c] = idx

# 풀이
for now_time in range(time):
    deer_flag = deer_move(deer_loc[0], deer_loc[1])

    santa_flag = santa_move(deer_loc[0], deer_loc[1])
    if deer_flag or santa_flag:
        nxt_santa, nxtr, nxtc, dr, dc = clash(deer_flag, santa_flag)
        stat, influenced, dr, dc = push(nxt_santa, nxtr, nxtc, dr, dc)
        if stat == 2:
            push_work(influenced, dr, dc)

    dead = 0
    for s_idx in range(1, 1 + santa_num):
        if santa_score[s_idx][1] != 2:
            santa_score[s_idx][0] += 1
        else:
            dead += 1

    if dead == santa_num:
        break

    print("flags", deer_flag, santa_flag)
    print("deer")
    for rr in d_visual:
        print(rr)

    print("santa")
    for cc in s_visual:
        print(cc)

    print(santa_score)
    print(santa_loc)

ans = []
for ans_idx in range(1, 1 + santa_num):
    ans.append(santa_score[ans_idx][0])

print(*ans)
```

`W11/C_루돌프의 반란.py`

```python
# from collections import deque

def is_range(r, c):
    return 0 <= r < size and 0 <= c < size


def find_santa(d_sr, d_sc):
    pos = []
    mn_dist = 10 ** 18
    for i in s_loc:
        if s_state[i] != 3:
            sr, sc = s_loc[i]
            dist = pow((d_sr - sr), 2) + pow((d_sc - sc), 2)
            if dist <= mn_dist:
                if dist < mn_dist:
                    mn_dist = dist
                    pos = []
                pos.append((sr, sc))
    if pos:
        pos.sort(key=lambda x: (-x[0], -x[1]))
        return pos[0]
    else:
        return (-100, -100)


# 1-2. 8방 탐색 후 이동, 충돌 여부, 방향 반환
def d_move(pick_s, d_sr, d_sc):
    bump = 0
    sr, sc = pick_s  # 산타 좌표
    pr, pc = -100, -100  # 아마 이동 못하는 경우는 X
    pdr, pdc = -100, -100
    mn_dist = 10 ** 18
    for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1),
                   (-1, -1), (-1, 1), (1, -1), (1, 1)):
        nr, nc = d_sr + dr, d_sc + dc
        if is_range(nr, nc):
            dist = pow((sr - nr), 2) + pow((sc - nc), 2)
            if dist < mn_dist:
                mn_dist = dist
                pr, pc = nr, nc
                pdr, pdc = dr, dc

    if (pr, pc) == (sr, sc):
        bump = 1  # 들이받았는지?

    return (pr, pc), (pdr, pdc), bump


# 2. 충돌 - 일단 산타 arr에서 지우고 dict에서
def clash(d_sr, d_sc, dirr, flag):
    # 충돌이 나려면 모든 경우에서 루돌프 위치만 찾으면!
    chain = 0
    dr, dc = dirr
    idx = s_arr[d_sr][d_sc]  # 인덱스 찾기

    # 스턴
    s_state[idx] = 2

    s_arr[d_sr][d_sc] = 0
    # 1. 루돌프 케이스
    if flag == 0:
        # 점수 추가
        scores[idx] += d_power

        nr, nc = d_sr + (dr * d_power), d_sc + (dc * d_power)
        s_loc[idx] = (nr, nc)
        if is_range(nr, nc):
            if s_arr[nr][nc] == 0:
                s_arr[nr][nc] = idx
            else:
                chain = 1

        else:  # 밖으로 튕김
            s_state[idx] = 3

    # 2. 산타 케이스
    elif flag == 1:
        # 점수 추가
        scores[idx] += s_power
        s_sr, s_sc = s_loc[idx]

        nr, nc = s_sr + (dr * s_power), s_sc + (dc * s_power)

        s_loc[idx] = (nr, nc)

        if is_range(nr, nc):
            if s_arr[nr][nc] == 0:
                s_arr[nr][nc] = idx
            else:
                chain = 1
        else:  # 밖으로 튕김
            s_state[idx] = 3

    return chain, idx


# 3. 산타 이동
def s_move(d_sr, d_sc, i):
    bump_idx = 0
    s_dirr = ()
    if s_state[i] == 0:  # 깨어 있어야지만 움직 가능
        pos_dirr = ()
        sr, sc = s_loc[i]

        s_dist = pow((d_sr - sr), 2) + pow((d_sc - sc), 2)

        pr, pc = sr, sc

        for dr, dc in ((-1, 0), (0, 1), (1, 0), (0, -1)):
            nr, nc = sr + dr, sc + dc
            if is_range(nr, nc) and s_arr[nr][nc] == 0:
                dist = pow((d_sr - nr), 2) + pow((d_sc - nc), 2)

                if dist < s_dist:
                    s_dist = dist
                    pr, pc = nr, nc
                    pos_dirr = (-dr, -dc)

        s_arr[sr][sc] = 0  # 일단 지우고

        s_loc[i] = (pr, pc)
        s_arr[pr][pc] = i  # 여기서 다시 표시

        if (pr, pc) == (d_sr, d_sc):
            bump_idx = i  # 한 번에 최대 하나만 부딪!
            s_dirr = pos_dirr

    return bump_idx, s_dirr


# 4. 연쇄 이동
def chain_reaction(idx, dirr):
    sr, sc = s_loc[idx]
    r, c = sr, sc
    dr, dc = dirr
    affected = [(sr, sc)]

    while is_range(r, c) and s_arr[r][c] > 0:
        nr, nc = r + dr, c + dc
        if is_range(nr, nc):
            if s_arr[nr][nc] > 0:
                affected.append((nr, nc))

        r, c = nr, nc

    # 끝에서부터 밀려야 함
    while affected:
        cr, cc = affected.pop()
        i = s_arr[cr][cc]
        s_arr[cr][cc] = 0

        # 다음 위치
        ncr, ncc = cr + dr, cc + dc
        s_loc[i] = (ncr, ncc)

        if is_range(ncr, ncc):
            s_arr[ncr][ncc] = i
        else:
            s_state[i] = 3

    # 맨 마지막에 원래 idx
    s_arr[sr][sc] = idx


# 5. 살아 있는 애들 점수 더하기
def plus_score():
    for idx in range(1, 1 + s_num):
        if s_state[idx] != 3:
            scores[idx] += 1


# 입력
size, time, s_num, d_power, s_power = map(int, input().split())
d_sr, d_sc = map(int, input().split())
d_sr, d_sc = d_sr - 1, d_sc - 1

s_loc = {}
s_arr = [[0] * size for _ in range(size)]

# 산타 상태 관리
s_state = {}

scores = [0] * (s_num + 1)

for _ in range(s_num):
    idx, r, c = map(int, input().split())
    r, c = r - 1, c - 1
    s_loc[idx] = (r, c)
    s_arr[r][c] = idx
    s_state[idx] = 0

for now_time in range(time):
    # 스턴 걸린 애들 풀어주기
    cnt = 0
    for ii in range(1, 1 + s_num):
        if 1 <= s_state[ii] <= 2:
            s_state[ii] -= 1
        if s_state[ii] == 3:
            cnt += 1

    if cnt == s_num:
        break  # 다 죽었다는 뜻

    # 1. 들이받을 산타 찾기
    pick_s = find_santa(d_sr, d_sc)

    # 2. 루돌프 이동 / 충돌 처리
    nxt_deer, d_dirr, bump = d_move(pick_s, d_sr, d_sc)
    d_sr, d_sc = nxt_deer
    if bump:
        d_chain, d_idx = clash(d_sr, d_sc, d_dirr, 0)
        # 2-1. 루돌프 충돌 연쇄
        if d_chain:
            chain_reaction(d_idx, d_dirr)

    # 3. 산타 이동 / 충돌 처리
    for s_idx in range(1, 1 + s_num):
        bump_idx, s_dirr = s_move(d_sr, d_sc, s_idx)
        if bump_idx:
            s_chain, s_index = clash(d_sr, d_sc, s_dirr, 1)

            # 3-1. 산타 충돌 연쇄 작용
            if s_chain:
                chain_reaction(s_index, s_dirr)

    # 4. 살아있는 애들 점수 더하기
    plus_score()

print(*scores[1:])
```
