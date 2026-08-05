/* ============================================================
   2. 데모 — 눌러 가며 확인하는 위젯들
   ============================================================ */

/* ── w03 · 4대 웹서버 비교 카드 ────────────────────────────── */
const SV_INFO = {
  nginx: {
    t: "Nginx",
    d: "이벤트 기반 구조로 <b>적은 자원으로 많은 동시 접속</b>을 처리합니다. " +
       "정적 파일 서빙과 리버스 프록시가 특히 강하며, 오늘날 가장 널리 쓰입니다.",
    good: "<b>강점</b> — 낮은 메모리 사용, 뛰어난 동시성, 간결한 설정 문법, 압도적인 자료와 사례, 로드 밸런싱·캐시 내장",
    bad: "<b>주의</b> — 동적 언어를 직접 실행하지 못해 항상 뒤에 앱 서버가 필요, .htaccess 같은 디렉터리별 설정 없음, " +
         "일부 고급 기능은 상용판(Nginx Plus)에만 존재",
    use: "거의 모든 웹 서비스의 앞단, API 게이트웨이, 정적 사이트, 로드 밸런서",
  },
  apache: {
    t: "Apache HTTP Server",
    d: "가장 오래된 웹서버로 <b>모듈 생태계가 방대</b>합니다. " +
       "디렉터리별 설정(.htaccess)과 강력한 URL 재작성이 특징입니다.",
    good: "<b>강점</b> — 풍부한 모듈, .htaccess 로 권한 분리 가능(공유 호스팅), mod_rewrite 의 표현력, 오래된 자료가 많음",
    bad: "<b>주의</b> — 기본 구조상 동시 접속당 자원 사용이 큼(MPM 선택으로 완화), " +
         ".htaccess 는 요청마다 파일을 읽어 성능 저하, 설정이 장황함",
    use: "기존 레거시 시스템, 공유 호스팅, PHP·워드프레스 전통 구성",
  },
  tomcat: {
    t: "Apache Tomcat",
    d: "<b>웹서버가 아니라 자바 애플리케이션을 실행하는 엔진(WAS)</b>입니다. " +
       "서블릿·JSP 를 처리하며, 보통 Nginx 뒤에 둡니다.",
    good: "<b>강점</b> — 자바 표준(서블릿) 구현, Spring Boot 에 내장돼 있음, 세션 클러스터링, 성숙한 운영 도구",
    bad: "<b>주의</b> — 정적 파일 처리는 Nginx보다 비효율, 스레드 기반이라 동시 접속당 메모리 사용이 큼, " +
         "단독 노출은 보안·성능 모두 권장되지 않음",
    use: "자바 웹 애플리케이션(Spring·JSP) 실행 — 앞에 Nginx 를 두는 것이 표준",
  },
  caddy: {
    t: "Caddy",
    d: "<b>HTTPS 인증서를 자동으로 발급·갱신</b>하는 것이 최대 특징입니다. " +
       "Go 로 작성돼 바이너리 하나로 동작합니다.",
    good: "<b>강점</b> — 자동 HTTPS(설정 0), 매우 간결한 문법, 의존성 없는 단일 바이너리, HTTP/3 기본 지원",
    bad: "<b>주의</b> — Nginx 대비 자료·사례가 적음, 플러그인을 쓰려면 재빌드 필요, " +
         "대규모 운영 사례가 상대적으로 적어 조직 도입 시 설득이 필요",
    use: "개인·소규모 프로젝트, 내부 도구, 인증서 관리를 자동화하고 싶은 모든 경우",
  },
};
const SV_CODE = {
  nginx: `# Nginx : 정적 + 프록시
server {
    listen 80;
    server_name example.com;

    root /var/www/html;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
    }
}`,
  apache: `# Apache : 정적 + 프록시
<VirtualHost *:80>
    ServerName example.com
    DocumentRoot /var/www/html

    ProxyPass        /api/ http://127.0.0.1:8080/
    ProxyPassReverse /api/ http://127.0.0.1:8080/
<\/VirtualHost>`,
  tomcat: `<!-- Tomcat : server.xml 의 커넥터 -->
<Connector port="8080"
           protocol="HTTP/1.1"
           connectionTimeout="20000"
           maxThreads="200"
           redirectPort="8443" />

<!-- 앱은 webapps/ 에 WAR 로 배포 -->`,
  caddy: `# Caddy : 이 세 줄이면 HTTPS 까지 자동
example.com {
    root * /var/www/html
    file_server
    reverse_proxy /api/* 127.0.0.1:8080
}`,
};
function svGo(k, el){
  const i = SV_INFO[k];
  if (!i) return;
  $$("#svPick button").forEach(b => b.classList.toggle("on", b === el));
  $("#svTitle").innerHTML = i.t;
  $("#svDesc").innerHTML = i.d;
  $("#svGood").innerHTML = i.good;
  $("#svBad").innerHTML = i.bad;
  $("#svUse").innerHTML = "<b>주로 쓰는 곳</b> — " + i.use;
  $("#svCode").dataset.lang = (k === "tomcat") ? "xml" : (k === "caddy" ? "caddy" : "conf");
  setCode("#svCode", SV_CODE[k]);             // textContent 로 넣으므로 자동 이스케이프
}

/* ── n05 · location 매칭 우선순위 ─────────────────────────── */
const LOC_CASE = {
  "/": ["prefix /", "가장 낮은 우선순위 — 아무것도 안 걸리면 여기로 옵니다"],
  "/images/logo.png": ["= /images/logo.png", "정확히 일치(=)가 <b>최우선</b>입니다. 여기서 즉시 확정하고 더 이상 찾지 않습니다"],
  "/static/app.css": ["^~ /static/", "^~ 는 <b>정규식보다 먼저</b> 확정합니다 — 정적 경로에 자주 씁니다"],
  "/api/users": ["prefix /api/", "접두사 일치 중 가장 긴 것. 정규식이 없으므로 이것으로 확정"],
  "/photo.JPG": ["~* \\.(jpg|png)$", "~* 는 <b>대소문자 무시</b> 정규식이라 .JPG 도 걸립니다"],
  "/photo.jpg": ["~ \\.(jpg|png)$", "~ 는 대소문자를 구분하는 정규식. 위에서부터 <b>먼저 일치한 것</b>이 이깁니다"],
};
function locGo(path, el){
  $$("#locCtrl .chip").forEach(b => b.classList.toggle("on", b === el));
  const c = LOC_CASE[path];
  if (!c) return;
  $("#locPath").textContent = path;
  $("#locMatch").textContent = c[0];
  $("#locWhy").innerHTML = c[1];
  /* 목록은 <tr data-loc="…"> 로 그려진다 (li 가 아니다) */
  $$("#locList tr").forEach(tr => tr.classList.toggle("hl-row", tr.dataset.loc === c[0]));
}

/* ── w11 · 오류 사전 필터 (여러 탭 공용) ──────────────────── */
function cheatFilter(inputId, tableId, countId){
  const q = ($("#" + inputId)?.value || "").trim().toLowerCase();
  const rows = $$("#" + tableId + " tbody tr");
  let n = 0;
  rows.forEach(tr => {
    const hay = ((tr.dataset.k || "") + " " + tr.textContent).toLowerCase();
    const ok = !q || q.split(/\s+/).every(t => hay.includes(t));
    tr.style.display = ok ? "" : "none";
    if (ok) n++;
  });
  const c = $("#" + countId);
  if (c) c.textContent = q
    ? `${n}개 찾음 — 원하는 게 없으면 다른 낱말로 (예: 502 · 권한 · 인증서 · 업로드)`
    : `전체 ${rows.length}개 · 위 칸에 증상이나 오류 코드를 입력해 보세요`;
}
function cheatSet(inputId, tableId, countId, q){
  const inp = $("#" + inputId);
  if (!inp) return;
  inp.value = q;
  cheatFilter(inputId, tableId, countId);
  if (q) inp.focus();
}

/* 탭별 최초 1회 초기화 */
TAB_INIT.nginx = function(){ locGo("/api/users", $('#locCtrl .chip[data-p="/api/users"]')); };
