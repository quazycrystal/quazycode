---
algorithm: [시뮬레이션]
data_structure: [2차원 배열, dict]
technique: []
---

### 걸린 시간: - (실패 횟수: -)

### 실패 / 성공 이유
- [엣지 케이스] 이동 속도 0이어도 행동력은 소모
- [갱신] 죽은 몬스터 idx를 바로 치워야 적절할 때 break. m_arr[nr][nc] = 0으로 비우기
- [변수] 상태 변수가 많아 이름이 헷갈림

### 코드 개선 방법
- [변수] 공격력, 사거리, 이속, 요구 경험치, 현재 경험치, 레벨을 이름 붙여 관리
- [상태] overdose 여부를 공격 함수에 넘기기. overdose 땐 클리어 불가
- [순서] 레벨 처리는 '한 행동'이 끝난 뒤

### 코드
```python
# B30038 Overdose Runner

# 함수
def is_range(r, c):
    return 0 <= r < row and 0 <= c < col


def move(jwa, cmd):
    # 움직일 수 없는 경우도 불가능한 경우 (행동력 소모 X)
    global hangdong, stat
    moved = 0
    sr, sc = jwa
    nr, nc = sr, sc

    # 행동력 0 될 수 있다!!!!!!!
    if cmd in {"u", "d", "r", "l"} and stat != 2:

        if cmd == "u":
            nr, nc = sr + (-1 * s_speed), sc
        elif cmd == "d":
            nr, nc = sr + (1 * s_speed), sc
        elif cmd == "l":
            nr, nc = sr, sc + (-1 * s_speed)
        elif cmd == "r":
            nr, nc = sr, sc + (1 * s_speed)

        if is_range(nr, nc):
            if arr[nr][nc] != "m" and arr[nr][nc] != "*":
                moved = 1

    if moved:
        hangdong += 1
        if stat == 1 and hangdong >= until:
            stat = 0

        # 좌표 이동
        if (sr, sc) == goal:
            arr[sr][sc] = "g"
        else:
            arr[sr][sc] = "."

        arr[nr][nc] = "p"

        return (nr, nc)
    else:
        return (sr, sc)


# 2. 기다린다...
def wait(cmd):
    global hangdong, stat
    if cmd == "w" and stat != 2:
        hangdong += 1
        if stat == 1 and hangdong >= until:
            stat = 0


# 3. 공격
def attack(jwa, cmd):
    global hangdong, now_exp, stat  # stat 글로벌로!!!!!!!!!!!
    sr, sc = jwa

    # 투척거리만큼 간다
    if cmd in {"au", "ad", "al", "ar"} and stat == 0:
        hangdong += 3

        for dist in range(1, s_range + 1):
            nr, nc = sr, sc

            if cmd == "au":
                nr, nc = sr + (-1 * dist), sc
            elif cmd == "ad":
                nr, nc = sr + (1 * dist), sc
            elif cmd == "al":
                nr, nc = sr, sc + (-1 * dist)
            elif cmd == "ar":
                nr, nc = sr, sc + (1 * dist)

            # for문 안에선 한 칸씩 가니...
            if is_range(nr, nc):
                idx = m_arr[nr][nc]
                if idx > 0:
                    if idx in m_info:
                        m_def = m_info[idx][1]
                        m_h = m_info[idx][0]

                        if m_def < s_power:
                            if m_h - (s_power - m_def) <= 0:
                                now_exp += m_info[idx][2]
                                arr[nr][nc] = "."
                                m_info.pop(idx)
                                m_arr[nr][nc] = 0

                            else:
                                m_info[idx][0] -= (s_power - m_def)

                elif arr[nr][nc] == "*":
                    break


# 4. 약 먹기
def drug(cmd):
    global hangdong, s_speed, drug_cnt, stat, until

    if cmd in {"du", "dd"} and stat == 0:
        hangdong += 2
        drug_cnt += 1

        if drug_cnt == 5:  # 오버도스 진입!
            stat = 1
            drug_cnt = 0
            until = hangdong + 10

        if cmd == "du":
            s_speed += 1

        if cmd == "dd":
            s_speed -= 1
            if s_speed < 0:
                s_speed = 0


# 5. 클리어
def clear(cmd, jwa):
    global stat
    if cmd == "c" and stat == 0:  # 헏...???? overdose땐 클리어도 못하네?
        if jwa == goal:
            stat = 2


# 6. 경험치 처리
def exp_lv():
    global now_exp, req_exp, lv, s_power, s_range
    while now_exp >= req_exp:
        now_exp -= req_exp
        s_power += lv
        s_range += 1
        req_exp += 10
        lv += 1


# 7. 답을 구하기 위한 *^^* 함수
def left_m():
    m_healths = []
    for i in range(1, 1 + m_num):
        if i in m_info:
            health = m_info[i][0]
            m_healths.append(health)
    return m_healths


# 입력
row, col = map(int, input().split())
arr = [list(input()) for _ in range(row)]
m_arr = [[0] * col for _ in range(row)]

# 몬스터 저장 - 몬스터 위치, 정보
m_num = int(input())

m_loc = {}
m_info = {}

idx = 0
# 위치
start = ()
goal = ()
for r in range(row):
    for c in range(col):
        if arr[r][c] == "m":
            idx += 1
            m_arr[r][c] = idx
            m_loc[idx] = (r, c)
        elif arr[r][c] == "p":
            start = (r, c)
        elif arr[r][c] == "g":
            goal = (r, c)

# 정보 - 체, 방, 경험치
m_health = list(map(int, input().split()))
m_defence = list(map(int, input().split()))
m_exp = list(map(int, input().split()))

for i in range(m_num):
    m_info[i + 1] = [m_health[i], m_defence[i], m_exp[i]]

# 스킵의 행동
s_num = int(input())
commands = list(input().split())
# 행동력
hangdong = 0
# 공격력, 사거리, 이속, 요구경험치, 현재 경험치, 레벨
s_power = 5
s_range = 1
s_speed = 1
req_exp = 10
now_exp = 0
lv = 1

drug_cnt = 0
stat = 0
until = 0

for cmd in commands:
    # 1. 이동
    start = move(start, cmd)

    # 2. 대기
    wait(cmd)

    # 3. 공격
    attack(start, cmd)
    exp_lv()

    # 5. 약 먹기
    drug(cmd)

    # 6. 클리어
    clear(cmd, start)

print(lv, now_exp)
print(hangdong)
for rr in arr:
    print("".join(rr))
ans = left_m()
if ans:
    print(*ans)

```
