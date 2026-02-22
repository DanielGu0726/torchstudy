// GET /api/popup → returns the current popup news item (popup=1, published=1)
export async function onRequestGet({ env }) {
  try {
    const row = await env.DB.prepare(
      'SELECT id, title, image FROM news_items WHERE popup=1 AND published=1 LIMIT 1'
    ).first();
    return Response.json({ popup: row || null });
  } catch(e) {
    return Response.json({ popup: null });
  }
}
