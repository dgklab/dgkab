// Remake checker: compares the DGK AB page against the section-by-section layout
// of the reference landing page, checks the brand imagery, and writes REPORT.md.
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
  const m = html.match(new RegExp(`<(section|header|footer)[^>]*data-section="${name}"[\\s\\S]*?</\\1>`));
  return m ? m[0] : '';
};
const imgs = (s) => [...s.matchAll(/<img\b[^>]*>/g)].map((m) => ({
  tag: m[0],
  src: (m[0].match(/src="([^"]+)"/) || [])[1] || '',
  alt: (m[0].match(/alt="([^"]*)"/) || [null, null])[1],
}));

const checks = [];
const check = (group, label, ok) => checks.push({ group, label, ok: Boolean(ok) });

// Section order (reference: header, hero, logo strip, tabs, cta, stories, stats, mission, footer)
const order = ['header', 'hero', 'logos', 'tabs', 'cta', 'testimonials', 'stats', 'mission', 'footer'];
const found = [...html.matchAll(/data-section="([a-z]+)"/g)].map((m) => m[1]);
check('Structure', `All ${order.length} sections present`, order.every((s) => found.includes(s)));
check('Structure', 'Sections in reference order', JSON.stringify(found.filter((s) => order.includes(s))) === JSON.stringify(order));

// Brand
check('Brand', 'DGK AB in page title, logo and footer', /<title>DGK AB/.test(html) && /class="logo"[^>]*>[\s\S]*?DGK AB/.test(section('header')) && /DGK AB/.test(section('footer')));
check('Brand', 'Navy, teal, warm grey and white tokens', /--ink:\s*#1d2b44/i.test(css) && /--teal:\s*#4f8a8b/i.test(css) && /--cream:\s*#f4f2ef/i.test(css) && /--paper:\s*#fff/i.test(css));
check('Brand', 'Services from the brief are named', ['Leadership development', 'Executive coaching', 'Corporate training', 'Performance analysis', 'Strategic planning', 'Operational improvement'].every((s) => html.includes(s)));
check('Brand', 'Industries from the brief are named', ['Retail', 'Automotive', 'Service'].every((s) => html.includes(s)));
check('Brand', 'No leftover placeholder brand', !/\b(Pip|Wren)\b/.test(html + css + js));

// Header
const header = section('header');
check('Header', 'Logo with mark', /class="logo-mark"/.test(header));
check('Header', '4 nav links', count(/<a [^>]*>/g, (header.match(/class="main-nav"[\s\S]*?<\/nav>/) || [''])[0]) === 4);
check('Header', 'Secondary + primary buttons', /btn btn-ghost/.test(header) && /class="btn"/.test(header));
check('Header', 'Sticky header', /\.site-header\s*{[^}]*position:\s*sticky/.test(css));
check('Header', 'Mobile menu toggle wired up', /menu-toggle/.test(header) && /aria-expanded/.test(js));

// Hero
const hero = section('hero');
check('Hero', 'Eyebrow link above headline', /class="eyebrow"/.test(hero));
check('Hero', 'Serif display h1', /<h1 class="display"/.test(hero) && /\.display\s*{[^}]*var\(--serif\)/.test(css));
check('Hero', 'Split: two audience cards', count(/class="hero-card"/g, hero) === 2 && count(/class="kicker"/g, hero) === 2);
check('Hero', 'One CTA per card', count(/class="btn"/g, hero) >= 2);
check('Hero', 'Picture in each card, 4:3', count(/class="media hero-media"/g, hero) === 2 && /\.hero-media\s*{[^}]*aspect-ratio:\s*4\s*\/\s*3/.test(css));

// Experience strip (reference: logo strip)
const logos = section('logos');
check('Logo strip', 'At least 6 items', count(/<span>[^<]+<\/span>/g, logos) >= 6);
check('Logo strip', 'Scrolling marquee', /@keyframes marquee/.test(css));

// Tabs
const tabs = section('tabs');
check('Tabs', 'Section title', /<h2 class="section-title"/.test(tabs));
check('Tabs', 'Two tabs', count(/role="tab"/g, tabs) === 2);
check('Tabs', 'Two tab panels', count(/role="tabpanel"/g, tabs) === 2);
const firstPanel = (tabs.match(/role="tabpanel"[\s\S]*?(?=role="tabpanel"|$)/) || [''])[0];
check('Tabs', 'First panel has 4 features', count(/class="feature"/g, firstPanel) === 4);
check('Tabs', 'Feedback card', /feedback-card/.test(firstPanel));
check('Tabs', 'Keyboard tab switching', /ArrowRight/.test(js) && /aria-selected/.test(js));
check('Tabs', 'Scroll reveal with fallback', /IntersectionObserver/.test(js) && /reveal-ready/.test(js) && /setTimeout/.test(js));

// CTA
const cta = section('cta');
check('CTA', 'Dark band with serif headline', /class="display-sm"/.test(cta) && /\.cta\s*{[^}]*background:\s*var\(--ink\)/.test(css));
check('CTA', 'Supporting line + button', /<p>/.test(cta) && /class="btn/.test(cta));

// Stories
const stories = section('testimonials');
check('Stories', 'Section heading', /class="section-title-sm"/.test(stories));
check('Stories', '6 portrait cards', count(/<figure class="story"/g, stories) === 6);
check('Stories', 'Portrait aspect ratio 9:14', /\.story\s*{[^}]*aspect-ratio:\s*9\s*\/\s*14/.test(css));
check('Stories', 'Prev/next carousel controls', count(/data-scroll=/g, stories) === 2 && /scrollBy/.test(js));

// Stats
const stats = section('stats');
check('Stats', 'Three stats', count(/data-count="\d+"/g, stats) === 3);
check('Stats', 'Animated counters with fallback', /requestAnimationFrame/.test(js) && /textContent === '0'/.test(js));

// Mission
const mission = section('mission');
check('Mission', '"…run like clockwork" heading', /run like clockwork/.test(mission));
check('Mission', 'Picture grid + clock tile', count(/class="tile/g, mission) === 4 && /<svg/.test(mission) && /@keyframes spin/.test(css));
check('Mission', 'Link after the mission copy', /class="mission-copy"[\s\S]*?<a /.test(mission));
check('Mission', 'Final call to action', /class="wrap final-cta"/.test(mission) && /class="btn/.test(mission));

// Footer
const footer = section('footer');
check('Footer', 'Five link columns', count(/<h4>/g, footer) === 5);
check('Footer', 'Light footer background', /\.site-footer\s*{[^}]*var\(--cream\)/.test(css));
check('Footer', 'Large wordmark', /class="wordmark"/.test(footer));

// Pictures: every picture slot of the reference has a new brand picture
const slots = [...imgs(hero), ...imgs(stories), ...imgs(mission)];
const allowed = new Set(['#1d2b44', '#142033', '#33476a', '#4f8a8b', '#8db7b5', '#d4e5e3', '#b8b0a6', '#d6d0c8', '#ebe7e2', '#8c857d', '#ffffff', '#fff', '#c9b8a3', '#b7a58f', '#e6f0f0',
  '#e9c8ab', '#c99b7a', '#8d5e44', '#f2d6c0', '#b07c5c', '#2b2522', '#6b4a35', '#bfa58a', '#3a2f2a', '#8a6a52']);
const files = slots.map((i) => i.src);
check('Pictures', '11 picture slots filled (2 hero, 6 stories, 3 mission)', imgs(hero).length === 2 && imgs(stories).length === 6 && imgs(mission).length === 3);
check('Pictures', 'Every picture is a local file that exists', files.every((f) => /^images\/[\w-]+\.svg$/.test(f) && existsSync(join(root, f))));
check('Pictures', 'Every picture is different', new Set(files).size === files.length);
const offPalette = files.filter((f) => existsSync(join(root, f))).flatMap((f) =>
  [...read(f).matchAll(/#[0-9a-f]{3,6}\b/gi)].map((m) => m[0].toLowerCase()).filter((c) => !allowed.has(c)).map((c) => `${f}:${c}`));
check('Pictures', `Pictures use only the brand palette${offPalette.length ? ` (off: ${[...new Set(offPalette)].slice(0, 4).join(', ')})` : ''}`, offPalette.length === 0);
check('Pictures', 'Each picture shows navy and teal', files.every((f) => /#1d2b44/i.test(read(f)) && /#4f8a8b/i.test(read(f))));
check('Pictures', 'Pictures contain no text or logos', files.every((f) => !/<(text|image|use)\b/i.test(read(f))));
check('Pictures', 'Informative pictures have alt text; story backdrops are decorative', [...imgs(hero), ...imgs(mission)].every((i) => i.alt && i.alt.length > 10) && imgs(stories).every((i) => i.alt === ''));
check('Pictures', 'Pictures fill their slot (object-fit: cover)', /\.media img\s*{[^}]*object-fit:\s*cover/.test(css) && /\.story > img\s*{[^}]*object-fit:\s*cover/.test(css) && /\.tile img\s*{[^}]*object-fit:\s*cover/.test(css));
check('Pictures', 'Generator script is included', existsSync(join(root, 'tools', 'gen-images.mjs')));
check('Pictures', 'No unused pictures in images/', existsSync(join(root, 'images')) && readdirSync(join(root, 'images')).every((n) => files.includes(`images/${n}`)));

// Responsive + accessibility
check('Responsive', 'Viewport meta', /name="viewport"/.test(html));
check('Responsive', 'Tablet breakpoint (≤900px)', /@media \(max-width: 900px\)/.test(css));
check('Responsive', 'Phone breakpoint (≤600px)', /@media \(max-width: 600px\)/.test(css));
check('Responsive', 'Side gutter ≥16px', /\.wrap\s*{[^}]*padding-inline:\s*clamp\(16px/.test(css));
check('Accessibility', 'Reduced-motion support', /prefers-reduced-motion/.test(css));
check('Accessibility', 'Visible focus style', /:focus-visible/.test(css));
check('Accessibility', 'html lang set', /<html lang="/.test(html));

// Originality: nothing copied from the reference site
const banned = ['Jack', 'Jill', 'jackandjill', 'Tinker Tailor', 'Tavus', 'Maze', 'Ramp', 'Corgi', 'Multiverse', 'Strala', 'Attio', 'Warden', '6,303', '425,862', '124,570,427', 'diatype', 'marist',
  'remarkable people', 'ambitious companies', 'Stop applying', 'getting introduced', 'Success stories from both sides'];
const all = html + css + js;
const hits = banned.filter((w) => new RegExp(`\\b${w.replace(/[.,]/g, '\\$&')}\\b`, 'i').test(all));
check('Originality', `No reference brand, people, customers, copy or fonts${hits.length ? ` (found: ${hits.join(', ')})` : ''}`, hits.length === 0);
check('Originality', 'No hotlinked images or media', !/<(img|video|source)[^>]+src="https?:/i.test(html));

// Local files referenced actually exist
const refs = [...html.matchAll(/(?:href|src)="([^"#:]+\.(?:css|js|svg))"/g)].map((m) => m[1]);
check('Files', 'All local references resolve', refs.length > 0 && refs.every((r) => existsSync(join(root, r))));

// Report
const failed = checks.filter((c) => !c.ok);
const groups = [...new Set(checks.map((c) => c.group))];
let out = `# Remake report\n\nDGK AB site built on the layout of the jackandjill.ai home page. Brand, copy and pictures are DGK AB's own.\n\n`;
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
