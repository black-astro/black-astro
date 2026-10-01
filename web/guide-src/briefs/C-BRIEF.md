# C · 임베디드 가이드 — 집필 에이전트 공통 지침

저장소 `D:/gibis/workTool/astro/black-astro`, 명령은 `web/` 에서.
스크래치패드(SP) = **당신 세션의 스크래치패드 디렉터리** (시스템 프롬프트에 적힌 경로)

## 0. 먼저 읽기 (순서대로)
1. `web/guide-src/AUTHORING.md` 끝까지 + 거기 적힌 "먼저 읽을 것" 전부
2. `web/guide-src/DIAGRAM-MODELS.md` — 시각화 모델 30종. **박스+직선만 쓴 그림이 탭의 60%를 넘으면 안 됩니다.**
   timeline · seq · state · memory(메모리 레이아웃) · bar · matrix · tree · decision · waveform(파형은 path 로) 등을 섞으세요.
   본보기 소스: `web/guide-src/shared/models/*.html`
3. `web/guide-src/CODE-AUDIT.md` — 끝내기 전에 이 기준으로 **자기 코드를 스스로 검토**하세요.
4. 문체 본보기: `web/guide-src/cpp/parts/panes/09-clang.html` 처음 400줄.
   이 pane(c01~c26)은 새 C 가이드의 "🅲 C 기초"(c01~c13) · "⚙️ C 실전 · 시스템"(c14~c26) 탭으로 그대로 들어갑니다.
   그 탭과 **내용이 겹치지 않게** 하세요(겹치는 개념은 "C 기초 탭 c05 참고"처럼 한 줄로 넘기고 바로 본론).

## 1. 새 가이드 "C · 임베디드" (가이드 id `c`) — 탭 지도 (접두사는 가이드 안에서 유일)
| 그룹 | 탭 id | 접두사 | 라벨 | 담당 |
|---|---|---|---|---|
| 0 언어 · C | setup | u | 🧰 설치 · 툴체인 | 새로 |
| 0 | base | c01~c13 | 🅲 C 기초 | 기존 |
| 0 | sys | c14~c26 | ⚙️ C 실전 · 시스템 | 기존 |
| 1 하드웨어 · MCU | hw | h | 🔩 하드웨어 기초 | 새로 |
| 1 | avr | a | 🔷 AVR · ATmega | 새로 |
| 1 | stm32 | m | 🟦 STM32 · Cortex-M | 새로 |
| 1 | io | p | 📡 통신 · 드라이버 | 새로 |
| 2 RTOS · 구조 · 품질 | rtos | r | ⏱️ FreeRTOS | 새로 |
| 2 | arch | k | 🏗️ 대규모 C 구조 | 새로 |
| 2 | qa | t | 🐞 디버깅 · 테스트 | 새로 |
| 3 실전 · 양산 | prod | o | 🚀 양산 · 펌웨어 운영 | 새로 |

다른 탭에서 깊게 다룰 주제는 그 탭으로 넘기세요(예: hw 탭의 UART 는 개념만, 깊이는 io 탭).

## 2. 독자
자바·파이썬 백엔드 개발자처럼 **프로그래밍은 하지만 하드웨어는 0** 인 사람. 전기·회로 용어는 처음 나올 때 한 줄로 풀어 주고,
"서버 개발에 빗대면" 같은 비유를 적극적으로. 하지만 내용은 현업 펌웨어 엔지니어가 봐도 정확해야 합니다.

## 3. 정확성 (가장 중요)
- 레지스터 이름·비트·HAL 함수 시그니처는 **실제 칩 기준**으로. 칩을 명시: AVR 은 **ATmega328P @16MHz (Arduino Uno R3)**,
  STM32 는 **STM32F446RE (Nucleo-F446RE)** 를 기본으로, 다른 시리즈 차이는 note 로.
- 계산 값(보레이트 UBRR · 타이머 프리스케일러 · 저항값 · 배터리 수명)은 **반드시 직접 계산해서** 맞춰 쓰고 식을 보여 주세요.
- 버전은 2026 기준이되 확신 없으면 "최신 안정"으로 두루뭉술하게. (FreeRTOS Kernel V11.x, Arm GNU Toolchain 14.x 정도는 써도 됨)
- 실제로 없는 API 금지. 일부러 틀린 예는 `.vs > .bad` 로 표시.
- 이 PC 에는 **C 컴파일러가 없습니다**(설치 금지). 순수 로직(링 버퍼, CRC, 파서, 상태 머신, 보레이트·프리스케일러 계산)은
  같은 알고리즘을 SP 에 node/python 파일로 옮겨 **값을 실제로 계산해 확인**하고, 나머지는 손으로 정밀 추적하세요.
  정수 폭(uint8_t 넘침·부호)·정수 나눗셈·volatile·ISR 공유 변수의 원자성은 특히 꼼꼼히.

## 4. 산출물 — 다른 파일은 절대 수정 금지 (빌드도 하지 말 것)
- pane: `SP/c/<pane 파일명>` (예: `SP/c/03-hw.html`) — 폴더가 없으면 만드세요
- meta: `SP/c-<tab>.meta.json` — `"guide":"c"`, `"pane":"panes/<pane 파일명>"` (등록 시 통합 담당이 옮김)
- 13 섹션, 섹션당 9~15KB, 시각화 **최소 10개**(무엇을 그렸는지 보고)
- `<span class="no">` 라벨은 과제의 라벨 + 두 자리 번호

## 5. 검증 (경로만 SP 로 바꿔 AUTHORING §5 그대로) + 아래 두 개
```
node guide-src/tools/fixcut.mjs   <SP>/c/<pane>
node guide-src/tools/svgcheck.mjs <SP>/c/<pane>        # OVER/BOX/LAP 0
node guide-src/tools/diagaudit.mjs <SP>/c/<pane>       # TIP/PK/CTR/ROW/GAP 0 목표
node guide-src/tools/diagaudit.mjs <SP>/c/<pane> --summary   # 박스형 % ≤ 60
```
(도구가 파일 경로를 안 받으면 SP 안에 임시 폴더를 만들어 그 폴더를 넘기세요.)

## 6. 보고 (짧게)
파일 2개 경로 · 섹션 수 · 시각화 수와 모델 종류 · KB · svgcheck/diagaudit 결과 · 박스형 % · 실제 컴파일해 본 코드 목록 · 남은 의심 항목
