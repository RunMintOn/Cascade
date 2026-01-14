# Advanced Canvas 兼容性解决方案

## 问题根因

Advanced Canvas插件会对"外部导入"的Canvas文件应用只读保护，而对Obsidian手动创建的文件不应用。

## 解决方案

### 选项A：在Advanced Canvas设置中禁用保护（最简单）

1. 打开：设置 → 社区插件 → Advanced Canvas
2. 寻找以下选项并禁用：
   - "Protect external files"
   - "External canvas protection"
   - "Enhanced readonly mode"
   - "External canvas readonly"
3. 重启Obsidian

---

### 选项B：添加frontmatter（技术方案）

给导出的 .canvas 文件添加frontmatter，让它看起来像Obsidian创建的"内部"文件。

#### 标准frontmatter
```yaml
---
# 标题（可选）
---
```

#### 推荐的frontmatter（尝试多个）
```yaml
---
created-by: Obsidian
source: internal
---
```

```yaml
---
created-by: Obsidian
source: internal
editable: true
---
```

#### 尝试添加更多元数据
```yaml
---
created-by: Obsidian
source: internal
editable: true
advanced-canvas-enabled: true
---
```

### 操作步骤

1. 用文本编辑器打开导出的 .canvas 文件
2. 在文件最开始（第一行之前）添加frontmatter
3. 在 `---` 后面换行，然后才是 `{`
4. 完整的frontmatter：
```yaml
---
created-by: Obsidian
source: internal
---

{
  "nodes": [...]
}
```

---

### 选项C：临时绕过（不推荐但最快）

1. 关闭Advanced Canvas插件
2. 打开WebCanvas导出的Canvas
3. 确认可以编辑
4. 修改后立即按 `Ctrl+S` 保存
5. 重新启用Advanced Canvas
6. （注意：修改后可能再次被保护）

---

## 建议反馈

如果以上方案都不奏效，建议：
1. 在Advanced Canvas的GitHub仓库提交issue
2. 描述问题："Imported canvas from WebCanvas extension becomes readonly"
3. 请求添加"允许编辑外部Canvas"的选项
