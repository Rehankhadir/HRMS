import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { employees } from '@/data/mock'
import { extendedPayrollStore } from '@/lib/payroll-extended'
import type { ArrearDraft } from '@/types'
import {
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

interface StepRevisionArrearProps {
  selectedEmployees: string[]
  month: number
  year: number
  draftArrears: ArrearDraft[]
  onUpdate: (arrears: ArrearDraft[]) => void
  onBack: () => void
  onNext: () => void
}

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function StepRevisionArrear({
  selectedEmployees,
  month,
  year,
  draftArrears,
  onUpdate,
  onBack,
  onNext,
}: StepRevisionArrearProps) {
  const [localArrears, setLocalArrears] = useState<ArrearDraft[]>(draftArrears)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (localArrears.length === 0) {
      const revisions = extendedPayrollStore.getRevisions()
      const currentPeriodId = `period-${year}-${String(month).padStart(2, '0')}`

      const eligibleRevisions = revisions.filter(r => {
        if (r.status !== 'approved') return false
        if (!selectedEmployees.includes(r.employeeId)) return false
        const effDate = new Date(r.effectiveDate + 'T00:00:00')
        return effDate.getFullYear() < year || (effDate.getFullYear() === year && effDate.getMonth() <= month - 1)
      })

      const existingArrears = extendedPayrollStore.getArrears()
      const arrearDrafts: ArrearDraft[] = eligibleRevisions.map(rev => {
        const existingArrear = existingArrears.find(
          a => a.employeeId === rev.employeeId && a.periodId === currentPeriodId
        )
        const monthlyDelta = Math.round((rev.newCTC - rev.previousCTC) / 12)
        const effDate = new Date(rev.effectiveDate + 'T00:00:00')
        const monthsDiff = (year - effDate.getFullYear()) * 12 + (month - 1 - effDate.getMonth())
        const autoAmount = existingArrear ? existingArrear.amount : monthlyDelta * Math.max(1, monthsDiff)

        return {
          employeeId: rev.employeeId,
          revisionId: rev.id,
          autoAmount,
          overrideAmount: autoAmount,
          comment: existingArrear ? existingArrear.description : '',
        }
      })
      setLocalArrears(arrearDrafts)
      onUpdate(arrearDrafts)
    }
  }, [selectedEmployees, month, year])

  const updateOverride = (revisionId: string, amount: number) => {
    setLocalArrears(prev => {
      const updated = prev.map(a =>
        a.revisionId === revisionId ? { ...a, overrideAmount: amount } : a
      )
      onUpdate(updated)
      return updated
    })
  }

  const updateComment = (revisionId: string, comment: string) => {
    setLocalArrears(prev => {
      const updated = prev.map(a =>
        a.revisionId === revisionId ? { ...a, comment } : a
      )
      onUpdate(updated)
      return updated
    })
  }

  const totalArrears = localArrears.reduce((sum, a) => sum + a.overrideAmount, 0)
  const overriddenCount = localArrears.filter(a => a.overrideAmount !== a.autoAmount && !a.comment).length

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Salary Revisions & Arrears — {monthNames[month - 1]} {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-text-secondary">Applicable Revisions</p>
            <p className="mt-1 text-sm font-bold text-text-primary">{localArrears.length}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-text-secondary">Total Arrears</p>
            <p className="mt-1 text-sm font-bold text-primary">{formatCurrency(totalArrears)}</p>
          </div>
        </div>

        {overriddenCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-warning bg-warning-50 p-3">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <p className="text-xs text-warning">{overriddenCount} override(s) missing a comment.</p>
          </div>
        )}

        {localArrears.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background/50 p-8 text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-text-secondary" />
            <p className="mt-2 text-xs text-text-secondary">No salary revisions applicable for this period.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {localArrears.map(arrear => {
              const emp = employees.find(e => e.id === arrear.employeeId)
              const revision = extendedPayrollStore.getRevisions().find(r => r.id === arrear.revisionId)
              if (!emp || !revision) return null
              const isOverridden = arrear.overrideAmount !== arrear.autoAmount
              return (
                <div key={arrear.revisionId} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={`${emp.firstName[0]}${emp.lastName[0]}`} size="sm" color="#2563EB" />
                      <div>
                        <p className="font-medium text-text-primary">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-text-secondary">
                          {revision.revisionType} · {formatCurrency(revision.previousCTC)} → {formatCurrency(revision.newCTC)}
                        </p>
                      </div>
                    </div>
                    {isOverridden && <Badge variant="warning">Overridden</Badge>}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-text-secondary">Auto-calculated Arrears</Label>
                      <p className="mt-1 text-sm font-bold text-text-primary">{formatCurrency(arrear.autoAmount)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-text-secondary">Override Amount</Label>
                      <Input
                        type="number"
                        value={arrear.overrideAmount}
                        onChange={(e) => updateOverride(arrear.revisionId, Number(e.target.value))}
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>

                  {isOverridden && (
                    <div className="mt-3">
                      <Label className="text-xs text-text-secondary">Comment (required for overrides)</Label>
                      <Input
                        value={arrear.comment}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateComment(arrear.revisionId, e.target.value)}
                        placeholder="Reason for override..."
                        className="mt-1 text-xs"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onNext} disabled={overriddenCount > 0}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
