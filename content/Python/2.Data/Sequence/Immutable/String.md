[파이썬 문자열 불변성 immutable 개념과 메모리 모델 총정리 - Y Information](https://yinternational.co.kr/%ED%8C%8C%EC%9D%B4%EC%8D%AC-%EB%AC%B8%EC%9E%90%EC%97%B4-%EB%B6%88%EB%B3%80%EC%84%B1-immutable-%EA%B0%9C%EB%85%90%EA%B3%BC-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EB%AA%A8%EB%8D%B8-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
[파이썬 repr() 함수 - str()과의 차이점 : 네이버 블로그](https://blog.naver.com/PostView.nhn?blogId=youndok&logNo=222068498186)
[[PYTHON] 문자열(String) 완벽 가이드 : 기초부터 고급 활용까지](https://devhandbook.tistory.com/entry/PYTHON-%EB%AC%B8%EC%9E%90%EC%97%B4String-%EC%99%84%EB%B2%BD-%EA%B0%80%EC%9D%B4%EB%93%9C-%EA%B8%B0%EC%B4%88%EB%B6%80%ED%84%B0-%EA%B3%A0%EA%B8%89-%ED%99%9C%EC%9A%A9%EA%B9%8C%EC%A7%80)
[R, Python 분석과 프로그래밍의 친구 (by R Friend) :: [Python] 파이썬 문자열 처리를 위한 다양한 메소드 (Python string methods)](https://rfriend.tistory.com/327)

##### 공백 없이 ''로 리스트 채울 수 있다

Sequence이지만 불변 (tuple처럼)
Sequence이므로 인덱싱, 슬라이싱 등 순서 관련 기능 가능
불변 자료형이므로 원칙적으로는 추가, 삭제, 변형, 복사 불가. 저런 기능들이 가능해 보이는 것은 새로운 문자열 만들기 때문

Python에서는 UFT-8 인코딩 -> len()함수 주의 유니코드는 문자 하나당으로 길이 셈
```python
print(len(str(123))) # 3

print(len(str(3.14))) # 4 (소수점도 한 글자)

print(len("hello world")) # 11 (영어도 한 글자씩 셈)

print(len("아이 배부르다")) # 7 (한글도 한 글자씩 셈)

print(len(" ")) #1 (공백도 길이 1)

# 한글과 영어 byte 수 다른데 유니코드로 하면 메모리가 아니라 글자 수만 보므로 같음

# ASCII는 아예 한글을 표현 못함

  

text_en = "hello"

text_ko = "안녕하세요"

  

# 1. 글자 수 확인 (len)

print(len(text_en)) # 5

print(len(text_ko)) # 5 -> 유니코드 기반이므로 글자 수는 동일하게 5

  

# 2. 바이트 수 확인 (UTF-8 인코딩 시)

print(len(text_en.encode('utf-8'))) # 5 (영어는 글자당 1바이트)

print(len(text_ko.encode('utf-8'))) # 15 (한글은 글자당 3바이트)
```


주요 메소드
### - 리스트끼리 묶어서 문자열로: `join()`
문법: 새로운 변수 = "구분자".join(iterable)

``` python
# 리스트 [1, 2, 3]을 "1, 2, 3" 문자열로 만들기

full_list = [1, 2, 3]
result = ", ".join(map(str, full_list))
print(result)


#리스트 [1, 2, 3]을 "123" 문자열로 만들기

result = "".j
```

- **리스트 (List):** `"-".join(["A", "B"])` (가장 많이 씀)
- **튜플 (Tuple):** `"-".join(("A", "B"))` (당연히 가능)
- **세트 (Set):** `"-".join({"A", "B"})` (가능하지만 순서가 무작위)
- **딕셔너리 (Dict):** `"-".join({"A": 1, "B": 2})` (키(Key)값들을 합침) .
==단 주머니 안에 든 알맹이들이 반드시 '문자열(str)' 타입 이어야==

- **성공:** `"".join(["1", "2", "3"])` (문자열 리스트)
- **실패:** `"".join([1, 2, 3])` (숫자 리스트 → `TypeError` 발생)

##### List의 원소를 모두 이어서 출력할 때

```python
import time

# += 연산자와 join 함수 모두 같은 동작을 하지만 join 함수가 압도적으로 빠릅니다. (해당 코드를 넣어 확인하실 수 있습니다.)
# += 연산자는 두 문자열을 더하는 과정을 거의 length만큼 반복하지만, join은 한 번에 처리하기 때문입니다.

length = 1000000
arr = ["a" for idx in range(length)]

# Case 1. +=로 더하기

start_time = time.time()

ans1 = ""
for character in arr:
    ans1 += character

end_time = time.time()

print(f'Case 1 : {end_time - start_time}')

# Case 2. join 활용하기

start_time = time.time()

ans2 = "".join(arr)

end_time = time.time()

print(f'Case 2 : {end_time - start_time}')
```

***

replace() 
[Python - 문자열에서 특정 문자 바꾸기](https://codechacha.com/ko/python-replace-string-in-string/)
split()
isalpha()
str()도 있지만 디버깅용 repr()도 있음

같은 문자가 있으면 앞에서 돌리는지 뒤에서 돌리는지가 차이나겠다
### find(): 
문자열에 매개변수로 입력한 문자열이 있는지를 앞에서 부터 찾아 index 반환, 없으면 '-1' 반환
### rfind() 
문자열에 매개변수로 입력한 문자열이 있는지를 뒤에서 부터 찾아 index 반환, 없으면 '-1' 반환
```python
# find() : Search forwards, Determine if str occurs in string and return the index

>>> a = 'I Love Python'

>>> a.find('o')

3
# rfind() : Same as find(), but search _backwards_ in string

>>> a = 'I Love Python'


```

**index() :  find()와 기능 동일하나, 매개변수로 입력한 문자열이 없으면 ValueError 발생**
**rindex() : index()와 기능 동일하나, 뒤에서 부터 매개변수의 문자열이 있는지를 찾음**

```python
# index(): Same as find(), but raises an exception if str not found

>>> a = 'I Love Python'

>>> a.index('o')

3

>>> a.index('k') # ValueError: substring not found

Traceback (most recent call last):

# rindex(): Same as index(), but search backwards in string

>>> a = 'I Love Python'

>>> a.rindex('o')

11

>>> a.rindex('k') # ValueError: substring not found

Traceback (most recent call last):
```
