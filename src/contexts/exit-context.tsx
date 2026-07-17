import { createContext, useContext, useSyncExternalStore, useCallback, type ReactNode } from 'react'
import { exitStore } from '@/lib/exit-store'
import type { ExitItem } from '@/types'

interface ExitContextType {
  items: ExitItem[]
  toggleTask: (itemId: string, taskId: string) => void
}

const ExitContext = createContext<ExitContextType | null>(null)

export function ExitProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(exitStore.subscribe, exitStore.getSnapshot)

  const toggleTask = useCallback((itemId: string, taskId: string) => {
    exitStore.toggleTask(itemId, taskId)
  }, [])

  return (
    <ExitContext.Provider value={{ items, toggleTask }}>
      {children}
    </ExitContext.Provider>
  )
}

export function useExit() {
  const context = useContext(ExitContext)
  if (!context) throw new Error('useExit must be used within an ExitProvider')
  return context
}
