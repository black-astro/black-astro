# 핸드오프 — 열 가이드 시각화 전면 보강 (2026-08-25 갱신)

## 이번 세션 (2026-08-25) — 열 가이드 전 탭 최소 5개 달성

시각화 **403 → 693 (+290)**. 열 가이드 **모든 탭이 5개 이상**입니다.

| 가이드 | 변화 | 가이드 | 변화 |
|---|---|---|---|
| **js-ts** | 22 → **76** (+54) | **cs** | 65 → **86** (+21) |
| **python** | 29 → **85** (+56) | **csharp** | 33 → **54** (+21) |
| **java** | 30 → **70** (+40) | **cpp** | 33 → **47** (+14) |
| **server** | 44 → **84** (+40) | **rust** | 25 → **45** (+20) |
| **db** | 36 → **60** (+24) | kotlin | 86 (그대로) |

- 열 가이드 `npm run verify:guide` 통과 · 스모크 통과 · 무결성 0건 · **svgcheck 0건**
- 커밋은 가이드별로 하나씩 나뉘어 있습니다 (`git log --oneline` 참고)

### 검사 도구가 늘고 좋아졌습니다 (`web/guide-src/tools/`)

| 도구 | 이번에 달라진 것 |
|---|---|
| `svgcheck.mjs` | **세로쓰기(writing-mode) 건너뛰기** · **text-anchor="end" 폭 계산** 추가. 이 두 가지로 오탐이 크게 줄었고(cs 21건 → 1건) 대신 **실제 넘침 8건이 새로 드러나 고쳤습니다**(cs·csharp) |
| `fixcut.mjs` | **신규.** viewBox 높이를 "마지막 baseline + 8" 로 일괄 보정. 다이어그램을 넣은 뒤 **fixcut → svgcheck 순서**로 돌리면 높이 손보는 왕복이 사라집니다 |
| `smoke.mjs` `integrity.mjs` | 그대로 |

작업 흐름(이번 세션에서 확립):
```bash
cd web
# 1) 조각 파일에 다이어그램을 쓰고 (@@sec:<섹션id> 로 구분)
# 2) 삽입 → 3) 높이 보정 → 4) 검사 → 5) 빌드 → 6) 스모크
node guide-src/tools/fixcut.mjs   guide-src/<가이드>/parts/panes
node guide-src/tools/svgcheck.mjs guide-src/<가이드>/parts/panes
node guide-src/tools/integrity.mjs <가이드>
npm run build:guide -- <가이드>
node guide-src/tools/smoke.mjs public/<가이드>-web/index.html
```
삽입 스크립트(`ins.mjs`)는 세션 임시 폴더에 있었습니다 — 필요하면 `tools/` 에 넣어 두세요.
형식은 조각 파일 안에서 `@@sec:j04` 줄로 섹션을 구분하고, 각 블록을 그 섹션의 `</section>` 직전에 넣습니다.

## ⚠️ 여전히 남은 하나 — 브라우저 실측

**이번 세션에도 Chrome MCP 가 없어 브라우저 실측을 못 했습니다.**
정적 검사기(svgcheck)로만 확인했고, README 에 적힌 대로 **±5px 안쪽 차이는 못 잡습니다**.
브라우저를 쓸 수 있는 세션에서 아래 스크립트를 **열 가이드에 한 번씩** 돌려 주세요.
(이번에 추가한 290건이 실측을 한 번도 거치지 않았습니다)

## 다이어그램 현황 (`.diag` 인라인 SVG) — 총 693개
| 가이드 | 개수 | | 가이드 | 개수 |
|---|---|---|---|---|
| kotlin · cs | 86 | | python | 85 |
| server | 84 | | js-ts | 76 |
| java | 70 | | db | 60 |
| csharp | 54 | | cpp | 47 |
| rust | 45 | | | |

## 남은 일 (우선순위순)
1. **브라우저 실측 한 번** — 위 참고. 이번 290건이 미실측입니다
2. 탭당 5개는 채웠지만 **탭 안에서 편중**이 있습니다 — 예: cs `05-algo`(29) vs 나머지(5),
   server `12-msa`(12) vs `01-start`(5). 균형이 필요하면 얇은 탭을 6~7개로 올리는 방향
3. 가이드별 css 의 `.diag` 중복 블록 정리 (선택 — 공통 파일이 이미 이깁니다)
4. `ins.mjs` 를 `guide-src/tools/` 에 정식 편입 (지금은 세션 임시 폴더)

## 시각화 공통 인프라 (2026-08-10 확정 — 유지)
1. 스타일 단일 기준 `shared/css/06-diag.css` (가이드 css 의 .diag 는 옛 사본, 공통이 이긴다)
2. 모션 `shared/js/06-diag-motion.js` · 탭 paneIn · SVG 0.45s 전환 · reduced-motion 존중
3. 마커 defs 는 각 가이드 `parts/10-body-open.html`
4. 작업 절차 `.claude/skills/diag/SKILL.md` + `web/guide-src/DIAGRAM-STYLE.md`
5. **Windows 10 은 Emoji 12까지** — U+1FA70~1FAFF 금지

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

## 관련 파일/명령어
```bash
cd D:/gibis/workTool/astro/black-astro/web
npm run verify:guide          # 빌드 + 정합성 (커밋 전 필수)
npm run build:guide -- db     # 특정 가이드만

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
아홉(열) 가이드(`web/guide-src/*` → `web/public/*-web/index.html`)를
**"기초부터 전문가까지 이 페이지만 보고 실서비스를 만들 수 있는"** 수준으로 끌어올린다.
시각화 커버리지는 이번 세션으로 **전 탭 최소선(5개)을 채웠습니다.**
