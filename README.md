# DGK AB website

One-page site for DGK AB, an independent management consulting and leadership development company in Sweden. The layout follows the structure of the jackandjill.ai home page. The brand, copy and pictures are DGK AB's own.

Plain HTML, CSS and JavaScript with no build step. Open `index.html` in a browser, or serve the folder with any static file server.

## Files

- `index.html`, `styles.css`, `script.js`: the page
- `images/`: brand illustrations in deep navy, muted teal, warm grey and white
- `tools/gen-images.mjs`: regenerates the illustrations (`node tools/gen-images.mjs`)
- `check.mjs`: checks the page section by section and writes `REPORT.md` (`node check.mjs`). The report ends with `REMAKE COMPLETE` when every check passes.

## Replacing the illustrations with photos

Each picture slot is a plain `<img>` with `object-fit: cover`, so a photo of any size fills it. Keep these shapes:

| Slot | File | Shape |
| --- | --- | --- |
| Hero, leaders card | `images/hero-coaching.svg` | 4:3 |
| Hero, organisations card | `images/hero-workshop.svg` | 4:3 |
| Story cards (6) | `images/story-*.svg` | 9:14 portrait |
| Mission grid, tall tile | `images/mission-meeting.svg` | about 5:6 |
| Mission grid, small tile | `images/mission-store.svg` | about 16:9 |
| Mission grid, wide tile | `images/mission-workshop.svg` | about 7:2 |

After swapping in photos, update the `src` and `alt` text in `index.html`. The checker's palette checks only cover SVG files.

## Before going live

- Contact details: the "Book a call" and "Contact" buttons point to the in-page contact band. Add an email address, phone number or booking link.
- Privacy and Terms links in the footer are placeholders.
