# MOSS New API · Worker 前门版 V3

## 这版和之前最大的区别

不再使用：

- New API「首页内容」iframe
- New API「页脚文本」来罩/隐藏页面
- Cloudflare Worker 作为第二个独立首页

而是让 Worker **直接运行在 New API 原站前面**。

生产结构：

```text
浏览器
  ↓
newapi.mossao.com
  ↓
Cloudflare Worker Route
  ├─ HTML 页面 → 从原 New API 取回 HTML，再注入自定义首页层
  ├─ /_moss-home/* → Worker Static Assets
  ├─ /api/* → 原样放行给 New API
  ├─ /console/* → 原样放行给 New API
  └─ 其他路径 → 原样放行给 New API VPS
```

首页 `/`：
- 原生 New API Header 仍然是真实 DOM
- 保留原生左上 Logo
- 保留原生右上 J 与原生下拉菜单
- 隐藏中间导航 / 语言 / 主题 / 原生铃铛
- 自定义壁纸 / 中央铃铛 / 通知中心 / Contact 由 Worker 注入

离开 `/` 后：
- 自动恢复完整 New API 页面
- 不再隐藏控制台内容

## 为什么必须使用 Worker Route，不要用 Custom Domain

你的 `newapi.mossao.com` 后面已经有真实 New API VPS。

Cloudflare 官方针对这种“Worker 在现有源站前面”的情况推荐 Worker Routes。
Route 中 `fetch(request)` 会继续请求当前 DNS 配置对应的真实源站。

不要把 `newapi.mossao.com` 改成这个 Worker 的 Custom Domain，
否则 Worker 会变成这个 hostname 的 origin，反代逻辑会完全不同。

## 第 1 步：更新 GitHub

把 ZIP 解压后的内容覆盖到当前 `moss-newapi-home` GitHub 仓库。

根目录：

```text
public/
src/
wrangler.jsonc
package.json
README.md
```

Commit 到 `main`，等 Cloudflare 自动部署。

## 第 2 步：先测试 workers.dev

先打开：

```text
https://moss-newapi-home.zhaochengjian666.workers.dev/
```

这里是安全预览模式。

确认：
- 壁纸
- 铃铛
- Glass Unfold
- Contact
- COPY
- Gmail / Outlook / QQ邮箱

都正常。

workers.dev 只是预览，不会修改 newapi.mossao.com。

## 第 3 步：清理 New API 设置

正式接入 Route 前，建议把 New API：

```text
首页内容
页脚文本
```

都清空。

因为 V3 不再需要 iframe 和页脚 CSS。

## 第 4 步：确认 newapi.mossao.com 的 DNS 仍指向真实 New API 源站

Cloudflare DNS 中：

```text
newapi.mossao.com
```

必须还是你原来 New API 的 A / AAAA / CNAME 记录，并保持橙云代理。

不要改成 workers.dev CNAME。

## 第 5 步：给 Worker 添加 Route

Cloudflare：

```text
Workers & Pages
→ moss-newapi-home
→ Settings
→ Domains & Routes
→ Add
→ Route
```

填写：

```text
Route:
newapi.mossao.com/*

Zone:
mossao.com
```

保存。

注意：选的是 **Route**，不是 Custom Domain。

## 第 6 步：测试

打开：

```text
https://newapi.mossao.com/
```

应该直接看到自定义首页，不再有 iframe。

再测试：

```text
https://newapi.mossao.com/console/setting
https://newapi.mossao.com/api/status
```

这些应该继续是原 New API。

## 回滚

如果出现任何异常：

```text
Workers & Pages
→ moss-newapi-home
→ Settings
→ Domains & Routes
```

删除：

```text
newapi.mossao.com/*
```

立即恢复为原来的 New API 直连状态。

GitHub / Worker 可以保留，不需要删。

## V3.1 修复

V3 的 `workers.dev` 预览曾把 `/` 内部改写为 `/index.html`。
Cloudflare Static Assets 默认会把 `/index.html` 规范化重定向回 `/`，
于是形成：

```text
/ → /index.html → 307 / → /index.html → ...
```

V3.1 已改为直接：

```js
return env.ASSETS.fetch(request)
```

让 Cloudflare 用 `/` 正常返回 `index.html`，不再发生重定向循环。


## V3.2：铃铛与重复 Header 修复

### 为什么 V3.1 的铃铛消失

V3.1 有一条过宽的 CSS：

```css
html[data-moss-home="1"] main { ... }
```

它不仅隐藏了 New API 原来的 `<main>`，也把我们自定义首页里的：

```html
<main class="moss-stage">
```

一起隐藏，所以中央铃铛不见了。

V3.2 已改成：

```css
html[data-moss-home="1"] #root main { ... }
```

只隐藏 New API 自己的 main，不再影响自定义铃铛。

### 为什么你截图里导航和两个 J 还在

那张截图仍然是：

```text
New API 父页面
  └─ 首页内容 iframe
       └─ workers.dev 预览
```

所以父页面 Header 和 iframe 里的预览 Header 同时存在。

V3.2 已把 workers.dev 里的假 Logo / 假头像全部删除。

但正式切换 Worker Route 前，你仍然必须把 New API 的：

```text
首页内容
页脚文本
```

全部清空。

然后再给 Worker 添加：

```text
newapi.mossao.com/*
```

Route。

只有这样才是真正的“前门模式”，不再存在 iframe。


## V3.3：Header 强制清理

V3.2 截图中中央铃铛已经恢复，但 New API 原生导航仍然显示。

V3.3 不再只靠 CSS 猜 New API 的 DOM 层级。

首页加载后 JavaScript 会直接：
- 找到原生 Header；
- 隐藏 Header 中所有链接，只保留真正 Logo；
- 隐藏 Header 中所有按钮，只保留真正 Avatar；
- 隐藏分隔线；
- 用 MutationObserver 处理 React 重新挂载 Header 的情况；
- 离开 `/` 后撤销这些 inline 样式，恢复正常 New API 页面。
