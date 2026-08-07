# 핸드오프 — 학습 가이드 내용 보강 + 섹션별 시각화 (2026-08-07 갱신)

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
| (미커밋) | python 01-pandas 실무 보강 + diag 4개 ← **이번 작업분** |

- `npm run verify:guide` **아홉 가이드 전부 통과**
- 원격에 GitHub Action 커밋(`chore: update 3d contribution graph`)이 수시로 들어옵니다
  → push 거부되면 `git fetch && git rebase origin/main` 후 재시도 (충돌 없음)

### 다이어그램 현황 (`.diag` 인라인 SVG)
| 가이드 | 개수 | 실측 |
|---|---|---|
| csharp | 33 | ✅ 넘침·겹침 0 |
| python | 23 | ✅ |
| js-ts | 22 | ✅ |
| db | 27 | ✅ |
| server | 15 | ✅ |
| cs | 8 | 미실측 |
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

## 남은 일 (우선순위순)

### 1. 시각화가 0인 탭 — **가장 큰 구멍**
분량은 충분한데 그림이 없는 곳입니다. 실무 개념일수록 그림 하나가 큽니다.

| 탭 | 섹션 | diag | 후보 개념 |
|---|---|---|---|
| **python 02-numpy** | 13 | 0 | 브로드캐스팅 규칙 · 뷰 vs 복사 · 축(axis) · 메모리 레이아웃 |
| **python 10-db** | 18 | 0 | 커넥션 풀 · 트랜잭션 경계 · ORM 세션 수명 |
| **python 09-algo** | 14 | 0 | 시간복잡도 비교 · 자료구조 선택 |
| **python 08-toolbox** | 20 | 0 | (mv 6개 있음 — 우선순위 낮음) |
| **db 나머지** | — | — | 실측 필요 |

### 2. python 01-pandas 잔여
이번에 s03(컬럼 다루기)·s10(groupby)·s11(merge)·s15(뷰/복사) 넷을 넣었습니다. 남은 후보:
- **s05 loc/iloc** — 인터랙티브 시뮬레이터는 있으나 `.diag` 없음
- **s13 pivot ↔ melt** — 넓은 표 ↔ 긴 표 변환은 그림이 특히 효과적
- **s14 시계열 rolling** — 창(window)이 미끄러지는 그림
- **s09 결측치** — NaN 전파 방식

### 3. 실무 묶음이 흩어진 곳 점검
"이걸 하려면 어디를 봐야 하나"가 한자리에 없는 주제를 찾아 묶는 작업입니다.
판다스에서 **컬럼 다루기**가 그 예였습니다(s04 `usecols` · s05 대괄호 · s08 연산에 흩어져 있었음).
→ 각 가이드에서 비슷한 것을 찾아보세요.

### 4. 커버리지 실측 방법 (바이트 수 말고)
```bash
cd web/guide-src
# 특정 주제가 실제로 다뤄지는지
for k in chunksize SettingWithCopy validate= select_dtypes; do
  printf "%-18s %s\n" "$k" "$(grep -o "$k" python/parts/panes/01-pandas.html | wc -l)"
done

# 탭별 섹션·시각화 개수 (구멍 찾기)
for f in python/parts/panes/*.html; do
  printf "%-30s 섹션%3d diag%3d mv%3d\n" "$(basename $f)" \
    "$(grep -o '<section class="sec"' $f|wc -l)" \
    "$(grep -o 'diag rv' $f|wc -l)" "$(grep -o 'class="mv"' $f|wc -l)"
done
```

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

4. **`git add` 를 하위 디렉터리에서 하지 말 것** — `guide-src` 에서 `git add -A -- .` 하면
   **`web/public/` 빌드 산출물이 빠집니다**(실제로 한 번 겪음 → amend 로 복구).
   반드시 저장소 루트에서 실행.

5. **`public/*-web/index.html` 직접 수정 금지** — 빌드가 덮어씀. 소스는 `guide-src/`.

6. **섹션을 새로 추가하지 말 것** — 사이드바·SEC_LV·EZ·CAP 5곳 동기화가 필요해집니다.
   기존 섹션 안에 블록만 추가하는 것이 안전.

7. **`file://` 은 Chrome MCP 가 거부** — 반드시 로컬 서버 경유.

8. **문체 유지** — 합니다체, `<b>` 포인트, note tip/warn/info, card/grid2/vs/tw 구조.
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
