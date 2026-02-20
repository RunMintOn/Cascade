# 开发过程用到的文档 - 索引

**最后整理时间**: 2026-01-18

---

## 📁 文档列表

### 核心开发文档
| 文档 | 说明 |
|------|------|
| [devdoc2.0.md](./devdoc2.0.md) | **V2.0 最终版架构文档** - 产品范式、技术栈、数据结构、核心算法 |

### 用户文档
| 文档 | 说明 |
|------|------|
| [USER_GUIDE.md](./USER_GUIDE.md) | 用户使用指南 - 安装、功能说明、使用场景、故障排查 |
| [ADVANCED_CANVAS_COMPATIBILITY.md](./ADVANCED_CANVAS_COMPATIBILITY.md) | Advanced Canvas 插件兼容性解决方案 |

### 技术参考
| 文档 | 说明 |
|------|------|
| [refer_canvas_jsonspec.md](./refer_canvas_jsonspec.md) | JSON Canvas v1.0 规范详解 + 导出算法实现 |
| [PASTE_FEATURE.md](./PASTE_FEATURE.md) | 粘贴功能 (Ctrl+V) 技术实现说明 |
| [BLOB_AND_INDEXEDDB_LIMITS.md](./BLOB_AND_INDEXEDDB_LIMITS.md) | IndexedDB 存储限制与最佳实践 |

### 更新日志
| 文档 | 说明 |
|------|------|
| [CHANGELOG.md](./CHANGELOG.md) | 版本更新记录 - 新功能、Bug 修复、技术细节 |

---

## 🗑️ 已删除/合并的文档

以下文档已整理到新的 docs/ 目录或合并到 CHANGELOG.md：

| 原文档 | 处理方式 |
|--------|----------|
| `devDoc.md` | ❌ 删除（V1.0 过时版本，已被 devdoc2.0.md 替代） |
| `CHANGELOG_VISUAL_AND_INBOX.md` | 🔀 合并到 CHANGELOG.md |
| `EXPORT_FIX_SUMMARY.md` | 🔀 合并到 CHANGELOG.md |
| `solution-add-frontmatter.txt` | ❌ 删除（与 ADVANCED_CANVAS_COMPATIBILITY.md 重复） |
| `TEST_GUIDE_PASTE.md` | ❌ 删除（内容已在 USER_GUIDE.md 中） |
| `对比测试说明.md` | ❌ 删除（临时调试占位符文档） |
| `SERVICE_WORKER_FIXES.md` | ❌ 删除（临时问题分析，无解决方案） |

---

## 📂 新文档结构

完整的开发文档已整理到 `docs/` 目录，结构更清晰：

```
docs/
├── 01-产品需求与架构/
│   ├── PRD.md
│   └── 技术架构.md
├── 02-开发指南/
│   ├── 01-数据结构设计.md
│   ├── 02-核心功能实现.md
│   └── 03-导出模块.md
├── 03-用户文档/
│   ├── 使用指南.md
│   └── 故障排查.md
├── 04-测试与质量/
│   └── 测试指南.md
├── 05-更新日志/
│   └── CHANGELOG.md
└── 06-参考资料/
    └── JSON_Canvas 规范.md
```

**注意**：此文件夹（`开发过程用到的文档`）保留的是原始开发文档，供参考历史决策过程。新整理的文档在 `docs/` 目录中。

---

## 快速导航

- 🚀 **新成员入门** → 先看 [devdoc2.0.md](./devdoc2.0.md)
- 📖 **用户使用** → 查看 [USER_GUIDE.md](./USER_GUIDE.md)
- 🔧 **开发参考** → 查看 `docs/02-开发指南/` 系列文档
- 📋 **更新记录** → 查看 [CHANGELOG.md](./CHANGELOG.md)
