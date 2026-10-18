### 다형성 (Polymorphism)

같은 타입(인터페이스)으로 여러 구현체를 다루고, 실제로 실행되는 동작은 **실제 객체**가 결정함

**1. 정의하기 (Defining): 인터페이스 + 구현체**

```java
interface PaymentService {                       // 공통 타입 (약속)
    void pay(int amount);
}

class CardPayment implements PaymentService {    // 구현체 1
    @Override
    public void pay(int amount) {
        System.out.println("[카드] " + amount + "원 결제");
    }
}

class KakaoPayment implements PaymentService {   // 구현체 2
    @Override
    public void pay(int amount) {
        System.out.println("[카카오페이] " + amount + "원 결제");
    }
}
```

**2. 사용하기 (Using): 인터페이스 타입으로 다루기**

```java
PaymentService payment = new CardPayment();    // 타입은 인터페이스, 실제 객체는 구현체
payment.pay(10000);                            // CardPayment의 pay 실행

payment = new KakaoPayment();                  // 구현체를 바꿔도
payment.pay(10000);                            // 호출하는 코드는 그대로, 실행되는 동작만 달라짐
```

```
[카드] 10000원 결제
[카카오페이] 10000원 결제
```

- 왼쪽 타입(`PaymentService`): 컴파일러가 보는 것, 호출할 수 있는 메소드를 정함
- 오른쪽 객체(`CardPayment`, `KakaoPayment`): 실제 메모리에 있는 것, 어떤 `pay()`가 실행될지 정함
- 어떤 pay가 실행될지는 **실제 객체**를 보고 실행 시점에 결정됨 (동적 바인딩, Dynamic Binding)
- DI에서 `OrderService`가 `PaymentService`(인터페이스)에만 의존하는 게 바로 이 다형성 덕분
