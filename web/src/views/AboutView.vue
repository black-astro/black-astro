<script setup lang="ts">
import { profile, links } from '@/data/profile'
import { competencies, skillGroups } from '@/data/skills'
import SectionHeader from '@/components/SectionHeader.vue'
import AppIcon from '@/components/AppIcon.vue'

const facts = [
  { k: 'name', v: profile.name },
  { k: 'role', v: `${profile.roleKo} · ${profile.years}년차` },
  { k: 'work', v: `${profile.company} — ${profile.companyDesc}` },
  { k: 'since', v: profile.tenure },
  { k: 'domain', v: profile.domain },
]
</script>

<template>
  <div class="page container">
    <SectionHeader eyebrow="about" title="어떤 개발자인지" :desc="profile.headline" />

    <div class="about-grid">
      <!-- 소개글 -->
      <div v-reveal:left class="about-intro card">
        <p v-for="(para, i) in profile.intro" :key="i">
          <template v-for="(line, j) in para" :key="j">{{ line }}<template v-if="j < para.length - 1"> <wbr></template></template>
        </p>
      </div>
      <!-- 인적사항 + 링크 -->
      <aside v-reveal:right="1" class="about-side">
        <div class="fact card">
          <dl>
            <div v-for="f in facts" :key="f.k" class="fact-row">
              <dt>{{ f.k }}</dt>
              <dd>{{ f.v }}</dd>
            </div>
          </dl>
        </div>
        <div class="side-links">
          <a v-for="l in links" :key="l.label" v-tilt="3" :href="l.href" class="side-link card" target="_blank" rel="noopener">
            <AppIcon :name="l.icon" :size="18" />
            <span class="sl-text">
              <span class="sl-label">{{ l.label }}</span>
              <span class="sl-value">{{ l.value }}</span>
            </span>
            <AppIcon name="external" :size="15" class="sl-ext" />
          </a>
        </div>
      </aside>
    </div>

    <!-- 핵심 역량 -->
    <section class="sub">
      <h3 v-reveal class="sub-title"><AppIcon name="award" :size="20" class="sub-ic" />잘하는 것</h3>
      <div class="comp-list">
        <article v-for="(c, i) in competencies" :key="c.title" v-reveal="i % 2" v-tilt="4" class="comp-item card">
          <div class="comp-ic"><AppIcon :name="c.icon" :size="19" /></div>
          <div>
            <h4>{{ c.title }}</h4>
            <p>{{ c.desc }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- 보유 기술 -->
    <section class="sub">
      <h3 v-reveal class="sub-title"><AppIcon name="settings" :size="20" class="sub-ic" />쓰는 도구</h3>
      <div class="skill-groups">
        <div v-for="(g, i) in skillGroups" :key="g.category" v-reveal:scale="i % 2" v-tilt="3" class="skill-group card">
          <div class="sg-cat">{{ g.category }}</div>
          <div class="sg-items">
            <span v-for="it in g.items" :key="it" class="chip">{{ it }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-grid {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: 18px;
  align-items: stretch;
}
.about-intro {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  padding: 28px 30px;
  font-size: 1.02rem;
  line-height: 1.8;
}
.about-intro p {
  color: var(--text);
}
.about-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
}
.side-links {
  margin-top: auto;
}
.fact {
  padding: 20px 22px;
}
.fact-row {
  display: flex;
  gap: 14px;
  padding: 9px 0;
  border-bottom: 1px solid var(--border);
}
.fact-row:last-child {
  border-bottom: none;
}
.fact-row dt {
  flex-shrink: 0;
  width: 52px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-muted);
  padding-top: 2px;
}
.fact-row dd {
  font-size: 0.9rem;
  font-weight: 500;
}
.side-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.side-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  color: var(--text-secondary);
  transition: all 0.18s ease;
}
.side-link:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.sl-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.sl-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.sl-value {
  font-size: 0.9rem;
  font-weight: 600;
}
.sl-ext {
  margin-left: auto;
  opacity: 0.6;
}

.sub {
  margin-top: 56px;
}
.sub-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 22px;
}
.sub-ic {
  flex-shrink: 0;
  color: var(--accent);
}
.comp-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: stretch;
}
.comp-item {
  display: flex;
  gap: 14px;
  padding: 20px 22px;
  height: 100%;
}
.comp-ic {
  flex-shrink: 0;
  display: inline-flex;
  align-items: flex-start;
  padding: 9px;
  height: fit-content;
  border-radius: 10px;
  background: var(--accent-soft);
  color: var(--accent);
}
.comp-item h4 {
  font-size: 0.98rem;
  font-weight: 700;
}
.comp-item p {
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 0.85rem;
  line-height: 1.55;
}

.skill-groups {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: stretch;
}
.skill-group {
  padding: 18px 20px;
  height: 100%;
}
.sg-cat {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 12px;
}
.sg-items {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.sg-items .chip {
  transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}
.sg-items .chip:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-1px);
}

@media (max-width: 820px) {
  .about-grid,
  .comp-list,
  .skill-groups {
    grid-template-columns: 1fr;
  }
}
</style>
