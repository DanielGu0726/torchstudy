// GET    /api/admin/past-presidents       → all past presidents
// POST   /api/admin/past-presidents       → create
// PATCH  /api/admin/past-presidents       → update
// DELETE /api/admin/past-presidents?id=N  → delete

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM past_presidents ORDER BY order_num ASC'
  ).all();
  return Response.json({ presidents: results || [] });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO past_presidents (term, name, title, photo, year_start, year_end, order_num, active, created_at) VALUES (?,?,?,?,?,?,?,1,?)'
  ).bind(
    body.term || '',
    body.name || '',
    body.title || '',
    body.photo || '',
    body.year_start || '',
    body.year_end || '',
    parseInt(body.order_num) || 0,
    now
  ).run();
  return Response.json({ ok: true });
}

export async function onRequestPatch({ request, env }) {
  const body = await request.json();
  const { id } = body;
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });
  await env.DB.prepare(
    'UPDATE past_presidents SET term=?, name=?, title=?, photo=?, year_start=?, year_end=?, order_num=?, active=? WHERE id=?'
  ).bind(
    body.term || '',
    body.name || '',
    body.title || '',
    body.photo || '',
    body.year_start || '',
    body.year_end || '',
    parseInt(body.order_num) || 0,
    body.active === false ? 0 : 1,
    id
  ).run();
  return Response.json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });
  await env.DB.prepare('DELETE FROM past_presidents WHERE id=?').bind(id).run();
  return Response.json({ ok: true });
}
