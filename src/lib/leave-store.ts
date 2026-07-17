import { leaves as defaultLeaves } from '@/data/mock'
import type { Leave } from '@/types'

const STORAGE_KEY = 'hrms_leaves'

function loadLeaves(): Leave[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLeaves))
  return [...defaultLeaves]
}

function saveLeaves(leaves: Leave[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leaves))
}

let leaves: Leave[] = loadLeaves()
let cachedSnapshot: Leave[] = leaves
const listeners: Set<() => void> = new Set()

function emitChange() {
  cachedSnapshot = [...leaves]
  listeners.forEach(fn => fn())
}

export const leaveStore = {
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => { listeners.delete(fn) }
  },

  getSnapshot(): Leave[] {
    return cachedSnapshot
  },

  addLeave(data: Omit<Leave, 'id' | 'appliedOn' | 'status'>): Leave {
    const newLeave: Leave = {
      ...data,
      id: String(Date.now()),
      appliedOn: new Date().toISOString().split('T')[0],
      status: 'pending',
    }
    leaves = [newLeave, ...leaves]
    saveLeaves(leaves)
    emitChange()
    return newLeave
  },

  approveLeave(leaveId: string, approvedBy: string) {
    leaves = leaves.map(l =>
      l.id === leaveId ? { ...l, status: 'approved' as const, approvedBy } : l
    )
    saveLeaves(leaves)
    emitChange()
  },

  rejectLeave(leaveId: string, rejectedBy: string) {
    leaves = leaves.map(l =>
      l.id === leaveId ? { ...l, status: 'rejected' as const, approvedBy: rejectedBy } : l
    )
    saveLeaves(leaves)
    emitChange()
  },

  getEmployeeLeaves(employeeId: string): Leave[] {
    return cachedSnapshot.filter(l => l.employeeId === employeeId)
  },

  getPendingForManager(directReportIds: string[]): Leave[] {
    return cachedSnapshot.filter(l => l.status === 'pending' && directReportIds.includes(l.employeeId))
  },

  getApprovedCount(employeeId: string): number {
    return cachedSnapshot.filter(l => l.employeeId === employeeId && l.status === 'approved').length
  },

  getPendingCount(employeeId: string): number {
    return cachedSnapshot.filter(l => l.employeeId === employeeId && l.status === 'pending').length
  },

  reset() {
    leaves = [...defaultLeaves]
    saveLeaves(leaves)
    emitChange()
  },
}
