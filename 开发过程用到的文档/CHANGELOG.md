# 更新日志 (CHANGELOG)

**项目**: WebCanvas (Obsidian Browser Scout / Stream2Grid)

---

## [2.0] - 2026-01-18

### ✨ 新增功能

#### 快速收集箱 (Inbox)
- 新增默认的临时收集区，未进入项目时直接保存内容
- 收集箱在列表顶部显示，绿色主题区分
- 保护机制：收集箱无法删除
- 拖拽/粘贴到收集箱时显示绿色霓虹光效
- 成功保存后显示 Toast 提示（2 秒自动消失）

#### 视觉体验升级
- 新增霓虹呼吸光效动画（`animate-neon-breathe`）
- 拖拽反馈从虚线边框升级为沉浸式光效
- 底部胶囊型提示条（替代中央大型提示面板）
- 防遮挡覆盖层设计（光效浮于所有内容之上）

#### 全局拖拽与粘贴
- 首页（未进入项目时）支持拖拽/粘贴
- 自动保存到收集箱
- 支持蓝色（正常模式）和绿色（收集箱模式）两种主题

### 🐛 Bug 修复

#### 导出模块修复
- **Link 节点 text 字段问题**：移除 Link 节点多余的 `text` 字段，符合 JSON Canvas v1.0 规范
- **节点高度过小**：调整高度设置（Text: 120→200, Image: 200→300, Link: 100→150）
- **坐标未取整**：使用 `Math.round()` 确保坐标为整数
- **ID 格式优化**：使用标准 UUID 格式生成节点 ID

#### 错误处理
- 新增全局 Error Boundary，防止应用白屏
- 添加 `unhandledrejection` 监听，显示具体错误堆栈

#### 性能优化
- 移除重复调用的 `ensureInboxExists`，防止竞态条件
- 优化 App 初始化逻辑，确保数据库 Schema 升级完成后再加载 UI

### 📦 数据库变更

- `Project` 接口新增 `isInbox?: boolean` 字段
- 数据库版本升级至 v2
- 新增 `ensureInboxExists()` 函数，自动创建默认收集箱

### 📝 技术细节

#### 导出修复详情

**问题 1: Link 节点包含 text 字段**
```typescript
// 修复前
} else if (node.type === 'link') {
  obsidianNode.url = node.url || ''
  obsidianNode.text = node.text || node.url || ''  // ❌ 错误
}

// 修复后
} else if (node.type === 'link') {
  obsidianNode.url = node.url || ''  // ✅ 正确
}
```

**问题 2: 节点高度调整**
```typescript
// 修复前 → 修复后
CARD_HEIGHT_TEXT: 120 → 200    // +80px
CARD_HEIGHT_IMAGE: 200 → 300   // +100px
CARD_HEIGHT_LINK: 100 → 150    // +50px
```

**问题 3: 坐标取整**
```typescript
// 使用 Math.round() 确保整数
const x = Math.round(col * (CARD_WIDTH + GAP))
const y = Math.round(row * (height + GAP))
```

---

## [1.5] - 2026-01-16

### ✨ 新增功能

#### 粘贴功能 (Ctrl+V)
- 支持纯文本粘贴 → 文本卡片
- 支持剪贴板图片粘贴 → 图片卡片
- 支持 URL 粘贴 → 链接卡片
- 支持 HTML 内容粘贴 → 自动提取图片/链接

#### 来源追踪
- 自动记录来源页面 URL（`sourceUrl`）
- 自动获取来源网站 Favicon
- 卡片底部显示来源信息（可点击跳转）

### 🐛 Bug 修复

#### Service Worker 图片下载
- 修复 base64 转换 Bug
- 优化 CORS 处理（使用 `credentials: 'omit'`）
- 添加下载超时处理

---

## [1.0] - 2026-01-14

### 🎉 首次发布

#### 核心功能
- **项目管理**：创建、删除、重命名画板
- **流式卡片列表**：垂直布局，替代画布模式
- **拖拽采集**：从网页拖拽文本/图片/链接
- **内部排序**：使用 @dnd-kit 实现拖拽排序
- **删除与撤销**：删除后 3 秒内可撤销

#### 导出功能
- **List-to-Grid 算法**：一维列表转 4 列网格
- **JSON Canvas 兼容**：符合 Obsidian Canvas v1.0 规范
- **ZIP 打包**：包含 `.canvas` 文件和 `attachments/` 目录

#### 技术栈
- React 18 + Vite + CRXJS
- Dexie.js (IndexedDB)
- Tailwind CSS
- @dnd-kit
- JSZip

---

## 版本说明

### 版本号规则

采用语义化版本号：`主版本。次版本.补丁版本`

- **主版本**：架构变更或不兼容更新
- **次版本**：新功能添加
- **补丁版本**：Bug 修复和小优化

### 归档说明

本文档从 2026-01-18 开始统一维护，合并了以下文档的更新记录：
- `CHANGELOG_VISUAL_AND_INBOX.md` - 视觉升级与收集箱功能
- `EXPORT_FIX_SUMMARY.md` - 导出模块修复记录
