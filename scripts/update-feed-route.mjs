import { readFileSync, writeFileSync } from "node:fs";

const CONFIG = ".vercel/output/config.json";

const REWRITE = {
  src: "^/api/update/([^/]+)/([^/]+)$",
  dest: "/api/update/$1/$2/",
  continue: true,
};

const die = (why) => {
  console.error(`[update-feed-route] ${why}`);
  console.error(
    "[update-feed-route] The Velopack feed would 404. Refusing to ship this build.",
  );
  process.exit(1);
};

const config = JSON.parse(readFileSync(CONFIG, "utf8"));
const routes = config.routes ?? die(`${CONFIG} has no routes array`);

if (routes.some((route) => route.src === REWRITE.src)) {
  console.log("[update-feed-route] already present, nothing to do");
  process.exit(0);
}

// After the two 308 rules so the strip rule cannot undo it, before the filesystem phase
// so the real route still matches afterwards.
const filesystem = routes.findIndex((route) => route.handle === "filesystem");
if (filesystem === -1)
  die("no `handle: filesystem` phase — the adapter output has changed shape");

// Fail the build rather than insert a rewrite pointing at nothing, should an Astro or
// adapter upgrade ever drop the trailing slash from its patterns.
const rewritten = "/api/update/win-x64/releases.win-x64.json/";
const served = routes
  .slice(filesystem)
  .some(
    (route) =>
      route.src &&
      route.dest === "_render" &&
      new RegExp(route.src).test(rewritten),
  );

if (!served)
  die(`nothing serves ${rewritten} — the update route's pattern has changed`);

routes.splice(filesystem, 0, REWRITE);
writeFileSync(CONFIG, JSON.stringify(config, null, "\t"));

console.log(
  `[update-feed-route] inserted at index ${filesystem}: ${REWRITE.src} -> ${REWRITE.dest}`,
);
