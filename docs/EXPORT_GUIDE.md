# 导出指南 (EXPORT_GUIDE)

**最后更新**: 2026-02-20

---

## 1. 概述

导出模块负责将浏览器端的卡片列表转换为 Obsidian Canvas 标准的 JSON 格式，并打包为 ZIP 文件下载。

**代码位置**: `src/sidepanel/services/exporter.ts`

---

## 2. Obsidian Canvas 规范

### 2.1 文件结构

```json
{
  "nodes": [...],
  "edges": [...]
}
```

### 2.2 节点类型

| 类型 | 必需字段 | 可选字段 | 示例 |
|------|----------|----------|------|
| `text` | `text` | `color` | 文本内容 |
| `file` | `file` | `color` | `attachments/image.png` |
| `link` | `url` | `color` | `https://example.com` |

### 2.3 关键规范

- **坐标必须为整数**: 使用 `Math.round()` 取整
- **Link 节点只能有 `url` 字段**: 添加 `text` 会导致 Obsidian 解析错误
- **文件路径为相对路径**: `attachments/filename.png`
- **ID 推荐使用 UUID**: 避免冲突

---

## 3. 导出算法

### 3.1 核心参数

```typescript
const CARD_WIDTH = 400          // 卡片宽度
const CARD_HEIGHT_TEXT = 200    // 文本卡片高度
const CARD_HEIGHT_IMAGE = 300   // 图片卡片高度
const CARD_HEIGHT_LINK = 150    // 链接卡片高度
const GAP = 50                  // 间距
const COLS = 4                  // 4 列网格
```

### 3.2 List-to-Grid 算法

```typescript
// 一维索引转二维坐标
const col = index % COLS
const row = Math.floor(index / COLS)

const x = Math.round(col * (CARD_WIDTH + GAP))
const y = Math.round(row * (CARD_HEIGHT_TEXT + GAP))
```

### 3.3 完整导出流程

```typescript
export async function exportToCanvas(
  projectId: number,
  projectName: string
): Promise<void> {
  // 1. 从数据库读取所有节点
  const nodes: CanvasNode[] = await db.nodes
    .where('projectId')
    .equals(projectId)
    .sortBy('order')

  // 2. 转换为 Obsidian Canvas 格式
  const canvasNodes: ObsidianNode[] = nodes.map((node, index) => {
    const col = index % COLS
    const row = Math.floor(index / COLS)

    const x = Math.round(col * (CARD_WIDTH + GAP))
    const y = Math.round(row * (CARD_HEIGHT_TEXT + GAP))

    const obsidianNode: ObsidianNode = {
      id: generateUUID(),
      type: node.type,
      x: x,
      y: y,
      width: CARD_WIDTH,
      height: estimateHeight(node),
    }

    // 添加类型特定字段
    if (node.type === 'text') {
      obsidianNode.text = normalizeTextContent(node.text || '')
    } else if (node.type === 'file') {
      obsidianNode.file = `attachments/${node.fileName || 'image.png'}`
    } else if (node.type === 'link') {
      obsidianNode.url = node.url || ''
    }

    return obsidianNode
  })

  // 3. 创建 Canvas JSON
  const canvas: ObsidianCanvas = {
    nodes: canvasNodes,
    edges: [],
  }

  const json = JSON.stringify(canvas, null, 2)

  // 4. 创建 ZIP
  const zip = new JSZip()
  zip.file(`${projectName}.canvas`, json)

  // 添加图片附件
  const attachmentsFolder = zip.folder('attachments')
  const imageNodes = nodes.filter(n => n.type === 'file' && n.fileData)

  for (const node of imageNodes) {
    if (node.fileData) {
      attachmentsFolder!.file(node.fileName || 'image.png', node.fileData)
    }
  }

  // 5. 下载 ZIP
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${projectName}.zip`
  a.click()

  URL.revokeObjectURL(url)
}
```

---

## 4. 关键修复

### 4.1 行结尾标准化

**问题**: Windows 使用 `\r\n`，Obsidian 可能解析错误

**修复**:
```typescript
function normalizeTextContent(text: string): string {
  if (!text) return ''
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}
```

### 4.2 Link 节点字段

**问题**: 原代码添加 `text` 字段，导致 Obsidian 显示异常

**修复**:
```typescript
// ❌ 错误
} else if (node.type === 'link') {
  obsidianNode.url = node.url || ''
  obsidianNode.text = node.text || node.url || ''
}

// ✅ 正确
} else if (node.type === 'link') {
  obsidianNode.url = node.url || ''
}
```

### 4.3 坐标取整

**问题**: JSON Canvas 规范要求坐标为整数

**修复**:
```typescript
const x = Math.round(col * (CARD_WIDTH + GAP))
const y = Math.round(row * (CARD_HEIGHT_TEXT + GAP))
```

---

## 5. ZIP 文件结构

```
project-name.zip
├── project-name.canvas          # JSON Canvas 文件（根目录）
└── attachments/                 # 图片附件目录
    ├── image-1708412345678.png
    ├── image-1708412345679.png
    └── image-1708412345680.png
```

### Obsidian 导入步骤

1. 下载 `.zip` 文件
2. 解压到 Obsidian Vault
3. 确保 `.canvas` 文件和 `attachments/` 在同一级目录
4. 在 Obsidian 中打开 `.canvas` 文件

---

## 6. 输出示例

### 6.1 Text 节点

```json
{
  "id": "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
  "type": "text",
  "x": 0,
  "y": 0,
  "width": 400,
  "height": 200,
  "text": "# 项目笔记\n\n- 任务 1\n- 任务 2"
}
```

### 6.2 File 节点

```json
{
  "id": "b2c3d4e5-f6g7-8h9i-0j1k-l2m3n4o5p6q7",
  "type": "file",
  "x": 450,
  "y": 0,
  "width": 400,
  "height": 300,
  "file": "attachments/image-1708412345678.png"
}
```

### 6.3 Link 节点

```json
{
  "id": "c3d4e5f6-g7h8-9i0j-1k2l-m3n4o5p6q7r8",
  "type": "link",
  "x": 0,
  "y": 250,
  "width": 400,
  "height": 150,
  "url": "https://github.com"
}
```

---

## 7. 调试

### 7.1 日志输出

```typescript
// exporter.ts 中的关键日志
console.log('[Cascade] Exporting project:', projectName)
console.log('[Cascade] Total nodes:', nodes.length)
console.log('[Cascade] Canvas JSON generated:', json.length, 'bytes')
console.log('[Cascade] Image nodes to add:', imageNodes.length)
console.log('[Cascade] Export complete:', projectName)
```

### 7.2 JSON 验证

```typescript
// 复制到 Clipboard 便于检查
await navigator.clipboard.writeText(json)

// 验证无 \r 字符
if (json.includes('\r')) {
  console.error('[Cascade] JSON still contains \\r characters!')
}
```

### 7.3 常见问题

| 问题 | 排查 |
|------|------|
| 导出后图片不显示 | 检查 `attachments/` 路径是否正确 |
| Link 节点显示异常 | 确认没有 `text` 字段 |
| 导出的 JSON 无法打开 | 验证 JSON 格式是否正确 |

---

## 8. 性能优化

### 8.1 当前限制

- 所有 Blob 一次性加载到内存
- 大文件（10+ 大图）导出慢

### 8.2 优化计划

| 优化 | 优先级 | 说明 |
|------|--------|------|
| 进度条显示 | High | 用户反馈需求 |
| 分批处理 | Medium | 避免内存溢出 |
| 流式压缩 | Low | 使用 ReadableStream |

---

## 9. 参考资源

- [JSON Canvas v1.0 规范](https://jsoncanvas.org/spec/1.0/)
- [Obsidian Canvas 文档](https://help.obsidian.md/plugins/canvas)
- [JSZip 官方文档](https://stuk.github.io/jszip/)
