---
algorithm: [BFS]
data_structure: [2차원 배열, dict, 큐]
technique: []
---

### 걸린 시간: - (실패 횟수: -)

### 실패 / 성공 이유
- [범위] 열별로 배열이 같아서 범위 처리만 잘 하면 됨

### 코드 개선 방법
- 

### 코드
```python
keyboard = {'Q': (0, 0), 'W': (0, 1), 'E': (0, 2), 'R': (0, 3), 'T': (0, 4),'Y': (0, 5), 'U': (0, 6), 'I': (0, 7), 'O': (0, 8), 'P': (0, 9),
            'A': (1, 0), 'S': (1, 1), 'D': (1, 2), 'F': (1, 3), 'G': (1, 4), 'H': (1, 5), 'J': (1, 6), 'K': (1, 7), 'L': (1, 8),
            'Z': (2, 0), 'X': (2, 1), 'C': (2, 2), 'V': (2, 3), 'B': (2, 4), 'N': (2, 5), 'M': (2, 6)}

d = [(-1, 0), (-1, 1), (0, 1), (1, 0), (1, -1), (0, -1)]

row = 3
col = 10

# 시작점은 문자열의 시작 문자
def bfs(sr, sc, gr, gc):
    global ans
    if (sr, sc) == (gr, gc):
        ans += 1
        return

    v = [[-1] * col for _ in range(row)]
    v[sr][sc] = 0
    q = []
    q.append((sr, sc))
    while q:
        r, c = q.pop(0)
        for dr, dc in d:
            nr = r + dr
            nc = c + dc
            if 0 <= nr < row and 0 <= nc < col:
                if v[nr][nc] == -1:
                    v[nr][nc] = v[r][c] + 1
                    if (nr, nc) == (gr, gc):
                        ans += (v[nr][nc] * 2) + 1
                        return
                    q.append((nr, nc))

# 입력
T = int(input())
for tc in range(1, 1+T):
    s = input()
    ans = 1

    for idx in range(1, len(s)):
        s_r, s_c = keyboard[s[idx-1]]
        g_r, g_c = keyboard[s[idx]]
        bfs(s_r, s_c, g_r, g_c)

    print(ans)

```
