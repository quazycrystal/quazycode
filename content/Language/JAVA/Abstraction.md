### 추상화 (Abstraction)

"무엇을 하는지(What)"만 정의하고 "어떻게 하는지(How)"는 숨김. 자바에서는 인터페이스 (Interface)나 추상 클래스 (Abstract Class)로 표현 (위 다형성 예시의 `PaymentService`가 바로 추상화)

- 캡슐화와의 차이: 캡슐화는 **데이터를 보호**하는 것, 추상화는 **무엇을 드러낼지 단순화**하는 것
- Spring에서: `OrderService`가 `PaymentService`(추상)에만 의존하고, 실제 구현체는 컨테이너가 주입
