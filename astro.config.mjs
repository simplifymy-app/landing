import { execFileSync } from "node:child_process";
import { defineConfig, envField } from "astro/config";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import vercel from "@astrojs/vercel";

const SITE = "https://simplifymy.app";

const ROUTES = {
  "/": { source: "src/pages/index.astro", priority: 1.0, changefreq: "weekly" },
  "/apps/": {
    source: "src/pages/apps.astro",
    priority: 0.9,
    changefreq: "weekly",
  },
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

// Google discards lastmod wholesale once a site claims every page changed on every deploy,
// so this reads the file's last commit rather than the build clock.
const lastCommit = (file) => {
  try {
    const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
      encoding: "utf8",
    }).trim();
    return iso ? new Date(iso) : undefined;
  } catch {
    return undefined; // no git history available, e.g. a shallow CI checkout
  }
};

export default defineConfig({
  site: SITE,
  // Every page is prerendered as before. Only /api/contact opts out with
  // `export const prerender = false`, so the adapter emits one function and nothing else.
  output: "static",
  adapter: vercel(),

  // Read at runtime from the Vercel project's environment, never inlined into the build.
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
    },
  },

  // Keeps the canonical tag, the sitemap entry and the served URL a single string.
  trailingSlash: "always",

  build: { format: "directory", inlineStylesheets: "auto" },

  integrations: [
    sitemap({
      // The share cards are images served from a route; listed as pages they read as soft-404s.
      filter: (page) =>
        !page.includes("/og/") &&
        !page.includes("/404") &&
        !page.includes("/api/"),
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
      // Nothing is disallowed on purpose: social scrapers honour robots.txt, so blocking
      // /og/ would silently kill the link previews those cards exist for.
      policy: [{ userAgent: "*", allow: "/" }],
    }),
  ],
});
