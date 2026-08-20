/* ============================================================
   2. 데모 — 목적별 도구 찾기 (to14)
   ============================================================ */
function ktxFilter(){
  const q = ($("#ktxQ")?.value || "").trim().toLowerCase();
  const rows = $$("#ktxTable tbody tr");
  let n = 0;
  rows.forEach(tr => {
    const hay = ((tr.dataset.k || "") + " " + tr.textContent).toLowerCase();
    const ok = !q || q.split(/\s+/).every(t => hay.includes(t));
    tr.style.display = ok ? "" : "none";
    if (ok) n++;
  });
  const c = $("#ktxCount");
  if (c) c.textContent = q
    ? `${n}개 찾음 — 원하는 게 없으면 다른 낱말로 (예: 캐시 · 배포 · 이미지 · 문서)`
    : `전체 ${rows.length}개 · 위 칸에 하려는 일을 한글로 입력해 보세요`;
}
function ktxSet(q){
  const inp = $("#ktxQ");
  if (!inp) return;
  inp.value = q;
  ktxFilter();
  if (q) inp.focus();
}

/* 탭별 최초 1회 초기화 */
TAB_INIT.tool = function(){ ktxFilter(); };
