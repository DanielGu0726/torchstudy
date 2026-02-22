// GET    /api/admin/members-list       → all members
// POST   /api/admin/members-list       → create
// PATCH  /api/admin/members-list       → update
// DELETE /api/admin/members-list?id=N  → delete

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM site_members ORDER BY year DESC, order_num ASC'
  ).all();
  return Response.json({ members: results || [] });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO site_members (name, workplace, title, bio, photo, artwork, webpage, year, category, order_num, active, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,1,?)'
  ).bind(
    body.name || '', body.workplace || '', body.title || '',
    body.bio || '', body.photo || '', body.artwork || '',
    body.webpage || '', body.year || '2026', body.category || 'current',
    parseInt(body.order_num) || 0, now
  ).run();
  return Response.json({ ok: true });
}

export async function onRequestPatch({ request, env }) {
  const body = await request.json();
  const { id } = body;
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });
  await env.DB.prepare(
    'UPDATE site_members SET name=?, workplace=?, title=?, bio=?, photo=?, artwork=?, webpage=?, year=?, category=?, order_num=?, active=? WHERE id=?'
  ).bind(
    body.name || '', body.workplace || '', body.title || '',
    body.bio || '', body.photo || '', body.artwork || '',
    body.webpage || '', body.year || '2026', body.category || 'current',
    parseInt(body.order_num) || 0, body.active === false ? 0 : 1, id
  ).run();
  return Response.json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });
  await env.DB.prepare('DELETE FROM site_members WHERE id=?').bind(id).run();
  return Response.json({ ok: true });
}
