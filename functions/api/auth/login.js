/* ================================================
   POST /api/auth/login
   Body: { password: string }
   ================================================ */

function b64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function b64urlBytes(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function signJWT(payload, secret) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body   = b64url(JSON.stringify(payload));
  const msg    = `${header}.${body}`;
  const key    = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return `${msg}.${b64urlBytes(new Uint8Array(sig))}`;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); }
  catch { return json({ error: '잘못된 요청입니다.' }, 400); }

  const { password } = body;
  if (!password) return json({ error: '비밀번호를 입력하세요.' }, 400);

  // Compare against Cloudflare Secret
  if (password !== env.ADMIN_PASSWORD) {
    // Small delay to prevent brute-force
    await new Promise(r => setTimeout(r, 500));
    return json({ error: '비밀번호가 틀렸습니다.' }, 401);
  }

  // Issue JWT (24h expiry)
  const exp   = Math.floor(Date.now() / 1000) + 86400;
  const token = await signJWT({ role: 'admin', exp }, env.JWT_SECRET);

  const isProd = !context.request.url.includes('localhost');
  const cookieFlags = [
    `torch_admin=${token}`,
    'HttpOnly',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=86400`,
    isProd ? 'Secure' : ''
  ].filter(Boolean).join('; ');

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookieFlags
    }
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  });
}
