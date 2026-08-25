# 핸드오프 — 열 가이드 시각화 (2026-08-25 3차 갱신)

## 이번 세션 (2026-08-25 · 3차) — 열 가이드 전 탭 7개 달성

시각화 **693 → 917 (+224)**. **열 가이드 모든 탭이 7개 이상**입니다.
서버 가이드에는 사용자 요청으로 **새 탭 하나(윈도우 사내 배포)** 를 만들었습니다.

| 가이드 | 이번 세션 | | 가이드 | 이번 세션 |
|---|---|---|---|---|
| **python** | 85 → **119** (+34) | | **cs** | 86 → **106** (+20) |
| **server** | 84 → **114** (+30) | | **java** | 70 → **98** (+28) |
| **js-ts** | 76 → **105** (+29) | | **kotlin** | 86 → **93** (+7) |
| **db** | 60 → **84** (+24) | | **csharp** | 54 → **72** (+18) |
| **rust** | 45 → **63** (+18) | | **cpp** | 47 → **63** (+16) |

- 커밋은 가이드별로 하나씩 나뉘어 있습니다 (`git log --oneline`)
- 전 가이드 `npm run verify:guide` 통과 · svgcheck 0건 · 무결성 0건 · 스모크 통과

### 서버 가이드 새 탭 — 🖥️ 윈도우 · 사내 배포 (`win`, v01~v12 · 그림 8개)

웹서버(Nginx·Apache) 없이 앱만 IP:포트로 열어 사내에 공개하고,
**IPTIME 포트포워딩**으로 외부까지 여는 과정을 초보자 기준으로 씁니다.
0.0.0.0 바인딩 · 방화벽 인바운드 · NAT/사설IP 고정 · DDNS · 최소 보안 · 증상별 원인 사전.
탭 등록 7곳은 메모리 `guide-tab-authoring` 절차대로 처리했습니다.
탭 그룹은 `data-g="2"`(운영), 아이콘은 `🖥️`(U+1F5A5 — Win10 지원 범위).

## ⚠️ 남은 하나 — 브라우저 실측

**Chrome MCP 가 없어 이번에도 실측을 못 했습니다.** 정적 검사기(svgcheck)만 돌렸고,
README 대로 **±5px 안쪽 차이는 못 잡습니다**. 브라우저를 쓸 수 있는 세션에서
아래 스크립트를 열 가이드에 한 번씩 돌려 주세요.
**미실측 누적: 2차 세션 290건 + 이번 224건 = 514건.**

## 다이어그램 현황 — 총 917개
| 가이드 | 개수 | | 가이드 | 개수 |
|---|---|---|---|---|
| python | 119 | | server | 114 |
| cs | 106 | | js-ts | 105 |
| java | 98 | | kotlin | 93 |
| db | 84 | | csharp | 72 |
| rust · cpp | 63 | | | |

**모든 가이드의 모든 탭이 7개 이상**입니다(탭별 최소치 확인 완료).

## 남은 일 (우선순위순)
1. **브라우저 실측 한 번** — 위 참고
2. 더 늘린다면 **탭당 8~9개**로 — 방식은 동일하게 "그림 없는 섹션 두 곳씩"
3. 가이드별 css 의 `.diag` 중복 블록 정리 (선택 — 공통 파일이 이미 이깁니다)
4. 일부 가이드의 **SEC_KW 누락**(python 137 · js-ts 139 · java 127 등) — 검색 품질 개선 여지

## 작업 흐름 (이번 세션에서 검증된 절차 — 그대로 쓰면 됩니다)
```bash
cd web
# 1) 스크래치패드에 조각 파일 작성 (@@sec:<섹션id> 로 블록 구분, 한 파일 = 한 pane)
node guide-src/tools/ins.mjs      guide-src/<가이드>/parts/panes/<pane>.html <조각>.html
node guide-src/tools/fixcut.mjs   guide-src/<가이드>/parts/panes      # 높이 일괄 보정
node guide-src/tools/svgcheck.mjs guide-src/<가이드>/parts/panes      # 넘침·겹침
node guide-src/tools/integrity.mjs <가이드>
npm run build:guide -- <가이드>
node guide-src/tools/smoke.mjs public/<가이드>-web/index.html
```
- 조각 파일에 **`height="0"` 빈 rect 를 남기지 말 것** (삽입 전 일괄 제거 스크립트를 돌리면 편합니다)
- svgcheck 지적의 대부분은 **좌우 316폭 박스에 긴 한 줄** — 두 줄로 쪼개고 박스 높이 52→68
- 넘침은 **x 를 옮기지 말고 문구를 줄여서** 해결 (옮기면 LAP 이 생깁니다)
- 곁주석이 박스 안 가운데 정렬 텍스트와 같은 baseline 에 있으면 LAP — 곁주석 x 를 오른쪽으로 밀거나 문구를 줄입니다

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
16. **Write 로 쓰는 조각 안에서 `\$` 이스케이프 금지** — 백슬래시가 그대로 화면에 나옵니다(node 스크립트 문자열에서만 필요)
17. **bash 안에서 node -e 에 백틱이 든 템플릿 리터럴을 넣지 말 것** — 셸이 먼저 해석해 깨집니다. 큰 문서 수정은 Write 도구로

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
시각화는 **전 탭 7개** 를 채웠습니다. 다음 단계는 브라우저 실측입니다.
