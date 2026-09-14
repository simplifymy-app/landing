import { GitHubError, findAsset, getRelease, getSignedUrl } from '../../../../lib/github.js';

export const prerender = false;

const RIDS = ['win-x64', 'win-arm64', 'osx-x64', 'osx-arm64'];

const MAX_INLINE_BYTES = 1024 * 1024;

const problem = (status, error) =>
  new Response(JSON.stringify({ error }), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export const GET = async ({ params }) => {
  const { rid } = params;
  const file = params.file ?? '';

  if (!RIDS.includes(rid)) {
    return problem(404, 'Unknown runtime identifier.');
  }

  if (!file || file.includes('/') || file.includes('\\') || file.includes('..')) {
    return problem(400, 'Not a valid asset name.');
  }

  try {
    const release = await getRelease();
    const asset = findAsset(release, file);

    if (!asset) {
      return problem(404, `${file} is not part of the current release.`);
    }

    const url = await getSignedUrl(asset.id);

    if (file.endsWith('.json') && asset.size <= MAX_INLINE_BYTES) {
      // No auth headers: the signed URL carries its own and S3 rejects a second.
      const res = await fetch(url);

      if (!res.ok) {
        console.error(`[update] manifest ${file} fetch answered ${res.status}`);
        return problem(502, 'The update manifest could not be read right now.');
      }

      return new Response(await res.text(), {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, max-age=60',
        },
      });
    }

    return new Response(null, {
      status: 302,
      headers: { location: url, 'cache-control': 'no-store' },
    });
  } catch (cause) {
    if (cause instanceof GitHubError) return problem(cause.status, cause.message);

    console.error('[update] unexpected failure:', cause);
    return problem(500, 'The update feed is unavailable right now.');
  }
};

export const HEAD = GET;

export const ALL = () => problem(405, 'Use GET to read the update feed.');
