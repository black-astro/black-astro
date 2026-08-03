/* ============================================================
   24-B. 신규 데모 — .str 체험기 · cut/qcut · 기능 색인 · Traceback
   ============================================================ */

/* --- Pandas 19: .str 체험기 --- */
const STR_SRC = ["  Apple 노트북 ", "SAMSUNG 모니터", "lg 키보드  ",
                 "Apple 마우스", "samsung SSD", "  LG 모니터"];
const strQ = v => '"' + v.replace(/ /g, "·") + '"';   // 공백을 눈에 보이게
const strTF = b => `<span class="${b ? "mask-T" : "mask-F"}">${b ? "True" : "False"}</span>`;
const strTitle = v => v.replace(/[A-Za-z]+/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());

const STR_OPS = {
  strip: { code: 'df["상품명"].str.strip()', kind: "Series[str]", head: ["결과"],
    desc: "<b>양쪽 끝 공백만</b> 사라집니다(가운데는 그대로). 엑셀에서 받은 데이터는 거의 항상 이 작업부터 시작합니다. 공백 하나 때문에 groupby가 같은 값을 둘로 세는 사고가 여기서 막힙니다.",
    f: v => [strQ(v.trim())] },
  lower: { code: 'df["상품명"].str.lower()', kind: "Series[str]", head: ["결과"],
    desc: "전부 소문자로. <b>비교하기 전에 대소문자를 통일</b>해 두면 “Apple ≠ apple” 때문에 안 걸러지는 문제가 사라집니다.",
    f: v => [strQ(v.toLowerCase())] },
  title: { code: 'df["상품명"].str.title()', kind: "Series[str]", head: ["결과"],
    desc: "단어마다 첫 글자만 대문자로. 영문 상품명·사람 이름 표기를 정리할 때 씁니다. 한글은 영향을 받지 않습니다.",
    f: v => [strQ(strTitle(v))] },
  len: { code: 'df["상품명"].str.len()', kind: "Series[int]", head: ["결과"],
    desc: "글자 수를 셉니다. 결과가 <b>숫자 Series</b>라서 <code>df[df[\"상품명\"].str.len() > 10]</code>처럼 바로 조건에 쓸 수 있습니다. 공백도 한 글자로 셉니다.",
    f: v => ['<span style="color:var(--amber)">' + v.length + "</span>"] },
  contains: { code: 'df["상품명"].str.contains("모니터", na=False)', kind: "Series[bool]", head: ["결과"],
    desc: "포함 여부를 True/False로. <b>이 결과를 그대로 대괄호에 넣으면 필터</b>가 됩니다 — <code>df[df[\"상품명\"].str.contains(\"모니터\", na=False)]</code>. 빈칸(NaN)이 있으면 에러가 나므로 <code>na=False</code>를 습관처럼 붙이세요.",
    f: v => [strTF(v.includes("모니터"))] },
  startswith: { code: 'df["상품명"].str.startswith("Apple")', kind: "Series[bool]", head: ["결과"],
    desc: "앞부분이 맞는지 확인합니다. <b>앞에 공백이 있으면 False</b>가 되는 걸 보세요 — 그래서 <code>.str.strip().str.startswith(...)</code>처럼 <b>다듬은 뒤에 검사</b>하는 순서가 중요합니다.",
    f: v => [strTF(v.startsWith("Apple"))] },
  replace: { code: 'df["상품명"].str.replace(" ", "_")', kind: "Series[str]", head: ["결과"],
    desc: "글자를 바꿉니다. 눈에 안 보이던 <b>앞뒤 공백이 밑줄로 드러나는</b> 것도 확인해 보세요. 판다스 2.x부터 <code>regex</code> 기본값이 False라, 정규식을 쓰려면 <code>regex=True</code>를 명시해야 합니다.",
    f: v => ['"' + v.replace(/ /g, "_") + '"'] },
  slice: { code: 'df["상품명"].str[:6]', kind: "Series[str]", head: ["결과"],
    desc: "앞에서 6글자만 잘라냅니다. <code>.str.slice(0, 6)</code>와 같습니다. 지역코드·연도처럼 <b>자리수가 정해진</b> 값을 뽑을 때 유용합니다.",
    f: v => [strQ(v.slice(0, 6))] },
  split: { code: 'df["상품명"].str.split()', kind: "Series[list]", head: ["결과"],
    desc: "공백 기준으로 쪼갭니다. 결과는 <b>리스트가 든 한 컬럼</b>이라 아직 계산에 쓸 수 없습니다. 앞 조각만 필요하면 <code>.str[0]</code>, 표로 펼치려면 다음 버튼(<code>expand=True</code>)을 보세요.",
    f: v => ['<span style="color:var(--violet)">[' + v.trim().split(/\s+/).map(x => "'" + x + "'").join(", ") + "]</span>"] },
  expand: { code: 'df[["브랜드","품목"]] = df["상품명"].str.split(expand=True)', kind: "DataFrame", head: ["브랜드", "품목"],
    desc: "<b>실무에서 실제로 쓰는 형태</b>입니다. 쪼갠 조각이 각각 <b>독립된 컬럼</b>이 되어 바로 groupby·필터에 쓸 수 있습니다. 조각 수가 다르면 모자란 자리는 None이 됩니다 — <code>n=1</code>로 분리 횟수를 제한하면 안전합니다.",
    f: v => { const p = v.trim().split(/\s+/); return [strQ(p[0] || ""), strQ(p[1] || "")]; } },
};

function strGo(key, el){
  const op = STR_OPS[key];
  if (!op) return;
  if (el) $$("#strCtrl .chip").forEach(b => b.classList.toggle("on", b === el));
  const th = "<tr><th>원본 (공백은 · 로 표시)</th>" +
             op.head.map(h => `<th>${h}</th>`).join("") + "</tr>";
  $("#strTable").querySelector("thead").innerHTML = th;
  $("#strTable").querySelector("tbody").innerHTML = STR_SRC.map(v =>
    `<tr><td style="color:var(--dim)">${strQ(v)}</td>` +
    op.f(v).map(c => `<td>${c}</td>`).join("") + "</tr>").join("");
  $("#strKind").textContent = op.kind;
  const code = $("#strCode").querySelector("code");
  code.textContent = op.code;
  code.removeAttribute("data-hl");
  $("#strCode").removeAttribute("data-hlq");
  highlight($("#strCode").parentElement);
  $("#strDesc").innerHTML = op.desc;
}

/* --- Pandas 20: cut vs qcut --- */
const CUT_SRC = [["김민준",320],["이서연",210],["박지훈",450],["최유진",180],
                 ["정하늘",390],["강도윤",275],["윤서준",510],["한지우",140]];
const CUT_MODES = {
  cut3: {
    edges: [139.6, 263.3, 386.7, 510], labels: ["저", "중", "고"],
    code: 'pd.cut(df["매출"], 3, labels=["저","중","고"])',
    desc: "<b>값의 폭을 3등분</b>합니다(140~510을 123.3씩). 그래서 구간마다 인원이 제각각입니다 — 위 막대의 폭은 같지만 점(사람)의 개수는 다르죠. “<b>기준이 정해진 분류</b>”에 맞습니다."
  },
  bins: {
    edges: [0, 200, 400, 600], labels: ["하", "중", "상"],
    code: 'pd.cut(df["매출"], bins=[0, 200, 400, 600],\n       labels=["하","중","상"])',
    desc: "<b>내가 직접 정한 경계</b>로 나눕니다. 실무에서 가장 많이 쓰는 형태예요(“400 이상은 상등급”). 기본은 <code>right=True</code> — 즉 <code>(200, 400]</code>이라 <b>경계값 400은 ‘중’</b>에 들어갑니다."
  },
  qcut: {
    edges: [140, 231.7, 366.7, 510], labels: ["하위⅓", "중위⅓", "상위⅓"],
    code: 'pd.qcut(df["매출"], q=3,\n        labels=["하위⅓","중위⅓","상위⅓"])',
    desc: "<b>인원을 똑같이 3등분</b>합니다. 구간 폭은 제각각이지만 각 구간에 든 사람 수는 같습니다 — “<b>상위 25%</b>” 같은 <b>비율 기준 분석</b>에 씁니다."
  },
};
function cutBin(v, m){
  for (let i = 1; i < m.edges.length; i++) if (v <= m.edges[i]) return i - 1;
  return m.edges.length - 2;
}
function cutGo(mode, el){
  const m = CUT_MODES[mode];
  if (!m) return;
  if (el) $$("#s20 .stage .chip").forEach(b => b.classList.toggle("on", b === el));
  const lo = m.edges[0], hi = m.edges[m.edges.length - 1], span = hi - lo || 1;
  const pct = v => ((v - lo) / span) * 100;
  const COL = ["rgba(59,130,246,.30)", "rgba(52,211,153,.30)", "rgba(167,139,250,.30)"];
  let html = "";
  for (let i = 0; i < m.labels.length; i++){
    const l = pct(m.edges[i]), w = pct(m.edges[i + 1]) - l;
    html += `<div class="cutseg" style="left:${l}%;width:${w}%;background:${COL[i]}">${m.labels[i]}</div>`;
  }
  m.edges.forEach(e => {
    html += `<div class="cutedge" style="left:${Math.min(99, Math.max(1, pct(e)))}%">${Math.round(e)}</div>`;
  });
  CUT_SRC.forEach(([, v]) => {
    html += `<div class="cutdot" style="left:${pct(v)}%" title="${v}"></div>`;
  });
  $("#cutBar").innerHTML = html;
  $("#cutTable").querySelector("tbody").innerHTML = CUT_SRC.map(([n, v]) => {
    const i = cutBin(v, m);
    const c = ["var(--blue-l)", "var(--green)", "var(--violet)"][i];
    return `<tr><td>${n}</td><td>${v}</td><td style="color:${c};font-weight:650">${m.labels[i]}</td></tr>`;
  }).join("");
  const code = $("#cutCode").querySelector("code");
  code.textContent = m.code;
  code.removeAttribute("data-hl");
  $("#cutCode").removeAttribute("data-hlq");
  highlight($("#cutCode").parentElement);
  $("#cutDesc").innerHTML = m.desc;
}

/* --- Pandas 22: 목적별 기능 색인 필터 --- */
function pfxFilter(){
  const q = ($("#pfxQ")?.value || "").trim().toLowerCase();
  const rows = $$("#pfxTable tbody tr");
  let n = 0;
  rows.forEach(tr => {
    const hay = ((tr.dataset.k || "") + " " + tr.textContent).toLowerCase();
    const ok = !q || q.split(/\s+/).every(t => hay.includes(t));
    tr.style.display = ok ? "" : "none";
    if (ok) n++;
  });
  const c = $("#pfxCount");
  if (c) c.textContent = q
    ? `${n}개 찾음 — 원하는 게 없으면 다른 낱말로 (예: 정렬 · 빈칸 · 합치기 · 엑셀)`
    : `전체 ${rows.length}개 · 위 칸에 하려는 일을 한글로 입력해 보세요`;
}
function pfxSet(q){
  const inp = $("#pfxQ");
  if (!inp) return;
  inp.value = q;
  pfxFilter();
  if (q) inp.focus();
}

/* --- Python 14: Traceback 해부 --- */
const TRB_DESC = [
  "맨 윗줄은 “여기서부터 <b>호출 순서</b>다”라는 안내입니다. <b>most recent call last</b> — 즉 <b>아래로 갈수록 실제 사고 현장에 가깝습니다</b>. 그래서 <b>맨 아래부터 거꾸로</b> 읽는 게 정석입니다.",
  "내 코드가 <b>어디서 그 함수를 불렀는지</b>입니다. <code>main.py 12번 줄</code>에서 <code>평균(점수들)</code>을 호출했군요. 함수 자체는 멀쩡한데 <b>넘긴 값이 잘못된</b> 경우, 범인은 대개 이 줄에 있습니다.",
  "<b>실제로 터진 자리</b>입니다. <code>main.py 7번 줄</code>의 <code>합계 / 개수</code>. 파이썬 3.11+ 는 <code>~~~^~~~</code>로 <b>줄 안에서 어느 연산</b>이 문제인지까지 가리켜 줍니다 — 여기서는 나눗셈이네요.",
  "<b>가장 먼저 읽어야 할 줄</b>입니다. <code>ZeroDivisionError</code>(에러 종류) + <code>division by zero</code>(이유). 종류만 검색해도 해결책이 쏟아집니다. 이 경우 원인은 <b>점수들이 빈 목록이라 개수가 0</b>이라는 것 — 진짜 고칠 곳은 3번이 아니라 <b>2번(넘긴 값)</b>입니다.",
];
function trbGo(part, el){
  const box = $("#trbBox");
  if (!box) return;
  if (el) $$("#p14 .stage .chip").forEach(b => b.classList.toggle("on", b === el));
  const spans = $$("#trbBox code span");
  spans.forEach(s => s.classList.toggle("on", part >= 0 && +s.dataset.p === part));
  box.classList.toggle("dim", part >= 0);
  $("#trbDesc").innerHTML = part >= 0
    ? TRB_DESC[part]
    : "전체 모습입니다. <b>맨 아랫줄 → 내 파일이 나오는 마지막 줄</b> 순서로 두 줄만 읽으면 원인의 90%가 잡힙니다. 가운데의 긴 라이브러리 경로는 대부분 읽을 필요가 없습니다.";
}

