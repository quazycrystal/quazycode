[[Python] enumerate 함수 사용법, 동작 원리 및 특징 (예제 포함)](https://dotiromoook.tistory.com/37)
**반복 가능한(iterable) 객체를 다룰 때, 인덱스와 요소를 함께 가져올 수 있도록 도와주는 내장 함수**

인덱스 따로 관리 안 해도 되어서 편리
```python
p_dict = dict(enumerate(p)) #{0: 'X', 1: 'Y', 2: 'P', 3: 'V'}

#인덱스가 key이므로 str비교하려면 또 값을 찾아야 함.
# 패턴 매칭같은거에 쓰려면 str을 key로 만들어야 

p = "water" n = len(p) # 문자를 키로, 역순 인덱스를 값으로
p_dict = {char: n - 1 - i for i, char in enumerate(p)} # {r: 0, e: 1, t: 2, a: 3, w: 4}
```

## enumerate 사용 시 주의할 점
앞에 숫자 몇 번 부터 시작할 지도 정할 수 있음
``` python
fruits = ['사과', '포도', '바나나']

for idx, fruit in enumerate(fruits):
    print(f'{idx}번 과일 {fruit}') # 0번 과일 사과 \n 1번 과일 포도 \n 2번 과일 바나나

for idx, fruit in enumerate(fruits, 1):
    print(f'{idx}번 과일 {fruit}') # 1번 과일 사과 \n 2번 과일 포도 \n 3번 과일 바나나

arr = [1,2,3,4]
enum_arr = enumerate(arr)

for i, v in enum_arr:
    print(i, v)         # 아무 것도 출력되지 않음

# 반복문 안에서 여러 번 사용하려면 list()로 변환 필요
for i, v in list(enum_arr):
    print(i, v)
'''
0 1
1 2
2 3
3 4
'''
```