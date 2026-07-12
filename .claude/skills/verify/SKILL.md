---
name: verify
description: How to build, launch, and drive CanvaWasm for runtime verification of canvas/editor changes.
---

# Verifying CanvaWasm changes

## Launch

```bash
npm install
npm run dev -- --port 5173   # background; ready when curl returns 200
```

Drive with Playwright + the preinstalled Chromium:

```js
import { chromium } from 'playwright-core'; // npm install playwright-core in scratchpad
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
```

## Driving the editor

- Upload an image: click `button.rail-btn:has-text("Uploads")`, then
  `page.setInputFiles('input[type=file]', {name, mimeType, buffer})`. Generate
  test PNGs inside the page via an offscreen canvas → `toDataURL`.
- Read object state from the Properties panel:
  `.field:has(label:text-is("X")) input` (labels: X, Y, W, H, Rotation).
- Sample rendered pixels from `canvas.lower-canvas` via `getImageData`;
  scene→element scale factor is `canvas.width / 900` (headless DPR = 1).
- Scene→page coords: `upperCanvasBox.{x,y} + scene * zoom`.

## Google Fonts in the test browser

Chromium can't reach fonts.googleapis.com directly (sandbox egress) and won't
trust the agent proxy's MITM cert, so canvas text silently renders in a serif
fallback — pixel assertions about glyphs then lie. Fix: run node with
`NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`, launch the browser with
`proxy: { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' }`,
and serve font URLs through Playwright's Node-side fetch:

```js
await page.route(/fonts\.(googleapis|gstatic)\.com/, async (route) => {
  const resp = await ctx.request.fetch(route.request());
  await route.fulfill({ response: resp });
});
```

To confirm a family really loaded, check `[...document.fonts].some(f =>
f.family === 'X' && f.status === 'loaded')` — `document.fonts.check()` returns
true even for unregistered families.

## Gotchas

- **fabric v7 defaults `originX/originY` to `'center'`** — `left`/`top` and the
  panel's X/Y are the object's *center*, and new objects placed at (100,100)
  hang partly off-canvas. Position/size math must use `getCenterPoint()` /
  `setPositionByOrigin()` or transform matrices, never raw left/top corner math.
- Corner drags scale proportionally (`uniformScaling`), so drag targets are not
  hit exactly — assert against panel-reported geometry, not drag coordinates.
- A selected object draws purple borders/handles that pollute pixel samples —
  press Escape to deselect before sampling.
- `addImage` scales uploads to max 500px and centers them at (100,100).
- The root `verify-*.mjs` scripts are historical one-offs that re-implement
  store logic in isolation; they are not a substitute for driving the UI.
