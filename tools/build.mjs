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

/* ------------------------------ RSS ------------------------------ */

let feedPath = '';
if (site.url) {
  const base = String(site.url).replace(/\/+$/, '');
  const items = posts.filter((p) => !p.draft).slice(0, 20).map((p) => `    <item>
      <title>${xmlEscape(p.title)}</title>
      <link>${xmlEscape(`${base}/#/post/${p.slug}`)}</link>
      <guid isPermaLink="false">${xmlEscape(p.slug)}</guid>
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
if (Object.keys(pages).length) {
  console.log(`  独立页面：${Object.keys(pages).map((k) => `pages/${k}.md`).join('、')}`);
}
if (feedPath) console.log(`✓ 已生成 feed.xml（站点地址 ${site.url}）`);
if (!posts.length) console.log('  提示：posts/ 目录下还没有 .md 文件，用 node tools/new-post.mjs "标题" 新建一篇。');
for (const w of warnings) console.log(`  ⚠ ${w}`);
console.log('  预览：node tools/serve.mjs  →  http://localhost:5173');
