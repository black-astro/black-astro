// CUT 자동 보정 — .diag SVG 의 viewBox 높이를 "마지막 baseline + 8" 이상으로 올린다.
// 사용: node fixcut.mjs <파일 또는 폴더> ...
import fs from 'node:fs';
import path from 'node:path';

function fixFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  let out = src, n = 0;
  for (const m of src.matchAll(/<svg viewBox="0 0 (\d+) (\d+)"[\s\S]*?<\/svg>/g)) {
    const svg = m[0], w = +m[1], h = +m[2];
    let maxY = 0;
    for (const t of svg.matchAll(/<text([^>]*)>([\s\S]*?)<\/text>/g)) {
      if (!t[2].replace(/<[^>]+>/g, '').trim()) continue;
      const y = parseFloat((t[1].match(/\by="([\d.-]+)"/) || [])[1] ?? '0');
      if (y > maxY) maxY = y;
    }
    const need = Math.ceil(maxY + 8);
    if (need > h) {
      out = out.replace(svg, svg.replace(`viewBox="0 0 ${w} ${h}"`, `viewBox="0 0 ${w} ${need}"`));
      n++;
    }
  }
  if (n) { fs.writeFileSync(file, out); console.log(`${path.basename(file)}: ${n}건 높이 보정`); }
  return n;
}

let total = 0;
for (const arg of process.argv.slice(2)) {
  const st = fs.statSync(arg);
  if (st.isDirectory()) for (const f of fs.readdirSync(arg).filter(x => x.endsWith('.html'))) total += fixFile(path.join(arg, f));
  else total += fixFile(arg);
}
console.log(total ? `총 ${total}건` : '보정할 것 없음');
