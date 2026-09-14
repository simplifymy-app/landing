import type { WithContext, Thing, Graph } from 'schema-dts';
import { APPS, EMAIL, FAQ, LANG, SITE, SITE_URL, TAGLINE, appBySlug, playUrl } from 'consts';
import type { App, AppSlug } from 'consts';

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

const abs = (path: string) => new URL(path, SITE_URL).href;

const LOGO_ID = `${SITE_URL}/#logo`;

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

const appId = (app: App) => `${SITE_URL}${app.path}#${app.slug}`;

const softwareApplication = (app: App) => {
  const store = playUrl(app.playId) ?? ('downloadPath' in app ? abs(app.downloadPath) : null);
  return {
    '@type': 'SoftwareApplication',
    '@id': appId(app),
    name: `${app.fullName} — ${SITE}`,
    alternateName: app.name,
    applicationCategory: app.category,
    operatingSystem: app.os,
    description: app.summary,
    url: abs(app.path),
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
  path: string;
  title: string;
  description: string;
  trail?: { name: string; path: string }[];
  apps?: boolean;
  app?: AppSlug;
  faq?: boolean;
  pageType?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'ItemPage';
  image?: string;
}

export function buildSchema(options: SchemaOptions): WithContext<Graph> {
  const { path, title, description, trail = [], apps, app, faq, image, pageType = 'WebPage' } = options;
  const isHome = path === '/';
  const subject = app ? appBySlug(app) : undefined;

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
    ...(subject ? { mainEntity: { '@id': appId(subject) } } : {}),
  } as Thing);

  if (!isHome) {
    nodes.push(
      breadcrumb([{ name: 'Home', path: '/' }, ...trail]) as Thing,
    );
  }

  if (apps) nodes.push(...APPS.map((entry) => softwareApplication(entry) as Thing));
  else if (subject) nodes.push(softwareApplication(subject) as Thing);
  if (faq) nodes.push(faqPage() as Thing);

  return { '@context': 'https://schema.org', '@graph': nodes } as WithContext<Graph>;
}
