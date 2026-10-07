---
algorithm: [BFS, 시뮬레이션, 정렬]
data_structure: [2차원 배열, 덱, set]
technique: [상대 좌표]
---

### 걸린 시간: 재풀이 1시간 24분 (구상 7분, 구현 1시간 15분) (실패 횟수: 1회 (처음 3시간 45분 내 실패))

### 실패 / 성공 이유
- [좌표] 점 기준 xy 좌표 + 위아래 뒤집힘 → 입력 변환에만 20분
- [접근] 슬라이싱으로 모양을 떼어 옮기려다 0 패딩이 빠져 모양이 어그러지고, 사각형 크기 구하기에 실패

### 코드 개선 방법
- [상대 좌표] 모양이 랜덤이면 bfs로 좌표를 따고 첫 칸 기준 상대 좌표로 저장. 놓을 땐 시작점만 더함
- [정렬] 면적 큰 순, 오래된 순
- [조건] 다른 그룹 인접 조건은 v 체크 전에
- [습관] 안 써본 방법이라고 두려워하지 말기

### 코드
```python
# 모양이 랜덤일 때는 좌표로
from collections import deque

def is_range(r, c):
    return 0 <= r < size and 0 <= c < size

def put(idx):
    s_jwa, sero, garo = m_loc[idx]
    sr, sc = s_jwa
    for r in range(sr, sr + sero):
        for c in range(sc, sc + garo):
            arr[r][c] = idx


def get_shape(sr, sc, idx, v):
    v[sr][sc] = 1
    q = deque()
    q.append((sr, sc))

    jwa = [(0, 0)] # 초기 좌표
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == 0:
                if arr[nr][nc] == idx:
                    q.append((nr, nc))
                    v[nr][nc] = 1
                    # 처음 기준 상대 좌표 바로 저장
                    jwa.append((nr-sr, nc-sc))

    return jwa

# 3. 중복 판정, 모양 따기
def is_again():
    again = set()

    v = [[0] * size for _ in range(size)]
    for i in range(size):
        for j in range(size):
            if arr[i][j] > 0 and v[i][j] == 0:
                num = arr[i][j]
                jwa = get_shape(i, j, num, v)

                if num not in again:
                    again.add(num)
                    m_jwa[num] = jwa
                    m_size[num] = (len(jwa), num)
                else:
                    if num in m_jwa:
                        m_jwa.pop(num)
                        m_size.pop(num)

# 4. 미생물 옮기기
def move(idx):
    jwas = m_jwa[idx]
    sr, sc = -100, -100

    for col in range(size):
        for row in range(size-1, -1, -1):

            if new_arr[row][col] == 0:
                cnt = 0

                for r, c in jwas:
                    nr, nc = r + row, c + col

                    if not is_range(nr, nc):
                        cnt += 1
                        break

                    if is_range(nr, nc) and new_arr[nr][nc] > 0:
                        cnt += 1
                        break

                if cnt == 0:
                    sr, sc = row, col
                    break

        if (sr, sc) != (-100, -100):
            break

    # 결정 되면 바로 놓기
    if (sr, sc) != (-100, -100):
        for r, c in jwas:
            pr, pc = r + sr, c + sc
            new_arr[pr][pc] = idx

# 5. 인접 그룹 파악, 점수 내기
def result(sr, sc):
    vr = [[0] * size for _ in range(size)]
    vr[sr][sc] = 1
    q = deque()
    q.append((sr, sc))
    adj = set()
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc):
                # 주의! 이 조건은 v체크 전에...
                if arr[r][c] > 0 and arr[nr][nc] > arr[r][c]:
                    adj.add((arr[r][c], arr[nr][nc]))
                if vr[nr][nc] == 0:
                    vr[nr][nc] = 1
                    q.append((nr, nc))
    return adj

# 입력
size, m_num = map(int, input().split())
m_loc = {}
for idx in range(1, 1+m_num):
    sc, sr, ec, er = map(int, input().split())
    # 좌표 개념으로 바뀌어 들어옴 + r 위 아래 바뀜
    sero = er-sr
    garo = ec-sc
    m_loc[idx] = [(size-sr-sero, sc), sero, garo]
    # 좌 상단, 세로 길이, 가로 길이

arr = [[0] * size for _ in range(size)]

# 풀이
for time in range(1, 1+m_num):
    # 1. 미생물 놓기
    put(time)

    # 2. 중복 관리 하면서 미생물 따내기

    # 좌표들 저장
    m_jwa = {}
    m_size = {}

    is_again()

    sunseo = list(m_size.values())
    sunseo.sort(key=lambda x: (-x[0], x[1]))

    # 새로운 arr
    new_arr = [[0] * size for _ in range(size)]
    for _, index in sunseo:
        move(index)

    arr = new_arr

    # 4. 인접 파악 및 점수 내기
    ans = 0
    adj = result(0, 0)
    for a, b in adj:
        ans += m_size[a][0] * m_size[b][0]

    print(ans)

from collections import deque

# 함수
def is_range(r, c):
    return 0 <= r < size and 0 <= c < size

# 1. 미생물 투입
def put(s_jwa, sero, garo, idx):
    sr, sc = s_jwa

    for r in range(sr, sr + sero):
        for c in range(sc, sc + garo):
            arr[r][c] = idx


# 2. 체크 함수
def check(sr, sc, color):
    iv = [[0] * size for _ in range(size)]  # 내 모양만 따로
    iv[sr][sc] = 1
    v[sr][sc] = 1
    q = deque()
    q.append((sr, sc))
    mx_r = sr
    mn_r = sr
    mx_c = sc
    mn_c = sr

    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and v[nr][nc] == 0:
                if arr[nr][nc] == color:
                    iv[nr][nc] = 1
                    v[nr][nc] = 1
                    q.append((nr, nc))

                    if nr > mx_r:
                        mx_r = nr

                    if nr < mn_r:
                        mn_r = nr

                    if nc > mx_c:
                        mx_c = nc

                    if nc < mn_c:
                        mn_c = nc

    if time == 11 and color == 8:
        print("DDDDDDDDDDDDDDDDDDDDDDDDDDd")
    print(sr, sc)
    print(mn_r, mn_c)
    print(mx_r, mx_c)
    return color, iv, ((mn_r, mn_c), mx_r-mn_r, mx_c-mn_c)


def extract(shape, idx, tpl):
    print("tpl", tpl)
    s_jwa, rl, cl = tpl
    sr, sc = s_jwa
    r_len = rl
    c_len = cl
    s_size = 0
    new_shape = []

    for row in range(sr, r_len + 1):
        line = []
        for col in range(sc, c_len + 1):
            if shape[row][col] == 1:
                s_size += 1
                line.append(idx)
            else:
                line.append(0)

        new_shape.append(line)

    if time == 11 and idx == 8:
        print(r_len, c_len)
        print("LLLLLLLLLQQQQQQQQQQQQQQ")
        for rr in new_shape:
            print(rr)

    return s_size, new_shape

# 4. 새로운 arr에 놓는다
def new_put(key):

    shape = s_dict[key]

    garo = len(shape[0])
    sero = len(shape)

    pr, pc = -100, -100
    flag = 0
    for s_col in range(size):
        for s_row in range(size-1, -1, -1):
            cnt = 0

            for nrow in range(sero):
                for ncol in range(garo):
                    if is_range(s_row - nrow, s_col + ncol):
                        if new_arr[s_row - nrow][s_col + ncol] == 0 and shape[nrow][ncol] > 0:
                            cnt += 1

            if cnt == key[0]:
                pr = s_row
                pc = s_col
                flag += 1
                break

        if flag:
            break
    if time == 11:
        print("pppppppr, ppppppppc", pr, pc)
    for row in range(sero):
        for col in range(garo):
            # shape에는 가로 세로 바뀌지않았나?
            new_arr[pr - row][pc + col] = shape[sero - row - 1][col] # row는 다 - 로 해줘야 아래서부터 채워짐...



# 5. 인접한 친구들이 있는지 본다
def adj(sr, sc):
    adj_set = set()
    av = [[0] * size for _ in range(size)]
    av[sr][sc] = 1
    q = deque()
    q.append((sr, sc))
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc):
                if arr[r][c] > 0 and arr[nr][nc] > arr[r][c]:
                    adj_set.add((arr[r][c], arr[nr][nc]))
                if av[nr][nc] == 0:
                    av[nr][nc] = 1
                    q.append((nr, nc))

    return adj_set

# 입력
size, mi_num = map(int, input().split())
mi = {}
for idx in range(1, 1 + mi_num):
    sr, sc, er, ec = map(int, input().split())
    mi[idx] = [(size - ec, sr), (ec - sc), (er - sr)]

arr = [[0] * size for _ in range(size)]

# 풀이
for time in range(1, 1 + mi_num):
    s_jwa, sero, garo = mi[time]
    put(s_jwa, sero, garo, time)

    if 10 <= time <= 15:
        print("=========")
        for rr in arr:
            print(rr)

    # 모양 따와서 저장
    v = [[0] * size for _ in range(size)]
    split = set()
    s_dict = {}
    temp = {}
    temp1 = {}
    size_lst = []
    size_dict = {}
    for i in range(size):
        for j in range(size):
            if arr[i][j] > 0 and v[i][j] == 0:
                index, shape, length = check(i, j, arr[i][j])
                if index not in split:
                    split.add(index)
                    temp[index] = shape
                    temp1[index] = (i, j, length)
                else:
                    if index in temp:
                        temp.pop(index)
                        temp1.pop(index)

    for ti in temp:
        s_size, new_shape = extract(temp[ti], ti, temp1[ti])
        size_dict[ti] = s_size
        s_dict[(s_size, ti)] = new_shape
        size_lst.append((s_size, ti))

    size_lst.sort(key=lambda x: (-x[0], x[1]))  # 제일 면적 크고, 오래된 순

    # 새 arr에 옮겨담기
    new_arr = [[0] * size for _ in range(size)]
    for keys in size_lst:
        new_put(keys)

    arr = new_arr

    if 10 <= time <= 15:
        print("size_lst", size_lst)
        print("=========")
        print("new")
        for rr in arr:
            print(rr)

    # 인접 파악
    adj_set = adj(0, 0)

    # 점수
    ans = 0
    for a, b in adj_set:
        ans += size_dict[a] * size_dict[b]

    print(ans)


```
