import type { Directive } from 'vue'

// 카드 기울기 + 커서 따라오는 빛. 마우스(정밀 포인터)에서만 켠다.
const fine =
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

type TiltEl = HTMLElement & { _tiltOff?: () => void }

export const vTilt: Directive<TiltEl, number | undefined> = {
  mounted(el, binding) {
    el.classList.add('glow')
    if (!fine) return
    const max = binding.value ?? 5
    let raf = 0
    let px = 0.5
    let py = 0.5

    const paint = () => {
      raf = 0
      el.style.setProperty('--mx', `${px * 100}%`)
      el.style.setProperty('--my', `${py * 100}%`)
      el.style.setProperty('--rx', `${(0.5 - py) * max}deg`)
      el.style.setProperty('--ry', `${(px - 0.5) * max}deg`)
    }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      px = (e.clientX - r.left) / r.width
      py = (e.clientY - r.top) / r.height
      if (!raf) raf = requestAnimationFrame(paint)
    }
    const enter = () => el.classList.add('tilting')
    const leave = () => {
      el.classList.remove('tilting')
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
    }
    el.classList.add('tilt')
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    el._tiltOff = () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
    }
  },
  unmounted(el) {
    el._tiltOff?.()
  },
}

// 버튼이 커서 쪽으로 살짝 끌려오는 효과
export const vMagnetic: Directive<TiltEl, number | undefined> = {
  mounted(el, binding) {
    if (!fine) return
    const pull = binding.value ?? 6
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
      el.style.transform = `translate(${dx * pull}px, ${dy * pull * 0.6}px)`
    }
    const leave = () => {
      el.style.transform = ''
    }
    el.classList.add('magnetic')
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    el._tiltOff = () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  },
  unmounted(el) {
    el._tiltOff?.()
  },
}
