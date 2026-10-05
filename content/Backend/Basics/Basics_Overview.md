### Goal

- Spring boot 기본 개념을 이해한다
- 실무에 Spring boot가 어떤 형태로 사용되고 있는지 이해한다 (Feat. Template Project)
- 실제 개발 및 테스트, 배포를 위한 환경을 설정한다 (DEV / STG)

### Seminar
##### 기간: 26. 09. 29 ~ (약 10주)

- 발표자는 격주로 바꿔서 진행, 참석자도 대강 내용 훑고 오기 
- 설명 (25분): 개념과 그림 위주로 진행, 필요한 코드나 자료 있으면 Weekly Note 채워서 공유
- 토론 (15분): 발표자가 미리 준비한 질문 2~3개로 이야기 하기. 예: "왜 생성자 주입이 권장일까?", "이걸 안 쓰면 어떤 문제가 생길까?" 등. 꼬리 질문 생기면 Weekly Note 양식의 “더 알아볼 질문”에 적어두고 각자 공부.
- 퀴즈 (5분): 발표자는 OX나 객관식으로 간단히 3문제 정도 생각해 오기, 참여자는 맞추기

### Schedule

##### 사전 학습: JAVA [[_JAVA]]
- [Language Basics](https://dev.java/learn/language/constructs/): 변수, 연산자, 제어문
- [Object Oriented Programming](https://dev.java/learn/language/oop/): 클래스, 객체, 인터페이스
- [Annotations and Exceptions](https://dev.java/learn/language/annotations-exceptions/): 어노테이션과 예외
- 도구
    - Git: [https://learngitbranching.js.org/?locale=ko](https://learngitbranching.js.org/?locale=ko)
    - Gradle: [https://gradle.org/guides/](https://gradle.org/guides/)

##### W1. Backend, Spring Boot [[Basics_W1]]
- 클라이언트-서버-DB 구조
- HTTP/REST 요청 흐름
- Spring vs Spring Boot
- Boot 자동 설정 (`@SpringBootApplication`, `@EnableAutoConfiguration`)
- 참고
    - [An overview of HTTP (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview): HTTP 요청과 응답 구조
    - [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service): 첫 REST API 만들기
    - [Tutorial: Create your first Spring application (IntelliJ)](https://www.jetbrains.com/help/idea/your-first-spring-application.html): IntelliJ로 첫 Spring Boot 앱 실행
    - [Auto-configuration (Spring Boot 공식 문서)](https://docs.spring.io/spring-boot/reference/using/auto-configuration.html): 자동 설정의 원리와 끄는 방법

##### W2. DI, Annotation [[Basics_W2]]
- Spring DI (Dependency Injection) 란?
- 의존 자동 주입 (생성자 주입) 방법
- Annotation을 이용한 설정 (`@Configuration`, `@Bean`)
- 참고
    - [Dependency Injection](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html): DI 개념, 생성자 주입과 setter 주입 비교
    - [Spring Beans and Dependency Injection (Boot)](https://docs.spring.io/spring-boot/reference/using/spring-beans-and-dependency-injection.html): 생성자 주입을 권장하는 이유
    - [Basic Concepts: @Bean and @Configuration](https://docs.spring.io/spring-framework/reference/core/beans/java/basic-concepts.html): 핵심 개념과 예제

##### W3. Bean, AOP [[Basics_W3]]
- Bean 라이프사이클과 범위(scope)
- AOP 소개 (프록시 개념)
- 참고
    - [Lifecycle Callbacks](https://docs.spring.io/spring-framework/reference/core/beans/factory-nature.html): `@PostConstruct`, `@PreDestroy`
    - [Bean Scopes](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html): singleton, prototype 등
    - [AOP Concepts](https://docs.spring.io/spring-framework/reference/core/aop/introduction-defn.html): Aspect, Advice, Pointcut 용어 정리
    - [Proxying Mechanisms](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html): JDK 프록시와 CGLIB, 같은 클래스 안에서 메서드를 부르면 AOP가 적용되지 않는 문제

##### W4. SpringMVC [[Basics_W4]]
- DispatcherServlet 요청 처리 흐름
- 요청 검증 (Validation)
- 전역 예외 처리 (`@RestControllerAdvice`)
- 참고
    - [DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html): Front Controller 구조
    - [Validating Form Input](https://spring.io/guides/gs/validating-form-input): 검증 실습
    - [Controller Advice](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-advice.html): 예외를 한곳에서 처리하기

##### W5. RDS(SQL) vs DynamoDB(NoSQL) [[Basics_W5]]
- SQL vs NoSQL
- DynamoDB 핵심 (파티션 키)
- JPA, MyBatis 개요
- 트랜잭션 개념
- 참고
    - [SQLBolt](https://sqlbolt.com): SQL 입문 실습
    - [Core components of DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html): 테이블, 파티션 키, 정렬 키
    - [Accessing Data with JPA](https://spring.io/guides/gs/accessing-data-jpa): JPA 실습
    - [Managing Transactions](https://spring.io/guides/gs/managing-transactions): `@Transactional` 실습

##### W6. AWS, DB tunnelling [[Basics_W6]]
- AWS 리소스 지도 (VPC, EC2, RDS, DynamoDB, S3, IAM)
- DB 터널링 (DB를 외부에 직접 열지 않는 이유, SSH와 SSM 방식)
- 프로파일(dev/stg/prod)과 비밀값 관리 원칙
- 참고
    - [How Amazon VPC works](https://docs.aws.amazon.com/vpc/latest/userguide/how-it-works.html): 서브넷, 라우팅, 퍼블릭과 프라이빗
    - [SSM 포트 포워딩 (원격 호스트)](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html#sessions-remote-port-forwarding): RDS 터널링 명령어
    - [Profiles (Spring Boot)](https://docs.spring.io/spring-boot/reference/features/profiles.html): 환경별 설정 나누기
    - [12-Factor: Config](https://12factor.net/config): 설정과 비밀값을 코드에서 분리하는 원칙

##### W7. Redis [[Basics_W7]]
- Redis (캐시, TTL, 자료구조)
- ~~Template Project 구조 투어 (폴더, 공통 모듈, 설정 파일 위치)~~
- 참고
    - [Redis 시작하기](https://redis.io/docs/latest/develop/get-started/)
    - [Redis Data Types](https://redis.io/docs/latest/develop/data-types/): String, Hash, List, Set 등
    - [Caching (Spring Boot)](https://docs.spring.io/spring-boot/reference/io/caching.html): Redis 캐시 연동과 TTL 설정

##### W8. Docker, Kubernetes, Deployment [[Basics_W8]]
- Docker 개념 (이미지, 컨테이너)
- Kubernetes 원리 (Pod, Deployment, Service, Docker만으로 부족한 이유)
- CI/CD 흐름과 DEV vs STG 차이
- 참고
    - [Docker Get Started](https://docs.docker.com/get-started/)
    - [Spring Boot with Docker](https://spring.io/guides/gs/spring-boot-docker): Spring 앱 컨테이너화
    - [Kubernetes Overview](https://kubernetes.io/docs/concepts/overview/): Kubernetes가 필요한 이유
    - [Kubernetes Basics](https://kubernetes.io/docs/tutorials/kubernetes-basics/): 브라우저 실습 튜토리얼

##### W9. Test, Collaboration [[Basics_W9]]
- 테스트 종류 (단위/통합, DQA/SQA/SEL), 테스트 피라미드
- Jira 티켓 작성법
- PR 리뷰와 장애 대응 기본기
- 참고
    - [Testing the Web Layer](https://spring.io/guides/gs/testing-web): Spring 테스트 실습
    - [JUnit User Guide](https://docs.junit.org): 현재 버전은 JUnit 6
    - [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
    - [Agile Tutorials (Atlassian)](https://www.atlassian.com/agile/tutorials): Jira 사용법
##### W10. Review [[Basics_W10]]