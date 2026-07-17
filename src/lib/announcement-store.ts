import { announcements as defaultAnnouncements } from '@/data/mock'
import type { Announcement } from '@/types'

const STORAGE_KEY = 'hrms_announcements'

function loadAnnouncements(): Announcement[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAnnouncements))
  return [...defaultAnnouncements]
}

function save(data: Announcement[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

let items: Announcement[] = loadAnnouncements()
let cachedSnapshot: Announcement[] = items
const listeners: Set<() => void> = new Set()

function emitChange() {
  cachedSnapshot = [...items]
  listeners.forEach(fn => fn())
}

export const announcementStore = {
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => { listeners.delete(fn) }
  },
  getSnapshot(): Announcement[] {
    return cachedSnapshot
  },
  addAnnouncement(data: Omit<Announcement, 'id' | 'date'>): Announcement {
    const newItem: Announcement = {
      ...data,
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
    }
    items = [newItem, ...items]
    save(items)
    emitChange()
    return newItem
  },
  deleteAnnouncement(id: string) {
    items = items.filter(a => a.id !== id)
    save(items)
    emitChange()
  },
  updateAnnouncement(id: string, data: Partial<Announcement>) {
    items = items.map(a => a.id === id ? { ...a, ...data } : a)
    save(items)
    emitChange()
  },
}
