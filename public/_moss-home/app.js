(() => {
  if (window.__MOSS_HOME_LOADED__) return;
  window.__MOSS_HOME_LOADED__ = true;

  const EMAIL = 'Meetfriends520@gmail.com';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const shell = $('#moss-home-shell');
  if (!shell) return;

  const bell = $('#mossBellButton');
  const panel = $('#mossNoticePanel');
  const panelInner = $('#mossPanelInner');
  const sheen = $('#mossPanelSheen');
  const focusField = $('#mossFocusField');
  const closeNotice = $('#mossCloseNotice');
  const refreshNotice = $('#mossRefreshNotice');
  const noticeView = $('#mossNoticeView');
  const timelineView = $('#mossTimelineView');
  const contact = $('#mossContact');
  const copyEmail = $('#mossCopyEmail');
  const copyLabel = $('#mossCopyLabel');

  let noticeState = 'closed';
  let activeAnimations = [];

  function isHomePath() {
    return location.pathname === '/';
  }

  function applyRouteState() {
    const active = isHomePath();
    document.documentElement.toggleAttribute('data-moss-home', active);
    if (active) {
      document.documentElement.setAttribute('data-moss-home', '1');
      shell.setAttribute('aria-hidden', 'false');
    } else {
      document.documentElement.removeAttribute('data-moss-home');
      shell.setAttribute('aria-hidden', 'true');
      if (noticeState !== 'closed') hardClose();
      if (contact) contact.open = false;
    }
  }

  // React Router / SPA navigation watcher.
  const oldPushState = history.pushState;
  history.pushState = function (...args) {
    const result = oldPushState.apply(this, args);
    queueMicrotask(applyRouteState);
    return result;
  };

  const oldReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    const result = oldReplaceState.apply(this, args);
    queueMicrotask(applyRouteState);
    return result;
  };

  addEventListener('popstate', applyRouteState);
  applyRouteState();

  function cancelAnimations() {
    activeAnimations.forEach(a => {
      try { a.cancel(); } catch (_) {}
    });
    activeAnimations = [];
  }

  function animate(el, frames, options) {
    const a = el.animate(frames, options);
    activeAnimations.push(a);
    return a;
  }

  function hardClose() {
    cancelAnimations();
    noticeState = 'closed';
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    bell.setAttribute('aria-expanded', 'false');
    panel.style.opacity = '0';
    panel.style.transform = 'translate(-50%, -50%)';
    panelInner.style.opacity = '0';
    focusField.style.opacity = '0';
    bell.style.opacity = '1';
    bell.style.transform = 'translate(-50%, -50%)';
    contact.style.opacity = '1';
    contact.style.transform = 'translateX(-50%)';
  }

  function openNotice() {
    if (!isHomePath()) return;
    if (noticeState === 'open' || noticeState === 'opening') return;

    noticeState = 'opening';
    cancelAnimations();

    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    bell.setAttribute('aria-expanded', 'true');

    const duration = 560;

    // Glass Unfold: short glass strip -> horizontal spread -> vertical unfold.
    const panelAnim = animate(panel, [
      {
        opacity: 0,
        transform: 'translate(-50%, -50%) scale3d(.24,.035,1)',
        borderRadius: '999px',
        offset: 0
      },
      {
        opacity: 1,
        transform: 'translate(-50%, -50%) scale3d(.96,.055,1)',
        borderRadius: '999px',
        offset: .34
      },
      {
        opacity: 1,
        transform: 'translate(-50%, -50%) scale3d(1,.58,1)',
        borderRadius: '34px',
        offset: .62
      },
      {
        opacity: 1,
        transform: 'translate(-50%, calc(-50% - 2px)) scale3d(1.008,1.018,1)',
        borderRadius: '19px',
        offset: .82
      },
      {
        opacity: 1,
        transform: 'translate(-50%, -50%) scale3d(1,1,1)',
        borderRadius: '20px',
        offset: 1
      }
    ], {
      duration,
      easing: 'cubic-bezier(.16,1,.3,1)',
      fill: 'forwards'
    });

    animate(bell, [
      {
        opacity: 1,
        transform: 'translate(-50%, -50%) scale(.94)'
      },
      {
        opacity: 1,
        transform: 'translate(-50%, -50%) scale(1.045)',
        offset: .30
      },
      {
        opacity: 0,
        transform: 'translate(-50%, -50%) scale(.80)'
      }
    ], {
      duration: 330,
      easing: 'cubic-bezier(.2,.8,.2,1)',
      fill: 'forwards'
    });

    animate(focusField, [
      { opacity: 0 },
      { opacity: .78 }
    ], {
      duration: 330,
      easing: 'ease-out',
      fill: 'forwards'
    });

    animate(panelInner, [
      {
        opacity: 0,
        transform: 'translateY(13px) scale(.988)'
      },
      {
        opacity: 1,
        transform: 'translateY(0) scale(1)'
      }
    ], {
      duration: 350,
      delay: 150,
      easing: 'cubic-bezier(.16,1,.3,1)',
      fill: 'forwards'
    });

    animate(sheen, [
      {
        opacity: 0,
        transform: 'rotate(12deg) translate3d(0,0,0)'
      },
      {
        opacity: .46,
        offset: .22
      },
      {
        opacity: .22,
        offset: .68
      },
      {
        opacity: 0,
        transform: 'rotate(12deg) translate3d(485%,0,0)'
      }
    ], {
      duration: 650,
      delay: 170,
      easing: 'cubic-bezier(.22,1,.36,1)',
      fill: 'forwards'
    });

    animate(contact, [
      {
        opacity: 1,
        transform: 'translateX(-50%) translateY(0) scale(1)'
      },
      {
        opacity: 0,
        transform: 'translateX(-50%) translateY(7px) scale(.97)'
      }
    ], {
      duration: 220,
      easing: 'ease-out',
      fill: 'forwards'
    });

    panelAnim.finished.then(() => {
      noticeState = 'open';
    }).catch(() => {});
  }

  function closeNoticePanel() {
    if (noticeState === 'closed' || noticeState === 'closing') return;

    noticeState = 'closing';
    cancelAnimations();

    const duration = 460;

    animate(panelInner, [
      {
        opacity: 1,
        transform: 'translateY(0) scale(1)'
      },
      {
        opacity: 0,
        transform: 'translateY(5px) scale(.995)'
      }
    ], {
      duration: 170,
      easing: 'ease-in',
      fill: 'forwards'
    });

    const panelAnim = animate(panel, [
      {
        opacity: 1,
        transform: 'translate(-50%, -50%) scale3d(1,1,1)',
        borderRadius: '20px',
        offset: 0
      },
      {
        opacity: .96,
        transform: 'translate(-50%, -50%) scale3d(1,.10,1)',
        borderRadius: '34px',
        offset: .52
      },
      {
        opacity: .72,
        transform: 'translate(-50%, -50%) scale3d(.50,.032,1)',
        borderRadius: '999px',
        offset: .78
      },
      {
        opacity: 0,
        transform: 'translate(-50%, -50%) scale3d(.24,.028,1)',
        borderRadius: '999px',
        offset: 1
      }
    ], {
      duration,
      easing: 'cubic-bezier(.4,0,.2,1)',
      fill: 'forwards'
    });

    animate(bell, [
      {
        opacity: 0,
        transform: 'translate(-50%, -50%) scale(.82)'
      },
      {
        opacity: 1,
        transform: 'translate(-50%, -50%) scale(1.025)',
        offset: .76
      },
      {
        opacity: 1,
        transform: 'translate(-50%, -50%) scale(1)'
      }
    ], {
      duration: 390,
      delay: 40,
      easing: 'cubic-bezier(.2,.8,.2,1)',
      fill: 'forwards'
    });

    animate(focusField, [
      { opacity: .78 },
      { opacity: 0 }
    ], {
      duration: 300,
      easing: 'ease-in',
      fill: 'forwards'
    });

    animate(contact, [
      {
        opacity: 0,
        transform: 'translateX(-50%) translateY(7px) scale(.97)'
      },
      {
        opacity: 1,
        transform: 'translateX(-50%) translateY(0) scale(1)'
      }
    ], {
      duration: 300,
      delay: 120,
      easing: 'ease-out',
      fill: 'forwards'
    });

    panelAnim.finished.then(() => {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      bell.setAttribute('aria-expanded', 'false');
      noticeState = 'closed';
    }).catch(() => {});
  }

  bell.addEventListener('click', openNotice);
  closeNotice.addEventListener('click', closeNoticePanel);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && noticeState === 'open') {
      closeNoticePanel();
    }
  });

  $$('.moss-tab', shell).forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.moss-tab', shell).forEach(x => {
        const active = x === btn;
        x.classList.toggle('is-active', active);
        x.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      const timeline = btn.dataset.mossTab === 'timeline';
      noticeView.hidden = timeline;
      timelineView.hidden = !timeline;
    });
  });

  copyEmail.addEventListener('click', async e => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(EMAIL);
      copyEmail.classList.add('is-copied');
      copyLabel.textContent = 'COPIED';

      setTimeout(() => {
        copyEmail.classList.remove('is-copied');
        copyLabel.textContent = 'COPY';
      }, 1300);
    } catch {
      window.prompt('复制邮箱：', EMAIL);
    }
  });

  document.addEventListener('pointerdown', e => {
    if (contact.open && !contact.contains(e.target)) {
      contact.open = false;
    }
  });

  function escapeHTML(s = '') {
    return String(s).replace(
      /[&<>"']/g,
      c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[c])
    );
  }

  function normalizeNoticePayload(payload) {
    const pool = [
      payload?.data,
      payload?.notices,
      payload?.notice,
      payload?.data?.notices,
      payload?.data?.notice,
      payload
    ];

    for (const value of pool) {
      if (Array.isArray(value)) return value;
    }

    for (const value of pool) {
      if (typeof value === 'string' && value.trim()) {
        return [{
          title: '系统公告',
          content: value,
          time: new Date().toISOString()
        }];
      }
    }

    return [];
  }

  function renderFallback() {
    renderNotices([{
      title: '🟢 系统运行正常',
      content: 'API 正常 · 模型在线 · 服务稳定',
      tip: '常用模型建议准备备用通道，关键时候更稳。',
      time: new Date().toISOString()
    }]);
  }

  function renderNotices(items) {
    if (!items.length) {
      renderFallback();
      return;
    }

    noticeView.innerHTML = items.slice(0, 10).map((item, idx) => {
      const title =
        item.title ||
        item.name ||
        item.type ||
        `公告 ${idx + 1}`;

      const content =
        item.content ||
        item.description ||
        item.message ||
        item.text ||
        '';

      const time =
        item.time ||
        item.created_at ||
        item.createdAt ||
        item.date ||
        '';

      return `
        <article class="moss-notice-card">
          <h3>${escapeHTML(title)}</h3>
          ${
            idx === 0
              ? `<div class="moss-chips">
                  <span class="moss-chip">API 正常</span>
                  <span class="moss-chip">模型在线</span>
                  <span class="moss-chip">服务稳定</span>
                </div>`
              : ''
          }
          <p>${escapeHTML(content)}</p>
          ${
            item.tip
              ? `<div class="moss-tip">${escapeHTML(item.tip)}</div>`
              : ''
          }
          ${
            time
              ? `<p style="font-size:9px;color:rgba(255,255,255,.28);margin-top:9px">
                  ${escapeHTML(String(time))}
                </p>`
              : ''
          }
        </article>
      `;
    }).join('');

    timelineView.innerHTML = items.slice(0, 12).map((item, idx) => {
      const title =
        item.title ||
        item.name ||
        `公告 ${idx + 1}`;

      const content =
        item.content ||
        item.description ||
        item.message ||
        item.text ||
        '';

      const time =
        item.time ||
        item.created_at ||
        item.createdAt ||
        item.date ||
        '最近';

      return `
        <div class="moss-timeline-item">
          <span class="moss-timeline-dot"></span>
          <div>
            <strong>${escapeHTML(title)}</strong>
            <time>${escapeHTML(String(time))}</time>
            <p>${escapeHTML(content)}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  async function loadNotices() {
    refreshNotice.disabled = true;
    refreshNotice.textContent = '加载中';

    try {
      // Same-origin New API endpoint.
      const response = await fetch('/api/notice', {
        cache: 'no-store',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      const items = normalizeNoticePayload(payload);

      if (!items.length) {
        throw new Error('empty notice payload');
      }

      renderNotices(items);
    } catch (error) {
      console.warn('[MOSS HOME] notice load failed:', error);
      renderFallback();
    } finally {
      refreshNotice.disabled = false;
      refreshNotice.textContent = '刷新';
    }
  }

  refreshNotice.addEventListener('click', loadNotices);

  renderFallback();
  loadNotices();
})();