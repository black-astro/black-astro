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
   그룹 순서: 1 // 주석 · 2 어트리뷰트 · 3 # 주석 · 4 라이프타임 · 5 문자열
             · 6 키워드 · 7 매크로 · 8 타입 · 9 메서드 · 10 숫자

   Rust 전용으로 손본 곳 —
     · #[derive(...)] 같은 어트리뷰트를 애너테이션 색으로 (가장 먼저 눈에 들어와야 한다)
     · 라이프타임 'a 를 문자열보다 앞에서 잡는다. 안 그러면 &'a str … &'a 가
       통째로 문자열로 물들어 코드가 읽히지 않는다
     · println! 처럼 ! 로 끝나는 매크로를 함수 색으로
     · 이 가이드는 파이썬·bash 예제도 많아 # 주석과 def·import 도 함께 넣었다 */
const JV_RE = /(\/\/[^\n]*)|(#!?\[[^\]\n]*\])|(#[^\n]*)|('(?:[a-z_]\w*)\b(?!'))|("[^"\n]*"|'[^'\n]*')|\b(as|async|await|break|const|continue|crate|dyn|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|true|type|union|unsafe|use|where|while|macro_rules|def|import|from|class|print|None|not|and|or|is|lambda|function|var|new|null|undefined|export|require)\b|\b([a-z_]\w*!)|\b([A-Z][A-Za-z0-9]*)\b|\.([a-z_]\w*)(?=\()|\b(\d[\d_]*\.?\d*(?:[iuf](?:8|16|32|64|128|size))?)\b/g;

/* root를 받아 '보이는 탭'만 처리 — 초기 로딩 비용을 1/9로 */
function highlight(root){
  $$("pre.code code", root || document).forEach(el => {
    if (el.dataset.hl) return;
    el.dataset.hl = "1";
    let s = el.textContent
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    s = s.replace(JV_RE, (m, com, attr, hcom, life, str, kw, mac, typ, fn, num) => {
      if (com)  return `<span class="t-com">${com}</span>`;
      if (attr) return `<span class="t-ann">${attr}</span>`;
      if (hcom) return `<span class="t-com">${hcom}</span>`;
      if (life) return `<span class="t-mod">${life}</span>`;
      if (str)  return `<span class="t-str">${str}</span>`;
      if (kw)   return `<span class="t-kw">${kw}</span>`;
      if (mac)  return `<span class="t-fn">${mac}</span>`;
      if (typ)  return `<span class="t-mod">${typ}</span>`;
      if (fn)   return `.<span class="t-fn">${fn}</span>`;
      if (num)  return `<span class="t-num">${num}</span>`;
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
  lang:"rust 러스트 기초 문법 cargo 카고 rustup 컴파일 빌드 변수 불변 mut 타입 함수 식 표현식 조건 반복 match 패턴매칭 소유권 이동 move vec 벡터 string 문자열 슬라이스 구조체 struct impl 메서드 열거형 enum option 널 모듈 mod crate use 제네릭 테스트 test 문서주석 치트시트 파이썬비교 c++비교",
  own:"소유권 ownership 빌림 borrow 참조 reference 라이프타임 lifetime 대여검사기 borrowck 슬라이스 트레이트 trait 인터페이스 impl 트레이트객체 dyn 제네릭 정적디스패치 동적디스패치 deref drop 연산자오버로딩 result 에러처리 물음표연산자 thiserror anyhow box rc arc refcell 내부가변성 클로저 closure fn fnmut fnonce 이터레이터 iterator 지연평가 collect",
  py:"파이썬 python 확장 모듈 바인딩 binding pyo3 maturin 임포트 import 빌드 pyproject wheel 타입변환 numpy ndarray 제로카피 zerocopy gil 해제 rayon 병렬 에러 예외 콜백 callback 스텁 pyi 타입힌트 abi3 안정abi 성능 가속 c확장 cython비교",
  node:"node nodejs 애드온 addon napi napi-rs 네이티브 native buffer typedarray 제로카피 비동기 asynctask tokio promise threadsafefunction 클래스 napi객체 wasm webassembly wasm-bindgen wasm-pack 브라우저 번들 크기 twiggy prebuild 배포 electron 플랫폼",
  ffi:"ffi c abi extern no_mangle 맹글링 심볼 repr repr_c 구조체 레이아웃 cbindgen 헤더생성 bindgen c라이브러리 ctypes cffi dll so dylib 공유라이브러리 cdylib staticlib 문자열 cstring cstr 소유권 메모리해제 콜백 함수포인터 패닉 catch_unwind unwind 에러코드 c# 자바 jna go cgo 다른언어",
  build:"빌드 cargo cargo.toml 매니페스트 의존성 dependencies 버전 semver lock 크레이트 crates.io feature 피처 기능플래그 워크스페이스 workspace 프로파일 profile 릴리즈 lto codegen-units 최적화 크로스컴파일 cross target 타깃 ci githubactions maturin 배포 publish clippy rustfmt 문서 rustdoc 바이너리크기 빌드시간 sccache",
  perf:"성능 최적화 벤치마크 benchmark criterion 측정 프로파일링 flamegraph perf 할당 clone 복사 to_string 이터레이터 제로코스트 캐시 메모리레이아웃 aos soa rayon 병렬 par_iter send sync 스레드 thread 채널 channel mpsc mutex rwlock async tokio 런타임 async_std simd 벡터화 파이썬대비 c++대비 배수",
  deep:"전문가 unsafe 안전하지않은 ub 미정의동작 원시포인터 raw pointer nonnull 정렬 alignment 프로버넌스 maybeuninit 초기화 pin 자기참조 메모리모델 ordering atomic 락프리 miri 검증 안전추상화 불변식 invariant 매크로 macro_rules proc_macro derive 절차매크로 mir 단형화 monomorphization 컴파일과정 abi 안정성 불안정 쓰지말아야",
};

const FIND_CHIPS = ["파이썬에서 부르기","PyO3 첫 모듈","maturin 빌드","numpy 제로카피",
                    "GIL 해제","rayon 병렬화","Node 애드온","WASM 만들기",
                    "소유권 규칙","빌림 에러","Result 와 ?","라이프타임",
                    "C ABI 로 내보내기","cbindgen 헤더","unsafe 언제","C++ 와 비교"];
const SEC_KW = {
  /* 하려는 일을 한글로 쳤을 때 걸리게 하는 보강 키워드 */
  r01:"설치 rustup cargo new run build 첫프로그램 hello main 컴파일 실행 인터프리터차이 툴체인",
  r02:"변수 let mut 불변 가변 타입 i32 f64 bool char 섀도잉 shadowing 형변환 as 오버플로",
  r03:"함수 fn 반환 식 표현식 세미콜론 튜플 여러값 반환 구조분해",
  r04:"조건 if else 반복 for while loop 범위 range match 패턴매칭 빠짐없이 exhaustive",
  r05:"소유권 이동 move 복사 copy clone 값사용불가 borrow of moved value 함수인자",
  r06:"vec 벡터 배열 string 문자열 str 슬라이스 push 인덱스 반복 파이썬리스트 utf8",
  r07:"구조체 struct impl 메서드 연관함수 new self 필드 튜플구조체 derive debug",
  r08:"열거형 enum option some none 배리언트 값담기 match 널없음 unwrap",
  r09:"모듈 mod use pub crate 파일분리 경로 가시성 라이브러리 바이너리",
  r10:"제네릭 generic 타입파라미터 단형화 트레이트바운드 where 재사용",
  r11:"테스트 test assert cargo_test 문서주석 doc 예제테스트 통합테스트",
  r12:"치트시트 대조표 파이썬 c++ 비교 문법대응 옮기기 번역",
  o01:"소유권 규칙 스코프 drop 해제시점 gc없음 raii 주인",
  o02:"빌림 borrow 참조 &mut 가변참조 대여검사기 borrowck 데이터경쟁 규칙",
  o03:"라이프타임 lifetime 'a 생략 elision 댕글링 참조수명 구조체참조",
  o04:"슬라이스 slice &str 부분참조 인덱스 범위 수명충돌 복사없음",
  o05:"트레이트 trait 인터페이스 impl for 기본구현 고아규칙 확장",
  o06:"트레이트객체 dyn box 동적디스패치 정적디스패치 vtable 제네릭비교 비용",
  o07:"deref drop 연산자오버로딩 add index display from into 변환",
  o08:"result ok err 물음표 ? 전파 unwrap expect 에러처리 예외없음",
  o09:"thiserror anyhow 에러타입 설계 라이브러리 애플리케이션 컨텍스트 backtrace",
  o10:"box rc arc refcell cell 내부가변성 공유소유권 순환참조 weak 런타임검사",
  o11:"클로저 closure fn fnmut fnonce 캡처 move 콜백 반환",
  o12:"이터레이터 iterator 지연평가 lazy map filter collect fold sum 어댑터 소비자",
  y01:"왜 rust 판단기준 프로파일 병목 언제 대안 numpy cython c++비교 유지보수",
  y02:"pyo3 첫모듈 pymodule pyfunction 최소구성 import 예제",
  y03:"maturin develop build 빌드 pyproject 간단 cmake없음 개발흐름",
  y04:"타입변환 자동 list vec dict hashmap 복사 extract intopy",
  y05:"클래스 pyclass pymethods 생성자 getter setter repr 상속 수명",
  y06:"numpy 배열 ndarray rust-numpy 제로카피 readonly 인플레이스 shape",
  y07:"gil 해제 allow_threads 병렬 rayon 멀티스레드 진짜병렬 코어",
  y08:"에러 예외 pyerr valueerror 변환 from 커스텀예외",
  y09:"콜백 파이썬함수 py bound call gil 진행률 이벤트",
  y10:"타입힌트 pyi 스텁 자동완성 mypy 문서화 docstring",
  y11:"abi3 안정abi 파이썬버전 한번빌드 wheel 태그 배포단순화",
  y12:"실패 빌드에러 import에러 느림 링크 디버깅 흔한실수 gil데드락",
  j01:"애드온 wasm 별도프로세스 비교 선택 브라우저 서버 언제",
  j02:"napi-rs 첫모듈 napi매크로 require 최소구성 cli",
  j03:"값변환 number string object array 변환비용 env",
  j04:"buffer typedarray 제로카피 arraybuffer 이미지 오디오 대용량",
  j05:"비동기 asynctask tokio 이벤트루프 블로킹 백그라운드 스레드풀",
  j06:"promise deferred threadsafefunction tsfn 스레드안전 콜백",
  j07:"클래스 napi object 구조체노출 new 인스턴스 gc 수명",
  j08:"wasm webassembly wasm-bindgen wasm-pack 브라우저 첫예제 js연동",
  j09:"wasm 크기 최적화 opt-level_z wasm-opt twiggy 로딩 스트리밍",
  j10:"prebuild 배포 npm 바이너리 멀티플랫폼 설치 optionaldependencies",
  f01:"c abi 공용어 왜 언어간 연동 표준 인터페이스 안정 rust abi불안정",
  f02:"no_mangle extern c 맹글링 심볼 nm dumpbin cdylib export",
  f03:"repr c 구조체 레이아웃 필드순서 정렬 padding 열거형 repr",
  f04:"cbindgen 헤더 자동생성 build.rs 헤더동기화 c++헤더",
  f05:"ctypes 파이썬 dll so 로드 argtypes restype 구조체 포인터",
  f06:"문자열 cstring cstr 메모리 소유권 free 누수 이중해제 규약 버퍼",
  f07:"콜백 함수포인터 extern c 등록 userdata 스레드 진행률",
  f08:"bindgen c라이브러리 헤더 바인딩생성 sys크레이트 안전래퍼 링크",
  f09:"패닉 catch_unwind unwind abort ffi경계 ub 에러코드 변환",
  f10:"c# dllimport 자바 jna go cgo 다른언어 재사용 dotnet",
  b01:"cargo 명령 build run test doc check 빌드도구 패키지관리자",
  b02:"cargo.toml 매니페스트 package edition dependencies bin lib 읽는법",
  b03:"의존성 버전 semver caret lock 커밋 update vendor 재현성",
  b04:"feature 피처 기능플래그 default optional 조건부컴파일 cfg",
  b05:"워크스페이스 workspace 멤버 여러크레이트 공유 빌드캐시",
  b06:"프로파일 dev release opt-level lto codegen-units debug 심볼 성능차이",
  b07:"크로스컴파일 target cross zigbuild 아키텍처 arm musl 윈도우",
  b08:"ci githubactions 매트릭스 3os 자동빌드 maturin publish 릴리즈 태그",
  b09:"clippy rustfmt 린트 포맷 rustdoc 문서 deny warnings",
  b10:"바이너리크기 strip opt-level_z panic_abort 빌드시간 sccache 의존성줄이기",
  e01:"벤치마크 criterion 측정 워밍업 노이즈 통계 flamegraph 프로파일링",
  e02:"할당 clone to_string 복사제거 with_capacity 재사용 참조",
  e03:"이터레이터 제로코스트 최적화 인라인 bounds_check 어셈블리확인",
  e04:"캐시 메모리레이아웃 aos soa 지역성 cacheline 구조체정렬",
  e05:"rayon par_iter 병렬 join 스레드풀 스케일 작업분할",
  e06:"send sync 스레드안전 자동트레이트 컴파일러검사 데이터경쟁 arc mutex",
  e07:"스레드 spawn 채널 mpsc crossbeam mutex rwlock 데드락 scope",
  e08:"async await tokio 런타임 future io바운드 cpu바운드 blocking 선택",
  e09:"simd 벡터화 자동벡터화 portable_simd 인트린식 avx",
  e10:"파이썬대비 c++대비 배수 실측 numpy비교 현실적 기대치",
  d01:"unsafe 허용범위 다섯가지 원시포인터 static 유니온 트레이트 unsafe함수",
  d02:"ub 미정의동작 목록 널역참조 정렬위반 데이터경쟁 무효값 aliasing",
  d03:"원시포인터 raw nonnull 정렬 align 프로버넌스 provenance 캐스팅",
  d04:"maybeuninit 초기화 assume_init 미초기화메모리 배열",
  d05:"pin unpin 자기참조 selfreferential future 이동금지",
  d06:"메모리모델 ordering relaxed acquire release seqcst 락프리 atomic",
  d07:"miri 검증 ub탐지 테스트 ci unsafe검사 stacked_borrows",
  d08:"안전추상화 불변식 invariant safety주석 api설계 라이브러리 캡슐화",
  d09:"매크로 macro_rules 선언매크로 proc_macro 절차매크로 derive syn quote",
  d10:"컴파일과정 hir mir llvm 단형화 monomorphization 코드생성 최적화",
  d11:"abi 안정성 불안정 repr_rust 버전간 호환 c abi경계 dylib",
  d12:"쓰지말아야 대안 판단 유지보수 팀비용 학습곡선 go python 컴파일시간",
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
function markScrollables(root){
  $$(".tw, .scw", root || document).forEach(tw => {
    if (tw.dataset.sc) return;
    tw.dataset.sc = "1";
    requestAnimationFrame(() => {
      if (tw.scrollWidth > tw.clientWidth + 8){
        tw.classList.add("scrollable");
        tw.addEventListener("scroll",
          () => tw.classList.remove("scrollable"), { once:true, passive:true });
      }
    });
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
function revealIn(){
  $$(".pane.on .rv").forEach(e => {
    const r = e.getBoundingClientRect();
    if (r.top < innerHeight + 80 && r.bottom > -80) e.classList.add("in");
  });
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
    revealIn();
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

/* ── 지금 보고 있는 자리를 주소에 남긴다 ──
   주소창을 복사해 메신저에 붙이면 받는 쪽이 '그 탭 그 섹션'에서 시작한다.
   예전에는 탭을 옮겨도 주소가 그대로여서 무엇을 보고 있든 첫 화면만 공유됐다.
   pushState 가 아니라 replaceState 라 뒤로 가기 기록은 늘지 않는다. */
function syncShareHash(){
  const secs = $(".pane.on .sec[id]");
  if (!secs.length) return;
  const line = secTop() + 16;              // 헤더에 가린 만큼 내려서 판정
  let cur = secs[0];
  for (const s of secs){
    if (s.getBoundingClientRect().top <= line) cur = s;
    else break;                            // 문서 순서라 하나 넘어가면 끝
  }
  if ("#" + cur.id === location.hash) return;
  try { history.replaceState(null, "", "#" + cur.id); } catch(e){}
}
window.syncShareHash = syncShareHash;

(function watchShareHash(){
  let t = null;
  addEventListener("scroll", () => {       // 스크롤이 멎은 뒤에만 (주소를 매 프레임 고치지 않는다)
    clearTimeout(t);
    t = setTimeout(syncShareHash, 160);
  }, { passive:true });
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
    });
  }, {rootMargin:"-25% 0px -65% 0px"});
  secs.forEach(s => { if (s.id) spy.observe(s); });
})();

