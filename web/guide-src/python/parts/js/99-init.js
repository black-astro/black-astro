/* ============================================================
   25. 초기화
   ============================================================ */
highlightLazy($("#pane-pandas"));
srStage(0);
dfPart("none", null);
gbGo(0);
strGo("strip", $("#strCtrl .chip"));
cutGo("cut3", $("#s20 .stage .chip"));
pfxFilter();
(function restoreTab(){
  let t = null;
  try { t = sessionStorage.getItem("dvg-tab"); } catch(e) {}
  if (!t) t = "python";                 // 첫 방문 기본 탭 = 파이썬 기초
  if (t !== "pandas" && $("#pane-" + t)) switchTab(t);
  markScrollables($(".pane.on"));
  highlightLazy($(".pane.on"));
  vizBuild($(".pane.on"));   // 보이는 탭의 마이크로 시각화만 전개 (나머지는 탭 전환 때)
  pauseOffscreenViz($(".pane.on"));
})();
