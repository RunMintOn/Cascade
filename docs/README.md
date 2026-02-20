# WebCanvas 开发文档

**项目**: WebCanvas (Obsidian Browser Scout / Stream2Grid)  
**版本**: 2.0  
**最后更新**: 2026-01-18

---

## 📁 文档结构

```
docs/
├── 01-产品需求与架构/
│   ├── PRD.md                    # 产品需求定义
│   └── 技术架构.md                # 技术栈 + 架构设计
│
├── 02-开发指南/
│   ├── 01-数据结构设计.md         # IndexedDB Schema + 类型定义
│   ├── 02-核心功能实现.md         # 拖拽、粘贴、图片处理
│   └── 03-导出模块.md             # List-to-Grid 算法 + JSON Canvas
│
├── 03-用户文档/
│   ├── 使用指南.md                # 安装、功能说明、使用场景
│   └── 故障排查.md                # 常见问题 + 解决方案
│
├── 04-测试与质量/
│   └── 测试指南.md                # 功能测试步骤
│
├── 05-更新日志/
│   └── CHANGELOG.md               # 版本更新记录
│
└── 06-参考资料/
    └── JSON_Canvas 规范.md         # Obsidian Canvas 格式规范
```

---

## 🚀 快速导航

### 新成员入门

1. **[PRD](01-产品需求与架构/PRD.md)** - 了解产品定位和功能
2. **[技术架构](01-产品需求与架构/技术架构.md)** - 技术栈和架构设计
3. **[使用指南](03-用户文档/使用指南.md)** - 从用户角度理解产品

### 开发人员

| 任务 | 参考文档 |
|------|----------|
| 理解数据结构 | [数据结构设计](02-开发指南/01-数据结构设计.md) |
| 实现拖拽功能 | [核心功能实现](02-开发指南/02-核心功能实现.md#1-智能拖拽系统) |
| 实现粘贴功能 | [核心功能实现](02-开发指南/02-核心功能实现.md#2-粘贴功能-ctrlv) |
| 实现导出功能 | [导出模块](02-开发指南/03-导出模块.md) |
| 图片处理 | [核心功能实现](02-开发指南/02-核心功能实现.md#3-图片处理) |

### 测试人员

1. **[测试指南](04-测试与质量/测试指南.md)** - 完整测试流程
2. **[故障排查](03-用户文档/故障排查.md)** - 常见问题解决方案

### 用户

1. **[使用指南](03-用户文档/使用指南.md)** - 安装和使用说明
2. **[故障排查](03-用户文档/故障排查.md)** - 遇到问题先看这里

---

## 📋 文档索引

### 产品需求与架构

| 文档 | 说明 |
|------|------|
| [PRD.md](01-产品需求与架构/PRD.md) | 产品需求定义、用户故事、功能模块 |
| [技术架构.md](01-产品需求与架构/技术架构.md) | 技术栈选型、数据流向、组件架构 |

### 开发指南

| 文档 | 说明 |
|------|------|
| [01-数据结构设计.md](02-开发指南/01-数据结构设计.md) | TypeScript 类型、IndexedDB Schema、数据转换 |
| [02-核心功能实现.md](02-开发指南/02-核心功能实现.md) | 拖拽系统、粘贴功能、图片处理、收集箱 |
| [03-导出模块.md](02-开发指南/03-导出模块.md) | List-to-Grid 算法、JSON Canvas 规范、ZIP 打包 |

### 用户文档

| 文档 | 说明 |
|------|------|
| [使用指南.md](03-用户文档/使用指南.md) | 安装、采集、管理、导出、常见问题 |
| [故障排查.md](03-用户文档/故障排查.md) | 问题诊断流程、常见问题解决方案 |

### 测试与质量

| 文档 | 说明 |
|------|------|
| [测试指南.md](04-测试与质量/测试指南.md) | 功能测试、兼容性测试、性能测试 |

### 更新日志

| 文档 | 说明 |
|------|------|
| [CHANGELOG.md](05-更新日志/CHANGELOG.md) | 版本更新记录、功能变更、Bug 修复 |

### 参考资料

| 文档 | 说明 |
|------|------|
| [JSON_Canvas 规范.md](06-参考资料/JSON_Canvas 规范.md) | Obsidian Canvas 格式规范详解 |

---

## 🔗 外部资源

### 技术栈文档

- [React 官方文档](https://react.dev/)
- [Vite 官方文档](https://vitejs.dev/)
- [CRXJS 文档](https://crxjs.dev/vite-plugin)
- [Dexie.js 文档](https://dexie.org/)
- [@dnd-kit 文档](https://dndkit.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [JSZip](https://stuk.github.io/jszip/)

### Chrome Extension

- [Chrome Extension 文档](https://developer.chrome.com/docs/extensions/)
- [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Side Panel API](https://developer.chrome.com/docs/extensions/reference/sidePanel/)

### Obsidian

- [Obsidian Canvas 文档](https://help.obsidian.md/plugins/canvas)
- [JSON Canvas 规范](https://jsoncanvas.org/spec/1.0/)

---

## 📝 文档维护

### 更新原则

1. **代码未动，文档先行** - 修改功能前先更新相关文档
2. **单一来源** - 每个主题只在一个地方详细说明
3. **版本关联** - 重大变更同步更新 CHANGELOG

### 文档审查

每次 PR 需要检查：
- [ ] 相关文档是否已更新
- [ ] 代码示例是否准确
- [ ] 截图是否需要更新

---

## 🎯 项目核心理念

**流式采集 + 网格导出**

- 浏览器端：极简的垂直列表（Stream）
- Obsidian 端：导出的瞬间升维为二维网格（Grid）

**Local-First**

- 无账户体系
- 数据全本地
- 隐私优先

---

**文档整理完成时间**: 2026-01-18
