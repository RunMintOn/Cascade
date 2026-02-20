# Cascade 开发文档

**项目**: Cascade (原名 WebCanvas)  
**版本**: 1.0.0  
**最后更新**: 2026-02-20

---

## 📁 文档索引

| 文档 | 说明 |
|------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 系统架构与技术栈 |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | 数据库结构与类型定义 |
| [FEATURES.md](./FEATURES.md) | 功能清单与实现状态 |
| [EXPORT_GUIDE.md](./EXPORT_GUIDE.md) | 导出到 Obsidian Canvas 规范 |
| [USER_GUIDE.md](./USER_GUIDE.md) | 用户使用指南 |
| [CHANGELOG.md](./CHANGELOG.md) | 更新日志 |
| [TODO.md](./TODO.md) | 待实现功能与改进计划 |

---

## 🚀 快速开始

### 新成员入门

1. 先阅读 [ARCHITECTURE.md](./ARCHITECTURE.md) 了解技术栈
2. 查看 [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) 理解数据结构
3. 阅读 [FEATURES.md](./FEATURES.md) 了解已实现功能

### 用户

- 直接使用指南：[USER_GUIDE.md](./USER_GUIDE.md)
- 遇到问题：查看 [TODO.md](./TODO.md) 确认是否是已知问题

---

## 📦 项目概述

**Cascade** 是一个浏览器扩展，用于从网页采集内容（文本、图片、链接）并导出为 Obsidian Canvas 格式。

### 核心工作流

```
网页采集 → 卡片列表 → 导出到 Obsidian Canvas
   ↓           ↓              ↓
拖拽/粘贴   编辑/排序    4 列网格布局
```

### 技术栈

| 模块 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite + CRXJS |
| 数据库 | Dexie.js (IndexedDB) |
| 拖拽 | @dnd-kit |
| 样式 | Tailwind CSS 4 |
| 打包 | JSZip |

### 项目结构

```
src/
├── background/           # Service Worker（图片下载）
├── content/              # Content Script（拖拽监听）
├── sidepanel/            # 侧边栏主界面
│   ├── components/       # React 组件
│   ├── services/         # 服务层（DB、导出、文件系统）
│   ├── contexts/         # React Context（Undo）
│   └── App.tsx           # 主应用
└── types/                # TypeScript 类型定义
```

---

## 📝 文档维护原则

### 单一事实来源

- 文档必须与代码一致
- 代码变更时必须同步更新文档
- 不记录代码中不存在的内容

### 文档分类

| 类型 | 更新频率 | 负责人 |
|------|----------|--------|
| 架构文档 | 低（架构变更时） | 核心开发 |
| 数据库 Schema | 中（数据库变更时） | 数据库负责人 |
| 功能清单 | 高（每次迭代） | 全体开发 |
| 用户指南 | 中（功能变更时） | 产品负责人 |
| 更新日志 | 高（每次提交） | 提交者 |

---

## 🔗 外部资源

- [React 官方文档](https://react.dev/)
- [Vite 官方文档](https://vitejs.dev/)
- [Dexie.js 文档](https://dexie.org/)
- [@dnd-kit 文档](https://dndkit.com/)
- [Chrome Extension 文档](https://developer.chrome.com/docs/extensions/)
- [Obsidian Canvas 规范](https://jsoncanvas.org/spec/1.0/)
