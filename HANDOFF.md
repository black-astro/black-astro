# 핸드오프 — 학습 가이드 내용 보강 + 섹션별 시각화 (2026-08-10 갱신)

## 목표
아홉 가이드(`web/guide-src/*` → `web/public/*-web/index.html`)를
**"기초부터 전문가까지 이 페이지만 보고 실서비스를 만들 수 있는"** 수준으로 끌어올린다.

**판단 기준이 바뀌었습니다.** 초기에는 "섹션 바이트 수가 얇은 곳"을 기준으로 채웠는데,
사용자 피드백으로 기준이 **"실서비스 실무에서 중요한 것이 실제로 들어 있는가"**로 바뀌었습니다.
→ 분량이 두터워도 **시각화가 없거나 실무 묶음이 빠진 곳**이 진짜 구멍입니다.

## 현재 상태 (전부 커밋·푸시됨)

| 커밋 | 내용 |
|---|---|
| `5000df7` | CS 기술 가이드 신설 + 아홉 가이드 보강·다이어그램 (114파일) |
| `138bb43` | server 04-tomcat · python 08-toolbox · csharp 02-adv/01-lang |
| `b0316d0` | js-ts 12-html · 13-css + 로딩 순서 다이어그램 |
| `0f7dadc` | python 판다스 실무 보강 (컬럼 다루기 · merge 사고 · 배치 파이프라인) |
| `376aa6d` | CS 학부 섹션 3개 (분할상환 · 네트워크 플로우 · 구간 질의) |
| `a770ac8` | **"초보" 표현 전면 제거** + CS 시각화 (선형대수 3 · 컴파일러 · 보안) |
| `f91418e` | CS 시스템 심화 2개 (캐시 일관성 MESI · Raft) + SW공학 시각화 |
| `5453663` | CS 선형대수 마르코프 체인 · 엔트로피 |
| `328719f` | CS 시각화 4개 (데드락 · TCP · 귀납법 · P·NP) |
| `c4c4892` | CS 섹션 3개(`l15` SVD·최소제곱 · `s15` 스킵리스트·지속자료구조 · `o14` 스케줄러 내부) + 시각화 12개 (26 → 38) |
| `a9febee` | **알고리즘 탭 a01~a13 에 동작 시각화 13개** (algomaster 스타일 · 단계별 그림) |
| `a0bc2ae` | **알고리즘 플래티넘 구간 5개 섹션** `a16` SCC·2-SAT · `a17` LCA·트리DP · `a18` 비트마스크·LIS · `a19` 계산기하 · `a20` Z·아호코라식 |
| `1fa5c24` | **다이어그램 확대율 상한**(`max-width:1000px`) — 글씨가 본문보다 크던 문제 + pandas axis 레이아웃 재배치 |
| `fe0261c` | **화살촉 도입**(`.ar` 119개) + 선 끝 경계 보정 + `guide-src/DIAGRAM-STYLE.md` 신설 |
| `cc73977` | **코딩테스트 빈출 3절** `a21` 구현·시뮬레이션 · `a22` 투포인터·누적합 · `a23` 코테 정수론 |

- `npm run verify:guide` **아홉 가이드 전부 통과**
- 원격에 GitHub Action 커밋(`chore: update 3d contribution graph`)이 수시로 들어옵니다
  → push 거부되면 `git fetch && git rebase origin/main` 후 재시도 (충돌 없음)

### 다이어그램 현황 (`.diag` 인라인 SVG) — 총 192개
| 가이드 | 개수 | 실측 |
|---|---|---|
| **cs** | **65** | ✅ 넘침·겹침 0 (12탭 전부 2개 이상) |
| csharp | 33 | ✅ |
| db | 27 | ✅ |
| python | 23 | ✅ |
| js-ts | 22 | ✅ |
| server | 15 | ✅ |
| java | 7 | ✅ |
| cpp · rust | 0 | 제외 대상 |

CS 탭별 diag: math 2 · la 7 · comp 2 · ds 4 · **algo 29** · arch 2 · os 4 ·
net 3 · lang 3 · sec 3 · dist 3 · se 3 — 알고리즘 탭은 **전 섹션이 시각화를 갖췄습니다.**

### 탭 평균 분량 (얇은 순)
```
3.4KB  python 09-algo      ← 다음 후보
3.5KB  python 05-img
3.6KB  csharp 05-net · python 02-numpy
3.7KB  js-ts 05-nest
3.8KB  db 05-pg · 06-mysql · 07-sqlite
```
초기 목표였던 2.0~3.1KB대 탭은 전부 해소됐습니다.

## 사용자 지시로 확정된 기준

1. **분량(바이트)이 아니라 실무 커버리지로 판단할 것.**
   "이걸 하려면 어디를 봐야 하나"가 한자리에 없으면 그것이 구멍입니다.
2. **"왕초보 · 초보 · 초보자" 표현 금지.** "기초 · 처음 · 입문" 을 씁니다.
   (2026-08-10 에 19건 전부 제거 — 새로 쓸 때 주의)
   본문에는 잔여 0 이지만 **shared 의 코드 주석 3건**이 남아 있습니다
   (`shared/css/04-panels-beginner.css:68` · `shared/css/05-responsive.css:282` ·
   `shared/js/05-nav.js:171`). 화면에 안 보이는 주석이고, 고치면 **아홉 가이드가 전부
   재빌드**되어 디프가 커지므로 이번에는 두었습니다. 손볼 거면 **단독 커밋**으로 하세요.
3. **CS 가이드 목표 수준**
   - 수학 · 이론 · 자료구조 · 알고리즘 → **기초부터 서울권 대학 학사 수준**
   - 시스템 심화 설계 → **KAIST 학사 수준**
   - 수식을 충분히 넣되 **유도 과정과 함께**, 시각화를 붙일 것

## 남은 일 (우선순위순)

### 1. CS 섹션 추가 — 학부 수준 확장 (진행 중)
현재 **173 섹션**. 지금까지 추가한 것: `a14` 분할상환 · `a15` 네트워크 플로우 ·
`s14` 구간 질의 · `h14` 캐시 일관성 · `d14` Raft · `l14` 마르코프/엔트로피 ·
`l15` SVD·최소제곱 · `s15` 스킵리스트·지속자료구조 · `o14` 스케줄러 내부(CFS/EEVDF) ·
`a16` SCC·2-SAT · `a17` LCA·트리DP · `a18` 비트마스크·LIS · `a19` 계산기하 · `a20` Z·아호코라식 ·
`a21` 구현·시뮬레이션 · `a22` 투포인터·누적합 · `a23` 코테 정수론.

**다음 후보** (이미 다룬 것은 뺐습니다)
| 탭 | 섹션 후보 |
|---|---|
| 수학·이론 | 오일러/해밀턴 경로 · 생성함수 · 확률적 알고리즘 분석 |
| 선형대수 | 수치 선형대수 심화 — 반복법(CG·GMRES) · 희소 행렬 |
| 계산이론 | 근사 비율 증명 · 랜덤화 복잡도(BPP) |
| 자료구조 | 캐시 인지 자료구조 · 외부 메모리 모델 |
| 알고리즘 | 선형계획법 · MCMF · HLD(무거운 간선 분해) · 매내커 |
| 컴퓨터구조 | **메모리 모델 상세(TSO vs 약한 모델)** · SIMD 실전 |
| 운영체제 | 페이지 캐시·io_uring 심화 |
| 분산 | **CRDT** · 분산 추적/시계 동기화 심화 |
| 보안 | 사이드채널 · 포스트양자 암호 개요 |

> **주의 — 후보를 고르기 전에 `11-sidebar.html` 의 해당 `navset` 목차를 반드시 읽으세요.**
> 옛 후보 목록에 있던 “락프리 자료구조”(`d04`) · “2PC vs Saga”(`d11`) ·
> “이분 매칭”(`a15` 안) · “세그먼트 트리 lazy”(`s14`) 는 **전부 이미 있었습니다.**

### 1-b. 알고리즘 탭 — 사용자 확정 기준 (2026-08-10)
- **시각화 디자인 기준은 `web/guide-src/DIAGRAM-STYLE.md` 에 따로 있습니다. 먼저 읽으세요.**
  카드 배경·투명도·박스 색은 **파이썬 가이드가 기준**입니다(그라디언트·그림자·굵은 테두리 금지).
- python 가이드의 알고리즘은 **파이썬으로 문제 푸는 쪽**, CS 가이드의 알고리즘은
  **이론을 쉽게 설명하는 쪽**으로 역할이 갈립니다. 중복을 걱정하지 말 것.
- **섹션마다 시각화가 있어야 합니다.** 참고 기준은 `algomaster.io` —
  단계별 상태 변화 · 배열 셀 · 포인터 · 색으로 구분한 상태. 현재 테마에 맞춰
  `.bx`(기본) · `.bx-ok`(확정·정답) · `.bx-warn`(버림·틀림) · `.bx-fw`(현재 대상) 로 씁니다.
- **커버 범위는 백준 플래티넘까지.** 각 절 끝에 연습 문제를 난이도 등급과 함께 답니다.
- **코드 설명이 필요한 곳은 파이썬으로.** 파이썬 특유의 함정(재귀 한도 ·
  비트 연산 우선순위 · 메모리 · PyPy)을 함께 적습니다.

### 2. 시각화 계속
CS 12탭 전부 2개 이상이고 알고리즘 탭은 29개입니다. 다음 목표를 잡는다면
`01-math`(2) · `03-comp`(2) · `06-arch`(2) 를 3개 이상으로 올리는 쪽입니다.

### 3. 다른 가이드 얇은 곳
```
3.4KB  python 09-algo      3.5KB  python 05-img
3.6KB  csharp 05-net       3.6KB  python 02-numpy
3.7KB  js-ts 05-nest       3.8KB  db 05-pg · 06-mysql · 07-sqlite
```
python `02-numpy`(13섹션 diag 0) · `10-db`(18섹션 diag 0) 가 여전히 시각화 0 입니다.

## 조심할 것 (실제로 겪은 실패)

1. **`</section>` 누락 사고** (이전 세션 9회). old_string 이 `</section>` 로 끝나면
   new_string 도 반드시 그렇게 끝나는지 확인. `verify:guide` 의 "section 태그 불균형"이 잡아 줍니다.
   일괄 복구: `perl -0777 -pi -e 's/  <\/div>\n(\n+<!-- ==================== )/  <\/div>\n<\/section>\n$1/g' <파일>`

2. **SVG 텍스트 넘침** — viewBox 680 기준, 한글 `.lbl`(10.5px)은 x=16 시작 시 약 60자,
   x=366 시작 시 약 28자가 한계. **감으로 쓰면 15~20%가 넘칩니다.**
   반드시 브라우저 실측(아래)으로 확인하고 **문구를 줄여** 해결 (x 이동은 겹침을 만듦).
   **가로만 보지 말고 세로도 보세요** — 마지막 텍스트의 baseline 이 viewBox 높이와
   같으면 1~3px 잘립니다. **마지막 baseline + 8 이상**을 viewBox 높이로 잡으세요.

2-b. **다이어그램 확대율 — `.diag svg{max-width:1000px}`** (2026-08-10 확정)
   전에는 `width:100%` 라 컬럼 폭(1384px)까지 늘어나 **viewBox 680 이 2.04배로 확대**됐고,
   그 결과 `.lbl` 이 화면에서 **21.4px** 로 본문(17.5px)보다 커 보였습니다.
   이제 1000px 로 잘라 **확대율 1.47** 고정입니다. 화면 실측 크기는:
   ```
   font-size  9  → 13.2px      font-size 11 → 16.2px
   font-size 10  → 14.7px      .lbl (10.5) → 15.4px      본문 17.5px
   ```
   **font-size 9 미만은 쓰지 마세요** — 13px 아래로 내려갑니다.
   글씨가 크다는 지적이 또 나오면 이 값을 줄이면 됩니다(아홉 가이드 `css/06-*.css` 공통).

3. **`.bx-ok` CSS 누락** — csharp·server·java·js-ts 네 곳에서 diag 가 쓰는데 정의가 없었습니다(수정 완료).
   **새 가이드에 diag 를 넣을 때 해당 `css/06-*.css` 에 있는지 먼저 확인하세요.**
   ```css
   .diag .bx-ok{fill:rgba(52,211,153,.07);stroke:rgba(52,211,153,.34)}
   ```

4. **섹션 추가는 5곳 동기화** — 이제 실제로 뚫어 놨습니다(금지 사항 아님).
   `pane` · `sidebar navset` · `SEC_LV` · `EZ` · `CAP` 를 전부 맞추면
   `verify:guide` 가 통과합니다. Edit 도구로 앵커를 잡아 넣어도 잘 됩니다
   (긴 HTML 은 bash heredoc 에서 깨지므로 heredoc 만 피하세요).

4-b. **`verify:guide` 가 안 잡는 여섯 번째 자리 — hero 의 `SECTIONS` 숫자.**
   각 pane 맨 위 `<div><b>13</b><span>SECTIONS</span></div>` 는 수동입니다.
   실제로 la·ds 가 14섹션인데 13으로 남아 있었습니다(이번에 15/15/14 로 정정).
   섹션을 넣었으면 **그 pane 의 이 숫자도 같이 고치세요.**

5. **`git add` 를 하위 디렉터리에서 하지 말 것** — `guide-src` 에서 `git add -A -- .` 하면
   **`web/public/` 빌드 산출물이 빠집니다**(실제로 한 번 겪음 → amend 로 복구).
   반드시 저장소 루트에서 실행.

6. **`public/*-web/index.html` 직접 수정 금지** — 빌드가 덮어씀. 소스는 `guide-src/`.

7. **원격에 GitHub Action 커밋이 수시로 들어옵니다** — push 거부되면
   `git fetch && git rebase origin/main` 후 재시도 (기여 그래프 SVG라 충돌 없음).

8. **`file://` 은 Chrome MCP 가 거부** — 반드시 로컬 서버 경유.
   8899 포트에 **이전 세션 서버가 살아 있는 경우가 많습니다**(EADDRINUSE).
   그대로 쓰면 됩니다 — 같은 `public` 폴더를 서빙합니다.

8-b. **`content-visibility:auto` 때문에 스크린샷용 스크롤이 안 먹습니다.**
   섹션에 `contain-intrinsic-size: auto 900px` 가 걸려 있어
   `scrollIntoView` 가 엉뚱한 곳으로 갑니다. 눈으로 확인하려면 먼저:
   ```js
   document.querySelectorAll('.pane, .sec').forEach(e=>e.style.contentVisibility='visible')
   document.documentElement.style.scrollBehavior='auto'
   // 그 뒤 window.scrollTo 를 5~8회 반복해야 자리에 멈춥니다
   ```
   **실측 스크립트에도 이 처리가 반드시 먼저 필요합니다.** `content-visibility` 로 렌더가
   생략된 SVG 는 `getBBox()` 가 0 을 돌려주고, 스크립트가 그것을 **조용히 건너뜁니다** —
   실제로 이것 때문에 넘침 6건이 “none” 으로 보고되고 있었습니다(2026-08-10 발견).

9. **문체 유지** — 합니다체, `<b>` 포인트, note tip/warn/info, card/grid2/vs/tw 구조.
   가이드마다 컴포넌트가 조금씩 다릅니다(server 는 `table class="cheat"`,
   python 은 `note java` Spring 비유, csharp 은 `.tw > table`) — **해당 파일을 먼저 읽고 맞추세요.**

## 관련 파일/명령어
```bash
cd D:/gibis/workTool/astro/black-astro/web
npm run verify:guide          # 빌드 + 정합성 (커밋 전 필수)
npm run build:guide -- python # 특정 가이드만

# 로컬 서버 (public 폴더, 8899)
cd public && node -e "const http=require('http'),fs=require('fs'),p=require('path');http.createServer((q,r)=>{let f=p.join(process.cwd(),decodeURIComponent(q.url.split('?')[0]));try{if(fs.statSync(f).isDirectory())f=p.join(f,'index.html');r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});r.end(fs.readFileSync(f));}catch(e){r.writeHead(404);r.end('nf')}}).listen(8899)"
```

**SVG 실측** (Chrome MCP): `http://localhost:8899/<가이드>-web/index.html` 열고 실행 →
OVER/LAP 가 none 이 될 때까지 문구 축약:
```js
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
