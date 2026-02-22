/* GET /api/settings – public: returns reg_open status */
export async function onRequestGet(context) {
  try {
    const row = await context.env.DB
      .prepare('SELECT value FROM settings WHERE key = ?')
      .bind('reg_open')
      .first();

    return new Response(
      JSON.stringify({ reg_open: row?.value === 'true' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ reg_open: false, error: e.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
