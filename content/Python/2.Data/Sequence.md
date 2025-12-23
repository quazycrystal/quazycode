## [[Iterable]] 중 순서 있는 것: [[List]], [[Tuple]], [[String]], [[Range]]

|**기능**|**종류**|**예시**|
|---|---|---|
|**인덱싱**|`x[i]`|`(1, 2, 3)[1]` → 2|
|**슬라이싱**|`x[i:j]`|`"Hello"[1:3]` → "el"|
|**포함 확인**|`in`, `not in`|`3 in [1, 2, 3]` → True|
|**연결/반복**|`+`, `*`|`[1] + [2]` → [1, 2]|
|**위치 찾기**|**`.index(x)`**|`"ABC".index("B")` → 1|
|**개수 세기**|**`.count(x)`**|`(1, 1, 2).count(1)` → 2|


## Indexing(인덱싱)

### - 값 넣고 인덱스 구하기: `.index()`
1. index 구하기: 리스트 이름 `.index()`  
[[Python] 파이썬 index 함수 - 리스트에서 원하는 값의 인덱스 찾기](https://maktubi.tistory.com/94#google_vignette)  
.index()는 리스트에서 특정 원소의 인덱스를 반환  
   1) ==array.index(x)==: 리스트 'array'에서 값 x의 인덱스 반환  
   2) ==array.index(x, start)==: 리스트`array[start:]`에서 값 x의 인덱스 반환  
   3) ==array.index(x, start, stop)==: 리스트`array[start:stop]`에서 값 x의 인덱스 반환 (stop은 포함되지 않음. 즉 start부터 stop-1까지의 원소들만 포함)  

***
### - 인덱스 넣고 값 구하기: `list[index]`


[[Sorted()]]
[[Reversed()]]