// 사용: node ins.mjs <pane파일> <조각파일>
// 조각파일 형식: 여러 블록을 "@@sec:<섹션id>" 줄로 구분. 각 블록은 그 섹션 </section> 직전에 삽입.
import fs from 'fs';
const [pane, frag] = process.argv.slice(2);
let html = fs.readFileSync(pane, 'utf8');
const raw = fs.readFileSync(frag, 'utf8');
const parts = raw.split(/^@@sec:([a-z0-9]+)\s*$/m);
let n = 0;
for (let i = 1; i < parts.length; i += 2) {
  const id = parts[i], body = parts[i + 1].replace(/^\s*\n/, '').replace(/\s*$/, '\n');
  const start = html.indexOf(`<section class="sec" id="${id}"`);
  if (start < 0) { console.error('섹션 없음: ' + id); process.exit(1); }
  const end = html.indexOf('</section>', start);
  if (end < 0) { console.error('닫는 태그 없음: ' + id); process.exit(1); }
  html = html.slice(0, end) + body + html.slice(end);
  n++;
}
fs.writeFileSync(pane, html);
console.log(`${pane}: ${n}건 삽입`);
