/* ============================================================
   0-b. 사이드바 주제 탭 — 그룹 접기 · 펼치기
   ------------------------------------------------------------
   탭이 10개를 넘으면서 사이드바 위쪽을 탭 버튼이 다 차지하고,
   정작 읽어야 할 목차가 화면 밖으로 밀려났다.

   그래서 '탭'만 접는다. 열려 있는 그룹은 항상 하나 —
   탭을 고르면 나머지 그룹은 접히고 그 자리에 목차가 바로 올라온다.
   (목차는 접지 않는다. 접는 순간 훑어보기가 안 된다.)

   HTML(11-sidebar.html)은 그대로 두고 여기서 런타임에 감싼다 —
   자바스크립트가 죽어도 탭은 '전부 펼쳐진' 평범한 목록으로 남는다.
   ============================================================ */
(function tabFold(){
  // 가이드마다 그룹 구성이 다르므로 저장 키를 경로로 나눈다
  const KEY  = "guide-tabfold:" + location.pathname.replace(/[^a-z-]/gi, "");
  const wrap = document.querySelector("nav.side .navtab");
  if (!wrap) return;

  let open = null;                            // 펼쳐 둔 그룹 하나 (없으면 전부 접힘)
  try { open = localStorage.getItem(KEY); } catch(e) {}
  const save = () => {
    try {
      open ? localStorage.setItem(KEY, open) : localStorage.removeItem(KEY);
    } catch(e) {}
  };

  /* .tgrp 뒤에 이어지는 .trow 들을 상자 하나로 묶는다 */
  const groups = [];
  let i = 0;
  [...wrap.children].forEach(el => {
    if (!el.classList.contains("tgrp")) return;

    const rows = [];
    let n = el.nextElementSibling;
    while (n && !n.classList.contains("tgrp")){ rows.push(n); n = n.nextElementSibling; }
    if (!rows.length) return;

    const key   = "g" + (i++);
    const label = el.textContent.trim();
    const count = rows.reduce((a, r) => a + r.querySelectorAll("button,a").length, 0);

    el.dataset.g = key;
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.innerHTML = `<span class="lb">${label}</span><span class="line"></span>` +
                   `<span class="cnt">${count}</span><span class="ar">▾</span>`;

    const box   = document.createElement("div");
    const inner = document.createElement("div");
    box.className = "tgbox";
    rows.forEach(r => inner.appendChild(r));
    box.appendChild(inner);
    el.after(box);

    groups.push({ key, grp: el, box });
  });
  if (!groups.length) return;

  function paint(){
    groups.forEach(g => {
      const on = g.key === open;
      g.grp.classList.toggle("fold", !on);
      g.grp.setAttribute("aria-expanded", on ? "true" : "false");
    });
  }
  function setOpen(key){        // 하나를 열면 나머지는 접힌다
    open = key;
    paint();
    save();
  }

  /* 지금 보고 있는 탭이 든 그룹 */
  const activeKey = () => {
    const on = wrap.querySelector("button.on");
    const g  = groups.find(x => x.box.contains(on));
    return g ? g.key : groups[0].key;
  };

  // 저장된 것이 없으면 '지금 보고 있는 그룹'을 연 채로 시작한다
  if (!open || !groups.some(g => g.key === open)) open = activeKey();
  paint();

  const toggle = grp => setOpen(grp.classList.contains("fold") ? grp.dataset.g : null);

  wrap.addEventListener("click", e => {
    const grp = e.target.closest(".tgrp[data-g]");
    if (grp) return toggle(grp);
  });
  wrap.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const grp = e.target.closest(".tgrp[data-g]");
    if (!grp) return;
    e.preventDefault();
    toggle(grp);
  });

  /* 탭을 고르면 그 그룹만 남기고 접는다 — 목차가 바로 위로 올라온다.
     (사이드바 버튼 · 상단 드롭다운 · 단축키 · 검색 어느 쪽이든 switchTab 을 거친다) */
  window.tabReveal = function(){ setOpen(activeKey()); };
})();


/* ============================================================
   0-c. 목차 난이도 점
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
  (side.querySelector(".navtab") || side).after(key);
});
