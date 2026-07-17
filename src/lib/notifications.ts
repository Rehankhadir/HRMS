import { employees } from '@/data/mock'
import type { Leave } from '@/types'

export interface Notification {
  id: string
  type: 'success' | 'danger' | 'warning' | 'info'
  message: string
  time: string
}

export function getNotifications(
  userRole: string | undefined,
  employeeId: string,
  getPendingForManager: (ids: string[]) => Leave[],
  getEmployeeLeaves: (id: string) => Leave[]
): Notification[] {
  const items: Notification[] = []
  const isManager = userRole === 'manager'

  if (isManager) {
    const myDirectReportIds = employees
      .filter(e => e.reportingManagerId === employeeId)
      .map(e => e.id)

    const pending = getPendingForManager(myDirectReportIds)
    pending.forEach(leave => {
      const emp = employees.find(e => e.id === leave.employeeId)
      if (emp) {
        items.push({
          id: `pending-${leave.id}`,
          type: 'warning',
          message: `${emp.firstName} ${emp.lastName} applied for ${leave.type} leave`,
          time: leave.appliedOn,
        })
      }
    })
  }

  const myLeaves = getEmployeeLeaves(employeeId)
  myLeaves.forEach(leave => {
    if (leave.status === 'approved' && leave.approvedBy) {
      items.push({
        id: `approved-${leave.id}`,
        type: 'success',
        message: `Your ${leave.type} leave was approved by ${leave.approvedBy}`,
        time: leave.appliedOn,
      })
    } else if (leave.status === 'rejected' && leave.approvedBy) {
      items.push({
        id: `rejected-${leave.id}`,
        type: 'danger',
        message: `Your ${leave.type} leave was rejected by ${leave.approvedBy}`,
        time: leave.appliedOn,
      })
    }
  })

  return items
}
