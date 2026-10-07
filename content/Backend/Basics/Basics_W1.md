
## 1. 백엔드 큰 그림

웹 서비스는 세 덩어리로 나뉩니다.

```
클라이언트  ──HTTP 요청──▶   서버(백엔드)   ──SQL──▶   DB
(브라우저/앱) ◀─HTTP 응답──  (Spring Boot)  ◀─데이터──  (MySQL)
  화면 담당       (JSON)     비즈니스 로직        데이터 저장
```

- **클라이언트**: 화면 보여주고 요청을 보냄
- **서버**: 요청을 규칙대로 처리하고 DB와 대화 → **우리가 만들 부분**
- **DB**: 데이터 저장/조회

> 비유: 손님(클라이언트)이 주문하면 점원(서버)이 창고(DB)에서 재료를 꺼내 요리해 내어줍니다. 손님은 창고에 직접 못 들어갑니다.

---

## 2. HTTP / REST

**HTTP** = 클라이언트와 서버가 약속한 대화 형식. 요청 하나에 응답 하나가 짝을 이룹니다. (서버는 이전 요청을 기억 안 함 = **무상태**)

**메서드(동사)**

|메서드|의미|비고|
|---|---|---|
|`GET`|조회|데이터를 가져오기만 함|
|`POST`|생성|새 자원을 만듦|
|`PUT`|전체 수정|자원 전체를 통째로 교체|
|`PATCH`|부분 수정|자원의 일부 필드만 수정|
|`DELETE`|삭제|자원을 제거|

**상태 코드**: `2xx`(성공) · `4xx`(내 요청 잘못) · `5xx`(서버 잘못)

**REST** = HTTP를 "자원(URL) + 행위(메서드)"로 쓰자는 규칙.

```
❌ GET /getUser?id=1        ✅ GET    /users/1   (조회)
❌ POST /createUser         ✅ POST   /users     (생성)
❌ GET /deleteUser?id=1     ✅ DELETE /users/1   (삭제)
```

**흐름 예시 — 회원 1번 조회**

```
브라우저  ─GET /users/1─▶  서버  ─SELECT─▶  DB
브라우저  ◀─200 OK {id:1}─  서버  ◀─(결과)─  DB
```

---

## 3. Spring vs Spring Boot

**Spring** = 자바 백엔드 대표 프레임워크. 그런데 **설정이 너무 번거로웠습니다** (XML 잔뜩, 톰캣 별도 설치, 버전 충돌).

**Spring Boot** = Spring을 **쉽게 쓰게 해주는 껍데기**. (대체가 아니라, Boot 안에 Spring이 들어있음)

||Spring|Spring Boot|
|---|---|---|
|설정|수동|**자동**|
|라이브러리|직접 버전 맞춤|**Starter로 묶음**|
|서버|톰캣 별도 설치|**내장** (`java -jar`로 실행)|

---

## 4. 자동 설정 (Auto-configuration) — 이번 주 핵심 ⭐

프로젝트에 항상 있는 이 한 줄에 마법이 압축돼 있습니다.

```
@SpringBootApplication
   ├── @Configuration           → 설정 클래스 표시
   ├── @EnableAutoConfiguration → ⭐ 자동 설정 ON
   └── @ComponentScan           → 하위 패키지 Bean 자동 등록
```

**동작 원리**

```
① 추가된 라이브러리를 본다   ("웹 라이브러리가 있네?")
② 조건에 맞으면 설정을 켠다  ("→ 내장 톰캣, MVC 자동 등록")
③ 내가 직접 설정했으면       ("→ 내 설정이 우선")
```

- **Starter**: `starter-web` 하나 추가 → 관련 라이브러리가 버전까지 맞춰 딸려옴 → 자동 설정이 감지해서 켜줌
- 그래서 **XML 0줄, 톰캣 설치 0번**으로 `main()` 실행하면 서버가 뜹니다.

The Core Infrastructure (Spring Engine)  
Spring Boot relies completely on the fundamental design patterns built into the core Spring Framework.

- **Inversion of Control (IoC)**: A design principle where the control of object creation, configuration, and lifecycle management is transferred from the application code to the framework container.
- **Dependency Injection (DI)**: The concrete pattern used to achieve IoC. Instead of a class instantiating its own dependencies (causing tight coupling), Spring "injects" required objects at runtime.
- **Spring Beans**: Any Java object that is initialized, assembled, and managed by the Spring IoC container.
- **ApplicationContext**: The actual engine or container that intercepts your code, instantiates the beans, and wires them together based on your configuration.

[https://start.spring.io/](https://start.spring.io/) - Easily initialize a spring boot session

---

## 5. Docker

**문제**: "제 컴퓨터에선 되는데요?" — 사람마다 환경(자바 버전 등)이 달라 생기는 에러.  
**해결**: Docker는 **"앱 + 실행 환경"을 통째로 상자에 담아** 어디서든 똑같이 돌아가게 함.

|용어|의미|
|---|---|
|**Dockerfile**|이미지를 어떻게 만들지 적어놓은 설명서 — 붕어빵 **레시피**|
|**이미지(Image)**|설계도 (정적) — 붕어빵 **틀**|
|**컨테이너(Container)**|실행한 실체 (동적) — 실제로 나온 **붕어빵**|

```
Dockerfile ─build─▶  이미지  ─run─▶  컨테이너
 (붕어빵 레시피)      (붕어빵 틀)     (붕어빵)
```

> 컨테이너는 VM과 달리 OS를 통째로 안 갖고 **Host OS 커널을 공유** → 가볍고 빠름.

---

## 6. 💬 토론 질문 (핵심 3개)

1. **왜 클라이언트가 DB에 직접 접근하지 않고 서버를 거칠까?** 직접 접근하면 어떤 문제가 생길까? _(백엔드의 존재 이유)_
2. **자동 설정은 편하지만, 속에서 뭐가 켜지는지 모르고 쓰면 어떤 문제가 생길까?** 내가 직접 설정한 게 자동 설정보다 우선하는 건 왜 좋을까? _(Spring Boot 자동 설정의 장단점)_
3. **Docker 없이 팀이 개발하면 구체적으로 어떤 문제가 생길까?** _(환경 문제와 Docker)_

---

## 7. 🧩 퀴즈

**Q1. (1. 백엔드 큰 그림)** 서버 계층 없이 클라이언트가 DB에 직접 접근하는 구조의 문제점으로 옳지 않은 것은?  
① 클라이언트마다 DB 계정 정보를 나눠 가져야 해서 보안 위험이 커진다  
② 검증·계산 같은 로직을 클라이언트마다 중복으로 구현해야 한다  
③ 웹 브라우저와 모바일 앱이 서로 다른 화면 디자인을 가지게 된다  
④ DB 구조가 바뀌면 모든 클라이언트 코드를 함께 수정해야 한다

- 정답
    
    ③ — 화면 디자인 차이는 프레젠테이션 계층의 문제이지 서버-DB 구조와는 무관함. 서버가 있든 없든 웹/앱 화면은 원래 다를 수 있음. 나머지는 실제로 "서버 없이 DB 직접 접근" 구조에서 생기는 진짜 문제.
    

---

**Q2. (2. HTTP / REST, OX)** HTTP는 무상태(stateless)이므로, 서버는 같은 사용자의 이전 요청 내용을 자동으로 기억한다.

- 정답
    
    X — 무상태는 서버가 이전 요청을 **기억하지 않는다**는 뜻. 그래서 로그인 유지 같은 건 세션/토큰 등 별도 장치가 필요함.
    

---

**Q3. (2. HTTP / REST)** REST 스타일에 가장 맞는 "회원 1번 삭제" 요청은?  
① `GET /deleteUser?id=1`  
② `POST /deleteUser`  
③ `DELETE /users/1`  
④ `GET /users/1/delete`

- 정답
    
    ③ — REST는 "무엇"은 URL(`/users/1`), "어떻게"는 HTTP 메서드(`DELETE`)로 나눠서 표현함. 나머지는 행위를 URL에 넣은 방식.
    

---

**Q4. (2. HTTP / REST)** 존재하지 않는 회원 번호(예: `/users/9999`)로 조회했을 때 가장 알맞은 응답 상태 코드는?  
① 200 OK  
② 404 Not Found  
③ 500 Internal Server Error  
④ 301 Moved Permanently

- 정답
    
    ② — 없는 자원을 요청한 것은 **클라이언트 쪽 문제**이므로 4xx(404). 500은 서버 내부 오류일 때 사용.
    

---

**Q5. (3. Spring vs Spring Boot, OX)** Spring Boot를 사용하면 톰캣(WAS)을 별도로 설치해서 앱을 배포해야 한다.

- 정답
    
    X — Spring Boot는 **내장 톰캣**을 포함하고 있어서 `java -jar`로 바로 실행할 수 있음.
    

---

**Q6. (4. 자동 설정)** `@SpringBootApplication`에 포함되지 않는 것은?  
① Configuration  
② EnableAutoConfiguration  
③ ComponentScan  
④ RestController

- 정답
    
    ④ — @RestController는 컨트롤러에 따로 붙이는 애너테이션.
    

---

**Q7. (4. 자동 설정)** 자동 설정과 같은 종류의 설정을 개발자가 직접 정의했을 때 어떻게 동작할까?  
① 에러가 발생한다  
② 자동 설정이 우선 적용된다  
③ 개발자가 직접 한 설정이 우선하고, 자동 설정은 물러난다  
④ 두 설정이 모두 적용되어 충돌한다

- 정답
    
    ③ — 자동 설정은 "기본값"일 뿐이라, 내가 직접 설정하면 **내 설정이 우선**함.
    

---

**Q8. (5. Docker)** 이미지와 컨테이너 관계로 옳은 것은?  
① 이미지=실행체, 컨테이너=설계도  
② 이미지=설계도, 컨테이너=실행체  
③ 둘은 같다

- 정답
    
    ② — 이미지=틀, 컨테이너=찍어낸 붕어빵
    

---

**Q9. (5. Docker)** 컨테이너가 가상 머신(VM)보다 가볍고 빠르게 시작되는 가장 큰 이유는?  
① 코드를 자동으로 압축해서 실행하기 때문에  
② 컨테이너마다 OS를 통째로 갖지 않고 Host OS의 커널을 공유하기 때문에  
③ 하드웨어를 사용하지 않기 때문에  
④ 네트워크를 사용하지 않기 때문에

- 정답
    
    ② — VM은 각자 Guest OS를 통째로 실행하지만, 컨테이너는 Host OS 커널을 공유해서 훨씬 가벼움.
    

### 더 알아볼 내용 (질문)

DAO, DTO, VO

MVC (Model, View, Controller)

HTTP는 정확히 뭔지? 정보 전달 형식? 주소? - 주소 없이도 request 가능.. 전달 형식 (O)

HTTPS = 보안 encryption 추가 TLS = transport layer security

Rest API는 리소스를 기준으로 움직임.

클라이언트 - 서버 구조, 무상태성, 캐시 가능성, 계층적 구조 (내 파트만 보수해도 되게 모듈화 됨), 통일된 인터페이스 (리소스 기준)
