import { useState, useCallback, useRef, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Project } from '../../services/db'
import VaultAuth from '../common/VaultAuth'

interface ProjectListProps {
  onSelectProject: (project: Project) => void
}

export default function ProjectList({ onSelectProject }: ProjectListProps) {
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createType, setCreateType] = useState<'canvas' | 'markdown'>('canvas')
  const [vaultAuthorized, setVaultAuthorized] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus edit input
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  // Check vault status
  const checkVault = async () => {
    const vault = await db.projects.where('name').equals('___VAULT_ROOT___').first()
    setVaultAuthorized(!!vault && !!vault.fileHandle)
  }

  // Check on mount and when creating
  useEffect(() => {
    checkVault()
  }, [])

  const projects = useLiveQuery(async () => {
    // 获取所有项目
    const allProjects = await db.projects.orderBy('updatedAt').reverse().toArray()

    // 分离 Inbox 和普通项目
    const inbox = allProjects.find(p => p.isInbox)
    const others = allProjects.filter(p => !p.isInbox)

    // Inbox 置顶
    return inbox ? [inbox, ...others] : others
  })

  // 获取每个项目的节点数量
  const nodeCounts = useLiveQuery(async () => {
    const counts: Record<number, number> = {}
    const nodes = await db.nodes.toArray()
    nodes.forEach(node => {
      if (node.projectId) {
        counts[node.projectId] = (counts[node.projectId] || 0) + 1
      }
    })
    return counts
  })

  const handleCreateProject = useCallback(async () => {
    if (!newProjectName.trim()) return

    try {
      let fileHandle: FileSystemHandle | undefined

      if (createType === 'markdown') {
        // Get Vault Root
        const vault = await db.projects.where('name').equals('___VAULT_ROOT___').first()
        if (!vault || !vault.fileHandle) {
          alert('请先授权本地文件夹')
          return
        }
        
        // Create file in Vault
        const rootHandle = vault.fileHandle as FileSystemDirectoryHandle
        
        let finalName = newProjectName.trim()
        let filename = `${finalName}.md`
        
        // Check for naming collision
        try {
          await rootHandle.getFileHandle(filename)
          let i = 1
          while (true) {
            finalName = `${newProjectName.trim()} (${i})`
            filename = `${finalName}.md`
            try {
              await rootHandle.getFileHandle(filename)
              i++
            } catch {
              break
            }
          }
        } catch {
        }

        const file = await rootHandle.getFileHandle(filename, { create: true })
        fileHandle = file
        
        const id = await db.projects.add({
          name: finalName,
          updatedAt: Date.now(),
          projectType: createType,
          fileHandle: fileHandle as any 
        })

        setNewProjectName('')
        setIsCreating(false)
        setCreateType('canvas') 

        onSelectProject({
          id: id as number,
          name: finalName,
          updatedAt: Date.now(),
          projectType: createType,
          fileHandle: fileHandle as any
        })
        return 
      }

      const id = await db.projects.add({
        name: newProjectName.trim(),
        updatedAt: Date.now(),
        projectType: createType,
        fileHandle: fileHandle as any 
      })

      setNewProjectName('')
      setIsCreating(false)
      setCreateType('canvas') 

      onSelectProject({
        id: id as number,
        name: newProjectName.trim(),
        updatedAt: Date.now(),
        projectType: createType,
        fileHandle: fileHandle as any
      })
    } catch (e) {
      console.error('[Cascade] Failed to create project:', e)
      alert('创建失败: ' + (e as Error).message)
    }
  }, [newProjectName, createType, onSelectProject])

  const handleRenameProject = async (projectId: number) => {
    if (!editName.trim()) {
      setEditingId(null)
      return
    }

    try {
      await db.projects.update(projectId, {
        name: editName.trim(),
        updatedAt: Date.now()
      })
      setEditingId(null)
    } catch (err) {
      console.error('[Cascade] Failed to rename project:', err)
      alert('重命名失败')
    }
  }

  const handleDeleteProject = useCallback(async (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation()
    if (confirm('确定要删除这个画板吗？所有卡片也会被删除。')) {
      await db.nodes.where('projectId').equals(projectId).delete()
      await db.projects.delete(projectId)
    }
  }, [])

  const startEditing = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    if (project.isInbox) return
    setEditingId(project.id!)
    setEditName(project.name)
  }

  if (projects === undefined) {
    return (
      <div className="p-4 text-slate-500 text-center">
        加载中...
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Vault Authorization */}
      <VaultAuth />

      {/* Create Project Section */}
      {isCreating ? (
        <div className="mb-4 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="输入画板名称..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateProject()
              if (e.key === 'Escape') setIsCreating(false)
            }}
          />
          
          {vaultAuthorized && (
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setCreateType('canvas')}
                className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
                  createType === 'canvas'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🎨 画布模式
              </button>
              <button
                onClick={() => setCreateType('markdown')}
                className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
                  createType === 'markdown'
                    ? 'bg-purple-50 border-purple-200 text-purple-700 font-medium'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                📝 Markdown
              </button>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCreateProject}
              className="flex-1 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              创建
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="flex-1 py-1.5 bg-slate-100 text-slate-600 text-sm rounded-md hover:bg-slate-200"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full mb-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-500 hover:text-blue-600 transition-colors font-medium text-sm"
        >
          + 新建画板
        </button>
      )}

      {/* Projects List */}
      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject(project)}
            className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
              project.isInbox 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-400' 
                : 'bg-white border-slate-200 hover:border-blue-400'
            }`}
          >
            {!project.isInbox && (
              <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-30">
                <button
                  onClick={(e) => startEditing(e, project)}
                  className="w-7 h-7 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-sm hover:scale-110 active:scale-95"
                  title="重命名"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => handleDeleteProject(e, project.id!)}
                  className="w-7 h-7 flex items-center justify-center bg-[#e05f65] hover:bg-[#af3029] text-white rounded-full shadow-sm hover:scale-110 active:scale-95"
                  title="删除画板"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                {editingId === project.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleRenameProject(project.id!)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameProject(project.id!)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="w-full px-2 py-1 text-base font-semibold border-2 border-blue-400 rounded-md focus:outline-none bg-white text-slate-800"
                  />
                ) : (
                  <h3 className={`font-semibold text-base mb-0.5 truncate ${
                    project.isInbox ? 'text-green-800' : 'text-slate-800'
                  }`}>
                    {project.name}
                    {project.isInbox && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase tracking-wider">
                        Inbox
                      </span>
                    )}
                  </h3>
                )}
                <p className={`text-[10px] font-medium ${
                  project.isInbox ? 'text-green-600/60' : 'text-slate-400'
                }`}>
                  {new Date(project.updatedAt).toLocaleDateString()} · {new Date(project.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-none ml-4">
                {project.isInbox && (
                  <div className="text-green-500/10 pointer-events-none">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                )}
                <div className={`flex flex-col items-end gap-0.5`}>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border shadow-sm ${
                    project.isInbox
                      ? 'bg-green-200/40 text-green-700 border-green-200/50'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {nodeCounts && nodeCounts[project.id!] !== undefined
                      ? `${nodeCounts[project.id!]} 项`
                      : '0 项'
                    }
                  </span>
                  {project.projectType === 'markdown' && (
                    <span className="text-[9px] font-bold text-purple-500/70 uppercase tracking-tighter">Markdown</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !isCreating && (
        <div className="text-center text-slate-500 py-12 bg-white/50 rounded-2xl border-2 border-dashed border-slate-200 mt-4">
          <div className="text-4xl mb-3 opacity-20">📁</div>
          <p className="font-medium">还没有画板</p>
          <p className="text-xs opacity-60">点击上方按钮创建第一个画板</p>
        </div>
      )}
    </div>
  )
}
