/* ============================================================
   0. 공통 유틸 (다른 가이드와 동일한 기반 · 하이라이터만 다국어용)
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

/* --- 여러 언어를 함께 받는 하이라이터 --- */
/* 정규식 '리터럴'로 한 번에 정의한다.
   (문자열을 이어붙여 new RegExp 로 만들면 백슬래시를 한 겹 더 써야 해서 실수가 잦다)
   그룹 순서: 1 // 주석 · 2 전처리기 · 3 # 주석 · 4 문자열
             · 5 키워드 · 6 타입 · 7 메서드 · 8 숫자

   CS 가이드는 한 언어에 매이지 않는다 — 같은 개념을 파이썬으로도, C 로도,
   의사코드로도 보여 준다. 그래서 언어별 하이라이터를 두는 대신
   세 계열의 문법을 함께 받는 하나로 만들었다.
     · `#include`·`#define` 은 주석이 아니라 전처리기다 — 먼저 잡아 다른 색으로
     · 그 뒤에 오는 `#` 만 파이썬·셸 주석으로 본다 (순서가 뒤집히면 C 코드가 전부 회색이 된다)
     · 키워드 목록은 C · 파이썬 · JS 의 합집합이다. 서로 없는 낱말이 섞여도
       그 언어에서는 나타나지 않으므로 오탐이 되지 않는다 */
const JV_RE = /(\/\/[^\n]*)|(#\s*(?:include|define|ifndef|ifdef|endif|pragma|undef|elif|error)\b[^\n]*)|(#[^\n]*)|('[^'\n]*'|"[^"\n]*")|\b(and|as|assert|async|await|bool|break|case|catch|char|class|const|constexpr|continue|def|default|del|do|double|elif|else|enum|except|extends|extern|False|false|finally|float|for|from|function|global|goto|if|import|in|inline|int|interface|is|lambda|let|long|match|new|None|not|null|nullptr|or|pass|print|private|public|raise|register|return|self|short|signed|sizeof|static|struct|switch|template|this|throw|True|true|try|typedef|typename|union|unsigned|var|void|volatile|while|with|yield)\b|\b([A-Z][A-Za-z0-9_]*)\b|\.([a-z_]\w*)(?=\()|\b(0[xXbB][0-9a-fA-F_]+|\d[\d_]*\.?\d*(?:[eE][-+]?\d+)?)\b/g;

/* root를 받아 '보이는 탭'만 처리 — 초기 로딩 비용을 1/9로 */
function highlight(root){
  $$("pre.code code", root || document).forEach(el => {
    if (el.dataset.hl) return;
    el.dataset.hl = "1";
    let s = el.textContent
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    s = s.replace(JV_RE, (m, com, pre, hcom, str, kw, typ, fn, num) => {
      if (com)  return `<span class="t-com">${com}</span>`;
      if (pre)  return `<span class="t-ann">${pre}</span>`;
      if (hcom) return `<span class="t-com">${hcom}</span>`;
      if (str)  return `<span class="t-str">${str}</span>`;
      if (kw)   return `<span class="t-kw">${kw}</span>`;
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
  math:"이산수학 논리 명제 진리표 드모르간 술어 한정자 집합 관계 함수 귀납법 재귀 조합 순열 경우의수 비둘기집 그래프 정점 간선 트리 신장트리 정수론 소수 최대공약수 유클리드 나머지 모듈러 합동 부울대수 카르노맵 점화식 마스터정리 증명 수학",
  la:"선형대수 벡터 행렬 곱셈 전치 선형변환 기저 차원 랭크 행렬식 역행렬 연립방정식 가우스소거 고윳값 고유벡터 pagerank pca 차원축소 내적 코사인유사도 임베딩 벡터검색 확률 조건부확률 독립 베이즈 스팸필터 분포 정규분포 이항분포 포아송 기댓값 분산 표준편차 큰수의법칙 중심극한 표본 신뢰구간 pvalue ab테스트 부동소수점 float double 정밀도 오차 반올림 수치안정성",
  comp:"계산이론 튜링기계 계산가능성 오토마타 유한상태기계 fsm dfa nfa 상태전이 정규언어 정규식 regex 문맥자유 cfg 파싱 촘스키 위계 정지문제 halting 결정불가 빅오 bigo 시간복잡도 공간복잡도 점근 상한 하한 세타 오메가 상환분석 amortized p np npc np완전 nphard 환원 sat 외판원 근사 휴리스틱 지수시간 다항시간",
  ds:"자료구조 배열 리스트 연결리스트 링크드 캐시지역성 동적배열 벡터 arraylist 확장 스택 큐 덱 원형큐 해시테이블 해시맵 딕셔너리 충돌 체이닝 개방주소 리해싱 로드팩터 해시함수 해시충돌공격 이진탐색트리 bst 균형트리 avl 레드블랙 rbtree b트리 btree b+트리 인덱스 힙 우선순위큐 heapify 트라이 trie 접미사배열 유니온파인드 분리집합 서로소 블룸필터 hyperloglog 카운트민스케치 확률적자료구조 스킵리스트",
  algo:"알고리즘 정렬 버블 삽입 선택 퀵정렬 머지정렬 힙정렬 팀소트 안정정렬 이진탐색 lowerbound 이분탐색 파라메트릭 그래프탐색 bfs dfs 너비우선 깊이우선 최단경로 다익스트라 벨만포드 플로이드 a스타 최소신장트리 크루스칼 프림 위상정렬 탐욕 greedy 분할정복 동적계획법 dp 메모이제이션 냅색 lcs lis 백트래킹 가지치기 nqueen 문자열 kmp 라빈카프 보이어무어 해싱 랜덤화 몬테카를로 근사 코딩테스트 면접",
  arch:"컴퓨터구조 하드웨어 cpu 레지스터 alu 폰노이만 2진수 이진 비트연산 시프트 xor 마스크 2의보수 정수오버플로 부호 부동소수점 ieee754 지수부 가수부 논리게이트 반가산기 플립플롭 클럭 명령어집합 isa x86 arm risc cisc 어셈블리 파이프라인 해저드 분기예측 슈퍼스칼라 비순차실행 캐시 l1 l2 l3 캐시라인 캐시미스 지역성 폴스셰어링 메모리계층 mmu tlb 멀티코어 simd avx gpu 병렬 하드디스크 ssd nvme 플래시 트림 버스 인터럽트 dma 폰노이만병목",
  os:"운영체제 os 커널 유저모드 커널모드 특권 프로세스 스레드 pcb 생성 fork exec 좀비 스케줄링 라운드로빈 우선순위 cfs 선점 컨텍스트스위치 문맥교환 메모리관리 페이징 세그먼테이션 페이지테이블 가상메모리 페이지폴트 스왑 oom 동기화 뮤텍스 세마포어 스핀락 조건변수 임계구역 데드락 교착상태 기아 파일시스템 아이노드 inode 저널링 ext4 ntfs 마운트 io 블로킹 논블로킹 select poll epoll kqueue iouring 비동기 시스템콜 syscall 컨텍스트 컨테이너 네임스페이스 cgroup 도커 리눅스 top vmstat strace",
  net:"네트워크 osi 7계층 tcpip 물리 데이터링크 네트워크계층 전송계층 ip 아이피 주소 서브넷 마스크 cidr 사설망 nat 포트포워딩 ipv6 이더넷 mac arp 스위치 허브 vlan tcp 3웨이핸드셰이크 syn ack 시퀀스번호 재전송 타임아웃 흐름제어 윈도우 혼잡제어 슬로우스타트 cubic bbr timewait udp quic http http2 http3 keepalive 파이프라이닝 멀티플렉싱 헤드오브라인 dns 리졸버 재귀질의 ns레코드 캐시 ttl tls ssl 핸드셰이크 인증서 소켓 socket bind listen accept backlog 라우팅 bgp 방화벽 로드밸런서 지연 latency 대역폭 rtt 패킷 mtu ping traceroute tcpdump wireshark netstat",
  lang:"컴파일러 인터프리터 파싱 어휘분석 렉서 토큰 구문분석 파서 ast 문법 재귀하강 lr ll 의미분석 심볼테이블 스코프 타입검사 중간표현 ir ssa 최적화 인라인 상수폴딩 데드코드 루프언롤링 코드생성 레지스터할당 그래프컬러링 링커 로더 심볼해석 재배치 정적링크 동적링크 바이트코드 vm 스택머신 레지스터머신 jit 인터프리터루프 트레이싱 프로파일링 가비지컬렉션 gc 마크앤스윕 복사 세대별 참조카운팅 stopworld 타입시스템 정적타입 동적타입 강타입 추론 힌들리밀너 제네릭 다형성 패러다임 함수형 명령형 선언형 람다계산법 클로저 커링 순수함수 불변",
  sec:"보안 암호 cia 기밀성 무결성 가용성 최소권한 심층방어 해시 sha256 md5 충돌 무결성검증 hmac 비밀번호 솔트 bcrypt scrypt argon2 레인보우테이블 대칭키 aes 블록암호 cbc gcm 스트림암호 iv 논스 공개키 rsa ecc 타원곡선 키교환 디피헬만 전방향비밀성 디지털서명 인증서 pki 루트ca 체인 tls https 인증 인가 세션 쿠키 jwt oauth oidc 리프레시토큰 xss csrf sqli 인젝션 sop cors 버퍼오버플로 스택스매싱 aslr dep 카나리 useafterfree 난수 csprng 엔트로피 키관리 kms 공급망 의존성 시크릿 위협모델링 stride 체크리스트",
  dist:"분산 동시성 병렬 concurrency parallelism 경쟁상태 레이스컨디션 원자성 atomic 임계구역 메모리모델 가시성 재정렬 메모리배리어 acquire release 캐시일관성 mesi 락프리 cas compareandswap aba 액터 csp 채널 goroutine 이벤트루프 코루틴 분산시스템 오해 fallacies cap 정리 pacelc 일관성 강한일관성 최종일관성 선형화 순차일관성 읽기내쓰기 합의 raft paxos 리더선출 쿼럼 복제 리플리케이션 샤딩 파티셔닝 일관해시 분산트랜잭션 2pc 사가 saga 보상 아웃박스 램포트시계 벡터시계 인과관계 멱등성 재시도 백오프 서킷브레이커 타임아웃 장애",
  se:"소프트웨어공학 설계 추상화 결합도 응집도 캡슐화 모듈화 solid srp ocp lsp isp dip 디자인패턴 싱글턴 팩토리 빌더 프로토타입 어댑터 데코레이터 퍼사드 프록시 컴포지트 전략 옵서버 커맨드 상태 템플릿메서드 방문자 아키텍처 레이어드 헥사고날 클린아키텍처 포트어댑터 마이크로서비스 모놀리스 ddd 도메인 애그리거트 바운디드컨텍스트 유비쿼터스언어 테스트 단위테스트 통합테스트 e2e 테스트피라미드 tdd 모킹 커버리지 리팩터링 코드스멜 기술부채 git 브랜치 gitflow 트렁크 머지 리베이스 시맨틱버전 ci cd 파이프라인 블루그린 카나리 롤백 피처플래그 관측가능성 로그 메트릭 트레이스 slo sli 코드리뷰 문서 adr 협업",
};

const FIND_CHIPS = ["빅오 읽는 법","해시 충돌","캐시 미스","데드락 조건",
                    "TCP 핸드셰이크","가상 메모리","0.1+0.2 문제","2의 보수",
                    "동적 계획법","B+트리 인덱스","베이즈 정리","CAP 정리",
                    "가비지 컬렉션","JWT 와 세션","SOLID","코사인 유사도"];
const SEC_KW = {
  /* 궁금한 것을 한글로 쳤을 때 걸리게 하는 보강 키워드 */
  /* ── 이산수학 ── */
  q01:"왜 이산수학 연속 이산 차이 프로그래밍수학 필요성 로드맵 어디쓰나",
  q02:"명제 논리 참거짓 진리표 논리곱 논리합 부정 함의 동치 드모르간 단락평가 조건문리팩터",
  q03:"술어논리 한정자 전칭 존재 forall exists 부정 반례 명세 계약 불변식",
  q04:"집합 합집합 교집합 차집합 부분집합 멱집합 곱집합 관계 반사 대칭 추이 동치관계 함수 단사 전사 전단사 매핑",
  q05:"수학적귀납법 기본단계 귀납단계 강한귀납법 재귀정당화 루프불변식 증명 종료성",
  q06:"조합론 순열 조합 중복조합 이항계수 파스칼삼각형 비둘기집원리 포함배제 경우의수 해시충돌확률 생일문제",
  q07:"그래프 정점 간선 방향 무방향 가중치 인접행렬 인접리스트 차수 경로 사이클 연결성 이분그래프 소셜그래프",
  q08:"트리 루트 리프 부모 자식 높이 깊이 이진트리 순회 신장트리 최소신장트리 포레스트 dag",
  q09:"정수론 소수 소인수분해 에라토스테네스 최대공약수 최소공배수 유클리드호제법 확장유클리드 나머지 모듈러역원",
  q10:"모듈러산술 합동 나머지연산 순환 시계산술 해시버킷 페르마소정리 오일러 rsa근거 체크섬 crc",
  q11:"부울대수 논리식 간소화 카르노맵 드모르간 nand nor 게이트 최소항 비트마스크 플래그",
  q12:"점화식 재귀식 마스터정리 분할정복복잡도 피보나치 반복치환 재귀트리 t(n) 병합정렬복잡도",
  q13:"치트시트 기호 요약 정리표 수학기호 읽는법 시그마 파이 로그 지수",
  /* ── 선형대수 · 확률 ── */
  l01:"벡터 크기 방향 노름 정규화 단위벡터 덧셈 스칼라배 좌표 배열 임베딩",
  l02:"행렬 곱셈 전치 항등행렬 차원 규칙 배치처리 이미지필터 컨볼루션 계산량",
  l03:"선형변환 회전 확대 전단 기저 차원 랭크 널공간 좌표계 그래픽스변환",
  l04:"행렬식 determinant 역행렬 가역 연립방정식 가우스소거 lu분해 특이 조건수",
  l05:"고윳값 고유벡터 대각화 pagerank 구글 pca 주성분분석 차원축소 추천 스펙트럼",
  l06:"내적 dot 코사인유사도 각도 직교 유사도 검색 임베딩 벡터db 추천시스템 tfidf",
  l07:"확률 표본공간 사건 독립 배반 조건부확률 곱셈법칙 전확률 확률계산",
  l08:"베이즈정리 사전확률 사후확률 우도 스팸필터 나이브베이즈 의료검사 위양성 역설",
  l09:"확률분포 이산 연속 이항분포 정규분포 가우시안 포아송 지수분포 균등분포 꼬리",
  l10:"기댓값 분산 표준편차 공분산 큰수의법칙 중심극한정리 표본평균 몬테카를로",
  l11:"ab테스트 가설검정 귀무가설 pvalue 유의수준 신뢰구간 검정력 다중검정 피킹 심슨의역설 함정",
  l12:"부동소수점 float double 0.1 0.2 오차 반올림 비교 epsilon 금액계산 decimal 십진",
  l13:"수치안정성 오버플로 언더플로 자릿수손실 카한합 로그합 정밀도 누적오차 나눗셈",
  /* ── 계산이론 ── */
  p01:"계산 튜링기계 테이프 상태 계산가능 처치튜링 보편기계 컴퓨터의정의 람다계산",
  p02:"유한상태기계 fsm dfa nfa 상태전이도 상태패턴 프로토콜 파서 게임ai 상태관리",
  p03:"정규언어 정규식 regex 오토마타변환 펌핑보조정리 정규식한계 html파싱불가 백트래킹폭발 redos",
  p04:"문맥자유문법 cfg bnf 파스트리 모호성 파싱 재귀하강 ll lr 괄호짝 중첩",
  p05:"촘스키위계 정규 문맥자유 문맥의존 무제한 표현력 계층 언어분류",
  p06:"정지문제 halting 결정불가 대각선논법 라이스정리 정적분석한계 컴파일러경고 무한루프",
  p07:"빅오 bigo 점근표기 상한 오메가 세타 최악 평균 최선 상수무시 로그밑 성장률",
  p08:"시간복잡도 계산 중첩반복 재귀 로그 분할 실제측정 벤치마크 n의크기 체감",
  p09:"공간복잡도 메모리 인플레이스 재귀스택 트레이드오프 시간공간 캐시테이블",
  p10:"상환분석 amortized 동적배열 두배확장 push_back 평균비용 회계법 포텐셜",
  p11:"p np np완전 nphard 환원 검증 sat 3sat 배낭 외판원 그래프색칠 밀레니엄문제",
  p12:"근사알고리즘 휴리스틱 유전알고리즘 시뮬레이티드어닐링 브랜치앤바운드 제약해결 solver 실무대응",
  p13:"복잡도치트시트 자료구조복잡도 정렬복잡도 요약표 면접 빠른참조",
  /* ── 자료구조 ── */
  s01:"배열 연결리스트 비교 캐시지역성 포인터추적 삽입삭제 임의접근 실측 메모리레이아웃",
  s02:"동적배열 벡터 arraylist 용량 확장 두배 reserve 재할당 복사 amortized",
  s03:"스택 큐 덱 lifo fifo 원형큐 링버퍼 되돌리기 괄호검사 bfs큐 호출스택",
  s04:"해시테이블 해시맵 딕셔너리 버킷 충돌 체이닝 개방주소법 선형탐사 로드팩터 리해싱 순회순서",
  s05:"해시함수 균등분포 murmur siphash 해시충돌공격 hashdos 암호학적해시 일관해시 지문",
  s06:"이진탐색트리 bst 삽입 삭제 탐색 중위순회 편향 최악 정렬된입력",
  s07:"균형트리 avl 레드블랙 회전 rebalance treemap stdmap 로그보장 스킵리스트",
  s08:"b트리 b+트리 디스크 블록 페이지 인덱스 db 클러스터드 범위검색 팬아웃 높이",
  s09:"힙 최대힙 최소힙 우선순위큐 heapify 삽입 추출 힙정렬 스케줄러 top k",
  s10:"트라이 trie 접두사 자동완성 접미사배열 접미사트리 아호코라식 사전 문자열검색",
  s11:"유니온파인드 분리집합 disjointset find union 경로압축 랭크 크루스칼 연결성 사이클검출",
  s12:"블룸필터 확률적자료구조 위양성 hyperloglog 카디널리티 카운트민스케치 캐시필터 중복검사",
  s13:"자료구조선택 결정표 상황별 언제쓰나 성능비교 요약 면접",
  /* ── 알고리즘 ── */
  a01:"정렬 버블 선택 삽입 안정성 비교기반 하한 nlogn 계수정렬 기수정렬 실무정렬",
  a02:"퀵정렬 피벗 머지정렬 힙정렬 팀소트 인트로소트 내장정렬 최악 재귀깊이 병합",
  a03:"이진탐색 이분탐색 경계 lowerbound upperbound 오프바이원 무한루프 파라메트릭서치 결정문제",
  a04:"bfs dfs 너비우선 깊이우선 큐 스택 재귀 방문표시 연결요소 미로 최단경로무가중",
  a05:"최단경로 다익스트라 우선순위큐 벨만포드 음수간선 플로이드워셜 a스타 휴리스틱 지도",
  a06:"최소신장트리 크루스칼 프림 위상정렬 dag 진입차수 의존성 빌드순서 사이클",
  a07:"탐욕 greedy 교환논증 최적부분구조 동전거스름 회의실배정 허프만 반례",
  a08:"분할정복 병합 재귀 마스터정리 거듭제곱 카라츠바 fft 병렬화",
  a09:"동적계획법 dp 메모이제이션 타뷸레이션 최적부분구조 중복부분문제 배낭 lcs lis 편집거리 점화식",
  a10:"백트래킹 가지치기 nqueen 순열생성 조합생성 스도쿠 탐색공간 상태복원",
  a11:"문자열 kmp 실패함수 라빈카프 롤링해시 보이어무어 z알고리즘 부분문자열 매칭",
  a12:"랜덤화 몬테카를로 라스베이거스 셔플 피셔예이츠 리저버샘플링 근사 스케치",
  a13:"문제접근법 코딩테스트 면접 알고리즘선택 패턴인식 제약조건읽기 시간제한 역산 디버깅",
  /* ── 컴퓨터구조 ── */
  h01:"컴퓨터구성 cpu 메모리 저장장치 폰노이만 하버드 명령어사이클 페치 디코드 실행 클럭",
  h02:"2진수 이진 16진수 변환 비트연산 and or xor not 시프트 마스크 플래그 비트필드",
  h03:"정수표현 2의보수 부호비트 오버플로 언더플로 int32 랩어라운드 부호없는 캐스팅버그 y2038",
  h04:"부동소수점 ieee754 부호 지수 가수 정규화 비정규수 nan 무한 반올림 정밀도 float16",
  h05:"논리게이트 and or not nand 반가산기 전가산기 플립플롭 레지스터 clock 조합회로 순차회로",
  h06:"명령어집합 isa x86 arm risc cisc 어셈블리 mov add jmp 레지스터 스택프레임 호출규약 abi",
  h07:"파이프라인 단계 해저드 데이터해저드 제어해저드 스톨 포워딩 분기예측 미스예측 슈퍼스칼라 비순차실행 투기실행",
  h08:"캐시 l1 l2 l3 캐시라인 64바이트 히트 미스 지역성 시간지역성 공간지역성 프리페치 연관도 폴스셰어링 행우선",
  h09:"메모리계층 레지스터 캐시 램 디스크 지연시간 mmu tlb 주소변환 페이지 물리주소 가상주소",
  h10:"병렬 멀티코어 하이퍼스레딩 암달의법칙 simd sse avx 벡터화 gpu cuda 워프 이기종",
  h11:"저장장치 hdd 회전지연 탐색시간 ssd 낸드 플래시 페이지 블록 가비지컬렉션 트림 웨어레벨링 nvme 큐깊이 iops",
  h12:"버스 pcie 인터럽트 폴링 dma 메모리맵io 디바이스 드라이버 처리량 대역폭",
  h13:"하드웨어영향 정리 캐시친화 자료구조 분기제거 정렬된데이터 성능차이 실측 최적화순서",
  /* ── 운영체제 ── */
  o01:"운영체제 커널 유저모드 커널모드 특권레벨 링 추상화 자원관리 모놀리식 마이크로커널 부팅",
  o02:"프로세스 스레드 pcb tcb 주소공간 공유 fork exec wait 좀비 고아 데몬 멀티프로세스 멀티스레드 선택",
  o03:"스케줄링 선점 비선점 라운드로빈 우선순위 mlfq cfs 타임슬라이스 기아 nice 실시간 처리량 응답시간",
  o04:"컨텍스트스위치 문맥교환 비용 레지스터저장 tlb플러시 캐시오염 스레드수 과다생성 코루틴 경량스레드",
  o05:"메모리관리 페이징 프레임 페이지테이블 다단계 세그먼테이션 단편화 내부단편화 외부단편화 힙 스택 mmap",
  o06:"가상메모리 페이지폴트 마이너 메이저 스왑 스래싱 oom킬러 copyonwrite 메모리오버커밋 rss vsz",
  o07:"동기화 뮤텍스 세마포어 스핀락 조건변수 모니터 임계구역 락경합 우선순위역전 리더라이터락",
  o08:"데드락 교착상태 상호배제 점유대기 비선점 순환대기 예방 회피 은행원알고리즘 검출 락순서 타임아웃",
  o09:"파일시스템 아이노드 디렉터리 하드링크 심볼릭링크 저널링 ext4 xfs ntfs 마운트 페이지캐시 fsync 원자적쓰기",
  o10:"io모델 블로킹 논블로킹 동기 비동기 select poll epoll kqueue iocp iouring 이벤트루프 c10k 리액터",
  o11:"시스템콜 syscall 유저커널전환 트랩 컨텍스트 오버헤드 vdso strace 라이브러리함수차이",
  o12:"컨테이너 네임스페이스 pid mount net cgroup 리소스제한 도커 이미지 레이어 오버레이fs 격리 vm차이",
  o13:"리눅스진단 top htop vmstat iostat free df du ps lsof netstat ss strace perf dmesg 부하평균",
  /* ── 네트워크 ── */
  n01:"osi 7계층 tcpip 4계층 캡슐화 헤더 물리 데이터링크 네트워크 전송 세션 표현 응용 패킷흐름",
  n02:"ip 주소 ipv4 ipv6 서브넷 마스크 cidr 게이트웨이 사설ip nat 포트포워딩 dhcp 라우팅테이블",
  n03:"이더넷 프레임 mac주소 arp 스위치 허브 브로드캐스트 충돌도메인 vlan mtu 점보프레임",
  n04:"tcp 3웨이핸드셰이크 syn synack ack 4웨이 fin 시퀀스번호 재전송 타임아웃 신뢰성 순서보장 연결지향 timewait",
  n05:"흐름제어 수신윈도우 슬라이딩윈도우 혼잡제어 슬로우스타트 혼잡회피 빠른재전송 cubic bbr 대역폭지연곱 나글",
  n06:"udp 비연결 헤드오브라인 quic http3 0rtt 연결마이그레이션 실시간 스트리밍 게임 dns",
  n07:"dns 도메인 리졸버 루트 tld 권한서버 재귀질의 반복질의 a레코드 cname mx ns ttl 캐시 dnssec 전파",
  n08:"http 메서드 상태코드 헤더 쿠키 캐시 keepalive 파이프라이닝 http2 멀티플렉싱 hpack 서버푸시 http3 헤드오브라인",
  n09:"tls ssl 핸드셰이크 clienthello 인증서검증 키교환 세션재개 sni alpn tls1.3 0rtt 암호스위트",
  n10:"소켓 tcp소켓 bind listen accept connect 파일디스크립터 포트 backlog 큐 syn큐 accept큐 timewait 재사용",
  n11:"라우팅 정적 동적 bgp ospf 홉 ttl 방화벽 iptables 보안그룹 로드밸런서 l4 l7 헬스체크",
  n12:"지연 latency 대역폭 rtt 광속 처리량 패킷손실 지터 대역폭지연곱 cdn 엣지 물리한계 요청수줄이기",
  n13:"네트워크진단 ping traceroute mtr dig nslookup curl netstat ss tcpdump wireshark telnet nc 순서",
  /* ── 컴파일러 · 언어이론 ── */
  c01:"컴파일과정 전처리 컴파일 어셈블 링크 실행 소스에서실행까지 툴체인 오브젝트파일 전체그림",
  c02:"어휘분석 렉서 토크나이저 토큰 정규식 최장일치 키워드 식별자 리터럴 주석제거 공백",
  c03:"구문분석 파서 ast 문법 재귀하강 프랫파서 연산자우선순위 ll lr yacc antlr 파스트리 에러복구",
  c04:"의미분석 심볼테이블 스코프 이름해석 타입검사 형변환 선언전사용 정적검사 린터",
  c05:"중간표현 ir ssa 3주소코드 llvm 최적화 상수폴딩 데드코드제거 인라인 루프언롤링 공통부분식 알리아싱",
  c06:"코드생성 명령어선택 레지스터할당 그래프컬러링 스필 스택프레임 호출규약 어셈블리출력 최적화레벨",
  c07:"링커 로더 심볼해석 재배치 정적링크 동적링크 so dll plt got 로드 aslr undefinedreference 중복정의",
  c08:"인터프리터 바이트코드 vm 스택머신 레지스터머신 디스패치 트리워킹 cpython jvm 실행루프",
  c09:"jit 저스트인타임 핫스팟 인라인캐시 히든클래스 역최적화 warmup aot 트레이싱 v8 hotspot",
  c10:"가비지컬렉션 gc 참조카운팅 순환참조 마크앤스윕 마크컴팩트 복사 세대별 stopworld 동시 zgc g1 튜닝 누수",
  c11:"타입시스템 정적 동적 강타입 약타입 추론 힌들리밀너 제네릭 공변 반변 대수적자료형 널안전 의존타입",
  c12:"패러다임 명령형 절차형 객체지향 함수형 선언형 람다계산법 클로저 커링 고차함수 순수함수 불변성 부수효과",
  c13:"미니언어 인터프리터만들기 계산기 파서작성 실습 dsl 설계 언어선택기준",
  /* ── 보안 · 암호 ── */
  k01:"보안원칙 cia 기밀성 무결성 가용성 인증 부인방지 최소권한 심층방어 공격표면 실패시안전 신뢰경계",
  k02:"해시 sha256 sha3 md5 sha1 충돌 일방향 무결성 체크섬 hmac 머클트리 지문 파일검증",
  k03:"비밀번호 저장 솔트 페퍼 bcrypt scrypt argon2 pbkdf2 작업계수 레인보우테이블 무차별대입 크리덴셜스터핑",
  k04:"대칭키 aes 블록암호 키길이 ecb cbc gcm 인증암호 iv 논스 패딩 오라클 스트림암호 chacha20",
  k05:"공개키 rsa ecc 타원곡선 키쌍 암호화 복호화 디피헬만 키교환 전방향비밀성 양자내성 키길이",
  k06:"디지털서명 인증서 x509 pki 루트ca 중간ca 체인 검증 만료 폐기 crl ocsp 코드서명 letsencrypt",
  k07:"tls 보장범위 도청 위조 재전송 중간자 인증서핀닝 https 한계 서버내부 e2e암호화",
  k08:"인증 인가 authn authz 세션 쿠키 samesite httponly jwt 서명 만료 리프레시토큰 oauth2 oidc sso mfa",
  k09:"웹취약점 xss 저장형 반사형 dom csrf 토큰 sqlinjection 파라미터바인딩 sop cors 클릭재킹 owasp",
  k10:"메모리취약점 버퍼오버플로 스택스매싱 힙오버플로 useafterfree 이중해제 포맷스트링 aslr dep 스택카나리 rop",
  k11:"난수 의사난수 csprng seed 엔트로피 urandom 예측가능 토큰생성 키관리 kms hsm 키회전",
  k12:"공급망 의존성 취약점 lockfile sbom 서명검증 타이포스쿼팅 시크릿관리 환경변수 깃유출 스캔 최소권한",
  k13:"위협모델링 stride dread 자산 공격자 시나리오 완화 체크리스트 배포전점검 로그 침해대응",
  /* ── 분산 · 동시성 ── */
  d01:"동시성 병렬성 차이 인터리빙 코어 암달의법칙 태스크 io바운드 cpu바운드 모델선택",
  d02:"경쟁상태 레이스컨디션 원자성 읽기수정쓰기 카운터 증가 락 원자연산 재현어려움 tsan",
  d03:"메모리모델 가시성 재정렬 컴파일러최적화 volatile happensbefore 메모리배리어 acquire release seqcst 캐시일관성 mesi",
  d04:"락프리 cas compareandswap aba 스핀 백오프 논블로킹 waitfree 큐 스택 성능 함정",
  d05:"동시성모델 스레드 액터 erlang akka csp 고루틴 채널 이벤트루프 코루틴 asyncawait 그린스레드 비교",
  d06:"분산시스템 여덟가지오해 fallacies 네트워크신뢰 지연0 대역폭무한 안전 위상불변 관리자한명 전송비용0 이기종",
  d07:"cap 정리 일관성 가용성 분단내성 cp ap pacelc 지연 오해 실무해석",
  d08:"일관성모델 선형화 순차일관성 인과일관성 최종일관성 읽기내쓰기 단조읽기 스티키세션 쿼럼 rwn",
  d09:"합의 raft paxos 리더선출 로그복제 임기 term 쿼럼 스플릿브레인 zookeeper etcd 분산락 펜싱토큰",
  d10:"복제 리더팔로워 동기 비동기 복제지연 읽기전용복제본 샤딩 파티셔닝 키범위 해시파티션 일관해시 리밸런싱 핫스팟",
  d11:"분산트랜잭션 2pc 3pc 블로킹 사가 saga 보상트랜잭션 오케스트레이션 코레오그래피 아웃박스 정확히한번 최소한번",
  d12:"시간 순서 벽시계 ntp 시계편차 램포트시계 벡터시계 인과관계 논리시계 스노우플레이크 uuid ulid 정렬가능id",
  d13:"멱등성 재시도 지수백오프 지터 서킷브레이커 벌크헤드 타임아웃 데드라인 폴백 중복요청 요청id 장애전파",
  /* ── 소프트웨어 공학 ── */
  e01:"추상화 결합도 응집도 캡슐화 정보은닉 모듈화 인터페이스 의존성방향 변경비용 좋은설계기준",
  e02:"solid 단일책임 srp 개방폐쇄 ocp 리스코프 lsp 인터페이스분리 isp 의존역전 dip 예시 과적용",
  e03:"생성패턴 싱글턴 팩토리메서드 추상팩토리 빌더 프로토타입 의존성주입 객체생성 전역상태",
  e04:"구조패턴 어댑터 브리지 컴포지트 데코레이터 퍼사드 플라이웨이트 프록시 래핑 조합",
  e05:"행위패턴 전략 옵서버 커맨드 상태 템플릿메서드 반복자 중재자 책임연쇄 방문자 이벤트",
  e06:"아키텍처 레이어드 헥사고날 포트어댑터 클린아키텍처 의존성규칙 모놀리스 마이크로서비스 모듈러모놀리스 이벤트드리븐 cqrs",
  e07:"ddd 도메인주도설계 유비쿼터스언어 엔티티 값객체 애그리거트 리포지토리 도메인이벤트 바운디드컨텍스트 컨텍스트맵 안티커럽션",
  e08:"테스트 단위테스트 통합테스트 e2e 테스트피라미드 tdd 모킹 스텁 페이크 픽스처 커버리지 플레이키 계약테스트",
  e09:"리팩터링 코드스멜 중복 긴함수 큰클래스 기술부채 이자 안전한변경 특성화테스트 점진적개선 스트랭글러",
  e10:"git 브랜치 gitflow 깃허브플로 트렁크기반 머지 리베이스 충돌 커밋메시지 시맨틱버전 태그 릴리스노트 모노레포",
  e11:"ci cd 파이프라인 빌드 자동테스트 아티팩트 배포전략 블루그린 카나리 롤링 롤백 피처플래그 마이그레이션 무중단",
  e12:"관측가능성 observability 로그 구조화로그 메트릭 히스토그램 분산트레이싱 스팬 상관관계id 알림 slo sli 에러버짓 대시보드",
  e13:"코드리뷰 리뷰기준 피드백 pr크기 문서 adr 아키텍처결정기록 온보딩 지식공유 페어프로그래밍 협업",
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
               placeholder="궁금한 것을 한글로 — 예: 해시 충돌, 캐시 미스, 데드락">
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

