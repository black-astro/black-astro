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
   "JWT 인증" → Nest 가드·Express 미들웨어,  "메모리 누수" → 전문가 탭
   ============================================================ */
const TAB_KW = {
  js:"자바스크립트 javascript js 기초 문법 변수 let const 타입 함수 화살표 arrow this 스코프 클로저 closure 객체 프로토타입 prototype 배열 array map filter reduce 구조분해 스프레드 클래스 class 모듈 module esm commonjs import require 이벤트루프 event loop 비동기 async await promise 프로미스 에러 try catch 제너레이터 이터레이터 옵셔널체이닝 정규식 regex 날짜 date es2024",
  ts:"타입스크립트 typescript ts 타입 type 인터페이스 interface 제네릭 generic 유니온 union 내로잉 narrowing 유틸리티타입 partial pick omit record keyof typeof 조건부타입 conditional infer 매핑드 mapped 템플릿리터럴 타입가드 guard unknown any never 데코레이터 decorator 선언파일 d.ts tsconfig strict 컴파일 타입에러 satisfies enum",
  node:"노드 node nodejs 런타임 runtime 서버 모듈 esm commonjs 이벤트루프 event loop 논블로킹 fs 파일 file path 경로 스트림 stream buffer 버퍼 http 서버 이벤트이미터 emitter 프로세스 process 환경변수 env 워커 worker_threads 클러스터 cluster child_process 자식프로세스 비동기 동시성 에러 크래시 메모리 성능 npm 패키지 디버깅 pm2 deno 디노 bun 번 런타임비교 다른런타임 권한모델 allow-net 샌드박스 jsc 마이그레이션 hono 엣지 서버리스 node24 lts",
  express:"익스프레스 express 서버 api rest 라우팅 route 라우터 router 미들웨어 middleware 요청 request 응답 response 바디 body 파싱 검증 validation zod 에러처리 인증 jwt 세션 session 쿠키 업로드 multer 파일 prisma db 보안 helmet cors rate limit 테스트 supertest 배포 구조",
  nest:"네스트 nest nestjs 프레임워크 모듈 module di 의존성주입 injectable 컨트롤러 controller 프로바이더 provider 서비스 dto 파이프 pipe 검증 class-validator 예외필터 exception filter 가드 guard 인증 jwt passport 인터셉터 interceptor 미들웨어 config 설정 typeorm prisma 엔티티 트랜잭션 캐시 큐 bullmq 테스트 마이크로서비스 msa websocket graphql swagger 배포",
  rn:"리액트네이티브 react native rn 앱 모바일 안드로이드 android ios 아이폰 expo 컴포넌트 jsx props 상태 state hook 훅 스타일 flexbox 리스트 flatlist 내비게이션 navigation 화면이동 네트워크 fetch tanstack query 저장소 asyncstorage mmkv 권한 카메라 알림 push 애니메이션 reanimated 제스처 성능 최적화 네이티브모듈 브릿지 turbo 빌드 eas 스토어 배포 앱스토어 플레이스토어",
  electron:"일렉트론 electron 데스크탑 데스크톱 앱 프로그램 exe 창 window 메인프로세스 렌더러 renderer ipc 통신 preload contextbridge 보안 nodeintegration 메뉴 menu 트레이 tray 단축키 다이얼로그 dialog 파일 저장 electron-store sqlite 다중창 자동업데이트 updater 패키징 electron-builder 설치파일 msi dmg 서명 성능 메모리 사내도구",
  native:"네이티브 native 애드온 addon c++ cpp rust 러스트 napi node-addon-api napi-rs binding.gyp ffi koffi dll wasm webassembly 전문가 고급 아키텍처 vscode discord 디스코드 멀티프로세스 utilityprocess 격리 플러그인 messageport 공유메모리 sharedarraybuffer 오디오 audio audioworklet 음성 보이스 voice 통화 webrtc sfu turn opus 지터 에코제거 aec 노이즈억제 vad 마이크 시스템오디오 루프백 화면공유 화면캡처 desktopcapturer getdisplaymedia 녹화 osr 오프스크린 offscreen 오버레이 게임오버레이 sharedtexture gpu 그래픽 webgpu 하드웨어가속 디코딩 시작시간 startup 스냅샷 코드캐시 fuses 무결성 크래시 crashreporter minidump 배포채널 롤아웃",
  scale:"대규모 트래픽 대용량 성능 부하 확장 스케일 scale 캐시 cache redis 레디스 분산락 lock redlock 동시성 재고 선착순 멱등 idempotent 중복결제 큐 queue bullmq 카프카 kafka 메시지 이벤트 비동기 서킷브레이커 circuit breaker 타임아웃 폴백 재시도 백오프 rate limit 처리율제한 429 커넥션풀 수평확장 무상태 stateless 세션 pm2 클러스터 모니터링 관측 opentelemetry prometheus grafana pino 부하테스트 k6 autocannon p99 rps 병목 이벤트루프지연 도커 docker 쿠버네티스 k8s 무중단 배포 graceful",
  tool:"도구 패키지매니저 npm pnpm yarn 모노레포 monorepo workspace turborepo 번들러 bundler vite esbuild tsup rollup webpack eslint prettier biome 린트 포맷 테스트 vitest jest 커버리지 e2e playwright cypress zod 검증 스키마 axios ky fetch dayjs 날짜 lodash 유틸 로깅 pino winston 로그 환경변수 dotenv husky lint-staged 커밋 commitlint ci cd github actions 도커 docker 이미지 최적화 테스트심화 속성기반 propertybased fast-check 반례 shrinking 뮤테이션 mutation stryker 변이 계약테스트 contract pact broker 스냅샷 snapshot 테스트피라미드 msw testcontainers",
  html:"html 에이치티엠엘 마크업 태그 시맨틱 semantic 문서 구조 doctype head meta viewport charset 인코딩 utf8 제목 heading h1 문단 목록 ul ol li 링크 a href 이미지 img alt srcset lazy 지연로딩 폼 form input label placeholder 검증 validation required pattern formdata 전송 시맨틱 header main footer nav article section aside 접근성 a11y aria role aria-label aria-expanded 스크린리더 낭독기 키보드 tabindex 포커스 표 table caption scope thead 스크립트 defer async preload prefetch 메타태그 og 오픈그래프 opengraph canonical seo 공유 카카오톡 미리보기 dialog 모달 details 아코디언 popover datalist picture progress 웹표준",
  css:"css 스타일 스타일시트 캐스케이드 cascade 명시도 specificity important layer 선택자 selector class id 의사클래스 hover focus focus-visible has is where not nth-child 박스모델 box-sizing border-box padding margin 마진겹침 gap 단위 px rem em vw vh dvh ch clamp min max calc 변수 커스텀프로퍼티 custom property var flex flexbox 플렉스 justify-content align-items grid 그리드 template-columns auto-fit minmax areas position relative absolute fixed sticky z-index 쌓임맥락 stacking context 반응형 responsive 미디어쿼리 media query 컨테이너쿼리 container 모바일 타이포그래피 폰트 font-family line-height word-break keep-all 웹폰트 font-display 말줄임 ellipsis 애니메이션 animation transition transform opacity keyframes 다크모드 dark mode prefers-color-scheme 테마 theme aspect-ratio scroll-margin 중첩 nesting oklch 논리속성 bem tailwind css modules 초기화 reset",
  react:"리액트 react 컴포넌트 component jsx 상태 state usestate props 렌더링 render 리렌더 rerender 훅 hook useeffect 이펙트 정리 cleanup 의존성 배열 usememo usecallback memo 메모이제이션 리스트 key 키 배열 map 폼 form 제어 uncontrolled controlled formdata useactionstate 상태끌어올리기 lifting context usecontext provider 커스텀훅 custom hook 성능 profiler 가상스크롤 virtual 코드분할 lazy suspense usedeferredvalue 데이터 fetch tanstack query 캐시 mutation 라우팅 react router 넥스트 nextjs app router 서버컴포넌트 rsc use client ssr 하이드레이션 strictmode 컴파일러 react19 에러 디버깅 devtools",
  vue:"뷰 vue vue3 컴포넌트 sfc single file component script setup template style scoped 반응성 reactivity ref reactive value torefs shallowref 컴퓨티드 computed watch watcheffect 감시 디렉티브 directive v-if v-show v-for v-bind v-on v-model 양방향 defineprops defineemits definemodel withdefaults props emit 슬롯 slot 스코프슬롯 scoped slot 생명주기 lifecycle onmounted onunmounted nexttick 템플릿ref 컴포저블 composable 재사용 피니아 pinia 스토어 store storetorefs 상태관리 라우터 vue router 라우팅 가드 guard 네비게이션 keepalive teleport 텔레포트 suspense transition 트랜지션 deep 옵션api composition api 마이그레이션 devtools",
  deep:"전문가 초고급 고급 심화 내부동작 v8 엔진 engine jit 컴파일 히든클래스 hidden class 인라인캐시 최적화 deopt 메모리 memory gc 가비지컬렉션 힙 heap 누수 leak 스냅샷 마이크로태스크 microtask 매크로태스크 프로파일링 profiling flame cpu proxy reflect 메타프로그래밍 symbol weakmap weakref finalizationregistry 함수형 불변성 커링 합성 디자인패턴 pattern 싱글턴 팩토리 옵저버 타입레벨 동시성 abortcontroller 세마포어 보안 프로토타입오염 공급망 supply chain 아키텍처 헥사고날 ddd 계층",
};
const FIND_CHIPS = ["JWT 인증 만들기","이벤트 루프 순서","제네릭","유틸리티 타입",
                    "스트림으로 큰 파일","메모리 누수 잡기","NestJS 트랜잭션","FlatList 성능",
                    "Electron IPC","C++ 애드온 만들기","음성 채팅 구현","화면 공유",
                    "Docker 배포","Zod 검증","ESM 전환","타입 에러"];
const SEC_KW = {
  /* 하려는 일을 한글로 쳤을 때 걸리게 하는 보강 키워드 */
  j03:"this 바인딩 화살표함수 콜백 undefined bind call apply",
  j04:"클로저 스코프 렉시컬 호이스팅 var let 반복문 setTimeout 함정",
  j05:"프로토타입 상속 __proto__ 객체복사 얕은복사 깊은복사 structuredClone",
  j06:"배열메서드 map filter reduce find sort 정렬 중복제거 그룹핑 groupBy",
  j09:"esm commonjs import require 모듈전환 dual package __dirname top-level await",
  j10:"이벤트루프 실행순서 setTimeout promise 마이크로태스크 콜스택 논블로킹",
  j11:"promise async await 병렬 allSettled race 순차 에러",
  j12:"에러처리 try catch finally 커스텀에러 cause unhandledrejection",
  j14:"옵셔널체이닝 널병합 structuredClone at toSorted 최신문법 es2022 es2023",
  t04:"내로잉 타입좁히기 유니온 리터럴 판별유니온 discriminated in typeof",
  t06:"제네릭 타입파라미터 extends 제약 기본값 추론",
  t07:"partial required readonly pick omit record exclude extract returntype awaited",
  t09:"조건부타입 infer extends 재귀타입 분배",
  t11:"타입가드 is asserts unknown any never 단언 as 사용자정의",
  t14:"tsconfig strict target module moduleresolution paths 별칭 컴파일옵션",
  t16:"타입에러 2345 2322 2339 초과속성 인덱스시그니처 빨간줄",
  n03:"이벤트루프 페이즈 timers poll check nexttick setimmediate 블로킹",
  n05:"스트림 파이프 pipeline backpressure 백프레셔 큰파일 readable writable transform",
  n09:"워커스레드 worker_threads 클러스터 cluster cpu 멀티코어 병렬처리",
  n11:"동시실행제한 concurrency p-limit 배치처리 순차 병렬 rate",
  n12:"크래시 uncaughtexception unhandledrejection 프로세스종료 graceful 재시작",
  n13:"메모리 힙 성능 누수 gc heapdump 프로파일",
  n17:"deno 디노 bun 번 런타임비교 다른런타임 jsc 권한모델 allow-net 샌드박스 npm호환 마이그레이션 bun install bun test deno deploy hono 표준 fetch 서버리스 엣지",
  x03:"미들웨어 next 순서 커스텀미들웨어 에러미들웨어",
  x06:"에러핸들러 전역 asyncHandler 404 상태코드",
  x13:"실시간 sse eventsource 서버센트이벤트 websocket 알림 진행률 pubsub redis 스트리밍응답",
  x14:"리버스터널 터널 ngrok 대체 websocket 멀티플렉싱 에이전트 중계서버 사내망 프록시 재연결 백오프",
  x15:"대용량 스트리밍 range 206 부분응답 동영상 재개업로드 tus 프리사인 presigned s3 멀티파트 백프레셔",
  x16:"결제 웹훅 webhook 서명검증 hmac 멱등성 idempotency 중복결제 타이밍공격 재시도 폴링 pci",
  x10:"보안 helmet cors ratelimit csrf xss sql인젝션 취약점",
  s03:"모듈 di 의존성주입 provider inject forwardRef 순환참조 scope",
  s06:"dto 검증 class-validator classtransformer validationpipe whitelist",
  s08:"가드 jwt 인증 passport strategy 토큰 리프레시 roles 권한",
  s11:"typeorm prisma 엔티티 마이그레이션 repository 관계 eager lazy",
  s13:"캐시 cachemodule redis 큐 bullmq job worker 재시도 지연작업",
  r01:"동작원리 브릿지 bridge jsi turbomodule fabric newarchitecture hermes",
  r06:"flatlist flashlist 리스트성능 키 keyExtractor 무한스크롤 페이징",
  r11:"애니메이션 reanimated gesture worklet 60fps 스와이프",
  r12:"성능 리렌더 memo usecallback 이미지최적화 번들 startup 느림",
  r14:"빌드 eas 배포 스토어 심사 서명 프로비저닝 apk aab ipa 코드푸시",
  e01:"메인프로세스 렌더러 프로세스구조 chromium nodejs 아키텍처",
  e03:"ipc invoke handle send on 통신 양방향 브로드캐스트",
  e04:"보안 contextisolation nodeintegration preload contextbridge csp 원격코드",
  e12:"딥링크 프로토콜 커스텀스킴 단일인스턴스 secondinstance openurl 자동시작 트레이상주 파일연결 점프리스트",
  e13:"터미널 nodepty xterm pty conpty 콘솔 셸 자식프로세스 execfile 명령주입 빌드로그",
  e14:"확장 플러그인 extensionhost utilityprocess 매니페스트 activationevents 격리 샌드박스 vscode",
  e15:"창상태 복원 세션 위치기억 멀티모니터 getnormalbounds safestorage 키체인 핫엑싯",
  e16:"코드서명 서명 공증 notarize smartscreen gatekeeper ev인증서 azuretrustedsigning 채널 델타업데이트 blockmap 스테이징",
  e17:"오프라인 동기화 아웃박스 큐 낙관적ui 충돌해결 crdt lww 델타싱크 재연결 백오프 sqlite 로컬퍼스트",
  e18:"체크리스트 사내도구 배포전 점검 오탐 프록시",
  e10:"패키징 electron-builder nsis dmg 설치파일 서명 공증 배포",
  v01:"아키텍처 vscode discord 구조 멀티프로세스 확장호스트 격리 플러그인 설계",
  v02:"프로세스모델 utilityprocess worker_threads child_process 격리 서비스이름 하트비트 vm샌드박스",
  v03:"고성능ipc messageport messagechannelmain transferable sharedarraybuffer 링버퍼 직렬화비용 교차출처격리",
  v04:"c++ 애드온 napi node-addon-api binding.gyp asyncworker threadsafefunction 네이티브모듈 gyp",
  v05:"rust napi-rs cargo 크로스컴파일 타입자동생성 threadsafefunction 네이티브",
  v06:"ffi koffi dll 호출 wasm webassembly simd 이식성 선택기준",
  v07:"abi electron-rebuild prebuild asarunpack 재빌드 glibc msvc 런타임 로드실패",
  v08:"오디오 audioworklet 지연 latency 디바이스 devicechange 마이크권한 샘플레이트 글리치",
  v09:"음성채팅 음성 보이스 통화 webrtc sfu turn stun opus 지터버퍼 에코제거 aec 노이즈억제 vad getstats 손실률 discord 디스코드",
  v10:"시스템오디오 루프백 loopback wasapi screencapturekit 가상오디오 blackhole 게임소리",
  v11:"화면공유 desktopcapturer getdisplaymedia 녹화 mediarecorder 인코딩 contenthint 권한",
  v12:"osr 오프스크린 offscreen paint sharedtexture gpu텍스처 오버레이 게임오버레이 sendinputevent 합성 임베딩",
  v13:"gpu 그래픽 가속 chrome://gpu 하드웨어디코딩 webgpu webgl 드라이버 크래시 스위치 commandline",
  v14:"시작시간 부팅 startup 지연require 코드캐시 v8스냅샷 mksnapshot 프로파일링 최적화",
  v15:"보안강화 fuses runasnode asar무결성 integrity csp 권한핸들러 난독화 바이트코드",
  v16:"크래시 crashreporter minidump 심볼 render-process-gone 채널 점진배포 롤아웃 강제업데이트 지표",
  k01:"싱글스레드 논블로킹 트래픽 처리량 rps 오해 cpu바운드",
  k02:"병목 이벤트루프지연 lag 커넥션풀 측정 느림",
  k05:"분산락 redlock 재고 선착순 동시성 경쟁조건 racecondition",
  k06:"멱등성 중복요청 idempotency key 재시도 중복결제",
  k07:"큐 bullmq kafka 비동기처리 워커 재시도 dlq 지연",
  k08:"서킷브레이커 타임아웃 재시도 백오프 지터 폴백 장애전파 opossum",
  k11:"수평확장 무상태 세션 스티키 sticky 파일업로드 s3 pm2",
  k12:"관측 모니터링 opentelemetry 추적 traceid pino 구조화로그 메트릭",
  k14:"도커 dockerfile 멀티스테이지 쿠버네티스 헬스체크 graceful shutdown pm2 무중단",
  o01:"npm pnpm yarn 패키지매니저 lock 설치속도 workspace",
  o05:"테스트 vitest jest mock 커버리지 단위테스트 스냅샷",
  o07:"zod 검증 스키마 런타임 파싱 타입추론 폼검증 환경변수검증",
  o09:"로깅 pino winston json로그 환경변수 dotenv 설정검증",
  o13:"도구찾기 라이브러리추천 뭘써야하지 색인",
  o14:"테스트심화 속성기반테스트 propertybased pbt fast-check 반례 shrinking 뮤테이션테스트 mutation stryker 변이 커버리지거짓말 계약테스트 contract pact broker 소비자 제공자 스냅샷 snapshot 인라인스냅샷 테스트피라미드 무엇을테스트 testcontainers",
  d01:"v8 엔진 파싱 ignition turbofan jit 바이트코드 최적화",
  d02:"히든클래스 인라인캐시 최적화해제 deopt 모노모픽 성능",
  d04:"메모리누수 힙스냅샷 리스너 클로저 캐시 detached devtools",
  d05:"마이크로태스크 큐 nexttick 우선순위 실행순서 심화",
  d07:"abortcontroller 취소 signal 세마포어 동시성제어 타임아웃",
  d08:"proxy reflect 메타프로그래밍 트랩 get set 프록시",
  d13:"보안 프로토타입오염 공급망 supplychain npm audit 악성패키지 postinstall",
  d15:"아키텍처 계층 헥사고날 클린 ddd 의존성역전 폴더구조",
  d16:"webassembly wasm 네이티브애드온 napi-rs rust node-gyp wasi 고속화",
  d17:"스트림 백프레셔 highwatermark pipeline drain webstreams 대용량 csv 메모리",
  d18:"번들 트리셰이킹 sideeffects 코드스플리팅 동적import 청크 lodash moment 번들크기",
  s17:"cqrs 명령 조회 분리 이벤트소싱 동적모듈 configurablemodule cls asynclocalstorage 요청스코프",
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
      <b>다른 낱말로</b> 검색해 보세요 — 예: 인증, 캐시, 타입, 배포, 테스트</div>`;
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

