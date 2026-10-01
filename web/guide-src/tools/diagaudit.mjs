// .diag SVG 정렬·애니메이션 정적 검사기 (svgcheck 의 짝)
//  svgcheck 는 "글자가 넘치나"를 본다. 이 도구는 "줄이 맞나 · 움직임이 선을 따라가나"를 본다.
//
//  · TIP   : 화살표(.ar*) 끝이 박스 안쪽에 묻힘 — 화살촉이 박스 밑에 깔려 안 보인다
//  · PK    : 흐름 점(.pk)의 animateMotion 경로 시작/끝이 그려진 어떤 선의 꼭짓점과도 6px 넘게 어긋남
//            — 점이 선을 벗어나 허공을 달린다
//  · CTR   : 박스 하나에 가운데 정렬 글자가 한 열만 있는데 박스 중심에서 3px 넘게 비켜 있음
//  · ROW   : 같은 크기 박스가 나란한데 y 가 1~3px 어긋남 — 눈으로는 "삐뚤다"로만 보인다
//  · GAP   : 한 줄에 놓인 같은 높이 박스 3개 이상의 간격이 3~12px 차이로 들쭉날쭉
//  · MONO  : (요약) pane 별 "박스+직선" 그림 비율 — 같은 모양 반복 정도
//
//  사용: node guide-src/tools/diagaudit.mjs <pane 폴더|파일> [--summary]
//  겹침/어긋남이 그림의 뜻이면 <svg data-align="free"> 로 ROW/GAP/CTR 을 건너뛴다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const num = v => (v == null ? null : parseFloat(v));
// 속성값 하나 읽기 — 공백류를 한 칸으로 접은 뒤 ` 이름="값"` 을 찾는다 (data-x 같은 접두 속성과 섞이지 않게 앞 공백 필수)
const attr = (a, k) => {
  const flat = ' ' + a.replace(/\s+/g, ' ');
  const i = flat.indexOf(' ' + k + '="');
  if (i < 0) return null;
  const from = i + k.length + 3;
  return flat.slice(from, flat.indexOf('"', from));
};

function rectsOf(svg) {
  const out = [];
  for (const m of svg.matchAll(/<rect\b([^>]*)\/?>/g)) {
    const a = m[1];
    const x = num(attr(a, 'x')) ?? 0, y = num(attr(a, 'y')) ?? 0;
    const w = num(attr(a, 'width')), h = num(attr(a, 'height'));
    if (w == null || h == null || /%/.test(attr(a, 'width') || '')) continue;
    if (/transform=/.test(a)) continue;                       // 회전·이동된 박스는 좌표 비교가 무의미
    out.push({ x, y, w, h, cls: attr(a, 'class') || '' });
  }
  return out;
}
// path d / line 에서 꼭짓점 목록 (절대 좌표 명령만 신뢰 — 상대 명령이 섞이면 null)
function points(d) {
  if (!d || /[a-z]/.test(d.replace(/e-?\d/g, ''))) return null;
  const pts = [];
  const toks = d.match(/[MLHVQCSTAZ]|-?[\d.]+/g) || [];
  let cmd = null, i = 0, cx = 0, cy = 0;
  while (i < toks.length) {
    const t = toks[i];
    if (/[A-Z]/.test(t)) { cmd = t; i++; if (cmd === 'Z') continue; }
    const n = k => parseFloat(toks[i + k]);
    if (cmd === 'M' || cmd === 'L' || cmd === 'T') { cx = n(0); cy = n(1); i += 2; }
    else if (cmd === 'H') { cx = n(0); i += 1; }
    else if (cmd === 'V') { cy = n(0); i += 1; }
    else if (cmd === 'Q' || cmd === 'S') { cx = n(2); cy = n(3); i += 4; }
    else if (cmd === 'C') { cx = n(4); cy = n(5); i += 6; }
    else if (cmd === 'A') { cx = n(5); cy = n(6); i += 7; }
    else { i++; continue; }
    if (Number.isNaN(cx) || Number.isNaN(cy)) return null;
    pts.push([cx, cy]);
  }
  return pts.length ? pts : null;
}
const inside = (p, r, pad) => p[0] > r.x + pad && p[0] < r.x + r.w - pad && p[1] > r.y + pad && p[1] < r.y + r.h - pad;

export function auditSvg(svg) {
  const out = [];
  const free = /data-align="free"/.test(svg);
  const rects = rectsOf(svg);
  // 그려진 선(흐름 점 경로 제외)
  const strokes = [];
  const body = svg.replace(/<circle[^>]*class="[^"]*\bpk\b[\s\S]*?<\/circle>/g, '');
  for (const m of body.matchAll(/<path\b([^>]*)\/?>/g)) {
    const a = m[1], p = points(attr(a, 'd'));
    if (p) strokes.push({ cls: attr(a, 'class') || '', p });
  }
  for (const m of body.matchAll(/<line\b([^>]*)\/?>/g)) {
    const a = m[1];
    strokes.push({ cls: attr(a, 'class') || '', p: [[num(attr(a, 'x1')), num(attr(a, 'y1'))], [num(attr(a, 'x2')), num(attr(a, 'y2'))]] });
  }
  for (const m of body.matchAll(/<poly(?:line|gon)\b([^>]*)\/?>/g)) {
    const raw = (attr(m[1], 'points') || '').trim().split(/[\s,]+/).map(Number);
    const p = []; for (let i = 0; i + 1 < raw.length; i += 2) p.push([raw[i], raw[i + 1]]);
    if (p.length) strokes.push({ cls: '', p });
  }

  // TIP — 화살촉이 붙는 선의 끝점이 박스 안쪽(테두리에서 2px 이상 들어감)
  for (const s of strokes) {
    if (!/\bar(2|-gn|-rs|-am)?\b/.test(s.cls)) continue;
    const ends = /\bar2\b/.test(s.cls) ? [s.p[0], s.p[s.p.length - 1]] : [s.p[s.p.length - 1]];
    const st = s.p[0];
    for (const e of ends) {
      const hit = rects.find(r => !/lane|quad|zone|band/.test(r.cls) && inside(e, r, 2) && !inside(st === e ? s.p[s.p.length - 1] : st, r, 0)
        && r.w * r.h < 680 * 300 * 0.5);           // 배경 패널(큰 박스)은 제외
      if (hit) out.push(`TIP 화살촉이 박스 안 (${e[0]},${e[1]}) ∈ [${hit.x},${hit.y},${hit.w}×${hit.h}]`);
    }
  }

  // PK — 흐름 점 경로가 선을 따라가는가
  const verts = strokes.flatMap(s => s.p);
  for (const m of svg.matchAll(/<animateMotion\b([^>]*)\/?>/g)) {
    const a = m[1];
    if (/<mpath/.test(m[0])) continue;
    const p = points(attr(a, 'path'));
    if (!p) continue;
    for (const [k, q] of [['시작', p[0]], ['끝', p[p.length - 1]]]) {
      const near = verts.some(v => Math.hypot(v[0] - q[0], v[1] - q[1]) <= 6);
      // 선 위의 임의 점일 수도 있으니 선분 거리로 한 번 더 본다
      const onSeg = near || strokes.some(s => s.p.some((v, i) => {
        if (!i) return false; const u = s.p[i - 1];
        const L2 = (v[0] - u[0]) ** 2 + (v[1] - u[1]) ** 2; if (!L2) return false;
        let t = ((q[0] - u[0]) * (v[0] - u[0]) + (q[1] - u[1]) * (v[1] - u[1])) / L2; t = Math.max(0, Math.min(1, t));
        return Math.hypot(u[0] + t * (v[0] - u[0]) - q[0], u[1] + t * (v[1] - u[1]) - q[1]) <= 6;
      }));
      if (!onSeg) out.push(`PK 흐름 점 ${k}점 (${q[0]},${q[1]}) 이 어떤 선 위에도 없음`);
    }
  }
  if (free) return out;

  // CTR — 박스 안 가운데 정렬 글자가 한 열인데 중심에서 벗어남
  const mids = [];
  for (const m of svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)) {
    const a = m[1];
    if (attr(a, 'text-anchor') !== 'middle' || /transform=|writing-mode/.test(a)) continue;
    const x = num(attr(a, 'x')), y = num(attr(a, 'y'));
    if (x == null || y == null) continue;
    mids.push({ x, y, raw: m[2].replace(/<[^>]+>/g, '').trim() });
  }
  const own = new Map();
  for (const t of mids) {
    let best = null;
    for (const r of rects) if (t.x > r.x && t.x < r.x + r.w && t.y - 4 > r.y && t.y - 4 < r.y + r.h && (!best || r.w * r.h < best.w * best.h)) best = r;
    if (best) { if (!own.has(best)) own.set(best, []); own.get(best).push(t); }
  }
  for (const [r, ts] of own) {
    const xs = [...new Set(ts.map(t => Math.round(t.x)))];
    if (xs.length !== 1) continue;
    const off = ts[0].x - (r.x + r.w / 2);
    if (Math.abs(off) > 3 && r.w < 400) out.push(`CTR "${ts[0].raw.slice(0, 16)}" 박스 중심에서 ${off > 0 ? '+' : ''}${off.toFixed(1)}px`);
  }

  // ROW — 같은 크기 박스가 1~3px 어긋남
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const A = rects[i], B = rects[j];
    const dy = Math.abs(A.y - B.y);
    if (dy > 0 && dy <= 3 && Math.abs(A.h - B.h) <= 1 && (A.x + A.w <= B.x || B.x + B.w <= A.x))
      out.push(`ROW 나란한 박스 y 어긋남 ${A.y} vs ${B.y} (x=${A.x}, ${B.x})`);
  }
  // GAP — 한 줄 박스 간격이 들쭉날쭉
  const rows = new Map();
  for (const r of rects) { const k = r.y + '|' + r.h; if (!rows.has(k)) rows.set(k, []); rows.get(k).push(r); }
  for (const [k, rs] of rows) {
    if (rs.length < 3) continue;
    rs.sort((a, b) => a.x - b.x);
    const gaps = []; let ok = true;
    for (let i = 1; i < rs.length; i++) { const g = rs[i].x - (rs[i - 1].x + rs[i - 1].w); if (g < 0) ok = false; gaps.push(g); }
    if (!ok) continue;
    const d = Math.max(...gaps) - Math.min(...gaps);
    if (d >= 3 && d <= 12) out.push(`GAP y=${k.split('|')[0]} 간격 ${gaps.map(g => +g.toFixed(1)).join('/')}`);
  }
  return out;
}

export function shapeKind(svg) {
  const hasRect = /<rect\b/.test(svg);
  const rich = /<(ellipse|polygon|polyline)\b/.test(svg)
    || /<circle(?![^>]*\bpk\b)/.test(svg)
    || /class="[^"]*\b(ax|area|bar|gauge|arc|grid|spark|cell|cel|actr|actv|lane)\b/.test(svg)
    || /\b[QCA]\s*-?[\d.]/.test((svg.match(/\sd="[^"]*"/g) || []).join(' '));
  return hasRect && !rich ? 'box' : 'rich';
}

export function auditFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  const res = [], kinds = { box: 0, rich: 0 };
  const secs = src.split(/<section class="sec" id="([^"]+)"/);
  for (let i = 1; i < secs.length; i += 2) {
    const id = secs[i];
    for (const m of secs[i + 1].matchAll(/<svg viewBox="[^"]*"[\s\S]*?<\/svg>/g)) {
      kinds[shapeKind(m[0])]++;
      for (const r of auditSvg(m[0])) res.push(`${id} ${r}`);
    }
  }
  return { res, kinds };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain && process.argv[2]) {
  const target = process.argv[2], summary = process.argv.includes('--summary');
  const files = fs.statSync(target).isDirectory()
    ? fs.readdirSync(target).filter(f => f.endsWith('.html')).map(f => path.join(target, f))
    : [target];
  let n = 0; const tally = {};
  for (const f of files) {
    const { res, kinds } = auditFile(f);
    const tot = kinds.box + kinds.rich;
    const pct = tot ? Math.round(kinds.box / tot * 100) : 0;
    if (summary) { console.log(`${path.basename(f).padEnd(18)} 그림 ${String(tot).padStart(3)} · 박스형 ${pct}%  · 문제 ${res.length}`); }
    else if (res.length) { console.log(`── ${path.basename(f)}  (박스형 ${pct}%)`); res.forEach(x => console.log('   ' + x)); }
    for (const r of res) { const c = r.split(' ')[1]; tally[c] = (tally[c] || 0) + 1; }
    n += res.length;
  }
  console.log(n === 0 ? '✓ 정렬·모션 문제 없음' : `✗ ${n}건 ` + JSON.stringify(tally));
}
