import { ReactNode } from 'react'

interface DropZoneProps {
  projectId: number
  children: ReactNode
}

// DropZone 占位符组件（待实现拖拽功能）
export default function DropZone({ projectId, children }: DropZoneProps) {
  return <div data-project-id={projectId}>{children}</div>
}
