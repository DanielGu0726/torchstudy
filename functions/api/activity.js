export async function onRequestGet({ env }) {
  try {
    const [cardsRes, sessionsRes] = await Promise.all([
      env.DB.prepare(
        'SELECT id, title, description, image, date, order_num FROM activity_cards WHERE active=1 ORDER BY order_num ASC'
      ).all(),
      env.DB.prepare(
        'SELECT id, session_date, title, presenter, format, has_material, order_num FROM activity_sessions ORDER BY order_num ASC'
      ).all()
    ]);

    return Response.json({
      cards: cardsRes.results || [],
      sessions: sessionsRes.results || []
    });
  } catch (e) {
    return Response.json({ cards: [], sessions: [] }, { status: 500 });
  }
}
