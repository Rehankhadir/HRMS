import type { OnboardingItem, OnboardingStatus } from '@/types'
import { onboardingItems as mockOnboarding } from '@/data/mock'

const STORAGE_KEY = 'hrms-onboarding'

let cachedSnapshot: OnboardingItem[] = loadFromStorage()

function loadFromStorage(): OnboardingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return [...mockOnboarding]
}

function persist(items: OnboardingItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  cachedSnapshot = items
  listeners.forEach((l) => l())
}

type Listener = () => void
const listeners: Set<Listener> = new Set()

export const onboardingStore = {
  getSnapshot: (): OnboardingItem[] => cachedSnapshot,

  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  toggleTask: (itemId: string, category: 'documents' | 'setup', taskId: string) => {
    const items = cachedSnapshot.map((item) => {
      if (item.id !== itemId) return item
      const tasks = item[category].map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
      const allDone = tasks.every((t) => t.completed)
      const anyDone = tasks.some((t) => t.completed)
      const status: OnboardingStatus = allDone ? 'completed' : anyDone ? 'in-progress' : 'pending'
      return { ...item, [category]: tasks, status }
    })
    persist(items)
  },

  reset: () => {
    localStorage.removeItem(STORAGE_KEY)
    cachedSnapshot = [...mockOnboarding]
    listeners.forEach((l) => l())
  },
}
