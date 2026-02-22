export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const year = url.searchParams.get('year') || '';
    const category = url.searchParams.get('category') || '';

    let sql = 'SELECT id, name, workplace, title, bio, photo, artwork, webpage, year, category, order_num FROM site_members WHERE active=1';
    const params = [];
    if (year) { sql += ' AND year=?'; params.push(year); }
    if (category) { sql += ' AND category=?'; params.push(category); }
    sql += ' ORDER BY order_num ASC';

    const { results } = await env.DB.prepare(sql).bind(...params).all();
    return Response.json({ members: results || [] });
  } catch (e) {
    return Response.json({ members: [] }, { status: 500 });
  }
}
