### 개념
재귀적 문제 해결 (또는 재귀 함수를 이용한 문제 해결)
초기 값 + 점화 식의 느낌, 점화 식이 재귀 함수가 됨
초기 값을 이용해 작은 부분의 문제를 먼저 해결한 후 그 결과 값을 이용해 큰 문제를 차차 해결해 간다는 면에서 [[DP]]와도 관련 깊음

##### 장점
프로그램 크기가 작아지고, 구현이 간단
##### 단점
디버깅이 어렵고,, 했던 계산 또 하면서 수행 시간이 길어짐 (Overhead 간접 자원 증가)

### Memoization
memo'r'ization 아님에 주의
함수 계산을 반복함으로써 수행 시간이 길어지는 단점을 보완하기 위해, 초기 값에서 시작해 계산된 값들을 미리 메모리에 저장하는 기법 - 즉 재귀 함수를 돌리는 대신 바로 메모리에서 이전 값 꺼내 씀
[[DFS]]

### 예시
##### 팩토리얼
n! = ((n-1)까지의 값) 곱하기 n
즉 점화식은 n>=2일 때 `f(n) = f(n-1) * n`
memoization 쓰면 f(n) 나올 때 마다 리스트에 n번째 (index n)로 저장해서 바로바로 사용 가능
ex) `factorial = [0, 1, 2, 6...]`, 

##### 피보나치 수
점화식은 n>=2일 때 `f(n) = f(n-1) + f(n-2)`
```python





def fibo (n):

	if n >= 2: 
	# 이미 계산 했던 값 계산하고 또 하고...
		return fibo1(n-1) + fibo1(n-2)
	else:
		return n
	```

memoization 사용하면 이런 느낌

```python




memo = [0, 1]
def fibo1 (n):
	global memo
	if n >= 2 and len(memo)<=n: 
	# len(memo)<=n 이게 중요한 게, 저장 안 된 fibo1(n)만 새로 저장시킴
		return fibo1(n-1) + fibo1(n-2)
	else:
		return memo[n]
	
```

하지만 memoization보다 더 효율적인 방법([[DP]])도 있다 
이 방법은 위처럼 글로벌 데이터베이스를 만들어 함수를 호출하지 않고,
한 함수 그 계산만 반복한다 - 함수 stack에서 call 하는 등 부가적인 시간이 들지 않는다 

```python

def fibo2(n):
	memo = [0, 1]
	for i in range (2, n+1):
		memo.append(memo[i-1]+memo[i-2]) # 즉 함수의 역할을 list가 해 줌
		return  memo[n]
		```