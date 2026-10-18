2026.09.29 (화) 저녁 8시 (비대면)

### 0. 이번 주 지도

위에서 아래로, 큰 것 안에 작은 것이 들어 있는 구조

```
웹 서비스
├── 클라이언트 (화면)
├── 서버 = 백엔드 (우리가 만들 부분)
│   ├── 역할 층: Controller -> Service -> Repository      (1.2)
│   └── 층 사이를 오가는 객체: DTO / Entity / VO           (1.3)
├── DB (데이터 저장)
└── 클라이언트 <-> 서버 통신 규약: HTTP / REST             (2)
```

- 1: 백엔드 큰 그림 (웹 서비스 -> 서버 -> 층 -> 객체)
- 2: HTTP / REST (클라이언트와 서버가 대화하는 규칙)
- 3~4: Spring Boot (서버를 만드는 도구와 자동 설정)
- 5: Docker (서버를 어디서든 똑같이 실행하는 방법)

### 1. 백엔드 큰 그림

#### 1.1 웹 서비스: 3덩어리

```
클라이언트  ──HTTP 요청──▶   서버(백엔드)   ──SQL──▶   DB
(브라우저/앱) ◀─HTTP 응답──  (Spring Boot)  ◀─데이터──  (MySQL)
  화면 담당       (JSON)     비즈니스 로직        데이터 저장
```

- **클라이언트**: 화면을 보여주고 요청을 보냄
- **서버(백엔드)**: 요청을 규칙대로 처리하고 DB와 대화 -> **우리가 만들 부분**
- **DB**: 데이터 저장/조회

> 비유: 손님(클라이언트)이 주문하면 점원(서버)이 창고(DB)에서 재료를 꺼내 요리해 내어줌. 손님은 창고에 직접 못 들어감

#### 1.2 서버(백엔드) 안쪽: 역할 층 (Layer)

서버 코드는 한 덩어리가 아니라 **클라이언트와 맞닿는 입구부터 DB까지, 역할별로 나눈 층**으로 만듦

```
클라이언트 -> Controller -> Service -> Repository(DAO) -> DB
              (요청 접수)    (업무 처리)   (DB 접근)
```

|층|역할|비유 (식당)|
|---|---|---|
|Controller|클라이언트와 **직접 만나는 입구**. HTTP 요청을 받고 응답을 돌려줌. 업무는 Service에 넘김|홀 직원 (주문 받기, 음식 내기)|
|Service|**비즈니스 로직**(업무 규칙) 처리. "무엇을 어떤 순서로 할지"|요리사 (레시피대로 조리)|
|Repository (DAO)|DB 읽기/쓰기만 담당 (SQL, JPA)|창고 담당 (재료 꺼내고 넣기)|

- 비즈니스 로직 = 서비스의 규칙. 예: "재고가 있어야 주문 가능", "포인트는 결제 금액의 1% 적립"
- 위층이 아래층을 호출함 (Controller -> Service -> Repository), 거꾸로는 호출하지 않음
- 왜 나누나
    - 한 층만 바꾸면 됨: DB를 바꿔도 Service는 그대로, 응답 형식을 바꿔도 Repository는 그대로
    - 테스트와 재사용이 쉬움: Service만 따로 테스트, 같은 Service를 여러 Controller가 사용
    - 층끼리는 인터페이스로 연결되고 DI로 주입됨 ([[Basics_W2]], [[Basics_W3]])

#### 1.3 층 사이를 오가는 객체: DTO, Entity, VO, DAO

층이 나뉘면 층 사이에서 **데이터를 담아 옮기는 객체**가 필요함

|이름|한 줄 정리|쓰이는 곳|예|
|---|---|---|---|
|**DTO** (Data Transfer Object)|데이터를 **옮기기만** 하는 객체. 로직 없음|클라이언트 <-> Controller <-> Service|`OrderRequest`(요청), `OrderResponse`(응답)|
|**Entity**|**DB 테이블 한 행**과 1:1로 대응하는 객체|Service <-> Repository <-> DB|`Order`, `Member`|
|**VO** (Value Object)|**값 그 자체**를 나타내는 객체. 불변, 값이 같으면 같은 것|어디서든|`Money(1000원)`, `Address`|
|**DAO** (Data Access Object)|객체가 아니라 **DB에 접근하는 쪽**|Repository 층|`OrderRepository`|

헷갈리는 쌍 3개
- **DTO vs Entity**
    - DTO = 밖과 주고받는 용 (요청/응답 모양), Entity = 안(DB)과 맞춘 모양
    - Entity를 그대로 응답에 쓰면 DB 구조가 밖에 노출되고, DB를 바꾸면 응답도 같이 바뀜 -> DTO로 변환해서 내보냄
- **DTO vs VO**
    - 둘 다 "데이터를 담는 객체"지만 목적이 다름
    - DTO는 **옮기려고** 만든 것, VO는 **값을 표현**하려고 만든 것 (값이 같으면 동일, 한 번 만들면 안 바뀜)
- **DAO vs Repository**
    - DAO는 전통적인 이름 (DB 접근 객체), Spring에서는 보통 Repository라 부르고 하는 일은 거의 같음 (JPA는 [[Basics_W5]])
    - Service와 헷갈리지 않기: Service = 업무 규칙, DAO/Repository = DB 접근만

#### 1.4 예시 흐름: 주문 생성 `POST /orders`

```
① 클라이언트 -> Controller   : JSON을 OrderRequest(DTO)로 받음
② Controller -> Service      : OrderRequest를 넘김
③ Service                    : 재고 확인, 금액 계산 (비즈니스 로직)
                               DTO를 Order(Entity)로 변환
④ Service -> Repository      : Order를 저장 요청
⑤ Repository -> DB           : INSERT
⑥ Service -> Controller      : 결과를 OrderResponse(DTO)로 만들어 반환
⑦ Controller -> 클라이언트    : JSON 응답
```

- Controller는 HTTP 이야기만, Service는 업무 이야기만, Repository는 DB 이야기만 함

```java
@RestController
class OrderController {
    private final OrderService orderService;

    @PostMapping("/orders")
    OrderResponse create(@RequestBody OrderRequest request) {   // DTO로 받고 DTO로 돌려줌
        return orderService.create(request);                    // 업무는 Service에 위임
    }
}
```

- MVC (Model, View, Controller)는 같은 아이디어를 웹 화면 기준으로 부르는 이름

### 2. HTTP / REST

클라이언트와 서버가 대화할 때 지키는 **규약**. 위 1.4의 ①과 ⑦ (클라이언트 <-> Controller 구간)이 이 규약으로 오감

- **HTTP** = 메시지를 주고받는 **형식**
- **REST** = HTTP 위에서 API를 **어떻게 설계할지**의 규칙 (HTTP를 쓰는 스타일)

#### 2.1 HTTP

요청 하나에 응답 하나가 짝을 이룸. 서버는 이전 요청을 기억하지 않음 = **무상태 (Stateless)**

**메서드 (동사)**: 무엇을 하려는지

|메서드|의미|비고|
|---|---|---|
|`GET`|조회|데이터를 가져오기만 함|
|`POST`|생성|새 자원을 만듦|
|`PUT`|전체 수정|자원 전체를 통째로 교체|
|`PATCH`|부분 수정|자원의 일부 필드만 수정|
|`DELETE`|삭제|자원을 제거|

**상태 코드**: 결과가 어땠는지
- `2xx` 성공 / `4xx` 내 요청 잘못 / `5xx` 서버 잘못

#### 2.2 REST

HTTP를 "**자원(URL) + 행위(메서드)**"로 쓰자는 설계 규칙
- 무엇(자원)은 URL, 어떻게(행위)는 메서드로 나눠서 표현

```
❌ GET /getUser?id=1        ✅ GET    /users/1   (조회)
❌ POST /createUser         ✅ POST   /users     (생성)
❌ GET /deleteUser?id=1     ✅ DELETE /users/1   (삭제)
```

**흐름 예시: 회원 1번 조회**

```
브라우저  ─GET /users/1─▶  서버  ─SELECT─▶  DB
브라우저  ◀─200 OK {id:1}─  서버  ◀─(결과)─  DB
```

### 3. Spring vs Spring Boot

서버(백엔드)를 만드는 도구

**Spring** = 자바 백엔드 대표 프레임워크. 그런데 **설정이 너무 번거로웠음** (XML 잔뜩, 톰캣 별도 설치, 버전 충돌)

**Spring Boot** = Spring을 **쉽게 쓰게 해주는 껍데기** (대체가 아니라, Boot 안에 Spring이 들어있음)

||Spring|Spring Boot|
|---|---|---|
|설정|수동|**자동**|
|라이브러리|직접 버전 맞춤|**Starter로 묶음**|
|서버|톰캣 별도 설치|**내장** (`java -jar`로 실행)|

### 4. 자동 설정 (Auto-configuration)

프로젝트에 항상 있는 이 한 줄에 압축돼 있음 ([[Basics_W3]]: Bean과 Component Scan 참조)

```
@SpringBootApplication
   ├── @Configuration           -> 설정 클래스 표시
   ├── @EnableAutoConfiguration -> 자동 설정 ON
   └── @ComponentScan           -> 하위 패키지 Bean 자동 등록
```

**동작 원리**

```
① 추가된 라이브러리를 본다   ("웹 라이브러리가 있네?")
② 조건에 맞으면 설정을 켠다  ("-> 내장 톰캣, MVC 자동 등록")
③ 내가 직접 설정했으면       ("-> 내 설정이 우선")
```

- **Starter**: `starter-web` 하나 추가 -> 관련 라이브러리가 버전까지 맞춰 딸려옴 -> 자동 설정이 감지해서 켜 줌
- 그래서 XML 0줄, 톰캣 설치 0번으로 `main()`을 실행하면 서버가 뜸

### 5. Docker

서버를 **어디서든 똑같이 실행**하게 해 주는 도구

- **문제**: "제 컴퓨터에선 되는데요?" -> 사람마다 환경(자바 버전 등)이 달라 생기는 에러
- **해결**: **"앱 + 실행 환경"을 통째로 상자에 담아** 어디서든 똑같이 돌아가게 함

|용어|의미|
|---|---|
|**Dockerfile**|이미지를 어떻게 만들지 적어놓은 설명서 (붕어빵 **레시피**)|
|**이미지 (Image)**|설계도 (정적) (붕어빵 **틀**)|
|**컨테이너 (Container)**|실행한 실체 (동적) (실제로 나온 **붕어빵**)|

```
Dockerfile ─build─▶  이미지  ─run─▶  컨테이너
 (붕어빵 레시피)      (붕어빵 틀)     (붕어빵)
```

- 컨테이너는 VM과 달리 OS를 통째로 안 갖고 **Host OS 커널을 공유** -> 가볍고 빠름

### 6. 💬 토론 질문 (핵심 3개)

1. **왜 클라이언트가 DB에 직접 접근하지 않고 서버를 거칠까?** 직접 접근하면 어떤 문제가 생길까? _(백엔드의 존재 이유)_
2. **자동 설정은 편하지만, 속에서 뭐가 켜지는지 모르고 쓰면 어떤 문제가 생길까?** 내가 직접 설정한 게 자동 설정보다 우선하는 건 왜 좋을까? _(Spring Boot 자동 설정의 장단점)_
3. **Docker 없이 팀이 개발하면 구체적으로 어떤 문제가 생길까?** _(환경 문제와 Docker)_

### 7. 🧩 퀴즈

**Q1. (1.1 웹 서비스)** 서버 계층 없이 클라이언트가 DB에 직접 접근하는 구조의 문제점으로 옳지 않은 것은?
1. 클라이언트마다 DB 계정 정보를 나눠 가져야 해서 보안 위험이 커진다
2. 검증·계산 같은 로직을 클라이언트마다 중복으로 구현해야 한다
3. 웹 브라우저와 모바일 앱이 서로 다른 화면 디자인을 가지게 된다
4. DB 구조가 바뀌면 모든 클라이언트 코드를 함께 수정해야 한다

- 정답

    **3번.** 화면 디자인 차이는 프레젠테이션 계층의 문제이지 서버-DB 구조와는 무관함. 서버가 있든 없든 웹/앱 화면은 원래 다를 수 있음. 나머지는 실제로 "서버 없이 DB 직접 접근" 구조에서 생기는 진짜 문제

**Q2. (1.2 역할 층)** "재고가 있어야 주문 가능" 같은 업무 규칙은 어느 층에 두는 게 알맞을까?
1. Controller
2. Service
3. Repository
4. DB 테이블

- 정답

    **2번.** 업무 규칙(비즈니스 로직)은 Service의 역할. Controller는 HTTP 요청/응답, Repository는 DB 접근만 담당

**Q3. (1.3 객체)** Entity를 그대로 응답으로 내보내지 않고 DTO로 바꿔서 내보내는 가장 큰 이유는?
1. DTO가 더 빠르기 때문에
2. DB 구조가 밖에 노출되고, DB를 바꾸면 응답도 같이 바뀌기 때문에
3. Entity는 JSON으로 만들 수 없기 때문에
4. Controller에서는 Entity를 쓸 수 없기 때문에

- 정답

    **2번.** 밖과 주고받는 모양(DTO)과 DB에 맞춘 모양(Entity)을 분리해야 서로 영향을 주지 않음

**Q4. (2.1 HTTP, OX)** HTTP는 무상태(stateless)이므로, 서버는 같은 사용자의 이전 요청 내용을 자동으로 기억한다.

- 정답

    **X.** 무상태는 서버가 이전 요청을 **기억하지 않는다**는 뜻. 그래서 로그인 유지 같은 건 세션/토큰 등 별도 장치가 필요함

**Q5. (2.2 REST)** REST 스타일에 가장 맞는 "회원 1번 삭제" 요청은?
1. `GET /deleteUser?id=1`
2. `POST /deleteUser`
3. `DELETE /users/1`
4. `GET /users/1/delete`

- 정답

    **3번.** REST는 "무엇"은 URL(`/users/1`), "어떻게"는 HTTP 메서드(`DELETE`)로 나눠서 표현함. 나머지는 행위를 URL에 넣은 방식

**Q6. (2.1 HTTP)** 존재하지 않는 회원 번호(예: `/users/9999`)로 조회했을 때 가장 알맞은 응답 상태 코드는?
1. 200 OK
2. 404 Not Found
3. 500 Internal Server Error
4. 301 Moved Permanently

- 정답

    **2번.** 없는 자원을 요청한 것은 **클라이언트 쪽 문제**이므로 4xx(404). 500은 서버 내부 오류일 때 사용

**Q7. (3. Spring vs Spring Boot, OX)** Spring Boot를 사용하면 톰캣(WAS)을 별도로 설치해서 앱을 배포해야 한다.

- 정답

    **X.** Spring Boot는 **내장 톰캣**을 포함하고 있어서 `java -jar`로 바로 실행할 수 있음

**Q8. (4. 자동 설정)** `@SpringBootApplication`에 포함되지 않는 것은?
1. Configuration
2. EnableAutoConfiguration
3. ComponentScan
4. RestController

- 정답

    **4번.** `@RestController`는 컨트롤러에 따로 붙이는 애너테이션

**Q9. (4. 자동 설정)** 자동 설정과 같은 종류의 설정을 개발자가 직접 정의했을 때 어떻게 동작할까?
1. 에러가 발생한다
2. 자동 설정이 우선 적용된다
3. 개발자가 직접 한 설정이 우선하고, 자동 설정은 물러난다
4. 두 설정이 모두 적용되어 충돌한다

- 정답

    **3번.** 자동 설정은 "기본값"일 뿐이라, 내가 직접 설정하면 **내 설정이 우선**함

**Q10. (5. Docker)** 이미지와 컨테이너 관계로 옳은 것은?
1. 이미지=실행체, 컨테이너=설계도
2. 이미지=설계도, 컨테이너=실행체
3. 둘은 같다

- 정답

    **2번.** 이미지=틀, 컨테이너=찍어낸 붕어빵

**Q11. (5. Docker)** 컨테이너가 가상 머신(VM)보다 가볍고 빠르게 시작되는 가장 큰 이유는?
1. 코드를 자동으로 압축해서 실행하기 때문에
2. 컨테이너마다 OS를 통째로 갖지 않고 Host OS의 커널을 공유하기 때문에
3. 하드웨어를 사용하지 않기 때문에
4. 네트워크를 사용하지 않기 때문에

- 정답

    **2번.** VM은 각자 Guest OS를 통째로 실행하지만, 컨테이너는 Host OS 커널을 공유해서 훨씬 가벼움

### 더 알아볼 내용 (질문)

MVC (Model, View, Controller)

HTTP는 정확히 뭔지? 정보 전달 형식? 주소? - 주소 없이도 request 가능.. 전달 형식 (O)

HTTPS = 보안 encryption 추가 TLS = transport layer security

Rest API는 리소스를 기준으로 움직임.

클라이언트 - 서버 구조, 무상태성, 캐시 가능성, 계층적 구조 (내 파트만 보수해도 되게 모듈화 됨), 통일된 인터페이스 (리소스 기준)
