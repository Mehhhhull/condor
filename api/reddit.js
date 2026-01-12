// Root-level serverless proxy for Reddit requests
// This mirrors `frontend/api/reddit.js` so Vercel will deploy the function
export default async function handler(req, res) {
  try {
    const urlParam = req.query?.url || (req.url && req.url.split('?').slice(1).join('?').split('&').find(p => p.startsWith('url='))?.split('=')[1]);
    if (!urlParam) {
      res.status(400).json({ error: 'Missing url query parameter' });
      return;
    }

    const target = decodeURIComponent(urlParam);

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
