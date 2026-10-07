/* ================================================================
   학습 레이어 (2026-10 개편) — java · python · kotlin · js-ts
   ----------------------------------------------------------------
   ① 섹션마다 읽기 시간 · "다 읽음" 표시 · 끝에 "다음 섹션" 이동
   ② 사이드바 탭 진도 막대 · 다 읽은 탭 표시
   ③ 읽기 도구: 글자 크기 · 집중 모드 · 진도 초기화
   ④ 지난번 읽던 곳 이어 읽기 (주소에 #조각이 없을 때만 제안)
   ⑤ 그림 크게 보기 · 화면 밖 그림 애니메이션 정지
   ⑥ [ / ] 키로 이전 · 다음 섹션
   저장은 localStorage 한 키(st:<가이드>)만 쓰고, 막혀 있어도 화면은 정상 동작한다.
   00-core.js 의 goSec · switchTab 뒤에 로드되어야 한다(parts.json 에서 99-init 앞).
   ================================================================ */
(function study(){
  const Q = (s, r) => (r || document).querySelector(s);
  const QA = (s, r) => Array.from((r || document).querySelectorAll(s));
  const GUIDE = (location.pathname.match(/\/([^/]+)-web\//) || [, "guide"])[1];
  const KEY = "st:" + GUIDE;

  /* ---------- 저장 ---------- */
  let S = { done:{}, last:null, fs:"m", focus:false };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch(e){}
  if (!S.done || typeof S.done !== "object") S.done = {};
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} };

  const secs = QA("main section.sec[id]");
  const paneOf = s => s.closest(".pane");
  const tabOf = s => (paneOf(s)?.id || "").replace(/^pane-/, "");
  // h2 에 주입된 난이도 배지(.lvl)는 빼고 제목 글자만
  const titleOf = s => {
    const h = Q(".sec-head h2", s);
    if (!h) return s.id;
    const c = h.cloneNode(true);
    c.querySelectorAll(".lvl").forEach(x => x.remove());
    return c.textContent.replace(/\s+/g, " ").trim();
  };
  const tabLabel = t => (typeof TAB_LABEL === "object" && TAB_LABEL[t]) || t;
  const tabOrder = QA(".tabbar .tabrow button[data-t]").map(b => b.dataset.t);

  /* ---------- ① 섹션 머리 · 꼬리 ---------- */
  // 한국어 본문 분당 약 450자, 코드는 줄당 3초로 어림
  function minutes(s){
    let text = 0, code = 0;
    for (const n of QA("p, li, td, .lead, .note, .cap, h3, h4", s)) text += n.textContent.length;
    for (const p of QA("pre", s)) code += p.textContent.split("\n").length;
    return Math.max(1, Math.round(text / 450 + code * 3 / 60));
  }
  function doneBtn(id, big){
    const b = document.createElement("button");
    b.type = "button"; b.className = "lx-done"; b.dataset.sec = id;
    b.textContent = big ? "이 섹션 다 읽음" : "다 읽음";
    b.title = "다 읽은 섹션으로 표시 (다시 누르면 취소)";
    return b;
  }
  secs.forEach((s, i) => {
    const head = Q(".sec-head", s);
    if (!head || Q(".lx-meta", head)) return;
    const meta = document.createElement("span");
    meta.className = "lx-meta";
    meta.innerHTML = '<span class="rt">약 ' + minutes(s) + "분</span>";
    meta.appendChild(doneBtn(s.id));
    const no = Q(".no", head);
    if (no) no.after(meta); else head.prepend(meta);

    const foot = document.createElement("div");
    foot.className = "lx-foot";
    foot.appendChild(doneBtn(s.id, true));
    const nx = secs[i + 1];
    if (nx){
      const same = paneOf(nx) === paneOf(s);
      const a = document.createElement("a");
      a.className = "lx-next"; a.href = "#" + nx.id;
      a.innerHTML = "<small>" + (same ? "다음 섹션" : "다음 탭 · " + esc(tabLabel(tabOf(nx)))) +
        "</small><b></b><i aria-hidden=\"true\">→</i>";
      Q("b", a).textContent = titleOf(nx);
      foot.appendChild(a);
    }
    s.appendChild(foot);
  });
  function esc(t){ return String(t).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
  function nextTab(t){ const i = tabOrder.indexOf(t); return i >= 0 ? tabOrder[i + 1] : null; }
  function firstOfTab(t){ return t ? Q("#pane-" + t + " section.sec[id]") : null; }
  // 탭 경계의 "다음"은 문서 순서가 아니라 탭바 순서를 따른다
  QA(".lx-foot .lx-next").forEach(a => {
    const s = a.closest("section.sec");
    const nx = document.getElementById(a.getAttribute("href").slice(1));
    if (!nx || paneOf(nx) === paneOf(s)) return;
    const t = nextTab(tabOf(s)), f = firstOfTab(t);
    if (!f){ a.remove(); return; }
    a.href = "#" + f.id;
    Q("small", a).textContent = "다음 탭 · " + tabLabel(t);
    Q("b", a).textContent = titleOf(f);
  });

  document.addEventListener("click", e => {
    const b = e.target.closest(".lx-done");
    if (!b) return;
    const id = b.dataset.sec;
    if (S.done[id]) delete S.done[id]; else S.done[id] = 1;
    save(); paint();
    // 섹션 끝에서 "다 읽음"을 누르면 다음 섹션 버튼으로 시선을 옮긴다
    if (S.done[id] && b.closest(".lx-foot")) b.closest(".lx-foot").querySelector(".lx-next")?.focus({preventScroll:true});
  });

  /* ---------- ② 진도 표시 ---------- (막대 · 목차 머리는 13-chrome.html 이 미리 만든다) */
  function paint(){
    const byTab = {};
    for (const s of secs){
      const t = tabOf(s), d = !!S.done[s.id];
      (byTab[t] ||= { n:0, d:0 }).n++;
      if (d) byTab[t].d++;
      s.classList.toggle("is-done", d);
      QA('.lx-done[data-sec="' + s.id + '"]', s).forEach(b => {
        b.setAttribute("aria-pressed", d ? "true" : "false");
        b.textContent = b.closest(".lx-foot") ? (d ? "다 읽었어요" : "이 섹션 다 읽음") : (d ? "읽음" : "다 읽음");
      });
    }
    QA("nav.side a[href^='#']").forEach(a => a.classList.toggle("done", !!S.done[a.getAttribute("href").slice(1)]));
    QA("nav.side .navset[data-nav]").forEach(n => {
      const c = byTab[n.dataset.nav] || { n:0, d:0 };
      const p = Q(".lx-prog", n);
      p.style.setProperty("--p", c.n ? c.d / c.n : 0);
      p.lastElementChild.innerHTML = "<b>" + c.d + "</b> / " + c.n;
      p.title = "이 탭 진도 " + c.d + " / " + c.n + " 섹션";
    });
    QA(".tabbar button[data-t]").forEach(b => {
      const c = byTab[b.dataset.t];
      b.classList.toggle("tab-done", !!c && c.n > 0 && c.d === c.n);
    });
    sideUpdate(byTab);
    const tot = secs.length, dn = secs.filter(s => S.done[s.id]).length, pct = tot ? Math.round(dn / tot * 100) : 0;
    const sum = Q(".lx-pop .lx-sum");
    if (sum) sum.innerHTML = "이 가이드 <b>" + dn + " / " + tot + "</b> 섹션을 읽었습니다.";
    const pc = Q(".lx-pop .lx-pct"); if (pc) pc.textContent = pct + "%";
    const pb = Q(".lx-pop .lx-pbar i"); if (pb) pb.style.transform = "scaleX(" + (tot ? dn / tot : 0) + ")";
  }

  /* ---------- ②-b 사이드바 ----------
     그룹 → 탭 → 목차 3단 구성은 13-chrome.html 이 사이드바 마크업 바로 뒤에서 한다(첫 그리기 전).
     여기서는 진도 반영 · 탭 전환 감싸기 · 읽는 섹션 따라가기만. */
  const side = Q("nav.side");
  const grpBtns = QA("nav.side .navgrp button[data-g]");
  const tabBtns = QA(".tabbar .tabrow button[data-t]");
  (function sideNav(){
    if (!side || !grpBtns.length) return;
    // 탭이 바뀔 때 펼친 그룹 · 현재 탭 갱신
    const orig = window.switchTab;
    if (typeof orig === "function" && !orig.lxWrapped){
      window.switchTab = function(name){
        const r = orig.apply(this, arguments); paint();
        // 새로 연 탭의 읽는 법 * (탭마다 한 번) — 전환이 끝난 뒤 한가할 때 훑어 탭 전환을 늦추지 않는다
        const pane = Q(".pane.on");
        (window.requestIdleCallback || (f => setTimeout(f, 60)))(() => { try { sayPane(pane); } catch(e){} }, { timeout:800 });
        return r;
      };
      window.switchTab.lxWrapped = true;
    }
    // 읽는 섹션이 사이드바 밖으로 나가면 따라간다 (사이드바만 스크롤 · 본문은 그대로)
    // 스크롤할 때마다 맞추면 사용자가 내려 둔 사이드바를 계속 끌어당긴다 — 그래서
    //  ① 현재 섹션이 '바뀐 순간'에만 ② 완전히 안 보일 때만 ③ 보일 만큼만 한 번 옮기고
    //  ④ 마우스가 사이드바 위에 있으면 손대지 않고
    //  ⑤ 사용자가 사이드바를 직접 굴렸으면 링크를 누르거나 탭을 바꿀 때까지 따라가지 않는다.
    let tk = 0, last = null, hover = false, manual = false;
    side.addEventListener("pointerenter", () => { hover = true; });
    side.addEventListener("pointerleave", () => { hover = false; });
    ["wheel", "touchmove"].forEach(ev =>
      side.addEventListener(ev, () => { manual = true; }, { passive:true }));
    side.addEventListener("pointerdown", e => {          // 스크롤바 끌기
      if (!e.target.closest("a,button")) manual = true;
    }, { passive:true });
    side.addEventListener("click", e => { if (e.target.closest("a,button")) manual = false; });
    if (typeof window.switchTab === "function"){
      const sw = window.switchTab;
      window.switchTab = function(){ manual = false; last = null; return sw.apply(this, arguments); };
      window.switchTab.lxWrapped = true;
    }
    addEventListener("scroll", () => {
      if (tk) return;
      tk = requestAnimationFrame(() => {
        tk = 0;
        const a = Q("nav.side .navset.on a.on");
        if (!a || a === last) return;
        last = a;
        if (hover || manual) return;
        const sr = side.getBoundingClientRect(), ar = a.getBoundingClientRect();
        if (ar.top < sr.top) side.scrollTop += ar.top - sr.top - 24;
        else if (ar.bottom > sr.bottom) side.scrollTop += ar.bottom - sr.bottom + 24;
      });
    }, { passive:true });
  })();
  // 탭 줄이 가로로 밀릴 때 현재 탭이 가려지지 않게 가운데 쪽으로 (05-nav 가 그룹을 바꾸며 scrollLeft=0 으로 되돌린 뒤에)
  function revealTab(){
    const row = Q("#tabrow"), b = row && Q("button.on", row);
    if (!b || row.scrollWidth <= row.clientWidth) return;
    const l = b.getBoundingClientRect().left - row.getBoundingClientRect().left + row.scrollLeft, r = l + b.offsetWidth;
    if (l < row.scrollLeft + 16 || r > row.scrollLeft + row.clientWidth - 24)
      row.scrollTo({ left:Math.max(0, l - (row.clientWidth - b.offsetWidth) / 2) });
  }
  addEventListener("resize", () => setTimeout(revealTab, 0));
  function sideUpdate(byTab){
    if (!side) return;
    setTimeout(revealTab, 0);              // rAF 는 창이 가려지면 멈추므로 타이머로
    const cur = typeof currentTab === "string" ? currentTab : (Q(".pane.on")?.id || "").replace(/^pane-/, "");
    const curG = tabBtns.find(b => b.dataset.t === cur)?.dataset.g;
    grpBtns.forEach(g => {
      let n = 0, d = 0;
      tabBtns.filter(b => b.dataset.g === g.dataset.g).forEach(b => { const c = byTab[b.dataset.t]; if (c){ n += c.n; d += c.d; } });
      g.style.setProperty("--gp", n ? d / n : 0);
      g.title = (g.title.split(" — ")[0]) + (n ? " — 진도 " + d + " / " + n : "");
    });
    QA("nav.side .lx-tabs").forEach(l => l.classList.toggle("open", l.dataset.g === curG));
    QA("nav.side .lx-tabs button").forEach(t => {
      const c = byTab[t.dataset.t] || { n:0, d:0 };
      const on = t.dataset.t === cur;
      t.classList.toggle("on", on);
      t.setAttribute("aria-current", on ? "page" : "false");
      t.classList.toggle("full", c.n > 0 && c.d === c.n);
      Q(".fr", t).textContent = c.d ? c.d + "/" + c.n : c.n;
      t.title = Q(".nm", t).textContent + " — " + c.n + "섹션" + (c.d ? ", " + c.d + "개 읽음" : "");
    });
  }

  /* ---------- ②-c 테마 · ③ 읽기 설정 ----------
     버튼 · 설정 창 · 적용(applyPrefs)은 13-chrome.html 이 한다. 진도가 걸린 두 가지만 훅으로 받는다. */
  const LX = window.LX || (window.LX = {});
  const applyPrefs = () => { if (typeof LX.applyPrefs === "function") LX.applyPrefs(); };
  LX.onReset = () => { S.done = {}; save(); };
  LX.onPrefs = () => paint();

  /* ---------- ③-b 언어 비교 화살표 ----------
     "자바 → 코틀린"처럼 다른 언어와 나란히 비교하는 두 칸 사이에 화살표를 세운다
     (왼쪽이 오른쪽으로 바뀌어 쓰인다는 뜻). 장점/단점 같은 일반 비교에는 넣지 않도록
     ① 두 칸의 첫 코드 언어가 서로 다른 프로그래밍 언어이거나 ② 두 제목이 서로 다른 언어 이름으로 시작할 때만. */
  (function langArrows(){
    const LANGS = [["kotlin","코틀린","kt","kts"],["java","자바"],["python","파이썬","py"],["javascript","자바스크립트","js","jsx","mjs"],
      ["typescript","타입스크립트","ts","tsx"],["csharp","c#","씨샵","cs"],["cpp","c++","씨플플"],["c","c언어"],["rust","러스트","rs"],
      ["go","고","golang"],["swift","스위프트"],["ruby","루비","rb"],["php"],["scala","스칼라"],["dart","다트"]];
    const NAME = { kotlin:"코틀린", java:"자바", python:"파이썬", javascript:"JS", typescript:"TS", csharp:"C#", cpp:"C++", c:"C",
      rust:"Rust", go:"Go", swift:"Swift", ruby:"Ruby", php:"PHP", scala:"Scala", dart:"Dart" };
    const norm = w => { w = (w || "").toLowerCase(); const hit = LANGS.find(l => l.includes(w)); return hit ? hit[0] : null; };
    const fromHead = h => {
      const t = (h?.textContent || "").trim().toLowerCase().replace(/^[^a-z가-힣#+]+/, "");
      const hit = LANGS.flat().filter(w => w.length > 1 || w === "c").sort((a, b) => b.length - a.length)
        .find(w => t.startsWith(w) && !/[a-z가-힣0-9]/.test(t.charAt(w.length) || " ") || (w.length > 1 && /[가-힣]/.test(w) && t.startsWith(w)));
      return hit ? norm(hit) : null;
    };
    // "다른 언어 → 이 가이드의 언어"일 때만 — 대안끼리(C# P/Invoke · Go cgo)나 FFI 양쪽(Rust 쪽 · C# 쪽) 비교는 바뀜이 아니다
    const HOME = { java:["java"], kotlin:["kotlin"], python:["python"], "js-ts":["javascript","typescript"],
      csharp:["csharp"], cpp:["cpp","c"], c:["c"], rust:["rust"] }[GUIDE] || [];
    const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
    QA("main .pane .vs, main .pane .grid2").forEach(box => {
      const kids = [...box.children].filter(c => !c.classList.contains("lx-arrow"));
      if (kids.length !== 2 || Q(".lx-arrow", box)) return;
      const codeLang = k => norm(Q("pre.code", k)?.dataset.lang);
      const ha = fromHead(Q("h5, h4", kids[0])), hb = fromHead(Q("h5, h4", kids[1]));
      const ca = codeLang(kids[0]), cb = codeLang(kids[1]);
      let a = null, b = null;
      if (ha && hb && ha !== hb){ a = ha; b = hb; }                                   // 제목이 둘 다 언어 이름
      else if (box.classList.contains("vs") && ca && cb && ca !== cb && (ha || hb)){ a = ca; b = cb; }  // 코드 언어가 다르고 제목 하나가 언어
      if (!a || !HOME.includes(b) || HOME.includes(a)) return;
      const ar = document.createElement("div");
      ar.className = "lx-arrow";
      ar.innerHTML = ARROW;  // 글자 없이 화살표 하나 — 뜻은 title 로 ("코틀린로" 같은 조사 오류도 없앤다)
      ar.title = (NAME[a] || a) + " → " + (NAME[b] || b) + " — 이렇게 바뀌어 쓰입니다";
      ar.setAttribute("aria-hidden", "true");
      kids[0].after(ar);
      box.classList.add("lx-cmp");
    });
    // 표 — 머리줄에 서로 다른 언어 열이 나란히 있으면(자바 | 코틀린) 두 번째 열 제목 앞에 화살표
    QA("main .pane table").forEach(t => {
      const ths = QA("tr:first-child > th", t);
      for (let i = 1; i < ths.length; i++){
        const a = fromHead(ths[i - 1]), b = fromHead(ths[i]);
        if (a && b && a !== b && HOME.includes(b) && !HOME.includes(a) && !Q(".lx-tharrow", ths[i])){
          ths[i].insertAdjacentHTML("afterbegin", '<span class="lx-tharrow" aria-hidden="true">' + ARROW + "</span>");
          ths[i].title = (NAME[a] || a) + " → " + (NAME[b] || b);
        }
      }
    });
  })();

  /* ---------- ③-c 읽는 법 (*) ----------
     가이드별 사전(js/85-say.js 의 window.LX_SAY = [[표기, 읽는 법, 부르는 말]])을 보고
     본문 인라인 코드에서 각 용어가 "그 탭에서 처음" 나올 때만 * 를 붙인다. 누르거나 올리면 말풍선.
     탭은 처음 열릴 때 한 번만 훑는다(2~3MB 문서 전체를 한 번에 돌지 않게). */
  const SAY = Array.isArray(window.LX_SAY) ? window.LX_SAY.filter(x => x && x[0] && x[1]) : [];
  const sayMap = new Map(SAY.map(x => [x[0], x]));
  const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sayRe = SAY.length ? new RegExp(
    [...sayMap.keys()].sort((a, b) => b.length - a.length).map(t =>
      (/^[\w$]/.test(t) ? "(?<![\\w$@.])" : "") + reEsc(t) + (/[\w$]$/.test(t) ? "(?![\\w$])" : "")).join("|"), "g") : null;
  function sayPane(pane){
    if (!sayRe || !pane || pane.dataset.lxSay) return;
    pane.dataset.lxSay = "1";
    const seen = new Set();
    for (const el of pane.querySelectorAll("code, .kw")){
      if (el.closest("pre, svg, .sec-head h2, .lx-saytip, .stage, nav") || el.parentElement.closest("code, .kw")) continue;
      const txt = el.textContent;
      if (!txt || txt.length > 160) continue;
      sayRe.lastIndex = 0;
      const fresh = [];
      for (let m; (m = sayRe.exec(txt));){ if (!seen.has(m[0]) && !fresh.includes(m[0])) fresh.push(m[0]); }
      if (!fresh.length) continue;
      fresh.forEach(t => seen.add(t));
      const b = document.createElement("button");
      b.type = "button"; b.className = "lx-say"; b.textContent = "*";
      b.dataset.t = fresh.join("\u0001");
      b.setAttribute("aria-label", "읽는 법: " + fresh.map(t => t + " — " + sayMap.get(t)[1]).join(", "));
      el.after(b);
    }
  }
  if (sayRe){
    const tip = document.createElement("div");
    tip.className = "lx-saytip"; tip.setAttribute("role", "tooltip");
    document.body.appendChild(tip);
    let cur = null, hideT = 0;
    const show = b => {
      clearTimeout(hideT); cur = b;
      tip.innerHTML = b.dataset.t.split("\u0001").map(t => {
        const [w, r, n] = sayMap.get(t);
        return '<div class="row"><code></code><b></b>' + (n ? "<small></small>" : "") + "</div>";
      }).join("");
      b.dataset.t.split("\u0001").forEach((t, i) => {
        const [w, r, n] = sayMap.get(t), row = tip.children[i];
        Q("code", row).textContent = w; Q("b", row).textContent = r; if (n) Q("small", row).textContent = n;
      });
      tip.classList.add("on");
      const r = b.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
      let x = Math.min(innerWidth - tw - 10, Math.max(10, r.left + r.width / 2 - tw / 2));
      let y = r.top - th - 10; if (y < 10) y = r.bottom + 10;
      tip.style.left = x + "px"; tip.style.top = y + "px";
    };
    const hide = () => { hideT = setTimeout(() => { tip.classList.remove("on"); cur = null; }, 120); };
    document.addEventListener("pointerover", e => { const b = e.target.closest(".lx-say"); if (b) show(b); });
    document.addEventListener("pointerout", e => { if (e.target.closest(".lx-say")) hide(); });
    document.addEventListener("focusin", e => { const b = e.target.closest(".lx-say"); if (b) show(b); });
    document.addEventListener("focusout", e => { if (e.target.closest(".lx-say")) hide(); });
    document.addEventListener("click", e => { const b = e.target.closest(".lx-say"); if (b){ e.preventDefault(); cur === b && tip.classList.contains("on") ? hide() : show(b); } });
    document.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });
    addEventListener("scroll", () => { if (cur) { tip.classList.remove("on"); cur = null; } }, { passive:true });
    sayPane(Q(".pane.on"));
  }

  /* ---------- ④ 이어 읽기 ---------- */
  (function resume(){
    const last = S.last && document.getElementById(S.last);
    const hashed = location.hash.length > 1;
    if (last && !hashed && last.matches("section.sec")){
      const t = document.createElement("div");
      t.className = "lx-resume"; t.setAttribute("role", "status");
      t.innerHTML = '<span>지난번 읽던 곳 · <b></b></span>' +
        '<button type="button" class="go">이어 읽기</button><button type="button" class="no">닫기</button>';
      Q("b", t).textContent = tabLabel(tabOf(last)).replace(/^\S+\s/, "") + " — " + titleOf(last);
      document.body.appendChild(t);
      const close = () => t.remove();
      Q(".go", t).onclick = () => { close(); if (typeof goSec === "function") goSec(last.id); };
      Q(".no", t).onclick = close;
      setTimeout(close, 14000);
    }
    // 지금 읽는 섹션을 기억한다 — 스크롤이 멈추고 1.2초 뒤 한 번만
    let tm = 0;
    addEventListener("scroll", () => {
      clearTimeout(tm);
      tm = setTimeout(() => {
        const id = decodeURIComponent(location.hash.slice(1));
        if (id && id !== S.last && document.getElementById(id)?.matches("section.sec")){ S.last = id; save(); }
      }, 1200);
    }, { passive:true });
  })();

  /* ---------- ⑤ 그림: 크게 보기 · 화면 밖 정지 ---------- */
  QA(".diag").forEach(d => {
    if (!Q("svg", d) || Q(".lx-zoom", d)) return;
    const b = document.createElement("button");
    b.type = "button"; b.className = "lx-zoom"; b.textContent = "크게 보기";
    b.setAttribute("aria-label", "그림 크게 보기");
    d.prepend(b);
  });
  let lbFrom = null;
  document.addEventListener("click", e => {
    const z = e.target.closest(".diag .lx-zoom");
    if (z && !z.closest(".lx-lb")){
      lbFrom = z;
      const lb = document.createElement("div");
      lb.className = "lx-lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
      const c = z.closest(".diag").cloneNode(true);
      c.classList.remove("rv", "zz"); c.classList.add("in");
      Q(".lx-zoom", c)?.remove();
      lb.appendChild(c);
      const x = document.createElement("button");
      x.type = "button"; x.className = "x"; x.textContent = "닫기 (Esc)";
      lb.appendChild(x);
      document.body.appendChild(lb);
      inkFix(Q("svg", c));
      x.focus();
      return;
    }
    const lb = e.target.closest(".lx-lb");
    if (lb && (e.target === lb || e.target.closest(".x"))) closeLb();
  });
  function closeLb(){ const lb = Q(".lx-lb"); if (!lb) return; lb.remove(); lbFrom?.focus({preventScroll:true}); lbFrom = null; }
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLb(); });

  /* 라이트 테마 글자 보정 — 다크 기준으로 흰 글자를 직접 박아 둔 그림이 있다.
     칸 채움이 클래스(반투명 계열색)면 라이트에서 옅어져 흰 글자가 사라지므로,
     글자 밑 도형이 밝으면 그 글자에만 lx-ink 를 붙여 짙게 바꾼다(어두운 칸 위의 흰 글자는 그대로). */
  const rgb = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r:p[0], g:p[1], b:p[2], a:p.length > 3 ? p[3] : 1 }; };
  const lumOf = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
  function inkFix(svg){
    if (!svg || svg.dataset.lxInk || document.documentElement.getAttribute("data-theme") !== "light") return;
    svg.dataset.lxInk = "1";
    // 반투명 채움은 흰 캔버스와 합성한 실제 색으로 본다
    const onWhite = c => ({ r:c.r * c.a + 255 * (1 - c.a), g:c.g * c.a + 255 * (1 - c.a), b:c.b * c.a + 255 * (1 - c.a), a:1 });
    const shapes = [...svg.querySelectorAll("rect,circle,ellipse,polygon")]
      .map(s => ({ b:s.getBBox(), f:rgb(getComputedStyle(s).fill) })).filter(o => o.f && o.f.a > .05);
    for (const tx of svg.querySelectorAll("text")){
      const c = rgb(getComputedStyle(tx).fill);
      if (!c) continue;
      const b = tx.getBBox(), cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      let bg = { r:255, g:255, b:255, a:1 };
      // 아래에서 위로 겹친 순서대로 합성 (문서 순서 = 그리기 순서)
      for (const o of shapes) if (cx >= o.b.x && cx <= o.b.x + o.b.width && cy >= o.b.y && cy <= o.b.y + o.b.height)
        bg = { r:o.f.r * o.f.a + bg.r * (1 - o.f.a), g:o.f.g * o.f.a + bg.g * (1 - o.f.a), b:o.f.b * o.f.a + bg.b * (1 - o.f.a), a:1 };
      const L1 = lumOf(onWhite(c)), L2 = lumOf(bg);
      if ((Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05) >= 3) continue;
      tx.classList.add(L2 > .3 ? "lx-ink" : "lx-inv");    // 밝은 칸엔 짙은 글자, 어두운 칸엔 흰 글자
    }
  }
  window.lxInkFix = inkFix;            // 검증 스크립트용 (브라우저 스모크에서 직접 호출)
  // 테마가 바뀌면 판정을 지우고, 색 전환 애니메이션이 끝난 뒤(바뀌기 전 색을 읽지 않게) 화면 안 그림부터 다시 잰다.
  // 화면 밖 그림은 들어올 때 IntersectionObserver 가 잰다.
  let inkT = 0;
  new MutationObserver(() => {
    QA(".diag svg[data-lx-ink]").forEach(s => { delete s.dataset.lxInk; });
    QA(".diag text.lx-ink, .diag text.lx-inv").forEach(t => t.classList.remove("lx-ink", "lx-inv"));
    clearTimeout(inkT);
    inkT = setTimeout(() => QA("main .diag:not(.zz) svg").forEach(inkFix), 450);
  }).observe(document.documentElement, { attributes:true, attributeFilter:["data-theme"] });

  if ("IntersectionObserver" in window){
    const io = new IntersectionObserver(es => es.forEach(en => {
      const d = en.target, svg = Q("svg", d), on = en.isIntersecting;
      if (on) inkFix(svg);
      d.classList.toggle("zz", !on);
      try { if (svg && svg.pauseAnimations) on ? svg.unpauseAnimations() : svg.pauseAnimations(); } catch(err){}
    }), { rootMargin:"120px 0px" });
    QA("main .diag").forEach(d => io.observe(d));
  }

  /* 등장 효과 안전장치 — 관찰기가 놓친(창이 가려져 있던 등) 화면 안 요소를 드러낸다 */
  function revealVisible(){
    const h = innerHeight;
    QA(".pane.on .rv:not(.in)").forEach(el => { const r = el.getBoundingClientRect(); if (r.top < h && r.bottom > 0) el.classList.add("in"); });
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) revealVisible(); });
  setTimeout(revealVisible, 1800);

  /* ---------- ⑥ [ / ] 섹션 이동 ---------- */
  document.addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key !== "[" && e.key !== "]") return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const list = QA(".pane.on section.sec[id]");
    if (!list.length) return;
    const y = (typeof secTop === "function" ? secTop() : 90) + 4;
    let i = list.findIndex(s => s.getBoundingClientRect().top > y);
    if (i < 0) i = list.length;
    const cur = i - 1;
    const go = e.key === "]" ? list[cur + 1] : list[Math.max(0, cur - (list[cur] && list[cur].getBoundingClientRect().top > -40 ? 1 : 0))];
    if (go && typeof goSec === "function"){ e.preventDefault(); goSec(go.id); }
  });

  applyPrefs();
  paint();
})();
