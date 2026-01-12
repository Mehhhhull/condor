// Simple serverless proxy for Reddit requests
// Expects a query param `url` containing the full Reddit URL to fetch
export default async function handler(req, res) {
  try {
    const { url } = req.query || req.url.split('?').slice(1).join('?').split('&').reduce((acc, pair) => {
      const [k, v] = pair.split('=');
      if (k === 'url') acc.url = v;
      return acc;
    }, {}) || {};

    if (!url) {
      res.status(400).json({ error: 'Missing url query parameter' });
      return;
    }

    const target = decodeURIComponent(url);

    const fetchRes = await fetch(target, {
      headers: {
        'User-Agent': 'Candour/1.0 (Product Research Tool)'
      }
    });

    const contentType = fetchRes.headers.get('content-type') || 'text/plain; charset=utf-8';
    const body = await fetchRes.text();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(fetchRes.ok ? 200 : 502).send(body);
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
}
