import { ARCHES, KINDS, PLATFORMS, filenameFor } from '../../lib/builds.js';
import { GitHubError, findAsset, getRelease, getSignedUrl } from '../../lib/github.js';

export const prerender = false;

/* TODO: auth gate — a session or licence check goes here. */
function isAuthorized(request) {
  return true;
}
const problem = (status, error) =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export const GET = async ({ request, url }) => {
  if (!isAuthorized(request)) {
    return problem(403, 'This download is not available to you.');
  }

  const platform = url.searchParams.get('platform');
  const arch = url.searchParams.get('arch');
  const kind = url.searchParams.get('kind') || 'setup';

  if (!PLATFORMS.includes(platform)) {
    return problem(400, `platform must be one of: ${PLATFORMS.join(', ')}.`);
  }
  if (!ARCHES.includes(arch)) {
    return problem(400, `arch must be one of: ${ARCHES.join(', ')}.`);
  }
  if (!KINDS.includes(kind)) {
    return problem(400, `kind must be one of: ${KINDS.join(', ')}.`);
  }

  const filename = filenameFor(platform, arch, kind);
  if (!filename) {
    return problem(400, `${kind} is not built for ${platform}.`);
  }

  try {
    const release = await getRelease();
    const asset = findAsset(release, filename);

    if (!asset) {
      return problem(404, `${filename} is not part of the current release.`);
    }

    return new Response(null, {
      status: 302,
      headers: {
        location: await getSignedUrl(asset.id),
        'cache-control': 'no-store',
      },
    });
  } catch (cause) {
    if (cause instanceof GitHubError) return problem(cause.status, cause.message);

    console.error('[download] unexpected failure:', cause);
    return problem(500, 'The download could not be prepared right now.');
  }
};

export const HEAD = GET;

export const ALL = () => problem(405, 'Use GET to request a download.');
