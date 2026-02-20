# JSON Canvas v1.0 规范

**来源**: https://jsoncanvas.org/spec/1.0/  
**整理日期**: 2026-01-18

---

## 概述

JSON Canvas 是一种开放的、基于 JSON 的文件格式，用于存储节点和连线的画布数据。Obsidian Canvas 插件使用此格式。

---

## 文件结构

```json
{
  "nodes": [],
  "edges": []
}
```

### 根对象字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `nodes` | array | ✅ | 节点对象数组 |
| `edges` | array | ✅ | 连线对象数组（可为空） |

---

## 节点 (Nodes)

### 通用字段

所有节点都必须包含以下字段：

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 唯一标识符 |
| `type` | string | ✅ | 节点类型 |
| `x` | number | ✅ | X 轴坐标（像素） |
| `y` | number | ✅ | Y 轴坐标（像素） |
| `width` | number | ✅ | 宽度 |
| `height` | number | ✅ | 高度 |

### 节点类型

#### 1. Text 节点

用于存储 Markdown 文本。

```json
{
  "id": "node-1",
  "type": "text",
  "x": 0,
  "y": 0,
  "width": 400,
  "height": 200,
  "text": "# Hello World\n这是正文内容。"
}
```

**特有字段**：
- `text` (string): Markdown 格式的文本内容

---

#### 2. File 节点

用于存储文件引用（图片、PDF 等）。

```json
{
  "id": "node-2",
  "type": "file",
  "x": 450,
  "y": 0,
  "width": 400,
  "height": 300,
  "file": "attachments/image.png"
}
```

**特有字段**：
- `file` (string): 文件路径（相对于 Vault 根目录的相对路径）

**路径规则**：
- 使用正斜杠 `/`
- 相对于 Obsidian Vault 根目录
- 示例：`attachments/image.png`、`folder/file.pdf`

---

#### 3. Link 节点

用于存储网页链接。

```json
{
  "id": "node-3",
  "type": "link",
  "x": 0,
  "y": 250,
  "width": 400,
  "height": 150,
  "url": "https://github.com"
}
```

**特有字段**：
- `url` (string): 链接地址

**⚠️ 重要**：
- Link 节点**只能**有 `url` 字段
- **不要**添加 `text` 字段，会导致 Obsidian 解析错误

---

#### 4. Group 节点（可选）

用于创建分组容器。

```json
{
  "id": "group-1",
  "type": "group",
  "x": 0,
  "y": 0,
  "width": 800,
  "height": 600,
  "label": "分组标题",
  "color": "1"
}
```

**特有字段**：
- `label` (string): 分组标题
- `color` (string): 颜色（"1" 到 "6"）

---

### 可选字段

以下字段可以添加到任何节点：

| 字段 | 类型 | 说明 |
|------|------|------|
| `color` | string | 颜色标记（"1" 到 "6"） |

颜色映射（Obsidian 默认）：
- "1": 红色
- "2": 橙色
- "3": 黄色
- "4": 绿色
- "5": 蓝色
- "6": 紫色

---

## 连线 (Edges)

### 结构

```json
{
  "id": "edge-1",
  "fromNode": "node-1",
  "toNode": "node-2",
  "fromSide": "right",
  "toSide": "left"
}
```

### 字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 唯一标识符 |
| `fromNode` | string | ✅ | 起点节点 ID |
| `toNode` | string | ✅ | 终点节点 ID |
| `fromSide` | string | ❌ | 起点方向 |
| `toSide` | string | ❌ | 终点方向 |

### 方向值

| 值 | 说明 |
|------|------|
| `"top"` | 上侧 |
| `"right"` | 右侧 |
| `"bottom"` | 下侧 |
| `"left"` | 左侧 |

---

## 数据类型规范

### 坐标和尺寸

- `x`, `y`, `width`, `height` 必须为**数字类型**
- 推荐为**整数**（使用 `Math.round()` 取整）
- 单位：像素

### ID 格式

- 必须唯一
- 推荐使用 UUID 格式
- 示例：`a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6`

### 文本格式

- `text` 字段支持 **Markdown** 语法
- 支持标题、列表、代码块、链接等
- 换行使用 `\n`

---

## 完整示例

```json
{
  "nodes": [
    {
      "id": "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
      "type": "text",
      "x": 0,
      "y": 0,
      "width": 400,
      "height": 200,
      "text": "# 项目笔记\n\n- 任务 1\n- 任务 2"
    },
    {
      "id": "b2c3d4e5-f6g7-8h9i-0j1k-l2m3n4o5p6q7",
      "type": "file",
      "x": 450,
      "y": 0,
      "width": 400,
      "height": 300,
      "file": "attachments/screenshot.png"
    },
    {
      "id": "c3d4e5f6-g7h8-9i0j-1k2l-m3n4o5p6q7r8",
      "type": "link",
      "x": 0,
      "y": 250,
      "width": 400,
      "height": 150,
      "url": "https://obsidian.md"
    },
    {
      "id": "d4e5f6g7-h8i9-0j1k-2l3m-n4o5p6q7r8s9",
      "type": "text",
      "x": 450,
      "y": 350,
      "width": 400,
      "height": 200,
      "text": "另一个文本节点",
      "color": "4"
    }
  ],
  "edges": [
    {
      "id": "e5f6g7h8-i9j0-1k2l-3m4n-o5p6q7r8s9t0",
      "fromNode": "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
      "toNode": "b2c3d4e5-f6g7-8h9i-0j1k-l2m3n4o5p6q7",
      "fromSide": "right",
      "toSide": "left"
    }
  ]
}
```

---

## WebCanvas 导出规范

### 节点映射

| WebCanvas 类型 | JSON Canvas 类型 | 字段映射 |
|----------------|------------------|----------|
| `text` | `text` | `text` → `text` |
| `file` | `file` | `fileName` → `file: attachments/xxx` |
| `link` | `link` | `url` → `url` |

### 布局规则

- 4 列网格布局
- 卡片宽度：400px
- 间距：50px
- 高度根据类型估算：
  - Text: 200px
  - File: 300px
  - Link: 150px

### ZIP 结构

```
project.zip
├── project.canvas
└── attachments/
    ├── image-1.png
    └── image-2.png
```

---

## 参考资源

- [JSON Canvas 官方规范](https://jsoncanvas.org/spec/1.0/)
- [Obsidian Canvas 文档](https://help.obsidian.md/plugins/canvas)
- [JSON Canvas GitHub](https://github.com/obsidianmd/jsoncanvas)
