import { execFileSync } from "node:child_process";
import { defineConfig, envField } from "astro/config";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import vercel from "@astrojs/vercel";

const SITE = "https://simplifymy.app";

const APP_PAGE = ["src/pages/apps/[slug].astro", "src/consts.ts"];

const ROUTES = {
  "/": { source: "src/pages/index.astro", priority: 1.0, changefreq: "weekly" },
  "/apps/": {
    source: "src/pages/apps/index.astro",
    priority: 0.9,
    changefreq: "weekly",
  },
  "/apps/gallery/": { source: APP_PAGE, priority: 0.8, changefreq: "weekly" },
  "/apps/player/": { source: APP_PAGE, priority: 0.7, changefreq: "weekly" },
  "/apps/recorder/": { source: APP_PAGE, priority: 0.7, changefreq: "weekly" },
  "/apps/files/": { source: APP_PAGE, priority: 0.7, changefreq: "weekly" },
  "/apps/shot/": { source: APP_PAGE, priority: 0.8, changefreq: "weekly" },
  "/contact/": {
    source: "src/pages/contact.astro",
    priority: 0.6,
    changefreq: "monthly",
  },
  "/privacy/": {
    source: "src/pages/privacy.astro",
    priority: 0.4,
    changefreq: "yearly",
  },
};

const lastCommit = (source) => {
  const files = Array.isArray(source) ? source : [source];
  try {
    const iso = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", ...files],
      { encoding: "utf8" },
    ).trim();
    return iso ? new Date(iso) : undefined;
  } catch {
    return undefined;
  }
};

export default defineConfig({
  site: SITE,
  output: "static",
  adapter: vercel(),

  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: "server", access: "secret" }),
      CONTACT_TO_EMAIL: envField.string({
        context: "server",
        access: "secret",
      }),
      CONTACT_FROM_EMAIL: envField.string({
        context: "server",
        access: "secret",
        default: "onboarding@resend.dev",
      }),
      GITHUB_TOKEN: envField.string({ context: "server", access: "secret" }),
    },
  },

  trailingSlash: "always",

  build: { format: "directory", inlineStylesheets: "auto" },

  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes("/og/") &&
        !page.includes("/404") &&
        !page.includes("/api/") &&
        !page.includes("/download/") &&
        page !== `${SITE}/mobile/` &&
        page !== `${SITE}/desktop/`,
      serialize(item) {
        const path = item.url.replace(SITE, "");
        const route = ROUTES[path];
        if (!route) return item;

        const lastmod = lastCommit(route.source);
        return {
          ...item,
          priority: route.priority,
          changefreq: route.changefreq,
          ...(lastmod ? { lastmod } : {}),
        };
      },
    }),

    robotsTxt({
      sitemap: [`${SITE}/sitemap-index.xml`],
      policy: [{ userAgent: "*", allow: "/" }],
    }),
  ],
});
