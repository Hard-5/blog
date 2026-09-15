#!/usr/bin/env node
/**
 * smoke.mjs —— 无浏览器冒烟测试
 *
 * 用法：node tools/smoke.mjs
 *
 * 用一个极简的假 DOM 把 posts-data.js + app.js 真跑一遍，逐个访问首页、文章页、
 * 标签页、关于页、404 和标签过滤，确认渲染过程不抛异常、关键结构都在。
 * 它替代不了人工看页面，但能挡住「改了模板字符串导致整站白屏」这类事故。
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/* ------------------------------ 极简假 DOM ------------------------------ */

function makeEl(id = '') {
  const el = {
    id,
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    _attrs: {},
    classList: {
      _s: new Set(id === 'theme-toggle' ? [] : []),
      add(c) { this._s.add(c); },
      remove(c) { this._s.delete(c); },
      toggle(c, on) { on ? this._s.add(c) : this._s.delete(c); },
      contains(c) { return this._s.has(c); },
    },
    setAttribute(k, v) { el._attrs[k] = v; },
    getAttribute(k) { return el._attrs[k] === undefined ? null : el._attrs[k]; },
    addEventListener() {},
    appendChild() {},
    removeChild() {},
    focus() {},
    select() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    scrollIntoView() {},
    closest() { return null; },
    getBoundingClientRect() { return { top: 0, height: 2000, bottom: 2000, left: 0, right: 0, width: 800 }; },
  };
  return el;
}

const ids = new Map();
for (const id of ['app', 'progress', 'theme-toggle', 'to-top', 'footer-title', 'footer-note', 'footer-links', 'search', 'tag-filter', 'post-content']) {
  ids.set(id, makeEl(id));
}

const listeners = {};
const store = new Map();

const documentMock = {
  readyState: 'complete',
  title: '',
  documentElement: makeEl('html'),
  body: makeEl('body'),
  getElementById: (id) => ids.get(id) || null,
  querySelector: () => makeEl(),
  querySelectorAll: () => [],
  createElement: () => makeEl(),
  addEventListener: (type, fn) => { (listeners[type] = listeners[type] || []).push(fn); },
  execCommand: () => true,
};

const locationMock = { hash: '#/' };

const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  JSON,
  Math,
  Date,
  document: documentMock,
  location: locationMock,
  history: { replaceState() {}, pushState() {} },
  navigator: {},
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
};
sandbox.window = sandbox;
sandbox.matchMedia = () => ({ matches: false, addEventListener() {} });
sandbox.addEventListener = (type, fn) => { (listeners[type] = listeners[type] || []).push(fn); };
sandbox.removeEventListener = () => {};
sandbox.scrollTo = () => {};
sandbox.scrollY = 0;
sandbox.self = sandbox;

vm.createContext(sandbox);

/* ------------------------------ 跑起来 ------------------------------ */

let failures = 0;

function run(file) {
  try {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), sandbox, { filename: file });
    return true;
  } catch (e) {
    failures++;
    console.log(`  ✗ 执行 ${file} 抛异常：${e.message}`);
    return false;
  }
}

function assert(label, cond) {
  if (cond) console.log(`  ✓ ${label}`);
  else { failures++; console.log(`  ✗ ${label}`); }
}

function goto(hash) {
  locationMock.hash = hash;
  const hs = listeners.hashchange || [];
  try {
    hs.forEach((fn) => fn());
    return true;
  } catch (e) {
    failures++;
    console.log(`  ✗ 切换路由 ${hash} 抛异常：${e.message}`);
    return false;
  }
}

/** 检测 <a> 里套 <a>：HTML 不允许，浏览器会把外层链接拆开，卡片结构会乱 */
function hasNestedAnchors(html) {
  const re = /<a\b[^>]*>|<\/a>/g;
  let depth = 0;
  let m;
  while ((m = re.exec(html))) {
    if (m[0] === '</a>') depth = Math.max(0, depth - 1);
    else { depth++; if (depth > 1) return true; }
  }
  return false;
}

console.log('加载 posts-data.js、ui.js 与 app.js（首屏即渲染首页）');
run('assets/js/posts-data.js');
run('assets/js/ui.js');
assert('BlogUI 已导出', typeof sandbox.BlogUI === 'object' && typeof sandbox.BlogUI.initCommon === 'function');
ids.get('app').innerHTML = '';
run('assets/js/app.js');

const out = () => ids.get('app').innerHTML;
const count = (s, re) => (s.match(re) || []).length;
const cards = (s) => count(s, /class="post-card/g);

console.log('\n路由渲染：');
assert('首页渲染出 3 张文章卡片', cards(out()) === 3);
assert('首页有 hero 与工具栏', /class="hero"/.test(out()) && /id="search"/.test(out()));
assert('标签下拉框无需先点标签就存在', /id="tag-filter"/.test(out()));
assert('首页侧栏有标签统计与 RSS 入口', /side-card/.test(out()) && /feed\.xml/.test(out()));
assert('首页没有非法嵌套的 <a>（卡片里不能再套链接）', !hasNestedAnchors(out()));
assert('首屏标题已写入 <title>', !!documentMock.title);

goto('#/post/markdown-guide');
assert('文章页有标题与元信息', /class="post-header"/.test(out()) && out().includes('Markdown 语法速查'));
assert('文章页渲染了目录', /class="toc"/.test(out()) && /toc-wrap/.test(out()));
assert('文章页渲染了代码块与复制按钮', /class="md-copy"/.test(out()) && count(out(), /class="md-code"/g) > 3);
assert('文章页有分享按钮（固定链接）', /data-copy-url="https:\/\/hard-5\.github\.io\/blog\/p\/markdown-guide\.html"/.test(out()));
assert('文章页有上下篇导航', /class="post-nav"/.test(out()));
assert('文章页没有非法嵌套的 <a>', !hasNestedAnchors(out()));
assert('文章页标签仍是可点链接', /<a class="tag" href="#\/\?tag=/.test(out()));
assert('文章页标题写入了 <title>', documentMock.title.includes('Markdown'));

goto('#/');
assert('返回首页正常', cards(out()) === 3);

goto('#/?tag=工具');
assert('标签过滤只留下 1 篇', cards(out()) === 1 && out().includes('markdown-guide'));
assert('标签页出现标签下拉框', /id="tag-filter"/.test(out()));

goto('#/archive');
assert('归档页渲染并按年份分组', /archive-list/.test(out()) && out().includes('2026 年'));
assert('归档页列出全部文章', count(out(), /archive-list[\s\S]*?<\/ul>/) === 1 && count(out(), /<li>/g) === 3);

goto('#/tags');
assert('标签总览页渲染', /tag-cloud/.test(out()) && count(out(), /class="tag"/g) > 3);

goto('#/about');
assert('关于页渲染（pages/about.md）', /class="prose"/.test(out()) && out().includes('Hard 5'));

goto('#/post/this-does-not-exist');
assert('不存在的文章走 404 分支', /404/.test(out()));

goto('#/whatever');
assert('未知路由走 404 分支', /404/.test(out()));

// 无障碍跳转链接会产生 #app 这种非路由 hash，不能把页面变成空白
locationMock.hash = '#app';
(listeners.hashchange || []).forEach((fn) => fn());
assert('#app 锚点不被当成路由（页面照常渲染）', cards(out()) === 3);

goto('#/');
assert('最终回到首页', cards(out()) === 3);

// 键盘快捷键：按 / 聚焦搜索框，且不能在输入框内抢按键
console.log('\n键盘交互：');
const kd = listeners.keydown || [];
assert('注册了 keydown 监听', kd.length >= 1);
let threw = false;
try {
  kd.forEach((fn) => {
    fn({ key: '/', target: { tagName: 'BODY' }, preventDefault() {} });
    fn({ key: '/', target: { tagName: 'INPUT' }, preventDefault() {} });
    fn({ key: 'Escape', target: { tagName: 'BODY' } });
  });
} catch (e) { threw = true; console.log(`      异常：${e.message}`); }
assert('键盘事件处理不抛异常', !threw);

console.log(`\n结果：${failures ? failures + ' 项失败' : '全部通过'}`);
if (failures) process.exit(1);
