export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, term, name, title, photo, year_start, year_end, order_num FROM past_presidents WHERE active=1 ORDER BY order_num ASC'
    ).all();
    return Response.json({ presidents: results || [] });
  } catch (e) {
    return Response.json({ presidents: [] }, { status: 500 });
  }
}
