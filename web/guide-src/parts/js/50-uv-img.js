/* ============================================================
   20. UV 탭 데모
   ============================================================ */
function uvRace(){
  const bars = [["#ur1",100,"≈ 48 s"],["#ur2",72,"≈ 35 s"],["#ur3",5,"≈ 2.4 s"]];
  bars.forEach(([s]) => { $(s).style.width = "0"; $(s).textContent = ""; });
  setTimeout(() => bars.forEach(([s,w,l],i) => setTimeout(() => {
    $(s).style.width = w + "%"; $(s).textContent = l;
  }, i*220)), 60);
}

const TERM = [
  {t:"cmd", v:"uv init workTool"},
  {t:"res", v:"Initialized project `workTool` at D:\\work\\workTool"},
  {t:"cmd", v:"cd workTool"},
  {t:"cmd", v:"uv python pin 3.12"},
  {t:"res", v:"Pinned `.python-version` to 3.12"},
  {t:"cmd", v:"uv add pandas pyside6"},
  {t:"res", v:"Resolved 34 packages in 412ms"},
  {t:"res", v:"Installed 34 packages in 1.86s"},
  {t:"ok",  v:" + pandas==2.2.3\n + numpy==2.1.3\n + pyside6==6.8.1"},
  {t:"cmd", v:"uv run main.py"},
  {t:"ok",  v:"Hello from workTool!"},
];
let termTimer = null;
function termReset(){
  clearTimeout(termTimer);
  $("#termBody").innerHTML = '<span class="ps">PS D:\\work&gt;</span> <span class="cur"></span>';
}
function termPlay(){
  clearTimeout(termTimer);
  const body = $("#termBody");
  body.innerHTML = "";
  let i = 0;
  const step = () => {
    if (i >= TERM.length){
      body.insertAdjacentHTML("beforeend", '<span class="ps">PS D:\\work\\workTool&gt;</span> <span class="cur"></span>');
      body.scrollTop = body.scrollHeight;
      return;
    }
    const it = TERM[i++];
    if (it.t === "cmd"){
      const line = document.createElement("div");
      line.innerHTML = '<span class="ps">PS&gt;</span> <span class="cmd"></span>';
      body.appendChild(line);
      const target = line.querySelector(".cmd");
      let c = 0;
      const type = () => {
        target.textContent = it.v.slice(0, ++c);
        if (c < it.v.length) termTimer = setTimeout(type, REDUCED ? 0 : 26);
        else termTimer = setTimeout(step, 320);
      };
      type();
    } else {
      const cls = it.t === "ok" ? "ok" : "res";
      body.insertAdjacentHTML("beforeend", `<div class="${cls}">${it.v}</div>`);
      termTimer = setTimeout(step, 420);
    }
    body.scrollTop = body.scrollHeight;
  };
  step();
}

TAB_INIT.uv = function(){ uvRace(); termPlay(); };

/* ============================================================
   21. IMAGE 탭 데모
   ============================================================ */
const IMG_PIX = [
  [[59,130,246],[96,165,250],[34,211,238],[14,165,233]],
  [[37,99,235],[59,130,246],[56,189,248],[6,182,212]],
  [[29,78,216],[37,99,235],[14,165,233],[8,145,178]],
];
function pxGo(k, btn){
  $$("#i01 .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on");
  const rows = IMG_PIX.length, cols = IMG_PIX[0].length;
  let cells = "";
  IMG_PIX.forEach(row => row.forEach(([r,g,b]) => {
    if (k === "color")      cells += `<div class="p" style="background:rgb(${r},${g},${b})"></div>`;
    else if (k === "gray"){ const v = Math.round(.299*r+.587*g+.114*b);
                            cells += `<div class="p" style="background:rgb(${v},${v},${v})">${v}</div>`; }
    else                    cells += `<div class="p" style="background:rgb(${r},${g},${b});font-size:7px;line-height:1.15">${r}<br>${g}<br>${b}</div>`;
  }));
  const shapeTxt = k === "gray" ? `(${rows}, ${cols})` : `(${rows}, ${cols}, 3)`;
  $("#pxView").innerHTML =
    `<div class="px" style="grid-template-columns:repeat(${cols},${k==="value"?"42px":"46px"})">${cells}</div>
     <div class="axlabel" style="margin-top:12px">shape = ${shapeTxt}</div>`;
  $$("#pxView .p").forEach(p => { p.style.width = k==="value" ? "42px":"46px"; p.style.height = k==="value"?"42px":"46px"; });
  setCode("#pxCode",
    k === "color" ? 'img = cv2.imread("photo.jpg")\nimg.shape      # (3, 4, 3)\nimg[0, 0]      # 왼쪽 위 픽셀의 [B, G, R]'
    : k === "gray" ? 'gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\ngray.shape     # (3, 4)  채널이 사라짐\n# 0=검정 … 255=흰색'
    : 'img[0, 0]      # array([246, 130, 59], dtype=uint8)\nimg.dtype      # uint8  -> 0~255\nimg.max()      # 255');
  $("#pxDesc").innerHTML =
    k === "color" ? '컬러 이미지는 픽셀마다 <b>3개의 숫자</b>(빨강·초록·파랑)를 갖습니다. 그래서 3차원 배열입니다.'
    : k === "gray" ? '흑백은 픽셀당 숫자 <b>하나</b>뿐이라 2차원입니다. 용량이 1/3이고 대부분의 검출 알고리즘이 이걸 요구합니다.'
    : '실제로 저장된 값입니다. <b>uint8(0~255)</b>이라 256을 넘으면 <b>0으로 되돌아갑니다</b>. 연산 전에 <code>astype(np.int16)</code>으로 올려두는 게 안전합니다.';
}

function bgrGo(k, btn){
  $$("#i06 .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on");
  const src = [220, 90, 40];          // 논리적 R,G,B 값 (주황빛)
  const shown = k === "rgb" ? src : [src[2], src[1], src[0]];
  $("#bgrView").innerHTML = `
    <div><div class="swatch" style="background:rgb(${shown[0]},${shown[1]},${shown[2]})"></div>
      <div class="lab">화면에 보이는 색</div></div>
    <div style="font-family:var(--mono);font-size:13px;color:var(--dim);text-align:left;line-height:2">
      배열 값 &nbsp;= [${src.join(", ")}]<br>
      해석 순서 = <b style="color:var(--cyan)">${k === "rgb" ? "R, G, B" : "B, G, R"}</b><br>
      → R=${shown[0]} &nbsp; G=${shown[1]} &nbsp; B=${shown[2]}
    </div>`;
  setCode("#bgrCode",
    k === "rgb"
      ? 'from PIL import Image\nimg = Image.open("photo.jpg")   # RGB 순서\nnp.array(img)[0,0]              # [220, 90, 40] = 주황'
      : 'import cv2\nimg = cv2.imread("photo.jpg")   # BGR 순서!\nimg[0,0]                        # [220, 90, 40] 이지만\n#                                 B=220, G=90, R=40 → 파랑\n\n# 그래서 변환이 필요합니다\nrgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)');
  $("#bgrDesc").innerHTML = k === "rgb"
    ? '<b>같은 숫자 배열</b>이지만 앞에서부터 R·G·B로 읽으면 주황색입니다. Pillow·matplotlib·웹은 전부 이 순서입니다.'
    : '<b>똑같은 배열</b>을 B·G·R로 읽으면 <b>완전히 다른 색</b>이 됩니다. 사진이 파랗게 나온다면 100% 이 문제입니다.';
}

function thRender(){
  const t = +$("#thRange").value;
  $("#thVal").textContent = t;
  const vals = [30, 70, 110, 150, 190, 230, 90, 175];
  const cell = (v, bw) => {
    const c = bw === null ? v : (bw ? 255 : 0);
    return `<div class="p" style="width:44px;height:44px;background:rgb(${c},${c},${c});
      color:${c>128?'#000':'#fff'};font-size:10px">${bw===null?v:(bw?255:0)}</div>`;
  };
  $("#thView").innerHTML = `
    <div style="text-align:center">
      <div class="px" style="grid-template-columns:repeat(8,44px)">${vals.map(v => cell(v,null)).join("")}</div>
      <div class="axlabel" style="margin-top:7px">입력 (그레이스케일 0~255)</div>
    </div>
    <div class="arrow down" style="font-size:20px">↓</div>
    <div style="text-align:center">
      <div class="px" style="grid-template-columns:repeat(8,44px)">${vals.map(v => cell(v, v > t)).join("")}</div>
      <div class="axlabel" style="margin-top:7px">출력 — ${t} 초과는 흰색(255), 이하는 검정(0)</div>
    </div>`;
  setCode("#thCode",
`_, bw = cv2.threshold(gray, ${t}, 255, cv2.THRESH_BINARY)
# ${vals.filter(v => v > t).length}개 픽셀이 흰색, ${vals.filter(v => v <= t).length}개가 검정

# 값을 직접 고르기 어렵다면 Otsu 가 자동으로 찾아줍니다
_, bw = cv2.threshold(gray, 0, 255,
                      cv2.THRESH_BINARY + cv2.THRESH_OTSU)`);
}

const CONV_IMG = [
  [10, 12, 14, 90, 92, 94],
  [11, 13, 15, 91, 93, 95],
  [12, 14, 16, 92, 94, 96],
  [13, 15, 17, 93, 95, 97],
  [14, 16, 18, 94, 96, 98],
  [15, 17, 19, 95, 97, 99],
];
const KERNELS = {
  blur:  { k:[[1,1,1],[1,1,1],[1,1,1]], lab:"평균 블러 (÷9)",
           d:'모든 이웃을 <b>똑같이 평균</b>냅니다. 경계가 뭉개지며 부드러워집니다.' },
  sharp: { k:[[0,-1,0],[-1,5,-1],[0,-1,0]], lab:"샤픈",
           d:'가운데를 <b>키우고 이웃을 빼서</b> 차이를 강조합니다. 경계가 또렷해집니다.' },
  edge:  { k:[[-1,-1,-1],[-1,8,-1],[-1,-1,-1]], lab:"엣지 검출",
           d:'주변과 <b>차이가 없으면 0</b>, 차이가 크면 큰 값. 그래서 경계선만 남습니다.' },
};
let convKer = "blur", convTimer = null;
function convBuild(){
  $("#convGrid").innerHTML = `<div class="nd" style="grid-template-columns:repeat(6,auto)">` +
    CONV_IMG.flat().map((v,i) => `<div class="cell sm" id="cv${i}">${v}</div>`).join("") + `</div>`;
  const K = KERNELS[convKer];
  $("#convKer").innerHTML = `<div class="nd" style="grid-template-columns:repeat(3,auto)">` +
    K.k.flat().map(v => `<div class="cell sm hot">${v}</div>`).join("") + `</div>`;
  $("#convKerLab").textContent = K.lab;
  $("#convOut").innerHTML = `<div class="nd" style="grid-template-columns:repeat(4,auto)">` +
    Array.from({length:16},(_,i) => `<div class="cell sm ghost" id="co${i}">·</div>`).join("") + `</div>`;
  $("#convDesc").innerHTML = K.d;
}
function convKernel(k, btn){
  convKer = k;
  $$("#i08 .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on");
  convBuild(); convPlay();
}
function convPlay(){
  clearInterval(convTimer);
  convBuild();
  const K = KERNELS[convKer].k;
  const div = convKer === "blur" ? 9 : 1;
  let pos = 0;
  const tick = () => {
    $$("#convGrid .cell").forEach(c => c.classList.remove("hot"));
    if (pos >= 16){ clearInterval(convTimer); return; }
    const r = Math.floor(pos/4), c = pos % 4;
    let sum = 0;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++){
      const idx = (r+i)*6 + (c+j);
      const el = document.getElementById("cv"+idx);
      if (el) el.classList.add("hot");
      sum += CONV_IMG[r+i][c+j] * K[i][j];
    }
    const out = document.getElementById("co"+pos);
    if (out){
      out.textContent = Math.max(0, Math.min(255, Math.round(sum/div)));
      out.classList.remove("ghost"); out.classList.add("res","fu");
    }
    pos++;
  };
  tick();
  convTimer = setInterval(tick, REDUCED ? 10 : 380);
}

let tmTimer = null;
function tmPlay(){
  clearInterval(tmTimer);
  const box = $("#tmBox"), info = $("#tmInfo"), tgt = $("#tmTarget");
  box.classList.remove("found");
  tgt.classList.remove("hit");
  const cols = 11, rows = 8;
  let p = 0;
  const targetX = 62, targetY = 68;
  tmTimer = setInterval(() => {
    const x = (p % cols) * 8.2, y = Math.floor(p / cols) * 10.6;
    box.style.left = x + "%"; box.style.top = y + "%";
    const near = Math.abs(x - targetX) < 5 && Math.abs(y - targetY) < 6;
    const score = near ? 0.97 : (0.12 + (p % 7) * 0.04);
    info.textContent = `scan (${Math.round(x*19.2)}, ${Math.round(y*12)})  유사도 ${score.toFixed(2)}`;
    if (near){
      clearInterval(tmTimer);
      box.classList.add("found");
      tgt.classList.add("hit");
      info.textContent = `✔ 매칭! 유사도 0.97  →  pyautogui.click(center)`;
      $("#tmDesc").innerHTML = '<b>임계값(0.85) 이상</b>인 위치를 찾았습니다. 이 좌표의 <b>중심</b>을 클릭하면 됩니다. 유사도가 낮은 위치들은 전부 무시됩니다.';
    }
    if (++p > cols * rows) clearInterval(tmTimer);
  }, REDUCED ? 5 : 90);
}

TAB_INIT.img = function(){
  pxGo("color", $$("#i01 .chip")[0]);
  bgrGo("rgb", $$("#i06 .chip")[0]);
  thRender();
  $("#thRange").addEventListener("input", thRender);
  convBuild();
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) convPlay(); else clearInterval(convTimer);
  }), {threshold:.3});
  io.observe($("#i08 .stage"));
};

