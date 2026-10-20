### 1. Spring이란
"Spring"은 문맥에 따라 두 가지를 가리킴
- **Spring Framework**: 모든 것의 토대. 핵심은 객체를 대신 만들고 연결해 주는 **IoC/DI 컨테이너**
- **Spring 프로젝트 전체**: Spring Framework 위에 만들어진 여러 프로젝트(Spring Boot, Spring Security, Spring Data 등)를 묶어 부르는 말. 프로젝트마다 소스 저장소와 릴리스 주기가 따로 있음
- 웹 없이 Core만 써서 콘솔 프로그램도 만들 수 있음 [[Basics_W3]]

### 2. Spring Framework의 모듈
Spring Framework는 모듈로 나뉘어 있고, 필요한 모듈만 골라 씀

| 모듈 | 역할 | 노트 |
|---|---|---|
| **Core / Beans / Context** | IoC 컨테이너, DI, Bean 관리 | [[Basics_W2]], [[Basics_W3]] |
| **Spring MVC** | 웹 요청 처리 (DispatcherServlet, Controller) | [[Basics_W4]] |
| **Spring WebFlux** | 비동기·논블로킹 방식의 웹 (MVC의 대안) | |
| **Spring AOP** | 공통 기능(로깅 등)을 코드 밖에서 끼워 넣기 | |
| **트랜잭션 관리** | `@Transactional`로 DB 작업을 묶어서 처리 | |

### 3. Spring Framework 위의 별도 프로젝트
| 프로젝트 | 역할 | 노트 |
|---|---|---|
| **Spring Boot** | Spring 기반 애플리케이션을 최소 설정으로 빠르게 만들게 함 (자동 설정, Starter, 내장 서버) | [[Basics_W1]] |
| **Spring Data JPA** | DB 접근, Repository | [[Basics_W5]] |
| **Spring Security** | 인증·인가 (로그인, 권한) | |

### 4. Spring MVC
Spring Framework의 모듈 중 **웹 요청 처리를 담당**하는 부분. MVC 패턴 + Front Controller 패턴으로 만들어짐
- MVC는 설계 패턴(개념), Spring MVC는 그 구현체
- DispatcherServlet은 MVC가 아니라 Front Controller 패턴

| MVC 개념 | Spring MVC 구현 |
|---|---|
| Controller | `@Controller`, `@RestController` |
| Model | `Model` 객체 + Service, Repository, Entity |
| View | Thymeleaf 같은 템플릿 (REST에서는 서버에 없고 클라이언트가 담당) |
| 요청 진입점 | DispatcherServlet |

- Controller도 Bean이고 Service는 DI로 주입되므로, MVC는 Core(IoC/DI) 위에서 돌아감
- 자세한 흐름은 [[Basics_W4]]
