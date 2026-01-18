import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { CanvasNode } from '../services/db'

interface UndoState {
  deletedNode: CanvasNode | null
  isVisible: boolean
  setDeletedNode: (node: CanvasNode | null) => void
  showUndo: () => void
  hideUndo: () => void
}

const UndoContext = createContext<UndoState | undefined>(undefined)

interface UndoProviderProps {
  children: ReactNode
}

export function UndoProvider({ children }: UndoProviderProps) {
  const [deletedNode, setDeletedNode] = useState<CanvasNode | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const showUndo = useCallback(() => {
    setIsVisible(true)
  }, [])

  const hideUndo = useCallback(() => {
    setIsVisible(false)
    setDeletedNode(null)
  }, [])

  return (
    <UndoContext.Provider value={{ deletedNode, isVisible, setDeletedNode, showUndo, hideUndo }}>
      {children}
    </UndoContext.Provider>
  )
}

export function useUndo() {
  const context = useContext(UndoContext)
  if (context === undefined) {
    throw new Error('useUndo must be used within an UndoProvider')
  }
  return context
}
