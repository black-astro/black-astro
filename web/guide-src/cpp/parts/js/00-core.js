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
  lang:"c++ cpp 씨쁠쁠 기초 문법 컴파일 gcc clang msvc 변수 타입 auto 함수 오버로딩 조건 반복 포인터 참조 레퍼런스 주소 vector string 배열 클래스 생성자 소멸자 상속 가상함수 virtual 헤더 include 네임스페이스 매크로 예외 try catch 치트시트 파이썬비교",
  mod:"현대 modern raii 스마트포인터 unique_ptr shared_ptr weak_ptr 이동 move 복사 rvalue const constexpr stl 컨테이너 map unordered_map 알고리즘 ranges 람다 lambda function 템플릿 template 컨셉 concept optional variant expected string_view 스레드 thread atomic mutex jthread",
  py:"파이썬 python 확장 모듈 바인딩 binding pybind11 nanobind 임포트 import 빌드 setup pyproject scikit-build 타입변환 numpy 배열 제로카피 zerocopy gil 해제 병렬 예외 콜백 callback 스텁 pyi 타입힌트 wheel 성능 가속 c확장",
  node:"node nodejs 애드온 addon napi node-api node-addon-api gyp cmake-js 네이티브 native buffer typedarray 제로카피 비동기 asyncworker promise threadsafefunction objectwrap 클래스 prebuild prebuildify 배포 electron abi 버전 wasm",
  ffi:"ffi c abi extern 맹글링 mangling 심볼 symbol 불투명포인터 opaque 핸들 handle ctypes cffi dll so dylib 공유라이브러리 구조체 struct 정렬 padding 소유권 메모리해제 콜백 에러코드 버전 deno c# 자바 jna go cgo 다른언어",
  build:"빌드 컴파일 링크 링커 cmake cmakelists vcpkg conan fetchcontent 의존성 디버그 릴리즈 최적화 o2 플래그 크로스플랫폼 윈도우 리눅스 맥 wheel cibuildwheel manylinux ci githubactions 정적링크 동적링크 dll의존성 디버거 gdb lldb sanitizer asan ubsan tsan",
  perf:"성능 최적화 벤치마크 benchmark 측정 profiling perf 캐시 cache 메모리레이아웃 aos soa 할당 reserve 풀 복사제거 이동 분기예측 branch simd 벡터화 avx 인트린식 병렬 parallel 스레드 falsesharing 원자연산 atomic 어셈블리 godbolt 파이썬대비 배수",
  deep:"전문가 내부 번역단위 odr 링커 심볼 ub 미정의동작 undefined 수명 lifetime aliasing strict vtable 가상함수비용 예외구현 zerocost 메모리모델 memory_order acquire release 락프리 abi 호환성 소버전 템플릿 인스턴스화 컴파일시간 할당자 allocator 인트린식 어셈블리 크래시덤프 코어덤프 minidump 쓰지말아야",
};

const FIND_CHIPS = ["파이썬에서 부르기","pybind11 첫 모듈","numpy 제로카피","GIL 해제",
                    "Node 애드온","Buffer 복사 없이","ctypes 로 dll","extern C",
                    "CMake 최소","wheel 배포","스마트 포인터","이동 시맨틱",
                    "SIMD 벡터화","캐시 최적화","ABI 호환","세그폴트 디버깅"];
const SEC_KW = {
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
  const list = $(".tw, .scw, .diag", root || document).filter(tw => {
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

