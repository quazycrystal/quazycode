## 함수 사용 관련 팁

### 01. 파이썬의 함수 인자 전달

다른 언어를 주로 사용하던 입장에서, 함수 생성 시 type을 설정하지 않는 것부터 어색함을 느끼는 중입니다. 이에 더불어, Python은 call by value나 call by reference가 아니라, 객체에 대한 참조가 새로운 이름으로 바인딩되는 방식(**call by object reference**)을 사용하기에 생각해 볼 필요가 있을 듯 합니다...

**ex1) 불변 객체**

```python
def change1(x):
	x = x + 1

a = 10
change1(a)
print(a)
# 출력: 10
```

- a는 int 객체를 가리키고, 함수 내부에서 x = x+1은 새 int 객체를 만들어 다시 바인딩되기 때문에 호출자에는 영향을 미치지 않습니다.

**ex2) 가변 객체**

```python
def change2(lst):
	lst.append(100)
	
arr = [1, 2, 3]
change2(arr)
print(arr)
# 출력: [1, 2, 3, 100]
```

- arr과 lst는 같은 리스트 객체를 가리키고, append는 객체 자체를 수정하기 때문에 호출자에도 그대로 반영됩니다.
- 다만 같은 객체를 가리켰더라도, 함수 내에서 재할당을 하게 된다면 동작은 달라집니다.

**ex3) 재할당**

```python
def change3(lst):
	lst = lst + [100]
	
arr = [1, 2, 3]
change3(arr)
print(arr)
# 출력: [1, 2, 3]
```

- 함수 내부에서 lst가 재할당 되었기 때문에, 이 경우에는 호출자에는 영향이 가지 않습니다. 같은 list의 경우에도 in-place인지, reallocate인지에 따라 결과가 완전히 달라짐을 알 수 있습니다.

### 02. Non-keyword 가변 인자와 keyword 가변 인자 사용

인자의 개수가 고정되지 않은 경우에 사용하기 좋습니다.

이 역시 참조나 포인터 개념과는 무관하며, 인자를 모아서 전달하는 문법입니다.

**ex1) non-keyword 가변 인자(*args)**

```python
def func1(a, b, *args):
	print(a,b)
	print(args)

func1(1,2,3,4,5)
# 출력
# 1 2
# (3, 4, 5)
```

- args의 타입은 항상 tuple이며, 인자의 개수에 제한이 없습니다.
- 위치 인자만 받을 수 있습니다.

**ex2) keyword 가변 인자(**kargs)**

```python
def func2(a, b, **kargs):
	print(a, b)
	print(kargs)

func2(1, 2, x=3, y=4)
# 출력
# 1 2
# {'x': 1, 'y': 2}
```

- kargs의 타입은 항상 dict입니다.
- 옵션을 처리할 때 사용할 수 있습니다. (아래 코드)

```python
def connect(**kargs):
	timeout = kargs.get('timeout', 30)
	retry = kargs.get('retry', 3)
	
	print(timeout, retry)
	
connect(timeout=10)
# 출력: 10 3
```

- 옵션이 없을 시 기본값이 사용됩니다.