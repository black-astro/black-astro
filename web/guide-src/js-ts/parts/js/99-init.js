/* ============================================================
   3. 초기화
   ============================================================ */
highlightLazy($("#pane-js"));
(function restoreTab(){
  let t = null;
  try { t = sessionStorage.getItem("jsg-tab"); } catch(e) {}
  if (!t) t = "js";                      // 첫 방문 기본 탭
  if (t !== "js" && $("#pane-" + t)) switchTab(t);
  markScrollables($(".pane.on"));
  highlightLazy($(".pane.on"));
})();
