export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, name, logo, website, order_num FROM sponsors WHERE active=1 ORDER BY order_num ASC'
    ).all();
    return Response.json({ sponsors: results || [] });
  } catch (e) {
    return Response.json({ sponsors: [] }, { status: 500 });
  }
}
