async function verifyLive() {
  const routes = ['/', '/pdf-tools', '/free-pdf-tools', '/privacy', '/terms', '/contact', '/cookie-policy', '/robots.txt', '/sitemap.xml', '/404'];
  const base = 'https://toolboxx.arunwebdeveloper.workers.dev';
  
  console.log('--- LIVE AUDIT VERIFICATION ---');
  for (const route of routes) {
    const url = `${base}${route}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'ToolBoxX-Audit/1.0' } });
      const text = await res.text();
      const title = (text.match(/<title>([^<]+)<\/title>/) || [])[1] || 'N/A';
      const canonical = (text.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || 'N/A';
      const xFrame = res.headers.get('x-frame-options');
      const xContent = res.headers.get('x-content-type-options');
      console.log(`[${res.status}] ${route} | Title: "${title.slice(0, 45)}..." | Canonical: ${canonical} | X-Frame: ${xFrame} | X-Content: ${xContent}`);
    } catch (e) {
      console.error(`FAILED ${route}:`, e.message);
    }
  }
}
verifyLive();
