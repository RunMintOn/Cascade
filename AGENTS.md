# WebCanvas - Agent Coding Guidelines

## Build Commands

```bash
npm run dev      # Development (Hot reload)
npm run build    # Production build (TypeScript + Vite)
npm run lint     # Linting
npm run preview  # Preview build
```

**No test suite** - Project has no test framework configured.

---

## Tech Stack

React 19 + TypeScript 5.9 + Vite 7 + CRXJS + Dexie + Tailwind CSS 4 + @dnd-kit + JSZip

---

## Project Structure

```
src/
├── background/        # Chrome service worker
├── content/           # Content scripts (drag detection)
└── sidepanel/         # React app
    ├── components/    # cards/, layout/, common/
    ├── services/      # db.ts, exporter.ts
    ├── App.tsx       # Main (empty - WIP)
    └── main.tsx      # React mount
```

---

## Code Style

### TypeScript

- Strict mode enabled (`strict: true`)
- `noUnusedLocals`, `noUnusedParameters` enforced
- Module: ESNext, Path alias: `@/*` → `src/*`

### Import Order

External imports first, then local imports.

### Component Pattern

```typescript
// Props interface first, then default export
interface Props { id: number; onDelete: () => void }
export default function Component({ id, onDelete }: Props) {
  const [state, setState] = useState(null)
  const handleSomething = useCallback(() => { /* ... */ }, [dep])
  return <div>{state}</div>
}
```

### Database Pattern

```typescript
// Interface → Dexie class → Export singleton + helpers
interface Node {
  id?: number
  projectId: number
  type: 'text' | 'file' | 'link'
  order: number
}

class WebCanvasDB extends Dexie {
  nodes!: EntityTable<Node, 'id'>
  constructor() {
    super('WebCanvasDB')
    this.version(1).stores({
      // ⚠️ Never index Blob fields - crashes DB
      nodes: '++id, projectId, type, order',
    })
  }
}

export const db = new WebCanvasDB()
```

### Error Handling & Type Safety

- **Never** use `any` (prefer `unknown` with guards)
- **Never** use `@ts-ignore` for actual errors
- **Always** use `?` for optional fields
- Use type guards for runtime checks
- Assert with `!` only when certain: `const img = event.target as HTMLImageElement`

### Logging

Use `[WebCanvas]` prefix: `console.log('[WebCanvas] Action:', data)`

### Styling (Tailwind)

- Use utilities: `className="bg-white rounded-lg p-4"`
- Chinese UI text acceptable: `<button>创建</button>`
- No inline CSS

### React Patterns

- Function components with hooks (no class components)
- `useCallback` for callbacks, `useMemo` for expensive computations
- `useLiveQuery` for reactive DB queries
- Cleanup in useEffect: `URL.revokeObjectURL()`
- Use `React.StrictMode` in development

### Background Service Worker

```typescript
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'downloadImage') {
    handleImageDownload(request.url, request.projectId)
      .then(sendResponse)
      .catch((error) => {
        console.error('[WebCanvas] Failed:', error)
        sendResponse({ success: false, error: error.message })
      })
    return true // Keep channel open for async
  }
})
```

### Export Pattern

Fetch → Transform → ZIP → Download. Use `URL.createObjectURL` and `URL.revokeObjectURL` for downloads.

---

## Architecture

### Stream-to-Grid Paradigm

- Browser: Vertical list (1D)
- Obsidian: Grid layout (2D)
- Store `order`, not x/y
- Export: `(index % COLS, floor(index / COLS))`

### Database Constraints

- Never index Blob fields
- Offline-only, no cloud sync
- Use transactions for multi-writes

### Chrome Extension

- Manifest V3, Side Panel API
- Content scripts inject into all pages
- Service Worker handles cross-origin requests

---

## Development Notes

- **App.tsx is empty** (WIP)
- **DropZone not implemented** (referenced in CardStream)
- Chinese UI text throughout
- Console logs: use `[WebCanvas]` prefix
- Build output: `dist/` folder
- Load unpacked: `chrome://extensions/`

---

## When Adding Features

1. Database: Interface → Dexie schema → Helper functions
2. Components: Props → Hooks → Test
3. Background: Message handler → Async response → Keep channel open
4. Content Script: Event listeners → Set dataTransfer
5. Export: Fetch → Transform → ZIP → Download

---

## Key Constants

```typescript
const CARD_WIDTH = 400
const CARD_HEIGHT_TEXT = 200
const CARD_HEIGHT_IMAGE = 300
const CARD_HEIGHT_LINK = 150
const GAP = 50
const COLS = 4
```

---

## Common Pitfalls

1. Don't index Blobs in Dexie
2. Don't forget to revoke Object URLs
3. Don't block service worker (return `true` for async)
4. Don't assume types (use guards/assertions)
5. Don't mix console.log prefixes (use `[WebCanvas]`)
6. Don't use `any`
7. Don't inline CSS

## ⚠️ 关键陷阱与排坑 (Critical Gotchas)

### 1. UI 渲染为空但无报错
- **现象**：Side Panel 是一片空白，HTML 元素存在但高度为 0，控制台没报错。
- **原因**：Vite 配置文件中缺失 `@tailwindcss/vite` 插件。
- **修复**：确保 `vite.config.ts` 的 `plugins` 数组中包含 `tailwindcss()`。

```typescript
// vite.config.ts 必须包含：
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(), // 必须在第一位！
    react(),
    crx({ manifest }),
  ],
})
```
