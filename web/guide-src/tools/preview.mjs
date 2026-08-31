#!/usr/bin/env node
/**
 * 그림 미리보기 페이지 생성기
 *
 * 가이드 본문은 1.5~3MB 라 브라우저 캡처가 자주 타임아웃된다
 * (getBBox 실측은 되지만 스크린샷이 안 나온다).
 * 그래서 손본 그림 몇 개만 뽑아 작은 페이지로 만들어 눈으로 확인한다.
 *
 *   node guide-src/tools/preview.mjs server/y09 rust/b10 cpp/w11
 *   node guide-src/tools/preview.mjs server/y09:"알림 깔때기 → funnel"
 *
 * → public/diag-preview/index.html  (http://localhost:8899/diag-preview/)
 *
 * 섹션에 그림이 여럿이면 모두 싣는다. 확인이 끝나면 폴더는 지워도 된다.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(HERE, '..')
const OUT = path.join(HERE, '..', '..', 'public', 'diag-preview')

const args = process.argv.slice(2)
if (!args.length) {
  console.log('사용법: node guide-src/tools/preview.mjs <가이드>/<섹션id>[:설명] ...')
  console.log('  예: node guide-src/tools/preview.mjs server/y09 rust/b10:"바이너리 크기 → bar"')
  process.exit(1)
}

/** 가이드의 pane 들에서 섹션 id 를 찾아 그 안의 .diag 를 모두 가져온다 */
function pull(guide, id) {
  const dir = path.join(SRC, guide, 'parts', 'panes')
  if (!fs.existsSync(dir)) throw new Error(`가이드가 없습니다: ${guide}`)
  for (const f of fs.readdirSync(dir)) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8')
    const i = src.indexOf(`<section class="sec" id="${id}"`)
    if (i < 0) continue
    const end = src.indexOf('</section>', i)
    const body = src.slice(i, end)
    const figs = []
    for (const m of body.matchAll(/<div class="diag[^"]*">[\s\S]*?<\/svg>(\s*<div class="cap">[\s\S]*?<\/div>)?/g)) {
      figs.push(m[0].replace(/class="diag[^"]*"/, 'class="diag"') + '</div>')
    }
    return { file: f, figs }
  }
  throw new Error(`섹션을 못 찾았습니다: ${guide}/${id}`)
}

const css = ['01-tokens-base-layout.css', '02-typography-components.css', '03-demo-stage.css',
  '04-panels-beginner.css', '05-responsive.css', '06-diag.css']
  .map((f) => fs.readFileSync(path.join(SRC, 'shared', 'css', f), 'utf8')).join('\n')
const bo = fs.readFileSync(path.join(SRC, 'csharp', 'parts', '10-body-open.html'), 'utf8')
const defs = bo.slice(bo.indexOf('<svg width="0"'), bo.indexOf('</svg>') + 6)

let cards = '', n = 0
for (const arg of args) {
  const [target, note] = arg.split(':')
  const [guide, id] = target.split('/')
  if (!guide || !id) { console.error(`형식이 틀렸습니다: ${arg}`); continue }
  try {
    const { file, figs } = pull(guide, id)
    cards += `<h3>${guide}/${id}${note ? ' — ' + note : ''} <span class="src">${file}</span></h3>\n`
    cards += figs.join('\n') + '\n'
    n += figs.length
    console.log(`· ${guide}/${id}  그림 ${figs.length}개  (${file})`)
  } catch (e) { console.error(`✗ ${arg}: ${e.message}`) }
}

fs.mkdirSync(OUT, { recursive: true })
fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>그림 미리보기 (${n}개)</title>
<style>${css}
.rv{opacity:1;transform:none}
body{padding:0}
.w{max-width:1120px;margin:0 auto;padding:28px 22px 80px}
h1{font-size:21px;margin-bottom:6px}
h3{font-size:15px;color:var(--cyan);font-family:var(--mono);margin:32px 0 8px}
h3 .src{color:var(--dim-2);font-size:11.5px;margin-left:8px}
.note{color:var(--dim);font-size:13px}
</style></head><body>${defs}
<div class="w">
<h1>그림 미리보기 — ${n}개</h1>
<p class="note">본문 페이지는 커서 캡처가 타임아웃되므로 손본 그림만 따로 모았습니다.
  확인이 끝나면 <code>public/diag-preview/</code> 는 지워도 됩니다.</p>
${cards}</div></body></html>
`, 'utf8')
console.log(`✓ public/diag-preview/index.html · 그림 ${n}개`)
