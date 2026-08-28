// 사용: node reg.mjs <meta.json>  — 가이드에 탭(또는 섹션)을 7곳에 등록
// 실행 위치: web/
import fs from 'node:fs';
import path from 'node:path';

const metaPath = process.argv[2];
const M = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const G = M.guide;
const root = path.join('guide-src', G);
const rd = f => fs.readFileSync(path.join(root, f), 'utf8');
const wr = (f, s) => fs.writeFileSync(path.join(root, f), s.replace(/\r\n/g, '\n'));
const jsStr = s => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ') + '"';
const esc = s => String(s).replace(/&(?!amp;|lt;|gt;|quot;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const T = M.tab, secs = M.sections;
const append = !!M.append;

/* 0) pane 의 section id 와 meta 일치 검사 */
const paneHtml = rd(path.join('parts', M.pane));
const paneIds = [...paneHtml.matchAll(/<section class="sec" id="([a-z0-9]+)"/g)].map(m => m[1]);
const metaIds = secs.map(s => s.id);
const missing = metaIds.filter(i => !paneIds.includes(i));
if (missing.length) { console.error('meta 에는 있는데 pane 에 없는 섹션:', missing.join(' ')); process.exit(1); }
if (!paneHtml.includes(`id="pane-${T}"`)) { console.error('pane id 불일치: pane-' + T); process.exit(1); }

/* 1) parts.json */
if (!append) {
  const pj = JSON.parse(rd('parts.json'));
  const entry = M.pane;
  if (!pj.parts.includes(entry)) {
    const i = pj.parts.indexOf('90-footer.html');
    pj.parts.splice(i, 0, entry);
    wr('parts.json', JSON.stringify(pj, null, 2) + '\n');
  }
}

/* 2) 사이드바 */
{
  let s = rd('parts/11-sidebar.html');
  // 그룹 버튼
  if (!append && !new RegExp(`<button type="button" data-g="${M.group}"`).test(s)) {
    const btn = `    <button type="button" data-g="${M.group}" onclick="pickGroup(${M.group})" title="${M.groupTitle}"><span class="lb">${M.groupLabel}</span><span class="ics">${M.groupIcs}</span></button>\n`;
    const gi = s.indexOf('<div class="navgrp"');
    const ge = s.indexOf('</div>', gi);
    s = s.slice(0, ge) + btn.replace(/^ {4}/, '') + '  ' + s.slice(ge);
    s = s.replace(/<\/button>\n\s*<\/button>\n\s*<button type="button" data-g="${M.group}"/, m => m); // noop guard
  }
  // 링크 블록 — 번호는 navset 안 기존 링크 수 이어서
  const linkOf = (sec, n) => `  <a href="#${sec.id}"><em>${String(n).padStart(2, '0')}</em>${esc(sec.title)}${sec.star ? ' ★' : ''}</a>\n`;
  if (append) {
    const re = new RegExp(`<div class="navset[^"]*" data-nav="${T}">`);
    const m = s.match(re); if (!m) { console.error('navset 없음: ' + T); process.exit(1); }
    const st = s.indexOf(m[0]);
    const en = s.indexOf('\n</div>', st);
    const existing = (s.slice(st, en).match(/<a href="#/g) || []).length;
    let block = '';
    secs.forEach((sec, i) => { if (!s.slice(st, en).includes(`href="#${sec.id}"`)) block += linkOf(sec, existing + i + 1); });
    s = s.slice(0, en + 1) + block + s.slice(en + 1);
  } else if (!s.includes(`data-nav="${T}"`)) {
    let block = `\n<div class="navset" data-nav="${T}">\n`;
    secs.forEach((sec, i) => block += linkOf(sec, i + 1));
    block += '</div>\n';
    if (M.after === '^') {
      const first = s.search(/<div class="navset[^"]*" data-nav=/);
      s = s.slice(0, first) + block.slice(1) + '\n' + s.slice(first);
    } else {
      const re = new RegExp(`<div class="navset[^"]*" data-nav="${M.after}">`);
      const m = s.match(re); if (!m) { console.error('after navset 없음: ' + M.after); process.exit(1); }
      const st = s.indexOf(m[0]);
      const en = s.indexOf('\n</div>', st) + '\n</div>'.length;
      s = s.slice(0, en) + '\n' + block.slice(1) + s.slice(en).replace(/^\n/, '');
    }
  }
  wr('parts/11-sidebar.html', s);
}

/* 3) 탭바 */
if (!append) {
  let s = rd('parts/12-tabbar.html');
  const labelTxt = M.label.replace(/^\S+\s*/, '');
  const mk = (txt) => `<button class="${M.cls}" data-t="${T}" data-g="${M.group}" onclick="switchTab('${T}')" role="tab" aria-selected="false"><span class="ic">${M.icon}</span> ${txt}</button>`;
  if (!s.includes(`data-t="${T}"`)) {
    let n = 0;
    if (M.after === '^') {
      const insFirst = (containerSel, txt) => {
        const ci = s.indexOf(containerSel);
        const fb = s.indexOf('<button class=', ci);
        const ls = s.lastIndexOf('\n', fb) + 1;
        const ind = s.slice(ls, fb);
        s = s.slice(0, ls) + ind + mk(txt) + '\n' + s.slice(ls);
      };
      insFirst('<div class="tabrow"', labelTxt);
      insFirst('<div class="tabsl"', M.short);
    } else {
      const re = new RegExp(`^(\\s*)<button class="[^"]*" data-t="${M.after}"[^\\n]*<\\/button>\\n`, 'gm');
      s = s.replace(re, (m, ind) => m + ind + mk(n++ === 0 ? labelTxt : M.short) + '\n');
      if (n !== 2) throw new Error('after 탭 버튼이 2개가 아님: ' + n);
    }
  }
  // 시트 그룹 버튼
  if (!s.includes(`data-sg="${M.group}"`)) {
    s = s.replace(/^(\s*)<button type="button" data-sg="m"/m, (m, ind) => `${ind}<button type="button" data-sg="${M.group}" onclick="pickSheet(${M.group})">${M.sheetLabel}</button>\n${m}`);
  }
  // 단축키 재부여 — tabrow 순서 기준 앞 10개
  s = s.replace(/<span class="k">\d<\/span>/g, '');
  const rowS = s.indexOf('<div class="tabrow"'), rowE = s.indexOf('</div>', rowS);
  const order = [...s.slice(rowS, rowE).matchAll(/data-t="([a-z-]+)"/g)].map(m => m[1]);
  const keys = '1234567890';
  order.slice(0, 10).forEach((t, i) => {
    s = s.replace(new RegExp(`(data-t="${t}"[^\\n]*?)<\\/button>`, 'g'), (m, a) => `${a}<span class="k">${keys[i]}</span></button>`);
  });
  wr('parts/12-tabbar.html', s);
  fs.writeFileSync(path.join(root, '.taborder.json'), JSON.stringify(order));
}

/* 4) 20-tab-switch.js */
{
  let s = rd('parts/js/20-tab-switch.js');
  const addTo = (name, lines) => {
    const st = s.indexOf(`const ${name} = {`);
    if (st < 0) throw new Error(name + ' 없음');
    const en = s.indexOf('\n};', st);
    s = s.slice(0, en) + '\n' + lines + s.slice(en);
  };
  if (!append && !new RegExp(`\\n\\s*${T}:`).test(s.slice(s.indexOf('const TAB_LABEL'), s.indexOf('\n};', s.indexOf('const TAB_LABEL')))))
    addTo('TAB_LABEL', `  ${T}:${jsStr(M.label)},`);
  const has = (name, id) => { const st = s.indexOf(`const ${name} = {`); const en = s.indexOf('\n};', st); return new RegExp(`[\\s,{]${id}:`).test(s.slice(st, en)); };
  const lvL = secs.filter(x => !has('SEC_LV', x.id)).map(x => `${x.id}:"${x.lv}"`).join(', ');
  if (lvL) addTo('SEC_LV', `  /* ${T} */ ${lvL},`);
  const ezL = secs.filter(x => !has('EZ', x.id)).map(x => `  ${x.id}:${jsStr(x.ez)},`).join('\n');
  if (ezL) addTo('EZ', `  /* ── ${T} ── */\n${ezL}`);
  const capL = secs.filter(x => !has('CAP', x.id)).map(x => `  ${x.id}:["${x.cap[0]}",${jsStr(x.cap[1])}],`).join('\n');
  if (capL) addTo('CAP', `  /* ── ${T} ── */\n${capL}`);
  if (!append) {
    const order = JSON.parse(fs.readFileSync(path.join(root, '.taborder.json'), 'utf8'));
    s = s.replace(/const TAB_ORDER = \[[^\]]*\]/, `const TAB_ORDER = [${order.slice(0, 10).map(t => `"${t}"`).join(',')}]`);
  }
  wr('parts/js/20-tab-switch.js', s);
}

/* 5) 00-core.js */
{
  let s = rd('parts/js/00-core.js');
  const addTo = (name, lines) => {
    const st = s.indexOf(`const ${name} = {`);
    if (st < 0) throw new Error(name + ' 없음');
    const en = s.indexOf('\n};', st);
    s = s.slice(0, en) + '\n' + lines + s.slice(en);
  };
  const has = (name, id) => { const st = s.indexOf(`const ${name} = {`); const en = s.indexOf('\n};', st); return new RegExp(`[\\s,{]${id}:`).test(s.slice(st, en)); };
  if (!append && !has('TAB_KW', T)) addTo('TAB_KW', `  ${T}:${jsStr(M.tabkw)},`);
  const kwL = secs.filter(x => !has('SEC_KW', x.id)).map(x => `  ${x.id}:${jsStr(x.kw)},`).join('\n');
  if (kwL) addTo('SEC_KW', kwL);
  wr('parts/js/00-core.js', s);
}

/* 6) 탭 색 클래스 */
if (!append && M.cls) {
  const cssFile = fs.readdirSync(path.join(root, 'parts/css')).find(f => f.startsWith('06'));
  const shared = fs.readdirSync('guide-src/shared/css').map(f => fs.readFileSync(path.join('guide-src/shared/css', f), 'utf8')).join('\n');
  let css = rd('parts/css/' + cssFile);
  const re = new RegExp(`\\.tabbar button\\.on\\.${M.cls}\\b`);
  if (!re.test(css) && !re.test(shared)) {
    css += `\n/* ${M.icon} ${M.label.replace(/^\S+\s*/, '')} 탭 */\n.tabbar button.on.${M.cls}{background:linear-gradient(135deg,${M.grad[0]},${M.grad[1]})}\n`;
    wr('parts/css/' + cssFile, css);
  }
}
try { fs.unlinkSync(path.join(root, '.taborder.json')); } catch {}
console.log(`✓ ${G}/${T}: ${secs.length} 섹션 등록${append ? ' (append)' : ''}`);
