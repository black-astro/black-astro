/* ============================================================
   2. 데모 — 눌러 가며 확인하는 위젯들
   ============================================================ */

/* ── c02 · 4대 DB 비교 카드 ───────────────────────────────── */
const DB_INFO = {
  oracle: {
    t: "Oracle Database",
    d: "대기업 기간계·금융의 표준. 기능과 안정성이 최고 수준이지만 <b>라이선스 비용이 매우 큽니다</b>. " +
       "무료판(Free)은 CPU·메모리·용량 제한이 있습니다.",
    good: "<b>강점</b> — 대용량 동시 처리, 성숙한 튜닝 도구(AWR·ASH), RAC·Data Guard 같은 검증된 고가용성, 두터운 국내 인력 풀",
    bad: "<b>주의</b> — 코어 단위 라이선스 비용, 가상화·클라우드에서 라이선스 계산이 복잡, 방언이 강해 다른 DB로 옮기기 어려움",
    use: "은행·보험·통신·공공 기간계, 이미 오라클로 돌아가는 레거시",
    cost: "유료 (Free 에디션은 12GB·2코어 제한)",
  },
  pg: {
    t: "PostgreSQL",
    d: "완전한 오픈소스인데 기능은 상용급입니다. <b>새로 시작한다면 기본값으로 골라도 후회가 적은</b> 선택입니다.",
    good: "<b>강점</b> — 표준 SQL 준수도 최고, JSONB·배열·전문검색 내장, 확장(PostGIS·pgvector)으로 영역 확대, 라이선스 비용 0",
    bad: "<b>주의</b> — MVCC 구조상 VACUUM 관리가 필요, 단순 조회 위주 벤치마크에서는 MySQL보다 느릴 수 있음, 커넥션당 프로세스라 풀 관리 필수",
    use: "신규 웹 서비스, 분석·지리·JSON이 섞인 시스템, 오라클 대체",
    cost: "무료 (PostgreSQL 라이선스)",
  },
  mysql: {
    t: "MySQL · MariaDB",
    d: "웹 서비스에서 가장 널리 쓰입니다. <b>단순 조회가 빠르고 자료가 압도적으로 많습니다.</b> " +
       "MariaDB는 MySQL에서 갈라져 나온 호환 DB입니다.",
    good: "<b>강점</b> — 설치·운영이 쉬움, 복제 구성이 간단, 호스팅·클라우드 지원 범위가 가장 넓음, 문제 해결 자료가 풍부",
    bad: "<b>주의</b> — 표준 SQL 준수도가 낮음, 문자셋(utf8mb4) 함정, 복잡한 분석 쿼리는 PostgreSQL보다 약함, MySQL은 GPL·상용 이중 라이선스",
    use: "일반 웹 서비스, 워드프레스·커머스, 읽기 비중이 큰 서비스",
    cost: "둘 다 설치·사용은 무료 — MySQL은 유료 판(기술지원·내장 판매용)이 따로 있고, MariaDB는 유료 판 자체가 없음",
  },
  sqlite: {
    t: "SQLite",
    d: "<b>서버가 없습니다.</b> DB가 파일 하나이고 앱 안에 라이브러리로 들어갑니다. " +
       "세상에서 가장 많이 배포된 DB이기도 합니다.",
    good: "<b>강점</b> — 설치·계정·포트가 아예 없음, 파일 복사로 이동, 읽기 성능이 매우 좋음, 모바일·데스크톱에 기본 탑재",
    bad: "<b>주의</b> — 동시에 쓰는 연결은 사실상 1개, 네트워크 접속 개념 없음, 사용자별 권한 없음, 대규모 쓰기 트래픽에는 부적합",
    use: "모바일 앱, 데스크톱 프로그램, 로컬 캐시, 테스트, 엣지·임베디드",
    cost: "완전 무료 — 만든 사람들이 저작권을 아예 풀어놓아(퍼블릭 도메인) 어디에 쓰든 조건이 없음",
  },
};
const DB_CODE = {
  oracle: `-- Oracle : 상위 10건
SELECT id, name
FROM   member
ORDER  BY joined_at DESC
FETCH  FIRST 10 ROWS ONLY;   -- 12c 이상`,
  pg: `-- PostgreSQL : 상위 10건
SELECT id, name
FROM   member
ORDER  BY joined_at DESC
LIMIT  10;`,
  mysql: `-- MySQL / MariaDB : 상위 10건
SELECT id, name
FROM   member
ORDER  BY joined_at DESC
LIMIT  10;`,
  sqlite: `-- SQLite : 상위 10건
SELECT id, name
FROM   member
ORDER  BY joined_at DESC
LIMIT  10;`,
};
function dbGo(k, el){
  const i = DB_INFO[k];
  if (!i) return;
  $$("#dbPick button").forEach(b => b.classList.toggle("on", b === el));
  $("#dbTitle").innerHTML = i.t;
  $("#dbDesc").innerHTML = i.d;
  $("#dbGood").innerHTML = i.good;
  $("#dbBad").innerHTML = i.bad;
  $("#dbUse").innerHTML = "<b>주로 쓰는 곳</b> — " + i.use + "<br><b>비용</b> — " + i.cost;
  setCode("#dbCode", DB_CODE[k]);
}

/* ── q09 · JOIN 5종 결과 비교 ─────────────────────────────── */
const JOIN_ROWS = {
  inner: [["1","김하늘","1001"],["2","박바다","1002"],["2","박바다","1005"]],
  left:  [["1","김하늘","1001"],["2","박바다","1002"],["2","박바다","1005"],["3","이구름","(NULL)"]],
  right: [["1","김하늘","1001"],["2","박바다","1002"],["2","박바다","1005"],["(NULL)","(NULL)","1009"]],
  full:  [["1","김하늘","1001"],["2","박바다","1002"],["2","박바다","1005"],["3","이구름","(NULL)"],["(NULL)","(NULL)","1009"]],
  cross: [["1","김하늘","1001"],["1","김하늘","1002"],["1","김하늘","1005"],["1","김하늘","1009"],["…","…","… (3×4 = 12행)"]],
};
const JOIN_NOTE = {
  inner: "<b>INNER JOIN</b> — 양쪽에 <b>둘 다 있는</b> 것만. 주문이 없는 회원 <b>이구름</b>은 사라지고, 회원이 없는 주문 <b>1009</b>도 사라집니다.",
  left:  "<b>LEFT JOIN</b> — <b>왼쪽(member)은 전부</b> 남깁니다. 주문이 없는 이구름도 나오고, 없는 쪽은 NULL이 됩니다. 실무에서 가장 많이 씁니다.",
  right: "<b>RIGHT JOIN</b> — 오른쪽(orders)을 전부 남깁니다. 테이블 순서만 바꾸면 LEFT와 같으므로 <b>실무에서는 잘 안 씁니다</b>.",
  full:  "<b>FULL OUTER JOIN</b> — 양쪽 모두 남깁니다. 데이터 대사(어느 쪽에만 있는 행 찾기)에 유용합니다. <b>MySQL·SQLite는 지원하지 않아</b> UNION으로 흉내 냅니다.",
  cross: "<b>CROSS JOIN</b> — 모든 조합. 3명 × 4주문 = 12행. 조건을 빠뜨린 조인이 바로 이것이 되어 <b>행이 폭발</b>합니다.",
};
function joinGo(k, el){
  $$("#joinCtrl .chip").forEach(b => b.classList.toggle("on", b === el));
  const rows = JOIN_ROWS[k] || [];
  $("#joinT").innerHTML =
    "<thead><tr><th>m.id</th><th>m.name</th><th>o.order_no</th></tr></thead><tbody>" +
    rows.map(r => "<tr>" + r.map(c =>
      `<td${c === "(NULL)" ? ' class="nan"' : ""}>${c}</td>`).join("") + "</tr>").join("") +
    "</tbody>";
  $("#joinNote").innerHTML = JOIN_NOTE[k];
  $("#joinCount").textContent = k === "cross" ? "12행" : rows.length + "행";
}

/* ── q18 · SQL 실행 순서 ──────────────────────────────────── */
const SQL_STEP = [
  ["FROM · JOIN", "읽을 테이블을 정하고 붙인다", "이 단계에서 행 수가 결정됩니다. 조인 조건이 없으면 여기서 폭발합니다."],
  ["WHERE", "행을 거른다", "아직 그룹이 없으므로 <b>집계 함수를 쓸 수 없습니다</b>. COUNT(*)는 여기서 못 씁니다."],
  ["GROUP BY", "남은 행을 묶는다", "묶고 나면 그룹 하나가 결과 한 행이 됩니다."],
  ["HAVING", "묶인 그룹을 거른다", "여기서는 집계 함수를 <b>쓸 수 있습니다</b>. WHERE와의 차이가 바로 이것입니다."],
  ["SELECT", "보여줄 컬럼을 고른다", "컬럼 별칭(AS)이 <b>여기서 처음 생깁니다</b>. 그래서 WHERE에서는 별칭을 못 씁니다."],
  ["DISTINCT", "중복을 제거한다", "SELECT로 고른 결과 기준으로 중복을 없앱니다."],
  ["ORDER BY", "정렬한다", "SELECT 다음이라 <b>별칭을 쓸 수 있습니다</b>."],
  ["LIMIT · OFFSET", "몇 개만 자른다", "가장 마지막입니다. 그래서 OFFSET이 커도 앞 단계 비용은 줄지 않습니다."],
];
function sqlStep(n){
  const box = $("#sqlSteps");
  if (!box) return;
  $$("#sqlSteps .st").forEach((e, i) => {
    e.classList.toggle("on", i === n);
    e.classList.toggle("done", i < n);
  });
  const s = SQL_STEP[n];
  $("#sqlStepNote").innerHTML =
    `<b>${n + 1}. ${s[0]}</b> — ${s[1]}<br><span style="color:var(--dim)">${s[2]}</span>`;
}
function sqlStepInit(){
  const box = $("#sqlSteps");
  if (!box || box.children.length) return;
  box.innerHTML = SQL_STEP.map((s, i) =>
    `<button class="st" type="button" onclick="sqlStep(${i})">${s[0]}</button>`).join("");
  sqlStep(0);
}

/* ── t11 · 격리 수준 비교 ─────────────────────────────────── */
const ISO = {
  ru: ["READ UNCOMMITTED",
       [["더티 리드","발생","bad"],["반복 불가 읽기","발생","bad"],["팬텀 리드","발생","bad"]],
       "커밋되지 않은 남의 변경까지 보입니다. <b>거의 쓰지 않습니다.</b> (PostgreSQL은 이 수준을 요청해도 READ COMMITTED로 동작)"],
  rc: ["READ COMMITTED",
       [["더티 리드","방지","ok"],["반복 불가 읽기","발생","bad"],["팬텀 리드","발생","bad"]],
       "커밋된 것만 보입니다. 같은 쿼리를 두 번 하면 결과가 다를 수 있습니다. <b>Oracle·PostgreSQL·SQL Server의 기본값</b>입니다."],
  rr: ["REPEATABLE READ",
       [["더티 리드","방지","ok"],["반복 불가 읽기","방지","ok"],["팬텀 리드","일부 방지","warn"]],
       "트랜잭션 안에서 같은 행을 몇 번 읽어도 같습니다. <b>MySQL InnoDB의 기본값</b>이며, InnoDB는 갭 락으로 팬텀까지 대부분 막습니다."],
  ser: ["SERIALIZABLE",
       [["더티 리드","방지","ok"],["반복 불가 읽기","방지","ok"],["팬텀 리드","방지","ok"]],
       "트랜잭션이 한 줄로 선 것처럼 동작합니다. 가장 안전하지만 <b>충돌·대기가 늘어</b> 재시도 처리가 필요합니다."],
};
function isoGo(k, el){
  const i = ISO[k];
  if (!i) return;
  $$("#isoCtrl .chip").forEach(b => b.classList.toggle("on", b === el));
  $("#isoTitle").textContent = i[0];
  $("#isoT").innerHTML =
    "<thead><tr><th>이상 현상</th><th>이 수준에서는</th></tr></thead><tbody>" +
    i[1].map(r => `<tr><td>${r[0]}</td><td class="${r[2] === "ok" ? "ok" : r[2] === "warn" ? "warn" : "nan"}">${r[1]}</td></tr>`).join("") +
    "</tbody>";
  $("#isoNote").innerHTML = i[2];
}

/* ── a00 · 언어 × DB 연동 조합 선택기 ─────────────────────── */
const APPSEL = { lang: "py", db: "pg" };
const APP_LANG_NAME = { py: "Python", java: "Java", node: "Node.js" };
const APP_DB_NAME = { oracle: "Oracle", pg: "PostgreSQL", mysql: "MySQL · MariaDB", sqlite: "SQLite" };
const APP_HL = { py: "python", java: "java", node: "js" };

const APP_INS = {
  py: {
    pg:     'pip install "psycopg[binary]"  (풀까지 쓰려면 + psycopg_pool)',
    mysql:  "pip install PyMySQL",
    oracle: "pip install oracledb",
    sqlite: "설치 불필요 — 파이썬에 내장 (import sqlite3)",
  },
  java: {
    pg:     "Maven: org.postgresql : postgresql  +  com.zaxxer : HikariCP",
    mysql:  "Maven: com.mysql : mysql-connector-j  +  com.zaxxer : HikariCP",
    oracle: "Maven: com.oracle.database.jdbc : ojdbc11  +  com.zaxxer : HikariCP",
    sqlite: "Maven: org.xerial : sqlite-jdbc",
  },
  node: {
    pg:     "npm install pg",
    mysql:  "npm install mysql2",
    oracle: "npm install oracledb",
    sqlite: "npm install better-sqlite3",
  },
};

const APP_CODE = {
  py: {
    pg: `# PostgreSQL × Python — psycopg 3
import psycopg
from psycopg.rows import dict_row

with psycopg.connect(
        "postgresql://app:pw@localhost:5432/shop",
        connect_timeout=5,
        application_name="shop-api",
        row_factory=dict_row) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT id, name FROM member WHERE grade = %s", ("GOLD",))
        for row in cur:
            print(row["id"], row["name"])
# with 블록 종료 시 커밋(예외면 롤백) 후 연결 닫힘`,
    mysql: `# MySQL/MariaDB × Python — PyMySQL
import pymysql

conn = pymysql.connect(
    host="127.0.0.1", port=3306,
    user="app", password="pw", database="shop",
    charset="utf8mb4",                # ★ 한글·이모지 필수
    connect_timeout=5,
    cursorclass=pymysql.cursors.DictCursor)
try:
    with conn.cursor() as cur:
        cur.execute("SELECT id, name FROM member WHERE grade = %s", ("GOLD",))
        for row in cur.fetchall():
            print(row["id"], row["name"])
    conn.commit()                     # PyMySQL 은 autocommit 이 꺼져 있습니다
finally:
    conn.close()`,
    oracle: `# Oracle × Python — python-oracledb (thin 모드: 클라이언트 설치 불필요)
import oracledb

conn = oracledb.connect(
    user="app", password="pw",
    dsn="localhost:1521/FREEPDB1")    # host:port/service_name
with conn.cursor() as cur:
    cur.execute(
        "SELECT id, name FROM member WHERE grade = :g",   # ★ :이름 바인딩
        g="GOLD")
    for id_, name in cur:
        print(id_, name)
conn.close()`,
    sqlite: `# SQLite × Python — 표준 라이브러리 sqlite3
import sqlite3

conn = sqlite3.connect("shop.db")
conn.row_factory = sqlite3.Row        # 컬럼 이름으로 접근
conn.execute("PRAGMA journal_mode=WAL")   # ★ 읽기·쓰기 동시성 개선
conn.execute("PRAGMA foreign_keys=ON")    # ★ FK 는 켜야 동작합니다

cur = conn.execute("SELECT id, name FROM member WHERE grade = ?", ("GOLD",))
for row in cur:
    print(row["id"], row["name"])
conn.commit()
conn.close()`,
  },
  java: {
    pg: `// PostgreSQL × Java — JDBC + HikariCP
HikariConfig cfg = new HikariConfig();
cfg.setJdbcUrl("jdbc:postgresql://localhost:5432/shop");
cfg.setUsername("app");
cfg.setPassword("pw");
cfg.setMaximumPoolSize(10);
HikariDataSource ds = new HikariDataSource(cfg);

String sql = "SELECT id, name FROM member WHERE grade = ?";
try (Connection con = ds.getConnection();
     PreparedStatement ps = con.prepareStatement(sql)) {
    ps.setString(1, "GOLD");
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) System.out.println(rs.getLong("id") + " " + rs.getString("name"));
    }
}
// Spring Boot 라면 application.properties 두 줄이면 풀까지 자동:
// spring.datasource.url=jdbc:postgresql://localhost:5432/shop
// spring.datasource.username=app / password=pw`,
    mysql: `// MySQL/MariaDB × Java — JDBC + HikariCP
HikariConfig cfg = new HikariConfig();
cfg.setJdbcUrl("jdbc:mysql://localhost:3306/shop"
    + "?serverTimezone=Asia/Seoul&characterEncoding=UTF-8");
cfg.setUsername("app");
cfg.setPassword("pw");
cfg.setMaximumPoolSize(10);
HikariDataSource ds = new HikariDataSource(cfg);

String sql = "SELECT id, name FROM member WHERE grade = ?";
try (Connection con = ds.getConnection();
     PreparedStatement ps = con.prepareStatement(sql)) {
    ps.setString(1, "GOLD");
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) System.out.println(rs.getLong("id") + " " + rs.getString("name"));
    }
}
// MariaDB 전용 드라이버를 쓸 땐 jdbc:mariadb:// + org.mariadb.jdbc.Driver`,
    oracle: `// Oracle × Java — JDBC(ojdbc11) + HikariCP
HikariConfig cfg = new HikariConfig();
cfg.setJdbcUrl("jdbc:oracle:thin:@//localhost:1521/FREEPDB1");
cfg.setUsername("app");
cfg.setPassword("pw");
cfg.setMaximumPoolSize(10);
HikariDataSource ds = new HikariDataSource(cfg);

String sql = "SELECT id, name FROM member WHERE grade = ?";
try (Connection con = ds.getConnection();
     PreparedStatement ps = con.prepareStatement(sql)) {
    ps.setString(1, "GOLD");
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) System.out.println(rs.getLong("id") + " " + rs.getString("name"));
    }
}
// SID 로 접속해야 하는 옛 서버는 @host:1521:SID (콜론) 형식입니다`,
    sqlite: `// SQLite × Java — sqlite-jdbc (파일 DB라 풀 없이 씁니다)
String url = "jdbc:sqlite:shop.db";

try (Connection con = DriverManager.getConnection(url)) {
    con.createStatement().execute("PRAGMA journal_mode=WAL");
    con.createStatement().execute("PRAGMA foreign_keys=ON");

    String sql = "SELECT id, name FROM member WHERE grade = ?";
    try (PreparedStatement ps = con.prepareStatement(sql)) {
        ps.setString(1, "GOLD");
        try (ResultSet rs = ps.executeQuery()) {
            while (rs.next()) System.out.println(rs.getLong("id") + " " + rs.getString("name"));
        }
    }
}
// 서버가 아니라 '파일'입니다 — 여러 프로세스의 동시 쓰기에는 부적합`,
  },
  node: {
    pg: `// PostgreSQL × Node.js — pg (Pool 이 기본)
import pg from "pg";

const pool = new pg.Pool({
  connectionString: "postgresql://app:pw@localhost:5432/shop",
  max: 10,
  connectionTimeoutMillis: 5000,
});

const { rows } = await pool.query(
  "SELECT id, name FROM member WHERE grade = $1",   // ★ $1, $2 바인딩
  ["GOLD"]);
console.log(rows);

await pool.end();   // 앱 종료 시`,
    mysql: `// MySQL/MariaDB × Node.js — mysql2 (Promise + Pool)
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "127.0.0.1", port: 3306,
  user: "app", password: "pw", database: "shop",
  charset: "utf8mb4",
  connectionLimit: 10,
});

const [rows] = await pool.query(
  "SELECT id, name FROM member WHERE grade = ?",
  ["GOLD"]);
console.log(rows);

await pool.end();`,
    oracle: `// Oracle × Node.js — oracledb (thin 모드 기본)
import oracledb from "oracledb";
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;   // 객체로 받기

const pool = await oracledb.createPool({
  user: "app", password: "pw",
  connectString: "localhost:1521/FREEPDB1",
  poolMax: 10,
});

const conn = await pool.getConnection();
try {
  const r = await conn.execute(
    "SELECT id, name FROM member WHERE grade = :g",  // ★ :이름 바인딩
    { g: "GOLD" });
  console.log(r.rows);
} finally {
  await conn.close();     // ★ 풀에 반납 — 안 하면 커넥션 누수
}`,
    sqlite: `// SQLite × Node.js — better-sqlite3 (동기 API·가장 빠름)
import Database from "better-sqlite3";

const db = new Database("shop.db");
db.pragma("journal_mode = WAL");      // ★ 동시성 개선
db.pragma("foreign_keys = ON");

const rows = db
  .prepare("SELECT id, name FROM member WHERE grade = ?")
  .all("GOLD");
console.log(rows);

db.close();
// 동기 API 지만 로컬 파일이라 충분히 빠릅니다.
// 서버에서 대량 동시 쓰기가 필요하면 SQLite 가 아니라 서버형 DB 를 쓰세요`,
  },
};

const APP_NOTE = {
  py: {
    pg:     "<b>운영에서는 반드시 풀을 쓰세요</b> — <code>psycopg_pool.ConnectionPool</code>. PostgreSQL 은 커넥션마다 프로세스가 떠서 <b>풀 없이 붙으면 서버가 먼저 지칩니다</b>. 옛 자료의 <code>psycopg2</code> 는 유지보수 모드 — 신규는 psycopg 3 로 시작하세요.",
    mysql:  "<b><code>charset=\"utf8mb4\"</code> 를 빠뜨리면</b> 이모지·일부 한자가 <code>???</code> 로 깨집니다. PyMySQL 은 <b>autocommit 이 꺼져 있어</b> <code>conn.commit()</code> 을 안 부르면 변경이 사라집니다. C 확장 성능이 필요하면 <code>mysqlclient</code> 로 교체할 수 있습니다(API 거의 동일).",
    oracle: "<b>thin 모드가 기본</b>이라 Oracle Client 설치 없이 바로 붙습니다. 옛 자료의 <code>cx_Oracle</code> 은 이 라이브러리의 전신 — 신규는 <code>oracledb</code> 를 쓰세요. 지갑(Wallet)·고급 인증이 필요할 때만 thick 모드(<code>init_oracle_client()</code>)로 전환합니다.",
    sqlite: "<b>동시에 쓰는 연결은 사실상 1개</b>입니다 — 웹 서버 여러 워커가 같이 쓰면 <code>database is locked</code> 가 납니다(WAL 로 완화, 근본 해결은 서버형 DB). <code>PRAGMA foreign_keys=ON</code> 은 <b>연결마다</b> 다시 켜야 합니다.",
  },
  java: {
    pg:     "JDBC 를 직접 쓸 때도 <b>커넥션 풀(HikariCP)은 필수</b>입니다 — 연결 수립이 수십 ms 라 요청마다 새로 맺으면 그게 병목이 됩니다. Spring Boot 는 드라이버가 클래스패스에 있으면 <b>HikariCP 풀을 자동 구성</b>합니다.",
    mysql:  "URL 에 <b><code>serverTimezone=Asia/Seoul</code></b> 이 없으면 시간이 9시간 어긋나는 사고가 흔합니다. 8.x 드라이버 클래스는 <code>com.mysql.cj.jdbc.Driver</code> — 옛 <code>com.mysql.jdbc.Driver</code> 는 deprecated 입니다.",
    oracle: "<code>@//host:port/서비스명</code> (슬래시 2개)이 서비스명 방식, <code>@host:port:SID</code> (콜론)가 SID 방식입니다 — <b>이걸 헷갈리면 ORA-12514 가 납니다</b>. ojdbc 버전은 JDK 버전과 짝(ojdbc11 = JDK11+)을 맞추세요.",
    sqlite: "파일 DB 라 <b>커넥션 풀이 오히려 독</b>이 될 수 있습니다(동시 쓰기 잠금). 임베디드·테스트 용도로는 훌륭하지만, <b>서버 애플리케이션의 주 DB 로는 권장하지 않습니다</b>.",
  },
  node: {
    pg:     "바인딩이 <b><code>$1, $2</code> 순번 방식</b>인 것이 다른 DB 와 다른 점입니다. <code>pool.query()</code> 는 자동으로 빌려 쓰고 반납하지만, <b>트랜잭션은 <code>pool.connect()</code> 로 한 커넥션을 잡고</b> BEGIN…COMMIT 후 <code>release()</code> 해야 합니다.",
    mysql:  "옛 <code>mysql</code> 패키지는 Promise 미지원 — <b><code>mysql2/promise</code></b> 를 쓰세요. <code>pool.query()</code> 는 자동 반납, <code>pool.getConnection()</code> 을 썼다면 <b>반드시 <code>conn.release()</code></b> — 안 하면 풀이 말라붙습니다.",
    oracle: "<code>conn.close()</code> 는 연결 종료가 아니라 <b>풀 반납</b>입니다 — try/finally 로 반드시 부르세요. 기본 출력이 배열이라 <code>OUT_FORMAT_OBJECT</code> 설정을 앱 시작 시 한 번 해 두는 것이 편합니다.",
    sqlite: "better-sqlite3 는 <b>일부러 동기 API</b> 입니다 — 로컬 파일 I/O 는 이벤트 루프를 잠깐만 막고, 그게 비동기 오버헤드보다 빠릅니다. 단 <b>무거운 집계 쿼리는 이벤트 루프를 오래 막으니</b> 워커 스레드로 빼세요.",
  },
};

function appRender(){
  const { lang, db } = APPSEL;
  $("#appDep").innerHTML = "<b>설치</b> — " + DEMO_ESC(APP_INS[lang][db]);
  const pre = $("#appCode");
  pre.dataset.lang = APP_HL[lang];
  setCode("#appCode", APP_CODE[lang][db]);
  $("#appNote").innerHTML = APP_NOTE[lang][db];
  const secRef = { py: "a02", java: "a03", node: "a04" }[lang];
  $("#appRef").innerHTML =
    `<b>${APP_LANG_NAME[lang]} × ${APP_DB_NAME[db]}</b> 조합을 보고 있습니다. ` +
    `더 깊게 — 언어별 상세는 <b>${secRef === "a02" ? "02" : secRef === "a03" ? "03" : "04"}번 섹션</b>, ` +
    `인젝션 방어는 <b>05</b>, 트랜잭션은 <b>06</b>, 타임아웃·커넥션 누수는 <b>07</b>번 섹션에서 이어집니다.`;
}
const DEMO_ESC = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function appLang(k, el){
  APPSEL.lang = k;
  $$("#appLangPick button").forEach(b => b.classList.toggle("on", b === el));
  appRender();
}
function appDb(k, el){
  APPSEL.db = k;
  $$("#appDbPick button").forEach(b => b.classList.toggle("on", b === el));
  appRender();
}

/* ── 치트시트 · 방언 대조표 검색 필터 (여러 탭에서 공용) ──── */
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
    ? `${n}개 찾음 — 원하는 게 없으면 다른 낱말로 (예: 페이징 · 문자열 · 날짜 · 업서트)`
    : `전체 ${rows.length}개 · 위 칸에 하려는 일을 한글로 입력해 보세요`;
}
function cheatSet(inputId, tableId, countId, q){
  const inp = $("#" + inputId);
  if (!inp) return;
  inp.value = q;
  cheatFilter(inputId, tableId, countId);
  if (q) inp.focus();
}

/* 탭별 최초 1회 초기화 */
TAB_INIT.sql  = function(){ sqlStepInit(); joinGo("inner", $("#joinCtrl .chip")); };
TAB_INIT.app  = function(){ appRender(); };
TAB_INIT.tune = function(){ isoGo("rc", $("#isoCtrl .chip:nth-child(2)")); };
TAB_INIT.pro  = function(){ cheatFilter("proQ", "proTable", "proCount"); };
