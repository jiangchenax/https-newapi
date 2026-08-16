# MOSS New API · Cloudflare Workers 版

这个版本是针对 `*.workers.dev` 部署方式重新整理的。

## 目录

```text
moss-newapi-home-workers/
├─ public/
│  ├─ index.html
│  ├─ styles.css
│  ├─ app.js
│  └─ _headers
├─ src/
│  └─ index.js
├─ wrangler.jsonc
├─ package.json
└─ README.md
```

## 为什么要换这个版本

之前的 `functions/api/notice.js` 是 Cloudflare Pages Functions 的目录约定。
如果你当前项目实际创建成了 Cloudflare Worker，`functions/` 不会自动变成 `/api/notice`。

这个版本改成真正的 Workers 架构：

- `public/` = 首页静态文件
- `src/index.js` = Worker 服务端代码
- `/api/notice` = Worker 自己处理
- 其他路径 = `env.ASSETS.fetch(request)` 返回静态页面

## GitHub 更新方法

把 GitHub 仓库内容改成这个 ZIP 解压后的内容。

仓库根目录必须直接看到：

```text
public
src
wrangler.jsonc
package.json
README.md
```

删除旧的：

```text
functions/
```

然后 Commit 到 `main`。

## Cloudflare Workers Build 设置

在：

```text
Workers & Pages
→ moss-newapi-home
→ Settings
→ Build
```

确认：

```text
Production branch: main
Build command: 留空
Deploy command: npx wrangler deploy
Root directory: /
```

提交 GitHub 后等待新部署完成。

## 测试

先测试首页：

```text
https://moss-newapi-home.<你的workers.dev子域>.workers.dev/
```

再测试：

```text
https://moss-newapi-home.<你的workers.dev子域>.workers.dev/api/notice
```

第二个地址应该返回 New API 公告 JSON，而不是 404。


## V2：嵌入 New API 首页后的去重

如果把 Workers URL 填进 New API 的「首页内容」，New API 自己的 Header 仍在 iframe 外层。

V2 已经从 Workers 首页内部移除：
- 左上 New API Logo
- 右上 J

这样不会与 New API 原生 Header 重复。

同时使用随包提供的：

```text
NewAPI_页脚文本_CF首页外壳精简版.txt
```

放到 New API「页脚文本」，它只负责：
- 保留原生左上 Logo
- 保留原生右上头像
- 隐藏主页 / 控制台 / 模型广场 / 排行榜 / 文档 / 关于
- 隐藏语言 / 主题 / 原生通知铃铛等右侧多余按钮
- 不再承担首页主体 UI
