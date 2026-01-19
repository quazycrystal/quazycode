Dynamic Programming
[[ 알고리즘 ] 재귀와 동적 계획법(DP) 쉽게 이해하기 ( 피보나치 수열, 배낭 문제, 최장 공통 부분 수열 등 )](https://it-ability.tistory.com/143)
Greedy처럼 최적화 해결법 중 하나
재귀함수처럼 큰 문제를 작은 문제 여럿으로 쪼개어, 작은 문제를 합하여 풀어냄.

##### DP가 되기 위한 조건
똑같은 계산 두 번 하지 않는다!

1. 큰 문제를 작은 문제로 나눌 수 있는가? (최적 부분 구조)
둘 다 $f(n)$을 구하기 위해 $f(n-1), f(n-2)$ 같은 작은 단위의 결과값을 이용.

2. 작은 문제의 답을 저장하고 재활용하는가? (중복되는 부분 문제)
- **Top-Down**은 필요할 때 내려가서 가져오는 것, 목표에 다다를 수 있는 큰 함수 짜서 원하는 값으로
  -> 재귀 함수 사용, 리스트/딕셔너리에 저장(Memoization)
- **Bottom-Up**은 미리 준비해서 쌓아 두는 것, 작은 값을 모아모아 원하는 값까지 감
  -> 반복문과 테이블 형식의 데이터 사용, `dp_table`이라는 배열에 차례대로 저장(Tabulation)

| **비교 항목**  | **재귀 (recursive, 실제 위치 변동)** <br>[[Regression]]<br>Top-Down (Memoization) | **반복문 (iterative, 장부 정리)**<br>Bottom-Up                                 |
| ---------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **멈추는 지점** | 함수가 끝날 때 (리턴)                                                             | 장부(Stack)가 텅 빌 때                                                        |
| **기억 장소**  | 컴퓨터 내부 메모리 (Call Stack)<br>Memoization                                    | 내가 만든 리스트 (Stack)<br>Tabulation                                         |
| **장점**     | 코드가 간결하고 수학적 증명이 쉬움                                                       | 메모리 사용량을 직접 제어 가능, 속도가 미세하게 빠름                                          |
| **위험성**    | 너무 깊이 들어가면 에러 발생 (`RecursionError`)                                       | 장부 관리를 잘못하면 무한 루프에 빠질 수 있음, <br>==미리 최종 데이터 크기를 알아야 함== (그만큼 반복을 할 테니까) |

### Top-Down vs Bottom-Up
피보나치 수열의 예시를 [[Regression]]에서 가져오면...

##### Top-Down
```python




memo = [0, 1]
def fibo1 (n):
	global memo
	if n >= 2 and len(memo)<=n: 
	# len(memo)<=n 이게 중요한 게, 저장 안 된 fibo1(n)만 새로 저장시킴
		return fibo1(n-1) + fibo1(n-2)
	else:
		return memo[n]```

##### Bottom-Up
```python

def fibo2(n):
	memo = [0, 1]
	for i in range (2, n+1):
		memo.append(memo[i-1]+memo[i-2]) # 즉 함수의 역할을 list가 해 줌
		return  memo[n]```

Memoization(Top-Down)보다 Tabulation(Bottom-Up)이 더 효율적인 편
이 방법은 위처럼 글로벌 데이터베이스를 만들어 함수를 호출하지 않고,
한 함수 그 계산만 반복한다 - 함수 stack에서 call 하는 등 부가적인 시간이 들지 않는다 




