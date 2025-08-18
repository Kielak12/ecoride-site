export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get('limit')||'20')));
    const rows = await env.DB.prepare(`SELECT id, name, rating, content, created_at FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT ?`)
      .bind(limit).all();
    const avg = await env.DB.prepare(`SELECT ROUND(AVG(rating), 1) AS avg FROM reviews WHERE status = 'approved'`).all();
    const average = avg.results && avg.results[0] ? avg.results[0].avg : null;
    return new Response(JSON.stringify({ items: rows.results || [], avg: average }), { headers: { 'Content-Type':'application/json' } });
  }
  if (request.method === 'POST') {
    const data = await request.json().catch(()=>null);
    if (!data || !data.name || !data.rating || !data.content) {
      return new Response(JSON.stringify({ error: 'Uzupełnij wszystkie pola.' }), { status: 400 });
    }
    const r = Math.max(1, Math.min(5, parseInt(data.rating, 10) || 0));
    await env.DB.prepare(`INSERT INTO reviews (name, rating, content, status) VALUES (?, ?, ?, 'pending')`)
      .bind(String(data.name).slice(0,100), r, String(data.content).slice(0,2000)).run();
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type':'application/json' } });
  }
  return new Response('Method Not Allowed', { status: 405 });
}
