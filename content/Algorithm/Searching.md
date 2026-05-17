검색: 저장된 자료 중 원하는 것을 찾는 작업
원하는 값을 찾기 위해 [[Sorting]]이 필수로 되어 있어야 하는 방법도 있다.
예시로 아래와 같은 자료가 주어졌다고 하자.
```python
# 입력값: 정수, 차원 별 줄바꿈, 개행문자 " "
3 # 행 숫자, (n, len(arr))
0 0 1 0 0 # 열 숫자 (m, len(arr[0]))
1 0 1 0 0
0 1 1 1 1

>>> arr = [[0, 0, 1, 0, 0], [1, 0, 1, 0, 0], [0, 1, 1, 1, 1]]
```

***
### - 델타 탐색 (중요): 일정 값 이동해서 보기
방향을 주고 Array(이중 리스트)의 한 좌표에서 지정된 방향으로 이동하여 값 찾기
보통 x, y축 이동하는 방향을 담은 list 줌.
예시로 아래의 dx, dy 리스트는 상하좌우로 움직임
`dx = [0, 0, -1, 1]`
`dy = [-1, 1, 0, 0]`

예시 코드는 일단 2중 for문으로 전체 순회 - 그 안에 4번 반복 for문으로 상하좌우 요소의 x좌표 y좌표 각각 구함
```python
for i in range (n): # len(arr)
	for j in range (m) #len(arr[0]):
		for delta in range (4):
			test_x = i + dx[delta] #x좌표만 변형
			test_y = j + dy[delta] #y좌표만 변형
			print (arr[test_x][test_y]) # 상하좌우 요소 한번씩 나옴
```

***
### - 순차 검색 / 순회: 순서대로 다 보기 
완전 검색 [[Exhaustive]]
2중 for문이 기본, 뱡향에 따라 3가지
##### 1. 행(n) 우선
```python
for i in range (n): # len(arr)`  
	`for j in range (m): #len(arr[0]):
		print (arr[i][j])
``` 

##### 2. 열(m) 우선 (i, j만 바꾸기)
```python
`for j in range (m): #len(arr[0]):`
	`for i in range (n): # len(arr)`  
		print (arr[i][j])
``` 

##### 3. 지그재그: 행은 그대로, 열 읽을 때 오-왼 번갈아가며
[[Python] 2차원 배열 - 순회, 전치행렬](https://chaemi720.tistory.com/17)
==Index 주의==
```python
for i in range (n): # len(arr)`  
	for j in range (m): #len(arr[0]): 이것까진 같은데
		c_index = j+((m-1-(2*j))*(i%2)) 
		#음수 인덱스 통해 열 방향 왔다갔다, i%2통해 나머지 0/1

		print (arr[i][c_index])

``` 

가독성 좋고 더 나은 접근
```python
for i in range(n): 
	row = arr[i] 
	if i % 2 == 1: 
		row = row[::-1] # 홀수 행일 때만 시퀀스를 역순으로 슬라이싱! 
		print(row)
```

##### 정렬 여부에 따른 시간복잡도
둘 다 시간복잡도 O(n)이지만, 정렬이 되어있으면 ==현재 보고 있는 값이 key 값 넘어선 순간부터 안 찾으면 되므로== 시간 아낄 수 있음

***
### - 이진 검색: 반 씩 잘라서 보기
==정렬 필수!==
기본 구조는 아래와 같으나 문제 잘 보고 변형
Middle 식 둘 다 start와 end사이 값을 구한다는 것은 같지만 원래 식이 오버플로우 예방
 원래 식: start+((end-start)//2) -> start 값 위에 end-start//2값이 더해짐
 문제: start+end//2 -> start와 end 다 더하고 //2
```python
def Binary(arr, key): #데이터, 찾으려는 값
start = 0
end = len(arr) - 1 # end값도 탐색 범위 포함이므로 index처럼 하나 빼줘야
while start<=end: #팀색 범위가 있어야
	middle = start+((end-start) // 2) #오버플로우 방지, index!!!
	if key > arr[middle]: #이거는 값, start, middle, end는 index
		start = middle + 1 #겹치지 않게, 무한루프 방지
	elif key == arr[middle]:
		return True

	else: #key < middle
		end = middle - 1


return False
```

[[Regression]](재귀함수) 이용
이때는 print대신 다 return써야
```python
def Binary2(arr, start, end, key):
	if start > end:
		return False
	else:
		middle = start+((end-start) // 2)
		if key == arr[middle]:
			return True
		elif key > arr[middle]:
			return Binary2(arr, (middle + 1), end, key)
		else: # key < arr[middle]
			return Binary2(arr, start, (middle - 1), key)

```


[[DFS]]