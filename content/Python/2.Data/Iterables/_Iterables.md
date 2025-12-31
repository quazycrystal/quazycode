# `for` 문에 넣어서 하나씩 꺼낼 수 있는 모든 것
Sequence (List, Tuple, Str, Range, Bytes (이진 데이터)) + Non-sequense ([[Dictionary]], [[Set]]) + Stream (Generator, File),  
[파이썬 iterable(이터러블) 데이터 타입(자료형) 및 iterable 뜻(의미) : 네이버 블로그](https://blog.naver.com/PostView.nhn?blogId=youndok&logNo=222200162081)



 it
slicing 가능


iterable 쓴 함수는 generator
### - Iterable인지 알아보기
isinstance(), iter() 함수 사용
print(isinstance(li, Iterable))

### 메모리 효율 순위 (적음 → 많음)

1. **불리언 (Boolean):** `True`, `False`만 표현하면 되므로 가장 작습니다.
    
2. **정수/실수 (Integer/Float):** 고정된 바이트(보통 4~8바이트)를 사용하여 숫자를 저장합니다.
    
3. **문자열 (String):** 문자들이 다닥다닥 붙어 있는 형태입니다. 인덱스 정보나 포인터가 없어 효율적입니다.
    
4. **튜플 (Tuple):** 리스트와 비슷하지만 **'수정 불가능(Immutable)'**합니다. 수정 기능이 빠져 있어 리스트보다 가볍습니다.
    
5. **리스트 (List):** 데이터를 추가/삭제할 수 있어야 하므로 여유 공간을 미리 확보해두며, 각 요소의 주소값(포인터)을 별도로 저장하기 때문에 무겁습니다.
    
6. **딕셔너리 / 셋 (Dict / Set):** 데이터를 빠르게 찾기 위해 '해시 테이블'이라는 복잡한 구조를 사용합니다. 빈 공간을 많이 만들어둬야 속도가 나기 때문에 메모리를 가장 많이 소모합니다.
- **`123` (정수):** 약 28 bytes
    
- **`"123"` (스트링):** 약 52 bytes
    
- **`(1, 2, 3)` (튜플):** 약 64 bytes
    
- **`[1, 2, 3]` (리스트):** 약 88 bytes
    
- **`{1, 2, 3}` (셋):** 약 216 bytes
    
- **`{'a':1, 'b':2, 'c':3}` (딕셔너리):** 약 232 bytes