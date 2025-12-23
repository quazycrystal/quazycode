### - 한꺼번에 다 읽어옴: `sys.stdin.read()`
문법: all_lines = sys.stdin.read().splitlines()
개행 라인별로 리스트 저장
##### 반면 [[Input()]]: 한 줄씩만 받음
세 줄 받으려면 세 번 쓰거나 for 문 써야 한다.
쓸모 없는 input은 저장 안 하고 실행만 시켜서 날리기
input()에 변수 지정 안 하기
```python
# input
# 안녕
# 난
# 네가 좋아

all_lines = sys.stdin.read().splitlines() #['안녕', '난', '네가 좋아']
all_lines3 = data[2] #['네가 좋아']
words = all_lines3.split() #['네가', '좋아']
```

-> 어차피 둘 다 골라서 빼 오는 건 안되고 전체 순서대로 다 불러와야 한다.

