/* ============================================================
   3. 초기화
   ============================================================ */
highlightLazy($("#pane-lang"));
(function restoreTab(){
  let t = null;
  try { t = sessionStorage.getItem("rustg-tab"); } catch(e) {}
  if (!t) t = "lang";                    // 첫 방문 기본 탭
  if (t !== "lang" && $("#pane-" + t)) switchTab(t);
  markScrollables($(".pane.on"));
  highlightLazy($(".pane.on"));
})();
