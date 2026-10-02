import { useCallback, useEffect, useRef, useState } from 'react';

// Each list owns its session; no state is shared between separate lists.
export function useListDragSession() {
  const [isDragSessionActive, setIsDragSessionActive] = useState(false);
  const cancelDragRef = useRef<(() => void) | null>(null);

  const startDragSession = useCallback((cancelDrag: () => void) => {
    cancelDragRef.current = cancelDrag;
    setIsDragSessionActive(true);
  }, []);

  const endDragSession = useCallback(() => {
    cancelDragRef.current = null;
    setIsDragSessionActive(false);
  }, []);

  useEffect(() => {
    function cancelDragSession() {
      cancelDragRef.current?.();
      endDragSession();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') cancelDragSession();
    }

    window.addEventListener('pointercancel', cancelDragSession);
    window.addEventListener('blur', cancelDragSession);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointercancel', cancelDragSession);
      window.removeEventListener('blur', cancelDragSession);
      window.removeEventListener('keydown', handleKeyDown);
      cancelDragRef.current?.();
    };
  }, [endDragSession]);

  return { isDragSessionActive, startDragSession, endDragSession };
}
