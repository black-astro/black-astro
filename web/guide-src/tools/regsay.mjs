// 사용: node guide-src/tools/regsay.mjs <가이드> <사전 파일>   (web/ 에서)
// 읽는 법(*) 사전을 parts/js/85-say.js 로 두고 parts.json 에서 shared/js/07-study.js 바로 앞에 등록한다.
import fs from 'node:fs';
const [g, src] = process.argv.slice(2);
const txt = fs.readFileSync(src, 'utf8');
// 실행해 보고 형태 확인 — 배열 · 2~3칸 · 표기 중복 없음
const w = {}; new Function('window', txt)(w);
const L = w.LX_SAY;
if (!Array.isArray(L) || !L.length) throw new Error('LX_SAY 배열 없음');
const bad = L.filter(x => !Array.isArray(x) || x.length < 2 || x.length > 3 || !x[0] || !x[1]);
if (bad.length) throw new Error('형태가 틀린 항목 ' + bad.length);
const seen = new Set(), dup = L.map(x => x[0]).filter(t => seen.has(t) || !seen.add(t));
if (dup.length) throw new Error('중복 표기 ' + dup.join(', '));
fs.writeFileSync(`guide-src/${g}/parts/js/85-say.js`, txt.replace(/\r\n/g, '\n'));
const pf = `guide-src/${g}/parts.json`, pj = JSON.parse(fs.readFileSync(pf, 'utf8'));
if (!pj.parts.includes('js/85-say.js')) {
  const i = pj.parts.indexOf('shared/js/07-study.js');
  if (i < 0) throw new Error('parts.json 에 shared/js/07-study.js 없음');
  pj.parts.splice(i, 0, 'js/85-say.js');
  fs.writeFileSync(pf, JSON.stringify(pj, null, 2) + '\n');
}
console.log(`✓ ${g}: 읽는 법 ${L.length}개`);
