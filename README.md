# DGK AB website

One-page site for DGK AB, an independent management consulting and leadership development company in Sweden. The layout follows the structure of the get-ripe.com home page. The brand, copy and pictures are DGK AB's own.

Plain HTML, CSS and JavaScript with no build step. Open `index.html` in a browser, or serve the folder with any static file server.

## Files

- `index.html`, `styles.css`, `script.js`: the page
- `images/`: brand illustrations in deep navy, muted teal, warm grey and white
- `tools/gen-images.mjs`: regenerates the illustrations the page uses (`node tools/gen-images.mjs`). It holds more scenes than the page needs, and writes only the ones `index.html` references.
- `check.mjs`: checks the page section by section and writes `REPORT.md` (`node check.mjs`). The report ends with `REMAKE COMPLETE` when every check passes.

When you change `styles.css` or `script.js`, bump the `?v=` number on their links in `index.html` so returning visitors get the new files.

## Replacing the illustrations with photos

Each picture slot is a plain `<img>` with `object-fit: cover`, so a photo of any size fills it. Keep these shapes:

| Slot | File | Shape |
| --- | --- | --- |
| Hero (full screen, sky) | `images/hero-sky.svg` | 16:9, keep it dark enough for white text |
| Offering cards (3) | `images/story-team.svg`, `images/story-executive.svg`, `images/story-training.svg` | 400:515 portrait |
| Organisations card | `images/story-retail.svg` | tall portrait |
| About | `images/about-duo.svg` | 4:5 |
| Our work strip (8) | `images/insight-*.svg`, `images/mosaic-*.svg` | 3:4 portrait |

After swapping in photos, update the `src` and `alt` text in `index.html`. The checker's palette checks only cover SVG files.

## Before going live

- Contact details: "Book a call", "Let's talk" and the other buttons point to the contact block at the bottom. Add an email address, phone number or booking link.
- The outcome cards describe typical results, not client quotes. Swap in real, approved client quotes when you have them.
- "Meet the team" and the privacy link are placeholders.
