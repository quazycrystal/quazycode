문법: `zip(*iterable 이중list 이름)`, 또는 묶고 싶은 iterable 쌍으로 `zip(alpha, index)`  
범위: #Iterable  

동일한 갯수로 이루어진 자료형을 ==튜플==로 묶기
만약 다른 갯수로 이루어진 자료형 묶으면 가장 짧은 쪽에 맞춰 나머지는 버려짐.
`ex) list(zip([1, 2], ['a', 'b', 'c']))` → `[(1, 'a'), (2, 'b')]`

==전치 행렬 만들때 쓰임== -> 앞에 list 붙이기 `list(zip(*arr))`
```python
arr = [(1, 'a'), (2, 'b'), (3, 'c')]

# zipped라는 리스트 안에 든 3개의 튜플을 각각 독립된 인자로 뿌려줌
# zip((1, 'a'), (2, 'b'), (3, 'c')) 와 같은 효과!
numbers, letters = zip(*arr)

print(numbers) # (1, 2, 3)
print(letters) # ('a', 'b', 'c')

print(list(zip(*arr)))  # [(1, 2, 3), ('a', 'b', 'c')]
print(list(zip(numbers, letters))) # [(1, 'a'), (2, 'b'), (3, 'c')] 다시 원본
```
##### 하나를 여럿으로 터뜨리기:  
   `numbers, letters = zip(*arr)` [[Asterisk]]와 함께 쓰면 터뜨려서 각각 변수에 할당  
##### 여럿을 하나로 합치기: 순서 반대로  
   `list(zip(numbers, letters))` 하면 인덱스 같은 요소끼리 쌍쌍이로 합침  
   
이런 식으로 comprehension 연산도 가능:
`[x + y for x, y in zip(list_a, list_b)]`
