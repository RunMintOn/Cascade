# 更新日志：视觉升级与收集箱功能 (2026-01-18)

本次更新主要集中在**拖拽反馈的视觉升级**以及**快速收集箱 (Inbox)** 功能的实现。

## 1. 视觉体验升级 (Visual Enhancements)

针对拖拽上传的交互体验进行了深度优化，从简单的边框提示升级为沉浸式的科幻/霓虹风格。

### 1.1 霓虹呼吸光效 (Neon Glow)
- **文件**: `src/sidepanel/index.css`
- **改动**:
  - 移除了旧的虚线边框动画。
  - 新增 `animate-neon-breathe` (蓝色) 和 `animate-neon-breathe-green` (绿色) 动画。
  - 使用多层 `box-shadow` 实现高能粒子流效果，核心高亮，边缘弥散。
  - 添加了全屏半透明背景色，增强沉浸感。

### 1.2 防遮挡覆盖层
- **文件**: `src/sidepanel/components/common/DropZone.tsx`
- **改动**:
  - 将光效层提取为独立的 `absolute` 定位 `div`，`z-index` 设为 100，确保光效浮于所有卡片内容之上。
  - 解决了之前“内容遮挡边框光效”的问题。

### 1.3 极简底部提示胶囊 (Minimalist Pill)
- **文件**: `src/sidepanel/components/common/DropZone.tsx`
- **改动**:
  - 移除了屏幕中央的大型提示面板。
  - 改为屏幕底部居中的**胶囊型提示条**。
  - 使用 `fixed` 定位，确保无论页面滚动到哪里，提示条始终可见。
  - 底部添加了渐变遮罩，保证在白色背景下文字依然清晰。
  - 提示文案根据模式动态切换：“释放以添加内容” (蓝色) / “释放保存到收集箱” (绿色)。

---

## 2. 快速收集箱功能 (Inbox / Quick Save)

实现了“未进入项目也能直接保存内容”的需求，减少用户操作路径。

### 2.1 数据库变更
- **文件**: `src/sidepanel/services/db.ts`
- **改动**:
  - `Project` 接口新增 `isInbox?: boolean` 字段。
  - 数据库版本号升级至 `2`。
  - 新增 `ensureInboxExists()` 函数，初始化时自动创建默认的“收集箱”项目。

### 2.2 全局拖拽与粘贴
- **文件**: `src/sidepanel/App.tsx`
- **改动**:
  - 在首页（`currentProject` 为空时）引入 `DropZone` 组件。
  - 自动获取 Inbox 项目 ID 并传给 `DropZone`。
  - 实现了**绿色主题**的收集模式：在首页拖拽/粘贴内容，直接保存至收集箱。

### 2.3 交互反馈 (Toast)
- **文件**: `src/sidepanel/App.tsx`, `src/sidepanel/components/common/DropZone.tsx`
- **改动**:
  - `DropZone` 新增 `onSuccess` 回调。
  - `App` 中实现了简单的 Toast 组件。
  - 当内容成功保存到收集箱时，顶部弹出“已保存到收集箱”提示，2秒后自动消失。

### 2.4 收集箱置顶与特殊样式
- **文件**: `src/sidepanel/components/layout/ProjectList.tsx`
- **改动**:
  - 列表加载逻辑更新：优先展示 Inbox 项目，然后是其他项目。
  - 样式区分：Inbox 项目使用绿色渐变背景 (`from-green-50 to-emerald-50`)，带有“默认”标签和专属图标。
  - 保护机制：Inbox 项目不显示删除按钮。

---

## 3. 稳定性与 Bug 修复

### 3.1 错误处理
- **文件**: `src/sidepanel/main.tsx`
- **改动**: 添加了全局 Error Boundary 和 `unhandledrejection` 监听，防止应用因未捕获的错误而白屏，改为显示具体的错误堆栈。

### 3.2 性能与逻辑优化
- **文件**: `src/sidepanel/components/layout/ProjectList.tsx`
- **改动**: 移除了重复调用的 `ensureInboxExists`，防止竞态条件。
- **App初始化**: 优化了 `App.tsx` 中的异步初始化逻辑，确保数据库 Schema 升级完成后再加载 UI。
