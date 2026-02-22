export async function onRequestGet({ env }) {
  try {
    const keys = ['ws_active','ws_title','ws_description','ws_photo','ws_date','ws_location','ws_topic','ws_capacity'];
    const rows = await env.DB.prepare(
      `SELECT key, value FROM settings WHERE key IN (${keys.map(() => '?').join(',')})`
    ).bind(...keys).all();

    const map = {};
    (rows.results || []).forEach(r => { map[r.key] = r.value; });

    return Response.json({
      active:      map.ws_active === 'true',
      title:       map.ws_title       || '',
      description: map.ws_description || '',
      photo:       map.ws_photo       || '',
      date:        map.ws_date        || '',
      location:    map.ws_location    || '',
      topic:       map.ws_topic       || '',
      capacity:    map.ws_capacity    || ''
    });
  } catch (e) {
    return Response.json({ active: false }, { status: 500 });
  }
}
