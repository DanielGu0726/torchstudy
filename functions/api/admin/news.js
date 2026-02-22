// GET    /api/admin/news       → all news items
// POST   /api/admin/news       → create
// PATCH  /api/admin/news       → update (partial: {id,published} or {id,popup} or full)
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
  // Only one popup at a time
  if (body.popup) {
    await env.DB.prepare('UPDATE news_items SET popup=0').run();
  }
  await env.DB.prepare(
    'INSERT INTO news_items (title, content, category, image, popup, published, created_at) VALUES (?,?,?,?,?,?,?)'
  ).bind(
    body.title || '', body.content || '',
    body.category || '공지',
    body.image || '',
    body.popup ? 1 : 0,
    body.published === false ? 0 : 1,
    now
  ).run();
  return Response.json({ ok: true });
}

export async function onRequestPatch({ request, env }) {
  const body = await request.json();
  const { id } = body;
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });

  const keys = Object.keys(body).filter(k => k !== 'id');

  // Partial: published toggle only
  if (keys.length === 1 && keys[0] === 'published') {
    await env.DB.prepare('UPDATE news_items SET published=? WHERE id=?')
      .bind(body.published ? 1 : 0, id).run();
    return Response.json({ ok: true });
  }

  // Partial: popup toggle only
  if (keys.length === 1 && keys[0] === 'popup') {
    if (body.popup) {
      await env.DB.prepare('UPDATE news_items SET popup=0').run();
    }
    await env.DB.prepare('UPDATE news_items SET popup=? WHERE id=?')
      .bind(body.popup ? 1 : 0, id).run();
    return Response.json({ ok: true });
  }

  // Full update
  if ('popup' in body && body.popup) {
    await env.DB.prepare('UPDATE news_items SET popup=0 WHERE id!=?').bind(id).run();
  }
  await env.DB.prepare(
    'UPDATE news_items SET title=?, content=?, category=?, image=?, popup=?, published=? WHERE id=?'
  ).bind(
    body.title || '', body.content || '',
    body.category || '공지',
    body.image || '',
    body.popup ? 1 : 0,
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
