/* GET/PATCH /api/admin/registrations – protected */

export async function onRequestGet(context) {
  const url    = new URL(context.request.url);
  const type   = url.searchParams.get('type');   // study | symposium | workshop | all
  const status = url.searchParams.get('status'); // pending | approved | rejected | all

  let sql    = 'SELECT * FROM registrations';
  const args = [];
  const wheres = [];

  if (type && type !== 'all')   { wheres.push('type = ?');   args.push(type); }
  if (status && status !== 'all') { wheres.push('status = ?'); args.push(status); }
  if (wheres.length) sql += ' WHERE ' + wheres.join(' AND ');
  sql += ' ORDER BY created_at DESC LIMIT 200';

  const { results } = await context.env.DB.prepare(sql).bind(...args).all();

  // Parse data JSON for each row
  const rows = results.map(r => ({
    ...r,
    data: r.data ? (() => { try { return JSON.parse(r.data); } catch { return {}; } })() : {}
  }));

  // KPI counts
  const kpi = await context.env.DB
    .prepare('SELECT type, COUNT(*) as cnt FROM registrations GROUP BY type')
    .all();

  return json({ registrations: rows, kpi: kpi.results });
}

export async function onRequestPatch(context) {
  let body;
  try { body = await context.request.json(); }
  catch { return json({ error: '잘못된 요청' }, 400); }

  const { id, status } = body;
  if (!id || !status) return json({ error: 'id와 status가 필요합니다.' }, 400);
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return json({ error: '잘못된 status 값' }, 400);
  }

  const result = await context.env.DB
    .prepare('UPDATE registrations SET status = ? WHERE id = ?')
    .bind(status, id)
    .run();

  if (result.changes === 0) return json({ error: '해당 신청을 찾을 수 없습니다.' }, 404);
  return json({ ok: true });
}

export async function onRequestDelete(context) {
  const url = new URL(context.request.url);
  const id  = url.searchParams.get('id');
  if (!id) return json({ error: 'id가 필요합니다.' }, 400);

  await context.env.DB
    .prepare('DELETE FROM registrations WHERE id = ?')
    .bind(id)
    .run();

  return json({ ok: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  });
}
