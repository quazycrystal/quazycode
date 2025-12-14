### 1. 전역 변수 (Global variables)
반복문 안에서 전역 변수를 바꾸면 바뀌어 질까?
1) def (함수) 안이 아닌 경우: **아무런 제약 없이 바로 바꿀 수 있다.**
   파이썬의 `for`나 `while`문은 자신만의 '공간(Scope)'을 따로 만들지 않기 때문.
   
```  python
score = 0  # 전역 변수

for i in range(5):
    score += 10  # 그냥 바로 수정 가능

print(score)  # 결과: 50
```

2-1) def (함수) 안 일반적인 경우: 
**`global` 키워드**가 필요, 없으면 에러(`UnboundLocalError`) -> 값을 주고받을 때  함수를 호출하는 것이 더욱 안정적

``` python
total = 0

def add_points():
    global total  # "이 변수는 밖에 있는 전역 변수 total을 쓸 거야"라고 선언
    for _ in range(3):
        total += 1

add_points()
print(total)  # 결과: 3 (정상적으로 바뀜)
```

 2-2) def (함수) 안 변경 가능 (Mutable) 객체의 경우: 
 list, dict: global 없이 특정 함수 사용 (`append()`, `pop()` 등)할 수 있다.
 
    #### 단, `cart = [1, 2]` 처럼 리스트 자체를 아예 통째로 갈아끼울 때는 `global`이 필요!

```Python
cart = []  # 리스트 (전역 변수)

def add_items():
    items = ["사과", "배"]
    for item in items:
        cart.append(item)  # global 키워드 없어도 내용 추가 가능

add_items()
print(cart)  # 결과: ['사과', '배']
```

### 2. 함수 호출하여 값 주고 받기