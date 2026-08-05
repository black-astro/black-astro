/* ============================================================
   2. 데모 — 목적별 도구 찾기 필터 (실전 도구 탭)
   ============================================================ */
function ctxFilter(){
  const q = ($("#ctxQ")?.value || "").trim().toLowerCase();
  const rows = $$("#ctxTable tbody tr");
  let n = 0;
  rows.forEach(tr => {
    const hay = ((tr.dataset.k || "") + " " + tr.textContent).toLowerCase();
    const ok = !q || q.split(/\s+/).every(t => hay.includes(t));
    tr.style.display = ok ? "" : "none";
    if (ok) n++;
  });
  const c = $("#ctxCount");
  if (c) c.textContent = q
    ? `${n}개 찾음 — 원하는 게 없으면 다른 낱말로 (예: 로그 · 직렬화 · 부하 · 프로파일)`
    : `전체 ${rows.length}개 · 위 칸에 하려는 일을 한글로 입력해 보세요`;
}
function ctxSet(q){
  const inp = $("#ctxQ");
  if (!inp) return;
  inp.value = q;
  ctxFilter();
  if (q) inp.focus();
}

/* 탭별 최초 1회 초기화 */
TAB_INIT.tool = function(){ ctxFilter(); };
