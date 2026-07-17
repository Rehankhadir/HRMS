import { createContext, useContext, useSyncExternalStore, useCallback, type ReactNode } from 'react'
import { onboardingStore } from '@/lib/onboarding-store'
import type { OnboardingItem } from '@/types'

interface OnboardingContextType {
  items: OnboardingItem[]
  toggleTask: (itemId: string, category: 'documents' | 'setup', taskId: string) => void
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(onboardingStore.subscribe, onboardingStore.getSnapshot)

  const toggleTask = useCallback((itemId: string, category: 'documents' | 'setup', taskId: string) => {
    onboardingStore.toggleTask(itemId, category, taskId)
  }, [])

  return (
    <OnboardingContext.Provider value={{ items, toggleTask }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) throw new Error('useOnboarding must be used within an OnboardingProvider')
  return context
}
