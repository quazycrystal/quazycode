[[파이썬] 딕셔너리 Dictionary 추가, 삭제, 접근, 함수 정리 : 네이버 블로그](https://m.blog.naver.com/xoxo_pch/222706606666)
[[Python 입문 강좌 - 11] 파이썬 딕셔너리(Dictionary) 정리 및 사용법](https://ctkim.tistory.com/entry/Python-%EC%9E%85%EB%AC%B8-%EA%B0%95%EC%A2%8C-11-%ED%8C%8C%EC%9D%B4%EC%8D%AC-%EB%94%95%EC%85%94%EB%84%88%EB%A6%AC)

##### d = {i:0 for i in range(10)} # dict도 컴프리헨션 가능

1. 딕셔너리 자료형의 items()

```python
a_dict = {'a':10, 'b':20, 'c':30}

# for word, num in a_dict: -> 오류 발생
for word, num in a_dict.items():
    print(word,num)

# print(a_dict.items()[1]) -> 오류 발생
print(list(a_dict.items())[1])
```
딕셔너리 자료형을 사용하면서 종종 나온 실수라 적어보았습니다.
dict의 각 key와 value 값을 출력하고 싶을때, 딕셔너리 자료형을 그대로 받는것은 오류가 발생하고, items()를 활용하면 결과값을 잘 받을 수 있습니다.
하지만 그렇다고 items()가 리스트 자료형을 만드는 것은 아니라는 점을 망각하면 위와 같은 인덱스 오류가 발생할 수 있습니다.

2. 2차원 배열
```python
arr = [[0]*100 for _ in range(100)]

n = int(input())
for _ in range(n):
    x, y = map(int,input().split())
    for i in range(x-1,x+9):
        for j in range(y-1,y+9):
            arr[i][j] = 1

ans = 0
for x in arr:
    ans += sum(x)
print(ans)
```
백준 2563번 색종이 문제입니다. 2차원 리스트를 반복문을 통해 채우는 것이 처음에는 어색하였는데 층을 쌓아올린다는 느낌으로 이해하니 반복문 순서를 구상하는 것에 어려움이 줄었습니다. 만드는 리스트를 한층씩 쌓아올라가야하니 행 먼저, 그 후에 열을 쌓는 식으로 구상하니 2차원 생성에 어려움이 줄었던 것 같습니다. 
3. 에라토스테네스의 체 알고리즘
```python
N = int(input())
num_list = list(map(int, input().split()))

arr = [True] * 1001
arr[0] = arr[1] = False

for i in range(2, 32):
    if not arr[i]:
        continue
    for j in range(2 * i, 1001, i):
        arr[j] = False

ans = 0
for num in num_list:
    if arr[num]:
        ans += 1
print(ans)
```
백준 1978번 소수 찾기에서 소수에 관한 알고리즘이 있었던 기억이 있어서 작성했습니다. 에라토스테네스의 체라는 알고리즘입니다.기본 원리는 작은 수들의 배수를 전체 배열(문제 조건 상 1000까지였습니다)에서 false로 바꾸는 것으로 소수들의 배수를 제거하는 식으로 소수를 걸러내는 알고리즘입니다.