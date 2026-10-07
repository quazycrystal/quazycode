---
algorithm: [시뮬레이션]
data_structure: [2차원 배열, dict]
technique: [중력]
---

### 걸린 시간: 구상 35분, 구현 1시간 7분, 디버깅 14분 (실패 횟수: -)

### 실패 / 성공 이유
- [중력] 남을 보면 멈추고 나를 보면 지우게 짬. 나를 본 '이후' 남을 보면 멈춰야 함
- [초기 조건] 처음 들어갈 때 칸이 해당 idx일 수 있는데 누락

### 코드 개선 방법
- [중력] 아래쪽 택배부터 순서대로(sunseo 배열) 떨어뜨려야 위 택배가 제대로 내려옴
- [연쇄 작용] 인접한 것만 중력 처리하지 말고 전부 다시. 리소스를 과하게 아끼지 말기
- [검증] 중첩돼도 우선순위대로 연쇄적으로 빠지는지 커스텀 테케

### 코드
```python
# C 택배 하차

from collections import deque

def is_range(r, c):
    return 0 <= r < size and 0 <= c < size

def down(idx):
    c, h, w = tek[idx]

    stop_r = -100

    flag = 0
    for row in range(size+1):
        cnt = 0
        for col in range(c, c + w):
            # 1. 만약 내려가다가 나 보면 지워주기
            if is_range(row, col) and arr[row][col] == idx:
                flag = 1
                arr[row][col] = 0

            # 2. 가다가 다른 애 있으면 / 바닥까지 왔으면
            if not is_range(row, col):
                cnt += 1
                break

            if arr[row][col] > 0 and flag == 1:
                cnt += 1
                break

        if cnt > 0:
            stop_r = row-1
            break


    for sero in range(stop_r, stop_r - h, -1): # 밑에서 위로 그리므로,,,
        for garo in range(c, c + w):
            arr[sero][garo] = idx

def left_check():
    len_check = {} # 각 인덱스가 몇 번 등장했는지?
    pick = 1000 # 최대 100
    for row in range(size):
        for col in range(size):
            if arr[row][col] > 0:
                num = arr[row][col]
                if num not in len_check:
                    len_check[num] = 1
                else:
                    len_check[num] += 1
                break

    for idx in len_check:
        if tek[idx][1] == len_check[idx]:
            pick = min(pick, idx)

    return pick

# 2-1. 오른쪽
def right_check():
    len_check = {} # 각 인덱스가 몇 번 등장했는지?
    pick = 1000 # 최대 100
    for row in range(size):
        for col in range(size-1, -1, -1): # 방향만 역으로
            if arr[row][col] > 0:
                num = arr[row][col]
                if num not in len_check:
                    len_check[num] = 1
                else:
                    len_check[num] += 1
                break

    for idx in len_check:
        if tek[idx][1] == len_check[idx]:
            pick = min(pick, idx)

    return pick

# 3. 골라진 인덱스 지우고, 근처 애들 알려주는 함수
def delete(sr, sc, idx):
    v = [[0] * size for _ in range(size)]
    # 들어갈 때도 체크를 좀 합시다......................
    if arr[sr][sc] == idx:
        arr[sr][sc] = 0

    v[sr][sc] = 1
    q = deque()
    q.append((sr, sc))
    while q:
        r, c = q.popleft()
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nr, nc = r + dr, c + dc
            if is_range(nr, nc):
                if v[nr][nc] == 0:
                    if arr[nr][nc] == idx:
                        arr[nr][nc] = 0
                    q.append((nr, nc))
                    v[nr][nc] = 1

# 입력
size, t_num = map(int, input().split())

tek = {}
sunseo = []
alive = set() # 남은 택배

for _ in range(t_num):
    idx, h, w, c = map(int, input().split())
    c = c-1
    tek[idx] = (c, h, w)
    sunseo.append(idx)
    alive.add(idx)

arr = [[0] * size for _  in range(size)]

# 택배 싣기
for i in sunseo:
    c, h, w = tek[i]
    for rr in range(h): # 밑에서 위로 그리므로,,,
        for cc in range(c, c + w):
            arr[rr][cc] = i

    down(i)

# 택배 내리기
tekbae = 0

while tekbae < t_num:
    now = left_check()
    if now != 1000:
        print(now)
        delete(0, 0, now)
        alive.remove(now)

        for index in sunseo:
            if index in alive:
                down(index)

        tekbae += 1

    nxt = right_check()
    if nxt != 1000:
        print(nxt)
        delete(0, 0, nxt)
        alive.remove(nxt)

        for index in sunseo:
            if index in alive:
                down(index)

        tekbae += 1
```
