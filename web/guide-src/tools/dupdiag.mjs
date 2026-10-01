// 같은 섹션 안에 완전히 같은 .diag 가 두 번 이상 들어간 곳을 찾는다 (조각 삽입 도구를 두 번 돌린 흔적)
// 사용: node guide-src/tools/dupdiag.mjs <가이드...>   · --fix 를 붙이면 두 번째 이후 사본을 지운다
// 블록 끝은 정규식이 아니라 <div> 균형으로 찾는다 — 안쪽 .cap 의 </div> 에서 끊으면
// 바깥 </div> 가 남아 pane 이 일찍 닫힌다 (2026-10 실제 사고).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const fix = process.argv.includes('--fix');
const guides = process.argv.slice(2).filter(a => !a.startsWith('--'));
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// start 위치의 <div ...> 가 닫히는 </div> 끝 위치
function blockEnd(s, start) {
  let depth = 0;
  const re = /<div\b|<\/div>/g;
  re.lastIndex = start;
  for (let m; (m = re.exec(s));) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) return m.index + 6;
  }
  return -1;
}

let total = 0;
for (const g of guides) {
  const dir = path.join(root, g, 'parts', 'panes');
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
    const file = path.join(dir, f);
    const src = fs.readFileSync(file, 'utf8');
    const cuts = [];
    for (const sec of src.matchAll(/<section class="sec" id="([^"]+)"[\s\S]*?<\/section>/g)) {
      const seen = new Set();
      for (const m of sec[0].matchAll(/<div class="diag\b[^"]*">/g)) {
        const a = sec.index + m.index, b = blockEnd(src, a);
        if (b < 0) continue;
        const key = src.slice(a, b).replace(/\s+/g, ' ');
        if (seen.has(key)) {
          total++; console.log(`${g}/${f} ${sec[1]} 중복 그림`);
          let a2 = a; while (a2 > 0 && /[ \t]/.test(src[a2 - 1])) a2--;
          cuts.push([a2, src[b] === '\n' ? b + 1 : b]);
        } else seen.add(key);
      }
    }
    if (fix && cuts.length) {
      let out = src;
      for (const [a, b] of cuts.sort((x, y) => y[0] - x[0])) out = out.slice(0, a) + out.slice(b);
      fs.writeFileSync(file, out);
    }
  }
}
console.log(total ? `✗ 중복 ${total}건${fix ? ' (제거함)' : ''}` : '✓ 중복 없음');
