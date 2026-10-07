<script setup lang="ts">
import { ref } from "vue";
import { timeline, projects, infra } from "@/data/career";
import SectionHeader from "@/components/SectionHeader.vue";
import AppIcon from "@/components/AppIcon.vue";

// 처음엔 맨 위 하나만 펼쳐 둔다 — 길어서 한 번에 다 열면 읽기 힘들다
const open = ref<Record<string, boolean>>(
  Object.fromEntries(projects.map((p, i) => [p.id, i === 0])),
);
function toggle(id: string) {
  open.value[id] = !open.value[id];
}
</script>

<template>
  <div class="page container">
    <SectionHeader
      eyebrow="career"
      title="일해 온 기록"
      desc="회사에서 맡아 온 서버와 배치를 정리했습니다. 제목을 누르면 어떤 문제가 있었고 어떻게 풀었는지 펼쳐집니다."
    />

    <!-- 타임라인 -->
    <section class="timeline">
      <div
        v-for="(t, i) in timeline"
        :key="t.title"
        v-reveal:left="i"
        class="tl-item"
        :class="{ hot: t.highlight }"
      >
        <div class="tl-dot"></div>
        <div class="tl-period">{{ t.period }}</div>
        <div class="tl-body">
          <div class="tl-title">{{ t.title }}</div>
          <div class="tl-role">{{ t.role }}</div>
        </div>
      </div>
    </section>

    <!-- 프로젝트 상세 -->
    <section class="sub">
      <h3 v-reveal class="sub-title">프로젝트</h3>
      <div class="proj-list">
        <article
          v-for="(p, i) in projects"
          :key="p.id"
          v-reveal="i % 3"
          class="proj card"
          :class="{ open: open[p.id] }"
        >
          <button
            class="proj-head"
            :aria-expanded="open[p.id]"
            @click="toggle(p.id)"
          >
            <span class="proj-no">{{ String(p.index).padStart(2, "0") }}</span>
            <span class="proj-headmain">
              <span class="proj-titlerow">
                <span class="proj-title">{{ p.title }}</span>
                <span v-if="p.featured" class="proj-badge">main</span>
              </span>
              <span class="proj-sub">{{ p.subtitle }}</span>
              <span class="proj-meta">{{ p.period }} · {{ p.role }}</span>
            </span>
            <span class="proj-chev"><AppIcon name="arrow" :size="18" /></span>
          </button>

          <div class="fold" :class="{ on: open[p.id] }" :inert="!open[p.id]">
          <div class="fold-in">
          <div class="proj-body">
            <div class="proj-stack">
              <span v-for="s in p.stack" :key="s" class="chip">{{ s }}</span>
            </div>
            <div class="proj-overview">
              <p v-for="(o, i) in p.overview" :key="i">{{ o }}</p>
            </div>
            <div class="proj-sections">
              <div v-for="sec in p.sections" :key="sec.heading" class="psec">
                <h5 class="psec-h">{{ sec.heading }}</h5>
                <ul class="psec-list">
                  <li v-for="(pt, i) in sec.points" :key="i">{{ pt }}</li>
                </ul>
              </div>
            </div>
            <div class="proj-outcome">
              <span class="po-label">결과</span>
              <p>{{ p.outcome }}</p>
            </div>
          </div>
          </div>
          </div>
        </article>
      </div>
    </section>

    <!-- 인프라 -->
    <section class="sub">
      <h3 v-reveal class="sub-title">곁들여 해 온 일</h3>
      <p v-reveal class="sub-lead">
        개발 업무 사이사이 꾸준히 손대 온 인프라와 도구 작업입니다.
      </p>

      <div class="infra-grid">
        <article v-for="(it, i) in infra" :key="it.title" v-reveal:scale="i % 2" v-tilt="4" class="infra card">
          <h4 class="infra-title">{{ it.title }}</h4>
          <p class="infra-desc">{{ it.desc }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.timeline {
  position: relative;
  margin-left: 8px;
  padding-left: 26px;
  border-left: 2px solid var(--border);
}
.tl-item {
  position: relative;
  padding: 12px 0 12px 6px;
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 18px;
  align-items: baseline;
}
.tl-dot {
  position: absolute;
  left: -34px;
  top: 18px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--surface);
  border: 2.5px solid var(--border-strong);
}
.tl-item.hot .tl-dot {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
.tl-period {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
}
.tl-title {
  font-weight: 700;
  font-size: 0.98rem;
}
.tl-item.hot .tl-title {
  color: var(--accent);
}
.tl-role {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-top: 2px;
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
.sub-lead {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-top: -8px;
  margin-bottom: 22px;
}

.proj-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}
.proj {
  overflow: hidden;
  min-width: 0;
  max-width: 100%;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}
.proj.open {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
}
.proj-head {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 22px;
  background: transparent;
  border: none;
  text-align: left;
}
.proj-no {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent);
  padding-top: 2px;
}
.proj-headmain {
  flex: 1;
  min-width: 0;
}
.proj-titlerow {
  display: flex;
  align-items: center;
  gap: 9px;
}
.proj-title {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.proj-badge {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 5px;
  background: var(--accent);
  color: var(--accent-contrast);
}
.proj-sub {
  display: block;
  margin-top: 3px;
  color: var(--text-secondary);
  font-size: 0.92rem;
  font-weight: 500;
}
.proj-meta {
  display: block;
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-family: var(--font-mono);
}
.proj-chev {
  flex-shrink: 0;
  color: var(--text-muted);
  transform: rotate(90deg);
  transition: transform 0.25s ease;
  padding-top: 3px;
}
.proj.open .proj-chev {
  transform: rotate(-90deg);
  color: var(--accent);
}
.proj-body {
  padding: 0 22px 24px;
}
.proj-head:hover .proj-title {
  color: var(--accent);
}
.proj-title {
  transition: color 0.2s ease;
}
.tl-item.hot .tl-dot::after {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1px solid var(--accent);
  animation: ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@keyframes ping {
  0% {
    transform: scale(0.6);
    opacity: 0.8;
  }
  80%,
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}
.proj-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px 0 18px;
  border-top: 1px solid var(--border);
  padding-top: 18px;
}
.proj-overview p {
  color: var(--text-secondary);
  font-size: 0.92rem;
  line-height: 1.7;
}
.proj-overview p + p {
  margin-top: 8px;
}
.proj-sections {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.psec-h {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 8px;
}
.psec-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.psec-list li {
  position: relative;
  padding-left: 16px;
  color: var(--text-secondary);
  font-size: 0.89rem;
  line-height: 1.62;
}
.psec-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 9px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--border-strong);
}
.proj-outcome {
  margin-top: 20px;
  padding: 15px 18px;
  border-radius: var(--radius-sm);
  background: var(--accent-soft);
  border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
}
.po-label {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 5px;
}
.proj-outcome p {
  font-size: 0.9rem;
  line-height: 1.65;
  color: var(--text);
}

.infra-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: stretch;
}
.infra {
  padding: 22px 24px;
  height: 100%;
}
.infra-title {
  font-size: 1.02rem;
  font-weight: 700;
  margin-bottom: 8px;
}
.infra-title::before {
  content: "›";
  color: var(--accent);
  margin-right: 7px;
  font-weight: 800;
}
.infra-desc {
  color: var(--text-muted);
  font-size: 0.88rem;
  line-height: 1.65;
}

@media (max-width: 720px) {
  .tl-item {
    grid-template-columns: 1fr;
    gap: 2px;
  }
  .infra-grid {
    grid-template-columns: 1fr;
  }
  .proj-head {
    padding: 18px 16px;
    gap: 12px;
  }
  .proj-body {
    padding: 0 16px 20px;
  }
}
</style>
