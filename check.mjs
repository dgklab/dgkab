// Remake checker: compares the DGK AB page against the section-by-section layout
// of the reference home page (get-ripe.com), checks the brand pictures, and writes REPORT.md.
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

// Structure (reference order: promo bar, pill nav, sky hero, why we exist + offerings,
// for-companies card, founders, testimonials, follow-us gallery, newsletter footer)
const order = ['banner', 'header', 'hero', 'why', 'organisations', 'about', 'outcomes', 'gallery', 'footer'];
const found = [...html.matchAll(/data-section="([a-z]+)"/g)].map((m) => m[1]);
check('Structure', `All ${order.length} sections present`, order.every((s) => found.includes(s)));
check('Structure', 'Sections in reference order', JSON.stringify(found.filter((s) => order.includes(s))) === JSON.stringify(order));

// Brand
check('Brand', 'DGK AB in title, nav and footer', /<title>DGK AB/.test(html) && /class="logo"[^>]*>[\s\S]*?DGK AB/.test(section('header')) && /DGK AB/.test(section('footer')));
check('Brand', 'Navy, teal, warm grey and white tokens', /--ink:\s*#1d2b44/i.test(css) && /--teal:\s*#4f8a8b/i.test(css) && /--warm:\s*#e8e4df/i.test(css) && /--paper:\s*#fff/i.test(css));
check('Brand', 'Reference accents (yellow, sage, pink) swapped for brand teal and warm grey', rule('.pill-teal', 'var\\(--teal-light\\)') && rule('.pill-pale', 'var\\(--teal-pale\\)') && rule('.c2', 'var\\(--warm\\)'));
check('Brand', 'Services from the brief are named', ['Leadership development', 'Executive coaching', 'Corporate training', 'Performance analysis', 'Strategic planning', 'Operational improvement', 'change management'].every((s) => html.includes(s)));
check('Brand', 'Industries and levels from the brief are named', ['retail', 'automotive', 'service', 'Nordic'].every((s) => html.toLowerCase().includes(s.toLowerCase())));

// Type system
check('Type', 'Condensed uppercase display face', /--display:\s*"Anton"/.test(css) && rule('.shout', 'text-transform:\\s*uppercase') && /family=Anton/.test(html));
check('Type', 'Serif headline face for card and quote headings', rule('.serif-xl', 'var\\(--serif\\)') && rule('.big-quote', 'var\\(--serif\\)'));
check('Type', 'Small tracked uppercase eyebrows', rule('.eyebrow', 'text-transform:\\s*uppercase') && count(/class="eyebrow/g) >= 6);

// 0. Bar
const bar = section('banner');
check('Announcement bar', 'Message with link, dismissible for the visit', /<a href=/.test(bar) && /topbar-close/.test(bar) && /sessionStorage/.test(js));

// 1. Nav
const nav = section('header');
check('Pill nav', 'Dark floating pill', rule('.nav-wrap', 'position:\\s*fixed') && rule('.nav', 'background:\\s*var\\(--ink-deep\\)') && rule('.nav', 'border-radius'));
check('Pill nav', 'Logo, 4 links and a light CTA pill', /class="logo"/.test(nav) && count(/<a href="#/g, (nav.match(/class="nav-links"[\s\S]*?<\/div>/) || [''])[0]) === 4 && /pill pill-light nav-cta/.test(nav));
check('Pill nav', 'Mobile menu with Esc and outside click', /menu-btn/.test(nav) && /Escape/.test(js) && /aria-expanded/.test(js));

// 2. Hero
const hero = section('hero');
check('Hero', 'Full-bleed sky picture', /class="hero-img" src="images\/hero-sky\.svg"/.test(hero) && rule('.hero-img', 'object-fit:\\s*cover'));
check('Hero', 'Centred condensed uppercase two-line headline', /<h1 class="shout">[^<]+<br>[^<]+<\/h1>/.test(hero) && rule('.hero', 'text-align:\\s*center'));
check('Hero', 'Line of copy and two pill buttons', /<p>/.test(hero) && count(/class="pill /g, hero) === 2);

// 3. Why
const why = section('why');
check('Why we exist', 'Eyebrow, big headline and pill on the left; paragraphs on the right', /Why we exist/.test(why) && /class="shout dark"/.test(why) && /class="why-right/.test(why));
check('Why we exist', 'Paragraphs light up as you scroll', /fade-lines/.test(why) && /classList\.toggle\('on'/.test(js) && /\.js \.fade-lines p\.on/.test(css));
check('Why we exist', 'Three portrait offering cards with titles over the picture', count(/class="offer-card"/g, why) === 3 && /aspect-ratio:\s*400 \/ 515/.test(css) && rule('.offer-card span', 'position:\\s*absolute'));

// 4. Organisations
const org = section('organisations');
check('Organisations card', 'Rounded white card with portrait and copy side by side', rule('.org-card', 'background:\\s*var\\(--paper\\)') && rule('.org-card', 'grid-template-columns'));
check('Organisations card', 'Stacked sticker badges on the picture', count(/<span>DGK AB<\/span>/g, org) === 3);
check('Organisations card', 'Eyebrow, serif headline, services list and pill', /class="serif-xl"/.test(org) && count(/<li>/g, org) >= 5 && /class="pill/.test(org));

// 5. About
const ab = section('about');
check('About', 'Centred big headline and paragraph', /class="shout dark"/.test(ab) && rule('.about-inner', 'text-align:\\s*center'));
check('About', 'Portrait with tilted sticker and pill', /class="about-media"/.test(ab) && /class="tilt-sticker"/.test(ab) && rule('.tilt-sticker', 'rotate') && /class="pill/.test(ab));

// 6. Outcomes (reference: testimonials)
const oc = section('outcomes');
check('Outcomes', 'Dark band with eyebrow and centred serif headline', rule('.outcomes', 'background:\\s*var\\(--ink-deep\\)') && /class="serif-xl light center"/.test(oc));
check('Outcomes', 'At least 5 coloured cards in a carousel with arrows', count(/<article class="outcome c\d"/g, oc) >= 5 && count(/data-scroll=/g, oc) === 2 && /scrollBy/.test(js));
check('Outcomes', 'Cards describe outcomes, not invented client quotes', [...oc.matchAll(/class="big-quote">([^<]*)/g)].every((m) => !/[“”"]/.test(m[1])));

// 7. Gallery (reference: follow us)
const gl = section('gallery');
check('Gallery', 'Eyebrow + big headline', /class="eyebrow"/.test(gl) && /class="shout dark"/.test(gl));
check('Gallery', 'Strip of 8 portrait pictures in a seamless marquee', count(/<img/g, gl) === 8 && /aspect-ratio:\s*235 \/ 314/.test(css) && /@keyframes marquee/.test(css) && /cloneNode/.test(js));
check('Gallery', 'Pill below', /class="pill/.test(gl));

// 8. Footer
const ft = section('footer');
check('Footer', 'Eyebrow, serif headline and call to action', /class="eyebrow"/.test(ft) && /class="serif-xl center"/.test(ft) && /class="pill pill-dark"/.test(ft));
check('Footer', 'No fake signup form', !/<form|type="email"/.test(ft));
check('Footer', 'Giant wordmark with a moving badge', /class="wordmark"/.test(ft) && /class="badge"/.test(ft) && /@keyframes wobble/.test(css));
check('Footer', 'Copyright and privacy link', /©/.test(ft) && /Privacy/.test(ft));

// Pictures
const slots = imgs(html);
const files = slots.map((i) => i.src);
const allowed = new Set(['#1d2b44', '#142033', '#33476a', '#4f8a8b', '#8db7b5', '#d4e5e3', '#b8b0a6', '#d6d0c8', '#ebe7e2', '#8c857d', '#ffffff', '#fff', '#c9b8a3', '#b7a58f', '#e6f0f0',
  '#e9c8ab', '#c99b7a', '#8d5e44', '#f2d6c0', '#b07c5c', '#2b2522', '#6b4a35', '#bfa58a', '#3a2f2a', '#8a6a52']);
check('Pictures', '14 picture slots filled (hero 1, offerings 3, card 1, about 1, gallery 8)', slots.length === 14 && imgs(hero).length === 1 && imgs(why).length === 3 && imgs(org).length === 1 && imgs(ab).length === 1 && imgs(gl).length === 8);
check('Pictures', 'Every picture is a local file that exists', files.every((f) => /^images\/[\w-]+\.svg$/.test(f) && existsSync(join(root, f))));
check('Pictures', 'Every picture is different', new Set(files).size === files.length);
const offPalette = files.filter((f) => existsSync(join(root, f))).flatMap((f) =>
  [...read(f).matchAll(/#[0-9a-f]{3,6}\b/gi)].map((m) => m[0].toLowerCase()).filter((c) => !allowed.has(c)).map((c) => `${f}:${c}`));
check('Pictures', `Pictures use only the brand palette${offPalette.length ? ` (off: ${[...new Set(offPalette)].slice(0, 4).join(', ')})` : ''}`, offPalette.length === 0);
check('Pictures', 'Each picture shows navy and teal', files.every((f) => /#1d2b44/i.test(read(f)) && /#4f8a8b/i.test(read(f))));
check('Pictures', 'Pictures contain no text or logos', files.every((f) => !/<(text|image|use)\b/i.test(read(f))));
check('Pictures', 'Every picture has an alt attribute; content pictures are described', slots.every((i) => i.alt !== null) && [...imgs(org), ...imgs(ab), ...imgs(gl)].every((i) => i.alt.length > 10));
check('Pictures', 'Every slot type fills with object-fit: cover', ['.hero-img', '.offer-card img', '.org-media img', '.about-media img', '.gallery img'].every((s) => rule(s, 'object-fit:\\s*cover')));
check('Pictures', 'Generator writes exactly the pictures the page uses', /src="images/.test(read('tools/gen-images.mjs')) && existsSync(join(root, 'images')) && readdirSync(join(root, 'images')).sort().join() === [...new Set(files.map((f) => f.slice(7)))].sort().join());

// Responsive + accessibility
check('Responsive', 'Viewport meta', /name="viewport"/.test(html));
check('Responsive', 'Tablet breakpoint (≤900px)', /@media \(max-width: 900px\)/.test(css));
check('Responsive', 'Phone breakpoint (≤600px)', /@media \(max-width: 600px\)/.test(css));
check('Responsive', 'Side gutter ≥16px', /--gutter:\s*clamp\(16px/.test(css) && rule('.wrap', 'padding-inline:\\s*var\\(--gutter\\)'));
check('Responsive', 'Split layouts stack on small screens', /\.why-grid\s*{\s*grid-template-columns:\s*1fr;/.test(css) && /\.org-card\s*{\s*grid-template-columns:\s*1fr;/.test(css));
check('Accessibility', 'Content stays visible without JavaScript', /\.js \.fade-lines p\s*{/.test(css) && /\.js \.nav-links:not\(\.open\)/.test(css) && /classList\.add\('js'\)/.test(js));
check('Accessibility', 'Reduced-motion support in CSS and JS', /prefers-reduced-motion/.test(css) && /prefers-reduced-motion/.test(js));
check('Accessibility', 'Visible focus style', /:focus-visible/.test(css));
check('Accessibility', 'Marquee copies hidden from screen readers', /aria-hidden/.test(js) && /copy\.alt = ''/.test(js));
check('Accessibility', 'html lang set', /<html lang="/.test(html));

// Originality: nothing copied from the reference sites
const banned = ['RIPE', 'get-ripe', 'Leadership is a lifestyle', 'Get Your Mind', 'Women\'s Leadership Intensive', 'GYMR', 'Megan', 'Eric', 'Matt Nurse', 'Allison Ellsworth', 'poppi', 'stay ripe',
  'Leadership felt stale', 'aren\'t born', 'Bespoke Offsites', 'Leadership Labs', 'Nautic', 'SeriouslyNostalgic', 'Follow us',
  'Waabi', 'Physical AI', 'Jack', 'Jill', 'jackandjill'];
const all = html + css + js;
const hits = banned.filter((w) => new RegExp(`\\b${w.replace(/[.,']/g, '\\$&')}\\b`, w === 'RIPE' ? '' : 'i').test(all));
check('Originality', `No reference brand, people, clients, copy or fonts${hits.length ? ` (found: ${hits.join(', ')})` : ''}`, hits.length === 0);
check('Originality', 'No hotlinked images or media', !/<(img|video|source)[^>]+src="https?:/i.test(html));

// Local files referenced actually exist
const refs = [...html.matchAll(/(?:href|src)="([^"#:?]+\.(?:css|js|svg))(?:\?[^"]*)?"/g)].map((m) => m[1]);
check('Files', 'All local references resolve', refs.length > 0 && refs.every((r) => existsSync(join(root, r))));

// Report
const failed = checks.filter((c) => !c.ok);
const groups = [...new Set(checks.map((c) => c.group))];
let out = `# Remake report\n\nDGK AB site built on the layout of the get-ripe.com home page. Brand, copy and pictures are DGK AB's own.\n\n`;
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
