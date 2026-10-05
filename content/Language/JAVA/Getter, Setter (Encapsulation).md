### 캡슐화란(Encapsulation)?
클래스 안에 데이터 숨기기 (private) + 메소드로 그 데이터 다루는 로직도 포함

-> 다른 클래스가 그 안의 변수를 직접 못 건드리게 함

잔액 변경을 
```java
public class Account {
    private int balance;  // 숨김

    public void withdraw(int amount) {  // 규칙도 여기에
        if (amount > balance) throw new IllegalStateException("잔액 부족");
        balance -= amount;
    }
}
```

이렇게 하면 `balance`는 `withdraw()`를 거쳐서만 바뀌고, "잔액보다 많이 뺄 수 없다"는 규칙이 항상 지켜져요.

## 2. getter, setter란?

`private` 필드를 밖에서 다루기 위해 열어 두는 메서드예요.

- **getter**: 필드 값을 **꺼내는** 메서드 (`getBalance()`)
- **setter**: 필드 값을 **바꾸는** 메서드 (`setBalance(int balance)`)

java

```java
public class Account {
    private int balance;

    public int getBalance() { return balance; }
    public void setBalance(int balance) { this.balance = balance; }
}
```

필드는 `private`이지만, 이 두 메서드를 통해 누구나 값을 읽고 바꿀 수 있게 돼요.

## 3. 함정: 다 열면 public과 같아요

필드마다 getter/setter를 기계적으로 만들면, `private`으로 숨긴 의미가 사라져요. 다른 클래스에서 출금을 이렇게 처리하게 돼요.

java

```java
// OrderService 에서
if (account.getBalance() >= amount) {
    account.setBalance(account.getBalance() - amount);
}
```

이 코드에는 두 가지 문제가 있어요.

- **규칙이 밖으로 새요.** "잔액이 부족하면 출금 불가"라는 규칙이 `Account`가 아닌 바깥에 있어요. 출금하는 곳마다 같은 코드가 흩어지고, 한 곳이라도 검사를 빠뜨리면 잔액이 음수가 돼요.
- **내부 구조가 드러나요.** 바깥 클래스가 `balance`라는 필드가 있다는 것까지 알아야 해요. 필드 구조를 바꾸면 이 코드도 모두 고쳐야 해요.

특히 setter는 "아무 값이나 넣을 수 있는 문"이라서, `account.setBalance(-1000)`처럼 규칙을 완전히 건너뛸 수 있어요.

## 4. 대안: 값을 꺼내지 말고, 객체에게 일을 시키기

값을 꺼내서 밖에서 판단하는 대신, 객체에게 하고 싶은 일을 요청해요. 이걸 **"Tell, Don't Ask"** 원칙이라고 해요.

java

```java
// Before: 꺼내서 밖에서 판단
if (account.getBalance() >= amount) {
    account.setBalance(account.getBalance() - amount);
}

// After: 객체에게 시킴
account.withdraw(amount);
```

- 규칙은 `Account` 한 곳에만 있어요. 규칙이 바뀌어도 `Account`만 고치면 돼요.
- 바깥 클래스는 `withdraw()`라는 기능만 알면 되고, 내부 필드는 몰라도 돼요.
- `setBalance()`가 필요 없어지니, 규칙을 우회할 문도 사라져요.

## 5. getter 체이닝과 디미터 법칙

getter를 줄줄이 이어 부르는 것도 내부 구조를 드러내는 대표적인 패턴이에요.

java

```java
String city = order.getCustomer().getAddress().getCity();
```

`order` 하나만 쓰는 것 같지만, 실제로는 `Customer`와 `Address`의 구조까지 다 알고 있어요. `Address` 구조가 바뀌면 이 줄도 깨져요.

**디미터 법칙**은 "직접 아는 객체하고만 대화하라"는 원칙이에요. 필요한 정보는 가장 가까운 객체에게 물어봐요.

java

```java
String city = order.getShippingCity();
```

## 6. 그럼 getter, setter는 언제 써요?

|상황|getter|setter|
|---|---|---|
|DTO (요청/응답 데이터를 담는 클래스)|사용|필요하면 사용 (프레임워크가 값을 채울 때)|
|JPA 엔티티|조회용으로 사용|가급적 만들지 않고 의미 있는 메서드로 대체 (`changeName()`)|
|화면 표시, 로그 등 단순 조회|사용|-|
|서비스 클래스 (`OrderService` 등)|거의 필요 없음|만들지 않음|
|도메인 규칙이 있는 객체 (`Account` 등)|필요한 것만|만들지 않고 행동 메서드로 대체 (`withdraw()`)|

기본 원칙은 **getter는 필요한 만큼만, setter는 가능하면 만들지 않기**예요.

## 7. 결합도와 응집도로 정리하기

객체지향 설계의 목표는 **"결합도는 낮추고, 응집도는 높인다"**예요.

- **결합도(Coupling)**: 클래스끼리 서로를 얼마나 깊이 알고 기대는가. 낮을수록 한쪽을 고쳐도 다른 쪽이 덜 흔들려요.
- **응집도(Cohesion)**: 한 클래스 안의 데이터와 기능이 하나의 책임에 얼마나 모여 있는가. 높을수록 찾기 쉽고 고치기 쉬워요.

|방식|결합도|응집도|
|---|---|---|
|캡슐화 (`private` + 규칙을 함께 둠)|낮춤|높임|
|getter/setter 남발|높아짐 (내부 구조가 드러남)|낮아짐 (규칙이 밖으로 흩어짐)|
|객체에게 일 시키기 (`withdraw()`)|낮춤|높임|

## 8. DI로 이어지기

지금까지는 **데이터**를 숨기는 이야기였어요. W2에서 배우는 DI(의존성 주입)는 같은 원칙을 **함께 일하는 객체(의존 객체)**로 넓힌 거예요.

java

```java
@Service
public class OrderService {
    private final PaymentService paymentService;  // setter 없음

    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
```

생성자로 한 번만 받고 `final`로 고정하면, setter라는 문을 만들지 않아도 돼요. 이게 Spring이 **생성자 주입**을 권장하는 이유 중 하나예요. 자세한 내용은 W2. DI 페이지에서 다뤄요.

## 참고

- [Object Oriented Programming (dev.java)](https://dev.java/learn/language/oop/)