/* ============================================================
   0. 공통 유틸 (파이썬 가이드와 동일한 기반 · 하이라이터만 자바용)
   ============================================================ */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* --- FLIP 애니메이션: DOM을 바꾸면 요소가 '날아서' 이동 --- */
function flip(root, mutate, dur = 620) {
  const els = $$("[data-flip]", root);
  const first = new Map(els.map(e => [e.dataset.flip, e.getBoundingClientRect()]));
  mutate();
  if (REDUCED) return;
  $$("[data-flip]", root).forEach(e => {
    const f = first.get(e.dataset.flip);
    const l = e.getBoundingClientRect();
    if (!f) {                                   // 새로 생긴 요소 -> 페이드인
      e.animate([{opacity:0, transform:"scale(.88)"},{opacity:1, transform:"none"}],
                {duration:380, easing:"cubic-bezier(.2,.85,.25,1)"});
      return;
    }
    const dx = f.left - l.left, dy = f.top - l.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    e.animate([{transform:`translate(${dx}px, ${dy}px)`},{transform:"none"}],
              {duration:dur, easing:"cubic-bezier(.2,.85,.25,1)"});
  });
}

/* --- 자바 문법 하이라이터 --- */
/* 정규식 '리터럴'로 한 번에 정의한다.
   (문자열을 이어붙여 new RegExp 로 만들면 백슬래시를 한 겹 더 써야 해서 실수가 잦다)
   그룹 순서: 1 주석 · 2 문자열 · 3 애너테이션 · 4 키워드 · 5 타입 · 6 메서드 · 7 숫자 */
const JV_RE = /(\/\/[^\n]*)|('[^'\n]*'|"[^"\n]*")|(@[A-Za-z]\w*)|\b(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while|var|record|sealed|permits|yield|true|false|null)\b|\b([A-Z][A-Za-z0-9]*)\b|\.([a-z_]\w*)(?=\()|\b(\d[\d_]*\.?\d*[LlFfDd]?)\b/g;

/* root를 받아 '보이는 탭'만 처리 — 초기 로딩 비용을 1/9로 */
function highlight(root){
  $$("pre.code code", root || document).forEach(el => {
    if (el.dataset.hl) return;
    el.dataset.hl = "1";
    let s = el.textContent
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    s = s.replace(JV_RE, (m, com, str, ann, kw, typ, fn, num) => {
      if (com) return `<span class="t-com">${com}</span>`;
      if (str) return `<span class="t-str">${str}</span>`;
      if (ann) return `<span class="t-ann">${ann}</span>`;
      if (kw)  return `<span class="t-kw">${kw}</span>`;
      if (typ) return `<span class="t-mod">${typ}</span>`;
      if (fn)  return `.<span class="t-fn">${fn}</span>`;
      if (num) return `<span class="t-num">${num}</span>`;
      return m;
    });
    el.innerHTML = s;
  });
  injectCopy(root || document);
}

/* 화면에 다가온 코드 블록만 하이라이트한다.
   탭 하나에 코드 블록이 100개 가까이 되므로 한 번에 처리하면 전환이 끊긴다. */
let hlIO = null;
function highlightLazy(root){
  if (!("IntersectionObserver" in window)) { highlight(root); return; }
  if (!hlIO){
    hlIO = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        hlIO.unobserve(e.target);
        highlight(e.target.parentElement || document);   // 복사 버튼 주입까지 함께
      });
    }, { rootMargin:"700px 0px" });
  }
  const list = $$("pre.code", root || document).filter(pre => {
    if (pre.dataset.hlq) return false;
    pre.dataset.hlq = "1";
    hlIO.observe(pre);
    return true;
  });
  idleHighlight(list);
}

/* 안전망 — 화면에 걸리지 않은 블록도 '유휴 시간'에 조금씩 마저 칠한다.
   한 번에 6개만 처리해 스크롤·입력을 막지 않는다. */
const idleRun = window.requestIdleCallback
  ? (fn) => requestIdleCallback(fn, { timeout: 400 })
  : (fn) => setTimeout(() => fn(null), 120);
function idleHighlight(list){
  let i = 0;
  const step = (dl) => {
    /* 최소 3개는 반드시 처리한다 — 남은 시간이 0으로 보고되는 백그라운드 탭에서
       한 개도 못 하고 무한히 되돌아오는 것을 막기 위해서다. */
    let n = 0;
    do {
      const pre = list[i++];
      if (pre && !pre.querySelector("code[data-hl]")) highlight(pre.parentElement || document);
      n++;
    } while (i < list.length && n < 8 &&
             (n < 3 || !dl || !dl.timeRemaining || dl.timeRemaining() > 3));
    if (i < list.length) idleRun(step);
  };
  idleRun(step);
}

/* --- 코드 복사 버튼 주입 + 동작 --- */
function injectCopy(root){
  $$("pre.code", root).forEach(pre => {
    if (pre.querySelector(".cbtn")) return;
    const b = document.createElement("button");
    b.className = "cbtn"; b.type = "button"; b.textContent = "복사";
    pre.appendChild(b);
  });
}
document.addEventListener("click", e => {
  const b = e.target.closest(".cbtn");
  if (!b) return;
  const text = b.parentElement.querySelector("code").textContent;
  const done = ok => {
    b.textContent = ok ? "복사됨 ✓" : "실패";
    b.classList.add("done");
    setTimeout(() => { b.textContent = "복사"; b.classList.remove("done"); }, 1400);
  };
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(() => done(true), () => fallbackCopy(text, done));
  } else fallbackCopy(text, done);
});
function fallbackCopy(text, done){
  const ta = document.createElement("textarea");
  ta.value = text; ta.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(ta); ta.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch(e){}
  ta.remove(); done(ok);
}

/* --- 환영 배너 --- */
function helloClose(){
  $("#hello").classList.add("off");
  try { localStorage.setItem("dvg-hello", "1"); } catch(e){}
}
try { if (localStorage.getItem("dvg-hello")) $("#hello").classList.add("off"); } catch(e){}

/* --- 인터랙티브 배지 --- */
$$(".stage-title").forEach(t => {
  if (t.querySelector(".int")) return;
  const s = document.createElement("span");
  s.className = "int"; s.textContent = "👆 직접 조작";
  t.appendChild(s);
});

/* ============================================================
   통합 검색 — 탭별 연관 키워드 사전 + 섹션 인덱스
   "데스크탑 프로그램" → PySide6,  "엑셀 자동화" → Pandas·GUI 자동화
   ============================================================ */
const TAB_KW = {
  lang:"c# csharp 씨샵 기초 문법 변수 타입 var 문자열 string 클래스 구조체 struct record 상속 인터페이스 컬렉션 list dictionary 제네릭 null nullable 예외 exception 델리게이트 이벤트 람다 linq 파일 io json 패턴매칭 dotnet 닷넷",
  adv:"고급 async await 비동기 task valuetask 취소 cancellationtoken 스레드 thread lock 동기화 channel 병렬 parallel span memory 힙 할당 gc 리플렉션 소스제너레이터 di 의존성주입 직렬화 pinvoke 네이티브 벤치마크 benchmarkdotnet 성능",
  unity:"유니티 unity 게임 game 엔진 씬 scene 게임오브젝트 gameobject 컴포넌트 component monobehaviour 생명주기 update transform 입력 input 프리팹 prefab 물리 rigidbody collider 애니메이션 animator ui ugui canvas 오디오 audio 저장 scriptableobject 2d 3d",
  ugame:"유니티실전 상용 프로젝트구조 오브젝트풀 pooling 프로파일러 profiler 드로우콜 배칭 batching srp urp 어드레서블 addressables 에셋번들 dots job burst 셰이더 shader 라이팅 포스트프로세싱 모바일최적화 빌드 스토어 인앱결제 iap 광고 애널리틱스 라이브운영 치트 보안",
  net:"게임서버 서버 네트워크 network 소켓 socket tcp udp 신뢰성udp 패킷 packet 직렬화 룸 세션 동기화 sync 권위서버 authoritative 클라이언트예측 prediction 보간 interpolation 매치메이킹 matchmaking mirror netcode photon 전용서버 dedicated 채팅 랭킹 리더보드 부하테스트 치트탐지 롤백 rollback",
  api:"aspnet aspnetcore 웹api rest minimal api 라우팅 di 설정 efcore entityframework db 인증 jwt 권한 정책 검증 validation 로깅 관측 signalr 실시간 백그라운드 큐 캐시 redis 테스트 게임백엔드 계정 인벤토리 결제 도커 배포",
  desk:"데스크탑 데스크톱 wpf winui maui avalonia xaml 바인딩 binding mvvm 컨트롤 스타일 템플릿 비동기ui 가상화 목록 엑셀 인쇄 sqlite 설정 트레이 자동시작 배포 msix clickonce 단일실행파일 자동업데이트 크래시",
  tool:"도구 로깅 serilog 설정 options http polly 재시도 직렬화 json messagepack 테스트 xunit moq testcontainers 통합테스트 벤치마크 프로파일링 analyzer editorconfig ci cd githubactions nuget 패키지 cli 컨테이너 에러사전",
  scale:"대규모 트래픽 동시접속 ccu 확장 스케일 수평확장 redis 레디스 랭킹 분산락 lock 메시지큐 kafka rabbitmq 샤딩 복제 캐시 스탬피드 게이트웨이 무중단 점검 모니터링 프로메테우스 grafana 장애 비용 글로벌 지연 latency 사후분석",
  deep:"전문가 심화 내부 clr jit il 바이트코드 메모리모델 gc 세대 loh 서버gc 누수 스레드풀 async상태기계 statemachine 락프리 interlocked struct 레이아웃 캐시라인 aot 트리밍 nativeaot 소스제너레이터 unsafe 포인터 프로파일링 dotnet-trace dump 보안 역직렬화 공급망 함수형 불변 디자인패턴 아키텍처",
  setup:"설치 세팅 환경설정 환경구성 셋업 setup install 닷넷 dotnet .NET NET10 net10 dotnet10 SDK 런타임 runtime 비주얼스튜디오 VisualStudio VS2026 Community 커뮤니티 워크로드 workload VSCode 브이에스코드 CDevKit DevKit 라이더 Rider JetBrains winget 윈겟 brew apt 우분투 Ubuntu 리눅스 Linux 맥 macOS 맥북 PATH 패스 환경변수 dotnetCLI CLI 명령어 dotnetnew dotnetrun dotnetbuild dotnetpublish 솔루션 sln slnx csproj 프로젝트파일 globaljson NuGet 뉴겟 누겟 패키지 package restore 복원 피드 feed 프록시 proxy 캐시 cache EFCore dotnetef 마이그레이션 LocalDB SQLServer SSMS 도커 Docker PostgreSQL SQLite HTTPS 인증서 devcerts editorconfig 에디터컨피그 dotnetformat 포맷 nullable 널러블 분석기 analyzer TreatWarningsAsErrors DirectoryBuildprops CI GitHubActions setupdotnet 트러블슈팅 오류 에러 error NETSDK1045 NU1101 NU1301 안됨 못찾음 notrecognized 포트충돌 5000 7000 한글경로 MAUI WinUI WPF WinForms Avalonia Godot Unity UnityHub 유니티 게임개발 데스크톱 LTS STS 버전 version 업그레이드 빈PC 처음",
  blazor:"blazor 블레이저 블레이조 razor 레이저 레이조 razor컴포넌트 rendermode 렌더모드 렌더링모드 interactiveserver interactivewebassembly interactiveauto staticssr 정적서버렌더 서버렌더링 사전렌더링 prerender 하이드레이션 hydration webassembly 웹어셈블리 wasm 와즘 dotnet10 net10 dotnetnew blazorwebapp 블레이저웹앱 componentbase 컴포넌트 parameter eventcallback renderfragment cascadingparameter statehaschanged 수명주기 lifecycle oninitialized onafterrender editform 에디트폼 datannotations 검증 validation inputfile 파일업로드 virtualize 가상스크롤 quickgrid 퀵그리드 dbcontextfactory efcore 이에프코어 httpclient 인증 authorizeview authenticationstateprovider identity 아이덴티티 jwt oidc 인가 정책 jsinterop js상호운용 ijsruntime dotnetobjectreference jsinvokable signalr 시그널알 회로 circuit 재연결 reconnect 백플레인 redis aot 트리밍 trimming 번들크기 pwa 서비스워커 nginx iis docker 도커 배포 aspire 애스파이어 닷넷애스파이어 apphost 서비스디스커버리 servicediscovery 대시보드 opentelemetry 트레이스 maui 마우이 blazorhybrid 하이브리드 blazorwebview rcl razorclasslibrary 컴포넌트재사용 react 리액트 vue 뷰 프런트엔드 프론트엔드 웹UI 웹프론트 csharp웹 시샵웹",
  ent:"엔터프라이즈 업무시스템 사내시스템 스프링 spring springboot 스프링부트 자바 java 전환 마이그레이션 이직 aspnetcore asp.net 닷넷 dotnet net10 .NET10 csharp C#14 efcore EFCore10 jpa hibernate 하이버네이트 orm 영속성컨텍스트 changetracker 변경추적 di 의존성주입 ioc 컨테이너 singleton scoped transient 수명 lifetime captive 미들웨어 middleware 서블릿필터 servletfilter 인터셉터 파이프라인 program.cs 호스팅 ihostedservice backgroundservice 계층 레이어 클린아키텍처 cleanarchitecture mediatr cqrs 유스케이스 도메인 domain 리포지토리 repository 트랜잭션 transaction transactional savechanges transactionscope 격리수준 아웃박스 outbox 보상트랜잭션 saga 데드락 재시도 dapper mybatis 마이바티스 저장프로시저 storedprocedure 멀티테넌시 multitenancy 읽기복제본 replica 검증 validation fluentvalidation beanvalidation dataannotations problemdetails rfc9457 예외처리 exceptionhandler controlleradvice mapperly mapstruct automapper dto 설정 configuration appsettings applicationyml 프로파일 profile 환경변수 usersecrets keyvault 시크릿 ioptions optionsmonitor 인증 authentication 인가 authorization oidc jwt keycloak entraid azuread ad windows인증 negotiate 정책 policy preauthorize 감사로그 auditlog 관측 observability serilog opentelemetry 헬스체크 healthcheck actuator 상관관계id traceid 테스트 xunit webapplicationfactory springboottest testcontainers 통합테스트 격리 respawn 결재 결재선 approval 사내결재 워크플로 n+1 include assplitquery asnotracking rowversion 낙관적잠금 동시성 마이그레이션 migration flyway docker 도커",
  batch:"배치 batch 스프링배치 SpringBatch 하나에프 Hangfire 행파이어 Quartz 쿼츠 쿼르츠 QuartzNET 워커 Worker WorkerService BackgroundService IHostedService 백그라운드서비스 스케줄러 scheduler 크론 cron 크론탭 crontab 미스파이어 misfire 잡 job 청크 chunk 커밋단위 체크포인트 checkpoint 재시작 restart 멱등 idempotent 멱등성 대용량 대량 벌크 bulk SqlBulkCopy 벌크카피 BulkExtensions ExecuteUpdate ExecuteDelete 키셋 keyset 페이징 paging OFFSET 스테이징 staging MERGE 머지 업서트 upsert 파일 file 스트리밍 streaming StreamReader PipeReader CsvHelper 시에스브이 CSV 엑셀 excel ClosedXML EPPlus MiniExcel OpenXml 고정폭 fixedwidth 인코딩 encoding EUCKR euc-kr CP949 949 한글깨짐 BOM 업로드 upload 다운로드 download 멀티파트 multipart MultipartReader 스트리밍업로드 청크업로드 이어받기 resume Range 206 FTP SFTP FTPS SSHNET FluentFTP EAI 연계 인터페이스 파일연계 FileSystemWatcher 폴링 polling 원자적 atomic rename 이름변경 트레일러 trailer 헤더 header HttpClient HttpClientFactory IHttpClientFactory 소켓고갈 SocketException DNS Polly 폴리 Refit 리핏 서킷브레이커 circuitbreaker 재시도 retry 타임아웃 timeout 레이트리밋 ratelimit mTLS 인증서 프록시 gRPC 지알피씨 스트리밍RPC MassTransit 매스트랜싯 RabbitMQ 래빗엠큐 Kafka 카프카 KafkaListener 아웃박스 outbox DLQ 데드레터 Channels 채널 BoundedChannel 백프레셔 backpressure ParallelForEachAsync 병렬 parallel IAsyncEnumerable 비동기열거 ArrayPool Span 메모리 memory OOM 야간배치 배치창 SLA 운영 알림 슬랙 slack 재처리 정산 settlement 자바 java Spring 스프링 닷넷 dotnet NET10 C#14 EFCore10",
  host:"호스팅 배포 서버구축 서버 구축 배포하기 deploy hosting kestrel 케스트럴 케스트렐 iis 아이아이에스 ancm aspnetcoremodule 호스팅번들 hosting bundle 앱풀 apppool 웹컨피그 web.config systemd 시스템디 유닛 unit service 서비스등록 sc.exe 윈도우서비스 windows service nginx 엔진엑스 엔진액스 apache 아파치 리버스프록시 reverse proxy proxy_pass 프록시 톰캣 tomcat war 톰켓 자바대응 forwardedheaders x-forwarded-for 포워디드 yarp 야프 게이트웨이 gateway 스프링클라우드게이트웨이 https 인증서 certificate ssl tls 인증서갱신 letsencrypt 렛츠인크립트 certbot win-acme pfx pem 사내ca 자체서명 keytool jks hsts mtls publish 게시 자체포함 self-contained framework-dependent fdd scd 단일파일 singlefile readytorun r2r nativeaot aot 트리밍 trimming 런타임설치 무중단배포 무중단 롤링 블루그린 app_offline 앱오프라인 헬스체크 healthcheck readiness liveness 마이그레이션 롤백 도커 docker 컨테이너 container chiseled alpine dockerfile 멀티스테이지 비루트 성능튜닝 튜닝 gc 서버gc 워크스테이션gc gcserver threadpool 스레드풀 tieredpgo 커넥션풀 connectionpool 응답압축 출력캐싱 outputcache 부하테스트 bombardier k6 dotnet-counters dotnet-trace dotnet-dump dotnet-gcdump dotnet-monitor 진단 덤프 502.5 500.30 500.19 500.21 504 413 포트점유 netstat ss 권한거부 메모리누수 높은cpu 한글깨짐 인코딩 utf-8 방화벽 ufw firewall 우분투 ubuntu 윈도우서버 windowsserver 리눅스 linux 폐쇄망 온프레미스 사내서버 업무시스템 엔터프라이즈 journalctl 이벤트로그 eventlog dotnet10 net10 닷넷10 csharp14",
};

const FIND_CHIPS = ["오브젝트 풀링","클라이언트 예측","async await","Span 성능",
                    "패킷 직렬화","매치메이킹","EF Core 연동","SignalR 실시간",
                    "드로우콜 줄이기","Addressables","GC 튀는 문제","WPF MVVM",
                    "JWT 로그인","분산 락","Native AOT","치트 방지"];
const SEC_KW = {
  /* 하려는 일을 한글로 쳤을 때 걸리게 하는 보강 키워드 */
  c01:"dotnet 설치 sdk 실행 콘솔 프로젝트 csproj 템플릿 런타임 il2cpp mono",
  c02:"변수 타입 var int float decimal 값타입 참조타입 struct class 복사 vector3",
  c03:"문자열 string 보간 stringbuilder 이어붙이기 할당 substring",
  c04:"조건 반복 for foreach while switch 패턴매칭 범위 인덱스",
  c05:"클래스 구조체 record 생성자 속성 프로퍼티 with 불변",
  c06:"상속 인터페이스 추상 abstract virtual override sealed 조합 컴포넌트",
  c07:"컬렉션 list dictionary hashset queue stack trygetvalue 성능 용량",
  c08:"제네릭 where 제약 null nullable 널안전 nullreference 물음표",
  c09:"델리게이트 이벤트 람다 action func 구독 해지 메모리누수",
  c10:"linq where select orderby groupby 지연실행 tolist 할당",
  c11:"예외 try catch finally using 파일 io json 저장 세이브 임시파일",
  c12:"치트시트 문법 색인 로드맵 다음단계",
  c13:"튜플 tuple valuetuple 해체 deconstruct deconstruction 다중반환 여러값 반환 스왑 out",
  c14:"확장메서드 extension this linq enumerable 체인 정적메서드 관용구 남용",
  c15:"날짜 시간 datetime datetimeoffset utc 시간대 timezoneinfo timespan unixtime 유닉스시간 dateonly timeonly timeprovider 서버시간 리셋 쿨타임",
  c16:"열거형 enum flags 플래그 비트 tryparse isdefined 상태 gamestate 상태전환 파싱 저장",
  a01:"async await 비동기 task 스레드반납 처리량 데드락 result wait 병렬",
  a02:"task valuetask 취소 cancellationtoken 타임아웃 재시도 백오프 polly",
  a03:"스레드 lock 동기화 interlocked concurrent channel 생산자소비자 경쟁상태",
  a04:"span memory arraypool stackalloc 할당없음 제로할당 패킷파싱 슬라이스",
  a05:"gc 가비지컬렉션 할당 박싱 클로저 프레임튐 alloc 최적화",
  a06:"di 의존성주입 컨테이너 singleton scoped transient options 설정",
  a07:"직렬화 json systemtextjson messagepack protobuf 소스제너레이터",
  a08:"리플렉션 attribute 소스제너레이터 generatedregex loggermessage aot",
  a09:"pinvoke dllimport libraryimport 네이티브 c++ 마셜링 상호운용",
  a10:"벤치마크 benchmarkdotnet 성능측정 memorydiagnoser release",
  a11:"프로젝트구조 솔루션 아키텍처 계층 의존방향 netarchtest directorybuildprops",
  a12:"실수 안티패턴 datetime random dispose 문자열비교 float비교",
  a13:"parallel plinq asparallel 병렬 foreach 멀티코어 cpu 공유상태 경합 maxdegreeofparallelism 취소",
  a14:"정규식 regex generatedregex 타임아웃 redos nonbacktracking stringbuilder stringcreate 로그파싱 닉네임 검증",
  a15:"암호화 해시 sha256 hmac 서명 웹훅 aes gcm 비밀번호 pbkdf2 bcrypt 난수 randomnumbergenerator 가챠 뽑기 md5 보안 토큰",
  u01:"유니티 설치 hub 에디터 창 씬 게임 하이어라키 인스펙터 프로젝트 urp",
  u02:"게임오브젝트 컴포넌트 monobehaviour getcomponent instantiate destroy 태그",
  u03:"생명주기 awake start update fixedupdate lateupdate ondestroy deltatime",
  u04:"transform 위치 회전 quaternion 벡터 magnitude normalized dot lerp",
  u05:"입력 input inputsystem 키보드 마우스 패드 터치 getaxis 액션",
  u06:"프리팹 prefab instantiate 복제 오브젝트풀 pooling",
  u07:"물리 rigidbody collider 충돌 트리거 addforce velocity 레이캐스트 관통",
  u08:"애니메이션 animator 상태기계 파라미터 오디오 audiosource 사운드 믹서",
  u09:"ui ugui canvas 캔버스 스케일러 앵커 textmeshpro 버튼 슬라이더 최적화",
  u10:"씬 전환 loadscene 비동기 로딩바 additive dontdestroyonload 싱글턴",
  u11:"scriptableobject 데이터 세이브 저장 json playerprefs persistentdatapath",
  u12:"오류 nullreference 통과 충돌안됨 빌드차이 프레임튐 문제해결",
  u13:"코루틴 coroutine ienumerator yield waitforseconds waitforsecondsrealtime invoke invokerepeating async await awaitable unitask 비동기 취소 cancellationtoken destroycancellationtoken stopcoroutine",
  u14:"카메라 camera cinemachine 시네머신 virtual camera cinemachinecamera follow confiner impulse 흔들림 셰이크 lateupdate smoothdamp orthographic perspective 직교 원근 fov priority",
  u15:"2d 스프라이트 sprite pixels per unit ppu spriterenderer sorting layer 정렬 order in layer 타일맵 tilemap rule tile tile palette composite collider 픽셀아트 point filter pixel perfect rigidbody2d gravityscale",
  u16:"적 ai navmesh 길찾기 pathfinding navmeshagent navmeshsurface 베이크 bake setdestination stoppingdistance 순찰 추적 patrol chase attack fsm 상태머신 상태 머신 enum raycast 시야 판정 offmeshlink warp",
  u17:"이펙트 파티클 particle system emission shape burst color over lifetime 히트 풀링 onparticlesystemstopped shader graph 셰이더 그래프 fresnel 디졸브 post processing 후처리 volume bloom vignette urp emission hdr 오버드로우 모바일",
  g01:"프로젝트구조 폴더 asmdef 어셈블리 컴파일시간 의존",
  g02:"오브젝트풀 pooling 총알 이펙트 재사용 prewarm 할당",
  g03:"프로파일러 profiler 성능측정 gcalloc setpass 스파이크 셰이더컴파일",
  g04:"드로우콜 배칭 batching srp gpuinstancing 아틀라스 materialpropertyblock 그림자 overdraw lod",
  g05:"addressables 에셋번들 메모리 다운로드 참조카운트 release 용량",
  g06:"dots ecs job burst nativearray 병렬 멀티코어 mathematics",
  g07:"모바일 최적화 발열 스로틀링 targetframerate 해상도 il2cpp 스트리핑 astc",
  g08:"빌드 buildpipeline 자동화 스토어 출시 키스토어 서명 버전",
  g09:"인앱결제 iap 영수증 검증 광고 ssv 중복지급 환불",
  g10:"라이브운영 원격설정 강제업데이트 점검 크래시 crashlytics 지표 ab테스트",
  g11:"치트 해킹 메모리조작 속도핵 리패킹 무결성 서버검증 탐지 밴",
  g12:"출시전 점검 체크리스트 저사양 메모리 재접속",
  g13:"해상도 safe area 세이프에리어 노치 펀치홀 canvas scaler 캔버스 스케일러 scale with screen size match 앵커 피벗 anchor pivot stretch 태블릿 가로 세로 회전 device simulator 디바이스 시뮬레이터",
  g14:"로컬라이제이션 localization 현지화 다국어 번역 글로벌 출시 string table locale 로케일 폰트 폴백 fallback cjk tmp font asset cultureinfo 날짜 숫자 포맷 invariant 번역 키 smart string rtl 말줄임 ellipsis auto size 심의 iarc pseudo locale",
  g15:"절차적 생성 procedural 랜덤 시드 seed system.random unityengine.random 재현 데일리 던전 가중치 뽑기 가챠 확률표 셔플 shuffle fisher yates 피셔 예이츠 맵 생성 랜덤워크 그리드 리플레이 서버 검증 결정성 determinism",
  g16:"게임 필 game feel 주스 juice 손맛 타격감 히트스톱 hitstop 화면 흔들림 screen shake cinemachine impulse 트윈 tween dotween 펀치 스케일 setlink 햅틱 진동 vibrate 코요테 타임 coyote time 입력 버퍼 input buffer 플랫포머 접근성 색약 폰트 크기 감도 광과민성",
  n01:"게임서버 구조 p2p listen dedicated 전용서버 장르 동기화주기",
  n02:"tcp udp 신뢰성udp 패킷유실 순서 nodelay 채널",
  n03:"소켓 socket tcplistener 수신루프 길이헤더 메시지경계 arraypool pipelines",
  n04:"패킷 설계 직렬화 압축 델타 aoi 관심영역 배칭 버전호환",
  n05:"룸 세션 게임루프 틱 20hz channel 단일스레드 락없음 스냅샷",
  n06:"권위서버 authoritative 서버검증 클라이언트불신 이동검증 쿨타임 사거리",
  n07:"클라이언트예측 prediction 재조정 reconciliation 보간 interpolation 지연보상 lagcompensation 롤백",
  n08:"매치메이킹 matchmaking 큐 실력 elo glicko 대기시간 파티 지역",
  n09:"mirror netcode photon fusion networkvariable rpc 전용서버 비용",
  n10:"채팅 랭킹 리더보드 sortedset 길드 pubsub 도배 금칙어",
  n11:"부하테스트 봇 bot ccu 틱시간 대역폭 재접속폭풍 p99",
  n12:"운영 장애 스냅샷 재접속 드레인 점검 관측 지표 알림",
  n13:"websocket 웹소켓 웹게임 캐주얼 브라우저 방화벽 http 업그레이드 프레이밍 json 바이너리 하트비트 ping pong 재접속 acceptwebsocketasync",
  n14:"시간동기화 틱 tick 틱레이트 tickrate hz 고정스텝 fixed step 시뮬레이션 rtt 핑 오프셋 지연 예산 서버시간 밀림 캐치업",
  n15:"아키텍처 사례 장르별 턴제 비동기 룸 기반 실시간 mmo 존 서버구조 기술스택 선택 과설계 http만 소켓 언제",
  w01:"aspnetcore minimalapi 웹api 엔드포인트 라우팅 openapi",
  w02:"설정 appsettings 환경 usersecrets 환경변수 options 검증",
  w03:"efcore 엔티티 마이그레이션 n+1 include asnotracking 인덱스 페이징",
  w04:"인증 jwt 토큰 게스트로그인 소셜 계정연동 idtoken 검증",
  w05:"검증 validation fluentvalidation 에러처리 problemdetails traceid 에러코드",
  w06:"signalr 실시간 허브 그룹 백플레인 redis 재연결 sticky",
  w07:"캐시 hybridcache 백그라운드 backgroundservice 스케줄 분산락 스코프",
  w08:"재화 인벤토리 구매 트랜잭션 멱등성 조건부업데이트 골드로그 동시성",
  w09:"로깅 구조적로그 opentelemetry 추적 지표 traceid 민감정보",
  w10:"테스트 xunit 통합테스트 webapplicationfactory testcontainers 동시성",
  w11:"배포 docker 도커 헬스체크 무중단 그레이스풀 마이그레이션",
  w12:"체크리스트 보안 운영 백업 점검 대시보드",
  w13:"grpc proto protobuf http2 스트리밍 서버간 내부통신 매치메이커 계약 코드생성 채널 데드라인 reserved 필드번호 grpc-web unity",
  w14:"어드민 admin 운영도구 gm 명령 우편 지급 회수 밴 제재 공지 점검모드 감사로그 audit 2인승인 상한선 사유 swagger ip제한",
  k01:"규모 ccu rps 대역폭 용량산정 slo 병목순서",
  k02:"수평확장 무상태 stateless 세션 redis 게임서버 방단위 매치메이커",
  k03:"redis 자료구조 sortedset 랭킹 분산락 lua 선착순 단일장애점",
  k04:"캐시 스탬피드 만료 지터 무효화 핫키 버전키 로컬캐시",
  k05:"복제 replica 읽기전용 복제지연 샤딩 shard 아카이빙",
  k06:"메시지큐 아웃박스 outbox kafka rabbitmq 멱등 dlq 소비지연",
  k07:"부하제어 ratelimit 429 대기열 서킷브레이커 폴백 재시도폭풍 retryafter",
  k08:"게임서버스케일 노드 드레인 축소 오케스트레이터 agones 스팟",
  k09:"무중단 배포 롤링 블루그린 카나리 점검 스키마변경 롤백",
  k10:"모니터링 지표 에러율 p99 경보 알림피로 런북",
  k11:"장애대응 시나리오 롤백 사후분석 포스트모템 인지시간",
  k12:"비용 대역폭 인스턴스 로그보관 글로벌 리전 지연 법규",
  d01:"wpf winui maui avalonia 데스크탑 선택 electron javafx 비교",
  d02:"wpf xaml grid stackpanel 레이아웃 dpi 매니페스트",
  d03:"바인딩 binding mvvm observableobject relaycommand datacontext 컨버터",
  d04:"비동기ui 응답없음 dispatcher progress 취소 디바운스 데드락",
  d05:"가상화 virtualization datagrid 대용량 목록 페이징 observablecollection",
  d06:"엑셀 excel closedxml epplus interop csv 인쇄 파일대화상자",
  d07:"sqlite 로컬db 설정 localapplicationdata dpapi 암호화 경로",
  d08:"트레이 notifyicon 단일인스턴스 mutex 자동시작 레지스트리 run",
  d09:"배포 단일실행파일 publishsinglefile selfcontained msix clickonce 서명 smartscreen",
  d10:"자동업데이트 강제업데이트 버전 해시검증 크래시 unhandledexception 로그",
  d11:"사내연동 시리얼포트 프린터 zpl 공유폴더 filesystemwatcher ad 통합인증 db직접연결",
  d12:"체크리스트 사용성 창위치 고dpi 배포점검",
  t01:"도구 라이브러리 목적별 찾기 추천",
  t02:"로깅 serilog 구조적로깅 싱크 보관기간 레벨 민감정보",
  t03:"httpclient refit polly 재시도 서킷 타임아웃 소켓고갈 factory",
  t04:"테스트 xunit fact theory nsubstitute moq 단위테스트 경계값",
  t05:"통합테스트 testcontainers 진짜db webapplicationfactory 멱등",
  t06:"analyzer editorconfig 경고 treatwarningsaserrors 중앙패키지 취약점",
  t07:"ci cd githubactions 빌드 테스트 도커 unity lfs 캐시",
  t08:"cli spectreconsole 스크립트 단일파일 운영도구 진행바",
  t09:"nuget 패키지 pack push semver 사내패키지 unity호환",
  t10:"컨테이너 compose 로컬환경 aspire 대시보드 의존서비스",
  t11:"unitask vcontainer dotween addressables odin 에디터확장 menuitem",
  t12:"에러사전 nullreference objectdisposed 빌드실패 il2cpp 배포오류",
  z01:"clr jit il 계층컴파일 tier 인라이닝 워밍업 ilspy il2cpp aot",
  z02:"메모리 스택 힙 객체헤더 패딩 레이아웃 struct크기 in매개변수",
  z03:"gc 세대 gen0 gen1 gen2 loh 서버gc 워크스테이션gc 힙상한 collect",
  z04:"메모리누수 leak 이벤트미해지 static 덤프 gcroot dotnetdump 약한참조",
  z05:"async 상태기계 statemachine valuetask configureawait synchronizationcontext",
  z06:"스레드풀 기아 starvation result 차단 큐길이 minthreads 전용스레드",
  z07:"메모리모델 volatile interlocked cas 락프리 재배치 가시성 aba",
  z08:"캐시라인 데이터지역성 falsesharing soa 패딩 simd dots",
  z09:"nativeaot aot 트리밍 trimming 리플렉션제한 소스제너레이터 시작시간",
  z10:"프로파일링 dotnetcounters dotnettrace dotnetdump gcdump clrstack syncblk",
  z11:"보안 역직렬화 binaryformatter typenamehandling 공급망 취약점 lockfile",
  z12:"최적화 순서 측정 제거 축소 미세최적화 근거",
  st01:"닷넷 .NET NETCore NETFramework Mono SDK 런타임 runtime LTS STS net10 net8 버전 사이드바이사이드 dotnetinfo listsdks TargetFramework C#14 계보 차이 구분",
  st02:"VisualStudio 비주얼스튜디오 VS2026 Community 커뮤니티 무료 라이선스 워크로드 workload 설치관리자 Installer vsinstaller vswhere 용량 설치위치 캐시 winget BuildTools 첫실행 계정로그인",
  st03:"SDK 설치 다운로드 dotnetmicrosoft winget x64 Arm64 PATH 환경변수 where dotnettools 전역도구 VSCode CDevKit 확장 extension dotnetinstall 관리자권한없이 DOTNETROOT 제거 재설치",
  st04:"macOS 맥 맥북 pkg brew Homebrew AppleSilicon Arm64 Ubuntu 우분투 apt packagesmicrosoft Debian Fedora dnf Arch dotnetinstallsh 도커 systemd Rider Avalonia WPF불가 크로스플랫폼",
  st05:"dotnetCLI dotnetnew dotnetbuild dotnetrun dotnettest dotnetpublish dotnetwatch 템플릿 template 솔루션 sln slnx csproj 프로젝트참조 reference globaljson rollForward RID selfcontained AOT 빌드",
  st06:"NuGet 뉴겟 누겟 패키지 package restore 복원 캐시 locals 피드 source NuGetConfig 프록시 proxy 사내피드 Nexus AzureArtifacts NU1101 NU1301 중앙패키지관리 DirectoryPackagesprops 잠금파일 lockfile 취약점 vulnerable",
  st07:"VisualStudio 설정 옵션 테마 글꼴 CascadiaCode 저장시서식 editorconfig 솔루션탐색기 디버거 중단점 breakpoint 조건부중단점 추적점 tracepoint 조사식 watch 예외설정 핫리로드 hotreload 단축키 확장 Roslynator",
  st08:"Rider JetBrains Toolbox 라이선스 비상업무료 VSCode settingsjson launchjson tasksjson problemMatcher 디버깅 원격개발 Remote SSH WSL 도커 프로파일러 dotMemory 편집기선택 IDE비교",
  st09:"WPF WinForms WinUI WindowsAppSDK MAUI 워크로드 dotnetworkload mauicheck JDK AndroidSDK 에뮬레이터 iOS Xcode Unity UnityHub 유니티 Godot 고도 Avalonia 데스크톱 게임 netwindows NETSDK1100",
  st10:"ASPNETCore webapi Kestrel HTTPS 인증서 devcerts trust launchSettings 포트 5000 7000 포트충돌 netstat SQLServer Express LocalDB SSMS 도커 Docker PostgreSQL SQLite EFCore dotnetef 마이그레이션 usersecrets 연결문자열 httpfile",
  st11:"editorconfig nullable 널러블 NullReferenceException 분석기 analyzer EnableNETAnalyzers AnalysisMode TreatWarningsAsErrors 경고 warning dotnetformat verifynochanges DirectoryBuildprops Husky githook CI GitHubActions setupdotnet 커버리지 lockedmode",
  st12:"오류 에러 트러블슈팅 안됨 dotnet못찾음 notrecognized commandnotfound NETSDK1045 NETSDK1141 NETSDK1100 NU1101 NU1301 globaljson 인증서경고 포트점유 bindtoaddress 한글경로 공백경로 OneDrive 워크로드누락 캐시정리 binlog 환경변수 DOTNETROOT 점검표",
  b01:"blazor 렌더모드 rendermode staticssr interactiveserver interactivewebassembly interactiveauto 정적렌더 회로 오프라인 번들크기 react비교 vue비교 선택기준 팀역량 첫로딩",
  b02:"dotnetnew blazor 템플릿 interactivity 프로젝트구조 app.razor routes.razor imports.razor 핫리로드 dotnetwatch rendermode 지정 rendererinfo antiforgery addadditionalassemblies 404 버튼이안눌림",
  b03:"razor 문법 parameter editorrequired eventcallback renderfragment childcontent 템플릿 typeparam key 바인딩 bind onclick 코드비하인드 partial 이벤트 조건렌더 반복렌더",
  b04:"수명주기 lifecycle oninitialized onparametersset onafterrender statehaschanged invokeasync dispatcher 캐스케이딩 cascadingvalue isfixed 상태컨테이너 di 스코프 scoped singleton owningcomponentbase 사전렌더링두번",
  b05:"editform inputtext inputnumber inputselect inputfile 검증 validation dataannotations validationmessage editcontext validationmessagestore 커스텀검증 ivalidatableobject 파일업로드 openreadstream formname antiforgery supplyparameterfromform",
  b06:"dbcontextfactory addbcontextfactory efcore asnotracking httpclient getfromjsonasync 토큰 delegatinghandler virtualize itemsprovider itemsize overscan quickgrid iqueryable paginator persistentcomponentstate n+1 디바운스",
  b07:"인증 인가 identity 아이덴티티 authorizeview authorize authenticationstateprovider cascadingauthenticationstate authorizerouteview 역할 roles 정책 policy jwt oidc entraid msal persistentauthenticationstateprovider 로그인 static ssr",
  b08:"jsinterop js상호운용 ijsruntime invokeasync invokevoidasync ijsobjectreference import 모듈 dotnetobjectreference jsinvokable elementreference onafterrenderasync jsdisconnectedexception iasyncdisposable ijsstreamreference ijsinprocessruntime 차트",
  b09:"signalr 회로 circuit 웹소켓 websocket 재연결 reconnect reconnectmodal circuithandler disconnectedcircuit hubconnection hubcontext 그룹 백플레인 redis 고정세션 sticky 스케일아웃 알림 실시간",
  b10:"성능 번들크기 트리밍 publishtrimmed trimmode invariantglobalization aot runaotcompilation wasmtools lazyload 지연로딩 브로틀리 압축 사전렌더링 회로메모리 dotnetcounters shouldrender 낙관적ui docker nginx iis websocket업그레이드 pwa 서비스워커",
  b11:"aspire 애스파이어 닷넷애스파이어 apphost distributedapplication servicedefaults addproject withreference waitfor addpostgres addredis 서비스디스커버리 servicediscovery 대시보드 opentelemetry 트레이스 메트릭 헬스체크 resilience azd 매니페스트 addparameter addnpmapp",
  b12:"maui 마우이 blazorhybrid 하이브리드 blazorwebview mauiblazor mauiblazorweb rcl razorclasslibrary 컴포넌트재사용 iformfactor 인터페이스 di등록 content경로 정적자산 webview2 wkwebview 네이티브ui 언제쓰나",
  b13:"실전 프로젝트 재고관리 대시보드 폴더구조 솔루션 apphost servicedefaults shared 공유모델 minimalapi 멱등키 requestid 트랜잭션 감사로그 virtualize signalr 디바운스 mapforwarder 프록시 efbundle 마이그레이션 컨테이너 배포순서 인그레스 고정세션 체크리스트",
  e01:"spring 스프링 대응표 개념지도 component autowired transactional aop applicationyml appsettings actuator healthchecks maven gradle nuget csproj 톰캣 kestrel 마이그레이션 전환 자바개발자 bean 서비스등록 프로젝트구조",
  e02:"program.cs webapplicationbuilder 미들웨어 middleware 파이프라인 서블릿필터 servletfilter doFilter next 순서 build 컨테이너잠김 ihost 수명주기 ihostedservice postconstruct predestroy graceful shutdown 종료신호 kestrel 내장서버 correlationid onstarting",
  e03:"di 의존성주입 ioc singleton scoped transient 수명 lifetime captive dependency 스코프 createscope iservicescopefactory dbcontextfactory validatescopes scrutor componentscan 어셈블리스캔 키드서비스 keyedservices qualifier ioptions optionssnapshot optionsmonitor 데코레이터",
  e04:"계층 레이어 layer 클린아키텍처 cleanarchitecture 헥사고날 프로젝트분리 csproj 참조 reference directorybuildprops 도메인 domain application infrastructure mediatr cqrs 유스케이스 파이프라인동작 pipelinebehavior result 패턴 예외 도메인이벤트 아키텍처테스트 archunit",
  e05:"efcore ef core10 jpa hibernate 영속성컨텍스트 changetracker 변경추적 상태 detached added modified deleted 지연로딩 lazyloading n+1 include theninclude assplitquery 카티전 asnotracking 투영 select 컴파일쿼리 인터셉터 entitylisteners 마이그레이션 migration flyway rowversion xmin 낙관적동시성 concurrency",
  e06:"트랜잭션 transaction transactional 전파 propagation requiresnew savechanges begintransaction transactionscope msdtc 분산트랜잭션 격리수준 isolationlevel serializable 세이브포인트 savepoint 데드락 재시도 executionstrategy enableretryonfailure 아웃박스 outbox 보상트랜잭션 saga 멱등 skiplocked",
  e07:"dapper mybatis 마이바티스 sql 원시문자열 rawstring 저장프로시저 storedprocedure dynamicparameters commandtimeout 윈도함수 rank 멀티db 읽기복제본 replica 복제지연 멀티테넌시 multitenancy 테넌트 queryfilter ignorequeryfilters sqlbulkcopy npgsql",
  e08:"검증 validation fluentvalidation beanvalidation dataannotations notblank valid problemdetails rfc9457 rfc7807 에러응답 exceptionhandler iexceptionhandler controlleradvice 전역예외 mapperly mapstruct automapper dto record 투영 iqueryable",
  e09:"설정 configuration appsettings applicationyml 프로파일 profile aspnetcore_environment dotnet_environment 환경변수 이중밑줄 usersecrets 시크릿 keyvault secretsmanager ioptions optionsmonitor reloadonchange validateonstart 기동실패 healthcheck live ready getdebugview 커넥션문자열",
  e10:"인증 authentication 인가 authorization oidc oauth2 jwt jwtbearer keycloak entraid azuread 사내sso ad windows인증 negotiate roleclaimtype 클레임 claims 정책 policy authorizationhandler preauthorize 자원기반 resourcebased apikey mtls 다중스킴 policyscheme fallbackpolicy 감사로그 auditlog 401 403 404",
  e11:"관측 observability 로깅 logging serilog 구조화로그 structuredlogging beginscope 스코프 mdc opentelemetry otel 트레이싱 tracing 메트릭 metrics meterfactory 상관관계id correlationid traceid traceparent w3c 헬스체크 healthcheck actuator live ready 업무메트릭 개인정보마스킹",
  e12:"테스트 test xunit fact theory webapplicationfactory springboottest mockbean configuretestservices testcontainers 통합테스트 integrationtest 격리 isolation respawn 트랜잭션롤백 인증우회 testauthhandler 데이터빌더 builder 테스트피라미드 fluentassertions iclock 한글테스트이름",
  e13:"실전 결재 결재선 approval 사내시스템 업무시스템 프로젝트구조 솔루션 도메인모델 엔티티 efcore매핑 ientitytypeconfiguration 인터셉터 감사로그 auditlog 아웃박스 outbox 권한정책 통합테스트 동시성테스트 rowversion dockerfile 멀티스테이지 chiseled 시간대 timezone kst utc springboot비교",
  f01:"배치선택 SpringBatch 대응 Hangfire Quartz QuartzNET WorkerService 작업스케줄러 크론 대시보드 잡스토어 온프레미스 비교표 결정흐름도",
  f02:"BackgroundService IHostedService PeriodicTimer 수명주기 graceful ShutdownTimeout CancellationToken 스코프 captive 뮤텍스 sp_getapplock 단일실행 중복방지 AddWindowsService AddSystemd",
  f03:"크론 cron 6자리 5자리 미스파이어 misfire FireAndProceed 시간대 timezone KST UTC 서머타임 Hangfire AutomaticRetry DisableConcurrentExecution 연속작업 캐치업 catchup 시퀀스",
  f04:"청크 chunk 커밋단위 체크포인트 재시작 restart JobRepository BatchRun BatchSkip 스킵 skiplimit IAsyncEnumerable yield EnumeratorCancellation ChunkAsync 멱등 idempotent 이력스키마",
  f05:"SqlBulkCopy 벌크 BulkExtensions FastMember ObjectReader 스테이징 MERGE 업서트 ExecuteUpdate ExecuteDelete 락에스컬레이션 키셋페이징 OFFSET 인덱스비활성 BULKLOGGED TABLOCK TVP 파티션스위칭",
  f06:"StreamReader PipeReader 스트리밍 CsvHelper ClassMap 고정폭 fixedwidth 바이트자르기 EUCKR CP949 949 CodePages 인코딩판별 BOM ClosedXML EPPlus MiniExcel OpenXmlWriter ArrayPool dotnet-counters gcdump",
  f07:"업로드 다운로드 MultipartReader DisableFormValueModelBinding IFormFile 버퍼링 MaxRequestBodySize maxAllowedContentLength FormOptions MinRequestBodyDataRate 청크업로드 이어받기 Range 206 enableRangeProcessing presigned S3 Blob MinIO 바이러스검사 ClamAV",
  f08:"SFTP SSHNET FTPS FluentFTP FtpWebRequest UNC 공유폴더 FileSystemWatcher 폴링 원자적이동 rename tmp 확장자 완료파일 헤더 트레일러 건수검증 합계검증 중복방지 해시 재전송 인터페이스규약 EAI",
  f09:"HttpClient IHttpClientFactory 소켓고갈 TIMEWAIT DNS PooledConnectionLifetime MaxConnectionsPerServer SocketsHttpHandler Polly Refit 회복력 AddStandardResilienceHandler 서킷브레이커 재시도 지터 타임아웃 ResponseHeadersRead 스트리밍응답 레이트리밋 TokenBucket mTLS 인증서 프록시",
  f10:"gRPC 스트리밍 proto MassTransit RabbitMQ Kafka KafkaListener IConsumer 아웃박스 outbox 릴레이 READPAST SKIPLOCKED 멱등소비 MessageId ProcessedMessage DLQ 데드레터 재시도 Exponential AddEntityFrameworkOutbox",
  f11:"Channels Channel CreateBounded BoundedChannelFullMode Wait 백프레셔 backpressure 생산자소비자 파이프라인 Writer Complete ParallelForEachAsync MaxDegreeOfParallelism IAsyncEnumerable CPU바운드 IO바운드 스레드풀 커넥션풀 병렬도 튜닝 산키",
  f12:"야간배치 배치창 window SLA 마감 임계경로 알림 슬랙 웹훅 메일 감시잡 deadmanswitch 재처리 재실행 rerun 감사로그 권한 실행이력 처리율 성능로그 운영이관 체크리스트 간트",
  f13:"정산배치 실전 프로젝트구조 SettleJob SFTP수신 트레일러검증 청크처리 벌크적재 MERGE집계 결과파일 고정폭출력 CP949 원자적송신 실측수치 소요시간 메모리 임계경로 SpringBatch비교 운영사고 깔때기 파이프라인",
  h01:"톰캣 tomcat kestrel 케스트럴 대응표 war publish 폴더 서블릿컨테이너 임베디드 배포형태 결정 런타임설치 aspnetcore-runtime hosting bundle 자바비교 spring boot 지도",
  h02:"kestrel 엔드포인트 endpoints listenanyip 유닉스소켓 unixsocket http2 http3 quic msquic limits maxrequestbodysize keepalive 타임아웃 formoptions 요청상한 aspnetcore_urls launchsettings 스레드풀 async 블로킹",
  h03:"iis 아이아이에스 hosting bundle ancm aspnetcoremodulev2 inprocess outofprocess 앱풀 apppool 관리코드없음 nomanagedcode web.config 바인딩 binding icacls 권한 inetmgr appcmd 500.19 500.21 사이트추가 preload",
  h04:"windows service 윈도우서비스 addwindowsservice usewindowsservice sc.exe create failure 복구옵션 자동시작 delayed-auto 이벤트로그 eventlog contentrootpath system32 방화벽 firewall newnetfirewallrule 배포스크립트 robocopy procrun",
  h05:"linux 리눅스 ubuntu 우분투 systemd 유닛 unit service execstart restart always environment environmentfile limitnofile journalctl 로그 selinux 권한 useradd 전용계정 데이터보호 dataprotection 배포스크립트 rsync icu 포트1024",
  h06:"nginx 엔진엑스 리버스프록시 proxy_pass upstream keepalive websocket upgrade 타임아웃 buffering client_max_body_size 정적파일 gzip forwardedheaders x-forwarded-for x-forwarded-proto knownproxies 리다이렉트루프 iis arr url rewrite",
  h07:"yarp 게이트웨이 gateway reverseproxy routes clusters transforms 로드밸런싱 poweroftwochoices roundrobin leastrequests 헬스체크 세션어피니티 spring cloud gateway 경로재작성 strangler 레거시교체 mapreverseproxy",
  h08:"https 인증서 certificate tls ssl dev-certs pfx pem 변환 openssl san subjectaltname 신뢰체인 중간인증서 letsencrypt certbot win-acme 자동갱신 사내ca 자체서명 루트ca keytool jks 트러스트스토어 hsts mtls sni keyset",
  h09:"publish 게시 framework-dependent fdd self-contained scd 자체포함 singlefile 단일파일 readytorun r2r nativeaot aot 트리밍 trimming il2026 runtimeidentifier rid runtimeconfig rollforward 버전불일치 소스생성기 jsonserializable",
  h10:"무중단 배포 zerodowntime app_offline 앱오프라인 오버랩재활용 recycle 소켓활성화 socket activation 롤링 rolling 블루그린 bluegreen 드레인 drain 헬스체크 readiness liveness 마이그레이션 expand contract 하위호환 롤백 idempotent",
  h11:"docker 도커 컨테이너 container dockerfile 멀티스테이지 multistage chiseled alpine noble 비루트 nonroot app_uid publishcontainer compose 이미지레이어 캐시 cgroup 메모리제한 gcheaphardlimit 서버gc icu globalization 쿠버네티스",
  h12:"성능튜닝 튜닝 gc 서버gc 워크스테이션gc gcserver gcconcurrent gcconservememory threadpool setminthreads tieredpgo readytorun 커넥션풀 maxpoolsize hikari httpclient socketshttphandler 응답압축 responsecompression outputcache 출력캐싱 부하테스트 bombardier k6 p95 dotnet-counters dotnet-trace dotnet-dump dotnet-gcdump perfview clrstack dumpheap gcroot",
  h13:"장애 문제해결 트러블슈팅 502.5 500.30 500.19 500.21 504 413 timeout 포트점유 eaddrinuse netstat ss 권한거부 access denied keyset 인증서신뢰 리다이렉트루프 too many open files 스레드풀고갈 메모리누수 gen2 cpu100 커넥션풀타임아웃 한글깨짐 인코딩 utf8 로케일 dataprotection 로그아웃 rollforward 진단명령",
  h14:"실전 구축 처음부터끝까지 windows server 2025 iis powershell install-windowsfeature ubuntu 24.04 nginx systemd 배포절차 방화벽 ufw 인증서신청 도메인 dns 검증 재부팅테스트 인수인계 체크리스트 운영문서 모니터링 백업",
};

let FIDX = null;

/* 인덱스는 검색을 처음 열 때 한 번만 만든다 (초기 로딩 비용 0) */
function findIndex(){
  if (FIDX) return FIDX;
  FIDX = [];
  $$(".navset").forEach(ns => {
    const tab = ns.dataset.nav;
    const kw  = ((TAB_KW[tab] || "") + " " + (TAB_LABEL[tab] || "")).toLowerCase();
    $$('a[href^="#"]', ns).forEach(a => {
      const id  = a.getAttribute("href").slice(1);
      const num = a.querySelector("em")?.textContent.trim() || "";
      const title = a.textContent.replace(num, "").trim();
      const sec = document.getElementById(id);
      // 섹션의 '제목급' 텍스트만 색인한다 (본문 전체를 들고 있지 않기 위해)
      const sub = sec
        ? $$("h3.sub, h4.mini, .sec-head .lead", sec).map(h => h.textContent).join(" ").slice(0, 600)
        : "";
      const skw = (SEC_KW[id] || "").toLowerCase();
      FIDX.push({ tab, id, num, title,
                  t:   title.toLowerCase(),
                  sub: sub.toLowerCase(),
                  kw, skw,
                  hay: (title + " " + sub + " " + kw + " " + skw).toLowerCase() });
    });
  });
  return FIDX;
}
const fEsc = t => t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
/* '엑셀'이 pandas 키워드에는 낱말로, auto 키워드에는 '엑셀자동화' 안에만 있을 때
   낱말 쪽을 우선하기 위한 검사 */
const fWord = (hay, t) => (" " + hay + " ").includes(" " + t + " ");
/* 검색어에 형광펜. 자리는 '원문'에서 찾고 이스케이프는 마지막에 한다.
   이스케이프한 뒤에 찾으면 사람 눈에 안 보이는 글자에 걸린다 —
   '&' 는 '&amp;' 가 되어 amp 로 검색하면 엔티티 한가운데가 잘리고,
   mark 로 검색하면 앞서 넣은 <mark> 태그 자체를 쪼개 화면이 깨졌다. */
function fMark(text, toks){
  const low = text.toLowerCase();
  const hits = [];
  toks.forEach(t => {
    if (!t) return;
    const i = low.indexOf(t);
    if (i >= 0) hits.push([i, i + t.length]);
  });
  if (!hits.length) return fEsc(text);

  hits.sort((a, b) => a[0] - b[0]);          // 겹치는 구간은 하나로 합친다
  const span = [];
  for (const h of hits){
    const last = span[span.length - 1];
    if (last && h[0] <= last[1]) last[1] = Math.max(last[1], h[1]);
    else span.push(h);
  }

  let out = "", at = 0;
  for (const [s, e] of span){
    out += fEsc(text.slice(at, s)) + "<mark>" + fEsc(text.slice(s, e)) + "</mark>";
    at = e;
  }
  return out + fEsc(text.slice(at));
}
function findRun(){
  const q   = $("#findInput").value.trim().toLowerCase();
  const box = $("#findRes"), chips = $("#findChips");
  if (!q){ chips.style.display = ""; box.innerHTML = ""; return; }
  chips.style.display = "none";
  const toks = q.split(/\s+/).filter(Boolean);
  const hit = [];
  for (const it of findIndex()){
    let sc = 0, ok = true;
    for (const t of toks){
      if (!it.hay.includes(t)) { ok = false; break; }
      if (it.t.includes(t))         sc += 10;  // 섹션 제목에 있으면 최우선
      else if (fWord(it.skw, t))    sc += 9;   // 섹션 전용 키워드
      else if (fWord(it.kw, t))     sc += 6;   // 탭 키워드에 '낱말 단위'로 있으면
      else if (it.sub.includes(t))  sc += 4;   // 소제목에 있으면
      else                          sc += 1;   // 그 외(부분 일치)
    }
    if (ok) hit.push({ it, sc });
  }
  hit.sort((a, b) => b.sc - a.sc || a.it.tab.localeCompare(b.it.tab));
  if (!hit.length){
    box.innerHTML = `<div class="fnone">찾는 내용이 없습니다.<br>
      <b>다른 낱말로</b> 검색해 보세요 — 예: 프로그램, 엑셀, 자동화, 이미지, 정렬</div>`;
    return;
  }
  box.innerHTML = hit.slice(0, 40).map((h, i) =>
    `<div class="fitem${i ? "" : " sel"}" data-tab="${h.it.tab}" data-id="${h.it.id}">
       <span class="tg">${fEsc(TAB_LABEL[h.it.tab] || h.it.tab)}</span>
       <span class="tt">${fMark(h.it.title, toks)}
         <small>${h.it.num ? h.it.num + " · " : ""}${fEsc(TAB_LABEL[h.it.tab] || "")} 탭</small></span>
       <span class="go">↵</span>
     </div>`).join("");
}
function findGo(el){
  if (!el) return;
  const tab = el.dataset.tab, id = el.dataset.id;
  findClose();
  if (tab !== currentTab) switchTab(tab);
  setTimeout(() => goSec(id), 30);
}
function findMove(d){
  const items = $$("#findRes .fitem");
  if (!items.length) return;
  let i = items.findIndex(e => e.classList.contains("sel"));
  i = Math.max(0, Math.min(items.length - 1, (i < 0 ? 0 : i) + d));
  items.forEach(e => e.classList.remove("sel"));
  items[i].classList.add("sel");
  items[i].scrollIntoView({ block:"nearest" });
}
function findOpen(preset){
  const ov = $("#find");
  ov.classList.add("on");
  document.body.style.overflow = "hidden";
  const inp = $("#findInput");
  inp.value = preset || "";
  findRun();
  setTimeout(() => inp.focus(), 30);
}
function findClose(){
  $("#find").classList.remove("on");
  document.body.style.overflow = "";
}
(function findInit(){
  const ov = document.createElement("div");
  ov.id = "find";
  ov.innerHTML = `<div class="fsheet">
      <div class="fbar"><span class="ic">🔍</span>
        <input id="findInput" type="search" autocomplete="off" spellcheck="false"
               placeholder="찾고 싶은 것을 한글로 — 예: 데스크탑 프로그램, 엑셀, 자동화">
        <span class="x" onclick="findClose()" title="닫기">✕</span></div>
      <div id="findChips"><b>이런 걸 찾고 계신가요?</b><div class="row">${
        FIND_CHIPS.map(c => `<button type="button" data-q="${c}">${c}</button>`).join("")
      }</div></div>
      <div id="findRes"></div>
    </div>`;
  ov.addEventListener("click", e => {
    if (e.target === ov) { findClose(); return; }
    const chip = e.target.closest("#findChips button");
    if (chip){ $("#findInput").value = chip.dataset.q; findRun(); $("#findInput").focus(); return; }
    const item = e.target.closest(".fitem");
    if (item) findGo(item);
  });
  document.body.appendChild(ov);
  ov.querySelector("#findInput").addEventListener("input", findRun);
  ov.querySelector("#findInput").addEventListener("keydown", e => {
    if (e.key === "ArrowDown"){ e.preventDefault(); findMove(1); }
    else if (e.key === "ArrowUp"){ e.preventDefault(); findMove(-1); }
    else if (e.key === "Enter"){ e.preventDefault(); findGo($("#findRes .fitem.sel")); }
  });
})();
document.addEventListener("keydown", e => {
  const tag = e.target.tagName;
  const typing = tag === "INPUT" || tag === "TEXTAREA";
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"){
    e.preventDefault(); findOpen(); return;
  }
  if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey){
    e.preventDefault(); findOpen(); return;
  }
  if (e.key === "Escape" && $("#find")?.classList.contains("on")) findClose();
});

/* --- 목차 모달 (≤1080px 헤더 목차 버튼 전용 · PC는 사이드바가 목차) --- */
(function tocInit(){
  const ov = document.createElement("div");
  ov.id = "toc";
  ov.innerHTML = `<div class="sheet"><div class="grab"></div>
    <div class="thead"><b id="tocTitle">목차</b>
      <span class="x" onclick="tocClose()" title="닫기">✕</span></div>
    <div id="tocBody"></div></div>`;
  ov.addEventListener("click", e => { if (e.target === ov) tocClose(); });
  document.body.appendChild(ov);
})();
function tocOpen(){
  const nav = $(`.navset[data-nav="${currentTab}"]`);
  if (!nav) return;
  let html = "";
  [...nav.children].forEach(el => {
    if (el.classList.contains("grp")) html += `<h4>${el.textContent}</h4>`;
    else if (el.tagName === "A")
      html += `<a href="${el.getAttribute("href")}">${el.innerHTML}</a>`;
  });
  $("#tocBody").innerHTML = html;
  const t = $("#tocTitle");
  if (t) t.textContent = (TAB_LABEL[currentTab] || "") + " · 목차";
  $("#toc").classList.add("on");
  document.body.style.overflow = "hidden";
}
function tocClose(){
  $("#toc").classList.remove("on");
  document.body.style.overflow = "";
}
document.addEventListener("click", e => {
  if (e.target.closest("#toc a")) tocClose();     // 이동 후 시트 닫기
});
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if ($("#toc")?.classList.contains("on")) tocClose();
  if ($("#opt")?.classList.contains("on")) optClose();
  if ($("#tabbar")?.classList.contains("open")) tabDrop(false);
});

/* --- 화면 밖 마이크로 시각화는 애니메이션을 멈춘다 (CPU·배터리) --- */
let zzIO = null;
function pauseOffscreenViz(root){
  if (!("IntersectionObserver" in window)) return;
  if (!zzIO){
    zzIO = new IntersectionObserver(es => {
      es.forEach(e => e.target.classList.toggle("zz", !e.isIntersecting));
    }, { rootMargin:"250px 0px" });
  }
  $$(".mv", root || document).forEach(mv => {
    if (mv.dataset.zz) return;
    mv.dataset.zz = "1";
    mv.classList.add("zz");        // 관찰 결과가 오기 전까지는 멈춘 상태로 시작
    zzIO.observe(mv);
  });
}

/* --- 브라우저 탭이 가려지면 데모 재생을 멈춘다 (배터리·CPU 절약) --- */
document.addEventListener("visibilitychange", () => {
  if (document.hidden && typeof AV !== "undefined") AV.stopAll();
});

/* --- 탭바 실제 높이를 CSS 변수로 (줄바꿈 시 sticky/anchor 오프셋 자동 보정) --- */
(function tabH(){
  const tb = $(".tabbar");
  if (!tb) return;
  const set = () => document.documentElement.style
    .setProperty("--tabh", tb.offsetHeight + "px");
  set();
  if (window.ResizeObserver) new ResizeObserver(set).observe(tb);
  window.addEventListener("resize", set);
})();

/* --- 가로 스크롤 가능한 표에 힌트 배지 (첫 스크롤 시 제거) --- */
/* 가로로 넘치는 표에 '밀어서 보세요' 표시를 붙인다.
   예전에는 요소마다 rAF 를 따로 걸어 두고 그 안에서 재고 고치기를 반복했다.
   표가 80개면 콜백도 80개, 강제 레이아웃도 80번이었다.
   한 프레임에 모아서 재고, 그다음에 모아서 고친다. */
function markScrollables(root){
  const list = $$(".tw, .scw, .diag", root || document).filter(tw => {
    if (tw.dataset.sc) return false;
    tw.dataset.sc = "1";
    return true;
  });
  if (!list.length) return;
  requestAnimationFrame(() => {
    const over = list.filter(tw => tw.scrollWidth > tw.clientWidth + 8);   // ① 읽기만
    for (const tw of over){                                               // ② 쓰기만
      tw.classList.add("scrollable");
      tw.addEventListener("scroll",
        () => tw.classList.remove("scrollable"), { once:true, passive:true });
    }
  });
}

/* --- 섹션 앵커 이동 (content-visibility 보정) ---------------------------
   section.sec 는 화면 밖일 때 렌더를 건너뛰므로(contain-intrinsic-size 900px),
   브라우저 기본 앵커 점프는 실제 위치보다 수천 px 어긋난다.
   → 한 번 뛴 뒤 실제 좌표를 다시 재서 안정될 때까지 보정한다. */
function secTop(){
  const v = getComputedStyle(document.documentElement).scrollPaddingTop;
  const n = parseFloat(v);
  return isNaN(n) ? 84 : n;
}
/* 화면에 걸린 .rv 를 즉시 드러낸다.
   화면 밖의 것들은 IntersectionObserver 가 스크롤하며 알아서 처리하므로
   여기서는 '지금 눈에 보이는 것'만 서둘러 드러내면 된다.

   ★ 두 가지를 지킨다 —
   ① 재는 것과 고치는 것을 섞지 않는다.
      번갈아 하면 고칠 때마다 레이아웃이 무효화되어 다음 측정이 또 레이아웃을
      강제한다(layout thrashing).
   ② 문서 아래쪽이 연달아 나오면 그만 잰다.
      탭을 막 열었을 때는 맨 위에 있으므로 화면에 드는 것은 몇 개뿐인데,
      예전에는 그 몇 개를 찾겠다고 탭 안의 수십~수백 개를 전부 쟀다.
      실측으로 이 함수 한 번이 35ms 였고, 얻는 것은 한 개였다.
      (앞의 일부만 재는 것으로 0.3ms 가 됐다 — 놓친 것은 관찰기가 곧 처리한다) */
function revealIn(){
  const list = $$(".pane.on .rv:not(.in)");
  if (!list.length) return;
  const h = innerHeight;

  const box = [];
  let below = 0;
  for (let i = 0; i < list.length; i++){                    // ① 읽기만
    const r = list[i].getBoundingClientRect();
    box.push(r);
    if (r.top <= h + 80) below = 0;
    else if (++below > 12) break;                           // 화면 아래가 계속 → 그만
  }
  for (let i = 0; i < box.length; i++){                     // ② 쓰기만
    const r = box[i];
    if (r.top < h + 80 && r.bottom > -80) list[i].classList.add("in");
  }
}
let goSecRun = 0;                    // 연속 클릭 시 이전 보정 루프를 무효화
function goSec(id){
  const el = document.getElementById(id);
  if (!el) return;
  /* ★ 숨어 있는 탭 안의 섹션이면 그 탭부터 연다.
     .pane 은 display:none 이라 열기 전에는 좌표가 0 으로 나온다.
     그래서 탭을 안 열고 스크롤하면 맨 위로 튀고 끝났다 —
     공유받은 링크(#s09)로 들어오거나 뒤로 가기를 누를 때가 그랬다. */
  const pane = el.closest(".pane");
  if (pane && !pane.classList.contains("on") && typeof switchTab === "function")
    switchTab(pane.id.replace(/^pane-/, ""));
  const my = ++goSecRun;
  const html = document.documentElement;
  const pad = secTop();
  /* ★ html{scroll-behavior:smooth} 를 잠시 끈다.
     ScrollToOptions 의 behavior:"auto" 는 "CSS 값을 따른다"는 뜻이라
     smooth 가 걸린 상태에선 매 프레임 애니메이션이 재시작돼 제자리에 머문다. */
  html.style.scrollBehavior = "auto";
  let n = 0, last = -1;
  const done = () => {
    html.style.scrollBehavior = "";     // 스타일시트의 smooth 로 복귀
    revealIn();
  };
  const fix = () => {
    if (my !== goSecRun) return;                 // 더 최신 요청이 들어옴 → 중단
    const y = Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - pad));
    if (n++ > 14 || (Math.abs(y - Math.round(window.scrollY)) < 2 && y === last)){ done(); return; }
    last = y;
    window.scrollTo(0, y);
    requestAnimationFrame(fix);
  };
  fix();
  setTimeout(() => { if (my === goSecRun) done(); }, 900);   // rAF 가 멈춘 경우의 안전핀
}
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute("href").slice(1);
  if (!id || !document.getElementById(id)) return;
  e.preventDefault();
  try { history.replaceState(null, "", "#" + id); } catch(err){}
  setTimeout(() => goSec(id), 0);          // 목차 시트가 먼저 닫히도록 한 틱 양보
});
/* 주소창의 #조각. 한글 앵커가 %ED.. 로 들어오므로 되돌려 읽는다
   (망가진 시퀀스면 원문 그대로 쓴다 — 던지게 두면 이동 자체가 죽는다) */
function hashId(){
  const raw = location.hash.slice(1);
  try { return decodeURIComponent(raw); } catch(e){ return raw; }
}
window.addEventListener("hashchange", () => {
  const id = hashId();
  if (id && document.getElementById(id)) goSec(id);
});
/* 첫 진입 때의 #조각 — 공유받은 링크를 그 섹션까지 열어 준다.
   탭 복원(99-init)보다 뒤여야 해시가 이기므로 마지막 스크립트까지 기다린다. */
(function openHash(){
  const go = () => { const id = hashId(); if (id && document.getElementById(id)) goSec(id); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go, {once:true});
  else go();
})();

/* --- 맨 위로 버튼 (모바일) --- */
(function topBtn(){
  const b = document.createElement("div");
  b.className = "topbtn"; b.textContent = "↑"; b.title = "맨 위로";
  b.onclick = () => window.scrollTo({ top:0, behavior:"smooth" });
  document.body.appendChild(b);
  let ticking2 = false;
  window.addEventListener("scroll", () => {
    if (ticking2) return;
    ticking2 = true;
    requestAnimationFrame(() => {
      b.classList.toggle("show", window.scrollY > innerHeight * 1.5);
      ticking2 = false;
    });
  }, { passive:true });
})();

/* --- 코드 블록 텍스트 교체 후 재하이라이트 --- */
function setCode(sel, text){
  const el = $(sel + " code");
  el.dataset.hl = "";
  el.textContent = text;
  highlight(el.parentElement);
}

/* ============================================================
   2. 스크롤 · 리빌 · 진행바
   ============================================================ */
(function scrollFx(){
  const bar = $("#progress > i");
  const secs = $$("section.sec, header.hero");
  const links = $$("nav.side a");

  /* rAF 스로틀 + scaleX: 스크롤 이벤트마다 레이아웃을 건드리지 않음 */
  let ticking = false;
  const paint = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? h.scrollTop / max : 0;
    bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
    ticking = false;
  };
  const onScroll = () => { if (!ticking){ ticking = true; requestAnimationFrame(paint); } };
  window.addEventListener("scroll", onScroll, {passive:true});
  paint();

  // 리빌
  const rv = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rv.unobserve(e.target); } });
  }, {threshold:.12, rootMargin:"0px 0px -40px 0px"});
  $$(".rv").forEach(e => rv.observe(e));

  // 스크롤 스파이
  const spy = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + id));
      /* 주소도 지금 섹션으로 맞춘다 — 주소창을 복사해 보내면
         받는 쪽이 그 탭 그 자리에서 시작한다.
         이미 돌고 있는 관찰기에 얹은 것이라 스크롤 비용은 늘지 않는다.
         replaceState 라 뒤로 가기 기록도 쌓이지 않는다. */
      if ("#" + id !== location.hash){
        try { history.replaceState(null, "", "#" + id); } catch(err){}
      }
    });
  }, {rootMargin:"-25% 0px -65% 0px"});
  secs.forEach(s => { if (s.id) spy.observe(s); });
})();

