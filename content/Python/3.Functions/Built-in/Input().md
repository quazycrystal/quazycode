### Input() -> Str!!!
### - 다 뜯어: `list(input())`

`list()` 함수는 띄어쓰기조차 하나의 문자로 취급해서 뜯어낸다.  
- **입력:** `"10 20"` (두 자리 숫자 10과 20)  
- **코드:** `list("10 20")`  
- **결과:** **`['1', '0', ' ', '2', '0']`**  

	**`list()`가 필요한 경우 (미로 찾기, 그래프)**
	"미로 지도: 값이 다 붙어서 들어옴. (예: 00110)"
	이때는 split()을 쓰면 공백이 없어서 ['00110'] 통째로 나온다.
	이럴 때 list("00110") -> ['0', '0', '1', '1', '0'] 잘 나온다.
	
	! 이 값도 int로 바꾸려면 map -> list(map(int, input())) (split 없음)

*** 
### - 통째로 박스 포장: `[input()]`

`[]`는 대괄호 안에 있는 놈을 그 모양 그대로 리스트로 만든다.  
- **입력:** `123` (엔터)  
- **코드:** `a = [input()]`  
- **결과:** **`['123']  `**

***
### - 토막 내기: `input().split()` 

`split()`은 "특정 기준(주로 공백)"을 가지고 큼직하게 자른다.  
==문자열에만 가능!==  
- **입력:** `"10 20"`  
- **코드:** `"10 20".split(), 또는 input().split()`  
- **결과:** `['10', '20']`  

- 공백 대신 쓰려면 "기준 문자" ex) split("a") -> a 나오면 자르기  
  ==단 잘린 문자 사라짐!!!==  
- ==map을 써서 한 방에 숫자로 변환하고 list로 감싼다.==  
- 하나만 있을 때는 map 대신 int(input())  
- line = list(map(int, input().split())) 숫자 min / max 비교 시  

	**`split()`이 필요한 경우 (대부분의 문제)**  
	"숫자 두 개를 입력받아 더하시오. (예: 10 20)"  
	이때 `list()`를 쓰면 `1`, `0`으로 다 쪼개진다.  
	`split()`으로 덩어리 유지  

##### 바로 잘라서 따로 저장 (Unpacking)
잘려 나오는 갯수 알면 바로 split 하면서 콤마로 변수 분리 후 할당  
ex) k, n = map(int, input().split())  
```python
# 입력이 "1 2 3 4 5"일 때
k, n, *others = map(int, input().split())

print(k)      # 1
print(n)      # 2
print(others) # [3, 4, 5]
```

***
### - 2차원 리스트 입력 받기 (중요)
방법은 약 3가지  
```python
# 입력값: 정수, 차원 별 줄바꿈, 개행문자 " "
3 # 줄 숫자, (n)
0 0 1 0 0
1 0 1 0 0
0 1 1 1 1
```
1. 변수 초기화 하면서 2차원 통째로 입력 받기 (축약)  
   `full_list = [list(map(int, input().split())) for _ in range n]`  

2. 0차원 list 만들어 두고 차곡차곡 더하기 (.append 메소드)  
   `full_list = []`  
   `full_list.append(list(map(int, input().split())))`  

3. 1차원 list 만들어 두고 for 문으로 돌리기  
```python
   full_list = [0]*n 또는 [0 for _ in range n]
   for i in range n:
       full_list[i] = list(map(int, input().split()))
   ```

***
### - 숫자와 문자 분리: `isdigit()` 
[[python] isdigit, isnumeric, isdecimal, isalpha, isalnum 함수로 문자 숫자 확인하기](https://sikmulation.tistory.com/83)
x.isdigit() 처럼 씀, 괄호 안에는 아무것도 안 들어감
```python
data = "apple 10 banana 20 30 cherry"

# 숫자인 것만 리스트에 담기
numbers = [int(x) for x in data.split() if x.isdigit()]

print(numbers)  # [10, 20, 30]
```
***

### - 입력 자료형 종류 보기
[[python] 파이썬 isinstance 타입 확인 함수 설명과 예제](https://blockdmask.tistory.com/536)
if isinstance(formula[i], int):-> True, False 내보냄
***
### Input 파일 갯수 안 정해진 경우
[파이썬에서 EOF 처리하기](https://suldangoo.tistory.com/m/11)
EOF (End Of File) 처리
백준 같은 곳 테케 갯수 안 정해진 경우도 있음 -> 그럼 어떻게?
sys 쓰기도 하지만 코테에서는 지워야 하니까, 
근데 sys가 편하긴 해

try ~ except를 써보자.

예시)
```python
lines = list() 
while True : 
	try : 
		lines.append(input())
	except EOFError : 
		break
```

여러 줄로 입력되는 데이터를 **처음부터 하나의 리스트**로 담고 싶으시군요! 리스트 컴프리헨션 내부에 `for`문을 두 번 쓰거나, 입력 방식 자체를 살짝 바꾸면 간단히 해결됩니다.

---

### 1. 리스트 컴프리헨션으로 해결하기 (이중 `for`문)

컴프리헨션 안에서 `for`문을 연속으로 사용하면, 2차원 데이터를 1차원으로 자동 "압축"해서 받을 수 있습니다.

Python

```
# 3줄을 받아서 하나의 리스트로 합치기
flat_list = [int(x) for _ in range(3) for x in input().split()]

print(flat_list)
# 입력: 3 7 (엔터) 15 7 (엔터) 5 2 (엔터)
# 결과: [3, 7, 15, 7, 5, 2]
```