// Redraws src/assets/email-logo-{light,dark}.png — the lockup from components/Logo.astro,
// baked into a PNG because no email client will load Space Grotesk, IBM Plex Mono and
// Caveat. One per site theme, named for the background it sits on, both on transparent;
// contact-email.ts picks the one matching the theme it draws the message in.
//
//   node scripts/email-logo.mjs

import CanvasKitInit from 'canvaskit-wasm';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

const CK = await CanvasKitInit();
const face = (p) => CK.Typeface.MakeFreeTypeFaceFromData(readFileSync(p).buffer);

const grotesk = face('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff');
const mono = face('node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff');
const caveat = face('node_modules/@fontsource/caveat/files/caveat-latin-600-normal.woff');
console.log('faces', !!grotesk, !!mono, !!caveat);

// global.css, the two themes' --text / --text-muted / --accent.
const THEMES = {
  dark: { word: '#EDEDEF', tag: '#8A8A92', my: '#6E8BFF' },
  light: { word: '#131315', tag: '#5E5E66', my: '#4A5FE0' },
};

const S = 6;                    // supersample; trimmed + downscaled afterwards
const W = 300 * S, H = 120 * S;

const paint = (hex) => { const p = new CK.Paint(); p.setColor(CK.parseColorString(hex)); p.setAntiAlias(true); return p; };
const font = (tf, size) => { const f = new CK.Font(tf, size * S); f.setSubpixel(true); return f; };

// CSS line-height:1 boxes, so the baseline sits under half the leading.
const baseline = (f, top, size) => {
  const m = f.getMetrics();
  const asc = Math.abs(m.ascent), desc = Math.abs(m.descent);
  return top * S + ((size * S - (asc + desc)) / 2) + asc;
};
const width = (f, text) => f.getGlyphWidths(f.getGlyphIDs(text)).reduce((a, b) => a + b, 0);

const OX = 40 * S, OY = 30 * S;  // room for the rotated "my" to overhang

for (const [name, colors] of Object.entries(THEMES)) {
  const surface = CK.MakeSurface(W, H);
  const canvas = surface.getCanvas();
  canvas.clear(CK.TRANSPARENT);

  // "Simplify" — 32px, --text
  const fWord = font(grotesk, 32);
  const wordW = width(fWord, 'Simplify');
  canvas.drawText('Simplify', OX, OY + baseline(fWord, 0, 32), paint(colors.word), fWord);

  // "APP" — 11px mono, 0.24em tracking, right-aligned to the word, 7px below it
  const fTag = font(mono, 11);
  const track = 0.24 * 11 * S;
  const tagGlyphs = [...'APP'];
  const tagW = tagGlyphs.reduce((a, c) => a + width(fTag, c) + track, 0);
  let tx = OX + wordW - tagW;
  const tagBase = OY + baseline(fTag, 32 + 7, 11);
  for (const ch of tagGlyphs) {
    canvas.drawText(ch, tx, tagBase, paint(colors.tag), fTag);
    tx += width(fTag, ch) + track;
  }

  // "my" — 38px Caveat, accent, rotated -7deg, box top 22 (bottom -10 of the 50px lockup)
  const fMy = font(caveat, 38);
  const myX = OX + 12 * S, myBase = OY + baseline(fMy, 22, 38);
  canvas.save();
  canvas.rotate(-7, myX, myBase);
  canvas.drawText('my', myX, myBase, paint(colors.my), fMy);
  canvas.restore();

  surface.flush();
  const png = surface.makeImageSnapshot().encodeToBytes();
  const pad = 4 * S;
  const out = `src/assets/email-logo-${name}.png`;

  await sharp(Buffer.from(png))
    .trim({ threshold: 1 })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width: 150 * 3 })   // 3x of the 150px the email renders it at
    .png({ compressionLevel: 9 })
    .toFile(out);

  console.log(out, await sharp(out).metadata().then((m) => `${m.width}x${m.height}`));
}
