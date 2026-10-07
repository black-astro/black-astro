<script setup lang="ts">
import { ref } from 'vue'
import { profile, achievements, links } from '@/data/profile'
import { competencies, skillGroups } from '@/data/skills'
import { guides } from '@/router'
import AppIcon from '@/components/AppIcon.vue'
import StarField from '@/components/StarField.vue'
import ScrambleText from '@/components/ScrambleText.vue'
import TypeCycle from '@/components/TypeCycle.vue'
import CountUp from '@/components/CountUp.vue'
import TechMarquee from '@/components/TechMarquee.vue'

const doing = ['PASS 발송 서버 정리', '느린 쿼리 튜닝', 'KT 청구서 배치 개선', 'Kotlin 공부']

// 흐르는 기술 목록 — 그룹 순서대로 펼치고 중복은 뺀다
const stack = [...new Set(skillGroups.flatMap((g) => g.items))].slice(0, 32)

const opened = ref<Record<number, boolean>>({})
const toggle = (i: number) => (opened.value[i] = !opened.value[i])

// 해시 라우터라 #numbers 앵커를 쓰면 라우트로 해석된다. 직접 내려 준다
function scrollToNumbers() {
  document.getElementById('numbers')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <!-- HERO -->
  <section class="hero">
    <StarField />
    <div class="container hero-inner">
      <div class="term-line" v-reveal>
        <span class="term-prompt">black-astro@backend</span><span class="term-sep">:</span><span class="term-path">~</span><span class="term-sep">$</span>
        <span class="term-cmd">whoami</span>
      </div>
      <h1 class="hero-title">
        <ScrambleText :text="profile.name" :delay="150" /><span class="hero-role"> — {{ profile.role }}</span>
      </h1>
      <p class="hero-doing" v-reveal="1">
        요즘은 <span class="accent"><TypeCycle :words="doing" /></span> 중입니다.
      </p>
      <p class="hero-line" v-reveal="2">{{ profile.headline }}</p>
      <p class="hero-sub" v-reveal="3">{{ profile.subHeadline }}</p>

      <div class="hero-meta" v-reveal="4">
        <span class="chip">{{ profile.company }} · {{ profile.companyDesc }}</span>
        <span class="chip">{{ profile.tenure }}</span>
        <span class="chip">{{ profile.years }}년차</span>
      </div>

      <div class="hero-actions" v-reveal="5">
        <RouterLink v-magnetic to="/portfolio" class="btn btn-primary">
          문제 해결 노트 <AppIcon name="arrow" :size="17" />
        </RouterLink>
        <RouterLink v-magnetic to="/career" class="btn btn-ghost">회사에서 한 일</RouterLink>
        <a
          v-for="l in links"
          :key="l.label"
          v-magnetic="4"
          :href="l.href"
          class="btn btn-icon"
          target="_blank"
          rel="noopener"
          :title="l.value"
          :aria-label="l.label"
        >
          <AppIcon :name="l.icon" :size="18" />
        </a>
      </div>
    </div>
    <a href="#/" class="scroll-hint" aria-label="아래로" @click.prevent="scrollToNumbers">
      <span class="mouse"><span class="wheel"></span></span>
    </a>
  </section>

  <div class="container" v-reveal>
    <TechMarquee :items="stack" />
  </div>

  <!-- 숫자 -->
  <section id="numbers" class="container block">
    <div class="block-head" v-reveal>
      <span class="eyebrow">numbers</span>
      <h2 class="section-title">기억에 남는 작업</h2>
      <p class="block-lead">숫자마다 어떤 환경에서 측정했는지 같이 적었습니다. 카드를 누르면 자세한 내용을 볼 수 있습니다.</p>
    </div>
    <div class="stat-grid">
      <article
        v-for="(a, i) in achievements"
        :key="a.label"
        v-reveal="i % 3"
        v-tilt
        class="stat card"
        :class="{ open: opened[i] }"
      >
        <button class="stat-btn" :aria-expanded="!!opened[i]" @click="toggle(i)">
          <span class="stat-metric">
            <CountUp :value="a.metric" /><span v-if="a.unit" class="stat-unit">{{ a.unit }}</span>
          </span>
          <span class="stat-label">{{ a.label }}</span>
          <span class="stat-more">{{ opened[i] ? '접기' : '자세히 보기' }} <span class="stat-chev" aria-hidden="true">›</span></span>
        </button>
        <div class="fold" :class="{ on: opened[i] }">
          <div class="fold-in">
            <p class="stat-detail">{{ a.detail }}</p>
          </div>
        </div>
      </article>
    </div>
  </section>

  <!-- 자주 고민하는 것 -->
  <section class="container block">
    <div class="block-head" v-reveal>
      <span class="eyebrow">focus</span>
      <h2 class="section-title">자주 고민하는 것</h2>
    </div>
    <div class="comp-grid">
      <article v-for="(c, i) in competencies" :key="c.title" v-reveal:scale="i % 3" v-tilt class="comp card">
        <div class="comp-icon"><AppIcon :name="c.icon" :size="20" /></div>
        <h3 class="comp-title">{{ c.title }}</h3>
        <p class="comp-desc">{{ c.desc }}</p>
      </article>
    </div>
    <div class="home-cta" v-reveal>
      <RouterLink v-magnetic to="/about" class="btn btn-ghost">사용하는 기술 전체 보기 <AppIcon name="arrow" :size="16" /></RouterLink>
    </div>
  </section>

  <!-- 학습 가이드 — 푸터의 '학습 가이드' 링크가 여기로 데려온다 -->
  <section id="guides" class="container block">
    <div class="block-head" v-reveal>
      <span class="eyebrow">side</span>
      <h2 class="section-title">직접 만든 학습 페이지</h2>
    </div>
    <div class="guide-grid">
      <a v-for="(g, i) in guides" :key="g.key" v-reveal="i" v-tilt="3" :href="g.href" class="guide card" :title="g.title">
        <div class="guide-main">
          <div class="guide-top">
            <span class="guide-emoji" aria-hidden="true">{{ g.emoji }}</span>
            <h3 class="guide-title">{{ g.heading }}</h3>
            <span class="guide-ext" aria-hidden="true">↗</span>
          </div>
          <p class="guide-desc">{{ g.desc }}</p>
          <div class="guide-tags">
            <span v-for="t in g.tags" :key="t" class="chip">{{ t }}</span>
          </div>
        </div>
        <div class="guide-stats">
          <div v-for="st in g.stats" :key="st.label">
            <b><CountUp :value="st.value" /></b><span>{{ st.label }}</span>
          </div>
        </div>
      </a>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: min(86vh, 760px);
  display: flex;
  align-items: center;
  padding: 64px 0 80px;
  overflow: hidden;
}
.hero-inner {
  position: relative;
  width: 100%;
  min-width: 0;
}
.term-line {
  font-family: var(--font-mono);
  font-size: 0.86rem;
  margin-bottom: 20px;
  letter-spacing: -0.01em;
}
.term-prompt {
  color: var(--accent);
}
.term-sep {
  color: var(--text-muted);
  margin: 0 1px;
}
.term-path {
  color: var(--text-secondary);
}
.term-cmd {
  color: var(--text);
  margin-left: 6px;
}
.hero-title {
  font-size: clamp(2.2rem, 6vw, 3.6rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.035em;
}
.hero-role {
  color: var(--text-muted);
  font-weight: 700;
  font-size: 0.62em;
  letter-spacing: -0.02em;
}
.hero-doing {
  margin-top: 18px;
  font-size: clamp(0.98rem, 2vw, 1.1rem);
  font-weight: 500;
  color: var(--text-secondary);
}
.accent {
  color: var(--accent);
}
.hero-line {
  margin-top: 14px;
  font-size: clamp(1.12rem, 2.5vw, 1.45rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.45;
  max-width: 760px;
}
.hero-sub {
  margin-top: 14px;
  max-width: 640px;
  font-size: 1.02rem;
  color: var(--text-secondary);
  line-height: 1.7;
}
.hero-meta {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.hero-actions {
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.94rem;
  border: 1px solid transparent;
}
.btn-primary {
  background: var(--accent);
  color: var(--accent-contrast);
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 40%, transparent);
}
.btn-primary:hover {
  background: var(--accent-hover);
  box-shadow: 0 8px 26px -8px color-mix(in srgb, var(--accent) 70%, transparent);
}
.btn-primary svg {
  transition: transform 0.25s ease;
}
.btn-primary:hover svg {
  transform: translateX(3px);
}
.btn-ghost {
  border-color: var(--border-strong);
  color: var(--text);
  background: color-mix(in srgb, var(--surface) 80%, transparent);
}
.btn-ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.btn-icon {
  padding: 11px;
  border-color: var(--border-strong);
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--surface) 80%, transparent);
}
.btn-icon:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.scroll-hint {
  position: absolute;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  opacity: 0.6;
  transition: opacity 0.2s ease;
}
.scroll-hint:hover {
  opacity: 1;
}
.mouse {
  display: block;
  width: 22px;
  height: 34px;
  border: 2px solid var(--text-muted);
  border-radius: 12px;
  position: relative;
}
.wheel {
  position: absolute;
  left: 50%;
  top: 6px;
  width: 3px;
  height: 7px;
  margin-left: -1.5px;
  border-radius: 2px;
  background: var(--accent);
  animation: wheel 1.8s ease-in-out infinite;
}
@keyframes wheel {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  70% {
    transform: translateY(10px);
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

.block {
  padding-top: 72px;
}
.block:last-of-type {
  padding-bottom: 90px;
}
.block-head {
  margin-bottom: 26px;
}
.block-head .eyebrow {
  display: block;
  margin-bottom: 9px;
}
.block-lead {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 0.92rem;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: start;
}
.stat {
  padding: 0;
  overflow: hidden;
}
.stat-btn {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 22px 22px 18px;
  background: none;
  border: none;
  text-align: left;
}
.stat-metric {
  font-family: var(--font-mono);
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: -0.02em;
  line-height: 1.15;
}
.stat-unit {
  font-size: 0.9rem;
  margin-left: 4px;
  color: var(--text-muted);
}
.stat-label {
  font-weight: 700;
  font-size: 0.97rem;
  line-height: 1.45;
}
.stat-more {
  margin-top: 4px;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  color: var(--text-muted);
  transition: color 0.2s ease;
}
.stat-chev {
  display: inline-block;
  transition: transform 0.3s ease;
}
.stat.open .stat-chev {
  transform: rotate(90deg);
}
.stat-btn:hover .stat-more {
  color: var(--accent);
}
.stat-detail {
  padding: 0 22px 22px;
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1.6;
}

.comp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: stretch;
}
.comp {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px 22px;
}
.comp-icon {
  display: inline-flex;
  align-self: flex-start;
  padding: 10px;
  border-radius: 11px;
  background: var(--accent-soft);
  color: var(--accent);
  margin-bottom: 14px;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.comp:hover .comp-icon {
  transform: translateY(-3px) rotate(-6deg);
}
.comp-title {
  font-size: 1.05rem;
  font-weight: 700;
}
.comp-desc {
  margin-top: 9px;
  color: var(--text-muted);
  font-size: 0.88rem;
  line-height: 1.6;
}
.home-cta {
  margin-top: 34px;
  display: flex;
  justify-content: center;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
  align-items: stretch;
}
.guide {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px 26px;
  min-width: 0;
}
.guide-main {
  min-width: 0;
  flex: 1;
}
.guide-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.guide-emoji {
  font-size: 1.35rem;
  line-height: 1;
}
.guide-title {
  font-size: 1.14rem;
  font-weight: 700;
}
.guide-ext {
  color: var(--text-muted);
  font-size: 0.9rem;
  transition: transform 0.25s ease, color 0.2s ease;
}
.guide:hover .guide-ext {
  transform: translate(2px, -2px);
}
.guide:hover .guide-ext,
.guide:hover .guide-title {
  color: var(--accent);
}
.guide-desc {
  margin-top: 10px;
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.65;
}
.guide-tags {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.guide-stats {
  margin-top: auto;
  display: flex;
  gap: 26px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.guide-stats div {
  text-align: center;
}
.guide-stats b {
  display: block;
  font-family: var(--font-mono);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1.2;
}
.guide-stats span {
  font-size: 0.74rem;
  color: var(--text-muted);
  white-space: nowrap;
}

@media (max-width: 860px) {
  .stat-grid,
  .comp-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .guide-grid {
    grid-template-columns: 1fr;
  }
  .guide-stats {
    justify-content: space-between;
  }
}
@media (max-width: 560px) {
  .hero {
    min-height: auto;
    padding: 48px 0 64px;
  }
  .scroll-hint {
    display: none;
  }
  .stat-grid,
  .comp-grid {
    grid-template-columns: 1fr;
  }
  .hero-actions .btn {
    flex: 1 1 auto;
    justify-content: center;
  }
}
</style>
