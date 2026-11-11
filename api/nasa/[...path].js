/**
 * Vercel serverless function: a small, safe proxy to api.nasa.gov.
 *
 * Why? So the NASA API key stays on the server (NASA_API_KEY) and is never put
 * into browser code. Only a short allow-list of endpoints can be requested.
 *
 *   GET /api/nasa/DONKI/FLR?startDate=2026-10-01&endDate=2026-11-01
 *   GET /api/nasa/mars-photos/api/v1/rovers/curiosity/latest_photos
 */

const ALLOWED = [
  /^DONKI\/(FLR|CME|GST|SEP|IPS|RBE)$/,
  /^mars-photos\/api\/v1\/rovers\/(curiosity|perseverance|opportunity|spirit)\/(latest_photos|photos)$/,
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Only GET is allowed.' });
    return;
  }

  const parts = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
  const path = parts.filter(Boolean).join('/');
  if (!ALLOWED.some((re) => re.test(path))) {
    res.status(404).json({ error: 'That NASA endpoint is not available here.' });
    return;
  }

  // Forward only simple query parameters (never the path segments above).
  const url = new URL(`https://api.nasa.gov/${path}`);
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path' || key === 'api_key') continue;
    if (typeof value === 'string' && value.length < 64) url.searchParams.set(key, value);
  }
  url.searchParams.set('api_key', process.env.NASA_API_KEY || 'DEMO_KEY');

  try {
    const upstream = await fetch(url, { headers: { Accept: 'application/json' } });
    const body = await upstream.text();
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    // Help NASA's rate limits: let Vercel's CDN cache for 30 minutes.
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    const remaining = upstream.headers.get('x-ratelimit-remaining');
    if (remaining) res.setHeader('X-RateLimit-Remaining', remaining);
    res.status(upstream.status).send(body);
  } catch (err) {
    res.status(502).json({ error: 'Could not reach NASA right now.' });
  }
}
