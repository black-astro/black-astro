/* ============================================================
   3. 초기화
   ============================================================ */
highlightLazy($("#pane-start"));
dbGo("pg", $('#dbPick button[data-db="pg"]'));
(function restoreTab(){
  let t = null;
  try { t = sessionStorage.getItem("dbg-tab"); } catch(e) {}
  if (!t) t = "start";                   // 첫 방문 기본 탭 = 시작·설치
  if (t !== "start" && $("#pane-" + t)) switchTab(t);
  markScrollables($(".pane.on"));
  highlightLazy($(".pane.on"));
})();
