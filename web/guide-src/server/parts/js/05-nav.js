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

  /* 그룹 클릭 — 그 그룹의 첫 탭으로 옮긴다 (헤더 줄과 목차가 함께 바뀐다) */
  window.pickGroup = function(i){
    const g = String(i);
    const first = btns.find(b => b.dataset.g === g);
    if (!first) return;
    const cur = btns.find(b => b.classList.contains("on"));
    show(g);
    if (!cur || cur.dataset.g !== g) switchTab(first.dataset.t);
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
    document.body.appendChild(pop);

    let timer = null;
    const hide = () => { clearTimeout(timer); pop.classList.remove("on"); };
    const lazyHide = () => { clearTimeout(timer); timer = setTimeout(hide, 220); };
    const keep = () => clearTimeout(timer);

    function open(grp){
      keep();
      const g = grp.dataset.g;
      pop.innerHTML = "";
      btns.filter(b => b.dataset.g === g).forEach(src => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = src.classList.contains("on") ? "on" : "";
        b.innerHTML = src.innerHTML;
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
    addEventListener("scroll", hide, {passive:true});
    addEventListener("blur", hide);
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
