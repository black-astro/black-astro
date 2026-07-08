<script setup lang="ts">
import { growthIntro, learningProjects, roadmap } from '@/data/growth'
import SectionHeader from '@/components/SectionHeader.vue'
import AppIcon from '@/components/AppIcon.vue'
</script>

<template>
  <div class="page container">
    <SectionHeader eyebrow="Growth" title="성장 로드맵" :desc="growthIntro" />

    <!-- 학습 프로젝트 -->
    <section>
      <h3 class="sub-title">진행 중인 학습 프로젝트</h3>
      <div class="learn-grid">
        <article v-for="l in learningProjects" :key="l.name" class="learn card">
          <div class="learn-head">
            <span class="learn-name">{{ l.name }}</span>
            <span class="learn-status">{{ l.status }}</span>
          </div>
          <p class="learn-goal">{{ l.goal }}</p>
          <div class="learn-stack">
            <span v-for="s in l.stack" :key="s" class="chip">{{ s }}</span>
          </div>
          <ul class="learn-points">
            <li v-for="(p, i) in l.points" :key="i">{{ p }}</li>
          </ul>
        </article>
      </div>
    </section>

    <!-- 로드맵 -->
    <section class="sub">
      <h3 class="sub-title">다음 목표</h3>
      <div class="road-grid">
        <article v-for="r in roadmap" :key="r.title" class="road card">
          <div class="road-head">
            <div class="road-ic"><AppIcon :name="r.icon" :size="19" /></div>
            <h4 class="road-title">{{ r.title }}</h4>
          </div>
          <ul class="road-list">
            <li v-for="(it, i) in r.items" :key="i">
              <AppIcon name="check" :size="15" class="rl-check" />
              <span>{{ it }}</span>
            </li>
          </ul>
        </article>
      </div>
    </section>

    <p class="growth-note">
      대용량·DB·동시성·운영·레거시 현대화는 실무 코드로 증명된 강점입니다. 여기에 실시간 트래픽 설계 · 알고리즘 · 관측성을
      더해 대규모 시스템 설계로 역량을 확장하고 있습니다.
    </p>
  </div>
</template>

<style scoped>
.sub {
  margin-top: 56px;
}
.sub-title {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 22px;
}

.learn-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.learn {
  padding: 22px 22px 24px;
  display: flex;
  flex-direction: column;
}
.learn-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.learn-name {
  font-family: var(--font-mono);
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--accent);
}
.learn-status {
  font-size: 0.7rem;
  font-weight: 700;
  font-family: var(--font-mono);
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
}
.learn-goal {
  margin-top: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
}
.learn-stack {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.learn-points {
  margin-top: 16px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.learn-points li {
  position: relative;
  padding-left: 15px;
  font-size: 0.83rem;
  color: var(--text-muted);
  line-height: 1.55;
}
.learn-points li::before {
  content: '';
  position: absolute;
  left: 1px;
  top: 8px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--border-strong);
}

.road-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.road {
  padding: 22px 24px;
}
.road-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.road-ic {
  display: inline-flex;
  padding: 9px;
  border-radius: 10px;
  background: var(--accent-soft);
  color: var(--accent);
}
.road-title {
  font-size: 1.05rem;
  font-weight: 700;
}
.road-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.road-list li {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  font-size: 0.89rem;
  color: var(--text-secondary);
  line-height: 1.55;
}
.rl-check {
  flex-shrink: 0;
  margin-top: 3px;
  color: var(--accent);
}

.growth-note {
  margin-top: 44px;
  padding: 20px 24px;
  border-radius: var(--radius);
  background: var(--accent-soft);
  border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text);
}

@media (max-width: 860px) {
  .learn-grid {
    grid-template-columns: 1fr;
  }
  .road-grid {
    grid-template-columns: 1fr;
  }
}
</style>
