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

  /* 탭이 바뀌면(단축키 · 검색 · 모바일 드롭다운) 그 탭이 속한 그룹으로 맞춘다 */
  window.tabReveal = function(){
    const on = btns.find(b => b.classList.contains("on"));
    if (on) show(on.dataset.g);
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
