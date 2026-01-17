# WebCanvas - Agent Coding Guidelines

## Build Commands

```bash
npm run dev      # Development (Hot reload, outputs to dist/)
npm run build    # Production build (tsc + vite build + fix-build.cjs)
npm run lint     # ESLint check
npm run preview  # Preview build
```

**No test suite** - Project has no test framework.

## Response Guidelines
DO NOT:
- Explain your thinking process in the final answer
- Provide lengthy justifications unless asked
- Walk through your analysis unless I request it
DO:
- Give me the direct answer/result
- Be as concise as possible
- Assume I don't need to see how you got there unless I ask

** Your internal reasoning should be thorough - this only affects what you show me as your final response. **

## Tech Stack

React 19 + TypeScript 5.9 + Vite 7 + CRXJS + Dexie + Tailwind CSS 4 + @dnd-kit + JSZip

## Project Structure

```
src/
├── background/        # Chrome service worker (cross-origin requests)
├── content/           # Content scripts (drag detection on web pages)
└── sidepanel/         # React app
    ├── components/    # cards/, layout/, common/
    ├── services/      # db.ts (Dexie), exporter.ts (ZIP export)
    ├── App.tsx       # Main component
    ├── main.tsx      # React mount with error boundary
    └── index.css     # Tailwind imports + custom animations
```

## Code Style

- **TypeScript**: Strict mode, ESNext modules, `@/*` path alias. Prefer `unknown` over `any`. Use `@ts-ignore` sparingly (only in exporter.ts for PromiseExtended types)
- **Imports**: External → local → relative. Use dynamic imports to avoid circular deps
- **UI**: Chinese text acceptable (`<button>创建</button>`)
- **Logs**: Always prefix with `[WebCanvas]` or `[WebCanvasDB]`
- **Comments**: Chinese comments encouraged for business logic

### React Pattern

```typescript
// Props interface → default export → hooks → cleanup
interface Props { id: number; onDelete: () => void }
export default function Component({ id, onDelete }: Props) {
  const [state, setState] = useState(null)
  const handleX = useCallback(() => { /* ... */ }, [dep])

  useEffect(() => {
    // Setup
    return () => { /* Cleanup */ }
  }, [dep])

  return <div>{state}</div>
}
```

### Dexie Database

```typescript
// Interface → Dexie class → Export singleton
interface CanvasNode {
  id?: number; projectId: number; type: 'text' | 'file' | 'link'
  order: number; fileData?: Blob  // ⚠️ NEVER index!
  createdAt: number
}
class WebCanvasDB extends Dexie {
  nodes!: EntityTable<CanvasNode, 'id'>
  constructor() {
    super('WebCanvasDB')
    // Version 2: Added isInbox to projects
    this.version(2).stores({
      nodes: '++id, projectId, type, order, createdAt',  // No fileData!
    })
  }
}
export const db = new WebCanvasDB()
```

### Hooks & Patterns
- `useCallback`/`useMemo` for performance
- `useLiveQuery` (dexie-react-hooks) for reactive DB queries
- Cleanup: `URL.revokeObjectURL()` in useEffect
- Optional fields: `?` with null checks
- Refs for DOM refs: `const el = contentRef.current`

### Error Handling

```typescript
// Try-catch with proper logging
try {
  await operation()
} catch (err) {
  console.error('[WebCanvas] Operation failed:', err)
  // User-facing feedback
  alert('操作失败: ' + (err instanceof Error ? err.message : '未知错误'))
}
```

### Service Worker (Async Handler)

```typescript
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'downloadImage') {
    handleImageDownload(request.url, request.projectId)
      .then(sendResponse)
      .catch(e => sendResponse({ success: false, error: e.message }))
    return true // Keep channel open for async
  }
})
```

### Tailwind CSS 4
- Utilities only: `className="bg-white rounded-lg p-4"`
- No inline CSS, custom animations in index.css
- Color palette: `slate-50` (bg), `blue-600` (primary), `green-500` (inbox)
- Inbox mode uses green variants

## Architecture

**Stream-to-Grid**: Browser stores as 1D list (`order`), exports to 2D Obsidian grid via `(index % COLS, floor(index / COLS))`

**Database**: IndexedDB via Dexie. Never index Blob fields. Use transactions for multi-writes. Offline-only.

**Chrome Extension (V3)**: Side Panel API + content scripts (drag detection) + service worker (cross-origin fetch). Load unpacked from `dist/`.

**Inbox Feature**: Default project with `isInbox: true`, created on init via `ensureInboxExists()`. Priority display in project list.

## Export Pattern

Fetch → Transform → ZIP → Download. Normalize `\r\n` → `\n`. Use `URL.createObjectURL()`/`revokeObjectURL()`. Link nodes: `url` field only in Obsidian spec.

## Common Pitfalls

1. Never index Blobs in Dexie (crashes)
2. Always revoke Object URLs
3. Always return `true` for async service worker
4. Use type assertions: `const img = event.target as HTMLImageElement`
5. Prefix all logs with `[WebCanvas]`
6. Inbox project cannot be deleted (check `isInbox` flag)
7. Avoid circular dependencies in imports (use dynamic imports)

## ⚠️ Critical Gotchas

### UI Renders Empty (No Errors)
**Cause**: Missing `@tailwindcss/vite` in vite.config.ts. **Fix**: Ensure `tailwindcss()` is first plugin:

```typescript
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [tailwindcss(), react(), crx({ manifest })],
})
```

### Content Script DataTransfer Fails
**Issue**: Some sites (GitHub) block custom dataTransfer. **Fallback**: Cache in background via `setDragPayload`, retrieve via `getDragPayload`. Expire after 5 seconds.

### contentEditable Blur Race Condition
**Issue**: Clicking save button triggers blur → save. **Fix**: Check `e.relatedTarget` in blur handler to ignore if clicking save button:

```typescript
onBlur={(e) => {
  if (e.relatedTarget && (e.relatedTarget as HTMLElement).closest('[data-action="save"]')) return
  handleSave()
}}
```
