# Portfolio Web · 김현우 백엔드 개발자

이력서 · 경력기술서 · 포트폴리오를 블로그 형식으로 담은 SPA. GitHub Pages로 배포됩니다.

- **Live**: https://black-astro.github.io/black-astro/
- **Stack**: Vue 3 · TypeScript · Vite · Vue Router (hash mode)
- **Theme**: 라이트/다크 토글 (시스템 설정 감지 + localStorage 유지)

## 구성 (탭)

| 탭 | 내용 |
|----|------|
| Home | 히어로 · 핵심 성과(숫자) · 핵심 역량 요약 |
| About | 소개 · 인적사항 · 핵심 역량 · 보유 기술 |
| Career | 경력 타임라인 · 프로젝트 상세(확장형) · 인프라 |
| Portfolio | 증명하는 5가지 · 케이스 스터디(코드/SQL) · 역량 매핑 |
| OSS | easy-quartz · smart-msg · code T |
| Growth | 학습 프로젝트 3종 · 성장 로드맵 |

콘텐츠는 `src/data/*.ts`에 데이터로 분리되어 있어 텍스트만 수정하면 됩니다.

## 학습 가이드 (정적 페이지 9종)

포트폴리오와 함께 배포되는 단일 HTML 학습 가이드입니다.
소스는 `guide-src/`에 조각으로 두고, 빌드하면 `public/*-web/index.html`로 합쳐집니다.
→ 자세한 내용: [`guide-src/README.md`](guide-src/README.md)

| 가이드 | 주소 | 소스 |
|---|---|---|
| 🐍 Python | `/python-web/` | `guide-src/python/` |
| ☕ Java | `/java-web/` | `guide-src/java/` |
| 🟨 JS · TS | `/js-ts-web/` | `guide-src/js-ts/` |
| 🟣 C# · Unity | `/csharp-web/` | `guide-src/csharp/` |
| 🔵 C++ | `/cpp-web/` | `guide-src/cpp/` |
| 🦀 Rust | `/rust-web/` | `guide-src/rust/` |
| 🗄️ Database | `/db-web/` | `guide-src/db/` |
| 🌐 Web Server | `/server-web/` | `guide-src/server/` |
| 🎓 CS 기술 | `/cs-web/` | `guide-src/cs/` |

## 폴더 구조

```
black-astro/                저장소 루트 (GitHub 프로필 저장소 겸용)
├─ README.md                프로필 페이지 (github.com/black-astro 에 표시)
├─ assets/badges/           프로필 README 전용 SVG 배지
├─ profile-3d-contrib/      3D 잔디 그래프 (워크플로가 자동 생성 — 직접 수정 X)
├─ docs/                    디자인 시스템 명세 등 문서
├─ .github/workflows/       배포 · 잔디 그래프 · 스네이크 자동화
└─ web/                     ★ 실제 코드 — 포트폴리오 SPA + 학습 가이드
   ├─ src/                  Vue 3 SPA (views · components · data · style)
   ├─ guide-src/            학습 가이드 원본 조각 (편집은 여기서)
   ├─ public/               정적 파일 + 가이드 빌드 결과물 (*-web/ 은 직접 수정 X)
   └─ dist/                 사이트 빌드 산출물 (git 제외)
```

## 개발

```bash
npm install
npm run dev       # 개발 서버
npm run build     # 타입체크(vue-tsc) + 프로덕션 빌드 → dist/
npm run preview   # 빌드 결과 로컬 미리보기
```

## 배포

`web/**` 변경이 `main`에 push되면 `.github/workflows/deploy-portfolio.yml`이
자동으로 빌드하여 GitHub Pages(Actions 소스)로 배포합니다. `vite.config.ts`의
`base`는 프로젝트 페이지 경로(`/black-astro/`)에 맞춰져 있습니다.
