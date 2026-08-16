# MOSS New API · Worker 前门 V5（首页直接替换）

## V5 的核心变化

V5 不再尝试：

- 隐藏 New API 原来的 Header
- 修改 New API 原来的首页 DOM
- HTMLRewriter 注入首页
- iframe
- 页脚 CSS

而是直接：

```text
GET https://newapi.mossao.com/
        ↓
Worker
        ↓
返回我们自己的 public/index.html
```

因此首页 HTML 中根本没有 New API 原来的 Header。

不会再出现：

```text
主页
控制台
模型广场
排行榜
文档
关于
语言
主题
原生通知铃铛
原生 J
```

首页只存在 Worker 自己的：

```text
左上 New API
中央铃铛
右上 J
底部 Contact
```

## 其他 New API 页面不会受影响

```text
/                  → Worker 自定义首页
/_moss-home/*      → Worker 静态 CSS/JS

/dashboard         → 原 New API
/console/*         → 原 New API
/api/*             → 原 New API
其他路径           → 原 New API
```

Cloudflare Worker Route 中，`fetch(request)` 会继续请求 DNS 记录对应的真实 New API 源站。

## 部署

### 1. GitHub

用 V5 ZIP 覆盖当前 GitHub 仓库并 Commit 到 main。

### 2. 先测试 workers.dev

```text
https://moss-newapi-home.zhaochengjian666.workers.dev/
```

这里直接显示 V5 首页。

### 3. New API 设置全部清空

正式启用 Route 前：

```text
首页内容 → 清空
页脚文本 → 清空
```

绝对不要再把 workers.dev 填进“首页内容”。

### 4. DNS 不变

Cloudflare DNS：

```text
newapi.mossao.com
```

仍然指向原 New API VPS，并保持橙云代理。

### 5. 添加 Worker Route

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
newapi.mossao.com/*
```

Zone：

```text
mossao.com
```

选择 Route，不是 Custom Domain。

### 6. 测试

```text
https://newapi.mossao.com/
```

这里应该只有自定义首页。

然后测试：

```text
https://newapi.mossao.com/console/setting
https://newapi.mossao.com/api/notice
```

这些仍然进入原 New API。

## 回滚

只删除 Worker Route：

```text
newapi.mossao.com/*
```

即可立即恢复原 New API。
