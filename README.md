# Mystique — homepage

Open `index.html` in a browser (double-click works). No build step and no dependencies.

```
index.html
css/styles.css     layout, glass panels, responsive rules
js/main.js         layered parallax, panel reveal, save (heart) toggles
assets/img/        satin backdrop, hero scene, product and collection photos
assets/fonts/      Playfair Display, Mulish, Pinyon Script (SIL Open Font License, licences included)
```

## How the depth works

The panels scroll normally. Behind them, `js/main.js` moves three things at slower speeds:

| Layer | Speed (desktop / phone) | Where to change it |
|---|---|---|
| Satin backdrop | 0.28 / 0.20 | `depths()` in `main.js` |
| Silver glints | 0.58 / 0.45 | `depths()` in `main.js` |
| Hero jewellery inside its window | sinks 23% of the hero height and zooms in 12% as the hero scrolls away | `heroTravel` / `heroZoom` in `depths()` |
| Photos marked `data-inner` | drift inside their frame | the `data-inner` value in `index.html` |

Lower numbers make the background feel further away; keep them under about 0.5 or the effect starts to feel floaty.
Each block reveals in two stages: it starts fully transparent, settles into the frosted glass panel, then its contents rise in one by one. The timing lives in the "Reveal on scroll" section of `styles.css` (the `0.75s` delay is how long the glass takes before the contents start).

Visitors who have "reduce motion" switched on get a still backdrop and no reveal animation.

## Images

The hero now uses your own pieces — the swan necklace and the blue and yellow bangles — cut out from your photos and placed on a satin backdrop with their real shadows. The other photos are taken from your first design mockup and upscaled 4× with Real-ESRGAN (the mockup was only 768 px wide). Baked-in text, heart icons and the LUNÉ name on the gift box were removed. The satin page background (`satin.jpg`) is rendered separately so it can repeat for any page length.

When you have final photography, replace files in `assets/img/` with the same names. Ideal sizes: hero 2400×935, products 800×950, categories 600×600, collection cards 1000×750.

## Before going live

- Confirm the prices on the best sellers (they come from the mockup).
- Add your WhatsApp link (search `aria-label="WhatsApp"`).
- Link the product, category and button `href="#"` placeholders to your real pages.
- The search box is visual only until it is connected to something.

## Tuning the glass

In `css/styles.css`, `:root`:

- `--glass` — panel tint and transparency (raise the last number for more solid panels)
- `--blur` — frosting strength (lower is cheaper on older phones)
