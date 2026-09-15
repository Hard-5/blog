#!/usr/bin/env node
/**
 * deploy.mjs —— 一条命令把博客发布到 GitHub Pages（不需要安装 git）
 *
 * 用法：
 *   npm run deploy                      用 site.json 里配置的仓库
 *   npm run deploy -- -m "新增文章"      自定义提交说明
 *   npm run deploy -- --repo Hard-5/blog 手动指定仓库
 *   npm run deploy -- --prune           同时删除线上多余的旧文件（默认不删，更安全）
 *
 * 它做的事：把整个 blog 目录打包成一次提交，直接通过 GitHub API 推送，
 * 然后自动确认 GitHub Pages 已开启，最后检查线上地址是否可访问。
 *
 * 认证顺序：环境变量 GITHUB_TOKEN / GH_TOKEN → gh CLI（gh auth login 之后的登录态）
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const API = 'https://api.github.com';

/* ------------------------------ 参数 ------------------------------ */

const argv = process.argv.slice(2);
const flag = (name, def = '') => {
  const i = argv.indexOf(name);
  return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('-') ? argv[i + 1] : def;
};
const has = (name) => argv.includes(name);

const prune = has('--prune');
const message = flag('-m', flag('--message', `更新博客 ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`));
const repoArg = flag('--repo', '');

/* ------------------------------ 仓库定位 ------------------------------ */

const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'site.json'), 'utf8'));

function resolveRepo() {
  if (repoArg) return repoArg;
  if (site.repo) return site.repo;
  // 从 site.json 的 url 反推，例如 https://hard-5.github.io/blog/ → hard-5/blog
  const m = /^https?:\/\/([^.]+)\.github\.io\/([^/]+)/i.exec(site.url || '');
  if (m) return `${m[1]}/${m[2]}`;
  const m2 = /^https?:\/\/([^.]+)\.github\.io\/?$/i.exec(site.url || '');
  if (m2) return `${m2[1]}/${m2[1]}.github.io`;
  throw new Error('无法确定仓库。请在 site.json 里填好 url，或用 --repo <用户名>/<仓库名> 指定');
}

const [owner, repo] = resolveRepo().split('/');
if (!owner || !repo) throw new Error('仓库格式应为 <用户名>/<仓库名>');

/* ------------------------------ 认证 ------------------------------ */

function getToken() {
  for (const key of ['GITHUB_TOKEN', 'GH_TOKEN']) {
    if (process.env[key] && process.env[key].trim()) return process.env[key].trim();
  }
  // 退回到 gh CLI 的登录态
  const candidates = ['gh', 'gh.exe', path.resolve(ROOT, '..', '.tools', 'bin', 'gh.exe'), path.resolve(ROOT, '.tools', 'bin', 'gh.exe')];
  for (const bin of candidates) {
    try {
      const out = execFileSync(bin, ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      if (out && out.trim()) return out.trim();
    } catch { /* 换下一个 */ }
  }
  throw new Error('找不到 GitHub 凭据。请先安装 gh CLI 并运行 gh auth login，或设置 GITHUB_TOKEN 环境变量');
}

const token = getToken();

/* ------------------------------ GitHub API ------------------------------ */

async function api(method, endpoint, body) {
  const res = await fetch(API + endpoint, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'blog-deploy',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* 非 JSON 响应 */ }
  if (!res.ok) {
    const err = new Error(`${method} ${endpoint} → HTTP ${res.status}${json && json.message ? '：' + json.message : ''}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

/* ------------------------------ 收集要发布的文件 ------------------------------ */

const SKIP_DIRS = new Set(['node_modules', '.git', '.tools', 'dist', '.vscode', '.idea']);
const SKIP_FILES = new Set(['.DS_Store', 'Thumbs.db', 'desktop.ini']);

function collect(dir = ROOT, rel = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.nojekyll' && entry.name !== '.github') continue;
    if (SKIP_DIRS.has(entry.name) || SKIP_FILES.has(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    const r = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...collect(abs, r));
    else out.push(r);
  }
  return out.sort();
}

/** 限制并发数的小工具 */
async function pool(items, limit, worker) {
  const results = [];
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  }));
  return results;
}

/* ------------------------------ 主流程 ------------------------------ */

const log = (...a) => console.log(...a);

log(`仓库：${owner}/${repo}`);

let info;
try {
  info = await api('GET', `/repos/${owner}/${repo}`);
} catch (e) {
  if (e.status === 404) {
    log('仓库不存在，正在创建……');
    info = await api('POST', '/user/repos', {
      name: repo,
      description: site.description || site.subtitle || '我的博客',
      homepage: site.url || '',
      private: false,
      has_issues: true,
      has_wiki: false,
      auto_init: false,
    });
    log(`✓ 已创建公开仓库 https://github.com/${owner}/${repo}`);
  } else {
    throw e;
  }
}

const branch = info.default_branch || 'main';
const display = info.full_name || `${owner}/${repo}`;

// 当前分支头（空仓库会 404 或 409）
let parentSha = null;
let baseTree = null;
try {
  const ref = await api('GET', `/repos/${owner}/${repo}/git/ref/heads/${branch}`);
  parentSha = ref.object.sha;
  const commit = await api('GET', `/repos/${owner}/${repo}/git/commits/${parentSha}`);
  baseTree = commit.tree.sha;
  log(`当前线上版本：${parentSha.slice(0, 7)}`);
} catch (e) {
  if (e.status === 404 || e.status === 409) {
    // 空仓库里 Git Data API 会拒绝创建 blob（409 Git Repository is empty），
    // 所以先用 Contents API 落一个文件把仓库初始化，再走正常流程。
    log('仓库还是空的，正在初始化……');
    await api('PUT', `/repos/${owner}/${repo}/contents/.nojekyll`, {
      message: '初始化仓库',
      content: Buffer.from('\n').toString('base64'),
      branch,
    });
    const ref = await api('GET', `/repos/${owner}/${repo}/git/ref/heads/${branch}`);
    parentSha = ref.object.sha;
    const commit = await api('GET', `/repos/${owner}/${repo}/git/commits/${parentSha}`);
    baseTree = commit.tree.sha;
    log('✓ 仓库已初始化');
  } else {
    throw e;
  }
}

const files = collect();
log(`准备上传 ${files.length} 个文件……`);

const blobs = await pool(files, 6, async (rel) => {
  const buf = fs.readFileSync(path.join(ROOT, rel));
  let content = buf.toString('base64');
  // GitHub 不接受完全没有内容的 blob，空文件塞一个换行
  if (content === '') content = Buffer.from('\n').toString('base64');
  const blob = await api('POST', `/repos/${owner}/${repo}/git/blobs`, { content, encoding: 'base64' });
  return { path: rel, mode: '100644', type: 'blob', sha: blob.sha };
});

let treeEntries = blobs.slice();

if (prune && baseTree) {
  const base = await api('GET', `/repos/${owner}/${repo}/git/trees/${baseTree}?recursive=1`);
  const local = new Set(files);
  for (const item of base.tree || []) {
    if (item.type === 'blob' && !local.has(item.path)) {
      treeEntries.push({ path: item.path, mode: '100644', type: 'blob', sha: null });
      log(`  删除线上多余文件：${item.path}`);
    }
  }
}

/**
 * GitHub 有一个坑：凭据里没有 workflow 权限时，任何包含 .github/workflows/ 的提交
 * 都会被拒绝，而且返回的是 404（故意掩盖权限不足）。这里先探测权限，必要时跳过这些文件。
 * 这些文件只有用「GitHub Actions 自动构建」时才需要，不影响网站本身发布。
 */
const isWorkflow = (p) => p.startsWith('.github/workflows/');

async function tokenScopes() {
  try {
    const res = await fetch(API + '/', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'blog-deploy' },
    });
    const raw = res.headers.get('x-oauth-scopes');
    return raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : null;
  } catch {
    return null;
  }
}

const scopes = await tokenScopes();
if (treeEntries.some((e) => isWorkflow(e.path)) && scopes && !scopes.includes('workflow')) {
  treeEntries = treeEntries.filter((e) => !isWorkflow(e.path));
  log('! 当前 GitHub 凭据没有 workflow 权限，跳过 .github/workflows/ 下的文件');
  log('  想启用 GitHub 自动构建的话，在 GitHub 网页上手动新建这个文件即可（见 部署到公网.md）');
}

async function createTree(entries) {
  return api('POST', `/repos/${owner}/${repo}/git/trees`, {
    ...(baseTree ? { base_tree: baseTree } : {}),
    tree: entries,
  });
}

let tree;
try {
  tree = await createTree(treeEntries);
} catch (e) {
  const wf = treeEntries.filter((t) => isWorkflow(t.path));
  if (e.status === 404 && wf.length) {
    // 兜底：凭据类型导致探测不到 scope 时，去掉工作流文件重试一次
    log(`! 提交被拒绝（HTTP 404），去掉 ${wf.length} 个工作流文件后重试……`);
    treeEntries = treeEntries.filter((t) => !isWorkflow(t.path));
    tree = await createTree(treeEntries);
  } else {
    // 失败时把请求现场存下来，方便排查是哪个文件条目有问题
    const dump = path.join(ROOT, '.deploy-debug.json');
    fs.writeFileSync(dump, JSON.stringify({ baseTree, count: treeEntries.length, tree: treeEntries }, null, 2), 'utf8');
    log(`! 创建 tree 失败（HTTP ${e.status}），请求内容已存到 ${path.basename(dump)}，共 ${treeEntries.length} 项`);
    const bad = treeEntries.filter((t) => !t.sha || !/^[0-9a-f]{40}$/.test(t.sha) || !t.path);
    if (bad.length) log('  可疑条目：' + JSON.stringify(bad.slice(0, 5)));
    throw e;
  }
}

/* 提交署名：用 GitHub 提供的 noreply 匿名邮箱，
   否则 GitHub 会把账号绑定的真实邮箱（比如 QQ 邮箱）写进公开的提交记录里。 */
let author = null;
try {
  const me = await api('GET', '/user');
  const noreply = `${me.id}+${me.login}@users.noreply.github.com`;
  author = { name: site.author || me.login, email: noreply };
  log(`提交署名：${author.name} <${noreply}>（匿名邮箱）`);
} catch {
  log('! 拿不到账号信息，本次提交将不带自定义署名');
}

const commit = await api('POST', `/repos/${owner}/${repo}/git/commits`, {
  message,
  tree: tree.sha,
  ...(parentSha ? { parents: [parentSha] } : {}),
  ...(author ? { author, committer: author } : {}),
});

if (parentSha) {
  await api('PATCH', `/repos/${owner}/${repo}/git/refs/heads/${branch}`, { sha: commit.sha, force: false });
} else {
  await api('POST', `/repos/${owner}/${repo}/git/refs`, { ref: `refs/heads/${branch}`, sha: commit.sha });
}

log(`✓ 已推送提交 ${commit.sha.slice(0, 7)}（${treeEntries.filter((t) => t.sha).length} 个文件）`);

/* ------------------------------ 开启 GitHub Pages ------------------------------ */

let pages = null;
try {
  pages = await api('GET', `/repos/${owner}/${repo}/pages`);
} catch (e) {
  if (e.status !== 404) throw e;
}

if (!pages) {
  try {
    await api('POST', `/repos/${owner}/${repo}/pages`, { source: { branch, path: '/' } });
    log('✓ 已开启 GitHub Pages（来源：分支 ' + branch + ' 根目录）');
  } catch (e) {
    if (e.status === 409) log('GitHub Pages 已开启');
    else log(`! 自动开启 Pages 失败（${e.status}）：请到 https://github.com/${owner}/${repo}/settings/pages 手动开启`);
  }
} else {
  log(`GitHub Pages 已开启（状态：${pages.status || '未知'}）`);
}

/* ------------------------------ 等待并验证 ------------------------------ */

const siteUrl = (site.url || `https://${owner.toLowerCase()}.github.io/${repo}/`).replace(/\/?$/, '/');

log('\n等待线上构建完成……');
let ready = false;
for (let i = 0; i < 24; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  try {
    const p = await api('GET', `/repos/${owner}/${repo}/pages`);
    if (p.status === 'built' && p.html_url) { ready = true; log(`✓ 构建完成（第 ${i + 1} 次检查）`); break; }
    if (i % 3 === 2) log(`  还在构建中（状态：${p.status}）……`);
  } catch { /* 稍后重试 */ }
}
if (!ready) log('  构建仍在进行，稍等一两分钟再访问也可以');

log('\n验证线上地址……');
let ok = false;
for (let i = 0; i < 12; i++) {
  try {
    const res = await fetch(siteUrl, { redirect: 'follow' });
    const html = await res.text();
    if (res.ok && html.includes('assets/js/app.js')) {
      log(`✓ ${siteUrl} 返回 HTTP ${res.status}，页面内容正确（${html.length} 字节）`);
      // 顺手验证关键资源
      for (const asset of ['assets/js/posts-data.js', 'assets/css/style.css']) {
        const r2 = await fetch(siteUrl + asset);
        log(`  ${r2.ok ? '✓' : '✗'} ${asset} → HTTP ${r2.status}`);
      }
      ok = true;
      break;
    }
    log(`  第 ${i + 1} 次：HTTP ${res.status}，可能还在部署……`);
  } catch (e) {
    log(`  第 ${i + 1} 次：${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 10000));
}

log('');
if (ok) {
  log(`🎉 发布成功，网址：${siteUrl}`);
} else {
  log(`仓库已推送完成：https://github.com/${owner}/${repo}`);
  log(`线上地址 ${siteUrl} 稍后可用（GitHub Pages 首次部署有时需要几分钟）`);
}
