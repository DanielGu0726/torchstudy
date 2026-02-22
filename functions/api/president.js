export async function onRequestGet({ env }) {
  try {
    const keys = ['president_name', 'president_title', 'president_bio', 'president_photo'];
    const { results } = await env.DB.prepare(
      `SELECT key, value FROM settings WHERE key IN (${keys.map(() => '?').join(',')})`
    ).bind(...keys).all();

    const map = {};
    (results || []).forEach(r => { map[r.key] = r.value; });

    return Response.json({
      name:  map.president_name  || '김치기',
      title: map.president_title || 'TORCH 2026 회장',
      bio:   map.president_bio   || '',
      photo: map.president_photo || ''
    });
  } catch (e) {
    return Response.json({ name: '', title: '', bio: '', photo: '' }, { status: 500 });
  }
}
