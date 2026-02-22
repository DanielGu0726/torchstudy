export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { name, phone, subject, message } = body;

    if (!name || !phone || !message) {
      return Response.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    await env.DB.prepare(
      'INSERT INTO messages (name, phone, subject, message, is_read, created_at) VALUES (?,?,?,?,0,?)'
    ).bind(
      String(name).slice(0, 100),
      String(phone).slice(0, 50),
      String(subject || '').slice(0, 200),
      String(message).slice(0, 2000),
      now
    ).run();

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: '전송 실패' }, { status: 500 });
  }
}
