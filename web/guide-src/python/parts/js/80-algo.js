/* ============================================================
   [g01] 복잡도 성장 비교
   ============================================================ */
const BO = [
  { c:"c1", nm:"O(1)",       f:() => 1,                  d:"입력이 아무리 커져도 한 번" },
  { c:"c2", nm:"O(log n)",   f:n => Math.log2(n),        d:"이진 탐색 — 절반씩 버림" },
  { c:"c3", nm:"O(n)",       f:n => n,                   d:"한 번 훑기" },
  { c:"c4", nm:"O(n log n)", f:n => n * Math.log2(n),    d:"정렬의 한계선" },
  { c:"c5", nm:"O(n²)",      f:n => n * n,               d:"이중 반복문" },
];
const BO_NOTE = {
  10:      "n이 10일 땐 <b>어떤 알고리즘을 써도 똑같습니다</b>. 그래서 작은 입력으로 테스트하면 성능 문제가 안 보입니다.",
  100:     "슬슬 벌어집니다. O(n²)는 벌써 <b>1만 번</b> — 그래도 파이썬이 0.001초에 끝냅니다.",
  1000:    "O(n²)가 <b>100만 번</b>. 여기서부터 “왜 느리지?”가 시작됩니다.",
  100000:  "O(n log n)은 <b>170만 번</b>으로 여유롭지만, O(n²)는 <b>100억 번</b> — 파이썬으로 <b>약 6시간</b>입니다. 같은 문제, 같은 컴퓨터인데요.",
};
function boGo(n, btn){
  $$("#g01 .ctrls .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on");
  const vals = BO.map(o => Math.max(1, o.f(n)));
  const top = Math.log10(Math.max(...vals) + 1) || 1;
  const box = $("#boChart"); if (!box) return;
  box.innerHTML = BO.map((o, i) =>
    `<div class="col ${o.c}"><div class="bt"><div class="bar"></div></div>
      <div class="nm">${o.nm}</div><div class="vv">${AVX.num(vals[i])}</div></div>`).join("");
  requestAnimationFrame(() => {
    $$("#boChart .bar").forEach((b, i) => {
      b.style.transform = `scaleY(${Math.max(.03, Math.log10(vals[i] + 1) / top)})`;
    });
  });
  const nt = $("#boNote");
  if (nt) nt.innerHTML = `<span class="n">n = ${n.toLocaleString()}</span>` +
    `<span class="tx">${BO_NOTE[n]}</span>`;
}

/* ============================================================
   [g02] 배열 vs 연결 리스트 — 맨 앞 삽입
   ============================================================ */
function llGen(){
  const base = [7, 3, 9, 4, 1];
  const S = [];
  const slots = [...base, null];                 // 6칸: 마지막은 빈 칸
  const snap = (o) => S.push(Object.assign({
    arr: slots.map(v => (v === null ? { v:"", cls:"st-out" } : { v })),
    lnk: 0, moved: 0, ptr: 0,
  }, o));

  snap({ note:"배열 <b>[7, 3, 9, 4, 1]</b> 의 <b>맨 앞</b>에 값 <b>0</b> 을 넣으려 합니다. 두 자료구조가 어떻게 다른지 보세요." });

  for (let k = base.length - 1; k >= 0; k--){
    slots[k + 1] = slots[k]; slots[k] = null;
    const moved = base.length - k;
    const cur = slots.map((v, i) => v === null
      ? { v:"", cls:"st-out" }
      : { v, cls: i === k + 1 ? "st-cur" : "" });
    S.push({
      arr: cur, moved, ptr: moved === 1 ? 0 : 1,
      lnk: moved === 1 ? 1 : 2,
      note: moved === 1
        ? `배열: 맨 뒤 원소 <b>${slots[k + 1]}</b> 를 한 칸 오른쪽으로 옮깁니다. &nbsp;/&nbsp; 연결 리스트: 새 노드 <b>0</b> 을 만들었습니다.`
        : `배열: <b>${slots[k + 1]}</b> 를 한 칸 밀었습니다 (총 ${moved}번째 이동). &nbsp;/&nbsp; 연결 리스트는 <b>이미 끝났습니다</b> — 화살표 하나만 고쳤으니까요.`,
    });
  }
  slots[0] = 0;
  S.push({
    arr: slots.map((v, i) => ({ v, cls: i === 0 ? "st-done" : "" })),
    moved: base.length, ptr: 1, lnk: 3, tone: "ok",
    note: `배열은 <b>${base.length}칸을 전부 밀고 나서야</b> 0을 넣었습니다 → <b>O(N)</b>. 연결 리스트는 <b>화살표 1개</b>로 끝 → <b>O(1)</b>.`,
  });
  return S;
}
function llRender(s){
  AVX.arr($("#llArr"), s.arr);
  const box = $("#llLnk");
  if (box){
    const vals = [7, 3, 9, 4, 1];
    let html = "";
    if (s.lnk >= 1){
      html += `<span class="nd2 ${s.lnk === 1 ? "new" : ""} ${s.lnk >= 3 ? "on" : ""}">` +
              `<span class="vv">0</span><span class="px">next</span></span>`;
      html += `<span class="lk ${s.lnk >= 2 ? "on" : ""}"></span>`;
    }
    html += vals.map((v, i) =>
      `<span class="nd2"><span class="vv">${v}</span><span class="px">next</span></span>` +
      (i < vals.length - 1 ? `<span class="lk"></span>` : "")).join("");
    html += `<span class="nul">→ None</span>`;
    box.innerHTML = html;
  }
  AVX.set("#llMove", s.moved);
  AVX.set("#llPtr", s.ptr);
}

/* ============================================================
   [g03] 스택 vs 큐
   ============================================================ */
function sqGen(){
  const S = [];
  const stk = [], que = [], so = [], qo = [];
  const snap = note => S.push({ stk:[...stk], que:[...que], so:[...so], qo:[...qo], note });
  snap("같은 순서 <b>A → B → C</b> 로 넣고, 같은 횟수만큼 꺼냅니다. 넣는 건 똑같지만 <b>꺼낼 때 갈립니다</b>.");
  for (const ch of ["A", "B", "C"]){
    stk.push(ch); que.push(ch);
    snap(`<b>${ch}</b> 를 넣었습니다. 스택은 <b>위에 쌓고</b>, 큐는 <b>뒤에 붙입니다</b>.`);
  }
  for (let i = 0; i < 3; i++){
    const a = stk.pop(), b = que.shift();
    so.push(a); qo.push(b);
    S.push({ stk:[...stk], que:[...que], so:[...so], qo:[...qo],
      note: `스택은 <b>가장 최근에 넣은 ${a}</b> 를, 큐는 <b>가장 먼저 넣은 ${b}</b> 를 꺼냅니다.` });
  }
  S.push({ stk:[], que:[], so:[...so], qo:[...qo], tone:"ok",
    note: `결과 — 스택 <b>${so.join(" → ")}</b> (입력의 역순, LIFO) &nbsp;/&nbsp; 큐 <b>${qo.join(" → ")}</b> (입력 그대로, FIFO).` });
  return S;
}
function sqRender(s){
  const stkEl = $("#sqStk");
  if (stkEl){
    stkEl.innerHTML = s.stk.length
      ? s.stk.map((v, i) =>
          `<div class="f ${i === s.stk.length - 1 ? "top" : ""}">${v}` +
          `<span>${i === s.stk.length - 1 ? "← top" : ""}</span></div>`).join("")
      : `<div class="empty">비어 있음</div>`;
  }
  AVX.que($("#sqQue"), s.que.map((v, i) => ({ v, pt: i === 0 ? "front" : (i === s.que.length - 1 ? "rear" : "") })));
  AVX.que($("#sqSout"), s.so.map(v => ({ v, cls:"" })), "아직 없음");
  AVX.que($("#sqQout"), s.qo.map(v => ({ v, cls:"" })), "아직 없음");
}

/* ============================================================
   [g04] 해시 테이블 — 해싱 · 충돌 · 체이닝
   ============================================================ */
const HT_KEYS = ["apple", "banana", "cherry", "grape", "melon", "lemon"];
const HT_B = 7;
const htHash = k => [...k].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 1000003, 7);
function htGen(){
  const S = [];
  const buckets = Array.from({ length: HT_B }, () => []);
  const snap = (o) => S.push(Object.assign({
    b: buckets.map(x => x.map(k => ({ k }))), on:-1, note:"",
  }, o));
  snap({ note:`버킷 <b>${HT_B}개</b>짜리 해시 테이블입니다. 키를 넣을 때마다 <b>해시값 % ${HT_B}</b> 로 칸을 정합니다.` });
  HT_KEYS.forEach(k => {
    const h = htHash(k), idx = h % HT_B;
    S.push({ b: buckets.map(x => x.map(kk => ({ k:kk }))), on: idx, calc: `${k} → hash ${h} → ${h} % ${HT_B} = <b>${idx}</b>`,
      note: `<code>hash("${k}")</code> = ${h} → <code>${h} % ${HT_B}</code> = <b>${idx}</b> 번 버킷으로 갑니다.` });
    const clash = buckets[idx].length > 0;
    buckets[idx].push(k);
    S.push({ b: buckets.map((x, i) => x.map((kk, j) => ({
        k: kk, cls: (i === idx && j === buckets[idx].length - 1) ? (clash ? "clash" : "on") : "" }))),
      on: idx, tone: clash ? "bad" : "",
      note: clash
        ? `<b>충돌!</b> ${idx}번 버킷에 이미 값이 있습니다 → 같은 칸에 <b>이어 답니다(체이닝)</b>. 이 칸을 찾을 땐 목록을 훑어야 해서 조금 느려집니다.`
        : `${idx}번 버킷에 <b>${k}</b> 저장 완료. 계산 한 번으로 자리가 정해졌습니다 → <b>O(1)</b>.` });
  });
  const look = "cherry", li = htHash(look) % HT_B;
  S.push({ b: buckets.map((x, i) => x.map(kk => ({ k: kk, cls: (i === li && kk === look) ? "on" : "" }))),
    on: li, tone: "ok",
    note: `조회도 같습니다 — <code>"${look}"</code> 를 찾을 때 <b>${HT_B}개를 다 뒤지지 않고</b> 해시 계산 한 번으로 ${li}번 버킷만 봅니다. 이것이 <code>x in my_set</code> 이 빠른 이유입니다.` });
  return S;
}
function htRender(s){
  const el = $("#htTable"); if (!el) return;
  el.innerHTML = s.b.map((slot, i) =>
    `<div class="bk">${i}</div><div class="sl ${s.on === i ? "on" : ""}">` +
    (slot.length
      ? slot.map((o, j) => (j ? `<span class="ar">→</span>` : "") +
          `<span class="kv ${o.cls || ""}">${o.k}</span>`).join("")
      : `<span class="ar">비어 있음</span>`) + `</div>`).join("");
}

/* ============================================================
   [g05] 이진 탐색
   ============================================================ */
const BS_ARR = [2, 4, 7, 11, 15, 19, 23, 29, 34, 41, 55, 72];
let bsGoal = 23;
function bsTarget(v, btn){
  $$("#g05 .ctrls .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on");
  bsGoal = v;
  AV.reset("bs");
}
function bsGen(){
  const S = [], t = bsGoal;
  let lo = 0, hi = BS_ARR.length - 1, cnt = 0;
  const lin = BS_ARR.indexOf(t) >= 0 ? BS_ARR.indexOf(t) + 1 : BS_ARR.length;
  const paint = (L, R, M, foundIdx) => BS_ARR.map((v, i) => {
    let cls = "", pt = "";
    if (foundIdx === i) cls = "st-done";
    else if (i < L || i > R) cls = "st-out";
    else if (i === M) cls = "st-cur";
    else cls = "st-lo";
    if (i === L && foundIdx < 0) pt = "L";
    if (i === R && foundIdx < 0) pt = pt ? "L·R" : "R";
    if (i === M && foundIdx < 0) pt = pt ? pt + "·M" : "M";
    return { v, cls, pt };
  });
  S.push({ arr: paint(lo, hi, -1, -1), cnt:0, lin,
    note: `정렬된 <b>${BS_ARR.length}개</b> 중에서 <b>${t}</b> 를 찾습니다. 순차 탐색이라면 최대 ${BS_ARR.length}번 봐야 합니다.` });
  let found = -1;
  while (lo <= hi){
    const mid = (lo + hi) >> 1;
    cnt++;
    S.push({ arr: paint(lo, hi, mid, -1), cnt, lin,
      note: `남은 구간 <b>[${lo} ~ ${hi}]</b> 의 가운데 <b>${mid}</b>번(<b>${BS_ARR[mid]}</b>)을 봅니다. ${BS_ARR.length - (hi - lo + 1)}칸은 이미 후보에서 빠졌습니다.` });
    if (BS_ARR[mid] === t){ found = mid; break; }
    if (BS_ARR[mid] < t){
      lo = mid + 1;
      S.push({ arr: paint(lo, hi, -1, -1), cnt, lin,
        note: `<b>${BS_ARR[mid]} &lt; ${t}</b> → 정렬돼 있으니 <b>왼쪽 절반은 전부 오답</b>. 통째로 버립니다.` });
    } else {
      hi = mid - 1;
      S.push({ arr: paint(lo, hi, -1, -1), cnt, lin,
        note: `<b>${BS_ARR[mid]} &gt; ${t}</b> → <b>오른쪽 절반은 전부 오답</b>. 통째로 버립니다.` });
    }
  }
  if (found >= 0){
    S.push({ arr: paint(found, found, found, found), cnt, lin, tone:"ok",
      note: `<b>${cnt}번</b> 만에 찾았습니다 (순차 탐색이면 ${lin}번). 데이터가 100만 개여도 <b>20번</b>이면 끝납니다.` });
  } else {
    S.push({ arr: BS_ARR.map(v => ({ v, cls:"st-out" })), cnt, lin, tone:"bad",
      note: `구간이 사라졌습니다 (lo &gt; hi) → <b>${t} 은(는) 없습니다</b>. ${cnt}번 만에 “없다”는 것까지 확인했습니다.` });
  }
  return S;
}
function bsRender(s){
  AVX.arr($("#bsArr"), s.arr);
  AVX.set("#bsCnt", s.cnt);
  AVX.set("#bsLin", s.lin);
}

/* ============================================================
   [g06] 투 포인터
   ============================================================ */
const TP_ARR = [1, 3, 6, 8, 11, 14, 18, 22, 27, 31];
const TP_GOAL = 26;
function tpGen(){
  const S = [];
  let lo = 0, hi = TP_ARR.length - 1;
  const paint = (L, R, cls) => TP_ARR.map((v, i) => {
    if (i < L || i > R) return { v, cls:"st-out" };
    if (i === L) return { v, cls: cls || "st-cur", pt:"L" };
    if (i === R) return { v, cls: cls || "st-cur", pt:"R" };
    return { v, cls:"" };
  });
  S.push({ arr: paint(lo, hi), note:
    `정렬된 배열에서 <b>합이 ${TP_GOAL}</b> 인 두 수를 찾습니다. 이중 for문이면 ${TP_ARR.length * (TP_ARR.length - 1) / 2}번 비교해야 합니다.` });
  let done = false;
  while (lo < hi){
    const s = TP_ARR[lo] + TP_ARR[hi];
    S.push({ arr: paint(lo, hi, "st-cmp"),
      note: `<b>${TP_ARR[lo]} + ${TP_ARR[hi]} = ${s}</b> ${s === TP_GOAL ? "→ 목표와 같습니다!" : (s < TP_GOAL ? `→ ${TP_GOAL} 보다 <b>작습니다</b>` : `→ ${TP_GOAL} 보다 <b>큽니다</b>`)}` });
    if (s === TP_GOAL){
      S.push({ arr: TP_ARR.map((v, i) => ({ v, cls: (i === lo || i === hi) ? "st-done" : "st-out" })), tone:"ok",
        note: `<b>${TP_ARR[lo]} + ${TP_ARR[hi]} = ${TP_GOAL}</b> — 찾았습니다. 포인터 이동은 총 ${lo + (TP_ARR.length - 1 - hi)}번, 즉 <b>O(N)</b>.` });
      done = true; break;
    }
    if (s < TP_GOAL){
      lo++;
      S.push({ arr: paint(lo, hi),
        note: `더 큰 수가 필요합니다 → <b>L을 오른쪽으로</b>. (R을 줄이면 합이 더 작아지므로 절대 답이 될 수 없어 안전하게 버립니다.)` });
    } else {
      hi--;
      S.push({ arr: paint(lo, hi),
        note: `더 작은 수가 필요합니다 → <b>R을 왼쪽으로</b>. 버려지는 후보들은 전부 “합이 더 커지는” 쪽이라 오답이 확정입니다.` });
    }
  }
  if (!done) S.push({ arr: TP_ARR.map(v => ({ v, cls:"st-out" })), tone:"bad",
    note:`포인터가 만났습니다 → 합이 ${TP_GOAL}인 쌍은 <b>없습니다</b>.` });
  return S;
}
function tpRender(s){ AVX.arr($("#tpArr"), s.arr); }

/* ============================================================
   [g07] 슬라이딩 윈도우
   ============================================================ */
const SW_ARR = [3, -1, 4, 1, 5, -9, 2, 6, 5, 3];
const SW_K = 3;
function swGen(){
  const S = [];
  let cur = SW_ARR.slice(0, SW_K).reduce((a, b) => a + b, 0);
  let best = cur, ops = SW_K, bestAt = 0;
  const paint = (st, mark) => SW_ARR.map((v, i) => {
    const inw = i >= st && i < st + SW_K;
    let cls = inw ? "st-cur" : "";
    if (mark === "out" && i === st - 1) cls = "st-cmp";
    if (mark === "in" && i === st + SW_K - 1) cls = "st-hit";
    if (!inw && cls === "") cls = "";
    return { v, cls, pt: i === st ? "W" : "" };
  });
  S.push({ arr: paint(0), cur, best, ops, bestAt,
    note: `크기 <b>${SW_K}</b> 인 첫 창의 합을 직접 계산합니다: <b>${SW_ARR.slice(0, SW_K).join(" + ")} = ${cur}</b>. (덧셈 ${SW_K}번)` });
  for (let i = SW_K; i < SW_ARR.length; i++){
    const out = SW_ARR[i - SW_K], inn = SW_ARR[i];
    cur += inn - out; ops += 2;
    const better = cur > best;
    if (better){ best = cur; bestAt = i - SW_K + 1; }
    S.push({ arr: paint(i - SW_K + 1, "in"), cur, best, ops, bestAt, tone: better ? "ok" : "",
      note: `창을 한 칸 밀었습니다 — 나간 값 <b>${out}</b> 빼고 들어온 값 <b>${inn}</b> 더하기 = <b>${cur}</b>. ` +
            (better ? `<b>새로운 최대!</b>` : `최대는 여전히 ${best}.`) + ` <b>덧셈 2번</b>만 했습니다.` });
  }
  S.push({ arr: SW_ARR.map((v, i) => ({ v, cls: (i >= bestAt && i < bestAt + SW_K) ? "st-done" : "st-out" })),
    cur, best, ops, bestAt, tone:"ok",
    note: `최대 구간합은 <b>${best}</b> (${bestAt}번부터 ${SW_K}칸). 매번 다시 더했다면 ${(SW_ARR.length - SW_K + 1) * SW_K}번, 슬라이딩은 <b>${ops}번</b>.` });
  return S;
}
function swRender(s){
  AVX.arr($("#swArr"), s.arr);
  AVX.set("#swSum", s.cur);
  AVX.set("#swMax", s.best);
  AVX.set("#swOps", s.ops);
  AVX.set("#swNaive", (SW_ARR.length - SW_K + 1) * SW_K);
}

/* ============================================================
   [g08] 정렬 5종
   ============================================================ */
let SO_BASE = [42, 17, 63, 8, 55, 29, 71, 36];
let soKind = "bubble";
function soShuffle(){
  SO_BASE = SO_BASE.slice().sort(() => Math.random() - .5);
  AV.reset("so");
}
function soPick(k, btn){
  $$("#g08 .ctrls .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on");
  soKind = k;
  AV.reset("so");
}
function soGen(){
  const a = [...SO_BASE], S = [];
  let c = 0, s = 0;
  const done = [];
  const push = o => S.push(Object.assign({ a:[...a], cmp:[], swap:[], piv:[], done:[...done], c, s }, o));
  const H = {
    bubble: "버블 정렬 — 옆칸끼리 비교해서 큰 값을 <b>뒤로 밀어냅니다</b>. 한 바퀴 돌 때마다 맨 뒤 하나가 확정됩니다.",
    select: "선택 정렬 — 남은 것 중 <b>가장 작은 값을 찾아</b> 맨 앞과 바꿉니다. 교환 횟수가 가장 적습니다.",
    insert: "삽입 정렬 — 카드 정리하듯, 값을 뽑아 <b>왼쪽의 정렬된 부분에 끼워 넣습니다</b>.",
    merge:  "병합 정렬 — 절반으로 쪼갠 뒤 <b>정렬된 두 조각을 합칩니다</b>. 최악에도 O(N log N) 보장.",
    quick:  "퀵 정렬 — <b>피벗</b>보다 작은 건 왼쪽, 큰 건 오른쪽으로 몰고 재귀. 실측이 가장 빠릅니다.",
  };
  push({ note: H[soKind] });

  if (soKind === "bubble"){
    for (let i = 0; i < a.length - 1; i++){
      for (let j = 0; j < a.length - 1 - i; j++){
        c++; push({ cmp:[j, j + 1], note:`<b>${a[j]}</b> 와 <b>${a[j + 1]}</b> 비교` });
        if (a[j] > a[j + 1]){
          [a[j], a[j + 1]] = [a[j + 1], a[j]]; s++;
          push({ swap:[j, j + 1], note:`왼쪽이 더 크므로 <b>자리 교환</b>` });
        }
      }
      done.push(a.length - 1 - i);
      push({ note:`가장 큰 값 <b>${a[a.length - 1 - i]}</b> 가 맨 뒤에 <b>확정</b>되었습니다.` });
    }
    done.push(0);
  } else if (soKind === "select"){
    for (let i = 0; i < a.length - 1; i++){
      let m = i;
      push({ cmp:[i], note:`${i}번부터 끝까지 중 <b>가장 작은 값</b>을 찾습니다.` });
      for (let j = i + 1; j < a.length; j++){
        c++; push({ cmp:[j], piv:[m], note:`${a[j]} 와 현재 최솟값 ${a[m]} 비교` });
        if (a[j] < a[m]) m = j;
      }
      if (m !== i){ [a[i], a[m]] = [a[m], a[i]]; s++; }
      done.push(i);
      push({ swap: m !== i ? [i, m] : [], note:`최솟값 <b>${a[i]}</b> 를 ${i}번 자리로 — 한 바퀴에 <b>교환 1번</b>뿐입니다.` });
    }
    done.push(a.length - 1);
  } else if (soKind === "insert"){
    done.push(0);
    push({ note:`첫 원소는 <b>이미 정렬된 것</b>으로 봅니다.` });
    for (let i = 1; i < a.length; i++){
      const key = a[i];
      push({ cmp:[i], note:`<b>${key}</b> 를 뽑아 왼쪽 정렬 구간에 끼울 자리를 찾습니다.` });
      let j = i - 1;
      while (j >= 0 && a[j] > key){
        c++; a[j + 1] = a[j]; s++;
        push({ swap:[j, j + 1], note:`${a[j]} 가 ${key} 보다 크므로 <b>오른쪽으로 한 칸</b> 밀기` });
        j--;
      }
      if (j >= 0) c++;
      a[j + 1] = key;
      done.push(i);
      push({ cmp:[j + 1], note:`<b>${key}</b> 를 ${j + 1}번 자리에 <b>삽입</b>. 이미 정렬돼 있으면 밀 일이 없어 O(N)이 됩니다.` });
    }
  } else if (soKind === "merge"){
    const sort = (lo, hi) => {
      if (lo >= hi) return;
      const mid = (lo + hi) >> 1;
      push({ piv: range(lo, hi), note:`구간 <b>[${lo}~${hi}]</b> 를 [${lo}~${mid}] / [${mid + 1}~${hi}] 로 <b>쪼갭니다</b>.` });
      sort(lo, mid); sort(mid + 1, hi);
      const L = a.slice(lo, mid + 1), R = a.slice(mid + 1, hi + 1);
      let i = 0, j = 0, k = lo;
      while (i < L.length && j < R.length){
        c++;
        const take = L[i] <= R[j] ? L[i++] : R[j++];
        a[k] = take; s++;
        push({ cmp:[k], piv: range(lo, hi), note:`두 조각의 맨 앞을 비교 → 작은 값 <b>${take}</b> 를 ${k}번 자리에 씁니다.` });
        k++;
      }
      while (i < L.length){ a[k] = L[i++]; s++; push({ cmp:[k], piv: range(lo, hi), note:`왼쪽 조각의 남은 값 <b>${a[k]}</b> 복사` }); k++; }
      while (j < R.length){ a[k] = R[j++]; s++; push({ cmp:[k], piv: range(lo, hi), note:`오른쪽 조각의 남은 값 <b>${a[k]}</b> 복사` }); k++; }
      push({ piv: range(lo, hi), note:`구간 [${lo}~${hi}] <b>병합 완료</b> — 이 구간은 정렬된 상태입니다.` });
    };
    sort(0, a.length - 1);
    for (let i = 0; i < a.length; i++) done.push(i);
  } else {                                   // quick (Lomuto)
    const sort = (lo, hi) => {
      if (lo > hi) return;
      if (lo === hi){ done.push(lo); push({ note:`${lo}번은 원소가 하나 → 자동 <b>확정</b>` }); return; }
      const p = a[hi];
      push({ piv:[hi], note:`구간 [${lo}~${hi}] 의 <b>피벗 = ${p}</b> (맨 오른쪽 값을 기준으로 삼습니다).` });
      let i = lo;
      for (let j = lo; j < hi; j++){
        c++; push({ piv:[hi], cmp:[j], note:`<b>${a[j]}</b> 와 피벗 <b>${p}</b> 비교` });
        if (a[j] < p){
          if (i !== j){
            [a[i], a[j]] = [a[j], a[i]]; s++;
            push({ piv:[hi], swap:[i, j], note:`피벗보다 작으므로 <b>왼쪽 영역</b>으로 보냅니다.` });
          }
          i++;
        }
      }
      [a[i], a[hi]] = [a[hi], a[i]]; s++;
      push({ swap:[i, hi], note:`피벗을 <b>${i}번 자리</b>에 놓습니다 — 왼쪽은 전부 작고 오른쪽은 전부 큽니다.` });
      done.push(i);
      push({ note:`<b>${i}번 확정.</b> 이제 왼쪽 [${lo}~${i - 1}] 과 오른쪽 [${i + 1}~${hi}] 을 같은 방법으로 처리합니다.` });
      sort(lo, i - 1); sort(i + 1, hi);
    };
    sort(0, a.length - 1);
  }
  push({ tone:"ok", note:`정렬 완료 — 비교 <b>${c}회</b>, 교환·이동 <b>${s}회</b>. 파이썬 <code>sorted()</code> 는 이걸 C로 구현한 Timsort 로 처리합니다.` });
  return S;
}
function range(a, b){ const r = []; for (let i = a; i <= b; i++) r.push(i); return r; }
function soRender(st){
  const el = $("#soBars"); if (!el) return;
  const mx = Math.max(...st.a);
  el.innerHTML = st.a.map((v, i) => {
    let cls = "";
    if (st.done.includes(i)) cls = "b-done";
    else if (st.swap.includes(i)) cls = "b-swap";
    else if (st.cmp.includes(i)) cls = "b-cmp";
    else if (st.piv.includes(i)) cls = "b-pivot";
    return `<i class="${cls}" style="height:${Math.round(v / mx * 100)}%"><b>${v}</b></i>`;
  }).join("");
  AVX.set("#soCmp", st.c);
  AVX.set("#soSwp", st.s);
  AVX.set("#soDone", st.done.length);
}

/* ============================================================
   [g09] 재귀 · 콜스택
   ============================================================ */
function rcGen(){
  const S = [], st = [];
  const snap = (note, tone) => S.push({ st: st.map(f => ({ ...f })), note, tone });
  snap("<code>factorial(5)</code> 를 호출합니다. 함수가 자기 자신을 부를 때마다 <b>프레임이 하나씩 쌓입니다</b>.");
  for (let n = 5; n >= 1; n--){
    st.push({ t:`factorial(${n})`, s: n > 1 ? `대기 → ${n} × factorial(${n - 1})` : "종료 조건!" });
    snap(n > 1
      ? `<code>factorial(${n})</code> 진입 — 아직 답을 모릅니다. <code>factorial(${n - 1})</code> 의 결과를 <b>기다리며 멈춰</b> 있습니다.`
      : `<code>factorial(1)</code> — <b>종료 조건</b>에 도달했습니다. 드디어 값 <b>1</b> 을 반환할 수 있습니다.`);
  }
  let acc = 1;
  for (let n = 1; n <= 5; n++){
    if (n > 1) acc *= n;
    st.pop();
    if (st.length) st[st.length - 1].s = `${n + 1} × ${acc} 계산 대기`;
    S.push({ st: st.map(f => ({ ...f })), ret:{ n, v: acc },
      note: `<code>factorial(${n})</code> 이 <b>${acc}</b> 를 반환하고 <b>사라집니다</b>. 기다리던 <code>factorial(${n + 1})</code> 이 그 값을 받아 이어서 계산합니다.` });
  }
  S.push({ st: [], ret:{ n:5, v:120 }, tone:"ok",
    note: `스택이 모두 비었습니다 → 최종 결과 <b>120</b>. <b>쌓이는 순서는 5→1, 값이 돌아오는 순서는 1→5</b> — 이 뒤집힘이 재귀의 핵심입니다.` });
  return S;
}
function rcRender(s){
  const el = $("#rcStk"); if (!el) return;
  el.innerHTML = s.st.length
    ? s.st.map((f, i) =>
        `<div class="f ${i === s.st.length - 1 ? "top" : ""}">${f.t}<span>${f.s || ""}</span></div>`).join("")
    : `<div class="empty">${s.ret ? "반환값 " + s.ret.v : "비어 있음"}</div>`;
}

/* ============================================================
   [g10] 트리 순회
   ============================================================ */
const TR_V = [50, 30, 70, 20, 40, 60, 80];        // 완전 이진 탐색 트리
let trMode = "pre";
function trPick(k, btn){
  $$("#g10 .ctrls .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on");
  trMode = k;
  AV.reset("tr");
}
function trGen(){
  const S = [], out = [];
  const L = i => (2 * i + 1 < TR_V.length ? 2 * i + 1 : -1);
  const R = i => (2 * i + 2 < TR_V.length ? 2 * i + 2 : -1);
  const snap = (cls, ord, note, tone, edge) =>
    S.push({ cls:{ ...cls }, ord:{ ...ord }, out:[...out], note, tone, edge:{ ...(edge || {}) } });
  const cls = {}, ord = {};
  const NAMES = { pre:"전위(Preorder)", in:"중위(Inorder)", post:"후위(Postorder)", level:"레벨(BFS)", search:"BST 검색" };
  snap(cls, ord, `<b>${NAMES[trMode]}</b> 순회를 시작합니다. 노드 아래 작은 숫자가 <b>방문 순서</b>입니다.`);

  if (trMode === "search"){
    let i = 0, target = 43;
    while (i >= 0){
      cls[i] = "st-cur";
      snap(cls, ord, `<b>${TR_V[i]}</b> 와 찾는 값 <b>${target}</b> 비교.`);
      if (TR_V[i] === target){ cls[i] = "st-done"; snap(cls, ord, "찾았습니다!", "ok"); return S; }
      const next = target < TR_V[i] ? L(i) : R(i);
      cls[i] = "st-hit";
      if (next < 0){
        snap(cls, ord, `<b>${target} ${target < TR_V[i] ? "&lt;" : "&gt;"} ${TR_V[i]}</b> → ${target < TR_V[i] ? "왼쪽" : "오른쪽"}으로 가야 하는데 자식이 없습니다 → <b>${target} 은(는) 없습니다</b>. 비교는 단 <b>${Object.keys(cls).length}번</b>.`, "bad");
        return S;
      }
      const edge = {}; edge[next] = true;
      // 반대쪽 서브트리 전체를 후보에서 제외
      const drop = target < TR_V[i] ? R(i) : L(i);
      if (drop >= 0){ cls[drop] = "st-out"; [L(drop), R(drop)].forEach(k => { if (k >= 0) cls[k] = "st-out"; }); }
      snap(cls, ord,
        `<b>${target} ${target < TR_V[i] ? "&lt;" : "&gt;"} ${TR_V[i]}</b> → <b>${target < TR_V[i] ? "왼쪽" : "오른쪽"}</b>으로만 갑니다. 반대쪽 가지는 <b>통째로 후보에서 제외</b> — 이진 탐색과 똑같은 원리입니다.`, "", edge);
      i = next;
    }
    return S;
  }

  let n = 0;
  const visit = i => {
    n++; out.push(TR_V[i]); ord[i] = n; cls[i] = "st-done";
    snap(cls, ord, `<b>${TR_V[i]}</b> 방문 (${n}번째). 지금까지: <b>${out.join(" → ")}</b>`);
  };
  if (trMode === "level"){
    const q = [0];
    while (q.length){
      const i = q.shift();
      cls[i] = "st-cur";
      snap(cls, ord, `큐에서 <b>${TR_V[i]}</b> 를 꺼냅니다. 자식들을 큐 뒤에 넣습니다.`);
      visit(i);
      if (L(i) >= 0) q.push(L(i));
      if (R(i) >= 0) q.push(R(i));
    }
  } else {
    const go = i => {
      if (i < 0) return;
      cls[i] = "st-cur";
      snap(cls, ord, `<b>${TR_V[i]}</b> 에 도착했습니다.`);
      if (trMode === "pre") visit(i);
      if (L(i) >= 0){ const e = {}; e[L(i)] = true; snap(cls, ord, `<b>왼쪽</b> 자식으로 내려갑니다.`, "", e); go(L(i)); }
      if (trMode === "in") visit(i);
      if (R(i) >= 0){ const e = {}; e[R(i)] = true; snap(cls, ord, `<b>오른쪽</b> 자식으로 내려갑니다.`, "", e); go(R(i)); }
      if (trMode === "post") visit(i);
    };
    go(0);
  }
  const extra = trMode === "in"
    ? " — <b>정확히 오름차순</b>입니다. 이진 탐색 트리를 중위 순회하면 항상 정렬된 결과가 나옵니다."
    : (trMode === "level" ? " — 위층부터 왼쪽→오른쪽. 큐를 쓰면 BFS 가 됩니다." : "");
  S.push({ cls:{ ...cls }, ord:{ ...ord }, out:[...out], tone:"ok", edge:{},
    note: `순회 완료: <b>${out.join(" → ")}</b>${extra}` });
  return S;
}
function trRender(s){
  const el = $("#trTree"); if (!el) return;
  if (!el.querySelector(".tn")) AVX.tree(el, TR_V.length, 2);
  AVX.treeSet(el, { vals: TR_V, cls: s.cls, ord: s.ord, edge: s.edge });
  AVX.que($("#trOut"), s.out, "아직 방문 없음");
}

/* ============================================================
   [g11] 힙 — sift-up / sift-down
   ============================================================ */
function hpGen(){
  const S = [];
  const h = [5, 9, 7, 12, 20, 15];
  const snap = (cls, note, tone) =>
    S.push({ a:[...h], cls:{ ...cls }, note, tone });
  snap({}, "최소 힙입니다. <b>부모는 항상 자식보다 작습니다</b>(전체 정렬은 아닙니다 — 그래서 빠릅니다).");
  /* push 3 */
  h.push(3);
  let i = h.length - 1;
  snap({ [i]:"st-cur" }, "새 값 <b>3</b> 을 <b>맨 끝</b>에 넣습니다. 아직 힙 규칙이 깨진 상태입니다.");
  while (i > 0){
    const p = (i - 1) >> 1;
    snap({ [i]:"st-cur", [p]:"st-cmp" }, `자신(<b>${h[i]}</b>)과 부모(<b>${h[p]}</b>)를 비교합니다.`);
    if (h[p] <= h[i]) break;
    [h[p], h[i]] = [h[i], h[p]];
    snap({ [p]:"st-cur", [i]:"st-hit" }, `부모가 더 크므로 <b>자리를 바꿔 올라갑니다</b> (sift-up).`);
    i = p;
  }
  snap({ 0:"st-done" }, "<b>3</b> 이 뿌리에 도착했습니다. 올라간 횟수는 트리 높이(<b>log N</b>)를 넘지 않습니다.", "ok");
  /* pop min */
  const mn = h[0];
  snap({ 0:"st-cur" }, `이제 <code>heappop()</code> — 최솟값 <b>${mn}</b> 을 꺼냅니다. 뿌리가 비었습니다.`);
  h[0] = h.pop();
  snap({ 0:"st-cur" }, `<b>맨 끝 값 ${h[0]}</b> 을 뿌리로 올립니다. 이제 아래로 내려보내며 자리를 찾습니다.`);
  i = 0;
  while (true){
    const l = 2 * i + 1, r = 2 * i + 2;
    let m = i;
    if (l < h.length && h[l] < h[m]) m = l;
    if (r < h.length && h[r] < h[m]) m = r;
    if (m === i) break;
    snap({ [i]:"st-cur", [l]: l < h.length ? "st-cmp" : "", [r]: r < h.length ? "st-cmp" : "" },
      `두 자식(<b>${[l, r].filter(k => k < h.length).map(k => h[k]).join(", ")}</b>) 중 <b>더 작은 쪽</b>과 비교합니다.`);
    [h[i], h[m]] = [h[m], h[i]];
    snap({ [m]:"st-cur", [i]:"st-hit" }, `자식이 더 작으므로 <b>내려갑니다</b> (sift-down).`);
    i = m;
  }
  snap({ 0:"st-done" }, `힙 규칙이 복구되었습니다. 새 최솟값은 <b>${h[0]}</b> — 꺼내기·넣기 모두 <b>O(log N)</b>.`, "ok");
  return S;
}
function hpRender(s){
  const el = $("#hpTree"); if (!el) return;
  if (!el.querySelector(".tn")) AVX.tree(el, 7, 2);
  const vals = [], cls = {};
  for (let i = 0; i < 7; i++){
    vals[i] = s.a[i] === undefined ? "" : s.a[i];
    cls[i] = s.a[i] === undefined ? "st-out" : (s.cls[i] || "");
  }
  AVX.treeSet(el, { vals, cls, ord:{}, edge:{} });
  AVX.arr($("#hpArr"), s.a.map((v, i) => ({ v, cls: s.cls[i] || "" })));
}

/* ============================================================
   [g12] 그래프 BFS / DFS
   ============================================================ */
const GR_MAP = [
  [0,0,0,0,1,0,0,0],
  [0,1,1,0,1,0,1,0],
  [0,0,1,0,0,0,1,0],
  [1,0,1,1,1,0,1,0],
  [0,0,0,0,1,0,0,0],
  [0,1,1,0,0,0,1,0],
];
const GR_S = [0, 0], GR_G = [5, 7];
let grMode = "bfs";
function grPick(k, btn){
  $$("#g12 .ctrls .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on");
  grMode = k;
  AV.reset("gr");
}
function grGen(){
  const R = GR_MAP.length, C = GR_MAP[0].length, S = [];
  const key = (r, c) => r * C + c;
  const seen = new Set([key(...GR_S)]);
  const prev = {};
  const bag = [GR_S];
  const vis = new Set();
  const snap = (o) => S.push(Object.assign({
    vis:new Set(vis), bag: bag.map(x => key(...x)), cur:-1, path:[], len:"-",
  }, o));
  snap({ note: grMode === "bfs"
    ? "<b>BFS</b> — 큐(먼저 넣은 것부터)를 씁니다. 출발점에서 <b>같은 거리인 칸들을 한 겹씩</b> 훑습니다."
    : "<b>DFS</b> — 스택(마지막에 넣은 것부터)을 씁니다. <b>한 방향으로 갈 데까지</b> 파고듭니다." });
  let found = false, guard = 0;
  while (bag.length && guard++ < 400){
    const [r, c] = grMode === "bfs" ? bag.shift() : bag.pop();
    vis.add(key(r, c));
    if (r === GR_G[0] && c === GR_G[1]){
      const path = [];
      let k = key(r, c);
      while (k !== undefined){ path.push(k); k = prev[k]; }
      snap({ cur:key(r, c), path, len: path.length - 1, tone:"ok",
        note: grMode === "bfs"
          ? `<b>도착! 경로 길이 ${path.length - 1}</b> — BFS는 <b>가까운 칸부터 한 겹씩</b> 훑으므로, 처음 도달한 순간이 곧 <b>최단 경로</b>입니다. (방문 ${vis.size}칸)`
          : `<b>도착! 경로 길이 ${path.length - 1}</b> — BFS의 <b>12</b>보다 훨씬 깁니다. DFS는 <b>먼저 파고든 방향으로 끝까지</b> 가므로, 도착하긴 해도 <b>최단이라는 보장이 전혀 없습니다</b>. 위 버튼으로 BFS와 번갈아 비교해 보세요.` });
      found = true; break;
    }
    snap({ cur:key(r, c),
      note: grMode === "bfs"
        ? `큐 <b>앞</b>에서 (${r}, ${c}) 을 꺼냈습니다. 이웃 4칸을 큐 <b>뒤</b>에 넣습니다. 대기열: ${bag.length}칸`
        : `스택 <b>위</b>에서 (${r}, ${c}) 을 꺼냈습니다. 이웃을 스택 위에 쌓습니다. 대기열: ${bag.length}칸` });
    /* 이웃을 넣는 순서 — BFS는 큐라 순서가 결과에 영향을 주지 않지만,
       DFS는 스택이라 '마지막에 넣은 방향'부터 파고들어 경로가 완전히 달라진다. */
    const DIRS = grMode === "bfs"
      ? [[-1,0],[1,0],[0,-1],[0,1]]
      : [[0,1],[0,-1],[1,0],[-1,0]];
    for (const [dr, dc] of DIRS){
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
      if (GR_MAP[nr][nc] === 1 || seen.has(key(nr, nc))) continue;
      seen.add(key(nr, nc));                      // ★ 넣을 때 즉시 방문 처리
      prev[key(nr, nc)] = key(r, c);
      bag.push([nr, nc]);
    }
  }
  if (!found) snap({ tone:"bad", note:"도착점에 갈 수 없습니다." });
  return S;
}
function grRender(s){
  const el = $("#grMaze"); if (!el) return;
  const C = GR_MAP[0].length;
  el.style.gridTemplateColumns = `repeat(${C}, auto)`;
  let html = "";
  for (let r = 0; r < GR_MAP.length; r++){
    for (let c = 0; c < C; c++){
      const k = r * C + c;
      let cls = GR_MAP[r][c] === 1 ? "wall" : "";
      if (!cls){
        if (s.path.includes(k)) cls = "path";
        else if (s.cur === k) cls = "fr";
        else if (s.vis.has(k)) cls = "vis";
        else if (s.bag.includes(k)) cls = "fr";
      }
      let t = "";
      if (r === GR_S[0] && c === GR_S[1]){ cls = "st"; t = "S"; }
      if (r === GR_G[0] && c === GR_G[1]){ cls = s.path.length ? "path" : "gl"; t = "G"; }
      html += `<div class="m ${cls}">${t}</div>`;
    }
  }
  el.innerHTML = html;
  AVX.set("#grVis", s.vis.size);
  AVX.set("#grLen", s.len);
  AVX.set("#grQ", s.bag.length);
}

/* ============================================================
   [g13] DP — 격자 경로 수
   ============================================================ */
const DP_N = 4;
function dpGen(){
  const S = [], g = Array.from({ length: DP_N }, () => Array(DP_N).fill(null));
  const snap = (o) => S.push(Object.assign({ g: g.map(r => [...r]), cur:null, src:[], note:"" }, o));
  snap({ note:`<b>${DP_N}×${DP_N}</b> 격자에서 <b>오른쪽·아래로만</b> 이동해 왼쪽 위 → 오른쪽 아래로 가는 경로의 수를 셉니다.` });
  for (let r = 0; r < DP_N; r++){
    for (let c = 0; c < DP_N; c++){
      if (r === 0 && c === 0){
        g[0][0] = 1;
        snap({ cur:[0,0], note:"출발점에 서 있는 경우의 수는 <b>1가지</b>입니다 (아무것도 안 한 상태)." });
        continue;
      }
      const up = r > 0 ? g[r-1][c] : 0, left = c > 0 ? g[r][c-1] : 0;
      const src = [];
      if (r > 0) src.push([r-1, c]);
      if (c > 0) src.push([r, c-1]);
      snap({ cur:[r,c], src, note:
        `(${r}, ${c}) 로 오는 방법은 <b>위에서 내려오기</b>(${up}가지) + <b>왼쪽에서 오기</b>(${left}가지) 뿐입니다.` });
      g[r][c] = up + left;
      snap({ cur:[r,c], src, note:
        `그래서 <b>${up} + ${left} = ${g[r][c]}</b>. 위·왼쪽 칸을 <b>다시 계산하지 않고 그대로 재사용</b>한 것 — 이게 DP입니다.` });
    }
  }
  snap({ cur:[DP_N-1, DP_N-1], done:true, tone:"ok", note:
    `정답 <b>${g[DP_N-1][DP_N-1]}가지</b>. 모든 경로를 하나씩 세면 지수 시간이지만, 표를 채우면 <b>칸 수만큼(O(N²))</b> 이면 끝납니다.` });
  return S;
}
function dpRender(s){
  const el = $("#dpTab"); if (!el) return;
  let html = "<tr><th></th>" + Array.from({length:DP_N}, (_, c) => `<th>c${c}</th>`).join("") + "</tr>";
  for (let r = 0; r < DP_N; r++){
    html += `<tr><th>r${r}</th>`;
    for (let c = 0; c < DP_N; c++){
      let cls = s.g[r][c] === null ? "" : "fill";
      if (s.src && s.src.some(([a, b]) => a === r && b === c)) cls = "src";
      if (s.cur && s.cur[0] === r && s.cur[1] === c) cls = s.done ? "res" : "cur";
      html += `<td class="${cls}">${s.g[r][c] === null ? "" : s.g[r][c]}</td>`;
    }
    html += "</tr>";
  }
  el.innerHTML = html;
}

/* --- 알고리즘 탭 초기화 (탭이 처음 열릴 때 1회) --- */
TAB_INIT.algo = function(){
  boGo(10, $("#g01 .ctrls .chip"));
  AV.make("ll", { gen: llGen, render: llRender, ms: 820 });
  AV.make("sq", { gen: sqGen, render: sqRender, ms: 900 });
  AV.make("ht", { gen: htGen, render: htRender, ms: 900 });
  AV.make("bs", { gen: bsGen, render: bsRender, ms: 900 });
  AV.make("tp", { gen: tpGen, render: tpRender, ms: 780 });
  AV.make("sw", { gen: swGen, render: swRender, ms: 780 });
  AV.make("so", { gen: soGen, render: soRender, ms: 380 });
  AV.make("rc", { gen: rcGen, render: rcRender, ms: 900 });
  AV.make("tr", { gen: trGen, render: trRender, ms: 700 });
  AV.make("hp", { gen: hpGen, render: hpRender, ms: 900 });
  AV.make("gr", { gen: grGen, render: grRender, ms: 300 });
  AV.make("dp", { gen: dpGen, render: dpRender, ms: 620 });
  /* 폭이 바뀌면 트리 좌표 재계산 */
  let rz = null;
  window.addEventListener("resize", () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      ["trTree", "hpTree"].forEach(id => { const e = $("#" + id); if (e) e.innerHTML = ""; });
      AV.draw("tr"); AV.draw("hp");
    }, 200);
  }, { passive:true });
};

