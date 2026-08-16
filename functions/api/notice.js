const upstream = 'https://newapi.mossao.com/api/notice';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestGet() {
  try {
    const response = await fetch(upstream, {
      method: 'GET',
      headers: {
        'Accept': 'application/json,text/plain,*/*',
        'User-Agent': 'MOSS-CF-Pages-Home/1.0'
      },
      cf: {
        cacheTtl: 30,
        cacheEverything: false
      }
    });

    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('content-type') || 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=15'
      }
    });
  } catch (error) {
    return Response.json({
      success: false,
      message: 'notice proxy failed',
      error: String(error)
    }, {
      status: 502,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-store'
      }
    });
  }
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400'
    }
  });
}
