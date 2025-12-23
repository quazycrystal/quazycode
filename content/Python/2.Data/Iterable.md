# `for` 문에 넣어서 하나씩 꺼낼 수 있는 모든 것
Sequence (List, Tuple, Str, Range) + Non-sequense ([[Dictionary]], [[Set]])
특수: Generator, File, Bytes (이진 데이터)

[파이썬 iterable(이터러블) 데이터 타입(자료형) 및 iterable 뜻(의미) : 네이버 블로그](https://blog.naver.com/PostView.nhn?blogId=youndok&logNo=222200162081)
**시퀀스 (Sequence)****문자열 (str)**`"Python"`글자 하나씩 꺼냄**리스트 (list)**`[1, 2, 3]`가장 범용적인 이터러블**튜플 (tuple)**`(1, 2, 3)`수정 불가능한 이터러블**레인지 (range)**`range(10)`숫자 범위를 생성함**바이트 (bytes)**`b'hello'`이진 데이터 처리용**비시퀀스 (Non-Seq)****딕셔너리 (dict)**`{"a": 1}`**Key**를 기본으로 꺼냄**세트 (set)**`{1, 2, 3}`중복 없는 주머니**특수 (Advanced)****제너레이터 (Generator)**`(x for x in r)`필요할 때만 값을 생성 (메모리 절약)**파일 객체 (File)**`open('f.txt')`파일의 한 줄씩 꺼냄




 it
slicing 가능


iterable 쓴 함수는 generator

### - Iterable인지 알아보기
isinstance(), iter() 함수 사용
print(isinstance(li, Iterable))