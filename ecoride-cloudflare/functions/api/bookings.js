export async function onRequestPost({ request, env }) {
  const data = await request.json().catch(()=>null);
  if (!data) return new Response(JSON.stringify({ error: 'Złe JSON' }), { status: 400 });
  const required = ['name','phone','email','vehicle_type','address','date','time'];
  for (const k of required) if (!data[k]) return new Response(JSON.stringify({ error: 'Uzupełnij wymagane pola.' }), { status: 400 });

  // sprawdź slot
  const taken = await env.DB.prepare("SELECT time FROM bookings WHERE date = ? AND time = ? AND status != 'cancelled'")
    .bind(data.date, data.time).all();
  if ((taken.results||[]).length) return new Response(JSON.stringify({ error: 'Wybrany termin został zajęty.' }), { status: 409 });

  await env.DB.prepare(`INSERT INTO bookings (name, phone, email, vehicle_type, address, date, time, package, notes, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`)
    .bind(
      String(data.name).slice(0,120),
      String(data.phone).slice(0,60),
      String(data.email).slice(0,120),
      String(data.vehicle_type).slice(0,40),
      String(data.address).slice(0,240),
      String(data.date),
      String(data.time),
      String(data.package||'').slice(0,80),
      String(data.notes||'').slice(0,1200)
    ).run();
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
}
