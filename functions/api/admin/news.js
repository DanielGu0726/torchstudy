// GET    /api/admin/news       → all news items
// POST   /api/admin/news       → create
// PATCH  /api/admin/news       → update
// DELETE /api/admin/news?id=N  → delete

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM news_items ORDER BY created_at DESC'
  ).all();
  return Response.json({ news: results || [] });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO news_items (title, content, category, published, created_at) VALUES (?,?,?,?,?)'
  ).bind(
    body.title || '', body.content || '',
    body.category || '공지',
    body.published === false ? 0 : 1,
    now
  ).run();
  return Response.json({ ok: true });
}

export async function onRequestPatch({ request, env }) {
  const body = await request.json();
  const { id } = body;
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });
  await env.DB.prepare(
    'UPDATE news_items SET title=?, content=?, category=?, published=? WHERE id=?'
  ).bind(
    body.title || '', body.content || '',
    body.category || '공지',
    body.published === false ? 0 : 1, id
  ).run();
  return Response.json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });
  await env.DB.prepare('DELETE FROM news_items WHERE id=?').bind(id).run();
  return Response.json({ ok: true });
}
