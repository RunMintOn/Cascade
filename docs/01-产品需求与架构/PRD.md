# 产品需求文档 (PRD)

**项目代号**: Stream2Grid (Obsidian Scout / WebCanvas)  
**版本**: 2.0  
**最后更新**: 2026-01-18

---

## 1. 产品愿景与核心痛点

### 1.1 核心痛点
网页碎片化信息采集与非线性整理之间的断层。现有的剪藏工具是线性的（列表/文档），而人的思考是网状的（画布）。

### 1.2 产品定位
浏览器中的 **"第二缓冲区"**。
- 不是独立的笔记软件（SaaS），而是 **Obsidian 生态在浏览器端的"前哨站"**
- **Local-First**：无账户体系，数据全本地，隐私优先

### 1.3 核心隐喻
它就像你书桌旁的一张无限大的草稿纸，随时可以把网页上的东西剪下来贴上去，最后整理好塞进你的档案柜（Obsidian）。

---

## 2. 产品范式

### 2.1 架构演进

| 版本 | 范式 | 说明 |
|------|------|------|
| V1.0 | 浏览器端画布 | 在侧边栏复刻 Canvas 画板 → 空间拥挤，操作繁琐 |
| **V2.0** | **流式采集 + 网格导出** | 浏览器端极简列表 → 导出时自动升维为二维网格 |

### 2.2 核心工作流

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  网页采集   │ →   │  列表整理    │ →   │  Obsidian   │
│  (拖拽/粘贴) │     │  (垂直流式)  │     │  (网格画布)  │
└─────────────┘     └─────────────┘     └─────────────┘
     Stream              Stream              Grid
```

---

## 3. 用户故事与核心功能 (MVP)

### 3.1 模块一：项目/画板管理

| 功能 | 说明 |
|------|------|
| 画板列表 | 侧边栏首页展示所有已创建的画板（类似文件夹） |
| CRUD 操作 | 新建、重命名、删除画板 |
| 状态记忆 | 记住上次关闭时所在的画板和视图状态 |
| **快速收集箱 (Inbox)** | 默认的临时收集区，未进入项目时直接保存到这里 |

### 3.2 模块二：流式卡片列表 (Card Stream)

| 功能 | 说明 |
|------|------|
| 垂直列表布局 | Pinterest/Edge Collection 风格，非画布布局 |
| 卡片排序 | 支持拖拽调整卡片顺序（@dnd-kit） |
| 卡片折叠/展开 | 文本卡片支持查看全文 |
| 删除与撤销 | 删除后 3 秒内可撤销 |

### 3.3 模块三：智能采集系统

| 采集方式 | 支持类型 | 处理逻辑 |
|----------|----------|----------|
| **拖拽采集** | 文本、图片、链接 | 从网页拖入侧边栏，自动解析 |
| **粘贴采集** | 文本、图片、URL、HTML | Ctrl+V 直接粘贴 |
| **文件拖拽** | 本地图片文件 | 直接处理文件创建卡片 |

**图片处理**：
- 后台自动下载（Background Service Worker）
- 转存为 Blob 存入 IndexedDB
- 显示 Loading 骨架屏 → 完成渲染

### 3.4 模块四：Obsidian 桥接

| 功能 | 说明 |
|------|------|
| `.canvas` 导出 | 将当前画板状态序列化为 Obsidian 标准 JSON |
| 资源打包 | 生成 `.zip` 包，内含 `.canvas` 文件及 `attachments/` 文件夹 |
| **列表转网格算法** | 导出时自动将一维列表转换为 4 列网格布局 |

---

## 4. 技术架构

### 4.1 技术栈

| 模块 | 选型 | 决策理由 |
|------|------|----------|
| 构建框架 | **React 18 + Vite + CRXJS** | 现代插件开发标准，HMR 体验好 |
| 拖拽核心 | **@dnd-kit** | 轻量级拖拽排序库，替代重型画布引擎 |
| 状态/数据存储 | **Dexie.js (IndexedDB)** | localStorage (5MB) 不够用，支持存储 Blob |
| 样式方案 | **Tailwind CSS** | 原子化 CSS，开发速度快 |
| 打包工具 | **JSZip** | 纯前端生成 Zip 包 |

### 4.2 数据流向图

```mermaid
graph TD
    A[网页 Content Script] -->|Drag Event / Clipboard| B(Side Panel 接收层)

    subgraph Browser Side Panel
        B -->|解析 HTML/URL/Blob| C[采集预处理 Service]
        C -->|生成 Node Object| D[React State]
        D -->|实时渲染| E[Card Stream UI]
        D -->|Auto-Save| F[IndexedDB (Dexie)]
    end

    subgraph Export Action
        F -->|读取所有数据| G[Export Service]
        G -->|1. List-to-Grid 转换| H[生成 .canvas JSON]
        G -->|2. 读取图片 Blob| I[生成 attachments 目录]
        H & I --> J[JSZip 打包]
        J --> K[下载 .zip 到本地]
    end
```

### 4.3 项目目录结构

```
src/
├── manifest.json
├── background/
│   └── service-worker.ts   # 处理图片下载、跨域请求
├── content/
│   └── drag-listener.ts    # 注入网页，增强拖拽数据
├── sidepanel/
│   ├── components/
│   │   ├── CardStream/     # 卡片列表页
│   │   │   ├── TextCard.tsx
│   │   │   ├── ImageCard.tsx
│   │   │   └── LinkCard.tsx
│   │   ├── Dashboard/      # 画板列表页
│   │   │   └── ProjectList.tsx
│   │   └── common/
│   │       └── DropZone.tsx
│   ├── hooks/
│   │   ├── useAutoSave.ts
│   │   └── useDragDrop.ts
│   ├── services/
│   │   ├── db.ts           # Dexie 数据库实例
│   │   ├── exporter.ts     # 导出为 .canvas + zip 逻辑
│   │   └── parser.ts       # 网页元数据解析
│   └── App.tsx
└── shared/
    ├── types.ts            # 全局 TS 类型定义
    └── utils.ts
```

---

## 5. 关键风险与应对

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| 图片防盗链 (CORS) | 图片无法显示 | Background Script fetch + Blob 存储 |
| IndexedDB 配额限制 | 存储空间不足 | Chrome 约 5-10GB，定期清理不用的项目 |
| 导出性能 | 大量图片时 ZIP 生成慢 | 限制单次导出数量，显示进度提示 |
| Advanced Canvas 只读保护 | 导出的 Canvas 无法编辑 | 添加 frontmatter 或用户禁用保护 |

---

## 6. 开发路线图

| Phase | 周期 | 目标 |
|-------|------|------|
| Phase 1: 基础架构 | Day 1-2 | Vite + CRXJS 项目、Tailwind、路由切换 |
| Phase 2: 数据存储 | Day 3-4 | Dexie 封装、卡片渲染、折叠/展开 |
| Phase 3: 采集功能 | Day 5-7 | Content Script、拖拽处理、图片下载、@dnd-kit |
| Phase 4: 导出桥接 | Day 8-9 | List-to-Grid 转换、JSZip 打包 |
| Phase 5: 优化打磨 | Day 10 | Favicon、Toast 撤销、Loading 状态 |

---

## 7. 附录

- [技术架构详细设计](./技术架构.md)
- [JSON Canvas 规范](../06-参考资料/JSON_Canvas 规范.md)
