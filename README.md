<!-- =========================================================
       black-astro  ·  GitHub Profile README
     ========================================================= -->

<div align="center">

<img
  width="100%"
  src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,50:203a43,100:2c5364&height=210&section=header&text=black%20astro&fontSize=64&fontColor=ffffff&fontAlignY=36&desc=Backend%20Engineer%20|%20Java%20/%20Spring&descAlignY=58&descSize=18&animation=fadeIn"
  alt="header"
/>

<a href="https://git.io/typing-svg">
  <img
    src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=500&size=21&pause=1200&color=36BCF7&center=true&vCenter=true&width=640&height=48&lines=%EB%8C%80%EC%9A%A9%EB%9F%89+%EB%B0%9C%EC%86%A1%C2%B7%EB%B0%B0%EC%B9%98+%EC%84%9C%EB%B2%84%EB%A5%BC+%EC%84%A4%EA%B3%84%C2%B7%EC%9A%B4%EC%98%81%ED%95%98%EB%8A%94+%EB%B0%B1%EC%97%94%EB%93%9C+%EA%B0%9C%EB%B0%9C%EC%9E%90;%EB%A9%94%EB%AA%A8%EB%A6%AC+%ED%9A%A8%EC%9C%A8%EA%B3%BC+%EB%AC%B4%EC%A4%91%EB%8B%A8+%EC%95%88%EC%A0%95%EC%84%B1%EC%9D%84+%EC%B5%9C%EC%9A%B0%EC%84%A0%EC%9C%BC%EB%A1%9C+%EA%B3%A0%EB%A0%A4%ED%95%A9%EB%8B%88%EB%8B%A4;Spring+Boot+Starter+%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC%EB%A5%BC+Maven+Central%EC%97%90+%EB%B0%B0%ED%8F%AC%ED%95%A9%EB%8B%88%EB%8B%A4"
    alt="typing"
  />
</a>

<br/>

<img src="https://komarev.com/ghpvc/?username=black-astro&label=Profile%20Views&color=36BCF7&style=flat" alt="views"/>
<a href="https://hits.seeyoufarm.com"><img src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fblack-astro&count_bg=%2336BCF7&title_bg=%23203A43&title=hits&edge_flat=false" alt="hits"/></a>
<a href="mailto:gntj3200@gmail.com"><img src="https://img.shields.io/badge/gntj3200@gmail.com-EA4335?style=flat&logo=gmail&logoColor=white" alt="mail"/></a>

</div>

<br/>

---

## 👤 Backend Engineer · 김현우

통신·메시징 도메인에서 **대용량 발송/배치 서버**를 설계·개발·운영해 온 약 5년차 백엔드 개발자입니다.
KT 명세서 대용량 배치, 카카오 알림톡, PASS 본인인증 등 **처리량과 무중단 안정성이 핵심인 시스템**을 담당했습니다.

| 구분 | 내용 |
|------|------|
| **대용량 처리** | StAX 스트리밍 파싱 · MyBatis `ExecutorType.BATCH`(청크 flush) · Java 21 Virtual Thread 병렬화로 대용량 XML을 OOM 없이 ETL |
| **인증/인가 설계** | 단일 백엔드에서 클라이언트 3종을 멀티 `SecurityFilterChain`으로 분리, JWT 발급·검증 분리, 클라이언트별 토큰 정책 운영 |
| **외부 API 연동** | Spring 6 RestClient 기반 카카오 비즈톡·PASS 인증사 연동, 타임아웃 정밀 분기(504/500), 발송 상태머신 설계 |
| **동시성 / 스케줄러** | `ThreadPoolTaskScheduler` N-스레드 분산 발송, MOD 기반 다중 스케줄러, `@PreDestroy` graceful shutdown |
| **운영 안정성** | 발송 상태머신 · 스케줄러 race를 DB 원자성으로 차단, 운영 사고를 SQL로 재현·복구 후 문서화(재발 방지) |
| **DB / SQL** | Tibero·Oracle PL/SQL 프로시저·UDF, MERGE UPSERT, 동적 인덱스 제어(UNUSABLE→REBUILD+`DBMS_STATS`), SQL 튜닝 |
| **빌드/품질 자동화** | Jenkins Pipeline · SonarQube Quality Gate · JaCoCo · CycloneDX SBOM · WAR/JAR 동시 빌드 |
| **OSS** | Spring Boot Starter 라이브러리 단독 설계·구현 후 Maven Central 배포 (`easy-quartz`) |

<br/>

---

## 🧰 Tech Stack

<div align="center">

**Language & Core**

![Java](https://img.shields.io/badge/Java_8~21-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_2.7~3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring](https://img.shields.io/badge/Spring_MVC_·_AOP-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Virtual Thread](https://img.shields.io/badge/Java_21_Virtual_Thread-007396?style=for-the-badge&logoColor=white)

**Security & API**

![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![OAuth2](https://img.shields.io/badge/OAuth2_Resource_Server-6DB33F?style=for-the-badge&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![RestClient](https://img.shields.io/badge/RestClient-6DB33F?style=for-the-badge&logoColor=white)
![STOMP](https://img.shields.io/badge/WebSocket_STOMP-010101?style=for-the-badge&logoColor=white)

**Persistence & Cache**

![MyBatis](https://img.shields.io/badge/MyBatis_(BATCH)-DC382D?style=for-the-badge&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)
![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![Tibero](https://img.shields.io/badge/Tibero_6-1F6FEB?style=for-the-badge&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![HikariCP](https://img.shields.io/badge/HikariCP-2C2255?style=for-the-badge&logoColor=white)
![Caffeine](https://img.shields.io/badge/Caffeine_Cache-6F4E37?style=for-the-badge&logoColor=white)

**Batch · Concurrency · I/O**

![Quartz](https://img.shields.io/badge/Quartz_Scheduler-0E7C3F?style=for-the-badge&logoColor=white)
![StAX](https://img.shields.io/badge/StAX_·_JAXB-E76F00?style=for-the-badge&logoColor=white)
![SFTP](https://img.shields.io/badge/Spring_Integration_SFTP-6DB33F?style=for-the-badge&logoColor=white)
![Log4j2](https://img.shields.io/badge/Log4j2_(Disruptor)-D22128?style=for-the-badge&logoColor=white)
![MapStruct](https://img.shields.io/badge/MapStruct-FF9E0F?style=for-the-badge&logoColor=white)
![Jasypt](https://img.shields.io/badge/Jasypt_·_AES-2C3E50?style=for-the-badge&logoColor=white)

**Build · CI · Quality**

![Gradle](https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)
![SonarQube](https://img.shields.io/badge/SonarQube-4E9BCD?style=for-the-badge&logo=sonarqube&logoColor=white)
![JaCoCo](https://img.shields.io/badge/JaCoCo-D22128?style=for-the-badge&logoColor=white)
![CycloneDX](https://img.shields.io/badge/CycloneDX_SBOM-394049?style=for-the-badge&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

**Tools**

![IntelliJ IDEA](https://img.shields.io/badge/IntelliJ_IDEA-000000?style=for-the-badge&logo=intellijidea&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![DBeaver](https://img.shields.io/badge/DBeaver-382923?style=for-the-badge&logo=dbeaver&logoColor=white)
![Maven Central](https://img.shields.io/badge/Maven_Central-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)

</div>

<br/>

---

## 📌 Projects

> 사내 서비스는 도메인 중심으로 요약했으며, 공개 저장소는 링크를 함께 기재했습니다.

### 🟢 Open Source

<div align="center">

<a href="https://github.com/black-astro/easy-quartz">
  <img src="https://github-readme-stats.vercel.app/api/pin/?username=black-astro&repo=easy-quartz&theme=react&hide_border=true&bg_color=0d1117&title_color=36BCF7&icon_color=36BCF7"/>
</a>
<a href="https://github.com/black-astro/shadowport">
  <img src="https://github-readme-stats.vercel.app/api/pin/?username=black-astro&repo=shadowport&theme=react&hide_border=true&bg_color=0d1117&title_color=36BCF7&icon_color=36BCF7"/>
</a>

</div>

**[`easy-quartz`](https://github.com/black-astro/easy-quartz)** — 어노테이션(`@EasyQuartzScheduled`) 기반으로 **5종 스케줄 × 2엔진(Quartz / Spring TaskScheduler)**을 단일 추상화로 통합한 Spring Boot Starter.

- `autoconfigure` / `starter` / `sample` 3-tier 멀티모듈, SPI 기반 Auto-Configuration + `@AutoConfigureAfter(QuartzAutoConfiguration)`
- AOP 프록시 우회 문제를 `getBean()` + `AopUtils.getTargetClass()` 시그니처 검사로 해결(트랜잭션·캐시 어드바이스 보존)
- `FIXED_DELAY` rescheduleJob 직접 구현, Misfire 4종·DST·jitter·requestRecovery 옵션 제공
- 태그 push → GPG 서명 → Sonatype Central 배포까지 릴리즈 파이프라인 무인 자동화

```gradle
implementation "io.github.black-astro:easy-quartz-spring-boot-starter:0.1.0"
```

**[`shadowport`](https://github.com/black-astro/shadowport)** — 레거시 리버스 커넥션 도구를 **Java 21 · Netty · AES-GCM / X25519 · JavaFX** 기반으로 재설계한 사이드 프로젝트. 통신 계층·GUI·패키징/빌드까지 단독 현대화 진행 중.

<br/>

### ⚙️ 사내 프로젝트 (도메인 요약)

#### 대용량 명세서 배치 (ETL)
`Java 21` · `Spring Boot 3.4` · `StAX / JAXB` · `MyBatis BATCH` · `Tibero PL/SQL` · `Spring Integration SFTP`
- 규모별 파싱 전략 분리 — 텍스트(BufferedReader) / 중규모(JAXB) / 대규모(StAX 상태머신)
- Virtual Thread + Semaphore로 병렬 상한 제어, MyBatis BATCH 청크 단위 flush
- 적재 전 인덱스 `UNUSABLE` → 대량 적재 → `REBUILD` + `DBMS_STATS`로 실행계획 회복
- MERGE UPSERT, XXE 방어, 무한루프 fail-fast, 메모리 가드

#### 알림톡 발송 서버
`Java 21` · `Spring Boot 3.3` · `RestClient` · `MyBatis 동적 SQL` · `Tibero`
- 발송/결과/정산을 단일 상태 컬럼(N→B→P→S) 상태머신으로 추적
- 외부 API 호출을 트랜잭션 경계 밖으로 분리, `WHERE` 상태 조건으로 스케줄러 race를 DB 원자성으로 차단
- 멱등 INSERT(`WHERE NOT EXISTS`), 무중단 Switch ON/OFF, 운영 사고 SQL 재현·복구 후 문서화

#### 본인인증(PASS) 발송
`Java 21` · `Spring Boot 3.4` · `ThreadPoolTaskScheduler` · `Log4j2(Disruptor)` · `Jasypt`
- N-스레드 stagger 분산 발송, `@PreDestroy` graceful cancel
- RestClient 타임아웃 504/500 정밀 분기, MyBatis BATCH 단위 flush
- Jenkins Pipeline(Unit→Integration→SonarQube Quality Gate→Build) + CycloneDX SBOM 자동 산출

#### 통합 인증 백엔드
`Java 8` · `Spring Boot 2.7` · `Spring Security / OAuth2` · `MyBatis 멀티 DataSource` · `Caffeine`
- 클라이언트 3종을 `@Order` + antMatcher로 `SecurityFilterChain` 분리 운영
- Access/Refresh 토큰 수명 분리, `type` 클레임 검증, Clock Skew 대응
- 도메인별 DataSource·TransactionManager 분리, Caffeine 캐시 `@Scheduled` 갱신

<br/>

---

## 📊 GitHub Activity

<div align="center">

<img height="170" src="https://github-readme-stats.vercel.app/api?username=black-astro&show_icons=true&theme=react&include_all_commits=true&count_private=true&hide_border=true&bg_color=0d1117&title_color=36BCF7&icon_color=36BCF7"/>
<img height="170" src="https://github-readme-stats.vercel.app/api/top-langs/?username=black-astro&layout=compact&theme=react&hide_border=true&bg_color=0d1117&title_color=36BCF7&langs_count=6"/>

<br/>

<img src="https://streak-stats.demolab.com/?user=black-astro&theme=react&hide_border=true&background=0D1117&ring=36BCF7&fire=36BCF7&currStreakLabel=36BCF7" alt="streak"/>

</div>

<br/>

<!-- 잔디 먹는 스네이크 (매일 자동 갱신) -->
<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/black-astro/black-astro/output/github-snake-dark.svg"/>
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/black-astro/black-astro/output/github-snake.svg"/>
  <img alt="snake" src="https://raw.githubusercontent.com/black-astro/black-astro/output/github-snake.svg"/>
</picture>

<br/><br/>

<!-- 3D 잔디 (매일 자동 생성) -->
<img src="./profile-3d-contrib/profile-night-rainbow.svg" alt="3d-contrib" width="88%"/>

<br/><br/>

<img src="https://github-readme-activity-graph.vercel.app/graph?username=black-astro&bg_color=0d1117&color=36BCF7&line=36BCF7&point=ffffff&area=true&hide_border=true&custom_title=Contribution%20Graph" width="94%" alt="activity"/>

</div>

<br/>

---

## ✍️ Blog

<!-- blog-post-workflow가 RSS를 읽어 최신 글을 자동으로 갱신합니다. -->
<!-- BLOG-POST-LIST:START -->
- RSS 연동 대기 중 — `feed_list`에 블로그 RSS 주소를 등록하면 최신 글이 자동으로 갱신됩니다.
<!-- BLOG-POST-LIST:END -->

<br/>

<div align="center">

<img
  width="100%"
  src="https://capsule-render.vercel.app/api?type=waving&color=0:2c5364,50:203a43,100:0f2027&height=130&section=footer&text=Thanks%20for%20visiting&fontSize=20&fontColor=ffffff&fontAlignY=68&animation=fadeIn"
  alt="footer"
/>

</div>
