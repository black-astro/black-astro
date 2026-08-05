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

/* ── b04 · 로드밸런싱 분산 시뮬레이터 ─────────────────────── */
const LB = {
  algo: "rr",
  counts: [0, 0, 0],
  active: [0, 0, 0],                    // 현재 처리 중인 연결 (least_conn 시연용)
  rr: 0,
  wrrSeq: [0, 0, 0, 1, 1, 2],           // weight 3:2:1 을 순서로 풀어놓은 것
  wrrIdx: 0,
  clients: ["203.0.113.10", "198.51.100.7", "192.0.2.55", "203.0.113.99"],
  ipMap:   [0, 2, 0, 1],                // ip_hash 시연 — 클라이언트별 고정 서버
  cIdx: 0,
  tick: 0,
  tie: 0,                               // least_conn 동점일 때 순환 선택용
};
const LB_NOTE = {
  rr:    "<b>라운드로빈</b> — 순서대로 정확히 1/3 씩 갑니다. 그런데 <b>③번(느린 서버)의 '현재 연결'이 계속 쌓이는 것</b>을 보세요 — 처리 속도를 안 보고 똑같이 나눠 주기 때문입니다.",
  wrr:   "<b>가중치 3:2:1</b> — ①번이 3배, ②번이 2배를 받습니다. <b>서버 사양이 다를 때</b> 비율로 조정하는 방식입니다.",
  least: "<b>least_conn</b> — 매번 <b>현재 연결이 가장 적은 서버</b>를 고릅니다. 느린 ③번에는 자연히 덜 가게 되죠. <b>요청 처리 시간이 들쭉날쭉한 서비스</b>에서 효과가 큽니다.",
  iphash:"<b>ip_hash</b> — 같은 IP 는 항상 같은 서버로 갑니다(마지막 요청의 IP 를 보세요). 세션 유지엔 편하지만 <b>분배가 기울 수 있고</b>, 그 서버가 죽으면 해당 사용자들의 세션이 사라집니다.",
};
function lbRender(){
  const box = $("#lbBars");
  if (!box) return;
  if (!box.children.length){
    box.innerHTML = [0, 1, 2].map(i =>
      `<div class="lbrow${i === 2 ? " slow" : ""}">
         <span class="nm">server-${i + 1}<small>${i === 2 ? "느린 서버 (처리 3배 걸림)" : "정상 속도"}</small></span>
         <div class="bar"><i id="lbBar${i}"></i></div>
         <span class="ct" id="lbCt${i}"></span>
       </div>`).join("") + `<div class="lblast" id="lbLast"></div>`;
  }
  const max = Math.max(1, ...LB.counts);
  const total = LB.counts[0] + LB.counts[1] + LB.counts[2];
  [0, 1, 2].forEach(i => {
    $("#lbBar" + i).style.width = (LB.counts[i] / max * 100) + "%";
    $("#lbCt" + i).textContent = `${LB.counts[i]}건 · 연결 ${LB.active[i]}`;
  });
  $("#lbLast").textContent = total ? `총 ${total}건 처리` : "위 버튼으로 요청을 보내 보세요";
  $("#lbNote").innerHTML = LB_NOTE[LB.algo];
}
function lbPick(){
  const a = LB.algo;
  if (a === "rr")    return LB.rr++ % 3;
  if (a === "wrr")   return LB.wrrSeq[LB.wrrIdx++ % LB.wrrSeq.length];
  if (a === "least"){
    /* 동점이면 순환하며 고른다 — 실제 LB 도 동점 시 라운드로빈처럼 돕니다 */
    let m = -1;
    for (let k = 0; k < 3; k++){
      const i = (LB.tie + k) % 3;
      if (m < 0 || LB.active[i] < LB.active[m]) m = i;
    }
    LB.tie = (m + 1) % 3;
    return m;
  }
  /* iphash — 4명의 클라이언트가 돌아가며 요청한다고 가정 */
  return LB.ipMap[LB.cIdx % 4];
}
function lbReq(n){
  let lastTxt = "";
  for (let k = 0; k < n; k++){
    const ip = LB.clients[LB.cIdx % 4];
    const s = lbPick();
    LB.counts[s]++; LB.active[s]++; LB.cIdx++; LB.tick++;
    /* 처리 완료 시뮬레이션 — ①②는 요청 2건마다 1건, 느린 ③은 6건마다 1건 완료 */
    if (LB.tick % 2 === 0){
      LB.active[0] = Math.max(0, LB.active[0] - 1);
      LB.active[1] = Math.max(0, LB.active[1] - 1);
    }
    if (LB.tick % 6 === 0) LB.active[2] = Math.max(0, LB.active[2] - 1);
    lastTxt = `${ip} → server-${s + 1}`;
  }
  lbRender();
  if (lastTxt) $("#lbLast").textContent =
    `마지막 요청: ${lastTxt} · 총 ${LB.counts[0] + LB.counts[1] + LB.counts[2]}건`;
}
function lbReset(){
  LB.counts = [0, 0, 0]; LB.active = [0, 0, 0];
  LB.rr = 0; LB.wrrIdx = 0; LB.cIdx = 0; LB.tick = 0;
  lbRender();
}
function lbAlgo(k, el){
  LB.algo = k;
  $$("#lbCtrl button").forEach(b => b.classList.toggle("on", b === el));
  lbReset();
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
TAB_INIT.lb = function(){ lbRender(); };
