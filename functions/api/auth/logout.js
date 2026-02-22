/* POST /api/auth/logout – clears the admin cookie */
export async function onRequestPost() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'torch_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'
    }
  });
}
