# C++ · Rust 가이드 작업 현황

> 이 파일은 작업 추적용 메모입니다. 빌드에 포함되지 않습니다(`parts/` 밖).

## 목표

**"C++·Rust로 앱을 만든다"가 아니라 "파이썬·Node에서 불러 쓸 모듈을 만든다"** 가 축.
모든 섹션은 **4층 구조**로 작성한다 — 왕기초부터 전문가까지 한 페이지에.

| 층 | h3 형태 | 배지 |
|---|---|---|
| 기초 | (섹션 본문 카드) | 🟢 (섹션 배지가 자동 주입) |
| 중급 | `이렇게도 쓸 수 있다 — …` | `<span class="lvl m">🟡 중급</span>` |
| 실무 | `실무에선 이렇게 — …` | `<span class="lvl h">🔴 실무</span>` |
| 전문가 | `한 단계 더 — …` | `<span class="lvl x">🧬 전문가</span>` |

`data-lv` 속성은 `i` / `a` / `x` 를 h3에 함께 붙인다.
**숨김 필터는 만들지 않는다** — 왕초보도 스크롤만 내리면 전문가 층이 보여야 한다.

## 완료

### 파이썬 가이드 (`guide-src/python/parts/panes/03-python.html`)
- **Python 기본 탭 16섹션 전부 4층 완료** (p01~p16)
- `css/05-responsive.css` 에 `.lvl.x`(보라 🧬) 추가 → 6개 가이드에 동기화 완료

### C++ 가이드 (`guide-src/cpp/`) — ✅ 88/88 섹션 완료
| 탭 | 키 | 섹션 | 상태 |
|---|---|---|---|
| 🔵 C++ 기초 | `lang` | x01~x12 | ✅ 12/12 |
| 🧱 현대 C++ | `mod` | m01~m12 | ✅ 12/12 |
| 🐍 파이썬 모듈 | `py` | y01~y12 | ✅ 12/12 |
| 🟨 Node 애드온 | `node` | j01~j10 | ✅ 10/10 |
| 🔗 C ABI · FFI | `ffi` | f01~f10 | ✅ 10/10 |
| 🛠️ 빌드 · 배포 | `build` | b01~b10 | ✅ 10/10 |
| ⚡ 성능 최적화 | `perf` | e01~e10 | ✅ 10/10 |
| 🔬 전문가 | `deep` | d01~d12 | ✅ 12/12 |

- **메타데이터는 88섹션 전부 선작성 완료** — `js/20-tab-switch.js` 의 `SEC_LV`/`EZ`/`CAP`,
  `js/00-core.js` 의 `SEC_KW`/`TAB_KW`. 새 섹션을 써도 메타는 손댈 필요 없다.
- `build.mjs`·`verify.mjs` 에 `cpp` 등록 완료.

### Rust 가이드 (`guide-src/rust/`)
- 폴더만 복제해 둔 상태. **아직 손대지 않음.**
- 계획 탭: `lang`(r01~r12) · `own`(o01~o12) · `py`(y01~y12, PyO3/maturin) ·
  `node`(j01~j10, napi-rs/WASM) · `ffi`(f01~f10) · `build`(b01~b10) ·
  `perf`(e01~e10) · `deep`(d01~d12)

## 섹션을 추가할 때 손대는 곳 (매번 동일)

1. `parts/panes/<탭>.html` — 섹션 본문 (4층)
2. `parts/11-sidebar.html` — 해당 `navset` 에 `<a href="#id">` 추가 ★ 빠뜨리면 verify 실패
3. 탭을 새로 여는 경우에만: `parts.json` · `parts/12-tabbar.html`(버튼 2곳·단축키) ·
   `js/20-tab-switch.js` 의 `TAB_ORDER`
4. `npm run verify:guide` 로 확인

- 라우터 `guides` 배열에 C++ 등록 완료 · 기존 6개 가이드에 상호 링크 추가 완료
- 최종: 88섹션 · 8탭 · 1236KB

## 남은 일

1. **Rust 가이드 88섹션 전체** + 뼈대 구성
2. Rust 완성 후 — 라우터 등록 · 7개 가이드에 Rust 상호 링크 추가
   (C++ 가이드에는 이미 `../rust-web/` 링크가 있어 그때 살아납니다)
