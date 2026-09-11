// The layout reads this for the OG image path and the OG route reads it to draw that
// image, so a page cannot advertise a card that was never generated.

export interface PageMeta {
  /** Route path, leading and trailing slash included. */
  path: string;
  /** Headline drawn on the card. */
  title: string;
  /** Supporting line on the card. */
  description: string;
}

export const PAGES = {
  home: {
    path: '/',
    title: 'Simple things should cost nothing.',
    description:
      'Free Android apps with no ads, no accounts and no tracking. Nothing is collected, nothing is uploaded.',
  },
  apps: {
    path: '/apps/',
    title: 'Apps I use every day.',
    description:
      'Gallery, Player, Recorder and Files. Free, no ads, no accounts, no in-app purchases.',
  },
  privacy: {
    path: '/privacy/',
    title: 'We do not collect any data.',
    description:
      'No analytics, no accounts, no advertising, no tracking. Everything stays on your device.',
  },
  contact: {
    path: '/contact/',
    title: 'Tell me what is missing.',
    description:
      'Feature requests, bug reports and questions. One person and an inbox.',
  },
} as const satisfies Record<string, PageMeta>;

export type PageKey = keyof typeof PAGES;

export const ogImagePath = (key: PageKey) => `/og/${key}.png`;
