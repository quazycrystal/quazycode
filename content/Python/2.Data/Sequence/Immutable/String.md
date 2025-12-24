[파이썬 문자열 불변성 immutable 개념과 메모리 모델 총정리 - Y Information](https://yinternational.co.kr/%ED%8C%8C%EC%9D%B4%EC%8D%AC-%EB%AC%B8%EC%9E%90%EC%97%B4-%EB%B6%88%EB%B3%80%EC%84%B1-immutable-%EA%B0%9C%EB%85%90%EA%B3%BC-%EB%A9%94%EB%AA%A8%EB%A6%AC-%EB%AA%A8%EB%8D%B8-%EC%B4%9D%EC%A0%95%EB%A6%AC/)
Sequence이지만 불변 (tuple처럼)
### - 리스트끼리 묶어서 문자열로: `join()`:맨 뒤의 값을 삭제. 인자를 지정할 경우 특정 위치의 값을 삭제[#](https://www.lainyzine.com/ko/article/how-to-delete-elements-of-a-list-in-python/#table-of-content
iterable
### 💡 한 걸음 더: 리스트 전체를 쉼표로 연결하고 싶다면?

만약 리스트에 들어있는 모든 숫자를 `1, 2, 3` 처럼 예쁘게 합쳐서 보고 싶다면 파이썬의 `join`이라는 아주 유용한 기능을 사용합니다. (이건 나중에 더 익숙해지면 써보세요!)

Python

```
# 리스트 [1, 2, 3]을 "1, 2, 3" 문자열로 만들기
result = ", ".join(map(str, list_a))
print(result)
```

**결론:** `end=`은 오직 `print(...)` 괄호 안에서만 쓸 수 있다는 점만 기억하시면 됩니다!

혹시 지금 **"리스트의 값들을 한 줄로 쭉 출력하고 싶어서"** 저 코드를 작성하셨던 건가요? 그렇다면 방금 작성하신 전체 코드를 보여주시면 가장 적합한 출력 방식을 알려드릴게요. Would you like me to check your output logic?

### . `.join()`은 어디에 '소속'되어 있나요?

이게 가장 헷갈리는 부분인데, `.join()`은 리스트의 기능이 아니라 **문자열(String)의 메서드**입니다.

- **위계상의 위치:** `02_Types` 폴더 내의 **String(문자열)** 섹션, 혹은 `03_Functions` 폴더 내의 **String Methods** 서브 섹션에 들어갑니다.
    
- **정체:** 문자열이라는 데이터 타입이 태어날 때부터 가지고 있는 전용 무기입니다.
    

### 2. `.join()`은 어디에 '적용'할 수 있나요?

메서드는 문자열의 것이지만, 그 안에 **재료(Argument)**로 들어갈 수 있는 것들은 모든 **Iterable(반복 가능한 객체)**입니다.

사용자님이 정리하신 **Iterable** 자료형들이라면 다 받아줄 수 있어요:

- **리스트 (List):** `"-".join(["A", "B"])` (가장 많이 씀)
    
- **튜플 (Tuple):** `"-".join(("A", "B"))` (당연히 가능)
    
- **세트 (Set):** `"-".join({"A", "B"})` (가능하지만 순서가 무작위)
    
- **딕셔너리 (Dict):** `"-".join({"A": 1, "B": 2})` (키(Key)값들을 합침)
    

---

### 3. 적용 시 '절대 조건' (Constraint)

아무리 이터러블이라도 이 조건이 안 맞으면 에러가 납니다.

> **"주머니 안에 든 알맹이들이 반드시 '문자열(str)' 타입이어야 한다."**

- **성공:** `"".join(["1", "2", "3"])` (문자열 리스트)
    
- **실패:** `"".join([1, 2, 3])` (숫자 리스트 → `TypeError` 발생)

***
