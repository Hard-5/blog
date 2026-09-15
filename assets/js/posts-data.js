/* 本文件由 tools/build.mjs 自动生成，请勿手动修改。 */
/* eslint-disable */
window.SITE = {
  "title": "Blooming Peaches",
  "subtitle": "记录一个大一新生的编程学习过程",
  "description": "计算机专业学习笔记：C / Python / 数据结构与算法 / 工程工具链。写给自己，也写给后来的人。",
  "author": "Blooming Peaches",
  "lang": "zh-CN",
  "url": "https://hard-5.github.io/blog/",
  "repo": "Hard-5/blog",
  "avatar": "",
  "footer": "用 Markdown 写作 · 零依赖静态博客",
  "nav": [
    {
      "label": "首页",
      "href": "#/"
    },
    {
      "label": "归档",
      "href": "#/archive"
    },
    {
      "label": "标签",
      "href": "#/tags"
    },
    {
      "label": "关于",
      "href": "#/about"
    }
  ],
  "links": [
    {
      "label": "GitHub",
      "href": "https://github.com/Hard-5"
    }
  ]
};
window.BLOG_POSTS = [
  {
    "slug": "hello-blog",
    "title": "写在这个博客开始的地方",
    "date": "2026-09-15",
    "updated": "",
    "dateText": "2026 年 9 月 15 日",
    "tags": [
      "随笔",
      "元"
    ],
    "summary": "为什么大一要开始写技术博客，以及这个博客怎么用、怎么写、怎么发出去。",
    "cover": "",
    "draft": false,
    "readingTime": 2,
    "words": 677,
    "html": "<p>很多人建议「大学一定要写博客」，但理由往往说不清楚。我的理由有三条，都很具体：</p>\n<ol><li><strong>写不出来 = 没真的懂。</strong> 看视频、抄代码时大脑会产生「我会了」的错觉，一旦要求用中文把原理讲清楚，漏洞立刻暴露。</li><li><strong>这是可以带走的复利资产。</strong> 成绩单只能证明你上过课，笔记和项目能证明你做过什么。两年后简历上的「熟悉 C 语言」远不如一篇讲清楚指针的文章有说服力。</li><li><strong>找一个能坚持下去的节奏。</strong> 每周一篇，写什么不重要，重要的是「每周都要有一点新东西值得写」这个倒逼机制。</li></ol>\n<h2 id=\"这个博客长什么样\">这个博客长什么样</h2>\n<p>它是一套<strong>零依赖的静态博客</strong>：没有 npm 依赖，没有构建框架，没有数据库，没有服务器。整个网站就是几个 HTML / CSS / JS 文件加一堆 Markdown。</p>\n<p>这样选的代价和收益都很清楚：</p>\n<div class=\"md-table-wrap\"><table><thead><tr><th>维度</th><th>这套方案</th><th>主流框架（Next.js / Hexo 等）</th></tr></thead><tbody><tr><td>上手成本</td><td>双击 <code class=\"md-inline-code\">index.html</code> 就能看</td><td>需要装依赖、跑构建</td></tr><tr><td>依赖</td><td>无</td><td>几百个 npm 包</td></tr><tr><td>可控性</td><td>每一行代码都是自己写的，能读懂</td><td>出问题要翻框架文档</td></tr><tr><td>功能</td><td>够用（列表、标签、搜索、目录、深浅色）</td><td>插件生态丰富</td></tr></tbody></table></div>\n<p>对一个刚入门的人来说，<strong>能读懂全部代码</strong>比功能多更重要——它本身就是一份可以拆开研究的前端教材。</p>\n<h2 id=\"日常写作流程\">日常写作流程</h2>\n<p>只有三步：</p>\n<div class=\"md-code\"><div class=\"md-code-bar\"><span class=\"md-code-lang\">bash</span><button type=\"button\" class=\"md-copy\" data-copy>复制</button></div><pre class=\"md-pre\" data-lang=\"bash\"><code class=\"language-bash\"><span class=\"tok tok-c\"># 1. 新建一篇文章（自动生成模板 + 重建数据）</span>\n<span class=\"tok tok-b\">npm</span> <span class=\"tok tok-v\">run</span> <span class=\"tok tok-v\">new</span> <span class=\"tok tok-s\">&quot;指针与内存入门&quot;</span> <span class=\"tok tok-v\">pointers</span>-<span class=\"tok tok-v\">and</span>-<span class=\"tok tok-v\">memory</span>\n\n<span class=\"tok tok-c\"># 2. 用任何编辑器打开 posts/pointers-and-memory.md 写正文</span>\n\n<span class=\"tok tok-c\"># 3. 重新生成网站数据，然后刷新浏览器</span>\n<span class=\"tok tok-b\">npm</span> <span class=\"tok tok-v\">run</span> <span class=\"tok tok-v\">build</span></code></pre></div>\n<p>如果你不想记命令，直接手动在 <code class=\"md-inline-code\">posts/</code> 目录下新建一个 <code class=\"md-inline-code\">.md</code> 文件，然后再跑一次 <code class=\"md-inline-code\">npm run build</code> 也一样。</p>\n<p>想本地预览（地址更像正式站点，手机也能连）：</p>\n<div class=\"md-code\"><div class=\"md-code-bar\"><span class=\"md-code-lang\">bash</span><button type=\"button\" class=\"md-copy\" data-copy>复制</button></div><pre class=\"md-pre\" data-lang=\"bash\"><code class=\"language-bash\"><span class=\"tok tok-b\">npm</span> <span class=\"tok tok-v\">run</span> <span class=\"tok tok-v\">serve</span>\n<span class=\"tok tok-c\"># 打开 http://localhost:5173</span></code></pre></div>\n<h2 id=\"文章文件的结构\">文章文件的结构</h2>\n<p>每篇文章开头有一段 frontmatter，用三个短横线包起来：</p>\n<div class=\"md-code\"><div class=\"md-code-bar\"><span class=\"md-code-lang\">markdown</span><button type=\"button\" class=\"md-copy\" data-copy>复制</button></div><pre class=\"md-pre\" data-lang=\"markdown\"><code class=\"language-markdown\">---\ntitle: 指针与内存入门\ndate: 2026-09-20\ntags: [C语言, 基础]\nsummary: 一句话摘要，会显示在首页列表里。\ndraft: false\n---\n\n正文从这里开始……</code></pre></div>\n<ul><li><code class=\"md-inline-code\">draft: true</code> 的文章不会出现在网站上，适合写一半先放着</li><li><code class=\"md-inline-code\">tags</code> 支持 <code class=\"md-inline-code\">[a, b]</code> 或 <code class=\"md-inline-code\">a, b</code> 两种写法</li><li>不写 <code class=\"md-inline-code\">date</code> 就按文件名或当天日期算</li></ul>\n<h2 id=\"目录结构\">目录结构</h2>\n<div class=\"md-code\"><div class=\"md-code-bar\"><span class=\"md-code-lang\">text</span><button type=\"button\" class=\"md-copy\" data-copy>复制</button></div><pre class=\"md-pre\" data-lang=\"text\"><code class=\"language-text\">blog/\n├── index.html              # 唯一入口，所有页面都在这里渲染\n├── site.json               # 站点名称、简介、导航、社交链接\n├── package.json            # 只是给命令起别名，没有依赖\n├── posts/                  # 文章（Markdown）\n├── pages/about.md          # 「关于」页面\n├── assets/\n│   ├── css/style.css       # 全部样式，深浅色双主题\n│   └── js/\n│       ├── markdown.js     # Markdown 渲染器 + 代码高亮（自己写的）\n│       ├── app.js          # 路由、搜索、标签、目录\n│       └── posts-data.js   # 构建产物：文章数据\n└── tools/\n    ├── build.mjs           # Markdown → posts-data.js\n    ├── new-post.mjs        # 新建文章\n    └── serve.mjs           # 本地预览服务器</code></pre></div>\n<h2 id=\"写博客的两个心态提醒\">写博客的两个心态提醒</h2>\n<blockquote><p>不要等「学明白了」再写。博客记录的是<strong>学习过程</strong>，不是教材。写错了很正常，读者（主要是未来的自己）需要看到的是你怎么想的。</p></blockquote>\n<p>还有一点：<strong>别为了写完而写</strong>。写不出来的时候就承认自己还没搞懂，去把代码再敲一遍——写不出来本身就是最有价值的信息。</p>\n<p>下一篇见。</p>",
    "toc": [
      {
        "level": 2,
        "text": "这个博客长什么样",
        "id": "这个博客长什么样"
      },
      {
        "level": 2,
        "text": "日常写作流程",
        "id": "日常写作流程"
      },
      {
        "level": 2,
        "text": "文章文件的结构",
        "id": "文章文件的结构"
      },
      {
        "level": 2,
        "text": "目录结构",
        "id": "目录结构"
      },
      {
        "level": 2,
        "text": "写博客的两个心态提醒",
        "id": "写博客的两个心态提醒"
      }
    ],
    "text": "很多人建议「大学一定要写博客」，但理由往往说不清楚。我的理由有三条，都很具体： 写不出来 没真的懂。 看视频、抄代码时大脑会产生「我会了」的错觉，一旦要求用中文把原理讲清楚，漏洞立刻暴露。 这是可以带走的复利资产。 成绩单只能证明你上过课，笔记和项目能证明你做过什么。两年后简历上的「熟悉 C 语言」远不如一篇讲清楚指针的文章有说服力。 找一个能坚持下去的节奏。 每周一篇，写什么不重要，重要的是「每周都要有一点新东西值得写」这个倒逼机制。 这个博客长什么样 它是一套零依赖的静态博客：没有 npm 依赖，没有构建框架，没有数据库，没有服务器。整个网站就是几个 HTML / CSS / JS 文件加一堆 Markdown。 这样选的代价和收益都很清楚： 对一个刚入门的人来说，能读懂全部代码比功能多更重要——它本身就是一份可以拆开研究的前端教材。 日常写作流程 只有三步： 如果你不想记命令，直接手动在 posts/ 目录下新建一个 .md 文件，然后再跑一次 npm run build 也一样。 想本地预览（地址更像正式站点，手机也能连）： 文章文件的结构 每篇文章开头有一段 frontmatter，用三个短横线包起来： draft: true 的文章不会出现在网站上，适合写一半先放着 tags 支持 [a, b] 或 a, b 两种写法 不写 date 就按文件名或当天日期算 目录结构 写博客的两个心态提醒 不要等「学明白了」再写。博客记录的是学习过程，不是教材。写错了很正常，读者（主要是未来的自己）需要看到的是你怎么想的。 还有一点：别为了写完而写。写不出来的时候就承认自己还没搞懂，去把代码再敲一遍——写不出来本身就是最有价值的信息。 下一篇见。"
  },
  {
    "slug": "markdown-guide",
    "title": "Markdown 语法速查（本博客支持的全部写法）",
    "date": "2026-09-13",
    "updated": "",
    "dateText": "2026 年 9 月 13 日",
    "tags": [
      "工具",
      "写作"
    ],
    "summary": "一页看完标题、强调、列表、任务清单、表格、引用、代码块、链接图片的写法，顺便验证渲染效果。",
    "cover": "",
    "draft": false,
    "readingTime": 2,
    "words": 780,
    "html": "<p>这篇既是我自己的速查表，也是这个博客渲染器的<strong>验收用例</strong>——下面出现的每一种写法都已经被 <code class=\"md-inline-code\">assets/js/markdown.js</code> 支持。写文章时忘了语法，回来翻这一页就行。</p>\n<h2 id=\"标题\">标题</h2>\n<p><code class=\"md-inline-code\">#</code> 到 <code class=\"md-inline-code\">######</code> 对应六种级别。正文里建议只用 <code class=\"md-inline-code\">##</code> 和 <code class=\"md-inline-code\">###</code>：文章标题已经占据了 <code class=\"md-inline-code\">#</code>，而且只有这两级会被收进右侧目录。</p>\n<div class=\"md-code\"><div class=\"md-code-bar\"><span class=\"md-code-lang\">markdown</span><button type=\"button\" class=\"md-copy\" data-copy>复制</button></div><pre class=\"md-pre\" data-lang=\"markdown\"><code class=\"language-markdown\">## 二级标题\n### 三级标题</code></pre></div>\n<h2 id=\"强调与行内元素\">强调与行内元素</h2>\n<div class=\"md-table-wrap\"><table><thead><tr><th>写法</th><th>效果</th><th>用途</th></tr></thead><tbody><tr><td><code class=\"md-inline-code\">**粗体**</code></td><td><strong>粗体</strong></td><td>关键结论</td></tr><tr><td><code class=\"md-inline-code\">*斜体*</code></td><td><em>斜体</em></td><td>术语、强调语气</td></tr><tr><td><code class=\"md-inline-code\">~~删除线~~</code></td><td><del>删除线</del></td><td>记录被推翻的想法</td></tr><tr><td><code class=\"md-inline-code\">==高亮==</code></td><td><mark>高亮</mark></td><td>重点标记</td></tr><tr><td><code class=\"md-inline-code\">`行内代码`</code></td><td><code class=\"md-inline-code\">int *p</code></td><td>变量名、命令、函数名</td></tr></tbody></table></div>\n<p>行内代码写 C 的指针很方便：<code class=\"md-inline-code\">int *p = &amp;a;</code>，也可以写命令 <code class=\"md-inline-code\">npm run build</code>。</p>\n<h2 id=\"列表\">列表</h2>\n<p>无序列表用 <code class=\"md-inline-code\">-</code>、<code class=\"md-inline-code\">*</code>、<code class=\"md-inline-code\">+</code>，有序列表用 <code class=\"md-inline-code\">1.</code>：</p>\n<ul><li>第一项</li><li>第二项\n<ul><li>嵌套一层（缩进两个空格）</li><li>再一项</li></ul></li><li>第三项</li></ul>\n<ol><li>先读题</li><li>想清楚再写</li><li>写完对拍</li></ol>\n<p>任务清单适合做学习进度：</p>\n<ul><li class=\"md-task\"><input type=\"checkbox\" disabled checked><span>装好编译器和编辑器</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled checked><span>学会 Git 的 add / commit / push</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>手写完 8 个数据结构</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>力扣刷满 150 题</span></li></ul>\n<h2 id=\"引用\">引用</h2>\n<blockquote><p>程序必须首先是给人读的，只是顺便能在机器上运行。</p>\n<blockquote><p>引用还可以嵌套，用来区分「我引用的观点」和「我引用的观点里再引用的观点」。</p></blockquote></blockquote>\n<h2 id=\"代码块\">代码块</h2>\n<p>用三个反引号包裹，并在开头写上语言名。语言名会被显示在代码块左上角，代码会自动高亮，右上角的「复制」按钮可以直接复制全文。</p>\n<p>Python：</p>\n<div class=\"md-code\"><div class=\"md-code-bar\"><span class=\"md-code-lang\">python</span><button type=\"button\" class=\"md-copy\" data-copy>复制</button></div><pre class=\"md-pre\" data-lang=\"python\"><code class=\"language-python\"><span class=\"tok tok-k\">def</span> <span class=\"tok tok-f\">binary_search</span>(<span class=\"tok tok-v\">nums</span>: <span class=\"tok tok-t\">list</span>[<span class=\"tok tok-t\">int</span>], <span class=\"tok tok-v\">target</span>: <span class=\"tok tok-t\">int</span>) -&gt; <span class=\"tok tok-t\">int</span>:\n    <span class=\"tok tok-s\">&quot;&quot;</span><span class=\"tok tok-s\">&quot;返回 target 的下标，找不到返回 -1（数组必须有序）&quot;</span><span class=\"tok tok-s\">&quot;&quot;</span>\n    <span class=\"tok tok-v\">lo</span>, <span class=\"tok tok-v\">hi</span> = <span class=\"tok tok-n\">0</span>, <span class=\"tok tok-b\">len</span>(<span class=\"tok tok-v\">nums</span>) - <span class=\"tok tok-n\">1</span>\n    <span class=\"tok tok-k\">while</span> <span class=\"tok tok-v\">lo</span> &lt;= <span class=\"tok tok-v\">hi</span>:\n        <span class=\"tok tok-v\">mid</span> = (<span class=\"tok tok-v\">lo</span> + <span class=\"tok tok-v\">hi</span>) // <span class=\"tok tok-n\">2</span>\n        <span class=\"tok tok-k\">if</span> <span class=\"tok tok-v\">nums</span>[<span class=\"tok tok-v\">mid</span>] == <span class=\"tok tok-v\">target</span>:\n            <span class=\"tok tok-k\">return</span> <span class=\"tok tok-v\">mid</span>\n        <span class=\"tok tok-k\">elif</span> <span class=\"tok tok-v\">nums</span>[<span class=\"tok tok-v\">mid</span>] &lt; <span class=\"tok tok-v\">target</span>:\n            <span class=\"tok tok-v\">lo</span> = <span class=\"tok tok-v\">mid</span> + <span class=\"tok tok-n\">1</span>\n        <span class=\"tok tok-k\">else</span>:\n            <span class=\"tok tok-v\">hi</span> = <span class=\"tok tok-v\">mid</span> - <span class=\"tok tok-n\">1</span>\n    <span class=\"tok tok-k\">return</span> -<span class=\"tok tok-n\">1</span>\n\n\n<span class=\"tok tok-k\">if</span> <span class=\"tok tok-v\">__name__</span> == <span class=\"tok tok-s\">&quot;__main__&quot;</span>:\n    <span class=\"tok tok-b\">print</span>(<span class=\"tok tok-f\">binary_search</span>([<span class=\"tok tok-n\">1</span>, <span class=\"tok tok-n\">3</span>, <span class=\"tok tok-n\">5</span>, <span class=\"tok tok-n\">7</span>, <span class=\"tok tok-n\">9</span>], <span class=\"tok tok-n\">7</span>))  <span class=\"tok tok-c\"># 3</span></code></pre></div>\n<p>C 语言（含预处理指令和指针）：</p>\n<div class=\"md-code\"><div class=\"md-code-bar\"><span class=\"md-code-lang\">c</span><button type=\"button\" class=\"md-copy\" data-copy>复制</button></div><pre class=\"md-pre\" data-lang=\"c\"><code class=\"language-c\"><span class=\"tok tok-meta\">#include &lt;stdio.h&gt;</span>\n<span class=\"tok tok-meta\">#include &lt;stdlib.h&gt;</span>\n\n<span class=\"tok tok-k\">typedef</span> <span class=\"tok tok-k\">struct</span> <span class=\"tok tok-v\">Node</span> {\n    <span class=\"tok tok-t\">int</span> <span class=\"tok tok-v\">value</span>;\n    <span class=\"tok tok-k\">struct</span> <span class=\"tok tok-v\">Node</span> *<span class=\"tok tok-v\">next</span>;\n} <span class=\"tok tok-v\">Node</span>;\n\n<span class=\"tok tok-v\">Node</span> *<span class=\"tok tok-f\">push</span>(<span class=\"tok tok-v\">Node</span> *<span class=\"tok tok-v\">head</span>, <span class=\"tok tok-t\">int</span> <span class=\"tok tok-v\">value</span>) {\n    <span class=\"tok tok-v\">Node</span> *<span class=\"tok tok-v\">node</span> = <span class=\"tok tok-b\">malloc</span>(<span class=\"tok tok-k\">sizeof</span>(<span class=\"tok tok-v\">Node</span>));   <span class=\"tok tok-c\">/* 别忘记检查 malloc 失败 */</span>\n    <span class=\"tok tok-k\">if</span> (<span class=\"tok tok-v\">node</span> == <span class=\"tok tok-k\">NULL</span>) <span class=\"tok tok-k\">return</span> <span class=\"tok tok-v\">head</span>;\n    <span class=\"tok tok-v\">node</span>-&gt;<span class=\"tok tok-v\">value</span> = <span class=\"tok tok-v\">value</span>;\n    <span class=\"tok tok-v\">node</span>-&gt;<span class=\"tok tok-v\">next</span> = <span class=\"tok tok-v\">head</span>;\n    <span class=\"tok tok-k\">return</span> <span class=\"tok tok-v\">node</span>;\n}\n\n<span class=\"tok tok-t\">int</span> <span class=\"tok tok-f\">main</span>(<span class=\"tok tok-t\">void</span>) {\n    <span class=\"tok tok-v\">Node</span> *<span class=\"tok tok-v\">list</span> = <span class=\"tok tok-k\">NULL</span>;\n    <span class=\"tok tok-k\">for</span> (<span class=\"tok tok-t\">int</span> <span class=\"tok tok-v\">i</span> = <span class=\"tok tok-n\">1</span>; <span class=\"tok tok-v\">i</span> &lt;= <span class=\"tok tok-n\">5</span>; <span class=\"tok tok-v\">i</span>++) <span class=\"tok tok-v\">list</span> = <span class=\"tok tok-f\">push</span>(<span class=\"tok tok-v\">list</span>, <span class=\"tok tok-v\">i</span>);\n    <span class=\"tok tok-k\">for</span> (<span class=\"tok tok-v\">Node</span> *<span class=\"tok tok-v\">p</span> = <span class=\"tok tok-v\">list</span>; <span class=\"tok tok-v\">p</span> != <span class=\"tok tok-k\">NULL</span>; <span class=\"tok tok-v\">p</span> = <span class=\"tok tok-v\">p</span>-&gt;<span class=\"tok tok-v\">next</span>) {\n        <span class=\"tok tok-b\">printf</span>(<span class=\"tok tok-s\">&quot;%d &quot;</span>, <span class=\"tok tok-v\">p</span>-&gt;<span class=\"tok tok-v\">value</span>);\n    }\n    <span class=\"tok tok-k\">return</span> <span class=\"tok tok-n\">0</span>;\n}</code></pre></div>\n<p>JavaScript：</p>\n<div class=\"md-code\"><div class=\"md-code-bar\"><span class=\"md-code-lang\">js</span><button type=\"button\" class=\"md-copy\" data-copy>复制</button></div><pre class=\"md-pre\" data-lang=\"js\"><code class=\"language-js\"><span class=\"tok tok-k\">const</span> <span class=\"tok tok-v\">posts</span> = <span class=\"tok tok-k\">await</span> <span class=\"tok tok-b\">fetch</span>(<span class=\"tok tok-s\">&#39;/api/posts&#39;</span>).<span class=\"tok tok-f\">then</span>((<span class=\"tok tok-v\">r</span>) =&gt; <span class=\"tok tok-v\">r</span>.<span class=\"tok tok-f\">json</span>());\n<span class=\"tok tok-k\">const</span> <span class=\"tok tok-v\">recent</span> = <span class=\"tok tok-v\">posts</span>\n  .<span class=\"tok tok-f\">filter</span>((<span class=\"tok tok-v\">p</span>) =&gt; !<span class=\"tok tok-v\">p</span>.<span class=\"tok tok-p\">draft</span>)\n  .<span class=\"tok tok-f\">sort</span>((<span class=\"tok tok-v\">a</span>, <span class=\"tok tok-v\">b</span>) =&gt; <span class=\"tok tok-v\">b</span>.<span class=\"tok tok-t\">date</span>.<span class=\"tok tok-f\">localeCompare</span>(<span class=\"tok tok-v\">a</span>.<span class=\"tok tok-t\">date</span>))\n  .<span class=\"tok tok-f\">slice</span>(<span class=\"tok tok-n\">0</span>, <span class=\"tok tok-n\">5</span>);\n<span class=\"tok tok-b\">console</span>.<span class=\"tok tok-f\">log</span>(<span class=\"tok tok-s\">`最新 ${recent.length} 篇`</span>); <span class=\"tok tok-c\">// 模板字符串</span></code></pre></div>\n<p>SQL 和 Shell：</p>\n<div class=\"md-code\"><div class=\"md-code-bar\"><span class=\"md-code-lang\">sql</span><button type=\"button\" class=\"md-copy\" data-copy>复制</button></div><pre class=\"md-pre\" data-lang=\"sql\"><code class=\"language-sql\"><span class=\"tok tok-v\">SELECT</span> <span class=\"tok tok-v\">tag</span>, <span class=\"tok tok-f\">COUNT</span>(*) <span class=\"tok tok-v\">AS</span> <span class=\"tok tok-v\">n</span>\n<span class=\"tok tok-v\">FROM</span> <span class=\"tok tok-v\">post_tags</span>\n<span class=\"tok tok-v\">WHERE</span> <span class=\"tok tok-v\">created_at</span> &gt;= <span class=\"tok tok-s\">&#39;2026-09-01&#39;</span>\n<span class=\"tok tok-v\">GROUP</span> <span class=\"tok tok-v\">BY</span> <span class=\"tok tok-v\">tag</span>\n<span class=\"tok tok-v\">ORDER</span> <span class=\"tok tok-v\">BY</span> <span class=\"tok tok-v\">n</span> <span class=\"tok tok-v\">DESC</span>\n<span class=\"tok tok-v\">LIMIT</span> <span class=\"tok tok-n\">10</span>;</code></pre></div>\n<div class=\"md-code\"><div class=\"md-code-bar\"><span class=\"md-code-lang\">bash</span><button type=\"button\" class=\"md-copy\" data-copy>复制</button></div><pre class=\"md-pre\" data-lang=\"bash\"><code class=\"language-bash\"><span class=\"tok tok-b\">git</span> <span class=\"tok tok-v\">switch</span> -<span class=\"tok tok-v\">c</span> <span class=\"tok tok-v\">feature</span>/<span class=\"tok tok-v\">blog</span>\n<span class=\"tok tok-b\">git</span> <span class=\"tok tok-v\">add</span> <span class=\"tok tok-v\">posts</span>/<span class=\"tok tok-v\">hello</span>-<span class=\"tok tok-v\">blog</span>.<span class=\"tok tok-p\">md</span>\n<span class=\"tok tok-b\">git</span> <span class=\"tok tok-v\">commit</span> -<span class=\"tok tok-v\">m</span> <span class=\"tok tok-s\">&quot;docs: 新增第一篇博客&quot;</span>\n<span class=\"tok tok-b\">git</span> <span class=\"tok tok-v\">push</span> -<span class=\"tok tok-v\">u</span> <span class=\"tok tok-v\">origin</span> <span class=\"tok tok-v\">feature</span>/<span class=\"tok tok-v\">blog</span></code></pre></div>\n<h2 id=\"表格\">表格</h2>\n<p><code class=\"md-inline-code\">|</code> 分隔单元格，第二行的 <code class=\"md-inline-code\">---</code> 决定对齐方式（<code class=\"md-inline-code\">:---</code> 左对齐、<code class=\"md-inline-code\">:---:</code> 居中、<code class=\"md-inline-code\">---:</code> 右对齐）：</p>\n<div class=\"md-table-wrap\"><table><thead><tr><th style=\"text-align:left\">数据结构</th><th style=\"text-align:right\">平均查找</th><th style=\"text-align:right\">平均插入</th><th style=\"text-align:left\">典型场景</th></tr></thead><tbody><tr><td style=\"text-align:left\">数组</td><td style=\"text-align:right\">O(1)</td><td style=\"text-align:right\">O(n)</td><td style=\"text-align:left\">随机访问</td></tr><tr><td style=\"text-align:left\">链表</td><td style=\"text-align:right\">O(n)</td><td style=\"text-align:right\">O(1)</td><td style=\"text-align:left\">频繁插入删除</td></tr><tr><td style=\"text-align:left\">哈希表</td><td style=\"text-align:right\">O(1)</td><td style=\"text-align:right\">O(1)</td><td style=\"text-align:left\">去重、计数</td></tr><tr><td style=\"text-align:left\">平衡树</td><td style=\"text-align:right\">O(log n)</td><td style=\"text-align:right\">O(log n)</td><td style=\"text-align:left\">有序遍历</td></tr></tbody></table></div>\n<h2 id=\"链接与图片\">链接与图片</h2>\n<ul><li>行内链接：<code class=\"md-inline-code\">[中国大学 MOOC](https://www.icourse163.org/)</code> → <a href=\"https://www.icourse163.org/\" target=\"_blank\" rel=\"noopener noreferrer\">中国大学 MOOC</a></li><li>自动链接：<code class=\"md-inline-code\">&lt;https://leetcode.cn&gt;</code> → <a href=\"https://leetcode.cn\" target=\"_blank\" rel=\"noopener noreferrer\">https://leetcode.cn</a></li><li>图片：<code class=\"md-inline-code\">![图片说明](图片地址)</code>，本地图片建议放在 <code class=\"md-inline-code\">assets/img/</code> 下再引用</li></ul>\n<h2 id=\"分隔线\">分隔线</h2>\n<p>三个或更多的 <code class=\"md-inline-code\">-</code>：</p>\n<hr>\n<h2 id=\"写作时的一点建议\">写作时的一点建议</h2>\n<ol><li><strong>先写结论，再写推导。</strong> 未来的自己只想知道「当初怎么解决的」。</li><li><strong>代码要能跑。</strong> 贴不能运行的伪代码，等于贴了没有价值的笔记。</li><li><strong>保留踩坑过程。</strong> 报错信息、排查思路、最终的解决方式，比正确代码更值钱。</li><li><strong>定期回收。</strong> 学完一个阶段回来重写旧文，比一直写新文章收获更大。</li></ol>",
    "toc": [
      {
        "level": 2,
        "text": "标题",
        "id": "标题"
      },
      {
        "level": 2,
        "text": "强调与行内元素",
        "id": "强调与行内元素"
      },
      {
        "level": 2,
        "text": "列表",
        "id": "列表"
      },
      {
        "level": 2,
        "text": "引用",
        "id": "引用"
      },
      {
        "level": 2,
        "text": "代码块",
        "id": "代码块"
      },
      {
        "level": 2,
        "text": "表格",
        "id": "表格"
      },
      {
        "level": 2,
        "text": "链接与图片",
        "id": "链接与图片"
      },
      {
        "level": 2,
        "text": "分隔线",
        "id": "分隔线"
      },
      {
        "level": 2,
        "text": "写作时的一点建议",
        "id": "写作时的一点建议"
      }
    ],
    "text": "这篇既是我自己的速查表，也是这个博客渲染器的验收用例——下面出现的每一种写法都已经被 assets/js/markdown.js 支持。写文章时忘了语法，回来翻这一页就行。 标题 到 ###### 对应六种级别。正文里建议只用 ## 和 ###：文章标题已经占据了 #，而且只有这两级会被收进右侧目录。 强调与行内元素 行内代码写 C 的指针很方便：int p &a;，也可以写命令 npm run build。 列表 无序列表用 -、、+，有序列表用 1.： 第一项 第二项 嵌套一层（缩进两个空格） 再一项 第三项 先读题 想清楚再写 写完对拍 任务清单适合做学习进度： [x] 装好编译器和编辑器 [x] 学会 Git 的 add / commit / push [ ] 手写完 8 个数据结构 [ ] 力扣刷满 150 题 引用 程序必须首先是给人读的，只是顺便能在机器上运行。 > 引用还可以嵌套，用来区分「我引用的观点」和「我引用的观点里再引用的观点」。 代码块 用三个反引号包裹，并在开头写上语言名。语言名会被显示在代码块左上角，代码会自动高亮，右上角的「复制」按钮可以直接复制全文。 Python： C 语言（含预处理指令和指针）： JavaScript： SQL 和 Shell： 表格 | 分隔单元格，第二行的 --- 决定对齐方式（:--- 左对齐、:---: 居中、---: 右对齐）： 链接与图片 行内链接：中国大学 MOOC → 中国大学 MOOC 自动链接：<https://leetcode.cn> → <https://leetcode.cn> 图片：图片说明，本地图片建议放在 assets/img/ 下再引用 分隔线 三个或更多的 -： --- 写作时的一点建议 先写结论，再写推导。 未来的自己只想知道「当初怎么解决的」。 代码要能跑。 贴不能运行的伪代码，等于贴了没有价值的笔记。 保留踩坑过程。 报错信息、排查思路、最终的解决方式，比正确代码更值钱。 定期回收。 学完一个阶段回来重写旧文，比一直写新文章收获更大。"
  },
  {
    "slug": "freshman-cs-plan",
    "title": "大一编程技术学习计划",
    "date": "2026-09-10",
    "updated": "",
    "dateText": "2026 年 9 月 10 日",
    "tags": [
      "学习计划",
      "方法论"
    ],
    "summary": "把大一拆成 P0~P4 五个阶段：工具链与语言起步、语言成型、数据结构、项目与工程、方向探索，每阶段都有必须拿得出来的交付物。",
    "cover": "",
    "draft": false,
    "readingTime": 7,
    "words": 3555,
    "html": "<blockquote><p>目标：大一结束时，具备「扎实的语言基础 + 数据结构与算法入门 + 2~3 个能讲清楚的项目 + 熟练的工程工具链」，为大二的分方向（后端 / 前端 / AI / 系统 / 安全）留出选择权。</p>\n<p>使用方式：这不是课表，而是<strong>里程碑清单</strong>。每周日晚花 15 分钟对照打勾、记录偏差、调整下周节奏。允许落后，不允许不自知。</p></blockquote>\n<hr>\n<h2 id=\"0-开工前三个必须先定下来的变量\">0. 开工前：三个必须先定下来的变量</h2>\n<div class=\"md-table-wrap\"><table><thead><tr><th>变量</th><th>怎么定</th><th>影响</th></tr></thead><tbody><tr><td><strong>主线语言</strong></td><td>看学校大一的程序设计课教什么。多数是 <strong>C</strong>，部分是 <strong>Python</strong> 或 <strong>C++</strong></td><td>决定第 1 阶段学什么</td></tr><tr><td><strong>每周可支配自学时间</strong></td><td>诚实估计：课程作业之外，稳定能拿出几小时</td><td>决定下面的节奏是「标准版」还是「压缩版」</td></tr><tr><td><strong>目标方向</strong></td><td>大一<strong>不需要</strong>定死，但要选一个「优先体验」的方向</td><td>决定项目选题和刷题平台</td></tr></tbody></table></div>\n<p><strong>时间预算参考（按每周计）</strong></p>\n<ul><li><strong>10 小时/周（稳健版）</strong>：语言 4h + 算法 3h + 项目 3h</li><li><strong>15~20 小时/周（进攻版）</strong>：语言 5h + 算法 6h + 项目 6h + 英语/工具 3h</li><li><strong>&lt; 8 小时/周</strong>：砍掉项目里的「加分项」，只保留语言 + 算法两条主线，别贪多</li></ul>\n<p><strong>两条轨道的差异</strong></p>\n<ul><li><strong>Track A（学校教 C/C++）</strong>：跟课走 C → 指针/内存 → 再补 C++ 的 STL 和类，用 C++ 刷题。<strong>优点</strong>：与考研 408、课程实验、竞赛一致。</li><li><strong>Track B（学校教 Python / 无课可跟）</strong>：Python → 内置数据结构 → 用 Python 刷题入门 → 大一下再补一门系统语言（C 或 Go）。<strong>优点</strong>：上手快，能更早做出项目。</li></ul>\n<blockquote><p>无论哪条轨道，<strong>数据结构与算法</strong>和 <strong>Git</strong> 都是必修，不存在「我的方向用不上」。</p></blockquote>\n<hr>\n<h2 id=\"1-阶段总览\">1. 阶段总览</h2>\n<div class=\"md-table-wrap\"><table><thead><tr><th>阶段</th><th>时间</th><th>主线</th><th>交付物（必须能拿出来）</th></tr></thead><tbody><tr><td>P0 起步</td><td>第 1~3 周</td><td>工具链 + 语言基础起步</td><td>会用 Git 提交代码；本地/在线跑通第一个程序</td></tr><tr><td>P1 语言成型</td><td>第 4~10 周</td><td>语法 → 函数 → 结构体/类 → 调试</td><td>200~400 行的小工具程序 1 个</td></tr><tr><td>P2 数据结构</td><td>第 11~18 周（含期末后）</td><td>线性表 / 栈队列 / 树 / 图 / 排序查找</td><td>手写实现 8~10 个数据结构 + 洛谷/力扣 150 题</td></tr><tr><td>P3 项目与工程</td><td>寒假 + 大一下前 10 周</td><td>后端或前端小项目 + 数据库 + 接口</td><td>1 个可部署、有 README 的完整项目</td></tr><tr><td>P4 方向探索</td><td>大一下第 11~18 周</td><td>选一个方向做深 + 算法进阶</td><td>方向性作品 + 200 题累计 + 简历雏形</td></tr><tr><td>P5 暑假冲刺</td><td>暑假 6~8 周</td><td>集中项目 / 竞赛 / 实习预演</td><td>一个「能写在简历第一行」的成果</td></tr></tbody></table></div>\n<hr>\n<h2 id=\"2-p0起步第-13-周\">2. P0：起步（第 1~3 周）</h2>\n<p><strong>要做的事</strong></p>\n<ul><li class=\"md-task\"><input type=\"checkbox\" disabled><span>装好环境：VS Code（或 VS / PyCharm）、编译器、终端</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>学会<strong>用命令行</strong>：<code class=\"md-inline-code\">cd</code> / <code class=\"md-inline-code\">ls</code> / <code class=\"md-inline-code\">mkdir</code> / <code class=\"md-inline-code\">rm</code> / <code class=\"md-inline-code\">cp</code> / <code class=\"md-inline-code\">mv</code>，能看懂路径</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>学 Git 最小集：<code class=\"md-inline-code\">init</code> / <code class=\"md-inline-code\">add</code> / <code class=\"md-inline-code\">commit</code> / <code class=\"md-inline-code\">log</code> / <code class=\"md-inline-code\">push</code> / <code class=\"md-inline-code\">pull</code> / <code class=\"md-inline-code\">branch</code> / <code class=\"md-inline-code\">merge</code></span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>注册 GitHub / Gitee，建一个 <code class=\"md-inline-code\">hello-world</code> 仓库并推上去</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>学会写最简 Markdown 和 README</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>装好一个算法平台的账号（洛谷 / Codeforces / LeetCode 任选一主战场）</span></li></ul>\n<p><strong>推荐资源（中文优先）</strong></p>\n<ul><li>MIT《Missing Semester》—— 命令行、Git、编辑器的系统扫盲（有中文字幕）</li><li>《Pro Git》中文版（git-scm.com/book/zh/v2）第 1~3 章足够</li><li>B 站任何一个「Git 入门」30 分钟视频</li></ul>\n<p><strong>验收标准</strong>：能不看教程，独立完成「本地改代码 → commit → push 到 GitHub → 在网页上看到变更」。</p>\n<hr>\n<h2 id=\"3-p1语言成型第-410-周\">3. P1：语言成型（第 4~10 周）</h2>\n<p><strong>语法清单（以 C 为例，Python 自行替换）</strong></p>\n<ul><li class=\"md-task\"><input type=\"checkbox\" disabled><span>变量、类型、运算符、输入输出</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>分支与循环（<code class=\"md-inline-code\">if/switch/for/while</code>）</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>函数：参数传递、返回值、递归入门</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>数组与字符串</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>指针（C）/ 引用与切片（Python）—— <strong>这是大一分水岭，务必手动敲例子</strong></span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>结构体 / 类与对象</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>文件读写（<code class=\"md-inline-code\">fopen</code> / <code class=\"md-inline-code\">open</code>）</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>动态内存（<code class=\"md-inline-code\">malloc/free</code>）与内存泄漏的直觉</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>基础调试：断点、单步、看变量、读报错信息</span></li></ul>\n<p><strong>练习方式（关键）</strong></p>\n<ol><li><strong>每天 1 道小语法题</strong>，当天的语法当天用掉。</li><li>每学一章，<strong>合上教程默写一遍</strong>，写不出来就是没学会。</li><li>报错先自己读 30 秒，再搜；搜到答案后<strong>重写一遍</strong>而不是复制粘贴。</li></ol>\n<p><strong>阶段性交付物</strong></p>\n<ul><li class=\"md-task\"><input type=\"checkbox\" disabled><span>一个小工具，任选：命令行计算器 / 通讯录（增删改查 + 文件保存）/ 猜数字游戏 / 学生成绩统计</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>代码推到 GitHub，README 写清「怎么运行」</span></li></ul>\n<p><strong>常见坑</strong></p>\n<ul><li>只看视频不动手 → 一周后归零。<strong>视频时长 : 动手时长 至少 1 : 2</strong>。</li><li>收藏了几十个教程，一个没看完。<strong>选定一个，看完再说</strong>。</li><li>卡在一个 bug 上一整天，效率极低。<strong>30 分钟无进展就提问或换题</strong>。</li></ul>\n<hr>\n<h2 id=\"4-p2数据结构与算法第-1118-周-寒假前段\">4. P2：数据结构与算法（第 11~18 周 + 寒假前段）</h2>\n<p><strong>这是大一最值钱的一段投入。</strong> 它同时决定：课程成绩、竞赛上限、大二找实习的门槛、考研 408 的地基。</p>\n<p><strong>实现清单（每个都要手写一遍，不许只调库）</strong></p>\n<ul><li class=\"md-task\"><input type=\"checkbox\" disabled><span>数组 / 动态数组</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>链表（单链、双链、反转、判环）</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>栈、队列（含用两个栈实现队列）</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>哈希表（理解冲突处理）</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>二叉树（遍历：前中后序 + 层序，递归与迭代都写）</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>二叉搜索树 / 堆与优先队列</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>并查集</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>图（邻接表、DFS、BFS）</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>排序：冒泡/插入/选择 → 归并 → 快排 → 堆排（说清复杂度与稳定性）</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>二分查找（含边界变体）</span></li></ul>\n<p><strong>算法专题顺序（按此顺序，别乱跳）</strong></p>\n<ol><li>复杂度分析（时间/空间，会算）</li><li>双指针、滑动窗口、前缀和</li><li>二分</li><li>递归与回溯（全排列、子集、N 皇后）</li><li>贪心（入门题）</li><li>动态规划（入门：爬楼梯 → 背包 → LIS → 编辑距离）</li><li>图的搜索与最短路（Dijkstra / BFS 最短路）</li></ol>\n<p><strong>刷题节奏</strong></p>\n<ul><li>大一上结束前：<strong>累计 150 题</strong>（简单 : 中等 ≈ 6 : 4，先求量再求质）</li><li>每题记录：<strong>思路一句话 + 踩的坑 + 复杂度</strong>，写在一个 Markdown 里（这就是你最好的复习资料）</li><li>一周做一次「错题重做」，只做上周做错/看了答案的题</li><li>平台建议：<strong>洛谷</strong>练语法与基础题，<strong>LeetCode</strong>练面试风格题，<strong>Codeforces Div.3/4</strong> 练限时手感</li></ul>\n<p><strong>推荐资源</strong></p>\n<ul><li>课程：浙江大学 翁恺《C 语言程序设计》/《数据结构》（中国大学 MOOC）</li><li>书：《大话数据结构》（入门）→ 《算法（第 4 版）》（系统）</li><li>在线：OI Wiki（oi-wiki.org）、Hello 算法（hello-algo.com）</li><li>竞赛向：《算法竞赛入门经典》（刘汝佳）</li></ul>\n<hr>\n<h2 id=\"5-p3项目与工程寒假-大一下前段\">5. P3：项目与工程（寒假 + 大一下前段）</h2>\n<p><strong>目标：做出第一个「别人能跑起来」的东西。</strong></p>\n<p><strong>必备工程技能</strong></p>\n<ul><li class=\"md-task\"><input type=\"checkbox\" disabled><span>Git 分支工作流：<code class=\"md-inline-code\">feature</code> 分支 + PR/Merge</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>读文档的能力（官方文档 &gt; 二手博客）</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>会用 <code class=\"md-inline-code\">debug</code> 而不是 <code class=\"md-inline-code\">print</code> 大法</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>会写 README：项目是什么 / 如何安装 / 如何运行 / 截图</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>基础 Linux：<code class=\"md-inline-code\">ssh</code>、<code class=\"md-inline-code\">vim</code> 或 <code class=\"md-inline-code\">nano</code>、<code class=\"md-inline-code\">chmod</code>、进程查看</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>知道 HTTP 是什么、会用 <code class=\"md-inline-code\">curl</code> / Postman 调接口</span></li></ul>\n<p><strong>项目阶梯（按难度选 1~2 个做透，别做 5 个半成品）</strong></p>\n<div class=\"md-table-wrap\"><table><thead><tr><th>难度</th><th>项目</th><th>练到的东西</th></tr></thead><tbody><tr><td>★</td><td>命令行待办清单 / 记账本（本地文件存储）</td><td>语言基础、文件 IO</td></tr><tr><td>★★</td><td>爬虫 + 数据可视化（豆瓣电影 Top250 → 图表）</td><td>请求、解析、数据处理</td></tr><tr><td>★★</td><td>个人博客（静态站点生成器）</td><td>Markdown、构建、部署到 GitHub Pages</td></tr><tr><td>★★★</td><td>后端 API 服务（如「图书管理」）：数据库 + 增删改查接口 + 简单前端页面</td><td>数据库、接口设计、前后端联调</td></tr><tr><td>★★★★</td><td>带登录鉴权 + 分页搜索 + 部署到云服务器的小系统</td><td>完整工程闭环</td></tr></tbody></table></div>\n<p><strong>技术选型建议（大一下）</strong></p>\n<ul><li>偏后端：<code class=\"md-inline-code\">Python(FastAPI/Django)</code> 或 <code class=\"md-inline-code\">Java(Spring Boot)</code> + <code class=\"md-inline-code\">MySQL</code> + <code class=\"md-inline-code\">Redis</code>（可选）</li><li>偏前端：<code class=\"md-inline-code\">HTML/CSS/JS</code> → <code class=\"md-inline-code\">React</code> 或 <code class=\"md-inline-code\">Vue</code> + 调用公开 API 做页面</li><li>偏 AI/数据：<code class=\"md-inline-code\">Python</code> + <code class=\"md-inline-code\">NumPy/Pandas</code> + 跟一门机器学习入门课（吴恩达）</li></ul>\n<p><strong>验收标准</strong>：把链接发给一个同学，他<strong>不看你的解释</strong>也能跑起来并使用。</p>\n<hr>\n<h2 id=\"6-p4方向探索-算法进阶大一下第-1118-周\">6. P4：方向探索 + 算法进阶（大一下第 11~18 周）</h2>\n<ul><li class=\"md-task\"><input type=\"checkbox\" disabled><span>从「后端 / 前端 / AI / 系统 / 安全 / 嵌入式」中选 <strong>1 个</strong>做 6 周深挖，另 1 个浅尝</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>刷题累计到 <strong>250~300 题</strong>，开始接触中等偏难题、限时模拟赛</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>参加至少 1 次正式比赛（校赛 / 蓝桥杯 / ICPC 校选 / Codeforces Round），<strong>名次不重要，完赛重要</strong></span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>加入一个技术社团或开源项目，学会读别人的代码、提第一个 PR</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>建一份简历初稿（哪怕内容很少），把做过的项目写成 3 条 bullet</span></li></ul>\n<p><strong>判断「要不要换方向」的标准</strong>：做完一个真实小项目后，你是否还愿意主动打开它。愿意 → 继续；不愿意 → 换，成本很低。</p>\n<hr>\n<h2 id=\"7-p5暑假冲刺68-周\">7. P5：暑假冲刺（6~8 周）</h2>\n<p>三选一，<strong>只选一个</strong>：</p>\n<ul><li><strong>A. 项目型</strong>：把 P3 的项目升级成有真实用户/完整功能的版本，部署上线，写技术博客复盘</li><li><strong>B. 竞赛型</strong>：集中刷题 + 参加暑期训练（校队集训/线上营地），目标区域赛/省赛</li><li><strong>C. 实习预演型</strong>：投递大厂「大一/低年级专项」或本地小公司实习；同时按 JD 反推要补的技能</li></ul>\n<p>不管选哪个，暑假结束前完成：</p>\n<ul><li class=\"md-task\"><input type=\"checkbox\" disabled><span>GitHub 上至少有 2 个「有 README、有 commit 历史、不是课程作业」的仓库</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>一篇技术复盘文章（哪怕只发在自己的博客）</span></li><li class=\"md-task\"><input type=\"checkbox\" disabled><span>一份能看的大二上学习计划</span></li></ul>\n<hr>\n<h2 id=\"8-与课程的关系别只顾自学\">8. 与课程的关系（别只顾自学）</h2>\n<div class=\"md-table-wrap\"><table><thead><tr><th>课程</th><th>为什么重要</th><th>建议</th></tr></thead><tbody><tr><td>高等数学</td><td>所有算法的数学语言，考研/保研硬指标</td><td>认真上，别只求 60 分</td></tr><tr><td>线性代数</td><td>机器学习、图形学的地基</td><td>理解矩阵乘法与向量空间，别只背公式</td></tr><tr><td>离散数学</td><td>数据结构与算法的理论底座</td><td>图论部分和算法课高度重合，一举两得</td></tr><tr><td>概率论</td><td>AI / 数据方向必需</td><td>大一下认真学</td></tr><tr><td>英语（四六级）</td><td>读官方文档、看英文课程、查 bug 的第一工具</td><td>大一下尽量过四级，越早越好</td></tr><tr><td>思政/体育等</td><td>影响保研排名与毕业</td><td>别逃课，成本最低的 G2 分</td></tr></tbody></table></div>\n<p><strong>保研/绩点提醒</strong>：如果学校有保研名额，大一的绩点权重很高且<strong>最容易拿</strong>（大二课程难度会上升）。技术自学和绩点不是二选一——<strong>课程内的数据结构、程序设计、数学课本身就是你自学的内容</strong>。</p>\n<hr>\n<h2 id=\"9-每周节奏模板可直接照抄\">9. 每周节奏模板（可直接照抄）</h2>\n<div class=\"md-table-wrap\"><table><thead><tr><th>时段</th><th>内容</th><th>时长</th></tr></thead><tbody><tr><td>周一~周五 每天</td><td>语言/算法练习（看当天状态，1 题起）</td><td>1~1.5h</td></tr><tr><td>周三晚</td><td>项目时间（写代码，不查教程）</td><td>2h</td></tr><tr><td>周六上午</td><td>算法专题学习（看课 + 手写实现）</td><td>2~3h</td></tr><tr><td>周六下午</td><td>项目时间</td><td>2~3h</td></tr><tr><td>周日上午</td><td>错题重做 + 本周笔记整理</td><td>2h</td></tr><tr><td>周日 21:00</td><td><strong>周复盘</strong>：打勾、记录偏差、定下周 3 个重点</td><td>15min</td></tr></tbody></table></div>\n<p><strong>周复盘的三个问题</strong></p>\n<ol><li>上周定的 3 个重点，完成率多少？没完成的原因是「没时间」还是「不想做」？</li><li>这周学的东西，我能不看资料讲给别人听吗？</li><li>下周要砍掉哪件事？（每加一件事，必须砍掉一件事）</li></ol>\n<hr>\n<h2 id=\"10-进度追踪表\">10. 进度追踪表</h2>\n<div class=\"md-table-wrap\"><table><thead><tr><th>检查点</th><th>时间</th><th>达成标准</th><th>完成</th></tr></thead><tbody><tr><td>环境与 Git 就绪</td><td>第 3 周</td><td>能独立 push 到 GitHub</td><td>[ ]</td></tr><tr><td>语言基础通关</td><td>第 10 周</td><td>能独立写出 200 行以上的小工具</td><td>[ ]</td></tr><tr><td>数据结构手写完成</td><td>第 18 周</td><td>8 个结构能手写 + 说清复杂度</td><td>[ ]</td></tr><tr><td>刷题 150 题</td><td>大一上结束</td><td>平台统计可见</td><td>[ ]</td></tr><tr><td>第一个完整项目</td><td>寒假结束</td><td>别人能按 README 跑起来</td><td>[ ]</td></tr><tr><td>方向选定</td><td>大一下第 10 周</td><td>能说出选它的 3 个理由</td><td>[ ]</td></tr><tr><td>刷题 300 题</td><td>大一结束</td><td>能独立做出中等题</td><td>[ ]</td></tr><tr><td>参加 1 次比赛</td><td>大一结束</td><td>完赛即可</td><td>[ ]</td></tr><tr><td>简历初稿</td><td>大一结束</td><td>有 2 个项目可写</td><td>[ ]</td></tr></tbody></table></div>\n<hr>\n<h2 id=\"11-五个最容易踩的坑\">11. 五个最容易踩的坑</h2>\n<ol><li><strong>教程循环</strong>：一直在「准备学习」，从不产出。→ 每学完一章必须有一个可运行的东西。</li><li><strong>只收藏不动手</strong>：GitHub star 1000 个仓库不如自己写 1 个。</li><li><strong>过早追新技术</strong>：大一学微服务、K8s、大模型微调，基础不牢，面试一问就穿。→ 先把语言、算法、数据结构、数据库做扎实。</li><li><strong>一个人硬扛</strong>：卡住 30 分钟就该问。找同学、社团、论坛、AI 助手都可以。</li><li><strong>用熬夜换时间</strong>：大一作息崩掉，大二大三的学习效率会一起崩。<strong>稳定 &gt; 爆发</strong>。</li></ol>\n<hr>\n<h2 id=\"12-一页速查如果只能记住五句话\">12. 一页速查：如果只能记住五句话</h2>\n<ol><li>语言 + 数据结构算法 + Git，是大一无论什么方向都必须拿下的三件套。</li><li>每周固定节奏 + 周日复盘，胜过任何一份完美的日计划。</li><li>视频 : 动手 = 1 : 2，学不会的唯一原因通常是手没动。</li><li>项目的验收标准是「别人能跑起来」，不是「我写完了」。</li><li>绩点和技术两条腿走路，别为了自学牺牲课程。</li></ol>\n<hr>\n<p><em>本文件可直接编辑：把不适用的条目删掉，把时间点改成你学校的实际周历（开学第几周、期末周、寒暑假起止）。计划的价值在于被执行和被修正，不在于写得漂亮。</em></p>",
    "toc": [
      {
        "level": 2,
        "text": "0. 开工前：三个必须先定下来的变量",
        "id": "0-开工前三个必须先定下来的变量"
      },
      {
        "level": 2,
        "text": "1. 阶段总览",
        "id": "1-阶段总览"
      },
      {
        "level": 2,
        "text": "2. P0：起步（第 13 周）",
        "id": "2-p0起步第-13-周"
      },
      {
        "level": 2,
        "text": "3. P1：语言成型（第 410 周）",
        "id": "3-p1语言成型第-410-周"
      },
      {
        "level": 2,
        "text": "4. P2：数据结构与算法（第 1118 周 + 寒假前段）",
        "id": "4-p2数据结构与算法第-1118-周-寒假前段"
      },
      {
        "level": 2,
        "text": "5. P3：项目与工程（寒假 + 大一下前段）",
        "id": "5-p3项目与工程寒假-大一下前段"
      },
      {
        "level": 2,
        "text": "6. P4：方向探索 + 算法进阶（大一下第 1118 周）",
        "id": "6-p4方向探索-算法进阶大一下第-1118-周"
      },
      {
        "level": 2,
        "text": "7. P5：暑假冲刺（68 周）",
        "id": "7-p5暑假冲刺68-周"
      },
      {
        "level": 2,
        "text": "8. 与课程的关系（别只顾自学）",
        "id": "8-与课程的关系别只顾自学"
      },
      {
        "level": 2,
        "text": "9. 每周节奏模板（可直接照抄）",
        "id": "9-每周节奏模板可直接照抄"
      },
      {
        "level": 2,
        "text": "10. 进度追踪表",
        "id": "10-进度追踪表"
      },
      {
        "level": 2,
        "text": "11. 五个最容易踩的坑",
        "id": "11-五个最容易踩的坑"
      },
      {
        "level": 2,
        "text": "12. 一页速查：如果只能记住五句话",
        "id": "12-一页速查如果只能记住五句话"
      }
    ],
    "text": "目标：大一结束时，具备「扎实的语言基础 + 数据结构与算法入门 + 23 个能讲清楚的项目 + 熟练的工程工具链」，为大二的分方向（后端 / 前端 / AI / 系统 / 安全）留出选择权。 使用方式：这不是课表，而是里程碑清单。每周日晚花 15 分钟对照打勾、记录偏差、调整下周节奏。允许落后，不允许不自知。 --- 开工前：三个必须先定下来的变量 时间预算参考（按每周计） 10 小时/周（稳健版）：语言 4h + 算法 3h + 项目 3h 1520 小时/周（进攻版）：语言 5h + 算法 6h + 项目 6h + 英语/工具 3h < 8 小时/周：砍掉项目里的「加分项」，只保留语言 + 算法两条主线，别贪多 两条轨道的差异 Track A（学校教 C/C++）：跟课走 C → 指针/内存 → 再补 C++ 的 STL 和类，用 C++ 刷题。优点：与考研 408、课程实验、竞赛一致。 Track B（学校教 Python / 无课可跟）：Python → 内置数据结构 → 用 Python 刷题入门 → 大一下再补一门系统语言（C 或 Go）。优点：上手快，能更早做出项目。 无论哪条轨道，数据结构与算法和 Git 都是必修，不存在「我的方向用不上」。 --- 阶段总览 --- P0：起步（第 13 周） 要做的事 [ ] 装好环境：VS Code（或 VS / PyCharm）、编译器、终端 [ ] 学会用命令行：cd / ls / mkdir / rm / cp / mv，能看懂路径 [ ] 学 Git 最小集：init / add / commit / log / push / pull / branch / merge [ ] 注册 GitHub / Gitee，建一个 hello-world 仓库并推上去 [ ] 学会写最简 Markdown 和 README [ ] 装好一个算法平台的账号（洛谷 / Codeforces / LeetCode 任选一主战场） 推荐资源（中文优先） MIT《Missing Semester》—— 命令行、Git、编辑器的系统扫盲（有中文字幕） 《Pro Git》中文版（git-scm.com/book/zh/v2）第 13 章足够 B 站任何一个「Git 入门」30 分钟视频 验收标准：能不看教程，独立完成「本地改代码 → commit → push 到 GitHub → 在网页上看到变更」。 --- P1：语言成型（第 410 周） 语法清单（以 C 为例，Python 自行替换） [ ] 变量、类型、运算符、输入输出 [ ] 分支与循环（if/switch/for/while） [ ] 函数：参数传递、返回值、递归入门 [ ] 数组与字符串 [ ] 指针（C）/ 引用与切片（Python）—— 这是大一分水岭，务必手动敲例子 [ ] 结构体 / 类与对象 [ ] 文件读写（fopen / open） [ ] 动态内存（malloc/free）与内存泄漏的直觉 [ ] 基础调试：断点、单步、看变量、读报错信息 练习方式（关键） 每天 1 道小语法题，当天的语法当天用掉。 每学一章，合上教程默写一遍，写不出来就是没学会。 报错先自己读 30 秒，再搜；搜到答案后重写一遍而不是复制粘贴。 阶段性交付物 [ ] 一个小工具，任选：命令行计算器 / 通讯录（增删改查 + 文件保存）/ 猜数字游戏 / 学生成绩统计 [ ] 代码推到 GitHub，README 写清「怎么运行」 常见坑 只看视频不动手 → 一周后归零。视频时长 : 动手时长 至少 1 : 2。 收藏了几十个教程，一个没看完。选定一个，看完再说。 卡在一个 bug 上一整天，效率极低。30 分钟无进展就提问或换题。 --- P2：数据结构与算法（第 1118 周 + 寒假前段） 这是大一最值钱的一段投入。 它同时决定：课程成绩、竞赛上限、大二找实习的门槛、考研 408 的地基。 实现清单（每个都要手写一遍，不许只调库） [ ] 数组 / 动态数组 [ ] 链表（单链、双链、反转、判环） [ ] 栈、队列（含用两个栈实现队列） [ ] 哈希表（理解冲突处理） [ ] 二叉树（遍历：前中后序 + 层序，递归与迭代都写） [ ] 二叉搜索树 / 堆与优先队列 [ ] 并查集 [ ] 图（邻接表、DFS、BFS） [ ] 排序：冒泡/插入/选择 → 归并 → 快排 → 堆排（说清复杂度与稳定性） [ ] 二分查找（含边界变体） 算法专题顺序（按此顺序，别乱跳） 复杂度分析（时间/空间，会算） 双指针、滑动窗口、前缀和 二分 递归与回溯（全排列、子集、N 皇后） 贪心（入门题） 动态规划（入门：爬楼梯 → 背包 → LIS → 编辑距离） 图的搜索与最短路（Dijkstra / BFS 最短路） 刷题节奏 大一上结束前：累计 150 题（简单 : 中等 ≈ 6 : 4，先求量再求质） 每题记录：思路一句话 + 踩的坑 + 复杂度，写在一个 Markdown 里（这就是你最好的复习资料） 一周做一次「错题重做」，只做上周做错/看了答案的题 平台建议：洛谷练语法与基础题，LeetCode练面试风格题，Codeforces Div.3/4 练限时手感 推荐资源 课程：浙江大学 翁恺《C 语言程序设计》/《数据结构》（中国大学 MOOC） 书：《大话数据结构》（入门）→ 《算法（第 4 版）》（系统） 在线：OI Wiki（oi-wiki.org）、Hello 算法（hello-algo.com） 竞赛向：《算法竞赛入门经典》（刘汝佳） --- P3：项目与工程（寒假 + 大一下前段） 目标：做出第一个「别人能跑起来」的东西。 必备工程技能 [ ] Git 分支工作流：feature 分支 + PR/Merge [ ] 读文档的能力（官方文档 > 二手博客） [ ] 会用 debug 而不是 print 大法 [ ] 会写 README：项目是什么 / 如何安装 / 如何运行 / 截图 [ ] 基础 Linux：ssh、vim 或 nano、chmod、进程查看 [ ] 知道 HTTP 是什么、会用 curl / Postman 调接口 项目阶梯（按难度选 12 个做透，别做 5 个半成品） 技术选型建议（大一下） 偏后端：Python(FastAPI/Django) 或 Java(Spring Boot) + MySQL + Redis（可选） 偏前端：HTML/CSS/JS → React 或 Vue + 调用公开 API 做页面 偏 AI/数据：Python + NumPy/Pandas + 跟一门机器学习入门课（吴恩达） 验收标准：把链接发给一个同学，他不看你的解释也能跑起来并使用。 --- P4：方向探索 + 算法进阶（大一下第 1118 周） [ ] 从「后端 / 前端 / AI / 系统 / 安全 / 嵌入式」中选 1 个做 6 周深挖，另 1 个浅尝 [ ] 刷题累计到 250300 题，开始接触中等偏难题、限时模拟赛 [ ] 参加至少 1 次正式比赛（校赛 / 蓝桥杯 / ICPC 校选 / Codeforces Round），名次不重要，完赛重要 [ ] 加入一个技术社团或开源项目，学会读别人的代码、提第一个 PR [ ] 建一份简历初稿（哪怕内容很少），把做过的项目写成 3 条 bullet 判断「要不要换方向」的标准：做完一个真实小项目后，你是否还愿意主动打开它。愿意 → 继续；不愿意 → 换，成本很低。 --- P5：暑假冲刺（68 周） 三选一，只选一个： A. 项目型：把 P3 的项目升级成有真实用户/完整功能的版本，部署上线，写技术博客复盘 B. 竞赛型：集中刷题 + 参加暑期训练（校队集训/线上营地），目标区域赛/省赛 C. 实习预演型：投递大厂「大一/低年级专项」或本地小公司实习；同时按 JD 反推要补的技能 不管选哪个，暑假结束前完成： [ ] GitHub 上至少有 2 个「有 README、有 commit 历史、不是课程作业」的仓库 [ ] 一篇技术复盘文章（哪怕只发在自己的博客） [ ] 一份能看的大二上学习计划 --- 与课程的关系（别只顾自学） 保研/绩点提醒：如果学校有保研名额，大一的绩点权重很高且最容易拿（大二课程难度会上升）。技术自学和绩点不是二选一——课程内的数据结构、程序设计、数学课本身就是你自学的内容。 --- 每周节奏模板（可直接照抄） 周复盘的三个问题 上周定的 3 个重点，完成率多少？没完成的原因是「没时间」还是「不想做」？ 这周学的东西，我能不看资料讲给别人听吗？ 下周要砍掉哪件事？（每加一件事，必须砍掉一件事） --- 进度追踪表 --- 五个最容易踩的坑 教程循环：一直在「准备学习」，从不产出。→ 每学完一章必须有一个可运行的东西。 只收藏不动手：GitHub star 1000 个仓库不如自己写 1 个。 过早追新技术：大一学微服务、K8s、大模型微调，基础不牢，面试一问就穿。→ 先把语言、算法、数据结构、数据库做扎实。 一个人硬扛：卡住 30 分钟就该问。找同学、社团、论坛、AI 助手都可以。 用熬夜换时间：大一作息崩掉，大二大三的学习效率会一起崩。稳定 > 爆发。 --- 一页速查：如果只能记住五句话 语言 + 数据结构算法 + Git，是大一无论什么方向都必须拿下的三件套。 每周固定节奏 + 周日复盘，胜过任何一份完美的日计划。 视频 : 动手 1 : 2，学不会的唯一原因通常是"
  }
];
window.BLOG_PAGES = {
  "about": {
    "title": "关于我",
    "html": "<p>你好，我是 <strong>Blooming Peaches</strong>，计算机相关专业大一学生。</p>\n<p>这个博客用来存放我的学习笔记：语言基础、数据结构与算法、工程工具链，以及踩过的坑。写作原则是<strong>只写自己真的动手验证过的东西</strong>——代码跑过、报错复现过、结论能落到具体场景，才会写出来。</p>\n<h2 id=\"现在在做什么\">现在在做什么</h2>\n<ul><li>主线：把 C 语言的指针和内存模型彻底搞明白，同时用 Python 刷题保持手感</li><li>算法：系统过一遍数据结构，目标是大一结束前手写完 8~10 个结构</li><li>工程：熟悉 Git、命令行、调试器，学会把一个项目完整地部署出去</li></ul>\n<h2 id=\"关于这个博客\">关于这个博客</h2>\n<ul><li>内容是 Markdown 写的，站点是零依赖的静态页面，源码结构简单到可以随时拆开改</li><li>没有评论区和统计脚本，所有内容都在你自己浏览器里渲染</li><li>如果某篇文章有错误，欢迎直接告诉我，我会改并保留修改记录</li></ul>\n<h2 id=\"联系\">联系</h2>\n<ul><li>GitHub：<a href=\"https://github.com/Hard-5\" target=\"_blank\" rel=\"noopener noreferrer\">https://github.com/Hard-5</a></li></ul>\n<blockquote><p>如果你也在自学编程，欢迎交流。这个阶段最稀缺的不是资料，而是「有人告诉你下一步该学什么」。</p></blockquote>",
    "toc": [
      {
        "level": 2,
        "text": "现在在做什么",
        "id": "现在在做什么"
      },
      {
        "level": 2,
        "text": "关于这个博客",
        "id": "关于这个博客"
      },
      {
        "level": 2,
        "text": "联系",
        "id": "联系"
      }
    ]
  }
};
window.BLOG_BUILT_AT = "2026-09-15T15:06:05.046Z";
