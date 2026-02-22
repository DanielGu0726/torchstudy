/* ================================================
   _middleware.js – JWT auth guard for /api/admin/*
   ================================================ */

function b64urlDecode(str) {
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}

async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const sigBytes = Uint8Array.from(b64urlDecode(parts[2]), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify(
    'HMAC', key, sigBytes,
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  );
  if (!valid) throw new Error('Invalid signature');

  const payload = JSON.parse(b64urlDecode(parts[1]));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }
  return payload;
}

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // Only protect /api/admin/* routes
  if (!url.pathname.startsWith('/api/admin/')) {
    return next();
  }

  const cookie = request.headers.get('Cookie') || '';
  const match  = cookie.match(/torch_admin=([^;]+)/);

  if (!match) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const payload = await verifyJWT(match[1], env.JWT_SECRET);
    context.data.admin = payload;
    return next();
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    });
  }
}
