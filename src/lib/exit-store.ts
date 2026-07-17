import type { ExitItem } from '@/types'
import { exitItems as mockExit } from '@/data/mock'

const STORAGE_KEY = 'hrms-exit'

let cachedSnapshot: ExitItem[] = loadFromStorage()

function loadFromStorage(): ExitItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return [...mockExit]
}

function persist(items: ExitItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  cachedSnapshot = items
  listeners.forEach((l) => l())
}

type Listener = () => void
const listeners: Set<Listener> = new Set()

export const exitStore = {
  getSnapshot: (): ExitItem[] => cachedSnapshot,

  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  toggleTask: (itemId: string, taskId: string) => {
    const items = cachedSnapshot.map((item) => {
      if (item.id !== itemId) return item
      const formalities = item.formalities.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
      return { ...item, formalities }
    })
    persist(items)
  },

  reset: () => {
    localStorage.removeItem(STORAGE_KEY)
    cachedSnapshot = [...mockExit]
    listeners.forEach((l) => l())
  },
}
