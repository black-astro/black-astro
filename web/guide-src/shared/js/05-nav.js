/* ============================================================
   0-b. 사이드바 = 그룹 · 헤더 = 그 그룹의 탭
   ------------------------------------------------------------
   탭이 열몇 개가 되면서, 사이드바에 탭을 다 세우면 목차가 밀리고
   접어 두면 무엇이 있는지 판단이 안 됐다.

   그래서 둘로 나눴다 —
     · 사이드바에는 '그룹'만 (언어 · 데이터 · 웹 · 심화 …) 늘 다 보인다
     · 헤더에는 '지금 그룹의 탭'만 가로로
   그룹을 고르면 헤더의 탭 줄이 통째로 바뀌고 그 그룹의 첫 탭으로 옮긴다.
   목차는 접지 않는다 — 접는 순간 훑어보기가 안 되기 때문이다.
   ============================================================ */
(function groupNav(){
  const side = document.querySelector("nav.side .navgrp");
  const row  = document.getElementById("tabrow");
  if (!side || !row) return;

  const btns = [...row.querySelectorAll("button[data-g]")];
  const grps = [...side.querySelectorAll("button[data-g]")];

  /* 헤더에는 고른 그룹의 탭만 남긴다 */
  function show(g){
    btns.forEach(b => b.classList.toggle("off", b.dataset.g !== g));
    grps.forEach(x => x.classList.toggle("on", x.dataset.g === g));
    row.scrollLeft = 0;
  }

  /* 그룹 클릭 — 언제나 그 그룹의 첫 탭으로 옮긴다 (헤더 줄과 목차가 함께 바뀐다).
     같은 그룹을 다시 눌러도 첫 탭으로 — "그룹을 고르면 항상 맨 위 탭"이라는
     예측 가능한 규칙 하나만 남긴다. */
  window.pickGroup = function(i){
    const g = String(i);
    const first = btns.find(b => b.dataset.g === g);
    if (!first) return;
    show(g);
    switchTab(first.dataset.t);
  };

  /* ── 모바일 드롭다운도 같은 2단(그룹 → 탭) ──
     좁은 화면에는 사이드바가 없으므로 시트 안에서 그룹을 골라야 한다.
     그룹을 눌러도 시트는 닫지 않는다 — 탭까지 고르고 나가야 하기 때문이다. */
  const sheet  = document.getElementById("tabs");
  const sTabs  = sheet ? [...sheet.querySelectorAll(".tabsl > [data-g]")] : [];
  const sGrps  = sheet ? [...sheet.querySelectorAll(".tabsg button[data-sg]")] : [];

  function showSheet(g){
    sTabs.forEach(b => b.classList.toggle("off", b.dataset.g !== g));
    sGrps.forEach(x => x.classList.toggle("on", x.dataset.sg === g));
  }
  window.pickSheet = function(g){ showSheet(String(g)); };

  /* ── 그룹에 마우스를 올리면 그 안의 탭을 옆으로 펼친다 ──
     그룹을 눌러 첫 탭으로 간 다음 헤더에서 다시 고르는 두 번을
     한 번으로 줄인다. 사이드바는 세로 스크롤 영역이라 잘리지 않도록
     팝오버는 body 에 붙이고 위치만 계산한다. */
  if (matchMedia("(hover:hover)").matches){
    const pop = document.createElement("div");
    pop.className = "ngpop";
    /* 탭바에 있는 버튼을 그대로 비추는 마우스용 지름길이다.
       읽어 주는 화면에는 사이드바 그룹과 탭바가 이미 있으므로
       여기까지 읽으면 같은 말을 세 번 하게 된다 — 그래서 숨긴다. */
    pop.setAttribute("aria-hidden", "true");
    document.body.appendChild(pop);

    let timer = null;
    const hide = () => { clearTimeout(timer); pop.classList.remove("on"); };
    const lazyHide = () => { clearTimeout(timer); timer = setTimeout(hide, 220); };
    const keep = () => clearTimeout(timer);

    function open(grp){
      keep();
      const g = grp.dataset.g;
      pop.replaceChildren();
      btns.filter(b => b.dataset.g === g).forEach(src => {
        const b = document.createElement("button");
        b.type = "button";
        b.tabIndex = -1;                            // aria-hidden 안에는 포커스가 들어가면 안 된다
        b.className = src.classList.contains("on") ? "on" : "";
        b.append(...[...src.childNodes].map(n => n.cloneNode(true)));
        b.addEventListener("click", () => { switchTab(src.dataset.t); hide(); });
        pop.appendChild(b);
      });
      if (!pop.children.length) return;

      pop.classList.add("on");
      const r = grp.getBoundingClientRect();
      pop.style.left = (r.right + 8) + "px";
      pop.style.top  = "0px";                       // 높이를 재기 전에 초기화
      const h = pop.offsetHeight;
      const top = Math.min(Math.max(8, r.top - 4), innerHeight - h - 8);
      pop.style.top = top + "px";
    }

    grps.forEach(grp => {
      grp.addEventListener("mouseenter", () => open(grp));
      grp.addEventListener("mouseleave", lazyHide);
      grp.addEventListener("focus", () => open(grp));
    });
    pop.addEventListener("mouseenter", keep);
    pop.addEventListener("mouseleave", lazyHide);
    /* 팝오버는 body 에 붙어 있고 위치는 열 때 한 번 계산한 값이다.
       그래서 무엇이든 스크롤되면 가리키던 그룹과 어긋난다.
       스크롤은 거품처럼 올라오지 않으므로(캡처 단계에서만 잡힌다)
       사이드바 안쪽 스크롤까지 받으려면 capture 가 필요하다.
       닫혀 있을 때는 아무것도 하지 않도록 먼저 걸러 낸다 —
       이 리스너는 문서의 모든 스크롤에 붙기 때문이다. */
    addEventListener("scroll", () => { if (pop.classList.contains("on")) hide(); },
                     {passive:true, capture:true});
    addEventListener("blur", hide);
    addEventListener("resize", hide);
    document.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });

    /* 키보드로 사이드바를 빠져나가면 (focus 로 열린 팝오버가) 남지 않도록.
       ★ 팝오버 자신은 반드시 빼야 한다 —
       팝오버 버튼을 누르면 mousedown 단계에서 그 버튼이 포커스를 받는데,
       팝오버는 body 에 붙어 있어 side.contains() 가 false 다.
       여기서 닫아 버리면 display:none 이 되어 버튼이 사라지고,
       mouseup 이 갈 곳을 잃어 click 이 아예 발생하지 않는다
       (= 눌러도 탭이 바뀌지 않는다). */
    document.addEventListener("focusin", e => {
      if (!side.contains(e.target) && !pop.contains(e.target)) hide();
    });
  }

  /* 탭이 바뀌면(단축키 · 검색 · 시트) 그 탭이 속한 그룹으로 양쪽을 맞춘다 */
  window.tabReveal = function(){
    const on = btns.find(b => b.classList.contains("on"));
    if (!on) return;
    show(on.dataset.g);
    showSheet(on.dataset.g);
  };
  tabReveal();
})();


/* ============================================================
   0-b-2. 탭 버튼과 내용을 서로 가리키게 (읽어 주는 화면)
   ------------------------------------------------------------
   버튼에는 role="tab" 이 있는데 정작 내용 쪽에는 아무 표시가 없었다.
   그래서 낭독기가 "탭"이라고 읽어도 그 탭이 무엇을 여는지,
   지금 읽고 있는 본문이 어느 탭에 속한 것인지는 알려 주지 못했다.
   id 로 양쪽을 묶어 두면 그 두 가지가 함께 읽힌다.

   HTML 을 손대지 않고 여기서 붙이는 이유는, 탭과 pane 이
   가이드마다 열 몇 개씩이라 손으로 맞추면 반드시 어긋나기 때문이다.
   ============================================================ */
(function linkTabPanels(){
  const row = document.getElementById("tabrow");
  if (!row) return;
  const tabs = [...document.querySelectorAll('button[role="tab"][data-t]')];

  document.querySelectorAll(".pane[id]").forEach(pane => {
    if (!pane.id.startsWith("pane-")) return;
    const name = pane.id.slice(5);
    const mine = tabs.filter(b => b.dataset.t === name);
    if (!mine.length) return;

    // 이름표는 헤더 줄의 버튼 하나로 정한다 (시트에도 같은 탭이 한 벌 더 있다)
    const label = mine.find(b => row.contains(b)) || mine[0];
    if (!label.id) label.id = "tabbtn-" + name;

    mine.forEach(b => b.setAttribute("aria-controls", pane.id));
    pane.setAttribute("role", "tabpanel");
    pane.setAttribute("aria-labelledby", label.id);
  });
})();


/* ============================================================
   0-c. 목차 난이도 색
   ------------------------------------------------------------
   같은 목차를 초보자는 "어디까지가 기본인가"로 읽고,
   경력자는 "어디부터 볼 게 있나"로 읽는다.
   앞의 번호에 색만 입히면 둘 다 훑는 순간 답이 나온다
   (요소를 덧붙이면 제목이 밀려 두 줄이 되므로 색만 쓴다).

   SEC_LV 는 뒤(20-tab-switch.js)에서 선언되므로
   현재 스크립트가 끝난 뒤에 실행한다.
   ============================================================ */
queueMicrotask(() => {
  if (typeof SEC_LV === "undefined") return;
  const NAME = { b: "기초", i: "중급", a: "고급" };
  const side = document.querySelector("nav.side");
  if (!side) return;

  let any = false;
  side.querySelectorAll('.navset a[href^="#"]').forEach(a => {
    const lv = SEC_LV[a.getAttribute("href").slice(1)];
    const em = a.querySelector("em");
    if (!lv || !NAME[lv] || !em) return;
    em.classList.add("lv-" + lv);
    a.title = NAME[lv];
    any = true;
  });
  if (!any) return;

  const key = document.createElement("div");
  key.className = "lvkey";
  key.innerHTML = Object.entries(NAME)
    .map(([k, v]) => `<span class="${k}">${v}</span>`).join("");
  (side.querySelector(".navmore") || side.querySelector(".navgrp") || side).after(key);
});
