# 我的博客

一套**零依赖**的中文技术博客：用 Markdown 写作，构建时预渲染成静态数据，双击 `index.html` 就能看。

没有 npm 依赖、没有框架、没有数据库、没有服务器。全部代码加起来不到 2000 行，可以整份读完——它本身就是一份可以拆开研究的前端教材。

## 已经有的功能

| 功能 | 说明 |
| --- | --- |
| 深 / 浅色主题 | 跟随系统，可手动切换，选择记在 localStorage，切换时不会闪白 |
| 文章列表 | 按日期倒序，显示摘要、日期、阅读时长、标签 |
| 全文搜索 | 标题 + 摘要 + 标签 + 正文，边打边筛 |
| 标签系统 | 标签过滤、标签总览页 |
| 文章目录 | 自动从 `##` / `###` 生成，滚动时高亮当前小节 |
| 代码高亮 | 自己实现的轻量高亮，支持 JS/TS、Python、C/C++、Java、Go、Rust、Bash、SQL、YAML 等 |
| 复制代码 | 每个代码块右上角一键复制 |
| 响应式 | 手机上自动变单栏，侧栏目录折叠 |
| 阅读进度条 | 文章页顶部 |
| 上下篇导航 | 自动找上一篇 / 下一篇 |
| RSS | 在 `site.json` 里填上 `url` 就会生成 `feed.xml` |

## 快速开始

### 只是想看看长什么样

直接双击 `blog/index.html`。不需要装任何东西，不需要起服务。

### 正常写作

```bash
cd blog

npm run new "指针与内存入门" pointers-and-memory   # 新建一篇文章
# 用编辑器打开 posts/pointers-and-memory.md 写正文
npm run build                                      # 生成网站数据
npm run serve                                      # 本地预览 http://localhost:5173
```

不想记参数也行：直接在 `posts/` 里新建一个 `.md` 文件，写完跑 `npm run build`。

### 全部命令

| 命令 | 作用 |
| --- | --- |
| `npm run new "标题" [slug]` | 新建文章（自动生成 frontmatter 模板），并顺手构建一次 |
| `npm run build` | 把 `posts/*.md` 编译成 `assets/js/posts-data.js` |
| `npm run build -- --drafts` | 连 `draft: true` 的草稿一起构建 |
| `npm run serve` | 启动本地预览服务器（默认 5173，可加端口参数） |
| `npm run check` | 自检：占位符残留、代码块嵌套、目录锚点、Markdown 没渲染干净等 |
| `npm run smoke` | 无浏览器冒烟测试：用假 DOM 把首页、文章页、标签页、关于页、404 全跑一遍 |
| `npm run deploy` | **一条命令发布到线上**（不需要 git，见下方「发布」） |

## 写一篇文章

文章就是 `posts/` 目录下的一个 `.md` 文件，开头有一段 frontmatter：

```markdown
---
title: 指针与内存入门
date: 2026-09-20
tags: [C语言, 基础]
summary: 一句话摘要，显示在首页列表。
draft: false
---

正文从这里开始。
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 否 | 不写就用文件名 |
| `date` | 否 | `YYYY-MM-DD`，不写就按文件名前缀或当天算 |
| `tags` | 否 | `[a, b]` 或 `a, b` 都行 |
| `summary` | 否 | 不写就自动截取正文开头 |
| `draft` | 否 | `true` 时不会出现在网站上 |
| `slug` | 否 | 自定义链接，默认取文件名（去掉日期前缀） |

支持的 Markdown 写法（标题、强调、列表、任务清单、表格、引用、代码块、链接图片）在 **`posts/markdown-guide.md`** 里有完整示例，它同时也是渲染器的验收用例。

**图片**放在 `assets/img/` 下，然后用 `![说明](assets/img/xxx.png)` 引用。

## 目录结构

```text
blog/
├── index.html              # 唯一入口，所有页面都在这里渲染
├── site.json               # 站点名称、简介、导航、社交链接
├── package.json            # 只给命令起别名，没有任何依赖
├── posts/                  # 文章（Markdown，这是你唯一需要天天动的地方）
├── pages/about.md          # 「关于」页面
├── assets/
│   ├── css/style.css       # 全部样式 + 深浅色主题变量
│   ├── img/                # 图片
│   └── js/
│       ├── markdown.js     # Markdown 渲染器 + 代码高亮（构建期与运行时共用）
│       ├── app.js          # 路由、搜索、标签、目录、主题切换
│       └── posts-data.js   # 构建产物，不要手改
└── tools/
    ├── build.mjs           # Markdown → posts-data.js（还会生成 feed.xml）
    ├── new-post.mjs        # 新建文章
    ├── check.mjs           # 产物自检
    ├── smoke.mjs           # 无浏览器冒烟测试
    └── serve.mjs           # 本地预览服务器
```

## 改成你自己的

- **站点信息**：编辑 `site.json`——标题、副标题、描述、作者、页脚、导航、GitHub 链接都在里面，改完刷新即可，不需要重新构建。
- **主题色**：`assets/css/style.css` 顶部的 `--accent` 一处改动，全站生效（深浅色各有一份）。
- **首页侧栏**：`assets/js/app.js` 里的 `renderHome()`。
- **新增代码高亮语言**：在 `assets/js/markdown.js` 的 `LANGS` 里加一项，写上关键字和注释符号即可。

## 发布（不需要 git）

线上地址：<https://hard-5.github.io/blog/>

改完文章后，只要一条命令就能发布：

```bash
npm run build      # 1. 把 Markdown 编译成网站数据
npm run deploy     # 2. 推送到 GitHub 并等待线上部署完成
```

`npm run deploy` 会：把整个目录打包成一次提交 → 通过 GitHub API 推送 → 确认 Pages 已开启 → 轮询构建状态 → 最后真的访问一次线上网址，确认能打开、关键资源都在。

其实就是把「git add / commit / push」这几步换成了 API 调用，所以**这台机器不需要装 git**。

它靠 `gh`（GitHub 官方命令行工具）的登录态认证，凭据存在 Windows 凭据管理器里。如果哪天提示「找不到 GitHub 凭据」，重新登录一次即可：

```bash
E:\code\.tools\bin\gh.exe auth login
```

常用参数：

```bash
npm run deploy -- -m "新增文章：指针入门"    # 自定义提交说明
npm run deploy -- --prune                   # 同时删掉线上已删除的旧文件
npm run deploy -- --repo Hard-5/blog        # 手动指定仓库
```

> 有一个已知限制：如果凭据里没有 `workflow` 权限，`.github/workflows/` 下的文件会被自动跳过（GitHub 不允许普通凭据修改工作流文件）。这不影响网站发布，只是没法用 Actions 自动构建。

## 部署到公网

完整说明（包括不用命令行的网页拖拽方式、常见问题排查）见 **`部署到公网.md`**。

## 两个实现上的选择

**为什么正文是构建时预渲染的？**
`build.mjs` 直接把 Markdown 编译成 HTML 存进 `posts-data.js`，浏览器只负责渲染。好处是首屏快、不依赖 `fetch`（所以 `file://` 双击也能用），而且渲染器只有一份代码。

**为什么用 URL hash 做路由？**
`#/post/xxx` 这种形式在 GitHub Pages、`file://`、任何静态服务器上行为完全一致，不需要服务端把未知路径重写回 `index.html`。代价是 SEO 稍弱——个人学习笔记可以接受。

## 常见问题

**改完 Markdown 刷新页面没变化？**
正文改动必须重新构建：`npm run build`。只有 `site.json` 和 CSS/JS 的改动才不需要。

**中文标题的文章链接很难看？**
新建时给第二个参数指定英文 slug：`npm run new "指针入门" pointers`。不指定会用日期兜底。

**构建报 `Cannot find module`？**
确认在 `blog/` 目录下执行，并且 Node 版本 ≥ 18（`node -v` 看）。这个项目只用 Node 内置模块，不需要 `npm install`。

**想删掉某篇文章？**
删掉 `posts/` 里对应的 `.md` 文件，重新构建即可。

**改坏了不敢提交？**
改完 Markdown 或渲染器之后跑一遍 `npm run check && npm run smoke`：前者检查产物质量，后者确认所有页面还能正常渲染。
