/* ============================================================
   27. 데이터베이스 탭 데모
   ============================================================ */
/* --- [d01] 4대 DB 스위처 --- */
const DBS = {
  oracle: {
    t:"Oracle Database", cls:"c-ora",
    desc:"1979년부터 이어진 <b>상용 RDBMS의 기준</b>. 대용량·고동시성·복구에 강해 금융·통신·ERP 같은 기간계 시스템의 사실상 표준입니다. 대신 비쌉니다.",
    good:"<b>강점</b> — 안정성과 동시성 처리, 파티셔닝·RAC 같은 대규모 기능, 20년 넘게 쌓인 운영 노하우와 사람. 장애가 나도 <b>물어볼 곳이 있습니다</b>.",
    bad:"<b>주의</b> — 라이선스가 비싸고 코어 수로 과금됩니다. 그리고 <code>''</code>(빈 문자열)을 NULL로 취급하고 <code>DATE</code>에 시각이 포함되는 등 <b>독자 규칙</b>이 많아 이식이 어렵습니다.",
    code:`import oracledb              # uv add oracledb

conn = oracledb.connect(
    user="scott", password=PW,
    dsn="localhost:1521/XEPDB1",   # thin 모드 = 클라이언트 설치 불필요
)
with conn.cursor() as cur:
    cur.execute("SELECT id, name FROM member WHERE grade = :g", g="VIP")
    print(cur.fetchall())
conn.commit(); conn.close()`,
    m:[["1521","기본 포트"],["READ COMMITTED","기본 격리수준"],["oracledb","파이썬 드라이버"]],
  },
  mysql: {
    t:"MySQL / MariaDB", cls:"c-my",
    desc:"웹의 기본값. 설치가 쉽고 단순 조회가 빠릅니다. 워드프레스부터 대형 서비스까지 가장 많이 깔려 있는 DB입니다. MariaDB는 MySQL에서 갈라져 나온 <b>완전 오픈소스 호환 버전</b>입니다.",
    good:"<b>강점</b> — 학습 자료가 압도적으로 많고, 어떤 호스팅에도 있습니다. 단순 <code>SELECT ... WHERE</code> 위주 서비스에서는 가볍고 빠릅니다.",
    bad:"<b>주의</b> — 문자셋을 <code>utf8</code>이 아니라 <b><code>utf8mb4</code></b>로 잡아야 이모지가 안 깨집니다. FULL OUTER JOIN이 없고, 윈도우 함수는 <b>8.0부터</b>입니다.",
    code:`import pymysql               # uv add pymysql

conn = pymysql.connect(
    host="localhost", port=3306, user="root", password=PW, db="shop",
    charset="utf8mb4",             # ★ utf8 아님
    cursorclass=pymysql.cursors.DictCursor,
)
with conn:
    with conn.cursor() as cur:
        cur.execute("SELECT id, name FROM member WHERE grade = %s", ("VIP",))
        print(cur.fetchall())
    conn.commit()`,
    m:[["3306","기본 포트"],["REPEATABLE READ","기본 격리수준"],["PyMySQL","파이썬 드라이버"]],
  },
  pg: {
    t:"PostgreSQL", cls:"c-pg",
    desc:"“가장 발전된 오픈소스 DB”를 표방합니다. <b>완전 무료</b>인데 복잡한 쿼리·집계·JSON·지리정보까지 강합니다. 새로 시작한다면 기본값으로 삼기 좋습니다.",
    good:"<b>강점</b> — 표준 SQL 준수도가 높고, <code>JSONB</code>·배열·전문검색·확장(PostGIS, pgvector)이 강력합니다. <b>DDL도 트랜잭션에 넣을 수 있어</b> 스키마 변경이 안전합니다.",
    bad:"<b>주의</b> — 갱신이 많은 테이블은 죽은 행이 쌓여 <b>VACUUM</b> 관리가 필요합니다. 커넥션 하나가 프로세스 하나라 <b>커넥션 풀이 사실상 필수</b>입니다.",
    code:`import psycopg               # uv add "psycopg[binary]"
from psycopg.rows import dict_row

DSN = "postgresql://user:pw@localhost:5432/shop"
with psycopg.connect(DSN, row_factory=dict_row) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT id, name FROM member WHERE grade = %s", ("VIP",))
        for row in cur:
            print(row["name"])
    # with 블록 정상 종료 -> 자동 COMMIT`,
    m:[["5432","기본 포트"],["READ COMMITTED","기본 격리수준"],["psycopg","파이썬 드라이버"]],
  },
  redis: {
    t:"Redis (또는 Valkey)", cls:"c-rd",
    desc:"표도 SQL도 없습니다. <b>키 하나에 자료구조 하나</b>를 메모리에 얹어 두고 μs 단위로 읽고 씁니다. RDBMS를 대체하는 게 아니라 <b>앞에 세워 두는</b> 물건입니다.",
    good:"<b>강점</b> — 캐시·세션·순위표·큐·분산 락이 전부 명령 한 줄입니다. TTL을 주면 <b>알아서 사라져</b> 청소 코드가 필요 없습니다.",
    bad:"<b>주의</b> — 메모리가 곧 용량 한계이고 <b>단일 스레드</b>라 무거운 명령 하나가 전체를 막습니다. <code>KEYS *</code> 금지, 기본이 <b>무인증</b>이므로 <code>requirepass</code> 필수.",
    code:`import redis                 # uv add redis

r = redis.Redis(host="localhost", port=6379, db=0,
                decode_responses=True)     # bytes 대신 str

r.set("user:1:name", "김민준", ex=300)     # 300초 뒤 자동 삭제
print(r.get("user:1:name"))

pipe = r.pipeline()                        # 왕복 1회로 여러 명령
pipe.incr("page:views"); pipe.zadd("rank", {"김민준": 320})
pipe.execute()`,
    m:[["6379","기본 포트"],["단일 스레드","실행 모델"],["redis-py","파이썬 드라이버"]],
  },
};
function dbGo(k, btn){
  $$("#dbPick button").forEach(b => b.classList.toggle("on", b === btn));
  const d = DBS[k]; if (!d) return;
  const t = $("#dbTitle"); if (t){ t.className = "mini " + d.cls; t.textContent = d.t; }
  const set = (sel, html) => { const e = $(sel); if (e) e.innerHTML = html; };
  set("#dbDesc", d.desc);
  set("#dbGood", d.good);
  set("#dbBad",  d.bad);
  setCode("#dbCode", d.code);
  set("#dbMeter", d.m.map(([v, s]) => `<div><b style="font-size:14px">${v}</b><span>${s}</span></div>`).join(""));
}

/* --- [d02] 키(Key) --- */
const KEY_M = [[1,"김민준","min@x.com"],[2,"이서연","seo@x.com"],[3,"박지훈","park@x.com"]];
const KEY_O = [[101,1,320],[102,1,150],[103,2,410]];
const KEY_TXT = {
  none:"왼쪽은 <b>회원</b>, 오른쪽은 <b>주문</b>입니다. 주문 표에는 회원 이름이 없고 <code>member_id</code> 숫자만 있습니다 — 이 숫자가 두 표를 잇는 <b>연결 고리</b>입니다.",
  pk:"<b>기본키(PRIMARY KEY)</b> — 각 행을 유일하게 가리키는 값입니다. <b>중복될 수 없고 비어 있을 수도 없습니다</b>. 회원의 <code>id</code>, 주문의 <code>id</code>가 그것입니다.",
  fk:"<b>외래키(FOREIGN KEY)</b> — 주문의 <code>member_id</code>는 회원의 <code>id</code>를 가리킵니다. DB가 이 관계를 <b>강제로 검사</b>하므로, 없는 회원의 주문은 애초에 저장되지 않습니다.",
  bad:"<b>위반 시도</b> — <code>member_id = 9</code>인 주문을 넣으려 하면 9번 회원이 없으므로 DB가 <b>거부</b>합니다. (<code>ORA-02291</code> / <code>Cannot add or update a child row</code> / <code>violates foreign key constraint</code>)",
};
function keyGo(k, btn){
  $$("#d02 .ctrls .chip").forEach(b => b.classList.toggle("on", b === btn));
  const t1 = $("#keyT1"), t2 = $("#keyT2");
  if (t1) t1.innerHTML =
    `<thead><tr><th class="${k==="pk"?"hl-col":""}">id ${k==="pk"?"🔑":""}</th><th>name</th><th>email</th></tr></thead><tbody>` +
    KEY_M.map(([a,b2,c]) =>
      `<tr><td class="${k==="pk"?"hl-cell":(k==="fk"?"hl-col":"")}">${a}</td><td>${b2}</td><td>${c}</td></tr>`).join("") +
    `</tbody>`;
  if (t2){
    let rows = KEY_O.map(([a,b2,c]) =>
      `<tr><td class="${k==="pk"?"hl-cell":""}">${a}</td>` +
      `<td class="${k==="fk"?"hl-cell":""}">${b2}</td><td>${c}</td></tr>`).join("");
    if (k === "bad") rows += `<tr class="jrow"><td>104</td><td style="color:var(--rose);font-weight:700">9</td><td>500</td></tr>`;
    t2.innerHTML =
      `<thead><tr><th class="${k==="pk"?"hl-col":""}">id ${k==="pk"?"🔑":""}</th>` +
      `<th class="${k==="fk"?"hl-col":""}">member_id ${k==="fk"?"🔗":""}</th><th>amount</th></tr></thead><tbody>${rows}</tbody>`;
  }
  const n = $("#keyNote");
  if (n){
    n.className = "stepnote" + (k === "bad" ? " bad" : (k === "none" ? "" : " ok"));
    n.innerHTML = `<span class="n">${k === "bad" ? "거부됨" : (k === "none" ? "기본" : (k === "pk" ? "PK" : "FK"))}</span>` +
                  `<span class="tx">${KEY_TXT[k]}</span>`;
  }
}

/* --- [d03] SQL 실행 순서 --- */
const SF = [
  ["1","FROM",     "orders 테이블의 행을 <b>전부 꺼내 옵니다</b>. 모든 것은 여기서 시작합니다."],
  ["2","JOIN",     "member 를 <code>member.id = orders.member_id</code> 기준으로 <b>옆에 붙입니다</b>. 이 시점에 team 컬럼이 생깁니다."],
  ["3","WHERE",    "<b>개별 행</b>을 조건으로 거릅니다. 아직 그룹도 집계도 없으므로 <b>SUM() 을 쓸 수 없습니다</b>."],
  ["4","GROUP BY", "team 값이 같은 행들을 <b>한 덩어리로 묶습니다</b>. 이제부터 한 덩어리가 한 줄이 됩니다."],
  ["5","HAVING",   "묶인 <b>그룹</b>을 조건으로 거릅니다. 여기서는 <code>SUM()</code> 을 쓸 수 있습니다."],
  ["6","SELECT",   "드디어 보여줄 컬럼을 고르고 <b>별칭(AS total)이 이때 생깁니다</b>. — WHERE가 별칭을 못 쓰는 이유가 이것입니다."],
  ["7","ORDER BY", "정렬합니다. SELECT 다음이라 <b>여기서는 별칭을 쓸 수 있습니다</b>."],
  ["8","LIMIT",    "정렬된 결과에서 <b>앞의 5개만</b> 잘라 돌려줍니다. 가장 마지막입니다."],
];
function sfGen(){
  const S = [{ on:-1, note:"SQL은 <b>적힌 순서대로 실행되지 않습니다</b>. 실제 순서를 한 단계씩 따라가 보세요." }];
  SF.forEach((r, i) => S.push({ on:i, note:`<b>${i + 1}. ${r[1]}</b> — ${r[2]}` }));
  S.push({ on:SF.length, tone:"ok",
    note:"정리 — <b>FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT</b>. 이 순서만 외우면 “왜 별칭이 안 먹지?”가 전부 설명됩니다." });
  return S;
}
function sfRender(s){
  const el = $("#sfFlow"); if (!el) return;
  el.innerHTML = SF.map((r, i) =>
    `<div class="sr ${i === s.on ? "on" : (i < s.on ? "past" : "")}">` +
    `<span class="o">${r[0]}</span><span class="kx">${r[1]}</span>` +
    `<span class="ds">${r[2].replace(/<[^>]+>/g, "")}</span></div>`).join("");
}

/* --- [d04] WHERE --- */
const WH_ROWS = [
  { id:1, name:"김민준", team:"A", amount:320, grade:"VIP" },
  { id:2, name:"이서연", team:"B", amount:150, grade:null },
  { id:3, name:"박지훈", team:"A", amount:520, grade:"GOLD" },
  { id:4, name:"김하늘", team:"C", amount:280, grade:null },
  { id:5, name:"최유진", team:"B", amount:410, grade:"VIP" },
  { id:6, name:"김도윤", team:"C", amount:640, grade:"GOLD" },
];
const WH = [
  { sql:"SELECT * FROM orders;", f:() => true,
    d:"조건이 없으면 <b>전부</b> 나옵니다. 실무에서는 절대 그냥 쓰지 마세요 — 100만 행이면 100만 행을 다 가져옵니다." },
  { sql:"SELECT * FROM orders\nWHERE amount &gt;= 300;", f:r => r.amount >= 300,
    d:"숫자 비교입니다. <code>&gt;=</code> 는 “크거나 같다”. <code>BETWEEN 300 AND 500</code> 은 <b>양 끝을 포함</b>합니다." },
  { sql:"SELECT * FROM orders\nWHERE team = 'A';", f:r => r.team === "A",
    d:"문자열은 <b>홑따옴표</b>로 감쌉니다. 쌍따옴표는 대부분의 DB에서 <b>컬럼 이름</b>을 뜻합니다." },
  { sql:"SELECT * FROM orders\nWHERE team = 'A'\n  AND amount &gt;= 300;", f:r => r.team === "A" && r.amount >= 300,
    d:"<b>AND</b> 는 둘 다 만족해야 합니다. 조건이 늘수록 결과는 줄어듭니다. (OR 은 반대)" },
  { sql:"SELECT * FROM orders\nWHERE name LIKE '김%';", f:r => r.name.startsWith("김"),
    d:"<code>%</code> = 아무 글자 0개 이상, <code>_</code> = 아무 글자 1개. <b>앞에 <code>%</code>를 붙이면 인덱스를 못 씁니다</b>(§08)." },
  { sql:"SELECT * FROM orders\nWHERE grade IS NULL;", f:r => r.grade === null,
    d:"NULL 은 “값이 없음”이라 <b><code>= NULL</code> 로는 절대 안 잡힙니다</b>. 반드시 <code>IS NULL</code>." },
  { sql:"SELECT * FROM orders\nWHERE team IN ('A','C');", f:r => ["A","C"].includes(r.team),
    d:"<code>IN</code> 은 <code>team='A' OR team='C'</code> 를 짧게 쓴 것입니다. 목록이 길수록 가독성이 좋습니다." },
];
function whGo(i, btn){
  $$("#whBar .chip").forEach(b => b.classList.toggle("on", b === btn));
  const w = WH[i];
  const keep = WH_ROWS.filter(w.f);
  const t = $("#whTable");
  if (t) t.innerHTML =
    `<thead><tr><th>id</th><th>name</th><th>team</th><th>amount</th><th>grade</th></tr></thead><tbody>` +
    WH_ROWS.map(r => {
      const on = keep.includes(r);
      return `<tr class="${on ? "jrow" : "dimmed"}"><td>${r.id}</td><td>${r.name}</td>` +
             `<td>${r.team}</td><td>${r.amount}</td>` +
             `<td>${r.grade === null ? '<span class="nan">NULL</span>' : r.grade}</td></tr>`;
    }).join("") + `</tbody>`;
  setCode("#whCode", w.sql.replace(/&gt;/g, ">"));
  AVX.set("#whHit", keep.length);
  AVX.set("#whAll", WH_ROWS.length);
  const d = $("#whDesc"); if (d) d.innerHTML = w.d;
}

/* --- [d05] JOIN --- */
const JO_M = [[1,"김민준"],[2,"이서연"],[3,"박지훈"]];
const JO_O = [[101,1,320],[102,1,150],[103,2,410],[104,9,500]];
const JO_TXT = {
  inner:["INNER JOIN","<b>양쪽에 다 있는 것만</b> 남깁니다. 짝이 없는 박지훈(주문 없음)과 104번 주문(회원 없음)은 <b>사라집니다</b>. 가장 많이 쓰지만, 데이터가 조용히 빠지는 것도 이 때문입니다.", "both"],
  left:["LEFT JOIN","<b>왼쪽(member)은 전부</b> 남기고, 짝이 없으면 오른쪽을 <b>NULL로 채웁니다</b>. “주문이 없는 회원도 보여줘”가 이것입니다.", "l"],
  right:["RIGHT JOIN","<b>오른쪽(orders)은 전부</b> 남깁니다. 회원이 없는 104번 주문이 살아남았습니다 — 실무에서 <b>고아 데이터를 찾는</b> 데 씁니다.", "r"],
  full:["FULL OUTER JOIN","<b>양쪽 전부</b>를 남기고 없는 쪽은 NULL. 두 시스템의 데이터를 대조할 때 씁니다. <b>MySQL은 지원하지 않아</b> UNION으로 흉내냅니다.", "both2"],
  cross:["CROSS JOIN","조건 없이 <b>모든 조합</b>(3 × 4 = 12행). 실수로 <code>ON</code>을 빠뜨리면 이게 됩니다 — 100만 × 100만이면 서버가 멈춥니다.", "x"],
};
function joGo(k, btn){
  $$("#d05 .ctrls .chip").forEach(b => b.classList.toggle("on", b === btn));
  const L = $("#joL"), R = $("#joR"), O = $("#joOut");
  const mUsed = new Set(), oUsed = new Set();
  const out = [];
  if (k === "cross"){
    JO_M.forEach(m => JO_O.forEach(o => out.push([m[1], o[0], o[2]])));
    JO_M.forEach(m => mUsed.add(m[0])); JO_O.forEach(o => oUsed.add(o[0]));
  } else {
    JO_M.forEach(m => {
      const hits = JO_O.filter(o => o[1] === m[0]);
      if (hits.length){
        hits.forEach(o => { out.push([m[1], o[0], o[2]]); mUsed.add(m[0]); oUsed.add(o[0]); });
      } else if (k === "left" || k === "full"){
        out.push([m[1], null, null]); mUsed.add(m[0]);
      }
    });
    if (k === "right" || k === "full"){
      JO_O.forEach(o => {
        if (!JO_M.some(m => m[0] === o[1])){ out.push([null, o[0], o[2]]); oUsed.add(o[0]); }
      });
    }
  }
  if (L) L.innerHTML = `<thead><tr><th>id</th><th>name</th></tr></thead><tbody>` +
    JO_M.map(m => `<tr class="${mUsed.has(m[0]) ? "" : "dimmed"}"><td>${m[0]}</td><td>${m[1]}</td></tr>`).join("") + `</tbody>`;
  if (R) R.innerHTML = `<thead><tr><th>id</th><th>member_id</th><th>amount</th></tr></thead><tbody>` +
    JO_O.map(o => `<tr class="${oUsed.has(o[0]) ? "" : "dimmed"}"><td>${o[0]}</td>` +
      `<td>${JO_M.some(m => m[0] === o[1]) ? o[1] : `<span style="color:var(--rose)">${o[1]}</span>`}</td><td>${o[2]}</td></tr>`).join("") + `</tbody>`;
  const nz2 = v => v === null ? '<span class="nan">NULL</span>' : v;
  if (O) O.innerHTML = `<thead><tr><th>name</th><th>order_id</th><th>amount</th></tr></thead><tbody>` +
    out.map((r, i) => `<tr class="jrow ${r.includes(null) ? "jnull" : ""}" style="animation-delay:${i * .04}s">` +
      `<td>${nz2(r[0])}</td><td>${nz2(r[1])}</td><td>${nz2(r[2])}</td></tr>`).join("") + `</tbody>`;
  const [title, desc, venn] = JO_TXT[k];
  const vl = $("#joVL"), vr = $("#joVR");
  if (vl && vr){
    vl.classList.toggle("act", venn === "l" || venn === "both2" || venn === "x" || venn === "both");
    vr.classList.toggle("act", venn === "r" || venn === "both2" || venn === "x" || venn === "both");
  }
  const n = $("#joNote");
  if (n) n.innerHTML = `<span class="n">${out.length}행</span><span class="tx"><b>${title}</b> — ${desc}</span>`;
}

/* --- [d06] GROUP BY --- */
const GBQ = [
  { id:1, team:"A", amount:320 }, { id:2, team:"B", amount:150 },
  { id:3, team:"A", amount:520 }, { id:4, team:"C", amount:280 },
  { id:5, team:"B", amount:410 }, { id:6, team:"A", amount:180 },
];
function gbqGen(){
  const S = [];
  const teams = [...new Set(GBQ.map(r => r.team))];
  S.push({ mark:null, out:[], note:"원본 6개 행입니다. 이제 <code>GROUP BY team</code> 이 무슨 일을 하는지 봅니다." });
  const out = [];
  teams.forEach(t => {
    S.push({ mark:t, out:[...out], note:`① <b>Split</b> — team 이 <b>${t}</b> 인 행들을 골라 한 덩어리로 묶습니다.` });
    const rows = GBQ.filter(r => r.team === t);
    const sum = rows.reduce((a, r) => a + r.amount, 0);
    S.push({ mark:t, out:[...out], calc:true,
      note:`② <b>Apply</b> — 그 덩어리에 집계 함수를 적용합니다: <code>SUM(amount)</code> = ${rows.map(r => r.amount).join(" + ")} = <b>${sum}</b>, <code>COUNT(*)</code> = ${rows.length}` });
    out.push([t, rows.length, sum, Math.round(sum / rows.length)]);
    S.push({ mark:t, out:[...out],
      note:`③ <b>Combine</b> — ${rows.length}개 행이 <b>한 줄로 접혔습니다</b>. 원본 행은 더 이상 접근할 수 없습니다.` });
  });
  S.push({ mark:null, out:[...out], tone:"ok",
    note:`6행 → <b>${out.length}행</b>. 이것이 GROUP BY 입니다. Pandas 의 <code>df.groupby("team").agg(...)</code> 와 완전히 같은 개념입니다.` });
  return S;
}
function gbqRender(s){
  const src = $("#gbqSrc"), out = $("#gbqOut");
  if (src) src.innerHTML = `<thead><tr><th>id</th><th>team</th><th>amount</th></tr></thead><tbody>` +
    GBQ.map(r => `<tr class="${s.mark === null ? "" : (r.team === s.mark ? "hl-row" : "dimmed")}">` +
      `<td>${r.id}</td><td>${r.team}</td><td>${r.amount}</td></tr>`).join("") + `</tbody>`;
  if (out) out.innerHTML = `<thead><tr><th>team</th><th>건수</th><th>합계</th><th>평균</th></tr></thead><tbody>` +
    (s.out.length ? s.out.map(r => `<tr class="jrow"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("")
                  : `<tr><td colspan="4" style="color:var(--dim-2)">아직 없음</td></tr>`) + `</tbody>`;
}

/* --- [d08] B-Tree 인덱스 --- */
const BT_NODES = [
  { x:.5,  y:.10, k:["40","80"],           lab:"루트" },
  { x:.18, y:.46, k:["10","25"],           lab:"" },
  { x:.50, y:.46, k:["55","70"],           lab:"" },
  { x:.82, y:.46, k:["90","95"],           lab:"" },
  { x:.18, y:.82, k:["1","10","25","38"],  lab:"" },
  { x:.50, y:.82, k:["41","55","57","70"], lab:"" },
  { x:.82, y:.82, k:["81","90","95","99"], lab:"" },
];
const BT_EDGES = [[0,1],[0,2],[0,3],[1,4],[2,5],[3,6]];
function btGen(){
  const S = [];
  const mk = (on, hit, go, edge, note, tone) => S.push({ on, hit, go, edge, note, tone });
  mk([], {}, {}, [], "인덱스는 <b>정렬된 값들의 트리</b>입니다. <code>WHERE id = 57</code> 을 찾아 내려가 봅니다. 전체 행 수는 100만 개라고 가정합니다.");
  mk([0], {}, { 0:[0] }, [], "① <b>루트 블록 1개</b>를 읽습니다. 값은 [40 | 80]. 찾는 값 <b>57</b> 은 <b>40보다 크고 80보다 작으므로</b> 가운데 가지로 갑니다.");
  mk([0,2], {}, { 0:[0] }, [1], "② <b>중간 블록 1개</b>를 읽습니다. [55 | 70]. 57 은 <b>55보다 크고 70보다 작으므로</b> 그 사이의 리프로 갑니다. — 이 순간 <b>나머지 2/3의 데이터는 아예 쳐다보지도 않았습니다</b>.");
  mk([0,2,5], {}, { 0:[0], 2:[0] }, [1,4], "③ <b>리프 블록 1개</b>를 읽습니다. [41, 55, 57, 70] — 여기에 57 이 있습니다.");
  mk([0,2,5], { 5:[2] }, { 0:[0], 2:[0] }, [1,4], "<b>찾았습니다.</b> 블록을 <b>3번</b> 읽었을 뿐입니다. 인덱스가 없었다면 100만 행을 처음부터 훑어야 했습니다 — 같은 데이터, 같은 서버, <b>25만 배 차이</b>.", "ok");
  return S;
}
let btBox = null;                      // 크기는 리사이즈 때만 다시 잰다 (강제 리플로우 회피)
function btRender(s){
  const el = $("#btTree"); if (!el) return;
  if (!btBox || !btBox.w) btBox = { w: el.clientWidth || 600, h: el.clientHeight || 216 };
  const w = btBox.w, h = btBox.h;
  let html = "";
  BT_EDGES.forEach(([a, b], i) => {
    const x1 = BT_NODES[a].x * w, y1 = BT_NODES[a].y * h + 14;
    const x2 = BT_NODES[b].x * w, y2 = BT_NODES[b].y * h;
    const L = Math.hypot(x2 - x1, y2 - y1);
    const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    html += `<div class="bl ${s.edge.includes(i) ? "on" : ""}" style="left:${x1}px;top:${y1}px;` +
            `width:${L}px;transform:rotate(${ang}deg)"></div>`;
  });
  BT_NODES.forEach((n, i) => {
    html += `<div class="bn ${s.on.includes(i) ? "on" : ""}" ` +
      `style="left:${n.x * 100}%;top:${n.y * 100}%">` +
      n.k.map((v, j) =>
        `<span class="${s.hit[i] && s.hit[i].includes(j) ? "hit" : (s.go[i] && s.go[i].includes(j) ? "go" : "")}">${v}</span>`
      ).join("") + `</div>`;
  });
  el.innerHTML = html;
}
function idxRace(){
  const bars = $$("#idxRaceBox .fill");
  bars.forEach(b => b.style.transform = "scaleX(0)");
  AVX.set("#idxL1", "–"); AVX.set("#idxL2", "–");
  setTimeout(() => {
    bars.forEach((b, i) => setTimeout(() => {
      b.style.transform = `scaleX(${b.dataset.w})`;
    }, i * 260));
    setTimeout(() => { AVX.set("#idxL1", "1,000,000 행"); }, 900);
    setTimeout(() => { AVX.set("#idxL2", "4 블록"); }, 1300);
  }, 60);
}

/* --- [d10] 트랜잭션 --- */
let txMode = "ok";
function txPick(k, btn){
  $$("#d10 .ctrls .chip").forEach(b => b.classList.toggle("on", b === btn));
  txMode = k; AV.reset("tx");
}
function txGen(){
  const S = [];
  const st = { A:50000, B:30000 };
  const ops = [];
  const snap = (note, tone, cls) => S.push({
    ops: ops.map(o => ({ ...o })), A:st.A, B:st.B, note, tone, cls: cls || {},
  });
  const OPS = {
    ok:   [["BEGIN;","on"],["UPDATE account SET balance = balance - 10000 WHERE id='A';","on"],
           ["UPDATE account SET balance = balance + 10000 WHERE id='B';","on"],["COMMIT;","ok"]],
    fail: [["BEGIN;","on"],["UPDATE account SET balance = balance - 10000 WHERE id='A';","on"],
           ["💥 네트워크 오류 / 예외 발생","bad"],["ROLLBACK;","ok"]],
    none: [["UPDATE account SET balance = balance - 10000 WHERE id='A';  -- 자동 커밋","on"],
           ["💥 네트워크 오류 / 예외 발생","bad"],["(되돌릴 방법이 없음)","bad"]],
  };
  const list = OPS[txMode];
  const INTRO = {
    ok:   "A(50,000원)가 B(30,000원)에게 <b>10,000원</b>을 보냅니다. 트랜잭션으로 감싼 정상 흐름입니다.",
    fail: "같은 이체인데 <b>중간에 오류</b>가 납니다. 트랜잭션이 있으면 어떻게 되는지 보세요.",
    none: "이번엔 <b>트랜잭션 없이</b> 같은 일을 합니다. 각 UPDATE가 즉시 확정(자동 커밋)됩니다.",
  };
  snap(INTRO[txMode] + ` 합계는 지금 <b>${(st.A + st.B).toLocaleString()}원</b>입니다.`);
  list.forEach((o, i) => {
    ops.push({ t:o[0], c:o[1] });
    if (txMode !== "none" && i === 1) st.A -= 10000;
    if (txMode === "ok" && i === 2) st.B += 10000;
    if (txMode === "none" && i === 0) st.A -= 10000;
    let note = "", tone = "";
    if (o[0].startsWith("BEGIN")) note = "트랜잭션 시작 — 여기서부터 COMMIT 전까지는 <b>다른 사람에게 보이지 않습니다</b>.";
    else if (o[0].startsWith("UPDATE") && o[0].includes("- 10000")) note = `A에서 10,000원이 빠졌습니다. 지금 합계는 <b>${(st.A + st.B).toLocaleString()}원</b> — <b>10,000원이 잠시 사라진 상태</b>입니다.`;
    else if (o[0].startsWith("UPDATE")) note = `B에 10,000원이 들어왔습니다. 합계가 다시 <b>${(st.A + st.B).toLocaleString()}원</b>이 되었습니다.`;
    else if (o[0].startsWith("COMMIT")){ note = "<b>COMMIT</b> — 이제 확정입니다. 정전이 나도 남습니다(Durability)."; tone = "ok"; }
    else if (o[0].startsWith("ROLLBACK")){ st.A += 10000; note = `<b>ROLLBACK</b> — 시작 시점으로 <b>완전히 되돌렸습니다</b>. 합계 <b>${(st.A + st.B).toLocaleString()}원</b>. 절반만 반영된 상태는 존재하지 않습니다(Atomicity).`; tone = "ok"; }
    else if (o[0].startsWith("💥")){ note = txMode === "none"
      ? `오류가 났는데 <b>A의 출금은 이미 확정</b>되었습니다. 되돌릴 방법이 없습니다.` : `오류 발생 — 트랜잭션이 열려 있으므로 아직 확정되지 않았습니다.`;
      tone = "bad"; }
    else { note = `합계가 <b>${(st.A + st.B).toLocaleString()}원</b>이 되었습니다 — <b>10,000원이 증발했습니다.</b> 이것이 트랜잭션 없이 돈을 다루면 안 되는 이유입니다.`; tone = "bad"; }
    snap(note, tone);
  });
  return S;
}
function txRender(s){
  const el = $("#txOps");
  if (el) el.innerHTML = `<div class="th">트랜잭션<em>${txMode === "none" ? "없음(자동 커밋)" : "session #1"}</em></div>` +
    s.ops.map(o => `<div class="op ${o.c}">${o.t}</div>`).join("");
  const st = $("#txState");
  const tot = s.A + s.B;
  if (st) st.innerHTML =
    `<div><b>${s.A.toLocaleString()}</b><span>A 잔액</span></div>` +
    `<div><b>${s.B.toLocaleString()}</b><span>B 잔액</span></div>` +
    `<div class="${tot === 80000 ? "ok" : "bad"}"><b>${tot.toLocaleString()}</b><span>합계 (원래 80,000)</span></div>`;
}

/* --- [d11] 격리 수준 --- */
let isoMode = "dirty";
function isoPick(k, btn){
  $$("#d11 .ctrls .chip").forEach(b => b.classList.toggle("on", b === btn));
  isoMode = k; AV.reset("iso");
}
const ISO = {
  dirty: { t:"Dirty Read (더티 리드)", a:"세션 A (쓰기)", b:"세션 B (읽기)",
    steps:[
      ["a","BEGIN; UPDATE stock SET qty = 5 WHERE id=1;","on","A가 재고를 5로 바꿨습니다. <b>아직 COMMIT 하지 않았습니다.</b>"],
      ["b","SELECT qty FROM stock WHERE id=1;  → 5","bad","B가 <b>확정되지 않은 값 5</b>를 읽어 갔습니다. 이것이 <b>Dirty Read</b>입니다."],
      ["a","ROLLBACK;","ok","A가 취소했습니다 — 실제 재고는 원래대로 10입니다."],
      ["b","(B는 5라고 믿고 이미 주문을 거절함)","bad","<b>존재한 적 없는 값</b>으로 판단한 것입니다. READ COMMITTED 이상이면 <b>애초에 5가 보이지 않습니다</b>."],
    ], fix:"READ COMMITTED 이상 (Oracle·PostgreSQL·MySQL 모두 기본값이 이 이상이라 <b>실무에서는 거의 안 일어납니다</b>)" },
  nonrep: { t:"Non-repeatable Read (반복 불가 읽기)", a:"세션 A (읽기)", b:"세션 B (쓰기)",
    steps:[
      ["a","BEGIN; SELECT qty FROM stock WHERE id=1;  → 10","on","A가 재고 10을 읽었습니다."],
      ["b","UPDATE stock SET qty = 3 WHERE id=1; COMMIT;","on","그 사이 B가 3으로 바꾸고 <b>확정</b>했습니다."],
      ["a","SELECT qty FROM stock WHERE id=1;  → 3","bad","<b>같은 트랜잭션 안에서 같은 쿼리인데 값이 달라졌습니다.</b> 앞뒤 계산이 어긋납니다."],
      ["a","COMMIT;","","REPEATABLE READ 이상이면 A는 <b>트랜잭션 내내 10을 봅니다</b>(스냅샷)."],
    ], fix:"REPEATABLE READ 이상 (MySQL InnoDB 기본값)" },
  phantom: { t:"Phantom Read (팬텀 리드)", a:"세션 A (읽기)", b:"세션 B (삽입)",
    steps:[
      ["a","BEGIN; SELECT COUNT(*) FROM orders WHERE team='A';  → 3","on","A팀 주문이 3건이라고 읽었습니다."],
      ["b","INSERT INTO orders VALUES (7,'A',100); COMMIT;","on","B가 A팀 주문을 <b>새로 한 건 넣었습니다</b>."],
      ["a","SELECT COUNT(*) FROM orders WHERE team='A';  → 4","bad","<b>없던 행이 유령처럼 나타났습니다.</b> 값이 바뀐 게 아니라 <b>행 수</b>가 바뀐 것이 차이입니다."],
      ["a","COMMIT;","","SERIALIZABLE 이면 차단됩니다. MySQL InnoDB는 갭 락으로 REPEATABLE READ에서도 대부분 막습니다."],
    ], fix:"SERIALIZABLE (또는 MySQL InnoDB의 갭 락)" },
  lost: { t:"Lost Update (갱신 손실) — 가장 자주 겪는 문제", a:"세션 A", b:"세션 B",
    steps:[
      ["a","SELECT qty FROM stock WHERE id=1;  → 10","on","A가 10을 읽고 “1 빼서 9로 만들자”고 계산합니다."],
      ["b","SELECT qty FROM stock WHERE id=1;  → 10","on","동시에 B도 10을 읽고 “1 빼서 9”라고 계산합니다."],
      ["a","UPDATE stock SET qty = 9 WHERE id=1; COMMIT;","on","A가 9로 저장했습니다."],
      ["b","UPDATE stock SET qty = 9 WHERE id=1; COMMIT;","bad","B도 9로 저장 — <b>2개를 팔았는데 재고는 1개만 줄었습니다.</b> A의 갱신이 사라졌습니다."],
      ["a","-- 해결 ①: SELECT ... FOR UPDATE 로 잠그기","ok","읽을 때부터 행을 잠그면 B는 A가 끝날 때까지 기다립니다."],
      ["b","-- 해결 ②: UPDATE stock SET qty = qty - 1","ok","<b>읽지 말고 DB에게 계산을 시키면</b> 애초에 경합이 없습니다. 가장 간단하고 확실합니다."],
    ], fix:"<code>SELECT ... FOR UPDATE</code> 또는 <code>SET qty = qty - 1</code> (원자적 갱신)" },
};
function isoGen(){
  const D = ISO[isoMode], S = [];
  S.push({ n:-1, note:`<b>${D.t}</b> — 두 세션이 같은 데이터를 동시에 만질 때 생기는 문제입니다. 한 단계씩 보세요.` });
  D.steps.forEach((s, i) => S.push({ n:i, note:s[3], tone:s[2] === "bad" ? "bad" : (s[2] === "ok" ? "ok" : "") }));
  S.push({ n:D.steps.length, tone:"ok", note:`<b>막는 법</b> — ${D.fix}` });
  return S;
}
function isoRender(s){
  const D = ISO[isoMode];
  const build = (side, title) =>
    `<div class="th">${title}<em>${side === "a" ? "TX #1" : "TX #2"}</em></div>` +
    D.steps.map((st, i) => st[0] !== side ? "" :
      `<div class="op ${i <= s.n ? (st[2] || "on") : ""}">${st[1]}</div>`).join("");
  const a = $("#isoA"), b = $("#isoB");
  if (a) a.innerHTML = build("a", D.a);
  if (b) b.innerHTML = build("b", D.b);
}

/* --- [d14] Redis 자료구조 --- */
const RDS = {
  string:{ cards:[["user:1:name","김민준","-"],["page:views","1,284","-"],["code:0413","123456","EX 180 → 3분 뒤 삭제"]],
    code:`SET user:1:name "김민준"
GET user:1:name
INCR page:views              # 원자적 +1 (동시 요청에도 안전)
SET code:0413 "123456" EX 180   # 3분 뒤 자동 삭제
MGET user:1:name page:views  # 여러 개 한 번에`,
    d:"가장 단순한 형태. 값 하나를 통째로 저장합니다. <b>캐시·카운터·인증코드</b>에 씁니다. <code>INCR</code>은 여러 서버가 동시에 호출해도 값이 어긋나지 않습니다." },
  list:{ cards:[["queue:job","task-1 → task-2 → task-3","FIFO 큐"],["recent:view:1","p12 → p9 → p3","최근 본 상품"]],
    code:`LPUSH queue:job "task-1"     # 왼쪽에 넣고
RPOP  queue:job              # 오른쪽에서 꺼내면 FIFO
BRPOP queue:job 0            # 생길 때까지 대기 (블로킹)
LRANGE recent:view:1 0 9     # 최근 10개만 조회
LTRIM  recent:view:1 0 9     # 10개만 남기고 잘라내기`,
    d:"양쪽 끝 삽입·삭제가 <b>O(1)</b>인 연결 리스트입니다. <b>작업 큐</b>와 <b>최근 목록</b>의 표준입니다. (알고리즘 탭 §02·§03과 같은 자료구조입니다.)" },
  hash:{ cards:[["user:1","name: 김민준<br>grade: VIP<br>point: 320","객체 하나"],["cart:9","item1: 2<br>item2: 1","장바구니"]],
    code:`HSET user:1 name "김민준" grade "VIP" point 320
HGET user:1 grade            # "VIP"
HGETALL user:1               # 전부
HINCRBY user:1 point 50      # 필드 하나만 증가
HDEL user:1 point`,
    d:"키 하나 안에 <b>필드-값 여러 개</b>를 넣습니다. 객체를 통째로 JSON으로 저장하는 것보다 <b>필드 하나만 읽고 고칠 수 있어</b> 효율적입니다." },
  set:{ cards:[["post:1:likes","u7, u12, u30","중복 자동 제거"],["online:users","u3, u7","현재 접속자"]],
    code:`SADD post:1:likes "u7"      # 이미 있으면 무시됨
SISMEMBER post:1:likes "u7"  # 좋아요 눌렀나? O(1)
SCARD post:1:likes           # 개수
SREM  post:1:likes "u7"      # 취소
SINTER online:users post:1:likes   # 교집합 (둘 다 있는 사람)`,
    d:"<b>중복이 자동으로 제거</b>되고 순서가 없는 집합. “이미 했나?” 판정이 O(1)입니다. 교집합·합집합·차집합 연산이 명령 한 줄입니다." },
  zset:{ cards:[["rank:2026-07","이서연 510<br>최유진 410<br>김민준 320","점수순 자동 정렬"]],
    code:`ZADD rank:2026-07 320 "김민준"
ZADD rank:2026-07 510 "이서연"
ZINCRBY rank:2026-07 50 "김민준"     # 점수 올리기
ZREVRANGE rank:2026-07 0 9 WITHSCORES  # 상위 10명
ZREVRANK  rank:2026-07 "김민준"        # 내 등수 (0부터)
ZCARD rank:2026-07                     # 참가자 수`,
    d:"각 원소에 <b>점수</b>가 붙고 <b>항상 정렬된 상태</b>로 유지됩니다. 실시간 순위표·리더보드·지연 큐(점수=실행시각)의 정답입니다." },
};
function rdGo(k, btn){
  $$("#d14 .ctrls .chip").forEach(b => b.classList.toggle("on", b === btn));
  const d = RDS[k]; if (!d) return;
  const v = $("#rdView");
  if (v) v.innerHTML = d.cards.map(([key, val, ttl]) =>
    `<div class="k"><b>${key}</b><div class="v">${val}</div>` +
    (ttl && ttl !== "-" ? `<div class="ttl">${ttl}</div>` : "") + `</div>`).join("");
  setCode("#rdCode", d.code);
  const p = $("#rdDesc"); if (p) p.innerHTML = d.d;
}
let ttlTimer = null;
function ttlRun(){
  clearInterval(ttlTimer);
  const keys = [["session:abc", 30], ["cache:orders:A", 12], ["code:0413", 6]];
  const el = $("#ttlView"); if (!el) return;
  let t = 0;
  const draw = () => {
    el.innerHTML = keys.map(([k, ttl]) => {
      const left = Math.max(0, ttl - t);
      const cls = left === 0 ? "gone" : (left / ttl < .34 ? "warn" : "");
      return `<div class="k ${cls}"><b>${k}</b><div class="v">${left === 0 ? "삭제됨" : "살아 있음"}</div>` +
        `<div class="ttl">TTL ${left}s<span class="tb"><i style="transform:scaleX(${left / ttl})"></i></span></div></div>`;
    }).join("");
  };
  draw();
  ttlTimer = setInterval(() => {
    t += 1;
    draw();
    if (t >= 30){
      clearInterval(ttlTimer);
      const n = $("#ttlNote");
      if (n) n.innerHTML = `<span class="n">완료</span><span class="tx">셋 다 <b>스스로 사라졌습니다</b>. 삭제 배치도, 만료 검사 코드도 필요 없습니다 — 이것이 Redis를 세션·캐시에 쓰는 가장 큰 이유입니다.</span>`;
    }
  }, 100);
}

/* --- [d15] 캐시 전략 --- */
let cHit = 0, cMiss = 0;
function cacheRun(k){
  const app = $("#cApp"), rds = $("#cRds"), db = $("#cDb");
  const a1 = $("#cA1"), a2 = $("#cA2");
  if (!app) return;
  const glow = (el, color) => {
    if (!el) return;
    el.style.borderColor = color; el.style.boxShadow = `0 0 26px ${color}44`;
    el.style.transform = "translateY(-5px)";
    setTimeout(() => { el.style.borderColor = ""; el.style.boxShadow = ""; el.style.transform = ""; }, 900);
  };
  const dim = (el, on) => { if (el) el.style.opacity = on ? "1" : ".25"; };
  const note = (n, txt, tone) => {
    const e = $("#cacheNote"); if (!e) return;
    e.className = "stepnote" + (tone ? " " + tone : "");
    e.innerHTML = `<span class="n">${n}</span><span class="tx">${txt}</span>`;
  };
  if (k === "miss"){
    cMiss++;
    $("#cRdsV").textContent = "비어 있음";
    dim(a2, true); dim(db, true);
    glow(app, "#22d3ee");
    setTimeout(() => glow(rds, "#fbbf24"), 300);
    setTimeout(() => glow(db, "#3b82f6"), 700);
    setTimeout(() => { $("#cRdsV").textContent = "orders:team:A ✓"; glow(rds, "#34d399"); }, 1200);
    AVX.set("#cMs", "42 ms");
    note("캐시 미스", "① Redis에 물어봤지만 <b>없습니다</b>. → ② DB에서 조회 → ③ 결과를 Redis에 저장(TTL 5분). 첫 요청은 원래 속도 그대로입니다.", "bad");
  } else if (k === "hit"){
    if ($("#cRdsV").textContent.includes("비어")){
      note("먼저 1번을", "캐시가 비어 있습니다. <b>1번 버튼</b>을 먼저 눌러 캐시를 채워 주세요.", "bad");
      return;
    }
    cHit++;
    glow(app, "#22d3ee");
    setTimeout(() => glow(rds, "#34d399"), 260);
    dim(a2, false); dim(db, false);
    setTimeout(() => { dim(a2, true); dim(db, true); }, 1600);
    AVX.set("#cMs", "0.4 ms");
    note("캐시 히트", "Redis에 값이 <b>있습니다</b>. → <b>DB에 가지 않고</b> 바로 반환. 42ms → 0.4ms, 약 <b>100배</b> 빨라졌고 DB 부하는 <b>0</b>입니다.", "ok");
  } else {
    glow(db, "#fb7185");
    setTimeout(() => { $("#cRdsV").textContent = "비어 있음"; glow(rds, "#fb7185"); }, 400);
    AVX.set("#cMs", "-");
    note("무효화", "데이터가 바뀌면 <b>캐시를 갱신하지 말고 삭제</b>합니다(<code>r.delete(key)</code>). 다음 요청이 알아서 새 값을 채웁니다 — 동시성 사고를 막는 가장 단순한 방법입니다.", "");
  }
  AVX.set("#cHit", cHit);
  AVX.set("#cMiss", cMiss);
}

/* --- DB 탭 초기화 --- */
TAB_INIT.db = function(){
  dbGo("mysql", $('#dbPick button[data-db="mysql"]'));
  keyGo("none", $("#d02 .ctrls .chip"));
  whGo(0, $("#whBar .chip"));
  joGo("inner", $("#d05 .ctrls .chip"));
  rdGo("string", $("#d14 .ctrls .chip"));
  AV.make("sf",  { gen: sfGen,  render: sfRender,  ms: 1500 });
  AV.make("gbq", { gen: gbqGen, render: gbqRender, ms: 1200 });
  AV.make("bt",  { gen: btGen,  render: btRender,  ms: 1600 });
  AV.make("tx",  { gen: txGen,  render: txRender,  ms: 1300 });
  AV.make("iso", { gen: isoGen, render: isoRender, ms: 1600 });
  /* 인덱스 레이스는 화면에 들어올 때 1회 자동 재생 */
  const rb = $("#idxRaceBox");
  if (rb) new IntersectionObserver((es, o) => es.forEach(e => {
    if (e.isIntersecting){ idxRace(); o.disconnect(); }
  }), { threshold:.4 }).observe(rb);
  let rz2 = null;
  window.addEventListener("resize", () => {
    clearTimeout(rz2);
    rz2 = setTimeout(() => { btBox = null; AV.draw("bt"); }, 200);
  }, { passive:true });
};

