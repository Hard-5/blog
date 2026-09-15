/*!
 * ui.js —— 界面行为的唯一实现
 *
 * 主页（assets/js/app.js）和构建生成的静态文章页（p/*.html）共用这一份代码，
 * 避免同样的逻辑写两遍、改一处漏一处。
 *
 * 对外暴露：window.BlogUI
 */
(function (root) {
  'use strict';

  var THEME_KEY = 'blog-theme';

  /* ============================ 主题 ============================ */

  function currentTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) { /* file:// 下 localStorage 可能被禁用 */ }
    return root.matchMedia && root.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      var dark = theme === 'dark';
      btn.textContent = dark ? '☀' : '☾';
      btn.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
      btn.setAttribute('title', dark ? '切换到浅色模式' : '切换到深色模式');
    }
    // 让浏览器原生控件（滚动条、表单）跟着变
    document.documentElement.style.colorScheme = theme;
  }

  function toggleTheme() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    applyTheme(next);
  }

  /** 监听系统主题变化：只在用户没有手动选过时跟随 */
  function watchSystemTheme() {
    if (!root.matchMedia) return;
    var mq = root.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function () {
      var saved = null;
      try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
      if (!saved) applyTheme(mq.matches ? 'dark' : 'light');
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ============================ 复制 ============================ */

  function copyText(text, onDone) {
    var fallback = function () {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); if (onDone) onDone(); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone, fallback);
    } else {
      fallback();
    }
  }

  /** 提示按钮短暂变成「已复制」 */
  function flash(btn, doneText, restoreText) {
    var original = restoreText || btn.textContent;
    btn.textContent = doneText;
    btn.classList.add('done');
    setTimeout(function () {
      btn.textContent = original;
      btn.classList.remove('done');
    }, 1600);
  }

  /** 给所有 .md-code 里的「复制」按钮和 [data-copy-url] 按钮绑事件 */
  function bindCopyButtons(scope) {
    (scope || document).querySelectorAll('.md-copy').forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () {
        var wrap = btn.closest('.md-code');
        var code = wrap ? wrap.querySelector('code') : null;
        if (!code) return;
        copyText(code.textContent, function () { flash(btn, '已复制', '复制'); });
      });
    });

    (scope || document).querySelectorAll('[data-copy-url]').forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () {
        var url = btn.getAttribute('data-copy-url');
        if (!url) return;
        copyText(url, function () { flash(btn, '链接已复制', btn.getAttribute('data-label') || '分享'); });
      });
    });
  }

  /* ============================ 目录 ============================ */

  /**
   * 目录：点击平滑滚动 + 滚动时高亮当前小节。
   * 注意绝不能改 URL 的 hash —— 主页用 hash 做路由，改了会被当成页面跳转。
   */
  function bindToc(scope, contentId, opts) {
    var box = scope || document;
    var links = box.querySelectorAll('.toc a[data-toc]');
    if (!links.length) return;

    // 主页用 hash 做路由，必须拦下点击改走 JS 滚动；
    // 静态文章页的 #锚点 是原生行为，反而应该放行（可以复制带锚点的链接）。
    if (!(opts && opts.native)) {
      links.forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var target = document.getElementById(a.getAttribute('data-toc'));
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }

    if (!('IntersectionObserver' in root)) return;

    var map = {};
    links.forEach(function (a) { map[a.getAttribute('data-toc')] = a; });
    var headings = box.querySelectorAll('#' + contentId + ' h2[id], #' + contentId + ' h3[id]');
    if (!headings.length) return;

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

  /**
   * 移动端把目录收成可折叠的 <details>，桌面端默认展开。
   * 桌面端 summary 会显示为「目录」小标题，手动点也能收起。
   */
  function setupTocDisclosure() {
    var box = document.querySelector('details.toc-wrap');
    if (!box) return;
    if (!root.matchMedia) return;
    var mq = root.matchMedia('(min-width: 981px)');
    var sync = function () { box.open = mq.matches; };
    sync();
    if (mq.addEventListener) mq.addEventListener('change', sync);
    else if (mq.addListener) mq.addListener(sync);
  }

  /* ============================ 阅读进度 / 回到顶部 ============================ */

  var scrollHandler = null;

  function bindProgress(contentId) {
    var bar = document.getElementById('progress');
    if (scrollHandler) { root.removeEventListener('scroll', scrollHandler); scrollHandler = null; }
    var content = document.getElementById(contentId || 'post-content');
    if (!bar || !content) { if (bar) bar.style.width = '0%'; return; }

    scrollHandler = function () {
      var rect = content.getBoundingClientRect();
      var total = rect.height - root.innerHeight;
      var passed = -rect.top;
      var pct = total > 0 ? Math.max(0, Math.min(1, passed / total)) * 100 : (passed > 0 ? 100 : 0);
      bar.style.width = pct + '%';
    };
    root.addEventListener('scroll', scrollHandler, { passive: true });
    scrollHandler();
  }

  function bindToTop() {
    var btn = document.getElementById('to-top');
    if (!btn) return;
    var onScroll = function () { btn.classList.toggle('show', root.scrollY > 400); };
    root.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', function () { root.scrollTo({ top: 0, behavior: 'smooth' }); });
    onScroll();
  }

  /* ============================ 入口 ============================ */

  /** 主题按钮 + 回到顶部 + 跟随系统主题：两种页面都要 */
  function initCommon() {
    applyTheme(currentTheme());
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggleTheme);
    bindToTop();
    watchSystemTheme();
  }

  /** 文章页（SPA 和静态页共用）：目录 + 代码复制 + 阅读进度 */
  function initPostPage(contentId, opts) {
    var id = contentId || 'post-content';
    setupTocDisclosure();
    bindCopyButtons(document);
    bindToc(document, id, opts);
    bindProgress(id);
  }

  root.BlogUI = {
    currentTheme: currentTheme,
    applyTheme: applyTheme,
    toggleTheme: toggleTheme,
    copyText: copyText,
    bindCopyButtons: bindCopyButtons,
    bindToc: bindToc,
    bindProgress: bindProgress,
    setupTocDisclosure: setupTocDisclosure,
    initCommon: initCommon,
    initPostPage: initPostPage
  };
})(typeof window !== 'undefined' ? window : this);
