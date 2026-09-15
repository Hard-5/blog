/*!
 * app.js —— 主页的路由与渲染（零依赖）
 *
 * 数据来源：assets/js/posts-data.js（由 tools/build.mjs 生成）
 *   window.SITE       站点信息
 *   window.BLOG_POSTS 文章数组（已预渲染 HTML）
 *   window.BLOG_PAGES 独立页面（如「关于」）
 *
 * 主题、复制、目录、阅读进度这些行为都在 ui.js 里，本文件只负责「渲染哪一页」。
 */
(function () {
  'use strict';

  var SITE = window.SITE || { title: '我的博客', nav: [] };
  var POSTS = window.BLOG_POSTS || null;
  var PAGES = window.BLOG_PAGES || {};
  var UI = window.BlogUI;

  var app = document.getElementById('app');
  var state = { q: '' };

  /* 站点根地址，用于拼「分享链接」和 RSS 地址 */
  var SITE_BASE = String(SITE.url || '').replace(/\/+$/, '');
  var POST_URL_BASE = SITE_BASE ? SITE_BASE + '/p/' : '';
  var RSS_URL = SITE_BASE ? SITE_BASE + '/feed.xml' : 'feed.xml';

  /* ============================ 工具函数 ============================ */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function parseHash() {
    var raw = location.hash.replace(/^#/, '') || '/';
    var qi = raw.indexOf('?');
    var path = qi === -1 ? raw : raw.slice(0, qi);
    var query = {};
    if (qi !== -1) {
      raw.slice(qi + 1).split('&').forEach(function (kv) {
        if (!kv) return;
        var p = kv.split('=');
        query[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || '').replace(/\+/g, ' '));
      });
    }
    if (path.charAt(0) !== '/') path = '/' + path;
    return { path: path.replace(/\/+$/, '') || '/', query: query };
  }

  function byDateDesc(a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; }

  function allTags() {
    var map = {};
    (POSTS || []).forEach(function (p) {
      (p.tags || []).forEach(function (t) { map[t] = (map[t] || 0) + 1; });
    });
    return Object.keys(map).map(function (t) { return { name: t, count: map[t] }; })
      .sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name); });
  }

  function findPost(slug) {
    for (var i = 0; i < (POSTS || []).length; i++) if (POSTS[i].slug === slug) return POSTS[i];
    return null;
  }

  function setTitle(t) { document.title = t ? t + ' · ' + SITE.title : SITE.title; }

  /**
   * 标签列表。
   * asLinks=false 用于文章卡片内部：卡片整体已经是一个 <a>，里面再放 <a> 是非法
   * HTML，浏览器会把外层链接强行拆开，卡片结构就乱了。
   */
  function tagList(tags, asLinks) {
    if (!tags || !tags.length) return '';
    var link = asLinks !== false;
    return '<span class="tags">' + tags.map(function (t) {
      return link
        ? '<a class="tag" href="#/?tag=' + encodeURIComponent(t) + '">' + esc(t) + '</a>'
        : '<span class="tag">' + esc(t) + '</span>';
    }).join('') + '</span>';
  }

  /* 把正文里的关键词包上 <mark>，让搜索结果一眼看到命中位置 */
  function highlight(text, q) {
    if (!q) return esc(text);
    var safe = esc(text);
    var needle = esc(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      return safe.replace(new RegExp(needle, 'gi'), function (m) { return '<mark>' + m + '</mark>'; });
    } catch (e) {
      return safe;
    }
  }

  function excerpt(text, q, len) {
    if (!text) return '';
    var lower = text.toLowerCase();
    var at = q ? lower.indexOf(q.toLowerCase()) : -1;
    var start = at > 40 ? at - 40 : 0;
    var piece = text.slice(start, start + (len || 90));
    return (start > 0 ? '…' : '') + piece + (start + (len || 90) < text.length ? '…' : '');
  }

  /* ============================ 页面：首页 ============================ */

  function renderHome(query) {
    var tag = query.tag || '';
    var q = state.q.trim().toLowerCase();

    var list = (POSTS || []).slice().sort(byDateDesc);
    if (tag) list = list.filter(function (p) { return (p.tags || []).indexOf(tag) !== -1; });
    if (q) {
      list = list.filter(function (p) {
        return (p.title + ' ' + (p.summary || '') + ' ' + (p.tags || []).join(' ') + ' ' + (p.text || ''))
          .toLowerCase().indexOf(q) !== -1;
      });
    }

    var tags = allTags();
    var cards = list.map(function (p) {
      var hit = q && (p.text || '').toLowerCase().indexOf(q) !== -1 && (p.title + ' ' + (p.summary || '')).toLowerCase().indexOf(q) === -1;
      return '<a class="post-card fade-in" href="#/post/' + encodeURIComponent(p.slug) + '">' +
        '<h3>' + highlight(p.title, q) + '</h3>' +
        (p.summary ? '<p class="summary">' + highlight(p.summary, q) + '</p>' : '') +
        (hit ? '<p class="summary hit">…' + highlight(excerpt(p.text, q), q) + '</p>' : '') +
        '<div class="meta">' +
        '<span>' + esc(p.dateText || p.date) + '</span>' +
        '<i class="dot"></i><span>' + p.readingTime + ' 分钟阅读</span>' +
        (p.tags && p.tags.length ? '<i class="dot"></i>' + tagList(p.tags, false) : '') +
        '</div></a>';
    }).join('') || '';

    var latest = (POSTS || []).slice().sort(byDateDesc)[0];

    var side =
      '<aside>' +
        '<div class="side-card"><h4>关于</h4><p>' + esc(SITE.subtitle || SITE.description || '') + '</p>' +
          (SITE.author ? '<p style="margin-top:10px;color:var(--muted);font-size:13px">作者：' + esc(SITE.author) + '</p>' : '') +
        '</div>' +
        '<div class="side-card"><h4>标签</h4><ul>' +
          (tags.length
            ? tags.slice(0, 12).map(function (t) {
                return '<li><a href="#/?tag=' + encodeURIComponent(t.name) + '">' + esc(t.name) + '<span>' + t.count + '</span></a></li>';
              }).join('')
            : '<li style="color:var(--muted);font-size:13.5px">还没有标签</li>') +
        '</ul></div>' +
        '<div class="side-card"><h4>统计</h4><ul>' +
          '<li><a>文章<span>' + (POSTS || []).length + '</span></a></li>' +
          '<li><a>标签<span>' + tags.length + '</span></a></li>' +
          '<li><a href="' + esc(RSS_URL) + '" target="_blank" rel="noopener">RSS 订阅<span>↗</span></a></li>' +
        '</ul></div>' +
      '</aside>';

    // 标签筛选和搜索始终都在，不用先点进标签页才能筛
    var toolbar =
      '<div class="toolbar">' +
        '<div class="search-box">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>' +
          '<input id="search" type="search" placeholder="搜索文章（按 / 快速聚焦）" value="' + esc(state.q) + '" autocomplete="off" aria-label="搜索文章">' +
        '</div>' +
        (tags.length
          ? '<div class="select-wrap"><select id="tag-filter" aria-label="按标签筛选">' +
              '<option value="">全部标签</option>' +
              tags.map(function (t) {
                return '<option value="' + esc(t.name) + '"' + (t.name === tag ? ' selected' : '') + '>' + esc(t.name) + ' (' + t.count + ')</option>';
              }).join('') +
            '</select></div>'
          : '') +
      '</div>';

    var hero =
      '<section class="hero">' +
        '<h1>' + esc(SITE.title) + '</h1>' +
        '<p>' + esc(SITE.description || SITE.subtitle || '') + '</p>' +
        '<div class="meta-row">' +
          '<span class="chip">共 ' + (POSTS || []).length + ' 篇文章</span>' +
          (latest ? '<span class="chip">最近更新 ' + esc(latest.dateText) + '</span>' : '') +
          (SITE.author ? '<span class="chip">作者 ' + esc(SITE.author) + '</span>' : '') +
        '</div>' +
      '</section>';

    var title2 = q
      ? '搜索「' + esc(state.q) + '」 <span class="count">' + list.length + ' 篇</span>'
      : (tag ? '标签：' + esc(tag) + ' <span class="count">' + list.length + ' 篇</span>'
             : '最新文章 <span class="count">' + list.length + ' 篇</span>');

    app.innerHTML =
      hero +
      '<div class="layout with-side">' +
        '<main>' +
          '<h2 class="section-title">' + title2 + '</h2>' +
          toolbar +
          (cards ? '<div class="post-list">' + cards + '</div>'
                 : '<div class="empty">没有找到匹配的文章。<br>换个关键词，或者 <a href="#/">回到首页</a>。</div>') +
        '</main>' + side +
      '</div>';

    setTitle(q ? '搜索：' + state.q : (tag ? '标签：' + tag : ''));

    var input = document.getElementById('search');
    if (input) {
      input.addEventListener('input', function () {
        state.q = input.value;
        var pos = input.selectionStart;
        renderHome(parseHash().query);
        var next = document.getElementById('search');
        if (next) { next.focus(); try { next.setSelectionRange(pos, pos); } catch (e) {} }
      });
    }
    var sel = document.getElementById('tag-filter');
    if (sel) {
      sel.addEventListener('change', function () {
        location.hash = sel.value ? '#/?tag=' + encodeURIComponent(sel.value) : '#/';
      });
    }
  }

  /* ============================ 页面：文章 ============================ */

  function renderPost(slug) {
    var post = findPost(slug);
    if (!post) return renderNotFound('这篇文章不存在');

    var sorted = (POSTS || []).slice().sort(byDateDesc);
    var idx = sorted.indexOf(post);
    var newer = idx > 0 ? sorted[idx - 1] : null;
    var older = idx < sorted.length - 1 ? sorted[idx + 1] : null;

    var tocHtml = '';
    if (post.toc && post.toc.length) {
      tocHtml = '<details class="toc-wrap" open><summary>目录</summary><nav class="toc"><ul>' +
        post.toc.map(function (t) {
          return '<li class="lv' + t.level + '"><a href="#' + esc(t.id) + '" data-toc="' + esc(t.id) + '">' + esc(t.text) + '</a></li>';
        }).join('') + '</ul></nav></details>';
    }

    var shareBtn = POST_URL_BASE
      ? '<button type="button" class="share-btn" data-copy-url="' + esc(POST_URL_BASE + post.slug + '.html') + '" data-label="分享" title="复制这篇文章的固定链接，方便发给别人">分享</button>'
      : '';

    app.innerHTML =
      '<article class="fade-in">' +
        '<header class="post-header">' +
          '<a class="back-link" href="#/">← 返回文章列表</a>' +
          '<h1>' + esc(post.title) + '</h1>' +
          '<div class="meta">' +
            '<span>' + esc(post.dateText || post.date) + '</span>' +
            '<i class="dot"></i><span>' + post.readingTime + ' 分钟阅读</span>' +
            (post.words ? '<i class="dot"></i><span>' + post.words + ' 字</span>' : '') +
            (post.tags && post.tags.length ? '<i class="dot"></i>' + tagList(post.tags) : '') +
            shareBtn +
          '</div>' +
        '</header>' +
        '<div class="post-body-wrap' + (tocHtml ? ' with-toc' : '') + '">' +
          '<div class="prose" id="post-content">' + post.html + '</div>' +
          tocHtml +
        '</div>' +
        '<nav class="post-nav">' +
          (older
            ? '<a class="prev" href="#/post/' + encodeURIComponent(older.slug) + '"><span class="dir">← 上一篇</span><span class="t">' + esc(older.title) + '</span></a>'
            : '<span class="placeholder"></span>') +
          (newer
            ? '<a class="next" href="#/post/' + encodeURIComponent(newer.slug) + '"><span class="dir">下一篇 →</span><span class="t">' + esc(newer.title) + '</span></a>'
            : '<span class="placeholder"></span>') +
        '</nav>' +
      '</article>';

    setTitle(post.title);
    if (UI) UI.initPostPage('post-content');
    window.scrollTo(0, 0);
  }

  /* ============================ 页面：标签 ============================ */

  function renderTags() {
    var tags = allTags();
    var body = tags.length
      ? '<div class="tag-cloud">' + tags.map(function (t) {
          return '<a class="tag" href="#/?tag=' + encodeURIComponent(t.name) + '">' + esc(t.name) + ' <b style="opacity:.6;font-weight:400">' + t.count + '</b></a>';
        }).join('') + '</div>' +
        tags.map(function (t) {
          var ps = (POSTS || []).filter(function (p) { return (p.tags || []).indexOf(t.name) !== -1; }).sort(byDateDesc);
          return '<h2 class="section-title" style="margin-top:26px">' + esc(t.name) + ' <span class="count">' + ps.length + ' 篇</span></h2>' +
            '<ul class="post-list" style="gap:8px">' + ps.map(function (p) {
              return '<li><a href="#/post/' + encodeURIComponent(p.slug) + '">' + esc(p.title) + '</a> <span style="color:var(--muted);font-size:13px">' + esc(p.dateText) + '</span></li>';
            }).join('') + '</ul>';
        }).join('')
      : '<div class="empty">还没有任何标签。</div>';

    app.innerHTML = '<div class="page-pad"><h1 class="page-title">全部标签</h1>' + body + '</div>';
    setTitle('标签');
  }

  /* ============================ 页面：归档 ============================ */

  function renderArchive() {
    var list = (POSTS || []).slice().sort(byDateDesc);
    if (!list.length) {
      app.innerHTML = '<div class="page-pad"><div class="empty">还没有文章。</div></div>';
      setTitle('归档');
      return;
    }
    var byYear = {};
    list.forEach(function (p) {
      var y = String(p.date || '').slice(0, 4) || '未知';
      (byYear[y] = byYear[y] || []).push(p);
    });
    var years = Object.keys(byYear).sort().reverse();

    var body = years.map(function (y) {
      var items = byYear[y];
      var words = items.reduce(function (n, p) { return n + (p.words || 0); }, 0);
      return '<h2 class="section-title" style="margin-top:28px">' + esc(y) + ' 年 <span class="count">' + items.length + ' 篇 · ' + words + ' 字</span></h2>' +
        '<ul class="archive-list">' + items.map(function (p) {
          var md = String(p.date || '').slice(5).replace('-', '/');
          return '<li>' +
            '<span class="date">' + esc(md) + '</span>' +
            '<a href="#/post/' + encodeURIComponent(p.slug) + '">' + esc(p.title) + '</a>' +
            (p.tags && p.tags.length ? '<span class="tags">' + p.tags.map(function (t) {
              return '<a class="tag" href="#/?tag=' + encodeURIComponent(t) + '">' + esc(t) + '</a>';
            }).join('') + '</span>' : '') +
          '</li>';
        }).join('') + '</ul>';
    }).join('');

    app.innerHTML = '<div class="page-pad">' +
      '<h1 class="page-title">归档</h1>' +
      '<p style="color:var(--muted);margin-top:-8px">共 ' + list.length + ' 篇，按时间倒序。</p>' +
      body + '</div>';
    setTitle('归档');
  }

  /* ============================ 页面：关于 / 404 ============================ */

  function renderAbout() {
    var page = PAGES.about;
    var content = page ? page.html
      : '<p>还没有 <code>pages/about.md</code>，新建一个文件写点什么吧。</p>';
    app.innerHTML =
      '<div class="page-pad"><div class="prose" style="margin:0 auto">' +
      '<h1 class="page-title" style="margin-bottom:22px">' + esc(page ? page.title : '关于') + '</h1>' +
      content + '</div></div>';
    setTitle(page ? page.title : '关于');
  }

  function renderNotFound(msg) {
    app.innerHTML = '<div class="page-pad" style="padding-top:70px"><div class="empty">' +
      '<h2 style="margin:0 0 10px;color:var(--text)">404</h2>' +
      esc(msg || '页面不存在') + '<br><br><a href="#/">返回首页</a></div></div>';
    setTitle('404');
  }

  function renderNoData() {
    app.innerHTML = '<div class="page-pad"><div class="notice">' +
      '还没有生成文章数据。请在 <code>blog</code> 目录下运行：<br><br>' +
      '<code>node tools/build.mjs</code><br><br>' +
      '生成 <code>assets/js/posts-data.js</code> 之后刷新本页即可。</div></div>';
    setTitle('');
  }

  /* ============================ 路由与初始化 ============================ */

  function route() {
    if (!POSTS) return renderNoData();

    // 形如 #app 或 #某个标题 的锚点不是路由，直接当作首页 —— 否则「跳到正文」这类
    // 无障碍链接会把页面变成空白。
    var raw = location.hash.replace(/^#/, '');
    var r = (raw && raw.charAt(0) !== '/') ? { path: '/', query: {} } : parseHash();
    var m;

    if (r.path === '/' || r.path === '') renderHome(r.query);
    else if ((m = /^\/post\/(.+)$/.exec(r.path))) renderPost(decodeURIComponent(m[1]));
    else if (r.path === '/tags') renderTags();
    else if (r.path === '/archive') renderArchive();
    else if (r.path === '/about') renderAbout();
    else renderNotFound();

    // 进度条：文章页读正文高度，其它页面归零
    if (UI) UI.bindProgress('post-content');

    // 导航高亮
    document.querySelectorAll('.site-nav a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      a.classList.toggle('active', href === '#' + r.path || (r.path === '/' && href === '#/'));
    });
  }

  function initHeader() {
    var name = document.querySelector('.brand .name');
    if (name) name.textContent = SITE.title;
    var logo = document.querySelector('.brand .logo');
    if (logo) logo.textContent = (SITE.title || 'B').trim().charAt(0);
    var nav = document.querySelector('.site-nav');
    if (nav && SITE.nav) {
      nav.innerHTML = SITE.nav.map(function (n) {
        return '<a href="' + esc(n.href) + '">' + esc(n.label) + '</a>';
      }).join('');
    }
    var ftTitle = document.getElementById('footer-title');
    if (ftTitle) ftTitle.textContent = SITE.title;
    var ftNote = document.getElementById('footer-note');
    if (ftNote) ftNote.textContent = SITE.footer || '';
    var ftLinks = document.getElementById('footer-links');
    if (ftLinks && SITE.links) {
      var links = SITE.links.slice();
      links.push({ label: 'RSS', href: RSS_URL });
      ftLinks.innerHTML = links.map(function (l) {
        return '<a href="' + esc(l.href) + '" target="_blank" rel="noopener noreferrer">' + esc(l.label) + '</a>';
      }).join('');
    }
  }

  function init() {
    if (UI) UI.initCommon();
    initHeader();

    window.addEventListener('hashchange', function () { state.q = ''; route(); });

    // 按 / 快速聚焦搜索框（输入框里按 / 不抢）
    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      var input = document.getElementById('search');
      if (input) { e.preventDefault(); input.focus(); }
    });

    // 按 Esc 清空搜索
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var input = document.getElementById('search');
      if (input && document.activeElement === input && input.value) {
        input.value = '';
        state.q = '';
        renderHome(parseHash().query);
      }
    });

    route();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
