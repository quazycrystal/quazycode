### - 거꾸로 정렬: `reversed(), .reverse()`

```python
my_list = [1, 2, 3, 4, 5]
my_list.reverse()
print (mylist)
[5, 4, 3, 2, 1]
```

==`reversed()`==
function (점 없음), ==새로운 변수에 저장 가능==, 단 원래 리스트를 reversed.() 괄호 안에 넣고, 다시 ==리스트로 싸줘야 한다.== 역으로 하나씩 접근하는 듯?
list(reversed(my_list)) 이렇게

==`.reverse()`==
method (점 있음), ==아예 원본이 바뀜==