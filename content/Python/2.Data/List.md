## Mutable [[Sequence]] (가변 시퀀스)
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
### `pop()`: 맨 뒤의 값을 삭제. 인자를 지정할 경우 특정 위치의 값을 삭제[#](https://www.lainyzine.com/ko/article/how-to-delete-elements-of-a-list-in-python/#table-of-contents)

스택의 pop, push 개념을 알고있다면, 리스트의 `pop()` 메서드도 쉽게 이해할 수 있습니다. `pop()` 메서드는 리스트의 마지막 요소를 삭제합니다. 단순히 삭제만 하는 것은 아니고, 이 마지막 값을 반환해줍니다.

```
primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
print(primes.pop())
# => 29
```

인자를 지정할 경우 특정 인덱스의 값을 삭제하고 반환받을 수 있습니다. 이 때 첫 번째 값의 인덱스는 0이며, 마지막 값을 지정하고자 하는 경우 음수 -1을 지정할 수 있습니다. 단, 존재하지 않는 인덱스를 지정할 경우 IndexError 에러가 발생합니다.

```
>>> print(primes.pop(0))
2
>>> print(primes.pop(-1))
19

>>> print(primes.pop(10))
---------------------------------------------------------------------------
IndexError                                Traceback (most recent call last)
Input In [69], in <cell line: 1>()
----> 1 print(primes.pop(10))

IndexError: pop index out of range
```

단, `pop()` 메서드의 기본적인 원리상 중간에 있는 값을 지정할 경우 [시간 복잡도가 O(n)이므로 주의가 필요합니다](https://wiki.python.org/moin/TimeComplexity).


## 순서 변형
[[Python] sort(reverse=True), reverse() 차이](https://m.blog.naver.com/wideeyed/221745432175)
### - 오름차순/내림차순 정렬: `.sort() (key=..., reverse=...)`
문법: 리스트 이름.sort(), 리스트 이름.sort(reverse=True)  

==아예 원본이 바뀜== -> 순서 있고 바꿀 수 있는 list 전용  
새로운 변수에 저장하려면: `new_list = sorted(my_list))`  

***
### - 그냥 원본 뒤집기: `.reverse()`
문법: 리스트 이름.reverse()  
==아예 원본이 바뀜== -> 순서 있고 바꿀 수 있는 list 전용  
==내림차순 아님!!!==  
새로운 변수에 저장하려면: `new_list = list(reversed(my_list))`  

## 복사 (원본 보존용)
불변 객체(튜플, 문자열)는 값이 안 변하니 복사본이 굳이 필요 없지만, 리스트는 원본 보호를 위해 복사 기능이 중요

- **`.copy()`**: 리스트의 **얕은 복사(Shallow Copy)**본을 만듭니다. (`list[:]`와 같은 역할)
### - 동일한 길이의 리스트 쌍으로 묶기
dictionary도 있지만 zip()으로 
[[Zip()]]








