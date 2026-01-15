import { useState, useEffect } from 'react'
import type { Project } from './services/db'
import ProjectList from './components/layout/ProjectList'
import CardStream from './components/layout/CardStream'
import StickyHeader from './components/layout/StickyHeader'
import { db } from './services/db'

export default function App() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  useEffect(() => {
    console.log('[WebCanvas] App component mounted')
  }, [])

  const handleDeleteNode = async (nodeId: number) => {
    await db.nodes.delete(nodeId)
  }

  if (!currentProject) {
    return (
      <>
        <StickyHeader title="我的画板" />
        <ProjectList onSelectProject={setCurrentProject} />
      </>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <StickyHeader 
        title={currentProject.name} 
        showBack 
        showExport
        onBack={() => setCurrentProject(null)}
        onExport={() => {
          // 这里将来调用 exporter.ts
          console.log('[WebCanvas] Export clicked')
        }}
      />
      <main className="flex-1 overflow-y-auto">
        <CardStream 
          projectId={currentProject.id!} 
          onDelete={handleDeleteNode}
        />
      </main>
    </div>
  )
}
