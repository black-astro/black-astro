#!/usr/bin/env node
/**
 * 학습 가이드 빌더 (Python · Java · JS/TS · C#/Unity · Database · Web Server)
 *
 * guide-src/<가이드>/parts/** 조각들을 parts.json 순서대로 이어붙여
 * public/<출력경로>/index.html 을 만든다.
 *
 * 조각은 '원문 그대로'를 담고 있고 빌더는 문자열을 잇기만 한다.
 * (가공을 하지 않으므로 결과물이 예상과 달라질 여지가 없다)
 *
 * parts.json 의 경로가 'shared/' 로 시작하면 guide-src/shared/ 에서 읽는다.
 * 뼈대 CSS 와 사이드바 스크립트처럼 여덟 가이드가 글자 하나까지 같이 쓰는
 * 조각들이 거기 있다 — 예전엔 가이드마다 복사본이 있어서 한 줄을 고치려면
 * 여덟 번 고쳐야 했고, 실제로 한두 곳이 빠져 서로 어긋나곤 했다.
 *
 *   node guide-src/build.mjs              전부 빌드
 *   node guide-src/build.mjs java         특정 가이드만
 *   node guide-src/build.mjs --check      결과물이 최신인지 검사만 (CI/커밋 전 확인)
 *   node guide-src/build.mjs --watch      조각이 바뀌면 자동 재빌드
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import { existsSync, watch } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(HERE, '..', 'public')
const SHARED_PREFIX = 'shared/' // parts.json 에서 공용 조각을 가리키는 접두사

/** 가이드 하나 = 소스 폴더 + 배포 경로 */
const GUIDES = [
  { name: 'python', out: 'python-web', label: '🐍 Python' },
  { name: 'java', out: 'java-web', label: '☕ Java' },
  { name: 'js-ts', out: 'js-ts-web', label: '🟨 JS · TS' },
  { name: 'db', out: 'db-web', label: '🗄️ Database' },
  { name: 'server', out: 'server-web', label: '🌐 Web Server' },
  { name: 'csharp', out: 'csharp-web', label: '🟣 C# · Unity' },
  { name: 'cpp', out: 'cpp-web', label: '🔵 C++' },
  { name: 'rust', out: 'rust-web', label: '🦀 Rust' },
]

const kb = (n) => `${(n / 1024).toFixed(0)} KB`

/** parts.json 에 적힌 순서대로 조각을 읽어 하나로 잇는다. */
async function assemble(guide) {
  const dir = join(HERE, guide.name)
  const partsDir = join(dir, 'parts')

  // parts.json 은 { "_설명": …, "parts": [...] } 형태. 배열만 있던 옛 형태도 받아 준다.
  const manifest = JSON.parse(await readFile(join(dir, 'parts.json'), 'utf8'))
  const order = Array.isArray(manifest) ? manifest : manifest.parts
  if (!Array.isArray(order)) throw new Error(`${guide.name}/parts.json 에 parts 배열이 없습니다`)

  // 'shared/...' 는 공용 폴더에서, 나머지는 이 가이드의 parts/ 에서 읽는다
  const resolve = (p) => (p.startsWith(SHARED_PREFIX) ? join(HERE, p) : join(partsDir, p))

  // 매니페스트에 없는 조각이 굴러다니면 조용히 빠지므로 미리 잡는다
  // (고아 검사는 이 가이드의 parts/ 만 본다. 공용 조각은 다른 가이드도 쓰므로
  //  한 가이드가 안 쓴다고 해서 남는 파일이 아니다.)
  const onDisk = await listParts(partsDir)
  const own = order.filter((p) => !p.startsWith(SHARED_PREFIX))
  const missing = order.filter((p) => !existsSync(resolve(p)))
  const orphan = onDisk.filter((p) => !own.includes(p))
  if (missing.length) throw new Error(`${guide.name}: parts.json 에 있는데 파일이 없음\n  ${missing.join('\n  ')}`)
  if (orphan.length) throw new Error(`${guide.name}: 파일은 있는데 parts.json 에 없음\n  ${orphan.join('\n  ')}`)

  const chunks = await Promise.all(order.map((p) => readFile(resolve(p), 'utf8')))
  return { html: chunks.join(''), count: order.length }
}

async function listParts(dir) {
  if (!existsSync(dir)) return []
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (e.isFile()) out.push(relative(dir, join(e.parentPath ?? e.path, e.name)).replaceAll('\\', '/'))
  }
  return out.sort()
}

async function buildOne(guide, { check = false, quiet = false } = {}) {
  const outFile = join(PUBLIC, guide.out, 'index.html')
  const { html, count } = await assemble(guide)
  const prev = existsSync(outFile) ? await readFile(outFile, 'utf8') : null
  const same = prev === html

  if (check) {
    if (same) {
      if (!quiet) console.log(`✓ ${guide.out}/index.html 이 조각과 일치합니다 (조각 ${count}개)`)
      return true
    }
    console.error(`✗ ${guide.out}/index.html 이 조각과 다릅니다. \`npm run build:guide\` 를 실행하세요.`)
    return false
  }

  if (!same) {
    await mkdir(dirname(outFile), { recursive: true })
    await writeFile(outFile, html, 'utf8')
  }
  if (!quiet) {
    console.log(
      `${same ? '·' : '✓'} ${guide.label}  ${guide.out}/index.html  ` +
        `${kb(Buffer.byteLength(html))} · ${html.split('\n').length.toLocaleString()}줄 · 조각 ${count}개` +
        `${same ? ' (변경 없음)' : ''}`,
    )
  }
  return true
}

async function buildAll(opts = {}) {
  let ok = true
  for (const g of targets) {
    try {
      ok = (await buildOne(g, opts)) && ok
    } catch (err) {
      console.error(`✗ ${g.name}: ${err.message}`)
      ok = false
    }
  }
  if (targets.length === GUIDES.length) ok = (await checkShared()) && ok
  return ok
}

/** shared/ 에 아무 가이드도 쓰지 않는 조각이 남아 있으면 알린다.
 *  (전체 빌드일 때만 본다 — 한 가이드만 빌드하면 판단할 근거가 없다) */
async function checkShared() {
  const dir = join(HERE, 'shared')
  if (!existsSync(dir)) return true
  const used = new Set()
  for (const g of GUIDES) {
    const manifest = JSON.parse(await readFile(join(HERE, g.name, 'parts.json'), 'utf8'))
    const order = Array.isArray(manifest) ? manifest : manifest.parts
    for (const p of order) if (p.startsWith(SHARED_PREFIX)) used.add(p.slice(SHARED_PREFIX.length))
  }
  const unused = (await listParts(dir)).filter((p) => !used.has(p))
  if (!unused.length) return true
  console.error(`✗ shared/ 에 어느 가이드도 쓰지 않는 조각이 있습니다\n  ${unused.join('\n  ')}`)
  return false
}

const args = process.argv.slice(2)
const picked = args.filter((a) => !a.startsWith('--'))
const targets = picked.length ? GUIDES.filter((g) => picked.includes(g.name)) : GUIDES
if (!targets.length) {
  console.error(`알 수 없는 가이드: ${picked.join(', ')} (가능: ${GUIDES.map((g) => g.name).join(', ')})`)
  process.exit(1)
}

if (args.includes('--watch')) {
  await buildAll()
  console.log('👀 guide-src 감시 중… (Ctrl+C 로 종료)')
  let timer = null
  // 공용 조각도 감시한다 — 여기를 고치면 여덟 가이드가 한꺼번에 바뀐다
  const watched = [...targets.map((g) => [g.name, join(HERE, g.name, 'parts')]), ['shared', join(HERE, 'shared')]]
  for (const [label, dir] of watched) {
    if (!existsSync(dir)) continue
    watch(dir, { recursive: true }, (_e, file) => {
      clearTimeout(timer)
      timer = setTimeout(async () => {
        await buildAll({ quiet: true })
        console.log(`  ↻ ${label}/${file} → 재빌드 ${new Date().toLocaleTimeString('ko-KR')}`)
      }, 80)
    })
  }
} else {
  const ok = await buildAll({ check: args.includes('--check') })
  if (!ok) process.exit(1)
}
