/* ============================================================
   3. 초기화
   ============================================================ */
highlightLazy($("#pane-core"));
(function restoreTab(){
  let t = null;
  try { t = sessionStorage.getItem("jvg-tab"); } catch(e) {}
  if (!t) t = "core";                    // 첫 방문 기본 탭
  if (t !== "core" && $("#pane-" + t)) switchTab(t);
  markScrollables($(".pane.on"));
  highlightLazy($(".pane.on"));
})();
