### 생성자(Constructor)란?
`new`로 객체를 만들 때 실행되어, 그 객체를 **초기화**하는 코드

```java
class Minicar {
    private DoubleMotor motor;

    public Minicar(DoubleMotor motor) {   // 생성자
        this.motor = motor;
    }
}

Minicar car = new Minicar(new DoubleMotor());
```

#### 생김새 규칙
- 이름이 **클래스 이름과 같음**
- **반환 타입이 없음** (`void`도 쓰지 않음) -반환 타입을 적으면 컴파일 에러
- `new 클래스명(...)`으로만 호출됨. 메소드처럼 `car.Minicar()` 하고 직접 부를 수 없음 (JLS §8.8)
- 상속되지 않음 (JLS §8.2: constructors "are not members and therefore are not inherited")

#### 역할
`new Bicycle(30, 0, 8)`은 메모리에 객체 공간을 만들고(creates space in memory) 필드를 초기화(initializes its fields)함 — Oracle Java Tutorials

```
new Minicar(motor)
 ① 객체 공간 생성 (필드는 아직 null / 0)
 ② 생성자 실행 -> this.motor = motor   (필드 채움)
 ③ 완성된 객체를 반환
```

- 파라미터 `motor`: 생성자 실행 중에만 있는 임시 변수
- `this`: 지금 만들어지는 객체 자신
- `this.motor`: 그 객체의 필드 (생성자가 끝나도 남음)

#### 기본 생성자
- 생성자를 하나도 안 만들면 컴파일러가 **파라미터 없는 기본 생성자**를 자동으로 추가함 (JLS §8.8.9, Oracle Java Tutorials)
- 하나라도 직접 만들면 기본 생성자는 **추가되지 않음**
  -> `Minicar(DoubleMotor motor)`만 있으면 `new Minicar()`는 컴파일 에러

#### 오버로딩
파라미터 개수나 타입이 다르면 생성자를 여러 개 만들 수 있음. 파라미터 목록이 완전히 같으면 컴파일 에러 — Oracle Java Tutorials

#### 접근 제어자
생성자에도 `public`, `private` 등을 붙여 **어느 클래스가 이 생성자를 호출할 수 있는지** 제한할 수 있음 — Oracle Java Tutorials

---

### 생성자와 Getter / Setter의 관계
둘 다 `private` 필드에 값을 넣을 수 있는 통로지만, **언제, 몇 번** 넣을 수 있느냐가 다름

|          |생성자|setter|getter|
|---|---|---|---|
|하는 일|객체를 만들 때 필드를 **초기화**|만든 뒤 필드 값을 **변경**|필드 값을 **읽기**|
|호출 시점|`new` 할 때 **딱 한 번**|만든 뒤 **언제든, 여러 번**|만든 뒤 언제든|
|`final` 필드|값 대입 가능|대입 불가|읽기만 하므로 무관|
|호출 방법|`new 클래스명(...)`|`객체.setXxx(...)`|`객체.getXxx()`|
|이름|클래스 이름과 동일, 반환 타입 없음|관례상 `setXxx` (반환 `void`)|관례상 `getXxx` (반환 있음)|

```java
class Account {
    private final String owner;    // 생성자에서만 정해지고 이후 변경 불가
    private int balance;

    public Account(String owner, int balance) {   // 생성자: 시작값 세팅
        this.owner = owner;
        this.balance = balance;
    }

    public int getBalance() { return balance; }              // getter: 읽기
    public void setBalance(int balance) { this.balance = balance; }   // setter: 변경 (열면 언제든 바뀜)
}
```

- 생성자는 "태어날 때 한 번 정하는 값", setter는 "살아 있는 동안 계속 바꿀 수 있는 값"
- setter 없이 생성자로만 받고 `final`로 두면 **불변(immutable)** 객체가 됨
- 생성자도 검증을 넣을 수 있음 (`balance < 0`이면 예외). 처음부터 잘못된 상태의 객체가 만들어지는 것을 막음

#### 캡슐화 관점
> "Hiding internal state and requiring all interaction to be performed through an object's methods is known as data encapsulation." — Oracle Java Tutorials

- 같은 튜토리얼 예시: 기어가 6단뿐인 자전거라면, 기어를 바꾸는 메소드가 1~6 범위 밖의 값을 **거부**할 수 있음 -> 객체가 외부의 사용 방식을 스스로 통제함
- 검증 없는 setter는 이 통제를 포기하는 것과 같음 -> [[Getter_Setter]]의 문제 상황
- 값을 바꾸는 통로는 **의미 있는 메소드**(`withdraw()`)로 열고, 시작값은 생성자로 받는 것이 기본 방향

---

### Spring과의 관계
Spring의 DI 방식 중 생성자 주입 / setter 주입이 위 두 통로를 그대로 사용함

> "The Spring team generally advocates constructor injection, as it lets you implement application components as immutable objects and ensures that required dependencies are not `null`." — Spring Framework Reference

> "Setter injection should primarily only be used for optional dependencies that can be assigned reasonable default values within the class." — Spring Framework Reference

|          |생성자 주입|setter 주입|
|---|---|---|
|Spring 문서의 용도|필수 의존성|선택적 의존성|
|객체 상태|`new` 되는 순간 완전히 초기화됨|`new` 후 setter가 호출되기 전까지 비어 있을 수 있음 (`null`)|
|불변(`final`)|가능|불가|

- Spring 문서: 생성자 인자가 너무 많으면 "a bad code smell"로, 클래스 책임이 너무 많다는 신호
- 자세한 비교는 [[Basics_W2]] 참고

### 참고
- [Providing Constructors for Your Classes (Oracle Java Tutorials)](https://docs.oracle.com/javase/tutorial/java/javaOO/constructors.html)
- [What Is an Object? (Oracle Java Tutorials)](https://docs.oracle.com/javase/tutorial/java/concepts/object.html)
- [JLS §8.8 Constructor Declarations](https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.8)
- [JLS §8.8.9 Default Constructor](https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.8.9)
- [Dependency Injection :: Spring Framework](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)
