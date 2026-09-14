import { GITHUB_TOKEN } from 'astro:env/server';

export const OWNER = 'simplifymy-app';
export const REPO = 'shot';

const API = 'https://api.github.com';

const LISTING_TTL_MS = 60_000;

const listings = new Map();
const inFlight = new Map();

export class GitHubError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
  }
}

const headers = (accept) => ({
  accept,
  authorization: `Bearer ${GITHUB_TOKEN}`,
  'x-github-api-version': '2022-11-28',
  'user-agent': 'simplifymy-app-download-gateway',
});

const NOT_FOUND =
  'That release or asset was not found. Either it does not exist, or the ' +
  'access token no longer has permission to read this repository — a private ' +
  'repository answers an unauthorised request with 404 rather than 403.';

function fail(res, what) {
  console.error(`[github] ${what} failed: ${res.status} ${res.statusText}`);

  if (res.status === 404) return new GitHubError(404, NOT_FOUND);

  if (res.status === 429 || (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0')) {
    return new GitHubError(503, 'Too many requests upstream. Try again in a few minutes.');
  }

  if (res.status === 401 || res.status === 403) {
    return new GitHubError(502, 'The download gateway is not authorised to read the release.');
  }

  return new GitHubError(502, 'The release could not be read right now.');
}

async function request(path, accept, init) {
  let res;
  try {
    res = await fetch(`${API}${path}`, { ...init, headers: headers(accept) });
  } catch (cause) {
    console.error(`[github] ${path} unreachable:`, cause);
    throw new GitHubError(504, 'The release could not be reached right now.');
  }
  return res;
}

export async function getRelease(tag) {
  const key = tag || 'latest';

  const hit = listings.get(key);
  if (hit && Date.now() - hit.at < LISTING_TTL_MS) return hit.release;

  const pending = inFlight.get(key);
  if (pending) return pending;

  const path = tag
    ? `/repos/${OWNER}/${REPO}/releases/tags/${encodeURIComponent(tag)}`
    : `/repos/${OWNER}/${REPO}/releases/latest`;

  const load = (async () => {
    const res = await request(path, 'application/vnd.github+json');
    if (!res.ok) throw fail(res, `release ${key}`);

    const release = await res.json();
    listings.set(key, { at: Date.now(), release });
    return release;
  })();

  inFlight.set(key, load);
  try {
    return await load;
  } finally {
    inFlight.delete(key);
  }
}

export function findAsset(release, name) {
  return release?.assets?.find((asset) => asset.name === name) ?? null;
}

// `redirect: 'manual'` is what makes `location` readable, so this must not run on Edge.
export async function getSignedUrl(assetId) {
  const res = await request(
    `/repos/${OWNER}/${REPO}/releases/assets/${assetId}`,
    'application/octet-stream',
    { redirect: 'manual' },
  );

  const location = res.headers.get('location');
  if (location) return location;

  if (!res.ok) throw fail(res, `asset ${assetId}`);

  console.error(`[github] asset ${assetId} answered ${res.status} with no location header`);
  throw new GitHubError(502, 'The download link could not be created right now.');
}
