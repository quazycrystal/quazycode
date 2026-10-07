---
algorithm: [그리디]
data_structure: [리스트]
technique: []
---

### 걸린 시간: - (실패 횟수: -)

### 실패 / 성공 이유
- [문법] 리스트 값을 직접 바꾸려면 index로 접근. index 메소드 사용 주의

### 코드 개선 방법
- 

### 코드
```python
# 여러개의 테스트 케이스가 주어지므로, 각각을 처리합니다.
for test_case in range(1, 11):
    n = int(input())
    ans = 0
    lst = list(map(int, input().split()))
    for i in range(n):
        mx = max(lst)
        mn = min(lst)

        i_mx = lst.index(mx)
        i_mn = lst.index(mn)

        lst[i_mx] -= 1
        lst[i_mn] += 1
    ans = max(lst) - min(lst)
    print(f'#{test_case} {ans}')
```
