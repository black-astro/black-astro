/* ============================================================
   0-b. 사이드바 목차 — 그룹 접기 · 펼치기
   ------------------------------------------------------------
   탭이 늘어나면서 한 탭의 목차만 20줄을 넘기 시작했다.
   그래서 목차는 '그룹 제목만' 보여 주고, 필요한 그룹만 펼친다.

   HTML(11-sidebar.html)은 그대로 두고 여기서 런타임에 감싼다 —
   조각 5개(가이드마다 목차가 다름)를 손대지 않아도 되고,
   자바스크립트가 죽어도 목차는 '전부 펼쳐진' 평범한 목록으로 남는다.
   ============================================================ */
(function navFold(){
  // 가이드마다 탭 키가 겹치므로(deep · tool …) 저장 키를 경로로 나눈다
  const KEY  = "guide-navfold:" + location.pathname.replace(/[^a-z-]/gi, "");
  const side = document.querySelector("nav.side");
  if (!side) return;

  let open;                                  // 펼쳐 둔 그룹 키
  try { open = new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); }
  catch(e){ open = new Set(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...open])); } catch(e){} };

  /* .grp 뒤에 이어지는 링크들을 상자 하나로 묶는다 */
  side.querySelectorAll(".navset").forEach(ns => {
    const tab = ns.dataset.nav || "";
    let i = 0;
    [...ns.children].forEach(el => {
      if (!el.classList.contains("grp")) return;

      const links = [];
      let n = el.nextElementSibling;
      while (n && !n.classList.contains("grp")){ links.push(n); n = n.nextElementSibling; }
      if (!links.length) return;

      const key = tab + ":" + (i++);
      const label = el.textContent.trim();
      el.dataset.g = key;
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.innerHTML = `<span class="lb">${label}</span>` +
                     `<span class="cnt">${links.length}</span>` +
                     `<span class="ar">▾</span>`;

      const box   = document.createElement("div");
      const inner = document.createElement("div");
      box.className = "grpbox";
      links.forEach(l => inner.appendChild(l));
      box.appendChild(inner);
      el.after(box);

      const on = open.has(key);
      el.classList.toggle("fold", !on);
      el.setAttribute("aria-expanded", on ? "true" : "false");
    });
  });

  function setOpen(grp, want){
    const key = grp.dataset.g;
    if (!key) return;
    grp.classList.toggle("fold", !want);
    grp.setAttribute("aria-expanded", want ? "true" : "false");
    want ? open.add(key) : open.delete(key);
  }

  side.addEventListener("click", e => {
    const grp = e.target.closest(".navset .grp");
    if (!grp || !grp.dataset.g) return;
    setOpen(grp, grp.classList.contains("fold"));
    save();
  });
  side.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const grp = e.target.closest(".navset .grp");
    if (!grp || !grp.dataset.g) return;
    e.preventDefault();
    setOpen(grp, grp.classList.contains("fold"));
    save();
  });

  /* 전부 펼치기 · 접기 (현재 탭 기준) */
  window.navAll = function(want){
    const ns = side.querySelector(".navset.on") || side.querySelector(".navset");
    if (!ns) return;
    ns.querySelectorAll(".grp[data-g]").forEach(g => setOpen(g, want));
    save();
  };

  /* 지금 읽고 있는 섹션이 접힌 그룹 안이면 그 그룹만 살짝 펼쳐 준다.
     (사용자가 접어 둔 '기억'은 건드리지 않는다 — 표시만 열어 둔다) */
  let lastId = "";
  window.navReveal = function(id){
    const a = id ? side.querySelector(`.navset.on a[href="#${id}"]`)
                 : side.querySelector(".navset.on a.on");
    if (!a) return;
    const box = a.closest(".grpbox");
    if (!box) return;
    const grp = box.previousElementSibling;
    if (!grp || !grp.classList.contains("fold")) return;
    if (grp.dataset.g === lastId) return;
    lastId = grp.dataset.g;
    grp.classList.remove("fold");
    grp.setAttribute("aria-expanded", "true");
    grp.classList.add("auto");                // '자동으로 열린 그룹' 표시
  };

  /* 현재 그룹에 읽는 중인 섹션이 있으면 점을 찍는다 */
  window.navMark = function(){
    side.querySelectorAll(".navset.on .grp[data-g]").forEach(g => {
      const box = g.nextElementSibling;
      g.classList.toggle("hasOn", !!(box && box.querySelector("a.on")));
    });
  };
})();
