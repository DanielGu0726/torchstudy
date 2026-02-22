// GET  /api/admin/activity?type=cards|sessions
// POST /api/admin/activity   { type, ...fields }
// PATCH /api/admin/activity  { type, id, ...fields }
// DELETE /api/admin/activity?type=cards|sessions&id=N

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'cards';

  if (type === 'sessions') {
    const { results } = await env.DB.prepare(
      'SELECT * FROM activity_sessions ORDER BY order_num ASC'
    ).all();
    return Response.json({ sessions: results || [] });
  } else {
    const { results } = await env.DB.prepare(
      'SELECT * FROM activity_cards ORDER BY order_num ASC'
    ).all();
    return Response.json({ cards: results || [] });
  }
}

export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const { type } = body;
  const now = new Date().toISOString();

  if (type === 'session') {
    await env.DB.prepare(
      'INSERT INTO activity_sessions (session_date, title, presenter, format, has_material, order_num, created_at) VALUES (?,?,?,?,?,?,?)'
    ).bind(
      body.session_date || '', body.title || '', body.presenter || '',
      body.format || '', body.has_material ? 1 : 0,
      parseInt(body.order_num) || 0, now
    ).run();
  } else {
    await env.DB.prepare(
      'INSERT INTO activity_cards (title, description, image, date, order_num, active, created_at) VALUES (?,?,?,?,?,1,?)'
    ).bind(
      body.title || '', body.description || '', body.image || '',
      body.date || '', parseInt(body.order_num) || 0, now
    ).run();
  }
  return Response.json({ ok: true });
}

export async function onRequestPatch({ request, env }) {
  const body = await request.json();
  const { type, id } = body;

  if (type === 'session') {
    await env.DB.prepare(
      'UPDATE activity_sessions SET session_date=?, title=?, presenter=?, format=?, has_material=?, order_num=? WHERE id=?'
    ).bind(
      body.session_date || '', body.title || '', body.presenter || '',
      body.format || '', body.has_material ? 1 : 0,
      parseInt(body.order_num) || 0, id
    ).run();
  } else {
    await env.DB.prepare(
      'UPDATE activity_cards SET title=?, description=?, image=?, date=?, order_num=?, active=? WHERE id=?'
    ).bind(
      body.title || '', body.description || '', body.image || '',
      body.date || '', parseInt(body.order_num) || 0,
      body.active === false ? 0 : 1, id
    ).run();
  }
  return Response.json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const id = parseInt(url.searchParams.get('id'));

  if (!id) return Response.json({ error: 'id required' }, { status: 400 });

  if (type === 'session') {
    await env.DB.prepare('DELETE FROM activity_sessions WHERE id=?').bind(id).run();
  } else {
    await env.DB.prepare('DELETE FROM activity_cards WHERE id=?').bind(id).run();
  }
  return Response.json({ ok: true });
}
