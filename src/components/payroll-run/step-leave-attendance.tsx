import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { attendance as attendanceData } from '@/data/mock'
import { leaveStore } from '@/lib/leave-store'
import { employees } from '@/data/mock'
import type { EmployeeAttendanceDraft, AttendanceResolution } from '@/types'
import {
  ArrowLeft,
  ChevronRight,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'

interface StepLeaveAttendanceProps {
  selectedEmployees: string[]
  month: number
  year: number
  draftAttendance: EmployeeAttendanceDraft[]
  onUpdate: (attendance: EmployeeAttendanceDraft[]) => void
  onBack: () => void
  onNext: () => void
}

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getWorkingDaysInMonth(month: number, year: number): number {
  const daysInMonth = new Date(year, month, 0).getDate()
  let count = 0
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month - 1, d).getDay()
    if (dow !== 0 && dow !== 6) count++
  }
  return count
}

export function StepLeaveAttendance({
  selectedEmployees,
  month,
  year,
  draftAttendance,
  onUpdate,
  onBack,
  onNext,
}: StepLeaveAttendanceProps) {
  const [localDraft, setLocalDraft] = useState<EmployeeAttendanceDraft[]>(draftAttendance)
  const workingDays = getWorkingDaysInMonth(month, year)
  const monthKey = `${year}-${String(month).padStart(2, '0')}`

  useEffect(() => {
    if (localDraft.length === 0 && selectedEmployees.length > 0) {
      const leaves = leaveStore.getSnapshot()
      const periodStart = `${monthKey}-01`
      const periodEnd = `${monthKey}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`

      const initial: EmployeeAttendanceDraft[] = selectedEmployees.map(empId => {
        const empLeaves = leaves.filter(l =>
          l.employeeId === empId &&
          l.status === 'approved' &&
          l.startDate <= periodEnd &&
          l.endDate >= periodStart
        )
        const empAttendance = attendanceData.filter(a =>
          a.employeeId === empId &&
          a.date >= periodStart &&
          a.date <= periodEnd
        )
        const absentDays = empAttendance.filter(a => a.status === 'absent').length
        const lopDays = empLeaves.filter(l => l.type === 'unpaid').length

        const resolutions: AttendanceResolution[] = empAttendance
          .filter(a => a.status === 'absent')
          .map(a => ({
            date: a.date,
            action: 'lop' as const,
            resolved: false,
          }))

        return {
          employeeId: empId,
          lopDays: lopDays,
          resolutions,
          acknowledged: resolutions.length === 0,
        }
      })
      setLocalDraft(initial)
      onUpdate(initial)
    }
  }, [selectedEmployees, monthKey, year])

  const updateResolution = (empId: string, date: string, action: 'regularize' | 'lop') => {
    setLocalDraft(prev => {
      const updated = prev.map(d => {
        if (d.employeeId !== empId) return d
        const resolutions = d.resolutions.map(r =>
          r.date === date ? { ...r, action, resolved: true } : r
        )
        const lopFromResolutions = resolutions.filter(r => r.action === 'lop' && r.resolved).length
        return { ...d, resolutions, lopDays: d.lopDays + lopFromResolutions - d.resolutions.filter(r => r.action === 'lop' && r.resolved).length, acknowledged: resolutions.every(r => r.resolved) }
      })
      onUpdate(updated)
      return updated
    })
  }

  const acknowledgeAll = (empId: string) => {
    setLocalDraft(prev => {
      const updated = prev.map(d =>
        d.employeeId === empId ? { ...d, acknowledged: true } : d
      )
      onUpdate(updated)
      return updated
    })
  }

  const allResolved = localDraft.every(d => d.acknowledged)
  const totalLop = localDraft.reduce((sum, d) => sum + d.lopDays, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Leave & Attendance — {monthNames[month - 1]} {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-text-secondary">Working Days</p>
            <p className="mt-1 text-sm font-bold text-text-primary">{workingDays}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-text-secondary">Employees</p>
            <p className="mt-1 text-sm font-bold text-text-primary">{selectedEmployees.length}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-text-secondary">Total LOP Days</p>
            <p className="mt-1 text-sm font-bold text-danger">{totalLop}</p>
          </div>
        </div>

        <div className="space-y-4">
          {localDraft.map(draft => {
            const emp = employees.find(e => e.id === draft.employeeId)
            if (!emp) return null
            const unresolvedCount = draft.resolutions.filter(r => !r.resolved).length

            return (
              <div key={draft.employeeId} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials={`${emp.firstName[0]}${emp.lastName[0]}`} size="sm" color="#2563EB" />
                    <div>
                      <p className="font-medium text-text-primary">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-text-secondary">{emp.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {draft.lopDays > 0 && (
                      <Badge variant="danger">{draft.lopDays} LOP</Badge>
                    )}
                    {draft.acknowledged ? (
                      <Badge variant="success"><CheckCircle className="mr-1 h-3 w-3" />Resolved</Badge>
                    ) : (
                      <Badge variant="warning">{unresolvedCount} pending</Badge>
                    )}
                  </div>
                </div>

                {draft.resolutions.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-text-secondary">Missing Attendance</p>
                    {draft.resolutions.map(res => (
                      <div key={res.date} className="flex items-center justify-between rounded-lg bg-background p-3">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-text-secondary" />
                          <span className="text-xs text-text-primary">
                            {new Date(res.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={res.action === 'regularize' && res.resolved ? 'default' : 'outline'}
                            onClick={() => updateResolution(draft.employeeId, res.date, 'regularize')}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Regularize
                          </Button>
                          <Button
                            size="sm"
                            variant={res.action === 'lop' && res.resolved ? 'destructive' : 'outline'}
                            onClick={() => updateResolution(draft.employeeId, res.date, 'lop')}
                          >
                            <XCircle className="mr-1 h-3 w-3" />
                            Deduct as LOP
                          </Button>
                        </div>
                      </div>
                    ))}
                    {!draft.acknowledged && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => acknowledgeAll(draft.employeeId)}
                      >
                        Acknowledge All
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-text-secondary italic">No missing attendance records for this period.</p>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onNext} disabled={!allResolved}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
