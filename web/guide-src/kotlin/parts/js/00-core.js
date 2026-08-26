/* ============================================================
   0. 공통 유틸 (아홉 가이드와 동일한 기반 · 하이라이터만 코틀린용)
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

/* --- 코틀린 문법 하이라이터 --- */
/* 정규식 '리터럴'로 한 번에 정의한다.
   (문자열을 이어붙여 new RegExp 로 만들면 백슬래시를 한 겹 더 써야 해서 실수가 잦다)
   그룹 순서: 1 주석 · 2 문자열 · 3 애너테이션 · 4 suspend · 5 키워드 · 6 타입 · 7 함수 · 8 숫자

   suspend 를 따로 뽑은 이유 — 코틀린에서 이 낱말 하나가 붙고 안 붙고에 따라
   '이 함수가 스레드를 붙잡는가'가 갈린다. 코드에서 가장 먼저 보여야 한다.
   자바 키워드도 함께 넣었다. 가이드 안에서 자바 코드를 나란히 보여 주는 곳이 많다. */
const KT_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("""[\s\S]*?"""|'[^'\n]*'|"[^"\n]*")|(@[A-Za-z]\w*)|\b(suspend)\b|\b(abstract|actual|annotation|as|assert|boolean|break|by|byte|case|catch|char|class|companion|const|constructor|continue|crossinline|data|default|do|double|dynamic|else|enum|expect|extends|external|false|final|finally|float|for|fun|goto|if|implements|import|in|infix|init|inline|inner|instanceof|int|interface|internal|is|it|lateinit|long|native|new|noinline|null|object|open|operator|out|override|package|permits|private|protected|public|record|reified|return|sealed|short|static|strictfp|super|switch|synchronized|tailrec|this|throw|throws|transient|true|try|typealias|val|var|vararg|void|volatile|when|where|while|yield)\b|\b([A-Z][A-Za-z0-9]*)\b|\.([a-z_]\w*)(?=\()|\b(\d[\d_]*\.?\d*[LlFfDdUu]?)\b/g;

/* root를 받아 '보이는 탭'만 처리 — 초기 로딩 비용을 1/12로 */
function highlight(root){
  $$("pre.code code", root || document).forEach(el => {
    if (el.dataset.hl) return;
    el.dataset.hl = "1";
    let s = el.textContent
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    s = s.replace(KT_RE, (m, com, str, ann, sus, kw, typ, fn, num) => {
      if (com) return `<span class="t-com">${com}</span>`;
      if (str) return `<span class="t-str">${str}</span>`;
      if (ann) return `<span class="t-ann">${ann}</span>`;
      if (sus) return `<span class="t-sus">${sus}</span>`;
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
   "안드로이드 화면" → Compose,  "동시에 여러 API 호출" → 코루틴
   ============================================================ */
const TAB_KW = {
  core:"코틀린 kotlin 기초 문법 변수 val var 타입 널 null 널안정성 안전호출 엘비스 문자열 템플릿 함수 기본값 이름붙인인자 클래스 dataclass 데이터클래스 상속 인터페이스 object 싱글턴 컴패니언 컬렉션 list map set 람다 스코프함수 let apply run also with when 예외 제네릭 확장함수 자바상호운용 플랫폼타입",
  adv:"고급 심화 제네릭 generic 타입파라미터 변성 variance in out 공변 반공변 스타프로젝션 소거 erasure reified 리파이드 inline 인라인 noinline crossinline 비지역반환 위임 delegate by lazy observable vetoable 연산자오버로딩 operator plus invoke get set dsl 도메인특화언어 dslmarker 수신객체람다 시퀀스 sequence 지연평가 lazy yield generatesequence 컬렉션성능 정렬 comparator groupingby aggregate typealias valueclass 인라인클래스 contract 계약 스마트캐스트 리플렉션 reflection kclass kproperty 애너테이션 annotation ksp kapt 코드생성 함수형 합성 커링 메모이제이션 불변 either arrow 표준라이브러리 관용구 코딩컨벤션",
  co:"코루틴 coroutine suspend 서스펜드 비동기 동시성 async await launch runblocking coroutinescope 구조적동시성 job supervisorjob 스코프 viewmodelscope 디스패처 dispatcher io default main 취소 cancel cancellation ensureactive 타임아웃 withtimeout 재시도 retry 백오프 예외 exceptionhandler 병렬 awaitall semaphore 세마포어 mutex 뮤텍스 컨텍스트 mdc traceid threadlocal flow 플로우 collect emit stateflow sharedflow 상태 이벤트 채널 channel produce actor select 백프레셔 buffer conflate debounce flatmaplatest combine 콜백변환 suspendcancellablecoroutine 블로킹 jdbc 테스트 runtest turbine 가상시간 cps continuation 상태기계",
  boot:"스프링 spring boot 부트 웹 web mvc rest api 컨트롤러 controller 서비스 빈 bean di 의존성주입 생성자주입 allopen noarg plugin.spring plugin.jpa jsr305 설정 configurationproperties yaml 프로파일 dto jackson 직렬화 검증 validation field 예외처리 restcontrolleradvice problemdetail 계층설계 트랜잭션 transactional 프록시 내부호출 코루틴컨트롤러 suspend 가상스레드 security 시큐리티 jwt 코틀린dsl 테스트 mockk testcontainers springmockk kotest aop 필터 인터셉터 스케줄러 shedlock 비동기 async 캐시 cacheable caffeine 로깅 액추에이터 actuator 메트릭 micrometer 프로메테우스 배포 도커 buildimage graalvm 네이티브",
  flux:"webflux 웹플럭스 리액티브 reactive mono flux reactor 리액터 코루틴변환 awaitsingle asflow corouter 함수형라우팅 핸들러 webclient 논블로킹 r2dbc 리액티브트랜잭션 transactionaloperator 스트리밍 sse ndjson 서버센트이벤트 websocket 웹소켓 채팅 백프레셔 복원력 서킷브레이커 resilience4j 타임아웃 재시도 폴백 컨텍스트전파 traceid blockhound 디버깅 webtestclient stepverifier turbine netty 네티 이벤트루프 커넥션풀 다이렉트메모리 튜닝 prematureclose",
  data:"데이터 db 데이터베이스 jpa hibernate 엔티티 entity 코틀린엔티티 dataclass 함정 allopen noarg 연관관계 lazy eager 영속성컨텍스트 더티체킹 flush clear lazyinitializationexception openinview spring data 리포지터리 findbyidornull 쿼리메서드 jpql 프로젝션 dto 네이티브쿼리 벌크 n+1 fetchjoin entitygraph batchsize querydsl kapt qtype kotlinjdsl jdsl exposed 익스포즈드 jooq 트랜잭션 전파 requiresnew 격리 낙관적락 비관적락 version 재시도 배치 페이징 커서 성능 flyway 마이그레이션 ddlauto testcontainers datajpatest 스키마",
  and:"안드로이드 android 앱 app 컴포즈 compose jetpack 선언형ui composable 미리보기 preview 생명주기 lifecycle 액티비티 activity 화면회전 구성변경 프로세스종료 savedstatehandle remember mutablestateof 상태호이스팅 재구성 recomposition modifier lazycolumn 리스트 scaffold 네비게이션 navigation 라우트 딥링크 viewmodel viewmodelscope stateflow collectasstatewithlifecycle launchedeffect disposableeffect 부수효과 테마 머티리얼 material3 다크모드 다이내믹컬러 리소스 다국어 접근성 retrofit ktor okhttp 네트워크 room dao datastore 오프라인 권한 permission 인텐트 coil 이미지 애니메이션 logcat 프로파일러 leakcanary anr",
  andx:"안드로이드실전 아키텍처 멀티모듈 feature core 모듈 hilt 의존성주입 dagger koin 스코프 singleton paging 페이징 무한스크롤 pagingsource remotemediator workmanager 백그라운드 동기화 coroutineworker 알림 notification 채널 fcm 푸시 pendingintent 인증 토큰 encryptedsharedpreferences authenticator 생체인증 biometric 보안 pinning 성능 재구성 recomposition 안정성 skippable 시작시간 콜드스타트 baselineprofile 메모리누수 leakcanary macrobenchmark 테스트 composetestrule robolectric fake r8 프로가드 난독화 앱크기 aab 번들 서명 keystore ci cd 플레이스토어 단계적출시 crashlytics anr vitals 위젯 glance 바로가기 앱링크",
  kmp:"멀티플랫폼 kmp multiplatform 공유 commonmain 소스셋 sourceset expect actual 플랫폼별구현 ktor 클라이언트 sqldelight room kmp datastore multiplatform-settings koin 의존성주입 ios 연동 swift objectivec xcframework 프레임워크 skie flow asyncsequence sealed enum compose multiplatform composemp ui공유 데스크톱 wasm 웹 네이티브 메모리모델 freeze 동시성 dispatchers 테스트 commontest jvmtest 빌드 cocoapods spm 배포 도입판단",
  scale:"대규모 트래픽 대용량 성능 부하 확장 스케일 rps tps p99 지연 리틀의법칙 용량산정 병목 커넥션풀 hikari 캐시 cache redis 레디스 caffeine 카페인 2단캐시 스탬피드 관통 눈사태 핫키 ttl 지터 분산락 redisson 원자적update 낙관적락 멱등 idempotent 중복결제 유니크제약 kafka 카프카 컨슈머 파티션 랙 dlq 아웃박스 outbox cdc debezium 사가 saga 보상트랜잭션 격벽 bulkhead 세마포어 부하차단 loadshedding 서킷브레이커 타임아웃예산 ratelimit 처리율제한 429 대기열 토큰버킷 읽기복제본 샤딩 파티셔닝 관측 observability 메트릭 micrometer prometheus 추적 tracing 알람 부하테스트 k6 스트레스 카오스",
  deep:"전문가 심화 내부동작 k2 컴파일러 fir ir 파이프라인 바이트코드 디컴파일 intrinsics 코루틴내부 continuation 상태기계 디스패처 스케줄러 워크스틸링 람다비용 inline invokedynamic 캡처 jmh 벤치마크 널검사 박싱 boxing 제네릭소거 erasure reified valueclass 맹글링 메모리 객체레이아웃 jol gc g1 zgc 힙덤프 프로파일링 asyncprofiler 플레임그래프 jfr mat debugprobes jmm volatile 원자성 atomic longadder cas falsesharing 컴파일러플러그인 ksp powerassert graalvm 네이티브이미지 runtimehints 타입시스템 변성 타입추론 컨텍스트파라미터 함수형 대수적데이터타입 adt arrow either 헥사고날 ddd archunit 대규모 빌드시간 deprecated optin 이진호환성",
  tool:"도구 gradle kts 빌드 버전카탈로그 versioncatalog 컨벤션플러그인 buildlogic 멀티모듈 ktlint detekt 정적분석 코드스타일 editorconfig 베이스라인 테스트 junit5 kotest mockk turbine testcontainers mockwebserver 픽스처 kotlinx serialization json 직렬화 ktor 서버 라우팅 statuspages 로깅 kotlinlogging logback 구조화로그 날짜 시간 datetime duration clock 파일 csv 엑셀 poi sxssf pdf http클라이언트 retrofit webclient restclient cli clikt 스크립트 mainkts 문서화 kdoc dokka openapi restdocs 라이브러리배포 mavenpublish 이진호환성 binarycompatibility ide 인텔리제이 노트북 도구찾기",
  setup:"설치 세팅 환경설정 환경변수 코틀린설치 kotlin설치 kotlinc 코틀린씨 컴파일러 k2 2.2 jdk jre jvm 자바 java temurin 테무린 adoptium 어답티움 corretto 코레토 zulu 줄루 openjdk lts 21 25 17 java_home javahome path 패스 경로 where which 명령어없음 command_not_found 내부또는외부명령 winget scoop chocolatey brew homebrew apt sdkman 에스디케이맨 버전전환 여러버전 toolchain 툴체인 jvmtoolchain gradle 그레이들 gradlew 래퍼 wrapper build.gradle.kts kts kotlindsl 코틀린dsl settings.gradle.kts gradle.properties libs.versions.toml 버전카탈로그 versioncatalog 데몬 daemon 빌드캐시 buildcache 설정캐시 configurationcache 병렬 parallel 증분컴파일 incremental 빌드속도 느림 buildscan 빌드스캔 프록시 proxy 미러 mirror 넥서스 nexus 사내망 인증서 pkix keytool cacerts intellij 인텔리제이 idea 아이디어 community ultimate toolbox 툴박스 k2모드 스크래치파일 scratch repl 리플 kts스크립트 main.kts android_studio 안드로이드스튜디오 androidstudio sdkmanager sdk 안드로이드sdk android_home platform-tools adb 에이디비 avd 에뮬레이터 emulator 가상기기 실기기 usb디버깅 usbdebugging 개발자옵션 whpx hyper-v haxm 가상화 local.properties sdk.dir compose 컴포즈 kmp 멀티플랫폼 multiplatform 코틀린멀티플랫폼 xcode 엑스코드 cocoapods 코코아팟 kdoctor ios 아이오에스 macos 맥 wasm js 데스크톱 spring 스프링 springboot 스프링부트 start.spring.io initializr kotlin-spring allopen all-open noarg no-arg jpa 엔티티 bootrun jackson-module-kotlin kotlin-reflect ktor 케이토 ktlint 케이티린트 detekt 디텍트 editorconfig 정적분석 포맷 린트 lint kotlinx coroutines 코루틴 serialization 직렬화 datetime ksp kapt 어노테이션프로세서 인코딩 encoding utf8 utf-8 한글깨짐 깨짐 chcp 65001 cp949 euckr file.encoding unsupported_class_file_major_version major_version 69 65 61 트러블슈팅 오류 에러 문제해결 진단 캐시삭제 invalidate 한글경로 공백경로 windows 윈도우 linux 리눅스 wsl",
};
const FIND_CHIPS = ["널 안전하게 다루기","data class","스코프 함수 고르기","확장 함수",
                    "when 식","컬렉션 변환","자바 코드 부르기","코틀린 시작하기"];
const SEC_KW = {
  /* 하려는 일을 한글로 쳤을 때 걸리게 하는 보강 키워드 */
  kb03:"npe 널포인터 null 안전호출 엘비스 lateinit lazy 플랫폼타입 스마트캐스트",
  kb08:"dto 데이터클래스 copy 구조분해 값객체 equals hashcode 얕은복사",
  kb11:"상태 enum sealed when 봉인 타입 상태머신 에러타입 exhaustive",
  kb12:"확장함수 유틸클래스 stringutils 확장프로퍼티 정적디스패치",
  kb16:"let run with apply also takeif 스코프함수 고르는법 차이",
  kb18:"자바상호운용 플랫폼타입 jvmstatic jvmfield jvmoverloads jvmname throws sam 점진도입 마이그레이션",
  ka02:"변성 공변 반공변 in out pecs 와일드카드 스타프로젝션 제네릭대입",
  ka03:"타입소거 erasure reified is 검사 제네릭타입 json 역직렬화 typereference",
  ka04:"inline 람다비용 객체생성 비지역반환 crossinline noinline 바이트코드 디컴파일",
  ka07:"dsl 빌더 수신객체람다 dslmarker gradle kts 라우팅 html빌더 설정블록",
  ka09:"성능 o(n2) contains 인덱스 associateby 정렬 comparator 다중정렬 한글정렬 collator 박싱",
  ka13:"ksp kapt 애너테이션프로세서 코드생성 room hilt moshi serialization 컴파일러플러그인",
  co01:"코루틴 왜 스레드비교 블로킹 논블로킹 스레드고갈 가상스레드 비교 콜백지옥",
  co04:"구조적동시성 job 트리 부모자식 취소전파 globalscope 누수 coroutinescope",
  co06:"디스패처 io default main limitedparallelism 스레드풀 withcontext 스레드전환",
  co07:"취소 cancel 협조적 ensureactive isactive noncancellable cancellationexception 삼킴 finally",
  co09:"예외 supervisorjob supervisorscope coroutineexceptionhandler 부분실패 전파 형제취소",
  co12:"flow 플로우 cold hot collect emit callbackflow 콜백변환 sharein statein",
  co13:"flow연산자 map filter debounce flatmaplatest combine zip buffer conflate collectlatest flowon catch retry 검색자동완성",
  co14:"stateflow sharedflow 화면상태 일회성이벤트 회전 replay whilesubscribed mvvm",
  co17:"블로킹 jdbc withcontext io 콜백 suspendcancellablecoroutine future reactor mono flux 변환 레거시",
  co18:"테스트 runtest testdispatcher 가상시간 advanceuntilidle turbine backgroundscope setmain",
  co19:"내부동작 cps continuation 상태기계 label 디컴파일 바이트코드 스택트레이스",
  sb01:"프로젝트생성 gradle kts 플러그인 allopen noarg final open cglib 프록시 기본생성자 jsr305 널",
  sb05:"jackson 코틀린모듈 dto 역직렬화 기본값 null missingkotlinparameter isvip 이름 snakecase kotlinx serialization jackson3",
  sb06:"검증 validation field: notblank valid 커스텀검증 constraintvalidator 사용지점 애너테이션",
  sb07:"예외처리 restcontrolleradvice exceptionhandler problemdetail rfc9457 sealed 에러코드 400 409",
  sb09:"트랜잭션 transactional 프록시 내부호출 self invocation suspend 코루틴 transactiontemplate readonly 이벤트리스너 aftercommit",
  sb10:"코루틴 스프링 suspend컨트롤러 가상스레드 virtual thread webflux 선택기준 mdc 시큐리티컨텍스트 threadlocal",
  sb11:"시큐리티 security 코틀린dsl authorizehttprequests jwt 필터 preauthorize authenticationprincipal 401 403",
  sb12:"테스트 mockk coevery coverify mockkbean testcontainers serviceconnection mockmvc webtestclient kotest 픽스처",
  sb16:"배포 도커 bootbuildimage buildpacks graalvm 네이티브이미지 runtimehints 기동시간 메모리 graceful",
  wf01:"webflux mvc 비교 이벤트루프 스레드모델 커넥션 가상스레드 선택기준 언제쓰나",
  wf03:"reactor 코루틴 변환 awaitsingle awaitsingleornull asflow asflux mono빌더 publisher",
  wf05:"webclient 커넥션풀 connectionprovider maxidletime prematurecloseexception 타임아웃 awaitbody 재시도 restclient",
  wf06:"r2dbc 논블로킹db coroutinecrudrepository criteria 연관없음 jpa차이 flyway",
  wf08:"sse serversentevent 스트리밍 ndjson 브로드캐스트 sharedflow 하트비트 느린소비자 버퍼",
  wf09:"websocket 웹소켓 양방향 채팅 세션 하트비트 재연결 브로드캐스트 redis pubsub",
  wf10:"서킷브레이커 resilience4j 타임아웃 재시도 백오프 폴백 장애격리 executesuspendfunction",
  wf13:"운영 튜닝 netty ioworkercount 다이렉트메모리 maxdirectmemorysize 커넥션풀 ulimit maxinmemorysize 누수",
  wf14:"배압 backpressure 버퍼 conflate 흐름제어 느린소비자 buffer collectlatest 오버플로",
  wf15:"파일업로드 다운로드 스트리밍 multipart databuffer 대용량 프리사인드 csv 내보내기",
  da02:"코틀린엔티티 dataclass 금지 equals hashcode tostring 프록시 val var enumerated string allopen noarg",
  da04:"영속성컨텍스트 1차캐시 더티체킹 스냅숏 flush clear 준영속 merge lazyinitializationexception openinview",
  da07:"n+1 fetchjoin entitygraph batchfetchsize 쿼리수 페이징 distinct 성능",
  da09:"kotlinjdsl jdsl 라인 동적쿼리 kapt없이 whereand jpql dsl",
  da10:"exposed 젯브레인스 sqldsl dao 테이블object newsuspendedtransaction ktor",
  da11:"jooq 코드생성 스키마 윈도함수 cte upsert 통계 라이선스",
  da12:"트랜잭션전파 requiresnew unexpectedrollback 낙관적락 version optimisticlocking 비관적락 forupdate 재시도 retryable",
  da13:"배치insert jdbcbatchsize sequence identity 커서페이징 offset 스트리밍 clear 메모리 대용량",
  an02:"생명주기 화면회전 구성변경 프로세스종료 savedstatehandle 상태복구 활동유지안함 transactiontoolarge",
  an03:"compose 컴포즈 composable 선언형 recomposition modifier 순서 preview 미리보기 xml 비교",
  an05:"remember remembersaveable derivedstateof 상태호이스팅 stateless 재구성범위 immutable 안정성 key",
  an06:"launchedeffect disposableeffect remembercoroutinescope snapshotflow produceState collectasstatewithlifecycle 부수효과",
  an07:"viewmodel viewmodelscope stateflow sharedflow uistate sealed 화면상태 이벤트 sharingstarted whilesubscribed",
  an11:"retrofit ktorclient okhttp 인터셉터 타임아웃 suspend api 에러메시지 httpexception 오프라인",
  an12:"room dao flow entity migration datastore sharedpreferences 오프라인우선 ssot 암호화",
  an15:"디버깅 logcat layoutinspector 프로파일러 leakcanary strictmode anr r8 릴리스빌드 크래시",
  ax01:"아키텍처 멀티모듈 계층 ui domain data 의존방향 컨벤션플러그인 buildlogic internal",
  ax02:"hilt dagger 의존성주입 provides binds 스코프 singleton hiltviewmodel qualifier 수동di koin",
  ax04:"paging3 pagingsource pagingdata cachedin collectaslazypagingitems loadstate remotemediator 무한스크롤",
  ax05:"workmanager coroutineworker 제약조건 constraints 주기작업 백오프 전면서비스 배터리최적화",
  ax07:"토큰저장 encryptedsharedpreferences authenticator 401 갱신 mutex 생체인증 biometricprompt pinning playintegrity",
  ax08:"재구성 recomposition skippable 안정성 immutable 컴파일러리포트 layoutinspector 람다 key",
  ax09:"시작시간 콜드스타트 baselineprofile appstartup splashscreen anr vitals 메모리누수 leakcanary macrobenchmark",
  ax11:"r8 proguard 난독화 keep 규칙 릴리스크래시 mapping 앱크기 aab shrinkresources webp",
  ax12:"서명 keystore signingconfig flavor buildconfig ci githubactions 단계적출시 트랙 인앱업데이트",
  mp01:"kmp 공유범위 도메인 데이터 프레젠테이션 ui 점진도입 판단 언제쓰나",
  mp03:"expect actual 플랫폼별 구현 typealias 인터페이스 di 중간소스셋 applemain",
  mp05:"ktor client 공통 엔진 okhttp darwin 타임아웃 재시도 에러처리 retrofit비교",
  mp06:"sqldelight sq파일 쿼리 생성 드라이버 nativesqlitedriver room kmp 오프라인",
  mp07:"ios연동 swift objectivec 헤더 제네릭손실 sealed switch objcname 파사드 노출표면",
  mp08:"skie touchlab flow asyncsequence forawait sealed swiftenum 기본인자 suspend async viewmodel swiftui",
  mp09:"compose multiplatform composemp ui공유 uikitview composeuiviewcontroller 리소스 wasm 데스크톱",
  mp10:"ui공유안함 swiftui 네이티브ui 공유viewmodel 로직공유 전략 도입순서",
  mp13:"xcframework cocoapods spm 배포 gradle xcode ci 맥 빌드시간 캐시",
  mp14:"리소스 다국어 문자열 번역 strings 로컬라이제이션 복수형 rtl 아이콘",
  mp15:"점진도입 기존앱 마이그레이션 파일럿 cocoapods xcframework 팀합의 공유범위",
  sc01:"용량산정 rps tps 동시처리 리틀의법칙 p99 slo 지표 micrometer",
  sc02:"병목 커넥션풀 hikari limitedparallelism 스레드고갈 슬로우쿼리 순서",
  sc03:"2단캐시 로컬캐시 caffeine redis 무효화 pubsub ttl 정합성",
  sc05:"캐시스탬피드 thundering herd 관통 penetration 눈사태 avalanche 핫키 지터 refreshahead 블룸필터",
  sc06:"분산락 redisson 원자적update 낙관적락 비관적락 선착순 재고 쿠폰 lua",
  sc07:"멱등 idempotencykey 중복결제 재시도 유니크제약 setnx 웹훅",
  sc09:"아웃박스 outbox 이중쓰기 dualwrite cdc debezium 사가 saga 보상 skiplocked 최종일관성",
  sc10:"격벽 bulkhead 세마포어 부하차단 loadshedding 429 타임아웃예산 기능플래그 우선순위",
  sc11:"ratelimit 토큰버킷 처리율제한 429 retryafter 대기열 sortedset 티켓팅 순번",
  sc12:"db확장 인덱스 읽기복제본 replica 복제지연 routingdatasource 파티셔닝 샤딩 아카이빙",
  sc14:"부하테스트 k6 스트레스 스파이크 내구테스트 카오스 threshold 체크리스트",
  dp01:"k2 컴파일러 fir ir 프런트엔드 백엔드 컴파일옵션 freecompilerargs 스마트캐스트개선",
  dp02:"바이트코드 디컴파일 showkotlinbytecode dataclass 기본인자 default 비트마스크 확장함수 static",
  dp03:"코루틴내부 디스패치 스케줄러 워크스틸링 로컬큐 unconfined undispatched 오버헤드",
  dp04:"람다비용 inline invokedynamic lambdametafactory 캡처 jmh 벤치마크 워밍업 이스케이프분석",
  dp07:"메모리 객체레이아웃 jol 헤더 정렬 박싱 intarray gc g1 zgc maxrampercentage 힙덤프",
  dp08:"프로파일링 asyncprofiler 플레임그래프 alloc wall lock jfr jmc mat 힙덤프 debugprobes 코루틴덤프",
  dp09:"jmm volatile 가시성 원자성 atomiclong longadder cas atomicfu falsesharing 안전발행",
  dp11:"graalvm 네이티브이미지 aot runtimehints 리플렉션 kotlinxserialization 기동시간 콜드스타트",
  dp13:"sealed 대수적데이터타입 adt 불가능한상태 상태기계 타입 arrow either raise ensure",
  dp14:"헥사고날 포트어댑터 ddd 도메인 valueclass 애그리거트 archunit 모듈분리 과설계",
  dp15:"빌드시간 gradle 캐시 configurationcache kapt ksp deprecated replacewith optin requiresoptin 이진호환성 openrewrite",
  to01:"gradle kts 버전카탈로그 libsversionstoml jvmtoolchain 컴파일러옵션 빌드캐시 configurationcache",
  to03:"ktlint detekt 정적분석 editorconfig 베이스라인 커스텀규칙 코드스타일 ci강제",
  to04:"테스트 junit5 kotest mockk coevery turbine runtest testcontainers mockwebserver 픽스처 백틱 한글테스트명",
  to05:"kotlinx serialization serializable serialname transient 다형직렬화 커스텀시리얼라이저 jackson비교",
  to06:"ktor 서버 embeddedserver routing statuspages contentnegotiation authentication websocket 스프링비교",
  to08:"파일 uselines readtext csv bom 엑셀 poi sxssf 대용량 pdf 폰트",
  to12:"라이브러리배포 mavenpublish sonatype 서명 이진호환성 apidump inline호환 시맨틱버전",
  to16:"도구찾기 목적별 검색 라이브러리 선택 무엇을쓸까",
  st01:"세갈래 서버 백엔드 안드로이드 kmp 멀티플랫폼 선택 흐름도 jdk ide sdk xcode 용량 디스크 kotlin 2.2 k2 버전지도 설치순서 컴파일러 gradle이받아옴 읽는순서",
  st02:"jdk 설치 temurin adoptium msi 마법사 java_home path 환경변수 시스템변수 sysdm.cpl 위로이동 우선순위 javapath where.exe which winget scoop brew apt sdkman 여러버전 전환 jbr 안드로이드스튜디오내장jdk java-version javac-version",
  st03:"kotlinc cli 컴파일러 include-runtime jar java-jar 실행 sdkman scoop chocolatey repl 대화형 스크래치파일 scratch kts main.kts 스크립트 dependson jvm-target werror mainkt jvmname 표준라이브러리 stdlib",
  st04:"intellij 인텔리제이 idea toolbox 툴박스 community ultimate newproject 프로젝트생성 gradle kotlin_dsl project_sdk gradle_jvm jvmtoolchain 세군데 k2모드 캐시 invalidate 단축키 alt_enter 자바코틀린변환 메모리 xmx 프로젝트구조 gitignore",
  st05:"gradle 그레이들 build.gradle.kts settings.gradle.kts kotlin_dsl 플러그인 plugins dependencies repositories jvmtoolchain 래퍼 wrapper gradlew 태스크 task 구성단계 실행단계 데몬 up-to-date libs.versions.toml 버전카탈로그 alias bundles 프록시 넥서스 nexus 미러 pkix keytool 사내망",
  st06:"android_studio 안드로이드스튜디오 설치 sdk_manager platforms build-tools platform-tools system-images ndk cmake android_home android_sdk_root adb 에이디비 devices logcat reverse avd 에뮬레이터 emulator 가상기기 x86_64 arm64 실기기 usb디버깅 개발자옵션 빌드번호 무선디버깅 local.properties sdk.dir compose 첫프로젝트 minsdk compilesdk",
  st07:"kmp 멀티플랫폼 multiplatform commonmain androidmain iosmain jvmmain wasm js expect actual compose_multiplatform kmp.jetbrains.com 마법사 xcode 엑스코드 xcode-select 시뮬레이터 cocoapods 코코아팟 kdoctor konan 네이티브 macos 맥 윈도우제약 github_actions macos러너 ci 타깃 target",
  st08:"spring 스프링 springboot 스프링부트 start.spring.io initializr kotlin-spring plugin.spring allopen all-open plugin.jpa noarg no-arg final open cglib 프록시 transactional aop jpa entity 기본생성자 jackson-module-kotlin kotlin-reflect bootrun bootjar application.yml devtools ktor 케이토",
  st09:"ktlint 케이티린트 detekt 디텍트 baseline editorconfig 정적분석 포맷 린트 pre-commit 훅 ci 게이트 kotlinx coroutines 코루틴 serialization 직렬화 plugin.serialization datetime mockk kotest power-assert dokka renovate dependabot 코루틴디버거 debugprobes coroutinename",
  st10:"gradle.properties 빌드속도 느림 데몬 daemon 병렬 parallel 빌드캐시 caching 설정캐시 configuration-cache 증분컴파일 incremental jvmargs xmx metaspace 인코딩 encoding utf8 file.encoding chcp 65001 cp949 한글깨짐 빌드스캔 buildscan profile javatoolchains kapt ksp minify r8 백신예외 defender nontransitiveRClass clean",
  st11:"트러블슈팅 오류 에러 문제해결 진단 unsupported_class_file_major_version major_version 69 65 61 jvm-target inconsistent sdk_location_not_found local.properties sdk.dir kotlinc없음 플러그인중복 agp gradle궁합 ksp버전 pkix 인증서 프록시 다운로드멈춤 에뮬레이터검은화면 가상화 whpx adb unauthorized 빨간줄 invalidate 한글경로 공백경로 outofmemory metaspace caused_by stacktrace javatoolchains 캐시삭제 konan",
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

