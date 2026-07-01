<!-- =========================================================
       black-astro  ·  GitHub Profile README   (hacker / terminal theme)
     ========================================================= -->

<div align="center">

<img
  width="100%"
  src="https://capsule-render.vercel.app/api?type=waving&color=0:000000,45:022a0e,100:00ff41&height=200&section=header&text=black_astro&fontSize=60&fontColor=00ff41&fontAlignY=36&desc=Backend%20Engineer%20/%20Java%20·%20Spring&descAlignY=57&descSize=18&animation=fadeIn"
  alt="header"
/>

<!-- 움직이는 소개 텍스트 -->
<a href="https://git.io/typing-svg">
  <img
    src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=22&pause=1400&color=00FF41&center=true&vCenter=true&width=600&height=50&lines=5%EB%85%84%EC%B0%A8+%EB%B0%B1%EC%97%94%EB%93%9C+%EC%97%94%EC%A7%80%EB%8B%88%EC%96%B4;%EB%8C%80%EC%9A%A9%EB%9F%89+%EC%B2%98%EB%A6%AC+%C2%B7+%EB%8F%99%EC%8B%9C%EC%84%B1+%C2%B7+%EC%84%B1%EB%8A%A5+%EC%B5%9C%EC%A0%81%ED%99%94;%EC%9D%B8%EC%A6%9D/%EB%B3%B4%EC%95%88+%EC%84%A4%EA%B3%84+%C2%B7+CI/CD+%C2%B7+%EC%9D%B8%ED%94%84%EB%9D%BC+%EA%B5%AC%EC%B6%95;%EC%84%A4%EA%B3%84%EB%B6%80%ED%84%B0+%EC%9A%B4%EC%98%81%EA%B9%8C%EC%A7%80+%EC%A7%81%EC%A0%91+%EC%B1%85%EC%9E%84%EC%A7%91%EB%8B%88%EB%8B%A4"
    alt="typing"
  />
</a>

<br/>

<img src="https://komarev.com/ghpvc/?username=black-astro&label=visitors&color=00ff41&style=flat-square" alt="views"/>
<a href="mailto:gntj3200@gmail.com"><img src="https://img.shields.io/badge/gntj3200@gmail.com-0d0208?style=flat-square&logo=gmail&logoColor=00ff41" alt="mail"/></a>

</div>

<br/>

---

## `$ 소개 --핵심역량`

![](https://img.shields.io/badge/%EB%8C%80%EC%9A%A9%EB%9F%89_%EB%B0%9C%EC%86%A1%C2%B7%EB%B0%B0%EC%B9%98-00ff41?style=flat-square&labelColor=0d0208)
![](https://img.shields.io/badge/%EB%AC%B4%EC%A4%91%EB%8B%A8_%EC%95%88%EC%A0%95%EC%84%B1-00ff41?style=flat-square&labelColor=0d0208)
![](https://img.shields.io/badge/OAuth2_%EC%9D%B8%EC%A6%9D%EC%84%A4%EA%B3%84-00ff41?style=flat-square&labelColor=0d0208)
![](https://img.shields.io/badge/CI%2FCD%C2%B7%EC%9D%B8%ED%94%84%EB%9D%BC_%EA%B5%AC%EC%B6%95-00ff41?style=flat-square&labelColor=0d0208)
![](https://img.shields.io/badge/Maven_Central%C2%B7npm_OSS-00ff41?style=flat-square&labelColor=0d0208)

| 구분 | 내용 |
|------|------|
| **대용량 처리** | StAX 스트리밍 파싱 · MyBatis `ExecutorType.BATCH`(청크 flush) · Java 21 Virtual Thread 병렬화로 대용량 XML을 OOM 없이 ETL |
| **인증/인가 설계** | 단일 백엔드에서 클라이언트 3종을 멀티 `SecurityFilterChain`으로 분리, JWT 발급·검증 분리, 클라이언트별 토큰 정책 운영 |
| **외부 API 연동** | Spring 6 RestClient 기반 카카오 비즈톡·PASS 인증사 연동, 타임아웃 정밀 분기(504/500), 발송 상태머신 설계 |
| **동시성 / 스케줄러** | `ThreadPoolTaskScheduler` N-스레드 분산 발송, MOD 기반 다중 스케줄러, `@PreDestroy` graceful shutdown |
| **운영 안정성** | 발송 상태머신 · 스케줄러 race를 DB 원자성으로 차단, 운영 사고를 SQL로 재현·복구 후 문서화(재발 방지) |
| **DB / SQL** | JPA · QueryDSL · MyBatis 혼용, Tibero·Oracle PL/SQL 프로시저·UDF, MERGE UPSERT, 동적 인덱스 제어, SQL 튜닝 |
| **빌드/품질 자동화** | Jenkins Pipeline · SonarQube Quality Gate · JaCoCo · CycloneDX SBOM · WAR/JAR 동시 빌드 |
| **인프라 직접 구축** | VMware OS 설치부터 Docker 기반 Gitea · Jenkins · SonarQube(Community) · Nginx + PostgreSQL 사내 CI/CD 환경을 단독 구축·운영 (CentOS / Ubuntu, Apache · Nginx) |
| **Full-stack** | Vue3 · Nuxt · Electron 데스크톱까지, 백엔드 계약(엔드포인트·토큰) 기준으로 프론트를 직접 연동 |

<br/>

---

## `$ 기술스택 --전체`

**Backend**

![Java](https://img.shields.io/badge/Java_8~21-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_2.7~3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring](https://img.shields.io/badge/Spring_MVC_·_AOP-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Virtual Thread](https://img.shields.io/badge/Java_21_Virtual_Thread-007396?style=for-the-badge&logo=openjdk&logoColor=white)

**Data & Persistence**

![JPA](https://img.shields.io/badge/Spring_Data_JPA-59666C?style=for-the-badge&logo=hibernate&logoColor=white)
![QueryDSL](https://img.shields.io/badge/QueryDSL-0769AD?style=for-the-badge&logoColor=white)
![MyBatis](https://img.shields.io/badge/MyBatis-DC382D?style=for-the-badge&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)
![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![Tibero](https://img.shields.io/badge/Tibero_6-1F6FEB?style=for-the-badge&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-FF4438?style=for-the-badge&logo=redis&logoColor=white)

**Security · API · Resilience**

![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![JWT](https://img.shields.io/badge/OAuth2_·_JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![RestClient](https://img.shields.io/badge/RestClient-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![STOMP](https://img.shields.io/badge/WebSocket_STOMP-010101?style=for-the-badge&logoColor=white)
![Resilience4j](https://img.shields.io/badge/Resilience4j-1C7C54?style=for-the-badge&logoColor=white)

**Batch · Concurrency · Quality**

![Quartz](https://img.shields.io/badge/Quartz_Scheduler-0E7C3F?style=for-the-badge&logoColor=white)
![StAX](https://img.shields.io/badge/StAX_·_JAXB-E76F00?style=for-the-badge&logoColor=white)
![Log4j2](https://img.shields.io/badge/Log4j2-D22128?style=for-the-badge&logo=apache&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)
![SonarQube](https://img.shields.io/badge/SonarQube-4E9BCD?style=for-the-badge&logo=sonarqube&logoColor=white)
![Gradle](https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white)

**Frontend**

![Vue3](https://img.shields.io/badge/Vue_3-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)
![Nuxt](https://img.shields.io/badge/Nuxt-00DC82?style=for-the-badge&logo=nuxtdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![Vuetify](https://img.shields.io/badge/Vuetify-1867C0?style=for-the-badge&logo=vuetify&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-FFD859?style=for-the-badge&logo=pinia&logoColor=black)

**Infra & DevOps** _(사내 CI/CD 환경 직접 구축·운영)_

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Gitea](https://img.shields.io/badge/Gitea-609926?style=for-the-badge&logo=gitea&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Apache](https://img.shields.io/badge/Apache-D22128?style=for-the-badge&logo=apache&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![CentOS](https://img.shields.io/badge/CentOS-262577?style=for-the-badge&logo=centos&logoColor=white)
![Ubuntu](https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)
![VMware](https://img.shields.io/badge/VMware-607078?style=for-the-badge&logo=vmware&logoColor=white)

**Tools**

![IntelliJ IDEA](https://img.shields.io/badge/IntelliJ_IDEA-000000?style=for-the-badge&logo=intellijidea&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![DBeaver](https://img.shields.io/badge/DBeaver-382923?style=for-the-badge&logo=dbeaver&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Maven](https://img.shields.io/badge/Maven_Central-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)

<br/>

---

## `$ 오픈소스 --공개`

### [`easy-quartz`](https://github.com/black-astro/easy-quartz) · Spring Boot Starter

![Java](https://img.shields.io/badge/Java-0d0208?style=flat-square&logo=openjdk&logoColor=00ff41)
![Maven Central](https://img.shields.io/maven-central/v/io.github.black-astro/easy-quartz-spring-boot-starter?style=flat-square&label=maven%20central&color=00ff41&labelColor=0d0208)
![Stars](https://img.shields.io/github/stars/black-astro/easy-quartz?style=flat-square&color=00ff41&labelColor=0d0208)
![License](https://img.shields.io/badge/license-Apache_2.0-00ff41?style=flat-square&labelColor=0d0208)

어노테이션(`@EasyQuartzScheduled`) 기반으로 **5종 스케줄 × 2엔진(Quartz / Spring TaskScheduler)**을 단일 추상화로 통합한 Spring Boot Starter. `Maven Central` 배포.

- `autoconfigure` / `starter` / `sample` 3-tier 멀티모듈, SPI 기반 Auto-Configuration
- AOP 프록시 우회 문제를 `getBean()` + `AopUtils.getTargetClass()` 시그니처 검사로 해결(트랜잭션·캐시 보존)
- 태그 push → GPG 서명 → Sonatype Central 배포까지 릴리즈 파이프라인 무인 자동화

```gradle
implementation "io.github.black-astro:easy-quartz-spring-boot-starter:0.1.0"
```

### [`smart-msg`](https://github.com/black-astro/smart-msg) · AI Commit CLI

![TypeScript](https://img.shields.io/badge/TypeScript-0d0208?style=flat-square&logo=typescript&logoColor=00ff41)
![npm](https://img.shields.io/npm/v/smart-msg?style=flat-square&label=npm&color=00ff41&labelColor=0d0208)
![downloads](https://img.shields.io/npm/dt/smart-msg?style=flat-square&label=downloads&color=00ff41&labelColor=0d0208)
![Stars](https://img.shields.io/github/stars/black-astro/smart-msg?style=flat-square&color=00ff41&labelColor=0d0208)

다중 LLM(OpenAI · Claude · Gemini · Groq · Ollama)을 지원하는 **AI Git 커밋 메시지 생성 CLI**. `npm` 배포, Conventional Commits · 한/영 출력 지원.

```bash
npm install -g smart-msg   # 사용: sm
```

### [`code T`](https://github.com/black-astro/coding-test) · 코딩테스트 데스크톱 앱

![Python](https://img.shields.io/badge/Python-0d0208?style=flat-square&logo=python&logoColor=00ff41)
![PySide6](https://img.shields.io/badge/PySide6-0d0208?style=flat-square&logo=qt&logoColor=00ff41)
![Stars](https://img.shields.io/github/stars/black-astro/coding-test?style=flat-square&color=00ff41&labelColor=0d0208)

**PySide6** 기반 코딩 테스트 연습 데스크톱 앱. 문법→자료구조→알고리즘 단계 학습, 문제 276·문법 강의 149 수록, **케이스별 실행 시간(ms)·최대 메모리까지 측정하는 자동 채점** (Python · Java · C++ · JS).

> 그 외 — `shadowport` : 레거시 리버스 터널 도구를 Java 21 · Netty · AES-GCM / X25519 · JavaFX로 재설계한 네트워크·보안 사이드 프로젝트 (비공개)

<br/>

---

## `$ 프로젝트 --요약`

> 비공개 사내/개인 저장소는 도메인 중심으로 요약했습니다.

#### 실시간 상담·모니터링 백엔드
`Java 21` · `Spring Boot 3.x` · `Spring Data JPA` · `QueryDSL` · `Resilience4j` · `WebSocket` · `MariaDB`
- 도메인 패키지 구조(DDD 지향) 기반 계층 분리, JPA + QueryDSL로 동적 조회 구성
- Resilience4j Circuit Breaker로 외부 연동 장애 격리, WebSocket 실시간 상태 전송
- Caffeine 캐시 · 비동기 로깅(Log4j2 Disruptor) 적용

#### 대용량 명세서 배치 (ETL)
`Java 21` · `Spring Boot 3.4` · `StAX / JAXB` · `MyBatis BATCH` · `Tibero PL/SQL` · `Spring Integration SFTP`
- 규모별 파싱 전략 분리 — 텍스트(BufferedReader) / 중규모(JAXB) / 대규모(StAX 상태머신)
- Virtual Thread + Semaphore로 병렬 상한 제어, MyBatis BATCH 청크 단위 flush
- 적재 전 인덱스 `UNUSABLE` → 대량 적재 → `REBUILD` + `DBMS_STATS`로 실행계획 회복

#### 알림톡 발송 서버
`Java 21` · `Spring Boot 3.3` · `RestClient` · `MyBatis 동적 SQL` · `Tibero`
- 발송/결과/정산을 단일 상태 컬럼(N→B→P→S) 상태머신으로 추적
- 외부 API 호출을 트랜잭션 경계 밖으로 분리, `WHERE` 상태 조건으로 스케줄러 race를 DB 원자성으로 차단
- 멱등 INSERT(`WHERE NOT EXISTS`), 무중단 Switch ON/OFF, 운영 사고 SQL 재현·복구 후 문서화

#### 본인인증(PASS) 발송
`Java 21` · `Spring Boot 3.4` · `ThreadPoolTaskScheduler` · `Log4j2(Disruptor)` · `Jasypt`
- N-스레드 stagger 분산 발송, `@PreDestroy` graceful cancel
- Jenkins Pipeline(Unit→Integration→SonarQube Quality Gate→Build) + CycloneDX SBOM 자동 산출

#### 통합 인증 백엔드
`Java 8` · `Spring Security / OAuth2` · `MyBatis 멀티 DataSource` · `Caffeine`
- 클라이언트 3종을 `@Order` + antMatcher로 `SecurityFilterChain` 분리 운영
- Access/Refresh 토큰 수명 분리, `type` 클레임 검증, 도메인별 DataSource·TransactionManager 분리

#### 데스크톱 클라이언트 (Electron)
`Electron 39` · `Vue3` · `Vuetify` · `Pinia` · `better-sqlite3` · `STOMP` · `electron-updater` · `NSIS`
- 두 개의 백엔드 토큰을 핸드오프/자동 갱신으로 연동, 동시 요청 시 리프레시 중복 방지
- `better-sqlite3`를 Worker 전용 접근으로 격리, `contextIsolation` 기반 렌더러 보안 적용
- `electron-updater` 자동 업데이트 + NSIS 설치 패키징으로 운영 배포 자동화

<br/>

---

## `$ 활동그래프 --통계`

<div align="center">

<img height="180" src="https://github-profile-summary-cards.vercel.app/api/cards/stats?username=black-astro&theme=github_dark"/>
<img height="180" src="https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=black-astro&theme=github_dark"/>
<img height="180" src="https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=black-astro&theme=github_dark"/>

<br/>

<img src="https://streak-stats.demolab.com/?user=black-astro&hide_border=false&border=00ff41&background=0d0208&stroke=00ff41&ring=00ff41&fire=00ff41&currStreakLabel=00ff41&sideNums=00ff41&sideLabels=9dff9d&dates=8b949e&currStreakNum=00ff41&dayLabels=8b949e" alt="streak"/>

<br/><br/>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/black-astro/black-astro/output/github-snake-dark.svg"/>
  <img alt="snake" src="https://raw.githubusercontent.com/black-astro/black-astro/output/github-snake.svg"/>
</picture>

<br/><br/>

<img src="./profile-3d-contrib/profile-night-green.svg" alt="3d-contrib" width="86%"/>

</div>

<br/>

<div align="center">

<img
  width="100%"
  src="https://capsule-render.vercel.app/api?type=waving&color=0:00ff41,45:022a0e,100:000000&height=120&section=footer&text=%3E_%20thanks%20for%20visiting&fontSize=20&fontColor=00ff41&fontAlignY=70&animation=fadeIn"
  alt="footer"
/>

</div>
