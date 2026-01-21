# Local Markdown Integration (Phase 1)

## Context

### Original Request
Integrate local Markdown file editing into the side panel. Use File System Access API to authorize a folder, create/edit files, and support Typora-like WYSIWYG experience with drag-and-drop web content support.

### Interview Summary
**Key Discussions**:
- **Folder Authorization**: Users authorize a root folder (e.g., Obsidian Vault) for seamless file management.
- **Card-MD Unification**: The editor should eventually bridge the gap between "cards" and "markdown blocks".
- **Editor Choice**: BlockNote (TipTap-based) selected for its block-based architecture and React 19 compatibility.
- **Assets Management**: Images stored in `assets/` subfolder using timestamp naming.

**Research Findings**:
- `FileSystemDirectoryHandle` can be stored in Dexie and persisted across browser restarts (requires user gesture for re-permission).
- BlockNote allows custom block mapping, making it ideal for future Card-to-Block conversion.

### Metis Review
**Identified Gaps** (addressed):
- **Conflict Strategy**: V1 uses auto-save but assumes plugin is the primary editor. External change monitoring is out of scope for V1.
- **Naming Collisions**: Automatically handle duplicate filenames by appending increments.
- **Permission UX**: Explicitly handle permission re-prompts on browser restart with a clear UI trigger.

---

## Work Objectives

### Core Objective
Implement a local Markdown project mode that allows creating, reading, and writing .md files in an authorized folder, providing a Typora-like editing experience.

### Concrete Deliverables
- `src/sidepanel/services/fs.ts`: File system interaction service.
- `src/sidepanel/components/local/LocalMDView.tsx`: Main editor component using BlockNote.
- Updated `db.ts`: Version 3 schema with `projectType` and `fileHandle`.
- `src/sidepanel/components/common/VaultAuth.tsx`: Authorization UI for the root folder.

### Definition of Done
- [ ] User can authorize a local folder and see its status in the UI.
- [ ] User can create a "Markdown Project" which generates a .md file in the folder.
- [ ] Typing in the editor auto-saves content to the local .md file.
- [ ] Restarting the browser allows re-authorizing the folder via a single click.

### Must Have
- File System Access API integration.
- BlockNote editor integration.
- Image assets saved to local `assets/` folder.
- Auto-save logic (debounced).

### Must NOT Have (Guardrails)
- Sub-folder browsing (V1 limited to root folder).
- Bi-directional real-time sync (external file monitoring).
- Bulk file import/export.

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: NO (Manual Verification)
- **QA approach**: Exhaustive manual QA procedures.

### Manual QA Procedures

| Type | Verification Tool | Procedure |
|------|------------------|-----------|
| **Auth** | Chrome Browser | Click 'Authorize', select folder, restart browser, verify re-auth prompt appears. |
| **I/O** | VS Code / Notepad | Create project, verify .md file exists locally. Edit in plugin, verify changes reflect in VS Code. |
| **Media** | File Explorer | Drag image into editor, verify new file appears in `assets/` folder. |

---

## Task Flow

```
Task 1 (DB Schema) → Task 2 (FS Service) → Task 3 (Vault Auth UI)
                                          ↘ Task 4 (MD Editor Integration)
                                          ↘ Task 5 (Drag-Drop Extension)
```

---

## TODOs

- [x] 1. Upgrade Database Schema (Version 3)
  **What to do**:
  - Update `Project` interface in `db.ts` to include `projectType` and `fileHandle`.
  - Implement Dexie version 3 migration to default existing projects to `canvas` type.
  **Acceptance Criteria**:
  - `db.version(3)` registered.
  - Existing projects have `projectType: 'canvas'`.
  **Parallelizable**: NO (Base for all tasks)

- [x] 2. Implement File System Service (`services/fs.ts`)
  **What to do**:
  - Create functions for: `requestDirectoryHandle()`, `verifyPermission()`, `createMDFile()`, `readFile()`, `writeFile()`.
  - Handle image writing to `assets/` subfolder.
  **Acceptance Criteria**:
  - Service functions correctly wrap File System Access API.
  - Image writing handles Blob to File conversion.
  **Parallelizable**: YES

- [x] 3. Create Vault Authorization Component (`VaultAuth.tsx`)
  **What to do**:
  - Implement UI to trigger folder selection.
  - Store handle in a global 'Settings' project or a dedicated singleton.
  - Handle permission re-request flow.
  **Acceptance Criteria**:
  - "Authorize Folder" button works.
  - Displays currently authorized path/status.
  **Parallelizable**: YES

- [x] 4. Integrate BlockNote Editor (`LocalMDView.tsx`)
  **What to do**:
  - Install `@blocknote/react`, `@blocknote/core`.
  - Create `LocalMDView` that loads file content into BlockNote.
  - Implement debounced auto-save to local file on editor change.
  **Acceptance Criteria**:
  - Editor displays MD content correctly.
  - Edits are saved to disk after 500ms of inactivity.
  **Parallelizable**: NO (Depends on 2)

- [x] 5. Extend DropZone for Markdown Projects
  **What to do**:
  - Modify `DropZone.tsx` to detect if the current project is `markdown`.
  - Instead of `addTextNode`, call `editor.insertBlocks()` or similar on the active BlockNote instance.
  **Acceptance Criteria**:
  - Dragging text from a website inserts it into the MD editor at the bottom.
  - Dragging an image saves it to `assets/` and inserts the local reference.
  **Parallelizable**: NO (Depends on 4)

---

## Commit Strategy

| After Task | Message | Files |
|------------|---------|-------|
| 1 | `chore(db): upgrade to version 3 for local md support` | db.ts |
| 2 | `feat(services): implement file system access service` | services/fs.ts |
| 3 | `feat(ui): add vault authorization flow` | VaultAuth.tsx |
| 4 | `feat(editor): integrate blocknote for wyiswyg editing` | LocalMDView.tsx |
| 5 | `feat(dragdrop): support direct insertion into markdown projects` | DropZone.tsx |

---

## Success Criteria

### Final Checklist
- [ ] Authorized folder persists across browser restarts.
- [ ] Markdown projects are clearly distinguished in the list.
- [ ] Images are stored locally in `assets/` folder.
- [ ] Editor feels like Typora (no lag, WYSIWYG).
- [ ] Content is saved correctly in UTF-8 format.
