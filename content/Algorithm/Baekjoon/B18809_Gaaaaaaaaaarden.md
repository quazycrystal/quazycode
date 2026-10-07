---
algorithm: [BFS, 조합]
data_structure: [3차원 배열, 덱, set]
technique: []
---

### 걸린 시간: 56분 (구상 12분, 구현 44분) (실패 횟수: -)

### 실패 / 성공 이유
- [동시 갱신] 같은 시간에 빨강·초록이 만나면 꽃이 되고, 그 지점은 큐에 들어가면 안 됨

### 코드 개선 방법
- [BFS] 단계 단위로 bfs. 칸마다 (도착 시간, 색)을 저장
- [중복 방지] 꽃이 된 칸은 먼저 넣은 쪽도 제거
- [체크리스트] 문제 되묻기 / 인덱스 손으로 돌리기 / 얕은 복사 / bfs 초기화 / continue·break / 갱신 / 중력 방향 / for 안 변화량 누적

### 코드
```python
# B18809 Gaaaaaaaaaarden

from collections import deque
from itertools import *

# 함수
def is_range(r, c):
    return 0 <= r < row and 0 <= c < col

# 1. 3차원 bfs 레고
def bfs3(red_set, green_set):
    flowers = 0
    v = [[[-1, -1] for _ in range(col)] for _ in range(row)]
    q = deque()
    for rr, rc in red_set:
        v[rr][rc][0] = 0
        q.append((rr, rc, 0))
    for gr, gc in green_set:
        v[gr][gc][1] = 0
        q.append((gr, gc, 1))
    while q:
        small_q = set()
        for _ in range(len(q)): # 단계 단위로 bfs하기
            r, c, color = q.popleft()
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = r + dr, c + dc
                if is_range(nr, nc) and v[nr][nc][color] == -1:
                    if garden[nr][nc] != 0: # 호수는 퍼질 수가 없어
                        v[nr][nc][color] = v[r][c][color] + 1

                        if v[nr][nc][color] > -1 and v[nr][nc][1-color] > -1:
                            if v[nr][nc][color] == v[nr][nc][1 - color]:
                                flowers += 1
                                v[nr][nc][0], v[nr][nc][1] = -2, -2 # 퍼지지 않게끔 방문처리

                                # 미리 들어갔을 먼저번 친구 제거!
                                if (nr, nc, 1-color) in small_q:
                                    small_q.remove((nr, nc, 1-color))

                                continue # 이 조건 들어가면 add 안되게

                        small_q.add((nr, nc, color)) # 이 부분 중복 안되게 처리할 방법? - continue 잘 써보기


        q.extend(small_q)

    return flowers


def find_spot(num):
    ans = 0
    able = set()
    for r in range(row):
        for c in range(col):
            if garden[r][c] == 2:
                able.add((r, c))

    # 오버헤드 좀 있을 것 같긴 한데,,,,,, 흠
    for combi in combinations(able, num):
        for red_combi in combinations(combi, red):
            green_combi = set(combi).difference(set(red_combi))
            flowers = bfs3(red_combi, green_combi)
            ans = max(ans, flowers)

    return ans

# 입력
row, col, green, red = map(int, input().split())
garden = [list(map(int, input().split())) for _ in range(row)]

# 풀이
ans = find_spot(red + green)
print(ans)
```
