# simplifymy.app

The landing site for Simplify my app — an Astro site, prerendered to static files and
deployed to Vercel. Everything is a static page except three endpoints, which opt out with
`export const prerender = false` and run as Node serverless functions:

| Route | What it does |
| --- | --- |
| `/api/contact/` | Sends the contact form through Resend. |
| `/api/download/` | Hands a browser a private build of Simplify my Shot. |
| `/api/update/[rid]/[...file]` | The Velopack update feed for that app. |

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro build, then scripts/update-feed-route.mjs
```

## Environment variables

Set these in the Vercel project (Production, Preview and Development) and in a local
`.env` — see `.env.example`. They are declared in `astro.config.mjs` under `env.schema`,
all `context: "server", access: "secret"`, so none of them is ever inlined into anything
the browser receives.

| Variable | Used by | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | `/api/contact/` | Resend API key. |
| `CONTACT_TO_EMAIL` | `/api/contact/` | Where form messages are delivered. |
| `CONTACT_FROM_EMAIL` | `/api/contact/` | Verified sender; defaults to `onboarding@resend.dev`. |
| `GITHUB_TOKEN` | download + update | Fine-grained PAT for `simplifymy-app/shot`. |

### The GitHub token

A **fine-grained** personal access token, scoped to the single repository
`simplifymy-app/shot`, with one permission: **Contents: Read-only**. That is enough to
list releases and read their assets, and it cannot write anything.

**It expires.** GitHub requires an expiry date on fine-grained tokens, a year at most.
When it lapses, every download and every update check starts failing — and because GitHub
answers an unauthorised request for a private repository with `404` rather than `403`,
the failure looks exactly like a missing release. The error message the gateway returns
names both causes for that reason. To rotate:

1. Generate a replacement token with the same repository and permission.
2. Update `GITHUB_TOKEN` in the Vercel project settings.
3. Redeploy — environment variables are read at runtime, but the running functions keep
   the old value until they are replaced.

Put a reminder somewhere a month before the expiry date. Nothing in the app warns you.

## The download gateway

The binaries live in a **private** repository's releases, and the browser has no
credentials for it. The gateway bridges that gap without ever touching the bytes:

1. `GET /repos/{owner}/{repo}/releases/latest` with `Accept: application/vnd.github+json`
   lists the assets.
2. `GET /repos/{owner}/{repo}/releases/assets/{id}` with
   `Accept: application/octet-stream` and `redirect: 'manual'` answers `302` with a
   short-lived signed S3 URL in the `location` header.
3. The client is redirected there and downloads straight from S3.

The signed URL carries its own authorisation, so it works for a client that has never seen
the token — and the installer never passes through the function. Proxying it would mean
paying for hundreds of megabytes of bandwidth twice and timing out long before the
transfer finished.

> **These routes must run on Node, never Edge.** On an edge runtime `redirect: 'manual'`
> yields an *opaque* response: the status is visible but the `location` header is not, so
> `getSignedUrl` silently returns nothing. The Vercel adapter builds Node serverless
> functions by default, which is what this relies on — do not move these routes to an edge
> runtime or enable `edgeMiddleware` for them.

Signed URLs expire in about five minutes. The release *listing* is cached in memory for 60
seconds to stay clear of the 5000 requests/hour limit; the signed URLs never are, and every
redirect is sent `cache-control: no-store`. The cache lives in one function instance's
memory, so a cold start or a second concurrent instance simply refetches.

### `GET /api/download/`

| Parameter | Values | Default |
| --- | --- | --- |
| `platform` | `win`, `osx` | required |
| `arch` | `x64`, `arm64` | required |
| `kind` | `setup`, `msi`, `portable` | `setup` |

Answers `302` to the signed URL, `400` on a parameter outside the allowlist or a
combination that is not built (`msi` is Windows-only), `404` if the release has no such
asset. The parameters select a row from the table in `src/lib/builds.js` — a filename is
never assembled from them, so a value that is not a key cannot reach GitHub in any form.

Asset names must match exactly:

```
SimplifyMyShot-win-x64-Setup.exe        SimplifyMyShot-win-x64-Portable.zip
SimplifyMyShot-win-arm64-Setup.exe      SimplifyMyShot-win-arm64-Portable.zip
SimplifyMyShot-win-x64-Setup.msi        SimplifyMyShot-win-arm64-Setup.msi
SimplifyMyShot-osx-x64-Setup.pkg        SimplifyMyShot-osx-x64-Portable.zip
SimplifyMyShot-osx-arm64-Setup.pkg      SimplifyMyShot-osx-arm64-Portable.zip
```

The MSI names are assumed to follow the same scheme as the `.exe` — no release has shipped
one yet, so confirm what Velopack actually emits before relying on them.

### `/download/`

The download page. Rendered per request so the version and publish date come from the
current release rather than from whenever the site was last built. It guesses the visitor's
platform from `navigator.userAgentData` and falls back to the UA string, but every build is
listed on the page regardless — a guess is never the only way out. The list is filtered to
what the release actually contains, so an unpublished build (the MSI, today) is absent
rather than a link that 404s, and appears on its own once you ship one. Apple Silicon
cannot be detected from a user agent at all, so macOS is assumed to be `arm64` and labelled
as an assumption, with the Intel build one click away.

If GitHub is unreachable the page still renders and the links still work; only the version
line is replaced.

The page is `noindex` and excluded from the sitemap: it serves builds of an unreleased app
from a private repository, and is meant to be linked to, not found.

### Locking it down

Both routes are open to anyone who knows the URL. `src/pages/api/download.js` has a marked
`TODO: auth gate` block with a stub `isAuthorized(request)` that currently returns `true`.
It is called before anything else in the handler, so a request that fails it never reaches
GitHub, never spends a rate-limit unit and never mints a signed URL. A session lookup or a
licence check goes there.

## The Velopack update feed

Point the updater at the base URL for its runtime identifier:

```csharp
var mgr = new UpdateManager("https://simplifymy.app/api/update/win-x64");

var update = await mgr.CheckForUpdatesAsync();
if (update != null)
{
    await mgr.DownloadUpdatesAsync(update);
    mgr.ApplyUpdatesAndRestart(update);
}
```

`rid` must be one of `win-x64`, `win-arm64`, `osx-x64`, `osx-arm64`; anything else is
`404`. The updater then asks the base URL for two kinds of thing, served two different
ways on purpose:

| Request | Response |
| --- | --- |
| `releases.win-x64.json` | The manifest, fetched server-side and returned inline as `application/json`. |
| `SimplifyMyShot-0.0.1-win-x64-full.nupkg` | `302` to a signed S3 URL. |

The manifest is a few hundred bytes, so proxying it costs nothing — and not redirecting it
is what keeps the feed URL stable for clients that are already installed. Anything else is
redirected.

The release's own asset list is the allowlist: a filename that is not an asset of the
current release is `404`, and any name containing `/`, `\` or `..` is rejected before that.

### Publishing a release

Velopack's output goes into a GitHub release on `simplifymy-app/shot` as-is. Nothing here
needs redeploying when you ship a version — the gateway reads the latest release on every
request (within the 60-second cache), so a new release is live within a minute.

### `scripts/update-feed-route.mjs`

This one is load-bearing, and it is the thing most likely to confuse a future reader.

The site is `trailingSlash: 'always'`, so the Vercel adapter registers every route with a
required trailing slash and emits two global rules: *add* a slash to any path without a
file extension, and *strip* it from any path with one. A Velopack updater asks for exactly
the path those rules cannot produce:

```
/api/update/win-x64/releases.win-x64.json
```

It carries an extension, so the add-slash rule skips it. It has no trailing slash, so the
strip rule skips it too. And the route itself demands the slash. Nothing matches, the
request falls through to the static 404 — at the Vercel routing layer *and* in Astro's own
router behind it — and the updater silently never updates.

The updater builds that path itself from the base URL, so it cannot be asked for a
different shape, and weakening `trailingSlash` for the whole site would cost every page its
canonical redirect. Instead `npm run build` runs this script, which inserts one rewrite
into `.vercel/output/config.json` putting the slash back — positioned after the two `308`
rules so the strip rule cannot undo it, and before the filesystem phase so the real route
still matches afterwards.

The script fails the build rather than shipping a broken feed if the adapter's output ever
changes shape. If it ever does fail, check what `.vercel/output/config.json` now generates
for `/api/update/` before changing the script.
