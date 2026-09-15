---
title: Markdown 语法速查（本博客支持的全部写法）
date: 2026-09-13
tags: [工具, 写作]
summary: 一页看完标题、强调、列表、任务清单、表格、引用、代码块、链接图片的写法，顺便验证渲染效果。
---

这篇既是我自己的速查表，也是这个博客渲染器的**验收用例**——下面出现的每一种写法都已经被 `assets/js/markdown.js` 支持。写文章时忘了语法，回来翻这一页就行。

## 标题

`#` 到 `######` 对应六种级别。正文里建议只用 `##` 和 `###`：文章标题已经占据了 `#`，而且只有这两级会被收进右侧目录。

```markdown
## 二级标题
### 三级标题
```

## 强调与行内元素

| 写法 | 效果 | 用途 |
| --- | --- | --- |
| `**粗体**` | **粗体** | 关键结论 |
| `*斜体*` | *斜体* | 术语、强调语气 |
| `~~删除线~~` | ~~删除线~~ | 记录被推翻的想法 |
| `==高亮==` | ==高亮== | 重点标记 |
| `` `行内代码` `` | `int *p` | 变量名、命令、函数名 |

行内代码写 C 的指针很方便：`int *p = &a;`，也可以写命令 `npm run build`。

## 列表

无序列表用 `-`、`*`、`+`，有序列表用 `1.`：

- 第一项
- 第二项
  - 嵌套一层（缩进两个空格）
  - 再一项
- 第三项

1. 先读题
2. 想清楚再写
3. 写完对拍

任务清单适合做学习进度：

- [x] 装好编译器和编辑器
- [x] 学会 Git 的 add / commit / push
- [ ] 手写完 8 个数据结构
- [ ] 力扣刷满 150 题

## 引用

> 程序必须首先是给人读的，只是顺便能在机器上运行。
>
> > 引用还可以嵌套，用来区分「我引用的观点」和「我引用的观点里再引用的观点」。

## 代码块

用三个反引号包裹，并在开头写上语言名。语言名会被显示在代码块左上角，代码会自动高亮，右上角的「复制」按钮可以直接复制全文。

Python：

```python
def binary_search(nums: list[int], target: int) -> int:
    """返回 target 的下标，找不到返回 -1（数组必须有序）"""
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


if __name__ == "__main__":
    print(binary_search([1, 3, 5, 7, 9], 7))  # 3
```

C 语言（含预处理指令和指针）：

```c
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

Node *push(Node *head, int value) {
    Node *node = malloc(sizeof(Node));   /* 别忘记检查 malloc 失败 */
    if (node == NULL) return head;
    node->value = value;
    node->next = head;
    return node;
}

int main(void) {
    Node *list = NULL;
    for (int i = 1; i <= 5; i++) list = push(list, i);
    for (Node *p = list; p != NULL; p = p->next) {
        printf("%d ", p->value);
    }
    return 0;
}
```

JavaScript：

```js
const posts = await fetch('/api/posts').then((r) => r.json());
const recent = posts
  .filter((p) => !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 5);
console.log(`最新 ${recent.length} 篇`); // 模板字符串
```

SQL 和 Shell：

```sql
SELECT tag, COUNT(*) AS n
FROM post_tags
WHERE created_at >= '2026-09-01'
GROUP BY tag
ORDER BY n DESC
LIMIT 10;
```

```bash
git switch -c feature/blog
git add posts/hello-blog.md
git commit -m "docs: 新增第一篇博客"
git push -u origin feature/blog
```

## 表格

`|` 分隔单元格，第二行的 `---` 决定对齐方式（`:---` 左对齐、`:---:` 居中、`---:` 右对齐）：

| 数据结构 | 平均查找 | 平均插入 | 典型场景 |
| :--- | ---: | ---: | :--- |
| 数组 | O(1) | O(n) | 随机访问 |
| 链表 | O(n) | O(1) | 频繁插入删除 |
| 哈希表 | O(1) | O(1) | 去重、计数 |
| 平衡树 | O(log n) | O(log n) | 有序遍历 |

## 链接与图片

- 行内链接：`[中国大学 MOOC](https://www.icourse163.org/)` → [中国大学 MOOC](https://www.icourse163.org/)
- 自动链接：`<https://leetcode.cn>` → <https://leetcode.cn>
- 图片：`![图片说明](图片地址)`，本地图片建议放在 `assets/img/` 下再引用

## 分隔线

三个或更多的 `-`：

---

## 写作时的一点建议

1. **先写结论，再写推导。** 未来的自己只想知道「当初怎么解决的」。
2. **代码要能跑。** 贴不能运行的伪代码，等于贴了没有价值的笔记。
3. **保留踩坑过程。** 报错信息、排查思路、最终的解决方式，比正确代码更值钱。
4. **定期回收。** 学完一个阶段回来重写旧文，比一直写新文章收获更大。
