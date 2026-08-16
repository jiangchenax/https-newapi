# MOSS New API · Cloudflare Pages 首页 V1

## 目录

```text
moss-home-cf-pages/
├─ public/
│  ├─ index.html
│  ├─ styles.css
│  ├─ app.js
│  └─ _headers
├─ functions/
│  └─ api/
│     └─ notice.js
└─ README.md
```

## V1 已实现

- 随机全屏壁纸
- 左上 New API Logo
- 右上 J：新标签打开 New API Dashboard
- 中央通知铃铛
- Glass Unfold 通知动画：
  - 短玻璃带
  - 横向舒展
  - 上下展开
  - 关闭完整反向
- Web Animations API 控制开合状态，不依赖 New API / Base UI 生命周期
- Pages Function `/api/notice` 代理 New API 公告
- 底部 Contact：
  - COPY
  - Gmail 写信
  - Outlook 写信
  - QQ 邮箱写信
- 手机响应式

## Cloudflare Pages · Git 部署

把整个项目上传到 GitHub/GitLab，然后在 Cloudflare Pages 连接仓库。

配置：

```text
Framework preset: None
Build command: 留空
Build output directory: public
Root directory: /
```

`functions/` 必须保留在项目根目录，Cloudflare 会把它部署为 Pages Functions。

## Cloudflare Pages · Wrangler 部署

进入项目根目录：

```bash
npx wrangler login
npx wrangler pages project create
npx wrangler pages deploy public --project-name moss-newapi-home
```

运行 `wrangler pages deploy public` 时要在本项目根目录执行，这样同级的 `functions/` 才会一起部署。

## New API 首页内容

Cloudflare Pages 部署完成后会得到类似：

```text
https://moss-newapi-home.pages.dev
```

把完整 HTTPS URL 填进 New API 的「首页内容」。

不要再往「首页内容」放 Markdown。

## 注意

Cloudflare Pages 首页可能运行在 New API 的 sandbox iframe 内。因此 V1：
- 不修改父页面 DOM；
- 所有 UI 和动画都在 Pages 页面内部完成；
- Dashboard / Gmail / Outlook / QQ 邮箱使用新标签打开；
- 公告通过 Pages Function 代理并返回 `Access-Control-Allow-Origin: *`。
