import { createContext, useContext, useSyncExternalStore, useCallback, type ReactNode } from 'react'
import { leaveStore } from '@/lib/leave-store'
import type { Leave } from '@/types'

interface LeaveContextType {
  leaves: Leave[]
  addLeave: (leave: Omit<Leave, 'id' | 'appliedOn' | 'status'>) => Leave
  approveLeave: (leaveId: string, approvedBy: string) => void
  rejectLeave: (leaveId: string, rejectedBy: string) => void
  getEmployeeLeaves: (employeeId: string) => Leave[]
  getPendingForManager: (directReportIds: string[]) => Leave[]
  getApprovedCount: (employeeId: string) => number
  getPendingCount: (employeeId: string) => number
}

const LeaveContext = createContext<LeaveContextType | null>(null)

export function LeaveProvider({ children }: { children: ReactNode }) {
  const leaves = useSyncExternalStore(
    leaveStore.subscribe,
    leaveStore.getSnapshot
  )

  const addLeave = useCallback((data: Omit<Leave, 'id' | 'appliedOn' | 'status'>) => {
    return leaveStore.addLeave(data)
  }, [])

  const approveLeave = useCallback((leaveId: string, approvedBy: string) => {
    leaveStore.approveLeave(leaveId, approvedBy)
  }, [])

  const rejectLeave = useCallback((leaveId: string, rejectedBy: string) => {
    leaveStore.rejectLeave(leaveId, rejectedBy)
  }, [])

  const getEmployeeLeaves = useCallback((employeeId: string) => {
    return leaveStore.getEmployeeLeaves(employeeId)
  }, [leaves])

  const getPendingForManager = useCallback((directReportIds: string[]) => {
    return leaveStore.getPendingForManager(directReportIds)
  }, [leaves])

  const getApprovedCount = useCallback((employeeId: string) => {
    return leaveStore.getApprovedCount(employeeId)
  }, [leaves])

  const getPendingCount = useCallback((employeeId: string) => {
    return leaveStore.getPendingCount(employeeId)
  }, [leaves])

  return (
    <LeaveContext.Provider value={{
      leaves,
      addLeave,
      approveLeave,
      rejectLeave,
      getEmployeeLeaves,
      getPendingForManager,
      getApprovedCount,
      getPendingCount,
    }}>
      {children}
    </LeaveContext.Provider>
  )
}

export function useLeave() {
  const context = useContext(LeaveContext)
  if (!context) throw new Error('useLeave must be used within a LeaveProvider')
  return context
}
