### - 리스트 순서 뒤집기, 새로운 변수에 저장 가능
[파이썬의 reversed() 함수로 거꾸로 루프 돌리기 (vs. slicing 연산자 & reverse() 함수) | Engineering Blog by Dale Seo](https://www.daleseo.com/python-reversed/)  
문법:
범위: #Sequence

Sequence 자료형이면 모두 가능  
==내림차순 정리 아님!!!== sorted(reverse=True)와 헷갈리지 않게 주의

```python
my_list = [1, 2, 3, 4, 5]
my_list.reverse()
print (mylist)
[5, 4, 3, 2, 1]
```

단 원래 리스트를 reversed() 괄호 안에 넣고, 다시 ==리스트로 싸줘야 한다.==  
역으로 하나씩 접근하는 듯?  
list(reversed(my_list)) 이렇게
