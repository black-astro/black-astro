# 학습 가이드 pane 집필 지침 (집필 에이전트 공통)

저장소: `D:/gibis/workTool/astro/black-astro` · 작업 디렉터리 `web/` 기준으로 명령을 실행합니다.
가이드 원본은 `web/guide-src/<가이드>/parts/panes/*.html` 이고 빌드가 `web/public/<가이드>-web/index.html` 로 이어 붙입니다.
**결과물(public) 은 절대 직접 고치지 마세요.** 당신은 **pane 파일 하나 + meta.json 하나**만 만듭니다.
탭 등록(사이드바·탭바·JS·parts.json)은 통합 담당이 meta.json 을 읽어 스크립트로 처리하므로 **다른 파일은 건드리지 마세요.**

## -1. 작업 폴더 (충돌 방지 — 반드시 지킬 것)
여러 에이전트가 같은 스크래치패드를 씁니다. **당신은 `<스크래치패드>/<가이드>-<탭>/` 폴더를 만들어 그 안에만** 조각 파일을 쓰세요
(예: `.../scratchpad/cpp-srv/part1.html`). meta.json 만 스크래치패드 최상위에 `<가이드>-<탭>.meta.json` 으로 둡니다.
스크래치패드에 이전 중단된 시도의 조각이 남아 있을 수 있습니다 — **참고하지 말고 무시하세요**(불완전합니다).

## 0. 먼저 읽을 것 (반드시, 순서대로)
1. `web/guide-src/cpp/parts/panes/01-lang.html` 의 **처음 500줄** — hero · 섹션 · 다이어그램 · 카드 · 코드 · note · cheat 표의 실제 모양. 이 문체와 밀도를 그대로 따릅니다.
2. `web/guide-src/DIAGRAM-STYLE.md` 전체 — 시각화(.diag SVG) 규칙.
3. `.claude/skills/diag/SKILL.md` — 시각화 절차(색 클래스 의미 · 화살촉 · 글자 폭 한계).
4. 대상 가이드의 다른 pane 하나(예: `.../panes/03-py.html`)를 300줄쯤 더 훑어 컴포넌트 활용 폭을 익히세요.

## 1. pane 파일 골격

```html
<!-- ============================================================
     <탭 이름> PANE
     ============================================================ -->
<div class="pane" id="pane-<tab>">

<header class="hero">
  <div class="eyebrow"><i></i> <한 줄 키워드 나열 · 2026 기준 버전 표기></div>
  <h1>세 줄<br>큰<br>제목</h1>
  <p class="tx"> 이 탭이 무엇을 다루고 끝나면 무엇을 할 수 있는지 4~6문장. <b>포인트</b>는 굵게. </p>
  <div class="stats">
    <div><b>12</b><span>SECTIONS</span></div>
    <div><b>C++23</b><span>기준</span></div>
    <div><b>0</b><span>사전 지식</span></div>
    <div><b>100%</b><span>복붙해서 도는 예제</span></div>
  </div>
</header>

<!-- ==================== w01 ==================== -->
<section class="sec" id="w01">
  <div class="sec-head rv">
    <span class="no">SRV 01</span>
    <h2>제목 앞부분 <span class="t">강조 부분</span> — 뒷부분</h2>
    <p class="lead"> 왜 이 섹션이 필요한지 2~3문장. </p>
  </div>

  <div class="diag rv"> …SVG… <div class="cap">한 줄 요약 — <b>핵심</b>.</div></div>

  <div class="grid2 rv">
    <div class="card">
      <h4 class="mini" style="margin-top:0">소제목</h4>
      <pre class="code" data-lang="cpp"><code>…</code></pre>
      <div class="note tip" style="margin-bottom:0"><b>포인트</b> — 설명</div>
    </div>
    <div class="card"> … </div>
  </div>

  <h3 class="sub" data-lv="m">한 단계 더 — <span class="t">소제목</span> <span class="lvl m">🟡 중급</span></h3>
  … 본문(card / tw>table.cheat / note warn / vs good·bad) …

  <div class="ez mid"><b>정리 —</b> 이 섹션의 결론 한두 문장.</div>
</section>

… (섹션 반복) …

</div><!-- /pane-<tab> -->
```

- 섹션 id = `<접두사><두 자리 번호>` (예: `w01`~`w12`). 접두사는 과제에서 지정한 것만 씁니다(가이드 안에서 유일해야 함).
- `<span class="no">` 라벨은 탭 약칭 + 번호 (예: `SRV 01`).
- 난이도 배지(`.lvl`)와 "쉽게 말하면"(`.ez`)·도달점(`.reach`)은 **JS 가 자동 주입**하므로 sec-head 에는 넣지 않습니다. `h3.sub` 안의 `<span class="lvl x|m|h">` 만 직접 씁니다 (`e`=🟢 기초 · `m`=🟡 중급 · `h`=🔴 고급 · `x`=🧬 전문가).
- 사용 가능한 컴포넌트: `div.card`, `h4.mini`, `div.grid2.rv`(+`d1`/`d2` 지연), `pre.code[data-lang=cpp|c|rust|bash|cmake|python|java|kotlin|csharp|ts|js|toml|json|yaml|sql|xml|ini|text]`, `div.note.tip|warn|info`, `div.tw > table.cheat`(스크롤 래퍼 필수), `div.vs > div.bad|good > h5`, `h3.sub[data-lv]`, `div.ez.mid`, `.diag`.
- **코드 안의 `<` `>` `&` 는 반드시 `&lt;` `&gt;` `&amp;`** (`2>&1` 도 `2&gt;&amp;1`). 제네릭 `vector<int>` 를 그대로 두면 무결성 검사에 걸립니다.
- 문체: **합니다체**. 초보에게 설명하듯 "왜"를 먼저. 파이썬·자바와 대조하면 이해가 빨라집니다. 실무 관점 주석을 코드 옆에 붙입니다.
- 한 섹션 분량: **HTML 기준 9~15KB** (코드 블록 3~6개, 표 1개 이상, note 2개 이상). "책처럼 방대하고 세세하게"가 목표입니다. 얕게 많이보다 **깊게**.
- 섹션 수: 과제 지정(보통 11~13개).

## 2. 시각화(.diag) — 탭당 최소 7개, 가능하면 섹션마다 1개

```html
<div class="diag rv">
  <svg viewBox="0 0 680 <높이>" role="img" aria-label="<그림 없이도 이해되는 완전한 설명문>">
    <text x="16" y="18" class="lbl">그림 제목 한 줄</text>
    <rect class="bx" x="16" y="34" width="200" height="52"/>
    <text x="116" y="56" class="val" text-anchor="middle">노드 이름</text>
    <text x="116" y="72" class="ann" text-anchor="middle">곁주석 9px</text>
    <path class="fl ar" d="M220 60 L256 60"/>
  </svg>
  <div class="cap">한 줄 요약 — <b>핵심</b>.</div>
</div>
```
규칙(어기면 검사에 걸립니다):
- viewBox 폭 680 고정. 높이는 마지막 baseline + 8 이상 (fixcut 이 보정하지만 대략 맞춰 두세요).
- 색 클래스 의미 고정: `.bx` 기본 · `.bx-ok` 정답/채택 · `.bx-warn` 틀림/장애 · `.bx-fw` 지금 보는 대상 · `.bx-hi` 강조(드물게) · `.bx-mut` 비활성.
- 글자: `.lbl`(제목) `.ttl`(묶음 제목) `.val`(노드 값) `.ann`(9px 곁주석) · 색 텍스트 `.ok-t .rs-t .am-t .cy-t`. `.lbl` 에 font-size 얹지 말 것. **font-size 9 미만 금지.**
- 화살표: 방향 있는 흐름 `class="fl ar"`(변형 `ar-gn` `ar-rs` `ar-am`, 양방향 `ar2`) · 방향 없는 구조선 `class="ln"`. **선 끝은 도형 경계 4px 바깥에서 끊습니다**(중심까지 그으면 화살촉이 박스 밑에 깔림).
- 글자 폭: 한글 ≈ font-size × 0.95 /자, ASCII ≈ × 0.6. `.lbl` x=16 에서 약 60자, 박스 폭 안에 `글자수×폰트px` 가 들어가는지 계산. **감으로 쓰면 15~20% 넘칩니다.** 316 폭 박스에 긴 한 줄은 두 줄로 쪼개고 박스 높이 52→68.
- 그라디언트·drop-shadow·굵은 테두리 금지. `height="0"` 빈 rect 남기지 말 것.
- 단계 배지: `<circle class="stp" cx cy r="11"/>` + `<text class="stpn" text-anchor="middle">1</text>`.
- 흐름 점(선택): `<circle class="pk" r="3.5"><animateMotion dur="2.4s" repeatCount="indefinite" path="M.. L.."/></circle>`.
- 무엇을 그리나: 구조(요청이 흐르는 경로) · 단계(순서) · 비교(좌우 두 박스) · 메모리 레이아웃 · 시간축 · 선택 흐름도(if 분기) — 섹션의 핵심 메커니즘을 그림 없이 읽어도 이해되게.

## 3. 금지 사항 (실제로 겪은 사고)
- **이모지: Windows 10 은 Emoji 12 까지** — U+1FA70~1FAFF 범위(🪟 🫠 🩵 🪄 🪛 🫧 등) 절대 금지. 🖥️ 🧰 🌐 🎮 🚀 ☕ 🟣 🔧 ⚙️ 📦 🔗 등만.
- 파일은 **Write 도구**로 만듭니다(히어독 금지 — 잘립니다). 파일이 커서 여러 번 나눠 쓸 때는 Write 로 조각 파일을 만들고 `cat 조각 >> pane.html` 로 이어 붙이세요. 이어 붙인 뒤 `</div><!-- /pane-x -->` 가 딱 한 번 마지막에 있는지 확인.
- HTML 안에 `\$` 같은 백슬래시 이스케이프 넣지 말 것. CRLF 넣지 말 것(LF).
- 코드에 실제로 안 도는 가짜 API 를 쓰지 말 것. 2026년 8월 기준 **실제 최신 안정 버전**을 표기(예: C++23 · Rust 1.89 · Qt 6.9 · Tokio 1.x · Axum 0.8 · Tauri 2.x · Java 25 LTS · .NET 10 · Node 24 LTS · Python 3.13/3.14 · Drogon 1.9 · Boost 1.89 · CMake 4.x · vcpkg 2025). 확신이 없는 버전은 "최신 안정" 처럼 두루뭉술하게.
- 다른 pane 파일·sidebar·tabbar·js·parts.json 은 절대 수정하지 마세요.

## 4. meta.json (통합 담당이 읽습니다) — 스크래치패드에 `<가이드>-<tab>.meta.json` 으로 저장

```json
{
  "guide": "cpp",
  "tab": "srv",
  "pane": "panes/12-srv.html",
  "label": "🌐 백엔드 서버",
  "short": "백엔드 서버",
  "icon": "🌐",
  "cls": "wb",
  "grad": ["#0ea5e9","#0c4a6e"],
  "group": 4,
  "groupLabel": "실전 · SERVER",
  "groupIcs": "🌐🎮🚀",
  "groupTitle": "백엔드 서버 · 게임 서버 · 고성능",
  "sheetLabel": "실전",
  "after": "deep",
  "tabkw": "검색용 키워드 공백 구분 40개 이상 (한글·영문·오타 포함)",
  "sections": [
    {"id":"w01","title":"사이드바에 보일 짧은 제목","star":true,"lv":"b",
     "ez":"쉽게 말하면 한 문장 (HTML <b> 허용, 큰따옴표는 \" 로)",
     "cap":["p","이 섹션을 마치면 실무에서 무엇을 할 수 있는지 한 문장 — 'p' 실무 / 's' 개인·학습 / 'e' 대규모"],
     "kw":"섹션 검색 키워드 공백 구분 12개 이상"}
  ]
}
```
- `lv`: b 기초 / i 중급 / a 고급. `star`: 핵심 섹션(사이드바에 ★).
- `after`: 이 탭을 어느 탭 뒤에 둘지(기존 탭 id). 과제에 지정된 값 사용.
- `group`/`groupLabel`/`groupIcs`/`groupTitle`/`sheetLabel` 은 과제에 지정된 값 그대로(같은 그룹에 여러 탭이 들어가므로 통일).
- 기존 탭에 섹션만 추가하는 과제면 `"append": true` 로 두고 `label/cls/group…` 은 생략 가능.

## 5. 끝내기 전 검증 (필수 — 결과를 보고에 포함)
```bash
cd D:/gibis/workTool/astro/black-astro/web
node guide-src/tools/fixcut.mjs   guide-src/<가이드>/parts/panes/<pane>.html
node guide-src/tools/svgcheck.mjs guide-src/<가이드>/parts/panes/<pane>.html    # OVER/BOX/LAP 0 이 될 때까지 문구를 줄여 고침 (x 좌표 옮기지 말 것)
node -e "const s=require('fs').readFileSync('guide-src/<가이드>/parts/panes/<pane>.html','utf8');console.log('sections',(s.match(/<section class=\"sec\"/g)||[]).length,'close',(s.match(/<\/section>/g)||[]).length,'diags',(s.match(/class=\"diag rv/g)||[]).length,'KB',Math.round(s.length/1024));for(let i=0;i<s.length;i++){const b=s.charCodeAt(i);if(b<9||b==11||b==12||(b>13&&b<32))throw 'control char at '+i}; const pre=[...s.matchAll(/<pre class=\"code\"[^>]*><code>([\s\S]*?)<\/code>/g)]; for(const m of pre){const bad=m[1].match(/<(?!\/?(span|b|i|code|em)\b)[A-Za-z][^>]*>/); if(bad) {console.log('UNESCAPED:',bad[0].slice(0,60)); process.exitCode=1}}"
```
- section 열림/닫힘 수 일치, diags ≥ 7, 제어문자 0, UNESCAPED 0 이어야 합니다.
- meta.json 의 sections id 목록이 pane 의 section id 와 **정확히** 같아야 합니다(순서 포함).

## 6. 최종 보고 형식 (짧게)
- 만든 파일 경로 2개, 섹션 수, 다이어그램 수, KB, svgcheck 결과(0건인지), 남은 문제.
