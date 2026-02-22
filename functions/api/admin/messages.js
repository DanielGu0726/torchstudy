// GET    /api/admin/messages       → all messages
// PATCH  /api/admin/messages       → mark as read { id }
// DELETE /api/admin/messages?id=N  → delete

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM messages ORDER BY created_at DESC'
  ).all();
  return Response.json({ messages: results || [] });
}

export async function onRequestPatch({ request, env }) {
  const body = await request.json();
  const { id } = body;
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });
  await env.DB.prepare('UPDATE messages SET is_read=1 WHERE id=?').bind(id).run();
  return Response.json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return Response.json({ error: 'id required' }, { status: 400 });
  await env.DB.prepare('DELETE FROM messages WHERE id=?').bind(id).run();
  return Response.json({ ok: true });
}
