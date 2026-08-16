const HOME_PREFIX = '/_moss-home/';

const HOME_SHELL = `<div id="moss-home-shell" aria-hidden="false">

  <div class="moss-topbar" aria-label="首页顶部栏">
    <a class="moss-brand" href="/" aria-label="New API 首页">
      <img src="https://res.oplist.org/logo/logo.svg" alt="">
      <span>New API</span>
    </a>

    <details class="moss-account" id="mossAccount">
      <summary class="moss-avatar" aria-label="账户菜单">J</summary>

      <div class="moss-account-menu">
        <div class="moss-account-head">
          <div class="moss-account-big-avatar">J</div>
          <div>
            <strong>Root User</strong>
            <span>超级管理员 · default</span>
          </div>
        </div>

        <div class="moss-account-sep"></div>

        <a href="/console/personal">个人资料</a>
        <a href="/console/topup">钱包</a>
        <a href="/console/setting">系统设置</a>

        <div class="moss-account-sep"></div>

        <button type="button" class="moss-logout" id="mossLogout">退出</button>
      </div>
    </details>
  </div>

  <div class="moss-wallpaper" aria-hidden="true"></div>
  <div class="moss-vignette" aria-hidden="true"></div>
  <div class="moss-focus-field" id="mossFocusField" aria-hidden="true"></div>

  <main class="moss-stage">
    <button
      class="moss-bell moss-glass"
      id="mossBellButton"
      type="button"
      aria-label="通知"
      aria-expanded="false"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
        <path d="M10 21h4"></path>
      </svg>
      <span class="moss-bell-dot" aria-hidden="true"></span>
    </button>

    <section
      class="moss-notice-panel"
      id="mossNoticePanel"
      aria-hidden="true"
      aria-label="系统公告"
    >
      <div class="moss-panel-sheen" id="mossPanelSheen" aria-hidden="true"></div>

      <div class="moss-panel-inner" id="mossPanelInner">
        <div class="moss-notice-head">
          <div>
            <h2>系统公告</h2>
            <p>最新平台更新和通知</p>
          </div>

          <button
            class="moss-icon-button"
            id="mossCloseNotice"
            type="button"
            aria-label="关闭通知"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 6l12 12M18 6L6 18"></path>
            </svg>
          </button>
        </div>

        <div class="moss-tabs" role="tablist" aria-label="公告视图">
          <button
            class="moss-tab is-active"
            type="button"
            data-moss-tab="notice"
            role="tab"
            aria-selected="true"
          >通知</button>

          <button
            class="moss-tab"
            type="button"
            data-moss-tab="timeline"
            role="tab"
            aria-selected="false"
          >时间线</button>
        </div>

        <div class="moss-notice-scroll">
          <div id="mossNoticeView"></div>
          <div id="mossTimelineView" hidden></div>
        </div>

        <div class="moss-notice-foot">
          <span class="moss-status"><i></i>ALL SYSTEMS OPERATIONAL</span>
          <button class="moss-soft-button" id="mossRefreshNotice" type="button">刷新</button>
        </div>
      </div>
    </section>
  </main>

  <details class="moss-contact moss-glass" id="mossContact">
    <summary class="moss-contact-summary">
      <span class="moss-contact-email">Meetfriends520@gmail.com</span>
    </summary>

    <div class="moss-contact-actions">
      <span class="moss-contact-divider"></span>

      <button
        class="moss-contact-action moss-copy-action"
        id="mossCopyEmail"
        type="button"
        aria-label="复制邮箱"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="8" y="8" width="11" height="11" rx="2"></rect>
          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path>
        </svg>
        <span id="mossCopyLabel">COPY</span>
      </button>

      <a
        class="moss-contact-action"
        href="https://mail.google.com/mail/?view=cm&fs=1&to=Meetfriends520%40gmail.com"
        target="_blank"
        rel="noopener noreferrer"
      >GMAIL</a>

      <a
        class="moss-contact-action"
        href="https://outlook.office.com/mail/deeplink/compose?to=Meetfriends520%40gmail.com"
        target="_blank"
        rel="noopener noreferrer"
      >OUTLOOK</a>

      <a
        class="moss-contact-action"
        href="https://mail.qq.com/cgi-bin/frame_html?url=compose&to=Meetfriends520%40gmail.com"
        target="_blank"
        rel="noopener noreferrer"
      >QQ邮箱</a>
    </div>
  </details>
</div>`;

function isWorkersDev(hostname) {
  return hostname.endsWith('.workers.dev');
}

function isHtml(response) {
  const type = response.headers.get('content-type') || '';
  return type.toLowerCase().includes('text/html');
}

async function serveHomeAsset(request, env) {
  return env.ASSETS.fetch(request);
}

async function previewMode(request, env) {
  const url = new URL(request.url);

  if (url.pathname.startsWith(HOME_PREFIX)) {
    return serveHomeAsset(request, env);
  }

  if (url.pathname === '/api/notice') {
    return fetch('https://newapi.mossao.com/api/notice', {
      method: 'GET',
      headers: {
        'Accept': 'application/json,text/plain,*/*'
      }
    });
  }

  if (url.pathname === '/') {
    // 直接按原始 "/" 请求静态资源。
    // Cloudflare Static Assets 会把 "/" 正常解析为 index.html。
    // 不要内部改写成 "/index.html"：默认 HTML handling 会把
    // "/index.html" 307 规范化回 "/"，从而形成无限重定向。
    return env.ASSETS.fetch(request);
  }

  const destination = new URL(request.url);
  destination.protocol = 'https:';
  destination.hostname = 'newapi.mossao.com';

  return Response.redirect(destination.toString(), 302);
}

async function injectHomeLayer(response, isHome) {
  if (!isHtml(response)) return response;

  return new HTMLRewriter()
    .on('html', {
      element(el) {
        if (isHome) {
          // 在 HTML 返回给浏览器前就标记首页，避免等待 JS 后再隐藏原 Header。
          el.setAttribute('data-moss-home', '1');
        }
      }
    })
    .on('head', {
      element(el) {
        let injected =
          '<link rel="stylesheet" href="/_moss-home/styles.css">' +
          '<script src="/_moss-home/app.js" defer></script>';

        if (isHome) {
          // 首页原生 Header 在首屏阶段就直接隐藏，不给它任何闪现机会。
          injected =
            '<style id="moss-home-native-header-kill">' +
            'html[data-moss-home="1"] body header{display:none!important}' +
            '</style>' +
            injected;
        }

        el.append(injected, { html: true });
      }
    })
    .on('body', {
      element(el) {
        el.append(HOME_SHELL, { html: true });
      }
    })
    .transform(response);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // workers.dev remains a safe preview endpoint.
    if (isWorkersDev(url.hostname)) {
      return previewMode(request, env);
    }

    // Private namespace for our home CSS/JS.
    if (url.pathname.startsWith(HOME_PREFIX)) {
      return serveHomeAsset(request, env);
    }

    /*
     * PRODUCTION MODE:
     *
     * This Worker must be attached using a Worker Route:
     *   newapi.mossao.com/*
     *
     * The existing proxied DNS record remains pointed at the New API VPS.
     * On a Worker Route, fetch(request) continues to the existing origin.
     */
    const originResponse = await fetch(request);

    // Only HTML documents get our shell injected.
    if (isHtml(originResponse)) {
      return injectHomeLayer(originResponse, url.pathname === '/');
    }

    return originResponse;
  }
};