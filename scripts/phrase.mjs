// 組み上がった dist の HTML に、文節の切れ目だけで改行できる印（<wbr>）を入れる（2026-11-10 坂本さん「文節以外で改行しない」）。
// astro.config.mjs の astro:build:done から呼ばれる。skip に書いたフォルダ（stera の LP など別に組んだ物）は触らない。
import fs from 'node:fs';
import path from 'node:path';
import { loadDefaultJapaneseParser } from 'budoux';
import { parseHTML } from 'linkedom';

const SEL = 'h1,h2,h3,h4,p,li,dt,dd,td,th,address,figcaption,.lead,.btn,.label,.rv-text,.rv-kicker';

export function phrase(dist, skip = []) {
  const parser = loadDefaultJapaneseParser();
  const walk = (d, out = []) => {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) { if (!(d === dist && skip.includes(f))) walk(p, out); }
      else if (f.endsWith('.html')) out.push(p);
    }
    return out;
  };
  let n = 0;
  for (const file of walk(dist)) {
    const { document } = parseHTML(fs.readFileSync(file, 'utf8'));
    const els = [...document.querySelectorAll(SEL)].filter((el) =>
      !el.closest('script,style,svg,nav.gnav,.crumbs') && !el.querySelector(SEL) && /[぀-ヿ一-鿿]/.test(el.textContent));
    for (const el of els) {
      let h = parser.translateHTMLString(el.innerHTML);
      h = h.replace(/^<span style="word-break:keep-all;overflow-wrap:anywhere">/, '').replace(/<\/span>$/, '');
      h = h.replace(/​/g, '<wbr>').replace(/(<wbr>\s*){2,}/g, '<wbr>');
      el.innerHTML = h;
      n++;
    }
    fs.writeFileSync(file, '<!DOCTYPE html>\n' + document.documentElement.outerHTML);
  }
  return n;
}
