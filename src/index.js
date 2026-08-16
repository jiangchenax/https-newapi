const UPSTREAM_NOTICE = 'https://newapi.mossao.com/api/notice';

function corsHeaders(extra = {}) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...extra,
  };
}

async function handleNotice() {
  try {
    const response = await fetch(UPSTREAM_NOTICE, {
      method: 'GET',
      headers: {
        'Accept': 'application/json,text/plain,*/*',
        'User-Agent': 'MOSS-NewAPI-Home/1.0',
      },
      cf: {
        cacheTtl: 30,
        cacheEverything: false,
      },
    });

    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: corsHeaders({
        'Content-Type':
          response.headers.get('content-type') ||
          'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=15',
      }),
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: 'notice proxy failed',
        error: String(error),
      },
      {
        status: 502,
        headers: corsHeaders({
          'Cache-Control': 'no-store',
        }),
      },
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return new Response(null, {
        status: 204,
        headers: corsHeaders({
          'Access-Control-Max-Age': '86400',
        }),
      });
    }

    if (url.pathname === '/api/notice') {
      if (request.method !== 'GET') {
        return new Response('Method Not Allowed', {
          status: 405,
          headers: corsHeaders({
            'Allow': 'GET, OPTIONS',
          }),
        });
      }
      return handleNotice();
    }

    // All other requests are served from /public through the ASSETS binding.
    return env.ASSETS.fetch(request);
  },
};
