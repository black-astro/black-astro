/* ============================================================
   3. [S01] 파이프라인 흐름
   ============================================================ */
function pipeRun(){
  const boxes = $$("#pipeFlow .box");
  boxes.forEach(b => { b.style.borderColor=""; b.style.boxShadow=""; b.style.transform=""; });
  boxes.forEach((b, i) => setTimeout(() => {
    b.style.borderColor = "var(--cyan)";
    b.style.boxShadow = "0 0 26px rgba(34,211,238,.3)";
    b.style.transform = "translateY(-7px) scale(1.04)";
    setTimeout(() => {
      b.style.borderColor = ""; b.style.boxShadow = ""; b.style.transform = "";
    }, 700);
  }, i * 420));
}
setTimeout(pipeRun, 900);

/* ============================================================
   4. [S02] Series 단계
   ============================================================ */
const SR = [
  { cap:"list",
    rows:[["","320"],["","210"],["","450"]],
    code:`매출 = [320, 210, 450]\n매출[0]    # 320\n# 위치(0,1,2)로만 접근 가능`,
    out:`>>> type(매출)\n<class 'list'>`,
    desc:"평범한 파이썬 리스트입니다. 값만 있고 이름표가 없어서, 위치 번호로만 접근할 수 있습니다." },
  { cap:"Series (기본 index)",
    rows:[["0","320"],["1","210"],["2","450"]],
    code:`import pandas as pd\n\ns = pd.Series([320, 210, 450])\ns[0]      # 320`,
    out:`>>> s\n0    320\n1    210\n2    450\ndtype: int64`,
    desc:"Series로 만들면 왼쪽에 <b>index</b>(0,1,2)가 자동으로 붙습니다. 그리고 <b>dtype</b>이 생겨 모든 값이 같은 타입으로 관리됩니다." },
  { cap:"Series (라벨 index)",
    rows:[["김민준","320"],["이서연","210"],["박지훈","450"]],
    code:`s = pd.Series(\n    [320, 210, 450],\n    index=["김민준","이서연","박지훈"],\n    name="매출"\n)\ns["박지훈"]   # 450`,
    out:`>>> s\n김민준    320\n이서연    210\n박지훈    450\nName: 매출, dtype: int64`,
    desc:"인덱스를 <b>이름으로</b> 바꾸면 딕셔너리처럼 키로 조회할 수 있습니다. 이 이름표가 나중에 두 Series를 합칠 때 <b>자동 정렬</b>의 기준이 됩니다." },
  { cap:"벡터 연산 결과",
    rows:[["김민준","352.0"],["이서연","231.0"],["박지훈","495.0"]],
    code:`s * 1.1          # 전체에 10% 인상\ns[s > 300]       # 조건 필터\ns.mean()         # 326.67\ns.sum()          # 980`,
    out:`>>> s * 1.1\n김민준    352.0\n이서연    231.0\n박지훈    495.0\nName: 매출, dtype: float64`,
    desc:"<b>반복문 없이</b> Series 전체에 연산이 적용됩니다. 이것이 판다스를 쓰는 가장 큰 이유입니다. 인덱스는 그대로 유지된 채 값만 바뀝니다." },
];
function srStage(n){
  const d = SR[n];
  $$("[data-sr]").forEach(b => b.classList.toggle("on", +b.dataset.sr === n));
  $("#srCap").textContent = d.cap;
  const tb = $("#srTable tbody");
  flip($("#srTable"), () => {
    tb.innerHTML = d.rows.map(([ix, v], k) =>
      `<tr data-flip="sr${k}">${ix !== "" ? `<td class="idx">${ix}</td>` : ""}<td>${v}</td></tr>`).join("");
  });
  setCode("#srCode", d.code);
  $("#srOut").textContent = d.out;
  $("#srDesc").innerHTML = d.desc;
}

/* ============================================================
   5. [S03] DataFrame 해부
   ============================================================ */
(function buildAnatomy(){
  $("#anatomy tbody").innerHTML = DATA.map(r =>
    `<tr><td class="idx">${r.i}</td><td data-c="이름">${r.이름}</td><td data-c="팀">${r.팀}</td>
     <td data-c="지역">${r.지역}</td><td data-c="매출">${r.매출}</td>
     <td data-c="만족도">${nz(r.만족도)}</td></tr>`).join("");
})();
const PART_DESC = {
  index:'<b>index</b> — 각 행의 이름표입니다. 기본은 0,1,2… 이지만 날짜나 ID로 바꿀 수 있습니다. 필터링·정렬을 해도 <b>이 번호는 행을 따라다닙니다</b>.',
  columns:'<b>columns</b> — 각 열의 이름표입니다. <code>df.columns</code>로 확인하고, 이 이름으로 컬럼을 골라냅니다.',
  values:'<b>values</b> — 실제 데이터 본체입니다. <code>df.values</code>로 꺼내면 numpy 2차원 배열이 나옵니다(이름표는 빠집니다).',
  series:'<b>컬럼 하나 = Series</b> — <code>df["매출"]</code>은 매출 Series를 돌려줍니다. DataFrame은 이런 Series를 인덱스로 정렬해 옆으로 붙인 것입니다.',
  none:'버튼을 눌러 DataFrame의 각 구성 요소를 확인하세요.'
};
function dfPart(kind, btn){
  $$("#s03 .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on");
  const t = $("#anatomy");
  $$("th,td", t).forEach(c => c.classList.remove("hl-col","hl-cell","dimmed"));
  $$("tr", t).forEach(r => r.classList.remove("hl-row"));

  if (kind === "index")   $$("td.idx, thead th:first-child", t).forEach(c => c.classList.add("hl-col"));
  if (kind === "columns") $$("thead th", t).forEach(c => c.classList.add("hl-col"));
  if (kind === "values")  $$("tbody td:not(.idx)", t).forEach(c => c.classList.add("hl-cell"));
  if (kind === "series"){
    $$('[data-c="매출"]', t).forEach(c => c.classList.add("hl-col"));
    $$('td:not([data-c="매출"]), th:not([data-c="매출"])', t).forEach(c => c.classList.add("dimmed"));
  }
  $("#dfPartDesc").innerHTML = PART_DESC[kind];
}

/* ============================================================
   6. [S05] loc / iloc 시뮬레이터
   ============================================================ */
const SEL = [
  { c:'df["매출"]', rows:"all", cols:["매출"],
    out:'0    320\n1    210\n2    450\n3    180\n4    390\n5    275\nName: 매출, dtype: int64',
    d:'컬럼 하나를 선택하면 <b>Series</b>가 나옵니다. 표가 아니라 1차원입니다.' },
  { c:'df[["이름","매출"]]', rows:"all", cols:["이름","매출"],
    out:'    이름   매출\n0  김민준  320\n1  이서연  210\n...  (6 rows x 2 columns)',
    d:'대괄호를 <b>두 번</b> 쓰면 여러 컬럼을 고르고 결과는 <b>DataFrame</b>입니다.' },
  { c:'df.loc[2]', rows:[2], cols:"all",
    out:'이름      박지훈\n팀           A\n지역       서울\n매출        450\n만족도      4.8\nName: 2, dtype: object',
    d:'라벨 2인 행 하나. 한 행만 뽑으면 <b>세로로 선 Series</b>가 됩니다.' },
  { c:'df.loc[1:3]', rows:[1,2,3], cols:"all",
    out:'(3 rows) 1,2,3 행 -> 끝 포함!',
    d:'<b>loc 슬라이스는 끝을 포함</b>합니다. 3번 행까지 나오는 것에 주의하세요.' },
  { c:'df.iloc[1:3]', rows:[1,2], cols:"all",
    out:'(2 rows) 1,2 행 -> 끝 제외',
    d:'<b>iloc은 파이썬 규칙</b> 그대로 끝을 제외합니다. 같은 1:3인데 결과가 다릅니다.' },
  { c:'df.iloc[0:3, 0:2]', rows:[0,1,2], cols:["이름","팀"],
    out:'    이름 팀\n0  김민준  A\n1  이서연  B\n2  박지훈  A',
    d:'iloc은 <b>행, 열 모두 정수 위치</b>로 자릅니다. 0~2행 × 0~1열.' },
  { c:'df.loc[2, "매출"]', rows:[2], cols:["매출"],
    out:'450',
    d:'행·열을 하나씩 지정하면 <b>스칼라 값 하나</b>가 나옵니다.' },
  { c:'df.loc[df["팀"]=="A", ["이름","매출"]]', rows:[0,2], cols:["이름","매출"],
    out:'    이름   매출\n0  김민준  320\n2  박지훈  450',
    d:'loc의 진짜 위력 — <b>조건과 컬럼 선택을 한 번에</b>. 실무에서 가장 많이 쓰는 형태입니다.' },
  { c:'df.iloc[-1]', rows:[5], cols:"all",
    out:'마지막 행 (강도윤)',
    d:'음수 인덱스로 뒤에서부터 접근할 수 있습니다. loc으로는 안 됩니다(라벨이 -1이 아니므로).' },
];
(function buildSel(){
  $("#selChips").innerHTML = SEL.map((s,i) =>
    `<button class="chip${i===0?' on':''}" onclick="selGo(${i},this)">${s.c.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</button>`).join("");
  $("#selTable tbody").innerHTML = DATA.map(r =>
    `<tr data-r="${r.i}"><td class="idx">${r.i}</td>
      <td data-k="이름">${r.이름}</td><td data-k="팀">${r.팀}</td><td data-k="지역">${r.지역}</td>
      <td data-k="매출">${r.매출}</td><td data-k="만족도">${nz(r.만족도)}</td></tr>`).join("");
  $("#selTable thead th").forEach && null;
  $$("#selTable thead th").forEach((th,i) => { if(i>0) th.dataset.k = th.textContent; });
  selGo(0);
})();
function selGo(i, btn){
  const s = SEL[i];
  $$("#selChips .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on"); else $$("#selChips .chip")[0].classList.add("on");

  const t = $("#selTable");
  $$("td,th", t).forEach(c => c.classList.remove("hl-cell","dimmed","hl-col"));
  $$("tr", t).forEach(r => r.classList.remove("hl-row"));

  const rowOK = r => s.rows === "all" || s.rows.includes(+r);
  const colOK = k => s.cols === "all" || s.cols.includes(k);

  $$("tbody tr", t).forEach(tr => {
    const ok = rowOK(tr.dataset.r);
    $$("td", tr).forEach(td => {
      const k = td.dataset.k;
      if (ok && k && colOK(k)) td.classList.add("hl-cell");
      else td.classList.add("dimmed");
    });
  });
  $$("thead th", t).forEach(th => {
    if (th.dataset.k && colOK(th.dataset.k)) th.classList.add("hl-col");
    else th.classList.add("dimmed");
  });

  setCode("#selCode", s.c);
  $("#selOut").textContent = s.out;
  $("#selDesc").innerHTML = s.d;
}

/* ============================================================
   7. [S06] 불리언 필터링
   ============================================================ */
function filterRender(){
  const th = +$("#fRange").value;
  $("#fVal").textContent = th;

  $("#maskTable tbody").innerHTML = DATA.map(r => {
    const ok = r.매출 >= th;
    return `<tr class="${ok?'':'dimmed'}"><td class="idx">${r.i}</td><td>${r.이름}</td>
      <td>${r.매출}</td><td class="${ok?'mask-T':'mask-F'}">${ok?'True':'False'}</td></tr>`;
  }).join("");

  const keep = DATA.filter(r => r.매출 >= th);
  flip($("#resTable"), () => {
    $("#resTable tbody").innerHTML = keep.map(r =>
      `<tr data-flip="f${r.i}"><td class="idx">${r.i}</td><td>${r.이름}</td><td>${r.매출}</td></tr>`).join("")
      || `<tr><td colspan="3" style="color:var(--dim);text-align:center">조건에 맞는 행 없음 (0 rows)</td></tr>`;
  });

  setCode("#fCode",
`mask = df["매출"] >= ${th}     # True/False Series
df[mask]                  # True인 행만 남음

# 한 줄로 쓰면
df[df["매출"] >= ${th}]      # -> ${keep.length}개 행`);
}
$("#fRange").addEventListener("input", filterRender);
filterRender();

/* ============================================================
   8. [S07] 정렬
   ============================================================ */
const SORTS = {
  idx:  { f: a => a.slice().sort((x,y) => x.i - y.i),
          c:'df   # 원래 순서 (인덱스 0~5)',
          d:'정렬 전 상태입니다.' },
  desc: { f: a => a.slice().sort((x,y) => y.매출 - x.매출),
          c:'df.sort_values("매출", ascending=False)',
          d:'매출 높은 순. 인덱스(왼쪽 숫자)가 뒤섞이지만 <b>각 행의 데이터는 그대로 붙어서 이동</b>합니다.' },
  asc:  { f: a => a.slice().sort((x,y) => x.매출 - y.매출),
          c:'df.sort_values("매출")   # ascending=True 가 기본',
          d:'매출 낮은 순. ascending 기본값은 True 입니다.' },
  team: { f: a => a.slice().sort((x,y) => x.팀 === y.팀 ? y.매출 - x.매출 : x.팀.localeCompare(y.팀)),
          c:'df.sort_values(["팀","매출"], ascending=[True, False])',
          d:'<b>다중 정렬</b> — 먼저 팀으로 묶고, 같은 팀 안에서 매출 내림차순. 리스트 순서가 우선순위입니다.' },
  name: { f: a => a.slice().sort((x,y) => x.이름.localeCompare(y.이름,"ko")),
          c:'df.sort_values("이름")   # 문자열은 가나다순',
          d:'문자열 컬럼은 사전순으로 정렬됩니다.' },
};
function doSort(k, btn){
  $$("#s07 .chip").forEach(b => b.classList.remove("on"));
  btn.classList.add("on");
  const s = SORTS[k];
  const rows = s.f(DATA);
  flip($("#sortTable"), () => {
    $("#sortTable tbody").innerHTML = rows.map(r =>
      `<tr data-flip="s${r.i}" data-team="${r.팀}"><td class="idx">${r.i}</td>
       <td>${r.이름}</td><td><span class="tag ${r.팀}">${r.팀}</span></td><td>${r.매출}</td></tr>`).join("");
  }, 700);
  setCode("#sortCode", s.c);
  $("#sortDesc").innerHTML = s.d;
}
doSort("idx", $$("#s07 .chip")[0]);

/* ============================================================
   9. [S08] 성능 레이스
   ============================================================ */
/* 1,000만 행 × "값 × 2" 기준 실측 감각값.
   [선택자, 막대 길이(로그 압축 %), 채우는 데 걸릴 시간(ms), 라벨]
   막대가 차는 시간을 실제 소요시간 비율에 맞춰(압축해서) 재생한다. */
const RACE_BARS = [
  ["#r1", 100, 3200, "≈ 95,000 ms"],
  ["#r2",  58, 1250, "≈ 3,800 ms"],
  ["#r3",  11,  110, "≈ 42 ms"],
];
let raceOn = false;
function raceRun(){
  if (raceOn) return;
  raceOn = true;
  const btn = $("#raceBtn");
  if (btn) { btn.textContent = "⏳ 측정 중…"; btn.disabled = true; }
  RACE_BARS.forEach(([sel]) => {
    const b = $(sel);
    b.style.transition = "none";
    b.style.width = "0";
    $(sel + "t").textContent = "";
  });
  void $("#r1").offsetWidth;          // 강제 리플로우 — '폭 0' 상태를 확정시킨다
  let last = 0;
  RACE_BARS.forEach(([sel, w, dur, label]) => {
    const b = $(sel);
    b.style.transition = `width ${dur}ms linear`;
    b.style.width = w + "%";
    last = Math.max(last, dur);
    setTimeout(() => { $(sel + "t").textContent = label; }, dur + 30);  // 다 찬 뒤 숫자 공개
  });
  setTimeout(() => {
    raceOn = false;
    if (btn) { btn.textContent = "↻ 다시 실행"; btn.disabled = false; }
  }, last + 120);
}

/* ============================================================
   10. [S09] 결측치
   ============================================================ */
const NA_BASE = [
  {i:0, n:"김민준", m:320,  s:4.5},
  {i:1, n:"이서연", m:null, s:4.1},
  {i:2, n:"박지훈", m:450,  s:4.8},
  {i:3, n:"최유진", m:180,  s:null},
  {i:4, n:"정하늘", m:390,  s:4.2},
];
const NA = {
  raw:  { f: () => NA_BASE, c:'df   # 매출 1개, 만족도 1개 결측',
          d:'원본입니다. <b>NaN</b>은 "값 없음"을 뜻하며 숫자 컬럼에만 들어갈 수 있어 정수가 실수로 바뀝니다.' },
  drop: { f: () => NA_BASE.filter(r => r.m !== null && r.s !== null),
          c:'df.dropna()   # NaN이 하나라도 있는 행 삭제',
          d:'가장 간단하지만 <b>데이터가 줄어듭니다</b>. 결측 비율이 낮을 때만 쓰세요. 5행 → 3행.' },
  zero: { f: () => NA_BASE.map(r => ({...r, m: r.m ?? 0, s: r.s ?? 0})),
          c:'df.fillna(0)',
          d:'0으로 채웁니다. 편하지만 <b>평균이 왜곡</b>됩니다. "실제로 0인 것"과 "모르는 것"은 다릅니다.' },
  mean: { f: () => { const m = 335, s = 4.4;
          return NA_BASE.map(r => ({...r, m: r.m ?? m, s: r.s ?? s, fill: r.m===null||r.s===null})); },
          c:'df["매출"].fillna(df["매출"].mean())\ndf["만족도"].fillna(df["만족도"].median())',
          d:'평균/중앙값으로 채웁니다. 분포를 크게 흔들지 않아 무난합니다. 이상치가 있으면 <b>중앙값</b>이 안전합니다.' },
  ffill:{ f: () => { let pm=null, ps=null;
          return NA_BASE.map(r => { const o = {...r, m: r.m ?? pm, s: r.s ?? ps};
            pm = o.m; ps = o.s; return o; }); },
          c:'df.ffill()   # forward fill: 바로 앞 값으로',
          d:'<b>시계열 전용</b> 기법입니다. 센서·주가처럼 "직전 값이 유지된다"고 볼 수 있을 때만 타당합니다.' },
};
function naDemo(k, btn){
  $$("#s09 .chip").forEach(b => b.classList.remove("on"));
  btn.classList.add("on");
  const cfg = NA[k], rows = cfg.f();
  flip($("#naTable"), () => {
    $("#naTable tbody").innerHTML = rows.map(r =>
      `<tr data-flip="n${r.i}"><td class="idx">${r.i}</td><td>${r.n}</td>
       <td>${r.m===null?'<span class="nan">NaN</span>':r.m}</td>
       <td>${r.s===null?'<span class="nan">NaN</span>':r.s}</td></tr>`).join("");
  });
  setCode("#naCode", cfg.c);
  $("#naDesc").innerHTML = cfg.d;
}
naDemo("raw", $$("#s09 .chip")[0]);

/* ============================================================
   11. [S10] groupby split-apply-combine
   ============================================================ */
const GB_DESC = [
  '원본 6개 행입니다. 팀 컬럼에 A/B/C가 섞여 있습니다.',
  '<b>① SPLIT</b> — 판다스가 팀 값을 보고 행을 <b>그룹별 상자로 흩뿌립니다</b>. 이때 아직 계산은 하지 않습니다.',
  '<b>② APPLY</b> — 각 상자 안에서 <b>독립적으로</b> mean()을 계산합니다. 그룹끼리는 서로 영향을 주지 않습니다.',
  '<b>③ COMBINE</b> — 그룹별 결과값을 모아 <b>새 표</b>를 만듭니다. 그룹 키(팀)가 결과의 인덱스가 됩니다.',
];
function gbRowHTML(r){
  return `<tr data-flip="g${r.i}" data-team="${r.팀}">
    <td class="idx">${r.i}</td><td>${r.이름}</td>
    <td><span class="tag ${r.팀}">${r.팀}</span></td><td>${r.매출}</td></tr>`;
}
(function gbInit(){
  $("#gbOrig").innerHTML = DATA.map(gbRowHTML).join("");
})();
function gbGo(step){
  $$("#gbSteps .st").forEach((el, i) => {
    el.classList.toggle("on", i === step);
    el.classList.toggle("done", i < step);
  });
  $$("#s10 .chip").forEach((b, i) => b.classList.toggle("on", i === step));

  const root = $("#s10 .stage");
  flip(root, () => {
    // 집계 텍스트 초기화
    ["A","B","C"].forEach(g => $("#agg"+g).innerHTML = "");
    $("#gbRes").innerHTML = "";
    $("#gbResWrap").style.display = "none";

    if (step === 0){
      $("#gbOrigWrap").style.display = "";
      $("#gbOrig").innerHTML = DATA.map(gbRowHTML).join("");
      ["A","B","C"].forEach(g => {
        $("#gb"+g).innerHTML = "";
        $(`[data-g="${g}"]`).classList.add("empty");
      });
    } else {
      $("#gbOrigWrap").style.display = "none";
      $("#gbOrig").innerHTML = "";
      ["A","B","C"].forEach(g => {
        $("#gb"+g).innerHTML = DATA.filter(r => r.팀 === g).map(gbRowHTML).join("");
        $(`[data-g="${g}"]`).classList.remove("empty");
      });
    }
  }, 780);

  if (step >= 2){
    setTimeout(() => ["A","B","C"].forEach(g => {
      const rows = DATA.filter(r => r.팀 === g);
      const avg = rows.reduce((s,r) => s + r.매출, 0) / rows.length;
      $("#agg"+g).innerHTML =
        `<div class="fu" style="margin-top:9px;padding-top:9px;border-top:1px dashed var(--line);
             font-family:var(--mono);font-size:12px;color:var(--cyan)">
           mean() = ${avg.toFixed(1)}
         </div>`;
    }), 500);
  }
  if (step === 3){
    setTimeout(() => {
      $("#gbResWrap").style.display = "";
      $("#gbRes").innerHTML = ["A","B","C"].map((g, k) => {
        const rows = DATA.filter(r => r.팀 === g);
        const avg = rows.reduce((s,r) => s + r.매출, 0) / rows.length;
        return `<tr class="fu" style="animation-delay:${k*.13}s">
          <td class="idx"><span class="tag ${g}">${g}</span></td>
          <td style="color:var(--cyan)">${avg.toFixed(1)}</td></tr>`;
      }).join("");
    }, 800);
  }
  $("#gbDesc").innerHTML = GB_DESC[step];
}
function gbAuto(){
  [0,1,2,3].forEach((s,i) => setTimeout(() => gbGo(s), i * 1700));
}

/* ============================================================
   12. [S11] merge
   ============================================================ */
const ML = [{id:1,n:"김민준"},{id:2,n:"이서연"},{id:3,n:"박지훈"}];
const MR = [{id:1,t:"A"},{id:2,t:"B"},{id:4,t:"D"}];
const MG = {
  inner:{ d:'양쪽 <b>모두</b>에 있는 id(1,2)만 남습니다. 기본값이며, 매칭 안 되는 데이터는 <b>소리 없이 사라지므로</b> 주의가 필요합니다.' },
  left: { d:'왼쪽(사원) 전부 유지. id=3은 부서 정보가 없어 <b>팀이 NaN</b>이 됩니다. 실무에서 가장 많이 씁니다.' },
  right:{ d:'오른쪽(부서) 전부 유지. id=4는 해당 사원이 없어 <b>이름이 NaN</b>입니다.' },
  outer:{ d:'양쪽 <b>전부</b> 유지(합집합). 없는 쪽은 NaN. 데이터 정합성 점검할 때 유용합니다.' },
};
(function mgInit(){
  $("#mgL").innerHTML = ML.map(r => `<tr><td class="idx">${r.id}</td><td>${r.n}</td></tr>`).join("");
  $("#mgR").innerHTML = MR.map(r => `<tr><td class="idx">${r.id}</td><td>${r.t}</td></tr>`).join("");
  mgGo("inner");
})();
function mgGo(how, btn){
  $$("#s11 .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on"); else $$("#s11 .chip")[0].classList.add("on");

  const ids = how === "inner" ? [1,2]
            : how === "left"  ? [1,2,3]
            : how === "right" ? [1,2,4]
            : [1,2,3,4];
  const rows = ids.map(id => ({
    id,
    n: (ML.find(x => x.id === id) || {}).n ?? null,
    t: (MR.find(x => x.id === id) || {}).t ?? null,
  }));

  flip($("#mgRes").parentElement, () => {
    $("#mgRes").innerHTML = rows.map(r =>
      `<tr data-flip="m${r.id}"><td class="idx">${r.id}</td>
       <td>${r.n ?? '<span class="nan">NaN</span>'}</td>
       <td>${r.t ?? '<span class="nan">NaN</span>'}</td></tr>`).join("");
  });

  $("#vl").classList.toggle("act", how !== "right");
  $("#vr").classList.toggle("act", how !== "left");
  $("#mgHow").textContent = `how="${how}"`;
  $("#mgDesc").innerHTML = `<code style="color:var(--cyan)">사원.merge(부서, on="id", how="${how}")</code> &nbsp;→ ${rows.length}행 &nbsp;·&nbsp; ${MG[how].d}`;
}

/* ============================================================
   13. [S12] concat
   ============================================================ */
function ccGo(axis, btn){
  $$("#s12 .chip").forEach(b => b.classList.remove("on"));
  btn.classList.add("on");
  const box = $("#ccRes");
  if (axis === 0){
    box.innerHTML = `<table class="df compact" style="width:100%">
      <thead><tr><th></th><th>이름</th><th>매출</th></tr></thead><tbody>
      <tr class="fu"><td class="idx">0</td><td>김민준</td><td>320</td></tr>
      <tr class="fu" style="animation-delay:.08s"><td class="idx">1</td><td>이서연</td><td>210</td></tr>
      <tr class="fu" style="animation-delay:.16s"><td class="idx">2</td><td>박지훈</td><td>450</td></tr>
      <tr class="fu" style="animation-delay:.24s"><td class="idx">3</td><td>최유진</td><td>180</td></tr>
      </tbody></table>
      <div style="font-family:var(--mono);font-size:11px;color:var(--dim);margin-top:8px">
        4행 × 2열 · ignore_index=True</div>`;
  } else {
    box.innerHTML = `<table class="df compact" style="width:100%">
      <thead><tr><th></th><th>이름</th><th>매출</th><th>이름</th><th>매출</th></tr></thead><tbody>
      <tr class="fu"><td class="idx">0</td><td>김민준</td><td>320</td><td>박지훈</td><td>450</td></tr>
      <tr class="fu" style="animation-delay:.1s"><td class="idx">1</td><td>이서연</td><td>210</td><td>최유진</td><td>180</td></tr>
      </tbody></table>
      <div style="font-family:var(--mono);font-size:11px;color:var(--amber);margin-top:8px">
        2행 × 4열 · 컬럼명이 중복됩니다!</div>`;
  }
}
ccGo(0, $$("#s12 .chip")[0]);

/* ============================================================
   14. [S13] pivot / melt — 셀이 실제로 이동
   ============================================================ */
const PV = [
  {t:"A", q:"Q1", v:120}, {t:"A", q:"Q2", v:150}, {t:"A", q:"Q3", v:180},
  {t:"B", q:"Q1", v:90},  {t:"B", q:"Q2", v:110}, {t:"B", q:"Q3", v:140},
];
let pvMode = "";
function pvGo(mode){
  if (pvMode === mode) return;
  pvMode = mode;
  $("#pvL").classList.toggle("on", mode === "long");
  $("#pvW").classList.toggle("on", mode === "wide");

  const root = $("#s13 .stage");
  flip(root, () => {
    if (mode === "long"){
      $("#pvWide").innerHTML = ["A","B"].map(t =>
        `<tr><td class="idx"><span class="tag ${t}">${t}</span></td>
         ${["Q1","Q2","Q3"].map(() => `<td style="color:var(--dim-2)">·</td>`).join("")}</tr>`).join("");
      $("#pvLong").innerHTML = PV.map(r =>
        `<tr><td><span class="tag ${r.t}">${r.t}</span></td><td>${r.q}</td>
         <td data-flip="pv-${r.t}${r.q}" style="color:var(--cyan)">${r.v}</td></tr>`).join("");
      $("#pvLongBox").style.borderColor = "var(--cyan)";
      $("#pvWideBox").style.borderColor = "";
    } else {
      $("#pvLong").innerHTML = PV.map(r =>
        `<tr><td><span class="tag ${r.t}">${r.t}</span></td><td>${r.q}</td>
         <td style="color:var(--dim-2)">·</td></tr>`).join("");
      $("#pvWide").innerHTML = ["A","B"].map(t =>
        `<tr><td class="idx"><span class="tag ${t}">${t}</span></td>
         ${["Q1","Q2","Q3"].map(q => {
            const v = PV.find(r => r.t === t && r.q === q).v;
            return `<td data-flip="pv-${t}${q}" style="color:var(--cyan)">${v}</td>`;
         }).join("")}</tr>`).join("");
      $("#pvWideBox").style.borderColor = "var(--cyan)";
      $("#pvLongBox").style.borderColor = "";
    }
  }, 820);

  $("#pvDesc").innerHTML = mode === "long"
    ? '<b>melt</b> — 넓은 표의 컬럼(Q1,Q2,Q3)이 <b>행으로 녹아내립니다</b>. 6개 값이 6행이 되고, 컬럼명은 "분기" 컬럼의 값이 됩니다. 데이터 저장·집계에 유리한 형태입니다.'
    : '<b>pivot_table</b> — 세로로 길던 값들이 <b>격자 위 제자리를 찾아 날아갑니다</b>. 행=팀, 열=분기의 교차점에 매출이 놓입니다. 보고서에 붙이기 좋은 형태입니다.';
}
pvGo("long");

/* ============================================================
   15. [S14] rolling 시각화
   ============================================================ */
const RD = [12, 18, 15, 24, 30, 22, 28, 35, 31, 40, 36, 44];
const RLAB = RD.map((_, i) => `d${i+1}`);
let RW = 3, rollTimer = null;

function rollBuild(){
  const svg = $("#rollSvg");
  const W = svg.clientWidth || 800, H = 190, pad = 16;
  const max = Math.max(...RD) * 1.15;
  const x = i => pad + i * (W - pad*2) / (RD.length - 1);
  const y = v => H - pad - (v / max) * (H - pad*2);

  const line = RD.map((v,i) => `${x(i)},${y(v)}`).join(" ");
  const ma = RD.map((_, i) => i < RW-1 ? null
    : RD.slice(i-RW+1, i+1).reduce((a,b) => a+b, 0) / RW);
  const maPts = ma.map((v,i) => v === null ? null : `${x(i)},${y(v)}`).filter(Boolean).join(" ");

  svg.innerHTML = `
    <defs>
      <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3b82f6" stop-opacity=".35"/>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <polygon points="${pad},${H-pad} ${line} ${W-pad},${H-pad}" fill="url(#gArea)"/>
    <polyline points="${line}" fill="none" stroke="#60a5fa" stroke-width="2"/>
    <polyline id="maLine" points="${maPts}" fill="none" stroke="#22d3ee"
              stroke-width="2.5" stroke-dasharray="1000" stroke-dashoffset="1000"/>
    ${RD.map((v,i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="#0a1120" stroke="#60a5fa" stroke-width="2"/>`).join("")}
  `;
  const ml = $("#maLine");
  if (ml && !REDUCED) ml.animate([{strokeDashoffset:1000},{strokeDashoffset:0}],
    {duration:1600, easing:"ease-out", fill:"forwards"});
  else if (ml) ml.style.strokeDashoffset = 0;

  // 테이블
  $("#rollHead").innerHTML = `<th>날짜</th>` + RLAB.map(l => `<th>${l}</th>`).join("");
  $("#rollVals").innerHTML = `<td class="idx">매출</td>` + RD.map(v => `<td>${v}</td>`).join("");
  $("#rollMA").innerHTML = `<td class="idx" style="color:var(--cyan)">MA${RW}</td>` +
    ma.map(v => v === null ? `<td class="nan">NaN</td>`
                           : `<td style="color:var(--cyan)">${v.toFixed(1)}</td>`).join("");
}
function rollWin(w){
  RW = w;
  $$("#s14 .chip").forEach(b => b.classList.toggle("on", b.textContent === "window=" + w));
  rollBuild();
  rollPlay();
}
function rollPlay(){
  clearInterval(rollTimer);
  const wrap = $("#rollWrap"), win = $("#rollWin");
  const W = wrap.clientWidth, pad = 16;
  const step = (W - pad*2) / (RD.length - 1);
  const width = step * (RW - 1) + 26;
  win.style.width = width + "px";
  let i = RW - 1;
  const move = () => {
    win.style.left = (pad + (i - RW + 1) * step - 13) + "px";
    i++;
    if (i > RD.length) { i = RW - 1; }
  };
  move();
  rollTimer = setInterval(move, 620);
}
new IntersectionObserver((es) => es.forEach(e => {
  if (e.isIntersecting) { rollBuild(); rollPlay(); }
  else clearInterval(rollTimer);
}), {threshold:.25}).observe($("#s14 .stage"));
window.addEventListener("resize", () => { rollBuild(); rollPlay(); });

/* ============================================================
   16. [S16] 체이닝 실행 추적
   ============================================================ */
function chainRun(){
  const steps = $$("#chain .cs");
  steps.forEach(s => s.classList.remove("on"));
  steps.forEach((s, i) => setTimeout(() => {
    steps.forEach(x => x.classList.remove("on"));
    s.classList.add("on");
    if (i === steps.length - 1) setTimeout(() => s.classList.remove("on"), 1400);
  }, i * 780));
}
new IntersectionObserver((es, o) => es.forEach(e => {
  if (e.isIntersecting) { chainRun(); o.disconnect(); }
}), {threshold:.4}).observe($("#chain"));

