// 브라우저 없이 하는 탭 스모크 — 빌드 산출물의 정합성을 정적으로 확인
//  · 탭 버튼 data-t ↔ pane id ↔ navset data-nav ↔ TAB_LABEL ↔ TAB_ORDER
//  · 모든 섹션 id 가 SEC_LV · EZ · CAP · SEC_KW · navset 링크에 있는지
import fs from 'node:fs';

const file = process.argv[2];
const h = fs.readFileSync(file, 'utf8');
let bad = 0;
const fail = m => { console.log('✗ ' + m); bad++; };

const tabs = [...new Set([...h.matchAll(/<button[^>]*data-t="([a-z-]+)"/g)].map(m => m[1]))];
const panes = [...h.matchAll(/<div class="pane(?: on)?" id="pane-([a-z-]+)"/g)].map(m => m[1]);
const navs = [...h.matchAll(/<div class="navset(?: on)?" data-nav="([a-z-]+)"/g)].map(m => m[1]);
const labels = Object.keys(Object.fromEntries(
  [...(h.match(/const TAB_LABEL = \{([\s\S]*?)\n\};/) || [, ''])[1].matchAll(/^\s*([a-z]+)\s*:/gm)].map(m => [m[1], 1])));
const order = ((h.match(/const TAB_ORDER = \[([^\]]*)\]/) || [, ''])[1].match(/"([a-z-]+)"/g) || []).map(s => s.replace(/"/g, ''));

console.log(`탭 ${tabs.length} · pane ${panes.length} · navset ${navs.length} · TAB_LABEL ${labels.length} · TAB_ORDER ${order.length}`);
for (const t of tabs) {
  if (!panes.includes(t)) fail(`탭 "${t}" 에 대응하는 pane-${t} 없음`);
  if (!navs.includes(t)) fail(`탭 "${t}" 에 대응하는 navset 없음`);
  if (!labels.includes(t)) fail(`탭 "${t}" 가 TAB_LABEL 에 없음`);
}
for (const p of panes) if (!tabs.includes(p)) fail(`pane-${p} 에 대응하는 탭 버튼 없음`);
for (const o of order) if (!tabs.includes(o)) fail(`TAB_ORDER 의 "${o}" 가 탭에 없음`);

// on 상태는 정확히 하나씩
const onPane = (h.match(/<div class="pane on" id="pane-([a-z-]+)"/g) || []);
const onNav = (h.match(/<div class="navset on" data-nav="([a-z-]+)"/g) || []);
if (onPane.length !== 1) fail(`기본 pane 이 ${onPane.length}개 (1개여야 함)`);
if (onNav.length !== 1) fail(`기본 navset 이 ${onNav.length}개 (1개여야 함)`);
if (onPane.length === 1 && onNav.length === 1) {
  const a = onPane[0].match(/pane-([a-z-]+)/)[1], b = onNav[0].match(/data-nav="([a-z-]+)"/)[1];
  if (a !== b) fail(`기본 pane(${a}) 과 기본 navset(${b}) 이 다름`);
}

// 섹션 등록
const secs = [...h.matchAll(/<section class="sec" id="([a-z0-9]+)"/g)].map(m => m[1]);
const grab = re => new Set([...((h.match(re) || [, ''])[1] || '').matchAll(/(?:^|[\s{,])([a-z]+[0-9]+)\s*:/g)].map(m => m[1]));
const lv = grab(/const SEC_LV = \{([\s\S]*?)\n\};/);
const ez = grab(/const EZ = \{([\s\S]*?)\n\};/);
const cap = grab(/const CAP = \{([\s\S]*?)\n\};/);
const kw = grab(/const SEC_KW = \{([\s\S]*?)\n\};/);
const navLinks = new Set([...h.matchAll(/<a href="#([a-z0-9]+)"><em>/g)].map(m => m[1]));

const miss = (set, name) => {
  const m = secs.filter(s => !set.has(s));
  if (m.length) console.log(`· ${name} 누락 ${m.length}개: ${m.slice(0, 12).join(' ')}${m.length > 12 ? ' ...' : ''}`);
  return m.length;
};
console.log(`섹션 ${secs.length}개`);
miss(lv, 'SEC_LV'); miss(ez, 'EZ'); miss(cap, 'CAP'); miss(kw, 'SEC_KW');
if (miss(navLinks, '사이드바 링크')) bad++;

console.log(bad === 0 ? '✓ 스모크 통과' : `✗ ${bad}건`);
