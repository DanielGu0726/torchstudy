/* GET/PATCH /api/admin/settings – protected by _middleware.js */

export async function onRequestGet(context) {
  const { results } = await context.env.DB
    .prepare('SELECT key, value FROM settings ORDER BY key')
    .all();
  return json({ settings: results });
}

export async function onRequestPatch(context) {
  let body;
  try { body = await context.request.json(); }
  catch { return json({ error: '잘못된 요청' }, 400); }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updates = Object.entries(body);

  if (updates.length === 0) return json({ error: '변경할 항목이 없습니다.' }, 400);

  for (const [key, value] of updates) {
    await context.env.DB
      .prepare('INSERT INTO settings (key,value,updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at')
      .bind(key, String(value), now)
      .run();
  }

  return json({ ok: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  });
}
