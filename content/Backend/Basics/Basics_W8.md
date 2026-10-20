### 5. Docker
서버를 **어디서든 똑같이 실행**하게 해 주는 도구

- **문제**: 사람마다 환경(자바 버전 등)이 달라 생기는 에러
- **해결**: **"앱 + 실행 환경"을 통째로 상자에 담아** 어디서든 똑같이 돌아가게 함

| 용어 | 의미 |
|---|---|
| **Dockerfile** | 이미지를 어떻게 만들지 적어놓은 설명서 (붕어빵 **레시피**) |
| **이미지 (Image)** | 설계도 (정적) (붕어빵 **틀**) |
| **컨테이너 (Container)** | 실행한 실체 (동적) (실제로 나온 **붕어빵**) |

```mermaid
flowchart LR
    A["Dockerfile<br/>(붕어빵 레시피)"] -->|build| B["이미지<br/>(붕어빵 틀)"] -->|run| C["컨테이너<br/>(붕어빵)"]
```

```dockerfile
# 자바 실행 환경이 들어 있는 기본 이미지
FROM eclipse-temurin:21-jre
# 빌드한 앱을 이미지에 복사
COPY build/libs/app.jar app.jar
# 컨테이너가 시작될 때 실행할 명령
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```bash
docker build -t my-app .             # Dockerfile로 이미지 만들기
docker run -p 8080:8080 my-app       # 이미지로 컨테이너 실행 (내 8080 포트 <-> 컨테이너 8080 포트)
```

- 각자 Guest OS를 통째로 실행하는 가상머신 대비 Docker의 컨테이너는 ==Host OS 커널을 공유== 해서 가볍고 빠름

