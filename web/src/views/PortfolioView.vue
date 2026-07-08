<script setup lang="ts">
import { provenFive, caseStudies, capabilityMap } from '@/data/portfolio'
import SectionHeader from '@/components/SectionHeader.vue'
</script>

<template>
  <div class="page container">
    <SectionHeader
      eyebrow="Portfolio"
      title="케이스 스터디"
      desc="화면보다 대용량 처리 · DB/SQL 튜닝 · 인증 설계 · 운영 안정성 · 품질 자동화의 기술 검증에 초점을 둔 모음입니다. 성능 수치는 운영 실측, 예시 SQL은 실 구현 기반 재구성이며 식별자는 일반화했습니다."
    />

    <!-- 증명하는 5가지 -->
    <div class="proven">
      <article v-for="p in provenFive" :key="p.no" class="pv card">
        <div class="pv-no">{{ String(p.no).padStart(2, '0') }}</div>
        <h3 class="pv-title">{{ p.title }}</h3>
        <p class="pv-desc">{{ p.desc }}</p>
      </article>
    </div>

    <!-- 케이스 스터디 -->
    <section class="cases">
      <article v-for="c in caseStudies" :key="c.id" class="case card">
        <header class="case-head">
          <span class="case-tag">{{ c.tag }}</span>
          <h3 class="case-title">{{ c.title }}</h3>
          <p class="case-summary">{{ c.summary }}</p>
          <div class="case-stack">
            <span v-for="s in c.stack" :key="s" class="chip">{{ s }}</span>
          </div>
        </header>

        <div class="case-metrics">
          <div v-for="m in c.metrics" :key="m.label" class="cm">
            <div class="cm-val">{{ m.value }}</div>
            <div class="cm-label">{{ m.label }}</div>
          </div>
        </div>

        <div class="case-blocks">
          <div v-for="(b, i) in c.blocks" :key="i" class="cb">
            <h4 v-if="b.heading" class="cb-h">{{ b.heading }}</h4>
            <p v-if="b.type === 'text'" class="cb-text">{{ b.content }}</p>
            <pre v-else-if="b.type === 'code'" class="code"><code>{{ b.content }}</code></pre>
            <pre v-else class="diagram">{{ b.content }}</pre>
          </div>
        </div>

        <div class="case-learned">
          <span class="cl-label">배운 점</span>
          <p>{{ c.learned }}</p>
        </div>
      </article>
    </section>

    <!-- 역량 ↔ 프로젝트 매핑 -->
    <section class="sub">
      <h3 class="sub-title">역량 ↔ 프로젝트 매핑</h3>
      <div class="map card">
        <div v-for="m in capabilityMap" :key="m.capability" class="map-row">
          <div class="map-cap">{{ m.capability }}</div>
          <div class="map-proj">{{ m.projects }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.proven {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 48px;
}
.pv {
  padding: 20px 18px;
}
.pv-no {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
}
.pv-title {
  margin-top: 8px;
  font-size: 0.98rem;
  font-weight: 700;
}
.pv-desc {
  margin-top: 7px;
  color: var(--text-muted);
  font-size: 0.8rem;
  line-height: 1.5;
}

.cases {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.case {
  padding: 28px 30px 26px;
}
.case-tag {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent);
  padding: 3px 10px;
  border-radius: 6px;
  background: var(--accent-soft);
}
.case-title {
  margin-top: 12px;
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.25;
}
.case-summary {
  margin-top: 10px;
  color: var(--text-secondary);
  font-size: 0.96rem;
  line-height: 1.65;
  max-width: 760px;
}
.case-stack {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.case-metrics {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.cm {
  flex: 1 1 120px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  border: 1px solid var(--border);
}
.cm-val {
  font-family: var(--font-mono);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: -0.02em;
}
.cm-label {
  margin-top: 3px;
  font-size: 0.8rem;
  color: var(--text-muted);
}
.case-blocks {
  margin-top: 26px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.cb-h {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--text);
}
.cb-h::before {
  content: '▹';
  color: var(--accent);
  margin-right: 7px;
}
.cb-text {
  color: var(--text-secondary);
  font-size: 0.91rem;
  line-height: 1.72;
}
pre.code code {
  font-family: inherit;
}
.case-learned {
  margin-top: 24px;
  padding: 16px 20px;
  border-radius: var(--radius-sm);
  border: 1px dashed var(--border-strong);
  background: var(--surface-2);
}
.cl-label {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 6px;
}
.case-learned p {
  font-size: 0.9rem;
  line-height: 1.68;
  color: var(--text-secondary);
}

.sub {
  margin-top: 60px;
}
.sub-title {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 20px;
}
.map {
  overflow: hidden;
}
.map-row {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 18px;
  padding: 14px 22px;
  border-bottom: 1px solid var(--border);
}
.map-row:last-child {
  border-bottom: none;
}
.map-cap {
  font-weight: 600;
  font-size: 0.9rem;
}
.map-proj {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .proven {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .case {
    padding: 22px 18px;
  }
  .proven {
    grid-template-columns: 1fr;
  }
  .map-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
