import { requireBasicAuth } from '../utils.js';
export async function onRequestPost({ request, env, params }) {
  if (!requireBasicAuth(request, env)) return new Response('Unauthorized', { status: 401 });
  const id = params.id;
  const data = await request.json().catch(()=>({}));
  const status = data.status;
  if (!['new','confirmed','completed','cancelled'].includes(status)) return new Response('Bad status', { status: 400 });
  await env.DB.prepare(`UPDATE bookings SET status = ? WHERE id = ?`).bind(status, id).run();
  return new Response(JSON.stringify({ ok:true }), { headers:{'Content-Type':'application/json'} });
}