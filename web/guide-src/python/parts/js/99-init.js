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
(function initTab(){
  // 이전 탭 복원은 하지 않는다 — 언제 열어도 첫 탭에서 시작 (예측 가능하게)
  switchTab("python");
  markScrollables($(".pane.on"));
  highlightLazy($(".pane.on"));
  vizBuild($(".pane.on"));   // 보이는 탭의 마이크로 시각화만 전개 (나머지는 탭 전환 때)
  pauseOffscreenViz($(".pane.on"));
})();
