/* ============================================================
   3. 초기화
   ============================================================ */
highlightLazy($("#pane-math"));
(function restoreTab(){
  let t = null;
  try { t = sessionStorage.getItem("csg-tab"); } catch(e) {}
  if (!t) t = "math";                    // 첫 방문 기본 탭
  if (t !== "math" && $("#pane-" + t)) switchTab(t);
  markScrollables($(".pane.on"));
  highlightLazy($(".pane.on"));
})();
