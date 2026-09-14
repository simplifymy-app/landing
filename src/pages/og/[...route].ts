import { OGImageRoute } from 'astro-og-canvas';
import { PAGES } from '../../lib/pages';

export const { getStaticPaths, GET } = await OGImageRoute({
  pages: PAGES,
  getImageOptions: (_path, page: (typeof PAGES)[keyof typeof PAGES]) => ({
    title: page.title,
    description: page.description,
    logo: { path: './public/og-mark.png', size: [64] },
    bgGradient: [
      [11, 11, 12],
      [20, 20, 22],
    ],
    border: { color: [110, 139, 255], width: 10, side: 'inline-start' },
    padding: 72,
    font: {
      title: {
        families: ['Space Grotesk'],
        weight: 'SemiBold',
        color: [237, 237, 239],
        size: 62,
        lineHeight: 1.1,
      },
      description: {
        families: ['Space Grotesk'],
        weight: 'Normal',
        color: [138, 138, 146],
        size: 28,
        lineHeight: 1.4,
      },
    },
    fonts: [
      './node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff',
      './node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff',
    ],
  }),
});
