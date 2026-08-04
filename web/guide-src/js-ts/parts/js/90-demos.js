/* ============================================================
   2. 데모 — 목적별 도구 찾기 필터 (o13)
   ============================================================ */
function dtxFilter(){
  const q = ($("#dtxQ")?.value || "").trim().toLowerCase();
  const rows = $$("#dtxTable tbody tr");
  let n = 0;
  rows.forEach(tr => {
    const hay = ((tr.dataset.k || "") + " " + tr.textContent).toLowerCase();
    const ok = !q || q.split(/\s+/).every(t => hay.includes(t));
    tr.style.display = ok ? "" : "none";
    if (ok) n++;
  });
  const c = $("#dtxCount");
  if (c) c.textContent = q
    ? `${n}개 찾음 — 원하는 게 없으면 다른 낱말로 (예: 검증 · 로그 · 큐 · 이미지)`
    : `전체 ${rows.length}개 · 위 칸에 하려는 일을 한글로 입력해 보세요`;
}
function dtxSet(q){
  const inp = $("#dtxQ");
  if (!inp) return;
  inp.value = q;
  dtxFilter();
  if (q) inp.focus();
}

/* 탭별 최초 1회 초기화 */
TAB_INIT.tool = function(){ dtxFilter(); };
