// node grpicon.mjs <가이드> <그룹번호> <추가할 아이콘> [title 에 넣을 문구] [이 문구 뒤에]
// 사이드바 그룹 버튼의 ics 에 아이콘을 덧붙이고(이미 있으면 건너뜀) title 에 문구를 끼운다. web/ 에서 실행.
import fs from 'node:fs';
const [g, n, icon, label, afterTxt] = process.argv.slice(2);
const f = `guide-src/${g}/parts/11-sidebar.html`;
let s = fs.readFileSync(f, 'utf8');
const re = new RegExp(`(<button type="button" data-g="${n}"[^\\n]*?title=")([^"]*)("[^\\n]*?<span class="ics">)([^<]*)(</span>)`);
const m = s.match(re);
if (!m) throw new Error('그룹 버튼 없음 ' + g + ' ' + n);
let title = m[2], ics = m[4];
if (!ics.includes(icon)) ics += icon;
if (label && !title.includes(label)) {
  if (afterTxt && title.includes(afterTxt)) title = title.replace(afterTxt, afterTxt + ' · ' + label);
  else title += ' · ' + label;
}
s = s.replace(re, `$1${title}$3${ics}$5`);
fs.writeFileSync(f, s);
console.log(g, n, title, ics);
