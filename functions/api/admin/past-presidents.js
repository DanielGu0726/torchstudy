import { verifyAuth } from '../../../js/admin.js';

export async function onRequest({ request, env }) {
  const authResult = await verifyAuth(request, env);
  if (!authResult.valid) {
    return new Response('Unauthorized', { status: 401 });
  }

  const method = request.method;

  // GET: 전체 역대 회장 목록
  if (method === 'GET') {
    try {
      const { results } = await env.DB.prepare(
        'SELECT * FROM past_presidents ORDER BY order_num ASC'
      ).all();
      return Response.json({ presidents: results || [] });
    } catch (e) {
      return Response.json({ presidents: [] }, { status: 500 });
    }
  }

  // POST: 새 역대 회장 추가
  if (method === 'POST') {
    try {
      const data = await request.json();
      await env.DB.prepare(
        `INSERT INTO past_presidents (term, name, title, photo, year_start, year_end, order_num, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
      ).bind(
        data.term || '',
        data.name || '',
        data.title || '',
        data.photo || '',
        data.year_start || '',
        data.year_end || '',
        data.order_num || 0
      ).run();
      return Response.json({ success: true });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  // PATCH: 역대 회장 수정
  if (method === 'PATCH') {
    try {
      const data = await request.json();
      const updates = [];
      const binds = [];

      if (data.term !== undefined) { updates.push('term=?'); binds.push(data.term); }
      if (data.name !== undefined) { updates.push('name=?'); binds.push(data.name); }
      if (data.title !== undefined) { updates.push('title=?'); binds.push(data.title); }
      if (data.photo !== undefined) { updates.push('photo=?'); binds.push(data.photo); }
      if (data.year_start !== undefined) { updates.push('year_start=?'); binds.push(data.year_start); }
      if (data.year_end !== undefined) { updates.push('year_end=?'); binds.push(data.year_end); }
      if (data.order_num !== undefined) { updates.push('order_num=?'); binds.push(data.order_num); }
      if (data.active !== undefined) { updates.push('active=?'); binds.push(data.active ? 1 : 0); }

      binds.push(data.id);

      await env.DB.prepare(
        `UPDATE past_presidents SET ${updates.join(', ')} WHERE id=?`
      ).bind(...binds).run();

      return Response.json({ success: true });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  // DELETE: 역대 회장 삭제
  if (method === 'DELETE') {
    try {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');
      await env.DB.prepare('DELETE FROM past_presidents WHERE id=?').bind(id).run();
      return Response.json({ success: true });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
