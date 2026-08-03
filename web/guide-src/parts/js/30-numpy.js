/* ============================================================
   18. NumPy 데모
   ============================================================ */
/* --- 공통: 배열 그리드 렌더 --- */
function ndGrid(vals, cols, cls = "", flipPrefix = null){
  const cells = vals.map((v, i) => {
    const f = flipPrefix ? ` data-flip="${flipPrefix}${v.k ?? i}"` : "";
    const c = typeof v === "object" ? (v.c || "") : "";
    const t = typeof v === "object" ? v.v : v;
    return `<div class="cell ${cls} ${c}"${f}>${t}</div>`;
  }).join("");
  return `<div class="nd" style="grid-template-columns:repeat(${cols},auto)">${cells}</div>`;
}

/* --- N01 메모리 구조 --- */
function memGo(kind, btn){
  $$("#n01 .chip").forEach(b => b.classList.remove("on"));
  btn.classList.add("on");
  const box = $("#memBox");
  if (kind === "list"){
    box.innerHTML = `
      <div class="memrow" style="margin-bottom:10px">
        ${[0,1,2,3,4].map(i => `<div class="blk ptr">ptr→</div>`).join("")}
      </div>
      <div style="text-align:center;color:var(--dim-2);font-family:var(--mono);font-size:11px;margin-bottom:6px">
        리스트는 '주소'만 보관 · 실제 객체는 메모리 곳곳에 흩어짐</div>
      <div class="scatter">
        ${[[6,10],[38,52],[62,8],[15,66],[82,38]].map((p,i) =>
          `<div class="obj fu" style="left:${p[0]}%;top:${p[1]}%;animation-delay:${i*.08}s">${i*3+1}</div>`).join("")}
      </div>`;
    $("#memDesc").innerHTML = '값 하나를 읽을 때마다 <b>주소를 따라 메모리 여기저기를 점프</b>합니다. CPU 캐시가 전혀 안 먹혀서 느립니다.';
  } else {
    box.innerHTML = `
      <div class="memrow" style="margin:36px 0 14px">
        ${[1,4,7,10,13,16,19,22].map((v,i) =>
          `<div class="blk contig fu" style="animation-delay:${i*.06}s">${v}</div>`).join("")}
      </div>
      <div style="text-align:center;color:var(--cyan);font-family:var(--mono);font-size:11.5px">
        ← 연속된 메모리 블록 (int64 × 8 = 64 bytes) →</div>
      <div style="text-align:center;color:var(--dim-2);font-family:var(--mono);font-size:11px;margin-top:8px">
        시작주소 + (인덱스 × 8) 로 <b style="color:var(--ink-2)">계산 한 번에</b> 접근</div>`;
    $("#memDesc").innerHTML = '모든 값이 <b>같은 크기로 나란히</b> 있어 주소 계산만으로 접근합니다. C 루프 + CPU 캐시 + SIMD가 모두 동작합니다.';
  }
}

/* --- N02 생성 함수 --- */
const MK = [
  { n:"np.arange(8)", cols:8, v:[0,1,2,3,4,5,6,7],
    c:'np.arange(8)\n# array([0, 1, 2, 3, 4, 5, 6, 7])',
    d:'0부터 시작해 1씩 증가하는 정수 수열. 파이썬 <code>range()</code>의 배열 버전입니다.' },
  { n:"np.zeros((2,4))", cols:4, v:["0.","0.","0.","0.","0.","0.","0.","0."],
    c:'np.zeros((2, 4))\n# 2행 4열 실수 0 배열',
    d:'결과를 담을 <b>빈 그릇</b>을 미리 만들 때 씁니다. 크기를 튜플로 넘기는 것에 주의하세요.' },
  { n:"np.ones((2,4))", cols:4, v:["1.","1.","1.","1.","1.","1.","1.","1."],
    c:'np.ones((2, 4)) * 5\n# 전부 5인 배열을 만드는 흔한 방법',
    d:'가중치 초기화나 마스크 만들 때 자주 씁니다.' },
  { n:"np.eye(4)", cols:4, v:[
      {v:1,c:"hot"},0,0,0, 0,{v:1,c:"hot"},0,0, 0,0,{v:1,c:"hot"},0, 0,0,0,{v:1,c:"hot"}],
    c:'np.eye(4)\n# 단위행렬 — 대각선만 1',
    d:'선형대수에서 “아무것도 안 바꾸는 행렬”입니다. <code>A @ I == A</code>.' },
  { n:"np.linspace(0,1,5)", cols:5, v:["0.","0.25","0.5","0.75","1."],
    c:'np.linspace(0, 1, 5)\n# 0부터 1까지 5개로 균등 분할 (양 끝 포함)',
    d:'그래프 x축을 만들 때 필수입니다. <b>개수</b>를 지정한다는 점이 arange와 다릅니다.' },
  { n:"rng.integers(1,7,8)", cols:8, v:[3,6,1,4,2,5,6,2],
    c:'rng = np.random.default_rng(42)\nrng.integers(1, 7, 8)   # 주사위 8번',
    d:'seed를 주면 <b>실행할 때마다 같은 난수</b>가 나와 실험 재현이 가능합니다.' },
];
(function mkInit(){
  $("#mkChips").innerHTML = MK.map((m,i) =>
    `<button class="chip${i===0?' on':''}" onclick="mkGo(${i},this)">${m.n}</button>`).join("");
})();
function mkGo(i, btn){
  $$("#mkChips .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on");
  const m = MK[i];
  $("#mkView").innerHTML = ndGrid(m.v, m.cols, "sm");
  $$("#mkView .cell").forEach((c,k) => { c.classList.add("fu"); c.style.animationDelay = (k*.03)+"s"; });
  setCode("#mkCode", m.c);
  $("#mkDesc").innerHTML = m.d;
}

/* --- N03 차원 --- */
function dimGo(n, btn){
  $$("#n03 .chip").forEach(b => b.classList.remove("on"));
  btn.classList.add("on");
  const v = $("#dimView");
  if (n === 1){
    v.innerHTML = ndGrid([1,2,3,4,5], 5, "sm");
    setCode("#dimCode", 'a = np.array([1, 2, 3, 4, 5])\na.shape   # (5,)\na.ndim    # 1');
    $("#dimDesc").innerHTML = '<b>1차원 = 벡터</b>. shape이 <code>(5,)</code>인 이유는 “축이 하나뿐”이라는 표시입니다. 콤마를 빼먹지 마세요.';
  } else if (n === 2){
    v.innerHTML = ndGrid([1,2,3,4,5,6,7,8,9,10,11,12], 4, "sm");
    setCode("#dimCode", 'a = np.arange(1,13).reshape(3, 4)\na.shape   # (3, 4)  행 3, 열 4\na.ndim    # 2');
    $("#dimDesc").innerHTML = '<b>2차원 = 행렬</b>. 표 데이터, 흑백 이미지, 엑셀 시트가 전부 여기 해당합니다. 판다스 DataFrame의 속살이기도 합니다.';
  } else {
    v.innerHTML = `<div style="display:flex;gap:26px;align-items:center;flex-wrap:wrap;justify-content:center">
      ${[0,1].map(k => `<div style="text-align:center">
        ${ndGrid([1,2,3,4,5,6].map(x => x + k*6), 3, "sm")}
        <div class="axlabel" style="margin-top:7px">[${k}]</div></div>`).join("")}
    </div>`;
    setCode("#dimCode", 'a = np.arange(1,13).reshape(2, 2, 3)\na.shape   # (2, 2, 3)\na.ndim    # 3');
    $("#dimDesc").innerHTML = '<b>3차원 = 텐서</b>. 컬러 이미지 <code>(높이, 너비, RGB)</code>, 시계열 배치 <code>(배치, 시점, 변수)</code>가 대표적입니다.';
  }
  $$("#dimView .cell").forEach((c,k) => { c.classList.add("fu"); c.style.animationDelay = (k*.03)+"s"; });
}

/* --- N04 슬라이싱 --- */
const SLI = [
  { c:'a[0]',       f:(r,c) => r===0,
    o:'array([0, 1, 2, 3])',
    d:'행 인덱스만 주면 <b>그 행 전체</b>가 1차원 배열로 나옵니다.' },
  { c:'a[:, 1]',    f:(r,c) => c===1,
    o:'array([1, 5, 9])',
    d:'콤마 앞은 행, 뒤는 열. <code>:</code>은 “전부”라는 뜻이라 <b>1열 전체</b>가 나옵니다.' },
  { c:'a[1, 2]',    f:(r,c) => r===1 && c===2,
    o:'6',
    d:'행·열을 하나씩 지정하면 <b>값 하나(스칼라)</b>. <code>a[1][2]</code>보다 이 표기가 빠릅니다.' },
  { c:'a[1:, 2:]',  f:(r,c) => r>=1 && c>=2,
    o:'array([[ 6,  7],\n       [10, 11]])',
    d:'행·열 모두 슬라이스하면 <b>부분 행렬</b>이 나옵니다. 결과는 <b>view</b>입니다.' },
  { c:'a[::2]',     f:(r,c) => r%2===0,
    o:'array([[ 0,  1,  2,  3],\n       [ 8,  9, 10, 11]])',
    d:'세 번째 값은 간격. 2칸씩 건너뛰어 0행, 2행만 가져옵니다.' },
  { c:'a[:, ::-1]', f:(r,c) => true,
    o:'열 순서가 뒤집힘\narray([[ 3,  2,  1,  0], ...])',
    d:'음수 간격은 <b>뒤집기</b>. 이미지 좌우 반전 같은 데 그대로 쓰입니다.' },
  { c:'a[-1, -1]',  f:(r,c) => r===2 && c===3,
    o:'11',
    d:'음수는 뒤에서부터. 마지막 행의 마지막 열입니다.' },
];
(function sliInit(){
  $("#sliChips").innerHTML = SLI.map((s,i) =>
    `<button class="chip${i===0?' on':''}" onclick="sliGo(${i},this)">${s.c}</button>`).join("");
})();
function sliGo(i, btn){
  $$("#sliChips .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on");
  const s = SLI[i];
  const cells = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++)
    cells.push({ v: r*4+c, c: s.f(r,c) ? "hot" : "ghost" });
  $("#sliView").innerHTML = ndGrid(cells, 4) +
    `<div class="axlabel" style="margin-top:10px">a = np.arange(12).reshape(3, 4)</div>`;
  setCode("#sliCode", s.c);
  $("#sliOut").textContent = s.o;
  $("#sliDesc").innerHTML = s.d;
}

/* --- N05 reshape --- */
const RS = {
  "1x12":{ cols:12, ord:[...Array(12).keys()],
    c:'a = np.arange(12)\na.shape   # (12,)',
    d:'원본 1차원 배열입니다. 값 12개는 메모리에 <b>0~11 순서 그대로</b> 누워 있습니다.' },
  "3x4":{ cols:4, ord:[...Array(12).keys()],
    c:'a.reshape(3, 4)',
    d:'같은 값을 <b>4개씩 끊어</b> 3줄로 배치했습니다. 메모리 순서는 그대로고 <b>읽는 방식만</b> 바뀌었습니다.' },
  "4x3":{ cols:3, ord:[...Array(12).keys()],
    c:'a.reshape(4, 3)\na.reshape(4, -1)   # -1은 알아서 계산',
    d:'3개씩 끊어 4줄로. 여전히 값의 순서는 0,1,2,… 그대로입니다.' },
  "2x6":{ cols:6, ord:[...Array(12).keys()],
    c:'a.reshape(2, 6)',
    d:'6개씩 끊어 2줄로. reshape은 <b>size(12)만 맞으면</b> 어떤 조합이든 가능합니다.' },
  "6x2":{ cols:2, ord:[...Array(12).keys()],
    c:'a.reshape(6, 2)',
    d:'2개씩 끊어 6줄로. <code>a.reshape(5,3)</code>은 15≠12이라 에러가 납니다.' },
  "T":{ cols:3, ord:[0,4,8,1,5,9,2,6,10,3,7,11],
    c:'a.reshape(3, 4).T\n# 또는 np.transpose(a)',
    d:'<b>전치는 다릅니다</b> — 값의 <b>순서 자체가 재배치</b>됩니다. 0 다음에 4가 오는 걸 보세요. 행과 열이 맞바뀐 것입니다.' },
};
function rsGo(k, btn){
  $$("#n05 .chip").forEach(b => b.classList.remove("on"));
  btn.classList.add("on");
  const s = RS[k];
  flip($("#rsView"), () => {
    $("#rsView").innerHTML = `<div class="nd" style="grid-template-columns:repeat(${s.cols},auto)">` +
      s.ord.map(v => `<div class="cell ${k==="T"?"hot":""}" data-flip="rs${v}">${v}</div>`).join("") +
      `</div>`;
  }, 750);
  setCode("#rsCode", s.c);
  $("#rsDesc").innerHTML = s.d;
}

/* --- N06 concatenate --- */
function catGo(axis, btn){
  $$("#n06 .chip").forEach(b => b.classList.remove("on"));
  btn.classList.add("on");
  const A = [[1,2],[3,4]], B = [[5,6],[7,8]];
  let cells, cols;
  if (axis === 0){ cells = [1,2,3,4,5,6,7,8].map(v => ({v, c: v>4?"res":"hot"})); cols = 2; }
  else { cells = [1,2,5,6,3,4,7,8].map(v => ({v, c: v>4?"res":"hot"})); cols = 4; }
  flip($("#catView"), () => {
    $("#catView").innerHTML = `<div class="nd" style="grid-template-columns:repeat(${cols},auto)">` +
      cells.map(o => `<div class="cell ${o.c}" data-flip="ct${o.v}">${o.v}</div>`).join("") +
      `</div><div class="axlabel" style="margin-top:12px">결과 shape: ${axis===0?"(4, 2)":"(2, 4)"}</div>`;
  }, 700);
  setCode("#catCode",
    axis === 0
      ? 'np.concatenate([a, b], axis=0)\n# = np.vstack([a, b])\n# (2,2) + (2,2) -> (4,2)  세로로 쌓임'
      : 'np.concatenate([a, b], axis=1)\n# = np.hstack([a, b])\n# (2,2) + (2,2) -> (2,4)  가로로 붙음');
}

/* --- N07 브로드캐스팅 --- */
const BC = {
  scalar:{
    build(){
      const A = [1,2,3,4,5,6,7,8,9];
      return `${ndGrid(A, 3, "sm")}
        <div class="eq">+</div>
        <div style="text-align:center">
          <div class="cell sm hot" style="margin:0 auto">10</div>
          <div class="axlabel" style="margin-top:6px">스칼라</div>
        </div>
        <div class="eq">→</div>
        <div style="text-align:center">
          ${ndGrid(Array(9).fill({v:10, c:"ghost"}), 3, "sm")}
          <div class="axlabel" style="margin-top:6px">늘어난 것처럼</div>
        </div>
        <div class="eq">=</div>
        ${ndGrid(A.map(v => ({v: v+10, c:"res"})), 3, "sm")}`;
    },
    c:'a = np.arange(1,10).reshape(3,3)\na + 10\n# 모든 원소에 10이 더해짐',
    d:'가장 단순한 브로드캐스팅. 스칼라 하나가 <b>배열 전체 모양으로 퍼집니다</b>. 실제로 9개를 복사하지는 않습니다.' },
  row:{
    build(){
      const A = [1,2,3,4,5,6,7,8,9], b = [10,20,30];
      return `${ndGrid(A, 3, "sm")}
        <div class="eq">+</div>
        <div style="text-align:center">
          ${ndGrid(b.map(v => ({v, c:"hot"})), 3, "sm")}
          <div class="axlabel" style="margin-top:6px">shape (3,)</div>
        </div>
        <div class="eq">→</div>
        <div style="text-align:center">
          ${ndGrid([...b,...b,...b].map(v => ({v, c:"ghost"})), 3, "sm")}
          <div class="axlabel" style="margin-top:6px">3행으로 복제</div>
        </div>
        <div class="eq">=</div>
        ${ndGrid(A.map((v,i) => ({v: v + b[i%3], c:"res"})), 3, "sm")}`;
    },
    c:'a = np.arange(1,10).reshape(3,3)   # (3,3)\nb = np.array([10, 20, 30])         # (3,)\na + b\n# 뒤에서부터: 3==3 ✅ , 앞은 없으니 1로 간주 -> 3으로 확장',
    d:'1차원 배열이 <b>각 행마다 반복 적용</b>됩니다. “열마다 다른 값을 더한다”가 필요할 때 이 형태입니다.' },
  col:{
    build(){
      const c = [1,2,3], r = [10,20,30];
      const res = [];
      c.forEach(x => r.forEach(y => res.push(x*y)));
      return `<div style="text-align:center">
          ${ndGrid(c.map(v => ({v, c:"hot"})), 1, "sm")}
          <div class="axlabel" style="margin-top:6px">(3, 1)</div></div>
        <div class="eq">×</div>
        <div style="text-align:center">
          ${ndGrid(r.map(v => ({v, c:"hot"})), 3, "sm")}
          <div class="axlabel" style="margin-top:6px">(1, 3)</div></div>
        <div class="eq">=</div>
        <div style="text-align:center">
          ${ndGrid(res.map(v => ({v, c:"res"})), 3, "sm")}
          <div class="axlabel" style="margin-top:6px">(3, 3) — 양쪽 다 확장!</div></div>`;
    },
    c:'c = np.array([1,2,3])[:, None]   # (3,1)\nr = np.array([10,20,30])[None, :]  # (1,3)\nc * r                              # (3,3)\n\n# 구구단 표도 이 원리\nnp.arange(1,10)[:,None] * np.arange(1,10)',
    d:'양쪽 모두 1인 축이 있어 <b>둘 다 확장</b>됩니다. 입력은 3+3=6개인데 결과는 9개. 거리 행렬·구구단·외적이 전부 이 패턴입니다.' },
  bad:{
    build(){
      return `${ndGrid([...Array(12).keys()], 4, "sm")}
        <div class="eq" style="color:var(--rose)">+</div>
        <div style="text-align:center">
          ${ndGrid([1,2,3].map(v => ({v, c:"hot"})), 3, "sm")}
          <div class="axlabel" style="margin-top:6px;color:var(--rose)">(3,)</div></div>
        <div class="eq" style="color:var(--rose)">=</div>
        <div style="text-align:center;color:var(--rose);font-family:var(--mono);font-size:26px">❌</div>`;
    },
    c:'a = np.arange(12).reshape(3,4)   # (3,4)\nb = np.array([1,2,3])            # (3,)\na + b\n\n# ValueError: operands could not be broadcast\n#             together with shapes (3,4) (3,)\n\n# 해결: 축을 세워준다\na + b[:, None]     # (3,1) -> ✅ (3,4)',
    d:'뒤에서부터 비교하면 <b>4 vs 3</b> — 같지도 않고 1도 아니라 실패합니다. <code>b[:, None]</code>으로 <b>(3,1)</b>을 만들어 주면 해결됩니다.' },
};
function bcGo(k, btn){
  $$("#n07 .chip").forEach(b => b.classList.remove("on"));
  btn.classList.add("on");
  $("#bcView").innerHTML = BC[k].build();
  $$("#bcView .cell").forEach((c,i) => { c.classList.add("fu"); c.style.animationDelay = (i*.025)+"s"; });
  setCode("#bcCode", BC[k].c);
  $("#bcDesc").innerHTML = BC[k].d;
}

/* --- N09 axis --- */
function axGo(mode, btn){
  $$("#n09 .chip").forEach(b => b.classList.remove("on"));
  btn.classList.add("on");
  const M = [[0,1,2,3],[4,5,6,7],[8,9,10,11]];
  const colSum = [12,15,18,21], rowSum = [6,22,38];
  let html = "";

  if (mode === "none"){
    html = `<div style="text-align:center">
      ${ndGrid(M.flat().map(v => ({v, c:"hot"})), 4, "sm")}
      <div class="arrow down" style="margin:10px 0">↓</div>
      <div class="cell res" style="margin:0 auto;width:76px">66</div>
      <div class="axlabel" style="margin-top:8px">결과 shape: () — 스칼라</div></div>`;
    setCode("#axCode", 'a = np.arange(12).reshape(3,4)\na.sum()      # 66\n# 모든 축이 사라져 값 하나만 남음');
    $("#axDesc").innerHTML = 'axis를 주지 않으면 <b>모든 축이 사라져</b> 값 하나가 됩니다.';
  }
  else if (mode === 0){
    html = `<div style="text-align:center">
      <div class="axlabel" style="margin-bottom:8px;color:var(--violet)">↓ ↓ ↓ ↓ &nbsp; 각 열을 세로로 훑으며 뭉갬</div>
      ${ndGrid(M.flat().map(v => ({v, c:"hot"})), 4, "sm")}
      <div style="margin:8px 0;color:var(--violet);font-size:20px">↓ &nbsp; ↓ &nbsp; ↓ &nbsp; ↓</div>
      ${ndGrid(colSum.map(v => ({v, c:"res"})), 4, "sm")}
      <div class="axlabel" style="margin-top:8px">결과 shape: (4,) — 행(3)이 사라짐</div></div>`;
    setCode("#axCode", 'a.sum(axis=0)\n# array([12, 15, 18, 21])\n# (3,4) 에서 0번째 축(3)이 사라져 (4,)');
    $("#axDesc").innerHTML = '<b>axis=0 = 행 방향으로 뭉갠다</b>. 결과는 <b>열별 합계</b>입니다. 판다스에서 <code>df.sum()</code>이 열 합계인 이유가 바로 이것(기본값 axis=0)입니다.';
  }
  else {
    html = `<div style="display:flex;align-items:center;gap:14px;justify-content:center;flex-wrap:wrap">
      <div style="text-align:center">
        ${ndGrid(M.flat().map(v => ({v, c:"hot"})), 4, "sm")}
        <div class="axlabel" style="margin-top:8px">a (3, 4)</div></div>
      <div style="color:var(--violet);font-size:20px;line-height:2.2">→<br>→<br>→</div>
      <div style="text-align:center">
        ${ndGrid(rowSum.map(v => ({v, c:"res"})), 1, "sm")}
        <div class="axlabel" style="margin-top:8px">결과 (3,)</div></div>
    </div>
    <div class="axlabel" style="margin-top:12px;text-align:center">열(4)이 사라짐</div>`;
    setCode("#axCode", 'a.sum(axis=1)\n# array([ 6, 22, 38])\n# (3,4) 에서 1번째 축(4)이 사라져 (3,)');
    $("#axDesc").innerHTML = '<b>axis=1 = 열 방향으로 뭉갠다</b>. 결과는 <b>행별 합계</b>입니다. “한 사람의 여러 과목 총점” 같은 계산이 여기 해당합니다.';
  }
  $("#axView").innerHTML = html;
  $$("#axView .cell").forEach((c,i) => { c.classList.add("fu"); c.style.animationDelay = (i*.025)+"s"; });
}

/* --- N10 불리언 마스킹 --- */
function bmRender(){
  const th = +$("#bmRange").value;
  $("#bmVal").textContent = th;
  const a = [...Array(12).keys()];
  const keep = a.filter(v => v > th);

  $("#bmView").innerHTML = `
    <div style="text-align:center">
      <div class="axlabel" style="margin-bottom:7px">a = np.arange(12)</div>
      ${ndGrid(a.map(v => ({v, c: v > th ? "hot" : "ghost"})), 12, "sm")}
    </div>
    <div style="text-align:center">
      <div class="axlabel" style="margin-bottom:7px">mask = a &gt; ${th}</div>
      <div class="nd" style="grid-template-columns:repeat(12,auto)">
        ${a.map(v => `<div class="cell sm ${v>th?'hot':'ghost'}" style="font-size:10.5px">${v>th?'T':'F'}</div>`).join("")}
      </div>
    </div>
    <div style="text-align:center">
      <div class="axlabel" style="margin-bottom:7px;color:var(--green)">a[mask] → shape (${keep.length},)</div>
      <div class="nd" style="grid-template-columns:repeat(${Math.max(keep.length,1)},auto)">
        ${keep.length ? keep.map(v => `<div class="cell sm res" data-flip="bm${v}">${v}</div>`).join("")
                      : `<div class="cell sm ghost" style="width:auto;padding:0 14px">빈 배열</div>`}
      </div>
    </div>`;
  setCode("#bmCode",
`mask = a > ${th}          # bool 배열 (T/F ${a.filter(v=>v>th).length}개 True)
a[mask]              # -> ${keep.length}개 원소만 추출

# 한 줄로
a[a > ${th}]

# 개수만 세기 (True = 1)
(a > ${th}).sum()        # ${keep.length}`);
}

/* --- N12 속도 레이스 --- */
function npRaceRun(){
  const bars = [["#nr1", 100, "≈ 420 ms"], ["#nr2", 62, "≈ 260 ms"], ["#nr3", 2, "≈ 4 ms"]];
  bars.forEach(([s]) => { $(s).style.width = "0"; $(s).textContent = ""; });
  setTimeout(() => bars.forEach(([s, w, l], i) => setTimeout(() => {
    $(s).style.width = w + "%"; $(s).textContent = l;
  }, i * 220)), 60);
}

/* --- NumPy 초기화 --- */
TAB_INIT.numpy = function(){
  memGo("list", $$("#n01 .chip")[0]);
  mkGo(0, $$("#mkChips .chip")[0]);
  dimGo(2, $$("#n03 .chip")[1]);
  sliGo(0, $$("#sliChips .chip")[0]);
  rsGo("1x12", $$("#n05 .chip")[0]);
  catGo(0, $$("#n06 .chip")[0]);
  bcGo("scalar", $$("#n07 .chip")[0]);
  axGo(0, $$("#n09 .chip")[1]);
  bmRender();
  npRaceRun();
  $("#bmRange").addEventListener("input", bmRender);
};

