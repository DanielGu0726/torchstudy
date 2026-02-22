// GET    /api/admin/sponsors       → all sponsors
// POST   /api/admin/sponsors       → create
// PATCH  /api/admin/sponsors       → update
// DELETE /api/admin/sponsors?id=N  → delete

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM sponsors ORDER BY order_num ASC'
  ).all();
  return Response.json({ sponsors: results || [] });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO sponsors (name, logo, website, order_num, active, created_at) VALUES (?,?,?,?,1,?)'
  ).bind(
    body.name || '', body.logo || '', body.website || '',
    parseInt(body.order_num) || 0, now
  ).run();
  return Response.json({ ok: true });
}

export async function onRequestPatch({ request, env }) {
  const body = await request.json();
  const { id } = body;
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });
  await env.DB.prepare(
    'UPDATE sponsors SET name=?, logo=?, website=?, order_num=?, active=? WHERE id=?'
  ).bind(
    body.name || '', body.logo || '', body.website || '',
    parseInt(body.order_num) || 0, body.active === false ? 0 : 1, id
  ).run();
  return Response.json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });
  await env.DB.prepare('DELETE FROM sponsors WHERE id=?').bind(id).run();
  return Response.json({ ok: true });
}
