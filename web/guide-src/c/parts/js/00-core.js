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
  avr:"AVR ATmega ATmega328P atmega328p 아트메가 아두이노 Arduino Uno R3 우노 avr-gcc avrgcc avr-libc avrdude 에이브이알 레지스터 register DDRB PORTB PINB GPIO 인터럽트 interrupt ISR 타이머 timer CTC PWM 서보 servo UART USART 시리얼 serial UBRR 보레이트 baud ADC 아날로그 I2C TWI SPI PROGMEM pgm_read_byte EEPROM 퓨즈 fuse 부트로더 bootloader Optiboot ISP USBasp 저전력 sleep 워치독 watchdog millis digitalWrite 펌웨어 마이크로컨트롤러 MCU 임베디드 아두이노없이 아트메가328",
  rtos:"FreeRTOS freertos 프리rtos 프리알토스 RTOS 알토스 실시간 운영체제 실시간OS real-time 태스크 task 스케줄러 scheduler 선점 preemption 타임슬라이스 tick 틱 큐 queue 세마포어 semaphore 세마포 뮤텍스 mutex 뮤텍 우선순위 역전 priority inversion 우선순위 상속 inheritance 인터럽트 ISR FromISR portYIELD_FROM_ISR configMAX_SYSCALL_INTERRUPT_PRIORITY NVIC 태스크 알림 notification 이벤트 그룹 event group 스트림 버퍼 stream buffer 메시지 버퍼 소프트웨어 타이머 timer heap_4 heap_5 정적 할당 스택 오버플로 stack overflow high water mark tickless 저전력 Stop 모드 워치독 IWDG 데드락 deadlock 레이스 race SystemView Tracealyzer CMSIS-RTOS osThreadNew STM32F446RE Nucleo Cortex-M4 xTaskCreate xQueueSend xSemaphoreTake 액티브 오브젝트 Zephyr ThreadX RT-Thread",
  hw:"하드웨어 기초 hardware 전기 전압 전류 저항 옴의법칙 ohm 전력 LED 저항계산 3.3V 5V 풀업 풀다운 pullup 플로팅 floating 푸시풀 오픈드레인 open-drain 바운스 디바운스 debounce 5V톨러런트 FT 레벨시프트 MCU 마이크로컨트롤러 마이컴 ATmega328P 아두이노 arduino uno STM32F446RE nucleo cortex-m4 메모리맵 레지스터 register volatile 비트조작 bitmask BSRR RMW 데이터시트 datasheet 레퍼런스매뉴얼 RM0390 에라타 errata 클럭 clock PLL HSI HSE RCC 클럭게이트 인터럽트 interrupt ISR NVIC 벡터테이블 vector table EXTI 타이머 timer PWM 프리스케일러 prescaler ADC 전압분배기 부팅 boot reset_handler 스타트업 startup 링커스크립트 linker script .data .bss map파일 베어메탈 bare metal blinky SysTick 하드웨어기쵸 레지스타 인터럽드",
  stm32:"STM32 stm32 스티엠32 에스티엠 STM32F446RE F446 Nucleo 뉴클레오 Cortex-M 코텍스 cortex m4 M4F M0+ M7 M33 CubeMX 큐브엠엑스 cubemx HAL 할 LL CMSIS 레지스터 register 클럭 clock PLL HSE HSI SYSCLK GPIO EXTI 인터럽트 NVIC SysTick HAL_Delay 콜백 callback weak UART USART DMA IDLE ReceiveToIdle 순환버퍼 타이머 timer PWM 입력캡처 엔코더 encoder ADC 샘플링 Flash 플래시 옵션바이트 RDP HardFault 하드폴트 CFSR 저전력 Stop Standby Sleep 임베디드 펌웨어 firmware 마이컴 MCU",
  sq:"스택 큐 덱 stack queue deque 데크 스텍 큐우 LIFO FIFO 링버퍼 원형버퍼 ring buffer circular buffer 환형버퍼 head tail 마스크 mask 2의거듭제곱 power of two 무한증가인덱스 free-running index 한칸비우기 count 가득참 비어있음 full empty 넘침 overflow wraparound uint32 부호없는 unsigned 정수승격 integer promotion realloc 동적스택 void* memcpy 매크로 DEFINE_STACK _Generic 제네릭 침입형 intrusive list_head container_of offsetof sys/queue.h TAILQ STAILQ 연결큐 꼬리포인터 이진힙 binary heap 우선순위큐 priority queue sift-up sift-down 비교함수 cmp 타이머 소프트웨어타이머 timer wheel 타이머휠 tick 넘침 pthread mutex condvar 조건변수 cond_wait spurious wakeup 가짜깨어남 timedwait CLOCK_MONOTONIC close drain poison pill 독약 생산자 소비자 producer consumer 배압 backpressure stdatomic atomic SPSC lock-free 락프리 memory_order acquire release relaxed volatile ISR 인터럽트 메인루프 찢어진읽기 torn read 배리어 barrier ATOMIC_BLOCK AVR Cortex-M 정적풀 static pool 메모리풀 _Static_assert static_assert 단조스택 단조덱 monotonic 슬라이딩윈도우 BFS 0-1 BFS undo redo 괄호검사 flood fill 명시적스택 재귀 호출스택 call stack 이벤트큐 event queue 상태머신 state machine 명령큐 command parser 로그링 log ring noinit",
  arch:"대규모 C 구조 아키텍처 architecture 설계 구조 관리 모듈 module 모듈화 캡슐화 정보 은닉 불투명 포인터 opaque pointer opaque type 헤더 header include guard pragma once 전방 선언 forward declaration include-what-you-use IWYU 순환 의존 circular dependency 레이어 layer 계층 HAL BSP 드라이버 driver 디렉터리 구조 폴더 구조 directory layout 모노레포 monorepo boards products CMake 타깃 target PUBLIC PRIVATE INTERFACE 툴체인 toolchain arm-none-eabi CMakePresets 프리셋 링커 스크립트 linker script 설정 관리 config.h ifdef 지옥 Kconfig kconfiglib menuconfig 링크 타임 weak 심볼 static_assert _Static_assert vtable 함수 포인터 인터페이스 의존성 주입 dependency injection 의존성 역전 DIP 테스트 대역 fake mock 에러 처리 error handling goto cleanup assert 리셋 정책 메모리 정책 정적 할당 malloc 금지 메모리 풀 pool 아레나 arena 소유권 ownership 스택 사용량 stack usage 이벤트 큐 event queue 상태 머신 state machine FSM HSM 액티브 오브젝트 active object QP 코딩 표준 MISRA 미스라 CERT C BARR-C clang-tidy cppcheck clang-format 정적 분석 static analysis 코드 리뷰 리눅스 커널 Zephyr 제퍼 ESP-IDF SQLite amalgamation Redis ae 버전 semver 시맨틱 버전 changelog 변경 로그 빌드 정보 git describe 재현 가능한 빌드 대형 펌웨어 large scale firmware 펌웨어 구조 c언어 구조 씨언어",
  io:"통신 드라이버 communication driver 프로토콜 protocol UART 유아트 uart 시리얼 serial USART RS-485 rs485 RS485 RS-232 rs232 I2C i2c I²C 아이투씨 TWI SPI spi 에스피아이 CAN can 캔 CAN-FD canfd FDCAN bxCAN USB usb CDC 가상COM 1-Wire 원와이어 프레이밍 framing COBS 콥스 SLIP CRC crc16 CRC-16 CCITT 체크섬 checksum 파서 parser 상태머신 링버퍼 ringbuffer 오버런 overrun ORE DMA IDLE 풀업 pullup 버스락업 클럭스트레칭 BME280 bme280 센서드라이버 SSD1306 ssd1306 OLED 올레드 프레임버퍼 W25Q w25q128 NOR플래시 flash EEPROM littlefs 웨어레벨링 Modbus modbus 모드버스 RTU 로직분석기 logic analyzer sigrok PulseView 펄스뷰 STM32F446RE HAL",
  qa:"디버깅 debugging 디버그 debug 테스트 test 테스팅 단위테스트 unit test GDB gdb 지디비 OpenOCD openocd 오픈ocd ST-LINK stlink 스트링크 J-Link 제이링크 Cortex-Debug 코텍스디버그 SVD 브레이크포인트 breakpoint 와치포인트 watchpoint FPB DWT ITM SWO RTT SEGGER 세거 printf 로그 logging HardFault 하드폴트 하드fault CFSR HFSR addr2line 크래시덤프 crash dump noinit 스택오버플로 stack overflow 스택페인팅 MPU 힙단편화 fstack-usage Unity 유니티 CMock 씨목 FFF fake 페이크 mock 목 모킹 Ceedling 시들링 TDD 레지스터페이크 ASan UBSan Valgrind 밸그린드 libFuzzer 퍼징 fuzzing gcov lcov gcovr 커버리지 coverage CI GitHub Actions 깃허브액션 크기리포트 HIL 하드웨어인더루프 pytest pyserial uhubctl 플래키 flaky volatile 워치독 IWDG 리셋원인 RCC_CSR 정렬폴트 레이스컨디션 STM32F446RE",
  prod:"양산 펌웨어운영 제품화 EVT DVT PVT MP 부트로더 bootloader 부트로더설계 OTA 오티에이 펌웨어업데이트 DFU 시스템부트로더 AN2606 A/B 슬롯 롤백 rollback 스왑 MCUboot 엠씨유부트 imgtool 이미지서명 서명 ECDSA Ed25519 SHA-256 CRC32 secure boot 보안부팅 신뢰사슬 워치독 watchdog 와치독 IWDG WWDG 리셋원인 RCC_CSR 브라운아웃 BOR 안전모드 리셋루프 정전안전 EEPROM에뮬레이션 littlefs 리틀fs W25Q 전력예산 배터리수명 CR2032 PPK2 Joulescope 누설전류 크래시리포트 링로그 빌드ID build-id addr2line 생산공정 지그 포고핀 CubeProgrammer OTP 시리얼번호 MAC 보정값 MES RDP 읽기보호 WRP TrustZone 사이드채널 글리치 CRA 사이버복원력법 재현가능빌드 git describe 하드웨어리비전 Zephyr ESP-IDF 임베디드리눅스 Yocto Buildroot Rust embassy 로드맵 STM32F446RE 양산펌웨어",
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
  a01:"ATmega328P 핀맵 pinout 하버드 구조 Harvard Flash SRAM EEPROM 16MHz Uno R3 ATmega16U2 PB5 D13 데이터시트 iom328p",
  a02:"avr-gcc mmcu F_CPU Os objcopy hex ihex avrdude -c arduino 115200 Makefile avr-size elf 업로드 not in sync COM 포트",
  a03:"DDRx PORTx PINx 풀업 pull-up 토글 toggle sbi cbi 원자적 버튼 채터링 debounce 디바운스 하이임피던스 PUD",
  a04:"ISR sei cli INT0_vect PCINT EICRA EIMSK volatile ATOMIC_BLOCK util/atomic.h 찢어진 읽기 torn read 벡터 테이블 BADISR_vect 우선순위",
  a05:"Timer0 Timer1 Timer2 CTC 분주 prescaler OCR0A 249 TCCR0A WGM01 millis micros TIMER0_COMPA_vect 1ms 틱 OCR1A 15624",
  a06:"PWM Fast PWM Phase Correct OCR2A COM2A1 duty 듀티 analogWrite 서보 servo ICR1 39999 50Hz 모드14 감마 976Hz 490Hz",
  a07:"UART USART UBRR U2X0 보레이트 오차 9600 57600 115200 링버퍼 ring buffer USART_RX_vect UDRE printf FDEV_SETUP_STREAM setbaud 8N1 시리얼",
  a08:"ADC ADMUX REFS AVcc 1.1V 내부기준 ADCSRA ADPS 125kHz 자유실행 free running ADC_vect 가변저항 내부 온도 센서 양자화 LSB",
  a09:"I2C TWI TWBR 100kHz TWSR 상태코드 TW_START DS3231 반복START SPI SPCR SPDR SPIF SS 핀 MOSI MISO SCK 풀업 저항",
  a10:"PROGMEM pgm_read_byte PSTR F() 매크로 __FlashStringHelper printf_P strcpy_P SRAM 스택 힙 충돌 free_ram __brkval 스택 칠하기 stack painting .data .bss",
  a11:"EEPROM eeprom_update_byte EEMEM 쓰기수명 퓨즈 fuse lfuse hfuse efuse 0xFF 0xDE 0xFD CKSEL RSTDISBL 벽돌 ISP USBasp Optiboot 부트로더 굽기",
  a12:"저전력 low power sleep_mode set_sleep_mode Power-down 워치독 WDT_vect WDTCSR PRR power_all_disable BOD 배터리 수명 평균전류 소비전류",
  a13:"온도 로거 logger LM35 EEPROM 순환 기록 wear leveling digitalWrite 느린 이유 wiring_digital turnOffPWM 핀 테이블 init() Arduino 해부 레지스터 비교",
  r01:"슈퍼루프 superloop 실시간 하드 실시간 소프트 실시간 펌 실시간 지터 jitter 베어메탈 임베디드 리눅스 PREEMPT_RT 선점 반응 시간 RTOS 도입",
  r02:"FreeRTOSConfig.h tasks.c queue.c list.c timers.c portable ARM_CM4F port.c portmacro.h MemMang CubeMX CMSIS_V2 타임베이스 TIM6 SysTick PendSV SVC configASSERT CMake",
  r03:"xTaskCreate xTaskCreateStatic 스택 깊이 워드 우선순위 Ready Running Blocked Suspended 상태 vTaskDelete vTaskSuspend pvParameters TaskHandle_t osThreadNew",
  r04:"스케줄러 선점 타임슬라이스 tick vTaskDelay xTaskDelayUntil vTaskDelayUntil 드리프트 주기 Idle 태스크 idle hook tick hook 굶주림 rate monotonic 비율 단조 pdMS_TO_TICKS",
  r05:"xQueueCreate xQueueSend xQueueReceive xQueuePeek xQueueOverwrite 생산자 소비자 값 복사 포인터 수명 버퍼 풀 큐 셋 queue set xQueueSelectFromSet portMAX_DELAY BlockingQueue osMessageQueuePut",
  r06:"xSemaphoreCreateBinary xSemaphoreCreateCounting xSemaphoreCreateMutex xSemaphoreTake xSemaphoreGive 재귀 뮤텍스 recursive 우선순위 역전 우선순위 상속 화성 패스파인더 Mars Pathfinder 게이트키퍼 osMutexNew",
  r07:"FromISR pxHigherPriorityTaskWoken portYIELD_FROM_ISR configMAX_SYSCALL_INTERRUPT_PRIORITY configKERNEL_INTERRUPT_PRIORITY NVIC 우선순위 BASEPRI 지연 처리 deferred interrupt vTaskNotifyGiveFromISR xTimerPendFunctionCallFromISR configASSERT",
  r08:"태스크 알림 task notification ulTaskNotifyTake xTaskNotifyGive xTaskNotifyWait eSetBits 이벤트 그룹 xEventGroupWaitBits xEventGroupSetBits 스트림 버퍼 xStreamBufferSend 메시지 버퍼 xMessageBufferSend osThreadFlagsSet osEventFlagsWait",
  r09:"xTimerCreate xTimerStart xTimerReset xTimerResetFromISR xTimerChangePeriod pvTimerGetTimerID 원샷 one-shot auto-reload 주기 타이머 타이머 서비스 태스크 daemon 명령 큐 configTIMER_TASK_PRIORITY 디바운스 osTimerNew",
  r10:"heap_1 heap_2 heap_3 heap_4 heap_5 pvPortMalloc xPortGetFreeHeapSize xPortGetMinimumEverFreeHeapSize configSUPPORT_DYNAMIC_ALLOCATION 정적 할당 static allocation uxTaskGetStackHighWaterMark configCHECK_FOR_STACK_OVERFLOW vApplicationStackOverflowHook 스택 넘침 CCM",
  r11:"데드락 deadlock 잠금 순서 레이스 race condition 크리티컬 섹션 taskENTER_CRITICAL vTaskSuspendAll atomics 런타임 통계 vTaskGetRunTimeStats configGENERATE_RUN_TIME_STATS SystemView Tracealyzer 트레이스 trace CPU 점유율",
  r12:"tickless idle configUSE_TICKLESS_IDLE configEXPECTED_IDLE_TIME_BEFORE_SLEEP configPRE_SLEEP_PROCESSING 저전력 low power Sleep Stop Standby WFI RTC 기상 타이머 WUT vTaskStepTick vPortSuppressTicksAndSleep 기상 지연 배터리",
  r13:"태스크 분할 설계 센서 처리 통신 파이프라인 워치독 IWDG 체크인 감시 태스크 액티브 오브젝트 active object 액터 QP Zephyr ThreadX RT-Thread 베어메탈 비교",
  h01:"전압 전류 저항 옴의법칙 ohm V=IR 전력 LED 저항계산 330옴 E12 3.3V 5V 멀티미터 배터리수명 콘덴서",
  h02:"플로팅 floating 풀업 풀다운 pullup PUPDR 푸시풀 오픈드레인 OTYPER 핀전류 absolute maximum 5V톨러런트 FT 레벨시프트 바운스 디바운스",
  h03:"MCU 마이크로컨트롤러 코어 Flash SRAM 버스 AHB APB 주변장치 하버드 폰노이만 PROGMEM MMU MPU FPU ATmega328P STM32F446",
  h04:"메모리맵 memory map 레지스터 register volatile 포인터 0x40020014 GPIOA ODR CMSIS GPIO_TypeDef 구조체 오프셋 최적화 -O2 지연루프",
  h05:"비트조작 bit 마스크 시프트 set clear toggle MODER 필드 RMW 읽기수정쓰기 레이스 BSRR PINx 원자적 atomic PRIMASK ATOMIC_BLOCK 비트밴딩 rc_w1",
  h06:"데이터시트 datasheet 레퍼런스매뉴얼 reference manual RM0390 PM0214 에라타 errata 리셋값 rw w1c rc_w1 rc_w0 대체기능 alternate function AF7 핀배치",
  h07:"클럭 clock HSI HSE LSE 크리스털 PLL PLLM PLLN PLLP SYSCLK AHB APB1 APB2 분주 RCC AHB1ENR 클럭게이트 Flash latency 오버드라이브 CLKPR PRR 퓨즈",
  h08:"인터럽트 interrupt 폴링 polling ISR 벡터테이블 NVIC 우선순위 priority 선점 중첩 EXTI INT0 SYSCFG volatile 원자성 ATOMIC_BLOCK PRIMASK BASEPRI 지연처리 WFI",
  h09:"타이머 timer 카운터 프리스케일러 prescaler PSC ARR 자동재장전 CTC PWM 듀티 duty CCR OCR1A ICR1 서보 servo 입력캡처 input capture TIM2",
  h10:"ADC 아날로그 해상도 10비트 12비트 기준전압 Vref LSB 양자화 샘플링시간 노이즈 이동평균 EMA 오버샘플링 전압분배기 divider 배터리전압 정수오버플로",
  h11:"부팅 boot 리셋 reset Reset_Handler 벡터테이블 초기SP _estack 스타트업 startup SystemInit .data .bss __libc_init_array main BOOT0 부트로더 리셋원인 RCC_CSR MCUSR",
  h12:"링커스크립트 linker script ld MEMORY SECTIONS .text .rodata .data .bss LMA VMA AT> KEEP 힙 스택 map파일 size nm print-memory-usage 스택칠하기",
  h13:"베어메탈 bare metal blinky LED 버튼 PA5 PC13 LD2 B1 SysTick SysTick_Config BSRR 디바운스 상태기계 WFI arm-none-eabi-gcc STM32_Programmer_CLI openocd avrdude",
  m01:"STM32 시리즈 C0 F0 G0 F1 F4 G4 L4 U5 H5 H7 Cortex-M0+ M3 M4 M7 M33 TrustZone FPU 품번 Nucleo 블루필 보드 선택",
  m02:"레지스터 CMSIS LL HAL 계층 BSRR ODR volatile 코드크기 이식성 HAL_GPIO_TogglePin 읽고바꾸고쓰기 원자성 LL_GPIO",
  m03:"CubeMX ioc USER CODE BEGIN 재생성 CMake CMakePresets VS Code startup 링커스크립트 ld Drivers Core App 폴더구조 MX_DMA_Init",
  m04:"클럭 RCC HSI HSE PLL PLLM PLLN PLLP PLLQ SYSCLK HCLK APB1 APB2 오버드라이브 FLASH_LATENCY 대기상태 SystemClock_Config MCO CSS",
  m05:"GPIO MODER OTYPER OSPEEDR PUPDR IDR ODR BSRR AFR 풀업 오픈드레인 HAL_GPIO_Init EXTI EXTI15_10 SYSCFG 디바운스 바운스",
  m06:"NVIC 우선순위 선점 서브우선순위 펜딩 꼬리물기 tail-chaining SysTick uwTick HAL_GetTick HAL_Delay ISR weak 약한심볼 콜백 PRIMASK",
  m07:"UART USART HAL_UART_Transmit _IT _DMA ReceiveToIdle_DMA RxEventCallback IDLE 순환버퍼 circular 오버런 ORE 보레이트 BRR printf __io_putchar",
  m08:"타이머 TIM PSC ARR CCR PWM 듀티 서보 입력캡처 input capture 주파수측정 엔코더 encoder 쿼드러처 TI12 고급타이머 데드타임 MOE",
  m09:"ADC 아날로그 12비트 스캔 scan 순환DMA HalfCplt ConvCpltCallback 이중버퍼 더블버퍼 샘플링시간 TRGO 트리거 VREFINT 온도센서",
  m10:"DMA 스트림 채널 매핑 DMAMUX 버퍼수명 스택버퍼 CCM RAM D-Cache 캐시일관성 SCB_CleanDCache_by_Addr Invalidate 32바이트정렬 H7 F7 MPU",
  m11:"Flash 플래시 섹터 erase HAL_FLASH_Unlock HAL_FLASHEx_Erase HAL_FLASH_Program 옵션바이트 RDP BOR WRP EEPROM 에뮬레이션 링커 지우기시간",
  m12:"HardFault 하드폴트 예외 스택프레임 EXC_RETURN MSP PSP CFSR HFSR UFSR BFSR MMFSR BFAR MMFAR INVSTATE UNALIGNED addr2line 스택오버플로",
  m13:"저전력 low power Sleep Stop Standby WFI 웨이크업 소비전류 배터리 HAL_MAX_DELAY 타임아웃 재진입 HAL_BUSY 워치독 IWDG 체크리스트",
  sq01:"C 표준 스택 큐 없음 선택 결정 sys/queue.h GLib GQueue stb_ds klib lwrb 규약 bool out 매개변수 nodiscard 레거시",
  sq02:"스택 top 오버플로 언더플로 bool out realloc 2배 분할상환 shrink void* memcpy esz DEFINE_STACK 토큰붙이기 _Generic 디스패치",
  sq03:"원형버퍼 ring buffer head tail 마스크 한칸비우기 count 무한증가인덱스 uint32 넘침 mod 2^32 정수승격 uint16 uint8 N=256 PRIu32 _Static_assert",
  sq04:"덱 deque push_front pop_back grow 두조각 복사 size_t 0-1 연결큐 tail 포인터 use-after-free 침입형 intrusive list_head container_of offsetof list_add_tail list_del_init TAILQ FreeRTOS ListItem_t",
  sq05:"이진힙 binary heap 우선순위큐 sift_up sift_down 비교함수 qsort 규약 다중키 순번 안정성 타이머 deadline tick 넘침 49.7일 int32 time_after 타이머휠 FreeRTOS 지연리스트",
  sq06:"pthread mutex cond 조건변수 cond_wait timedwait spurious wakeup 가짜깨어남 CLOCK_MONOTONIC condattr_setclock close drain abort poison pill broadcast signal threads.h cnd_timedwait 배압",
  sq07:"SPSC lock-free 락프리 stdatomic atomic_load_explicit memory_order acquire release relaxed seq_cst 캐시줄 _Alignas ISR 인터럽트 volatile 찢어진읽기 torn read 컴파일러배리어 AVR uint8 Cortex-M DMB 듀얼코어 USART_RX_vect",
  sq08:"괄호검사 단조스택 다음큰수 next greater 슬라이딩윈도우 최댓값 단조덱 BFS 너비우선 0-1 BFS 격자 undo redo 링스택 command 패턴 코딩테스트",
  sq09:"성능 메모리 malloc 청크 32바이트 glibc 캐시 지역성 % & 나눗셈 UDIV AVR 정적풀 static pool free list 인덱스큐 _Static_assert static_assert C23 RAM 예산 SRAM 패딩 필드순서",
  sq10:"실수 함정 off-by-one 가득참 int 인덱스 UB realloc 누수 빈 pop 언더플로 마스크 2의거듭제곱 uint8 256 호출스택 call stack 스택오버플로 재귀 ATmega328P count 경쟁 sanitizer",
  sq11:"언어비교 C++ std::stack std::queue priority_queue 최대힙 Java ArrayDeque PriorityQueue Python deque heapq Rust VecDeque BinaryHeap heapless Go chan container/heap 빈 pop UB",
  sq12:"실무 이벤트큐 상태머신 dispatch 명령큐 파서 sscanf UART 로그링 덮어쓰기 noinit 워치독 이동평균 flood fill 명시적스택 재귀제거 ISR 여러개 cli disable_irq xQueueSendFromISR",
  k01:"규모 증상 전역 변수 만능 헤더 common.h 재빌드 빌드 시간 ifdef 미로 순환 의존 리팩터링 스트랭글러 nm 진단",
  k02:"모듈 opaque pointer 불투명 포인터 불완전 타입 static 정보 은닉 ring buffer 링 버퍼 접두사 네이밍 _internal.h 공개 헤더 내부 헤더 정적 풀 StaticQueue_t",
  k03:"자기 완결 헤더 self-contained include guard pragma once include 순서 IncludeCategories 전방 선언 forward declaration include-what-you-use IWYU gcc -H static inline 헤더 정의 금지 순환 include",
  k04:"레이어 계층 앱 서비스 미들웨어 디바이스 드라이버 BSP HAL CMSIS 레지스터 콜백 callback 함수 포인터 의존 방향 HAL_UART_RxCpltCallback 건너뛰기 역방향 호출",
  k05:"디렉터리 구조 폴더 구조 project layout boards products core third_party CubeMX 격리 board.h CODEOWNERS 모노레포 include src cli tests",
  k06:"CMake target_include_directories PUBLIC PRIVATE INTERFACE target_link_libraries 툴체인 파일 toolchain arm-none-eabi-gcc CMakePresets 프리셋 FW_BOARD 링커 스크립트 LINK_DEPENDS print-memory-usage objcopy size map",
  k07:"config.h fw_config.h ifdef 지옥 #if FEATURE -Wundef 링크 타임 선택 weak 심볼 Kconfig kconfiglib prj.conf sdkconfig IS_ENABLED _Static_assert static_assert #error",
  k08:"vtable 함수 포인터 구조체 ops 인터페이스 의존성 역전 의존성 주입 composition root 테스트 대역 fake 페이크 Unity container_of 간접 호출 비용 file_operations",
  k09:"에러 처리 error code fw_err_t enum out 매개변수 goto cleanup assert FW_ASSERT warn_unused_result nodiscard noinit 리셋 원인 RCC_FLAG NVIC_SystemReset 안전 상태 크래시 루프",
  k10:"메모리 정책 정적 할당 malloc 금지 힙 단편화 pragma GCC poison wrap 메모리 풀 free list 아레나 arena 소유권 ownership create destroy borrow fstack-usage 스택 예산 RAM 예산",
  k11:"이벤트 기반 event driven 이벤트 큐 슈퍼루프 WFI run-to-completion 상태 머신 FSM 전이 표 HSM 계층형 상태 머신 액티브 오브젝트 active object QP QP/C 액터 모델",
  k12:"MISRA C 2023 미스라 Mandatory Required Advisory deviation 편차 CERT C BARR-C clang-tidy cppcheck clang-format 정적 분석 static analysis 코드 리뷰 체크리스트 Wconversion ratchet 기준선",
  k13:"리눅스 커널 Kconfig Kbuild 드라이버 모델 Zephyr devicetree ESP-IDF components REQUIRES SQLite amalgamation Redis ae 이벤트 루프 FreeRTOS portable semver 버전 git describe fw_info changelog 재현 가능한 빌드 SOURCE_DATE_EPOCH",
  p01:"통신비교 UART RS-485 I2C SPI CAN USB 1-Wire 차동신호 differential 동기 비동기 전이중 반이중 속도 거리 토폴로지 핀충돌 레벨시프터",
  p02:"UART 프레임 패리티 8E1 WordLength 보레이트오차 오버샘플링 RTS CTS 흐름제어 RS-232 MAX3232 TTL USB-UART CP2102 CH340 RS-485 DE RE TXE TC 종단저항 바이어스",
  p03:"프레이밍 framing 구분자 길이접두 SLIP COBS 바이트스터핑 CRC-16 CCITT-FALSE XMODEM 0x29B1 테스트벡터 표방식 상태머신 파서 타임아웃 재동기화 시퀀스번호",
  p04:"링버퍼 ringbuffer SPSC ISR RXNE ORE 오버런 FE NE 프레이밍에러 DMA 순환 IDLE ReceiveToIdle 덮어쓰기 오버런정책 버퍼크기 보레이트 지연 COMPILER_BARRIER",
  p05:"I2C 오픈드레인 풀업저항 상승시간 정전용량 7비트주소 ACK NACK 리피티드스타트 repeated start 클럭스트레칭 버스락업 9펄스 HAL_I2C_Mem_Read IsDeviceReady FMPI2C",
  p06:"SPI CPOL CPHA 모드0 모드3 SCK MOSI MISO CS NSS 소프트웨어NSS TransmitReceive DMA BSY 분주 배선길이 링잉 JEDEC 여러장치",
  p07:"CAN CAN-FD 차동 CANH CANL 우성 열성 비트중재 arbitration 표준ID 확장ID 필터 비트타이밍 샘플포인트 TEC REC error passive bus-off bxCAN FDCAN 트랜시버 종단 120옴",
  p08:"USB 디바이스 엔드포인트 endpoint 디스크립터 descriptor 열거 enumeration CDC ACM 가상COM VID PID 벌크 인터럽트전송 TinyUSB USB_DEVICE CDC_Transmit_FS 48MHz PLLSAI DTR",
  p09:"센서드라이버 BME280 레지스터맵 칩ID 0x60 보정데이터 보정식 t_fine 정수연산 함수포인터 인터페이스 버스독립 어댑터 페이크 단위테스트 에러코드 강제모드",
  p10:"SSD1306 OLED 128x64 프레임버퍼 framebuffer 페이지주소 GDDRAM 제어바이트 0x3C 초기화시퀀스 차지펌프 글꼴 font 5x7 부분갱신 dirty SH1106 번인",
  p11:"W25Q W25Q128 SPI NOR Flash JEDEC Page Program 섹터지우기 4KB 256바이트 페이지경계 BUSY WREN 마모 웨어레벨링 wear leveling littlefs EEPROM QUADSPI",
  p12:"Modbus 모드버스 RTU RS-485 슬레이브 마스터 함수코드 03 06 16 보유레지스터 holding register 예외응답 CRC 0xA001 t3.5 t1.5 프레임경계 40001 워드순서",
  p13:"로직분석기 logic analyzer sigrok PulseView sigrok-cli fx2lafw Saleae 프로토콜디코더 샘플링속도 트리거 오실로스코프 디버그핀 증상 원인 NACK 보레이트불일치",
  t01:"디버깅 도구 LED GPIO 토글 디버그핀 printf UART SWO RTT 온칩디버거 트레이스 로직분석기 오실로스코프 하이젠버그 DWT CYCCNT 사이클카운터 DBGMCU",
  t02:"gdb break tbreak condition ignore commands dprintf next step finish until advance skip print x display watch rwatch awatch bt frame info registers optimized out -Og .gdbinit macro expand -g3",
  t03:"OpenOCD arm-none-eabi-gdb extended-remote RSP Z1 FPB 하드웨어브레이크포인트 6개 소프트웨어브레이크포인트 flash CoreSight DAP DWT ITM ETM Cortex-Debug launch.json attach liveWatch SVD Peripheral connect_assert_srst xPSR IPSR",
  t04:"printf UART 블로킹 _write retarget ITM SWO ITM_SendChar swoConfig SEGGER RTT 링버퍼 WrOff RdOff OpenOCD rtt 로그레벨 LOG_LEVEL 컴파일타임제거 바이너리로그 지연포맷 Trice pw_tokenizer 세미호스팅",
  t05:"HardFault 예외스택프레임 EXC_RETURN MSP PSP FPU 확장프레임 정렬패딩 xPSR naked 폴트스택 CFSR MMFSR BFSR UFSR HFSR FORCED addr2line objdump 백트레이스 noinit 크래시덤프 매직 체크섬 백업SRAM",
  t06:"스택오버플로 스택페인팅 0xA5 high-water MPU 스택가드 ARM_MPU_SetRegion MemManage 힙단편화 malloc mallinfo 메모리풀 -fstack-usage -Wstack-usage .su callgraph-info map print-memory-usage size nm cref",
  t07:"오프타깃 off-target 호스트테스트 Unity TEST_ASSERT setUp tearDown RUN_TEST 링버퍼 디바운스 틱넘침 테스트피라미드 CMake FetchContent CTest 크로스컴파일 funsigned-char 포인터폭 의존성역전",
  t08:"목 mock 페이크 fake 스텁 stub 테스트더블 링크타임치환 FFF FAKE_VALUE_FUNC custom_fake SET_RETURN_SEQ CMock ExpectAndReturn IgnoreArg ReturnThruPtr Ceedling project.yml TMP117 HAL 포트",
  t09:"레지스터페이크 USART_TypeDef 포인터주입 BRR 0x187 CR1 UE TE RE REG_WRITE 훅 쓰기순서 TDD red green refactor 빨강초록리팩터 CTest TIMEOUT 무한루프 타임아웃 wait_flag",
  t10:"ASan UBSan alignment implicit-conversion Valgrind memcheck massif MSan libFuzzer LLVMFuzzerTestOneInput 퍼징 코퍼스 사전 crash 최소화 프레임파서 CRC16 gcov gcovr lcov 분기커버리지 MC/DC condition-coverage",
  t11:"CI GitHub Actions workflow arm-none-eabi-gcc-action 툴체인파일 크기리포트 size_diff GITHUB_STEP_SUMMARY cppcheck clang-tidy codecov upload-artifact elf map hex 재현가능빌드 릴리스 concurrency",
  t12:"HIL hardware-in-the-loop 테스트지그 테스트벤치 pytest pyserial fixture conftest uhubctl 전원사이클 self-hosted runner JUnit 플래키 flaky rerun 워치독시험 명령셸 DUT",
  t13:"volatile 최적화 지연루프 ISR 레이스 RMW 원자연산 atomic LDREX STREX 정렬폴트 packed UNALIGNED 스택오버플로 클럭 HSE MCO printf float _printf_float newlib-nano 워치독 IWDG LSI 리셋원인 RCC_CSR 안전모드",
  o01:"EVT DVT PVT 양산 MP 관문 개발펌웨어 출하펌웨어 생산테스트펌웨어 세미호스팅 BKPT 체크리스트 CMake 변형 빌드 prod_guard",
  o02:"부트로더 bootloader Flash분할 섹터 S0 S1 0x08010000 VTOR MSP Reset_Handler jump_to_app 점프 NVIC ICER PRIMASK CONTROL naked 링커스크립트 VECT_TAB_OFFSET noinit 앱유효성",
  o03:"OTA DFU 시스템부트로더 BOOT0 AN2606 A/B 슬롯 스왑 스크래치 덮어쓰기 롤백 TRIAL PENDING 확정 confirm 이어받기 정전 멱등 외부Flash STM32_Programmer_CLI",
  o04:"무결성 CRC32 SHA-256 서명 ECDSA P-256 Ed25519 이미지헤더 MCUboot imgtool TLV 트레일러 TinyCrypt uECC 신뢰사슬 secure boot 롤백방지 보안카운터 HSM 키관리",
  o05:"워치독 watchdog IWDG WWDG LSI 프리스케일러 리로드 타임아웃 계산 킥 refresh 체크인 감시 창 EWI DBGMCU freeze Stop모드 WDG_SW",
  o06:"리셋원인 RCC_CSR IWDGRSTF WWDGRSTF SFTRSTF PORRSTF BORRSTF PINRSTF RMVF 브라운아웃 BOR BOR_LEV PVD 리셋루프 안전모드 noinit 백업레지스터",
  o07:"설정저장 Flash 수명 1만회 지우기 정전안전 커밋 완료표시 순번 seq CRC 덧붙이기 EEPROM에뮬레이션 AN3969 littlefs W25Q SPI플래시 마모분산",
  o08:"저전력 전력예산 평균전류 배터리수명 CR2032 AA mAh PPK2 Joulescope 전류측정 누설 플로팅 풀업 LED 레귤레이터 Iq 아날로그모드 자가방전",
  o09:"현장로그 링로그 크래시리포트 토큰로깅 defmt 빌드ID build-id addr2line 심볼 elf 보관 업로드 outbox 원격진단 텔레메트리 Memfault",
  o10:"생산공정 프로그래밍지그 포고핀 Tag-Connect 갱프로그래머 STM32CubeProgrammer CLI OTP 잠금바이트 UID 시리얼번호 MAC 보정값 MES 생산테스트 골든보드 택트타임",
  o11:"보안 RDP 읽기보호 레벨2 WRP 쓰기보호 디버그잠금 키저장 보안소자 ATECC608 SE050 TrustZone cmse 사이드채널 글리치 상수시간 CRA 사이버복원력법 PSTI EN303645 SBOM",
  o12:"버전관리 git describe version.h 빌드ID build-id fw_info 고정위치 재현가능빌드 SOURCE_DATE_EPOCH ffile-prefix-map 툴체인고정 하드웨어리비전 ADC분압 GPIO스트랩 호환성표 릴리스노트",
  o13:"다음단계 Zephyr 제퍼 디바이스트리 Kconfig west ESP-IDF ESP32 임베디드리눅스 MPU Buildroot Yocto SWUpdate Rust embassy probe-rs 로드맵 기능안전 ISO26262",
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

