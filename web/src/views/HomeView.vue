<script setup lang="ts">
import { profile, achievements, links } from '@/data/profile'
import { competencies } from '@/data/skills'
import AppIcon from '@/components/AppIcon.vue'
</script>

<template>
  <!-- HERO -->
  <section class="hero">
    <div class="container hero-inner">
      <div class="hero-glow" aria-hidden="true"></div>
      <span class="eyebrow">Backend Engineer · {{ profile.years }}년차</span>
      <h1 class="hero-title">
        전자고지·대용량 발송/배치 도메인을<br />
        <span class="accent">5년간 설계·개발·운영</span>했습니다.
      </h1>
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
      <h2 class="section-title">숫자로 증명하는 핵심 성과</h2>
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
</template>

<style scoped>
.hero {
  position: relative;
  padding: 84px 0 60px;
  overflow: hidden;
}
.hero-inner {
  position: relative;
}
.hero-glow {
  position: absolute;
  top: -160px;
  left: 50%;
  transform: translateX(-50%);
  width: 640px;
  height: 380px;
  background: radial-gradient(ellipse at center, var(--accent-soft), transparent 70%);
  filter: blur(30px);
  opacity: 0.9;
  pointer-events: none;
  z-index: -1;
}
.hero-title {
  margin-top: 16px;
  font-size: clamp(1.9rem, 5vw, 3.1rem);
  font-weight: 800;
  line-height: 1.16;
  letter-spacing: -0.035em;
}
.hero-title .accent {
  color: var(--accent);
}
.hero-sub {
  margin-top: 20px;
  max-width: 620px;
  font-size: 1.08rem;
  color: var(--text-secondary);
  line-height: 1.65;
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
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
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
}
.stat {
  padding: 22px 22px 24px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.stat:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-strong);
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
}
.comp {
  padding: 24px 22px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.comp:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-strong);
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
  margin-top: 28px;
  display: flex;
  justify-content: center;
}

@media (max-width: 860px) {
  .stat-grid,
  .comp-grid {
    grid-template-columns: repeat(2, 1fr);
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
