/* ============================================================
   0. 공통 유틸
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

/* --- 파이썬 문법 하이라이터 --- */
const PY_KW = /\b(import|from|as|def|return|for|in|if|elif|else|not|and|or|None|True|False|lambda|with|class|while|try|except|pass|is)\b/;
/* root를 받아 '보이는 탭'만 처리 — 초기 로딩 비용을 1/7로 */
function highlight(root){
  $$("pre.code code", root || document).forEach(el => {
    if (el.dataset.hl) return;
    el.dataset.hl = "1";
    let s = el.textContent
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const RE = new RegExp(
      "(#[^\\n]*)"                          + "|" +   // 1 주석
      "('[^'\\n]*'|\"[^\"\\n]*\")"          + "|" +   // 2 문자열
      PY_KW.source                          + "|" +   // 3 키워드
      "\\b(pd|np|plt|df|df1|df2|d)\\b"      + "|" +   // 4 모듈/변수
      "\\.([a-zA-Z_]\\w*)(?=\\()"           + "|" +   // 5 메서드
      "\\b(\\d[\\d_]*\\.?\\d*)\\b",                   // 6 숫자
      "g");
    s = s.replace(RE, (m, com, str, kw, mod, fn, num) => {
      if (com) return `<span class="t-com">${com}</span>`;
      if (str) return `<span class="t-str">${str}</span>`;
      if (kw)  return `<span class="t-kw">${kw}</span>`;
      if (mod) return `<span class="t-mod">${mod}</span>`;
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
  python:"파이썬 python 기본 기초 입문 문법 변수 자료형 타입 문자열 리스트 딕셔너리 튜플 세트 배열 반복문 for while 조건문 if 함수 def 클래스 객체 상속 모듈 임포트 import 예외 에러 파일 읽기 쓰기 제너레이터 데코레이터 컴프리헨션 정규식 regex 타입힌트 자바 java 슬라이싱 정렬 sort 람다 lambda 복사 참조",
  uv:"uv 환경 가상환경 venv 설치 세팅 셋업 패키지 라이브러리 의존성 버전 파이썬설치 pip 관리 pyproject toml lock 잠금 초기화 프로젝트 마이그레이션 uvx 실행 requirements",
  pandas:"판다스 pandas 데이터 분석 엑셀 excel csv 표 테이블 데이터프레임 dataframe 시리즈 집계 그룹 groupby 병합 merge 조인 join 피벗 pivot 정렬 결측치 nan 통계 시계열 날짜 필터 조회 컬럼 행 인덱스 통합 리포트 보고서",
  numpy:"넘파이 numpy 배열 array 행렬 매트릭스 벡터 수치 계산 연산 브로드캐스팅 축 axis shape 차원 슬라이싱 선형대수 난수 랜덤 통계 성능 벡터화",
  img:"이미지 사진 그림 img image 썸네일 리사이즈 크기조절 크롭 자르기 회전 워터마크 로고 필터 흑백 화질 포맷 변환 pillow pil opencv 픽셀 색상 rgb 합성 압축 일괄처리 배치",
  auto:"자동화 매크로 반복작업 업무자동화 클릭 마우스 키보드 입력 화면 스크래핑 크롤링 크롤러 웹 브라우저 셀레니움 selenium 스케줄 예약 rpa 엑셀자동화 화면인식 좌표 단축키 창제어",
  qt:"gui 데스크탑 데스크톱 프로그램 앱 어플 애플리케이션 소프트웨어 윈도우 창 화면 버튼 위젯 입력창 폼 다이얼로그 팝업 메뉴 툴바 레이아웃 인터페이스 ui ux 디자인 pyside pyside6 pyqt qt exe 실행파일 배포 설치파일 프로그램만들기 화면개발 클라이언트",
  toolbox:"도구 도구상자 툴 라이브러리 추천 실전 로그 로깅 설정 config json 요청 requests api http 스케줄러 테스트 유틸 패턴 파일처리 압축 zip 암호화 환경변수 cli",
  algo:"알고리즘 코딩테스트 코테 문제풀이 정렬 탐색 이분탐색 이진탐색 완전탐색 dp 동적계획법 그래프 bfs dfs 재귀 스택 큐 힙 해시 시간복잡도 빅오 자료구조 그리디 백트래킹 투포인터",
  db:"데이터베이스 db sql 쿼리 select 조회 join 조인 인덱스 index 트랜잭션 락 잠금 격리수준 데드락 mysql postgresql oracle 정규화 성능 튜닝 스키마 테이블 orm 무결성",
  web:"웹 web http https 서버 백엔드 api rest restful 요청 응답 request response 메서드 get post put patch delete 상태코드 200 201 400 401 403 404 409 422 500 헤더 header 쿠키 cookie 쿼리스트링 querystring 바디 body json content-type url 주소 도메인 dns 포트 라우팅 routing 엔드포인트 fastapi uvicorn 파이단틱 pydantic 검증 validation 스키마 문서 swagger openapi docs 인증 authentication 인가 authorization 로그인 login 로그아웃 회원가입 세션 session jwt 토큰 token bearer 리프레시 refresh 비밀번호 password 해시 hash bcrypt argon2 salt 솔트 oauth cors 크로스오리진 preflight 동일출처 samesite csrf xss 보안 security ssl tls 인증서 django 장고 flask 플라스크 웹프레임워크 서버만들기 api서버 백엔드입문",
  test:"테스트 test testing pytest 파이테스트 단위테스트 유닛테스트 unit 통합테스트 integration e2e assert 어서트 검증 fixture 픽스처 conftest scope parametrize 파라미터화 매개변수화 raises 예외테스트 approx 근사 경계값 mock 목 모킹 patch monkeypatch 몽키패치 magicmock 가짜 스텁 stub respx responses 시간고정 time-machine testclient 에이피아이테스트 httpx asgi pytest-asyncio 비동기테스트 db테스트 롤백 rollback 트랜잭션 testcontainers 커버리지 coverage pytest-cov 회귀 regression 리팩터링 ci 지속적통합 github actions 워크플로 자동화 pre-commit xdist 병렬 aaa given when then tdd 플레이키 flaky 안티패턴 좋은테스트",
  deep:"전문가 초고급 고급 심화 내부동작 cpython 바이트코드 dis 인터프리터 객체모델 pyobject 참조카운팅 refcount 메모리 gc 가비지컬렉션 순환참조 weakref 누수 leak tracemalloc memray objgraph slots 디스크립터 descriptor property 메타클래스 metaclass 데코레이터 functools wraps 제너레이터 코루틴 yield asyncio 이벤트루프 취소 cancel taskgroup contextvars gil free-threading 멀티프로세싱 c확장 cython numba rust pyo3 maturin 타입 protocol typevar generic overload paramspec typeddict mypy pyright 함수형 불변 frozen dataclass 디자인패턴 어댑터 리포지토리 보안 pickle 역직렬화 공급망 supply chain bandit pip-audit 아키텍처 계층 헥사고날 ddd 의존성역전",
  scale:"대규모 트래픽 서버 백엔드 웹 api fastapi 비동기 async await asyncio gil 멀티프로세싱 프로세스 스레드 동시성 uvicorn gunicorn asgi wsgi django flask sqlalchemy 커넥션풀 캐시 redis 레디스 분산락 멱등 중복결제 celery 셀러리 큐 워커 배치 airflow 스케줄 대용량 polars duckdb parquet 배포 도커 docker 쿠버네티스 k8s 무중단 관측 모니터링 로깅 structlog 프로메테우스 prometheus 부하테스트 locust py-spy 프로파일링 성능 최적화 p99 rps 병목 확장",
};
const FIND_CHIPS = ["데스크탑 프로그램","엑셀","자동화","이미지 리사이즈","가상환경",
                    "리스트 정렬","클래스","SQL 조인","코딩테스트","정규식",
                    "FastAPI 비동기","GIL","Celery 큐","대용량 처리","부하 테스트"];
const SEC_KW = {
  u09:"uv 워크스페이스 모노레포 락파일 uvlock locked ci 캐시 도커 멀티스테이지 재현성",
  i11:"이미지 배치 대량처리 썸네일 webp exif 회전 프로세스풀 멀티프로세싱 libvips 디컴프레션폭탄",
  i12:"ocr 문자인식 tesseract 영수증 명함 스캔 전처리 이진화 기울기보정 그림자제거 신뢰도",
  a11:"무인실행 스케줄러 작업스케줄러 실패알림 스크린샷 재시도 상태초기화 로깅 매크로운영",
  a12:"playwright 웹자동화 브라우저자동화 셀레니움대체 headless 다운로드 엑셀보고서 openpyxl",
  x11:"testcontainers 통합테스트 진짜db 롤백픽스처 계약테스트 respx 목 freezegun 시간고정",
  x12:"플레이키 flaky 랜덤순서 pytestrandomly xdist 병렬 재시도 reruns 커버리지 ci속도 마커",
  w01:"웹동작 요청응답 클라이언트 서버 dns 도메인 ip 포트 tcp tls keep-alive 무상태 stateless 브라우저 개발자도구 network",
  w02:"http메서드 get post put patch delete 멱등성 idempotent 상태코드 200 201 204 301 400 401 403 404 409 422 429 500 502 503 인증실패 권한없음",
  w03:"헤더 header 쿼리스트링 querystring 바디 body content-type json form-data urlencoded 파일업로드 curl url인코딩 authorization accept 쿠키",
  w04:"rest restful api설계 url규칙 자원 명사 복수형 버전 v1 페이징 안티패턴 에러응답 에러코드 응답형식",
  w05:"첫서버 fastapi 설치 uv init uvicorn 실행 hello world docs swagger 포트 8000 0.0.0.0 폴더구조 프로젝트구조",
  w06:"라우팅 경로파라미터 쿼리파라미터 바디 pydantic 모델 annotated query path body 검증 apirouter 파일업로드 폼 헤더 field_validator",
  w07:"응답모델 response_model 상태코드 httpexception 전역예외 exception_handler 검증실패 422 에러포맷 도메인예외 204",
  w08:"세션 session 쿠키 cookie jwt 토큰 httponly secure samesite 비교 선택 무상태 로그아웃 블랙리스트 인증방식",
  w09:"비밀번호 password 해시 hash bcrypt argon2 argon2id scrypt pbkdf2 salt 솔트 평문저장 sha256 금지 pwdlib 타이밍공격 로그인시도제한",
  w10:"jwt 발급 검증 리프레시 refresh 회전 rotation pyjwt access_token bearer oauth2passwordbearer depends 현재사용자 권한 admin 로그아웃 쿠키",
  w11:"cors 크로스오리진 동일출처 preflight options origin allow_origins https tls 인증서 letsencrypt sql인젝션 xss csrf 보안헤더 hsts 시크릿 env",
  w12:"django 장고 flask 플라스크 fastapi 비교 선택기준 orm 관리자 admin drf 최소앱 streamlit gradio 프레임워크선택",
  x01:"테스트왜 회귀 regression 리팩터링 자신감 수동확인 테스트피라미드 단위 통합 e2e 문서",
  x02:"pytest 설치 실행 assert 파일규칙 test_ 네이밍 -k -x --lf 마커 marker skip xfail pyproject 설정 modulenotfound",
  x03:"fixture 픽스처 conftest yield 정리 teardown scope session function autouse tmp_path monkeypatch caplog capsys 의존",
  x04:"parametrize 매개변수화 케이스 표 id pytest.param 조합 상태전이 반복제거",
  x05:"pytest.raises 예외테스트 match 경계값 boundary 빈리스트 approx 부동소수점 오차 decimal warns",
  x06:"mock 모킹 patch magicmock side_effect assert_called monkeypatch setenv setattr 시간고정 time-machine 랜덤 respx responses 외부api 의존성주입",
  x07:"fastapi테스트 testclient httpx asgitransport dependency_overrides 인증테스트 토큰 lifespan pytest-asyncio 비동기 api통합테스트",
  x08:"db테스트 트랜잭션 롤백 savepoint sqlalchemy 테스트db docker-compose postgres tmpfs testcontainers 팩토리 시드데이터 격리",
  x09:"커버리지 coverage pytest-cov cov-fail-under htmlcov ci github actions 워크플로 setup-uv 캐시 required check xdist 병렬 pre-commit",
  x10:"좋은테스트 aaa arrange act assert first 플레이키 flaky 순서의존 sleep 안티패턴 무엇을테스트 private 구현테스트 체크리스트",
  k01:"gil 전역인터프리터락 wsgi asgi 동기 비동기 파이썬느림 인스타그램",
  k02:"fastapi pydantic 의존성주입 depends 응답모델 swagger docs 설정검증",
  k03:"async await 블로킹 이벤트루프 requests httpx to_thread gather 세마포어 타임아웃",
  k04:"멀티프로세싱 processpool 코어 워커수 gunicorn uvicorn cpu바운드",
  k05:"sqlalchemy asyncpg 커넥션풀 pool_size n+1 selectinload 커서페이징 pgbouncer",
  k06:"redis 캐시 스탬피드 ttl 랜덤 락 로컬캐시 cachetools",
  k07:"동시성 재고 마이너스 경쟁조건 분산락 멱등성 idempotency 중복결제 for_update",
  k08:"celery 셀러리 작업큐 워커 재시도 beat flower arq dramatiq 백그라운드",
  k09:"대용량 청크 chunksize parquet polars duckdb 메모리 스트리밍 dtype",
  k10:"배치 스케줄 크론 airflow dag 중복실행 재시작 백필 apscheduler",
  k11:"배포 도커 dockerfile uv 쿠버네티스 무중단 graceful preStop 헬스체크 pythonunbuffered",
  k12:"관측 모니터링 로깅 structlog json로그 요청id 프로메테우스 메트릭 추적 opentelemetry 알람",
  k13:"부하테스트 locust 성능테스트 rps p99 slo 스트레스 스파이크",
  k14:"프로파일링 py-spy memray 성능최적화 orjson lru_cache 벡터화 병목",
  k15:"체크리스트 아키텍처 면접 전체그림 대규모설계",
  z01:"cpython 바이트코드 dis 컴파일 인터프리터 pyc 인터닝 specializing",
  z02:"객체모델 pyobject 참조카운팅 refcount getsizeof slots 메모리절약",
  z03:"gc 가비지컬렉션 순환참조 세대별 weakref 수거 gc.collect",
  z04:"메모리누수 tracemalloc memray objgraph 스냅샷 비교 rss",
  z05:"디스크립터 property cached_property __get__ __set__ getattr orm필드",
  z06:"메타클래스 metaclass type __init_subclass__ 클래스생성 abcmeta 자동등록",
  z07:"데코레이터 functools wraps 매개변수 재시도 컨텍스트매니저 paramspec",
  z08:"제너레이터 코루틴 yield from send 파이프라인 비동기제너레이터 itertools",
  z09:"asyncio 이벤트루프 취소 cancellederror shield taskgroup contextvars uvloop 디버그",
  z10:"gil 전역인터프리터락 free-threading 3.14 pep779 멀티프로세싱 하위인터프리터 서브인터프리터 interpreterpoolexecutor jit",
  z11:"c확장 cython numba rust pyo3 maturin 네이티브 wheel 고속화",
  z12:"타입 protocol typevar generic overload paramspec typeddict self mypy pyright 구조적타이핑",
  z13:"함수형 불변성 frozen dataclass partial singledispatch result 패턴",
  z14:"디자인패턴 싱글턴 전략 팩토리 어댑터 리포지토리 의존성주입 파이썬다운",
  z15:"보안 pickle 역직렬화 rce yaml eval subprocess 공급망 타이포스쿼팅 sql인젝션 경로순회 redos",
  z16:"아키텍처 계층 헥사고날 클린 ddd 의존성역전 폴더구조 유스케이스",
  p01:"실행 들여쓰기 인덴트 주석 docstring repl 스크립트 첫코드 헬로월드",
  p02:"변수 자료형 타입 int str float bool 형변환 캐스팅 타입힌트 연산자 나눗셈 몫 나머지",
  p03:"문자열 텍스트 글자 f-string 포맷 서식 자르기 붙이기 split join replace strip 정규식 re 치환",
  p04:"리스트 list 딕셔너리 dict 세트 set 튜플 tuple 배열 자료구조 중복제거 정렬 sort 카운터 counter defaultdict deque heapq bisect 슬라이싱 인덱스 언패킹",
  p05:"반복문 루프 for while 조건문 if else 분기 enumerate zip itertools match break continue 순회",
  p06:"컴프리헨션 한줄 축약 리스트컴프리헨션 제너레이터식 필터 map",
  p07:"함수 def 인자 파라미터 매개변수 반환 return 람다 lambda 클로저 기본값 가변인자 데코레이터 캐시 functools 재사용",
  p08:"복사 참조 얕은복사 깊은복사 deepcopy 가변 불변 원본 주소 공유",
  p09:"클래스 객체 self 상속 dataclass 생성자 메서드 속성 oop 인스턴스",
  p10:"모듈 패키지 import 임포트 경로 main 순환참조 폴더구조",
  p11:"예외 에러 오류 try except finally raise 파일 읽기 쓰기 open with 인코딩 utf-8 저장",
  p12:"제너레이터 yield 데코레이터 컨텍스트매니저 with 타입힌트 프로토콜 제네릭 메모리",
  p13:"ai 질문 프롬프트 chatgpt gpt 클로드 claude 코파일럿 질문법 물어보기",
  p14:"에러 오류 traceback 트레이스백 빨간글씨 디버깅 디버그 breakpoint 예외 syntaxerror nameerror typeerror valueerror indexerror keyerror 안될때 해결",
  p15:"내장함수 builtin len sum sorted zip enumerate any all range print input 진리값 truthy 삼항 기본기 레퍼런스 사전",
  p16:"치트시트 요약 로드맵 학습순서 java 자바 대조 비교 문법정리 한장 템플릿 스크립트 뼈대",
  s19:"문자열 텍스트 글자 str 접근자 공백제거 strip split 나누기 replace 치환 extract 추출 정규식 contains 포함 검색 zfill 코드 전화번호 주소 파싱 이메일",
  s20:"구간 등급 분류 cut qcut 범주형 category 중복 duplicated drop_duplicates 교차표 crosstab 더미 get_dummies 순위 rank 상위 nlargest 표본 sample where mask clip explode",
  s21:"에러 오류 경고 warning keyerror settingwithcopy 빨간글씨 안될때 해결 truth value ambiguous 인코딩 깨짐 utf-8 cp949 nan 병합 중복",
  s22:"찾기 색인 인덱스 목록 기능 사전 뭐부터 어떻게 방법 검색 목적별 하고싶은",
  s08:"벡터화 속도 성능 빠르게 느림 apply 반복문 파생컬럼 컬럼연산",
  a01:"매크로 좌표 컨트롤 pywinauto pyautogui 선택 비교",
  q01:"설치 시작 데스크탑 프로그램 첫걸음",
  q02:"첫창 윈도우 창만들기 실행",
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

/* --- 마이크로 시각화 빌더: [data-viz] 를 셀·막대·창 DOM으로 전개 --- */
function vizBuild(root){
  $$(".mv[data-viz]", root || document).forEach(mv => {
    if (mv.dataset.built) return;
    mv.dataset.built = "1";
    const type = mv.dataset.viz;
    const n = +(mv.dataset.n || 10);
    const cell = () => { const i = document.createElement("i"); mv.appendChild(i); return i; };

    if (type === "scan"){                       // 포인터가 훑고 지나감 (O(n) 탐색)
      for (let k = 0; k < n; k++){
        const c = cell();
        c.style.animation = "vPulse 2.6s linear infinite";
        c.style.animationDelay = (k * 0.22) + "s";
      }
    }
    else if (type === "seqfill"){               // 한 칸씩 차례로 채워짐 (순차 처리)
      for (let k = 0; k < n; k++){
        const c = cell();
        c.style.animation = "vHold 3.4s linear infinite";
        c.style.animationDelay = (k * 0.3) + "s";
      }
    }
    else if (type === "allflash"){              // 전부 동시에 켜짐 (벡터화)
      for (let k = 0; k < n; k++){
        const c = cell();
        c.style.animation = "vHold 2.6s linear infinite";
      }
    }
    else if (type === "grid"){                  // 5×5 격자 행 우선 채움 (O(n²))
      mv.classList.add("grid9");
      for (let k = 0; k < 25; k++){
        const c = cell();
        c.style.width = c.style.height = "11px"; c.style.flexBasis = "11px";
        c.style.animation = "vHold 3.8s linear infinite";
        c.style.animationDelay = (k * 0.09) + "s";
      }
    }
    else if (type === "half"){                  // 절반씩 줄어드는 막대 (O(log n))
      mv.innerHTML = '<div class="hbt"><div class="hb"></div></div>';
    }
    else if (type === "jump"){                  // 해시 점프 (O(1)) — 래퍼 기준 좌표
      const t = +(mv.dataset.t || 6);
      const wrap = document.createElement("span");
      wrap.className = "cells";
      mv.appendChild(wrap);
      for (let k = 0; k < n; k++){
        const c = document.createElement("i");
        if (k === t) c.classList.add("jt");
        wrap.appendChild(c);
      }
      const d = document.createElement("span");
      d.className = "dot";
      d.style.setProperty("--jx", (t * 16) + "px");   // 셀13 + 간격3
      wrap.appendChild(d);
    }
    else if (type === "lane1"){                 // 순차 작업 1줄
      const lane = document.createElement("div"); lane.className = "lane";
      mv.appendChild(lane);
      for (let k = 0; k < 8; k++){
        const c = document.createElement("i"); lane.appendChild(c);
        c.style.animation = "vHold 3.6s linear infinite";
        c.style.animationDelay = (k * 0.34) + "s";
      }
    }
    else if (type === "lane4"){                 // 4레인 동시 작업
      const wrap = document.createElement("div"); wrap.className = "lanes";
      mv.appendChild(wrap);
      for (let L = 0; L < 4; L++){
        const lane = document.createElement("div"); lane.className = "lane";
        wrap.appendChild(lane);
        for (let k = 0; k < 2; k++){
          const c = document.createElement("i");
          c.style.width = c.style.height = "9px"; c.style.flexBasis = "9px";
          lane.appendChild(c);
          c.style.animation = "vHold 3.6s linear infinite";
          c.style.animationDelay = (k * 0.34) + "s";   // 레인끼리는 동시 시작
        }
      }
    }
    else if (type === "coordmiss"){             // 좌표 클릭: 창이 움직이면 빗나감
      mv.classList.add("mcoord");
      mv.innerHTML = `<span class="scene"><div class="cwin"><span class="cbtn">저장</span></div>
        <span class="aim fixed"></span>
        <span class="verdict">✗ 빗나감</span></span>`;
    }
    else if (type === "coordhit"){              // 컨트롤 클릭: 버튼을 따라감
      mv.classList.add("mcoord");
      mv.innerHTML = `<span class="scene"><div class="cwin"><span class="cbtn">저장</span><span class="aim"></span></div>
        <span class="verdict">✓ 명중</span></span>`;
    }
    else if (type === "pipe3"){                 // 3단 파이프라인: A → B → C
      const labs = (mv.dataset.labels || "A|B|C").split("|");
      const pipe = document.createElement("div"); pipe.className = "pipe";
      labs.forEach((t2, k) => {
        const nd = document.createElement("span");
        nd.className = "pnode"; nd.textContent = t2;
        nd.style.animationDelay = [0, 1.1, 2.45][k] + "s";
        pipe.appendChild(nd);
      });
      const d = document.createElement("span"); d.className = "pdot flow3";
      pipe.appendChild(d);
      mv.appendChild(pipe);
    }
    else if (type === "pipe2req"){              // 요청 → / ← 응답
      const labs = (mv.dataset.labels || "내 코드|서버").split("|");
      const pipe = document.createElement("div"); pipe.className = "pipe g2";
      labs.forEach((t2, k) => {
        const nd = document.createElement("span");
        nd.className = "pnode"; nd.textContent = t2;
        nd.style.animationDelay = [0, 1.5][k] + "s";
        nd.style.animationDuration = "4.4s";
        pipe.appendChild(nd);
      });
      pipe.insertAdjacentHTML("beforeend",
        '<span class="pdot req"></span><span class="pdot res"></span>');
      mv.appendChild(pipe);
    }
    else if (type === "pipe2move"){             // 파일이 폴더 → 폴더로 이동
      const labs = (mv.dataset.labels || "원본|대상").split("|");
      const pipe = document.createElement("div"); pipe.className = "pipe g2";
      labs.forEach((t2, k) => {
        const nd = document.createElement("span");
        nd.className = "pnode"; nd.textContent = t2;
        nd.style.animationDelay = [0, 2.2][k] + "s";
        nd.style.animationDuration = "4s";
        pipe.appendChild(nd);
      });
      pipe.insertAdjacentHTML("beforeend", '<span class="pdot mov"></span>');
      mv.appendChild(pipe);
    }
    else if (type === "watch"){                 // 파일 감지 → 함수 점화
      const pipe = document.createElement("div"); pipe.className = "pipe";
      pipe.innerHTML =
        `<span class="pnode wsrc" style="animation:none">📁 수신폴더<span class="wfile"></span></span>
         <span class="warr">⚡</span>
         <span class="pnode" style="animation-delay:1.35s;animation-duration:4.4s">처리 함수 실행</span>`;
      mv.appendChild(pipe);
    }
    else if (type === "retry"){                 // 지수 백오프 재시도
      const tr = document.createElement("span"); tr.className = "rtrack";
      tr.innerHTML = '<span class="rline"></span>';
      [[4,"f",0],[30,"f",.5],[70,"f",1.3],[132,"k",2.9]].forEach(([x, cls, dl]) => {
        const d = document.createElement("span");
        d.className = "rdot " + cls;
        d.style.left = x + "px";
        d.style.animationDelay = dl + "s";
        tr.appendChild(d);
      });
      mv.appendChild(tr);
    }
  });
}

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
   1. 공통 데이터셋
   ============================================================ */
const DATA = [
  {i:0, 이름:"김민준", 팀:"A", 지역:"서울", 매출:320, 만족도:4.5},
  {i:1, 이름:"이서연", 팀:"B", 지역:"부산", 매출:210, 만족도:4.1},
  {i:2, 이름:"박지훈", 팀:"A", 지역:"서울", 매출:450, 만족도:4.8},
  {i:3, 이름:"최유진", 팀:"C", 지역:"대구", 매출:180, 만족도:3.9},
  {i:4, 이름:"정하늘", 팀:"B", 지역:"부산", 매출:390, 만족도:null},
  {i:5, 이름:"강도윤", 팀:"C", 지역:"대구", 매출:275, 만족도:4.2},
];
const nz = v => v === null ? '<span class="nan">NaN</span>' : v;

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

