#!/usr/bin/env node
/**
 * 차트로 바꿀 만한 그림 찾기
 *
 * 다이어그램 1,388개 중 대부분이 "사각 박스 + 직선"이다(2026-08-28 실측 96%).
 * 그중 **숫자 비교가 실은 요점인데 박스로 그린 것**을 찾아 준다.
 * 판정 기준은 하나 —
 *   같은 단위의 서로 다른 수치가 3개 이상 들어 있는데 차트 어휘를 안 쓴 그림.
 *
 *   node guide-src/tools/chartcand.mjs              전체
 *   node guide-src/tools/chartcand.mjs server rust  특정 가이드만
 *   node guide-src/tools/chartcand.mjs --all        수치 신호만 있으면 전부 (넓게)
 *
 * 나온 것을 전부 바꿀 필요는 없다. 대개는 **축·눈금을 붙이고 어휘를
 * .bar/.ax/.gr/.tk 로 바꾸는 것만으로** 충분하다 — DIAGRAM-MODELS.md 참고.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(HERE, '..')
const GUIDES = ['cpp', 'server', 'csharp', 'js-ts', 'python', 'rust', 'cs', 'java', 'kotlin', 'db']

// 이미 차트·모델 어휘를 쓴 그림은 손댈 필요가 없다
const CHART = /class="[^"]*\b(bar|li|area|band|cel|ring|dot|ax|s1|s2|s3|s4|chev|dia|nd|life|lane|actv)\b/
const UNIT = /([\d.,]+)\s*(ms|초|분|시간|MB|GB|KB|%|배|건|개|행|rps|QPS|req)/gi

const args = process.argv.slice(2)
const wide = args.includes('--all')
const picked = args.filter((a) => !a.startsWith('--'))
const targets = picked.length ? GUIDES.filter((g) => picked.includes(g)) : GUIDES

const rows = []
for (const g of targets) {
  const dir = path.join(SRC, g, 'parts', 'panes')
  if (!fs.existsSync(dir)) continue
  for (const f of fs.readdirSync(dir)) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8')
    const secs = src.split(/<section class="sec" id="([^"]+)"/)
    for (let i = 1; i < secs.length; i += 2) {
      const id = secs[i], body = secs[i + 1]
      for (const m of body.matchAll(/<svg viewBox[\s\S]*?<\/svg>/g)) {
        const v = m[0]
        if (CHART.test(v)) continue
        const texts = [...v.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map((t) => t[1].replace(/<[^>]+>/g, ''))
        const all = texts.join(' ')
        const units = {}
        for (const u of all.matchAll(UNIT)) (units[u[2].toLowerCase()] ??= []).push(u[1])
        const hit = Object.entries(units)
          .filter(([, arr]) => new Set(arr).size >= (wide ? 2 : 3))
          .sort((a, b) => new Set(b[1]).size - new Set(a[1]).size)[0]
        if (!hit) continue
        rows.push({
          g, f, id, unit: hit[0], vals: [...new Set(hit[1])],
          rect: (v.match(/<rect/g) || []).length,
          title: (texts[0] || '').replace(/\s+/g, ' ').slice(0, 46),
        })
      }
    }
  }
}

rows.sort((a, b) => b.vals.length - a.vals.length)
console.log(`차트로 바꿀 만한 그림 ${rows.length}개` + (wide ? ' (--all · 넓게)' : '') + '\n')
for (const r of rows) {
  console.log(`${(r.g + '/' + r.id).padEnd(14)} ${r.unit.padEnd(4)} ${String(r.vals.length).padStart(2)}개 ` +
    `[${r.vals.slice(0, 5).join(', ')}] rect${String(r.rect).padStart(2)}  ${r.title}`)
}
if (rows.length) {
  console.log('\n손보는 순서 — ① 원본을 읽어 막대가 이미 값에 비례하는지 본다(대개 비례한다)')
  console.log('  ② 비례하면 축·눈금만 붙이고 .bx → .bar, .ln → .ax/.gr, .ann → .tk 로 바꾼다')
  console.log('  ③ svgcheck → preview.mjs 로 눈 확인 → 본문 브라우저 실측')
}
