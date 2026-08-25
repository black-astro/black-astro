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
  c:"c 씨 c언어 clang gcc 표준 c17 c11 c99 c23 정수 int32_t stdint size_t 오버플로 배열 포인터 decay 문자열 널종료 strcpy snprintf 버퍼오버플로 malloc free 누수 해제후사용 이중해제 구조체 패딩 정렬 union 비트필드 함수포인터 콜백 qsort 파일 fopen fgets errno 전처리기 매크로 define 인클루드가드 헤더 static extern makefile ub 미정의동작 앨리어싱 c와c++차이 externc",
  lang:"c++ cpp 씨쁠쁠 기초 문법 컴파일 gcc clang msvc 변수 타입 auto 함수 오버로딩 조건 반복 포인터 참조 레퍼런스 주소 vector string 배열 클래스 생성자 소멸자 상속 가상함수 virtual 헤더 include 네임스페이스 매크로 예외 try catch 치트시트 파이썬비교",
  mod:"현대 modern raii 스마트포인터 unique_ptr shared_ptr weak_ptr 이동 move 복사 rvalue const constexpr stl 컨테이너 map unordered_map 알고리즘 ranges 람다 lambda function 템플릿 template 컨셉 concept optional variant expected string_view 스레드 thread atomic mutex jthread",
  py:"파이썬 python 확장 모듈 바인딩 binding pybind11 nanobind 임포트 import 빌드 setup pyproject scikit-build 타입변환 numpy 배열 제로카피 zerocopy gil 해제 병렬 예외 콜백 callback 스텁 pyi 타입힌트 wheel 성능 가속 c확장",
  node:"node nodejs 애드온 addon napi node-api node-addon-api gyp cmake-js 네이티브 native buffer typedarray 제로카피 비동기 asyncworker promise threadsafefunction objectwrap 클래스 prebuild prebuildify 배포 electron abi 버전 wasm",
  ffi:"ffi c abi extern 맹글링 mangling 심볼 symbol 불투명포인터 opaque 핸들 handle ctypes cffi dll so dylib 공유라이브러리 구조체 struct 정렬 padding 소유권 메모리해제 콜백 에러코드 버전 deno c# 자바 jna go cgo 다른언어",
  build:"빌드 컴파일 링크 링커 cmake cmakelists vcpkg conan fetchcontent 의존성 디버그 릴리즈 최적화 o2 플래그 크로스플랫폼 윈도우 리눅스 맥 wheel cibuildwheel manylinux ci githubactions 정적링크 동적링크 dll의존성 디버거 gdb lldb sanitizer asan ubsan tsan",
  perf:"성능 최적화 벤치마크 benchmark 측정 profiling perf 캐시 cache 메모리레이아웃 aos soa 할당 reserve 풀 복사제거 이동 분기예측 branch simd 벡터화 avx 인트린식 병렬 parallel 스레드 falsesharing 원자연산 atomic 어셈블리 godbolt 파이썬대비 배수",
  deep:"전문가 내부 번역단위 odr 링커 심볼 ub 미정의동작 undefined 수명 lifetime aliasing strict vtable 가상함수비용 예외구현 zerocost 메모리모델 memory_order acquire release 락프리 abi 호환성 소버전 템플릿 인스턴스화 컴파일시간 할당자 allocator 인트린식 어셈블리 크래시덤프 코어덤프 minidump 쓰지말아야",
  setup:"설치 세팅 환경설정 환경세팅 셋업 setup install 인스톨 처음 시작 초보 입문 컴파일러 compiler msvc cl.exe 비주얼스튜디오 visual studio build tools 빌드툴 gcc g++ mingw msys2 msys ucrt64 ucrt clang llvm clang-cl wsl wsl2 우분투 ubuntu 리눅스 linux 맥 macos mac xcode homebrew brew apt dnf pacman cmake ninja make 빌드 build 패키지 package vcpkg conan 콘안 fmt 라이브러리 vscode 브이에스코드 clangd cpptools intellisense 자동완성 clion 씨라이온 디버깅 debug gdb lldb path 패스 환경변수 environment variable 시스템변수 사용자변수 setx where which 프로파일 profile powershell 파워쉘 터미널 clang-format clang-tidy cppcheck sanitizer asan ubsan tsan 경고 warning werror pybind11 nanobind node-gyp 파이썬헤더 python3-dev 확장모듈 pyd dll lnk2019 lnk2038 c1083 undefined reference 에러 오류 안됨 못찾음 인식되지않습니다 not recognized 트러블슈팅 troubleshooting 진단",
  srv:"서버 백엔드 backend api rest restful http https 웹서버 web server drogon 드로곤 crow 크로우 cpp-httplib httplib userver 유저버 uwebsockets beast boost.beast oatpp oat++ pistache seastar 프레임워크 framework techempower 벤치마크 asio boost.asio io_context strand coroutine 코루틴 co_await awaitable 비동기 async 이벤트루프 eventloop epoll iocp kqueue 스레드풀 threadpool websocket 웹소켓 ws wss 소켓 socket tcp tls ssl openssl json 제이슨 nlohmann simdjson glaze rapidjson jsoncpp boostjson reflect-cpp 직렬화 serialize 역직렬화 deserialize 파싱 parse db database 데이터베이스 postgresql 포스트그레스 postgres libpqxx mysql connector sqlite sqlitecpp redis 레디스 redis-plus-plus 커넥션풀 connectionpool orm mapper prepared statement 트랜잭션 transaction 마이그레이션 migration dbmate flyway grpc 지알피씨 protobuf 프로토버프 proto protoc 스트리밍 streaming 스텁 stub jwt jwt-cpp 토큰 token 인증 authentication 인가 authorization argon2 argon2id bcrypt 비밀번호 password 해시 hash cors 레이트리밋 ratelimit nginx 엔진엑스 리버스프록시 reverseproxy 로드밸런서 spdlog 로깅 logging 로그 log 구조화로그 toml toml++ 설정 config 환경변수 env prometheus 프로메테우스 prometheus-cpp 메트릭 metrics grafana opentelemetry otel 트레이싱 tracing jaeger tempo 관측 observability healthz readyz 헬스체크 googletest gtest catch2 테스트 test 통합테스트 wrk oha bombardier k6 ghz ab 부하테스트 loadtest benchmark 구글벤치마크 p99 백분위수 percentile 튜닝 tuning keepalive jemalloc tcmalloc asan ubsan tsan 새니타이저 sanitizer 퍼징 fuzzing 도커 docker dockerfile 멀티스테이지 multistage distroless alpine scratch 정적링크 static 배포 deploy systemd 유닛 github actions ci cd vcpkg cmake ccache 캐시 cache 이미지크기 그레이스풀 graceful shutdown 쿠버네티스 kubernetes k8s 프로브 probe url단축 shortener base62 리다이렉트 redirect 302 fastapi 파스트에이피아이 spring springboot 스프링부트 uvicorn 비교 대조",
  game:"게임서버 게임 서버 game server 온라인게임 멀티플레이 멀티플레이어 multiplayer 넷코드 netcode 틱 tick 틱레이트 tickrate 게임루프 gameloop IOCP 아이오씨피 epoll 이폴 io_uring 아이오유링 asio 아시오 boost.asio UDP 유디피 TCP 티씨피 신뢰UDP reliable ENet 이넷 KCP GameNetworkingSockets yojimbo QUIC 패킷 packet 직렬화 serialization 프로토버프 protobuf flatbuffers 플랫버퍼 제로카피 엔디안 endian 세션 session 스트랜드 strand 액터 actor 잡큐 jobqueue 워커 worker 존 zone 채널 channel AoI 관심영역 예측 prediction 클라이언트예측 리컨실리에이션 reconciliation 보간 interpolation 지연보상 lagcompensation 롤백넷코드 rollback 스냅샷 snapshot 델타압축 delta 양자화 quantization 매치메이킹 matchmaking 매칭 대기열 큐 MMR 엘로 elo trueskill glicko 레디스 redis 랭킹 leaderboard sortedset 파티 로비 lobby 언리얼 unreal UE5 데디케이티드 dedicated 리플리케이션 replication RPC 게임모드 gamemode gamestate 치트 cheat 핵 anticheat 안티치트 검증 authoritative 서버권위 암호화 DTLS TLS 재생공격 replay 봇탐지 부하테스트 loadtest 봇클라 CCU 동접 크래시덤프 minidump coredump 핫리로드 hotreload 오토스케일 autoscale agones k8s 쿠버네티스 도커 docker 드레인 drain 언리얼서버 게임백엔드 실시간서버 fps서버 mmo서버 mmorpg 모바",
  hpc:"고성능 하이퍼포먼스 HPC 시스템프로그래밍 저지연 low latency 로우레이턴시 HFT 고빈도거래 초저지연 마이크로초 나노초 락프리 lockfree 무잠금 링큐 ring buffer SPSC MPMC memory_order 아토믹 atomic ABA hazard pointer 아레나 arena 풀할당자 pool allocator PMR memory_resource huge page 휴지페이지 NUMA mimalloc jemalloc tcmalloc 단편화 fragmentation 병렬 parallel OpenMP oneTBB TBB execution par_unseq 스케일링 암달 Amdahl 루프라인 roofline STREAM 대역폭 bandwidth GPU CUDA nvcc 커널 kernel Thrust SYCL HIP ROCm cuBLAS TensorRT 그리드 블록 warp OpenCV FFmpeg libav 디코딩 decode 인코딩 NVDEC VAAPI 영상 이미지 비디오 오디오 audio 실시간 realtime JUCE PortAudio 콜백 callback xrun 링버퍼 io_uring liburing mmap O_DIRECT 다이렉트IO 페이지캐시 fsync fdatasync DPDK XDP AF_XDP RDMA 커널바이패스 kernel bypass 제로카피 zerocopy Arrow Parquet DuckDB 컬럼지향 columnar 열지향 SIMD AVX2 AVX512 인트린식 intrinsics 판다스 pandas polars ONNX onnxruntime llama.cpp GGML GGUF 양자화 quantization 추론 inference LLM 토크나이저 tokenizer LTO PGO BOLT march native unity build 유니티빌드 ccache mold ninja 모듈 modules ftime-trace 빌드시간 컴파일시간 프로파일링 profiling perf 플레임그래프 flamegraph VTune Tracy valgrind cachegrind callgrind heaptrack bpftrace eBPF WPA ETW IPC 캐시미스 분기예측 affinity isolcpus nohz_full rdtsc 히스토그램 p99 p999 꼬리지연 tail latency",
};

const FIND_CHIPS = ["파이썬에서 부르기","pybind11 첫 모듈","numpy 제로카피","GIL 해제",
                    "Node 애드온","Buffer 복사 없이","ctypes 로 dll","extern C",
                    "CMake 최소","wheel 배포","스마트 포인터","이동 시맨틱",
                    "SIMD 벡터화","캐시 최적화","ABI 호환","세그폴트 디버깅"];
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
  /* 하려는 일을 한글로 쳤을 때 걸리게 하는 보강 키워드 */
  x01:"컴파일 실행 gcc g++ clang msvc 빌드 첫프로그램 hello main 링크 실행파일 인터프리터차이",
  x02:"변수 타입 int double bool auto 선언 초기화 형변환 캐스팅 static_cast 정수오버플로",
  x03:"함수 정의 선언 오버로딩 기본인자 인라인 반환 여러값 tuple 구조적바인딩",
  x04:"조건 if switch 반복 for while 범위기반 range 순회 continue break",
  x05:"포인터 참조 주소 널 nullptr 역참조 댕글링 스택 힙 new delete 메모리",
  x06:"vector 배열 string 문자열 크기 push_back 인덱스 반복 파이썬리스트",
  x07:"클래스 struct 생성자 소멸자 멤버 접근제어 public private this 초기화리스트",
  x08:"상속 가상함수 virtual override 다형성 추상 인터페이스 소멸자가상",
  x09:"헤더 소스 분리 include 가드 pragma once 선언 정의 중복정의 링크에러",
  x10:"네임스페이스 namespace using 전처리기 매크로 define ifdef 조건부컴파일",
  x11:"예외 try catch throw noexcept 에러코드 반환값 자원누수",
  x12:"치트시트 대조표 파이썬 자바 비교 문법대응 옮기기 번역",
  m01:"raii 자원관리 소멸자 자동해제 lock_guard scope_exit 예외안전 with문",
  m02:"스마트포인터 unique_ptr shared_ptr weak_ptr make_unique 순환참조 소유권",
  m03:"이동 move 복사 rvalue 우측값 이동생성자 std::move 복사생략 rvo 성능",
  m04:"const 상수 constexpr consteval 컴파일타임 불변 const멤버함수",
  m05:"컨테이너 vector list map unordered_map set deque 선택 성능비교 캐시",
  m06:"알고리즘 sort find transform accumulate ranges views 파이프 반복자 iterator",
  m07:"람다 lambda 캡처 클로저 function 콜백 정렬기준 mutable",
  m08:"템플릿 template 제네릭 타입추론 특수화 가변인자 typename",
  m09:"컨셉 concept requires 제약 템플릿에러 sfinae c++20",
  m10:"optional variant expected 널 없음 오류처리 monadic value_or visit",
  m11:"string_view 복사없음 문자열 슬라이스 파싱 수명 위험 substr",
  m12:"스레드 thread jthread mutex lock atomic 동시성 데이터경쟁 병렬",
  y01:"왜 c++ 판단기준 프로파일 병목 언제 대안 numpy cython 비용 유지보수",
  y02:"pybind11 첫모듈 hello 예제 PYBIND11_MODULE def 최소구성 import",
  y03:"빌드 scikit-build-core pyproject cmake pip install editable 패키징",
  y04:"타입변환 자동 list vector dict map 복사 stl 캐스터 py::cast",
  y05:"클래스 바인딩 py::class_ 생성자 속성 property repr 상속 수명",
  y06:"numpy 배열 array_t 버퍼 제로카피 스트라이드 shape 인플레이스 eigen",
  y07:"gil 해제 gil_scoped_release 병렬 멀티스레드 openmp 진짜병렬 코어",
  y08:"예외 변환 register_exception valueerror 파이썬예외 에러전달",
  y09:"콜백 파이썬함수 py::function gil_scoped_acquire 진행률 이벤트",
  y10:"타입힌트 pyi 스텁 stubgen 자동완성 mypy 문서화 docstring",
  y11:"nanobind 이전 마이그레이션 크기 빌드시간 성능비교 차이",
  y12:"실패 세그폴트 import에러 undefined symbol 느림 디버깅 흔한실수",
  j01:"애드온 wasm 별도프로세스 비교 선택 언제 네이티브 필요한가",
  j02:"node-addon-api 첫모듈 napi require binding.gyp 최소구성",
  j03:"빌드 node-gyp cmake-js 설정 컴파일 리빌드 electron-rebuild",
  j04:"값변환 number string object array 변환비용 napi_value",
  j05:"buffer typedarray 제로카피 arraybuffer 이미지 오디오 대용량",
  j06:"비동기 asyncworker 이벤트루프 블로킹 백그라운드 스레드",
  j07:"promise deferred threadsafefunction tsfn 스레드안전 콜백",
  j08:"클래스 objectwrap new 인스턴스 gc 수명 finalize",
  j09:"prebuild prebuildify 배포 바이너리 멀티플랫폼 설치 컴파일러없이",
  j10:"electron abi 버전 node_module_version 재빌드 호환 깨짐",
  f01:"c abi 공용어 왜 언어간 연동 표준 인터페이스 안정",
  f02:"extern c 맹글링 데코레이션 심볼 nm dumpbin undefined reference",
  f03:"불투명포인터 opaque handle create destroy api설계 캡슐화",
  f04:"ctypes 파이썬 dll so 로드 argtypes restype 구조체 포인터",
  f05:"cffi 구조체 정렬 padding pack 바이트 레이아웃 호환",
  f06:"node ffi-napi koffi deno ffi dlopen 컴파일없이",
  f07:"문자열 메모리 소유권 free 누수 이중해제 규약 버퍼전달",
  f08:"콜백 함수포인터 c abi 등록 사용자데이터 userdata 스레드",
  f09:"에러코드 반환 errno 버전 구조체 확장 하위호환 api버전",
  f10:"c# dllimport 자바 jna jni go cgo 다른언어 재사용",
  b01:"컴파일 링크 전처리 오브젝트 심볼 에러구분 undefined reference",
  b02:"cmake cmakelists add_library target_link_libraries 최소 예제",
  b03:"vcpkg conan fetchcontent find_package 의존성 서드파티",
  b04:"디버그 릴리즈 o0 o2 o3 최적화 플래그 ndebug 성능차이",
  b05:"윈도우 리눅스 맥 차이 msvc 경로 dll so dylib 크로스",
  b06:"wheel cibuildwheel manylinux 배포 pypi 바이너리 abi3",
  b07:"ci githubactions 매트릭스 3os 자동빌드 릴리즈 태그",
  b08:"정적링크 동적링크 dll없음 runtime 재배포 ldd dependency",
  b09:"디버거 gdb lldb visualstudio 브레이크포인트 스택 코어",
  b10:"sanitizer asan ubsan tsan msan 메모리오류 경쟁 valgrind",
  e01:"벤치마크 측정 google-benchmark 워밍업 노이즈 통계 재현",
  e02:"캐시 메모리레이아웃 aos soa 지역성 프리페치 cacheline",
  e03:"할당 reserve 메모리풀 arena 재사용 스파이크 지연",
  e04:"복사제거 값전달 참조 이동 rvo 불필요복사 찾기",
  e05:"분기예측 branch misprediction 브랜치리스 조건제거 likely",
  e06:"simd 벡터화 avx sse 자동벡터화 인트린식 병렬연산",
  e07:"병렬 execution par 스레드 나누기 동기화비용 스케일",
  e08:"false sharing 캐시라인 원자연산 atomic 경합 패딩",
  e09:"어셈블리 godbolt 컴파일러출력 최적화확인 인라인",
  e10:"파이썬대비 배수 실측 numpy비교 현실적 기대치",
  d01:"번역단위 odr 링커 심볼 중복정의 inline static 내부링키지",
  d02:"ub 미정의동작 최적화삭제 널체크 오버플로 위험",
  d03:"수명 lifetime aliasing strict restrict 최적화가정",
  d04:"vtable 가상호출 비용 인라인 devirtualization final",
  d05:"예외구현 zerocost 테이블 언와인딩 비용 noexcept",
  d06:"메모리모델 memory_order acquire release seq_cst 락프리 재배치",
  d07:"abi 호환성 버전 심볼 소버전 표준라이브러리 배포 벽",
  d08:"템플릿 인스턴스화 컴파일시간 extern template 바이너리크기",
  d09:"할당자 allocator pmr 메모리리소스 커스텀 아레나",
  d10:"인트린식 어셈블리 asm 이식성 마지막수단",
  d11:"크래시덤프 코어덤프 minidump 분석 심볼 스택복원",
  d12:"쓰지말아야 대안 판단 유지보수 팀비용 러스트 파이썬",
  s01:"컴파일러 선택 msvc gcc clang 차이 비교 abi 런타임 ucrt msvcrt libstdc++ libc++ 맹글링 cl.exe g++ clang++ clang-cl godbolt 버전 v14.4x gcc15 llvm20 섞어쓰기 확장모듈",
  s02:"visual studio build tools community 설치 다운로드 워크로드 데스크톱개발 windows sdk vcvars64 vcvarsall 개발자명령프롬프트 x64 native tools vswhere entervsdevshell winget cl.exe include lib 환경 확인",
  s03:"msys2 설치 pacman syu toolchain mingw-w64-ucrt-x86_64 ucrt64 mingw64 clang64 msys 셸 구분 path 등록 환경변수 gcc g++ gdb 확인 cygpath 업데이트 접두사 libstdc++ dll 정적링크",
  s04:"llvm clang 설치 releases.llvm.org winget clang-cl lld-link clangd clang-format wsl wsl2 우분투 ubuntu 설치 build-essential 가상화 hyper-v 0x80370102 mnt 느림 remote-wsl vhdx 언제쓰나",
  s05:"macos 맥 xcode command line tools xcode-select homebrew brew llvm gcc-15 ubuntu debian apt build-essential cmake ninja gdb fedora dnf development tools arch pacman base-devel alpine musl 컨테이너 도커 devel 헤더 패키지 update-alternatives ppa",
  s06:"cmake 설치 path 체크박스 ninja 설치 cmakelists 최소 예제 add_executable target_compile_options 구성 configure generate 빌드 build_type release debug 생성기 generator 멀티구성 cmakepresets presets fresh cmakecache 삭제 compile_commands",
  s07:"vcpkg 설치 bootstrap vcpkg_root manifest 매니페스트 vcpkg.json baseline overrides toolchain cmake_toolchain_file 트리플릿 triplet static-md x64-windows fmt 예제 find_package target_link_libraries conan conanfile profile detect cmakedeps cmaketoolchain fetchcontent 비교",
  s08:"vscode 설치 확장 cpptools cmake-tools clangd codelldb settings.json launch.json tasks.json cppvsdbg cppdbg lldb 디버깅 f5 중단점 킷 kit scan for kits compile_commands 자동완성 인텔리센스 .clangd visual studio 폴더열기 clion 무료 툴체인",
  s09:"clang-format .clang-format 스타일 clang-tidy .clang-tidy checks run-clang-tidy cppcheck 정적분석 sanitizer asan ubsan tsan msan fsanitize address undefined 경고 wall wextra wpedantic werror w4 utf-8 c4819 pre-commit ci 자동화 valgrind",
  s10:"python.h 파이썬헤더 python3-dev python3-devel sysconfig include libs python313.lib pybind11 nanobind cmakedir pybind11_add_module scikit-build-core pyproject 휠 wheel cibuildwheel node-gyp binding.gyp node-addon-api napi msvs_version cmake-js dll load failed 오류",
  s11:"path 환경변수 사용자변수 시스템변수 순서 충돌 where which type -a get-command 터미널 재시작 vscode 환경 setx 위험 백업 powershell 프로필 profile bashrc zshrc zprofile cc cxx cmake_prefix_path vcpkg_root ld_library_path include lib 진단",
  s12:"오류 에러 해결 트러블슈팅 not recognized 인식되지않습니다 cl 못찾음 c1083 lnk2019 lnk2038 lnk1104 lnk1112 undefined reference 0xc000007b vcruntime140 libstdc++-6.dll glibc cmakecache 컴파일러 바뀜 fresh vcvars 안먹힘 vscmd_ver 한글경로 공백 260자 longpaths 백신 defender 제외 권한 doctor 진단스크립트",
  w01:"언제쓰나 판단 기준 선택 프레임워크 지도 비교 drogon userver crow cpp-httplib uwebsockets beast oatpp pistache seastar techempower 순위 rps 지연 p99 fastapi spring 대조 코어계산 병목",
  w02:"cpp-httplib httplib 첫서버 hello vcpkg 매니페스트 cmake 툴체인 curl json nlohmann 라우팅 정규식 스레드풀 블로킹 keepalive 타임아웃 cors 정적파일 mount",
  w03:"drogon 드로곤 drogon_ctl 컨트롤러 httpcontroller 라우팅 add_method_to 매크로 필터 httpfilter 어드바이스 advice config.json 이벤트루프 threads_num 코루틴 task co_await execsqlcoro orm mapper 세션 예외처리 spring 대응표",
  w04:"asio boost.asio io_context executor strand awaitable co_await co_spawn use_awaitable detached 스레드풀 hardware_concurrency work_guard 에코서버 tcp acceptor 타임아웃 parallel_group 취소 cancellation 수명 shared_from_this epoll iocp",
  w05:"beast boost.beast websocket 웹소켓 업그레이드 upgrade 101 핸드셰이크 프레임 ping pong close is_upgrade prepare_payload flat_buffer 브로드캐스트 채팅방 송신큐 strand tls wss ssl openssl 자체서명 인증서 백프레셔",
  w06:"json 제이슨 nlohmann glaze simdjson rapidjson boostjson jsoncpp reflect-cpp 직렬화 역직렬화 구조체매핑 리플렉션 매크로 nlohmann_define_type 온디맨드 ondemand padded_string string_view 성능 벤치 검증 validation pydantic 422 dto",
  w07:"db database 커넥션풀 connection_number 풀크기 max_connections pgbouncer libpqxx pqxx exec_params prepared 트랜잭션 rollback copy stream_to mysql connector sqlite sqlitecpp wal redis redis-plus-plus 캐시 타임아웃 statement_timeout n+1 조인 마이그레이션 dbmate flyway",
  w08:"grpc protobuf proto protoc 플러그인 grpc_cpp_plugin 코드생성 cmake protobuf_generate 서비스 스텁 callbackservice serverunaryreactor serverwritereactor 스트리밍 단항 양방향 리플렉션 grpcurl ghz 데드라인 메타데이터 keepalive 헬스체크 grpc-web envoy 파이썬 자바 클라이언트 필드번호 reserved",
  w09:"인증 authentication 인가 jwt jwt-cpp hs256 rs256 토큰 만료 리프레시 블랙리스트 jti argon2 argon2id bcrypt libsodium 비밀번호 해시 솔트 cors 프리플라이트 화이트리스트 nginx 리버스프록시 tls종료 x-forwarded-for 레이트리밋 limit_req 상수시간비교 sql인젝션 asan 퍼징 체크리스트",
  w10:"spdlog 로깅 비동기로거 rotating 구조화로그 json로그 패턴 fmt toml toml++ 설정 config 환경변수 12factor prometheus prometheus-cpp exposer registry counter histogram gauge 라벨 카디널리티 grafana opentelemetry otlp span 트레이스 jaeger tempo healthz readyz liveness readiness version 요청id",
  w11:"테스트 googletest gtest 파라미터테스트 catch2 통합테스트 drogon_test httpclient ctest 부하테스트 wrk oha bombardier k6 ghz ab 루아 백분위수 p50 p90 p99 지연 처리량 rps google benchmark donotoptimize 튜닝 스레드수 keepalive ulimit somaxconn jemalloc tcmalloc perf asan ubsan tsan 새니타이저 퍼징 libfuzzer",
  w12:"배포 deploy docker dockerfile 멀티스테이지 multistage builder distroless alpine musl scratch 정적링크 static strip gc-sections 이미지크기 dockerignore buildkit buildx systemd 유닛 limitnofile github actions ci 서비스컨테이너 vcpkg 바이너리캐시 ccache 그레이스풀 sigterm 쿠버네티스 readiness liveness prestop 502",
  w13:"실전 프로젝트 url단축 shortener base62 코드생성 리다이렉트 302 location 스키마 마이그레이션 repo 계층 캐시 redis ttl 적중률 배치 hincrby 조회수 컨트롤러 조립 docker-compose postgres redis migrate dbmate 부하비교 fastapi uvicorn rps 메모리 rss 콜드스타트 회고",
  n01:"전용서버 dedicated 릴레이 relay P2P 로비 매치 게임룸 DB서버 MMO 존 채널 틱레이트 photon nakama playfab gamelift 서버권위 authoritative 구성도 장르별",
  n02:"틱루프 gameloop 고정틱 fixedtimestep steady_clock 따라잡기 catchup 데스스파이럴 오버런 시뮬틱 전송틱 sleep 스핀 타이머해상도 방워커 affinity 틱통계 p99",
  n03:"TCP UDP HOL 머리막힘 headofline 신뢰UDP ENet KCP GameNetworkingSockets yojimbo QUIC webtransport websocket seq ack 비트필드 재전송 RTT keepalive NAT",
  n04:"패킷 헤더 길이접두사 프레이밍 framing 스트림분할 링버퍼 엔디안 byteswap protobuf flatbuffers 제로카피 verifier 디스패치 메시지id 프로토콜해시 버전호환",
  n05:"IOCP GetQueuedCompletionStatus WSARecv overlapped epoll io_uring proactor reactor asio strand shared_from_this weak_ptr nodelay nagle 하트비트 타임아웃 재접속 세션수명",
  n06:"스레드모델 잡큐 jobqueue 액터 actor 메시지큐 뮤텍스 scoped_lock 락순서 교착 deadlock 존 zone 채널 그리드 AoI 관심영역 병렬화 워커풀 swap트릭",
  n07:"넷코드 netcode 클라이언트예측 prediction 리컨실리에이션 reconciliation 재적용 resimulation 보간 interpolation 외삽 extrapolation 지연보상 lagcompensation 되감기 rewind 히트박스 스냅샷 델타압축 양자화 ack_input 롤백넷코드 GGPO 고무줄",
  n08:"매치메이킹 matchmaking 대기열 큐 ZSET sortedset redis 밴드확장 MMR elo trueskill glicko 랭킹 leaderboard 파티 초대 pubsub 티켓 getdel 재접속 중복매칭 매칭품질",
  n09:"DB 영속화 저장 writebehind 지연쓰기 더티플래그 dirty 배치 upsert 트랜잭션 mysql postgresql 커넥션풀 워커스레드 아이템복사 복사버그 원장 ledger 멱등키 소유권잠금 setnx TTL",
  n10:"언리얼 unreal UE5 dedicated 전용서버 targetrules buildcookrun 리플리케이션 replication DOREPLIFETIME OnRep RPC serverrpc clientrpc netmulticast withvalidation hasauthority gamemode gamestate playerstate playercontroller iris pushmodel netcull netupdatefrequency",
  n11:"치트 cheat 핵 스피드핵 월핵 에임봇 안티치트 anticheat EAC battleye 서버검증 authoritative 속도상한 쿨다운 사거리 소유권 ratelimit 토큰버킷 재생공격 replay nonce DTLS TLS mTLS 봇탐지 감사로그 audit 리플레이 밴",
  n12:"부하테스트 loadtest 봇클라이언트 램프업 CCU 동접 지표 metrics prometheus grafana 틱p99 오버런 대역폭 큐적체 perf flamegraph 크래시덤프 minidump coredump 심볼 breakpad crashpad 무중단배포 드레인 drain SIGTERM agones k8s 오토스케일 핫리로드",
  n13:"실전프로젝트 아레나 arena 2D 탑다운 대전 폴더구조 cmake vcpkg flatbuffers asio 룸 틱루프 델타스냅샷 redis티켓 mysql docker compose 멀티스테이지 결정성테스트 골든트레이스 부하테스트 로드맵",
  h01:"분야 지도 HFT 게임엔진 언리얼 브라우저 크로미움 데이터베이스 클릭하우스 임베디드 러스트 비교 Rust Go Zig 판정기준 네이티브 CISA 메모리안전 새니타이저 ASan UBSan",
  h02:"저지연 틱투트레이드 핫패스 할당금지 예외금지 시스템콜 rdtsc rdtscp 히스토그램 p999 코어고정 affinity isolcpus nohz_full SCHED_FIFO 바쁜대기 busy poll SO_BUSY_POLL 커널바이패스 DPDK ef_vi 캐시워밍",
  h03:"락프리 lockfree SPSC MPMC 링큐 ringbuffer 원자 atomic memory_order acquire release relaxed seq_cst ABA hazard pointer Vyukov 캐시라인 false sharing TSan 스레드새니타이저 folly moodycamel boost lockfree rigtorp",
  h04:"아레나 arena bump 할당자 allocator 풀 pool PMR memory_resource monotonic_buffer 표준컨테이너 huge page THP madvise mlockall NUMA numactl first-touch libnuma mimalloc jemalloc tcmalloc LD_PRELOAD 단편화 heaptrack massif malloc_trim",
  h05:"병렬 parallel OpenMP pragma reduction schedule collapse oneTBB parallel_for parallel_reduce blocked_range flow graph execution par par_unseq transform_reduce 스레드수 hardware_concurrency cgroup 쿠버네티스 스케일링 암달 Amdahl 연산강도 루프라인 roofline STREAM 대역폭 likwid advisor",
  h06:"GPU CUDA nvcc 커널 kernel blockIdx threadIdx grid block warp cudaMalloc cudaMemcpy 스트림 stream pinned 통합메모리 unified Thrust CUB stdpar SYCL oneAPI HIP ROCm hipify Metal Vulkan compute nsys ncu Nsight occupancy 공유메모리 타일링 cuBLAS PCIe 손익분기",
  h07:"영상 비디오 이미지 OpenCV cv::Mat vcpkg VideoCapture Canny LUT ROI FFmpeg libav avformat avcodec swscale AVPacket AVFrame linesize YUV BGR 하드웨어디코더 NVDEC VAAPI VideoToolbox QSV NVENC GStreamer DeepStream 무복사 zerocopy 다중스트림 파이썬비교",
  h08:"오디오 audio 실시간 realtime 콜백 callback PortAudio JUCE VST3 processBlock prepareToPlay 데드라인 xrun 버퍼크기 지연 latency 링버퍼 atomic 더블버퍼 SmoothedValue 딜레이 DSP 비정규수 denormal FTZ DAZ ScopedNoDenormals RealtimeSanitizer nonblocking PipeWire JACK mlockall",
  h09:"IO 고속 io_uring liburing SQ CQ 제출큐 완료큐 SQPOLL 큐깊이 mmap madvise MADV_WILLNEED SIGBUS munmap O_DIRECT posix_memalign 정렬 페이지캐시 fsync fdatasync 그룹커밋 내구성 DPDK AF_XDP XDP eBPF RDMA RoCE ethtool RSS TCP_NODELAY SO_REUSEPORT 커널바이패스",
  h10:"데이터 엔진 컬럼지향 열지향 columnar Arrow Parquet Table Array compute Sum Filter row group 푸시다운 DuckDB 임베딩 SQL read_parquet 벡터화 실행모델 selection vector SIMD AVX2 누산기 마스크 std::simd xsimd Highway 판다스 pandas polars ClickHouse pybind11 C데이터인터페이스",
  h11:"추론 inference ML 머신러닝 ONNX onnxruntime Ort::Session 프로바이더 TensorRT FP16 INT8 OpenVINO CoreML IO바인딩 배치 batching llama.cpp GGML GGUF 양자화 Q4_K_M Q5 KV캐시 prefill decode 토큰 tokenizer SentencePiece tokenizers-cpp 대역폭 TTFT TPS vLLM ExecuTorch TFLite",
  h12:"LTO ThinLTO IPO INTERPROCEDURAL_OPTIMIZATION PGO fprofile-generate fprofile-use profdata 샘플PGO BOLT march native mtune x86-64-v3 target_clones IFUNC 디스패치 ffast-math 빌드시간 ftime-trace ClangBuildAnalyzer IWYU ccache sccache mold lld ninja 유니티빌드 unity build 미리컴파일헤더 PCH 모듈 modules import std gc-sections strip bloaty",
  h13:"프로파일링 profiling perf perf stat perf record 플레임그래프 flamegraph FlameGraph stackcollapse IPC 캐시미스 분기예측실패 topdown Backend Bound perf c2c offcputime bpftrace eBPF 연속프로파일링 Parca Pyroscope Tracy ZoneScoped VTune valgrind cachegrind callgrind kcachegrind heaptrack WPA WPR ETW Superluminal 체크리스트 벤치마크 재현성 taskset cpupower simdjson pmr 사례",
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

