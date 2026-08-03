/* ============================================================
   28. PySide6 — 위젯 갤러리 · 이벤트 · 애니메이션
   ============================================================ */
/* 클릭 리플 (QSS 로는 못 하는 효과 — 웹 데모용 시각 피드백) */
function qRipple(e, el){
  if (document.body.classList.contains("noanim")) return;
  const r = el.getBoundingClientRect();
  const d = document.createElement("span");
  d.className = "rip";
  const size = Math.max(r.width, r.height) * 1.1;
  d.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left}px;top:${e.clientY - r.top}px`;
  el.appendChild(d);
  setTimeout(() => d.remove(), 650);
}
/* 시그널이 발화됐음을 알리는 토스트 */
let qToastEl = null, qToastT = null;
function qFire(msg){
  if (!qToastEl){
    qToastEl = document.createElement("div");
    qToastEl.className = "qtoast";
    document.body.appendChild(qToastEl);
  }
  qToastEl.textContent = `clicked ▸ ${msg} → 슬롯 실행`;
  requestAnimationFrame(() => qToastEl.classList.add("on"));
  clearTimeout(qToastT);
  qToastT = setTimeout(() => qToastEl.classList.remove("on"), 1500);
}
function qChk(el){ el.classList.toggle("on"); }
function qRad(el){
  $$("#qRadGrp .qchk").forEach(b => b.classList.toggle("on", b === el));
}
function qSlide(e, id){
  const box = $("#" + id); if (!box) return;
  const tk = box.querySelector(".tk"), r = tk.getBoundingClientRect();
  const v = Math.round(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * 100);
  tk.querySelector(".fl").style.transform = `scaleX(${v / 100})`;
  tk.querySelector(".hb").style.transform = `translate(-50%,-50%) translateX(${v}%)`;
  box.querySelector(".nv").textContent = v;
}
let qProgT = null;
function qProg(){
  clearInterval(qProgT);
  const bar = $("#qpg1"), txt = $("#qpgTxt");
  if (!bar) return;
  let v = 0;
  bar.style.transform = "scaleX(0)";
  qProgT = setInterval(() => {
    v += 4;
    bar.style.transform = `scaleX(${v / 100})`;
    if (txt) txt.textContent = v >= 100 ? "완료 ✓" : `처리 중… ${v}%`;
    if (v >= 100){
      clearInterval(qProgT);
      qFire("워커 스레드 finished 시그널");
    }
  }, 60);
}
function qCombo(el){ el.classList.toggle("open"); }
function qComboPick(e, el){
  e.stopPropagation();
  const box = el.closest(".qcb");
  box.querySelector(".lb").textContent = el.textContent;
  box.classList.remove("open");
  qFire(`currentTextChanged("${el.textContent}")`);
}
function qTab(el){
  [...el.parentNode.children].forEach(s => s.classList.toggle("on", s === el));
  const t = $("#qtabTxt");
  if (t) t.textContent = `‘${el.textContent}’ 탭 내용`;
}
function qList(el){
  [...el.parentNode.children].forEach(s => s.classList.toggle("on", s === el));
  qFire(`itemClicked("${el.textContent.trim()}")`);
}

/* 이벤트 전파 */
let qevStop = false;
function qevMode(v, btn){
  $$("#q16 .ctrls .chip").forEach(b => { if (b.parentNode === btn.parentNode) b.classList.remove("on"); });
  btn.classList.add("on");
  qevStop = v;
}
const QEV_NAMES = ["QWidget (패널)", "QMainWindow", "QApplication"];
function qevFire(e){
  if (e) e.stopPropagation();
  const layers = [...$$("#qevBox .lay")].sort((a, b) => a.dataset.l - b.dataset.l);
  layers.forEach(l => l.classList.remove("hit", "stop"));
  const n = $("#qevNote");
  const upto = qevStop ? 1 : layers.length;
  layers.slice(0, upto).forEach((l, i) => setTimeout(() => {
    const last = i === upto - 1;
    l.classList.add(last && qevStop ? "stop" : "hit");
    if (n){
      n.className = "stepnote" + (last && qevStop ? " bad" : (last ? " ok" : ""));
      n.innerHTML = `<span class="n">${i + 1} / ${upto}</span><span class="tx">` +
        (last && qevStop
          ? `<b>${QEV_NAMES[i]}</b> 에서 <code>event.accept()</code> — <b>여기서 멈춥니다.</b> 부모 위젯들은 이 클릭을 <b>아예 모릅니다</b>. 단축키가 안 먹거나 창 닫기가 안 되는 원인이 대개 이것입니다.`
          : (last
            ? `<b>${QEV_NAMES[i]}</b> 까지 올라갔습니다. 아무도 처리하지 않으면 이벤트는 <b>버려집니다</b>.`
            : `<b>${QEV_NAMES[i]}</b> 가 이벤트를 받았습니다 → 처리하지 않고(<code>ignore()</code>) <b>부모에게 넘깁니다</b>.`)) +
        `</span>`;
    }
  }, i * 620));
  setTimeout(() => layers.forEach(l => l.classList.remove("hit", "stop")), upto * 620 + 1100);
}

/* QPropertyAnimation · QEasingCurve */
const QEASE = {
  Linear:     t => t,
  InOutCubic: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  OutBack:    t => { const c1 = 1.70158, c3 = c1 + 1;
                     return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  OutBounce:  t => { const n1 = 7.5625, d1 = 2.75;
                     if (t < 1 / d1) return n1 * t * t;
                     if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + .75;
                     if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + .9375;
                     return n1 * (t -= 2.625 / d1) * t + .984375; },
};
const QEASE_TXT = {
  Linear:     "<b>Linear</b> — 처음부터 끝까지 같은 속도. 기계적이고 부자연스럽습니다. 진행률 표시처럼 <b>“정확함”이 중요한 곳</b>에만 쓰세요.",
  InOutCubic: "<b>InOutCubic</b> — 천천히 출발해 빨라졌다가 다시 천천히 멈춥니다. <b>가장 무난한 기본값</b>. 패널 열기·화면 전환에 씁니다.",
  OutBack:    "<b>OutBack</b> — 목표를 살짝 지나쳤다가 돌아옵니다. <b>“도착했다”는 느낌</b>이 강해 알림·토스트 등장에 잘 맞습니다.",
  OutBounce:  "<b>OutBounce</b> — 공처럼 튕깁니다. 눈에 잘 띄지만 <b>업무용 프로그램에는 과합니다</b> — 실패 알림 정도에만.",
};
let qEaseKind = "Linear";
function qEase(k, btn){
  if (btn) $$("#q16 .ctrls .chip").forEach(b => {
    if (b.parentNode === btn.parentNode) b.classList.remove("on");
  });
  if (btn) btn.classList.add("on");
  qEaseKind = k;
  qEaseRun();
}
function qEaseRun(){
  const obj = $("#qanimObj"), box = $("#qanimBox");
  if (!obj || !box) return;
  const dist = Math.max(40, box.clientWidth - 32 - obj.offsetWidth);
  const f = QEASE[qEaseKind] || QEASE.Linear;
  const frames = [];
  for (let i = 0; i <= 48; i++) frames.push({ transform:`translateX(${(f(i / 48) * dist).toFixed(2)}px)` });
  const noAnim = document.body.classList.contains("noanim") || REDUCED;
  obj.animate(frames, { duration: noAnim ? 1 : 950, fill:"forwards", easing:"linear" });
  const n = $("#qeaseNote");
  if (n) n.innerHTML = `<span class="n">${qEaseKind}</span><span class="tx">${QEASE_TXT[qEaseKind]}</span>`;
}

