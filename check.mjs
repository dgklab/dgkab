// Remake checker: compares the DGK AB page against the section-by-section layout
// of the reference home page (waabi.ai), checks the brand pictures, and writes REPORT.md.
// Run with: node check.mjs
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const read = (f) => (existsSync(join(root, f)) ? readFileSync(join(root, f), 'utf8') : '');
const html = read('index.html');
const css = read('styles.css');
const js = read('script.js');

const count = (re, s = html) => (s.match(re) || []).length;
const section = (name) => {
  const m = html.match(new RegExp(`<(section|header|footer|div)[^>]*data-section="${name}"[\\s\\S]*?</\\1>\\s*(?=<!--|</main>|<main|<script|<footer|<header)`));
  return m ? m[0] : '';
};
const rule = (sel, prop) => new RegExp(`${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*{[^}]*${prop}`).test(css);
const imgs = (s) => [...s.matchAll(/<img\b[^>]*>/g)].map((m) => ({
  src: (m[0].match(/src="([^"]+)"/) || [])[1] || '',
  alt: (m[0].match(/alt="([^"]*)"/) || [null, null])[1],
}));

const checks = [];
const check = (group, label, ok) => checks.push({ group, label, ok: Boolean(ok) });

// Structure (reference order: bar, pill header, hero, statement mosaic, pillars, tech cards,
// safety band, partners, insights, join, footer)
const order = ['banner', 'header', 'hero', 'statement', 'pillars', 'services', 'standard', 'industries', 'insights', 'join', 'footer'];
const found = [...html.matchAll(/data-section="([a-z]+)"/g)].map((m) => m[1]);
check('Structure', `All ${order.length} sections present`, order.every((s) => found.includes(s)));
check('Structure', 'Sections in reference order', JSON.stringify(found.filter((s) => order.includes(s))) === JSON.stringify(order));

// Brand
check('Brand', 'DGK AB in title, header and footer', /<title>DGK AB/.test(html) && /class="logo"[^>]*>[\s\S]*?DGK AB/.test(section('header')) && /DGK AB/.test(section('footer')));
check('Brand', 'Navy, teal, warm grey and white tokens', /--ink:\s*#1d2b44/i.test(css) && /--teal:\s*#4f8a8b/i.test(css) && /--warm:\s*#e8e4df/i.test(css) && /--paper:\s*#fff/i.test(css));
check('Brand', 'Teal pill buttons (reference accent swapped for brand teal)', rule('.btn', 'background:\\s*var\\(--teal\\)') && rule('.btn', 'border-radius:\\s*50px'));
check('Brand', 'Services from the brief are named', ['Business development', 'Leadership development', 'Executive coaching', 'Corporate training', 'Performance analysis', 'Change management'].every((s) => html.includes(s)));
check('Brand', 'Industries and levels from the brief are named', ['Retail', 'Automotive', 'Service', 'Nordic'].every((s) => html.includes(s)));

// 0. Announcement bar
const bar = section('banner');
check('Announcement bar', 'Message with link', /<a href=/.test(bar));
check('Announcement bar', 'Dismissible, remembered for the visit', /topbar-close/.test(bar) && /has-bar/.test(js) && /sessionStorage/.test(js));

// 1. Pill header
const header = section('header');
check('Pill header', 'Floating centred pill', rule('.pill-header', 'position:\\s*fixed') && /class="pill"/.test(header));
check('Pill header', 'Logo, current-section label and menu button', /class="logo"/.test(header) && /class="pill-label"/.test(header) && /class="menu-btn"/.test(header));
check('Pill header', 'Label follows the section in view', /dataset\.label/.test(js) && count(/data-label="/g) >= 8);
check('Pill header', 'Scroll progress line', /pill-progress/.test(header) && /--progress/.test(js));
check('Pill header', 'Menu opens, closes on Esc and outside click', /aria-expanded/.test(js) && /Escape/.test(js) && count(/<a href="#/g, (header.match(/id="menu"[\s\S]*?<\/nav>/) || [''])[0]) >= 5);

// 2. Hero
const hero = section('hero');
check('Hero', 'Full-bleed picture', /class="hero-img"/.test(hero) && rule('.hero-img', 'object-fit:\\s*cover') && /max\(620px, 100svh\)/.test(css));
check('Hero', 'Oversized serif headline (≥120px at desktop)', /<h1 class="mega"/.test(hero) && /\.mega\s*{[^}]*clamp\([^)]*1[2-9]\dpx\)/.test(css));
check('Hero', 'Two-line headline', /<h1[^>]*>[^<]+<br>[^<]+<\/h1>/.test(hero));

// 3. Statement + mosaic
const st = section('statement');
check('Statement', 'Centred statement with kicker', /class="kicker"/.test(st) && /class="reveal-text"/.test(st));
check('Statement', 'Words fill in on scroll', /class="w"/.test(js) && /--o/.test(js) && /\.reveal-text \.w/.test(css));
check('Statement', 'Six mosaic pictures around the text', count(/class="m m\d"/g, st) === 6);
check('Statement', 'Mosaic drifts on scroll (parallax)', /--shift/.test(js) && /--shift/.test(css));

// 4. Pillars
const pil = section('pillars');
check('Pillars', 'Large heading', /<h2 class="big"/.test(pil));
check('Pillars', 'Pinned picture beside the list', rule('.pillar-media', 'position:\\s*sticky'));
check('Pillars', 'Three pillars, each with its own picture', count(/<article class="pillar/g, pil) === 3 && count(/class="pillar-img/g, pil) === 3);
check('Pillars', 'Active pillar follows scroll', /setPillar/.test(js) && /\.pillar\.is-active/.test(css));

// 5. Services
const sv = section('services');
check('Services', 'Wide picture card with overlaid heading and button', /class="banner-card"/.test(sv) && /class="big light"/.test(sv) && /class="btn"/.test(sv));
check('Services', 'Three picture cards that stack while scrolling', count(/class="stack-card"/g, sv) === 3 && rule('.stack-card', 'position:\\s*sticky'));

// 6. Dark band
const sd = section('standard');
check('Dark band', 'Full-bleed dark picture with white heading, text and button', /class="standard-img"/.test(sd) && /class="big light"/.test(sd) && /<p>/.test(sd) && /class="btn"/.test(sd));

// 7. Industries (reference: partners)
const ind = section('industries');
check('Industries', 'Heading and intro', /<h2 class="big"/.test(ind) && /class="lead/.test(ind));
check('Industries', 'Picture with overlapping dark panel', /class="ind-img"/.test(ind) && /class="ind-panel"/.test(ind) && rule('.ind-panel', 'margin-bottom:\\s*-'));
check('Industries', 'Four tabs with keyboard support', count(/role="tab"/g, ind) === 4 && count(/role="tabpanel"/g, ind) === 4 && /ArrowRight/.test(js));

// 8. Insights
const ins = section('insights');
check('Insights', 'Warm grey band', rule('.insights', 'background:\\s*var\\(--warm\\)'));
check('Insights', 'Heading, button and prev/next arrows', /<h2 class="big">Insights\.<\/h2>/.test(ins) && /class="btn"/.test(ins) && count(/data-scroll=/g, ins) === 2 && /scrollBy/.test(js));
check('Insights', 'Four picture cards in a carousel', count(/<article class="insight"/g, ins) === 4 && rule('.insight-track', 'overflow-x:\\s*auto'));

// 9. Join
const jn = section('join');
check('Join', 'Oversized headline + button', /<h2 class="mega/.test(jn) && /class="btn"/.test(jn));
check('Join', 'Fanned row of four pictures', count(/<img/g, (jn.match(/class="fan"[\s\S]*?<\/div>/) || [''])[0]) === 4 && /rotate\(-6deg\)/.test(css));

// 10. Footer
const ft = section('footer');
check('Footer', 'Gradient tunnel background in brand colours', /radial-gradient\([^)]*var\(--ink-deep\)[^;]*var\(--teal\)/.test(css));
check('Footer', 'Closing line + button', /class="footer-title"/.test(ft) && /class="btn/.test(ft));
check('Footer', 'Link columns', count(/<h4>/g, ft) >= 3);
check('Footer', 'Giant wordmark', /class="wordmark"/.test(ft));

// Pictures: every picture slot of the reference has a new brand picture
const slots = imgs(html);
const files = slots.map((i) => i.src);
const allowed = new Set(['#1d2b44', '#142033', '#33476a', '#4f8a8b', '#8db7b5', '#d4e5e3', '#b8b0a6', '#d6d0c8', '#ebe7e2', '#8c857d', '#ffffff', '#fff', '#c9b8a3', '#b7a58f', '#e6f0f0',
  '#e9c8ab', '#c99b7a', '#8d5e44', '#f2d6c0', '#b07c5c', '#2b2522', '#6b4a35', '#bfa58a', '#3a2f2a', '#8a6a52']);
check('Pictures', '24 picture slots filled', slots.length === 24 && imgs(hero).length === 1 && imgs(st).length === 6 && imgs(pil).length === 3 && imgs(sv).length === 4 && imgs(sd).length === 1 && imgs(ind).length === 1 && imgs(ins).length === 4 && imgs(jn).length === 4);
check('Pictures', 'Every picture is a local file that exists', files.every((f) => /^images\/[\w-]+\.svg$/.test(f) && existsSync(join(root, f))));
check('Pictures', 'Every picture is different', new Set(files).size === files.length);
const offPalette = files.filter((f) => existsSync(join(root, f))).flatMap((f) =>
  [...read(f).matchAll(/#[0-9a-f]{3,6}\b/gi)].map((m) => m[0].toLowerCase()).filter((c) => !allowed.has(c)).map((c) => `${f}:${c}`));
check('Pictures', `Pictures use only the brand palette${offPalette.length ? ` (off: ${[...new Set(offPalette)].slice(0, 4).join(', ')})` : ''}`, offPalette.length === 0);
check('Pictures', 'Each picture shows navy and teal', files.every((f) => /#1d2b44/i.test(read(f)) && /#4f8a8b/i.test(read(f))));
check('Pictures', 'Pictures contain no text or logos', files.every((f) => !/<(text|image|use)\b/i.test(read(f))));
check('Pictures', 'Every picture has an alt attribute; key pictures are described', slots.every((i) => i.alt !== null) && [...imgs(hero), ...imgs(pil), ...imgs(ind)].every((i) => i.alt.length > 10));
check('Pictures', 'Pictures fill their slot (object-fit: cover)', count(/object-fit:\s*cover/g, css) >= 9);
check('Pictures', 'Generator script is included', existsSync(join(root, 'tools', 'gen-images.mjs')));
check('Pictures', 'No unused pictures in images/', existsSync(join(root, 'images')) && readdirSync(join(root, 'images')).every((n) => files.includes(`images/${n}`)));

// Responsive + accessibility
check('Responsive', 'Viewport meta', /name="viewport"/.test(html));
check('Responsive', 'Tablet breakpoint (≤900px)', /@media \(max-width: 900px\)/.test(css));
check('Responsive', 'Phone breakpoint (≤600px)', /@media \(max-width: 600px\)/.test(css));
check('Responsive', 'Side gutter ≥16px', /--gutter:\s*clamp\(16px/.test(css) && rule('.wrap', 'padding-inline:\\s*var\\(--gutter\\)'));
check('Responsive', 'Sticky and absolute layouts unpinned on small screens', /\.mosaic \.m\s*{[^}]*position:\s*static/.test(css) && /\.pillar-media\s*{[^}]*position:\s*relative/.test(css));
check('Accessibility', 'Reduced-motion support in CSS and JS', /prefers-reduced-motion/.test(css) && /prefers-reduced-motion/.test(js));
check('Accessibility', 'Visible focus style', /:focus-visible/.test(css));
check('Accessibility', 'html lang set', /<html lang="/.test(html));
check('Accessibility', 'Storage access guarded', /try\s*{\s*return sessionStorage/.test(js));

// Originality: nothing copied from the reference sites
const banned = ['Waabi', 'waabi.ai', 'Physical AI', 'Built to think', 'Born to haul', 'We built our own road', 'Unlocking scale', 'AV safety', 'Trusted by the best', 'just getting started',
  'Volvo', 'Uber', 'NVIDIA', 'Warrior Logistics', 'Nils Jaeger', 'NeueHaas', 'Zagma', 'robotaxi',
  'Jack', 'Jill', 'jackandjill', 'Tinker Tailor'];
const all = html + css + js;
const hits = banned.filter((w) => new RegExp(`\\b${w.replace(/[.,]/g, '\\$&')}\\b`, 'i').test(all));
check('Originality', `No reference brand, people, partners, copy or fonts${hits.length ? ` (found: ${hits.join(', ')})` : ''}`, hits.length === 0);
check('Originality', 'No hotlinked images or media', !/<(img|video|source)[^>]+src="https?:/i.test(html));

// Local files referenced actually exist
const refs = [...html.matchAll(/(?:href|src)="([^"#:?]+\.(?:css|js|svg))(?:\?[^"]*)?"/g)].map((m) => m[1]);
check('Files', 'All local references resolve', refs.length > 0 && refs.every((r) => existsSync(join(root, r))));

// Report
const failed = checks.filter((c) => !c.ok);
const groups = [...new Set(checks.map((c) => c.group))];
let out = `# Remake report\n\nDGK AB site built on the layout of the waabi.ai home page. Brand, copy and pictures are DGK AB's own.\n\n`;
for (const g of groups) {
  out += `## ${g}\n\n`;
  for (const c of checks.filter((x) => x.group === g)) out += `- [${c.ok ? 'x' : ' '}] ${c.label}\n`;
  out += '\n';
}
out += `**${checks.length - failed.length}/${checks.length} checks passed**\n\n`;
out += failed.length ? `REMAKE INCOMPLETE: ${failed.length} failing\n` : 'REMAKE COMPLETE\n';
writeFileSync(join(root, 'REPORT.md'), out);
console.log(out);
process.exit(failed.length ? 1 : 0);
