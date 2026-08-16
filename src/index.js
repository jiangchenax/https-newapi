const HOME_PREFIX = '/_moss-home/';

function isWorkersDev(hostname) {
  return hostname.endsWith('.workers.dev');
}

async function serveHome(request, env) {
  // ASSETS only uses the pathname for matching. "/" resolves to public/index.html.
  return env.ASSETS.fetch(request);
}

async function previewMode(request, env) {
  const url = new URL(request.url);

  if (url.pathname === '/' || url.pathname.startsWith(HOME_PREFIX)) {
    return serveHome(request, env);
  }

  if (url.pathname === '/api/notice') {
    return fetch('https://newapi.mossao.com/api/notice', {
      method: 'GET',
      headers: {
        'Accept': 'application/json,text/plain,*/*'
      }
    });
  }

  // Preview host: other links jump to the real New API.
  const destination = new URL(request.url);
  destination.protocol = 'https:';
  destination.hostname = 'newapi.mossao.com';

  return Response.redirect(destination.toString(), 302);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Safe preview on workers.dev.
    if (isWorkersDev(url.hostname)) {
      return previewMode(request, env);
    }

    /*
     * Production mode on Worker Route:
     *
     * newapi.mossao.com/
     *   -> serve our own homepage directly
     *
     * newapi.mossao.com/_moss-home/*
     *   -> serve our CSS/JS assets
     *
     * all other paths
     *   -> pass through to the existing New API origin
     *
     * There is NO iframe and NO HTMLRewriter on "/".
     * Therefore the original New API Header simply does not exist on the homepage.
     */
    if (url.pathname === '/' || url.pathname.startsWith(HOME_PREFIX)) {
      return serveHome(request, env);
    }

    // Worker Route subrequest continues to the origin defined by Cloudflare DNS.
    return fetch(request);
  }
};
