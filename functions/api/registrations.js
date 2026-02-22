/* POST /api/registrations – public form submission → D1 */
export async function onRequestPost(context) {
  const { request, env } = context;

  // Check if registration is open
  const setting = await env.DB
    .prepare('SELECT value FROM settings WHERE key = ?')
    .bind('reg_open')
    .first();

  if (setting?.value !== 'true') {
    return json({ error: '현재 모집 기간이 아닙니다.' }, 403);
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ error: '잘못된 요청입니다.' }, 400); }

  const { type, name, email, phone, affiliation, ...rest } = body;

  if (!type || !name || !email) {
    return json({ error: '필수 항목을 입력하세요.' }, 400);
  }
  if (!['study', 'symposium', 'workshop'].includes(type)) {
    return json({ error: '잘못된 신청 유형입니다.' }, 400);
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  await env.DB
    .prepare(
      'INSERT INTO registrations (type,name,email,phone,affiliation,data,status,created_at) VALUES (?,?,?,?,?,?,?,?)'
    )
    .bind(type, name, email, phone || '', affiliation || '', JSON.stringify(rest), 'pending', now)
    .run();

  return json({ ok: true, message: '신청이 완료되었습니다.' });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  });
}
