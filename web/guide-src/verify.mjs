#!/usr/bin/env node
/**
 * 빌드 결과물 점검 (build.mjs 다음에 돌린다)
 *
 *   node guide-src/verify.mjs      ·  npm run verify:guide
 *
 * build.mjs 는 '조각이 결과물과 일치하는가'만 본다.
 * 이 스크립트는 그 다음 질문을 본다 —
 *   · 사이드바 링크와 섹션 id 가 서로 맞는가 (검색 색인의 원천)
 *   · 탭 버튼 · pane · navset · TAB_ORDER · 단축키 숫자가 한 벌로 맞는가
 *   · 섹션마다 난이도(SEC_LV) · 한 줄 요약(EZ) · 도달점(CAP) 이 있는가
 *   · 섹션 id 중복 · section 태그 균형
 *
 * 섹션이나 탭을 추가한 뒤 여기서 통과하면 화면·검색·요약이 모두 맞는다.
 */
import { readFile } from 'node:fs/promises'

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const GUIDES = ['python-web', 'java-web', 'js-ts-web', 'csharp-web', 'db-web', 'server-web']
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
let bad = 0

for (const g of GUIDES) {
  const html = await readFile(join(ROOT, g, 'index.html'), 'utf8')
  const err = []

  // 섹션 id
  const secIds = new Set([...html.matchAll(/<section class="sec" id="([^"]+)"/g)].map(m => m[1]))
  // 사이드바 링크 (navset 안)
  const navBlocks = [...html.matchAll(/<div class="navset[^"]*" data-nav="([^"]+)">([\s\S]*?)\n<\/div>/g)]
  const navIds = new Map()
  for (const [, tab, body] of navBlocks) {
    for (const m of body.matchAll(/<a href="#([^"]+)"/g)) navIds.set(m[1], tab)
  }
  for (const id of navIds.keys()) if (!secIds.has(id)) err.push(`사이드바 → 없는 섹션 #${id}`)
  for (const id of secIds) if (!navIds.has(id)) err.push(`섹션 #${id} 에 사이드바 링크 없음`)

  // 탭 ↔ pane 짝
  const panes = new Set([...html.matchAll(/<div class="pane[^"]*" id="pane-([^"]+)"/g)].map(m => m[1]))
  const tabs = new Set([...html.matchAll(/<button[^>]*data-t="([^"]+)"[^>]*role="tab"/g)].map(m => m[1]))
  for (const t of tabs) if (!panes.has(t)) err.push(`탭 ${t} 의 pane 없음`)
  for (const p of panes) if (!tabs.has(p)) err.push(`pane ${p} 의 탭 버튼 없음`)
  for (const [, tab] of navBlocks) if (!panes.has(tab)) err.push(`navset ${tab} 의 pane 없음`)

  // TAB_ORDER 유효성
  const ord = html.match(/const TAB_ORDER = \[([^\]]*)\]/)
  const orderKeys = ord ? [...ord[1].matchAll(/"([^"]+)"/g)].map(m => m[1]) : []
  for (const k of orderKeys) if (!panes.has(k)) err.push(`TAB_ORDER 의 ${k} pane 없음`)
  // 단축키 숫자와 TAB_ORDER 일치
  const keyNums = [...html.matchAll(/data-t="([^"]+)"[^>]*role="tab"[\s\S]{0,200}?<span class="k">(\d)<\/span>/g)]
  for (const [, t, n] of keyNums) {
    const i = '1234567890'.indexOf(n)
    if (orderKeys[i] !== t) err.push(`단축키 ${n} → 탭바는 ${t}, TAB_ORDER 는 ${orderKeys[i]}`)
  }

  // SEC_LV / EZ / CAP 커버리지
  const grab = (name, re) => {
    const m = html.match(re)
    if (!m) { err.push(`${name} 못 찾음`); return new Set() }
    return new Set([...m[1].matchAll(/(?:^|[\s,{])([a-z][a-z0-9]+):/gm)].map(x => x[1]))
  }
  const lv = grab('SEC_LV', /const SEC_LV = \{([\s\S]*?)\n\};/)
  const ez = grab('EZ', /const EZ = \{([\s\S]*?)\n\};/)
  const cap = grab('CAP', /const CAP = \{([\s\S]*?)\n\};/)
  for (const id of secIds) {
    if (!lv.has(id)) err.push(`SEC_LV 누락 ${id}`)
    if (!ez.has(id)) err.push(`EZ 누락 ${id}`)
    if (!cap.has(id)) err.push(`CAP 누락 ${id}`)
  }

  // 중복 id
  const allIds = [...html.matchAll(/<section class="sec" id="([^"]+)"/g)].map(m => m[1])
  const dup = allIds.filter((v, i) => allIds.indexOf(v) !== i)
  if (dup.length) err.push(`중복 섹션 id: ${[...new Set(dup)].join(',')}`)

  // section 태그 균형
  const open = (html.match(/<section\b/g) || []).length
  const close = (html.match(/<\/section>/g) || []).length
  if (open !== close) err.push(`section 태그 불균형 ${open} vs ${close}`)

  console.log(`${err.length ? '✗' : '✓'} ${g}  섹션 ${secIds.size} · 탭 ${panes.size}`)
  err.slice(0, 40).forEach(e => console.log('   -', e))
  if (err.length > 40) console.log(`   … 외 ${err.length - 40}건`)
  bad += err.length
}
process.exit(bad ? 1 : 0)
