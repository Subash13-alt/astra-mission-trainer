/**
 * Vercel serverless function: proxy to NASA's Open Science Data Repository (OSDR)
 * public API, so the browser does not run into cross-origin (CORS) limits.
 * OSDR search does not need an API key.
 *
 *   GET /api/osdr/search?term=radiation&from=0&type=cgene
 *   GET /api/osdr/osd/meta/137
 */

const ALLOWED = [/^search$/, /^osd\/meta\/\d{1,4}$/];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Only GET is allowed.' });
    return;
  }

  const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
  const path = parts.filter(Boolean).join('/');
  if (!ALLOWED.some((re) => re.test(path))) {
    res.status(404).json({ error: 'That OSDR endpoint is not available here.' });
    return;
  }

  const url = new URL(`https://osdr.nasa.gov/osdr/data/${path}`);
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') continue;
    if (typeof value === 'string' && value.length < 64) url.searchParams.set(key, value);
  }

  try {
    const upstream = await fetch(url, { headers: { Accept: 'application/json' } });
    const body = await upstream.text();
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(upstream.status).send(body);
  } catch (err) {
    res.status(502).json({ error: 'Could not reach OSDR right now.' });
  }
}
