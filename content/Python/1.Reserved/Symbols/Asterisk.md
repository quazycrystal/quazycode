### - 데이터 쪼개기: `*, **`
==별 하나는 Iterable에, 별 둘은 Mapping(dict)에 사용==
##### `*` (Asterisk) : Iterable 주머니 터뜨려서 낱개로 흩뿌리기
1.  함수 호출 (`*args`)
   아래 예제 함수 add 보면 칸이 3개 (a, b, c)
   근데 nums는 리스트 하나, 칸이 안 맞아 -> 함수에 리스트 요소 각각 넣으려면 `*`로 나눠야
   칸이 꼭 서로 맞아야 동작
``` python
def add(a, b, c):
    return a + b + c

nums = [1, 2, 3]

# print(add(nums))  <- 에러! (리스트 하나만 전달됨)
print(add(*nums))   # 성공! add(1, 2, 3)으로 변환되어 들어감
```

2.  [[Zip()]]을 이용한 압축 해제(Unzip)
   변수 ,로 분리해두고 갯수 맞춰서 터뜨려 각각 넣어줌
```python
zipped = [(1, 'a'), (2, 'b'), (3, 'c')]

# zipped라는 리스트 안에 든 3개의 튜플을 각각 독립된 인자로 뿌려줌
# zip((1, 'a'), (2, 'b'), (3, 'c')) 와 같은 효과!
numbers, letters = zip(*zipped)

print(numbers) # (1, 2, 3)
print(letters) # ('a', 'b', 'c')
```

3. 가변 변수 담기(Extended Iterable Unpacking)
   전체 리스트 길이 알 수 없거나, 중요한 값만 빼내고 나머지 리스트 다 묶어버릴 수 있음.
   ==나뉘는 쪽이 아니라 묶이는 쪽에 별==
```python
first, *others, last = [1, 2, 3, 4, 5]

print(first)  # 1
print(others) # [2, 3, 4]  <- 나머지들을 리스트로 묶어서 가져옴
print(last)   # 5
```

##### `**` (Double Asterisk): 딕셔너리 터뜨리기
==key와 매개변수 이름 똑같아야 전달됨!==
key-value 쌍 터뜨려서 key 이름과 같은 매개변수에 하나씩 전달
매개변수 name, age에 각각 Alice, 25가 전달됨
``` python
def intro(name, age):
    print(f"{name}은 {age}살입니다.")

info = {"name": "Alice", "age": 25}
intro(**info) # intro(name="Alice", age=25) 로 변환됨
```

***
### - 데이터 묶기: `*args`,  `**kwargs`
앞의 "데이터 풀기"는 정의된 함수의 매개변수에 맞춰서 데이터 쪼개줬다면,
이거는 함수 정의할 때 크기 정해지지 않은 모든 데이터 받을 수 있게
==args가 kwargs보다 앞에 와야 함==

| 구분            | ***args**             | ****kwargs**            |
| ------------- | --------------------- | ----------------------- |
| 함수 정의 시 (뭉치기) | **튜플 (Tuple)**        | **딕셔너리 (Dict)**         |
| 접근 방식         | 인덱스 (`args[0]`)       | 키 이름 (`kwargs['name']`) |
| 주요 용도         | 인자 개수가 유동적일 때         | 옵션/설정값을 이름으로 넘길 때       |
| 함수 호출 시 (쪼개기) | `*iterable` (순서대로 배정) | `**dict` (이름 맞춰 배정)     |

##### 함수에 값 집어넣는 방법
`*args` 의 경우 그냥 값 콤마써서 호출할 때 안에 줄줄 넣어버리면 됨
또는 `*`써서 iterable 터뜨려서 넣기
`**kwargs` 의 경우 그냥 key = 값으로 호출할 때 안에 줄줄 넣어버리면 됨
```python
def my_func(*args): 
	print(args) #(1, 2, 3, "apple", True)
my_func(1, 2, 3, "apple", True) # 리스트로 묶지 말고, 그냥 값들만 콤마(,)로 나열하세요! 
my_func(*iterable)

#----------
def my_func(**kwargs):
	print(kwargs) #{'name': 'Alice', 'age': 25, 'city': 'Seoul'}
my_func(name="Alice", age=25, city="Seoul") # 리스트나 튜플 없이 그냥 쉼표로 나열하세요!

```

##### 함수를 감싸는 함수 (Decorator)
기존 함수의 기능을 유지하면서 앞뒤로 로그를 남기거나 시간을 잴 때 사용
어떤 인자가 들어올지 모르니 `*args`와 `**kwargs`로 통째로 받아 전달
```python
def logger(func):
    def wrapper(*args, **kwargs):
        print(f"함수 {func.__name__} 실행 중...")
        return func(*args, **kwargs) # 받은 그대로 다시 전달!
    return wrapper
```

##### 상속과 확장 (Super)
부모 클래스의 기능을 그대로 이어받으면서 새로운 기능을 추가할 때
부모에게 어떤 인자가 필요한지 일일이 적기 귀찮을 때
``` python
class Child(Parent):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs) # 부모님 필요한 건 다 여기 있어요!
        self.my_value = 100
```
