# 🎨 Blue Dark Theme — 디자인 시스템 명세서

> **용도**: 이 문서를 AI(Claude, ChatGPT 등)에게 통째로 붙여넣고
> "이 디자인 시스템을 그대로 적용해서 ○○ 페이지를 만들어줘"라고 지시하면
> 동일한 테마의 결과물을 얻을 수 있습니다.
> 원본: Python Visual Guide (https://black-astro.github.io/black-astro/python-web/)

---

## AI에게 시키는 방법 (복붙용 프롬프트)

```
아래 첨부한 "Blue Dark Theme 디자인 시스템 명세서"를 정확히 따라서
[만들고 싶은 것]을 단일 HTML 파일로 만들어줘.

- 컬러 토큰은 명세서의 CSS 변수를 변수명까지 그대로 사용
- 카드/버튼/코드블록/콜아웃은 명세서의 컴포넌트 스펙 그대로
- 애니메이션은 transform/opacity만 사용 (명세서 8장 성능 규칙 준수)
- 반응형은 명세서 9장 브레이크포인트 그대로
- 외부 라이브러리·CDN 금지, 전부 인라인

[명세서 전체 붙여넣기]
```

---

## 1. 디자인 철학 (한 문단 요약)

**"깊은 남색 밤하늘 위의 네온 청록"**.
배경은 거의 검정에 가까운 네이비(#060b16)로 깔고, 정보의 위계를
파랑(#3b82f6) → 시안(#22d3ee) → 보라(#a78bfa) 그라데이션으로 표현한다.
표면(카드)은 배경보다 살짝 밝은 남색 패널로 띄우고, 테두리는 어두운 청색 선으로
은은하게 구분한다. 강조는 색보다 **글로우(빛 번짐)** 로 한다.
모든 인터랙티브 요소는 눌렀을 때 반드시 시각 피드백이 있고,
애니메이션은 "데이터가 실제로 이동하는 것처럼" 보이게 FLIP 기법을 쓴다.

---

## 2. 컬러 토큰 (CSS 변수 — 이 이름 그대로 사용)

```css
:root{
  /* ── 배경 계층 (어두운 순) ── */
  --bg:        #060b16;   /* 페이지 배경. 거의 검정인 네이비 */
  --bg-2:      #0a1120;   /* 살짝 밝은 배경 (스크롤바 트랙, 보조 영역) */
  --panel:     #0f1a2e;   /* 카드·패널 기본 표면 */
  --panel-2:   #14243d;   /* 패널 위의 패널 (버튼, 표 헤더) */
  --panel-3:   #1a2e4d;   /* 가장 밝은 표면 (활성 상태) */

  /* ── 테두리 ── */
  --line:      #1e3459;   /* 기본 테두리 */
  --line-soft: #17284a;   /* 은은한 구분선 */

  /* ── 액센트 (의미 고정) ── */
  --blue:      #3b82f6;   /* 주 색상. 버튼, 강조, 링크 계열 */
  --blue-l:    #60a5fa;   /* 밝은 파랑. 링크, 제목 그라데이션 */
  --blue-d:    #1d4ed8;   /* 어두운 파랑. 그라데이션 끝, pressed */
  --cyan:      #22d3ee;   /* 하이라이트. 활성 표시, 코드 라벨, 포커스 */
  --violet:    #a78bfa;   /* 3차 액센트. 그라데이션 끝단, 그룹 C */
  --green:     #34d399;   /* 성공, 팁, True, 결과 */
  --amber:     #fbbf24;   /* 주의, Java 비유, 중급 */
  --rose:      #fb7185;   /* 경고, 에러, NaN, 고급 */

  /* ── 텍스트 (밝은 순) ── */
  --ink:       #e8f0ff;   /* 제목·본문 강조 */
  --ink-2:     #b6c8e6;   /* 일반 본문 */
  --dim:       #7d94b8;   /* 보조 설명 */
  --dim-2:     #55688a;   /* 라벨, 힌트, 최저 위계 */

  /* ── 반경 ── */
  --r-s: 8px;   --r-m: 14px;   --r-l: 22px;

  /* ── 그림자 ── */
  --sh-1: 0 1px 2px rgba(0,0,0,.4);
  --sh-2: 0 10px 30px rgba(0,0,0,.45);                       /* 카드 */
  --sh-glow: 0 0 0 1px rgba(59,130,246,.35),
             0 0 28px rgba(59,130,246,.22);                  /* 파랑 글로우 */

  /* ── 폰트 ── */
  --mono: "JetBrains Mono","D2Coding","Cascadia Code",Consolas,ui-monospace,monospace;
  --sans: "Pretendard","Noto Sans KR",-apple-system,"Segoe UI",Roboto,sans-serif;

  /* ── 이징 (모든 전환에 이것 하나) ── */
  --ease: cubic-bezier(.2,.85,.25,1);
}
```

### 색 사용 규칙
- **의미 색은 절대 섞지 않는다**: green=성공/팁, amber=주의/비유, rose=위험/에러, cyan=활성/하이라이트
- 반투명이 필요하면 `rgba(59,130,246,.14)` 식으로 액센트의 알파 버전을 쓴다 (배경 8~16%, 테두리 30~55%)
- 그룹 구분 3색: A=blue, B=green, C=violet
- 선택 영역: `::selection{background:rgba(59,130,246,.4);color:#fff}`

---

## 3. 배경 이펙트 (페이지 분위기의 핵심)

```css
body{background:var(--bg);color:var(--ink);overflow-x:hidden}

/* ① 오로라 — 고정된 3개의 라디얼 그라데이션 */
body::before{
  content:"";position:fixed;inset:0;z-index:-2;
  background:
    radial-gradient(900px 600px at 12% -5%, rgba(59,130,246,.20), transparent 60%),
    radial-gradient(700px 500px at 92% 8%,  rgba(34,211,238,.12), transparent 60%),
    radial-gradient(800px 700px at 50% 105%,rgba(167,139,250,.12), transparent 60%);
}
/* ② 모눈 격자 — 위쪽만 보이게 마스크 */
body::after{
  content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;
  background-image:
    linear-gradient(rgba(59,130,246,.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59,130,246,.045) 1px, transparent 1px);
  background-size:56px 56px;
  mask-image:radial-gradient(ellipse 80% 60% at 50% 30%, #000 40%, transparent 100%);
}
```

---

## 4. 타이포그래피

| 요소 | 스펙 |
|---|---|
| 본문 | var(--sans), 15~15.6px, line-height 1.75, 색 --ink-2 |
| 히어로 제목 | clamp(38px, 5.6vw, 68px), weight 800, letter-spacing -.045em |
| 섹션 제목 h2 | clamp(25px, 3.1vw, 36px), weight 750 |
| 소제목 h3 | 19px + 왼쪽에 4px 세로 그라데이션 바(cyan→blue) |
| 코드 | var(--mono), 13.2px, line-height 1.72 |
| 라벨/캡션 | var(--mono), 10~12px, letter-spacing .08~.18em, 대문자, 색 --dim-2 |

**그라데이션 텍스트** (제목 강조의 시그니처):
```css
.grad-text{
  background:linear-gradient(120deg, var(--blue-l), var(--cyan));
  -webkit-background-clip:text; background-clip:text; color:transparent;
}
/* 히어로는 4색: #fff 10% → --blue-l 45% → --cyan 75% → --violet */
```

---

## 5. 핵심 컴포넌트 스펙

### 5-1. 카드
```css
.card{
  background:linear-gradient(165deg, var(--panel) 0%, rgba(10,17,32,.75) 100%);
  border:1px solid var(--line);
  border-radius:var(--r-l);          /* 22px */
  padding:26px;
  box-shadow:var(--sh-2);
  position:relative; overflow:hidden;
  min-width:0; max-width:100%;       /* ★ 모바일 오버플로 방지 필수 */
}
/* 상단 1px 하이라이트 선 — 카드의 시그니처 */
.card::before{
  content:"";position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg, transparent, rgba(96,165,250,.7), transparent);
}
```

### 5-2. 알약 버튼(칩) — 인터랙티브 조작의 기본
```css
button.chip{
  font-family:var(--mono); font-size:12.4px; color:var(--ink-2);
  background:var(--panel-2); border:1px solid var(--line);
  padding:7px 14px; border-radius:99px; cursor:pointer;
  transition:.22s var(--ease); touch-action:manipulation;
}
button.chip:hover{border-color:var(--blue); color:#fff;
  transform:translateY(-1px); box-shadow:0 4px 14px rgba(59,130,246,.25)}
button.chip.on{                                   /* 활성 */
  background:linear-gradient(135deg, var(--blue), var(--blue-d));
  border-color:var(--blue-l); color:#fff; box-shadow:var(--sh-glow)}
button.chip:active{transform:scale(.96)}
button.chip.ghost{background:transparent; border-style:dashed}
```

### 5-3. 코드 블록
```css
pre.code{
  background:#050a14;                 /* 배경보다 더 어둡게 */
  border:1px solid var(--line); border-radius:var(--r-m);
  padding:16px 18px; overflow-x:auto; position:relative;
  font-family:var(--mono); font-size:13.2px; line-height:1.72;
}
/* 우상단 언어 라벨 */
pre.code::before{
  content:attr(data-lang); position:absolute; top:0; right:0;
  font-size:10px; letter-spacing:.12em; color:var(--dim-2);
  background:var(--panel); border-left:1px solid var(--line);
  border-bottom:1px solid var(--line);
  padding:2px 9px; border-radius:0 var(--r-m) 0 8px;
}
```
**구문 하이라이트 팔레트**:
| 토큰 | 색 |
|---|---|
| 키워드 (def, if, import…) | `#c084fc` (연보라) |
| 문자열 | `#86efac` (연두) |
| 숫자 | `#fbbf24` (앰버) |
| 주석 | `#4e6183` + italic |
| 함수 호출 | `#60a5fa` |
| 모듈/주요 변수 (pd, np, df) | `#22d3ee` |
| 기본 텍스트 | `#c8d8f0` |

### 5-4. 콜아웃 (3종 — 아이콘은 ::before로)
```css
.note{border-radius:var(--r-m); padding:15px 18px 15px 44px;
  font-size:14.4px; position:relative; color:var(--ink-2);
  border:1px solid var(--line); background:rgba(20,36,61,.5)}
.note::before{position:absolute; left:15px; top:14px}
.note.tip {border-color:rgba(52,211,153,.32); background:rgba(52,211,153,.06)}
.note.tip::before{content:"💡"}      .note.tip b{color:var(--green)}
.note.warn{border-color:rgba(251,113,133,.32); background:rgba(251,113,133,.06)}
.note.warn::before{content:"⚠️"}     .note.warn b{color:var(--rose)}
.note.info{border-color:rgba(251,191,36,.32); background:rgba(251,191,36,.06)}
.note.info::before{content:"☕"}      .note.info b{color:var(--amber)}
```

### 5-5. 표
```css
.tw{overflow-x:auto; border-radius:var(--r-m);
  border:1px solid var(--line); background:rgba(6,11,22,.45); max-width:100%}
table.df{border-collapse:separate; border-spacing:0; width:100%;
  font-family:var(--mono); font-size:12.8px}
table.df thead th{
  background:linear-gradient(180deg, var(--panel-2), var(--panel));
  color:var(--cyan); font-weight:650; padding:9px 14px;
  border-bottom:1px solid var(--line)}
table.df tbody td{padding:8px 14px; color:var(--ink-2);
  border-bottom:1px solid rgba(30,52,89,.45)}
table.df tbody tr:hover td{background:rgba(59,130,246,.07)}
```

### 5-6. 인라인 키워드 배지
```css
.kw{font-family:var(--mono); font-size:.9em; color:var(--cyan);
  background:rgba(34,211,238,.09); border:1px solid rgba(34,211,238,.2);
  padding:1px 6px; border-radius:5px}
```

### 5-7. 섹션 헤더 번호 배지
```css
.no{display:inline-block; font-family:var(--mono); font-size:11.5px;
  font-weight:700; color:#04101f;
  background:linear-gradient(135deg, var(--blue), var(--cyan));
  padding:3px 11px; border-radius:99px; letter-spacing:.08em}
```

### 5-8. 난이도/상태 배지
```css
.lvl{font-family:var(--mono); font-size:10.5px; font-weight:700;
  padding:3px 11px; border-radius:99px; border:1px solid}
.lvl.e{color:var(--green); border-color:rgba(52,211,153,.4); background:rgba(52,211,153,.08)}
.lvl.m{color:var(--amber); border-color:rgba(251,191,36,.4); background:rgba(251,191,36,.08)}
.lvl.h{color:var(--rose);  border-color:rgba(251,113,133,.4); background:rgba(251,113,133,.08)}
```

### 5-9. 터미널 목업
```css
.term{background:#04080f; border:1px solid var(--line);
  border-radius:var(--r-m); overflow:hidden; box-shadow:var(--sh-2)}
.term .tbar{display:flex; gap:6px; padding:8px 12px;
  background:var(--panel); border-bottom:1px solid var(--line-soft)}
/* 신호등: #ff5f57 / #febc2e / #28c840, 9px 원 */
.term .body{padding:14px 16px; font-family:var(--mono);
  font-size:12.8px; line-height:1.85; white-space:pre-wrap}
/* 프롬프트 초록(--green), 출력 --dim, 성공 --green */
```

### 5-10. 데모 스테이지 (인터랙티브 영역 컨테이너)
```css
.stage{
  background:radial-gradient(700px 300px at 50% 0%, rgba(59,130,246,.09), transparent 70%),
             rgba(6,11,22,.55);
  border:1px solid var(--line); border-radius:var(--r-l); padding:24px}
.stage-title{font-family:var(--mono); font-size:11px; letter-spacing:.16em;
  color:var(--dim-2); text-transform:uppercase;
  display:flex; align-items:center; gap:9px}
.stage-title::after{content:""; flex:1; height:1px; background:var(--line-soft)}
```

### 5-11. 파일 트리
```css
.tree{font-family:var(--mono); font-size:12.8px; line-height:2;
  white-space:pre; overflow-x:auto;          /* ★ pre 필수 */
  background:rgba(6,11,22,.5); border:1px solid var(--line);
  border-radius:var(--r-m); padding:16px 18px}
/* 폴더 --blue-l · 파일 --ink-2 · 주석 --dim-2 · 강조 --cyan bold */
```

---

## 6. 레이아웃 시스템

```
.shell  : max-width 1720px, 중앙 정렬, display:flex
사이드바 : 고정 250px, position:sticky top:0 height:100vh, 우측 1px 선
main    : flex:1, min-width:0(★필수), padding 0 30px
섹션    : padding 66px 0, 상단 1px 구분선(--line-soft)
        + content-visibility:auto; contain-intrinsic-size:auto 900px (성능)
그리드   : .grid2 = repeat(2, minmax(0,1fr)) gap 20px   ← minmax(0,·) 필수
상단탭   : position:sticky top:0, PC는 flex-wrap:wrap / 모바일은 가로스크롤
```

**스크롤바 스타일** (웹킷): 폭 11px, 트랙 --bg-2, 썸 --line 라운드 99px + 3px 트랙색 보더, hover 시 --blue-d

---

## 7. 애니메이션 카탈로그

| 이름 | 용도 | 구현 |
|---|---|---|
| **FLIP 이동** | 요소가 실제로 날아가는 재배치 (정렬·그룹핑·피벗) | 변경 전 좌표 기록 → DOM 변경 → 새 좌표와의 차이를 `transform: translate`로 되돌린 뒤 0으로 animate (620~820ms, --ease) |
| **리빌** | 스크롤 진입 시 등장 | IntersectionObserver + `.rv{opacity:0; translateY(26px)}` → `.in`에서 해제, 750ms. 딜레이 계단 .09s/.18s/.27s |
| **fadeUp** | 새로 생기는 요소 | `@keyframes fadeUp{from{opacity:0; translateY(14px)}}` 500ms, 목록은 index×0.03~0.09s 지연 |
| **펄스 점** | 라이브 표시 | ::after에 `scale(.4→1.6) + opacity(0.9→0)` 1.8s 무한 |
| **화살표 흐름** | 파이프라인 방향 | `translateX(-4px↔4px) + opacity(.35↔.95)` 1.7s 무한 |
| **글로우 활성** | 선택 상태 | border-color 액센트 + `box-shadow: 0 0 22px rgba(액센트,.14)` (전환은 transition으로만) |
| **진행바** | 로딩/재생 | `transform:scaleX()` 만 사용 (width 금지) |
| **타이핑** | 터미널 데모 | 글자당 26ms setTimeout |

### 성능 철칙 (반드시 준수)
1. 애니메이션은 **transform과 opacity만** — width/height/box-shadow/left/top 애니메이션 금지
2. 스크롤 핸들러는 **requestAnimationFrame 스로틀** + `{passive:true}`
3. 진행바·게이지는 `scaleX`, 글로우 펄스는 의사요소의 transform
4. 섹션에 `content-visibility:auto` — 화면 밖 렌더 스킵
5. sticky 헤더에 `backdrop-filter` 금지 (스크롤 프레임 드랍 주범) — 불투명 배경 사용
6. `@media (prefers-reduced-motion: reduce)`에서 전부 무효화:
   `*{animation-duration:.01ms!important; transition-duration:.01ms!important}`

---

## 8. 반응형 브레이크포인트

| 폭 | 대응 |
|---|---|
| ≤1280px | 사이드바 슬림(228px), main 패딩 축소 |
| ≤1180px | 장식 요소 제거, 좌우 2단 → 1단 |
| ≤1080px | **사이드바 숨김** + 플로팅 목차(☰ 바텀시트) 등장 |
| ≤980px | 모든 2단 그리드 1단, 탭바 가로스크롤 전환, 데모 축소 |
| ≤640px | 여백·타이포 압축, 터치타깃 ≥36px, **코드블록 max-height:56vh + 세로 스크롤**, 긴 버튼 줄바꿈 허용 |
| ≤420px | 최소 셀 크기, 세로 스택 |

### 모바일 필수 처방 (이거 안 하면 반드시 깨짐)
```css
/* flex/grid 자식은 기본 min-width:auto 라 내용보다 못 줄어듦 */
.grid2 > *, .grid3 > *{min-width:0}
.card{min-width:0; max-width:100%}
/* 넓은 콘텐츠는 자기 컨테이너 안에서 스크롤 */
.tw, pre.code, .tree{overflow-x:auto; max-width:100%}
/* 터치 반응성 */
button{touch-action:manipulation}
```

---

## 9. UX 디테일 (완성도를 만드는 것들)

- **스크롤 진행바**: 최상단 3px, `scaleX`로 채움, blue→cyan→violet 그라데이션 + cyan 글로우
- **스크롤 스파이**: 현재 섹션의 사이드바 링크에 `.on` (배경 rgba(59,130,246,.14) + 좌측 2px cyan 보더)
- **코드 복사 버튼**: 각 pre 우상단, hover 시 표시(터치 기기는 상시 70%), 성공 시 "복사됨 ✓" 초록 1.4초
- **키보드 단축키**: 숫자키로 탭 전환
- **환영 배너**: 첫 방문 1회, localStorage로 기억
- **"👆 직접 조작" 배지**: 인터랙티브 영역 제목 우측, cyan 펄스 링
- **가로 스크롤 힌트**: 실제로 넘치는 표에만 "← 옆으로 밀어보세요" 배지, 첫 스크롤에 제거
- **맨 위로 버튼**: 1.5화면 스크롤 후 등장 (모바일)
- **앵커 오프셋**: `html{scroll-padding-top:calc(var(--tabh) + 22px)}` — 고정 헤더 높이를 JS로 측정해 CSS 변수로

---

## 10. 최소 스타터 (이것만으로 뼈대 완성)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root{ /* 2장의 토큰 블록 전체 복사 */ }
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--sans);background:var(--bg);color:var(--ink);
  line-height:1.75;-webkit-font-smoothing:antialiased;overflow-x:hidden}
body::before{ /* 3장 오로라 */ }
body::after { /* 3장 격자 */ }
a{color:var(--blue-l);text-decoration:none}
code{font-family:var(--mono)}
::selection{background:rgba(59,130,246,.4);color:#fff}
/* + 5장에서 필요한 컴포넌트만 골라 복사 */
@media (prefers-reduced-motion:reduce){
  *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
</style>
</head>
<body>
  <!-- 내용 -->
</body>
</html>
```

---

## 11. 하지 말 것 (테마가 깨지는 지점)

- ❌ 순수한 검정(#000)·흰색(#fff) 대면적 사용 — 항상 남색 틴트가 섞여야 함
- ❌ 채도 높은 원색 추가 (기존 8개 액센트 밖의 색)
- ❌ 그림자 대신 밝은 배경으로 띄우기 — 이 테마는 "어두움 + 글로우"가 문법
- ❌ 직각 모서리 — 최소 8px, 카드류는 14~22px
- ❌ 시스템 기본 파랑 링크/버튼 노출
- ❌ backdrop-filter, box-shadow 애니메이션, width 애니메이션
- ❌ 이모지 아이콘 중 Emoji 13.0+(2020) 신규 문자 — Windows 10에서 □로 보임 (예: 🪟 ❌ → 💻 ✅)
