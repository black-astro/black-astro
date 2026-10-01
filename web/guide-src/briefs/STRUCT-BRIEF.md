# "📁 프로젝트 구조" 탭 — 집필 에이전트 공통 지침

저장소 `D:/gibis/workTool/astro/black-astro`, 명령은 `web/` 에서.
SP(스크래치패드) = **당신 세션의 스크래치패드 디렉터리** (시스템 프롬프트에 적힌 경로)

## 왜 이 탭인가 (사용자 요청)
"언어·프레임워크·서버·데스크톱 앱·웹에 따라 권장 구조가 다 다르니, 규모가 커지면 어떻게 구조를 관리하는지 **간단하게** 설명이 필요하다."
→ 각 가이드에 **10개 섹션의 짧고 실용적인 탭** 하나. 섹션당 HTML **6~10KB** (다른 탭보다 가볍게). 핵심은 **디렉터리 트리 + 왜 이렇게 나누나 + 언제 다음 단계로 넘어가나**.

## 0. 먼저 읽기
1. `web/guide-src/AUTHORING.md` 끝까지 + "먼저 읽을 것" (단, 분량 기준은 위의 6~10KB 가 우선)
2. `web/guide-src/DIAGRAM-MODELS.md` — 디렉터리 구조는 **tree 모델**, 의존 방향은 layer/의존 그래프, 규모별 진화는 timeline,
   선택은 decision, 비교는 matrix. 박스+직선만인 그림이 60% 를 넘지 않게. 본보기 `web/guide-src/shared/models/*.html`
3. `web/guide-src/CODE-AUDIT.md` — 끝내기 전에 자기 코드·설정 예제를 이 기준으로 검토
4. 대상 가이드의 비슷한 탭 하나를 300줄 정도 훑어 문체·컴포넌트를 맞추기 (과제에 지정)
5. 대상 가이드에 이미 있는 구조 관련 섹션(과제에 적힌 것)을 읽고 **겹치지 않게** — 겹치면 "◯◯ 탭 xx 섹션 참고" 한 줄로 넘김

## 1. 섹션 구성 원칙
- 섹션 id `ps01`~`ps10`, `<span class="no">STR 01</span>`
- 각 섹션: lead(왜) → **디렉터리 트리**(`pre.code[data-lang=text]` 로 트리를 그리고 줄 끝 주석으로 각 폴더의 책임) →
  핵심 규칙 3~5개(의존 방향 · 무엇을 어디에 두나 · 금지) → 작은 코드/설정 예 1~2개 → `.vs` 좋은 예/나쁜 예 또는 표 → `.ez.mid` 정리
- **규모별 진화**를 꼭: "파일 몇 개 → 패키지 분리 → 모듈/워크스페이스 분리"의 전환 신호(사람 수, 빌드 시간, 배포 단위)
- 공식/사실상 표준을 근거로(예: Maven 표준 레이아웃, Android 공식 아키텍처 가이드, Python Packaging 가이드의 src 레이아웃,
  Next.js App Router 규칙, Cargo 워크스페이스, .NET 의 Directory.Build.props). 근거 없는 "취향"은 취향이라고 밝힘.
- 마지막 섹션(ps10)은 **"규모·유형별 권장 구조 한 장 요약"** 표 + 구조 규칙을 도구로 강제하는 법(아키텍처 테스트·린트 규칙 등)
- 시각화 **최소 7개**

## 2. 산출물 — 다른 파일은 절대 수정 금지, 빌드 금지
- pane: `SP/struct/<가이드>-30-struct.html` — pane id `pane-struct`, 등록 시 `panes/30-struct.html` 로 옮김
- meta: `SP/<가이드>-struct.meta.json` — `"tab":"struct"`, `"pane":"panes/30-struct.html"`, label "📁 프로젝트 구조",
  short "프로젝트 구조", icon "📁", cls "pjs", grad ["#0891b2","#164e63"], 그리고 과제에 적힌 group/groupLabel/groupIcs/groupTitle/sheetLabel/after

## 3. 검증 (AUTHORING §5 를 SP 경로로) + 
```
node guide-src/tools/fixcut.mjs   <pane>
node guide-src/tools/svgcheck.mjs <pane>                 # OVER/BOX/LAP 0
node guide-src/tools/diagaudit.mjs <pane>                # 결함 0 목표 (파일 경로를 안 받으면 SP 안 임시 폴더로)
node guide-src/tools/diagaudit.mjs <pane> --summary      # 박스형 % ≤ 60
```
## 4. 보고 (짧게): 파일 2개 · 섹션 수 · 시각화 수/모델 · KB · 검사 결과 · 겹침을 피한 기존 섹션 · 남은 의심
