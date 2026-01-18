import { useEffect, useCallback } from 'react'
import { useUndo } from '../../contexts/UndoContext'

export default function UndoToast() {
  const { isVisible, hideUndo } = useUndo()

  useEffect(() => {
    if (!isVisible) return

    // 5秒后自动隐藏
    const timer = setTimeout(() => {
      hideUndo()
    }, 5000)

    return () => clearTimeout(timer)
  }, [isVisible, hideUndo])

  const handleUndo = useCallback(() => {
    // 撤回逻辑将在 App.tsx 中处理
    window.dispatchEvent(new CustomEvent('webcanvas-undo'))
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed top-6 right-6 z-[200] animate-slide-in-right">
      <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] border border-slate-700">
        {/* 成功图标 */}
        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* 文本提示 */}
        <div className="flex-1">
          <p className="text-sm font-medium">已删除</p>
          <p className="text-xs text-slate-300">按 Ctrl+Z 撤回</p>
        </div>

        {/* 撤回按钮 */}
        <button
          onClick={handleUndo}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors flex-shrink-0"
        >
          撤回
        </button>
      </div>
    </div>
  )
}
