[[Python] enumerate 함수 사용법, 동작 원리 및 특징 (예제 포함)](https://dotiromoook.tistory.com/37)

```python
p_dict = dict(enumerate(p)) #{0: 'X', 1: 'Y', 2: 'P', 3: 'V'}

#인덱스가 key이므로 str비교하려면 또 값을 찾아야 함.
# 패턴 매칭같은거에 쓰려면 str을 key로 만들어야 

p = "water" n = len(p) # 문자를 키로, 역순 인덱스를 값으로
p_dict = {char: n - 1 - i for i, char in enumerate(p)} # {r: 0, e: 1, t: 2, a: 3, w: 4}



```