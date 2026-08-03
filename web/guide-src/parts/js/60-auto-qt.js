/* ============================================================
   22. AUTOMATION 탭 데모
   ============================================================ */
const MS_POS = [
  {x:37, y:35, t:"moveTo(150, 90)", hit:null,
   d:'단순 이동입니다. <code>duration</code>을 주면 사람처럼 부드럽게 움직입니다.'},
  {x:17, y:25, t:"click(파일)", hit:"msB0",
   d:'해당 좌표로 이동한 뒤 클릭합니다. <b>창이 조금만 움직여도 엉뚱한 곳</b>을 누르게 됩니다.'},
  {x:65, y:71, t:"click(확인)", hit:"msB2",
   d:'대화상자의 확인 버튼. 이런 좌표는 <b>해상도가 바뀌면 전부 다시 잡아야</b> 합니다.'},
  {x:1,  y:2,  t:"moveTo(0, 0) → FAILSAFE", hit:null,
   d:'⚠️ 좌상단 (0,0)에 닿는 순간 <b>FailSafeException</b>이 발생해 스크립트가 즉시 멈춥니다. 폭주하는 자동화를 세우는 <b>비상 정지</b>입니다.'},
];
function mouseGo(i){
  const p = MS_POS[i], cur = $("#msCur");
  cur.style.left = p.x + "%"; cur.style.top = p.y + "%";
  $$("#msScreen .btn").forEach(b => b.classList.remove("hit"));
  $("#msCoord").textContent = `(${Math.round(p.x*19.2)}, ${Math.round(p.y*12)})`;
  if (p.hit) setTimeout(() => $("#"+p.hit).classList.add("hit"), 820);
  $("#msDesc").innerHTML = `<code style="color:var(--cyan)">pyautogui.${p.t}</code> — ${p.d}`;
}
function mouseTour(){ MS_POS.forEach((_,i) => setTimeout(() => mouseGo(i), i*1500)); }

const CT_NODES = [
  {ind:0, label:'Dialog — "급여관리 시스템"', code:'app.window(title_re=".*급여관리.*")'},
  {ind:1, label:'Pane — "메인패널"', code:'  .child_window(auto_id="pnlMain")'},
  {ind:2, label:'Group — "조회조건"', code:'  .child_window(title="조회조건")'},
  {ind:3, label:'Edit — auto_id="txtDate"', code:'  .child_window(auto_id="txtDate")'},
  {ind:3, label:'Button — "조회"  auto_id="btnSearch"', code:'  .child_window(auto_id="btnSearch")', target:true},
];
function ctReset(){
  $("#ctTree").innerHTML = CT_NODES.map((n,i) =>
    `<div><span class="ind">${"│  ".repeat(n.ind)}${n.ind?"└─ ":""}</span><span class="n dim" id="ctn${i}">${n.label}</span></div>`).join("");
  setCode("#ctCode", 'win.print_control_identifiers()   # 먼저 트리를 출력해 보세요');
  $("#ctDesc").innerHTML = '재생을 누르면 루트부터 목표 컨트롤까지 내려갑니다.';
}
function ctPlay(){
  ctReset();
  let acc = "";
  CT_NODES.forEach((n,i) => setTimeout(() => {
    const el = $("#ctn"+i);
    el.classList.remove("dim"); el.classList.add("on");
    acc += (i ? "\n" : "") + n.code;
    setCode("#ctCode", acc + (n.target ? "\n  .click()" : ""));
    if (n.target){
      $("#ctDesc").innerHTML = '<b>도달!</b> 좌표를 전혀 쓰지 않았습니다. 창이 움직이거나 해상도가 바뀌어도 <b>이 경로는 그대로 유효</b>합니다. 이것이 컨트롤 기반 자동화의 힘입니다.';
    } else {
      $("#ctDesc").innerHTML = `깊이 ${n.ind} 로 내려가는 중… <b>${n.label.split("—")[0].trim()}</b>`;
    }
  }, i * 800));
}

TAB_INIT.auto = function(){ mouseGo(0); ctReset(); };

/* ============================================================
   23. PYSIDE6 탭 데모
   ============================================================ */
const LAY = {
  v:{ title:"QVBoxLayout", style:"flex-direction:column",
      items:[["파일 선택",""],["옵션",""],["실행","acc"]],
      c:'lay = QVBoxLayout(self)\nlay.addWidget(btn1)\nlay.addWidget(btn2)\nlay.addWidget(btn3)',
      d:'<b>위에서 아래로</b> 차곡차곡 쌓습니다. 가장 많이 쓰는 기본 레이아웃입니다.' },
  h:{ title:"QHBoxLayout", style:"flex-direction:row",
      items:[["이전",""],["현재","acc"],["다음",""]],
      c:'lay = QHBoxLayout(self)\nlay.addWidget(btn1)\nlay.addWidget(btn2)\nlay.addWidget(btn3)',
      d:'<b>왼쪽에서 오른쪽으로</b> 나열합니다. 버튼 줄, 툴바에 씁니다.' },
  g:{ title:"QGridLayout", grid:"repeat(3,1fr)",
      items:[["1",""],["2",""],["3",""],["4",""],["5","acc"],["6",""]],
      c:'lay = QGridLayout(self)\nlay.addWidget(w1, 0, 0)   # (행, 열)\nlay.addWidget(w2, 0, 1)\nlay.addWidget(w5, 1, 1)\nlay.addWidget(w7, 2, 0, 1, 3)  # 3칸 병합',
      d:'<b>행·열 좌표</b>로 배치합니다. 계산기·입력 폼처럼 격자 형태 화면에 적합합니다.' },
  f:{ title:"QFormLayout", grid:"auto 1fr",
      items:[["이름:","lbl"],["입력창",""],["부서:","lbl"],["콤보박스",""],["기간:","lbl"],["날짜선택","acc"]],
      c:'lay = QFormLayout(self)\nlay.addRow("이름:", self.name_edit)\nlay.addRow("부서:", self.dept_combo)\nlay.addRow("기간:", self.date_edit)',
      d:'<b>라벨 + 입력창</b> 쌍을 자동 정렬합니다. 설정 화면·입력 폼을 만들 때 코드가 절반으로 줄어듭니다.' },
  s:{ title:"Stretch 비율", style:"flex-direction:row",
      items:[["1",""],["2 (stretch=2)","acc"],["1",""]],
      stretch:[1,2,1],
      c:'lay = QHBoxLayout(self)\nlay.addWidget(w1, 1)\nlay.addWidget(w2, 2)   # 2배 넓게\nlay.addWidget(w3, 1)\n\n# 오른쪽 정렬하고 싶을 때\nlay.addStretch()      # 빈 공간을 밀어넣기\nlay.addWidget(btn)',
      d:'<b>stretch 값의 비율</b>대로 남는 공간을 나눠 가집니다. 창 크기를 바꿔도 비율이 유지됩니다.' },
};
function layGo(k, btn){
  $$("#q04 .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on");
  const L = LAY[k], canvas = $("#layCanvas");
  $("#layTitle").textContent = L.title;
  flip(canvas, () => {
    canvas.style.cssText = L.grid
      ? `padding:14px;display:grid;grid-template-columns:${L.grid};gap:9px;min-height:150px`
      : `padding:14px;display:flex;${L.style};gap:9px;min-height:150px`;
    canvas.innerHTML = L.items.map(([t,c],i) => {
      const fx = L.stretch ? `flex:${L.stretch[i]}` : (L.style ? "flex:1" : "");
      const isLbl = c === "lbl";
      return `<div class="qw ${isLbl?"":c}" data-flip="ly${i}"
        style="${fx};${isLbl?"background:none;border:none;color:var(--dim);justify-items:end":""}">${t}</div>`;
    }).join("");
  }, 560);
  setCode("#layCode", L.c);
  $("#layDesc").innerHTML = L.d;
}

function sigPlay(){
  const nodes = ["#sgA","#sgB","#sgC","#sgD"], dots = ["#sgD1","#sgD2","#sgD3"];
  nodes.forEach(n => $(n).classList.remove("fire"));
  dots.forEach(d => $(d).classList.remove("go"));
  const msgs = [
    '사용자가 <b>버튼을 눌렀습니다.</b>',
    'Qt가 <code>clicked</code> <b>시그널을 발신</b>합니다 — 받는 쪽이 누군지는 모릅니다.',
    'connect로 연결된 <b>슬롯 함수가 실행</b>됩니다.',
    '슬롯이 <code>setText()</code>로 <b>화면을 갱신</b>합니다.',
  ];
  nodes.forEach((n,i) => setTimeout(() => {
    nodes.forEach(x => $(x).classList.remove("fire"));
    $(n).classList.add("fire");
    if (i < 3) { void $(dots[i]).offsetWidth; $(dots[i]).classList.add("go"); }
    $("#sigDesc").innerHTML = msgs[i];
    if (i === 3) setTimeout(() => {
      $("#sigDesc").innerHTML = '버튼은 <b>누가 받는지 모른 채</b> 신호만 보냅니다. 이 느슨한 결합 덕분에 UI와 로직을 따로 바꿀 수 있습니다.';
    }, 1600);
  }, i * 1000));
}

let freezeRaf = null;
function freezeRun(kind){
  cancelAnimationFrame(freezeRaf);
  $$("#q07 .chip").forEach((b,i) => b.classList.toggle("on", i === (kind === "bad" ? 0 : 1)));
  const isBad = kind === "bad";
  const spin = $(isBad ? "#spinBad" : "#spinGood");
  const bar  = $(isBad ? "#barBad" : "#barGood");
  const msg  = $(isBad ? "#badMsg" : "#goodMsg");
  const other = $(isBad ? "#spinGood" : "#spinBad");
  const otherBar = $(isBad ? "#barGood" : "#barBad");
  const otherMsg = $(isBad ? "#goodMsg" : "#badMsg");

  other.classList.remove("run"); otherBar.style.transform = "scaleX(0)"; otherMsg.textContent = "대기 중";
  bar.style.transform = "scaleX(0)";

  if (isBad){
    spin.classList.remove("run");                   // 멈춘 스피너 = 프리즈
    msg.innerHTML = '<span style="color:var(--rose)">응답 없음 (Not Responding)</span>';
    $("#freezeDesc").innerHTML = '메인 스레드가 계산에 붙잡혀 <b>화면을 다시 그릴 기회가 없습니다.</b> 스피너가 멈추고 창을 움직일 수도 없습니다. 진행률도 <b>끝나야 한 번에</b> 갱신됩니다.';
    setTimeout(() => {
      bar.style.transform = "scaleX(1)";
      msg.innerHTML = '<span style="color:var(--amber)">2.4초 만에 한 번에 완료</span>';
    }, 2400);
  } else {
    spin.classList.add("run");
    $("#freezeDesc").innerHTML = '작업이 <b>별도 스레드</b>에서 돌기 때문에 UI는 계속 반응합니다. 워커가 <code>progress</code> 시그널을 보내면 메인 스레드가 진행률을 그립니다. <b>중단 버튼도 누를 수 있습니다.</b>';
    let p = 0;
    const t0 = performance.now();
    const loop = () => {
      p = Math.min(100, (performance.now() - t0) / 24);
      bar.style.transform = "scaleX(" + (p / 100) + ")";
      msg.textContent = `처리 중… ${Math.round(p)}%`;
      if (p < 100) freezeRaf = requestAnimationFrame(loop);
      else { spin.classList.remove("run"); msg.innerHTML = '<span style="color:var(--green)">완료 — UI는 계속 살아 있었습니다</span>'; }
    };
    loop();
  }
}

TAB_INIT.qt = function(){
  layGo("v", $$("#q04 .chip")[0]);
  sigPlay();
  qEaseRun();                                   // §16 애니메이션 데모 초기 상태
  const ab = $("#qanimBox");
  if (ab) new IntersectionObserver((es, o) => es.forEach(e => {
    if (e.isIntersecting){ qEaseRun(); o.disconnect(); }
  }), { threshold:.5 }).observe(ab);
};

