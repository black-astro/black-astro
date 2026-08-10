/* ================================================================
   시각화 모델 공통 모션 (아홉 가이드 공용)
   ----------------------------------------------------------------
   흐름 점(.pk)의 animateMotion 은 경로 끝에 닿는 순간 시작점으로
   '순간이동' 하며 뚝 끊겨 보인다. 같은 dur · 같은 문서 시각(begin 0s)의
   opacity 애니메이션을 붙여, 끝에서 스르륵 사라지고 시작에서 스르륵
   나타나게 한다. SMIL 시계는 문서 기준이라 나중에 붙여도 위상이 맞는다.
   ================================================================ */
(function () {
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var SVG = "http://www.w3.org/2000/svg";
  document.querySelectorAll(".diag .pk").forEach(function (pk) {
    if (pk.dataset.fadeSync) return;
    var am = pk.querySelector("animateMotion");
    if (!am) return;
    pk.dataset.fadeSync = "1";
    var a = document.createElementNS(SVG, "animate");
    a.setAttribute("attributeName", "opacity");
    a.setAttribute("values", "0;1;1;0");
    a.setAttribute("keyTimes", "0;0.1;0.86;1");
    a.setAttribute("dur", am.getAttribute("dur") || "2.4s");
    a.setAttribute("begin", am.getAttribute("begin") || "0s");
    a.setAttribute("repeatCount", "indefinite");
    pk.appendChild(a);
  });
})();
