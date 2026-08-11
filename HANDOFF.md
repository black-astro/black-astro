# 핸드오프 — python AI 그룹 신설 + markScrollables 회귀 수정 (2026-08-11 갱신)

## 2026-08-11 세션 결과 (전부 커밋됨)

| 커밋 | 내용 |
|---|---|
| `204b47e` | **fix: markScrollables `$$`→`$` 회귀** — 8273497 이 아홉 가이드에서 `$$(".tw, .scw")` 를 `$(".tw, .scw, .diag")` 로 바꾸며 `$` 하나를 떨어뜨려 **탭 전환마다 TypeError** 가 나고 있었다. 스모크 테스트(switchTab 직접 호출)로 발견 |
| `0a117eb` | **feat: python 인공지능 그룹(그룹 5) 신설** — 🤖 머신러닝 `ml`(m01~16, sklearn) · 🔥 딥러닝 `dl`(l01~16, PyTorch) · ✨ LLM·AI API `llm`(c01~16). 207→**255섹션 · 17탭**, diag 6개 신규(m01·m04·l02·l05·c01·c10, 실측 OVER/LAP 0) |

- python 섹션 접두사 추가: ml=`m` · dl=`l` · llm=`c` (기존: s n p u i a q t g d w x k z)
- LLM 탭의 모델·가격 표기는 2026-08 기준 Claude 계열 실측값 — 가격 개정 시 c02 갱신 필요
- ⚠️ **교훈 1**: `verify:guide` 는 JS 런타임 오류를 못 잡는다. 탭·JS 를 만졌으면
  브라우저에서 `switchTab('탭')` 스모크 테스트까지 돌릴 것 (이번 회귀는 그걸로만 잡혔다)
- ⚠️ **교훈 2**: node 일괄 치환에서 `String.replace(a, b)` 의 **치환 문자열 `$$` 는 `$` 로
  해석**된다 — 함수형 `s.replace(BAD, () => GOOD)` 으로 쓸 것 (이번에 한 번 헛수정 발생)


## 목표
아홉 가이드(`web/guide-src/*` → `web/public/*-web/index.html`)를
**"기초부터 전문가까지 이 페이지만 보고 실서비스를 만들 수 있는"** 수준으로 끌어올린다.
판단 기준은 분량(바이트)이 아니라 **실무 커버리지**다.

## 이번 세션에서 끝낸 것 (전부 커밋됨)

| 커밋 | 내용 |
|---|---|
| `73eb139` | **DB 화살촉 88개** + DB 다이어그램 6개 (27→33) — SQL 실행 경로·윈도우 프레임·인덱스 6종·복제 지연·busy_timeout·실행계획 읽는 순서 |
| `72a8c23` | **가이드 이름 "웹서버"→"서버기술"** (아홉 가이드 전환 버튼·허브·메타) + 🪶(Win10 미지원) 제거 — Apache 🦅 · SQLite ✒️ |
| `d41a79d` | **시각화 공통화** — `shared/css/06-diag.css`(단일 기준) · `shared/js/06-diag-motion.js`(.pk 페이드) · paneIn 탭 전환 · SVG 상태 전환 0.45s · 마커 defs 아홉 가이드 전부 |
| `d922c9e` | **서버기술 확장 그룹 신설** — 🧱 백엔드·MSA(11절) · 📨 Kafka·이벤트(11절) · 📈 대규모 트래픽(12절), diag 17개, 152→186섹션 |
| `8273497` | 3관점 검수 — 이모지 2건(🪺🪙) 교체 · `.diag` 모바일 스크롤 힌트 |

- `npm run verify:guide` **아홉 가이드 전부 통과**
- 시각화 스킬 등록: **`.claude/skills/diag/SKILL.md`** — 다이어그램 만들 때 `/diag` 로 호출
- HANDOFF 이전 버전의 "DB 가이드 다음 차례" 항목은 **완료됨** (화살촉·얇은 탭 시각화·내용 구멍 확인).
  ※ 내용 구멍이라던 "실행계획 읽는 법·B-Tree·커서 페이지네이션·무중단 마이그레이션"은
  **표기 차이(띄어쓰기·영문) 때문에 grep 이 못 찾았을 뿐 대부분 이미 있었다** — 다음에도 grep 만 믿지 말 것.

### 다이어그램 현황 (`.diag` 인라인 SVG) — 총 226개 · 실측 넘침 0 · 겹침 0 · aria 누락 0
| 가이드 | 개수 | | 가이드 | 개수 |
|---|---|---|---|---|
| cs | 65 | | js-ts | 22 |
| **server** | **43** (26→43) | | java | 7 |
| **db** | **33** (27→33) | | cpp·rust | 0 (제외 대상) |
| csharp | 33 | | **python** | **29** (23→29 · AI 탭 6개 추가) |

## 시각화 모델 — 공통 인프라 (2026-08-10 확정)

1. **스타일의 단일 기준은 `shared/css/06-diag.css`** — 아홉 parts.json 에서 가이드별
   `css/06-*.css` **뒤에** 로드되어 항상 이긴다. 가이드 css 에 남은 .diag 블록은 옛 사본
   (지우지 않았음 — 지울 거면 가이드별 고유 클래스가 섞여 있는지 먼저 확인).
2. **모션** — `.pk` 흐름 점은 `shared/js/06-diag-motion.js` 가 같은 위상 opacity 를 붙여
   순간이동 없이 스르륵. 탭 전환은 `paneIn` 페이드. SVG rect/circle/text 는 fill·opacity·
   transform 0.45s 전환(클래스 갈아끼우면 색이 스르륵). reduced-motion 전부 존중.
3. **마커 defs**(#ar-cy 등)는 아홉 가이드 `parts/10-body-open.html` 에 전부 있음.
4. **작업 절차는 `.claude/skills/diag/SKILL.md`** + `web/guide-src/DIAGRAM-STYLE.md`.
5. `.diag` 는 markScrollables 대상 — 좁은 화면에서 "옆으로 밀어보세요" 힌트가 붙는다.
6. **Windows 10 은 Emoji 12까지만** 렌더한다. U+1FA70~1FAFF 대역(🪶🪙🪺 등)은 쓰지 말 것.
   검사: `[\u{1FA70}-\u{1FAFF}]` 정규식 스캔 (이번에 3건 잡음).

## 서버기술 가이드 구조 (탭 14개)

그룹: 시작(0) · 서버별(1: Nginx🟩 Apache🦅 Tomcat🐱 Caddy🔒) · 운영(2) · 심화(3) ·
**확장(4: msa🧱 kafka📨 scale📈)**. 섹션 접두사 — msa=`m` · kafka=`k` · scale=`x`.
섹션 추가 시 동기화 6곳: pane · `11-sidebar` navset · `20-tab-switch.js`(SEC_LV·EZ·CAP) ·
`00-core.js`(TAB_KW·SEC_KW) · hero SECTIONS 숫자.

## 남은 일 (우선순위순)

1. **python `02-numpy`(13섹션)·`10-db`(18섹션)가 여전히 diag 0** — 다음 시각화 후보.
   java 도 7개로 얇다.
2. **CS 얇은 탭** — `01-math`(2) · `03-comp`(2) · `06-arch`(2) 를 3개 이상으로.
3. CS 학부 확장 후보(이전 HANDOFF 표 유지): 오일러/생성함수 · CG·GMRES · BPP ·
   외부 메모리 모델 · LP·MCMF·HLD·매내커 · TSO/SIMD · io_uring · CRDT · 사이드채널·PQC.
   **후보 선정 전 `11-sidebar.html` 목차 필독** (중복 선정 사고 4회 있었음).
4. 가이드별 css 의 .diag 중복 블록 정리 (선택 — 공통 css 가 이기므로 급하지 않음).
5. 탭 평균 분량 얇은 곳: python 09-algo(3.4KB) · 05-img(3.5) · csharp 05-net(3.6) · python 02-numpy(3.6).

## 조심할 것 (실제로 겪은 실패 — 누적)

1. **`</section>` 누락** — old_string 이 `</section>` 로 끝나면 new_string 도. `verify:guide` 가 잡아 줌.
2. **SVG 텍스트 넘침** — viewBox 680 기준 한글 `.lbl` x=16 → 약 60자 · x=366 → 약 28자.
   감으로 쓰면 15~20% 넘침. 높이는 마지막 baseline+8 이상. **반드시 브라우저 실측**.
   이번에도 신규 43개 중 2개(k02 겹침·k03 넘침)가 실측에서 잡혔다.
3. **`.lbl` 에 font-size 속성을 얹어도 CSS 가 이긴다** — 9px 곁주석은 `.ann` 클래스를 쓸 것.
4. **perl -pi 는 Windows 에서 CRLF 를 심는다** — 일괄 치환은 node 스크립트로 할 것
   (이번에 5개 파일 CRLF 오염 → LF 복구했음).
5. **`git add` 는 저장소 루트에서** · **`public/*-web/index.html` 직접 수정 금지**(빌드가 덮음).
6. **원격에 GitHub Action 커밋이 수시로 들어옴** — push 거부되면 `git fetch && git rebase origin/main`.
7. **`file://` 은 Chrome MCP 거부** — 8899 로컬 서버 경유 (이전 세션 서버가 살아 있는 경우 많음).
8. **`content-visibility` 를 풀지 않으면 `getBBox()` 가 0** → 실측 스크립트가 조용히 통과됨.
   반드시 먼저: `document.querySelectorAll('.pane, .sec').forEach(e=>e.style.contentVisibility='visible')`
9. **문체** — 합니다체 · `<b>` 포인트 · note tip/warn/info · 가이드별 컴포넌트가 조금 다르니 해당 파일 먼저 읽기.
10. Chrome MCP `resize_window` 는 최대화 창에서 안 먹힌다 — 모바일 실측이 필요하면 창을 먼저 복원할 것.

## 관련 파일/명령어
```bash
cd D:/gibis/workTool/astro/black-astro/web
npm run verify:guide          # 빌드 + 정합성 (커밋 전 필수)
npm run build:guide -- server # 특정 가이드만

# 로컬 서버 (public 폴더, 8899)
cd public && node -e "const http=require('http'),fs=require('fs'),p=require('path');http.createServer((q,r)=>{let f=p.join(process.cwd(),decodeURIComponent(q.url.split('?')[0]));try{if(fs.statSync(f).isDirectory())f=p.join(f,'index.html');r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});r.end(fs.readFileSync(f));}catch(e){r.writeHead(404);r.end('nf')}}).listen(8899)"
```

**SVG 실측** (Chrome MCP): `http://localhost:8899/<가이드>-web/index.html` 열고 실행 →
OVER/LAP 가 none 이 될 때까지 문구 축약:
```js
document.querySelectorAll('.pane, .sec').forEach(e=>e.style.contentVisibility='visible');
document.documentElement.style.scrollBehavior='auto';
const panes=[...document.querySelectorAll('.pane')];const prev=panes.map(p=>p.className);panes.forEach(p=>p.classList.add('on'));
const over=[],lap=[];
document.querySelectorAll('.diag svg').forEach(svg=>{
  const vb=svg.viewBox.baseVal, sec=svg.closest('section')?.id||'?';
  const ts=[...svg.querySelectorAll('text')].map(t=>{let b;try{b=t.getBBox()}catch(e){return null}return b&&b.width?{b,s:t.textContent.slice(0,14)}:null}).filter(Boolean);
  ts.forEach(({b,s})=>{const o=Math.round(b.x+b.width-vb.width);if(o>0)over.push(sec+' +'+o+' '+s);});
  for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){
    const a=ts[i].b,c=ts[j].b;
    if(Math.min(a.x+a.width,c.x+c.width)-Math.max(a.x,c.x)>2 && Math.min(a.y+a.height,c.y+c.height)-Math.max(a.y,c.y)>3)
      lap.push(sec+' ['+ts[i].s+']x['+ts[j].s+']');
  }
});
panes.forEach((p,i)=>p.className=prev[i]);
'DIAGS: '+document.querySelectorAll('.diag svg').length+' | OVER: '+(over.join(' / ')||'none')+' | LAP: '+(lap.join(' / ')||'none')
```

**제외 대상**: cpp·rust(평균 11~12KB) · cs(6~7.5KB) — 이미 충분히 두터움.
