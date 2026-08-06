<script setup lang="ts">
import { profile, achievements, links } from '@/data/profile'
import { competencies } from '@/data/skills'
import { guides } from '@/router'
import AppIcon from '@/components/AppIcon.vue'
</script>

<template>
  <!-- HERO -->
  <section class="hero">
    <div class="container hero-inner">
      <div class="term-line">
        <span class="term-prompt">black-astro@backend</span><span class="term-sep">:</span><span class="term-path">~</span><span class="term-sep">$</span>
        <span class="term-cmd">whoami</span>
      </div>
      <h1 class="hero-title">
        김현우<span class="hero-role"> — Backend Engineer</span><span class="cursor" aria-hidden="true">▊</span>
      </h1>
      <p class="hero-line">
        전자고지·대용량 발송/배치 도메인을 <span class="accent">5년간 설계·개발·운영</span>했습니다.
      </p>
      <p class="hero-sub">{{ profile.subHeadline }}</p>

      <div class="hero-meta">
        <span class="chip">{{ profile.company }} · {{ profile.companyDesc }}</span>
        <span class="chip">{{ profile.tenure }}</span>
        <span class="chip">{{ profile.domain }}</span>
      </div>

      <div class="hero-actions">
        <RouterLink to="/portfolio" class="btn btn-primary">
          포트폴리오 보기 <AppIcon name="arrow" :size="17" />
        </RouterLink>
        <RouterLink to="/career" class="btn btn-ghost">경력 상세</RouterLink>
        <a v-for="l in links" :key="l.label" :href="l.href" class="btn btn-icon" target="_blank" rel="noopener" :title="l.value">
          <AppIcon :name="l.icon" :size="18" />
        </a>
      </div>
    </div>
  </section>

  <!-- 핵심 성과 -->
  <section class="container block">
    <div class="block-head">
      <span class="eyebrow">Key Results</span>
      <h2 class="section-title">여러 도메인에서 증명한 핵심 성과</h2>
    </div>
    <div class="stat-grid">
      <article v-for="a in achievements" :key="a.label" class="stat card">
        <div class="stat-metric">
          {{ a.metric }}<span v-if="a.unit" class="stat-unit">{{ a.unit }}</span>
        </div>
        <div class="stat-label">{{ a.label }}</div>
        <p class="stat-detail">{{ a.detail }}</p>
      </article>
    </div>
  </section>

  <!-- 핵심 역량 -->
  <section class="container block">
    <div class="block-head">
      <span class="eyebrow">Core Competency</span>
      <h2 class="section-title">무엇을 잘하는가</h2>
    </div>
    <div class="comp-grid">
      <article v-for="c in competencies" :key="c.title" class="comp card">
        <div class="comp-icon"><AppIcon :name="c.icon" :size="20" /></div>
        <h3 class="comp-title">{{ c.title }}</h3>
        <p class="comp-desc">{{ c.desc }}</p>
      </article>
    </div>
    <div class="home-cta">
      <RouterLink to="/about" class="btn btn-ghost">전체 역량·기술 스택 <AppIcon name="arrow" :size="16" /></RouterLink>
    </div>
  </section>

  <!-- 학습 가이드 — 푸터의 '학습 가이드' 링크가 여기로 데려온다 -->
  <section id="guides" class="container block">
    <div class="block-head">
      <span class="eyebrow">Side Project</span>
      <h2 class="section-title">직접 만든 학습 자료</h2>
    </div>
    <div class="guide-grid">
      <a v-for="g in guides" :key="g.key" :href="g.href" class="guide card" :title="g.title">
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
            <b>{{ st.value }}</b><span>{{ st.label }}</span>
          </div>
        </div>
      </a>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding: 72px 0 56px;
}
.hero-inner {
  position: relative;
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
  font-size: clamp(2rem, 5.4vw, 3.2rem);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.035em;
}
.hero-role {
  color: var(--text-muted);
  font-weight: 700;
}
.cursor {
  color: var(--accent);
  font-weight: 400;
  margin-left: 2px;
  animation: blink 1.1s step-end infinite;
}
.hero-line {
  margin-top: 18px;
  font-size: clamp(1.15rem, 2.6vw, 1.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.4;
}
.hero-line .accent {
  color: var(--accent);
}
.hero-sub {
  margin-top: 16px;
  max-width: 620px;
  font-size: 1.04rem;
  color: var(--text-secondary);
  line-height: 1.66;
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
  transition: all 0.2s ease;
}
.btn-primary {
  background: var(--accent);
  color: var(--accent-contrast);
}
.btn-primary:hover {
  background: var(--accent-hover);
}
.btn-ghost {
  border-color: var(--border-strong);
  color: var(--text);
  background: var(--surface);
}
.btn-ghost:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.btn-icon {
  padding: 11px;
  border-color: var(--border-strong);
  color: var(--text-secondary);
  background: var(--surface);
}
.btn-icon:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.block {
  padding-top: 64px;
}
.block:last-of-type {
  padding-bottom: 84px;
}
.block-head {
  margin-bottom: 26px;
}
.block-head .eyebrow {
  display: block;
  margin-bottom: 9px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: stretch;
}
.stat {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 22px 22px 24px;
  transition: border-color 0.2s ease;
}
.stat:hover {
  border-color: var(--accent);
}
.stat-metric {
  font-family: var(--font-mono);
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.stat-unit {
  font-size: 0.95rem;
  margin-left: 3px;
  color: var(--text-muted);
}
.stat-label {
  margin-top: 8px;
  font-weight: 700;
  font-size: 0.98rem;
}
.stat-detail {
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1.55;
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
  transition: border-color 0.2s ease;
}
.comp:hover {
  border-color: var(--accent);
}
.comp-icon {
  display: inline-flex;
  padding: 10px;
  border-radius: 11px;
  background: var(--accent-soft);
  color: var(--accent);
  margin-bottom: 14px;
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

/* 학습 가이드 진입 카드 — 가이드 수가 늘어도 폭에 맞춰 알아서 접힙니다 */
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
  transition: border-color 0.2s ease, transform 0.2s ease;
}
.guide:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
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
.guide-desc strong {
  color: var(--text-secondary);
  font-weight: 700;
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
    padding: 56px 0 40px;
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
