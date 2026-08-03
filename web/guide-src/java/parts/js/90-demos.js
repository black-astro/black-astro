/* ============================================================
   2. 데모 — 목적별 도구 찾기 필터 (t12)
   ============================================================ */
function jtxFilter(){
  const q = ($("#jfxQ")?.value || "").trim().toLowerCase();
  const rows = $$("#jtxTable tbody tr");
  let n = 0;
  rows.forEach(tr => {
    const hay = ((tr.dataset.k || "") + " " + tr.textContent).toLowerCase();
    const ok = !q || q.split(/\s+/).every(t => hay.includes(t));
    tr.style.display = ok ? "" : "none";
    if (ok) n++;
  });
  const c = $("#jtxCount");
  if (c) c.textContent = q
    ? `${n}개 찾음 — 원하는 게 없으면 다른 낱말로 (예: 엑셀 · 로그 · 캐시 · 테스트)`
    : `전체 ${rows.length}개 · 위 칸에 하려는 일을 한글로 입력해 보세요`;
}
function jtxSet(q){
  const inp = $("#jfxQ");
  if (!inp) return;
  inp.value = q;
  jtxFilter();
  if (q) inp.focus();
}

/* 탭별 최초 1회 초기화 */
TAB_INIT.tool = function(){ jtxFilter(); };
