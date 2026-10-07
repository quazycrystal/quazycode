---
algorithm: []
data_structure: [2차원 배열, 스택]
technique: [전치]
---

### 걸린 시간: - (실패 횟수: -)

### 실패 / 성공 이유
- [로직] 1에서 2로 바뀌는 순간만 셈. 앞의 2, 뒤의 1은 떨어져서 없음

### 코드 개선 방법
- [전치] 열만 봐야 하니 전치 후 0 제거

### 코드
```python
for tc in range(1, 11):
    input()
    arr = list(zip(*[list(map(int, input().split())) for _ in range(100)]))
    # 열만 봐야하니 전치행렬
    new_a = []
    stk = []

    for r in arr:  # 열만 떨어짐
        new = [x for x in r if x != 0]  # 0 제거
        for i in range(len(new) - 1):
            if new[i] == 1 and new[i + 1] == 2:
                stk.append(1)

    print(f'#{tc} {len(stk)}')



```
