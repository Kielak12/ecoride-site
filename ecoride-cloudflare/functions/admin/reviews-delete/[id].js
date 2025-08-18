import { requireBasicAuth } from '../utils.js';
export async function onRequestPost({ request, env, params }) {
  if (!requireBasicAuth(request, env)) return new Response('Unauthorized', { status: 401 });
  const id = params.id;
  await env.DB.prepare(`DELETE FROM reviews WHERE id = ?`).bind(id).run();
  return new Response(JSON.stringify({ ok:true }), { headers:{'Content-Type':'application/json'} });
}