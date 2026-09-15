/*!
 * app.js —— 前端路由与渲染（零依赖）
 *
 * 数据来源：assets/js/posts-data.js（由 tools/build.mjs 生成）
 *   window.SITE       站点信息
 *   window.BLOG_POSTS 文章数组（已预渲染 HTML）
 *   window.BLOG_PAGES 独立页面（如「关于」）
 */
(function () {
  'use strict';

  var SITE = window.SITE || { title: '我的博客', nav: [] };
  var POSTS = window.BLOG_POSTS || null;
  var PAGES = window.BLOG_PAGES || {};

  var app = document.getElementById('app');
  var state = { q: '' };

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

  function tagList(tags) {
    if (!tags || !tags.length) return '';
    return '<span class="tags">' + tags.map(function (t) {
      return '<a class="tag" href="#/?tag=' + encodeURIComponent(t) + '">' + esc(t) + '</a>';
    }).join('') + '</span>';
  }

  /* ============================ 主题切换 ============================ */

  var THEME_KEY = 'blog-theme';

  function currentTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) { /* file:// 下可能被禁用 */ }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀' : '☾';
      btn.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
      btn.setAttribute('title', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
    }
  }

  function toggleTheme() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    applyTheme(next);
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
      return '<a class="post-card fade-in" href="#/post/' + encodeURIComponent(p.slug) + '">' +
        '<h3>' + esc(p.title) + '</h3>' +
        (p.summary ? '<p class="summary">' + esc(p.summary) + '</p>' : '') +
        '<div class="meta">' +
        '<span>' + esc(p.dateText || p.date) + '</span>' +
        '<i class="dot"></i><span>' + p.readingTime + ' 分钟阅读</span>' +
        (p.tags && p.tags.length ? '<i class="dot"></i>' + tagList(p.tags) : '') +
        '</div></a>';
    }).join('');

    var side =
      '<aside>' +
        '<div class="side-card"><h4>关于</h4><p>' + esc(SITE.subtitle || SITE.description || '') + '</p></div>' +
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
        '</ul></div>' +
      '</aside>';

    var toolbar =
      '<div class="toolbar">' +
        '<div class="search-box">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>' +
          '<input id="search" type="search" placeholder="搜索文章标题、标签或正文…" value="' + esc(state.q) + '" autocomplete="off">' +
        '</div>' +
        (tag
          ? '<div class="select-wrap"><select id="tag-filter">' +
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
          '<span class="chip">最近更新 ' + ((POSTS || [])[0] ? esc(POSTS.slice().sort(byDateDesc)[0].dateText) : '—') + '</span>' +
          (SITE.author ? '<span class="chip">作者 ' + esc(SITE.author) + '</span>' : '') +
        '</div>' +
      '</section>';

    app.innerHTML =
      hero +
      '<div class="layout with-side">' +
        '<main>' +
          (tag ? '<h2 class="section-title">标签：' + esc(tag) + ' <span class="count">' + list.length + ' 篇</span></h2>'
               : '<h2 class="section-title">最新文章 <span class="count">' + list.length + ' 篇</span></h2>') +
          toolbar +
          (cards ? '<div class="post-list">' + cards + '</div>'
                 : '<div class="empty">没有找到匹配的文章。<br>换个关键词，或者 <a href="#/">回到首页</a>。</div>') +
        '</main>' + side +
      '</div>';

    setTitle(tag ? '标签：' + tag : '');

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

  var scrollHandler = null;

  function renderPost(slug) {
    var post = findPost(slug);
    if (!post) return renderNotFound('这篇文章不存在');

    var sorted = (POSTS || []).slice().sort(byDateDesc);
    var idx = sorted.indexOf(post);
    var newer = idx > 0 ? sorted[idx - 1] : null;      // 更新的一篇
    var older = idx < sorted.length - 1 ? sorted[idx + 1] : null;

    var tocHtml = '';
    if (post.toc && post.toc.length) {
      tocHtml = '<nav class="toc"><h4>目录</h4><ul>' + post.toc.map(function (t) {
        return '<li class="lv' + t.level + '"><a href="#' + esc(t.id) + '" data-toc="' + esc(t.id) + '">' + esc(t.text) + '</a></li>';
      }).join('') + '</ul></nav>';
    }

    app.innerHTML =
      '<article class="fade-in">' +
        '<header class="post-header">' +
          '<a class="back-link" href="#/">← 返回文章列表</a>' +
          '<h1>' + esc(post.title) + '</h1>' +
          '<div class="meta">' +
            '<span>' + esc(post.dateText || post.date) + '</span>' +
            '<i class="dot"></i><span>' + post.readingTime + ' 分钟阅读</span>' +
            (post.tags && post.tags.length ? '<i class="dot"></i>' + tagList(post.tags) : '') +
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
    bindCopyButtons();
    bindToc();
    window.scrollTo(0, 0);
  }

  function bindCopyButtons() {
    app.querySelectorAll('.md-copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var wrap = btn.closest('.md-code');
        var code = wrap ? wrap.querySelector('code') : null;
        if (!code) return;
        var text = code.textContent;
        var done = function () {
          btn.textContent = '已复制';
          btn.classList.add('done');
          setTimeout(function () { btn.textContent = '复制'; btn.classList.remove('done'); }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
        } else {
          fallbackCopy(text, done);
        }
      });
    });
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  function bindToc() {
    var links = app.querySelectorAll('.toc a[data-toc]');
    if (!links.length) return;

    // 点击一律走 JS 滚动，绝对不能改 URL hash——那会被路由当成页面跳转
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.getElementById(a.getAttribute('data-toc'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    if (!('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (a) { map[a.getAttribute('data-toc')] = a; });
    var headings = app.querySelectorAll('#post-content h2[id], #post-content h3[id]');
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('active'); });
        var a = map[en.target.id];
        if (a) a.classList.add('active');
      });
    }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
    headings.forEach(function (h) { obs.observe(h); });
  }

  function bindProgress() {
    var bar = document.getElementById('progress');
    if (scrollHandler) { window.removeEventListener('scroll', scrollHandler); scrollHandler = null; }
    var content = document.getElementById('post-content');
    if (!bar || !content) { if (bar) bar.style.width = '0%'; return; }
    scrollHandler = function () {
      var rect = content.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var passed = -rect.top;
      var pct = total > 0 ? Math.max(0, Math.min(1, passed / total)) * 100 : (passed > 0 ? 100 : 0);
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });
    scrollHandler();
  }

  /* ============================ 页面：标签 / 关于 / 404 ============================ */

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

    app.innerHTML = '<div style="padding:40px 0 70px"><h1 style="margin:0 0 24px">全部标签</h1>' + body + '</div>';
    setTitle('标签');
  }

  function renderAbout() {
    var page = PAGES.about;
    var content = page ? page.html
      : '<p>还没有 <code>pages/about.md</code>，新建一个文件写点什么吧。</p>';
    app.innerHTML =
      '<div style="padding:40px 0 70px"><div class="prose" style="margin:0 auto">' +
      '<h1 style="font-size:29px;margin-bottom:22px">' + esc(page ? page.title : '关于') + '</h1>' +
      content + '</div></div>';
    setTitle(page ? page.title : '关于');
  }

  function renderNotFound(msg) {
    app.innerHTML = '<div style="padding:70px 0"><div class="empty">' +
      '<h2 style="margin:0 0 10px;color:var(--text)">404</h2>' +
      esc(msg || '页面不存在') + '<br><br><a href="#/">返回首页</a></div></div>';
    setTitle('404');
  }

  function renderNoData() {
    app.innerHTML = '<div style="padding:60px 0"><div class="notice">' +
      '还没有生成文章数据。请在 <code>blog</code> 目录下运行：<br><br>' +
      '<code>node tools/build.mjs</code><br><br>' +
      '生成 <code>assets/js/posts-data.js</code> 之后刷新本页即可。</div></div>';
    setTitle('');
  }

  /* ============================ 路由与初始化 ============================ */

  function route() {
    if (!POSTS) return renderNoData();
    var r = parseHash();
    var m;

    if (r.path === '/' || r.path === '') renderHome(r.query);
    else if ((m = /^\/post\/(.+)$/.exec(r.path))) renderPost(decodeURIComponent(m[1]));
    else if (r.path === '/tags') renderTags();
    else if (r.path === '/about') renderAbout();
    else renderNotFound();

    // 进度条：文章页读正文高度，其它页面归零
    bindProgress();

    // 导航高亮
    document.querySelectorAll('.site-nav a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      a.classList.toggle('active', href === '#' + r.path || (r.path === '/' && href === '#/'));
    });

    var top = document.getElementById('to-top');
    if (top) top.classList.toggle('show', r.path.indexOf('/post/') === 0 && window.scrollY > 400);
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
      ftLinks.innerHTML = SITE.links.map(function (l) {
        return '<a href="' + esc(l.href) + '" target="_blank" rel="noopener noreferrer">' + esc(l.label) + '</a>';
      }).join('');
    }
    if (SITE.description) {
      var md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', SITE.description);
    }
  }

  function init() {
    applyTheme(currentTheme());
    initHeader();

    var btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);

    window.addEventListener('hashchange', function () { state.q = ''; route(); });

    window.addEventListener('scroll', function () {
      var top = document.getElementById('to-top');
      if (top && location.hash.indexOf('#/post/') === 0) top.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });

    var toTop = document.getElementById('to-top');
    if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function () {
        try { if (!localStorage.getItem(THEME_KEY)) applyTheme(mq.matches ? 'dark' : 'light'); } catch (e) {}
      };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
    }

    route();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
