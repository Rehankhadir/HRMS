import { createContext, useContext, useSyncExternalStore, useCallback, type ReactNode } from 'react'
import { announcementStore } from '@/lib/announcement-store'
import type { Announcement } from '@/types'

interface AnnouncementContextType {
  announcements: Announcement[]
  addAnnouncement: (data: Omit<Announcement, 'id' | 'date'>) => Announcement
  deleteAnnouncement: (id: string) => void
  updateAnnouncement: (id: string, data: Partial<Announcement>) => void
}

const AnnouncementContext = createContext<AnnouncementContextType | null>(null)

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const announcements = useSyncExternalStore(
    announcementStore.subscribe,
    announcementStore.getSnapshot
  )

  const addAnnouncement = useCallback((data: Omit<Announcement, 'id' | 'date'>) => {
    return announcementStore.addAnnouncement(data)
  }, [])

  const deleteAnnouncement = useCallback((id: string) => {
    announcementStore.deleteAnnouncement(id)
  }, [])

  const updateAnnouncement = useCallback((id: string, data: Partial<Announcement>) => {
    announcementStore.updateAnnouncement(id, data)
  }, [])

  return (
    <AnnouncementContext.Provider value={{ announcements, addAnnouncement, deleteAnnouncement, updateAnnouncement }}>
      {children}
    </AnnouncementContext.Provider>
  )
}

export function useAnnouncements() {
  const context = useContext(AnnouncementContext)
  if (!context) throw new Error('useAnnouncements must be used within an AnnouncementProvider')
  return context
}
