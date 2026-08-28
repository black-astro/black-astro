# guide-src/tools — 브라우저 없이 돌리는 검사와 보정

`npm run verify:guide` 는 **섹션·탭·SEC_LV/EZ/CAP 정합성만** 봅니다.
아래 네 개가 그 바깥을 막습니다(+ 삽입 도우미 ins). 전부 `web/` 에서 실행합니다.

```bash
# ① SVG 넘침·겹침 정적 검사 (브라우저 실측 대용)
node guide-src/tools/svgcheck.mjs guide-src/<가이드>/parts/panes
node guide-src/tools/svgcheck.mjs guide-src/kotlin/parts/panes/03-co.html co07,co14

# ② 탭 정합성 스모크 — 탭 버튼 ↔ pane ↔ navset ↔ TAB_LABEL ↔ TAB_ORDER
node guide-src/tools/smoke.mjs public/<가이드>-web/index.html

# ③ 소스 무결성 — 제어문자(NUL) · 코드블록 미이스케이프 태그
node guide-src/tools/integrity.mjs kotlin cpp rust      # 인자 없으면 전체

# ④ CUT 자동 보정 — viewBox 높이를 "마지막 baseline + 8" 로 올림
node guide-src/tools/fixcut.mjs guide-src/<가이드>/parts/panes
```

다이어그램을 새로 넣었다면 **④ → ① 순서**로 돌리는 것이 가장 빠릅니다.

## svgcheck 가 잡는 것

| 코드 | 뜻 |
|---|---|
| `OVER` | 글자가 viewBox(680) 밖으로 나감 |
| `BOX` | 글자가 소속 박스의 오른쪽 밖으로 나감 |
| `LAP` | 같은 줄(baseline 차 ≤3)에서 글자끼리 가로로 겹침 |
| `CUT` | 마지막 baseline 보다 viewBox 높이가 작아 잘림 (fixcut 으로 일괄 보정) |

세로쓰기(writing-mode)는 건너뛰고, text-anchor 는 start·middle·end 셋 다 계산합니다.
글자 폭은 **한글/CJK = font-size × 0.95 · 그 밖 = × 0.60** 으로 추정합니다.
이 계수는 **브라우저 실측을 통과한 기존 다이어그램들을 기준선으로 역산**한 값입니다
(db·server·java 가 0건이 되는 지점). 실측이 아니라 근사이므로 **±5px 안쪽 차이는 못 잡습니다** —
Chrome MCP 를 쓸 수 있는 세션에서는 `HANDOFF.md` 의 실측 스크립트를 여전히 우선하세요.

넘침은 **x 를 옮기지 말고 문구를 줄여서** 해결합니다(옮기면 LAP 이 생깁니다).

## ④ CUT 자동 보정 — fixcut

```bash
node guide-src/tools/fixcut.mjs guide-src/<가이드>/parts/panes   # 폴더 또는 파일
```

`.diag` SVG 의 viewBox 높이를 **"마지막 baseline + 8"** 이상으로 올려 줍니다
(DIAGRAM-STYLE §5). 다이어그램을 새로 넣은 뒤 svgcheck 로 CUT 을 확인하는 대신
이것을 먼저 한 번 돌리면 높이 손보는 왕복이 사라집니다.

**높이만 건드립니다** — 좌표·문구는 그대로입니다. OVER/BOX/LAP 은 여전히 svgcheck 로 잡고,
넘침은 문구를 줄여서 해결하세요.

## ⑤ 다이어그램 삽입 도우미 — ins

```bash
node guide-src/tools/ins.mjs guide-src/js-ts/parts/panes/01-js.html 조각.html
```

조각 파일 안에서 `@@sec:<섹션id>` 줄로 블록을 구분하면, 각 블록을 그 섹션의 닫는 태그 직전에 넣습니다.
큰 HTML 조각은 bash 히어독에서 깨지므로 **Write 도구로 조각 파일을 만들고 이걸로 넣는 방식**이 안전합니다.

**한 조각 파일은 pane 하나만 다룹니다** — 다른 pane 의 섹션이 섞여 있으면 아무것도 쓰지 않고 멈춥니다(원자적).

## ⑥ 탭 등록 자동화 — reg.mjs

```bash
node guide-src/tools/reg.mjs <meta.json 경로>
```

meta.json 하나로 **7곳을 한 번에** 등록합니다 —
`parts.json` · `11-sidebar.html`(navgrp + navset) · `12-tabbar.html`(tabrow + tabsl + tabsg + **단축키 재부여**) ·
`js/20-tab-switch.js`(TAB_LABEL · SEC_LV · EZ · CAP · TAB_ORDER) · `js/00-core.js`(TAB_KW · SEC_KW) · 탭 색 CSS.

meta.json 스키마:
```json
{ "guide":"cpp", "tab":"srv", "pane":"panes/12-srv.html",
  "label":"🌐 백엔드 서버", "short":"백엔드 서버", "icon":"🌐", "cls":"wb",
  "grad":["#0ea5e9","#0c4a6e"], "group":4, "groupLabel":"실전 · 서버 · 성능",
  "groupIcs":"🌐🎮🚀", "groupTitle":"...", "sheetLabel":"실전", "after":"deep",
  "tabkw":"검색 키워드 40개 이상",
  "sections":[{"id":"w01","title":"사이드바 제목","star":true,"lv":"b",
               "ez":"쉽게 말하면 한 문장","cap":["p","도달점 한 문장"],"kw":"섹션 키워드"}] }
```

- `lv` = b(기초)/i(중급)/a(고급) · `cap[0]` = s(학습)/p(실무)/e(대규모) · `star` = 사이드바 ★
- `after` 에 기존 탭 id 를 주면 그 **뒤**에, `"^"` 면 **맨 앞**에 꽂힙니다
- `"append": true` 면 기존 탭에 **섹션만** 더합니다(label·cls·group 등은 생략 가능)
- **주의:** 이미 있는 그룹 버튼(`data-g="N"`)은 건드리지 않습니다. 그룹 아이콘·설명을 바꾸려면
  `11-sidebar.html` 의 해당 버튼을 직접 고치세요.

집필 지침은 `web/guide-src/AUTHORING.md` 입니다.
