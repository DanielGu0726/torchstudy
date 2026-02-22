/* POST /api/registrations – public form submission → D1 */
export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); }
  catch { return json({ error: '잘못된 요청입니다.' }, 400); }

  const { type, name, phone, email, affiliation, ...rest } = body;

  if (!type || !name) {
    return json({ error: '필수 항목을 입력하세요.' }, 400);
  }
  if (!['study', 'symposium', 'workshop'].includes(type)) {
    return json({ error: '잘못된 신청 유형입니다.' }, 400);
  }

  // Check open/close per type
  if (type === 'workshop') {
    const setting = await env.DB
      .prepare("SELECT value FROM settings WHERE key = 'ws_active'")
      .first();
    if (setting?.value !== 'true') {
      return json({ error: '현재 Workshop 모집 기간이 아닙니다.' }, 403);
    }
  } else {
    const setting = await env.DB
      .prepare("SELECT value FROM settings WHERE key = 'reg_open'")
      .first();
    if (setting?.value !== 'true') {
      return json({ error: '현재 모집 기간이 아닙니다.' }, 403);
    }
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  await env.DB
    .prepare(
      'INSERT INTO registrations (type,name,email,phone,affiliation,data,status,created_at) VALUES (?,?,?,?,?,?,?,?)'
    )
    .bind(
      type,
      String(name).slice(0, 100),
      String(email || '').slice(0, 200),
      String(phone || '').slice(0, 50),
      String(affiliation || '').slice(0, 200),
      JSON.stringify(rest),
      'pending',
      now
    )
    .run();

  return json({ ok: true, message: '신청이 완료되었습니다.' });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  });
}
