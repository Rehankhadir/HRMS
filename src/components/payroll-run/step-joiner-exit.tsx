import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { employees } from '@/data/mock'
import { payrollStore } from '@/lib/payroll-store'
import { onboardingStore } from '@/lib/onboarding-store'
import { exitStore } from '@/lib/exit-store'
import type { JoinerDraft, ExitDraft } from '@/types'
import {
  ArrowLeft,
  ChevronRight,
  UserPlus,
  UserMinus,
  CheckCircle,
} from 'lucide-react'

interface StepJoinerExitProps {
  selectedEmployees: string[]
  month: number
  year: number
  draftJoiners: JoinerDraft[]
  draftExits: ExitDraft[]
  onUpdateJoiners: (joiners: JoinerDraft[]) => void
  onUpdateExits: (exits: ExitDraft[]) => void
  onBack: () => void
  onNext: () => void
}

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

function daysFromJoin(joinDate: string, month: number, year: number): number {
  const join = new Date(joinDate + 'T00:00:00')
  const yearMonth = new Date(year, month - 1, 1)
  if (join.getFullYear() > year || (join.getFullYear() === year && join.getMonth() > month - 1)) return 0
  const lastDay = new Date(year, month, 0)
  const end = join > lastDay ? lastDay : join
  const startOfMonth = new Date(year, month - 1, 1)
  if (end < startOfMonth) return 0
  return Math.floor((end.getTime() - startOfMonth.getTime()) / 86400000) + 1
}

export function StepJoinerExit({
  selectedEmployees,
  month,
  year,
  draftJoiners,
  draftExits,
  onUpdateJoiners,
  onUpdateExits,
  onBack,
  onNext,
}: StepJoinerExitProps) {
  const [localJoiners, setLocalJoiners] = useState<JoinerDraft[]>(draftJoiners)
  const [localExits, setLocalExits] = useState<ExitDraft[]>(draftExits)
  const daysInMonth = getDaysInMonth(month, year)
  const monthKey = `${year}-${String(month).padStart(2, '0')}`

  useEffect(() => {
    if (localJoiners.length === 0 && localExits.length === 0) {
      const allEmps = employees
      const onboarding = onboardingStore.getSnapshot()
      const exits = exitStore.getSnapshot()

      const periodStart = `${monthKey}-01`
      const periodEnd = `${monthKey}-${String(daysInMonth).padStart(2, '0')}`

      const joiners: JoinerDraft[] = allEmps
        .filter(emp => {
          if (!selectedEmployees.includes(emp.id)) return false
          const join = new Date(emp.joiningDate + 'T00:00:00')
          return join.getFullYear() === year && join.getMonth() === month - 1
        })
        .map(emp => {
          const salary = payrollStore.getEmployeeSalary(emp.id)
          const daysWorked = daysFromJoin(emp.joiningDate, month, year)
          const proRated = salary ? Math.round((salary.grossSalary / daysInMonth) * daysWorked) : 0
          return {
            employeeId: emp.id,
            joiningDate: emp.joiningDate,
            proRatedGross: proRated,
            edited: false,
          }
        })

      const exitDrafts: ExitDraft[] = exits
        .filter(ex => {
          if (!selectedEmployees.includes(ex.employeeId)) return false
          const lwd = new Date(ex.lastWorkingDay + 'T00:00:00')
          return lwd.getFullYear() === year && lwd.getMonth() === month - 1
        })
        .map(ex => ({
          employeeId: ex.employeeId,
          lastWorkingDay: ex.lastWorkingDay,
          action: 'pay' as const,
        }))

      setLocalJoiners(joiners)
      setLocalExits(exitDrafts)
      onUpdateJoiners(joiners)
      onUpdateExits(exitDrafts)
    }
  }, [selectedEmployees, monthKey, year, daysInMonth])

  const updateJoinerAmount = (empId: string, amount: number) => {
    setLocalJoiners(prev => {
      const updated = prev.map(j =>
        j.employeeId === empId ? { ...j, proRatedGross: amount, edited: true } : j
      )
      onUpdateJoiners(updated)
      return updated
    })
  }

  const updateExitAction = (empId: string, action: 'pay' | 'hold') => {
    setLocalExits(prev => {
      const updated = prev.map(e =>
        e.employeeId === empId ? { ...e, action } : e
      )
      onUpdateExits(updated)
      return updated
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          New Joiners & Exits — {monthNames[month - 1]} {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {localJoiners.length === 0 && localExits.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-background/50 p-8 text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-text-secondary" />
            <p className="mt-2 text-xs text-text-secondary">No new joiners or exits in this period.</p>
          </div>
        )}

        {localJoiners.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold text-text-primary">
              <UserPlus className="h-4 w-4 text-success" />
              New Joiners ({localJoiners.length})
            </h3>
            <div className="space-y-3">
              {localJoiners.map(joiner => {
                const emp = employees.find(e => e.id === joiner.employeeId)
                if (!emp) return null
                const daysWorked = daysFromJoin(joiner.joiningDate, month, year)
                return (
                  <div key={joiner.employeeId} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={`${emp.firstName[0]}${emp.lastName[0]}`} size="sm" color="#10B981" />
                      <div>
                        <p className="font-medium text-text-primary">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-text-secondary">
                          Joined {new Date(joiner.joiningDate + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} · {daysWorked} days
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Label className="text-xs text-text-secondary">Pro-rated Gross</Label>
                        <Input
                          type="number"
                          value={joiner.proRatedGross}
                          onChange={(e) => updateJoinerAmount(joiner.employeeId, Number(e.target.value))}
                          className="mt-1 w-32 text-right text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {localExits.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold text-text-primary">
              <UserMinus className="h-4 w-4 text-danger" />
              Exits ({localExits.length})
            </h3>
            <div className="space-y-3">
              {localExits.map(exit => {
                const emp = employees.find(e => e.id === exit.employeeId)
                if (!emp) return null
                return (
                  <div key={exit.employeeId} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={`${emp.firstName[0]}${emp.lastName[0]}`} size="sm" color="#EF4444" />
                      <div>
                        <p className="font-medium text-text-primary">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-text-secondary">{emp.department}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={exit.action === 'pay' ? 'default' : 'outline'}
                        onClick={() => updateExitAction(exit.employeeId, 'pay')}
                      >
                        Pay
                      </Button>
                      <Button
                        size="sm"
                        variant={exit.action === 'hold' ? 'destructive' : 'outline'}
                        onClick={() => updateExitAction(exit.employeeId, 'hold')}
                      >
                        Hold
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onNext}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
