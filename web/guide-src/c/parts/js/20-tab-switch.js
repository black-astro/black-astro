/* ============================================================
   1. 탭 전환 · 난이도 배지 · 「쉽게 말하면」 요약
   ============================================================ */
const TAB_INIT = {};                       // 탭별 최초 1회 초기화 등록소
const tabReady = new Set(["base"]);
let currentTab = "base";

function switchTab(name){
  if (!$("#pane-" + name)) return;
  currentTab = name;
  $$(".pane").forEach(p => p.classList.toggle("on", p.id === "pane-" + name));
  $$(".navset").forEach(n => n.classList.toggle("on", n.dataset.nav === name));
  $$(".tabbar .tabrow button, .tabbar .tabs .tabsl button").forEach(b => {
    const on = b.dataset.t === name;
    b.classList.toggle("on", on);
    b.setAttribute("aria-selected", on ? "true" : "false");
    if (on) b.scrollIntoView({block:"nearest", inline:"nearest"});
  });
  if (window.tabReveal) tabReveal();   // 사이드바 그룹 · 헤더 줄을 그 탭에 맞춘다
  window.scrollTo(0, 0);

  if (!tabReady.has(name)){
    tabReady.add(name);
    if (TAB_INIT[name]) TAB_INIT[name]();
  }
  highlightLazy($(".pane.on"));
  markScrollables($(".pane.on"));

  const tc = $("#tabcurTxt");
  if (tc && TAB_LABEL[name]) tc.textContent = TAB_LABEL[name];
  tabDrop(false);

  // 새로 보이는 pane 에서 화면에 걸린 것은 즉시 드러낸다 (읽기·쓰기를 가른 판)
  requestAnimationFrame(revealIn);
}

/* 주제 탭 드롭다운 (전 해상도 공통) */
const TAB_LABEL = {
  base:"🅲 C 기초",
  sys:"⚙️ C 실전 · 시스템",
  setup:"🧰 설치 · 툴체인",
};

function tabDrop(force){
  const tb = $("#tabbar");
  const open = force !== undefined ? force : !tb.classList.contains("open");
  tb.classList.toggle("open", open);
  $("#tabcur").setAttribute("aria-expanded", open ? "true" : "false");
}
document.addEventListener("click", e => {   // 바깥 탭하면 닫기
  if (!e.target.closest("#tabbar")) tabDrop(false);
});

/* ── 섹션 난이도: b 기초 / i 중급 / a 고급 ── */
const SEC_LV = {
  /* base */ c01:"b", c02:"b", c03:"i", c04:"i", c05:"i", c06:"a", c07:"a", c08:"i", c09:"i", c10:"i", c11:"a", c12:"i", c13:"b",
  /* sys */ c14:"i", c15:"i", c16:"i", c17:"i", c18:"a", c19:"a", c20:"a", c21:"i", c22:"a", c23:"a", c24:"i", c25:"i", c26:"b",
  /* setup */ u01:"b", u02:"b", u03:"i", u04:"i", u05:"i", u06:"b", u07:"i", u08:"b", u09:"i", u10:"b", u11:"i", u12:"b", u13:"i",
};


/* 🐣 '쉽게 말하면' — 섹션마다 붙는 한 줄 번역 (항상 표시) */
const EZ = {
 c01:"C 는 <b>운영체제 · 파이썬 인터프리터 · 임베디드</b>의 바닥에 여전히 깔려 있어요. C++ 를 배우다 막히는 부분도 대부분 여기서 물려받은 것들입니다.",
 c02:"자바 int 는 항상 32비트지만 <b>C 의 int 는 크기가 정해져 있지 않아요</b>. 그래서 실무에서는 int32_t 처럼 크기를 못 박은 타입을 씁니다.",
 c03:"배열을 함수에 넘기면 <b>길이 정보가 사라지고 주소만</b> 넘어가요. 그래서 C 함수는 항상 길이를 같이 받습니다.",
 c04:"C 문자열은 <b>'\\0' 을 만날 때까지</b>가 끝이에요. 길이를 들고 다니지 않아서 버퍼 넘침 사고가 여기서 나옵니다.",
 c05:"내가 malloc 한 것은 <b>내가 free</b> 해야 하고, 놓은 뒤에는 쳐다보면 안 돼요. 규칙은 두 줄인데 지키기가 어렵습니다.",
 c06:"구조체 크기는 <b>필드 크기의 합이 아니에요</b>. 정렬을 맞추려고 컴파일러가 빈칸을 끼워 넣습니다.",
 c07:"C 에는 인터페이스가 없어서 <b>함수 포인터</b>로 다형성을 흉내 냅니다. C++ 의 virtual 을 손으로 만든 셈이에요.",
 c08:"예외가 없으니 <b>반환값과 errno</b> 로만 실패를 압니다 — 확인하지 않은 한 줄이 나중에 사고가 됩니다.",
 c09:"#define 은 <b>문법을 모르는 텍스트 치환기</b>예요. 괄호 하나 빠뜨리면 전혀 다른 코드가 됩니다.",
 c10:"파일이 둘이 되는 순간 <b>헤더에는 선언, 소스에는 정의</b>로 나눠야 해요. static 을 붙이면 그 파일 안에서만 보입니다.",
 c11:"UB 는 '이상한 값이 나온다'가 아니라 <b>표준이 아무 약속도 안 한다</b>는 뜻이에요. 내가 쓴 검사 코드가 최적화로 사라지기도 합니다.",
 c12:"\"C++ 는 C 의 상위 집합\"은 <b>실무에서는 틀린 말</b>이에요. void* 대입, union, 예약어 등에서 실제로 어긋납니다.",
  c13:"C 에 딸려 오는 함수들이 <b>어느 헤더에</b> 있는지 지도를 그려 둡니다. stdio·stdlib·string 셋이면 대부분 해결됩니다.",
  c14:"C 에는 파이썬 list 도 C++ vector 도 없어서 <b>직접 만듭니다</b>. 2배씩 늘리는 이유와, 늘어날 때 주소가 바뀌는 함정을 봅니다.",
  c15:"파이썬 dict 에 해당하는 <b>해시 테이블</b>을 100줄로 만들고, qsort 와 bsearch 로 정렬·탐색을 붙입니다.",
  c16:"입력을 받아 자르고 숫자로 바꾸고 다시 이어 붙이는 일 — <b>C 사고의 대부분이 여기서</b> 납니다. 안전한 방법만 골라 익힙니다.",
  c17:"C 표준에는 <b>폴더를 읽는 함수조차 없습니다</b>. 파일 크기·수정 시각·디렉터리 순회·메모리 매핑은 POSIX 와 Win32 의 영역입니다.",
  c18:"네트워크 라이브러리를 한 겹 걷어 내면 <b>socket·bind·listen·accept·connect</b> 다섯 함수가 전부입니다. 에코 서버를 통째로 만듭니다.",
  c19:"파이썬과 달리 C 스레드는 <b>진짜로 코어를 다 씁니다</b>. 그 대가인 데이터 레이스를 뮤텍스·조건 변수·원자 연산으로 막습니다.",
  c20:"셸이 <code>ls | grep</code> 를 처리하는 방식 그대로 — <b>fork 로 복제하고 pipe 로 잇고 exec 으로 바뀝니다</b>.",
  c21:"30년 만에 C 가 편해졌습니다 — <b>nullptr · constexpr · typeof · #embed · 2진 리터럴</b>. 다만 컴파일러 지원이 고르지 않습니다.",
  c22:"malloc 도 printf 도 운영체제도 없는 환경 — <b>volatile 과 비트 연산이 왜 언어에 있는지</b>가 여기서 이해됩니다.",
  c23:"C 가 지금도 중심인 이유 — <b>C ABI 는 모든 언어의 공통 언어</b>입니다. so 와 dll 을 만들어 파이썬·자바에서 불러 봅니다.",
  c24:"C 버그는 <b>증상이 원인에서 멀리</b> 나타납니다. 눈으로 찾지 말고 새니타이저·valgrind·gdb 에게 시킵니다.",
  c25:"파일이 셋을 넘으면 <code>gcc *.c</code> 로는 안 됩니다. <b>의존 그래프를 적어 두면 바뀐 것만 다시 빌드</b>됩니다.",
  c26:"C 에 패키지 매니저는 없지만 <b>세상에서 가장 많이 실행되는 라이브러리</b>들이 C 로 되어 있습니다. 무엇을 언제 쓰는지 정리합니다.",
  /* ── setup ── */
  u01:"펌웨어 도구는 <b>컴파일러 · 크로스 컴파일러 · 빌드 도구 · 플래셔 · 프로브 · IDE</b> 여섯 칸이고, PC 프로그램과 달리 결과물을 <b>USB 너머 칩으로 옮기는 도구</b>가 더 붙습니다.",
  u02:"윈도우에서는 <b>MSYS2 UCRT64 GCC</b> 를 기본으로 깔고 PATH 에 <code>C:\\msys64\\ucrt64\\bin</code> 만 넣습니다. 표준은 <code>-std=c17</code> 처럼 <b>항상 직접 적습니다</b>.",
  u03:"리눅스 · 맥은 패키지 몇 개면 끝나고, WSL2 는 <b>usbipd 로 USB 장치를 넘겨 줘야</b> 보드가 보입니다.",
  u04:"VS Code 는 껍데기이고, 자동완성은 <b>clangd 가 compile_commands.json 을 읽어서</b> 합니다. 빌드는 tasks.json, 디버그는 launch.json.",
  u05:"작은 프로젝트는 Makefile 도 되지만, 임베디드는 <b>CMake + 툴체인 파일 + Ninja</b> 로 PC 테스트 빌드와 칩 빌드를 한 트리에서 나눕니다.",
  u06:"<code>avr-gcc -mmcu=atmega328p -DF_CPU=16000000UL</code> 로 빌드하고 <code>avr-objcopy</code> 로 hex 를 뽑아 <code>avrdude -c arduino</code> 로 굽습니다 — 아두이노 업로드 버튼의 정체입니다.",
  u07:"Cortex-M 은 <b>Arm GNU Toolchain</b> 하나로 빌드하고, F446 은 <code>-mcpu=cortex-m4 -mthumb -mfloat-abi=hard -mfpu=fpv4-sp-d16</code>. 플래시 = text + data, RAM = data + bss.",
  u08:"<b>CubeMX</b> 는 설정 · 코드 생성, <b>CubeCLT</b> 는 빌드 · 굽기 · 디버그, <b>CubeIDE</b> 는 둘을 묶은 IDE. 처음엔 CubeIDE, 팀이면 CubeMX + CubeCLT + VS Code.",
  u09:"프로브는 USB 를 <b>SWD(SWCLK · SWDIO · GND)</b> 로 바꾸는 하드웨어이고, PC 쪽은 <b>OpenOCD</b> 가 GDB 서버가 되어 VS Code 에서 F5 로 디버그합니다.",
  u10:"<code>platformio.ini</code> 의 <b>[env:이름]</b> 하나가 보드 하나이고, 툴체인 · 프레임워크 · 업로더를 <b>npm 처럼 자동으로</b> 받아 옵니다.",
  u11:"눈으로 배우기는 <b>Wokwi · SimulIDE</b>, 자동 테스트는 <b>simavr · QEMU · Renode</b>. 시뮬레이터는 <b>로직까지만</b> 보증합니다.",
  u12:"<b>Uno R3 + Nucleo-F446RE + 로직 분석기 + 멀티미터</b>가 최소 세트입니다. <b>Uno R4 는 AVR 이 아니고</b>, Blue Pill 은 호환 칩이 흔합니다.",
  u13:"<b>보이나(케이블) → 드라이버 → 점유 · 권한 → 칩 응답</b> 순서로 지웁니다. 막힌 STM32 는 <b>리셋 상태로 연결(mode=UR)</b> 해서 지웁니다.",
};


/* 🎯 실전 도달점 — 이 섹션 내용으로 어디까지 할 수 있나
   s = 개인·학습 / p = 실무 서비스 / e = 대규모·엔터프라이즈 */
const CAP = {
  c01:["s","C 를 컴파일하고 경고·새니타이저를 켠 상태로 개발을 시작합니다 — C++ 를 배우기 위한 바닥을 놓습니다."],
  c02:["p","플랫폼마다 다른 정수 크기 문제를 고정 크기 타입으로 없앱니다 — 파일 형식·프로토콜이 기계를 옮겨도 깨지지 않습니다."],
  c03:["p","배열이 포인터로 변하는 지점을 알고 길이를 함께 넘기는 API 를 설계합니다 — 범위 밖 접근을 구조적으로 줄입니다."],
  c04:["p","버퍼 상한을 지키는 문자열 코드를 씁니다 — 스택 버퍼 오버플로 취약점을 애초에 만들지 않습니다."],
  c05:["p","할당·해제 짝을 코드 구조로 강제하고 goto 정리 패턴으로 누수를 막습니다 — 오래 도는 프로세스가 안정적으로 삽니다."],
  c06:["e","구조체 레이아웃을 통제하고 정적 단언으로 못 박습니다 — 이진 형식과 언어 간 구조체 공유가 안전해집니다."],
  c07:["p","함수 포인터 표로 교체 가능한 구현을 설계합니다 — C 만으로 플러그인 구조를 만듭니다."],
  c08:["p","모든 실패 경로를 반환값으로 다루고 로그에 남깁니다 — 조용히 실패하는 코드를 없앱니다."],
  c09:["s","매크로의 함정을 피하고 인클루드 가드·조건부 컴파일을 바르게 씁니다 — 헤더가 어디서든 안전하게 포함됩니다."],
  c10:["p","헤더·소스·static 으로 모듈 경계를 만들고 빌드를 구성합니다 — 파일이 늘어도 구조가 무너지지 않습니다."],
  c11:["e","UB 를 도구로 잡는 체계를 CI 에 붙입니다 — \"내 PC 에서는 되던데\"로 끝나는 버그를 없앱니다."],
  c12:["p","C 와 C++ 를 섞어 쓸 때의 경계 규칙을 정합니다 — 안은 C++ 로, 밖은 C 로 내보내는 라이브러리를 만듭니다."],
  c13:["p","필요한 함수를 헤더째로 찾아 쓰고, atoi·sprintf·strcpy 같은 위험한 옛 함수를 안전한 짝으로 바꿔 쓸 수 있습니다."],
  c14:["p","자기 프로젝트에 넣을 동적 배열과 연결 리스트를 직접 만들고, realloc 실패와 포인터 무효화를 안전하게 다룰 수 있습니다."],
  c15:["p","문자열 키 해시 테이블을 직접 구현하거나 검증된 라이브러리를 골라, 조회가 잦은 코드를 O(1) 로 만들 수 있습니다."],
  c16:["p","fgets·snprintf·strtok_r·strtol 조합으로 버퍼 오버플로 없는 파싱 코드를 쓰고, 한글이 깨지지 않게 UTF-8 을 다룰 수 있습니다."],
  c17:["p","open·stat·opendir·mmap 으로 파일 시스템을 직접 다루고, 윈도우 분기를 래퍼 함수 안에 가둔 이식성 있는 코드를 쓸 수 있습니다."],
  c18:["p","리눅스와 윈도우 양쪽에서 도는 TCP 서버·클라이언트를 작성하고, 길이 접두사 프로토콜과 poll·epoll 로 다중 접속을 처리할 수 있습니다."],
  c19:["p","pthreads 로 병렬 작업과 생산자·소비자 큐를 구현하고, TSan 을 CI 에 붙여 사람 눈에 안 보이는 레이스를 잡아낼 수 있습니다."],
  c20:["p","외부 명령을 안전하게 실행해 출력을 받아 오고, SIGTERM 을 받아 정리하고 종료하는 graceful shutdown 을 구현할 수 있습니다."],
  c21:["s","C23 기능 중 지금 켜도 되는 것과 아직 이른 것을 구분하고, 매크로로 감싸 이식성을 지키면서 새 문법을 쓸 수 있습니다."],
  c22:["s","마이크로컨트롤러의 레지스터를 직접 설정하고, 인터럽트와 메인 루프를 잇는 링 버퍼를 안전하게 구현할 수 있습니다."],
  c23:["p","정적·동적 라이브러리를 빌드하고 심볼 가시성과 버전을 관리해, 파이썬·자바·C#·Node·러스트에서 부를 수 있는 모듈을 배포할 수 있습니다."],
  c24:["p","증상에 맞는 도구를 골라 메모리 오류를 몇 분 만에 찾아내고, 새니타이저를 켠 테스트를 CI 에서 자동으로 돌릴 수 있습니다."],
  c25:["p","Makefile 또는 CMake 로 새 C 프로젝트를 표준 구조로 시작하고, 세 OS 를 도는 CI 와 릴리스 바이너리 배포까지 구성할 수 있습니다."],
  c26:["p","용도에 맞는 검증된 C 라이브러리를 고르고 의존성 관리 방식을 정해, 직접 만들 것과 가져다 쓸 것을 판단할 수 있습니다."],
  /* ── setup ── */
  u01:["p","새 펌웨어 프로젝트를 받았을 때 어떤 도구가 빠졌는지 역할별로 짚어 설치 순서를 정할 수 있습니다"],
  u02:["s","윈도우 10 PC 에서 GCC 와 MSVC 로 C17/C23 코드를 경고를 켜고 컴파일할 수 있습니다"],
  u03:["s","리눅스 · 맥 · WSL2 에서 같은 툴체인을 세우고 USB 보드를 연결할 수 있습니다"],
  u04:["p","팀원 누구나 같은 자동완성 · 빌드 버튼 · F5 디버그를 쓰도록 .vscode 설정을 구성할 수 있습니다"],
  u05:["p","CMake 툴체인 파일과 프리셋으로 같은 소스를 PC 용과 STM32 용으로 나눠 빌드할 수 있습니다"],
  u06:["s","아두이노 IDE 없이 명령줄로 ATmega328P 펌웨어를 빌드해 Uno 에 업로드할 수 있습니다"],
  u07:["p","Cortex-M 칩에 맞는 컴파일 플래그를 고르고 size · map 으로 플래시 · RAM 사용량을 읽을 수 있습니다"],
  u08:["p","STM32 프로젝트를 CubeMX 로 생성하고 CubeIDE 또는 CubeCLT · VS Code 조합으로 빌드 · 굽기할 수 있습니다"],
  u09:["p","ST-LINK · J-Link · CMSIS-DAP 로 외부 보드를 SWD 배선해 OpenOCD · Cortex-Debug 로 디버그할 수 있습니다"],
  u10:["s","PlatformIO 한 프로젝트에서 Uno · Nucleo · PC 테스트 환경을 함께 빌드 · 업로드할 수 있습니다"],
  u11:["s","보드 없이 시뮬레이터로 펌웨어를 실행하고 gdb 로 붙어 로직을 확인할 수 있습니다"],
  u12:["s","가이드 전체를 따라 할 보드 · 측정 도구 · 부품을 실수 없이 고를 수 있습니다"],
  u13:["p","보드 인식 · 업로드 실패를 에러 문구로 분류해 드라이버 · 포트 · 권한 · PATH 문제를 스스로 해결할 수 있습니다"],
};


/* 난이도 배지 + 🐣 쉬운 요약 주입 */
(function lvInit(){
  const L = { b:["🟢 기초","e"], i:["🟡 중급","m"], a:["🔴 고급","h"] };
  for (const [id, lv] of Object.entries(SEC_LV)){
    const h = document.querySelector("#" + id + " .sec-head h2");
    if (h && !h.querySelector(".lvl")){
      const s = document.createElement("span");
      s.className = "lvl " + L[lv][1];
      s.textContent = L[lv][0];
      h.appendChild(s);
    }
    const head = document.querySelector("#" + id + " .sec-head");
    if (head && EZ[id] && !head.nextElementSibling?.classList?.contains("ez")){
      const ez = document.createElement("div");
      ez.className = "ez";
      ez.innerHTML = "<b>쉽게 말하면</b> — " + EZ[id];
      head.after(ez);
    }
  }
})();

/* 🎯 실전 도달점 주입 — 모든 섹션 (SEC_LV 에 없는 섹션도 포함) */
(function capInit(){
  const T = { s:"개인 · 학습", p:"실무 서비스", e:"대규모 · 엔터프라이즈" };
  for (const [id, v] of Object.entries(CAP)){
    const sec = document.getElementById(id);
    if (!sec) continue;
    const anchor = sec.querySelector(".ez") || sec.querySelector(".sec-head");
    if (!anchor || anchor.nextElementSibling?.classList?.contains("reach")) continue;
    const c = document.createElement("div");
    c.className = "reach " + v[0];
    c.innerHTML = "<b>" + T[v[0]] + "</b> — " + v[1];
    anchor.after(c);
  }
})();

/* 키보드 1~9·0 으로 탭 전환 (0 = 10번째 탭) */
const TAB_ORDER = ["setup","base","sys"];
document.addEventListener("keydown", e => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  const t = e.target.tagName;
  if (t === "INPUT" || t === "TEXTAREA") return;
  const i = "1234567890".indexOf(e.key);
  if (i >= 0 && TAB_ORDER[i]) { switchTab(TAB_ORDER[i]); return; }
});
