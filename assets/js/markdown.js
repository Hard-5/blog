/*!
 * MiniMarkdown —— 零依赖 Markdown 渲染器 + 轻量代码高亮
 *
 * 浏览器的用法：<script src="assets/js/markdown.js"></script> → window.MiniMarkdown
 * Node 的用法：  const MiniMarkdown = require('./assets/js/markdown.js')
 *
 * 构建脚本（tools/build.mjs）和前端共用同一个渲染器，保证「构建期生成」与
 * 「运行时兜底渲染」的结果完全一致。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MiniMarkdown = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ============================================================
   * 一、代码高亮（正则级 tokenizer，够用且不会跑偏）
   * ============================================================ */

  var LANGS = {
    js: {
      keywords: 'as async await break case catch class const continue debugger default delete do else export extends finally for from function get if import in instanceof let new of return set static super switch this throw try typeof var void while with yield true false null undefined NaN Infinity globalThis',
      types: 'Array Boolean Date Error Function JSON Map Math Number Object Promise Proxy RegExp Set String Symbol WeakMap WeakSet BigInt Intl',
      builtins: 'console document window process require module exports fetch setTimeout setInterval clearTimeout localStorage',
      line: '//', block: ['/*', '*/'], strings: ['"', "'", '`']
    },
    json: { keywords: 'true false null', types: '', builtins: '', strings: ['"'] },
    python: {
      keywords: 'and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield True False None',
      types: 'int float str bool list dict tuple set frozenset bytes bytearray complex object type',
      builtins: 'print len range enumerate zip open input isinstance getattr setattr super self cls next iter sum min max sorted map filter abs round any all',
      line: '#', strings: ['"', "'"]
    },
    c: {
      keywords: 'auto break case const continue default do else enum extern for goto if inline register restrict return sizeof static struct switch typedef union volatile while _Bool NULL true false',
      types: 'char double float int long short signed unsigned void size_t ssize_t FILE bool int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t',
      builtins: 'printf scanf malloc free calloc realloc memcpy memset strlen strcmp strcpy fopen fclose fprintf fgets puts getchar putchar exit sizeof',
      line: '//', block: ['/*', '*/'], strings: ['"', "'"], preproc: '#'
    },
    java: {
      keywords: 'abstract assert break case catch class const continue default do else enum extends final finally for goto if implements import instanceof interface native new package private protected public return static strictfp super switch synchronized this throw throws transient try volatile while var record sealed yield true false null',
      types: 'boolean byte char double float int long short void String Integer Long Double Float Boolean Character Object List Map Set ArrayList HashMap HashSet Optional Stream',
      builtins: 'System out println print printf Math Arrays Collections Objects',
      line: '//', block: ['/*', '*/'], strings: ['"', "'"]
    },
    go: {
      keywords: 'break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var nil true false iota',
      types: 'bool byte complex64 complex128 error float32 float64 int int8 int16 int32 int64 rune string uint uint8 uint16 uint32 uint64 uintptr any',
      builtins: 'append cap close copy delete len make new panic print println recover fmt',
      line: '//', block: ['/*', '*/'], strings: ['"', "'", '`']
    },
    rust: {
      keywords: 'as async await break const continue crate dyn else enum extern fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait type unsafe use where while true false',
      types: 'bool char f32 f64 i8 i16 i32 i64 i128 isize str String u8 u16 u32 u64 u128 usize Vec Option Result Box Rc Arc HashMap',
      builtins: 'println print format vec panic assert dbg Some None Ok Err',
      line: '//', block: ['/*', '*/'], strings: ['"', "'"]
    },
    bash: {
      keywords: 'if then else elif fi for while until do done case esac function in select time local export readonly declare return break continue',
      types: '', builtins: 'echo cd ls cp mv rm mkdir rmdir touch cat grep sed awk find xargs chmod chown curl wget git npm node pnpm sudo apt brew',
      line: '#', strings: ['"', "'"]
    },
    sql: {
      keywords: 'select from where insert into values update set delete create table alter drop index view join inner left right full outer on group by having order asc desc limit offset distinct as and or not null is in between like union all exists case when then else end primary key foreign references default unique',
      types: 'int integer varchar char text date datetime timestamp boolean decimal numeric float serial bigint',
      builtins: 'count sum avg min max coalesce cast now',
      line: '--', block: ['/*', '*/'], strings: ['"', "'"]
    },
    yaml: { keywords: 'true false null yes no on off', types: '', builtins: '', line: '#', strings: ['"', "'"] },
    diff: { keywords: '', types: '', builtins: '', strings: [] }
  };

  // 语言别名 → 规范名
  var ALIAS = {
    javascript: 'js', mjs: 'js', cjs: 'js', jsx: 'js', node: 'js',
    ts: 'js', typescript: 'js', tsx: 'js',
    py: 'python', python3: 'python',
    'c++': 'c', cpp: 'c', cc: 'c', h: 'c', hpp: 'c', objc: 'c',
    golang: 'go',
    rs: 'rust',
    sh: 'bash', shell: 'bash', zsh: 'bash', console: 'bash', powershell: 'bash', ps1: 'bash', ps: 'bash',
    mysql: 'sql', postgres: 'sql', postgresql: 'sql', sqlite: 'sql',
    yml: 'yaml', toml: 'yaml', ini: 'yaml', conf: 'yaml',
    patch: 'diff'
  };

  function specOf(lang) {
    var key = String(lang || '').toLowerCase().trim();
    key = ALIAS[key] || key;
    return LANGS[key] || null;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function span(cls, text) {
    return '<span class="tok tok-' + cls + '">' + esc(text) + '</span>';
  }

  function kwSet(s) {
    var set = Object.create(null);
    String(s || '').split(/\s+/).forEach(function (w) { if (w) set[w] = true; });
    return set;
  }

  /**
   * 把源码切成带 class 的 span。code 必须是「未转义」的原始文本。
   */
  function highlight(code, lang) {
    var spec = specOf(lang);
    if (!spec) return esc(code);

    var KW = kwSet(spec.keywords), TY = kwSet(spec.types), BI = kwSet(spec.builtins);
    var out = '', i = 0, n = code.length, lastKeyword = '';

    while (i < n) {
      var c = code.charAt(i);
      var rest = code.slice(i);

      // 行注释
      if (spec.line && rest.indexOf(spec.line) === 0) {
        var e1 = code.indexOf('\n', i);
        if (e1 === -1) e1 = n;
        out += span('c', code.slice(i, e1));
        i = e1; lastKeyword = ''; continue;
      }
      // 块注释
      if (spec.block && rest.indexOf(spec.block[0]) === 0) {
        var e2 = code.indexOf(spec.block[1], i + spec.block[0].length);
        e2 = e2 === -1 ? n : e2 + spec.block[1].length;
        out += span('c', code.slice(i, e2));
        i = e2; lastKeyword = ''; continue;
      }
      // 预处理指令（#include 之类，仅当 # 是行首第一个非空白字符）
      if (spec.preproc && c === spec.preproc) {
        var lineStart = code.lastIndexOf('\n', i - 1) + 1;
        if (/^[ \t]*$/.test(code.slice(lineStart, i))) {
          var e3 = code.indexOf('\n', i);
          if (e3 === -1) e3 = n;
          out += span('meta', code.slice(i, e3));
          i = e3; lastKeyword = ''; continue;
        }
      }
      // 字符串
      if (spec.strings.indexOf(c) !== -1) {
        var j = i + 1;
        while (j < n) {
          var cj = code.charAt(j);
          if (cj === '\\') { j += 2; continue; }
          if (cj === c) { j++; break; }
          if (cj === '\n' && c !== '`') break;
          j++;
        }
        out += span('s', code.slice(i, j));
        i = j; lastKeyword = ''; continue;
      }
      // 数字
      if (/[0-9]/.test(c) && (i === 0 || !/[\w$]/.test(code.charAt(i - 1)))) {
        var mn = /^(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|[0-9][0-9_]*(?:\.[0-9_]*)?(?:[eE][+-]?[0-9]+)?)/.exec(rest);
        if (mn) { out += span('n', mn[0]); i += mn[0].length; lastKeyword = ''; continue; }
      }
      // 标识符 / 关键字
      if (/[A-Za-z_$\u4e00-\u9fff]/.test(c)) {
        var mw = /^[A-Za-z_$\u4e00-\u9fff][\w$\u4e00-\u9fff]*/.exec(rest);
        var word = mw[0];
        var after = code.charAt(i + word.length);
        var cls;
        if (KW[word]) cls = 'k';
        else if (TY[word]) cls = 't';
        else if (lastKeyword === 'function' || lastKeyword === 'def' || lastKeyword === 'func' || lastKeyword === 'fn') cls = 'f';
        else if (TY[word.charAt(0).toUpperCase() + word.slice(1)]) cls = 't';
        else if (BI[word]) cls = 'b';
        else if (after === '(') cls = 'f';
        else if (code.charAt(i - 1) === '.') cls = 'p';
        else cls = 'v';
        out += span(cls, word);
        lastKeyword = KW[word] ? word : '';
        i += word.length;
        continue;
      }
      // 其他字符
      out += esc(c);
      i += 1;
      if (!/\s/.test(c)) lastKeyword = '';
    }
    return out;
  }

  /* ============================================================
   * 二、Markdown → HTML
   * ============================================================ */

  var PH_C = '\u0000C';   // 代码块占位
  var PH_I = '\u0000I';   // 行内代码占位
  var PH_END = '\u0000';

  function slugify(text) {    return String(text)
      .toLowerCase()
      .replace(/<[^>]+>/g, '')
      .replace(/[\s\u3000]+/g, '-')
      .replace(/[^\w\u4e00-\u9fff-]/g, '')
      .replace(/-{2,}/g, '-')
      .replace(/^-|-$/g, '') || 'section';
  }

  /**
   * 抽出行内代码，支持 CommonMark 的反引号规则：
   * `code`、`` code with ` inside ``、以及 \` 转义。
   * 必须在 HTML 转义之前调用，这样代码里的 < > 会被原样保留。
   */
  function extractInlineCode(text, store) {
    var out = '';
    var i = 0;
    var n = text.length;

    while (i < n) {
      var c = text.charAt(i);

      // \` 转义成字面量反引号
      if (c === '\\' && text.charAt(i + 1) === '`') { out += '`'; i += 2; continue; }

      if (c === '`') {
        var run = 0;
        while (text.charAt(i + run) === '`') run++;

        // 找长度完全相同的收尾反引号串
        var close = -1;
        var j = i + run;
        while (j < n) {
          if (text.charAt(j) === '`') {
            var r2 = 0;
            while (text.charAt(j + r2) === '`') r2++;
            if (r2 === run) { close = j; break; }
            j += r2;
          } else {
            j++;
          }
        }

        if (close !== -1) {
          var code = text.slice(i + run, close).replace(/\n/g, ' ');
          // 首尾各有一个空格时按规范去掉（这样才能写出包含反引号的代码）
          if (code.length > 2 && code.charAt(0) === ' ' && code.charAt(code.length - 1) === ' ') {
            code = code.slice(1, -1);
          }
          var id = store.length;
          store.push(code);
          out += PH_I + id + PH_END;
          i = close + run;
          continue;
        }
      }

      out += c;
      i++;
    }
    return out;
  }

  function render(src, options) {
    options = options || {};
    var toc = [];
    var codes = [];
    var inlines = [];
    var usedIds = Object.create(null);

    var text = String(src == null ? '' : src).replace(/\r\n?/g, '\n').replace(/^\uFEFF/, '');
    var lines = text.split('\n');

    /* --- 1. 抽出围栏代码块 --- */
    var pre = [];
    for (var i = 0; i < lines.length; i++) {
      var m = /^ {0,3}(`{3,}|~{3,})[ \t]*([^\s`]*)[ \t]*$/.exec(lines[i]);
      if (m) {
        var fenceChar = m[1].charAt(0);
        var fenceLen = m[1].length;
        var body = [];
        i++;
        var closeRe = new RegExp('^ {0,3}' + (fenceChar === '~' ? '~' : '`') + '{' + fenceLen + ',}[ \\t]*$');
        while (i < lines.length && !closeRe.test(lines[i])) { body.push(lines[i]); i++; }
        var id = codes.length;
        codes.push({ lang: m[2] || '', code: body.join('\n') });
        pre.push(PH_C + id + PH_END);
        continue;
      }
      pre.push(lines[i]);
    }

    /* --- 2. 抽出行内代码（在转义之前，保留原文） --- */
    var joined = extractInlineCode(pre.join('\n'), inlines);

    /* --- 3. 转义 HTML，防止文章里写 <script> 被真的执行 --- */
    var safe = esc(joined);

    /* --- 4. 行内元素 --- */
    function inline(str) {
      var s = str;
      s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, function (_, alt, url, title) {
        return '<img src="' + url + '" alt="' + alt + '"' + (title ? ' title="' + title + '"' : '') + ' loading="lazy">';
      });
      s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, function (_, label, url, title) {
        var external = /^https?:\/\//i.test(url);
        return '<a href="' + url + '"' + (title ? ' title="' + title + '"' : '') +
          (external ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + label + '</a>';
      });
      s = s.replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, function (_, url) {
        return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';
      });
      s = s.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\b__([^_]+)__\b/g, '<strong>$1</strong>');
      s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
      s = s.replace(/(^|[^\w])_([^_\n]+)_(?![\w])/g, '$1<em>$2</em>');
      s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
      s = s.replace(/==([^=]+)==/g, '<mark>$1</mark>');
      s = s.replace(/ {2,}\n/g, '<br>\n');
      return s;
    }

    function stripInline(str) {
      return str.replace(/[`*_~=]/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').trim();
    }

    /* --- 5. 块级解析 --- */
    var BLOCK_START = /^ {0,3}(#{1,6}\s|&gt;|([-*+]|\d+[.)])\s|(`{3,}|~{3,})|([-*_])(\s*\5){2,}\s*$)/;

    function renderBlocks(block) {
      var out = [];
      var idx = 0;

      while (idx < block.length) {
        var line = block[idx];

        if (!line.trim()) { idx++; continue; }

        // 代码块占位
        if (/^\u0000C\d+\u0000$/.test(line.trim())) { out.push(line.trim()); idx++; continue; }

        // 标题
        var hm = /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
        if (hm) {
          var level = hm[1].length;
          var raw = hm[2];
          var id = slugify(stripInline(raw));
          while (usedIds[id]) id = id + '-1';
          usedIds[id] = true;
          if (level === 2 || level === 3) toc.push({ level: level, text: stripInline(raw), id: id });
          out.push('<h' + level + ' id="' + id + '">' + inline(raw) + '</h' + level + '>');
          idx++;
          continue;
        }

        // 分隔线
        if (/^ {0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push('<hr>'); idx++; continue; }

        // 引用（此时源码里的 > 已经被转义成 &gt;）
        if (/^ {0,3}&gt;/.test(line)) {
          var quote = [];
          while (idx < block.length && /^ {0,3}&gt;/.test(block[idx])) {
            quote.push(block[idx].replace(/^ {0,3}&gt;[ \t]?/, ''));
            idx++;
          }
          out.push('<blockquote>' + renderBlocks(quote) + '</blockquote>');
          continue;
        }

        // 表格
        if (line.indexOf('|') !== -1 && idx + 1 < block.length &&
            /^ {0,3}\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(block[idx + 1]) && block[idx + 1].indexOf('-') !== -1) {
          var splitRow = function (row) {
            return row.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(function (c) { return c.trim(); });
          };
          var head = splitRow(line);
          var aligns = splitRow(block[idx + 1]).map(function (c) {
            if (/^:-+:$/.test(c)) return 'center';
            if (/^:-+/.test(c)) return 'left';
            if (/-+:$/.test(c)) return 'right';
            return '';
          });
          idx += 2;
          var rows = [];
          while (idx < block.length && block[idx].indexOf('|') !== -1 && block[idx].trim()) { rows.push(splitRow(block[idx])); idx++; }
          var t = '<div class="md-table-wrap"><table><thead><tr>';
          head.forEach(function (c, k) { t += '<th' + (aligns[k] ? ' style="text-align:' + aligns[k] + '"' : '') + '>' + inline(c) + '</th>'; });
          t += '</tr></thead><tbody>';
          rows.forEach(function (r) {
            t += '<tr>';
            for (var k = 0; k < head.length; k++) t += '<td' + (aligns[k] ? ' style="text-align:' + aligns[k] + '"' : '') + '>' + inline(r[k] == null ? '' : r[k]) + '</td>';
            t += '</tr>';
          });
          t += '</tbody></table></div>';
          out.push(t);
          continue;
        }

        // 列表（含嵌套、任务清单）
        var lm = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(line);
        if (lm) {
          var items = [];
          var ordered = /\d/.test(lm[2]);
          while (idx < block.length) {
            var cur = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(block[idx]);
            if (cur && cur[1].length <= lm[1].length + 1) {
              items.push({ lines: [cur[3]], indent: cur[1].length });
              idx++;
              continue;
            }
            if (block[idx].trim() && items.length && /^\s+/.test(block[idx]) && !/^\s*$/.test(block[idx])) {
              items[items.length - 1].lines.push(block[idx].replace(/^\s{1,4}/, ''));
              idx++;
              continue;
            }
            if (!block[idx].trim() && items.length) {
              // 空行后若仍属于列表则继续，否则结束
              var peek = idx + 1;
              while (peek < block.length && !block[peek].trim()) peek++;
              if (peek < block.length && /^\s*([-*+]|\d+[.)])\s+/.test(block[peek]) && block[peek].match(/^(\s*)/)[1].length > lm[1].length) { idx = peek; continue; }
              break;
            }
            break;
          }
          var lt = ordered ? '<ol>' : '<ul>';
          items.forEach(function (it) {
            var content = it.lines.join('\n');
            var task = /^\[([ xX])\]\s+([\s\S]*)$/.exec(content);
            if (task) {
              lt += '<li class="md-task"><input type="checkbox" disabled' + (/[xX]/.test(task[1]) ? ' checked' : '') + '><span>' + inline(task[2]) + '</span></li>';
            } else {
              var inner = renderBlocks(content.split('\n'));
              // 列表项的第一段不再用 <p> 包起来，避免列表看起来「松垮」
              inner = inner.replace(/^<p>([\s\S]*?)<\/p>/, '$1');
              lt += '<li>' + inner + '</li>';
            }
          });
          out.push(lt + (ordered ? '</ol>' : '</ul>'));
          continue;
        }

        // 段落
        var para = [line];
        idx++;
        while (idx < block.length && block[idx].trim() && !BLOCK_START.test(block[idx]) && !/^\u0000C\d+\u0000$/.test(block[idx].trim())) {
          para.push(block[idx]);
          idx++;
        }
        out.push('<p>' + inline(para.join('\n')) + '</p>');
      }
      return out.join('\n');
    }

    var html = renderBlocks(safe.split('\n'));

    /* --- 6. 还原占位符 --- */
    html = html.replace(/\u0000I(\d+)\u0000/g, function (_, id) {
      return '<code class="md-inline-code">' + esc(inlines[+id]) + '</code>';
    });

    html = html.replace(/\u0000C(\d+)\u0000/g, function (_, id) {
      var item = codes[+id] || { lang: '', code: '' };
      var code = item.code.replace(/\n+$/, '');
      var langLabel = esc(item.lang || 'text');
      return '<div class="md-code">' +
        '<div class="md-code-bar"><span class="md-code-lang">' + langLabel + '</span>' +
        '<button type="button" class="md-copy" data-copy>复制</button></div>' +
        '<pre class="md-pre" data-lang="' + langLabel + '"><code class="language-' + langLabel + '">' +
        highlight(code, item.lang) + '</code></pre></div>';
    });

    // 段落里残留的换行（<p> 内的单个 \n 无意义，换成空格以免影响中文排版）
    html = html.replace(/<p>([\s\S]*?)<\/p>/g, function (_, inner) {
      return '<p>' + inner.replace(/(?<!<br>)\n/g, ' ') + '</p>';
    });

    return { html: html, toc: toc };
  }

  /** 去掉 Markdown 标记，用于搜索索引与摘要 */
  function plainText(md) {
    return String(md == null ? '' : md)
      .replace(/\r\n?/g, '\n')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`([^`]*)`/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/^\s{0,3}#{1,6}\s+/gm, '')
      .replace(/^\s{0,3}>\s?/gm, '')
      .replace(/^\s{0,3}([-*+]|\d+[.)])\s+/gm, '')
      .replace(/^\s*\|.*\|\s*$/gm, ' ')
      .replace(/[*_~=`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return { render: render, highlight: highlight, plainText: plainText, escapeHtml: esc, slugify: slugify };
});
