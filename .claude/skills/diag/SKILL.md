---
name: diag
description: 학습 가이드(.diag 인라인 SVG)의 시각화 모델을 만들거나 고칠 때 쓴다. 새 다이어그램 추가, 화살촉·색·글자 규칙, 넘침·겹침 실측 검사가 필요하면 사용. "시각화", "다이어그램", "diag" 요청 시 호출.
---

# Diag — 학습 가이드 시각화 모델 제작

아홉 가이드(`web/guide-src/*/parts/panes/*.html`)의 `.diag` 인라인 SVG 시각화를
만들고 검증하는 스킬이다. **이 절차를 벗어난 임의 스타일링은 금지.**

## 0. 먼저 읽을 것 (순서대로)

1. `web/guide-src/DIAGRAM-STYLE.md` — 디자인 기준 원문 (박스·색·화살촉·글자·viewBox)
2. `web/guide-src/DIAGRAM-MODELS.md` — **모델 30종 카탈로그**. 무엇을 그릴지는 여기서 고른다.
   본보기 `web/guide-src/shared/models/*.html` · 갤러리 `npm run diag:lab` → `public/diag-lab/index.html`
3. `web/guide-src/shared/css/06-diag.css` — 공통 테마 실제 값. **스타일 수정은 이 파일에만.**
   (각 가이드 `css/06-*.css`의 .diag 블록은 과거 사본 — 공통 파일이 뒤에 로드되어 이김)
4. 잘 된 예시: `web/guide-src/server/parts/panes/13-kafka.html` k02(구조) ·
   `db/parts/panes/08-tune.html` t07(읽는 순서) · `cs` 알고리즘 탭(단계별 상태)

## 1. 마크업 골격

```html
<div class="diag rv">
  <svg viewBox="0 0 680 <높이>" role="img" aria-label="<그림 없이 읽어도 이해되는 완전한 설명문>">
    <text x="16" y="18" class="lbl">그림 제목 한 줄</text>
    <rect class="bx" x=".." y=".." width=".." height=".."/>
    <text x=".." y=".." font-size="11" text-anchor="middle">노드 이름</text>
    <path class="fl ar" d="M.. .. L.. .."/>
  </svg>
  <div class="cap">한 줄 요약 — <b>핵심</b>은 굵게.</div>
</div>
```

- viewBox 폭 **680 고정**. 높이 = 마지막 텍스트 baseline **+ 8 이상**.
- `aria-label`은 필수 — 그림이 전하는 내용 전체를 문장으로.
- 카드에 `rv`(+ 필요시 `d1`/`d2` 지연) — 스크롤 리빌 애니메이션.

## 2. 색 클래스 — 의미 고정 (바꾸지 말 것)

| 클래스 | 뜻 |
|---|---|
| `.bx` | 기본 (아직 아무 일 없음) |
| `.bx-ok` | 확정 · 정답 · 채택 (초록) |
| `.bx-warn` | 버림 · 틀림 · 장애 (붉은 점선) |
| `.bx-fw` | **지금 보고 있는 대상** (붉은 채움) |
| `.bx-hi` | 강조 — 드물게 (호박) |
| `.bx-mut` | 처리 끝 · 비활성 (흐림) |

글자: `.lbl`(기본 라벨 10.5) · `.ttl`(묶음 제목) · `.val`(노드 값 11.5) ·
`.ann`(곁주석 9px) · 색 텍스트 `.ok-t` `.rs-t` `.am-t` `.cy-t` · 단계 배지 `.stp`+`.stpn`.
**font-size 9 미만 금지.** 클래스가 font-size를 이기므로 `.lbl`에 font-size 속성을 얹지 말 것.

## 3. 선과 화살촉

- 흐름(방향 있음): `class="fl ar"` — 청록 점선 + 화살촉. 색 변형 `ar-gn`/`ar-rs`/`ar-am`(+`style="stroke:#색"`), 양방향 `ar2`.
- 구조선(방향 없음): `class="ln"` — 구분선·트리 간선·괄호에는 화살촉 붙이지 않음.
- **선 끝은 도형 경계 4px 바깥에서 끊는다** — 중심까지 그으면 화살촉이 노드 밑에 깔림.
  좌표 계산: 박스 오른끝 x=W면 화살표는 `M W+4 y L (다음 박스 x−4) y`.
- 흐름 점: `<circle class="pk" r="3.5"><animateMotion dur="2.4s" repeatCount="indefinite" path="..."/></circle>`
  — 끝점 순간이동 페이드는 `shared/js/06-diag-motion.js`가 자동 처리하므로 신경 쓸 것 없음.

## 4. 글자 폭 한계 (viewBox 680 기준)

- 한글 `.lbl`: x=16 시작 → 약 60자 · x=366 시작 → 약 28자. ASCII는 한글의 약 0.6배 폭.
- 가운데 정렬 텍스트는 `글자수 × 폰트px`가 박스 폭 안인지 계산할 것.
- **감으로 쓰면 15~20% 넘친다** — 반드시 6단계 실측을 돌린다.

## 5. 마커 defs

화살촉 마커(`#ar-cy` 등)는 각 가이드 `parts/10-body-open.html`의 숨은
`<svg><defs>`에 이미 있다(아홉 가이드 전부). 새 가이드를 만들 때만 복사해 넣는다.

## 6. 검증 (필수 — 생략 금지)

```bash
cd web && npm run build:guide -- <가이드>   # 빌드
```

로컬 서버(8899, 살아 있을 때가 많음: `cd web/public && node -e "...HANDOFF.md의 서버 한 줄"`)
→ Chrome 에서 `http://localhost:8899/<가이드>-web/index.html` 열고 실측:

```js
// content-visibility를 먼저 풀지 않으면 getBBox()가 0을 돌려 검사가 조용히 건너뛴다!
document.querySelectorAll('.pane, .sec').forEach(e=>e.style.contentVisibility='visible');
// 그 다음 HANDOFF.md의 OVER/LAP 실측 스크립트 실행 → 둘 다 none이 될 때까지 문구 축약
```

넘침(OVER)은 **문구를 줄여서** 해결한다 — x를 옮기면 겹침(LAP)이 생긴다.
마지막으로 `npm run verify:guide` 통과 확인 후 커밋.

## 7. 무엇을 그리나 (판단 기준)

- **데이터 이동 · 구조 · 상태 변화**를 글 열 줄 대신 한 장으로 — 장식 금지.
- **모델은 `DIAGRAM-MODELS.md` 의 30종에서 고른다.** 직접 새 레이아웃을 짜지 말고
  `shared/models/*.html` 의 본보기를 복사해 라벨과 좌표만 바꾼다 (가장 빠르고 검사도 통과한다).

| 전할 말이 | 고를 모델 |
|---|---|
| 무엇이 무엇과 이어져 있나 | `flow` `layer` `pipe` `swim` `seq` `state` `tree` `graph` |
| 두 축으로 어디에 놓이나 | `matrix` `quad` `venn` `hub` `orbit` |
| 언제 · 얼마나 걸리나 | `timeline` `gantt` `waterfall` `cycle` |
| 얼마나 되나 (숫자) | `bar` `line` `stack` `sankey` `funnel` `scatter` `gauge` `spark` |
| 이것을 뜯어 보면 | `memory` `pyramid` `decision` `compare` `anatomy` |

- 고르는 순서: ① 전할 **한 문장**을 먼저 적는다 → ② 위 표에서 줄을 고른다 → ③ 모델을 고른다
  → ④ 다 그린 뒤 ①의 문장이 `.cap` 에 그대로 들어가는지 본다. 안 들어가면 모델이 틀린 것.
- **한 탭에서 같은 모델을 3번 넘게 쓰지 않는다.** 기존 1,340개 중 96%가 "박스+직선"이었다.
- 계열 색 `.s1~.s4`(청록→호박→보라→초록, 순서 고정)는 **구분**용이고
  `.bx-ok`/`.bx-warn` 같은 **의미** 색과 섞지 않는다. 색만으로 구분하게 두지 말고 라벨·범례를 함께 둔다.

검사: `npm run check:lab` (모델 30종) · `svgcheck.mjs` (pane) · 브라우저 실측(§6).
