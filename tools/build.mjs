#!/usr/bin/env node
/**
 * build.mjs —— 把 posts/*.md 编译成 assets/js/posts-data.js
 *
 * 用法：
 *   node tools/build.mjs            正常构建（跳过 draft: true 的文章）
 *   node tools/build.mjs --drafts   连草稿一起构建
 *
 * 零依赖：只用了 Node 内置模块，外加同目录的 MiniMarkdown 渲染器。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const PAGES_DIR = path.join(ROOT, 'pages');
const OUT_FILE = path.join(ROOT, 'assets', 'js', 'posts-data.js');

const require = createRequire(import.meta.url);
const MiniMarkdown = require(path.join(ROOT, 'assets', 'js', 'markdown.js'));

const withDrafts = process.argv.includes('--drafts');

/* ------------------------------ 工具函数 ------------------------------ */

function readText(file) {
  return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
}

function listMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.md') && !f.startsWith('_'))
    .sort()
    .map((f) => path.join(dir, f));
}

/** 解析文件开头的 --- frontmatter --- 块 */
function parseFrontmatter(raw) {
  const text = raw.replace(/\r\n?/g, '\n');
  const m = /^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(text);
  if (!m) return { data: {}, body: text };

  const data = {};
  m[1].split('\n').forEach((line) => {
    if (!line.trim() || line.trim().startsWith('#')) return;
    const i = line.indexOf(':');
    if (i === -1) return;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();

    if (/^\[.*\]$/.test(value)) {
      value = value.slice(1, -1).split(',').map((v) => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else if (/^(true|false)$/i.test(value)) {
      value = value.toLowerCase() === 'true';
    } else {
      value = value.replace(/^["']|["']$/g, '');
      // 也支持 "a, b, c" 这种写法
      if (key === 'tags' && value.includes(',')) value = value.split(',').map((v) => v.trim()).filter(Boolean);
      else if (key === 'tags' && value.includes(' ')) value = value.split(/\s+/).filter(Boolean);
    }
    data[key] = value;
  });
  return { data, body: text.slice(m[0].length) };
}

function toArray(v) {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === 'string' && v.trim()) return [v.trim()];
  return [];
}

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function dateText(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  if (!m) return iso || '';
  return `${Number(m[1])} 年 ${Number(m[2])} 月 ${Number(m[3])} 日`;
}

/** 中英混排的阅读时长估算：中文按 350 字/分钟，英文按 200 词/分钟 */
function readingTime(plain) {
  const cjk = (plain.match(/[\u4e00-\u9fff]/g) || []).length;
  const words = (plain.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9_'-]+/g) || []).length;
  return Math.max(1, Math.round(cjk / 350 + words / 200));
}

function slugifyFile(name) {
  return name
    .replace(/\.md$/i, '')
    .replace(/^\d{4}-\d{2}-\d{2}[-_]?/, '')
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '') || 'post';
}

function autoSummary(plain, len = 86) {
  if (plain.length <= len) return plain;
  return plain.slice(0, len).replace(/[,，。.:：;；\s]+$/, '') + '…';
}

function xmlEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/* ------------------------------ 读取站点配置 ------------------------------ */

const siteFile = path.join(ROOT, 'site.json');
const site = fs.existsSync(siteFile)
  ? JSON.parse(readText(siteFile))
  : { title: '我的博客', nav: [] };

/* ------------------------------ 编译文章 ------------------------------ */

const warnings = [];
const seenSlugs = new Set();
const posts = [];

for (const file of listMarkdown(POSTS_DIR)) {
  const raw = readText(file);
  const { data, body } = parseFrontmatter(raw);

  if (data.draft === true && !withDrafts) continue;

  const base = path.basename(file, '.md');
  const slug = String(data.slug || slugifyFile(base));
  if (seenSlugs.has(slug)) warnings.push(`slug 重复：「${slug}」（${base}.md 被跳过）`);
  seenSlugs.add(slug);

  const rendered = MiniMarkdown.render(body);
  const plain = MiniMarkdown.plainText(body);
  const dateMatch = /^(\d{4}-\d{2}-\d{2})/.exec(base + ' ' + raw);
  const date = String(data.date || (dateMatch ? dateMatch[1] : '') || todayISO());

  const title = String(data.title || base.replace(/[-_]/g, ' '));
  const tags = toArray(data.tags);
  const summary = String(data.summary || autoSummary(MiniMarkdown.plainText(body.split('\n').filter((l) => !l.trim().startsWith('#')).join(' ')) || plain));

  posts.push({
    slug,
    title,
    date,
    updated: data.updated ? String(data.updated) : '',
    dateText: dateText(date),
    tags,
    summary,
    cover: String(data.cover || ''),
    draft: data.draft === true,
    readingTime: readingTime(plain),
    words: plain.replace(/\s/g, '').length,
    html: rendered.html,
    toc: rendered.toc,
    text: plain.slice(0, 4000),
  });
}

posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title, 'zh')));

/* ------------------------------ 编译独立页面 ------------------------------ */

const pages = {};
for (const file of listMarkdown(PAGES_DIR)) {
  const base = path.basename(file, '.md');
  const { data, body } = parseFrontmatter(readText(file));
  if (data.draft === true && !withDrafts) continue;
  const rendered = MiniMarkdown.render(body);
  pages[base] = {
    title: String(data.title || base),
    html: rendered.html,
    toc: rendered.toc,
  };
}

/* ------------------------------ 写出数据文件 ------------------------------ */

const js = [
  '/* 本文件由 tools/build.mjs 自动生成，请勿手动修改。 */',
  '/* eslint-disable */',
  `window.SITE = ${JSON.stringify(site, null, 2)};`,
  `window.BLOG_POSTS = ${JSON.stringify(posts, null, 2)};`,
  `window.BLOG_PAGES = ${JSON.stringify(pages, null, 2)};`,
  `window.BLOG_BUILT_AT = ${JSON.stringify(new Date().toISOString())};`,
  '',
].join('\n').replace(/<\/(script)/gi, '<\\/$1');

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, js, 'utf8');

/* ================================================================
 * 静态页面生成
 *
 * 为什么需要：博客主页是 JS 渲染的，而搜索引擎（尤其百度）和微信/QQ 的分享
 * 卡片抓取器都不执行 JavaScript。所以每篇文章额外生成一份纯静态 HTML：
 *   - p/<slug>.html  完整内容 + Open Graph 元信息，可直接分享、能被抓取
 *   - sitemap.xml / robots.txt  告诉搜索引擎有哪些页面
 *   - 顺便把首页的导航和文章列表静态注入 index.html，关掉 JS 也能读
 * ================================================================ */

const esc = MiniMarkdown.escapeHtml;
const BASE = String(site.url || '').replace(/\/+$/, '');
const LOGO = (site.title || 'B').trim().charAt(0);
const STATIC_DIR = path.join(ROOT, 'p');
const published = posts.filter((p) => !p.draft);

const THEME_BOOT = '<script>(function(){try{var t=localStorage.getItem("blog-theme");'
  + 'if(t!=="dark"&&t!=="light"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}'
  + 'document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();</script>';

const FAVICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%232563eb'/><text y='72' x='50' text-anchor='middle' font-size='58' font-family='sans-serif' fill='white'>" + LOGO + "</text></svg>";

function navLinks(prefix) {
  return (site.nav || []).map((n) => {
    const href = String(n.href).charAt(0) === '#' ? prefix + n.href : n.href;
    return `<a href="${esc(href)}">${esc(n.label)}</a>`;
  }).join('');
}

function headerHtml(prefix) {
  return `<header class="site-header">
    <div class="container inner">
      <a class="brand" href="${prefix}"><span class="logo" aria-hidden="true">${esc(LOGO)}</span><span class="name">${esc(site.title)}</span></a>
      <nav class="site-nav" aria-label="主导航">${navLinks(prefix)}</nav>
      <button class="icon-btn" id="theme-toggle" type="button" aria-label="切换主题" title="切换主题">☾</button>
    </div>
  </header>`;
}

function footerHtml(prefix) {
  const links = (site.links || []).concat([{ label: 'RSS', href: `${prefix}feed.xml` }])
    .map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`).join('');
  return `<footer class="site-footer">
    <div class="container inner">
      <div><strong>${esc(site.title)}</strong> ${esc(site.footer || '')}</div>
      <div style="display:flex;gap:14px">${links}</div>
    </div>
  </footer>`;
}

function tocHtml(post) {
  if (!post.toc || !post.toc.length) return '';
  return '<details class="toc-wrap" open><summary>目录</summary><nav class="toc"><ul>'
    + post.toc.map((t) => `<li class="lv${t.level}"><a href="#${esc(t.id)}" data-toc="${esc(t.id)}">${esc(t.text)}</a></li>`).join('')
    + '</ul></nav></details>';
}

function postNavHtml(older, newer, hrefOf) {
  return '<nav class="post-nav">'
    + (older
      ? `<a class="prev" href="${esc(hrefOf(older))}"><span class="dir">← 上一篇</span><span class="t">${esc(older.title)}</span></a>`
      : '<span class="placeholder"></span>')
    + (newer
      ? `<a class="next" href="${esc(hrefOf(newer))}"><span class="dir">下一篇 →</span><span class="t">${esc(newer.title)}</span></a>`
      : '<span class="placeholder"></span>')
    + '</nav>';
}

function renderPostPage(post, older, newer) {
  const url = BASE ? `${BASE}/p/${post.slug}.html` : `p/${post.slug}.html`;
  const title = `${post.title} · ${site.title}`;
  const desc = post.summary;

  const head = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    site.author ? `<meta name="author" content="${esc(site.author)}">` : '',
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta name="color-scheme" content="light dark">`,
    // Open Graph：微信 / QQ / 微博 抓分享卡片用的就是这些
    '<meta property="og:type" content="article">',
    `<meta property="og:site_name" content="${esc(site.title)}">`,
    `<meta property="og:title" content="${esc(post.title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    '<meta property="og:locale" content="zh_CN">',
    `<meta property="article:published_time" content="${esc(post.date)}">`,
    ...post.tags.map((t) => `<meta property="article:tag" content="${esc(t)}">`),
    '<meta name="twitter:card" content="summary">',
    `<meta name="twitter:title" content="${esc(post.title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<link rel="icon" href="${FAVICON}">`,
    '<link rel="alternate" type="application/rss+xml" title="' + esc(site.title) + '" href="../feed.xml">',
    '<link rel="stylesheet" href="../assets/css/style.css">',
    THEME_BOOT,
    `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: desc,
      datePublished: post.date,
      inLanguage: site.lang || 'zh-CN',
      keywords: post.tags.join(', '),
      author: { '@type': 'Person', name: site.author || site.title },
      mainEntityOfPage: url,
    })}</script>`,
  ].filter(Boolean).join('\n  ');

  return `<!DOCTYPE html>
<html lang="${esc(site.lang || 'zh-CN')}">
<head>
  ${head}
</head>
<body>
<a class="skip-link" href="#post-content">跳到正文</a>
<div class="progress" id="progress" aria-hidden="true"></div>
${headerHtml('../')}
<main class="container" tabindex="-1">
  <article class="fade-in">
    <header class="post-header">
      <a class="back-link" href="../">← 返回文章列表</a>
      <h1>${esc(post.title)}</h1>
      <div class="meta">
        <span>${esc(post.dateText)}</span>
        <i class="dot"></i><span>${post.readingTime} 分钟阅读</span>
        <i class="dot"></i><span>${post.words} 字</span>
        ${post.tags.length ? '<i class="dot"></i><span class="tags">' + post.tags.map((t) => `<a class="tag" href="../#/?tag=${encodeURIComponent(t)}">${esc(t)}</a>`).join('') + '</span>' : ''}
        <button type="button" class="share-btn" data-copy-url="${esc(url)}" data-label="分享" title="复制这篇文章的固定链接">分享</button>
      </div>
    </header>
    <div class="post-body-wrap${post.toc.length ? ' with-toc' : ''}">
      <div class="prose" id="post-content">${post.html}</div>
      ${tocHtml(post)}
    </div>
    ${postNavHtml(older, newer, (p) => `${p.slug}.html`)}
  </article>
</main>
${footerHtml('../')}
<button class="to-top" id="to-top" type="button" aria-label="回到顶部" title="回到顶部">↑</button>
<script src="../assets/js/ui.js"></script>
<script>BlogUI.initCommon();BlogUI.initPostPage('post-content',{native:true});</script>
</body>
</html>
`;
}

/** 首页的静态版本：JS 加载后会被 SPA 覆盖，但爬虫和禁用 JS 的读者看到的是这个 */
function staticHomeHtml() {
  const cards = published.map((p) => `<a class="post-card" href="p/${esc(p.slug)}.html">
      <h3>${esc(p.title)}</h3>
      ${p.summary ? `<p class="summary">${esc(p.summary)}</p>` : ''}
      <div class="meta"><span>${esc(p.dateText)}</span><i class="dot"></i><span>${p.readingTime} 分钟阅读</span>${p.tags.length ? '<i class="dot"></i><span class="tags">' + p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('') + '</span>' : ''}</div>
    </a>`).join('\n    ');

  const tags = (() => {
    const map = {};
    published.forEach((p) => p.tags.forEach((t) => { map[t] = (map[t] || 0) + 1; }));
    return Object.keys(map).map((t) => ({ name: t, count: map[t] })).sort((a, b) => b.count - a.count);
  })();

  const latest = published[0];
  return `<section class="hero">
      <h1>${esc(site.title)}</h1>
      <p>${esc(site.description || site.subtitle || '')}</p>
      <div class="meta-row">
        <span class="chip">共 ${published.length} 篇文章</span>
        ${latest ? `<span class="chip">最近更新 ${esc(latest.dateText)}</span>` : ''}
        ${site.author ? `<span class="chip">作者 ${esc(site.author)}</span>` : ''}
      </div>
    </section>
    <div class="layout with-side">
      <main>
        <h2 class="section-title">最新文章 <span class="count">${published.length} 篇</span></h2>
        <div class="post-list">
    ${cards}
        </div>
      </main>
      <aside>
        <div class="side-card"><h4>关于</h4><p>${esc(site.subtitle || site.description || '')}</p></div>
        <div class="side-card"><h4>标签</h4><ul>${tags.slice(0, 12).map((t) => `<li><a href="#/?tag=${encodeURIComponent(t.name)}">${esc(t.name)}<span>${t.count}</span></a></li>`).join('')}</ul></div>
        <div class="side-card"><h4>统计</h4><ul>
          <li><a>文章<span>${published.length}</span></a></li>
          <li><a>标签<span>${tags.length}</span></a></li>
          <li><a href="feed.xml">RSS 订阅<span>↗</span></a></li>
        </ul></div>
      </aside>
    </div>`;
}

/** 把 index.html 里 <!-- BUILD:X:START --> ... <!-- BUILD:X:END --> 之间的内容换掉 */
function injectBlock(html, name, content) {
  const re = new RegExp('(<!-- BUILD:' + name + ':START -->)[\\s\\S]*?(<!-- BUILD:' + name + ':END -->)');
  if (!re.test(html)) {
    warnings.push(`index.html 里找不到 BUILD:${name} 标记，跳过注入`);
    return html;
  }
  return html.replace(re, `$1\n${content}\n<!-- BUILD:${name}:END -->`);
}

// 1) 静态文章页
fs.rmSync(STATIC_DIR, { recursive: true, force: true });
fs.mkdirSync(STATIC_DIR, { recursive: true });
published.forEach((post, i) => {
  const newer = i > 0 ? published[i - 1] : null;
  const older = i < published.length - 1 ? published[i + 1] : null;
  fs.writeFileSync(path.join(STATIC_DIR, `${post.slug}.html`), renderPostPage(post, older, newer), 'utf8');
});

// 2) sitemap 与 robots
let hasSitemap = false;
if (BASE) {
  const urls = [`${BASE}/`, ...published.map((p) => `${BASE}/p/${p.slug}.html`)];
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map((u) => `  <url><loc>${xmlEscape(u)}</loc></url>`).join('\n')
    + '\n</urlset>\n';
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`, 'utf8');
  hasSitemap = true;
}

// 3) 首页静态注入
const indexPath = path.join(ROOT, 'index.html');
let indexHtml = readText(indexPath);
const before = indexHtml;
indexHtml = injectBlock(indexHtml, 'NAV', navLinks(''));
indexHtml = injectBlock(indexHtml, 'HOME', staticHomeHtml());
if (indexHtml !== before) fs.writeFileSync(indexPath, indexHtml, 'utf8');



/* ------------------------------ RSS ------------------------------ */

let feedPath = '';
if (site.url) {
  const base = String(site.url).replace(/\/+$/, '');
  // 指向静态页面而不是 #/post/... —— 订阅器里点开就能直接读，不依赖 JS
  const items = posts.filter((p) => !p.draft).slice(0, 20).map((p) => `    <item>
      <title>${xmlEscape(p.title)}</title>
      <link>${xmlEscape(`${base}/p/${p.slug}.html`)}</link>
      <guid isPermaLink="true">${xmlEscape(`${base}/p/${p.slug}.html`)}</guid>
      <pubDate>${new Date(p.date + 'T08:00:00Z').toUTCString()}</pubDate>
      <description>${xmlEscape(p.summary)}</description>
    </item>`).join('\n');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(site.title)}</title>
    <link>${xmlEscape(base)}</link>
    <description>${xmlEscape(site.description || '')}</description>
    <language>${xmlEscape(site.lang || 'zh-CN')}</language>
    <atom:link href="${xmlEscape(base + '/feed.xml')}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
  feedPath = path.join(ROOT, 'feed.xml');
  fs.writeFileSync(feedPath, feed, 'utf8');
}

/* ------------------------------ 报告 ------------------------------ */

const kb = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
console.log(`✓ 已生成 ${path.relative(ROOT, OUT_FILE)}（${posts.length} 篇文章，${kb} KB）`);
console.log(`✓ 已生成 ${published.length} 个静态文章页：p/<slug>.html（含分享卡片元信息，搜索引擎可抓取）`);
if (hasSitemap) console.log('✓ 已生成 sitemap.xml 与 robots.txt');
console.log('✓ 已把导航和文章列表静态注入 index.html（禁用 JS 也能读）');
if (Object.keys(pages).length) {
  console.log(`  独立页面：${Object.keys(pages).map((k) => `pages/${k}.md`).join('、')}`);
}
if (feedPath) console.log(`✓ 已生成 feed.xml（站点地址 ${site.url}）`);
if (!posts.length) console.log('  提示：posts/ 目录下还没有 .md 文件，用 node tools/new-post.mjs "标题" 新建一篇。');
for (const w of warnings) console.log(`  ⚠ ${w}`);
console.log('  预览：node tools/serve.mjs  →  http://localhost:5173');
