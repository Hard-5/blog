#!/usr/bin/env node
/**
 * new-post.mjs —— 新建一篇文章
 *
 * 用法：
 *   node tools/new-post.mjs "文章标题"
 *   node tools/new-post.mjs "文章标题" my-custom-slug
 *
 * 生成 posts/<slug>.md，写好后自动跑一次构建。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const title = args[0];

if (!title) {
  console.error('用法：node tools/new-post.mjs "文章标题" [slug]');
  console.error('例如：node tools/new-post.mjs "指针与内存入门" pointers-and-memory');
  process.exit(1);
}

function slugify(text) {
  const s = String(text).toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
  return s;
}

function pad(n) { return String(n).padStart(2, '0'); }
const now = new Date();
const iso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

// 纯中文标题没法直接当链接，退化成「日期 + 时分」；想要好看的 slug 就传第二个参数
let slug = args[1] ? slugify(args[1]) : slugify(title);
if (!/[a-z0-9]/.test(slug)) {
  slug = `post-${iso.replace(/-/g, '')}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

let file = path.join(POSTS_DIR, `${slug}.md`);
let n = 2;
while (fs.existsSync(file)) {
  file = path.join(POSTS_DIR, `${slug}-${n}.md`);
  n++;
}

const template = `---
title: ${title}
date: ${iso}
tags: [随笔]
summary: 在这里写一句摘要，会显示在首页列表里。
draft: true
---

在这里开始写正文。支持标准 Markdown：

## 二级标题

- 列表项
- 列表项

\`\`\`js
console.log('代码块会带语言标签和高亮');
\`\`\`

> 引用也可以。

写完后把上面 frontmatter 里的 \`draft: true\` 改成 \`false\`（或者删掉这一行），再运行一次构建就能看到文章了。
`;

fs.mkdirSync(POSTS_DIR, { recursive: true });
fs.writeFileSync(file, template, 'utf8');
console.log(`✓ 已创建 ${path.relative(ROOT, file)}`);

// 顺手重建数据文件（build.mjs 顶层会执行，直接 import 即可）
await import('./build.mjs');
