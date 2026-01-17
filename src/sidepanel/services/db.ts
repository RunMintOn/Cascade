import Dexie, { type EntityTable } from 'dexie'

// ========== Type Definitions ==========

export interface Project {
  id?: number
  name: string
  updatedAt: number
  isInbox?: boolean // 标记是否为收集箱
}

export interface CanvasNode {
  id?: number
  projectId: number
  type: 'text' | 'file' | 'link'
  order: number
  text?: string           // Currently displayed text (always points to edited version if exists)
  originalText?: string   // Original captured text (for version comparison)
  editedText?: string     // User's edited version
  hasEdited?: boolean     // True if edited version exists
  fileData?: Blob        // Image binary data (NOT indexed!)
  fileName?: string
  url?: string
  sourceUrl?: string
  sourceIcon?: string
  createdAt: number
}

// ========== Database Definition ==========

class WebCanvasDB extends Dexie {
  projects!: EntityTable<Project, 'id'>
  nodes!: EntityTable<CanvasNode, 'id'>

  constructor() {
    super('WebCanvasDB')
    
    // Version 2: Added isInbox to projects
    this.version(2).stores({
      projects: '++id, name, updatedAt, isInbox',
      nodes: '++id, projectId, type, order, createdAt',
    })

    // Keep version 1 for backward compatibility documentation (optional)
    // this.version(1).stores({ ... })
  }
}

export const db = new WebCanvasDB()

// ========== Initialization ==========

// 确保 Inbox 存在
export async function ensureInboxExists() {
  const inbox = await db.projects.filter(p => p.isInbox === true).first()
  if (!inbox) {
    console.log('[WebCanvasDB] Creating Inbox project...')
    await db.projects.add({
      name: '收集箱',
      updatedAt: Date.now(),
      isInbox: true
    })
  }
}

// ========== Helper Functions ==========

export async function addTextNode(projectId: number, text: string, sourceUrl?: string, sourceIcon?: string) {
  const maxOrder = await db.nodes.where('projectId').equals(projectId).count()
  
  return db.nodes.add({
    projectId,
    type: 'text',
    order: maxOrder,
    text,                    // Initially points to original text
    originalText: text,        // Save original on creation
    editedText: undefined,      // No edited version yet
    hasEdited: false,           // Mark as not edited
    sourceUrl,
    sourceIcon,
    createdAt: Date.now(),
  })
}

export async function addImageNode(
  projectId: number,
  fileData: Blob,
  fileName: string,
  sourceUrl?: string
) {
  const maxOrder = await db.nodes.where('projectId').equals(projectId).count()
  
  return db.nodes.add({
    projectId,
    type: 'file',
    order: maxOrder,
    fileData,
    fileName,
    sourceUrl,
    createdAt: Date.now(),
  })
}

export async function addLinkNode(
  projectId: number,
  url: string,
  title?: string,
  sourceIcon?: string
) {
  const maxOrder = await db.nodes.where('projectId').equals(projectId).count()
  
  return db.nodes.add({
    projectId,
    type: 'link',
    order: maxOrder,
    url,
    text: title,
    sourceIcon,
    createdAt: Date.now(),
  })
}

export async function updateNodeOrder(nodeId: number, newOrder: number) {
  return db.nodes.update(nodeId, { order: newOrder })
}

export async function reorderNodes(_projectId: number, orderedIds: number[]) {
  return db.transaction('rw', db.nodes, async () => {
    await Promise.all(
      orderedIds.map((id, index) =>
        db.nodes.update(id, { order: index })
      )
    )
  })
}

// ========== Version Management ==========
/**
 * Update text node with version detection
 * - First edit: saves originalText, creates editedText
 * - Subsequent edits: only updates editedText
 * - Always updates 'text' to point to displayed version
 */
export async function updateTextNode(nodeId: number, newContent: string) {
  const node = await db.nodes.get(nodeId)
  if (!node) {
    throw new Error(`Node ${nodeId} not found`)
  }
  
  const trimmed = newContent.trim()
  
  // If content hasn't changed, do nothing
  if (node.editedText && trimmed === node.editedText) {
    return
  }
  
  // Version detection
  if (!node.hasEdited) {
    // First edit: save original and create edited version
    await db.nodes.update(nodeId, {
      originalText: node.text,
      editedText: trimmed,
      text: trimmed,
      hasEdited: true
    })
  } else {
    // Subsequent edit: only update edited version
    await db.nodes.update(nodeId, {
      editedText: trimmed,
      text: trimmed
    })
  }
  
  // Return the updated node
  return await db.nodes.get(nodeId)
}
