# 系统架构 (ARCHITECTURE)

**最后更新**: 2026-02-20

---

## 1. 技术栈

### 核心技术

| 模块 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **框架** | React | 19.x | UI 组件开发 |
| **语言** | TypeScript | 5.9.x | 类型安全 |
| **构建** | Vite | 7.x | 快速构建 |
| **扩展构建** | CRXJS | 2.3.x | Chrome 扩展构建 |

### 关键库

| 库 | 版本 | 用途 |
|------|------|------|
| `dexie` | 4.2.x | IndexedDB 封装 |
| `dexie-react-hooks` | 4.2.x | React 响应式数据 |
| `@dnd-kit/core` | 6.3.x | 拖拽排序 |
| `@dnd-kit/sortable` | 10.x | 可排序列表 |
| `jszip` | 3.10.x | ZIP 打包 |
| `tailwindcss` | 4.x | 样式系统 |

### 开发工具

| 工具 | 用途 |
|------|------|
| `@types/chrome` | Chrome API 类型定义 |
| `playwright` | 端到端测试 |
| `eslint` | 代码检查 |

---

## 2. 系统架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                     Chrome Extension                     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  Content    │  │  Side Panel │  │   Background    │ │
│  │  Script     │  │  (React)    │  │   Service Worker│ │
│  │             │  │             │  │                 │ │
│  │ - dragstart │  │ - UI 渲染    │  │ - 图片下载      │ │
│  │ - payload   │  │ - 卡片管理   │  │ - 消息中转      │ │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘ │
│         │                │                   │          │
│         └────────────────┼───────────────────┘          │
│                          │                              │
│                  ┌───────▼────────┐                     │
│                  │   IndexedDB    │                     │
│                  │   (CascadeDB)  │                     │
│                  └────────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

### 2.2 数据流

#### 拖拽采集流程

```
网页 (Content Script)
    ↓ dragstart 事件
构造 DragPayload
    ↓ chrome.runtime.sendMessage
Background 缓存 payload (5 秒过期)
    ↓
用户拖拽到 Side Panel
    ↓ drop 事件
读取 payload 或 dataTransfer
    ↓
创建 CanvasNode
    ↓
IndexedDB 存储
    ↓
Dexie React Hooks 响应式更新
    ↓
UI 重新渲染
```

#### 图片下载流程

```
Side Panel: 检测到图片拖拽
    ↓ chrome.runtime.sendMessage
Background: handleImageDownload
    ↓ fetch(url, { mode: 'cors' })
获取 Blob
    ↓ FileReader.readAsDataURL
转换为 Base64
    ↓ chrome.runtime.sendMessage
Side Panel: 接收 base64
    ↓
IndexedDB 存储 (fileData: Blob)
    ↓
UI 渲染 (URL.createObjectURL)
```

#### 导出流程

```
用户点击"导出"
    ↓
exportToCanvas(projectId, projectName)
    ↓
从 IndexedDB 读取所有 nodes
    ↓
List-to-Grid 算法 (4 列网格)
    ↓
生成 Obsidian Canvas JSON
    ↓
JSZip 打包 (.canvas + attachments/)
    ↓
浏览器下载 ZIP
```

---

## 3. 核心模块

### 3.1 Background Service Worker

**文件**: `src/background/index.ts`

**职责**:
- 图片下载（CORS 处理）
- Drag Payload 缓存（解决跨域问题）
- Favicon 获取代理

**关键函数**:
```typescript
// 图片下载
handleImageDownload(imageUrl, projectId, sourceUrl)

// 消息处理
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'downloadImage') { ... }
  if (request.action === 'getFavicon') { ... }
  if (request.action === 'setDragPayload') { ... }
  if (request.action === 'getDragPayload') { ... }
})
```

### 3.2 Content Script

**文件**: `src/content/drag-listeners.ts`

**职责**:
- 监听网页拖拽事件
- 构造 DragPayload
- 发送到 Background 缓存

**Payload 结构**:
```typescript
interface DragPayload {
  sourceUrl: string
  sourceTitle: string
  sourceIcon: string
  type: 'text' | 'image' | 'link' | 'unknown'
  content: string | null
  linkTitle: string | null
}
```

### 3.3 Side Panel

**文件**: `src/sidepanel/`

**组件树**:
```
App
├── UndoProvider (Context)
│   ├── App (with undo/redo)
│   │   ├── StickyHeader
│   │   ├── DropZone
│   │   │   ├── ProjectList (Inbox 模式)
│   │   │   └── CardStream (项目模式)
│   │   │       ├── TextCard
│   │   │       ├── ImageCard
│   │   │       └── LinkCard
│   │   └── LocalMDView (Markdown 模式)
│   └── UndoToast
```

**核心服务**:
| 服务 | 文件 | 职责 |
|------|------|------|
| `db.ts` | `services/db.ts` | 数据库操作 |
| `exporter.ts` | `services/exporter.ts` | 导出到 Canvas |
| `fs.ts` | `services/fs.ts` | 文件系统操作 |

---

## 4. 关键设计决策

### 4.1 为什么使用 IndexedDB 而不是 localStorage?

- **容量**: localStorage 只有 5MB，IndexedDB 可达 5-10GB
- **二进制支持**: 直接存储 Blob（图片）
- **异步**: 不阻塞主线程

### 4.2 为什么图片要转 Base64?

- Service Worker 无法直接传递 Blob 到主线程
- Base64 是跨上下文传递二进制数据的可靠方式
- 接收端再转回 Blob 存储

### 4.3 为什么使用 @dnd-kit 而不是 React DnD?

- 更轻量
- 更好的可访问性支持
- 更现代的 API 设计

### 4.4 文本版本控制设计

**问题**: 用户编辑后，如何保留原始内容？

**方案**:
```typescript
interface CanvasNode {
  text: string         // 当前显示文本
  originalText: string // 原始捕获文本
  editedText: string   // 编辑版本
  hasEdited: boolean   // 是否已编辑
}
```

- 第一次编辑：保存 originalText，创建 editedText
- 后续编辑：只更新 editedText
- UI 支持切换显示原始/编辑版本

---

## 5. 性能优化

### 5.1 数据库查询优化

- 使用 `useLiveQuery` 实现响应式更新
- 只索引必要字段（`fileData` 不索引）
- 批量操作使用 `db.transaction()`

### 5.2 渲染优化

- React.memo 缓存卡片组件
- 图片懒加载
- 虚拟滚动（待实现）

### 5.3 内存管理

- `URL.createObjectURL` 创建的 URL 要及时 `revokeObjectURL`
- 导出时流式处理 ZIP

---

## 6. 安全与隐私

| 方面 | 策略 |
|------|------|
| 数据存储 | 100% 本地 IndexedDB |
| 网络请求 | Background 代理，避免 CORS |
| 权限 | 最小化权限（sidePanel, storage） |
| 用户追踪 | 无账户、无追踪、无分析 |

---

## 7. 调试指南

### 7.1 查看日志

**Side Panel**:
```
右键 Side Panel → 检查 → Console
过滤 [Cascade]
```

**Background**:
```
chrome://extensions/ → 点击 "service worker" 链接
```

**Content Script**:
```
网页按 F12 → Console
过滤 [Cascade]
```

### 7.2 数据库检查

```javascript
// 在 Console 中
db.projects.toArray().then(console.log)
db.nodes.where('projectId').equals(1).sortBy('order').then(console.log)
```

### 7.3 常见问题

| 问题 | 排查步骤 |
|------|----------|
| 拖拽无反应 | 检查 Content Script 是否注入 |
| 图片下载失败 | 检查 Background 日志 |
| 导出失败 | 检查 Console 错误信息 |
