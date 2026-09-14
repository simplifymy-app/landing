import CanvasKitInit from 'canvaskit-wasm';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

const CK = await CanvasKitInit();
const face = (p) => CK.Typeface.MakeFreeTypeFaceFromData(readFileSync(p).buffer);

const grotesk = face('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff');
const mono = face('node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff');
const caveat = face('node_modules/@fontsource/caveat/files/caveat-latin-600-normal.woff');
console.log('faces', !!grotesk, !!mono, !!caveat);

const THEMES = {
  dark: { word: '#EDEDEF', tag: '#8A8A92', my: '#6E8BFF' },
  light: { word: '#131315', tag: '#5E5E66', my: '#4A5FE0' },
};

const S = 6;
const W = 300 * S, H = 120 * S;

const paint = (hex) => { const p = new CK.Paint(); p.setColor(CK.parseColorString(hex)); p.setAntiAlias(true); return p; };
const font = (tf, size) => { const f = new CK.Font(tf, size * S); f.setSubpixel(true); return f; };

const baseline = (f, top, size) => {
  const m = f.getMetrics();
  const asc = Math.abs(m.ascent), desc = Math.abs(m.descent);
  return top * S + ((size * S - (asc + desc)) / 2) + asc;
};
const width = (f, text) => f.getGlyphWidths(f.getGlyphIDs(text)).reduce((a, b) => a + b, 0);

const OX = 40 * S, OY = 30 * S;

for (const [name, colors] of Object.entries(THEMES)) {
  const surface = CK.MakeSurface(W, H);
  const canvas = surface.getCanvas();
  canvas.clear(CK.TRANSPARENT);

  const fWord = font(grotesk, 32);
  const wordW = width(fWord, 'Simplify');
  canvas.drawText('Simplify', OX, OY + baseline(fWord, 0, 32), paint(colors.word), fWord);

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
    .resize({ width: 150 * 3 })
    .png({ compressionLevel: 9 })
    .toFile(out);

  console.log(out, await sharp(out).metadata().then((m) => `${m.width}x${m.height}`));
}
