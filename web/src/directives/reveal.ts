import type { Directive } from 'vue'

// 스크롤해서 보일 때 한 번만 등장시킨다.
// 사용: v-reveal  /  v-reveal="2"(stagger 순번)  /  v-reveal:scale  /  v-reveal:left="i"
const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let io: IntersectionObserver | null = null
function observer() {
  if (io) return io
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const t = e.target as HTMLElement
        t.classList.add('rv-in')
        io!.unobserve(t)
        // 등장이 끝난 뒤에야 기울기 효과가 transform을 가져간다
        const wait = 720 + (parseInt(t.style.getPropertyValue('--rv-delay')) || 0)
        setTimeout(() => t.classList.add('rv-done'), wait)
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  )
  return io
}

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    el.classList.add('rv')
    if (binding.arg) el.dataset.rv = binding.arg
    const i = binding.value ?? 0
    // 너무 길게 밀리면 기다리는 느낌이라 6칸에서 자른다
    el.style.setProperty('--rv-delay', `${Math.min(i, 6) * 70}ms`)
    if (reduce || !('IntersectionObserver' in window)) {
      el.classList.add('rv-in', 'rv-done')
      return
    }
    observer().observe(el)
  },
  unmounted(el) {
    io?.unobserve(el)
  },
}
