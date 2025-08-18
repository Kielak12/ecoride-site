export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  if (!date) return new Response(JSON.stringify({ error: 'Parametr date wymagany (YYYY-MM-DD)' }), { status: 400 });

  // Godziny od 09 do 18 (co 60 min)
  const OPEN = 9, CLOSE = 19;
  const slots = Array.from({length: CLOSE-OPEN}, (_,i) => `${String(OPEN+i).padStart(2,'0')}:00`);

  const taken = await env.DB.prepare("SELECT time FROM bookings WHERE date = ? AND status != 'cancelled'").bind(date).all();
  const takenSet = new Set((taken.results || []).map(r => r.time));

  const free = slots.filter(s => !takenSet.has(s));
  return new Response(JSON.stringify({ date, slots: free }), { headers: { 'Content-Type': 'application/json' } });
}
