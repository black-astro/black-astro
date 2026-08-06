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

/* --- 다국어 문법 하이라이터 ---------------------------------------------
   이 가이드의 코드 블록은 SQL·셸·설정파일·XML·파이썬·자바·JS 가 섞여 있다.
   그래서 코드 블록의 data-lang 속성값을 보고 규칙을 골라 칠한다.
   (data-lang 을 안 적으면 DEFAULT_LANG 로 처리한다)

   그룹 순서는 모든 언어가 동일하다:
     1 주석 · 2 문자열 · 3 키워드 · 4 타입/내장 · 5 호출 · 6 숫자
   ------------------------------------------------------------------ */
const HL_SPEC = {
  sql: {
    ci: true,
    com: "--[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/",
    str: "'(?:[^'\\n]|'')*'",
    kw: "SELECT|FROM|WHERE|GROUP\\s+BY|ORDER\\s+BY|HAVING|LIMIT|OFFSET|FETCH|NEXT|ROWS?|ONLY|" +
        "INSERT|INTO|VALUES|UPDATE|SET|DELETE|MERGE|USING|MATCHED|TRUNCATE|RETURNING|" +
        "CREATE|ALTER|DROP|RENAME|ADD|COLUMN|TABLE|VIEW|INDEX|SEQUENCE|TRIGGER|FUNCTION|PROCEDURE|" +
        "DATABASE|SCHEMA|TABLESPACE|MATERIALIZED|TEMPORARY|TEMP|UNLOGGED|IF|EXISTS|CASCADE|RESTRICT|" +
        "PRIMARY|FOREIGN|KEY|REFERENCES|UNIQUE|CHECK|DEFAULT|CONSTRAINT|NOT|NULL|IDENTITY|GENERATED|ALWAYS|" +
        "JOIN|INNER|LEFT|RIGHT|FULL|CROSS|OUTER|LATERAL|NATURAL|ON|USING|" +
        "UNION|ALL|INTERSECT|EXCEPT|MINUS|DISTINCT|AS|AND|OR|IN|BETWEEN|LIKE|ILIKE|ESCAPE|IS|ANY|SOME|" +
        "CASE|WHEN|THEN|ELSE|END|WITH|RECURSIVE|OVER|PARTITION|WINDOW|RANGE|PRECEDING|FOLLOWING|" +
        "CURRENT|ROW|UNBOUNDED|FILTER|WITHIN|GROUP|CUBE|ROLLUP|GROUPING|SETS|" +
        "BEGIN|COMMIT|ROLLBACK|SAVEPOINT|TRANSACTION|ISOLATION|LEVEL|READ|WRITE|COMMITTED|UNCOMMITTED|" +
        "REPEATABLE|SERIALIZABLE|SHARE|EXCLUSIVE|LOCK|NOWAIT|SKIP|LOCKED|FOR|" +
        "GRANT|REVOKE|TO|ROLE|USER|PASSWORD|EXPLAIN|ANALYZE|VACUUM|DESC|ASC|NULLS|FIRST|LAST|" +
        "DECLARE|LOOP|WHILE|RETURN|EXCEPTION|RAISE|CALL|EXEC|EXECUTE|IMMEDIATE|PRAGMA|ATTACH|DETACH|" +
        "PRESERVE|DEFERRABLE|INITIALLY|DEFERRED|REPLACE|CONFLICT|DO|NOTHING|CONNECT|PRIOR|START|" +
        "PIVOT|UNPIVOT|CYCLE|SEARCH|INCLUDE|CONCURRENTLY|OWNER|COMMENT|COLLATE|CAST|EXTRACT|INTERVAL",
    typ: "INT|INTEGER|BIGINT|SMALLINT|TINYINT|NUMBER|NUMERIC|DECIMAL|FLOAT|DOUBLE|REAL|MONEY|" +
         "CHAR|VARCHAR|VARCHAR2|NVARCHAR|NVARCHAR2|NCHAR|TEXT|CLOB|NCLOB|BLOB|BYTEA|RAW|" +
         "DATE|TIME|TIMESTAMP|TIMESTAMPTZ|DATETIME|YEAR|BOOLEAN|BOOL|UUID|JSON|JSONB|XML|ARRAY|ENUM|" +
         "SERIAL|BIGSERIAL|AUTO_INCREMENT|AUTOINCREMENT|ROWID|SYSDATE|SYSTIMESTAMP|CURRENT_DATE|" +
         "CURRENT_TIMESTAMP|CURRENT_TIME|LOCALTIMESTAMP|NOW|TRUE|FALSE|UNSIGNED|ZEROFILL",
  },
  bash: {
    com: "#[^\\n]*",
    str: "'[^'\\n]*'|\"[^\"\\n]*\"",
    kw: "sudo|apt|apt-get|yum|dnf|zypper|pacman|brew|choco|winget|snap|" +
        "docker|docker-compose|podman|kubectl|helm|systemctl|service|journalctl|" +
        "cd|ls|cp|mv|rm|mkdir|chmod|chown|cat|tail|head|grep|sed|awk|find|tar|unzip|curl|wget|" +
        "echo|export|source|sudo|su|useradd|usermod|ln|df|du|ps|kill|top|free|netstat|ss|lsof|" +
        "if|then|else|fi|for|while|do|done|case|esac|function|return|exit|set|read|" +
        "psql|mysql|mariadb|sqlite3|sqlplus|createdb|initdb|pg_dump|pg_restore|mysqldump|" +
        "nginx|apachectl|httpd|apt-key|certbot|openssl|ufw|firewall-cmd|" +
        "python|python3|pip|uv|java|javac|node|npm|npx|pm2|gunicorn|uvicorn|gradle|mvn",
    varRe: "\\$\\{?[A-Za-z_]\\w*\\}?",
  },
  conf: {
    com: "#[^\\n]*|;[^\\n]*",
    str: "'[^'\\n]*'|\"[^\"\\n]*\"",
    kw: "server|http|events|stream|upstream|location|include|listen|server_name|root|index|" +
        "proxy_pass|proxy_set_header|proxy_http_version|proxy_read_timeout|proxy_connect_timeout|" +
        "try_files|return|rewrite|error_page|access_log|error_log|gzip|brotli|ssl_certificate|" +
        "ssl_certificate_key|ssl_protocols|ssl_ciphers|ssl_session_cache|add_header|expires|" +
        "worker_processes|worker_connections|worker_rlimit_nofile|keepalive|keepalive_timeout|" +
        "sendfile|tcp_nopush|tcp_nodelay|client_max_body_size|limit_req|limit_req_zone|limit_conn|" +
        "map|geo|split_clients|set|if|proxy_cache|proxy_cache_path|proxy_cache_valid|fastcgi_pass|" +
        "VirtualHost|Directory|Location|IfModule|Files|DocumentRoot|ServerName|ServerAlias|" +
        "ProxyPass|ProxyPassReverse|ProxyPreserveHost|RewriteEngine|RewriteRule|RewriteCond|" +
        "Require|Options|AllowOverride|LoadModule|Listen|ErrorLog|CustomLog|Header|SSLEngine|" +
        "SSLCertificateFile|SSLCertificateKeyFile|MaxRequestWorkers|StartServers|Timeout|" +
        "reverse_proxy|file_server|encode|tls|handle|handle_path|respond|route|log|bind|" +
        "on|off|max|default|permanent|last|break",
    varRe: "\\$\\{?[A-Za-z_][\\w.]*\\}?",
  },
  xml: {
    com: "&lt;!--[\\s\\S]*?--&gt;",
    str: "\"[^\"\\n]*\"|'[^'\\n]*'",
    /* 태그는 이스케이프된 뒤에 칠하므로 &lt; · &gt; 기준으로 찾는다 */
    tagRe: "&lt;\\/?[A-Za-z][\\w:.-]*|\\/?&gt;",
  },
  python: {
    com: "#[^\\n]*",
    str: "'[^'\\n]*'|\"[^\"\\n]*\"",
    kw: "import|from|as|def|return|for|in|if|elif|else|not|and|or|None|True|False|lambda|" +
        "with|class|while|try|except|finally|raise|pass|is|yield|async|await|global|nonlocal|assert|del",
    typ: "int|str|float|bool|list|dict|set|tuple|bytes|self|cls",
  },
  java: {
    com: "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/",
    str: "'[^'\\n]*'|\"[^\"\\n]*\"",
    kw: "abstract|boolean|break|byte|case|catch|char|class|continue|default|do|double|else|enum|" +
        "extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|new|" +
        "package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|" +
        "throws|try|void|while|var|record|sealed|yield|true|false|null",
    typ: "[A-Z][A-Za-z0-9]*",
    annRe: "@[A-Za-z]\\w*",
  },
  js: {
    com: "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/",
    str: "'[^'\\n]*'|\"[^\"\\n]*\"|`[^`]*`",
    kw: "const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|" +
        "extends|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|" +
        "this|null|undefined|true|false|of|in|delete|yield|static|get|set",
    typ: "[A-Z][A-Za-z0-9]*",
  },
};
/* data-lang 값을 규칙 이름으로 정규화 */
const HL_ALIAS = {
  sql:"sql", plsql:"sql", psql:"sql", tsql:"sql",
  bash:"bash", sh:"bash", shell:"bash", zsh:"bash", console:"bash",
  cmd:"bash", powershell:"bash", ps1:"bash", dockerfile:"bash",
  conf:"conf", nginx:"conf", apache:"conf", caddy:"conf", ini:"conf",
  yaml:"conf", yml:"conf", properties:"conf", toml:"conf", env:"conf",
  xml:"xml", html:"xml",
  python:"python", py:"python",
  java:"java", kotlin:"java",
  js:"js", javascript:"js", ts:"js", typescript:"js", json:"js", node:"js",
};
const HL_CACHE = {};
function hlRe(lang){
  if (HL_CACHE[lang]) return HL_CACHE[lang];
  const s = HL_SPEC[lang];
  const parts = [
    "(" + s.com + ")",                                   // 1 주석
    "(" + s.str + ")",                                   // 2 문자열
    s.kw ? "\\b(" + s.kw + ")\\b" : "($^)",              // 3 키워드
    s.typ ? "\\b(" + s.typ + ")\\b" : "($^)",            // 4 타입·내장
    s.annRe ? "(" + s.annRe + ")" : (s.varRe ? "(" + s.varRe + ")" : (s.tagRe ? "(" + s.tagRe + ")" : "($^)")),
    "\\.?([A-Za-z_]\\w*)(?=\\s*\\()",                    // 6 호출
    "\\b(\\d[\\d_]*\\.?\\d*)\\b",                        // 7 숫자
  ];
  const re = new RegExp(parts.join("|"), "g" + (s.ci ? "i" : ""));
  HL_CACHE[lang] = re;
  return re;
}
const DEFAULT_LANG = "conf";   /* data-lang 을 안 적은 코드 블록의 기본 규칙 */

function highlight(root){
  $$("pre.code code", root || document).forEach(el => {
    if (el.dataset.hl) return;
    el.dataset.hl = "1";
    const raw = (el.parentElement.dataset.lang || "").toLowerCase().trim();
    const lang = HL_ALIAS[raw] || (HL_SPEC[raw] ? raw : DEFAULT_LANG);
    if (raw === "text" || raw === "출력" || raw === "결과"){ injectCopy(root || document); return; }
    let s = el.textContent
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    s = s.replace(hlRe(lang), (m, com, str, kw, typ, sp, fn, num) => {
      if (com) return `<span class="t-com">${com}</span>`;
      if (str) return `<span class="t-str">${str}</span>`;
      if (kw)  return `<span class="t-kw">${kw}</span>`;
      if (typ) return `<span class="t-mod">${typ}</span>`;
      if (sp)  return `<span class="t-ann">${sp}</span>`;
      if (fn)  return m.startsWith(".") ? `.<span class="t-fn">${fn}</span>`
                                        : `<span class="t-fn">${fn}</span>`;
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
   "502 에러" → Nginx 프록시,  "인증서 갱신" → HTTPS 탭
   ============================================================ */
const TAB_KW = {
  start:"시작 개념 입문 처음 왕초보 웹서버 web server 정적 동적 was 아파치 apache 엔진엑스 nginx 톰캣 tomcat 캐디 caddy iis 설치 install 세팅 도커 docker 포트 80 443 방화벽 권한 로그 access error 리버스프록시 reverse proxy 프록시 오류 403 404 502 504 500 로드맵 비교 선택 무엇을",
  nginx:"nginx 엔진엑스 엔진x 설치 설정 conf nginx.conf 마스터 워커 worker_processes worker_connections server 블록 가상호스트 server_name listen location 매칭 우선순위 정규식 root alias index try_files 정적파일 proxy_pass 리버스프록시 헤더 x-forwarded-for x-real-ip host upstream 로드밸런싱 라운드로빈 least_conn ip_hash weight https ssl http2 http3 quic rewrite return 301 302 리다이렉트 gzip brotli 압축 proxy_cache 캐시 client_max_body_size 업로드 413 로그포맷 log_format limit_req limit_conn 처리율제한 websocket 웹소켓 sse upgrade 무중단 reload -t 검증 systemd",
  apache:"apache 아파치 httpd 설치 mpm prefork worker event 모듈 module a2enmod loadmodule virtualhost 가상호스트 directory location files htaccess allowoverride mod_rewrite rewriterule rewritecond mod_proxy proxypass proxypassreverse ajp https ssl 인증서 인증 basic auth 접근제어 require deny allow 압축 deflate 캐시 expires 헤더 로그 customlog errorlog combined 진단 nginx비교 변환 마이그레이션 apachectl",
  tomcat:"tomcat 톰캣 was 서블릿 컨테이너 설치 catalina bin conf webapps server.xml context.xml web.xml connector http nio nio2 apr ajp port 8080 8443 war 배포 deploy manager 스프링부트 내장톰캣 embedded 정적자원 분리 세션 session 클러스터 sticky 스레드풀 maxthreads acceptcount 커넥션 jvm 메모리 힙 gc oom 로그 catalina.out access log valve nginx연동 프록시 remoteip https 위치 종료 graceful shutdown 무중단 배포 보안 manager제거 에러페이지 스레드덤프 진단",
  caddy:"caddy 캐디 자동https 인증서자동 caddyfile 설정 문법 리버스프록시 reverse_proxy 로드밸런싱 acme letsencrypt 자동발급 갱신 정적사이트 file_server 헤더 header 압축 encode 캐시 도커 docker compose nginx비교 장단점 api 플러그인 xcaddy 운영 tls",
  tls:"https tls ssl 인증서 certificate 암호화 핸드셰이크 handshake 대칭키 공개키 letsencrypt 렛츠인크립트 certbot acme dns챌린지 http챌린지 와일드카드 갱신 renew 자동화 cron systemd timer 설치 nginx apache tomcat pem crt key 체인 중간인증서 fullchain 순서 오류 tls1.2 tls1.3 암호스위트 cipher hsts 리다이렉트 혼합콘텐츠 mixed content mtls 상호인증 클라이언트인증서 만료 감시 모니터링 openssl s_client ssllabs 진단",
  lang:"연동 배포 언어별 java 자바 war 톰캣 스프링부트 spring boot jar systemd python 파이썬 wsgi asgi gunicorn 구니콘 uvicorn 유비콘 fastapi django 장고 flask 플라스크 static collectstatic node 노드 nodejs pm2 프로세스관리 클러스터 php php-fpm fastcgi 워드프레스 라라벨 리액트 react vue 빌드 정적배포 spa 히스토리 fallback systemd 서비스등록 유닛파일 소켓 unix socket 포트 권한 user group 체크리스트",
  perf:"성능 튜닝 최적화 rps tps 지연 latency p99 동시접속 worker 프로세스 커넥션 keepalive 킵얼라이브 sendfile tcp_nopush tcp_nodelay 정적파일 캐시 expires etag 압축 gzip brotli 레벨 프록시버퍼 proxy_buffering 업스트림 커넥션풀 keepalive캐시계층 cdn 커널 sysctl somaxconn backlog tcp_tw file descriptor ulimit nofile 부하테스트 k6 wrk ab jmeter 병목 진단 체크리스트",
  lb:"로드밸런싱 로드밸런서 load balancer lb 분산 트래픽 수평확장 스케일아웃 scale out 여러대 upstream 업스트림 라운드로빈 round robin 가중치 weight least_conn 최소연결 ip_hash 해시 세션 sticky 스티키 로그인풀림 redis 세션저장소 jwt 무상태 stateless 헬스체크 health check 능동 수동 max_fails proxy_next_upstream haproxy frontend backend balance stats 무중단배포 롤링 rolling 블루그린 blue green 카나리 canary 드레인 drain 이중화 keepalived vrrp vip 가상ip 페일오버 failover spof 단일장애점 alb nlb target group 타깃그룹 클라우드 dns 라운드로빈 tls종료 termination l4 l7",
  ops:"보안 운영 헤더 hsts csp x-frame-options nosniff referrer permissions 정보노출 server_tokens 버전숨김 접근제어 ip제한 allow deny basic인증 rate limit 처리율제한 ddos 완화 waf modsecurity coreruleset 업로드 보안 확장자 실행권한 로그 로테이션 logrotate 모니터링 상태페이지 stub_status 프로메테우스 exporter 무중단배포 블루그린 카나리 설정관리 git ansible 컨테이너 쿠버네티스 인그레스 ingress 장애대응 시나리오 점검 체크리스트 취약점 cve 패치",
  deep:"전문가 초고급 내부 internals 소켓 socket accept listen backlog 커넥션 이벤트루프 epoll kqueue select poll 논블로킹 nginx워커 모델 프로세스 apache mpm prefork worker event 비교 http1.1 http2 http3 quic 멀티플렉싱 헤드오브라인 hol 우선순위 tls종료 termination 성능 오프로드 제로카피 sendfile splice 백프레셔 버퍼 파일디스크립터 프록시프로토콜 proxy protocol 실제ip x-forwarded-for 신뢰 로드밸런싱 알고리즘 해시 일관된해싱 헬스체크 서킷브레이커 관측 추적 traceid opentelemetry 아키텍처 체크리스트",
};
const FIND_CHIPS = ["502 에러가 나요","리버스 프록시 설정","HTTPS 인증서 발급","로드밸런싱 구성",
                    "정적 파일 서빙","Nginx 설정 문법","톰캣 연동","업로드 용량 제한",
                    "실제 IP 가 안 보여요","무중단 배포","gunicorn 설정","PM2 로 노드 띄우기",
                    "보안 헤더","로그 보는 법","포트 충돌","권한 오류"];
const SEC_KW = {
  w01:"웹서버란 정적 동적 was 차이 역할 무엇을하나",
  w02:"요청흐름 dns tcp tls http 브라우저 서버 앱 순서 그림",
  w03:"비교 선택 nginx apache tomcat caddy 어느것 점유율 차이",
  w04:"리눅스설치 apt yum dnf ubuntu rocky 서비스시작 systemctl",
  w05:"윈도우설치 macos 도커 컨테이너 compose 포트매핑 볼륨",
  w06:"첫페이지 정적사이트 html 띄우기 index root 확인",
  w07:"설정파일 구조 위치 문법 include 디렉터리 sites-available",
  w08:"포트 80 443 방화벽 ufw firewalld selinux 권한 바인드 1024",
  w09:"로그 access error 위치 읽는법 상태코드 분석 tail",
  w10:"리버스프록시 정방향 차이 왜쓰나 앞단 역할",
  w11:"오류 403 404 502 bad gateway 504 timeout 500 진단 해결",
  w12:"로드맵 학습순서 무엇부터 커리큘럼",

  n01:"nginx구조 마스터 워커 프로세스 이벤트기반 c10k 논블로킹",
  n02:"nginx설치 디렉터리 sites-available enabled conf.d 심볼릭링크",
  n03:"설정문법 컨텍스트 지시어 세미콜론 중괄호 상속 include",
  n04:"server블록 가상호스트 server_name listen default_server 여러도메인",
  n05:"location 매칭 우선순위 정규식 접두사 = ^~ ~ ~* 순서",
  n06:"정적파일 root alias 차이 index try_files 404 fallback spa",
  n07:"proxy_pass 리버스프록시 슬래시 차이 경로 전달 백엔드",
  n08:"헤더 x-forwarded-for x-real-ip x-forwarded-proto host 실제ip 전달",
  n09:"upstream 로드밸런싱 라운드로빈 least_conn ip_hash weight backup 헬스체크",
  n10:"https ssl_certificate http2 http3 quic listen 443 리다이렉트",
  n11:"rewrite return 301 302 리다이렉트 정규식 last break permanent",
  n12:"gzip brotli 압축 gzip_types 레벨 min_length static",
  n13:"proxy_cache 캐시 존 키 valid bypass 헤더 stale",
  n14:"업로드 client_max_body_size 413 request entity too large 타임아웃",
  n15:"log_format 로그포맷 json 커스텀 응답시간 upstream_time",
  n16:"limit_req limit_conn 처리율제한 burst nodelay 429 봇차단",
  n17:"websocket 웹소켓 upgrade connection sse 스트리밍 버퍼링끄기 타임아웃",
  n18:"reload 무중단 nginx -t 설정검증 signal hup 재시작 차이",

  h01:"apache구조 mpm prefork worker event 프로세스 스레드 차이 선택",
  h02:"apache설치 디렉터리 sites-available conf.d httpd.conf apache2.conf",
  h03:"모듈 a2enmod loadmodule 설정구조 include 순서",
  h04:"virtualhost 가상호스트 namevirtualhost servername serveralias documentroot",
  h05:"directory location files 차이 적용순서 require options",
  h06:"htaccess allowoverride 성능 쓸것인가 대안",
  h07:"mod_rewrite rewriterule rewritecond 플래그 정규식 리다이렉트",
  h08:"mod_proxy proxypass proxypassreverse ajp balancer 리버스프록시",
  h09:"https sslengine sslcertificatefile 인증서 설정 리다이렉트",
  h10:"인증 basic auth htpasswd require ip 접근제어 deny allow",
  h11:"압축 deflate 캐시 expires cache-control 헤더 mod_headers",
  h12:"로그 customlog errorlog combined loglevel 진단 apachectl",
  h13:"nginx vs apache 비교 성능 htaccess 모듈 선택기준",
  h14:"apache nginx 설정변환 마이그레이션 대조표",

  t01:"톰캣이란 was 서블릿컨테이너 웹서버차이 jsp servlet",
  t02:"톰캣설치 디렉터리 bin conf lib webapps logs catalina_home base",
  t03:"server.xml 구조 service engine host connector valve",
  t04:"connector http nio nio2 apr ajp 포트 protocol 설정 비교",
  t05:"war 배포 webapps context.xml autodeploy manager 언팩",
  t06:"스프링부트 내장톰캣 embedded jar 설정 server.port properties",
  t07:"정적자원 분리 nginx 이미지 css js 성능",
  t08:"세션 클러스터 sticky session replication 공유 redis",
  t09:"스레드풀 maxthreads minsparethreads acceptcount 큐 튜닝 산정",
  t10:"jvm 메모리 힙 xmx xms gc 컨테이너 oom 설정",
  t11:"로그 catalina.out access valve 로테이션 위치 설정",
  t12:"nginx 톰캣 연동 프록시 remoteipvalve 실제ip 헤더",
  t13:"https 위치 종료 프록시 톰캣 어디서 scheme secure",
  t14:"graceful shutdown 무중단 배포 롤링 드레인 종료",
  t15:"보안 manager 제거 에러페이지 서버정보 숨김 shutdown포트",
  t16:"진단 스레드덤프 jstack oom 힙덤프 응답없음 행",

  c01:"caddy 자동https 특징 왜 간단 acme",
  c02:"caddy설치 apt 바이너리 실행 systemd",
  c03:"caddyfile 문법 사이트블록 지시어 들여쓰기",
  c04:"reverse_proxy 로드밸런싱 헬스체크 lb_policy",
  c05:"자동인증서 발급원리 acme http-01 tls-alpn dns 저장위치",
  c06:"file_server 정적사이트 root 브라우저 try_files",
  c07:"header 압축 encode 캐시 지시어",
  c08:"도커 compose 볼륨 인증서 유지 네트워크",
  c09:"nginx 비교 장단점 성능 생태계 선택",
  c10:"api 관리 플러그인 xcaddy 빌드 운영",

  s01:"https 무엇을지키나 암호화 무결성 인증 중간자",
  s02:"핸드셰이크 tls1.3 rtt 키교환 대칭키 세션재개",
  s03:"인증서 구성 도메인 와일드카드 dv ov ev 체인 ca",
  s04:"letsencrypt certbot 발급 http-01 dns-01 와일드카드",
  s05:"따라하기 발급 적용 처음부터 끝까지 전체과정 dns 연결 a레코드 도메인 리다이렉트 확인 워크스루 튜토리얼 15분",
  s06:"갱신 자동화 renew cron systemd timer 실패알림 90일",
  s07:"설치 nginx apache tomcat 경로 pem fullchain privkey keystore",
  s08:"체인 중간인증서 누락 오류 모바일 fullchain 순서 진단",
  s09:"tls버전 1.0 1.1 비활성 1.2 1.3 암호스위트 cipher 설정",
  s10:"hsts preload 리다이렉트 혼합콘텐츠 mixed content 업그레이드",
  s11:"mtls 상호인증 클라이언트인증서 ssl_verify_client 내부통신",
  s12:"만료 감시 모니터링 알람 스크립트 대시보드 사고",
  s13:"진단 openssl s_client ssllabs testssl 확인 명령",

  l01:"웹서버 앱 대화 프록시 fastcgi wsgi 소켓 방식 비교",
  l02:"java war 톰캣 배포 컨텍스트경로 root",
  l03:"스프링부트 nginx 프록시 systemd jar 배포 포트",
  l04:"wsgi asgi 차이 동기 비동기 파이썬 인터페이스",
  l05:"gunicorn 워커수 클래스 sync gthread uvicorn 타임아웃 설정",
  l06:"uvicorn fastapi asgi 배포 워커 프록시헤더",
  l07:"django 배포 collectstatic allowed_hosts 정적파일 미디어 설정",
  l08:"node pm2 프로세스관리 클러스터 재시작 로그 ecosystem",
  l09:"node nginx 앞단 프록시 정적 캐시 websocket",
  l10:"php php-fpm fastcgi 풀 소켓 워드프레스 라라벨",
  l11:"react vue spa 빌드 정적배포 try_files history 라우팅 캐시",
  l12:"systemd 서비스등록 유닛파일 restart 로그 journalctl 환경변수",
  l13:"유닉스소켓 포트 차이 권한 user group 퍼미션",
  l14:"배포 체크리스트 언어별 요약 정리",

  p01:"지표 rps tps 지연 p95 p99 동시접속 측정 목표",
  p02:"worker_processes auto worker_connections 계산 코어 최대접속",
  p03:"keepalive 킵얼라이브 타임아웃 requests 업스트림 재사용",
  p04:"정적파일 sendfile tcp_nopush open_file_cache expires etag",
  p05:"압축 gzip brotli 레벨 cpu 트레이드오프 사전압축",
  p06:"proxy_buffering 버퍼 크기 임시파일 스트리밍 sse 끄기",
  p07:"업스트림 keepalive 커넥션풀 tcp 재연결 비용",
  p08:"캐시계층 브라우저 cdn 프록시캐시 앱캐시 설계 무효화",
  p09:"커널 sysctl somaxconn tcp_max_syn_backlog netdev tw_reuse",
  p10:"파일디스크립터 ulimit nofile too many open files limitnofile",
  p11:"cdn 앞단 오리진 캐시헤더 실제ip 구성",
  p12:"부하테스트 k6 wrk ab jmeter 시나리오 워밍업 해석",
  p13:"병목 찾기 순서 절차 top 로그 응답시간 업스트림",
  p14:"성능 체크리스트 요약 정리",

  b01:"로드밸런서 왜 필요 수직 수평 확장 스케일업 스케일아웃 한계 분산 장애 무중단",
  b02:"l4 l7 차이 계층 osi dns라운드로빈 구조 그림 어디에 진입점",
  b03:"첫 로드밸런싱 따라하기 upstream proxy_pass 실습 확인 curl 분산 실험",
  b04:"알고리즘 라운드로빈 가중치 weight least_conn ip_hash hash consistent random backup down",
  b05:"세션 로그인풀림 sticky 고정 redis 세션저장소 jwt 무상태 stateless 업로드 s3",
  b06:"헬스체크 능동 수동 max_fails fail_timeout proxy_next_upstream 재시도 비멱등 haproxy httpchk health",
  b07:"tls 종료 termination https 어디서 인증서 위치 x-forwarded-proto 재암호화 passthrough",
  b08:"haproxy 설치 설정 haproxy.cfg frontend backend balance leastconn stats 대시보드 비교",
  b09:"무중단배포 롤링 블루그린 카나리 드레인 drain down reload 가중치 전환",
  b10:"이중화 keepalived vrrp vip 가상ip 페일오버 spof 단일장애점 master backup 우선순위",
  b11:"클라우드 alb nlb target group 타깃그룹 헬스체크 드레인 stickiness 대응표 aws gcp azure",
  b12:"레시피 규모별 단계 체크리스트 구성 언제 무엇을 확장 순서",

  o01:"보안헤더 hsts csp x-frame-options x-content-type referrer permissions 설정",
  o02:"정보노출 server_tokens 버전숨김 디렉터리목록 에러페이지",
  o03:"접근제어 ip제한 allow deny basic인증 관리자경로 vpn",
  o04:"rate limit ddos 완화 burst 봇 크롤러 429 fail2ban",
  o05:"waf modsecurity coreruleset 오탐 튜닝 성능",
  o06:"업로드 보안 확장자 실행권한 경로 저장위치 검증",
  o07:"로그 로테이션 logrotate 보관 용량 개인정보 마스킹",
  o08:"모니터링 상태페이지 stub_status exporter 프로메테우스 그라파나 알람",
  o09:"무중단배포 블루그린 카나리 리로드 드레인 헬스체크",
  o10:"설정관리 git 버전관리 ansible 템플릿 검증 롤백",
  o11:"컨테이너 쿠버네티스 인그레스 ingress 사이드카 서비스메시",
  o12:"장애대응 시나리오 502 급증 디스크 인증서만료 절차",
  o13:"점검 체크리스트 정기 일일 주간 월간",
  o14:"취약점 cve 패치 업데이트 버전관리 보안공지",
  o15:"리버스터널 터널링 ssh -R autossh frp frps frpc cloudflaretunnel cloudflared ngrok 사내망 공인ip없음 nat cgnat 포트포워딩 원격접속 웹훅테스트",

  z01:"소켓 accept listen backlog syn 큐 커넥션수립 tcp",
  z02:"이벤트루프 epoll kqueue select poll 논블로킹 c10k 멀티플렉싱",
  z03:"nginx 워커 모델 내부 accept_mutex reuseport 분배",
  z04:"apache mpm 내부 prefork worker event 비교 메모리 스레드",
  z05:"http1.1 http2 http3 quic 멀티플렉싱 hol 블로킹 헤더압축 udp",
  z06:"tls종료 위치 lb 웹서버 앱 성능 오프로드 세션재개",
  z07:"제로카피 sendfile splice 커널 유저공간 복사",
  z08:"백프레셔 버퍼 느린클라이언트 slowloris 프록시버퍼링",
  z09:"커넥션유지 파일디스크립터 소진 keepalive 트레이드오프",
  z10:"프록시프로토콜 proxy protocol 실제ip x-forwarded-for 신뢰 set_real_ip_from 스푸핑",
  z11:"로드밸런싱 알고리즘 라운드로빈 최소연결 해시 일관된해싱 세션고정",
  z12:"헬스체크 액티브 패시브 서킷브레이커 장애전파 격리",
  z13:"관측 추적id request_id opentelemetry 분산추적 로그연계",
  z14:"아키텍처 정리 전체그림 체크리스트 면접",
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

