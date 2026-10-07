<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'

// 히어로 뒤에 깔리는 별자리. 가까운 별끼리 선으로 잇고, 마우스를 따라 층마다 다르게 움직인다.
const { theme } = useTheme()
const el = ref<HTMLCanvasElement | null>(null)

interface Star {
  x: number
  y: number
  z: number // 0..1, 클수록 가까움
  r: number
  vx: number
  vy: number
  tw: number // 반짝임 위상
}
interface Shot {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const small = window.matchMedia('(max-width: 640px)').matches

let ctx: CanvasRenderingContext2D | null = null
let stars: Star[] = []
let shot: Shot | null = null
let w = 0
let h = 0
let dpr = 1
let raf = 0
let visible = true
let mx = 0
let my = 0
let tx = 0
let ty = 0
let rgb = '46, 224, 106'
let io: IntersectionObserver | null = null

function readColor() {
  // 다크는 기존 매트릭스 그린, 라이트는 조금 진한 톤으로
  rgb = theme.value === 'dark' ? '120, 255, 170' : '11, 120, 62'
}

function build() {
  const c = el.value
  if (!c) return
  const r = c.getBoundingClientRect()
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  w = r.width
  h = r.height
  c.width = w * dpr
  c.height = h * dpr
  ctx = c.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  const n = Math.round((w * h) / (small ? 9000 : 6500))
  stars = Array.from({ length: Math.min(n, 220) }, () => {
    const z = Math.random()
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      z,
      r: 0.4 + z * 1.4,
      vx: (Math.random() - 0.5) * 0.06 * (0.3 + z),
      vy: (Math.random() - 0.5) * 0.06 * (0.3 + z),
      tw: Math.random() * Math.PI * 2,
    }
  })
}

function draw(t: number) {
  if (!ctx) return
  ctx.clearRect(0, 0, w, h)
  // 마우스 따라가기는 살짝 늦게
  mx += (tx - mx) * 0.05
  my += (ty - my) * 0.05

  const pts: { x: number; y: number; z: number }[] = []
  for (const s of stars) {
    s.x += s.vx
    s.y += s.vy
    if (s.x < -10) s.x = w + 10
    if (s.x > w + 10) s.x = -10
    if (s.y < -10) s.y = h + 10
    if (s.y > h + 10) s.y = -10
    const px = s.x + mx * 18 * s.z
    const py = s.y + my * 12 * s.z
    pts.push({ x: px, y: py, z: s.z })
    const a = 0.35 + 0.45 * s.z * (0.6 + 0.4 * Math.sin(t / 900 + s.tw))
    ctx.beginPath()
    ctx.fillStyle = `rgba(${rgb}, ${a})`
    ctx.arc(px, py, s.r, 0, Math.PI * 2)
    ctx.fill()
  }

  // 가까운 별 잇기 — 앞쪽 별끼리만
  const link = small ? 70 : 110
  ctx.lineWidth = 0.6
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    if (a.z < 0.45) continue
    for (let j = i + 1; j < pts.length; j++) {
      const b = pts[j]
      if (b.z < 0.45) continue
      const dx = a.x - b.x
      const dy = a.y - b.y
      const d = dx * dx + dy * dy
      if (d > link * link) continue
      ctx.strokeStyle = `rgba(${rgb}, ${0.16 * (1 - Math.sqrt(d) / link)})`
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }
  }

  // 가끔 별똥별
  if (!shot && Math.random() < 0.004) {
    shot = { x: Math.random() * w * 0.7, y: Math.random() * h * 0.4, vx: 6 + Math.random() * 3, vy: 2 + Math.random() * 1.5, life: 1 }
  }
  if (shot) {
    const g = ctx.createLinearGradient(shot.x, shot.y, shot.x - shot.vx * 14, shot.y - shot.vy * 14)
    g.addColorStop(0, `rgba(${rgb}, ${0.8 * shot.life})`)
    g.addColorStop(1, `rgba(${rgb}, 0)`)
    ctx.strokeStyle = g
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(shot.x, shot.y)
    ctx.lineTo(shot.x - shot.vx * 14, shot.y - shot.vy * 14)
    ctx.stroke()
    shot.x += shot.vx
    shot.y += shot.vy
    shot.life -= 0.018
    if (shot.life <= 0 || shot.x > w + 50 || shot.y > h + 50) shot = null
  }
}

function loop(t: number) {
  raf = requestAnimationFrame(loop)
  if (!visible || document.hidden) return
  draw(t)
}

function onMove(e: PointerEvent) {
  tx = (e.clientX / window.innerWidth - 0.5) * 2
  ty = (e.clientY / window.innerHeight - 0.5) * 2
}

function onResize() {
  build()
  if (reduce) draw(0)
}

onMounted(() => {
  readColor()
  build()
  window.addEventListener('resize', onResize)
  if (reduce) {
    draw(0)
    return
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
  if (el.value) io.observe(el.value)
  raf = requestAnimationFrame(loop)
})

watch(theme, () => {
  readColor()
  if (reduce) draw(0)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  io?.disconnect()
  window.removeEventListener('resize', onResize)
  window.removeEventListener('pointermove', onMove)
})
</script>

<template>
  <canvas ref="el" class="stars" aria-hidden="true"></canvas>
</template>

<style scoped>
.stars {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(ellipse 90% 85% at 60% 40%, #000 45%, transparent 100%);
  mask-image: radial-gradient(ellipse 90% 85% at 60% 40%, #000 45%, transparent 100%);
}
</style>
