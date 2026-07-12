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
];

