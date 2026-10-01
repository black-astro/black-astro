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

  /* ---------- ② 진도 표시 ---------- */
  QA("nav.side .navset[data-nav]").forEach(n => {
    if (Q(".lx-prog", n)) return;
    const p = document.createElement("div");
    p.className = "lx-prog";
    p.innerHTML = '<span class="bar"><i></i></span><span><b>0</b> / 0</span>';
    n.prepend(p);
  });
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
    const tot = secs.length, dn = secs.filter(s => S.done[s.id]).length;
    const sum = Q(".lx-pop .lx-sum");
    if (sum) sum.innerHTML = "전체 진도 <b>" + dn + " / " + tot + "</b> 섹션 (" + (tot ? Math.round(dn / tot * 100) : 0) + "%)" +
      "<br>기록은 이 브라우저에만 남습니다.";
  }

  /* ---------- ②-b 사이드바: 그룹 → 탭 → 목차 3단 ----------
     예전 사이드바는 그룹 버튼(영문 대문자 10.5px + 이모지)만 있고 그 안의 탭은
     마우스를 올려야 보였다. 지금 그룹만 펼쳐 탭을 이름 · 진도와 함께 세우고,
     다른 가이드 링크는 접는다(목차를 아래로 밀어내던 9칸). 마크업은 그대로 두고 여기서 입힌다. */
  const side = Q("nav.side");
  const grpBtns = QA("nav.side .navgrp button[data-g]");
  const tabBtns = QA(".tabbar .tabrow button[data-t]");
  const tabName = b => { const c = b.cloneNode(true); c.querySelectorAll(".ic, .k").forEach(x => x.remove()); return c.textContent.trim(); };
  const tabIcon = b => (Q(".ic", b)?.textContent || "").trim();
  (function sideNav(){
    if (!side || !grpBtns.length) return;
    side.classList.add("lx-side");
    grpBtns.forEach(g => {
      // "언어 · JAVA" → 큰 글자 "언어" + 작은 보조 "JAVA" (대문자 라벨은 읽기 어렵다)
      const lb = Q(".lb", g);
      if (lb && !Q(".lx-g1", g)){
        const [a, ...rest] = lb.textContent.split(" · ");
        lb.innerHTML = '<span class="lx-g1"></span><span class="lx-g2"></span>';
        Q(".lx-g1", lb).textContent = a;
        // JAVA → Java, ADVANCED → Advanced 처럼 읽기 쉽게. GUI · API 같은 약어(3자 이하)는 그대로
        Q(".lx-g2", lb).textContent = rest.join(" · ").split(" ").map(w => w.length <= 3 ? w : w[0] + w.slice(1).toLowerCase()).join(" ");
      }
      g.insertAdjacentHTML("beforeend", '<span class="lx-gp" aria-hidden="true"></span>');
      const list = document.createElement("div");
      list.className = "lx-tabs"; list.dataset.g = g.dataset.g;
      tabBtns.filter(b => b.dataset.g === g.dataset.g).forEach(b => {
        const t = document.createElement("button");
        t.type = "button"; t.dataset.t = b.dataset.t;
        t.innerHTML = '<span class="ic"></span><span class="nm"></span><span class="fr"></span>';
        Q(".ic", t).textContent = tabIcon(b);
        Q(".nm", t).textContent = tabName(b);
        t.addEventListener("click", () => switchTab(b.dataset.t));
        list.appendChild(t);
      });
      g.after(list);
    });
    // 다른 가이드 9개는 접어 둔다 — 열림 상태는 기억
    const more = Q("nav.side .navmore");
    if (more && !more.closest("details")){
      const d = document.createElement("details");
      d.className = "lx-more";
      d.innerHTML = '<summary>다른 가이드 <span>' + QA("a", more).length + "</span></summary>";
      more.before(d); d.appendChild(more);
      d.open = !!S.moreOpen;
      d.addEventListener("toggle", () => { S.moreOpen = d.open; save(); });
    }
    // 목차 머리 — 지금 어느 탭의 목차인지
    QA("nav.side .navset[data-nav]").forEach(n => {
      const b = tabBtns.find(x => x.dataset.t === n.dataset.nav);
      const p = Q(".lx-prog", n);
      if (!b || !p || Q(".lx-tochd", n)) return;
      const h = document.createElement("div");
      h.className = "lx-tochd";
      h.textContent = "목차 · " + tabName(b);
      p.before(h);
    });
    // 탭이 바뀔 때 펼친 그룹 · 현재 탭 갱신
    const orig = window.switchTab;
    if (typeof orig === "function" && !orig.lxWrapped){
      window.switchTab = function(name){ const r = orig.apply(this, arguments); paint(); return r; };
      window.switchTab.lxWrapped = true;
    }
    // 읽는 섹션이 사이드바 밖으로 나가면 따라간다 (사이드바만 스크롤 · 본문은 그대로)
    let tk = 0;
    addEventListener("scroll", () => {
      if (tk) return;
      tk = requestAnimationFrame(() => {
        tk = 0;
        const a = Q("nav.side .navset.on a.on");
        if (!a) return;
        const sr = side.getBoundingClientRect(), ar = a.getBoundingClientRect();
        if (ar.top < sr.top + 90 || ar.bottom > sr.bottom - 40)
          side.scrollTop += ar.top - (sr.top + sr.height * 0.4);
      });
    }, { passive:true });
  })();
  function sideUpdate(byTab){
    if (!side) return;
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

  /* ---------- ③ 읽기 도구 ---------- */
  (function tool(){
    const anchor = Q("#lvFind");
    if (!anchor) return;
    const w = document.createElement("div");
    w.className = "lx-tool";
    w.innerHTML =
      '<button type="button" aria-haspopup="true" aria-expanded="false" title="읽기 설정 (글자 크기 · 집중 모드)">' +
        '<span aria-hidden="true">Aa</span><span class="lbl">읽기</span></button>' +
      '<div class="lx-pop" role="dialog" aria-label="읽기 설정">' +
        '<h6>글자 크기</h6><div class="lx-seg" data-k="fs">' +
          '<button type="button" data-v="s">작게</button><button type="button" data-v="m">보통</button>' +
          '<button type="button" data-v="l">크게</button><button type="button" data-v="xl">아주 크게</button></div>' +
        '<div class="lx-row"><span>집중 모드 <small style="color:var(--dim)">(사이드바 숨김)</small></span>' +
          '<button type="button" data-k="focus">켜기</button></div>' +
        '<div class="lx-row"><span>진도 기록</span><button type="button" data-k="reset">초기화</button></div>' +
        '<div class="lx-sum"></div>' +
      "</div>";
    anchor.before(w);
    const btn = w.firstElementChild;
    const open = v => { w.classList.toggle("open", v); btn.setAttribute("aria-expanded", v ? "true" : "false"); };
    btn.addEventListener("click", e => { e.stopPropagation(); open(!w.classList.contains("open")); });
    document.addEventListener("click", e => { if (!w.contains(e.target)) open(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") open(false); });
    let armed = 0;
    w.addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b || b === btn) return;
      if (b.closest('[data-k="fs"]')){ S.fs = b.dataset.v; }
      else if (b.dataset.k === "focus"){ S.focus = !S.focus; }
      else if (b.dataset.k === "reset"){
        // 브라우저 확인창 대신 두 번 누르기 — 실수로 지우지 않게
        if (Date.now() - armed > 3000){ armed = Date.now(); b.textContent = "한 번 더 누르면 지움"; return; }
        S.done = {}; armed = 0; b.textContent = "초기화";
      }
      save(); applyPrefs(); paint();
    });
  })();
  function applyPrefs(){
    const h = document.documentElement;
    if (S.fs && S.fs !== "m") h.dataset.fs = S.fs; else delete h.dataset.fs;
    h.classList.toggle("lx-focus", !!S.focus);
    QA('.lx-seg[data-k="fs"] button').forEach(b => b.setAttribute("aria-pressed", b.dataset.v === (S.fs || "m") ? "true" : "false"));
    const f = Q('.lx-pop [data-k="focus"]');
    if (f){ f.setAttribute("aria-pressed", S.focus ? "true" : "false"); f.textContent = S.focus ? "켜짐" : "켜기"; }
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
      x.focus();
      return;
    }
    const lb = e.target.closest(".lx-lb");
    if (lb && (e.target === lb || e.target.closest(".x"))) closeLb();
  });
  function closeLb(){ const lb = Q(".lx-lb"); if (!lb) return; lb.remove(); lbFrom?.focus({preventScroll:true}); lbFrom = null; }
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLb(); });

  if ("IntersectionObserver" in window){
    const io = new IntersectionObserver(es => es.forEach(en => {
      const d = en.target, svg = Q("svg", d), on = en.isIntersecting;
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
