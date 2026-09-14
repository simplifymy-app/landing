import type { WithContext, Thing, Graph } from 'schema-dts';
import { APPS, DESKTOP_APPS, EMAIL, FAQ, LANG, SITE, SITE_URL, TAGLINE, playUrl } from 'consts';

// One connected @graph per page: stable @ids mean the app's publisher, the site's publisher
// and the breadcrumb's organisation read as one entity, not three lookalikes.

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

const abs = (path: string) => new URL(path, SITE_URL).href;

const LOGO_ID = `${SITE_URL}/#logo`;

// A top-level node, not nested in Organization, so logo and primaryImageOfPage resolve
// to one image rather than two copies.
const logo = {
  '@type': 'ImageObject',
  '@id': LOGO_ID,
  url: abs('/og.png'),
  contentUrl: abs('/og.png'),
  width: '1200',
  height: '630',
  caption: SITE,
} as const;

const organization = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE,
  url: `${SITE_URL}/`,
  email: EMAIL,
  description: TAGLINE,
  logo: { '@id': LOGO_ID },
  image: { '@id': LOGO_ID },
  sameAs: ['https://play.google.com/store/apps/dev?id=app.simplifymy'],
} as const;

const website = {
  '@type': 'WebSite',
  '@id': SITE_ID,
  name: SITE,
  url: `${SITE_URL}/`,
  description: TAGLINE,
  inLanguage: LANG,
  publisher: { '@id': ORG_ID },
} as const;

// Priced explicitly at zero so the "free" claim is machine-readable.
type RegistryApp = (typeof APPS)[number] | (typeof DESKTOP_APPS)[number];

const softwareApplication = (
  app: RegistryApp,
  { page, os }: { page: string; os: string },
) => {
  // Falls back to our own download page: an app served from this site is not PreOrder.
  const store = playUrl(app.playId) ?? ('downloadPath' in app ? abs(app.downloadPath) : null);
  return {
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}${page}#${app.slug}`,
    name: `${'fullName' in app ? app.fullName : app.name} — ${SITE}`,
    alternateName: app.name,
    applicationCategory: app.category,
    operatingSystem: os,
    description: app.summary,
    url: `${SITE_URL}${page}#${app.slug}`,
    inLanguage: LANG,
    isAccessibleForFree: true,
    publisher: { '@id': ORG_ID },
    author: { '@id': ORG_ID },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: store
        ? 'https://schema.org/InStock'
        : 'https://schema.org/PreOrder',
      ...(store ? { url: store } : {}),
    },
    ...(store ? { downloadUrl: store, installUrl: store } : {}),
  };
};

const breadcrumb = (trail: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  '@id': `${abs(trail[trail.length - 1].path)}#breadcrumb`,
  itemListElement: trail.map((step, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: step.name,
    item: abs(step.path),
  })),
});

const faqPage = () => ({
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/#faq`,
  mainEntity: FAQ.map((entry) => ({
    '@type': 'Question',
    name: entry.q,
    acceptedAnswer: { '@type': 'Answer', text: entry.a },
  })),
});

export interface SchemaOptions {
  /** Page path, leading and trailing slash included, e.g. "/mobile/". */
  path: string;
  title: string;
  description: string;
  /** Trail below the home page; home itself is prepended. */
  trail?: { name: string; path: string }[];
  apps?: boolean;
  desktop?: boolean;
  faq?: boolean;
  pageType?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';
  /** Absolute URL of this page's Open Graph card. */
  image?: string;
}

export function buildSchema(options: SchemaOptions): WithContext<Graph> {
  const { path, title, description, trail = [], apps, desktop, faq, image, pageType = 'WebPage' } = options;
  const isHome = path === '/';

  const nodes: Thing[] = [logo, organization, website];

  nodes.push({
    '@type': pageType,
    '@id': `${abs(path)}#webpage`,
    url: abs(path),
    name: title,
    description,
    inLanguage: LANG,
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG_ID },
    ...(image
      ? {
          primaryImageOfPage: {
            '@type': 'ImageObject',
            '@id': `${abs(path)}#primaryimage`,
            url: image,
            contentUrl: image,
            width: '1200',
            height: '630',
          },
        }
      : {}),
    ...(isHome ? {} : { breadcrumb: { '@id': `${abs(path)}#breadcrumb` } }),
  } as Thing);

  if (!isHome) {
    nodes.push(
      breadcrumb([{ name: 'Home', path: '/' }, ...trail]) as Thing,
    );
  }

  if (apps)
    nodes.push(
      ...APPS.map(
        (app) =>
          softwareApplication(app, { page: '/mobile/', os: 'Android' }) as Thing,
      ),
    );
  if (desktop)
    nodes.push(
      ...DESKTOP_APPS.map(
        (app) =>
          softwareApplication(app, { page: '/desktop/', os: app.os }) as Thing,
      ),
    );
  if (faq) nodes.push(faqPage() as Thing);

  return { '@context': 'https://schema.org', '@graph': nodes } as WithContext<Graph>;
}
