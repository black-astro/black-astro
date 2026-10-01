// web/ 에서 실행 — verify.mjs 출력(섹션·탭 수)으로 src/router/index.ts 의 stats 를 맞춘다
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const out = execSync('node guide-src/verify.mjs', { encoding: 'utf8' });
const f = 'src/router/index.ts';
let s = fs.readFileSync(f, 'utf8');
for (const m of out.matchAll(/✓ ([\w-]+)-web\s+섹션 (\d+) · 탭 (\d+)/g)) {
  const [, key, secs, tabs] = m;
  const st = s.indexOf(`key: '${key}',`);
  if (st < 0) { console.log('라우터에 없음', key); continue; }
  const en = s.indexOf('stats: [', st), close = s.indexOf(']', en);
  let block = s.slice(en, close);
  block = block.replace(/value: '\d+', label: '주제 탭'/, `value: '${tabs}', label: '주제 탭'`)
               .replace(/value: '\d+', label: '섹션'/, `value: '${secs}', label: '섹션'`);
  s = s.slice(0, en) + block + s.slice(close);
  console.log(key, tabs, secs);
}
fs.writeFileSync(f, s);
