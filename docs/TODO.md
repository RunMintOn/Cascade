# 待实现功能 (TODO)

**最后更新**: 2026-02-20

---

## 优先级说明

| 优先级 | 说明 | 时间框架 |
|--------|------|----------|
| **P0** | 关键功能，必须实现 | 2 周内 |
| **P1** | 高优先级，用户强需求 | 1 个月内 |
| **P2** | 中优先级，改进体验 | 3 个月内 |
| **P3** | 低优先级，锦上添花 | 6 个月内 |

---

## P0: 关键功能

<!-- 当前无 P0 级别任务 -->

---

## P1: 高优先级

### 1. 批量导出进度条

**状态**: ❌ 未实现  
**优先级**: P1  
**工作量**: 1-2 天

**需求描述**:
导出大项目（10+ 图片）时显示进度条，避免用户以为卡死。

**技术实现**:
```typescript
// src/sidepanel/services/exporter.ts

export async function exportToCanvas(
  projectId: number,
  projectName: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  // ...
  
  // 添加图片时更新进度
  const total = imageNodes.length
  for (let i = 0; i < total; i++) {
    const node = imageNodes[i]
    attachmentsFolder!.file(node.fileName, node.fileData)
    onProgress?.(((i + 1) / total) * 100)
  }
}
```

**UI 组件**:
```typescript
// src/sidepanel/components/common/ExportProgress.tsx

export function ExportProgress({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
```

**验收标准**:
- [ ] 导出时显示进度条
- [ ] 进度条实时更新
- [ ] 导出完成后自动隐藏

---

### 2. 虚拟滚动

**状态**: ❌ 未实现  
**优先级**: P1  
**工作量**: 3-5 天

**需求描述**:
当卡片数量超过 50 张时，只渲染可见区域的卡片，提升性能。

**技术方案**:
- 使用 `react-window` 或 `@tanstack/virtual`
- 估算卡片高度（文本 200px，图片 300px，链接 150px）
- 只渲染视口内 + 缓冲区的卡片

**验收标准**:
- [ ] 100 张卡片流畅滚动
- [ ] 内存占用明显降低
- [ ] 无闪烁

---

## P2: 中优先级

### 1. 卡片搜索

**状态**: ❌ 未实现  
**优先级**: P2  
**工作量**: 2-3 天

**需求描述**:
在当前项目中搜索卡片内容。

**功能点**:
- 全文搜索（文本卡片内容）
- 高亮显示匹配项
- 支持正则表达式（高级）

**技术实现**:
```typescript
// 简单搜索
const searchResults = nodes.filter(node => {
  if (node.type === 'text') {
    return node.text.toLowerCase().includes(query.toLowerCase())
  }
  return false
})
```

---

### 2. 导出格式自定义

**状态**: ❌ 未实现  
**优先级**: P2  
**工作量**: 1-2 天

**需求描述**:
允许用户自定义导出格式：
- 列数（2/3/4/5 列）
- 卡片宽度
- 间距

**UI 组件**:
```typescript
// src/sidepanel/components/common/ExportSettings.tsx

export function ExportSettings({
  cols,
  setCols,
  onExport
}: ExportSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label>列数</label>
        <select value={cols} onChange={e => setCols(Number(e.target.value))}>
          <option value={2}>2 列</option>
          <option value={3}>3 列</option>
          <option value={4}>4 列（默认）</option>
          <option value={5}>5 列</option>
        </select>
      </div>
      <button onClick={onExport}>导出</button>
    </div>
  )
}
```

---

### 3. 批量选择删除

**状态**: ❌ 未实现  
**优先级**: P2  
**工作量**: 2 天

**需求描述**:
支持多选卡片后批量删除。

**功能点**:
- 长按进入选择模式
- 点击选择/取消选择
- 底部工具栏（删除、导出选中）

---

### 4. 深色模式

**状态**: ❌ 未实现  
**优先级**: P2  
**工作量**: 2-3 天

**需求描述**:
支持深色/浅色主题切换。

**技术方案**:
- 使用 Tailwind 的 `dark:` 变体
- 系统偏好自动切换
- 手动切换按钮

---

## P3: 低优先级

### 1. 卡片连线

**状态**: ❌ 未实现  
**优先级**: P3  
**工作量**: 5-7 天

**需求描述**:
在浏览器端支持卡片连线，导出时保留 edges。

**技术方案**:
- 使用 `reactflow` 或 `xyflow`
- 拖拽创建连线
- 存储到数据库 `edges` 表

---

### 2. 双向同步

**状态**: ❌ 未实现  
**优先级**: P3  
**工作量**: 10+ 天

**需求描述**:
从 Obsidian 同步变更回浏览器。

**技术方案**:
- 监听 Obsidian Vault 变化
- WebSocket 或本地文件监听
- 冲突解决策略

---

### 3. 更多节点类型

**状态**: ❌ 未实现  
**优先级**: P3  

| 类型 | 说明 |
|------|------|
| 视频 | 嵌入 YouTube/Bilibili |
| 音频 | 嵌入播客/音乐 |
| PDF | PDF 预览 |
| 代码 | 代码片段（语法高亮） |

---

## 技术债务

### 1. 测试覆盖率

**当前状态**: 0%

**需要**:
- [ ] 单元测试（Vitest）
- [ ] 端到端测试（Playwright）
- [ ] 关键路径测试（拖拽、导出）

### 2. 代码质量

**需要**:
- [ ] ESLint 规则完善
- [ ] TypeScript 严格模式
- [ ] 代码注释规范化

### 3. 文档更新机制

**问题**: 文档与代码不同步

**解决**:
- [ ] 代码变更时必须更新文档
- [ ] PR 模板包含文档检查项
- [ ] 自动生成 API 文档

---

## 功能请求

### 来自用户的建议

| 功能 | 请求次数 | 状态 |
|------|----------|------|
| 批量导出进度条 | 高 | P1 |
| 虚拟滚动 | 中 | P1 |
| 深色模式 | 中 | P2 |
| 卡片连线 | 低 | P3 |

---

## 贡献指南

### 如何认领任务

1. 在 GitHub Issue 中评论"我想做这个"
2. 等待 maintainer 分配
3. Fork 项目并创建分支
4. 完成开发后提交 PR

### PR 要求

- [ ] 代码通过 ESLint
- [ ] 添加必要的测试
- [ ] 更新相关文档
- [ ] 描述清晰的变更说明

---

**最后更新**: 2026-02-20  
**维护者**: Cascade 开发团队
