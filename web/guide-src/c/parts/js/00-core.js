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
  base:"c 씨 c언어 clang gcc 표준 c17 c11 c99 c23 정수 int32_t stdint size_t 오버플로 배열 포인터 decay 문자열 널종료 strcpy snprintf 버퍼오버플로 malloc free 누수 해제후사용 이중해제 구조체 패딩 정렬 union 비트필드 함수포인터 콜백 qsort 파일 fopen fgets errno 전처리기 매크로 define 인클루드가드 헤더 static extern makefile ub 미정의동작 앨리어싱 c와c++차이 externc",
  sys:"c 자료구조 동적배열 연결리스트 해시테이블 qsort bsearch 문자열처리 토큰 파싱 posix open read write stat opendir 시간 clock_gettime 소켓 socket tcp 서버 epoll poll 스레드 pthread mutex condvar atomic 프로세스 fork exec waitpid 시그널 signal 파이프 pipe c23 nullptr constexpr typeof embed 임베디드 라이브러리 정적 공유 so dll 버전 테스트 디버깅 gdb valgrind 프로젝트구조 makefile cmake 생태계 sqlite libcurl",
  setup:"설치 툴체인 toolchain 환경설정 개발환경 세팅 msys2 ucrt64 mingw gcc 지씨씨 msvc cl.exe visual studio build tools 빌드툴 wsl wsl2 usbipd 리눅스 맥 macos homebrew vscode vs코드 비주얼스튜디오코드 clangd compile_commands tasks.json launch.json make makefile cmake 씨메이크 ninja 닌자 크로스컴파일 cross compiler avr-gcc avrdude 에이브이알 arm-none-eabi-gcc arm gnu toolchain newlib nano.specs objcopy hex bin elf stm32cubemx cubeide cubeclt cubeprogrammer st-link stlink 스티링크 j-link cmsis-dap openocd pyocd swd swdio swclk platformio 플랫폼아이오 wokwi qemu renode simulide simavr 시뮬레이터 아두이노 uno r3 r4 nucleo f446re 뉴클레오 로직분석기 멀티미터 드라이버 ch340 zadig com포트 udev dialout path 환경변수 not in sync 트러블슈팅",
};

const FIND_CHIPS = ["포인터 기초","malloc 누수","구조체 패딩","함수 포인터",
                    "비트 조작","volatile","UART 링 버퍼","타이머 PWM",
                    "STM32 HAL","DMA","FreeRTOS 큐","우선순위 역전",
                    "HardFault","헤더 구조","부트로더","워치독"];
const SEC_KW = {
  c01:"c언어 왜쓰나 커널 임베디드 인터프리터 설치 gcc clang msvc msys2 경고플래그 wall wextra 표준버전 c17 c23",
  c02:"정수 크기 int long size_t stdint int32_t uint64_t 오버플로 ub 부호비교 정수승격 char부호 시프트 limits",
  c03:"배열 포인터 decay 변환 sizeof 함수인자 길이 포인터산술 2차원배열 다차원 행렬 인덱스계산",
  c04:"문자열 널종료 strlen strcpy strncpy snprintf sprintf gets fgets 버퍼오버플로 리터럴 읽기전용 utf8 한글바이트",
  c05:"malloc calloc realloc free 메모리누수 해제후사용 이중해제 미초기화 소유권 goto정리 아레나 풀 스택할당 asan",
  c06:"구조체 struct 패딩 정렬 alignof offsetof packed pragma pack union 공용체 타입펀 비트필드 직렬화 엔디안 staticassert",
  c07:"함수포인터 콜백 typedef qsort 비교함수 다형성 vtable 인터페이스 ops테이블 userdata dlsym",
  c08:"파일 fopen fread fgets fwrite fclose 바이너리모드 errno strerror feof ferror 버퍼링 stdout stderr 부분읽기 경로 인코딩",
  c09:"전처리기 매크로 define 괄호 이중평가 dowhile0 va_args 인클루드가드 pragmaonce 조건부컴파일 win32 gnuc msvc externc",
  c10:"헤더 소스분리 선언 정의 extern static 전역변수 makefile 링커 심볼 의존성 mmd 공개api 접두사",
  c11:"ub 미정의동작 오버플로 미초기화 범위밖 수명 댕글링 엄격한앨리어싱 strictaliasing 시퀀스포인트 ubsan asan valgrind 퍼징 clangtidy",
  c12:"c와c++ 차이 상위집합 voidp 캐스트 구조체이름 지정초기화 bool union타입펀 맹글링 예약어 vla restrict memset new 절충",
  c13:"표준라이브러리 헤더 stdio stdlib string math time ctype assert errno limits stdint stdbool stdatomic threads printf 서식 snprintf strtol qsort man페이지 cppreference size_t %zu PRId64 inttypes 난수 srand 환경변수 getenv localtime_r 스레드안전",
  c14:"동적배열 벡터 vector 연결리스트 linkedlist realloc 2배성장 상환분석 amortized 용량 cap len 제네릭 void포인터 매크로 stb_ds klib kvec 이중포인터 노드 삽입 삭제 뒤집기 use-after-free 반복자무효화",
  c15:"해시테이블 hashtable 딕셔너리 dict 오픈어드레싱 선형탐사 FNV1a 해시함수 충돌 묘비 tombstone rehash 적재율 loadfactor qsort bsearch 비교함수 lower_bound 이진탐색 해시DoS SipHash stb_ds khash uthash",
  c16:"문자열 파싱 strtok_r strtok_s strtol sscanf 함정 snprintf 반환값 gets 금지 버퍼오버플로 strcspn 개행제거 동적문자열 StringBuilder vsnprintf va_copy va_list UTF8 한글 글자수 인코딩 코드포인트 SetConsoleOutputCP strnlen strcasecmp",
  c17:"POSIX open read write close 파일디스크립터 fd stat fstat st_mode st_size opendir readdir 디렉터리순회 mmap munmap madvise MAP_SHARED 페이지캐시 EINTR 부분쓰기 clock_gettime CLOCK_MONOTONIC nanosleep 윈도우 _WIN32 QueryPerformanceCounter CreateFile",
  c18:"소켓 socket bind listen accept connect recv send TCP 서버 클라이언트 에코서버 Winsock WSAStartup ws2_32 htons htonl getaddrinfo SO_REUSEADDR TIME_WAIT 메시지경계 길이접두사 select poll epoll kqueue IOCP io_uring 논블로킹 EAGAIN SIGPIPE TCP_NODELAY libuv libevent",
  c19:"스레드 pthread pthread_create pthread_join threads.h thrd_create mutex 뮤텍스 조건변수 cond_wait 가짜깨어남 spurious 생산자소비자 큐 데이터레이스 race condition stdatomic atomic_fetch_add CAS compare_exchange memory_order volatile 오해 TSan ThreadSanitizer helgrind 데드락 락순서",
  c20:"프로세스 fork exec execvp wait waitpid 좀비 zombie copy-on-write 시그널 signal sigaction SIGINT SIGTERM SIGKILL SIGSEGV SIGPIPE SIGCHLD sig_atomic_t 파이프 pipe dup2 popen pclose 명령주입 CreateProcess WaitForSingleObject 종료코드 graceful shutdown",
  c21:"C23 C17 C11 C99 표준 연표 nullptr constexpr typeof #embed auto _BitInt 2진리터럴 0b 자릿수구분자 attributes nodiscard deprecated maybe_unused fallthrough memset_explicit strdup 표준화 __STDC_VERSION__ GCC15 Clang20 MSVC _Generic tgmath cleanup 확장",
  c22:"임베디드 마이크로컨트롤러 MCU volatile 레지스터맵 비트연산 마스크 시프트 BIT SET_BIT GPIO UART 인터럽트 ISR 링버퍼 ringbuffer 원형큐 2의거듭제곱 마스크 freestanding nostdlib 링커스크립트 linker.ld bss data 섹션 startup Reset_Handler Arduino ESP32 STM32 RaspberryPiPico",
  c23:"라이브러리 정적 동적 .a .so .dll .lib ar 아카이브 fPIC shared dllexport dllimport visibility hidden 버전스크립트 SONAME semver ABI 불투명포인터 opaque 헤더설계 extern C ldd nm objdump dumpbin ctypes P/Invoke FFM JNI koffi 러스트 extern",
  c24:"디버깅 테스트 gdb lldb bt backtrace watch breakpoint 코어덤프 core dump ulimit ASan AddressSanitizer UBSan sanitize valgrind leak-check helgrind Unity cmocka Criterion greatest CTest ctest 새니타이저 -g -O0 -O2 optimized out objcopy debuglink GitHub Actions CI",
  c25:"Makefile make 의존성 -MMD -MP wildcard patsubst 탭 들여쓰기 CMake CMakeLists target_include_directories FetchContent find_package pkg-config vcpkg Ninja 디렉터리구조 include src tests third_party clang-format gitignore compile_commands.json clangd bear GitHub Actions 릴리스 static musl",
  c26:"생태계 라이브러리 SQLite libcurl cJSON yyjson jansson zlib zstd miniz libuv libevent raylib SDL3 mbedTLS OpenSSL GTK Nuklear stb_ds klib Unity log.c argtable getopt_long 의존성관리 vcpkg apt FetchContent 라이선스 Redis CPython Git Nginx FFmpeg PostgreSQL 리눅스커널 WebAssembly Emscripten",
  u01:"툴체인 지도 호스트 컴파일러 크로스 컴파일러 플래셔 디버그 프로브 IDE elf hex bin 산출물 arm-none-eabi 펌웨어 흐름",
  u02:"msys2 ucrt64 pacman mingw-w64 gcc msvc cl.exe build tools developer powershell std=c17 c23 경고 플래그 Wconversion utf-8 chcp PATH 환경변수",
  u03:"build-essential apt dnf brew xcode-select wsl2 usbipd bind attach ttyACM0 ttyUSB0 dialout udev 60-openocd.rules lsusb vid pid",
  u04:"vscode clangd cpptools compile_commands.json query-driver .clangd tasks.json launch.json cppdbg problemMatcher cmake tools extensions.json 빨간줄 자동완성",
  u05:"makefile cmake ninja 툴체인 파일 toolchain CMAKE_SYSTEM_NAME Generic CMakePresets preset objcopy post_build 링커 스크립트 gc-sections print-memory-usage",
  u06:"avr-gcc avr-libc avrdude mmcu atmega328p F_CPU 16MHz objcopy ihex intel hex optiboot 부트로더 stk500 퓨즈 usbasp isp m328p 115200",
  u07:"arm-none-eabi-gcc arm gnu toolchain cortex-m4 mthumb mfloat-abi hard softfp mfpu fpv4-sp-d16 newlib nano.specs nosys.specs printf_float objcopy size map multilib",
  u08:"stm32cubemx cubeide cubeclt cubeprogrammer STM32_Programmer_CLI vs code stm32 확장 ioc user code nucleo-f446re 코드 생성 cmake 프리셋 mode=UR",
  u09:"st-link j-link cmsis-dap daplink swd swdio swclk nrst swo vtref cn4 cn2 openocd pyocd gdb server 3333 cortex-debug svd 10핀 커넥터",
  u10:"platformio pio platformio.ini env atmelavr ststm32 stm32cube framework upload_protocol debug_tool native unity lib_deps device monitor compiledb",
  u11:"wokwi simulide simavr qemu qemu-system-avr mps2-an386 semihosting rdimon renode resc diagram.json wokwi.toml 시뮬레이션 에뮬레이터 ci",
  u12:"구매 장바구니 arduino uno r3 r4 ra4m1 atmega328p nucleo-f446re blue pill stm32f103 짝퉁 cks32 로직 분석기 pulseview sigrok 멀티미터 브레드보드 저항 led 220옴",
  u13:"트러블슈팅 드라이버 ch340 cp2102 st-link 드라이버 zadig com 포트 장치 관리자 stk500_recv not in sync no st-link detected can not connect to target connect under reset boot0 udev dialout modemmanager brltty path where.exe setx",
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

  /* 사용자가 직접 스크롤하면 보정을 멈춘다 — 끝까지 붙잡고 있으면 휠이 먹지 않는다 */
  const INPUT = ["wheel", "touchstart", "keydown", "mousedown"];
  const quit = () => { if (my === goSecRun){ goSecRun++; done(); } };
  const unhook = () => INPUT.forEach(t => removeEventListener(t, quit, true));
  INPUT.forEach(t => addEventListener(t, quit, {capture:true, passive:true}));

  let ended = false;
  const done = () => {
    if (ended) return;
    ended = true;
    unhook();
    html.style.scrollBehavior = "";     // 스타일시트의 smooth 로 복귀
    /* 누른 목차를 직접 켠다. 스크롤 스파이는 '띠에 새로 들어온' 섹션만 켜므로
       보정 도중 이전 섹션이 먼저 켜지면 그대로 남거나,
       문서 끝의 짧은 섹션은 띠까지 올라오지 못해 앞 섹션이 켜진 채로 남았다. */
    document.querySelectorAll('nav.side a[href^="#"]').forEach(a =>
      a.classList.toggle("on", a.getAttribute("href") === "#" + id));
    revealIn();
  };
  /* ★ 한두 프레임 제자리라고 끝내지 않는다.
     section.sec 는 content-visibility:auto 라 처음 보는 섹션은 900px 자리만 차지하다가,
     화면 근처로 오면 한두 프레임 '뒤에' 실제 높이로 렌더된다.
     바로 위 섹션이 늦게 커지면 목표가 1~3천 px 아래로 밀려,
     예전(2프레임 안정 = 끝)에는 앞 섹션 한가운데에 멈추고 목차도 앞 섹션이 켜졌다.
     (처음 여는 탭에서 무작위로 누르면 3번 중 1번꼴로 재현됐다)
     → 10프레임 연속 제자리일 때만 끝낸다. 문서 끝이라 더 못 내려가는 자리는 max 로 자른다. */
  let n = 0, calm = 0;
  const fix = () => {
    if (my !== goSecRun){ unhook(); return; }    // 더 최신 요청이 들어옴 → 중단
    const max = html.scrollHeight - innerHeight;
    const y = Math.max(0, Math.min(max,
      Math.round(el.getBoundingClientRect().top + window.scrollY - pad)));
    if (Math.abs(y - Math.round(window.scrollY)) < 2){
      if (++calm >= 10){ done(); return; }
    } else {
      calm = 0;
      window.scrollTo(0, y);
    }
    if (++n > 150){ done(); return; }            // 약 2.5초 — 계속 흔들리면 포기
    requestAnimationFrame(fix);
  };
  fix();
  setTimeout(() => { if (my === goSecRun) done(); }, 3000);   // rAF 가 멈춘 경우의 안전핀
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

