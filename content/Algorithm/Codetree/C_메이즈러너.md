---
algorithm: [시뮬레이션, 완전탐색]
data_structure: [2차원 배열, 3차원 배열]
technique: [배열 회전, 슬라이싱]
---

### 걸린 시간: 총 57분 (39분 + 18분, 구상 3분) (실패 횟수: -)

### 실패 / 성공 이유
- [회전] slice가 아니라 원본을 돌려버림
- [조건] 이전 풀이: 범위·미방문 조건을 아래에서 처리해 틀림
- [복사] 3차원 리스트 슬라이싱은 shallow copy

### 코드 개선 방법
- [자료구조] N이 작으니 dict 대신 arr 완탐. 사람 수와 출구를 한 칸에 (출구 = -11, -11 < sm < 0)
- [정사각형] 큰 쪽 좌표에서 한 변 길이를 빼서 시작점. 음수면 0
- [차원] 3차원 대신 차원을 낮추기

### 코드
```python
# C 메이즈 러너 2차

# 함수
def is_range(r, c):
    return 0 <= r < size and 0 <= c < size


# 1. 참가자 이동 - 이동 겹쳐도 합치면 그만이야
def move(er, ec):
    global dist_sm
    new_arr = [[0] * size for _ in range(size)]
    for r in range(size):
        for c in range(size):
            if p_arr[r][c] > 0:  # 10 * 10이니까 기냉 돌려버려도
                dist = abs(er - r) + abs(ec - c)
                for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    nr, nc = r + dr, c + dc
                    if is_range(nr, nc) and walls[nr][nc] == 0:
                        # 벽 없어야만
                        new_dist = abs(er - nr) + abs(ec - nc)
                        if new_dist < dist:
                            ppl = p_arr[r][c]
                            p_arr[r][c] = 0

                            # 출구 아닐 때만 이동한 곳에 사람 표시
                            if p_arr[nr][nc] != -11:
                                new_arr[nr][nc] += ppl

                            dist_sm += ppl
                            break
    for i in range(size):
        for j in range(size):
            p_arr[i][j] += new_arr[i][j]


# 2. 회전 시킬 가장 작은 정사각형 찾기
def find():
    pr, pc = -100, -100
    length = -100
    done = 0
    for can in range(2, size + 1):  # 한 변 길이
        for sr in range(size):
            for sc in range(size):  # 시작점
                slide = [line[sc:sc + can] for line in p_arr[sr:sr + can]]
                sm = 0
                for rr in slide:
                    sm += sum(rr)

                if -11 < sm < 0:  # 사람 수 10명 이내, 출구 = -11
                    pr, pc = sr, sc
                    length = can
                    done = 1
                    break

            if done == 1:
                break
        if done == 1:
            break

    return (pr, pc), length


# 3. 자른 친구들 잘 돌리고, 출구 위치 갱신
def turn(start, length):
    global er, ec
    sr, sc = start
    w_slide = [line[sc:sc + length] for line in walls[sr:sr + length]]
    p_slide = [line[sc:sc + length] for line in p_arr[sr:sr + length]]

    for i in range(length):
        for j in range(length):
            if w_slide[i][j] > 0:
                w_slide[i][j] -= 1

    # 회전!
    w_slide = [list(line[::-1]) for line in zip(*w_slide)]
    p_slide = [list(line[::-1]) for line in zip(*p_slide)]

    for r in range(length):
        for c in range(length):
            p_arr[r + sr][c + sc] = p_slide[r][c]
            walls[r + sr][c + sc] = w_slide[r][c]
            if p_slide[r][c] == -11:
                er, ec = r + sr, c + sc


# 입력
size, p_num, times = map(int, input().split())
walls = [list(map(int, input().split())) for _ in range(size)]
p_arr = [[0] * size for _ in range(size)]

# 사람 arr에 찍어주기
for _ in range(p_num):
    r, c = map(int, input().split())
    r, c = r - 1, c - 1
    p_arr[r][c] += 1

# 출구 좌표도 사람 arr에
er, ec = map(int, input().split())
er, ec = er - 1, ec - 1
p_arr[er][ec] = -11

dist_sm = 0

# 풀이

for now_time in range(times):
    move(er, ec)
    start, length = find()
    if length != -100:
        turn(start, length)
    else:
        break

print(dist_sm)
print(er + 1, ec + 1)


from collections import deque


def is_range(r, c):
    return 0 <= r < size and 0 <= c < size


# 2. 각 위치에서 이동하는 함수
def move():
    global total_move
    cnt = 0
    for idx in range(1, 1 + ppl_num):
        if ppl_move[idx][1] == 0:
            r, c = ppl_loc[idx]
            now = abs(er-r) + abs(ec-c)
            pr, pc = -100, -100
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상 하 우선
                nr, nc = r + dr, c + dc
                if is_range(nr, nc) and arr[nr][nc] == 0: # 여기서 막았어야ㅠ
                    nxt = abs(er-nr) + abs(ec-nc)
                    if now > nxt:
                        pr, pc = nr, nc
                        break

            # nr, nc 갱신
            if (pr, pc) != (-100, -100):
                ppl_loc[idx] = (pr, pc)
                ppl_move[idx][0] += 1

        else:
            cnt += 1

    return cnt

def go_out():
    for idx in range(1, 1 + ppl_num):
        if ppl_loc[idx] == (er, ec) and ppl_move[idx][1] == 0:
            ppl_move[idx][1] = 1


# 3. visual 함수 갱신
def visual():
    visual = [[[] for _ in range(size)] for _ in range(size)]
    # 출구도 표시
    visual[er][ec].append(-1)
    # 사람 표시
    for idx in range(1, 1 + ppl_num):
        if ppl_move[idx][1] == 0:
            r, c = ppl_loc[idx]
            visual[r][c].append(idx)

    return visual


def search(array):
    # 3차원임에 주의
    for i in range(2, size):
        for r in range(size - i + 1):
            for c in range(size - i + 1):  # 시작점 정하기
                ex = 0
                human = 0

                for inner_r in range(i):
                    for inner_c in range(i):
                        if array[r + inner_r][c + inner_c]:
                            for ppl in array[r + inner_r][c + inner_c]:  # 6중 for???? ;;
                                if ppl == -1:
                                    ex = 1

                                elif ppl_move[ppl][1] == 0:  # 살아있다면
                                    human = 1

                        if ex == 1 and human == 1:
                            slice = [[dot[:] for dot in line[c:c + i]] for line in array[r:r + i]]
                            return slice, i, r, c
    return -1, -1, -1, -1


# 5. 지도 슬라이싱 및 벽 내구도 깎기
def map_slice(length, row, col):
    m_slice = [line[col:col + length] for line in arr[row:row + length]]
    for i in range(length):
        for j in range(length):
            if m_slice[i][j] > 0:
                m_slice[i][j] -= 1

    return m_slice


# 6. 함수 회전
def turn90(slice):
    return [list(line[::-1]) for line in zip(*slice)]


# 입력
size, ppl_num, time = map(int, input().split())
arr = [list(map(int, input().split())) for _ in range(size)]

# 참가자, 출구
ppl_loc = {}
ppl_move = {}  # 이동 거리, 탈출 여부
for idx in range(1, 1 + ppl_num):
    r, c = map(int, input().split())
    ppl_loc[idx] = (r - 1, c - 1)
    ppl_move[idx] = [0, 0]

er, ec = map(int, input().split())
er, ec = er - 1, ec - 1

for now_time in range(time):

    # 사람 이동
    dead = move()
    if dead == ppl_num:
        break

    # 탈출 처리
    go_out()
    # 3차원 사람과 출구 있는 비주얼
    v = visual()

    # 슬라이싱
    ppl_slice, length, row, col, = search(v)
    if ppl_slice != -1:
        m_slice = map_slice(length, row, col)

        # 90도 회전
        ppl_slice = turn90(ppl_slice)
        m_slice = turn90(m_slice)

        # 재대입, 위치 갱신
        for re_r in range(length):
            for re_c in range(length):
                v[row + re_r][col + re_c] = ppl_slice[re_r][re_c]
                arr[row + re_r][col + re_c] = m_slice[re_r][re_c]

                # 사람 / 출구 재대입
                if ppl_slice[re_r][re_c]:
                    for index in ppl_slice[re_r][re_c]:
                        if index == -1:
                            er, ec = row + re_r, col + re_c
                        else:
                            ppl_loc[index] = row + re_r, col + re_c

    #print(ppl_move)


# 정답
sm = 0
for i in range(1, 1+ppl_num):
    sm += ppl_move[i][0]
print(sm)
print(er+1, ec+1)


# 1. 시간마다 출구에서 bfs 돌리기

# 4. 회전 후 해당 좌표는 map에서 -1씩

from collections import deque
# 함수
def is_range(r, c):
    return 0 <= r < size and 0 <= c < size

# 2. 각 위치에서 이동하는 함수
def move():
    global total_move
    cnt = 0
    for idx in range(1, 1 + ppl_num):
        if ppl_move[idx][1] == 0:
            r, c = ppl_loc[idx]
            now = abs(er-r) + abs(ec-c)
            pr, pc = -100, -100
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):  # 상 하 우선
                nr, nc = r + dr, c + dc
                if is_range(nr, nc) and arr[nr][nc] == 0: # 여기서 막았어야ㅠ
                    nxt = abs(er-nr) + abs(ec-nc)
                    if now > nxt:
                        pr, pc = nr, nc
                        break

            # nr, nc 갱신
            if (pr, pc) != (-100, -100):
                ppl_loc[idx] = (pr, pc)
                ppl_move[idx][0] += 1

        else:
            cnt += 1

    return cnt

def go_out():
    for idx in range(1, 1 + ppl_num):
        if ppl_loc[idx] == (er, ec) and ppl_move[idx][1] == 0:
            ppl_move[idx][1] = 1

# 회전 함수
def turn():
    global exit_r, exit_c
    pr, pc = 10000, 10000
    # mn_bfs = 10000 # 이게 출구에서 떨어진 만큼의 택시거리
    mn_diff = 10000 # 이게 한 변 길이
    for i in range(ppl_num):

        if ppl_dist[i][1] == 0:  # 도착 안 했으면
            r, c = ppl_loc[i]
            if (r, c) == (pr, pc):
                continue

            now_diff = max(abs(exit_r - r), abs(exit_c - c))

            if mn_diff >= now_diff:
                if mn_diff > now_diff:
                    pr, pc = r, c

                    mn_diff = now_diff

                else:
                    # 3. 좌표가 빠르면,,,
                    if r < pr:
                        pr, pc = r, c

                    elif r == pr and c < pc:
                        pr, pc = r, c

    if pr == pc == 10000:
        # 갱신 안 됨 - 모든 사람이 다 도착;
        return -1

    else:
        mxr, mxc = max(exit_r, pr), max(exit_c, pc)
        sr, sc = mxr - mn_diff, mxc - mn_diff

        if sr < 0:
            sr = 0

        if sc < 0:
            sc = 0

        # 슬라이싱은 mn_diff+1로 해야함
        seg = [line[sc: sc + mn_diff + 1] for line in arr[sr: sr + mn_diff + 1]]
        v_seg = [[inner[:] for inner in line[sc: sc + mn_diff + 1]] for line in visual[sr: sr + mn_diff + 1]]
        # for, lst comp 쓰면 복사가 되기는 함

        # segment 안의 벽은 각 -1씩
        for i in range(mn_diff+1):
            for j in range(mn_diff+1):
                if seg[i][j] > 0:
                    seg[i][j] -= 1

        # 90도 회전
        seg = [line[::-1] for line in zip(*seg)]
        # 이 때 사람도 같이 돌아가야 함!!! ;;

        v_seg = [[inner[:] for inner in line[::-1]] for line in zip(*v_seg)]

        # visual의 일부인 v_seg에서 위치 뽑아서 사람 위치도 바꿔줌
        for vr in range(mn_diff + 1):
            for vc in range(mn_diff + 1):
                if v_seg[vr][vc]:
                    for ppl_idx in v_seg[vr][vc]:
                        if ppl_idx > -1:
                            ppl_loc[ppl_idx] = [sr + vr, sc + vc]
                        else: # -1은 출구 좌표
                            exit_r, exit_c = sr + vr, sc + vc


        # 지도 (arr) 재대입
        for rr in range(mn_diff + 1):
            for cc in range(mn_diff + 1):
                arr[sr + rr][sc + cc] = seg[rr][cc]

        return 1

# 입력
size, ppl_num, time = map(int, input().split())
arr = [list(map(int, input().split())) for _ in range(size)]

# 사람 위치
ppl_loc = {}
# 사람 이동 거리와 완료 여부
ppl_dist = {}
for idx in range(ppl_num):
    r, c = map(int, input().split())
    ppl_loc[idx] = [r-1, c-1]
    ppl_dist[idx] = [0, 0]

# 출구!
exit_r, exit_c = map(int, input().split())
exit_r, exit_c = exit_r-1, exit_c-1 # 1 인덱스
# 사람도 시각화
visual = [[[] for _ in range(size)] for _ in range(size)]

# 풀이
for now_time in range(1, 1+time):
    lookup = bfs(exit_r, exit_c)  # 어느 방향으로 갈 지에 대한 이정표만 됨
    # 출구 위치가 계속 변하니까!

    for i in range(ppl_num):
        if ppl_dist[i][1] == 0: # 도착 안 했으면
            r, c = ppl_loc[i]
            move(r, c, i)

    # 사람도 시각화
    visual = [[[] for _ in range(size)] for _ in range(size)]
    visual[exit_r][exit_c].append(-1)

    for j in range(ppl_num):
        vr, vc = ppl_loc[j]
        visual[vr][vc].append(j)

    result = turn()

    if result == -1:
        break

# 정답
full_dist = 0
for i in range(ppl_num):
    full_dist += ppl_dist[i][0]

print(full_dist)
print(exit_r+1, exit_c+1) # 1 인덱스


```
