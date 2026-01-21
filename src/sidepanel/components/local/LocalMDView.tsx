import { useEffect, useState, useRef, useCallback } from 'react';
import { BlockNoteViewRaw } from '@blocknote/react';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/react/style.css';
import type { Project } from '../../services/db';

interface LocalMDViewProps {
  fileHandle: FileSystemFileHandle;
  project: Project;
}

export default function LocalMDView({ fileHandle, project: _project }: LocalMDViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create editor instance
  const editor = useCreateBlockNote();

  // Load file content
  useEffect(() => {
    let mounted = true;

    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const file = await fileHandle.getFile();
        const text = await file.text();
        
        if (!mounted) return;

        const blocks = await editor.tryParseMarkdownToBlocks(text);
        editor.replaceBlocks(editor.document, blocks);
        
        setLoading(false);
      } catch (err) {
        console.error('[WebCanvas] Failed to load local markdown:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load file');
          setLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      mounted = false;
    };
  }, [fileHandle, editor]);

  // Save handler
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      const markdown = await editor.blocksToMarkdownLossy(editor.document);
      
      const writable = await fileHandle.createWritable();
      await writable.write(markdown);
      await writable.close();
      
      setIsSaving(false);
    } catch (err) {
      console.error('[WebCanvas] Failed to save local markdown:', err);
      // Optional: Show error toast or indicator
      setIsSaving(false);
    }
  }, [fileHandle, editor]);

  // Debounced change handler
  const handleChange = useCallback(() => {
    if (loading) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, 500);
  }, [handleSave, loading]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-slate-500 text-sm">Loading {fileHandle.name}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">Error loading file</p>
          <p className="text-slate-600 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white flex flex-col relative group">
      {/* Status Indicator */}
      <div className="absolute top-2 right-4 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <span className={`text-xs px-2 py-1 rounded-full ${
          isSaving ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
        }`}>
          {isSaving ? 'Saving...' : 'Saved'}
        </span>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <BlockNoteViewRaw 
          editor={editor} 
          onChange={handleChange}
          theme="light"
          className="min-h-full py-8"
        />
      </div>
    </div>
  );
}
