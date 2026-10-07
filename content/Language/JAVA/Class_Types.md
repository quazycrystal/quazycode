### 클래스의 종류

|종류|키워드|한 줄 정리|
|---|---|---|
|구상(구체) 클래스|`class`|필드와 메소드가 전부 구현돼 있어서 `new`로 바로 객체를 만들 수 있음|
|인터페이스|`interface`|"무엇을 할 수 있는가"의 약속(규격)만 정의. 구현은 구현체가 책임짐|
|추상 클래스|`abstract class`|공통 구현은 가지되, 일부 메소드는 비워 두고 자식이 채우게 함. `new` 불가|

```java
// 구상 클래스
public class CardPayment { 
    public void pay(int amount) { /* 카드 결제 */ }
}

// 인터페이스
public interface PaymentService {
    void pay(int amount);
}

// 추상 클래스
public abstract class BasePayment implements PaymentService {
    protected void log(int amount) { System.out.println(amount + "원 결제"); }  // 공통 구현
    public abstract void pay(int amount);                                      // 자식이 구현
}
```


| |구상 클래스|인터페이스|추상 클래스|
|---|---|---|---|
|`new`로 생성|가능|불가|불가|
|메소드 구현|전부 구현|(기본적으로) 선언만|일부 구현 + 일부 선언|
|필드(상태)|가질 수 있음|상수만|가질 수 있음|
|상속 / 구현|`extends` 1개|`implements` 여러 개|`extends` 1개|
|용도|실제 동작하는 객체|역할 / 규격 정의|공통 코드 재사용 + 틀 제공|

### 구체 타입 vs 인터페이스 의존

```java
// 구체 타입에 의존: CardPayment가 바뀌거나 다른 결제로 바꾸면 OrderService도 수정
public class OrderService {
    private CardPayment payment = new CardPayment();
}

// 인터페이스에 의존: 어떤 구현체가 와도 OrderService는 그대로
public class OrderService {
    private final PaymentService payment;

    public OrderService(PaymentService payment) {
        this.payment = payment;
    }
}
```

- 구체 타입 의존 -> 결합도 높음 (교체·테스트가 어려움)
- 인터페이스 의존 -> 결합도 낮음 (구현체를 바꿔 끼울 수 있음)
- 결합도가 생기는 상황 정리는 [[Object_Oriented]]

### 다형성 → DI 연결

**다형성**: 같은 타입(인터페이스)으로 다루지만, 실제로 어떤 구현체가 들어 있느냐에 따라 동작이 달라지는 것

```java
PaymentService payment = new CardPayment();   // 같은 타입
payment = new KakaoPayment();                 // 구현체만 교체, 호출 코드는 그대로
payment.pay(1000);
```

그럼 "어떤 구현체를 넣어줄지"는 누가 정하나?
-> 클래스 안에서 `new` 하면 다시 구체 타입에 묶임
-> **밖에서 만들어서 넣어 주자 = DI (의존성 주입)**

정리하면 `인터페이스 + 다형성`이 구현체를 바꿔 끼울 수 있게 해 주고, `DI`가 그걸 실제로 끼워 주는 역할을 한다. Spring에서의 DI는 [[Basics_W2]] 참고
