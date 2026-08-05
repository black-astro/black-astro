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
const DEFAULT_LANG = "sql";   /* data-lang 을 안 적은 코드 블록의 기본 규칙 */

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
   "느린 쿼리" → 튜닝 탭,  "한글 깨짐" → MySQL 문자셋
   ============================================================ */
const TAB_KW = {
  start:"시작 설치 install 세팅 셋업 준비 입문 처음 왕초보 데이터베이스 db dbms 엑셀 도커 docker 컨테이너 접속 연결 계정 유저 권한 클라이언트 dbeaver datagrip workbench pgadmin 샘플 실습 예제데이터 포트 5432 3306 1521 방화벽 오류 로드맵 순서 무엇부터 고르기 선택 비교 차이",
  sql:"sql 쿼리 query 기초 기본 문법 select 조회 검색 where 조건 필터 order by 정렬 limit 페이징 null 널 자료형 타입 varchar int date insert 입력 삽입 update 수정 delete 삭제 create table 테이블 생성 제약 constraint 기본키 pk 외래키 fk join 조인 inner left outer group by 그룹 집계 count sum avg having 서브쿼리 subquery union 합치기 view 뷰 case coalesce 함수 문자열 날짜 트랜잭션 commit rollback 실행순서 치트시트",
  pro:"전문가 고급 심화 윈도우함수 window function over partition by rank dense_rank row_number lag lead 누적합 프레임 rows between cte with 공통테이블식 재귀 recursive 계층 트리 grouping sets rollup cube pivot 피벗 행열전환 merge upsert 있으면수정 lateral apply json 정규식 regexp 전문검색 집합기반 배치 대량 update delete 안티패턴 느린쿼리 튜닝 분석함수 순위 등수 이동평균",
  oracle:"오라클 oracle 오라클설치 xe free 21c 23ai dual rownum 페이징 nvl nvl2 decode 문자열 substr instr to_date to_char sysdate interval 시퀀스 sequence identity 트리거 connect by 계층쿼리 start with prior plsql pl/sql 프로시저 패키지 커서 벌크 bulk collect forall 힌트 hint 옵티마이저 실행계획 autotrace awr ash statspack 파티션 partition rac dataguard rman 백업 복구 tablespace cdb pdb sqlplus sql developer tnsnames listener ora-",
  pg:"postgresql 포스트그레 포스트그레스ql postgres pg psql 설치 역할 role 스키마 search_path returning upsert on conflict distinct on 배열 array 범위 range enum jsonb json 인덱스 btree gin gist brin hash 부분인덱스 전문검색 tsvector 한국어 plpgsql 함수 트리거 mvcc vacuum autovacuum 팽창 bloat 트랜잭션id 랩어라운드 explain analyze buffers 파티셔닝 선언적파티션 확장 extension postgis pg_stat_statements pgvector 복제 replication 스트리밍 논리복제 pitr 백업 pg_dump 업그레이드 postgresql.conf shared_buffers work_mem",
  mysql:"mysql 마이에스큐엘 mariadb 마리아디비 8.0 8.4 11 설치 계정 권한 grant 문자셋 캐릭터셋 charset collation utf8mb4 한글깨짐 이모지 스토리지엔진 innodb myisam auto_increment limit ifnull coalesce on duplicate key replace into insert ignore group_concat 날짜 타임존 timezone 인덱스 클러스터드 세컨더리 explain 힌트 옵티마이저 트랜잭션 갭락 gap lock 넥스트키 데드락 deadlock 저장프로시저 트리거 이벤트 파티셔닝 온라인ddl pt-online-schema-change 복제 replication 소스 레플리카 binlog gtid 백업 mysqldump xtrabackup my.cnf innodb_buffer_pool_size 튜닝",
  sqlite:"sqlite sqlite3 에스큐엘라이트 임베디드 파일db 서버없음 단일파일 설치 cli dot명령 .tables .schema 동적타입 type affinity rowid autoincrement without rowid upsert pragma journal_mode wal 동시성 잠금 database is locked busy_timeout 인덱스 부분인덱스 표현식인덱스 fts5 전문검색 json1 트랜잭션 백업 vacuum 무결성 integrity_check 암호화 sqlcipher 한계 동시쓰기 모바일 안드로이드 ios 데스크톱 엣지 litestream turso",
  tune:"설계 모델링 정규화 1nf 2nf 3nf 반정규화 키설계 자연키 대리키 uuid ulid 인덱스 b-tree 원리 복합인덱스 순서 커버링 인덱스안탐 형변환 함수사용 like 실행계획 explain 읽는법 통계 카디널리티 페이징 offset 느림 커서페이징 무한스크롤 트랜잭션 acid 격리수준 read committed repeatable read serializable 팬텀 팬텀리드 더티리드 반복불가 락 lock 데드락 대기 블로킹 커넥션풀 pool 사이징 슬로우쿼리 느린쿼리 모니터링 지표 알람 주문 재고 모델링",
  deep:"전문가 초고급 내부 internals 페이지 page 힙 heap 슬롯 저장구조 버퍼풀 buffer pool 캐시히트율 wal redo undo 로그 체크포인트 크래시복구 fsync 내구성 mvcc 스냅샷 가시성 버전 락매니저 2pl 옵티마이저 비용모델 카디널리티추정 조인순서 조인알고리즘 네스티드루프 해시조인 소트머지 파티셔닝 샤딩 sharding 샤드키 복제 리플리케이션 동기 비동기 반동기 합의 raft ha 페일오버 분산트랜잭션 2pc xa saga 보상 cap 일관성 선형화 newsql 아카이빙 보관 암호화 tde 감사 audit 최소권한 장애 대응 포스트모템 dba 체크리스트",
  app:"연동 애플리케이션 드라이버 커넥션 연결문자열 dsn jdbc hikari hikaricp psycopg psycopg2 oracledb cx_oracle pymysql mysqlclient sqlite3 mysql2 pg node-postgres better-sqlite3 sqlalchemy jpa hibernate mybatis prisma typeorm orm sql인젝션 injection 바인딩 파라미터 prepared statement 트랜잭션 with begin commit rollback 컨텍스트매니저 n+1 배치조회 in절 마이그레이션 alembic flyway liquibase prisma migrate 대량적재 copy load data infile executemany bulk 재시도 retry 타임아웃 커넥션누수 테스트 testcontainers 롤백테스트 픽스처",
};
const FIND_CHIPS = ["설치부터 하고 싶어요","도커로 DB 띄우기","JOIN 이해하기","윈도우 함수",
                    "느린 쿼리 튜닝","인덱스가 안 타요","페이징 최적화","격리 수준",
                    "데드락","SQL 인젝션","파이썬에서 연결","백업과 복구",
                    "오라클 페이징","JSONB 다루기","database is locked","한글이 깨져요"];
const SEC_KW = {
  /* 하려는 일을 한글로 쳤을 때 걸리게 하는 보강 키워드 */
  c01:"데이터베이스란 왜쓰나 엑셀차이 파일저장 동시접속 무결성 dbms rdbms",
  c02:"어떤db 고르기 선택 비교 오라클vs mysqlvs postgresqlvs sqlite 라이선스 비용 무료",
  c03:"윈도우설치 windows 인스톨러 msi exe 서비스등록 환경변수 path 포트충돌",
  c04:"맥설치 macos homebrew brew 리눅스 ubuntu centos rocky apt yum dnf 데비안",
  c05:"도커 docker compose 컨테이너 볼륨 포트매핑 환경변수 가장쉬운설치 초기화스크립트",
  c06:"접속 클라이언트 dbeaver datagrip workbench pgadmin 터미널 cli 연결테스트",
  c07:"계정만들기 유저생성 create user 권한 grant 데이터베이스생성 스키마 소유자",
  c08:"샘플데이터 실습 예제 더미데이터 seed 스키마 쇼핑몰 주문 회원",
  c09:"접속오류 connection refused 인증실패 password authentication failed ora-12541 access denied 포트 방화벽 bind-address",
  c10:"로드맵 학습순서 공부순서 무엇부터 커리큘럼 단계",

  q01:"sql이란 ddl dml dcl tcl 선언형 표준 ansi 방언",
  q02:"select 조회 별칭 alias distinct 컬럼선택 전체조회",
  q03:"where 조건 비교연산자 like 와일드카드 in between and or not 우선순위",
  q04:"order by 정렬 오름차순 내림차순 limit offset top fetch first 페이징",
  q05:"null 널 is null 삼값논리 nvl coalesce ifnull 집계에서제외 not in 함정",
  q06:"자료형 데이터타입 varchar char text int bigint decimal float 소수점 돈 금액 boolean date timestamp",
  q07:"insert 삽입 update 수정 delete 삭제 where없이 사고 롤백 truncate 차이",
  q08:"create table 테이블만들기 제약 primary key foreign key unique check default not null alter table 컬럼추가",
  q09:"join 조인 inner left right full cross self 조인방향 카티션곱 중복증가 on 조건",
  q10:"group by 그룹 집계 count sum avg min max 그룹함수 여러컬럼",
  q11:"having where차이 집계조건 필터순서",
  q12:"서브쿼리 스칼라 인라인뷰 exists in 상관서브쿼리 성능",
  q13:"union all intersect except minus 집합연산 중복제거",
  q14:"함수 문자열 substr concat replace trim 날짜 현재시각 더하기 숫자 round 반올림 형변환 cast",
  q15:"case when 조건분기 coalesce nullif 값바꾸기 등급",
  q16:"view 뷰 임시테이블 cte 재사용 가상테이블 갱신가능",
  q17:"트랜잭션 commit rollback autocommit 원자성 시작 종료",
  q18:"실행순서 from where group having select order 논리적순서 별칭못쓰는이유",
  q19:"치트시트 요약 정리 한장 문법정리",

  e01:"윈도우함수 over partition by 분석함수 집계와차이 행유지",
  e02:"rank dense_rank row_number 순위 등수 동점 상위n 그룹별top",
  e03:"lag lead 이전행 다음행 증감 누적합 running total 이동평균 프레임 rows between unbounded",
  e04:"cte with 절 가독성 문단 재사용 서브쿼리대체 materialized",
  e05:"재귀 recursive 계층 조직도 카테고리 트리 경로 부모자식 무한루프방지",
  e06:"grouping sets rollup cube 소계 총계 다차원집계 grouping",
  e07:"pivot 피벗 행열전환 crosstab case집계 unpivot",
  e08:"merge upsert on conflict on duplicate key insert or replace 있으면수정 없으면입력 4db비교",
  e09:"lateral cross apply 상관조인 행별top1 최근주문",
  e10:"json jsonb 문서 파싱 추출 배열 경로 json_table 4db비교",
  e11:"정규식 regexp like 패턴 전문검색 fulltext 유사도",
  e12:"집합기반 반복문제거 커서대신 set based 사고전환 성능차이",
  e13:"대량 배치 update delete 청크 나눠서 락최소화 백만건",
  e14:"안티패턴 하지말것 select* 함수인덱스 or서브쿼리 offset 페이징 n+1 count",
  e15:"전문가치트시트 요약 고급문법정리",

  o01:"오라클소개 에디션 se ee xe free 라이선스 비용 코어 감사",
  o02:"오라클설치 xe 21c free 23ai 도커 컨테이너 이미지 리스너 sid",
  o03:"sqlplus 접속 sql developer tnsnames easy connect 서비스명 sid 접속문자열",
  o04:"cdb pdb 멀티테넌트 계정생성 c## 공통사용자 스키마 권한 롤 시스템권한 객체권한",
  o05:"dual 더미테이블 rownum 페이징 offset fetch 오라클12c 상위n",
  o06:"nvl nvl2 decode 문자열함수 substr instr lpad 오라클전용",
  o07:"date 타입 to_date to_char 포맷 nls interval 날짜계산 timestamp with time zone",
  o08:"시퀀스 sequence nextval currval identity 자동증가 트리거 대체",
  o09:"connect by start with prior level sys_connect_by_path 계층쿼리 재귀 조직도",
  o10:"분석함수 keep dense_rank first ratio_to_report model절 오라클고급",
  o11:"plsql 블록 declare begin exception 커서 loop 변수 예외처리",
  o12:"패키지 프로시저 함수 bulk collect forall 성능 벌크바인딩 컨텍스트스위치",
  o13:"힌트 hint index full leading use_nl use_hash 옵티마이저 cbo 통계",
  o14:"실행계획 explain plan autotrace dbms_xplan awr ash statspack 성능진단 대기이벤트",
  o15:"파티션 range list hash 인터벌 로컬인덱스 글로벌인덱스 비트맵 함수기반",
  o16:"rac 클러스터 dataguard 스탠바이 rman 백업 복구 아카이브로그 플래시백",
  o17:"마이그레이션 오라클탈출 postgresql전환 ora2pg 방언차이 비용절감",

  p01:"postgresql소개 오픈소스 라이선스 버전 확장성 객체관계형",
  p02:"pg설치 apt yum brew 윈도우 도커 initdb 클러스터 데이터디렉터리 pg_hba",
  p03:"psql 메타명령 backslash l dt d 접속 스크립트 실행 출력형식 csv",
  p04:"role 역할 사용자 그룹 grant 스키마 search_path public 권한 소유자",
  p05:"returning upsert on conflict do update do nothing distinct on 최신행",
  p06:"배열 array 범위 range enum 복합타입 도메인 uuid 확장타입",
  p07:"jsonb json 연산자 화살표 경로 인덱싱 gin jsonb_path 문서저장 nosql처럼",
  p08:"인덱스 btree gin gist brin hash spgist 부분인덱스 표현식인덱스 concurrently 언제무엇",
  p09:"전문검색 tsvector tsquery 한국어 형태소 pg_bigm trigram 유사도 검색",
  p10:"plpgsql 함수 프로시저 트리거 반환 setof 예외 exception",
  p11:"mvcc xmin xmax vacuum autovacuum bloat 팽창 트랜잭션id 랩어라운드 freeze",
  p12:"explain analyze buffers 실행계획 seq scan index scan bitmap 비용 실제시간 읽는법",
  p13:"파티셔닝 선언적 range list hash 파티션프루닝 상속 대용량",
  p14:"확장 extension postgis 지리 pg_stat_statements pgvector 벡터 timescaledb citus",
  p15:"복제 스트리밍 논리복제 publication subscription 읽기전용 레플리카 지연 슬롯",
  p16:"백업 pg_dump pg_basebackup pitr wal 아카이브 복구 업그레이드 pg_upgrade",
  p17:"postgresql.conf shared_buffers work_mem maintenance_work_mem max_connections effective_cache_size 튜닝",

  m01:"mysql mariadb 차이 포크 라이선스 호환성 어느것 선택 오라클인수 버전대응",
  m02:"mysql설치 apt yum brew 윈도우 인스톨러 도커 초기비밀번호 secure_installation",
  m03:"mysql클라이언트 접속 계정생성 create user grant host % localhost 권한부여 flush privileges",
  m04:"문자셋 charset collation utf8 utf8mb4 한글깨짐 이모지 저장안됨 정렬규칙 ci bin 변환",
  m05:"스토리지엔진 innodb myisam 트랜잭션 락 차이 전환 memory archive",
  m06:"auto_increment limit ifnull 문자열함수 date_format now 방언 mysql전용",
  m07:"on duplicate key update replace into insert ignore group_concat json_arrayagg 업서트",
  m08:"날짜 datetime timestamp 차이 타임존 time_zone 서머타임 저장방식",
  m09:"인덱스 클러스터드 세컨더리 pk선택 인덱스구조 커버링 프리픽스 카디널리티",
  m10:"explain type ref range index scan rows filtered extra using filesort 옵티마이저 힌트 analyze",
  m11:"트랜잭션 격리수준 repeatable read 갭락 넥스트키락 인텐션락 데드락 information_schema innodb_trx 대기",
  m12:"저장프로시저 함수 트리거 이벤트스케줄러 delimiter",
  m13:"파티셔닝 range 온라인ddl algorithm inplace pt-online-schema-change gh-ost 대용량 alter",
  m14:"복제 replication 소스 레플리카 마스터 슬레이브 binlog gtid 반동기 지연 lag 읽기분산",
  m15:"백업 mysqldump 옵션 single-transaction xtrabackup binlog 시점복구 복원",
  m16:"my.cnf innodb_buffer_pool_size max_connections innodb_flush_log_at_trx_commit 튜닝 설정",
  m17:"mariadb전용 시퀀스 시스템버전테이블 temporal 스토리지엔진 aria columnstore 갈레라 galera",

  s01:"sqlite란 서버없음 파일하나 임베디드 라이브러리 어디에쓰나 세계에서가장많이쓰는",
  s02:"sqlite설치 다운로드 cli 실행 db브라우저 gui 파이썬내장",
  s03:"dot명령 .tables .schema .mode .import .output .backup .headers csv내보내기",
  s04:"동적타입 type affinity 문자열에숫자 타입강제 strict테이블 3.37",
  s05:"autoincrement rowid without rowid upsert on conflict integer primary key",
  s06:"날짜 datetime strftime julianday 문자열저장 date함수 문자열함수",
  s07:"pragma journal_mode synchronous foreign_keys cache_size temp_store 성능설정 외래키기본꺼짐",
  s08:"wal 모드 동시성 읽기쓰기 체크포인트 -wal -shm 파일 성능",
  s09:"인덱스 부분인덱스 표현식인덱스 analyze 쿼리플래너",
  s10:"fts5 전문검색 json1 확장 rtree 확장모듈",
  s11:"트랜잭션 잠금 database is locked busy_timeout immediate deferred 동시쓰기 해결",
  s12:"백업 .backup vacuum into 무결성 integrity_check 복구 암호화 sqlcipher",
  s13:"한계 동시쓰기 규모 어디까지 트래픽 실전사례 언제쓰면안되나 litestream turso",
  s14:"내장 모바일 안드로이드 ios 데스크톱 electron 엣지 wasm 로컬앱 설정저장",

  t01:"정규화 1정규형 2정규형 3정규형 이상현상 중복 갱신이상 함수종속",
  t02:"반정규화 비정규화 성능 집계컬럼 캐시컬럼 언제 트레이드오프",
  t03:"키설계 자연키 대리키 surrogate uuid ulid 순차 인덱스단편화 복합키",
  t04:"인덱스원리 b-tree 리프 루트 탐색 로그시간 정렬 랜덤io 클러스터드",
  t05:"복합인덱스 순서 선행컬럼 커버링 인덱스온리 include 스캔범위",
  t06:"인덱스안탐 형변환 함수사용 like앞와일드 or null 부정조건 통계낡음 카디널리티낮음",
  t07:"실행계획 읽는법 explain 4db 비교 seq scan full scan 비용 행수 실제",
  t08:"통계 카디널리티 히스토그램 analyze 옵티마이저오판 갱신주기",
  t09:"페이징 offset 느림 깊은페이지 커서페이징 keyset 무한스크롤 seek",
  t10:"acid 원자성 일관성 고립성 지속성 트랜잭션 개념",
  t11:"격리수준 read uncommitted committed repeatable serializable 더티리드 반복불가 팬텀 기본값db별",
  t12:"락 공유락 배타락 행락 테이블락 데드락 원인 해결 대기조회 타임아웃",
  t13:"커넥션풀 사이징 공식 max_connections 대기 hikari pgbouncer 누수",
  t14:"슬로우쿼리 느린쿼리 찾기 로그 pg_stat_statements 순서 절차 개선",
  t15:"모니터링 지표 tps qps 커넥션수 캐시히트율 복제지연 알람 대시보드",
  t16:"모델링실전 주문 재고 상태 이력 스냅샷 금액 정합성 설계사례",

  z01:"저장구조 페이지 블록 힙 슬롯 튜플 로우 물리적 파일 익스텐트",
  z02:"버퍼풀 캐시 히트율 lru 더티페이지 플러시 메모리크기 산정",
  z03:"wal redo undo 로그선기록 durability fsync 그룹커밋 성능",
  z04:"체크포인트 크래시복구 recovery aries 롤포워드 롤백 시작시간",
  z05:"mvcc 구현비교 postgresql undo innodb 롤백세그먼트 스냅샷 가시성 정리비용",
  z06:"락매니저 2pl 2단계잠금 인텐션락 래치 스핀락 경합",
  z07:"옵티마이저 비용모델 통계 카디널리티추정 조인순서 동적계획법 힌트",
  z08:"조인알고리즘 네스티드루프 해시조인 소트머지 선택기준 메모리 스필",
  z09:"파티셔닝 샤딩 샤드키 리밸런싱 크로스샤드 글로벌인덱스 라우팅",
  z10:"복제 동기 비동기 반동기 합의 raft paxos 페일오버 스플릿브레인 ha",
  z11:"분산트랜잭션 2pc xa saga 보상트랜잭션 아웃박스 최종일관성",
  z12:"cap 일관성모델 선형화 최종일관성 newsql spanner cockroach tidb",
  z13:"아카이빙 보관정책 파티션드롭 콜드스토리지 삭제 개인정보 파기",
  z14:"보안 최소권한 암호화 tde 전송암호화 감사 audit 마스킹 접근제어 유출",
  z15:"장애대응 시나리오 디스크풀 커넥션고갈 복제지연 롱트랜잭션 대응절차 포스트모템",
  z16:"dba없이 체크리스트 운영 백업검증 모니터링 권한 정기점검",

  a00:"조합 선택 언어 파이썬 자바 노드 python java node 연동 시작 빠른시작 설치 코드 복사 바로",
  a01:"드라이버 커넥션 연결문자열 dsn url 프로토콜 포트 옵션 ssl 타임아웃",
  a02:"파이썬 psycopg oracledb pymysql sqlite3 with 커서 파라미터 딕셔너리커서",
  a03:"자바 jdbc datasource hikari 풀설정 preparedstatement 배치 트랜잭션",
  a04:"노드 node pg mysql2 better-sqlite3 async await 풀 프로미스",
  a05:"sql인젝션 injection 파라미터바인딩 prepared 문자열연결금지 화이트리스트 orm도위험",
  a06:"orm sqlalchemy jpa hibernate mybatis prisma typeorm 장단점 쓸것인가 생쿼리",
  a07:"트랜잭션 코드 begin commit rollback 컨텍스트매니저 전파 자동커밋 함정",
  a08:"n+1 배치조회 in절 조인 eager lazy 반복쿼리 성능",
  a09:"마이그레이션 alembic flyway liquibase prisma 스키마버전 롤백 무중단 배포",
  a10:"대량적재 copy load data infile executemany bulk insert 성능 100배",
  a11:"재시도 retry 백오프 타임아웃 커넥션누수 헬스체크 서킷브레이커",
  a12:"테스트 db 롤백 testcontainers 픽스처 시드 격리 sqlite대체위험",
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
function fMark(text, toks){
  let out = fEsc(text);
  toks.forEach(t => {
    if (!t) return;
    const i = out.toLowerCase().indexOf(t);
    if (i < 0) return;
    out = out.slice(0, i) + "<mark>" + out.slice(i, i + t.length) + "</mark>" + out.slice(i + t.length);
  });
  return out;
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
window.addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if (id && document.getElementById(id)) goSec(id);
});

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

