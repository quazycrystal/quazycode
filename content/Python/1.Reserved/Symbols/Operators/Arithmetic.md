[[초급] 파이썬 연산자/ 산술 연산자 (+, -, *, /, //, %, **)](https://code-lab.tistory.com/entry/%EC%B4%88%EA%B8%89-%ED%8C%8C%EC%9D%B4%EC%8D%AC-%EC%97%B0%EC%82%B0%EC%9E%90-%EC%82%B0%EC%88%A0-%EC%97%B0%EC%82%B0%EC%9E%90)

### 2. 논리 연산자
***
#### 2.1 논리 연산자 우선순위

파이썬 논리 연산자 우선순위는
**not > and > or** 순서입니다.

괄호가 없으면 이 순서대로 자동 해석됩니다.

#### 2.2 and, or는 True/False만 반환하지 않는다
논리 연산자는 마지막으로 평가된 값 자체를 반환합니다.
```python
0 and 10   # 0
0 or 5     # 5
```
이 때문에 조건식 결과가 예상과 다를 수 있습니다.

#### 2.3 x and y or z 패턴은 주의
실제 해석: (x and y) or z
y가 0, '', False이면 z가 반환되어 버그 위험이 큽니다.

```python
# 안전한 대안

## 괄호 명시적 사용
result = x and (y or z)

## 조건 표현식 사용
result = y if x else z
```

거듭제곱 = **
[[Python] 파이썬 제곱 연산자(**) | 파이썬에서 거듭제곱 계산 방법](https://august-jhy.tistory.com/101)