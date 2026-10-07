---
algorithm: [시뮬레이션, BFS]
data_structure: [2차원 배열, set]
technique: [중력]
---

### 걸린 시간: 2시간 8분 (구상 27분, 구현 55분, 디버깅 46분) + 8분 (실패 횟수: 2회 (WA))

### 실패 / 성공 이유
- [함수 설계] 활성/비활성 폭탄 배열을 앞 함수에서 넘겨받다 시간이 흐르며 덮어씌워져 잘못된 위치 전달
- [표시] -2 빈 칸, 0 폭탄, 10 활성 폭탄. 값이 헷갈림

### 코드 개선 방법
- [함수 설계] 넘기지 말고 그때그때 arr에서 구해 쓰기
- [동시 갱신] 3개씩 매칭되는 것을 모아 동시에 터뜨리기
- [순서] 폭탄 활성화 → 중력 → 폭발. 비브라늄만 아니면 퍼짐

### 코드
```python
# B34868 Magic Door

# 함수
def is_range(r, c):
    return 0 <= r < row and 0 <= c < col

# 1. swap 처리 함수
def swap(ar, ac, br, bc):
    arr[ar][ac], arr[br][bc] = arr[br][bc], arr[ar][ac]

# 2. 3개씩 터뜨리자
def match(sr, sc, color):
    affected = set()
    for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        cnt = 1
        temp = {(sr, sc)}
        r, c = sr, sc
        while True:
            nr, nc = r + dr, c + dc
            if is_range(nr, nc) and arr[nr][nc] == color:
                temp.add((nr, nc))
                cnt += 1
                r, c = nr, nc
            else:
                break
        if cnt >= 3:
            affected |= temp

    return affected

# 3. 중력(폭탄 활성화)
def gravity():
    new_arr = [[-2] * col for _ in range(row)]
    act_bomb = set()

    # 넘기지 말고 그때그때 구해 쓰자
    bomb_lst = []
    for r in range(row):
        for c in range(col):
            if arr[r][c] == 0:
                bomb_lst.append((r, c))

    # 3-1. 폭탄부터 활성화
    for bombr, bombc in bomb_lst:
        for rr in range(bombr+1, row):
            if arr[rr][bombc] == -2:
                arr[bombr][bombc] = 10
                break

    # 3-2. 중력
    for j in range(col):
        temp = []
        for i in range(row):
            if arr[i][j] != -2:
                temp.append(arr[i][j])

        for ri in range(row-1, -1, -1):
            if temp:
                new_arr[ri][j] = temp.pop()

    return new_arr

# 4. 폭탄에 영향 받은 애들 내보내 주는 함수
def boom():
    b_affected = set()

    # 활성 폭탄도 그때그때 구해다가 쓰고,,,
    active = []
    for r in range(row):
        for c in range(col):
            if arr[r][c] == 10:
                active.append((r, c))

    for sr, sc in active:
        b_affected.add((sr, sc))
        for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            r, c = sr, sc
            while True:
                nr, nc = r + dr, c + dc
                if is_range(nr, nc) and arr[nr][nc] != -1: # 비브라늄만 아니면 다 퍼짐
                    b_affected.add((nr, nc))
                    r, c = nr, nc
                else:
                    break

    return b_affected

# 5. 답 찾는 함수
def find_ans():
    ans = 0
    for rr in arr:
        ans += rr.count(-2)

    return ans

# 입력
row, col = map(int, input().split())
arr = [list(map(int, input().split())) for _ in range(row)]
# 바꿀 좌표
ar, ac, br, bc = map(int, input().split())
ar, ac, br, bc = ar-1, ac-1, br-1, bc-1 # 1 인덱스

# 1. 이니쉬
swap(ar, ac, br, bc)

while True:
    # 2. 매칭 되는 친구 찾아 동시에 터뜨리기

    while True:
        matched = set()
        for r in range(row):
            for c in range(col):
                if 0 < arr[r][c] < 10:
                    m_aff = match(r, c, arr[r][c])
                    matched |= m_aff

        if matched:
            for mr, mc in matched:
                arr[mr][mc] = -2
        else:
            break

        # 중력
        new_arr = gravity()
        arr = new_arr

    # 3. 폭탄 터지기
    boom_aff = boom()
    if boom_aff:
        for boomr, boomc in boom_aff:
            arr[boomr][boomc] = -2

        nxt_arr = gravity() # 여기서 활성화 된 폭탄 잘 포함되어 있어야 함 ㅜㅠ
        arr = nxt_arr

    else:
        break

print(find_ans())

```
