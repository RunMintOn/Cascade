# 系统架构

**最后更新**: 2026-03-08

本文档说明 Cascade 的真实架构、主要模块和关键数据流。它只描述当前代码里已经存在的结构。

## 总览

Cascade 是一个 Chrome MV3 扩展，分为三段：

1. `Content Script`：在网页里识别拖拽内容
2. `Background Service Worker`：负责图片下载和拖拽 payload 兜底缓存
3. `Side Panel`：负责 UI、Dexie 数据存储、导出和本地 Markdown 编辑

持久化层统一使用 `IndexedDB`，数据库名为 `CascadeDB`。

## 架构分层

| 层 | 位置 | 主要职责 |
|----|------|----------|
| Content Script | `src/content/drag-listener.ts` | 监听 `dragstart`，识别文本 / 图片 / 链接，构造 payload |
| Background | `src/background/index.ts` | 缓存最近一次拖拽 payload，下载远程图片，响应扩展消息 |
| Side Panel UI | `src/sidepanel/App.tsx` | 项目切换、收集箱、导出入口、撤销逻辑 |
| Side Panel Services | `src/sidepanel/services/` | 数据库、导出、文件系统访问 |

## 关键数据流

### 1. 采集文本 / 图片 / 链接

1. 网页触发 `dragstart`
2. `Content Script` 识别内容类型并生成 payload
3. payload 同时写入 `dataTransfer`，并发给 `Background` 做兜底缓存
4. `Side Panel` 中的 `DropZone` 在 `drop` 时优先尝试读取缓存，再回退到 `dataTransfer`
5. 普通项目写入 Dexie；Markdown 项目改为派发自定义事件给本地编辑器

### 2. 图片下载

1. `DropZone` 发现是远程图片 URL
2. 发消息给 `Background` 执行 `fetch`
3. `Background` 把图片转成 base64 后回传
4. `Side Panel` 转成 `Blob` 并写入 `db.nodes`
5. `ImageCard` 使用 `URL.createObjectURL` 渲染图片

### 3. 导出到 Obsidian Canvas

1. 项目页点击“导出”
2. `exportToCanvas(projectId, projectName)` 读取全部节点
3. 节点按 `order` 转为固定 4 列网格布局
4. 生成 `.canvas` JSON 和 `attachments/` 目录
5. 使用 `JSZip` 打包并触发下载

### 4. Markdown 项目模式

1. 用户先授权本地文件夹
2. 新建 Markdown 项目时会创建一个 `.md` 文件
3. `LocalMDView` 使用 File System Access API 读写该文件
4. 来自 `DropZone` 的内容通过 `webcanvas-insert-markdown` 事件插入编辑器

## Side Panel 结构

`App` 是侧边栏主入口，整体分为两种状态：

- **首页状态**：显示 `Inbox` 和项目列表
- **项目状态**：显示 `CardStream` 或 `LocalMDView`

主要组件关系如下：

```text
App
├─ StickyHeader
├─ DropZone
│  ├─ ProjectList        // 首页
│  ├─ CardStream         // Canvas 项目
│  └─ LocalMDView        // Markdown 项目
└─ UndoToast
```

## 核心服务

| 服务 | 文件 | 作用 |
|------|------|------|
| 数据库 | `src/sidepanel/services/db.ts` | 管理项目、节点、迁移、文本版本、撤销恢复 |
| 导出 | `src/sidepanel/services/exporter.ts` | 生成 Canvas JSON、打包 ZIP |
| 文件系统 | `src/sidepanel/services/fs.ts` | 申请本地目录权限、读写 Markdown 文件与图片 |

## 关键设计选择

- 使用 `IndexedDB` 而不是 `localStorage`，因为需要存图片 `Blob`
- 图片下载放在 `Background`，以绕开部分站点对前端直接拉图的限制
- 拖拽 payload 做双通道传递：`dataTransfer` + background 缓存
- 文本卡片保留 `originalText / editedText`，便于切换原文与编辑版

## 当前约束

- `lastDragPayload` 目前是单例内存缓存，没有按 tab 隔离
- 文档里曾提到的“卡片拖拽排序”在当前 UI 中尚未真正接入
- Markdown 项目的图片插入仍可用但体验还在打磨
- 当前没有自动化测试，验证主要依赖手工和构建
