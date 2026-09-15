#!/usr/bin/env node
/**
 * check.mjs —— 构建产物自检
 *
 * 用法：node tools/check.mjs
 *
 * 它在 Node 里把 posts-data.js 当成浏览器脚本跑一遍，然后检查常见事故：
 * 占位符残留、代码块被塞进 <p> 里、目录锚点对不上、Markdown 语法没被吃掉、
 * 代码高亮缺失、表格/任务清单没渲染等。写完文章跑一次，比肉眼看快。
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'assets', 'js', 'posts-data.js');

if (!fs.existsSync(DATA)) {
  console.error('✗ 找不到 assets/js/posts-data.js，先运行：node tools/build.mjs');
  process.exit(1);
}

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(DATA, 'utf8'), sandbox);

const posts = sandbox.window.BLOG_POSTS || [];
const pages = sandbox.window.BLOG_PAGES || {};

let errors = 0;
let warns = 0;

const fail = (slug, msg) => { errors++; console.log(`  ✗ [${slug}] ${msg}`); };
const warn = (slug, msg) => { warns++; console.log(`  ! [${slug}] ${msg}`); };

/** 去掉代码内容，避免把代码里的 Markdown 记号误判成渲染失败 */
function withoutCode(html) {
  return html
    .replace(/<pre class="md-pre"[\s\S]*?<\/pre>/g, '<pre></pre>')
    .replace(/<code class="md-inline-code">[\s\S]*?<\/code>/g, '<code></code>');
}

/** 这些语言本来就不做语法高亮，缺 tok span 属于正常 */
const PLAIN_LANGS = ['text', 'txt', 'plain', 'output', 'log', 'diff', 'patch', 'md', 'markdown', ''];

console.log(`检查 ${posts.length} 篇文章 + ${Object.keys(pages).length} 个独立页面\n`);

for (const p of posts) {
  const slug = p.slug;
  const html = p.html || '';
  const prose = withoutCode(html);

  if (!html.trim()) fail(slug, 'HTML 为空');
  if (/\u0000/.test(html)) fail(slug, '存在未还原的占位符 \u0000');
  if (!p.title) fail(slug, '缺少 title');
  if (!/^\d{4}-\d{2}-\d{2}/.test(p.date)) fail(slug, `日期格式异常：${p.date}`);
  if (!p.readingTime || p.readingTime < 1) fail(slug, '阅读时长异常');
  if (!p.summary) warn(slug, '没有 summary，首页列表会显得很空');
  if (!p.tags || !p.tags.length) warn(slug, '没有 tags');

  // 代码块不能出现在 <p> 里面（块级元素嵌在段落里会导致浏览器自动闭合标签，版式全乱）
  if (/<p>\s*<div class="md-code"/.test(html)) fail(slug, '代码块被包进了 <p>');
  if (/<p>\s*<(ul|ol|table|blockquote|h[1-6]|div)/.test(html)) fail(slug, '块级元素被包进了 <p>');

  // 标签配对
  const open = (html.match(/<div\b/g) || []).length;
  const close = (html.match(/<\/div>/g) || []).length;
  if (open !== close) fail(slug, `<div> 数量不匹配：${open} 开 / ${close} 闭`);

  // Markdown 残留（只看正文，不看代码块）
  if (/\*\*[^*\n]+\*\*/.test(prose)) fail(slug, '有未渲染的 **粗体**');
  if (/^#{1,6}\s/m.test(prose)) fail(slug, '有未渲染的标题标记');
  if (/^\s*[-*+]\s+\S/m.test(prose.replace(/<[^>]+>/g, ''))) warn(slug, '可能有未渲染的列表项');

  // 目录锚点必须能在正文里找到
  for (const t of p.toc || []) {
    if (!new RegExp(`id="${t.id}"`).test(html)) fail(slug, `目录锚点 #${t.id} 在正文里不存在`);
  }

  // 代码块：语言标签 + 高亮
  const blocks = html.match(/<pre class="md-pre"[^>]*>[\s\S]*?<\/pre>/g) || [];
  for (const b of blocks) {
    const lang = /data-lang="([^"]*)"/.exec(b);
    const name = lang ? lang[1] : '?';
    if (/^<pre class="md-pre"[^>]*>\s*<code[^>]*><\/code>\s*<\/pre>$/.test(b)) warn(slug, `空的代码块（语言 ${name}）`);
    if (!/class="tok /.test(b) && !PLAIN_LANGS.includes(name)) {
      warn(slug, `代码块「${name}」没有高亮（可能是未列入 LANGS 的语言）`);
    }
  }

  if (/\|[\s:|-]*\|/.test(prose) && p.slug !== 'markdown-guide') warn(slug, '疑似有未渲染的表格');
}

for (const [name, page] of Object.entries(pages)) {
  if (!page.html || !page.html.trim()) fail(name, '页面 HTML 为空');
  if (/\u0000/.test(page.html || '')) fail(name, '存在未还原的占位符');
}

/* ------------------------------ 汇总 ------------------------------ */

const totalWords = posts.reduce((n, p) => n + (p.words || 0), 0);
const totalCodes = posts.reduce((n, p) => n + ((p.html.match(/<pre class="md-pre"/g) || []).length), 0);
const tagSet = new Set(posts.flatMap((p) => p.tags || []));
const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
const descOk = posts.every((p, i) => p.slug === sorted[i].slug);

console.log(`\n统计：${posts.length} 篇 / ${totalWords} 字 / ${totalCodes} 个代码块 / ${tagSet.size} 个标签`);
console.log(`排序：${descOk ? '按日期倒序 ✓' : '✗ 顺序不对'}`);
console.log(`结果：${errors} 个错误，${warns} 个提示`);
if (errors) process.exit(1);
