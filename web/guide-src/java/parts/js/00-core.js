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
  core:"자바 java 기초 문법 변수 타입 클래스 객체 상속 인터페이스 컬렉션 list map set 제네릭 스트림 stream 람다 예외 exception 문자열 record enum 패턴매칭 switch optional 날짜 시간 io 파일 자바25 java25",
  adv:"고급 동시성 스레드 thread 가상스레드 virtual 락 동기화 synchronized 병렬 concurrent executor 메모리 jvm gc 힙 성능 튜닝 리플렉션 애너테이션 프로파일링 최적화 loom 컨테이너 도커 docker oom 힙덤프 zgc g1 기동시간",
  boot:"스프링 spring boot 웹 web mvc rest api 컨트롤러 controller 서비스 빈 bean di 의존성주입 설정 config yaml 프로파일 검증 validation 예외처리 테스트 actuator 스케줄러 캐시 톰캣 쿠버네티스 kubernetes k8s 무중단 배포 롤링 헬스체크 프로브 probe 오토스케일 hpa graceful",
  flux:"webflux 웹플럭스 리액티브 reactive mono flux 비동기 논블로킹 백프레셔 backpressure webclient r2dbc 스트리밍 sse netty 네티 이벤트루프 eventloop project reactor reactornetty 리액터네티 bytebuf 바이트버프 channel 채널 파이프라인 pipeline handler 핸들러 커넥션풀 connectionprovider keepalive 다이렉트메모리 epoll blockhound wiretap 소켓 socket nio tcp 프록시 게임서버 사설프로토콜",
  data:"데이터 db 데이터베이스 jpa hibernate 엔티티 entity querydsl 쿼리dsl mybatis 마이바티스 sql 트랜잭션 transaction 영속성 n+1 페치조인 fetch 연관관계 spring data 리포지토리 repository r2dbc 커넥션풀 hikari 플라이웨이 인덱스 배치 batch 스프링배치 대용량 청크 chunk 정산 마이그레이션 파티셔닝",
  sec:"시큐리티 security 보안 인증 authentication 인가 authorization 로그인 로그아웃 jwt 토큰 oauth2 소셜로그인 필터체인 filter 세션 비밀번호 암호화 csrf cors 권한 role 메서드보안",
  gw:"게이트웨이 gateway 라우팅 route 필터 filter 서킷브레이커 circuit breaker resilience 로드밸런싱 마이크로서비스 msa 프록시 리버스 rate limit 재시도 유레카 eureka 디스커버리 discovery 서비스등록 config server 분산추적 tracing zipkin 요청id grpc 지알피씨 protobuf 프로토버프 proto 스키마 http2 스트리밍 stub 스텁 인터셉터 interceptor 데드라인 deadline grpcurl buf 내부통신 서비스간통신 바이너리",
  tool:"도구 롬복 lombok 로그 log log4j2 logback slf4j 엑셀 excel poi 아파치 xml 파싱 parsing jackson json 매퍼 mapstruct 테스트 junit mockito 빌드 gradle maven 유틸 testcontainers 테스트컨테이너 통합테스트 h2 도커테스트",
  fx:"javafx 자바fx gui 데스크탑 데스크톱 프로그램 화면 창 window 버튼 위젯 fxml 씬빌더 scene 컨트롤 테이블 차트 이벤트 배포 exe jpackage",
  deep:"전문가 초고급 고급 심화 내부동작 바이트코드 bytecode javap jit c1 c2 인라이닝 이스케이프분석 deopt jmh 벤치마크 클래스로더 classloader 위임 noclassdeffound nosuchmethod 서비스로더 jmm 메모리모델 happens-before volatile 가시성 재배치 안전발행 cas compareandset atomic longadder varhandle 락프리 aba false sharing 캐시라인 contended 데이터지역성 jol gc g1 zgc 리전 humongous 저지연 힙덤프 heapdump mat jfr flightrecorder jcmd 스레드덤프 오프힙 directbytebuffer 네이티브메모리 nmt 메타스페이스 foreign arena nio selector netty 이벤트루프 bytebuf methodhandle lambdametafactory 애너테이션프로세서 apt graalvm 네이티브이미지 직렬화 역직렬화 rce 가젯 ysoserial log4shell xxe 공급망 supplychain sbom trivy dependencycheck 함수형 record sealed 패턴매칭 optional stream collector 디자인패턴 싱글턴 어댑터 archunit 아키텍처 헥사고날 ddd 계층 의존성역전 모듈 jpms module-info 모듈시스템 requires exports opens add-opens add-exports 캡슐화 jlink jdeps 자동모듈 클래스패스 모듈패스 graalvm 네이티브이미지 native aot nativecompile reachability reflect-config 콜드스타트 기동시간 appcds crac leyden 서버리스",
  scale:"대규모 트래픽 대용량 성능 부하 확장 스케일 scale 캐시 cache redis 레디스 분산락 락 lock redisson 동시성 재고 선착순 멱등 idempotent 중복결제 카프카 kafka 메시지큐 큐 이벤트 비동기 아웃박스 outbox 사가 saga 서킷브레이커 resilience4j 타임아웃 폴백 벌크헤드 rate limit 처리율제한 429 대기열 샤딩 레플리카 복제 커넥션풀 모니터링 관측 프로메테우스 prometheus grafana 그라파나 micrometer 부하테스트 k6 jmeter ngrinder p99 rps tps slo 병목 스탬피드 핫키",
};
const FIND_CHIPS = ["REST API 만들기","JPA 연관관계","가상 스레드","엑셀 다운로드",
                    "JWT 로그인","N+1 문제","선착순 재고","분산 락",
                    "캐시 스탬피드","중복 결제 막기","Kafka 유실","부하 테스트",
                    "쿠버네티스 무중단","Spring Batch","트랜잭션","데스크탑 프로그램"];
const SEC_KW = {
  /* 하려는 일을 한글로 쳤을 때 걸리게 하는 보강 키워드 */
  g11:"타임아웃 예산 재시도 백오프 서킷브레이커 resilience4j 격벽 bulkhead 느린호출 폴백 장애전파",
  g12:"bff 응답합성 monozip 카나리 가중치라우팅 weight 점진배포 무중단 베타헤더",
  x11:"javafx 성능 tableview 가상화 셀팩토리 updateitem 대용량 페이지로딩 차트 다운샘플링 pulselogger",
  x12:"jpackage jlink msi 설치본 자동업데이트 강제업데이트 크래시로그 uncaughtexception 서명 배포",
  s11:"리프레시토큰 로테이션 재사용탐지 다중기기 세션관리 원격로그아웃 httponly쿠키 토큰탈취 로그인유지",
  s12:"2단계인증 mfa totp otp 인증앱 크리덴셜스터핑 계정잠금 패스키 webauthn 로그인알림",
  s13:"권한 rbac abac 소유권 인가 preauthorize 멀티테넌시 테넌트격리 rls 데이터분리",
  k01:"용량산정 rps tps p99 지연 리틀의법칙 동시접속",
  k02:"느림 병목 커넥션풀 hikari 톰캣 스레드 고갈 응답지연",
  k03:"캐시전략 look aside write through evict cacheable ttl",
  k04:"레디스 자료구조 sorted set 랭킹 리더보드 hyperloglog 파이프라인 빅키",
  k05:"스탬피드 thundering herd 관통 penetration 눈사태 핫키 caffeine 로컬캐시",
  k06:"재고 마이너스 선착순 쿠폰 동시주문 비관적락 낙관적락 redisson 분산락",
  k07:"중복결제 두번눌림 idempotency key 재시도 안전 유니크제약",
  k08:"카프카 토픽 파티션 컨슈머그룹 오프셋 메시지큐 비동기처리",
  k09:"유실 중복 순서보장 dlq 데드레터 리밸런싱 컨슈머랙 lag exactly once",
  k10:"이중쓰기 dual write 아웃박스 cdc debezium 사가 보상트랜잭션 분산트랜잭션",
  k11:"장애전파 타임아웃 서킷브레이커 폴백 벌크헤드 재시도 백오프 resilience4j",
  k12:"처리율제한 토큰버킷 429 대기열 웨이팅룸 티켓팅 과부하",
  k13:"읽기복제본 replica 샤딩 파티셔닝 페이징 offset 커서 대량업데이트",
  k14:"모니터링 관측 메트릭 로그 추적 traceid prometheus grafana 알람 슬로우쿼리",
  k15:"부하테스트 성능테스트 k6 jmeter ngrinder gatling 스트레스 스파이크 slo",
  k16:"체크리스트 아키텍처 면접 대규모설계 전체그림",
  f13:"netty 네티 이벤트루프 eventloopgroup boss worker reactor패턴 channel 채널 파이프라인 bytebuf 다이렉트버퍼 참조카운팅 refcnt 누수 resourceleakdetector ioworkercount 스레드수",
  f14:"serverbootstrap 에코서버 channelhandler 인코더 디코더 lengthfieldbasedframedecoder 하프패킷 스티키패킷 tcp경계 프레임 channeloption backlog tcpnodelay keepalive 사설프로토콜 게임서버 프록시 바이너리",
  f15:"이벤트루프블로킹 블로킹 blockhound 처리량붕괴 publishon subscribeon boundedelastic eventexecutorgroup 스레드덤프 jcmd 장애 지연 p99",
  f16:"reactornetty httpclient 커넥션풀 connectionprovider maxconnections pendingacquiretimeout maxidletime keepalive prematurecloseexception 502 responsetimeout readtimeouthandler 메트릭 micrometer wiretap 풀고갈 커넥션누수",
  f17:"네이티브트랜스포트 epoll iouring 다이렉트메모리 maxdirectmemorysize oom oomkilled 파일디스크립터 ulimit nofile bytebuf누수 leakdetection webflux vs 가상스레드 선택기준 체크리스트",
  a13:"jvm튜닝 힙 컨테이너 도커 메모리 oom 힙덤프 gc옵션 zgc 기동시간",
  b17:"쿠버네티스 k8s 무중단배포 롤링업데이트 프로브 헬스체크 graceful preStop hpa 오토스케일 502",
  b18:"마이그레이션 업그레이드 부트3 부트4 eol 지원종료 starter-webmvc 스타터개명 mockbean mockitobean jackson3 undertow spock properties-migrator openrewrite",
  d17:"스프링배치 대용량처리 청크 재시작 정산 마이그레이션 스케줄 잡 job step",
  g09:"서비스디스커버리 유레카 eureka config server 중앙설정 분산추적 요청id traceid",
  g10:"grpc protobuf proto 스키마 http2 바이너리 스트리밍 단항 양방향 stub 스텁 데드라인 deadline 인터셉터 grpcurl buf 필드번호 reserved 내부통신 서비스간통신 msa통신",
  t12:"테스트컨테이너 testcontainers 통합테스트 도커테스트 h2차이 실제db",
  z01:"바이트코드 javap jit c1 c2 인라이닝 이스케이프분석 최적화해제 deopt jmh 워밍업",
  z02:"클래스로더 위임 noclassdeffounderror nosuchmethoderror 의존성충돌 서비스로더 fatjar",
  z03:"jmm 메모리모델 happens-before volatile 가시성 재배치 이중검사잠금 안전발행 final",
  z04:"cas compareandset atomicinteger longadder varhandle 락프리 aba 원자성",
  z05:"falsesharing 캐시라인 contended 패딩 데이터지역성 jol 배열순회 valhalla",
  z06:"g1 zgc 리전 humongous mixedgc 저지연 shenandoah gc로그 gceasy 튜닝",
  z07:"힙덤프 heapdump mat leaksuspects dominator gcroot jfr jcmd 스레드덤프 blocked 데드락",
  z08:"오프힙 directbytebuffer 네이티브메모리 nmt 메타스페이스 maxdirectmemorysize foreign arena oomkilled",
  z09:"nio selector 논블로킹 netty eventloop bytebuf 참조카운팅 blockhound webflux내부",
  z10:"methodhandle varhandle lambdametafactory invokedynamic 애너테이션프로세서 apt lombok mapstruct graalvm aot",
  z11:"직렬화 역직렬화 rce 가젯체인 ysoserial log4shell jndi objectinputfilter xxe jackson defaulttyping",
  z12:"공급망 supplychain cve owasp dependencycheck sbom trivy renovate dependabot bom 취약점",
  z13:"함수형 record sealed 패턴매칭 값객체 optional stream collector teeing parallelstream",
  z14:"디자인패턴 전략 어댑터 빌더 싱글턴 enum 옵저버 템플릿메서드 스프링",
  z15:"성능최적화 순서 측정 jfr jmh 커넥션재사용 keepalive 로그레벨 페이로드",
  z16:"아키텍처 헥사고날 포트어댑터 ddd 계층 도메인 유스케이스 archunit 의존성역전 패키지구조",
  z17:"jpms 모듈 module-info requires exports opens 강한캡슐화 add-opens add-exports inaccessibleobjectexception 클래스패스 모듈패스 자동모듈 splitpackage jlink jdeps 최소런타임 unsafe",
  z18:"graalvm 네이티브이미지 nativeimage aot nativecompile closedworld 콜드스타트 기동시간 메모리절감 reachability reflect-config 리플렉션등록 native-image-agent runtimehints pgo appcds aotcache crac leyden 서버리스 lambda",
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
  const list = $$(".tw, .scw", root || document).filter(tw => {
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

