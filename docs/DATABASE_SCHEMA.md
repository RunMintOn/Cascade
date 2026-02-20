# 数据库 Schema (DATABASE_SCHEMA)

**最后更新**: 2026-02-20  
**数据库名称**: `CascadeDB`  
**当前版本**: 3

---

## 1. 数据库定义

### 1.1 代码位置

**文件**: `src/sidepanel/services/db.ts`

### 1.2 完整定义

```typescript
class CascadeDB extends Dexie {
  projects!: EntityTable<Project, 'id'>
  nodes!: EntityTable<CanvasNode, 'id'>

  constructor() {
    super('CascadeDB')

    const schema = {
      projects: '++id, name, updatedAt, isInbox, projectType',
      nodes: '++id, projectId, type, order, createdAt',
    }

    this.version(1).stores(schema)
    this.version(2).stores(schema)
    this.version(3).stores(schema).upgrade(tx => {
      return tx.table('projects').toCollection().modify(project => {
        if (!project.projectType) {
          project.projectType = 'canvas'
        }
      })
    })
  }
}
```

### 1.3 索引策略

```typescript
// ✅ 正确索引 - 只索引查询字段
projects: '++id, name, updatedAt, isInbox, projectType'
nodes: '++id, projectId, type, order, createdAt'

// ❌ 错误 - 不要索引 Blob 字段
nodes: '++id, projectId, fileData'  // 会导致数据库崩溃！
```

---

## 2. 数据表结构

### 2.1 Projects 表

存储画板/项目信息。

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `id` | number | 自动 | 主键 | 自增 ID |
| `name` | string | ✅ | ✅ | 项目名称 |
| `updatedAt` | number | ✅ | ✅ | 最后更新时间戳 |
| `isInbox` | boolean | - | ✅ | 是否为收集箱 |
| `projectType` | 'canvas' \| 'markdown' | - | - | 项目类型 |
| `fileHandle` | FileSystemHandle | - | - | 本地 MD 文件句柄 |

**示例**:
```typescript
{
  id: 1,
  name: '收集箱',
  updatedAt: 1708412345678,
  isInbox: true,
  projectType: 'canvas'
}
```

### 2.2 Nodes 表

存储卡片节点数据。

| 字段 | 类型 | 必填 | 索引 | 说明 |
|------|------|------|------|------|
| `id` | number | 自动 | 主键 | 自增 ID |
| `projectId` | number | ✅ | ✅ | 所属项目 ID |
| `type` | 'text' \| 'file' \| 'link' | ✅ | ✅ | 节点类型 |
| `order` | number | ✅ | ✅ | 排序索引 |
| `createdAt` | number | ✅ | ✅ | 创建时间戳 |
| `text` | string | - | - | 当前显示文本 |
| `originalText` | string | - | - | 原始捕获文本 |
| `editedText` | string | - | - | 编辑版本文本 |
| `hasEdited` | boolean | - | - | 是否已编辑 |
| `fileData` | Blob | - | - | 图片二进制 |
| `fileName` | string | - | - | 文件名 |
| `url` | string | - | - | 链接 URL |
| `sourceUrl` | string | - | - | 来源网页 URL |
| `sourceIcon` | string | - | - | 来源 Favicon |

**示例 - 文本节点**:
```typescript
{
  id: 1,
  projectId: 1,
  type: 'text',
  order: 0,
  text: '这是编辑后的文本',
  originalText: '这是原始捕获的文本',
  editedText: '这是编辑后的文本',
  hasEdited: true,
  sourceUrl: 'https://example.com/page',
  sourceIcon: 'https://example.com/favicon.ico',
  createdAt: 1708412345678
}
```

**示例 - 图片节点**:
```typescript
{
  id: 2,
  projectId: 1,
  type: 'file',
  order: 1,
  fileName: 'image-1708412345678.png',
  fileData: Blob(...),  // 不索引
  sourceUrl: 'https://example.com/image.png',
  createdAt: 1708412345678
}
```

**示例 - 链接节点**:
```typescript
{
  id: 3,
  projectId: 1,
  type: 'link',
  order: 2,
  url: 'https://example.com',
  text: '页面标题',
  sourceIcon: 'https://example.com/favicon.ico',
  createdAt: 1708412345678
}
```

---

## 3. 数据库版本历史

### v1 → v2 → v3

| 版本 | 变更 | 迁移逻辑 |
|------|------|----------|
| v1 | 初始版本 | - |
| v2 | 添加 `isInbox` 字段 | 无数据迁移 |
| v3 | 添加 `projectType`, `fileHandle` | 默认 `projectType='canvas'` |

### v3 迁移代码

```typescript
this.version(3).stores(schema).upgrade(tx => {
  return tx.table('projects').toCollection().modify(project => {
    if (!project.projectType) {
      project.projectType = 'canvas'
    }
  })
})
```

---

## 4. 数据迁移

### 4.1 从 WebCanvasDB 迁移

**触发条件**: 检测到旧数据库 `WebCanvasDB` 存在

**迁移逻辑**:
```typescript
this.on('ready', async () => {
  const oldDbName = 'WebCanvasDB'
  const exists = await Dexie.exists(oldDbName)
  if (exists) {
    const oldDb = new Dexie(oldDbName)
    await oldDb.open()
    
    // 迁移 Projects
    const oldProjects = await oldDb.table('projects').toArray()
    for (const p of oldProjects) {
      const newProjectId = await this.projects.add({
        name: p.name,
        updatedAt: p.updatedAt,
        isInbox: p.isInbox
      })
      
      // 迁移 Nodes
      const oldNodes = await oldDb.table('nodes')
        .where('projectId').equals(p.id).toArray()
      for (const n of oldNodes) {
        await this.nodes.add({ ...n, projectId: newProjectId })
      }
    }
  }
})
```

---

## 5. 常用查询操作

### 5.1 项目查询

```typescript
// 获取所有项目
const projects = await db.projects.toArray()

// 获取 Inbox
const inbox = await db.projects.filter(p => p.isInbox === true).first()

// 按名称查找
const project = await db.projects.where('name').equals('收集箱').first()
```

### 5.2 节点查询

```typescript
// 获取项目的所有节点（按 order 排序）
const nodes = await db.nodes
  .where('projectId').equals(projectId)
  .sortBy('order')

// 获取特定类型的节点
const textNodes = await db.nodes
  .where('type').equals('text')
  .and(node => node.projectId === projectId)
  .toArray()

// 获取节点总数
const count = await db.nodes.where('projectId').equals(projectId).count()
```

### 5.3 节点操作

```typescript
// 添加节点
await db.nodes.add({
  projectId: 1,
  type: 'text',
  order: 0,
  text: 'Hello',
  createdAt: Date.now()
})

// 更新节点
await db.nodes.update(nodeId, { text: 'New text' })

// 删除节点
await db.nodes.delete(nodeId)

// 批量更新 order
await db.transaction('rw', db.nodes, async () => {
  await Promise.all(
    orderedIds.map((id, index) =>
      db.nodes.update(id, { order: index })
    )
  )
})
```

---

## 6. 文本版本控制

### 6.1 字段说明

| 字段 | 说明 | 何时更新 |
|------|------|----------|
| `text` | 当前显示文本 | 始终指向显示版本 |
| `originalText` | 原始捕获文本 | 第一次编辑时保存 |
| `editedText` | 编辑版本文本 | 编辑时更新 |
| `hasEdited` | 是否已编辑 | 第一次编辑时设为 true |

### 6.2 版本控制逻辑

```typescript
// 第一次编辑
if (!node.hasEdited) {
  await db.nodes.update(nodeId, {
    originalText: node.text,  // 保存原始
    editedText: trimmed,      // 创建编辑版本
    text: trimmed,            // 指向编辑版本
    hasEdited: true
  })
} else {
  // 后续编辑
  await db.nodes.update(nodeId, {
    editedText: trimmed,
    text: trimmed
  })
}
```

### 6.3 UI 切换显示

```typescript
// TextCard 组件中
const [isShowingOriginal, setIsShowingOriginal] = useState(false)

// 显示原始版本
{isShowingOriginal ? originalText : text}

// 切换按钮
<button onClick={() => setIsShowingOriginal(!isShowingOriginal)}>
  {isShowingOriginal ? "显示编辑版本" : "显示原始版本"}
</button>
```

---

## 7. 最佳实践

### 7.1 索引使用

```typescript
// ✅ 高效 - 使用索引
await db.nodes.where('projectId').equals(1).toArray()

// ❌ 低效 - 全表扫描
const all = await db.nodes.toArray()
const filtered = all.filter(n => n.projectId === 1)
```

### 7.2 事务使用

```typescript
// 批量操作使用事务
await db.transaction('rw', db.nodes, async () => {
  await db.nodes.add(node1)
  await db.nodes.add(node2)
  await db.nodes.add(node3)
})
```

### 7.3 Blob 处理

```typescript
// ✅ 正确 - Blob 不索引
nodes: '++id, projectId, type, order, createdAt'

// ❌ 错误 - 会导致崩溃
nodes: '++id, projectId, fileData'
```

### 7.4 响应式查询

```typescript
// 在 React 组件中使用
const nodes = useLiveQuery(
  () => db.nodes.where('projectId').equals(projectId).sortBy('order'),
  [projectId]
)
```

---

## 8. 调试

### 8.1 查看数据库内容

```javascript
// 浏览器 Console 中
db.projects.toArray().then(console.log)
db.nodes.toArray().then(console.log)
```

### 8.2 检查索引

```javascript
// 检查表结构
db.tables.forEach(table => {
  console.log(table.name, table.schema)
})
```

### 8.3 常见问题

| 问题 | 排查 |
|------|------|
| 查询返回空 | 检查索引是否正确 |
| Blob 存储失败 | 确认未索引 fileData |
| 版本迁移失败 | 检查 upgrade 逻辑 |
