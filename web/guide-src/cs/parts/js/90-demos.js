/* ============================================================
   2. 데모 — 직접 값을 넣어 보는 네 가지
   ------------------------------------------------------------
   이 가이드는 개념이 많아 글만으로는 체감이 안 되는 자리가 있다.
   "n 이 100만이면 O(n²) 이 몇 초냐" 같은 것은 한 번 눌러 보는 편이 빠르다.
   전부 순수 계산이라 외부 의존이 없다(단일 HTML 원칙).
   ============================================================ */

/* --- ① 자료구조 결정표 필터 (🗂️ 자료구조 s13) --- */
function dsFilter(){
  const q = ($("#dsQ")?.value || "").trim().toLowerCase();
  const rows = $$("#dsTable tbody tr");
  let n = 0;
  rows.forEach(tr => {
    const hay = ((tr.dataset.k || "") + " " + tr.textContent).toLowerCase();
    const ok = !q || q.split(/\s+/).every(t => hay.includes(t));
    tr.style.display = ok ? "" : "none";
    if (ok) n++;
  });
  const c = $("#dsCount");
  if (c) c.textContent = q
    ? `${n}개 찾음 — 원하는 게 없으면 다른 낱말로 (예: 순서 · 중복 · 범위 · 우선순위)`
    : `전체 ${rows.length}개 · 위 칸에 하려는 일을 한글로 입력해 보세요`;
}
function dsSet(q){
  const inp = $("#dsQ");
  if (!inp) return;
  inp.value = q;
  dsFilter();
  if (q) inp.focus();
}

/* --- ② 복잡도 체감기 (🧮 계산이론 p07) ---
   같은 알고리즘도 n 이 커지면 어디서 무너지는지를 숫자로 보여 준다.
   1초에 1억 번(10^8) 연산한다고 가정한다 — 요즘 CPU 의 대략적인 눈금이다. */
const OPS_PER_SEC = 1e8;
const BO_ROWS = [
  ["O(1)",        () => 1,                       "g"],
  ["O(log n)",    n => Math.log2(n),             "g"],
  ["O(n)",        n => n,                        "b"],
  ["O(n log n)",  n => n * Math.log2(n),         "b"],
  ["O(n²)",       n => n * n,                    "a"],
  ["O(2ⁿ)",       n => Math.pow(2, Math.min(n, 1024)), "r"],
];
function boFmt(x){
  if (!isFinite(x)) return "∞";
  if (x < 1000) return x.toFixed(x < 10 ? 1 : 0);
  if (x < 1e15) return Math.round(x).toLocaleString("ko-KR");
  return x.toExponential(2).replace("e+", " × 10^");
}
function boTime(ops){
  const s = ops / OPS_PER_SEC;
  if (s < 1e-6) return "즉시";
  if (s < 1e-3) return (s * 1e6).toFixed(1) + " µs";
  if (s < 1)    return (s * 1e3).toFixed(1) + " ms";
  if (s < 60)   return s.toFixed(2) + " 초";
  if (s < 3600) return (s / 60).toFixed(1) + " 분";
  if (s < 86400 * 365) return (s / 3600).toFixed(1) + " 시간";
  const y = s / (86400 * 365);
  return y > 1e9 ? "우주의 나이보다 오래" : boFmt(y) + " 년";
}
function boCalc(){
  const out = $("#boOut");
  if (!out) return;
  let n = parseFloat(($("#boN")?.value || "").replace(/[,_\s]/g, ""));
  if (!isFinite(n) || n < 1) n = 1;
  n = Math.min(n, 1e12);
  const lab = $("#boNlab");
  if (lab) lab.textContent = "n = " + Math.round(n).toLocaleString("ko-KR");
  out.innerHTML = BO_ROWS.map(([name, fn, cls]) => {
    const ops = fn(n);
    return `<tr><td><span class="bo ${cls}">${name}</span></td>` +
           `<td style="font-family:var(--mono)">${boFmt(ops)}</td>` +
           `<td style="font-family:var(--mono)">${boTime(ops)}</td></tr>`;
  }).join("");
}
function boSet(v){
  const inp = $("#boN");
  if (!inp) return;
  inp.value = v;
  boCalc();
}

/* --- ③ 진법 · 2의 보수 변환기 (🖥️ 컴퓨터구조 h02·h03) --- */
function numConv(){
  const out = $("#numOut");
  if (!out) return;
  const raw = ($("#numIn")?.value || "").trim();
  const bits = parseInt($("#numBits")?.value || "8", 10);
  let v = null;
  try {
    if (/^-?\d+$/.test(raw))            v = BigInt(raw);
    else if (/^0[bB][01]+$/.test(raw))  v = BigInt(raw);
    else if (/^0[xX][0-9a-fA-F]+$/.test(raw)) v = BigInt(raw);
    else if (/^[01]{2,}$/.test(raw))    v = BigInt("0b" + raw);
  } catch(e) { v = null; }
  if (v === null){
    out.innerHTML = `<div class="note warn" style="margin:0">
      <b>읽을 수 없는 값</b> — 10진수(<code>-42</code>) · 2진수(<code>0b1010</code> 또는 <code>1010</code>) ·
      16진수(<code>0x2A</code>) 중 하나로 넣어 주세요.</div>`;
    return;
  }
  const mod  = 1n << BigInt(bits);
  const wrap = ((v % mod) + mod) % mod;             // 2의 보수 비트 패턴
  const signed = wrap >= (mod >> 1n) ? wrap - mod : wrap;
  const bin = wrap.toString(2).padStart(bits, "0");
  const overflow = v !== signed;

  const cells = [...bin].map((b, i) =>
    `<span class="${i === 0 ? "s" : "m"}">${b}</span>`).join("");

  out.innerHTML =
    `<div class="bits">${cells}<span class="lb">${bits}비트</span></div>
     <div class="tw"><table class="cheat" style="margin:0">
       <tr><th style="width:40%">표현</th><th>값</th></tr>
       <tr><td>부호 없는 정수 (unsigned)</td><td><b>${wrap}</b></td></tr>
       <tr><td>2의 보수 정수 (signed)</td><td><b>${signed}</b></td></tr>
       <tr><td>16진수</td><td>0x${wrap.toString(16).toUpperCase()}</td></tr>
       <tr><td>8진수</td><td>0o${wrap.toString(8)}</td></tr>
     </table></div>` +
    (overflow
      ? `<div class="note warn" style="margin-bottom:0"><b>오버플로가 일어났습니다</b> —
         넣은 값 <code>${v}</code> 는 ${bits}비트 정수 범위
         (<code>${-(mod >> 1n)}</code> ~ <code>${(mod >> 1n) - 1n}</code>)를 벗어나
         <code>${signed}</code> 로 돌아왔습니다. 실제 C·Java 의 <code>int</code> 에서 벌어지는 일과 같습니다.</div>`
      : `<div class="note tip" style="margin-bottom:0"><b>맨 앞 비트가 부호</b>입니다(빨간 칸).
         비트 수를 바꿔 가며 같은 값이 어떻게 달라지는지 보세요.</div>`);
}

/* --- ④ 서브넷 계산기 (🌐 네트워크 n02) --- */
function cidrCalc(){
  const out = $("#cidrOut");
  if (!out) return;
  const raw = ($("#cidrIn")?.value || "").trim();
  const m = raw.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
  if (!m || m.slice(1, 5).some(x => +x > 255) || +m[5] > 32){
    out.innerHTML = `<div class="note warn" style="margin:0">
      <b>형식을 확인해 주세요</b> — <code>192.168.0.10/24</code> 처럼 넣습니다.</div>`;
    return;
  }
  const ip = m.slice(1, 5).reduce((a, x) => a * 256 + +x, 0);
  const p  = +m[5];
  const mask = p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0;
  const net  = (ip & mask) >>> 0;
  const bc   = (net | (~mask >>> 0)) >>> 0;
  const dot  = v => [24, 16, 8, 0].map(s => (v >>> s) & 255).join(".");
  const total = Math.pow(2, 32 - p);
  const hosts = p >= 31 ? total : total - 2;      // 네트워크 · 브로드캐스트 주소 제외
  const priv = /^10\./.test(dot(ip)) || /^192\.168\./.test(dot(ip)) ||
               /^172\.(1[6-9]|2\d|3[01])\./.test(dot(ip));
  out.innerHTML =
    `<div class="tw"><table class="cheat" style="margin:0">
      <tr><th style="width:38%">항목</th><th>값</th></tr>
      <tr><td>네트워크 주소</td><td><b>${dot(net)}</b></td></tr>
      <tr><td>브로드캐스트 주소</td><td>${dot(bc)}</td></tr>
      <tr><td>서브넷 마스크</td><td>${dot(mask)}</td></tr>
      <tr><td>사용 가능한 호스트 수</td><td><b>${hosts.toLocaleString("ko-KR")}</b>개</td></tr>
      <tr><td>주소 범위</td><td>${dot(p >= 31 ? net : net + 1)} ~ ${dot(p >= 31 ? bc : bc - 1)}</td></tr>
      <tr><td>대역 성격</td><td>${priv ? "사설 IP — 인터넷으로 직접 나가지 않습니다" : "공인 IP 대역"}</td></tr>
    </table></div>`;
}

/* 탭별 최초 1회 초기화 */
TAB_INIT.ds   = function(){ dsFilter(); };
TAB_INIT.comp = function(){ boCalc(); };
TAB_INIT.arch = function(){ numConv(); };
TAB_INIT.net  = function(){ cidrCalc(); };
