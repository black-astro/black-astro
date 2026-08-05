/* ============================================================
   3. 초기화
   ============================================================ */
highlightLazy($("#pane-start"));
svGo("nginx", $('#svPick button[data-sv="nginx"]'));
cheatFilter("errQ", "errTable", "errCount");
(function restoreTab(){
  let t = null;
  try { t = sessionStorage.getItem("wsg-tab"); } catch(e) {}
  if (!t) t = "start";                   // 첫 방문 기본 탭 = 시작·개념
  if (t !== "start" && $("#pane-" + t)) switchTab(t);
  markScrollables($(".pane.on"));
  highlightLazy($(".pane.on"));
})();
