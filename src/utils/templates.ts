import * as fabric from 'fabric';
import { ensureFontLoaded } from './fonts';

export interface TemplateDef {
  id: string;
  name: string;
  category: 'social' | 'video' | 'print' | 'web';
  width: number;
  height: number;
  background: string;
  preview: {
    from: string;
    to: string;
    accents?: string[];
  };
  build: (
    canvas: fabric.Canvas,
    fab: typeof fabric,
    applyCornerStyle: (obj: fabric.Object) => void
  ) => Promise<void>;
}

/**
 * Textbox helper that pins its vertical center to a badge's center.
 * Using originY: 'center' is more reliable than eyeballing (top - fontSize/2)
 * because it stays correct regardless of ascender/descender metrics.
 */
const centeredLabel = (
  fab: typeof fabric,
  text: string,
  opts: { left: number; centerY: number; width: number; fontSize: number; fill: string }
) =>
  new fab.Textbox(text, {
    originX: 'left',
    originY: 'center',
    left: opts.left,
    top: opts.centerY,
    width: opts.width,
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: opts.fontSize,
    fill: opts.fill,
    textAlign: 'center',
  });

const heading = (fab: typeof fabric, text: string, opts: any) =>
  new fab.Textbox(text, {
    fontFamily: 'Inter',
    fontWeight: '700',
    fill: '#111827',
    lineHeight: 1.08,
    originX: 'left',
    originY: 'top',
    ...opts,
  });

const body = (fab: typeof fabric, text: string, opts: any) =>
  new fab.Textbox(text, {
    fontFamily: 'Inter',
    fontWeight: '400',
    fill: '#4b5563',
    lineHeight: 1.4,
    originX: 'left',
    originY: 'top',
    ...opts,
  });

/** Rect filled with a linear gradient (percentage coords, default diagonal). */
const gradRect = (
  fab: typeof fabric,
  opts: { left: number; top: number; width: number; height: number; rx?: number },
  stops: [number, string][],
  coords: { x1: number; y1: number; x2: number; y2: number } = { x1: 0, y1: 0, x2: 1, y2: 1 }
) => {
  const r = new fab.Rect({
    originX: 'left',
    originY: 'top',
    rx: opts.rx ?? 0,
    ry: opts.rx ?? 0,
    ...opts,
  });
  r.set(
    'fill',
    new fab.Gradient({
      type: 'linear',
      gradientUnits: 'percentage',
      coords,
      colorStops: stops.map(([offset, color]) => ({ offset, color })),
    })
  );
  return r;
};

/** Circle positioned by its center (decorative orbs, rings, badges). */
const orb = (fab: typeof fabric, opts: any) =>
  new fab.Circle({ originX: 'center', originY: 'center', ...opts });

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'ig-post-modern',
    name: 'IG Post — Modern',
    category: 'social',
    width: 1080,
    height: 1080,
    background: '#0f172a',
    preview: { from: '#0f172a', to: '#1e293b', accents: ['#7c5cff'] },
    build: async (canvas, fab, styled) => {
      await ensureFontLoaded('Inter');
      // Accent bar
      const accent = new fab.Rect({
        originX: 'left', originY: 'top',
        left: 80, top: 140, width: 56, height: 6, fill: '#7c5cff',
      });
      // Heading — explicit line break to guarantee 2 lines
      // fontSize 92, lineHeight 1.08 → 2 lines = 198px. Starts at 170, ends at 368.
      const h = heading(fab, 'Big Bold\nHeading', {
        left: 80, top: 170, width: 920,
        fontSize: 92, fill: '#f8fafc',
      });
      // Sub — gap of 60px after heading; fontSize 30, line-height 1.4 → up to ~85px
      const s = body(fab, 'A crisp subheading that sets the tone for the post.', {
        left: 80, top: 430, width: 880,
        fontSize: 30, fill: '#cbd5e1',
      });
      const cta = new fab.Textbox('Learn more →', {
        originX: 'left', originY: 'top',
        left: 80, top: 900, width: 400,
        fontFamily: 'Inter', fontWeight: '600',
        fontSize: 28, fill: '#7c5cff',
      });
      [accent, h, s, cta].forEach((o) => {
        styled(o);
        canvas.add(o);
      });
    },
  },
  {
    id: 'ig-story-sale',
    name: 'IG Story — Sale',
    category: 'social',
    width: 1080,
    height: 1920,
    background: '#7c5cff',
    preview: { from: '#7c5cff', to: '#4f46e5', accents: ['#facc15'] },
    build: async (canvas, fab, styled) => {
      await ensureFontLoaded('Inter');
      // Badge pill (padded proportionally)
      const badgeTop = 220;
      const badgeH = 64;
      const badge = new fab.Rect({
        originX: 'left', originY: 'top',
        left: 80, top: badgeTop, width: 280, height: badgeH,
        rx: badgeH / 2, ry: badgeH / 2, fill: '#facc15',
      });
      const badgeText = centeredLabel(fab, 'LIMITED', {
        left: 80, centerY: badgeTop + badgeH / 2, width: 280,
        fontSize: 26, fill: '#0f172a',
      });
      // Heading — 200px font (down from 240). 2 lines * 200 * 1.05 = 420. Starts at 360 → ends at 780.
      const h = heading(fab, 'MEGA\nSALE', {
        left: 80, top: 360, width: 920,
        fontSize: 200, fill: '#ffffff', lineHeight: 1.05,
      });
      // Sub — 120px gap under heading
      const s = body(fab, 'Up to 50% off — this weekend only.', {
        left: 80, top: 900, width: 920,
        fontSize: 40, fill: '#f1f5f9',
      });
      const cta = new fab.Textbox('SHOP NOW →', {
        originX: 'left', originY: 'top',
        left: 80, top: 1120, width: 500,
        fontFamily: 'Inter', fontWeight: '700', fontSize: 36,
        fill: '#facc15',
      });
      [badge, badgeText, h, s, cta].forEach((o) => {
        styled(o);
        canvas.add(o);
      });
    },
  },
  {
    id: 'yt-thumbnail',
    name: 'YouTube Thumbnail',
    category: 'video',
    width: 1280,
    height: 720,
    background: '#111827',
    preview: { from: '#111827', to: '#374151', accents: ['#ef4444', '#facc15'] },
    build: async (canvas, fab, styled) => {
      await ensureFontLoaded('Inter');
      const badgeTop = 60;
      const badgeH = 52;
      const badge = new fab.Rect({
        originX: 'left', originY: 'top',
        left: 60, top: badgeTop, width: 220, height: badgeH,
        rx: 8, ry: 8, fill: '#ef4444',
      });
      const badgeText = centeredLabel(fab, 'NEW VIDEO', {
        left: 60, centerY: badgeTop + badgeH / 2, width: 220,
        fontSize: 24, fill: '#ffffff',
      });
      // Heading — 80px, 2 lines * 1.08 = 172. Starts at 160 → ends at 332.
      const h = heading(fab, 'HOW TO BUILD\nA PHOTO EDITOR', {
        left: 60, top: 160, width: 1160,
        fontSize: 80, fill: '#facc15',
      });
      // Sub — gap of 88px
      const s = body(fab, 'React + Fabric.js + WebAssembly', {
        left: 60, top: 420, width: 1160,
        fontSize: 36, fill: '#e5e7eb',
      });
      [badge, badgeText, h, s].forEach((o) => {
        styled(o);
        canvas.add(o);
      });
    },
  },
  {
    id: 'fb-cover-business',
    name: 'Facebook Cover',
    category: 'social',
    width: 820,
    height: 312,
    background: '#f9fafb',
    preview: { from: '#f9fafb', to: '#e5e7eb', accents: ['#7c5cff'] },
    build: async (canvas, fab, styled) => {
      await ensureFontLoaded('Inter');
      // Vertical accent bar — aligned to heading block. Content vertically centered in the 312px canvas.
      // Content block ~120px tall centered around y=156 → starts at ~96.
      const bar = new fab.Rect({
        originX: 'left', originY: 'top',
        left: 40, top: 100, width: 6, height: 100, fill: '#7c5cff',
      });
      // Heading top aligned with bar top for clean visual alignment.
      const h = heading(fab, 'Your Business', {
        left: 60, top: 96, width: 720,
        fontSize: 44, fill: '#0f172a',
      });
      const s = body(fab, 'Design · Craft · Ship', {
        left: 60, top: 168, width: 720,
        fontSize: 22, fill: '#4b5563',
      });
      [bar, h, s].forEach((o) => {
        styled(o);
        canvas.add(o);
      });
    },
  },
  {
    id: 'a4-poster',
    name: 'A4 Event Poster',
    category: 'print',
    width: 794,
    height: 1123,
    background: '#fef3c7',
    preview: { from: '#fef3c7', to: '#fde68a', accents: ['#7c2d12'] },
    build: async (canvas, fab, styled) => {
      await ensureFontLoaded('Inter');
      const tag = body(fab, 'DEC 21 · 7:00 PM', {
        left: 60, top: 80, width: 674,
        fontSize: 22, fill: '#7c2d12', fontWeight: '600',
      });
      // Heading — 104px * 2 * 1.05 = 218. Starts at 150 → ends at 368. Gap over tag = 35px.
      const h = heading(fab, 'DESIGN\nSHOWCASE', {
        left: 60, top: 150, width: 674,
        fontSize: 104, fill: '#7c2d12', lineHeight: 1.05,
      });
      // Sub — gap of ~130px
      const s = body(fab, 'A gathering for designers, makers, and dreamers.', {
        left: 60, top: 480, width: 674,
        fontSize: 26, fill: '#4b1c0d',
      });
      const cta = new fab.Textbox('RSVP → design.showcase', {
        originX: 'left', originY: 'top',
        left: 60, top: 1000, width: 674,
        fontFamily: 'Inter', fontWeight: '600', fontSize: 22,
        fill: '#7c2d12',
      });
      [tag, h, s, cta].forEach((o) => {
        styled(o);
        canvas.add(o);
      });
    },
  },
  {
    id: 'presentation-slide',
    name: 'Presentation Slide',
    category: 'web',
    width: 1920,
    height: 1080,
    background: '#ffffff',
    preview: { from: '#ffffff', to: '#f8fafc', accents: ['#3b82f6', '#0ea5e9'] },
    build: async (canvas, fab, styled) => {
      await ensureFontLoaded('Inter');
      const bar = new fab.Rect({
        originX: 'left', originY: 'top',
        left: 120, top: 180, width: 120, height: 12, fill: '#3b82f6',
      });
      const h = heading(fab, 'Q3 Strategy & Results', {
        left: 120, top: 260, width: 1680,
        fontSize: 140, fill: '#0f172a',
      });
      const s = body(fab, 'Delivering on key metrics across all major product lines.', {
        left: 120, top: 480, width: 1680,
        fontSize: 56, fill: '#64748b',
      });
      const tag = body(fab, 'COMPANY CONFIDENTIAL — INTERNAL USE ONLY', {
        left: 120, top: 920, width: 1680,
        fontSize: 24, fill: '#cbd5e1', fontWeight: '600',
      });
      [bar, h, s, tag].forEach((o) => {
        styled(o);
        canvas.add(o);
      });
    },
  },
  {
    id: 'twitter-header',
    name: 'Twitter Header',
    category: 'social',
    width: 1500,
    height: 500,
    background: '#1da1f2',
    preview: { from: '#1da1f2', to: '#0ea5e9', accents: ['#ffffff'] },
    build: async (canvas, fab, styled) => {
      await ensureFontLoaded('Inter');
      const h = heading(fab, 'Follow the journey.', {
        left: 100, top: 180, width: 1300,
        fontSize: 96, fill: '#ffffff',
      });
      const s = body(fab, 'Code · Design · Tech Updates', {
        left: 100, top: 320, width: 1300,
        fontSize: 32, fill: '#e0f2fe',
      });
      [h, s].forEach((o) => {
        styled(o);
        canvas.add(o);
      });
    },
  },
  {
    id: 'business-card',
    name: 'Business Card',
    category: 'print',
    width: 1050,
    height: 600,
    background: '#171717',
    preview: { from: '#171717', to: '#262626', accents: ['#10b981'] },
    build: async (canvas, fab, styled) => {
      await ensureFontLoaded('Inter');
      const name = heading(fab, 'ALEX MORGAN', {
        left: 80, top: 120, width: 890,
        fontSize: 72, fill: '#ffffff',
      });
      const title = body(fab, 'Lead Product Designer', {
        left: 80, top: 220, width: 890,
        fontSize: 32, fill: '#10b981', fontWeight: '600',
      });
      const divider = new fab.Rect({
        originX: 'left', originY: 'top',
        left: 80, top: 320, width: 890, height: 4, fill: '#404040',
      });
      const contact = body(fab, 'alex@example.com   ·   +1 (555) 000-0000   ·   alexmorgan.design', {
        left: 80, top: 440, width: 890,
        fontSize: 24, fill: '#a3a3a3',
      });
      [name, title, divider, contact].forEach((o) => {
        styled(o);
        canvas.add(o);
      });
    },
  },

  /* ---------------- Modern set ---------------- */
  {
    id: 'ig-gradient-glow',
    name: 'IG Post — Gradient Glow',
    category: 'social',
    width: 1080,
    height: 1080,
    background: '#1e1b4b',
    preview: { from: '#1e1b4b', to: '#4c1d95', accents: ['#db2777'] },
    build: async (canvas, fab, styled) => {
      await Promise.all([ensureFontLoaded('Bebas Neue'), ensureFontLoaded('Inter')]);
      const glow1 = orb(fab, { left: 160, top: 170, radius: 380, fill: '#7c3aed', opacity: 0.55 });
      const glow2 = orb(fab, { left: 950, top: 930, radius: 320, fill: '#db2777', opacity: 0.5 });
      // Glassmorphism card
      const card = new fab.Rect({
        originX: 'left', originY: 'top',
        left: 120, top: 300, width: 840, height: 480, rx: 28, ry: 28,
        fill: 'rgba(255,255,255,0.08)',
        stroke: 'rgba(255,255,255,0.28)', strokeWidth: 2,
      });
      const h = heading(fab, 'CREATE\nSOMETHING NEW', {
        left: 180, top: 360, width: 720,
        fontFamily: 'Bebas Neue', fontWeight: '400',
        fontSize: 100, fill: '#ffffff', lineHeight: 1.0,
      });
      const s = body(fab, 'Design bold. Ship faster.', {
        left: 180, top: 600, width: 640, fontSize: 32, fill: '#e2e8f0',
      });
      const pillTop = 690;
      const pill = new fab.Rect({
        originX: 'left', originY: 'top',
        left: 180, top: pillTop, width: 270, height: 60, rx: 30, ry: 30, fill: '#ffffff',
      });
      const pillText = centeredLabel(fab, 'GET STARTED', {
        left: 180, centerY: pillTop + 30, width: 270, fontSize: 22, fill: '#1e1b4b',
      });
      [glow1, glow2, card, h, s, pill, pillText].forEach((o) => { styled(o); canvas.add(o); });
    },
  },
  {
    id: 'ig-minimal-quote',
    name: 'IG Post — Minimal Quote',
    category: 'social',
    width: 1080,
    height: 1080,
    background: '#faf7f2',
    preview: { from: '#faf7f2', to: '#ede5d8', accents: ['#1c1917'] },
    build: async (canvas, fab, styled) => {
      await Promise.all([ensureFontLoaded('Playfair Display'), ensureFontLoaded('Inter')]);
      const mark = new fab.Textbox('“', {
        originX: 'left', originY: 'top',
        left: 90, top: 40, width: 300,
        fontFamily: 'Playfair Display', fontSize: 280, fill: '#d6c7b0',
      });
      const quote = new fab.Textbox('Simplicity is the ultimate sophistication.', {
        originX: 'left', originY: 'top',
        left: 120, top: 330, width: 840,
        fontFamily: 'Playfair Display', fontStyle: 'italic',
        fontSize: 84, fill: '#1c1917', lineHeight: 1.25,
      });
      const rule = new fab.Rect({
        originX: 'left', originY: 'top',
        left: 120, top: 800, width: 120, height: 3, fill: '#1c1917',
      });
      const author = body(fab, '— LEONARDO DA VINCI', {
        left: 120, top: 840, width: 700,
        fontSize: 26, fill: '#a8a29e', fontWeight: '600', charSpacing: 200,
      });
      [mark, quote, rule, author].forEach((o) => { styled(o); canvas.add(o); });
    },
  },
  {
    id: 'ig-story-neon',
    name: 'IG Story — Neon Night',
    category: 'social',
    width: 1080,
    height: 1920,
    background: '#0a0a14',
    preview: { from: '#0a0a14', to: '#1e1b4b', accents: ['#e879f9', '#22d3ee'] },
    build: async (canvas, fab, styled) => {
      await Promise.all([ensureFontLoaded('Bebas Neue'), ensureFontLoaded('Inter')]);
      const ring1 = orb(fab, { left: 920, top: 260, radius: 420, fill: '', stroke: '#22d3ee', strokeWidth: 2 });
      const ring2 = orb(fab, { left: 130, top: 1620, radius: 380, fill: '', stroke: '#e879f9', strokeWidth: 2 });
      const pillTop = 300;
      const pill = new fab.Rect({
        originX: 'left', originY: 'top',
        left: 90, top: pillTop, width: 320, height: 64, rx: 32, ry: 32, fill: '#e879f9',
      });
      const pillText = centeredLabel(fab, 'JUN 21 · 10 PM', {
        left: 90, centerY: pillTop + 32, width: 320, fontSize: 24, fill: '#0a0a14',
      });
      const h = heading(fab, 'NEON\nNIGHTS', {
        left: 85, top: 440, width: 920,
        fontFamily: 'Bebas Neue', fontWeight: '400',
        fontSize: 230, fill: '#ffffff', lineHeight: 0.95,
      });
      h.set('shadow', new fab.Shadow({ color: '#e879f9', blur: 46, offsetX: 0, offsetY: 0 }));
      const s = body(fab, 'Live DJ · Rooftop · Free entry', {
        left: 90, top: 1010, width: 900, fontSize: 38, fill: '#a5f3fc',
      });
      const cta = body(fab, 'RSVP NOW →', {
        left: 90, top: 1700, width: 500, fontSize: 40, fill: '#22d3ee', fontWeight: '700',
      });
      [ring1, ring2, pill, pillText, h, s, cta].forEach((o) => { styled(o); canvas.add(o); });
    },
  },
  {
    id: 'ig-product-drop',
    name: 'IG Post — Product Drop',
    category: 'social',
    width: 1080,
    height: 1080,
    background: '#f4f4f5',
    preview: { from: '#f4f4f5', to: '#111827', accents: ['#facc15'] },
    build: async (canvas, fab, styled) => {
      await Promise.all([ensureFontLoaded('Anton'), ensureFontLoaded('Inter')]);
      const panel = gradRect(
        fab,
        { left: 540, top: 0, width: 540, height: 1080 },
        [[0, '#111827'], [1, '#334155']],
        { x1: 0, y1: 0, x2: 1, y2: 1 }
      );
      const dashRing = orb(fab, {
        left: 810, top: 400, radius: 205, fill: '',
        stroke: '#facc15', strokeWidth: 2, strokeDashArray: [12, 10],
      });
      const price = orb(fab, { left: 810, top: 400, radius: 165, fill: '#facc15' });
      const priceText = new fab.Textbox('ONLY\n$49', {
        originX: 'center', originY: 'center',
        left: 810, top: 400, width: 300,
        fontFamily: 'Inter', fontWeight: '700', fontSize: 58,
        fill: '#111827', textAlign: 'center', lineHeight: 1.1,
      });
      const caption = body(fab, 'DROP 004 — SUMMER EDITION', {
        left: 600, top: 920, width: 420, fontSize: 22, fill: '#94a3b8',
        textAlign: 'center', charSpacing: 150, fontWeight: '600',
      });
      const tag = body(fab, 'NEW DROP', {
        left: 80, top: 140, width: 400, fontSize: 28, fill: '#7c5cff',
        fontWeight: '700', charSpacing: 300,
      });
      const h = heading(fab, 'AIR ZOOM\nSNEAKER', {
        left: 80, top: 210, width: 440,
        fontFamily: 'Anton', fontWeight: '400',
        fontSize: 92, fill: '#111827', lineHeight: 1.08,
      });
      const s = body(fab, 'Limited run.\nPremium comfort.', {
        left: 80, top: 480, width: 380, fontSize: 28, fill: '#52525b',
      });
      const ctaTop = 870;
      const cta = new fab.Rect({
        originX: 'left', originY: 'top',
        left: 80, top: ctaTop, width: 300, height: 72, rx: 36, ry: 36, fill: '#111827',
      });
      const ctaText = centeredLabel(fab, 'SHOP NOW', {
        left: 80, centerY: ctaTop + 36, width: 300, fontSize: 24, fill: '#ffffff',
      });
      [panel, dashRing, price, priceText, caption, tag, h, s, cta, ctaText].forEach((o) => {
        styled(o); canvas.add(o);
      });
    },
  },
  {
    id: 'yt-thumb-impact',
    name: 'YT Thumbnail — Impact',
    category: 'video',
    width: 1280,
    height: 720,
    background: '#18181b',
    preview: { from: '#18181b', to: '#ef4444', accents: ['#fde047'] },
    build: async (canvas, fab, styled) => {
      await Promise.all([ensureFontLoaded('Anton'), ensureFontLoaded('Inter')]);
      const wedge = new fab.Path('M 820 0 L 1280 0 L 1280 720 L 1020 720 Z', {
        originX: 'left', originY: 'top', left: 820, top: 0,
      });
      wedge.set(
        'fill',
        new fab.Gradient({
          type: 'linear',
          gradientUnits: 'percentage',
          coords: { x1: 0, y1: 0, x2: 1, y2: 1 },
          colorStops: [
            { offset: 0, color: '#ef4444' },
            { offset: 1, color: '#f97316' },
          ],
        })
      );
      const badgeTop = 60;
      const badge = new fab.Rect({
        originX: 'left', originY: 'top',
        left: 60, top: badgeTop, width: 190, height: 52, rx: 26, ry: 26, fill: '#ef4444',
      });
      const badgeText = centeredLabel(fab, 'EP. 12', {
        left: 60, centerY: badgeTop + 26, width: 190, fontSize: 24, fill: '#ffffff',
      });
      const h = heading(fab, 'LEVEL UP\nYOUR CODE', {
        left: 60, top: 150, width: 720,
        fontFamily: 'Anton', fontWeight: '400',
        fontSize: 120, fill: '#ffffff', lineHeight: 1.02,
      });
      h.set('shadow', new fab.Shadow({ color: 'rgba(0,0,0,0.6)', blur: 0, offsetX: 6, offsetY: 6 }));
      const s = body(fab, 'in 10 minutes', {
        left: 64, top: 440, width: 600, fontSize: 44, fill: '#fde047', fontWeight: '700',
      });
      [wedge, badge, badgeText, h, s].forEach((o) => { styled(o); canvas.add(o); });
    },
  },
  {
    id: 'slide-dark-stats',
    name: 'Presentation — Dark Stats',
    category: 'web',
    width: 1920,
    height: 1080,
    background: '#0b1220',
    preview: { from: '#0b1220', to: '#1e3a8a', accents: ['#38bdf8', '#a78bfa'] },
    build: async (canvas, fab, styled) => {
      await Promise.all([ensureFontLoaded('Bebas Neue'), ensureFontLoaded('Inter')]);
      const glow = orb(fab, { left: 1720, top: 130, radius: 420, fill: '#1d4ed8', opacity: 0.25 });
      const kicker = body(fab, 'Q3 REVIEW', {
        left: 140, top: 140, width: 600, fontSize: 28, fill: '#60a5fa',
        fontWeight: '700', charSpacing: 300,
      });
      const h = heading(fab, 'The numbers that matter', {
        left: 140, top: 210, width: 1400, fontSize: 110, fill: '#f8fafc',
      });
      const stats: [string, string, string][] = [
        ['4.2M', 'Monthly users', '#38bdf8'],
        ['98%', 'Satisfaction', '#a78bfa'],
        ['12×', 'Faster builds', '#34d399'],
      ];
      const items: fabric.Object[] = [glow, kicker, h];
      stats.forEach(([num, label, color], i) => {
        const x = 140 + i * 540;
        items.push(
          new fab.Rect({
            originX: 'left', originY: 'top',
            left: x, top: 560, width: 480, height: 300, rx: 24, ry: 24,
            fill: 'rgba(255,255,255,0.06)',
            stroke: 'rgba(255,255,255,0.15)', strokeWidth: 2,
          }),
          heading(fab, num, {
            left: x + 44, top: 610, width: 400,
            fontFamily: 'Bebas Neue', fontWeight: '400', fontSize: 110, fill: color,
          }),
          body(fab, label, { left: x + 44, top: 760, width: 400, fontSize: 28, fill: '#94a3b8' })
        );
      });
      items.forEach((o) => { styled(o); canvas.add(o); });
    },
  },
  {
    id: 'poster-sunset-fest',
    name: 'A4 Poster — Sunset Fest',
    category: 'print',
    width: 794,
    height: 1123,
    background: '#1c1917',
    preview: { from: '#f97316', to: '#e11d48', accents: ['#1c1917'] },
    build: async (canvas, fab, styled) => {
      await Promise.all([ensureFontLoaded('Bebas Neue'), ensureFontLoaded('Inter')]);
      const date = body(fab, 'AUG 30 · DUNE BEACH', {
        left: 60, top: 80, width: 674, fontSize: 24, fill: '#fdba74',
        fontWeight: '600', textAlign: 'center', charSpacing: 250,
      });
      const sun = orb(fab, { left: 397, top: 430, radius: 260 });
      sun.set(
        'fill',
        new fab.Gradient({
          type: 'linear',
          gradientUnits: 'percentage',
          coords: { x1: 0, y1: 0, x2: 0, y2: 1 },
          colorStops: [
            { offset: 0, color: '#fbbf24' },
            { offset: 0.55, color: '#f97316' },
            { offset: 1, color: '#e11d48' },
          ],
        })
      );
      const h = heading(fab, 'SUNSET\nFEST', {
        left: 60, top: 620, width: 674,
        fontFamily: 'Bebas Neue', fontWeight: '400',
        fontSize: 150, fill: '#fff7ed', lineHeight: 0.95, textAlign: 'center',
      });
      h.set('shadow', new fab.Shadow({ color: 'rgba(0,0,0,0.45)', blur: 24, offsetX: 0, offsetY: 8 }));
      const lineup = body(fab, 'LUNA RAY · THE MIDNIGHTS · ECHO PARK · DJ SOL', {
        left: 60, top: 960, width: 674, fontSize: 22, fill: '#fca5a5',
        textAlign: 'center', charSpacing: 120,
      });
      [date, sun, h, lineup].forEach((o) => { styled(o); canvas.add(o); });
    },
  },
  {
    id: 'card-gradient',
    name: 'Business Card — Gradient',
    category: 'print',
    width: 1050,
    height: 600,
    background: '#fafafa',
    preview: { from: '#7c5cff', to: '#22d3ee', accents: ['#18181b'] },
    build: async (canvas, fab, styled) => {
      await Promise.all([ensureFontLoaded('Bebas Neue'), ensureFontLoaded('Inter')]);
      const panel = gradRect(
        fab,
        { left: 0, top: 0, width: 380, height: 600 },
        [[0, '#7c5cff'], [1, '#22d3ee']],
        { x1: 0, y1: 0, x2: 0.6, y2: 1 }
      );
      const initials = new fab.Textbox('AM', {
        originX: 'left', originY: 'top',
        left: 0, top: 215, width: 380,
        fontFamily: 'Bebas Neue', fontSize: 150, fill: '#ffffff', textAlign: 'center',
      });
      const name = heading(fab, 'Alex Morgan', {
        left: 450, top: 170, width: 540, fontSize: 62, fill: '#18181b',
      });
      const role = body(fab, 'Product Designer', {
        left: 450, top: 265, width: 540, fontSize: 28, fill: '#7c5cff', fontWeight: '600',
      });
      const contact = body(fab, 'alex@studio.design\n+1 (555) 010-2030\nstudio.design', {
        left: 450, top: 370, width: 540, fontSize: 24, fill: '#52525b', lineHeight: 1.7,
      });
      [panel, initials, name, role, contact].forEach((o) => { styled(o); canvas.add(o); });
    },
  },
  {
    id: 'linkedin-banner',
    name: 'LinkedIn Banner',
    category: 'social',
    width: 1584,
    height: 396,
    background: '#f8fafc',
    preview: { from: '#f8fafc', to: '#e0e7ff', accents: ['#6366f1'] },
    build: async (canvas, fab, styled) => {
      await Promise.all([ensureFontLoaded('Playfair Display'), ensureFontLoaded('Inter')]);
      const blob1 = orb(fab, { left: 1440, top: 190, radius: 300, fill: '#e0e7ff', opacity: 0.9 });
      const blob2 = orb(fab, { left: 1180, top: 360, radius: 160, fill: '#c7d2fe', opacity: 0.7 });
      const bar = new fab.Rect({
        originX: 'left', originY: 'top',
        left: 90, top: 92, width: 70, height: 6, fill: '#6366f1',
      });
      const h = heading(fab, 'Building delightful products.', {
        left: 90, top: 130, width: 980,
        fontFamily: 'Playfair Display', fontSize: 64, fill: '#0f172a',
      });
      const s = body(fab, 'Product Design Lead · Speaker · Mentor', {
        left: 90, top: 240, width: 900, fontSize: 26, fill: '#64748b',
      });
      [blob1, blob2, bar, h, s].forEach((o) => { styled(o); canvas.add(o); });
    },
  },
  {
    id: 'pin-blog',
    name: 'Pinterest Pin — Blog',
    category: 'social',
    width: 1000,
    height: 1500,
    background: '#fffbeb',
    preview: { from: '#fcd34d', to: '#f97316', accents: ['#451a03'] },
    build: async (canvas, fab, styled) => {
      await Promise.all([ensureFontLoaded('Playfair Display'), ensureFontLoaded('Inter')]);
      const photo = gradRect(
        fab,
        { left: 60, top: 60, width: 880, height: 700, rx: 24 },
        [[0, '#fcd34d'], [1, '#f97316']]
      );
      const photoHint = body(fab, 'YOUR PHOTO HERE', {
        left: 60, top: 390, width: 880, fontSize: 26, fill: 'rgba(255,255,255,0.9)',
        textAlign: 'center', fontWeight: '700', charSpacing: 300,
      });
      const kicker = body(fab, '5-MINUTE READ', {
        left: 60, top: 830, width: 880, fontSize: 24, fill: '#b45309',
        textAlign: 'center', fontWeight: '700', charSpacing: 300,
      });
      const title = new fab.Textbox('10 Habits of Highly Creative People', {
        originX: 'left', originY: 'top',
        left: 100, top: 900, width: 800,
        fontFamily: 'Playfair Display', fontSize: 72, fill: '#451a03',
        textAlign: 'center', lineHeight: 1.2,
      });
      const footer = new fab.Rect({
        originX: 'left', originY: 'top',
        left: 0, top: 1360, width: 1000, height: 140, fill: '#451a03',
      });
      const site = centeredLabel(fab, 'yourblog.com', {
        left: 0, centerY: 1430, width: 1000, fontSize: 30, fill: '#fde68a',
      });
      [photo, photoHint, kicker, title, footer, site].forEach((o) => { styled(o); canvas.add(o); });
    },
  },
];

