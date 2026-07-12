# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server (default: http://localhost:5173)
- `npm run build` — Type-check with `tsc -b` then produce a production Vite bundle
- `npm run lint` — Run `oxlint` (config in `.oxlintrc.json`; enforces `react/rules-of-hooks` and `react/only-export-components`)
- `npm run preview` — Serve the production build locally

No test runner is configured.

## Architecture

CanvaWasm is a fully client-side React 19 + TypeScript + Vite SPA. There is no backend. All rendering and image processing happens in the browser.

### Rendering pipeline

- **Fabric.js v6** owns the canvas. A single `fabric.Canvas` instance is created in `src/components/Workspace.tsx` inside a `useEffect` and handed to the Zustand store via `setCanvas`. Selection events (`selection:created/updated/cleared`) push the active object back into the store so React components can react to it. Note the Fabric v6 import style: `import * as fabric from 'fabric'` and image loading via `fabric.FabricImage.fromURL` (not the v5 `fabric.Image.fromURL` callback API).
- **Zustand store** (`src/store/useEditorStore.ts`) is the single source of truth for `canvas` and `activeObject`, and exposes all mutating actions (`addRect`, `addCircle`, `addText`, `addImage`, `deleteSelected`, `updateSelectedProperty`). Components never touch the Fabric canvas directly for mutations — they call store actions. After every mutation the store calls `canvas.requestRenderAll()`.
- **React re-render trick for property edits**: `updateSelectedProperty` mutates the Fabric object in place, then sets `activeObject` to a shallow clone (`Object.assign(Object.create(Object.getPrototypeOf(...)), ...)`) so React sees a new reference and re-renders the property panel. Be careful preserving this pattern when editing that function.

### Component layout

- `App` → `Layout` → (`Topbar` on top; `Sidebar` + `Workspace` below).
- `Sidebar` — adds elements (rect/circle/text) and uploads images (via `URL.createObjectURL`).
- `Topbar` — dynamic property editor. Which controls appear is decided by inspecting `activeObject.type` (`image`, `text`/`i-text`/`textbox`, `rect`/`circle`/`polygon`/`path`). Also hosts the WASM filter buttons and Delete.
- `Workspace` — mounts the Fabric canvas and installs the global `keydown` handler for Delete/Backspace. The handler intentionally short-circuits when the target is an `<input>`/`<textarea>` or when the active Fabric object is in text-edit mode (`isEditing`) — preserve that guard.

### WebAssembly image filters

`src/utils/wasmFilters.ts` bridges Fabric ↔ Photon:

1. Grab the underlying `HTMLImageElement` from the Fabric image (`fabricImg.getElement()`).
2. Draw it onto a temporary `<canvas>` to get raw pixel data.
3. `photon.open_image(tempCanvas, ctx)` → `photon.filter(photonImg, filterName)` → `photon.putImageData(...)`.
4. **Always call `photonImg.free()`** — this releases WASM-side memory; skipping it leaks.
5. Read the temp canvas back as a data URL and call `fabricImg.setSrc(dataUrl)` before `requestRenderAll()`.

The `@silvia-odwyer/photon` package auto-loads its `.wasm` via Vite's default asset handling; no extra Vite plugin is needed today, but if you add filters that need explicit WASM initialization you may have to configure `vite.config.ts`.

### Styling

Styling is inline React styles that reference CSS variables defined in `src/index.css` (`--primary`, `--bg-panel`, `--sidebar-width`, `--topbar-height`, etc.). When adding UI, prefer these variables over hardcoded colors/dimensions to stay consistent with the existing look.
