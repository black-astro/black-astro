#!/usr/bin/env node
/**
 * 시각화 모델 갤러리 빌더
 *
 * guide-src/shared/models/*.html 의 스니펫을 모아
 * public/diag-lab/index.html (모델 카탈로그 페이지)을 만든다.
 *
 * 스니펫은 @model 주석 세 줄로 시작한다:
 *   <!-- @model <id> | <이름> | <한 줄 설명> -->
 *   <!-- @when  언제 쓰나 -->
 *   <!-- @avoid 언제 쓰면 안 되나 -->
 *   <div class="diag rv"> …SVG… </div>
 *
 *   node guide-src/tools/lab.mjs          갤러리 빌드
 *   node guide-src/tools/lab.mjs --check  넘침·겹침 검사만 (svgcheck 재사용)
 *   node guide-src/tools/lab.mjs --list   모델 목록만 출력
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkFile } from './svgcheck.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(HERE, '..', 'shared', 'models')
const CSSDIR = path.join(HERE, '..', 'shared', 'css')
const OUT = path.join(HERE, '..', '..', 'public', 'diag-lab')
const DEFS_FROM = path.join(HERE, '..', 'csharp', 'parts', '10-body-open.html')

/** models/*.html 을 @model 단위로 자른다 */
export function readModels() {
  const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.html')).sort()
  const models = []
  for (const f of files) {
    const src = fs.readFileSync(path.join(SRC, f), 'utf8')
    const re = /<!--\s*@model\s+(\S+)\s*\|\s*([^|]+?)\s*\|\s*([^>]+?)\s*-->\s*<!--\s*@when\s+([\s\S]*?)-->\s*<!--\s*@avoid\s+([\s\S]*?)-->\s*([\s\S]*?)(?=<!--\s*@model|\s*$)/g
    for (const m of src.matchAll(re)) {
      models.push({
        file: f,
        group: f.replace(/^\d+-|\.html$/g, ''),
        id: m[1],
        name: m[2].trim(),
        desc: m[3].trim(),
        when: m[4].trim(),
        avoid: m[5].trim(),
        html: m[6].trim(),
      })
    }
  }
  return models
}

const GROUP_LABEL = {
  structure: '구조 — 무엇이 무엇과 이어져 있는가',
  relation: '관계 · 배치 — 둘 이상의 축으로 자리를 정한다',
  time: '시간 — 언제 · 얼마나 걸리는가',
  quantity: '수량 — 숫자를 그림으로',
  concept: '개념 — 하나를 뜯어 설명한다',
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function build() {
  const models = readModels()
  const css = ['01-tokens-base-layout.css', '02-typography-components.css', '03-demo-stage.css',
    '04-panels-beginner.css', '05-responsive.css', '06-diag.css']
    .map((f) => fs.readFileSync(path.join(CSSDIR, f), 'utf8')).join('\n')

  const bodyOpen = fs.readFileSync(DEFS_FROM, 'utf8')
  const defs = bodyOpen.slice(bodyOpen.indexOf('<svg width="0"'), bodyOpen.indexOf('</svg>') + 6)

  const groups = [...new Set(models.map((m) => m.group))]
  const toc = groups.map((g) => {
    const items = models.filter((m) => m.group === g)
      .map((m) => `<a href="#m-${m.id}">${m.name}</a>`).join('')
    return `<div class="toc-g"><h4>${GROUP_LABEL[g] ?? g}</h4><div class="toc-l">${items}</div></div>`
  }).join('\n')

  const cards = groups.map((g) => {
    const items = models.filter((m) => m.group === g).map((m) => `
<article class="mdl" id="m-${m.id}">
  <header>
    <span class="mid">${m.id}</span>
    <h3>${m.name}</h3>
    <p class="mdesc">${m.desc}</p>
  </header>
  <div class="mrule">
    <div class="mwhen"><b>이럴 때</b> ${m.when}</div>
    <div class="mavoid"><b>피할 때</b> ${m.avoid}</div>
  </div>
  ${m.html}
  <details class="msrc">
    <summary>소스 보기 · 복사해서 pane 에 붙이세요</summary>
    <pre><code>${esc(m.html)}</code></pre>
  </details>
</article>`).join('\n')
    return `<section class="grp"><h2>${GROUP_LABEL[g] ?? g}</h2>${items}</section>`
  }).join('\n')

  const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>시각화 모델 카탈로그 — ${models.length}종</title>
<meta name="description" content="학습 가이드 .diag 인라인 SVG 시각화 모델 ${models.length}종. 언제 쓰고 언제 피하는지, 복붙할 수 있는 소스와 함께.">
<style>
${css}

/* ---------- 갤러리 전용 ---------- */
.rv{opacity:1;transform:none}
body{padding:0}
.lab-wrap{max-width:1120px;margin:0 auto;padding:40px 22px 100px}
.lab-hero{padding:34px 0 22px;border-bottom:1px solid var(--line)}
.lab-hero h1{font-size:34px;letter-spacing:-.03em;margin-bottom:12px}
.lab-hero p{color:var(--dim);max-width:760px;font-size:15px}
.lab-hero .cnt{display:inline-block;margin-top:16px;font-family:var(--mono);font-size:12px;
  color:var(--cyan);border:1px solid rgba(34,211,238,.3);border-radius:99px;padding:4px 14px}
.toc{margin:26px 0 10px;display:grid;gap:14px}
.toc-g h4{font-size:12px;color:var(--dim-2);font-family:var(--mono);margin-bottom:7px;font-weight:500}
.toc-l{display:flex;flex-wrap:wrap;gap:7px}
.toc-l a{font-size:12.5px;color:var(--ink-2);border:1px solid var(--line);
  border-radius:8px;padding:4px 11px;background:var(--panel);transition:.18s var(--ease)}
.toc-l a:hover{border-color:var(--cyan);color:var(--cyan)}
.grp{margin-top:56px}
.grp>h2{font-size:20px;color:var(--ink);padding-bottom:10px;margin-bottom:8px;
  border-bottom:1px solid var(--line)}
.mdl{margin:34px 0 0;padding:22px 0 0;scroll-margin-top:20px}
.mdl+.mdl{border-top:1px solid var(--line-soft);margin-top:44px}
.mdl header{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.mid{font-family:var(--mono);font-size:11px;color:var(--cyan);
  border:1px solid rgba(34,211,238,.3);border-radius:6px;padding:2px 8px}
.mdl h3{font-size:18px}
.mdesc{width:100%;color:var(--dim);font-size:14px;margin-top:4px}
.mrule{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0 2px}
.mwhen,.mavoid{font-size:12.6px;line-height:1.65;color:var(--dim);
  border:1px solid var(--line);border-radius:10px;padding:9px 12px;background:rgba(15,26,46,.4)}
.mwhen b{color:#34d399;font-size:11px;font-family:var(--mono);margin-right:6px}
.mavoid b{color:#fb7185;font-size:11px;font-family:var(--mono);margin-right:6px}
.msrc{margin-top:2px;border:1px solid var(--line);border-radius:10px;background:rgba(6,11,22,.5)}
.msrc summary{cursor:pointer;padding:9px 14px;font-size:12.4px;color:var(--dim);
  font-family:var(--mono);user-select:none}
.msrc summary:hover{color:var(--cyan)}
.msrc pre{margin:0;padding:0 14px 14px;overflow-x:auto;font-size:11.6px;line-height:1.7;
  color:var(--ink-2);font-family:var(--mono)}
.lab-note{margin-top:56px;padding:18px 20px;border:1px solid var(--line);
  border-radius:var(--r-m);background:rgba(15,26,46,.45);color:var(--dim);font-size:13.4px;line-height:1.8}
.lab-note b{color:var(--ink-2)}
.lab-note code{color:var(--cyan);font-size:12.4px}
@media (max-width:720px){.mrule{grid-template-columns:1fr}.lab-hero h1{font-size:26px}}
</style>
</head>
<body>
${defs}

<div class="lab-wrap">
<header class="lab-hero">
  <h1>시각화 모델 카탈로그</h1>
  <p>학습 가이드의 <code>.diag</code> 인라인 SVG 로 그릴 수 있는 그림의 종류입니다.
     실측해 보니 기존 다이어그램 1,340개 중 96%가 &ldquo;사각 박스 + 직선 화살표&rdquo; 한 가지였습니다.
     같은 규칙(viewBox 폭 680 · 평면 채움 · font-size 9 이상)을 지키면서
     <b>무엇을 말하려는지에 따라 모양을 고르기 위한</b> 목록입니다.
     각 모델의 소스를 그대로 복사해 라벨과 좌표만 바꿔 쓰세요.</p>
  <span class="cnt">${models.length}종 · 규칙은 DIAGRAM-STYLE.md · 카탈로그는 DIAGRAM-MODELS.md</span>
</header>

<nav class="toc">
${toc}
</nav>

${cards}

<div class="lab-note">
  <b>고르는 순서</b> — ① 이 그림으로 무슨 <b>한 문장</b>을 전할 것인지 먼저 적습니다.
  ② 그 문장이 <b>구조 · 관계 · 시간 · 수량 · 해부</b> 중 무엇인지 정합니다.
  ③ 해당 묶음에서 모델을 고릅니다. ④ 다 그린 뒤 그 한 문장이 <code>.cap</code> 에 그대로 들어가는지 봅니다.
  들어가지 않으면 모델 선택이 틀린 것입니다.<br><br>
  <b>검사</b> — <code>node guide-src/tools/lab.mjs --check</code> 로 이 페이지의 넘침·겹침을 재고,
  실제 pane 에 넣은 뒤에는 <code>svgcheck.mjs</code> 와 브라우저 실측을 거칩니다.
</div>
</div>
</body>
</html>
`
  fs.mkdirSync(OUT, { recursive: true })
  fs.writeFileSync(path.join(OUT, 'index.html'), html, 'utf8')
  const kb = (Buffer.byteLength(html) / 1024).toFixed(0)
  console.log(`✓ public/diag-lab/index.html  ${kb} KB · 모델 ${models.length}종 (${groups.length}묶음)`)
  for (const g of groups) {
    const ids = models.filter((m) => m.group === g).map((m) => m.id)
    console.log(`  · ${g.padEnd(10)} ${ids.length}종  ${ids.join(' ')}`)
  }
  return models
}

/** svgcheck 는 <section class="sec" id="..."> 단위로 읽으므로 임시로 감싸 준다 */
function check() {
  const models = readModels()
  const wrapped = models
    .map((m) => `<section class="sec" id="${m.id}">\n${m.html}\n</section>\n`).join('')
  const tmp = path.join(SRC, '.check.tmp.html')
  fs.writeFileSync(tmp, wrapped, 'utf8')
  const res = checkFile(tmp)
  fs.unlinkSync(tmp)
  if (res.length) {
    res.forEach((r) => console.log('   ' + r))
    console.log(`✗ ${res.length}건 — 문구를 줄여 고치세요 (x 좌표를 옮기면 겹침이 생깁니다)`)
    process.exitCode = 1
  } else {
    console.log(`✓ 모델 ${models.length}종 — 넘침·겹침·잘림 0건`)
  }
}

const arg = process.argv[2]
if (arg === '--check') check()
else if (arg === '--list') readModels().forEach((m) => console.log(`${m.id.padEnd(10)} ${m.name}  — ${m.desc}`))
else build()
