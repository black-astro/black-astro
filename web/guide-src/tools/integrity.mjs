// 소스 무결성 스캔 — verify:guide 가 못 잡는 것들
//  ① 제어문자(NUL 등)  ② <pre class="code"> 안의 미이스케이프 태그
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'D:/gibis/workTool/astro/black-astro/web/guide-src';
const targets = process.argv.slice(2);
const guides = targets.length ? targets : ['cs', 'server', 'db', 'csharp', 'python', 'js-ts', 'java', 'kotlin', 'cpp', 'rust'];
const OK_TAGS = new Set(['span', '/span', 'b', '/b', 'i', '/i', 'code', '/code', 'em', '/em', 'u', '/u', 'br']);
let bad = 0;

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(html|js|css)$/.test(e.name)) scan(p);
  }
}

function scan(p) {
  const buf = fs.readFileSync(p);
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b < 9 || b === 11 || b === 12 || (b >= 14 && b < 32)) {
      console.log(`✗ 제어문자 0x${b.toString(16)} @ ${p}:${buf.slice(0, i).toString('utf8').split('\n').length}`);
      bad++; break;
    }
  }
  if (!p.endsWith('.html')) return;
  const s = buf.toString('utf8');
  for (const m of s.matchAll(/<pre class="code"[^>]*><code>([\s\S]*?)<\/code><\/pre>/g)) {
    const body = m[1];
    for (const t of body.matchAll(/<\/?([A-Za-z][A-Za-z0-9]*)/g)) {
      const name = (t[0][1] === '/' ? '/' : '') + t[1].toLowerCase();
      if (!OK_TAGS.has(name)) {
        const line = s.slice(0, m.index + t.index).split('\n').length;
        console.log(`✗ 코드블록 미이스케이프 "${t[0]}" @ ${path.relative(ROOT, p)}:${line}`);
        bad++;
      }
    }
  }
}

for (const g of guides) {
  const d = path.join(ROOT, g);
  if (fs.existsSync(d)) walk(d);
}
console.log(bad === 0 ? '✓ 무결성 이상 없음' : `✗ ${bad}건`);
