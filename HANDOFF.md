# 핸드오프 — 언어 가이드 확장 (2026-08-26 8차 갱신)

## 최근 결과 — 열 가이드 전부 "설치부터 실전까지"

**모든 언어 가이드에 🧰 설치 · 환경 세팅 탭이 생겼습니다.** 빈 PC 에서 시작해
설치 → 기초 → 실전(서버 · 앱 · 모듈)까지 한 페이지로 이어집니다.

| 가이드 | 탭 | 섹션 | 다이어그램 |
|---|---|---|---|
| **cpp** | 9 → **16** | 88 → **201** | 63 → **169** |
| **rust** | 9 → **15** | 100 → **174** | 63 → **142** |
| **python** | 17 → **18** | 256 → **280** | 119 → **144** |
| **js-ts** | 15 → **16** | 233 → **245** | 105 → **117** |
| **java** | 14 → **15** | 221 → **233** | 98 → **110** |
| **kotlin** | 12 → **13** | 195 → **206** | 93 → **104** |
| **db** | 12 → **13** | 179 → **191** | 84 → **97** |
| **csharp** | 10 → **11** | 141 → **153** | 71 → **85** |
| server · cs | 그대로 | 198 · 173 | 114 · 106 |

### 새로 만든 탭 (전부 이번 작업)
| 가이드 | 탭 | 섹션 | 그림 |
|---|---|---|---|
| cpp | 🧰 설치 · 🖥️ 데스크톱 앱 · 🌐 백엔드 서버 · 🎮 게임 서버 · 🚀 고성능 · ☕ 자바 모듈 · 🟣 C# 모듈 | 각 12~13 | 12~14 |
| cpp | 🅲 C 언어 **확장** (12→26섹션) | +14 | 7→21 |
| rust | 🧰 설치 · 🌐 Axum 서버 · 🚀 고성능 서비스 · 🖥️ Tauri · ☕ 자바 모듈 · 🟣 C# 모듈 | 각 11~13 | 13~14 |
| python | 🧰 설치 · **PySide6 탭에 QML/Qt Quick 12섹션 확장**(q17~q28) | 12 · 12 | 12 · 12 |
| java · kotlin · js-ts · csharp · db | 🧰 설치 · 환경 세팅 | 11~12 | 11~14 |

- cpp · rust 는 **"앱을 만들지 않습니다" 소개 문구를 강점 소개로 교체**했습니다
- 설치 탭은 전부 **맨 앞 탭**, 접두사 `st`(cpp·rust 만 `s`), cls `st`, 그룹 0 아이콘 앞에 🧰
- 전 가이드 `verify:guide` 통과 · svgcheck 0건 · integrity 0건 · smoke 통과 · `vue-tsc -b` 통과

### PySide6 QML 확장 (사용자 요청분 — 완료)
`python/panes/07-qt.html` q17~q28 — QML·Qt Quick 개념/첫 앱/문법·바인딩/앵커·Layout,
**Qt Quick Controls 2**, **스타일 6종(Material · FluentWinUI3 포함) 과 지정 3가지 방법**,
파이썬↔QML(`@QmlElement`), 모델·ListView, 애니메이션·상태,
**Qt Quick Effects(MultiEffect · ShaderEffect · Shape)**, **Material Symbols vs Lucide 아이콘**,
qrc·PyInstaller 배포.

---

## 🔴 남은 일 — 순서대로 (이어서 하면 됩니다)


집필용 지침서와 자동 등록 스크립트가 **이미 준비되어 있습니다.** 새 세션에서는
`(A) 지침서 읽기 → (B) 에이전트에 과제 주기 → (C) reg.mjs 로 등록 → (D) 검증` 만 반복하면 됩니다.

> **주의:** 지침서(`BRIEF.md`)와 등록 스크립트(`reg.mjs`)는 세션 스크래치패드에 있습니다.
> 세션이 바뀌어 사라졌다면 아래 §도구 를 보고 다시 만드세요.

### 1. 전 가이드 기술 스택 점검 (아직 못 함)
언어별 강점 프레임워크·라이브러리에 빠진 것이 없는지 훑고 보강 — 예:
java(Virtual Thread·Spring AI·Testcontainers) · kotlin(Ktor·Arrow·Compose Multiplatform) ·
js-ts(Hono·Bun·Drizzle·TanStack) · csharp(Blazor·Aspire·MAUI) · python(Polars·LangGraph) ·
db(pgvector·DuckDB·ClickHouse). 오류·설명 오점·시각화 결함도 같이 고칩니다.

### 2. 브라우저 실측 (계속 밀려 있음)
Chrome MCP 가 있는 세션에서 열 가이드에 아래 스크립트를 한 번씩. 정적 검사(svgcheck)는
**±5px 안쪽 차이를 못 잡습니다.** 미실측 누적 = 2차 290 + 3차 224 + 4차 68 + 5차 63 + 6차 90 + 이번 **175** = **910건**.

### 3. 마지막에 할 것
- `npm run verify:guide` · svgcheck · integrity · smoke · `vue-tsc -b`
- `src/router/index.ts` 의 stats(탭 수 · 섹션 수) 를 실제 값으로 맞추기
- HANDOFF 갱신 후 커밋 · 푸시

---

## 도구 — 지침서와 자동 등록 스크립트 (세션이 바뀌면 다시 만들 것)

이번 세션에서 만든 두 가지가 작업 속도를 결정했습니다.

**(1) 집필 지침서 `BRIEF.md`** — 집필 에이전트에게 주는 단일 지침.
담아야 할 것: ①에이전트별 전용 작업 폴더 규칙(파일명 충돌 방지) ②먼저 읽을 파일 4개
(`cpp/parts/panes/01-lang.html` 앞 500줄 · `guide-src/DIAGRAM-STYLE.md` · `.claude/skills/diag/SKILL.md` · 대상 가이드의 다른 pane)
③pane 골격(hero/section/sec-head/diag/grid2·card/note/cheat/ez) ④.diag SVG 규칙(viewBox 680 · 색 클래스 의미 ·
`.fl.ar` 화살촉 · 경계 4px · 글자 폭 한글 ×0.95/ASCII ×0.6) ⑤금지사항(U+1FA70+ 이모지 · 히어독 · `\$` · CRLF ·
코드블록 `<` `>` `&` 미이스케이프) ⑥meta.json 스키마 ⑦검증 명령 ⑧보고 형식.

**(2) 등록 스크립트 `reg.mjs`** — meta.json 하나로 **7곳을 한 번에** 등록합니다:
`parts.json` · `11-sidebar.html`(navgrp + navset) · `12-tabbar.html`(tabrow + tabsl + tabsg + **단축키 재부여**) ·
`js/20-tab-switch.js`(TAB_LABEL · SEC_LV · EZ · CAP · TAB_ORDER) · `js/00-core.js`(TAB_KW · SEC_KW) · 탭 색 CSS.
`"append": true` 면 기존 탭에 섹션만 더합니다. `after` 에 기존 탭 id 를 주면 그 뒤에, `"^"` 면 맨 앞에 꽂힙니다.

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
`lv` = b/i/a · `cap[0]` = s(학습)/p(실무)/e(대규모) · `star` = 사이드바 ★.

**에이전트 운용 요령** — 탭 하나에 에이전트 하나. **동시에 5개 정도**가 안전합니다
(19개를 한꺼번에 돌렸다가 세션 토큰 한도로 전부 중단됐습니다). 한 탭이 대략 20만 토큰 · 30분.

---

## 작업 흐름 (검증된 절차)
```bash
cd D:/gibis/workTool/astro/black-astro/web
# 1) 에이전트가 pane 파일 + meta.json 작성 (다른 파일은 절대 건드리지 않음)
node <스크래치패드>/reg.mjs <스크래치패드>/<가이드>-<탭>.meta.json   # 등록 7곳
npm run build:guide -- <가이드>
node guide-src/tools/fixcut.mjs   guide-src/<가이드>/parts/panes    # 높이 보정 (먼저)
node guide-src/tools/svgcheck.mjs guide-src/<가이드>/parts/panes    # 넘침·겹침
node guide-src/tools/integrity.mjs <가이드>                          # NUL · 미이스케이프
node guide-src/tools/smoke.mjs public/<가이드>-web/index.html        # 탭 정합성
npm run verify:guide                                                 # 커밋 전 필수
npx vue-tsc -b                                                       # router 고쳤으면
```
- 조각 파일에 `height="0"` 빈 rect 를 남기지 말 것
- svgcheck 지적의 대부분은 **좌우 316폭 박스에 긴 한 줄** — 두 줄로 쪼개고 박스 높이 52→68
- 넘침은 **x 를 옮기지 말고 문구를 줄여서** 해결 (옮기면 LAP 이 생깁니다)

## 다이어그램 현황 — 총 1,288개
| 가이드 | 개수 | | 가이드 | 개수 |
|---|---|---|---|---|
| **cpp** | **169** | | **python** | **144** |
| **rust** | **142** | | **js-ts** | **117** |
| server | 114 | | **java** | **110** |
| cs | 106 | | **kotlin** | **104** |
| **db** | **97** | | **csharp** | **85** |

**모든 가이드의 모든 탭이 7개 이상**입니다.

## 시각화 공통 인프라 (2026-08-10 확정 — 유지)
1. 스타일 단일 기준 `shared/css/06-diag.css` (가이드 css 의 .diag 는 옛 사본, 공통이 이긴다)
2. 모션 `shared/js/06-diag-motion.js` · 탭 paneIn · SVG 0.45s 전환 · reduced-motion 존중
3. 마커 defs 는 각 가이드 `parts/10-body-open.html`
4. 작업 절차 `.claude/skills/diag/SKILL.md` + `web/guide-src/DIAGRAM-STYLE.md`
5. **Windows 10 은 Emoji 12까지** — U+1FA70~1FAFF 금지 (🪟 U+1FA9F 도 금지 — 🖥️ 를 씀)

## 조심할 것 (실제로 겪은 실패 — 누적)
1. `</section>` 누락 — verify:guide 가 잡아 줌
2. SVG 텍스트 넘침 — viewBox 680 기준 한글 `.lbl` x=16 → 약 60자 · x=366 → 약 28자
3. `.lbl` 에 font-size 얹어도 CSS 가 이긴다 — 9px 곁주석은 `.ann`
4. perl -pi 는 Windows 에서 CRLF 를 심는다 — node 스크립트로. `String.replace` 치환문자열의 `$$`는 `$` — 함수형 replace 쓸 것
5. `git add` 는 저장소 루트에서 · `public/*-web/index.html` 직접 수정 금지(빌드가 덮음)
6. 원격에 GitHub Action 커밋 수시 유입 — push 거부되면 `git fetch && git rebase origin/main`
7. `file://` 은 Chrome MCP 거부 — 8899 로컬 서버 경유
8. `content-visibility` 안 풀면 `getBBox()` 가 0 — 측정 전 visible 강제, **측정 후 새로고침**
9. 문체 — 합니다체 · `<b>` 포인트 · note tip/warn/info · 가이드별 컴포넌트가 조금 다르니 해당 파일 먼저 읽기
10. Chrome MCP `resize_window` 는 최대화 창에서 안 먹힘
11. **verify:guide 는 JS 런타임 오류를 못 잡는다** — 탭·JS 수정 후 switchTab 스모크 필수
12. **재빌드 후 실측은 캐시버스터(?v=N)** — 같은 URL 재방문은 옛 파일일 수 있다
13. **큰 HTML 조각은 bash 히어독이 깨진다** — Write 도구로 파일을 만들고 node 스크립트로 삽입할 것
14. **한 조각 파일에 여러 pane 의 섹션을 섞지 말 것** — 삽입 스크립트는 pane 하나만 다룬다
15. **코드블록 안의 `2>&1` 같은 `&`** 는 `&amp;` 로 — integrity 가 잡기 전에 미리 바꿔 두면 왕복이 줄어듭니다
16. **Write 로 쓰는 조각 안에서 `\$` 이스케이프 금지** — 백슬래시가 그대로 화면에 나옵니다
17. **bash 안에서 node -e 에 백틱이 든 템플릿 리터럴을 넣지 말 것** — 셸이 먼저 해석해 깨집니다
18. **동시 에이전트는 5개까지** — 19개를 한 번에 돌리면 세션 토큰 한도에 걸려 전부 날아갑니다
19. **여러 에이전트가 같은 스크래치패드를 쓰면 파일명이 충돌한다** — 에이전트마다 전용 하위 폴더를 지정할 것

## 관련 파일/명령어
```bash
cd D:/gibis/workTool/astro/black-astro/web
npm run verify:guide          # 빌드 + 정합성 (커밋 전 필수)
npm run build:guide -- cpp    # 특정 가이드만

# 로컬 서버 (public 폴더, 8899)
cd public && node -e "const http=require('http'),fs=require('fs'),p=require('path');http.createServer((q,r)=>{let f=p.join(process.cwd(),decodeURIComponent(q.url.split('?')[0]));try{if(fs.statSync(f).isDirectory())f=p.join(f,'index.html');r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});r.end(fs.readFileSync(f));}catch(e){r.writeHead(404);r.end('nf')}}).listen(8899)"
```

**SVG 실측** (Chrome MCP): `http://localhost:8899/<가이드>-web/index.html?v=N` 열고 실행 →
OVER/BOX/LAP 가 none 이 될 때까지 문구 축약:
```js
document.querySelectorAll('.pane, .sec').forEach(e=>e.style.contentVisibility='visible');
document.documentElement.style.scrollBehavior='auto';
const panes=[...document.querySelectorAll('.pane')];const prev=panes.map(p=>p.className);panes.forEach(p=>p.classList.add('on'));
const over=[],lap=[],box=[];
document.querySelectorAll('.diag svg').forEach(svg=>{
  const vb=svg.viewBox.baseVal, sec=svg.closest('section')?.id||'?';
  const rects=[...svg.querySelectorAll('rect')].map(r=>{try{return r.getBBox()}catch(e){return null}}).filter(Boolean);
  const ts=[...svg.querySelectorAll('text')].map(t=>{let b;try{b=t.getBBox()}catch(e){return null}return b&&b.width?{b,s:t.textContent.slice(0,14)}:null}).filter(Boolean);
  ts.forEach(({b,s})=>{
    const o=Math.round(b.x+b.width-vb.width);if(o>0)over.push(sec+' +'+o+' '+s);
    const cy=b.y+b.height/2;
    rects.forEach(r=>{if(cy>r.y&&cy<r.y+r.height&&b.x>=r.x-1&&b.x<r.x+r.width){const ov=Math.round(b.x+b.width-(r.x+r.width));if(ov>2)box.push(sec+' +'+ov+' ['+s+']')}});
  });
  for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){
    const a=ts[i].b,c=ts[j].b;
    if(Math.min(a.x+a.width,c.x+c.width)-Math.max(a.x,c.x)>2 && Math.min(a.y+a.height,c.y+c.height)-Math.max(a.y,c.y)>3)
      lap.push(sec+' ['+ts[i].s+']x['+ts[j].s+']');
  }
});
panes.forEach((p,i)=>p.className=prev[i]);
'DIAGS: '+document.querySelectorAll('.diag svg').length+' | OVER: '+(over.join(' / ')||'none')+' | BOX: '+(box.join(' / ')||'none')+' | LAP: '+(lap.join(' / ')||'none')
```

## 목표
열 가이드(`web/guide-src/*` → `web/public/*-web/index.html`)를
**"기초부터 전문가까지 이 페이지만 보고 실서비스를 만들 수 있는"** 수준으로.
열 가이드 전부가 **설치 → 기초 → 실전** 축을 갖췄습니다. 남은 것은 기술 스택 공백 점검과 브라우저 실측입니다.
