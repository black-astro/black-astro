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
    const tot = secs.length, dn = secs.filter(s => S.done[s.id]).length, pct = tot ? Math.round(dn / tot * 100) : 0;
    const sum = Q(".lx-pop .lx-sum");
    if (sum) sum.innerHTML = "이 가이드 <b>" + dn + " / " + tot + "</b> 섹션을 읽었습니다.";
    const pc = Q(".lx-pop .lx-pct"); if (pc) pc.textContent = pct + "%";
    const pb = Q(".lx-pop .lx-pbar i"); if (pb) pb.style.transform = "scaleX(" + (tot ? dn / tot : 0) + ")";
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
    // 가이드 목록 — 열 가이드를 어디서 봐도 같은 순서로, 지금 보는 가이드도 그 자리에 표시.
    // (예전엔 가이드마다 "나를 뺀 9개"를 제각각 순서로 나열해 위치가 매번 달랐다.) 접힘 상태는 공통으로 기억.
    const more = Q("nav.side .navmore");
    if (more && !more.closest("details")){
      const GUIDES = [["java","☕","Java"],["kotlin","🟠","Kotlin"],["python","🐍","Python"],["js-ts","🟨","JS · TS"],
        ["csharp","🟣","C# · Unity"],["cpp","🔵","C++"],["rust","🦀","Rust"],["db","🗄️","DB"],["server","🌐","서버기술"],["cs","🎓","CS 기술"]];
      const titles = {};
      QA("a", more).forEach(a => { const m = a.getAttribute("href").match(/([\w-]+)-web/); if (m) titles[m[1]] = a.title; });
      more.innerHTML = "";
      for (const [g, ic, name] of GUIDES){
        const cur = g === GUIDE;
        const el = document.createElement(cur ? "span" : "a");
        el.className = "dlbtn" + (cur ? " cur" : "");
        if (cur){ el.setAttribute("aria-current", "page"); el.title = "지금 보고 있는 가이드"; }
        else { el.href = "../" + g + "-web/"; el.title = titles[g] || name + " 가이드로 이동"; }
        el.innerHTML = '<span class="gi" aria-hidden="true">' + ic + '</span><span class="gn"></span>';
        Q(".gn", el).textContent = name;
        more.appendChild(el);
      }
      // 미리 불러오기 — 가이드 링크에 마우스를 올리거나 누르기 시작하면 다음 가이드를 미리 렌더해 둔다.
      // (eagerness moderate = 호버 약 200ms). 지원 안 하면 prefetch 링크로 HTML 만이라도 받아 둔다.
      if (HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")){
        const sr = document.createElement("script");
        sr.type = "speculationrules";
        sr.textContent = JSON.stringify({ prerender:[{ where:{ selector_matches:"nav.side .navmore a.dlbtn" }, eagerness:"moderate" }] });
        document.head.appendChild(sr);
      } else {
        more.addEventListener("pointerover", e => {
          const a = e.target.closest("a.dlbtn");
          if (!a || a.dataset.pf) return;
          a.dataset.pf = "1";
          const l = document.createElement("link"); l.rel = "prefetch"; l.href = a.href; document.head.appendChild(l);
        });
      }
      const curName = (GUIDES.find(x => x[0] === GUIDE) || [, , ""])[2];
      const d = document.createElement("details");
      d.className = "lx-more";
      d.innerHTML = "<summary>가이드 <b></b><span>" + GUIDES.length + "</span></summary>";
      Q("summary b", d).textContent = curName;
      more.before(d); d.appendChild(more);
      let open = false; try { open = localStorage.getItem("lx:guides") === "1"; } catch(e){}
      d.open = open;
      d.addEventListener("toggle", () => { try { localStorage.setItem("lx:guides", d.open ? "1" : "0"); } catch(e){} });
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

  /* ---------- ②-c 테마 전환 (라이트 ↔ 다크) ----------
     선적용은 <head> 스크립트가 한다. 여기서는 버튼과 OS 설정 변경 추적만.
     사용자가 한 번 고르면 그 값(lx:theme)을 전 가이드가 함께 쓴다. */
  (function theme(){
    const anchor = Q("#lvFind");
    if (!anchor) return;
    const h = document.documentElement;
    const SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    const MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
    const b = document.createElement("button");
    b.type = "button"; b.className = "lx-theme";
    const paintBtn = () => {
      const light = h.getAttribute("data-theme") === "light";
      // 버튼은 "누르면 바뀔 테마"를 보여 준다
      b.innerHTML = (light ? MOON : SUN) + '<span class="lbl">' + (light ? "다크" : "라이트") + "</span>";
      b.title = light ? "다크 테마로 바꾸기" : "라이트 테마로 바꾸기";
      b.setAttribute("aria-label", b.title);
    };
    const set = (t, remember) => {
      h.setAttribute("data-theme", t);
      if (remember) try { localStorage.setItem("lx:theme", t); } catch(e){}
      paintBtn();
    };
    b.addEventListener("click", () => set(h.getAttribute("data-theme") === "light" ? "dark" : "light", true));
    anchor.before(b);
    if (!h.hasAttribute("data-theme")) h.setAttribute("data-theme", "dark");
    paintBtn();
    new MutationObserver(paintBtn).observe(h, { attributes:true, attributeFilter:["data-theme"] });
    // 직접 고른 적이 없으면 OS 설정이 바뀔 때 따라간다
    const mq = window.matchMedia && matchMedia("(prefers-color-scheme: light)");
    mq && mq.addEventListener && mq.addEventListener("change", e => {
      let saved = null; try { saved = localStorage.getItem("lx:theme"); } catch(err){}
      if (saved !== "light" && saved !== "dark") set(e.matches ? "light" : "dark", false);
    });
  })();

  /* ---------- ③ 읽기 설정 (전 가이드 공통) ----------
     글자 크기 · 줄 간격 · 사이드바 접기 · 집중 모드 · 테마 · 진도.
     옵션은 lx:prefs 한 키에 저장해 모든 가이드가 같이 쓴다(진도만 가이드별 st:<가이드>).
     첫 그리기 전 적용은 <head> 스크립트가 하고, 여기서는 바꿀 때만 반영한다. */
  const PKEY = "lx:prefs";
  let P = { fs:"m", lh:"n", side:false, focus:false };
  try { Object.assign(P, JSON.parse(localStorage.getItem(PKEY) || "{}")); } catch(e){}
  if (S.fs && S.fs !== "m" && P.fs === "m") P.fs = S.fs;          // 예전(가이드별) 저장값 옮기기
  if (S.focus && !P.focus) P.focus = true;
  const saveP = () => { try { localStorage.setItem(PKEY, JSON.stringify(P)); } catch(e){} };
  const ICON_SIDE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M9 4v16"/></svg>';
  const ICON_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  // 상단 사이드바 접기 버튼 — 탭바 맨 앞
  (function sideToggle(){
    const bar = Q("#tabbar") || Q(".tabbar");
    if (!bar || Q(".lx-sidebtn", bar)) return;
    const b = document.createElement("button");
    b.type = "button"; b.className = "lx-sidebtn";
    b.innerHTML = ICON_SIDE;
    b.addEventListener("click", () => { P.side = !P.side; saveP(); applyPrefs(); });
    bar.prepend(b);
  })();

  (function tool(){
    const anchor = Q("#lvFind");
    if (!anchor) return;
    const w = document.createElement("div");
    w.className = "lx-tool";
    const seg = (k, items) => '<div class="lx-seg" data-k="' + k + '" role="group">' +
      items.map(([v, label, aria]) => '<button type="button" data-v="' + v + '"' + (aria ? ' aria-label="' + aria + '"' : "") + ">" + label + "</button>").join("") + "</div>";
    const sw = (k, title, desc) => '<label class="lx-sw"><span><b>' + title + "</b>" + (desc ? "<small>" + desc + "</small>" : "") +
      '</span><input type="checkbox" data-k="' + k + '"><i aria-hidden="true"></i></label>';
    w.innerHTML =
      '<button type="button" class="lx-toolbtn" aria-haspopup="dialog" aria-expanded="false" title="읽기 설정">' +
        '<span class="aa" aria-hidden="true">Aa</span><span class="lbl">읽기 설정</span></button>' +
      '<div class="lx-pop" role="dialog" aria-label="읽기 설정">' +
        '<div class="lx-pop-h"><b>읽기 설정</b><button type="button" class="lx-x" aria-label="닫기">' + ICON_X + "</button></div>" +
        '<section><h6>글자 크기</h6>' +
          seg("fs", [["s", '<span style="font-size:12px">가</span>', "작게"], ["m", '<span style="font-size:14px">가</span>', "보통"],
                     ["l", '<span style="font-size:16.5px">가</span>', "크게"], ["xl", '<span style="font-size:19px">가</span>', "아주 크게"]]) +
          '<p class="lx-prev">자바는 <b>JVM</b> 위에서 돕니다. 한 줄은 이 정도 크기로 읽힙니다.</p></section>' +
        '<section><h6>줄 간격</h6>' + seg("lh", [["n", "보통"], ["w", "넓게"]]) + "</section>" +
        "<section><h6>화면</h6>" +
          sw("side", "사이드바 접기", "목차를 숨기고 본문을 넓게") +
          sw("focus", "집중 모드", "가운데 좁은 한 열로만") +
          '<div class="lx-line"><span><b>테마</b></span>' + seg("theme", [["light", "라이트"], ["dark", "다크"]]) + "</div>" +
        "</section>" +
        '<section class="lx-progress"><h6>학습 진도 <span class="lx-pct"></span></h6>' +
          '<div class="lx-pbar"><i></i></div><p class="lx-sum"></p>' +
          '<button type="button" class="lx-reset" data-k="reset">진도 초기화</button></section>' +
        '<p class="lx-note">설정은 이 브라우저에 저장되어 모든 가이드에 함께 적용됩니다.</p>' +
      "</div>";
    anchor.before(w);
    const btn = Q(".lx-toolbtn", w);
    const open = v => {
      w.classList.toggle("open", v); btn.setAttribute("aria-expanded", v ? "true" : "false");
      if (v) Q('.lx-seg[data-k="fs"] [aria-pressed="true"]', w)?.focus({ preventScroll:true });
    };
    btn.addEventListener("click", e => { e.stopPropagation(); open(!w.classList.contains("open")); });
    Q(".lx-x", w).addEventListener("click", () => { open(false); btn.focus(); });
    document.addEventListener("click", e => { if (!w.contains(e.target)) open(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && w.classList.contains("open")){ open(false); btn.focus(); } });
    let armed = 0;
    w.addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b || b === btn || b.classList.contains("lx-x")) return;
      const k = b.closest("[data-k]")?.dataset.k;
      if (k === "fs") P.fs = b.dataset.v;
      else if (k === "lh") P.lh = b.dataset.v;
      else if (k === "theme"){
        document.documentElement.setAttribute("data-theme", b.dataset.v);
        try { localStorage.setItem("lx:theme", b.dataset.v); } catch(err){}
      }
      else if (k === "reset"){
        // 브라우저 확인창 대신 두 번 누르기 — 실수로 지우지 않게
        if (Date.now() - armed > 3000){ armed = Date.now(); b.textContent = "한 번 더 누르면 지워집니다"; b.classList.add("armed"); return; }
        S.done = {}; armed = 0; b.textContent = "진도 초기화"; b.classList.remove("armed"); save();
      }
      else return;
      saveP(); applyPrefs(); paint();
    });
    w.addEventListener("change", e => {
      const k = e.target.dataset.k;
      if (k === "side") P.side = e.target.checked;
      else if (k === "focus") P.focus = e.target.checked;
      else return;
      saveP(); applyPrefs();
    });
    new MutationObserver(applyPrefs).observe(document.documentElement, { attributes:true, attributeFilter:["data-theme"] });
  })();
  function applyPrefs(){
    const h = document.documentElement;
    if (P.fs && P.fs !== "m") h.dataset.fs = P.fs; else delete h.dataset.fs;
    if (P.lh === "w") h.dataset.lh = "w"; else delete h.dataset.lh;
    h.classList.toggle("lx-side-off", !!P.side);
    h.classList.toggle("lx-focus", !!P.focus);
    const press = (k, v) => QA('.lx-seg[data-k="' + k + '"] button').forEach(b => b.setAttribute("aria-pressed", b.dataset.v === v ? "true" : "false"));
    press("fs", P.fs || "m"); press("lh", P.lh || "n"); press("theme", h.getAttribute("data-theme") || "dark");
    const sideIn = Q('.lx-pop input[data-k="side"]'); if (sideIn) sideIn.checked = !!P.side;
    const focIn = Q('.lx-pop input[data-k="focus"]'); if (focIn) focIn.checked = !!P.focus;
    const sb = Q(".lx-sidebtn");
    if (sb){
      const off = !!(P.side || P.focus);
      sb.setAttribute("aria-pressed", off ? "true" : "false");
      sb.title = off ? "사이드바 펼치기" : "사이드바 접기";
      sb.setAttribute("aria-label", sb.title);
    }
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
