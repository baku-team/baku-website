/* Motion & ornaments for the sections below the hero film.
   Every layer added here is decorative (aria-hidden) and is skipped or
   frozen when the visitor prefers reduced motion. */

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const SVG_NS = 'http://www.w3.org/2000/svg';

/* ---------- shared SVG defs (seigaiha patterns, cloud shape) ---------- */
function seigaihaPattern(id, fill) {
  // rows overlap from top to bottom so each lower row covers the one above
  const rows = [[-10, [20]], [0, [0, 40]], [10, [20]], [20, [0, 40]], [30, [20]]];
  const rings = [20, 15, 10, 5];
  let g = '';
  for (const [y, xs] of rows) {
    for (const x of xs) {
      for (const r of rings) g += `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="currentColor" stroke-width=".8"/>`;
    }
  }
  return `<pattern id="${id}" width="40" height="20" patternUnits="userSpaceOnUse">${g}</pattern>`;
}

const CLOUD_PATH =
  'M40 92 C18 92 10 74 24 64 C14 50 30 34 48 42 C50 22 78 16 92 32 C104 12 140 14 146 38 ' +
  'C168 32 186 50 176 68 C196 72 196 92 174 92 Z ' +
  'M92 32 C96 44 88 54 78 50 C70 47 72 38 80 38 ' +
  'M146 38 C140 52 150 60 158 56 C165 52 162 44 156 45 ' +
  'M48 42 C56 50 52 60 44 60 C38 60 37 53 42 52 ' +
  'M40 92 C10 96 -10 112 -40 106';

function injectDefs() {
  const holder = document.createElement('div');
  holder.setAttribute('aria-hidden', 'true');
  holder.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  holder.innerHTML =
    `<svg xmlns="${SVG_NS}" width="0" height="0"><defs>` +
    seigaihaPattern('seigaiha-ink', '#0E1A2B') +
    seigaihaPattern('seigaiha-paper', '#F8F5EE') +
    `</defs></svg>`;
  document.body.prepend(holder);
}

/* ---------- decorative layers ---------- */
function decorate(section) {
  section.classList.add('has-decor');

  if (section.hasAttribute('data-moon')) {
    const moon = document.createElement('div');
    moon.className = 'decor moon';
    moon.dataset.speed = '0.12';
    moon.setAttribute('aria-hidden', 'true');
    section.prepend(moon);
  }

  const waves = section.getAttribute('data-waves');
  if (waves) {
    const el = document.createElement('div');
    el.className = `decor waves waves--${waves}`;
    el.dataset.speed = '-0.06';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<svg xmlns="${SVG_NS}" preserveAspectRatio="none"><rect width="100%" height="100%" fill="url(#seigaiha-${waves})"/></svg>`;
    section.prepend(el);
  }

  if (section.hasAttribute('data-clouds')) {
    for (const side of ['l', 'r']) {
      const el = document.createElement('div');
      el.className = `decor cloud cloud--${side}`;
      el.dataset.speed = side === 'l' ? '0.18' : '-0.14';
      el.setAttribute('aria-hidden', 'true');
      const flip = side === 'r' ? ' transform="scale(-1,1) translate(-200,0)"' : '';
      el.innerHTML = `<svg xmlns="${SVG_NS}" viewBox="-40 0 240 120"><g${flip}><path d="${CLOUD_PATH}"/></g></svg>`;
      section.prepend(el);
    }
  }

  // Motes only on sections about one screen tall; long articles would need huge canvases.
  if (section.hasAttribute('data-motes') && !reduce && section.offsetHeight < innerHeight * 2.2) {
    const canvas = document.createElement('canvas');
    canvas.className = 'decor motes';
    canvas.setAttribute('aria-hidden', 'true');
    section.prepend(canvas);
    motes.push(new MoteField(canvas));
  }
}

/* ---------- gold motes & a few drifting petals ---------- */
const motes = [];
class MoteField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.visible = false;
    this.resize();
  }
  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    this.w = w; this.h = h;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.max(14, Math.min(46, Math.round((w * h) / 26000)));
    this.dots = Array.from({ length: n }, () => this.spawn(true));
    this.petals = Array.from({ length: w < 720 ? 2 : 4 }, () => this.spawnPetal(true));
  }
  spawn(anywhere) {
    return {
      x: Math.random() * this.w,
      y: anywhere ? Math.random() * this.h : this.h + 10,
      r: .5 + Math.random() * 1.7,
      vy: .12 + Math.random() * .35,
      phase: Math.random() * Math.PI * 2,
      sway: .2 + Math.random() * .5,
    };
  }
  spawnPetal(anywhere) {
    return {
      x: Math.random() * this.w,
      y: anywhere ? Math.random() * this.h : -12,
      vx: .25 + Math.random() * .35,
      vy: .3 + Math.random() * .3,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - .5) * .02,
      s: 3 + Math.random() * 2.5,
    };
  }
  step(t) {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);
    for (const d of this.dots) {
      d.y -= d.vy;
      const x = d.x + Math.sin(t / 1800 + d.phase) * 12 * d.sway;
      if (d.y < -10) Object.assign(d, this.spawn(false));
      const tw = .45 + .55 * Math.sin(t / 900 + d.phase * 3);
      const a = Math.min(1, d.y / (h * .25)) * (.25 + .5 * tw);
      ctx.beginPath();
      ctx.fillStyle = `rgba(201,168,106,${a.toFixed(3)})`;
      ctx.shadowColor = 'rgba(201,168,106,.8)';
      ctx.shadowBlur = d.r * 6;
      ctx.arc(x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    for (const p of this.petals) {
      p.x += p.vx + Math.sin(t / 1400 + p.rot) * .3;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > h + 12 || p.x > w + 12) Object.assign(p, this.spawnPetal(false));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = 'rgba(214,150,160,.55)';
      ctx.beginPath();
      ctx.ellipse(0, 0, p.s, p.s * .55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

/* ---------- character-by-character reveal ---------- */
function splitChars(el) {
  let i = 0;
  const walk = (node) => {
    for (const n of Array.from(node.childNodes)) {
      if (n.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        // keep each word together so Latin titles never break mid-word
        for (const part of n.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.append(part); continue; }
          const word = document.createElement('span');
          word.style.cssText = 'display:inline-block;white-space:nowrap';
          for (const c of part) {
            const ch = document.createElement('span');
            ch.className = 'ch';
            ch.style.setProperty('--i', String(i++));
            ch.textContent = c;
            word.append(ch);
          }
          frag.append(word);
        }
        n.replaceWith(frag);
      } else if (n.nodeType === Node.ELEMENT_NODE && n.tagName !== 'BR') {
        walk(n);
      }
    }
  };
  walk(el);
  el.classList.add('split');
}

/* ---------- moon ring around each chapter ---------- */
function addRing(frame) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'ring');
  svg.setAttribute('viewBox', '0 0 200 200');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML =
    '<circle class="r-draw" cx="100" cy="100" r="90" pathLength="1"/>' +
    '<circle class="r-dash" cx="100" cy="100" r="97"/>';
  frame.prepend(svg);
  return svg;
}

/* ---------- chapter rail (home page) ---------- */
function buildRail(chapters) {
  const rail = document.createElement('nav');
  rail.className = 'chapter-rail';
  rail.setAttribute('aria-label', '事業の章');
  const links = chapters.map((sec, k) => {
    if (!sec.id) sec.id = `chapter-${k + 1}`;
    const a = document.createElement('a');
    a.href = `#${sec.id}`;
    a.textContent = sec.querySelector('.num')?.textContent.trim() || String(k + 1);
    a.setAttribute('aria-label', `第${k + 1}章へ`);
    rail.append(a);
    return a;
  });
  document.body.append(rail);
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const k = chapters.indexOf(e.target);
      if (e.isIntersecting) {
        links.forEach((a, j) => a.classList.toggle('active', j === k));
        rail.classList.toggle('on-light', e.target.classList.contains('light'));
      }
    }
    const any = chapters.some((s) => {
      const r = s.getBoundingClientRect();
      return r.top < innerHeight * .55 && r.bottom > innerHeight * .45;
    });
    rail.classList.toggle('on', any);
  }, { rootMargin: '-45% 0px -45% 0px' });
  chapters.forEach((s) => io.observe(s));
}

/* ---------- wiring ---------- */
function init() {
  injectDefs();

  // 2026-11-10：月の輪・金の粒・花びら・雲・一文字ずつの表示は外す（青海波だけ残す）
  $$('[data-waves]').forEach(decorate);

  const rings = [];

  $$('.company .grid > *').forEach((el, k) => el.style.setProperty('--i', String(k)));

  const watched = [
    ...rings,
    ...$$('.moon, .waves, .divider, .biz .num, .biz-hero .num, .company .grid, .mission .emblem, .split'),
  ];
  if (reduce) {
    watched.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    watched.forEach((el) => io.observe(el));
  }

  const chapters = $$('main > section.biz');
  // 章の目次（横のレール）も外す（2026-11-10）
  void chapters;

  if (reduce) return;

  // parallax + scroll progress, measured against each layer's (untransformed) section
  const layers = $$('[data-speed], .biz .num, .biz-hero .num').map((el) => ({
    el,
    speed: Number(el.dataset.speed ?? (el.classList.contains('num') ? -0.1 : 0)),
    host: el.closest('section') || el.parentElement,
  }));

  const moteIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const f = motes.find((m) => m.canvas === e.target);
      if (f) f.visible = e.isIntersecting;
    }
  });
  motes.forEach((m) => moteIO.observe(m.canvas));

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const vh = innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      document.documentElement.style.setProperty('--scroll', String(max > 0 ? scrollY / max : 0));
      for (const { el, speed, host } of layers) {
        const r = host.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const offset = (r.top + r.height / 2) - vh / 2;
        el.style.setProperty('--py', `${(offset * speed).toFixed(1)}px`);
      }
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { motes.forEach((m) => m.resize()); onScroll(); });
  onScroll();

  const loop = (t) => {
    for (const m of motes) if (m.visible) m.step(t);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
