# 핸드오프 — DB NoSQL 그룹 신설 · C# 대확장 · 탭 기억 제거 (2026-08-11 갱신)

## 이번 세션 결과 (커밋 예정/완료 — git log 확인)

| 작업 | 내용 |
|---|---|
| **탭 기억 제거** | 아홉 가이드: sessionStorage 탭 복원 삭제(`99-init.js`) + setItem 제거(`20-tab-switch.js`). `shared/js/05-nav.js` pickGroup 은 **같은 그룹을 다시 눌러도 항상 첫 탭**으로. 언제 열어도 첫 탭에서 시작 |
| **.diag 카드 = .stage 디자인** | `shared/css/06-diag.css` .diag 배경을 .stage 와 동일(위쪽 라디얼 글로우 + rgba(6,11,22,.55) + r-l)로 통일. 아홉 가이드 전체 적용 |
| **DB NoSQL 신설** | 제품별 그룹에 ⚡ Redis(`redis`, r01~r13) · 🍃 MongoDB(`mongo`, n01~n12) 탭. r01 이 NoSQL vs RDBMS 정면 비교. DB = **179섹션 · 12탭**. 새 파일 `panes/11-redis.html` `12-mongo.html`, css 에 .rd/.mg 탭색 · .c-rd/.c-mg 브랜드색 |
| **DB 기초 보강** | c01 에 초보 용어 사전 10개(스키마·쿼리·PK·FK·인덱스·트랜잭션·커밋롤백·CRUD·서버클라·마이그레이션). m01 에 MySQL 유료/MariaDB 완전무료 구분 블록. '퍼블릭 도메인' → "완전 무료(저작권 자체가 없음)" (c02 표 + 90-demos.js) |
| **C# 대확장 120→141** | lang c13~c16(튜플·확장메서드·DateTime·enum) · adv a13~a15(Parallel·정규식·암호화) · unity u13~u17(코루틴·Cinemachine·2D·NavMesh·이펙트) · ugame g13~g16(SafeArea·로컬라이제이션·시드·게임필) · net n13~n15(WebSocket·틱레이트·아키텍처 사례) · api w13~w14(gRPC·어드민 API). EZ·CAP·SEC_LV·SEC_KW·navset 전부 동기화 |
| **박스 넘침 소탕** | 신규 검사(텍스트 vs **rect 박스** 넘침)로 아홉 가이드 실측 — db c05(+163!)·z11, csharp g04, cs a08, server m07, python k01·z10·w08×3·x06, java g11×2 수정. 최종 **전 가이드 OVER/BOX/LAP 0** (js-ts c08 2건은 z-index 데모의 의도된 겹침 = 오탐) |

- `npm run verify:guide` 아홉 가이드 전부 통과. 탭 전환 스모크(switchTab 전 탭 + pickGroup) db·csharp·python 통과
- ⚠️ 실측 시 **브라우저 캐시 주의** — 재빌드 후 같은 URL 재방문은 옛 파일을 읽을 수 있다. `?v=2` 캐시버스터를 붙일 것 (이번에 한 번 헛측정)
- ⚠️ 측정 스크립트가 `contentVisibility='visible'` 을 남기면 페이지가 무거워져 **스크린샷 주입이 타임아웃**난다. 측정 후 새로고침하고 볼 것

### 새 실측 스크립트 (기존 OVER/LAP + BOX 넘침)
기존 HANDOFF 스크립트에 추가된 BOX 검사 — 텍스트가 자기 박스(rect) 오른쪽으로 3px 이상 삐져나가면 잡는다:
```js
// svg 마다: rects=[...svg.querySelectorAll('rect')].map(getBBox)
// 각 text bbox b 에 대해: cy=b.y+b.height/2 가 rect 세로 범위 안이고 b.x 가 rect 안에서 시작하면
// b.x+b.width-(r.x+r.width) > 2 → BOX 넘침 (의도적 겹침 다이어그램은 눈으로 확인)
```

## 목표
아홉 가이드(`web/guide-src/*` → `web/public/*-web/index.html`)를
**"기초부터 전문가까지 이 페이지만 보고 실서비스를 만들 수 있는"** 수준으로 끌어올린다.

## 다이어그램 현황 (`.diag` 인라인 SVG) — 총 232개 · 실측 OVER/BOX/LAP 0
| 가이드 | 개수 | | 가이드 | 개수 |
|---|---|---|---|---|
| cs | 65 | | js-ts | 22 |
| server | 43 | | java | 7 |
| **db** | **36** (33→36 · redis 2 + mongo 1) | | cpp·rust | 0 (제외 대상) |
| csharp | 33 | | python | 29 |

## DB 가이드 구조 (탭 12개)
그룹: 시작(0) · SQL(1: sql·pro) · **제품별(2: oracle🅾️ pg🐘 mysql🐬 sqlite✒️ redis⚡ mongo🍃)** · 심화(3: tune·deep·app).
섹션 접두사 — c q e o p m s **r(redis) n(mongo)** t z a.
섹션 추가 시 동기화 6곳: pane · `11-sidebar` navset · `20-tab-switch.js`(SEC_LV·EZ·CAP) ·
`00-core.js`(TAB_KW·SEC_KW) · hero SECTIONS 숫자(시작 탭 179).

## C# 가이드 구조 (탭 10개 · 141섹션)
그룹: 언어(0: lang 16·adv 15) · Unity(1: unity 17·ugame 16) · 서버(2: net 15·api 14·scale 12) ·
앱도구(3: desk·tool) · 심화(4: deep). 동기화 지점은 DB 와 동일 구조.

## 시각화 공통 인프라 (2026-08-10 확정 — 유지)
1. 스타일 단일 기준 `shared/css/06-diag.css` (가이드 css 의 .diag 는 옛 사본, 공통이 이긴다)
2. 모션 `shared/js/06-diag-motion.js` · 탭 paneIn · SVG 0.45s 전환 · reduced-motion 존중
3. 마커 defs 는 각 가이드 `parts/10-body-open.html`
4. 작업 절차 `.claude/skills/diag/SKILL.md` + `web/guide-src/DIAGRAM-STYLE.md`
5. **Windows 10 은 Emoji 12까지** — U+1FA70~1FAFF 금지

## 남은 일 (우선순위순)
1. python `02-numpy`(13섹션)·`10-db`(18섹션) diag 0 — 다음 시각화 후보. java 도 7개로 얇다
2. CS 얇은 탭 — `01-math`(2)·`03-comp`(2)·`06-arch`(2)
3. C# 얇은 탭 잔여 — scale(12)·desk(12)·tool(12)·deep(12) 도 15±로 맞추면 좋다
4. redis·mongo 탭 diag 보강 (현재 redis 2 · mongo 1)
5. 가이드별 css 의 .diag 중복 블록 정리 (선택)

## 조심할 것 (실제로 겪은 실패 — 누적)
1. `</section>` 누락 — verify:guide 가 잡아 줌
2. SVG 텍스트 넘침 — viewBox 680 기준 한글 `.lbl` x=16 → 약 60자 · x=366 → 약 28자. **반드시 브라우저 실측** (+BOX 검사 추가됨)
3. `.lbl` 에 font-size 얹어도 CSS 가 이긴다 — 9px 곁주석은 `.ann`
4. perl -pi 는 Windows 에서 CRLF 를 심는다 — node 스크립트로. `String.replace` 치환문자열의 `$$`는 `$` — 함수형 replace 쓸 것
5. `git add` 는 저장소 루트에서 · `public/*-web/index.html` 직접 수정 금지(빌드가 덮음)
6. 원격에 GitHub Action 커밋 수시 유입 — push 거부되면 `git fetch && git rebase origin/main`
7. `file://` 은 Chrome MCP 거부 — 8899 로컬 서버 경유 (이전 세션 서버가 살아 있는 경우 많음)
8. `content-visibility` 안 풀면 `getBBox()` 가 0 — 측정 전 visible 강제, **측정 후 새로고침**
9. 문체 — 합니다체 · `<b>` 포인트 · note tip/warn/info · 가이드별 컴포넌트가 조금 다르니 해당 파일 먼저 읽기
10. Chrome MCP `resize_window` 는 최대화 창에서 안 먹힘
11. **verify:guide 는 JS 런타임 오류를 못 잡는다** — 탭·JS 수정 후 switchTab 스모크 필수
12. **재빌드 후 실측은 캐시버스터(?v=N)** — 같은 URL 재방문은 옛 파일일 수 있다

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

**제외 대상**: cpp·rust(평균 11~12KB) — 이미 충분히 두터움.
