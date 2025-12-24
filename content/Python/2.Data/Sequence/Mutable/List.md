## Mutable [[_Sequence]] (가변 시퀀스)
Iterable - Sequence 중에서도 내용 편집 가능한 것
2차원 이상 List는 [[Array]]에 서술
##### 수정까지 가능해야 쓸 수 있는 추가, 삭제, 변형, 복사 등의 기능  
'.' 있는 메소드 - 변수 정의 필요 없는 명령문

## 요소 추가
[Python - 리스트 추가 (append, insert, extend)](https://codechacha.com/ko/python-list-append-insert-extend/)
### - 덩어리로 맨 뒤에 추가: 리스트 이름 `.append()
문법: 리스트 이름.insert(값)
 ```python
# 이렇게 하면 a가 사라지고 None(아무것도 없음)이 됩니다.
a = a.append(3) #-> X
# 그냥 명령만 내리세요. a는 알아서 변해 있습니다.
a.append(3) #-> O
```

***
### - 풀어서 맨 뒤에 추가: `.extend()`
문법: 리스트 이름.insert(값)
괄호 안의 요소들을 풀어서 각각 추가.
ex) `a.extend((1,2))`하면 1, 2 각각 추가. split(), list()처럼

***
### - 중간에 새치기: 리스트 이름 `.insert(i, x)`
문법: 리스트 이름.insert(인덱스, 값)

``` python
nums = [10, 20, 30]

# 문법: .insert(몇번째, 넣을값)
# 1번 인덱스(두 번째 자리)에 15를 넣어라!
nums.insert(1, 15)

print(nums)
# 결과: [10, 15, 20, 30] (원래 있던 애들은 뒤로 한 칸씩 밀려남)
```

## 요소 삭제
[[Python] 리스트 요소 삭제: clear, del, remove, pop](https://www.lainyzine.com/ko/article/how-to-delete-elements-of-a-list-in-python/#table-of-contents)
### - 모든 요소 삭제: `.clear()`
문법: 리스트 이름.clear() -> 그 리스트는 빈 리스트가 됨
범위: ==가변 객체 (List, Dictionary, Set)== #Mutable

***
### - 처음 검색된 값 삭제: `.remove()`
문법: 리스트 이름.clear(값) (인덱스 아님!)
`remove()`는 ==값==으로 검색해서 요소를 삭제할 수 있다
==같은 값이 여럿이면 맨 처음 거 사라짐==
```python
fruits = ['lemon', 'apple', 'banana', 'apple', 'apple']
fruits.remove('apple')
print(fruits) #fruits[1] 사라짐
['lemon', 'banana', 'apple', 'apple']

```
존재하지 않는 값을 검색하는 경우 ValueError 발생

*** 
### - 맨 나중 값 빼서 반환: `.pop()`
스택의 pop, push 개념과 유사, 맨 마지막 요소 뾱 빼서 돌려줌
##### 인자 지정 후 특정 인덱스에도 적용 가능
일반 인덱스 다루는 것과 같음
마지막 값을 지정하고자 하는 경우 음수 -1
`pop()` 메서드의 기본적인 원리상 ==중간에 있는 값을 지정할 경우 시간 복잡도가 O(n)==
get이나 이런거는 복잡도 O(1)이니까 중간 거 뽑으려면 .pop()이 그닥
[list 함수별 시간 복잡도](https://wiki.python.org/moin/TimeComplexity)

```python
primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
>>> print(primes.pop(0))
2
>>> print(primes.pop(-1))
19

>>> print(primes.pop(10))
IndexError: pop index out of range 

```

## 순서 변형
[[Python] sort(reverse=True), reverse() 차이](https://m.blog.naver.com/wideeyed/221745432175)
### - 오름차순/내림차순 정렬: `.sort() (key=..., reverse=...)`
문법: 리스트 이름.sort(), 리스트 이름.sort(reverse=True)
==아예 원본이 바뀜== -> 순서 있고 바꿀 수 있는 list 전용
새로운 변수에 저장하려면: [[Sorted()]]`new_list = sorted(my_list))`

***
### - 그냥 원본 뒤집기: `.reverse()`
문법: 리스트 이름.reverse()
==아예 원본이 바뀜== -> 순서 있고 바꿀 수 있는 list 전용
==내림차순 아님!!!==
새로운 변수에 저장하려면: [[Reversed()]]`new_list = list(reversed(my_list))`

## 복사
[[python] 파이썬 얕은 복사, 깊은 복사 (copy, deepcopy, [:], =) 총 정리](https://blockdmask.tistory.com/576)
불변 객체는 값이 변하면 주소도 무조건 바뀌지만 ==가변 객체 (List, Dictionary, Set)==는 주소는 그대로 두고 값을 바꿀 수가 있음 - 공통적으로 사용
범위: #Mutable
### - 얕게 복사: `.copy(), [:]`
문법: 리스트 이름. copy(), 리스트 이름.[:]
이름은 다른데 주소는 같음. 결국 같은 거, 하나 바꾸면 나머지도 바뀜

***
### - 깊게 복사: `.deepcopy()`
문법: 리스트 이름. deepcopy()
이름도 다르고 주소 다름. 아예 빼 놓기