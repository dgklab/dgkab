// Generates the DGK AB brand illustrations in images/. Run with: node tools/gen-images.mjs
// Flat, daylight-lit scenes in the brand palette: deep navy, muted teal, warm grey, white.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'images');
mkdirSync(out, { recursive: true });

const C = {
  navy: '#1d2b44', navyDeep: '#142033', navySoft: '#33476a',
  teal: '#4f8a8b', tealLight: '#8db7b5', tealPale: '#d4e5e3',
  grey: '#b8b0a6', greyMid: '#d6d0c8', greyLight: '#ebe7e2', greyDark: '#8c857d',
  white: '#ffffff', wood: '#c9b8a3',
};
const SKIN = ['#e9c8ab', '#c99b7a', '#8d5e44', '#f2d6c0', '#b07c5c'];
const HAIR = ['#2b2522', '#6b4a35', '#bfa58a', '#3a2f2a', '#8a6a52'];

// Shared definitions: wall light, window glow, soft shadow
const defs = (id) => `<defs>
  <linearGradient id="${id}wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.white}"/><stop offset="1" stop-color="${C.greyLight}"/></linearGradient>
  <linearGradient id="${id}floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.greyMid}"/><stop offset="1" stop-color="${C.grey}"/></linearGradient>
  <linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6f0f0"/><stop offset="1" stop-color="${C.white}"/></linearGradient>
  <linearGradient id="${id}beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <radialGradient id="${id}shadow"><stop offset="0" stop-color="${C.navyDeep}" stop-opacity=".18"/><stop offset="1" stop-color="${C.navyDeep}" stop-opacity="0"/></radialGradient>
</defs>`;

const svg = (w, h, id, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">${defs(id)}${body}</svg>\n`;

const room = (id, w, h, floorY) =>
  `<rect width="${w}" height="${floorY}" fill="url(#${id}wall)"/><rect y="${floorY}" width="${w}" height="${h - floorY}" fill="url(#${id}floor)"/>`;

// Window with mullions, a skyline hint and a light beam falling into the room
const windowPane = (id, x, y, w, h, beamTo = 0) => `
  <rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" fill="${C.greyMid}"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}sky)"/>
  <path d="M${x} ${y + h} L${x} ${y + h * .72} L${x + w * .18} ${y + h * .72} L${x + w * .18} ${y + h * .6} L${x + w * .34} ${y + h * .6} L${x + w * .34} ${y + h * .78} L${x + w * .55} ${y + h * .78} L${x + w * .55} ${y + h * .55} L${x + w * .7} ${y + h * .55} L${x + w * .7} ${y + h * .7} L${x + w} ${y + h * .7} L${x + w} ${y + h} Z" fill="${C.tealPale}"/>
  <rect x="${x + w / 2 - 3}" y="${y}" width="6" height="${h}" fill="${C.greyMid}"/>
  <rect x="${x}" y="${y + h / 2 - 3}" width="${w}" height="6" fill="${C.greyMid}"/>
  ${beamTo ? `<path d="M${x} ${y} L${x + w} ${y} L${x + w + beamTo} ${y + h + beamTo * 1.4} L${x + beamTo * .4} ${y + h + beamTo * 1.4} Z" fill="url(#${id}beam)"/>` : ''}`;

const plant = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-18 0 L18 0 L14 40 L-14 40 Z" fill="${C.greyDark}"/>
  <path d="M0 0 C-30 -20 -34 -60 -10 -80 C-6 -50 -4 -30 0 0Z" fill="${C.teal}"/>
  <path d="M0 0 C28 -18 36 -56 14 -86 C8 -56 4 -30 0 0Z" fill="${C.tealLight}"/>
  <path d="M0 0 C-8 -30 -2 -70 6 -100 C10 -70 8 -30 0 0Z" fill="${C.teal}"/></g>`;

const shadow = (id, x, y, rx, ry = rx * .18) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${id}shadow)"/>`;

// Person, standing. (x, y) = feet centre on the floor; s = scale (1 ≈ 300px tall)
function standing(x, y, s, o = {}) {
  const { top = C.navy, legs = C.navyDeep, skin = SKIN[0], hair = HAIR[0], hold = '', arm = 'down', long = false } = o;
  const armPath = arm === 'point'
    ? `<path d="M40 -232 C70 -250 96 -268 118 -290" stroke="${top}" stroke-width="22" stroke-linecap="round" fill="none"/><circle cx="120" cy="-292" r="11" fill="${skin}"/>`
    : arm === 'hold'
    ? `<path d="M-38 -230 C-44 -180 -20 -150 6 -150" stroke="${top}" stroke-width="22" stroke-linecap="round" fill="none"/><path d="M38 -230 C44 -180 24 -150 6 -150" stroke="${top}" stroke-width="22" stroke-linecap="round" fill="none"/>`
    : `<path d="M40 -232 C48 -190 48 -160 44 -130" stroke="${top}" stroke-width="22" stroke-linecap="round" fill="none"/><circle cx="44" cy="-124" r="11" fill="${skin}"/>`;
  const leftArm = arm === 'hold' ? '' : `<path d="M-40 -232 C-48 -190 -48 -160 -44 -130" stroke="${top}" stroke-width="22" stroke-linecap="round" fill="none"/><circle cx="-44" cy="-124" r="11" fill="${skin}"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-30" y="-140" width="26" height="140" rx="10" fill="${legs}"/><rect x="4" y="-140" width="26" height="140" rx="10" fill="${legs}"/>
    <rect x="-34" y="-6" width="32" height="10" rx="5" fill="${C.navyDeep}"/><rect x="2" y="-6" width="32" height="10" rx="5" fill="${C.navyDeep}"/>
    <path d="M-46 -130 L-42 -236 C-40 -252 -24 -260 0 -260 C24 -260 40 -252 42 -236 L46 -130 Z" fill="${top}"/>
    <path d="M-12 -258 L0 -236 L12 -258 Z" fill="${C.white}"/>
    <rect x="-9" y="-276" width="18" height="20" fill="${skin}"/>
    ${long ? `<path d="M-30 -300 C-34 -270 -32 -246 -24 -236 L24 -236 C32 -246 34 -270 30 -300 Z" fill="${hair}"/>` : ''}
    <circle cx="0" cy="-300" r="28" fill="${skin}"/>
    <path d="M-29 -302 C-30 -330 -10 -338 2 -337 C22 -336 32 -322 29 -300 C20 -318 -10 -322 -29 -302Z" fill="${hair}"/>
    ${leftArm}${armPath}${hold}</g>`;
}

// Person, seated on a chair, side-on. (x, y) = floor point under the seat; dir = 1 faces right, -1 faces left
function seated(x, y, s, o = {}) {
  const { top = C.navy, legs = C.navyDeep, skin = SKIN[0], hair = HAIR[0], dir = 1, chair = C.greyDark, long = false } = o;
  return `<g transform="translate(${x} ${y}) scale(${s * dir} ${s})">
    <rect x="-40" y="-120" width="80" height="12" rx="6" fill="${chair}"/><rect x="-44" y="-230" width="14" height="120" rx="7" fill="${chair}"/>
    <rect x="-6" y="-110" width="10" height="110" fill="${chair}"/><rect x="-36" y="-6" width="72" height="8" rx="4" fill="${chair}"/>
    <path d="M-26 -132 L52 -132 C64 -132 70 -124 70 -112 L70 0 L50 0 L50 -110 L-26 -110 Z" fill="${legs}"/>
    <rect x="44" y="-6" width="36" height="10" rx="5" fill="${C.navyDeep}"/>
    <path d="M-30 -124 L-26 -230 C-24 -246 -10 -252 6 -252 C24 -252 34 -244 36 -228 L34 -124 Z" fill="${top}"/>
    <path d="M24 -226 C40 -190 56 -168 84 -160" stroke="${top}" stroke-width="20" stroke-linecap="round" fill="none"/><circle cx="88" cy="-160" r="10" fill="${skin}"/>
    <rect x="-2" y="-268" width="16" height="20" fill="${skin}"/>
    ${long ? `<path d="M-24 -290 C-28 -262 -26 -240 -18 -230 L18 -236 C14 -250 14 -270 18 -290 Z" fill="${hair}"/>` : ''}
    <circle cx="6" cy="-290" r="26" fill="${skin}"/>
    <path d="M-20 -292 C-22 -318 -2 -324 8 -323 C26 -322 34 -308 32 -292 C22 -306 -4 -310 -20 -292Z" fill="${hair}"/></g>`;
}

const table = (x, y, w, h = 110, top = C.wood) =>
  `<rect x="${x}" y="${y - h}" width="${w}" height="14" rx="4" fill="${top}"/><rect x="${x + 20}" y="${y - h + 14}" width="10" height="${h - 14}" fill="${C.greyDark}"/><rect x="${x + w - 30}" y="${y - h + 14}" width="10" height="${h - 14}" fill="${C.greyDark}"/>`;

const cup = (x, y) => `<rect x="${x}" y="${y - 22}" width="18" height="22" rx="3" fill="${C.white}"/><path d="M${x + 18} ${y - 16} a6 6 0 0 1 0 10" stroke="${C.white}" stroke-width="3" fill="none"/>`;
const notebook = (x, y, w = 60) => `<rect x="${x}" y="${y - 6}" width="${w}" height="6" rx="2" fill="${C.navySoft}"/><rect x="${x + 4}" y="${y - 9}" width="${w - 8}" height="4" rx="1" fill="${C.white}"/>`;
const laptop = (x, y) => `<path d="M${x} ${y} L${x + 70} ${y} L${x + 78} ${y - 4} L${x - 8} ${y - 4} Z" fill="${C.greyDark}"/><path d="M${x + 6} ${y - 4} L${x + 16} ${y - 52} L${x + 74} ${y - 52} L${x + 66} ${y - 4} Z" fill="${C.navySoft}"/>`;

// Whiteboard with a rising bar chart, trend line and sticky notes
const whiteboard = (x, y, w, h) => {
  const bars = [0.35, 0.5, 0.45, 0.68, 0.82].map((v, i) => {
    const bw = w * 0.07, bx = x + w * 0.08 + i * w * 0.1, bh = h * 0.6 * v;
    return `<rect x="${bx}" y="${y + h * 0.82 - bh}" width="${bw}" height="${bh}" rx="2" fill="${i === 4 ? C.teal : C.navySoft}"/>`;
  }).join('');
  const notes = [[0.66, 0.16, C.tealPale], [0.8, 0.16, C.greyMid], [0.66, 0.42, C.greyMid], [0.8, 0.42, C.tealLight], [0.73, 0.66, C.tealPale]]
    .map(([px, py, c], i) => `<rect x="${x + w * px}" y="${y + h * py}" width="${w * 0.12}" height="${w * 0.12}" fill="${c}" transform="rotate(${(i % 2 ? 3 : -3)} ${x + w * px} ${y + h * py})"/>`).join('');
  return `<rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="6" fill="${C.greyMid}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.white}"/>
    <line x1="${x + w * 0.06}" y1="${y + h * 0.82}" x2="${x + w * 0.58}" y2="${y + h * 0.82}" stroke="${C.navy}" stroke-width="2"/>${bars}
    <path d="M${x + w * 0.1} ${y + h * 0.56} L${x + w * 0.22} ${y + h * 0.46} L${x + w * 0.33} ${y + h * 0.5} L${x + w * 0.44} ${y + h * 0.32} L${x + w * 0.55} ${y + h * 0.18}" stroke="${C.teal}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${notes}`;
};

// Store shelving unit with stocked product blocks
const shelf = (x, y, w, h, seed = 0) => {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.greyMid}"/>`;
  const rows = 4, rh = h / rows;
  const palette = [C.teal, C.navySoft, C.tealLight, C.grey, C.white, C.navy];
  for (let r = 0; r < rows; r++) {
    const ry = y + r * rh;
    s += `<rect x="${x}" y="${ry + rh - 6}" width="${w}" height="6" fill="${C.greyDark}"/>`;
    let px = x + 6, i = 0;
    while (px < x + w - 18) {
      const pw = 14 + ((seed + r * 7 + i * 3) % 4) * 6, ph = rh * (0.45 + ((seed + i + r) % 3) * 0.12);
      if (px + pw > x + w - 6) break;
      s += `<rect x="${px}" y="${ry + rh - 6 - ph}" width="${pw}" height="${ph}" rx="2" fill="${palette[(seed + r + i) % palette.length]}"/>`;
      px += pw + 4; i++;
    }
  }
  return s;
};

const car = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-200 -30 C-200 -70 -170 -80 -130 -84 L-80 -130 C-60 -146 40 -150 80 -130 L140 -86 C186 -80 206 -66 206 -30 L206 -10 L-200 -10 Z" fill="${C.navy}"/>
  <path d="M-66 -122 L-110 -86 L-6 -86 L-6 -128 C-30 -128 -54 -126 -66 -122Z M8 -128 L8 -86 L118 -86 L74 -122 C56 -128 30 -129 8 -128Z" fill="${C.tealPale}" opacity=".85"/>
  <rect x="-200" y="-40" width="406" height="6" fill="${C.navySoft}"/>
  <circle cx="-120" cy="-10" r="38" fill="${C.navyDeep}"/><circle cx="-120" cy="-10" r="16" fill="${C.grey}"/>
  <circle cx="126" cy="-10" r="38" fill="${C.navyDeep}"/><circle cx="126" cy="-10" r="16" fill="${C.grey}"/>
  <path d="M186 -66 L206 -60 L206 -48 L190 -50Z" fill="${C.white}"/></g>`;

const tablet = `<rect x="-10" y="-176" width="34" height="46" rx="4" fill="${C.navyDeep}"/><rect x="-6" y="-172" width="26" height="38" rx="2" fill="${C.tealLight}"/>`;

const scenes = {
  // Hero, leaders card (4:3): executive coaching session by a window
  'hero-coaching.svg': () => svg(800, 600, 'a', `
    ${room('a', 800, 600, 470)}
    ${windowPane('a', 70, 70, 300, 300, 160)}
    ${plant(690, 470, 1.3)}
    ${shadow('a', 400, 472, 260)}
    ${seated(260, 470, 0.95, { dir: 1, top: C.teal, skin: SKIN[3], hair: HAIR[2], long: true })}
    ${seated(560, 470, 0.95, { dir: -1, top: C.navy, skin: SKIN[1], hair: HAIR[0] })}
    ${table(320, 470, 180, 112)}
    ${cup(350, 358)}${notebook(392, 358, 70)}${cup(470, 358)}`),

  // Hero, organisations card (4:3): performance workshop at a whiteboard
  'hero-workshop.svg': () => svg(800, 600, 'b', `
    ${room('b', 800, 600, 480)}
    ${whiteboard(250, 80, 420, 260)}
    ${shadow('b', 400, 482, 340)}
    ${standing(190, 480, 1.05, { top: C.navy, skin: SKIN[0], hair: HAIR[1], arm: 'point' })}
    ${seated(330, 600, 1, { dir: 1, top: C.teal, skin: SKIN[2], hair: HAIR[3], chair: C.navySoft })}
    ${seated(500, 600, 1, { dir: 1, top: C.greyDark, skin: SKIN[3], hair: HAIR[2], long: true, chair: C.navySoft })}
    ${seated(670, 600, 1, { dir: 1, top: C.navySoft, skin: SKIN[4], hair: HAIR[0], chair: C.navySoft })}`),

  // Portrait story cards (9:14)
  'story-retail.svg': () => svg(360, 560, 'c', `
    ${room('c', 360, 560, 440)}
    ${shelf(10, 90, 150, 330, 1)}${shelf(200, 90, 150, 330, 4)}
    ${shadow('c', 180, 442, 90)}
    ${standing(180, 470, 1, { top: C.teal, skin: SKIN[1], hair: HAIR[0], hold: tablet })}`),

  'story-automotive.svg': () => svg(360, 560, 'd', `
    ${room('d', 360, 560, 420)}
    ${windowPane('d', -20, 40, 400, 240, 0)}
    ${plant(28, 420, 0.8)}
    ${car(250, 430, 0.7)}
    ${shadow('d', 100, 432, 70)}
    ${standing(95, 460, 0.95, { top: C.navy, skin: SKIN[3], hair: HAIR[2], long: true })}`),

  'story-service.svg': () => svg(360, 560, 'e', `
    ${room('e', 360, 560, 440)}
    <rect x="30" y="80" width="300" height="70" rx="6" fill="${C.navy}"/><rect x="60" y="106" width="120" height="8" rx="4" fill="${C.tealLight}"/><rect x="60" y="122" width="80" height="6" rx="3" fill="${C.grey}"/>
    ${plant(310, 440, 0.9)}
    ${standing(170, 440, 0.95, { top: C.teal, skin: SKIN[2], hair: HAIR[3] })}
    <rect x="0" y="330" width="360" height="110" fill="${C.greyMid}"/><rect x="0" y="322" width="360" height="12" fill="${C.wood}"/>
    ${laptop(220, 322)}`),

  'story-executive.svg': () => svg(360, 560, 'f', `
    ${room('f', 360, 560, 450)}
    ${windowPane('f', 30, 30, 300, 380, 60)}
    ${plant(60, 450, 1.1)}
    ${shadow('f', 200, 452, 80)}
    ${standing(200, 470, 1, { top: C.navy, skin: SKIN[4], hair: HAIR[0], arm: 'hold', hold: `<rect x="-14" y="-170" width="40" height="30" rx="3" fill="${C.white}"/>` })}`),

  'story-training.svg': () => svg(360, 560, 'g', `
    ${room('g', 360, 560, 450)}
    <rect x="200" y="110" width="130" height="180" fill="${C.white}" stroke="${C.greyMid}" stroke-width="6"/>
    <rect x="216" y="134" width="70" height="8" rx="4" fill="${C.navy}"/><rect x="216" y="156" width="96" height="6" rx="3" fill="${C.teal}"/><rect x="216" y="172" width="80" height="6" rx="3" fill="${C.teal}"/><rect x="216" y="188" width="90" height="6" rx="3" fill="${C.teal}"/>
    <path d="M210 290 L196 450 M320 290 L334 450" stroke="${C.greyDark}" stroke-width="6"/>
    ${shadow('g', 130, 452, 80)}
    ${standing(130, 470, 1, { top: C.greyDark, skin: SKIN[0], hair: HAIR[1], long: true, arm: 'point' })}`),

  'story-team.svg': () => svg(360, 560, 'h', `
    ${room('h', 360, 560, 450)}
    ${windowPane('h', 40, 50, 280, 200, 0)}
    ${shadow('h', 180, 452, 150)}
    ${standing(70, 480, 0.85, { top: C.teal, skin: SKIN[2], hair: HAIR[0] })}
    ${standing(290, 480, 0.85, { top: C.navySoft, skin: SKIN[3], hair: HAIR[2], long: true })}
    ${standing(180, 500, 0.95, { top: C.navy, skin: SKIN[1], hair: HAIR[3], hold: tablet })}`),

  // Mission grid tiles
  'mission-meeting.svg': () => svg(480, 580, 'i', `
    ${room('i', 480, 580, 420)}
    ${windowPane('i', 60, 40, 360, 220, 80)}
    ${shadow('i', 240, 422, 220)}
    ${seated(110, 420, 0.75, { dir: 1, top: C.navy, skin: SKIN[0], hair: HAIR[1] })}
    ${seated(370, 420, 0.75, { dir: -1, top: C.teal, skin: SKIN[2], hair: HAIR[0], long: true })}
    ${standing(240, 440, 0.8, { top: C.navySoft, skin: SKIN[3], hair: HAIR[2], arm: 'hold', hold: `<rect x="-14" y="-170" width="40" height="30" rx="3" fill="${C.white}"/>` })}
    <rect x="0" y="420" width="480" height="160" fill="${C.wood}"/><rect x="0" y="420" width="480" height="10" fill="#b7a58f"/>
    ${notebook(90, 470, 80)}${cup(200, 476)}${laptop(300, 480)}`),

  'mission-store.svg': () => svg(600, 340, 'j', `
    ${room('j', 600, 340, 270)}
    ${shelf(0, 30, 200, 230, 2)}${shelf(400, 30, 200, 230, 5)}
    ${shadow('j', 300, 272, 120)}
    ${standing(245, 290, 0.8, { top: C.teal, skin: SKIN[1], hair: HAIR[0] })}
    ${standing(360, 290, 0.75, { top: C.navy, skin: SKIN[3], hair: HAIR[2], long: true, hold: tablet })}`),

  'mission-workshop.svg': () => svg(1000, 300, 'k', `
    ${room('k', 1000, 300, 250)}
    ${windowPane('k', 40, 30, 220, 160, 60)}${windowPane('k', 300, 30, 220, 160, 60)}
    ${whiteboard(620, 30, 300, 170)}
    ${seated(150, 300, 0.55, { dir: 1, top: C.navy, skin: SKIN[0], hair: HAIR[1], chair: C.navySoft })}
    ${seated(290, 300, 0.55, { dir: 1, top: C.teal, skin: SKIN[2], hair: HAIR[0], long: true, chair: C.navySoft })}
    ${seated(430, 300, 0.55, { dir: 1, top: C.greyDark, skin: SKIN[3], hair: HAIR[2], chair: C.navySoft })}
    ${standing(580, 270, 0.62, { top: C.navy, skin: SKIN[4], hair: HAIR[3], arm: 'point' })}`),
};

for (const [name, make] of Object.entries(scenes)) writeFileSync(join(out, name), make());
console.log(`Wrote ${Object.keys(scenes).length} images to images/`);
