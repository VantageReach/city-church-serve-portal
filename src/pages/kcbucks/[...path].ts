import type { APIRoute } from 'astro';

export const prerender = false;

// KC Bucks is its own Vercel project. Vercel ignores vercel.json rewrites for this Astro
// build, so /kcbucks is relayed from here instead.
const UPSTREAM = 'https://kid-city-bucks.vercel.app';
const DROP_REQUEST = ['host', 'connection', 'content-length', 'accept-encoding', 'x-forwarded-host', 'x-forwarded-for', 'x-real-ip'];
const DROP_RESPONSE = ['content-encoding', 'content-length', 'transfer-encoding', 'connection', 'set-cookie'];

export const ALL: APIRoute = async ({ request, url, clientAddress }) => {
  const headers = new Headers(request.headers);
  for (const h of DROP_REQUEST) headers.delete(h);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress;
  if (ip) headers.set('x-kcb-client-ip', ip);

  const hasBody = !['GET', 'HEAD'].includes(request.method);
  const res = await fetch(`${UPSTREAM}${url.pathname}${url.search}`, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    redirect: 'manual',
  });

  const out = new Headers();
  res.headers.forEach((value, key) => {
    if (!DROP_RESPONSE.includes(key)) out.set(key, value);
  });
  for (const cookie of res.headers.getSetCookie()) out.append('set-cookie', cookie);
  const location = out.get('location');
  if (location?.startsWith(UPSTREAM)) out.set('location', location.slice(UPSTREAM.length) || '/');

  return new Response(res.body, { status: res.status, headers: out });
};
