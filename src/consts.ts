export const SITE = "Simplify my app";
export const SITE_URL = "https://simplifymy.app";
export const EMAIL = "hello@simplifymy.app";
export const UPDATED_ON = "10 Sep 2026";

export const LOCALE = "en_US";
export const LANG = "en";

export const TAGLINE =
  "Free Android apps with no ads, no accounts and no tracking. Gallery, Player, Recorder and Files — everything stays on your phone.";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/apps/", label: "Apps" },
  { href: "/privacy/", label: "Privacy" },
  { href: "/contact/", label: "Contact" },
] as const;

// Only what has to agree across the site, so the structured data and the store buttons
// cannot drift from each other. Pages keep their own presentational copy.
export const APPS = [
  {
    name: "Gallery",
    slug: "gallery",
    category: "PhotoVideoApplication",
    summary:
      "A photo and video album that reads what is already on your phone. It does not request the internet permission at all.",
    available: true,
    playId: "app.simplifymy.gallery",
  },
  {
    name: "Player",
    slug: "player",
    category: "MusicApplication",
    summary:
      "A music player for the files already on your phone. Background playback, lock screen and headset keys, no internet permission.",
    available: false,
    playId: null,
  },
  {
    name: "Recorder",
    slug: "recorder",
    category: "UtilitiesApplication",
    summary:
      "Voice recording with a real waveform, marks while you record, and simple cut-and-fade editing afterwards.",
    available: false,
    playId: null,
  },
  {
    name: "Files",
    slug: "files",
    category: "UtilitiesApplication",
    summary:
      "A two-pane file manager. Mark on one side, copy or move to the other. The way file managers used to work.",
    available: false,
    playId: null,
  },
] as const;

export const CONTACT_APPS = [
  ...APPS.map((a) => a.name),
  "Something else",
] as const;

export const CONTACT_KINDS = [
  "Feature request",
  "Bug report",
  "Question",
] as const;

export const playUrl = (playId: string | null) =>
  playId ? `https://play.google.com/store/apps/details?id=${playId}` : null;

// Rendered on the home page and mirrored into FAQ schema; the two must stay identical.
export const FAQ = [
  {
    q: "Are these Android apps really free?",
    a: "Yes. Every app is free to download and free to use, with every feature unlocked on first launch. There is no Pro tier, no subscription, no trial and no in-app purchase of any kind.",
  },
  {
    q: "Do the apps show ads?",
    a: "No. There are no banners, no full-screen interstitials and no rewarded videos. No advertising SDK is compiled into any of the apps.",
  },
  {
    q: "What data do the apps collect?",
    a: "None. No analytics, no crash reporting, no advertising or device identifiers and no account. Gallery ships without the internet permission at all, so it is technically unable to send anything anywhere — you can verify that in its permission list on Google Play.",
  },
  {
    q: "Do I need an account to use them?",
    a: "No. There is nothing to sign into and nothing to verify. Install the app, open it, and it works offline.",
  },
  {
    q: "Which apps are available right now?",
    a: "Gallery is on Google Play today. Player, Recorder and Files are in development and will be released the same way: free, with no ads and no data collection.",
  },
] as const;
