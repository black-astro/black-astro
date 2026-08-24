// .diag SVG 정적 검사기 — 브라우저 실측을 대신한다.
//  · OVER : viewBox 폭(680) 밖으로 나가는 글자
//  · BOX  : 소속 박스 오른쪽 밖으로 나가는 글자 (안쪽 여백 8 이상에서 시작한 것만 소속으로 본다)
//  · LAP  : 같은 줄(baseline 차 3 이하)에서 가로로 겹치는 글자
//  · CUT  : 마지막 baseline + 8 보다 viewBox 높이가 작은 경우
// 글자폭: 한글/CJK = fs × 1.10 · 그 밖 = fs × 0.60  (기존 232개로 보정)
import fs from 'node:fs';
import path from 'node:path';

const CJK_W = 0.95, ASCII_W = 0.60;
const FS = { ann: 9, stpn: 9.5, lbl: 10.5, ttl: 10.5, val: 11.5 };

function fontSize(cls, attr) {
  if (attr) return parseFloat(attr);
  for (const k of ['ann', 'stpn', 'val', 'ttl', 'lbl']) if (new RegExp('\\b' + k + '\\b').test(cls)) return FS[k];
  return 10.5;
}
function width(text, fsz) {
  let w = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0);
    w += (c > 0x1100 && (c < 0x2000 || c > 0x303f)) ? fsz * CJK_W : fsz * ASCII_W;
  }
  return w;
}

export function checkFile(file, onlyIds) {
  const src = fs.readFileSync(file, 'utf8');
  const out = [];
  const secs = src.split(/<section class="sec" id="([^"]+)"/);
  for (let i = 1; i < secs.length; i += 2) {
    const id = secs[i], body = secs[i + 1];
    if (onlyIds && !onlyIds.has(id)) continue;
    for (const m of body.matchAll(/<svg viewBox="0 0 (\d+) (\d+)"[\s\S]*?<\/svg>/g)) {
      const svg = m[0], vbW = +m[1], vbH = +m[2];
      const rects = [...svg.matchAll(/<rect[^>]*?x="([\d.]+)"[^>]*?y="([\d.]+)"[^>]*?width="([\d.]+)"[^>]*?height="([\d.]+)"/g)]
        .map(r => ({ x: +r[1], y: +r[2], w: +r[3], h: +r[4] }));
      const texts = [];
      for (const t of svg.matchAll(/<text([^>]*)>([\s\S]*?)<\/text>/g)) {
        const a = t[1];
        const raw = t[2].replace(/<[^>]+>/g, '')
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
        if (!raw) continue;
        const x = parseFloat((a.match(/\bx="([\d.-]+)"/) || [])[1] ?? '0');
        const y = parseFloat((a.match(/\by="([\d.-]+)"/) || [])[1] ?? '0');
        const cls = (a.match(/class="([^"]*)"/) || [])[1] || '';
        const fsz = fontSize(cls, (a.match(/font-size="([\d.]+)"/) || [])[1]);
        const mid = /text-anchor="middle"/.test(a);
        const w = width(raw, fsz);
        const x0 = mid ? x - w / 2 : x, x1 = mid ? x + w / 2 : x + w;
        texts.push({ x0, x1, y, fsz, raw, mid, cx: x });
      }
      let maxY = 0;
      for (const t of texts) {
        maxY = Math.max(maxY, t.y);
        if (t.x1 > vbW + 2) out.push(`${id} OVER +${(t.x1 - vbW).toFixed(0)} "${t.raw.slice(0, 26)}"`);
        if (t.x0 < 4) out.push(`${id} OVER(좌) ${t.x0.toFixed(0)} "${t.raw.slice(0, 26)}"`);
        // 소속 박스
        let own = null;
        for (const r of rects) {
          const cy = t.y - t.fsz * 0.35;
          const inside = cy > r.y + 2 && cy < r.y + r.h - 1
            && (t.mid ? (t.cx > r.x + 4 && t.cx < r.x + r.w - 4) : (t.x0 >= r.x + 6 && t.x0 < r.x + r.w));
          if (inside && (!own || r.w < own.w)) own = r;
        }
        if (own) {
          const ov = t.x1 - (own.x + own.w - 4);
          if (ov > 6) out.push(`${id} BOX +${ov.toFixed(0)} "${t.raw.slice(0, 26)}"`);
        }
      }
      for (let a = 0; a < texts.length; a++) for (let b = a + 1; b < texts.length; b++) {
        const A = texts[a], B = texts[b];
        if (Math.abs(A.y - B.y) > 3) continue;
        const gap = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0);
        if (gap > 2) out.push(`${id} LAP "${A.raw.slice(0, 18)}" × "${B.raw.slice(0, 18)}"`);
      }
      if (maxY + 4 > vbH) out.push(`${id} CUT 높이 ${vbH} < ${maxY + 8}`);
    }
  }
  return out;
}

if (process.argv[2]) {
  const target = process.argv[2];
  const only = process.argv[3] ? new Set(process.argv[3].split(',')) : null;
  const files = fs.statSync(target).isDirectory()
    ? fs.readdirSync(target).filter(f => f.endsWith('.html')).map(f => path.join(target, f))
    : [target];
  let n = 0;
  for (const f of files) {
    const r = checkFile(f, only);
    if (r.length) { console.log('── ' + path.basename(f)); r.forEach(x => console.log('   ' + x)); n += r.length; }
  }
  console.log(n === 0 ? '✓ 문제 없음' : `✗ ${n}건`);
}
