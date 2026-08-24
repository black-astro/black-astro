# guide-src/tools — 브라우저 없이 돌리는 검사 세 가지

`npm run verify:guide` 는 **섹션·탭·SEC_LV/EZ/CAP 정합성만** 봅니다.
아래 세 개가 그 바깥을 막습니다. 전부 `web/` 에서 실행합니다.

```bash
# ① SVG 넘침·겹침 정적 검사 (브라우저 실측 대용)
node guide-src/tools/svgcheck.mjs guide-src/<가이드>/parts/panes
node guide-src/tools/svgcheck.mjs guide-src/kotlin/parts/panes/03-co.html co07,co14

# ② 탭 정합성 스모크 — 탭 버튼 ↔ pane ↔ navset ↔ TAB_LABEL ↔ TAB_ORDER
node guide-src/tools/smoke.mjs public/<가이드>-web/index.html

# ③ 소스 무결성 — 제어문자(NUL) · 코드블록 미이스케이프 태그
node guide-src/tools/integrity.mjs kotlin cpp rust      # 인자 없으면 전체
```

## svgcheck 가 잡는 것

| 코드 | 뜻 |
|---|---|
| `OVER` | 글자가 viewBox(680) 밖으로 나감 |
| `BOX` | 글자가 소속 박스의 오른쪽 밖으로 나감 |
| `LAP` | 같은 줄(baseline 차 ≤3)에서 글자끼리 가로로 겹침 |
| `CUT` | 마지막 baseline 보다 viewBox 높이가 작아 잘림 |

글자 폭은 **한글/CJK = font-size × 0.95 · 그 밖 = × 0.60** 으로 추정합니다.
이 계수는 **브라우저 실측을 통과한 기존 다이어그램들을 기준선으로 역산**한 값입니다
(db·server·java 가 0건이 되는 지점). 실측이 아니라 근사이므로 **±5px 안쪽 차이는 못 잡습니다** —
Chrome MCP 를 쓸 수 있는 세션에서는 `HANDOFF.md` 의 실측 스크립트를 여전히 우선하세요.

넘침은 **x 를 옮기지 말고 문구를 줄여서** 해결합니다(옮기면 LAP 이 생깁니다).
