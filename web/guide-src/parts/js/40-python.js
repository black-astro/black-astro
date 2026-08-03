/* ============================================================
   19. PYTHON 탭 데모
   ============================================================ */
const DS = {
  list:{
    view:`<div class="nd" style="grid-template-columns:repeat(4,auto)">
      ${[0,1,2,3].map(i => `<div class="cell">${["10","20","30","20"][i]}</div>`).join("")}
    </div><div class="axlabel" style="margin-top:9px">인덱스 0 · 1 · 2 · 3 &nbsp;|&nbsp; 20이 두 번 (중복 허용)</div>`,
    code:`a = [10, 20, 30, 20]\na[0]        # 10\na.append(40)\na[1] = 99   # 수정 가능`,
    spec:[["순서","있음 (인덱스로 접근)"],["수정","가능 (mutable)"],["중복","허용"],["속도","x in a → O(n)"],["Java","ArrayList"]],
    desc:'가장 기본. <b>순서가 있고 바뀔 수 있는</b> 묶음입니다. 고민되면 일단 list를 쓰세요.' },
  tuple:{
    view:`<div class="nd" style="grid-template-columns:repeat(3,auto)">
      ${["37.5","127.0","서울"].map(v => `<div class="cell" style="border-style:dashed">${v}</div>`).join("")}
    </div><div class="axlabel" style="margin-top:9px">🔒 생성 후 변경 불가</div>`,
    code:`p = (37.5, 127.0, "서울")\np[0]          # 37.5\n# p[0] = 1    # ❌ TypeError!\n\nlat, lon, city = p   # 언패킹\n\n# 함수의 다중 반환값도 실은 튜플\ndef f(): return 1, 2`,
    spec:[["순서","있음"],["수정","불가 (immutable)"],["중복","허용"],["용도","좌표·설정·반환값"],["Java","record / 불변 리스트"]],
    desc:'<b>바뀌면 안 되는 값 묶음</b>입니다. 불변이라 dict의 <b>키로 쓸 수 있고</b>, 리스트보다 조금 빠릅니다.' },
  dict:{
    view:`<div style="display:grid;gap:6px">
      ${[["이름","김민준"],["팀","A"],["매출","320"]].map(([k,v]) =>
        `<div style="display:flex;align-items:center;gap:8px">
          <div class="cell sm hot" style="width:70px">${k}</div>
          <span style="color:var(--dim)">→</span>
          <div class="cell sm" style="width:82px">${v}</div>
        </div>`).join("")}
    </div><div class="axlabel" style="margin-top:9px">키 → 값 (키는 중복 불가)</div>`,
    code:`d = {"이름": "김민준", "팀": "A"}\nd["이름"]           # KeyError 위험\nd.get("나이", 0)    # 안전\nd["나이"] = 30\n\nfor k, v in d.items():\n    print(k, v)`,
    spec:[["순서","입력 순서 유지 (3.7+)"],["수정","가능"],["중복","키 불가, 값 가능"],["속도","키 조회 → O(1)"],["Java","LinkedHashMap"]],
    desc:'<b>이름표로 값을 찾는</b> 구조. JSON·API 응답·DB 한 행이 전부 이 모양입니다. 조회가 매우 빠릅니다.' },
  set:{
    view:`<div class="nd" style="grid-template-columns:repeat(3,auto)">
      ${["10","20","30"].map(v => `<div class="cell res" style="border-radius:50%">${v}</div>`).join("")}
    </div><div class="axlabel" style="margin-top:9px">{10,20,30,20} → 중복 자동 제거, 순서 없음</div>`,
    code:`s = {10, 20, 30, 20}   # -> {10, 20, 30}\ns.add(40)\ns.discard(10)\n\n# 집합 연산\na & b   # 교집합\na | b   # 합집합\na - b   # 차집합\n\n# 리스트 중복 제거 관용구\nlist(set(nums))`,
    spec:[["순서","없음"],["수정","가능"],["중복","자동 제거"],["속도","x in s → O(1)"],["Java","HashSet"]],
    desc:'<b>중복 제거</b>와 <b>포함 검사</b>가 목적입니다. 10만 건에서 <code>in</code> 검사를 반복한다면 list 대신 set으로 바꾸는 것만으로 극적으로 빨라집니다.' },
};
function dsGo(k, btn){
  $$("#p04 .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on");
  const d = DS[k];
  $("#dsView").innerHTML = d.view;
  $$("#dsView .cell").forEach((c,i) => { c.classList.add("fu"); c.style.animationDelay = (i*.05)+"s"; });
  setCode("#dsCode", d.code);
  $("#dsSpec").innerHTML = d.spec.map(([a,b]) =>
    `<tr><td style="width:34%">${a}</td><td>${b}</td></tr>`).join("");
  $("#dsDesc").innerHTML = d.desc;
}

const LC = [
  { c:`result = []\nfor x in nums:\n    if x > 0:\n        result.append(x * 2)`,
    d:'평범한 for문입니다. <b>결과 리스트 준비 → 순회 → 조건 → 추가</b> 4단계.' },
  { c:`result = [x * 2                 # ① 결과식을 맨 앞으로\n          for x in nums]`,
    d:'<b>① append 안에 있던 식</b>을 맨 앞으로 끌어올리고, for를 뒤에 붙입니다.' },
  { c:`result = [x * 2\n          for x in nums\n          if x > 0]              # ② 조건은 맨 뒤로`,
    d:'<b>② if 조건</b>을 맨 뒤에 붙입니다. 이 순서(<b>결과 → for → 조건</b>)는 항상 같습니다.' },
  { c:`result = [x * 2 for x in nums if x > 0]\n\n# 읽는 순서: nums의 x 중에서 → x>0 인 것만 → x*2 해서 담아라`,
    d:'<b>완성.</b> 4줄이 1줄이 되었고, <code>result = []</code>와 <code>append</code>가 사라져 <b>의도만 남았습니다.</b>' },
];
function lcGo(n){
  $$("#lcSteps .st").forEach((el,i) => {
    el.classList.toggle("on", i === n); el.classList.toggle("done", i < n);
  });
  $$("#p06 .chip").forEach((b,i) => b.classList.toggle("on", i === n));
  setCode("#lcCode", LC[n].c);
  $("#lcDesc").innerHTML = LC[n].d;
}
function lcAuto(){ [0,1,2,3].forEach((s,i) => setTimeout(() => lcGo(s), i*1500)); }

const REF = {
  assign:{
    html:`<div style="display:flex;gap:46px;justify-content:center;align-items:center;flex-wrap:wrap">
      <div style="display:grid;gap:16px">
        <div class="cell sm hot" style="width:52px">a</div>
        <div class="cell sm hot" style="width:52px">b</div>
      </div>
      <div style="color:var(--cyan);font-size:22px;line-height:1.1">↘<br>↗</div>
      <div style="text-align:center">
        <div class="nd" style="grid-template-columns:repeat(3,auto)">
          <div class="cell">1</div><div class="cell">2</div><div class="cell res">99</div></div>
        <div class="axlabel" style="margin-top:7px">객체 1개 (id: 0x7f3a)</div>
      </div></div>`,
    c:`a = [1, 2, 3]\nb = a            # 복사가 아니라 '같은 객체에 이름 하나 더'\nb[2] = 99\n\nprint(a)         # [1, 2, 99]  ← a도 바뀜!\na is b           # True`,
    d:'대입은 <b>복사가 아닙니다.</b> 이름표 두 개가 <b>같은 객체</b>를 가리킬 뿐이라, 어느 쪽으로 바꿔도 같이 바뀝니다.' },
  shallow:{
    html:`<div style="display:flex;gap:46px;justify-content:center;align-items:center;flex-wrap:wrap">
      <div style="display:grid;gap:26px">
        <div class="cell sm hot" style="width:52px">a</div>
        <div class="cell sm hot" style="width:52px">b</div>
      </div>
      <div style="display:grid;gap:14px;text-align:center">
        <div class="nd" style="grid-template-columns:repeat(2,auto)">
          <div class="cell">1</div><div class="cell ghost">↓</div></div>
        <div class="nd" style="grid-template-columns:repeat(2,auto)">
          <div class="cell">1</div><div class="cell ghost">↓</div></div>
      </div>
      <div style="text-align:center">
        <div class="nd" style="grid-template-columns:repeat(2,auto)">
          <div class="cell res">9</div><div class="cell res">8</div></div>
        <div class="axlabel" style="margin-top:7px">중첩 리스트는 <b>여전히 공유</b></div>
      </div></div>`,
    c:`a = [1, [9, 8]]\nb = a.copy()      # 얕은 복사\n\nb[0] = 100        # 바깥은 독립\nprint(a[0])       # 1  ✅\n\nb[1][0] = 777     # 안쪽은 공유!\nprint(a[1])       # [777, 8]  ⚠️`,
    d:'<b>얕은 복사</b>는 겉껍데기만 새로 만듭니다. 리스트 안의 <b>리스트·딕셔너리는 그대로 공유</b>되어, 안쪽을 바꾸면 원본도 바뀝니다.' },
  deep:{
    html:`<div style="display:flex;gap:46px;justify-content:center;align-items:center;flex-wrap:wrap">
      <div style="text-align:center">
        <div class="cell sm hot" style="width:52px;margin:0 auto 10px">a</div>
        <div class="nd" style="grid-template-columns:repeat(2,auto)">
          <div class="cell">1</div><div class="cell">[9,8]</div></div>
      </div>
      <div style="color:var(--green);font-size:20px">✂</div>
      <div style="text-align:center">
        <div class="cell sm res" style="width:52px;margin:0 auto 10px">b</div>
        <div class="nd" style="grid-template-columns:repeat(2,auto)">
          <div class="cell res">1</div><div class="cell res">[9,8]</div></div>
      </div></div>
      <div class="axlabel" style="margin-top:12px;text-align:center">완전히 독립된 두 객체</div>`,
    c:`import copy\n\na = [1, [9, 8]]\nb = copy.deepcopy(a)   # 중첩까지 전부 복사\n\nb[1][0] = 777\nprint(a[1])            # [9, 8]  ✅ 원본 안전`,
    d:'<b>깊은 복사</b>는 안쪽까지 전부 새로 만듭니다. 안전하지만 <b>느리고 메모리를 두 배</b> 쓰므로, 정말 필요할 때만 쓰세요.' },
  immutable:{
    html:`<div style="display:flex;gap:40px;justify-content:center;align-items:center;flex-wrap:wrap">
      <div style="text-align:center">
        <div class="cell sm hot" style="width:52px;margin:0 auto 10px">a</div>
        <div class="cell" style="width:64px">10</div>
        <div class="axlabel" style="margin-top:7px">그대로</div>
      </div>
      <div style="color:var(--dim);font-size:19px">b = a<br>b += 1</div>
      <div style="text-align:center">
        <div class="cell sm res" style="width:52px;margin:0 auto 10px">b</div>
        <div class="cell res" style="width:64px">11</div>
        <div class="axlabel" style="margin-top:7px">새 객체 생성</div>
      </div></div>`,
    c:`a = 10\nb = a\nb += 1        # 11 이라는 '새 객체'를 만들어 b에 붙임\n\nprint(a)      # 10  ✅ 안전\n\n# 문자열도 마찬가지\ns = "안녕"\nt = s\nt += "하세요"   # 새 문자열 생성\nprint(s)      # "안녕"`,
    d:'int·str·tuple 같은 <b>불변 객체</b>는 값을 바꿀 수 없어, 연산하면 <b>새 객체가 만들어집니다.</b> 그래서 공유 문제가 애초에 없습니다.' },
};
function refGo(k, btn){
  $$("#p08 .chip").forEach(b => b.classList.remove("on"));
  if (btn) btn.classList.add("on");
  $("#refView").innerHTML = REF[k].html;
  $$("#refView .cell").forEach((c,i) => { c.classList.add("fu"); c.style.animationDelay = (i*.04)+"s"; });
  setCode("#refCode", REF[k].c);
  $("#refDesc").innerHTML = REF[k].d;
}

let genMode = "list", genIdx = 0;
function genRender(){
  const n = 8;
  if (genMode === "list"){
    $("#genView").innerHTML = `
      <div class="nd" style="grid-template-columns:repeat(${n},auto)">
        ${Array.from({length:n},(_,i) => `<div class="cell sm hot">${i*i}</div>`).join("")}
      </div>
      <div class="axlabel">메모리에 <b>8개 전부</b> 올라와 있음 · 1억 개면 그대로 1억 개</div>`;
    $("#genDesc").innerHTML = '<code>[x*x for x in range(8)]</code> — <b>즉시 전부 계산</b>해 리스트로 만듭니다. 빠르게 여러 번 재사용할 땐 이쪽이 낫습니다.';
  } else {
    $("#genView").innerHTML = `
      <div class="nd" style="grid-template-columns:repeat(${n},auto)">
        ${Array.from({length:n},(_,i) =>
          `<div class="cell sm ${i < genIdx ? 'res' : (i === genIdx ? 'hot' : 'ghost')}">${i < genIdx ? i*i : (i === genIdx ? i*i : '?')}</div>`).join("")}
      </div>
      <div class="axlabel">소비된 값 ${genIdx} / ${n} · 메모리에는 <b>현재 하나만</b></div>`;
    $("#genDesc").innerHTML = genIdx >= n
      ? '<b>StopIteration</b> — 제너레이터는 소진되면 끝입니다. <b>다시 순회할 수 없습니다.</b>'
      : '<code>(x*x for x in range(8))</code> — <b>next()를 부를 때마다 하나씩</b> 계산합니다. 10GB 파일도 메모리 한 줄로 처리할 수 있는 이유입니다. <b>▶ next() 호출</b>을 눌러보세요.';
  }
}
function genGo(m){
  genMode = m; genIdx = 0;
  $$("#p12 .chip").forEach((b,i) => b.classList.toggle("on", i === (m === "list" ? 0 : 1)));
  genRender();
}
function genStep(){
  if (genMode !== "gen") genGo("gen");
  if (genIdx < 8) genIdx++;
  genRender();
}

TAB_INIT.python = function(){
  trbGo(0, $("#p14 .stage .chip"));
  dsGo("list", $$("#p04 .chip")[0]);
  lcGo(0);
  refGo("assign", $$("#p08 .chip")[0]);
  genGo("list");
};

