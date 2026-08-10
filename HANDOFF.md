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

- `npm run verify:guide` **아홉 가이드 전부 통과**
- 원격에 GitHub Action 커밋(`chore: update 3d contribution graph`)이 수시로 들어옵니다
  → push 거부되면 `git fetch && git rebase origin/main` 후 재시도 (충돌 없음)

### 다이어그램 현황 (`.diag` 인라인 SVG) — 총 152개
| 가이드 | 개수 | 실측 |
|---|---|---|
| csharp | 32 | ✅ 넘침·겹침 0 |
| db | 27 | ✅ |
| **cs** | **26** | ✅ (12탭 전부 보유) |
| python | 23 | ✅ |
| js-ts | 22 | ✅ |
| server | 15 | ✅ |
| java | 7 | ✅ |
| cpp · rust | 0 | 제외 대상 |

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
   (2026-08-10 에 19건 전부 제거, 잔여 0 — 새로 쓸 때 주의)
3. **CS 가이드 목표 수준**
   - 수학 · 이론 · 자료구조 · 알고리즘 → **기초부터 서울권 대학 학사 수준**
   - 시스템 심화 설계 → **KAIST 학사 수준**
   - 수식을 충분히 넣되 **유도 과정과 함께**, 시각화를 붙일 것

## 남은 일 (우선순위순)

### 1. CS 섹션 추가 — 학부 수준 확장 (진행 중)
현재 162 섹션. 지금까지 추가한 것: `a14` 분할상환 · `a15` 네트워크 플로우 ·
`s14` 구간 질의 · `h14` 캐시 일관성 · `d14` Raft · `l14` 마르코프/엔트로피.

**다음 후보**
| 탭 | 섹션 후보 |
|---|---|
| 수학·이론 | 오일러/해밀턴 경로 · 생성함수 · 확률적 알고리즘 분석 |
| 선형대수 | **SVD · 최소제곱법** · 수치 선형대수(조건수) |
| 계산이론 | 근사 비율 증명 · 랜덤화 복잡도(BPP) |
| 자료구조 | 스킵 리스트 · 지속 자료구조(persistent) |
| 알고리즘 | 계산기하 기초 · 접미사 배열/자동완성 · 선형계획법 |
| 컴퓨터구조 | 메모리 모델 상세(TSO vs 약한 모델) · SIMD 실전 |
| 운영체제 | **락프리 자료구조** · 스케줄러 내부(CFS/EEVDF) |
| 분산 | 분산 트랜잭션 심화(2PC vs Saga) · CRDT |

### 2. 시각화 계속
탭당 diag 1~5개. **탭당 3개 이상**을 목표로 하면 좋습니다.
아직 1개뿐인 곳: `09-lang` · `10-sec` · `12-se`.

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

3. **`.bx-ok` CSS 누락** — csharp·server·java·js-ts 네 곳에서 diag 가 쓰는데 정의가 없었습니다(수정 완료).
   **새 가이드에 diag 를 넣을 때 해당 `css/06-*.css` 에 있는지 먼저 확인하세요.**
   ```css
   .diag .bx-ok{fill:rgba(52,211,153,.07);stroke:rgba(52,211,153,.34)}
   ```

4. **섹션 추가는 5곳 동기화** — 이제 실제로 뚫어 놨습니다(금지 사항 아님).
   `pane` · `sidebar navset` · `SEC_LV` · `EZ` · `CAP` 를 전부 맞추면
   `verify:guide` 가 통과합니다. 스크립트로 처리하는 편이 안전합니다
   (bash heredoc 은 긴 HTML 에서 깨지므로 **`.py` 파일로 써서 실행**하세요).

5. **`git add` 를 하위 디렉터리에서 하지 말 것** — `guide-src` 에서 `git add -A -- .` 하면
   **`web/public/` 빌드 산출물이 빠집니다**(실제로 한 번 겪음 → amend 로 복구).
   반드시 저장소 루트에서 실행.

6. **`public/*-web/index.html` 직접 수정 금지** — 빌드가 덮어씀. 소스는 `guide-src/`.

7. **원격에 GitHub Action 커밋이 수시로 들어옵니다** — push 거부되면
   `git fetch && git rebase origin/main` 후 재시도 (기여 그래프 SVG라 충돌 없음).

8. **`file://` 은 Chrome MCP 가 거부** — 반드시 로컬 서버 경유.

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
