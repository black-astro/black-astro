<script setup lang="ts">
import { ossProjects, ossNote } from '@/data/oss'
import SectionHeader from '@/components/SectionHeader.vue'
import AppIcon from '@/components/AppIcon.vue'
</script>

<template>
  <div class="page container">
    <SectionHeader
      eyebrow="Open Source"
      title="오픈소스 활동"
      desc="필요한 도구는 직접 만들어 공개합니다. Spring Boot Starter를 Maven Central에 정식 배포하고, CLI·데스크톱 도구를 npm·PyInstaller로 배포했습니다."
    />

    <div class="oss-list">
      <article v-for="o in ossProjects" :key="o.name" class="oss card" :class="{ featured: o.featured }">
        <div class="oss-main">
          <header class="oss-head">
            <div class="oss-titlewrap">
              <h3 class="oss-name">
                <span class="oss-mark">{{ o.name }}</span>
              </h3>
              <span class="oss-lang">{{ o.lang }}</span>
            </div>
            <a :href="o.repo" class="oss-repo" target="_blank" rel="noopener" title="GitHub에서 보기">
              <AppIcon name="github" :size="18" />
            </a>
          </header>

          <p class="oss-tagline">{{ o.tagline }}</p>

          <div class="oss-badges">
            <span v-for="b in o.badges" :key="b.label" class="badge" :class="b.kind">{{ b.label }}</span>
          </div>

          <p class="oss-desc">{{ o.desc }}</p>

          <ul class="oss-points">
            <li v-for="(p, i) in o.points" :key="i">{{ p }}</li>
          </ul>

          <pre v-if="o.install" class="code oss-install"><code>{{ o.install.code }}</code></pre>
        </div>
      </article>
    </div>

    <p class="oss-note">{{ ossNote }}</p>
  </div>
</template>

<style scoped>
.oss-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.oss {
  padding: 26px 28px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.oss:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
}
.oss.featured {
  border-color: color-mix(in srgb, var(--accent) 40%, var(--border));
  box-shadow: 0 0 0 1px var(--accent-soft);
}
.oss-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.oss-titlewrap {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.oss-name {
  font-size: 1.3rem;
  font-weight: 800;
}
.oss-mark {
  font-family: var(--font-mono);
  color: var(--accent);
}
.oss-lang {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-muted);
}
.oss-repo {
  display: inline-flex;
  padding: 9px;
  border-radius: 9px;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  transition: all 0.18s ease;
}
.oss-repo:hover {
  color: var(--accent);
  border-color: var(--accent);
}
.oss-tagline {
  margin-top: 6px;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
}
.oss-badges {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.badge {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  background: var(--surface-2);
}
.badge.primary {
  background: var(--accent);
  color: var(--accent-contrast);
  border-color: var(--accent);
}
.oss-desc {
  margin-top: 16px;
  color: var(--text-secondary);
  font-size: 0.92rem;
  line-height: 1.7;
}
.oss-points {
  margin-top: 14px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.oss-points li {
  position: relative;
  padding-left: 18px;
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.6;
}
.oss-points li::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 9px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
}
.oss-install {
  margin-top: 18px;
}
.oss-note {
  margin-top: 24px;
  padding: 16px 20px;
  border-radius: var(--radius-sm);
  border: 1px dashed var(--border-strong);
  color: var(--text-muted);
  font-size: 0.86rem;
  line-height: 1.6;
}

@media (max-width: 560px) {
  .oss {
    padding: 22px 18px;
  }
}
</style>
