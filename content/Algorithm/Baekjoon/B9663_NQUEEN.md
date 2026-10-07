---
algorithm: [백트래킹]
data_structure: [리스트]
technique: [룩업 테이블, 가지치기]
---

### 걸린 시간: - (실패 횟수: -)

### 실패 / 성공 이유
- [가지치기] 이 줄에 못 놓으면 다음 줄 볼 필요 없음
- [로직] 대각선은 r+c(위로) 또는 r-c(아래로)가 일정

### 코드 개선 방법
- [룩업 테이블] 열, 위 대각선, 아래 대각선 v 3개. 행은 깊이로 하나씩
- [분기] 연속 비교 v1 == v2 == v3 == 0도 앞이 False면 멈춤. 다만 이웃끼리 먼저 비교해서 v1, v2가 둘 다 1이면 통과해 더 봄. v1 == 0 and v2 == 0 and v3 == 0으로 떼어 쓰면 첫 값이 1인 순간 멈춤. 결과는 같음

### 코드
```python
def nqueen(n):
    global ans
    if n == N:
        ans += 1
        return
    for col in range(N):
        if v1[col] == 0 and v2[n+col] == 0 and v3[n-col] == 0:
            v1[col] = 1
            v2[n+col] = 1
            v3[n-col] = 1
            nqueen(n+1)
            v1[col] = 0
            v2[n + col] = 0
            v3[n - col] = 0

N = int(input())
v = [[0] * N for _ in range(N)]

v1 = [0]*N # 열
v2 = [0]*(2*N-1) # 윗 방향 대각선
v3 = [0]*(2*N-1) # 아랫 방향 대각선
ans = 0
nqueen(0)
print(ans)
```
