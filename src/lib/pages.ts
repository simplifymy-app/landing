export interface PageMeta {
  path: string;
  title: string;
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
    title: 'Five apps, one idea.',
    description:
      'Gallery, Player, Recorder, Files and Shot. Free, no ads, no accounts, no tracking.',
  },
  gallery: {
    path: '/apps/gallery/',
    title: 'Your photos, in the folders they already live in.',
    description:
      'Gallery for Android. No ads, no account — and no internet permission at all.',
  },
  player: {
    path: '/apps/player/',
    title: 'The music already on your phone, playing.',
    description:
      'Player for Android. Background playback, lock screen, headset keys. No internet permission.',
  },
  recorder: {
    path: '/apps/recorder/',
    title: 'A voice recorder that shows you the sound.',
    description:
      'Recorder for Android. Live waveform, marks while you record, cut and fade afterwards.',
  },
  files: {
    path: '/apps/files/',
    title: 'Two folders open at once.',
    description:
      'Files for Android. A two-pane file manager: mark on one side, copy or move to the other.',
  },
  shot: {
    path: '/apps/shot/',
    title: 'Take the shot. Say what matters on it.',
    description:
      'Simplify my Shot for macOS and Windows. Capture, annotate and read text. Free, nothing uploaded.',
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
