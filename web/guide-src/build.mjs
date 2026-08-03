#!/usr/bin/env node
/**
 * Python Visual Guide 빌더
 *
 * guide-src/parts/** 조각들을 parts.json 순서대로 이어붙여
 * public/python-guide/index.html 을 만든다.
 *
 * 조각은 '원문 그대로'를 담고 있고 빌더는 문자열을 잇기만 한다.
 * (가공을 하지 않으므로 결과물이 예상과 달라질 여지가 없다)
 *
 *   node guide-src/build.mjs           빌드
 *   node guide-src/build.mjs --check   결과물이 최신인지 검사만 (CI/커밋 전 확인)
 *   node guide-src/build.mjs --watch   조각이 바뀌면 자동 재빌드
 */
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { existsSync, watch } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const PARTS_DIR = join(HERE, 'parts')
const MANIFEST = join(HERE, 'parts.json')
const OUT = join(HERE, '..', 'public', 'python-guide', 'index.html')

const kb = (n) => `${(n / 1024).toFixed(0)} KB`

/** parts.json 에 적힌 순서대로 조각을 읽어 하나로 잇는다. */
async function assemble() {
  // parts.json 은 { "_설명": …, "parts": [...] } 형태. 배열만 있던 옛 형태도 받아 준다.
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))
  const order = Array.isArray(manifest) ? manifest : manifest.parts
  if (!Array.isArray(order)) throw new Error('parts.json 에 parts 배열이 없습니다')

  // 매니페스트에 없는 조각이 굴러다니면 조용히 빠지므로 미리 잡는다
  const onDisk = await listParts(PARTS_DIR)
  const missing = order.filter((p) => !existsSync(join(PARTS_DIR, p)))
  const orphan = onDisk.filter((p) => !order.includes(p))
  if (missing.length) throw new Error(`parts.json 에 있는데 파일이 없음:\n  ${missing.join('\n  ')}`)
  if (orphan.length) throw new Error(`파일은 있는데 parts.json 에 없음:\n  ${orphan.join('\n  ')}`)

  const chunks = await Promise.all(order.map((p) => readFile(join(PARTS_DIR, p), 'utf8')))
  return { html: chunks.join(''), count: order.length }
}

async function listParts(dir) {
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (e.isFile()) out.push(relative(dir, join(e.parentPath ?? e.path, e.name)).replaceAll('\\', '/'))
  }
  return out.sort()
}

async function build({ check = false, quiet = false } = {}) {
  const { html, count } = await assemble()
  const prev = existsSync(OUT) ? await readFile(OUT, 'utf8') : null
  const same = prev === html

  if (check) {
    if (same) {
      console.log(`✓ index.html 이 조각과 일치합니다 (조각 ${count}개)`)
      return true
    }
    console.error('✗ index.html 이 조각과 다릅니다. `npm run build:guide` 를 실행하세요.')
    console.error(`  현재 ${prev == null ? '(없음)' : kb(Buffer.byteLength(prev))} / 조각 기준 ${kb(Buffer.byteLength(html))}`)
    return false
  }

  if (!same) await writeFile(OUT, html, 'utf8')
  if (!quiet) {
    const bytes = Buffer.byteLength(html)
    console.log(
      `${same ? '·' : '✓'} python-guide/index.html  ${kb(bytes)} · ${html.split('\n').length.toLocaleString()}줄 · 조각 ${count}개${same ? ' (변경 없음)' : ''}`,
    )
  }
  return true
}

const args = process.argv.slice(2)

if (args.includes('--watch')) {
  await build()
  console.log('👀 guide-src/parts 감시 중… (Ctrl+C 로 종료)')
  let timer = null
  watch(PARTS_DIR, { recursive: true }, (_e, file) => {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      try {
        await build({ quiet: true })
        console.log(`  ↻ ${file} → 재빌드 ${new Date().toLocaleTimeString('ko-KR')}`)
      } catch (err) {
        console.error('  ✗', err.message)
      }
    }, 80)
  })
} else {
  const ok = await build({ check: args.includes('--check') })
  if (!ok) process.exit(1)
}
