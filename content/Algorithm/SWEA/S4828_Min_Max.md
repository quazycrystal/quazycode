---
algorithm: []
data_structure: [리스트]
technique: []
---

### 걸린 시간: - (실패 횟수: -)

### 실패 / 성공 이유
- 

### 코드 개선 방법
- [입력] 한 줄 정수 리스트는 list(map(int, input().split()))
- [입력] 안 쓰는 입력은 변수 지정 없이 input()만

### 코드
```python
T = int(input())
for i in range(1, T + 1):
    input()
    line = list(map(int, input().split()))
    print(f"#{i} {max (line) - min (line)}")
```
