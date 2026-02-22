// GET  /api/admin/workshop           → config + registrations
// PATCH /api/admin/workshop          → update config
// DELETE /api/admin/workshop?reg_id=N → delete registration

const WS_KEYS = ['ws_active','ws_title','ws_description','ws_photo','ws_date','ws_location','ws_topic','ws_capacity'];

export async function onRequestGet({ env }) {
  const [cfgRows, regsRows] = await Promise.all([
    env.DB.prepare(
      `SELECT key, value FROM settings WHERE key IN (${WS_KEYS.map(() => '?').join(',')})`
    ).bind(...WS_KEYS).all(),
    env.DB.prepare(
      "SELECT * FROM registrations WHERE type='workshop' ORDER BY created_at DESC"
    ).all()
  ]);

  const config = {};
  (cfgRows.results || []).forEach(r => { config[r.key] = r.value; });

  return Response.json({
    config: {
      active:      config.ws_active === 'true',
      title:       config.ws_title       || '',
      description: config.ws_description || '',
      photo:       config.ws_photo       || '',
      date:        config.ws_date        || '',
      location:    config.ws_location    || '',
      topic:       config.ws_topic       || '',
      capacity:    config.ws_capacity    || ''
    },
    registrations: regsRows.results || []
  });
}

export async function onRequestPatch({ request, env }) {
  const body = await request.json();
  const now = new Date().toISOString();
  const allowed = ['ws_active','ws_title','ws_description','ws_photo','ws_date','ws_location','ws_topic','ws_capacity'];

  const updates = allowed.filter(k => k in body);
  if (!updates.length) return Response.json({ ok: true });

  await Promise.all(updates.map(k =>
    env.DB.prepare(
      'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)'
    ).bind(k, String(body[k]), now).run()
  ));
  return Response.json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('reg_id'));
  if (!id) return Response.json({ error: 'reg_id required' }, { status: 400 });
  await env.DB.prepare("DELETE FROM registrations WHERE id=? AND type='workshop'").bind(id).run();
  return Response.json({ ok: true });
}
