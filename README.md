# DGK AB website

One-page site for DGK AB, an independent management consulting and leadership development company in Sweden. The layout follows the structure of the waabi.ai home page. The brand, copy and pictures are DGK AB's own.

Plain HTML, CSS and JavaScript with no build step. Open `index.html` in a browser, or serve the folder with any static file server.

## Files

- `index.html`, `styles.css`, `script.js`: the page
- `images/`: brand illustrations in deep navy, muted teal, warm grey and white
- `tools/gen-images.mjs`: regenerates the illustrations (`node tools/gen-images.mjs`)
- `check.mjs`: checks the page section by section and writes `REPORT.md` (`node check.mjs`). The report ends with `REMAKE COMPLETE` when every check passes.

When you change `styles.css` or `script.js`, bump the `?v=` number on their links in `index.html` so returning visitors get the new files.

## Replacing the illustrations with photos

Each picture slot is a plain `<img>` with `object-fit: cover`, so a photo of any size fills it. Keep these shapes:

| Slot | File | Shape |
| --- | --- | --- |
| Hero (full screen) | `images/hero-office.svg` | 16:9 |
| Statement mosaic (6) | `images/mosaic-*.svg` | 4:3 |
| Pillars (3, swap on scroll) | `images/story-training.svg`, `images/mission-meeting.svg`, `images/story-automotive.svg` | 4:5 |
| Services banner | `images/services-banner.svg` | 16:9 |
| Service cards (3) | `images/hero-workshop.svg`, `images/hero-coaching.svg`, `images/card-training.svg` | 16:10 |
| Dark band (full screen) | `images/dusk-leader.svg` | 16:9, dark |
| Industries | `images/mission-store.svg` | 16:10 |
| Insights (4) | `images/insight-*.svg` | 4:3 |
| Join fan (4) | `images/story-retail.svg`, `images/story-service.svg`, `images/story-executive.svg`, `images/story-team.svg` | 9:14 portrait |

After swapping in photos, update the `src` and `alt` text in `index.html`. The checker's palette checks only cover SVG files.

## Before going live

- Contact details: "Book a call", "Talk to us" and the other buttons point to the in-page contact section. Add an email address, phone number or booking link.
- Insights are short practical notes, not links to full articles. Link them once articles exist.
- Privacy and Terms links in the footer are placeholders.
