export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, title, content, category, image, created_at FROM news_items WHERE published=1 ORDER BY created_at DESC'
    ).all();
    return Response.json({ news: results || [] });
  } catch (e) {
    return Response.json({ news: [] }, { status: 500 });
  }
}
