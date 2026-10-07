### Getter, Setter란?

세터 게터도 private으로 할 때 있음 - 상속 문제

`private` 필드를 밖에서 다루기 위해 열어 두는 메서드
	animal 클래스 child - 사용 변수 (age, name) - oop 상속

- **getter**: 꺼내기 (Read) (`getBalance()`)
- **setter**: 바꾸기 (Write) (`setBalance(int balance)`)
==필드가 private여도 이 구멍을 통해 값을 읽고 바꿀 수 있게 됨== 
-> 결합도 키우고, Debugging Nightmare가 열릴 수 있음

결합도·응집도, 캡슐화, Tell Don't Ask는 [[Object_Oriented]] 참고

**SW Architect 관점**
Class diagram 뿐 아니라 Dynamic model (Sequence diagram)을 써서, 각 메소드의 기능 뿐 아니라 ==뭘 주고받는지==까지 정의 필요 [[UML_Diagram]]

#### 문제 상황 예시
Account 클래스에 Balance라는 잔액 관리 변수와 메소드 (잔액 부족 시 에러 띄우기)를 만들어 뒀는데, getter / setter 열어둠 

-> OrderService라는 다른 클래스에서 `원 클래스 이름.getter, setter` 를 통해 밖에서 접근 가능!

```java
public class Account {
    private int balance;

    public int getBalance() { return balance; }
    public void setBalance(int balance) { this.balance = balance; }
}
// OrderService 에서
if (account.getBalance() >= amount) {
    account.setBalance(account.getBalance() - amount);
}
```

문제점
1. **규칙이 밖으로 샌다**: 외부에서 의도치 않게 값을 갖다 쓰거나, 추적이 어려운 에러가 생길 수 있다.
   ==특히 Setter는 변수 값도 바꿔버릴 수 있음==
2. **리팩토링이 어렵다**: 바깥 클래스가 내부 구조를 다 알고 있어서, 구조가 바뀌면 그걸 get / set 하던 모든 곳을 같이 고쳐야 한다.

#### 문제 상황 해결 예시
값 ==꺼내지 않고==, 그 값을 가진 객체에 ==요청== (Tell, Don't Ask) [[Object_Oriented]]

```java
account.withdraw(amount);
```

1. 결합도 낮아짐: 바깥 클래스는 기능만 알면 되고, 내부 구조 몰라도 됨
2. 응집도 높아짐: 규칙 여러 곳 -> 한 곳 (Account 클래스 내부 잔액 처리), 규칙 깰 외부 변수 사라짐

### 그럼 getter, setter는 언제 쓰는가?
getter/setter는 자바 문법이 아니라 **JavaBeans 스타일 관례**(`getXxx`, `setXxx`, boolean은 `isXxx`)임.
문제는 코드를 **외부와 주고받는 경계**(JSON, 요청 파라미터, DB)에서 라이브러리/프레임워크가 이 관례를 전제로 동작하는 경우가 있다는 것.

#### 1. 꼭 필요하거나, 쓰는 게 현실적인 경우 (외부 경계)

|상황|필요한 것|setter가 꼭 필요한가|
|---|---|---|
|**JPA 엔티티**|public 또는 protected **인자 없는 생성자 필수**, 클래스/필드 `final` 불가. 접근 방식은 필드(field access) 또는 getter/setter(property access) 중 선택|**아님.** 필드 접근이면 없어도 됨. property access를 쓸 때만 필요|
|**JSON 직렬화/역직렬화 (Jackson)**|getter/setter 또는 public 필드로 읽고 씀. 인자 있는 생성자(`@JsonCreator`)도 가능|**아님.** 기본 방식이 setter일 뿐 생성자로 대체 가능|
|**Spring MVC 요청 바인딩 (`@ModelAttribute`)**|기본 생성자 + setter, 또는 primary constructor (둘 다 기본 적용)|**아님.** 생성자 바인딩이 가능|
|**JavaBeans 규약 기반 도구**|`getXxx`/`setXxx` 이름 규칙으로 프로퍼티를 찾음|도구에 따라 다름|

- **엄격한 제약**은 사실상 JPA의 "인자 없는 생성자 + `final` 불가"처럼 **문서에 못 박힌 것**뿐
- getter/setter는 "프레임워크가 **기본으로** 쓰는 통로"일 뿐, 대부분 생성자 방식으로 **대체 가능**
- 이 경계에서 쓰는 클래스는 **DTO(데이터를 나르는 용도)** 로 분리해서, 도메인 객체에는 setter를 안 여는 방식이 일반적

> JPA: "The entity class must have a no-arg constructor." / "The persistent state of an entity is accessed by the persistence provider runtime either via JavaBeans style property accessors ('property access') or via instance variables ('field access')." — Jakarta Persistence 3.1 §2.1
> Jackson: 생성자 인자에 `@JsonCreator`/`@JsonProperty`를 쓰면 되고, "it is not required to define a default constructor" — jackson-databind README
> Spring MVC: "By default, both constructor and property data binding are applied." — Spring Framework Reference (`@ModelAttribute`)

#### 2. 바꾸는 게 좋은 경우
setter를 **보안/설계상 줄이는 게 좋은** 경우

|상황|문제|대안|
|---|---|---|
|요청을 받는 객체에 setter를 다 열어둠|요청 파라미터로 의도하지 않은 필드까지 바뀔 수 있음. Spring 문서가 "for security reasons"로 전용 객체 사용 또는 **생성자 바인딩만 쓰기**를 권장하고, setter 바인딩을 쓰면 `allowedFields`로 제한하라고 안내|요청 전용 DTO + 생성자 바인딩|
|도메인 규칙이 있는 객체 (`Account` 등)|`setBalance()`로 규칙(잔액 부족 검사)을 우회 가능|행동 메서드 (`withdraw()`)|
|JPA 엔티티의 setter|아무 곳에서나 상태를 바꿔 추적이 어려움 (JPA가 setter를 **요구하는 것은 아님**)|의미 있는 메서드 (`changeName()`), 필드 접근 사용|
|서비스 클래스 (`OrderService` 등)|setter를 열 이유가 없음|생성자 주입 + `final` ([[Basics_W2]])|
|이미 만든 객체 값이 중간에 바뀌면 안 되는 경우|setter가 열려 있으면 언제든 바뀜|생성자로 한 번만 받고 `final` (불변 객체) [[Constructor]]|

> "...for security reasons it is recommended either to use an object tailored specifically for web binding, or to apply constructor binding only." — Spring Framework Reference

위 표의 "행동 메서드로 대체" 같은 대안은 규격이 아니라 **설계 원칙**임 (Tell, Don't Ask) [[Object_Oriented]]

#### 3. 그냥 써도 되는 경우
|상황|getter|setter|
|---|---|---|
|DTO (요청/응답 데이터를 담는 클래스)|사용|필요하면 사용하되, 가능하면 생성자 방식|
|화면 표시, 로그 등 단순 조회|사용|-|

기본 원칙은 **getter는 필요한 만큼만, setter는 가능하면 만들지 않기**.
프레임워크가 요구할 때는 **그 경계 클래스(DTO 등)에만** 쓰고, 도메인 로직이 있는 객체로는 번지지 않게 하기.

setter 대신 생성자로 한 번만 받고 `final`로 고정하는 방법은 [[Basics_W2]] (생성자 주입) 참고

### 참고
- [Jakarta Persistence 3.1 Specification (§2.1 The Entity Class)](https://jakarta.ee/specifications/persistence/3.1/jakarta-persistence-spec-3.1.html)
- [Spring MVC: @ModelAttribute](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.html)
- [jackson-databind README](https://github.com/FasterXML/jackson-databind)
