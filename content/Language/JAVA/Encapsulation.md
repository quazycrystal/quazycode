### 캡슐화 (Encapsulation)
`private` + 메소드로만 접근

```java
class Account {
    private int balance;                 // 밖에서 직접 못 건드림

    public void deposit(int amount) {    // 입금이라는 '행동'으로만 변경
        if (amount <= 0) throw new IllegalArgumentException();
        balance += amount;
    }

    public int getBalance() {
        return balance;
    }
}
```

```java
Account account = new Account();
account.deposit(5000);          // OK: 정해진 통로로만 변경
account.deposit(-100);          // IllegalArgumentException: 클래스가 스스로 규칙을 지킴
// account.balance = -999;      // 컴파일 에러: private이라 접근 불가
```

- 아무 로직 없는 `setBalance()`를 public으로 열어두면 필드를 public으로 연 것과 같음
- Spring에서: `private final` 필드 + 생성자 주입으로 의존 객체를 밖에서 바꾸지 못하게 보호 [[Basics_W2]]
