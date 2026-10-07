<script setup lang="ts">
import { ref } from 'vue'
import { provenFive, caseStudies, capabilityMap } from '@/data/portfolio'
import SectionHeader from '@/components/SectionHeader.vue'
import CountUp from '@/components/CountUp.vue'

// 본문은 첫 글만 펼쳐 두고 나머지는 눌러서 연다
const open = ref<Record<string, boolean>>(Object.fromEntries(caseStudies.map((c, i) => [c.id, i === 0])))
const toggle = (id: string) => (open.value[id] = !open.value[id])
</script>

<template>
  <div class="page container">
    <SectionHeader
      eyebrow="notes"
      title="문제 해결 노트"
      desc="실제로 겪은 문제를 하나씩 풀어 쓴 기록입니다. 수치에는 측정한 환경을 같이 적었고, 예시 SQL은 실제 구현을 바탕으로 다시 쓰면서 이름을 일반화했습니다."
    />

    <!-- 요약 -->
    <div class="proven">
      <article v-for="(p, i) in provenFive" :key="p.no" v-reveal:scale="i" v-tilt="5" class="pv card">
        <div class="pv-no">{{ String(p.no).padStart(2, '0') }}</div>
        <h3 class="pv-title">{{ p.title }}</h3>
        <p class="pv-desc">{{ p.desc }}</p>
      </article>
    </div>

    <!-- 케이스 -->
    <section class="cases">
      <article v-for="c in caseStudies" :key="c.id" v-reveal class="case card" :class="{ open: open[c.id] }">
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
            <div class="cm-val"><CountUp :value="m.value" /></div>
            <div class="cm-label">{{ m.label }}</div>
          </div>
        </div>

        <button class="case-toggle" :aria-expanded="!!open[c.id]" @click="toggle(c.id)">
          <span>{{ open[c.id] ? '접기' : '과정 읽기' }}</span>
          <span class="ct-chev" aria-hidden="true">›</span>
        </button>

        <div class="fold" :class="{ on: open[c.id] }" :inert="!open[c.id]">
          <div class="fold-in">
            <div class="case-blocks">
              <div v-for="(b, i) in c.blocks" :key="i" class="cb">
                <h4 v-if="b.heading" class="cb-h">{{ b.heading }}</h4>
                <p v-if="b.type === 'text'" class="cb-text">{{ b.content }}</p>
                <pre v-else-if="b.type === 'code'" class="code"><code>{{ b.content }}</code></pre>
                <pre v-else class="diagram">{{ b.content }}</pre>
              </div>
            </div>

            <div class="case-learned">
              <span class="cl-label">돌아보면</span>
              <p>{{ c.learned }}</p>
            </div>
          </div>
        </div>
      </article>
    </section>

    <!-- 어디서 무엇을 -->
    <section class="sub">
      <h3 v-reveal class="sub-title">어떤 경험이 어디에 있는지</h3>
      <div v-reveal class="map card">
        <div v-for="m in capabilityMap" :key="m.capability" class="map-row">
          <div class="map-cap">{{ m.capability }}</div>
          <div class="map-proj">{{ m.projects }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.case-toggle {
  margin-top: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-strong);
  background: var(--surface-2);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: border-color 0.2s ease, color 0.2s ease;
}
.case-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.ct-chev {
  display: inline-block;
  transition: transform 0.3s ease;
}
.case.open .ct-chev {
  transform: rotate(90deg);
}
.map-row {
  transition: background 0.2s ease;
}
.map-row:hover {
  background: var(--surface-2);
}
.proven {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;
  margin-bottom: 48px;
  align-items: stretch;
}
.pv {
  display: flex;
  flex-direction: column;
  height: 100%;
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

@media (max-width: 640px) {
  .case {
    padding: 22px 18px;
  }
  .proven {
    grid-template-columns: 1fr 1fr;
  }
  .map-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
