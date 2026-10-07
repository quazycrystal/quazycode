### 객체지향 설계의 목표: 결합도↓, 응집도↑

- **결합도(Coupling)**: 클래스끼리 서로를 얼마나 깊이 알고 기대는가. 낮을수록 한쪽을 고쳐도 다른 쪽이 덜 흔들림
- **응집도(Cohesion)**: 한 클래스 안의 데이터와 기능이 하나의 책임에 얼마나 모여 있는가. 높을수록 찾기 쉽고 고치기 쉬움

|방식|결합도|응집도|
|---|---|---|
|캡슐화 (`private` + 규칙을 함께 둠)|낮춤|높임|
|getter/setter 남발 [[Getter_Setter]]|높아짐 (내부 구조가 드러남)|낮아짐 (규칙이 밖으로 흩어짐)|
|객체에게 일 시키기 (`withdraw()`)|낮춤|높임|

### 캡슐화란(Encapsulation)?
클래스 안에 데이터 숨기기 (`private`) + 메소드로 그 데이터 다루는 로직도 포함

-> 다른 클래스가 그 안의 변수를 직접 못 건드리게 함

잔액 변경 예시
```java
public class Account {
    private int balance;  // 숨김

    public void withdraw(int amount) {  // 규칙도 여기에
        if (amount > balance) throw new IllegalStateException("잔액 부족");
        balance -= amount;
    }
}
```

이렇게 하면 `balance`는 `withdraw()`를 통해서만 바뀌고, 잔액 부족 시 에러가 나는 규칙도 설정할 수 있다.

-> 객체 지향 언어에 걸맞는 설계 (결합도↓, 응집도↑)

### Tell, Don't Ask
값을 ==꺼내서== 밖에서 판단하지 말고, 그 값을 가진 객체에게 ==요청==한다.

```java
// Ask: 꺼내서 밖에서 판단
if (account.getBalance() >= amount) {
    account.setBalance(account.getBalance() - amount);
}

// Tell: 객체에게 시킴
account.withdraw(amount);
```

### 디미터 법칙 (Law of Demeter)
가장 가까운, 직접 아는 객체에게만 대화 걸기

안 좋은 예시: getter를 줄줄이 부르면 구조가 바뀔 때 깨진다.
```java
int balance = order.getCustomer().getAccount().getBalance();
```

좋은 예시: 한 번만 거치기
```java
int balance = order.getCustomerBalance();
```

더 좋은 예시: 값 자체를 안 부르고 판단을 시키기
```java
if (order.canPay()) { ... }   // 판단을 시킴
order.pay();                  // 행동을 시킴
```

### 결합도가 생기는 7가지 상황

|#|상황|예시|줄이는 방법|
|---|---|---|---|
|1|`new`로 구체 클래스를 직접 생성|`new CardPayment()`|밖에서 주입 (DI) [[Basics_W2]]|
|2|구체 타입에 의존|`CardPayment payment;`|인터페이스에 의존 [[Class_Types]]|
|3|getter 체이닝|`a.getB().getC()`|디미터 법칙, 판단을 객체에 위임|
|4|규칙을 밖에서 처리|`if (getBalance() >= amount)`|규칙을 그 데이터를 가진 객체 안으로|
|5|전역 / static 사용|`Config.INSTANCE`, `Util.calc()`|필요한 객체를 주입|
|6|호출 순서에 의존|`init()` 후에 `run()` 해야 동작|생성자에서 완성된 상태로 만들기|
|7|데이터 형식에 의존|`"2026-01-01"` 문자열 포맷을 서로 약속|타입으로 표현 (`LocalDate`), 형식은 한 곳에서만 다루기|

### 헷갈리는 개념 구분

|개념|한 줄 정리|언제|
|---|---|---|
|DI (의존성 주입)|함께 일하는 **동료 객체**를 **생성 시** 주입|객체가 만들어질 때 한 번|
|파라미터|**호출마다** 바뀌는 데이터 전달|메소드를 부를 때마다|
|캡슐화|**데이터와 판단**을 같은 곳에 둠|클래스를 설계할 때|

```java
public class OrderService {
    private final PaymentService paymentService;   // DI: 동료 객체, 생성 시 주입

    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    public void order(int amount) {                // 파라미터: 호출마다 달라지는 데이터
        paymentService.pay(amount);
    }
}
```

관련 노트: [[Getter_Setter]], [[Class_Types]], [[Basics_W2]]
