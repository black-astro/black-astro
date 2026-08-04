/* ============================================================
   1. 탭 전환 · 난이도 배지 · 「쉽게 말하면」 요약
   ============================================================ */
const TAB_INIT = {};                       // 탭별 최초 1회 초기화 등록소
const tabReady = new Set(["core"]);
let currentTab = "core";

function switchTab(name){
  if (!$("#pane-" + name)) return;
  currentTab = name;
  $$(".pane").forEach(p => p.classList.toggle("on", p.id === "pane-" + name));
  $$(".navset").forEach(n => n.classList.toggle("on", n.dataset.nav === name));
  $$(".navtab button").forEach(b => b.classList.toggle("on", b.dataset.t === name));
  $$(".tabbar .tabs button").forEach(b => {
    const on = b.dataset.t === name;
    b.classList.toggle("on", on);
    b.setAttribute("aria-selected", on ? "true" : "false");
    if (on) b.scrollIntoView({block:"nearest", inline:"nearest"});
  });
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
  try { sessionStorage.setItem("jvg-tab", name); } catch(e) {}

  requestAnimationFrame(() => {
    $$(".pane.on .rv").forEach(e => {
      if (e.getBoundingClientRect().top < innerHeight) e.classList.add("in");
    });
  });
}

/* 주제 탭 드롭다운 (전 해상도 공통) */
const TAB_LABEL = {
  core:"☕ Java 기초", adv:"🧬 Java 고급·동시성", boot:"🍃 Spring Boot Web",
  flux:"🌊 WebFlux", data:"🗄️ 데이터 · JPA", sec:"🔐 Security",
  gw:"🚪 Gateway", tool:"🧰 실전 도구", fx:"🖥️ JavaFX",
  scale:"⚡ 대규모 트래픽",
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
  /* core */ j01:"b",j02:"b",j03:"b",j04:"b",j05:"b",j06:"i",j07:"i",j08:"b",
             j09:"i",j10:"i",j11:"i",j12:"i",j13:"i",j14:"b",j15:"b",j16:"a",j17:"b",
  /* adv  */ a01:"a",a02:"a",a03:"i",a04:"i",a05:"a",a06:"a",a07:"a",a08:"a",
             a09:"a",a10:"a",a11:"a",a12:"b",a13:"a",
  /* boot */ b01:"b",b02:"b",b03:"b",b04:"i",b05:"b",b06:"b",b07:"b",b08:"b",
             b09:"i",b10:"i",b11:"a",b12:"i",b13:"i",b14:"i",b15:"i",b16:"i",b17:"a",
  /* flux */ f01:"b",f02:"i",f03:"i",f04:"a",f05:"i",f06:"i",f07:"a",f08:"a",
             f09:"a",f10:"a",f11:"i",f12:"a",
  /* data */ d01:"b",d02:"i",d03:"b",d04:"b",d05:"i",d06:"i",d07:"i",d08:"a",
             d09:"i",d10:"a",d11:"i",d12:"i",d13:"i",d14:"a",d15:"i",d16:"i",d17:"a",
  /* sec  */ s01:"b",s02:"b",s03:"b",s04:"b",s05:"a",s06:"a",s07:"i",s08:"i",
             s09:"a",s10:"b",
  /* gw   */ g01:"b",g02:"b",g03:"i",g04:"i",g05:"a",g06:"a",g07:"a",g08:"i",
             g09:"a",
  /* tool */ t01:"b",t02:"b",t03:"b",t04:"i",t05:"b",t06:"b",t07:"a",t08:"i",
             t09:"i",t10:"i",t11:"i",t12:"i",t13:"b",
  /* fx   */ x01:"b",x02:"b",x03:"b",x04:"b",x05:"b",x06:"i",x07:"i",x08:"b",
             x09:"a",x10:"i",
  /* scale*/ k01:"b",k02:"i",k03:"i",k04:"i",k05:"a",k06:"a",k07:"a",k08:"i",
             k09:"a",k10:"a",k11:"a",k12:"a",k13:"a",k14:"i",k15:"i",k16:"b",
};

/* 🐣 '쉽게 말하면' — 섹션마다 붙는 한 줄 번역 (항상 표시) */
const EZ = {
 j01:"자바는 <b>JDK</b>만 깔면 시작할 수 있어요. 실무에서는 Gradle이 라이브러리 내려받기·빌드를 대신해 줍니다.",
 j02:"숫자는 int·long, 실수는 double, 참/거짓은 boolean. 타입을 적기 귀찮으면 <b>var</b>를 쓰면 돼요.",
 j03:"글자 비교는 <code>==</code>가 아니라 <b>equals()</b>. 여러 줄 문자열은 <b>\"\"\"</b>로 감싸면 그대로 들어갑니다.",
 j04:"<b>switch가 값을 돌려주는 식</b>으로 바뀌었어요. <code>case A -> \"a\";</code> 형태면 break가 필요 없습니다.",
 j05:"클래스 = 데이터 + 기능 묶음. 필드는 <b>private</b>, 만들 때 검증하면 뒤쪽 코드가 편해집니다.",
 j06:"상속은 “~이다”, 인터페이스는 “~할 수 있다”. 실무에선 <b>인터페이스를 훨씬 많이</b> 씁니다.",
 j07:"데이터만 담는 클래스는 <b>record</b> 한 줄. 정해진 값만 쓰려면 <b>enum</b>. 파이썬의 dataclass와 같은 역할이에요.",
 j08:"목록은 <b>List</b>, 이름표로 찾으면 <b>Map</b>, 중복 제거는 <b>Set</b>. “있는지 확인”이 반복문 안에 있으면 Set으로 바꾸세요.",
 j09:"<code>List&lt;String&gt;</code>의 꺾쇠가 제네릭이에요. “여기엔 String만 들어간다”를 컴파일러에게 알려 주는 겁니다.",
 j10:"<code>-></code> 하나로 동작을 값처럼 넘길 수 있어요. 파이썬의 lambda와 같은 개념입니다.",
 j11:"반복문을 <b>거르고(filter) → 바꾸고(map) → 모으는(toList)</b> 흐름으로 바꾸는 문법이에요. SQL 감각과 비슷합니다.",
 j12:"“값이 없을 수도 있다”를 타입으로 알려 주는 상자예요. <b>반환 타입에만</b> 쓰세요.",
 j13:"내가 <b>여기서 대처할 수 있는 것만</b> 잡고, 못 하면 위로 던지세요. <code>catch { }</code> 빈 채로 두는 게 최악입니다.",
 j14:"Date는 잊고 <b>LocalDate·LocalDateTime</b>만 쓰세요. 계산해도 원본이 안 바뀌어서 안전합니다.",
 j15:"<code>Files.readString(경로)</code> 한 줄이면 파일을 읽어요. 인코딩(UTF-8)은 <b>항상 명시</b>하세요.",
 j16:"<code>if (o instanceof User u)</code> 처럼 <b>검사하면서 변수까지</b> 만들어져요. 형변환 코드가 사라집니다.",
 j17:"막힐 때 찾아보는 한 장 요약과, 무엇을 어떤 순서로 배울지 정리한 지도예요.",

 a01:"객체는 <b>힙</b>, 메서드 변수는 <b>스택</b>에 저장돼요. OOM은 대개 힙에 뭔가 계속 쌓여서 납니다.",
 a02:"자바가 안 쓰는 객체를 대신 치워 줘요(GC). 대신 <b>치우는 동안 잠깐 멈춥니다.</b>",
 a03:"Set·Map의 키로 쓸 객체는 <b>equals와 hashCode를 같이</b> 만들어야 해요. record면 자동입니다.",
 a04:"스레드 = 동시에 도는 일꾼. 웹 서버는 이미 스레드 위에서 돌고 있어요.",
 a05:"<code>count++</code>는 여러 스레드가 동시에 하면 <b>값이 틀어집니다.</b> AtomicInteger나 synchronized가 필요해요.",
 a06:"스레드를 직접 만들지 말고 <b>ExecutorService</b>(스레드 풀)에 맡기세요.",
 a07:"여러 API를 <b>동시에 호출해서 합치기</b>에 쓰는 도구예요. <code>zip</code>처럼 묶을 수 있습니다.",
 a08:"Java 21의 가장 큰 변화. <b>설정 한 줄</b>로 동시 처리량이 크게 올라가는데 <b>코드는 그대로</b>예요.",
 a09:"여러 비동기 작업을 <b>하나의 묶음</b>으로 다뤄서, 하나가 실패하면 나머지도 자동으로 취소되게 합니다.",
 a10:"느린 곳을 <b>추측하지 말고 측정</b>하세요. 웹에서는 대부분 DB 쿼리가 범인입니다.",
 a11:"스프링의 <code>@Transactional</code>이 “마법처럼” 도는 원리예요. 프록시가 앞뒤에 코드를 끼워 넣습니다.",
 a12:"빨간 에러가 떴을 때 찾아보는 사전이에요. 스택 트레이스는 <b>내 패키지가 나오는 줄</b>부터 보세요.",
 a13:"도커 안에서는 <code>-Xmx</code> 대신 <b>비율(MaxRAMPercentage)</b>로 주세요. 힙을 100% 주면 반드시 죽습니다.",

 b01:"스프링이 하는 일은 <b>객체를 대신 만들어 넣어 주고</b>, 흔한 설정을 미리 다 해 두는 거예요.",
 b02:"start.spring.io에서 만들고 <code>./gradlew bootRun</code>. 5분이면 서버가 뜹니다.",
 b03:"<code>@Service</code>를 붙이고 <b>생성자로 받기만</b> 하면 스프링이 알아서 넣어 줘요. 필드 주입은 쓰지 마세요.",
 b04:"“마법”이 아니라 조건부 설정이에요. <code>debug: true</code>를 켜면 <b>뭐가 적용됐고 왜 안 됐는지</b> 다 나옵니다.",
 b05:"환경별 설정은 <b>프로파일</b>로 나눠요. 비밀번호는 yml이 아니라 <b>환경 변수</b>에.",
 b06:"URL과 메서드를 연결하는 곳이에요. <b>로직은 여기 두지 말고</b> 서비스로 넘기세요.",
 b07:"<b>엔티티를 그대로 주고받지 마세요.</b> 필요한 필드만 담은 DTO(record)를 쓰면 사고가 크게 줍니다.",
 b08:"<code>@NotNull</code> 같은 걸 붙이고 컨트롤러에 <code>@Valid</code>를 달면 <b>입구에서 걸러집니다.</b>",
 b09:"컨트롤러마다 try/catch 하지 말고 <b>한 곳에서 전부 받아</b> 같은 형식으로 응답하세요.",
 b10:"컨트롤러는 얇게, 서비스는 규칙, 엔티티는 상태 변경. 각자 <b>안 하는 일</b>이 더 중요해요.",
 b11:"“모든 메서드에 로그 남기기” 같은 걸 한 곳에 모으는 기능이에요. <b>자기 자신을 호출하면 안 먹습니다.</b>",
 b12:"주기 실행은 <code>@Scheduled</code>, 백그라운드는 <code>@Async</code>, 결과 재사용은 <code>@Cacheable</code>.",
 b13:"업로드는 <b>파일명을 믿지 말고</b> UUID로 바꿔 저장. 다운로드는 <b>한글 파일명 인코딩</b>이 핵심입니다.",
 b14:"테스트는 “잘 만든 증거”가 아니라 <b>고쳐도 안 깨진다는 보험</b>이에요.",
 b15:"서버가 살아 있는지, 어디가 느린지를 코드 없이 알려 줘요. <b>운영에서는 꼭 막아 두세요.</b>",
 b16:"jar 하나로 끝나요. 배포 전에 <code>ddl-auto: validate</code>인지만은 꼭 확인하세요.",
 b17:"배포할 때 잠깐 <b>502</b>가 뜬다면 <code>graceful</code> 종료와 <code>preStop</code>이 빠진 겁니다. 두 줄이면 무중단이 됩니다.",

 f01:"WebFlux는 “빠른 서버”가 아니라 <b>적은 스레드로 많은 연결을 버티는</b> 서버예요. 아무 데나 쓰면 손해입니다.",
 f02:"Mono는 1개, Flux는 여러 개. 둘 다 <b>“나중에 올 값”을 담은 상자</b>예요. 반환해야 실행됩니다.",
 f03:"<b>map은 그냥 변환</b>, <b>flatMap은 또 다른 비동기 호출</b>을 이어붙일 때. 이거 하나가 제일 헷갈립니다.",
 f04:"여기서 사고가 제일 많이 나요. <b>블로킹 코드 하나가 서버 전체를 멈춥니다.</b>",
 f05:"MVC와 거의 같아요. 반환 타입만 <code>Mono</code>/<code>Flux</code>로 바뀝니다.",
 f06:"논블로킹 HTTP 호출 도구. <b>타임아웃을 꼭 설정</b>하세요.",
 f07:"주는 쪽이 받는 쪽보다 빠를 때 <b>“천천히 주세요”</b>라고 말하는 기능이에요.",
 f08:"연결을 열어 두고 계속 보내는 실시간 기능. WebFlux가 가장 빛나는 영역입니다.",
 f09:"WebFlux에서 JPA(JDBC)를 쓰면 이점이 사라져요. <b>R2DBC가 논블로킹 DB 드라이버</b>입니다.",
 f10:"<code>@Transactional</code>이 그대로 되지만, <b>체인으로 이어 붙인 것만</b> 롤백에 포함됩니다.",
 f11:"try/catch로는 못 잡아요. <code>onErrorResume</code> 같은 <b>연산자</b>로 처리합니다.",
 f12:"리액티브의 가장 큰 비용은 <b>디버깅 난이도</b>예요. <code>log()</code>와 <code>checkpoint()</code>를 익혀 두세요.",

 d01:"보통 <b>JPA + QueryDSL</b>을 기본으로 두고, 복잡한 통계만 MyBatis로 빼요. 섞어 써도 전혀 이상하지 않습니다.",
 d02:"DB 연결은 <b>개수가 정해진 자원</b>이에요. 풀은 크게 잡을수록 오히려 느려집니다.",
 d03:"인터페이스만 선언하면 <code>save</code>·<code>findById</code> 같은 게 <b>자동으로 생깁니다.</b>",
 d04:"엔티티는 DB 테이블과 이어진 객체예요. <b>@Setter를 열지 말고</b> enum은 반드시 STRING으로.",
 d05:"규칙 셋만 기억하세요 — <b>전부 LAZY</b>, 주인은 FK를 가진 쪽, <b>@ManyToMany는 쓰지 않기.</b>",
 d06:"save()를 안 했는데 UPDATE가 나가는 이유가 여기 있어요. JPA가 <b>변경을 자동으로 감지</b>합니다.",
 d07:"메서드 이름으로 안 되면 <code>@Query</code>로 직접 씁니다. <b>DTO로 바로 받으면</b> 훨씬 빨라요.",
 d08:"목록 100건 조회에 <b>쿼리가 101번</b> 나가는 문제예요. <b>페치 조인</b>이나 batch size로 해결합니다.",
 d09:"설정만 한 번 넘기면 그 뒤론 편해요. 문자열 쿼리의 오타를 <b>컴파일 때</b> 잡아 줍니다.",
 d10:"검색 조건이 <b>있을 수도 없을 수도</b> 있을 때 최고예요. null이면 조건이 자동으로 빠집니다.",
 d11:"목록 화면은 거의 페이징이에요. <b>깊은 페이지는 느리니</b> 무한 스크롤은 커서 방식으로.",
 d12:"SQL을 직접 쓰고 결과를 객체에 매핑해요. <code>#{}</code>를 쓰세요 — <code>${}</code>는 <b>SQL 인젝션</b> 위험!",
 d13:"조건에 따라 <b>SQL 자체가 달라지게</b> 만들 수 있어요. MyBatis의 진짜 강점입니다.",
 d14:"“왜 롤백이 안 되지?”의 원인은 <b>5가지로 정해져</b> 있어요. 특히 자기 호출과 예외 삼키기.",
 d15:"<code>ddl-auto</code>에 스키마를 맡기면 운영에서 <b>데이터가 날아갑니다.</b> Flyway로 관리하세요.",
 d16:"기술을 하나로 통일하려 애쓰지 마세요. <b>대량 배치는 JdbcTemplate</b>이 훨씬 빠릅니다.",
 d17:"수백만 건을 <b>1,000건씩 끊어서</b> 처리하고, 실패하면 <b>그 지점부터 다시</b> 시작해 주는 도구예요.",

 s01:"시큐리티는 결국 <b>필터 묶음</b>이에요. 요청이 컨트롤러에 닿기 <b>전에</b> 여길 지나갑니다.",
 s02:"Security 6부터는 람다 문법만 써요. <b>requestMatchers는 위에서부터</b> 순서대로 적용됩니다.",
 s03:"서버가 화면까지 그리는 웹이면 <b>세션 방식이 더 단순하고 안전</b>해요. 무조건 JWT가 정답은 아닙니다.",
 s04:"비밀번호는 <b>절대 평문 저장 금지</b>. <code>passwordEncoder.encode()</code>를 꼭 거치세요.",
 s05:"SPA·모바일의 표준 방식. <b>토큰 안에 민감 정보를 넣지 마세요</b> — 누구나 열어볼 수 있습니다.",
 s06:"구글·카카오 로그인. 스프링이 대부분 해 주고, 우리는 <b>사용자 정보를 저장하는 부분만</b> 만듭니다.",
 s07:"URL로 못 막는 “<b>자기 것만 수정 가능</b>” 같은 규칙을 다뤄요.",
 s08:"CORS 에러는 <b>브라우저가 막는 것</b>이라 서버 로그엔 200이 찍혀요. JWT 헤더 방식이면 CSRF는 꺼도 됩니다.",
 s09:"WebFlux는 스레드가 계속 바뀌어서 <code>SecurityContextHolder</code>가 <b>안 통합니다.</b>",
 s10:"보안 사고는 화려한 공격이 아니라 <b>기본을 빠뜨려서</b> 나요. 가장 흔한 건 <b>남의 데이터 조회</b>입니다.",

 g01:"서비스가 여러 개일 때 <b>인증·로깅을 한 곳에 모으는</b> 관문이에요. 1~2개면 필요 없습니다.",
 g02:"“이 경로는 저 서비스로” 규칙을 적는 곳. YAML로도 자바 코드로도 됩니다.",
 g03:"“이 요청을 이 라우트로 보낼지” 판단하는 조건들이에요. <b>Path</b>가 제일 많이 쓰입니다.",
 g04:"지나가는 요청·응답을 손보는 장치예요. <code>StripPrefix</code>가 가장 자주 쓰입니다.",
 g05:"게이트웨이에서 <b>토큰을 한 번만 검사</b>하고, 결과를 헤더로 뒤에 넘겨 주는 게 핵심 패턴이에요.",
 g06:"한 서비스가 죽었을 때 <b>계속 때리지 않고 즉시 대체 응답</b>을 주는 안전장치입니다.",
 g07:"과도한 요청을 막고 여러 인스턴스에 골고루 분배해요. <b>로그인은 IP 기준으로 빡빡하게.</b>",
 g08:"실제로 돌아가는 설정 한 벌이에요. <b>클라이언트가 보낸 내부 헤더는 반드시 지우세요.</b>",
 g09:"서비스 주소를 <b>IP가 아니라 이름</b>으로 부르고, 흩어진 로그를 <b>추적 ID 하나</b>로 이어 보는 방법이에요.",

 t01:"<code>@RequiredArgsConstructor</code>와 <code>@Slf4j</code> 두 개만 써도 코드가 확 줄어요. <b>엔티티에 @Data는 금지.</b>",
 t02:"운영에서 문제가 나면 <b>남은 로그가 전부</b>예요. <code>log.info(\"값 {}\", v)</code> 형태로 쓰세요.",
 t03:"JSON ↔ 객체 변환. 외부 API를 받을 땐 <b>모르는 필드는 무시</b>하도록 꼭 설정하세요.",
 t04:"엔티티 ↔ DTO 변환 코드를 자동 생성해 줘요. 필드가 적으면 <code>from()</code> 직접 만드는 게 더 낫습니다.",
 t05:"“엑셀 올리면 DB에 넣어 주세요” 요청용. <b>빈 셀·날짜·앞자리 0</b>에서 거의 항상 막힙니다.",
 t06:"“결과를 엑셀로 받고 싶어요” 요청용. <b>한글 파일명 인코딩</b>만 조심하면 됩니다.",
 t07:"수만 행이 넘으면 일반 방식은 <b>반드시 메모리가 터져요.</b> SXSSF나 CSV로 가세요.",
 t08:"공공기관 연동에서 아직 많이 써요. <b>외부 XML은 XXE 방어를 꼭</b> 켜세요.",
 t09:"JUnit5 + Mockito + AssertJ 조합이 표준이에요.",
 t10:"<code>NoSuchMethodError</code>가 뜨면 거의 <b>같은 라이브러리 버전이 두 개</b> 들어온 겁니다.",
 t11:"MVC 신규 코드는 <b>RestClient</b>. 외부 호출엔 <b>타임아웃을 반드시</b> 넣으세요.",
 t12:"테스트할 때 <b>진짜 DB를 도커로 잠깐 띄웠다</b> 지워요. H2에서만 통과하는 가짜 초록불을 막아 줍니다.",
 t13:"“이거 하려면 뭘 써야 하지?”를 한글로 검색하세요.",

 x01:"Java 11부터 JavaFX는 <b>따로 넣어야</b> 해요. 파이썬의 PySide6와 구조가 거의 같습니다.",
 x02:"<b>Stage(창) → Scene(장면) → Node(요소)</b> 구조예요. 이것만 알면 나머지는 조립입니다.",
 x03:"메인 화면은 <b>BorderPane</b>(상하좌우중앙), 폼은 <b>GridPane</b>, 줄 세우기는 VBox·HBox.",
 x04:"입력창·표·차트 등 자주 쓰는 UI 요소 모음이에요.",
 x05:"<b>바인딩</b>을 쓰면 “값 바뀔 때마다 화면 갱신” 코드가 아예 사라져요.",
 x06:"화면을 코드가 아니라 XML로 분리해요. <b>Scene Builder로 드래그&amp;드롭</b>해서 그릴 수 있습니다.",
 x07:"업무용 프로그램의 90%는 결국 <b>표</b>예요. 검색·정렬·편집까지 여기서 다 됩니다.",
 x08:"웹 CSS와 거의 같아요. 속성 앞에 <code>-fx-</code>만 붙습니다.",
 x09:"<b>화면이 얼어붙는 원인이 전부 여기</b> 있어요. 오래 걸리는 일은 <b>Task</b>로 빼세요.",
 x10:"<code>jpackage</code>로 만들면 사용자가 <b>자바를 안 깔아도</b> 돌아가는 설치 파일이 나옵니다.",

 k01:"“느리다” 대신 <b>초당 몇 건(RPS)·상위 1%가 몇 초(p99)</b>로 말하는 연습이에요. 평균은 거의 항상 거짓말을 합니다.",
 k02:"느린 원인은 대개 <b>DB 커넥션 10개</b>에서 막혀 있어요. 스레드를 늘리는 건 그다음 문제입니다.",
 k03:"자주 읽고 잘 안 바뀌는 것만 <b>따로 보관</b>해 두는 겁니다. 값이 바뀌면 <b>고치지 말고 지우세요.</b>",
 k04:"Redis는 <b>혼자 일하는 아주 빠른 창고</b>예요. <code>KEYS *</code> 한 줄이면 그 창고 전체가 멈춥니다.",
 k05:"캐시가 <b>동시에 만료되는 순간</b>이 가장 위험해요. 유효 시간에 <b>랜덤 몇 초</b>만 섞어도 크게 달라집니다.",
 k06:"서버가 2대가 되는 순간 <code>synchronized</code>는 무용지물이에요. <b>“읽고→판단하고→쓰기”를 한 문장으로</b> 합치세요.",
 k07:"같은 요청이 두 번 오는 건 <b>정상</b>이에요. 두 번 와도 <b>결과가 한 번</b>이 되게 만드는 게 멱등성입니다.",
 k08:"급하지 않은 일(알림·정산)을 <b>쪽지함에 던져 두고</b> 응답부터 돌려주는 방식이에요.",
 k09:"실무 정답은 <b>“중복은 오되 유실은 없게”</b>. 중복은 k07 멱등성으로 흡수합니다.",
 k10:"DB 저장과 메시지 발송 <b>사이에 서버가 죽으면</b> 생기는 사고를, 같은 DB에 같이 적어 두는 것으로 막습니다.",
 k11:"고장 난 곳에 계속 전화를 걸지 않는 장치예요. <b>타임아웃 하나만 넣어도</b> 장애의 절반이 막힙니다.",
 k12:"다 받아 주다 같이 죽느니 <b>일부를 정중히 거절</b>하는 게 낫습니다. <code>429</code> + “언제 다시 오세요”.",
 k13:"샤딩부터 떠올리지 마세요. <b>인덱스 한 줄</b>로 끝나는 경우가 압도적으로 많습니다.",
 k14:"안 보이면 못 고쳐요. <b>지표·로그·추적</b> 세 가지를 처음부터 같이 만듭니다.",
 k15:"“몇 명까지 버팁니까?”의 답은 <b>재 봐야</b> 나옵니다. 목표 숫자를 먼저 정하고 시작하세요.",
 k16:"지금까지의 내용을 <b>한 장</b>으로. 배포 전 체크리스트와 면접 답변 뼈대입니다.",
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

/* 키보드 1~9·0 으로 탭 전환 (0 = 10번째 탭) */
const TAB_ORDER = ["core","adv","boot","flux","data","sec","gw","tool","fx","scale"];
document.addEventListener("keydown", e => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  const t = e.target.tagName;
  if (t === "INPUT" || t === "TEXTAREA") return;
  const i = "1234567890".indexOf(e.key);
  if (i >= 0 && TAB_ORDER[i]) { switchTab(TAB_ORDER[i]); return; }
  if (e.key.toLowerCase() === "p") perfToggle?.();
});
