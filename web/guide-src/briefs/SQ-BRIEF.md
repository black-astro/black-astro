# "🥞 스택 · 큐 · 덱" 탭 — 집필 에이전트 공통 지침

저장소 `D:/gibis/workTool/astro/black-astro`, 명령은 `web/` 에서.
SP(스크래치패드) = **당신 세션의 스크래치패드 디렉터리** (시스템 프롬프트에 적힌 경로)

## 왜 이 탭인가 (사용자가 "가장 중요하다"고 한 요청)
"큐·스택이 모든 가이드에서 빠져 있다. 언어별로 **최신 버전에서는 큐·스택을 어떤 타입으로, 어떻게 쓰고 다루는지** 자세하게 필요하다.
자바로 치면 `Stack` 은 거의 사장되고 다 `Deque`(ArrayDeque)로 쓰지 않나."
→ 이 언어에서 **2026 년 현업이 실제로 쓰는 타입과 관용구**, 그리고 **왜 옛 방식이 버려졌는지**를 정면으로. 교과서식 자료구조 이론(CS 가이드 s03·s09 에 있음)이 아니라 **그 언어의 API·내부 구현·성능·함정·실무 패턴**이 중심입니다.

## 0. 먼저 읽기
1. `web/guide-src/AUTHORING.md` 끝까지 + "먼저 읽을 것"
2. `web/guide-src/DIAGRAM-MODELS.md` — 이 탭은 **memory 모델(원형 버퍼의 head/tail, 배열 재할당, 힙 배열↔트리)**, 단계별 상태 변화(push/pop 스냅숏),
   matrix(타입 비교), bar(벤치마크), seq(생산자-소비자), decision(무엇을 쓸까)이 잘 맞습니다. 박스+직선만인 그림 ≤ 60%. 본보기 `web/guide-src/shared/models/*.html`
3. `web/guide-src/CODE-AUDIT.md` — 끝내기 전에 이 기준으로 자기 코드를 검토
4. 대상 가이드의 기초 탭 하나를 300줄 훑어 문체를 맞추고, 과제에 적힌 **기존 관련 섹션을 읽어 겹치지 않게**(겹치면 한 줄 참조로 넘김)

## 1. 섹션 (12개, id `sq01`~`sq12`, 라벨 `<span class="no">SQ 01</span>`) — 언어에 맞게 제목·세부를 조정하되 이 뼈대를 지킬 것
1. sq01 ★ **한 장 지도** — 이 언어에서 스택/큐/덱/우선순위 큐/동시성 큐/비동기 채널을 **무엇으로 쓰나**: 2026 권장 vs 레거시(쓰지 말 것) 표 + decision 그림
2. sq02 ★ **스택** — 권장 타입과 API(push/pop/peek 대응), 레거시 타입이 버려진 이유(예: 자바 `Stack extends Vector` — 동기화 비용·중간 삽입 가능·**순회 순서가 반대**), 빈 스택 처리(예외 vs null/Optional)
3. sq03 ★ **큐(FIFO)** — 권장 타입, "실패하면 예외" vs "특수값 반환" API 쌍, 큐로 쓰면 안 되는 것(예: JS `Array.shift`, 파이썬 `list.pop(0)` 의 O(n))
4. sq04 ★ **덱 — 내부 구조** — 원형 배열(head/tail 인덱스, 2의 거듭제곱 용량, 늘어날 때 복사) 또는 그 언어의 실제 구현(C++ `std::deque` 의 청크 맵 등)을 memory 그림으로. 연산별 시간 복잡도 표
5. sq05 **우선순위 큐(힙)** — 최소/최대 힙 방향, 커스텀 비교(다중 키), 같은 우선순위의 순서 비보장, 요소 변경 시 재정렬 안 됨, top-k / 다익스트라에서 쓰는 법
6. sq06 ★ **스레드 안전 큐** — 블로킹/논블로킹, 유한(bounded) 큐와 배압, 생산자-소비자 완전한 예제, 종료(poison pill 등) 처리
7. sq07 **비동기 · 채널** — 그 언어의 async 세계의 큐(코루틴 Channel · asyncio.Queue · System.Threading.Channels · tokio mpsc 등). 없으면 이벤트 루프/작업 큐 관점으로
8. sq08 ★ **알고리즘 패턴** — 괄호 검사, 단조 스택(다음 큰 수), BFS, 슬라이딩 윈도우 최댓값(단조 덱), 0-1 BFS, undo/redo — 각각 그 언어의 관용 코드로
9. sq09 **성능과 메모리** — 박싱/요소 크기, 재할당, 캐시 지역성, 연결 리스트가 대개 지는 이유. 수치는 근거 있는 대표값 또는 "예시"라고 명시(bar 그림)
10. sq10 ★ **흔한 실수 모음** — null/None 넣기, 순회 중 수정, 잘못된 타입 선택, 레거시 API, 경계 조건 — `.vs` bad/good 으로
11. sq11 **다른 언어와 비교** — 같은 일을 자바·파이썬·JS·C#·C++·Rust 등에서 무엇으로 하나(표 한 장. 이 가이드 언어 열을 강조)
12. sq12 ★ **실무 사례** — 작업 큐 · 최근 N개 보관(bounded deque) · 레이트 리미터 슬라이딩 윈도우 · 이벤트 버퍼 · 재시도 큐 · 스케줄러 — 각 사례에 맞는 타입과 코드

분량: 섹션당 9~14KB, 시각화 **최소 10개**. 코드는 그대로 돌아가는 완전한 예제(가능하면 main 포함)와 **출력 주석**.

## 2. 정확성
- **최신 버전 기준** API 를 쓰되 버전 배지로 표시(예: Java 21 `SequencedCollection` 의 `addFirst/getLast/reversed`, .NET 6 `PriorityQueue<TElement,TPriority>`,
  Kotlin `ArrayDeque`, Python 3.13, Node 24, C++23, Rust 1.8x). 확신 없는 버전은 두루뭉술하게.
- 실행 가능한 언어(python, node)는 SP 에 파일로 써서 **실제로 돌려** 출력 주석을 맞추세요. 다른 언어는 손으로 정밀 추적. 패키지 설치 금지.
- 시간 복잡도·내부 구현 주장은 공식 문서/소스 근거가 있는 것만. "분할 상환 O(1)" 처럼 정확한 용어로.

## 3. 산출물 — 다른 파일은 절대 수정 금지, 빌드 금지
- pane: `SP/sq/<가이드>-31-sq.html` — pane id `pane-sq`, 등록 시 `panes/31-sq.html` 로 옮김
- meta: `SP/<가이드>-sq.meta.json` — `"tab":"sq"`, `"pane":"panes/31-sq.html"`, label "🥞 스택 · 큐 · 덱", short "스택 · 큐",
  icon "🥞", cls "sqk", grad ["#d946ef","#701a75"], 그리고 과제의 group/groupLabel/groupIcs/groupTitle/sheetLabel/after

## 4. 검증 (AUTHORING §5 를 SP 경로로) +
```
node guide-src/tools/fixcut.mjs   <pane>
node guide-src/tools/svgcheck.mjs <pane>                 # OVER/BOX/LAP 0
node guide-src/tools/diagaudit.mjs <pane>                # 결함 0 목표 (파일 경로를 안 받으면 SP 안 임시 폴더로)
node guide-src/tools/diagaudit.mjs <pane> --summary      # 박스형 % ≤ 60
```
## 5. 보고 (짧게): 파일 2개 · 섹션 수 · 시각화 수/모델 · KB · 검사 결과 · 실제로 실행해 확인한 코드 · 남은 의심
