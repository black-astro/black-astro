/* ============================================================
   23.5 TOOLBOX 탭 — 난이도 필터 + 도구 추천기
   ============================================================ */
const TB_LABEL = { e:"🟢 기초", m:"🟡 중급", h:"🔴 고급" };
function tbFilter(lvl, btn){
  $$("#tbbar .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on");
  let shown = 0, total = 0;
  $$("#pane-toolbox section.sec").forEach(s => {
    if (!s.dataset.lvl) { s.style.display = ""; return; }  // 지도·추천기는 항상
    total++;
    const on = (lvl === "all" || s.dataset.lvl === lvl);
    s.style.display = on ? "" : "none";
    if (on) shown++;
  });
  $("#tbCnt").textContent = lvl === "all"
    ? `${total}개 섹션 전체`
    : `${TB_LABEL[lvl]} ${shown}개 섹션`;
}

const PICKS = {
  file:  { stack:["pathlib","shutil","logging"],
    d:'경로·검색은 <b>pathlib</b>, 복사·이동은 <b>shutil</b>, 무슨 일을 했는지는 <b>logging</b>으로 남깁니다. 전부 설치 없이 오늘 바로 시작할 수 있습니다.',
    go:[["#t01","01 파일·폴더"],["#t05","05 로그"],["#t13","13 감시(watchdog)"]] },
  excel: { stack:["pandas","openpyxl","pathlib"],
    d:'데이터 집계는 <b>pandas</b>(탭 3), 회사 양식에 채워 넣기는 <b>openpyxl</b>. 파일 정리는 pathlib가 받쳐줍니다. 완성되면 12번(메일 발송)으로 마무리하세요.',
    go:[["#t07","07 엑셀"],["#t03","03 CSV·JSON"],["#t12","12 이메일"]] },
  web:   { stack:["requests","BeautifulSoup","Playwright"],
    d:'① API가 있으면 <b>requests</b>로 끝. ② 정적 페이지면 <b>+BeautifulSoup</b>. ③ 로그인·JS 페이지만 <b>Playwright</b>로. 이 순서로 가장 가벼운 도구를 고르세요.',
    go:[["#t09","09 API 호출"],["#t10","10 크롤링"],["#t11","11 브라우저"]] },
  win:   { stack:["pywinauto","PyAutoGUI","pyperclip"],
    d:'윈도우 프로그램은 컨트롤 기반 <b>pywinauto</b>를 먼저, 안 잡히는 부분만 <b>PyAutoGUI</b>로 보완합니다. 한글 입력은 pyperclip 클립보드 우회가 표준입니다.',
    go:[["#자동화탭","탭 6 전체가 이 주제입니다 → 상단 🖱️ 탭"]],
    tab:"auto" },
  sched: { stack:["작업 스케줄러","APScheduler","logging"],
    d:'스크립트는 <b>한 번 실행하고 끝나는 형태</b>로 만들고, 매일 반복은 <b>Windows 작업 스케줄러</b>에 맡기는 것이 가장 안정적입니다. 로그가 없으면 새벽 실패 원인을 알 수 없으니 logging은 필수.',
    go:[["#t13","13 감시·스케줄"],["#t05","05 로그"],["#t14","14 재시도"]] },
  mail:  { stack:["smtplib","email","pathlib"],
    d:'표준 라이브러리만으로 한글 제목·본문·엑셀 첨부까지 됩니다. 비밀번호는 .env로 빼고, 중요 알림은 메신저 웹훅(requests) 병행을 권합니다.',
    go:[["#t12","12 이메일"],["#t09","09 API(웹훅)"]] },
  server:{ stack:["Paramiko","Fabric","tenacity"],
    d:'서버 1~2대는 <b>Paramiko/Fabric</b>으로 명령 실행과 파일 전송을 자동화합니다. 네트워크는 끊기게 마련이라 <b>tenacity</b> 재시도를 함께 거세요. 키 인증 필수.',
    go:[["#t17","17 SSH·서버"],["#t14","14 재시도"],["#t05","05 로그"]] },
  share: { stack:["PyInstaller","PySide6","uv"],
    d:'동료 PC에 파이썬이 없어도 <b>PyInstaller</b>로 exe를 만들면 됩니다. 화면이 필요하면 <b>PySide6</b>(탭 7)로 감싸고, 개발 환경 재현은 uv.lock이 보장합니다.',
    go:[["#t15","15 배포"],["#PySide6탭","탭 7 PySide6"]],
    tab2:"qt" },
};
function pickGo(k, btn){
  $$("#tpick .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on");
  const p = PICKS[k];
  const stack = p.stack.map((s,i) =>
    (i ? '<span class="plus">+</span>' : '') + `<span class="pk fu" style="animation-delay:${i*.09}s">${s}</span>`).join("");
  const links = p.go.map(([href, label]) => {
    if (p.tab  && href === "#자동화탭")  return `<a href="javascript:void 0" onclick="switchTab('auto')">🖱️ ${label.split("→")[0]}</a>`;
    if (p.tab2 && href === "#PySide6탭") return `<a href="javascript:void 0" onclick="switchTab('qt')">💻 ${label}</a>`;
    return `<a href="${href}">📖 ${label}</a>`;
  }).join("");
  $("#pickRes").innerHTML = `
    <div class="stack">${stack}</div>
    <p class="tx" style="font-size:14.3px;margin:10px 0 12px">${p.d}</p>
    <div class="go">${links}</div>`;
}
TAB_INIT.toolbox = function(){
  tbFilter("all", $$("#tbbar .chip")[0]);
  pickGo("file", $$("#tpick .chip")[0]);
};

/* ============================================================
   24. 성능 HUD (P 키 또는 우하단 버튼)
   ============================================================ */
(function perfHud(){
  const hud = document.createElement("div");
  hud.id = "perf";
  hud.innerHTML = `<div>FPS <b id="pfF">–</b> <span id="pfJ" style="color:var(--dim-2)"></span></div>
    <div class="fpsbar"><i id="pfB"></i></div>
    <div style="margin-top:6px">DOM <b id="pfN">–</b> · 섹션 <b id="pfS">–</b></div>
    <div>활성 탭 <b id="pfT">–</b> · 애니 <b id="pfA">–</b></div>
    <div style="color:var(--dim-2);margin-top:5px">⚙ 옵션에서 끌 수 있어요</div>
    <span class="x" onclick="perfToggle()" title="닫기">✕</span>`;
  document.body.appendChild(hud);

  let last = performance.now(), frames = 0, acc = 0, worst = 0;
  const loop = now => {
    const dt = now - last; last = now;
    if (dt > worst) worst = dt;
    frames++; acc += dt;
    if (acc >= 500 && hud.classList.contains("on")){
      const fps = Math.round(frames / (acc / 1000));
      $("#pfF").textContent = fps;
      $("#pfB").style.transform = "scaleX(" + Math.min(1, fps / 60) + ")";
      $("#pfJ").textContent = worst > 34 ? `최대 ${Math.round(worst)}ms` : "";
      $("#pfN").textContent = document.getElementsByTagName("*").length;
      $("#pfS").textContent = $$(".pane.on section.sec").length;
      $("#pfT").textContent = currentTab;
      $("#pfA").textContent = document.getAnimations ? document.getAnimations().length : "–";
      frames = 0; acc = 0; worst = 0;
    } else if (acc >= 1000) { frames = 0; acc = 0; worst = 0; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
function perfToggle(){
  OPT.perf = !OPT.perf;
  optApply(); optSave();
}

/* ============================================================
   24.5 옵션 패널 — 모바일에서도 모든 기능을 터치로
   ============================================================ */
const OPT = { anim:true, fs:"n", perf:false };
function optSave(){ try{ localStorage.setItem("dvg-opt", JSON.stringify(OPT)); }catch(e){} }
function optApply(){
  document.body.classList.toggle("noanim", !OPT.anim);
  document.body.classList.toggle("fs-lg", OPT.fs === "lg");
  $("#perf")?.classList.toggle("on", OPT.perf);
  $("#swAnim")?.classList.toggle("on", OPT.anim);
  $("#swPerf")?.classList.toggle("on", OPT.perf);
  $$("#segFs button").forEach(b => b.classList.toggle("on", b.dataset.v === OPT.fs));
}
function optOpen(){ $("#opt").classList.add("on"); optApply(); document.body.style.overflow = "hidden"; }
function optClose(){ $("#opt").classList.remove("on"); document.body.style.overflow = ""; }
function optAnim(){ OPT.anim = !OPT.anim; optApply(); optSave(); }
function optFs(v){ OPT.fs = v; optApply(); optSave(); }
function optHello(){
  try{ localStorage.removeItem("dvg-hello"); }catch(e){}
  $("#hello")?.classList.remove("off");
  optClose(); window.scrollTo({top:0, behavior:"smooth"});
}
function optReset(){
  try{ ["dvg-opt","dvg-hello"].forEach(k => localStorage.removeItem(k)); }catch(e){}
  location.reload();
}
(function optInit(){
  try{ Object.assign(OPT, JSON.parse(localStorage.getItem("dvg-opt") || "{}")); }catch(e){}

  const btn = document.createElement("div");
  btn.className = "optbtn"; btn.title = "옵션 (설정)";
  btn.textContent = "⚙";
  btn.onclick = optOpen;
  document.body.appendChild(btn);

  const ov = document.createElement("div");
  ov.id = "opt";
  ov.innerHTML = `<div class="bd" onclick="optClose()"></div>
    <div class="panel">
      <div class="ptit"><b>⚙ 옵션</b><span class="x" onclick="optClose()">✕</span></div>

      <div class="orow">
        <div class="ol">애니메이션<small>끄면 배터리 절약 · 화면 멀미 방지</small></div>
        <div class="sw on" id="swAnim" onclick="optAnim()"></div>
      </div>

      <div class="orow">
        <div class="ol">글자 크기<small>본문과 코드를 크게</small></div>
        <div class="oseg" id="segFs">
          <button data-v="n" onclick="optFs('n')">보통</button>
          <button data-v="lg" onclick="optFs('lg')">크게</button>
        </div>
      </div>

      <div class="orow">
        <div class="ol">성능 모니터<small>FPS·DOM 수 표시 (개발자용)</small></div>
        <div class="sw" id="swPerf" onclick="perfToggle()"></div>
      </div>

      <div class="orow">
        <div class="ol">처음 안내 배너<small>사용법 안내를 다시 표시</small></div>
        <button class="obtn" onclick="optHello()">다시 보기</button>
      </div>

      <div class="orow">
        <div class="ol">맨 위로<small>현재 탭의 처음으로 이동</small></div>
        <button class="obtn" onclick="optClose();window.scrollTo({top:0,behavior:'smooth'})">↑ 이동</button>
      </div>

      <div class="orow pconly">
        <div class="ol">코딩테스트 GUI<small>연습용 프로그램 내려받기 (GitHub Releases)</small></div>
        <a class="obtn" href="https://github.com/black-astro/coding-test/releases"
           target="_blank" rel="noopener" style="text-decoration:none">⬇️ 다운로드</a>
      </div>

      <div class="orow">
        <div class="ol">설정 초기화<small>수준·옵션·배너 기록을 지우고 새로 시작</small></div>
        <button class="obtn" onclick="optReset()">초기화</button>
      </div>

      <div class="hint">
        <kbd>1</kbd>~<kbd>9</kbd>·<kbd>0</kbd> 탭 이동 · <kbd>P</kbd> 성능 모니터 · <kbd>Esc</kbd> 닫기<br>
        설정은 이 브라우저에 저장되어 다음에도 유지됩니다.
      </div>
    </div>`;
  document.body.appendChild(ov);
  optApply();
})();

/* ============================================================
   26. 알고리즘 시각화 엔진(AV) — 재생 / 한 단계 / 처음으로
   각 데모는 gen()으로 '단계 배열'을 만들고 render(step)으로 그린다.
   상태를 DOM 에 누적하지 않으므로 어느 단계로 건너뛰어도 항상 정확.
   ============================================================ */
const AV = {
  R: {},
  make(id, cfg){
    const d = Object.assign({ i:0, t:null, sp:1, ms:760, playing:false }, cfg);
    d.steps = d.gen();
    this.R[id] = d;
    this.draw(id);
    this.btn(id);
  },
  draw(id){
    const d = this.R[id]; if (!d) return;
    const s = d.steps[d.i];
    if (!s) return;
    d.render(s, d.i);
    const n = $("#" + id + "Note");
    if (n){
      n.className = "stepnote" + (s.tone ? " " + s.tone : "");
      n.innerHTML = `<span class="n">${d.i + 1} / ${d.steps.length}</span>` +
                    `<span class="tx">${s.note || ""}</span>`;
    }
  },
  step(id){                                   // 반환값: 더 남았는가
    const d = this.R[id]; if (!d) return false;
    if (d.i >= d.steps.length - 1) return false;
    d.i++; this.draw(id);
    return d.i < d.steps.length - 1;
  },
  play(id){
    const d = this.R[id]; if (!d) return;
    if (d.playing){ this.pause(id); return; }
    if (d.i >= d.steps.length - 1){ d.i = 0; this.draw(id); }
    d.playing = true; this.btn(id);
    const tick = () => {
      if (!d.playing) return;
      if (!this.step(id)){ d.playing = false; this.btn(id); return; }
      d.t = setTimeout(tick, Math.max(60, d.ms * d.sp));
    };
    d.t = setTimeout(tick, 240);
  },
  pause(id){
    const d = this.R[id]; if (!d) return;
    d.playing = false; clearTimeout(d.t); d.t = null; this.btn(id);
  },
  reset(id){
    const d = this.R[id]; if (!d) return;
    this.pause(id); d.steps = d.gen(); d.i = 0; this.draw(id);
  },
  speed(id, v, btn){
    const d = this.R[id]; if (!d) return;
    d.sp = v;
    if (btn) [...btn.parentNode.children].forEach(b => {
      if (b.tagName === "BUTTON") b.classList.toggle("on", b === btn);
    });
  },
  btn(id){
    const b = $("#" + id + "Play"); if (!b) return;
    const d = this.R[id];
    b.textContent = d && d.playing ? "⏸ 일시정지" : "▶ 재생";
    b.classList.toggle("on", !!(d && d.playing));
  },
  stopAll(){ Object.keys(this.R).forEach(k => this.pause(k)); },
};

/* --- 공통 헬퍼 --- */
const AVX = {
  /* 배열 셀 렌더 — vals: [{v, cls, pt}] */
  arr(el, vals){
    if (!el) return;
    el.innerHTML = vals.map((o, i) => {
      const v = o === null || o === undefined ? "" : (typeof o === "object" ? o.v : o);
      const cls = typeof o === "object" && o.cls ? o.cls : "";
      const pt  = typeof o === "object" && o.pt ? o.pt : "";
      const ptc = pt.replace(/[^LRMW]/g, "").charAt(0) || "M";
      return `<div class="c ${cls}"><span class="ix">${i}</span>${v === null ? "" : v}` +
             (pt ? `<span class="pt ${ptc}">${pt}</span>` : "") + `</div>`;
    }).join("");
  },
  /* 큐/토큰 줄 렌더 */
  que(el, items, empty = "비어 있음"){
    if (!el) return;
    el.innerHTML = items.length
      ? items.map(o => {
          const v = typeof o === "object" ? o.v : o;
          const cls = typeof o === "object" && o.cls ? o.cls : "";
          const pt = typeof o === "object" && o.pt ? `<span class="pt">${o.pt}</span>` : "";
          return `<span class="q ${cls}">${pt}${v}</span>`;
        }).join("")
      : `<span class="none">${empty}</span>`;
  },
  /* 완전 이진 트리 좌표 (0-based 인덱스, 깊이 d) */
  treePos(n, depth){
    const d = Math.floor(Math.log2(n + 1));
    const first = (1 << d) - 1;
    const slots = 1 << d;
    return { x: (n - first + 0.5) / slots, d };
  },
  /* 트리 DOM 생성 — nodes:[{v}] (완전 이진 트리 순서), 반환 후 클래스만 갱신 */
  tree(el, count, maxDepth){
    if (!el) return;
    const w = el.clientWidth || 520, h = el.clientHeight || 250;
    const rowY = i => h * (0.15 + i * (0.64 / Math.max(1, maxDepth)));
    let html = "";
    for (let i = 1; i < count; i++){                     // 간선 먼저 (z-index 아래)
      const p = (i - 1) >> 1;
      const a = this.treePos(p), b = this.treePos(i);
      const x1 = a.x * w, y1 = rowY(a.d), x2 = b.x * w, y2 = rowY(b.d);
      const L = Math.hypot(x2 - x1, y2 - y1);
      const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      html += `<div class="tl" data-e="${i}" style="left:${x1}px;top:${y1}px;` +
              `width:${L}px;transform:rotate(${ang}deg)"></div>`;
    }
    for (let i = 0; i < count; i++){
      const p = this.treePos(i);
      html += `<div class="tn" data-n="${i}" style="left:${p.x * 100}%;top:${rowY(p.d)}px">` +
              `<span class="vv"></span><span class="od"></span></div>`;
    }
    el.innerHTML = html;
  },
  /* 트리 상태 적용 — st: {vals:[], cls:{i:클래스}, ord:{i:라벨}, edge:{i:true}} */
  treeSet(el, st){
    if (!el) return;
    $$(".tn", el).forEach(n => {
      const i = +n.dataset.n;
      n.className = "tn " + (st.cls[i] || "");
      n.querySelector(".vv").textContent = st.vals[i] === undefined ? "" : st.vals[i];
      n.querySelector(".od").textContent = st.ord && st.ord[i] !== undefined ? st.ord[i] : "";
    });
    $$(".tl", el).forEach(l => {
      l.classList.toggle("on", !!(st.edge && st.edge[+l.dataset.e]));
    });
  },
  num(v){
    if (v >= 1e12) return (v / 1e12).toFixed(1).replace(/\.0$/, "") + "조";
    if (v >= 1e8)  return (v / 1e8 ).toFixed(1).replace(/\.0$/, "") + "억";
    if (v >= 1e4)  return (v / 1e4 ).toFixed(1).replace(/\.0$/, "") + "만";
    return Math.round(v).toLocaleString();
  },
  set(sel, v){ const e = $(sel); if (e) e.textContent = v; },
};

