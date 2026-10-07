---
algorithm: [BFS, 시뮬레이션]
data_structure: [2차원 배열, dict, 덱]
technique: []
---

### 걸린 시간: 2시간 25분 (구상 37분, 구현 1시간 9분, 검증 39분), 95ms (실패 횟수: -)

### 실패 / 성공 이유
- [변수] 가로/세로를 반대로 적고 그대로 짬
- [연쇄 작용] 처음 블록 두께만큼 한 줄만 보면 튀어나온 기사에 영향이 안 감

### 코드 개선 방법
- [BFS] 연쇄 밀림은 한 방향 bfs. 닿은 기사의 모든 칸을 큐에. 벽을 만나면 전체 취소
- [범위] 범위 체크를 조건 맨 앞에
- [자료구조] 기사는 좌상단·크기를 dict, visual에 인덱스 뿌리기
- [검증] 5*5 엣지 + max 테케로 시간 확인
- [구상] 스케치 후 손코딩처럼 단계 정리

### 코드
```python
# 시간 복잡도: O(Q * pow(N, 2))

# 함수
from collections import deque

def is_range(r, c):
    return 0 <= r < size and 0 <= c < size

direction = {0: (-1, 0), 1: (0, 1), 2: (1, 0), 3: (0, -1)}
def check(idx, d):
    v = [[0] * size for _ in range(size)]
    blocked = 0
    q = deque()
    sr, sc = k_loc[idx]
    garo, sero = k_size[idx]
    for i in range(sr, sr+garo):
        for j in range(sc, sc+sero):
            q.append((i, j))
            v[i][j] = 1

    affected = {idx} # return 할, 영향 받은 애들
    #=== 여기까지가 초기화 ===
    while q:
        r, c = q.popleft()
        dr, dc = direction[d]
        nr, nc = r + dr, c + dc

        if not is_range(nr, nc) or arr[nr][nc] == 2: # 범위 체크 앞으로 빼줘야!!!!
            blocked = 1
            break

        elif visual[nr][nc] > 0:
            if v[nr][nc] == 0:
                v[nr][nc] = 1
                if visual[nr][nc] not in affected:
                    new_idx = visual[nr][nc]
                    affected.add(new_idx)
                    ar, ac = k_loc[new_idx]
                    a_garo, a_sero = k_size[new_idx]
                    for aa in range(ar, ar + a_garo):
                        for bb in range(ac, ac + a_sero):
                            q.append((aa, bb))
                            v[aa][bb] = 1

    if blocked:
        return set()
    else:
        return affected

# 2. 연쇄 밀림 처리 함수
def move(aff, d):
    for idx in aff:
        r, c = k_loc[idx]
        dr, dc = direction[d]
        nr, nc = r + dr, c + dc
        k_loc[idx] = [nr, nc]

# 3. 대결 처리 함수
def fight(aff, gong):
    for idx in aff:
        if idx != gong: # 공격하는 애들은 데미지 안 받음
            r, c = k_loc[idx]
            garo, sero = k_size[idx]
            for rr in range(r, r + garo):
                for cc in range(c, c + sero):
                    if arr[rr][cc] == 1:
                        k_live[idx][0] -= 1  # 체력 감소
                        k_live[idx][1] += 1  # 그동안 입은 피해 증가

                        if k_live[idx][0] <= 0:
                            k_live[idx][2] = 1  # 사망 처리

# 입력
size, knight_num, cmd_num = map(int, input().split())
arr = [list(map(int, input().split())) for _ in range(size)]

k_loc = {}
k_size = {}
k_live = {}

# 기사 관련 초기화
for idx in range(1, knight_num+1):
    r, c, h, w, k = map(int, input().split())
    r, c = r-1, c-1

    k_loc[idx] = [r, c]
    k_size[idx] = [h, w] # 가로, 세로
    k_live[idx] = [k, 0, 0]

# visual 초기화
visual = [[0] * size for _ in range(size)]
for i in range(1, knight_num+1):
    sr, sc = k_loc[i]
    garo, sero = k_size[i]
    for j in range(sr, sr + garo):
        for k in range(sc, sc + sero):
            visual[j][k] = i

# 명령 받기
commands = []
for _ in range(cmd_num):
    index, dirr = map(int, input().split())
    commands.append((index, dirr))

# 반복 함수
for ii, dd in commands:
    if k_live[ii][2] == 0: # 그 기사가 살아 있다면,,,
        affected = check(ii, dd)
        if affected: # 밀리는 게 있으면
            # 2) 연쇄 밀림 처리
            move(affected, dd)

            # 2-1) visual 갱신
            visual = [[0] * size for _ in range(size)]
            for iii in range(1, knight_num+1):
                if k_live[iii][2] == 0:  # 그 기사가 살아 있다면 표시
                    sr, sc = k_loc[iii]
                    garo, sero = k_size[iii]
                    for gr in range(sr, sr + garo):
                        for gc in range(sc, sc + sero):
                            visual[gr][gc] = iii

            # 2. 대결 데미지
            fight(affected, ii)
            # print(k_live)

# 답
ans = 0
for live in range(1, knight_num+1):
    if k_live[live][2] == 0: # 살아 있는 애들
        ans += k_live[live][1]

print(ans)

```
