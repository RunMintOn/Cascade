# 参考手册

**最后更新**: 2026-03-08

这篇文档保留开发和维护最需要的事实：当前支持什么、数据怎么存、导出怎么做、哪些地方要特别小心。

## 功能现状

| 模块 | 状态 | 说明 |
|------|------|------|
| 项目管理 | 已实现 | 创建、删除、重命名项目 |
| Inbox 收集箱 | 已实现 | 默认存在，首页可直接投放内容 |
| 拖拽采集 | 已实现 | 支持文本、图片、链接 |
| 粘贴采集 | 已实现 | 支持文本、图片、URL |
| 文本编辑 | 已实现 | 编辑、复制、原文/编辑版切换 |
| 删除与撤销 | 已实现 | 支持撤销按钮和 `Ctrl/Cmd+Z` |
| Canvas 导出 | 已实现 | 导出 `.canvas` + `attachments/` |
| Markdown 项目 | 已实现 | 直接读写本地 `.md` |
| 卡片排序 | 未接入 UI | 数据层有 `reorderNodes()`，当前界面无真实排序 |
| 自动化测试 | 未实现 | 当前仓库没有测试用例 |

## 数据模型

### `projects`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `number` | 自增主键 |
| `name` | `string` | 项目名称 |
| `updatedAt` | `number` | 更新时间戳 |
| `isInbox` | `boolean` | 是否为默认收集箱 |
| `projectType` | `'canvas' | 'markdown'` | 项目类型 |
| `fileHandle` | `FileSystemHandle` | 本地文件系统句柄 |

### `nodes`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `number` | 自增主键 |
| `projectId` | `number` | 所属项目 |
| `type` | `'text' | 'file' | 'link'` | 节点类型 |
| `order` | `number` | 当前顺序 |
| `createdAt` | `number` | 创建时间 |
| `text` | `string` | 当前显示文本 |
| `originalText` | `string` | 原始文本 |
| `editedText` | `string` | 编辑版文本 |
| `hasEdited` | `boolean` | 是否存在编辑版 |
| `fileData` | `Blob` | 图片二进制 |
| `fileName` | `string` | 图片文件名 |
| `url` | `string` | 链接 URL |
| `sourceUrl` | `string` | 来源网页 |
| `sourceIcon` | `string` | 来源站点图标 |

## 数据库规则

- 数据库名是 `CascadeDB`
- 当前版本是 `3`
- 只有两张表：`projects` 和 `nodes`
- 启动时会自动创建 `Inbox`
- 不要给 `Blob` 字段建索引
- 启动时会尝试把旧的 `WebCanvasDB` 迁移到 `CascadeDB`

当前 schema：

```ts
projects: '++id, name, updatedAt, isInbox, projectType'
nodes: '++id, projectId, type, order, createdAt'
```

## 关键操作入口

| 能力 | 入口 |
|------|------|
| 创建默认 Inbox | `ensureInboxExists()` |
| 新增文本节点 | `addTextNode()` |
| 新增图片节点 | `addImageNode()` |
| 新增链接节点 | `addLinkNode()` |
| 更新文本 | `updateTextNode()` |
| 恢复删除节点 | `restoreNode()` |
| 重排顺序 | `reorderNodes()` |
| 导出 Canvas | `exportToCanvas()` |

## 导出规则

### 导出产物

```text
[项目名].zip
├─ [项目名].canvas
└─ attachments/
```

### 节点映射

| Cascade 节点 | Obsidian Canvas 节点 | 说明 |
|--------------|----------------------|------|
| `text` | `text` | 导出 `text` 内容 |
| `file` | `file` | 导出到 `attachments/文件名` |
| `link` | `link` | 只写 `url` 字段 |

### 当前规则

- 只支持从 Canvas 项目导出
- 当前使用固定 4 列布局
- 节点按 `order` 从左到右、从上到下布局
- 文本会统一成 Unix 换行符 `\n`
- 当前不会导出 `edges`
- 当前没有导出进度条

## 当前限制与风险

- `lastDragPayload` 是单例内存缓存，没有按 tab 隔离
- 某些网站仍会限制拖拽数据，只能依赖 background 兜底
- Markdown 图片插入已接入，但本地相对路径体验仍在打磨
- `reorderNodes()` 已存在，但当前 UI 未真正接入卡片排序
- sidepanel bundle 偏大，后续需要拆分优化

## 关键文件

| 类型 | 文件 |
|------|------|
| Content Script | `src/content/drag-listener.ts` |
| Background | `src/background/index.ts` |
| Side Panel 入口 | `src/sidepanel/App.tsx` |
| 数据库 | `src/sidepanel/services/db.ts` |
| 导出 | `src/sidepanel/services/exporter.ts` |
| 文件系统 | `src/sidepanel/services/fs.ts` |
| Markdown 编辑器 | `src/sidepanel/components/local/LocalMDView.tsx` |
