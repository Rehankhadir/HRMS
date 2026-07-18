import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { employees } from '@/data/mock'
import { extendedPayrollStore } from '@/lib/payroll-extended'
import type { OffCycleDraft, HoldDraft } from '@/types'
import {
  ArrowLeft,
  ChevronRight,
  Wallet,
  Shield,
  Plus,
  Trash2,
  Info,
} from 'lucide-react'

interface StepOffCycleHoldsProps {
  selectedEmployees: string[]
  month: number
  year: number
  draftOffCycle: OffCycleDraft[]
  draftHolds: HoldDraft[]
  onUpdateOffCycle: (items: OffCycleDraft[]) => void
  onUpdateHolds: (holds: HoldDraft[]) => void
  onBack: () => void
  onNext: () => void
}

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function StepOffCycleHolds({
  selectedEmployees,
  month,
  year,
  draftOffCycle,
  draftHolds,
  onUpdateOffCycle,
  onUpdateHolds,
  onBack,
  onNext,
}: StepOffCycleHoldsProps) {
  const [localOffCycle, setLocalOffCycle] = useState<OffCycleDraft[]>(draftOffCycle)
  const [localHolds, setLocalHolds] = useState<HoldDraft[]>(draftHolds)
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newEmployee, setNewEmployee] = useState('')
  const [newTaxable, setNewTaxable] = useState(true)

  useEffect(() => {
    if (localOffCycle.length === 0 && localHolds.length === 0) {
      const offCycleItems = extendedPayrollStore.getOffCyclePayouts()
      const holdsItems = extendedPayrollStore.getHolds()

      const periodOffCycle = offCycleItems
        .filter(o => o.month === month && o.year === year && selectedEmployees.includes(o.employeeId))
        .map(o => ({
          id: o.id,
          employeeId: o.employeeId,
          name: o.description,
          amount: o.amount,
          taxable: o.payoutType !== 'advance',
        }))

      const periodHolds = holdsItems
        .filter(h => h.status === 'held' && selectedEmployees.includes(h.employeeId))
        .map(h => ({
          employeeId: h.employeeId,
          holdId: h.id,
          action: 'hold' as const,
        }))

      setLocalOffCycle(periodOffCycle)
      setLocalHolds(periodHolds)
      onUpdateOffCycle(periodOffCycle)
      onUpdateHolds(periodHolds)
    }
  }, [selectedEmployees, month, year])

  const addOffCycle = () => {
    if (!newName || !newAmount || !newEmployee) return
    const newItem: OffCycleDraft = {
      id: `oc-draft-${Date.now()}`,
      employeeId: newEmployee,
      name: newName,
      amount: Number(newAmount),
      taxable: newTaxable,
    }
    setLocalOffCycle(prev => {
      const updated = [...prev, newItem]
      onUpdateOffCycle(updated)
      return updated
    })
    setNewName('')
    setNewAmount('')
    setNewEmployee('')
    setNewTaxable(true)
  }

  const removeOffCycle = (id: string) => {
    setLocalOffCycle(prev => {
      const updated = prev.filter(o => o.id !== id)
      onUpdateOffCycle(updated)
      return updated
    })
  }

  const updateHoldAction = (holdId: string, action: 'hold' | 'release') => {
    setLocalHolds(prev => {
      const updated = prev.map(h =>
        h.holdId === holdId ? { ...h, action } : h
      )
      onUpdateHolds(updated)
      return updated
    })
  }

  const totalOffCycle = localOffCycle.reduce((sum, o) => sum + o.amount, 0)
  const heldCount = localHolds.filter(h => h.action === 'hold').length

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const selectableEmployees = employees.filter(e =>
    selectedEmployees.includes(e.id) && e.status === 'active'
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Off-Cycle Payments & Salary Holds — {monthNames[month - 1]} {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-text-secondary">Off-Cycle Payments</p>
            <p className="mt-1 text-sm font-bold text-primary">{formatCurrency(totalOffCycle)}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-text-secondary">On Hold</p>
            <p className="mt-1 text-sm font-bold text-danger">{heldCount} employee(s)</p>
          </div>
        </div>

        {/* Off-Cycle Section */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold text-text-primary">
            <Wallet className="h-4 w-4" />
            Off-Cycle Payments
          </h3>

          {localOffCycle.length > 0 && (
            <div className="mb-4 space-y-2">
              {localOffCycle.map(item => {
                const emp = employees.find(e => e.id === item.employeeId)
                return (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={emp ? `${emp.firstName[0]}${emp.lastName[0]}` : '??'} size="sm" color="#2563EB" />
                      <div>
                        <p className="text-xs font-medium text-text-primary">{item.name}</p>
                        <p className="text-xs text-text-secondary">{emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-bold text-text-primary">{formatCurrency(item.amount)}</p>
                        {item.taxable && <Badge variant="warning" className="text-[10px]">Taxable</Badge>}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => removeOffCycle(item.id)}>
                        <Trash2 className="h-3 w-3 text-danger" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="rounded-lg border border-dashed border-border p-4">
            <p className="mb-3 text-xs font-medium text-text-secondary">Add Off-Cycle Payment</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <Select
                options={selectableEmployees.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                value={newEmployee}
                onChange={(e) => setNewEmployee(e.target.value)}
                placeholder="Employee"
              />
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name (e.g. Bonus)"
                className="text-xs"
              />
              <Input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="Amount"
                className="text-xs"
              />
              <Button onClick={addOffCycle} disabled={!newName || !newAmount || !newEmployee}>
                <Plus className="mr-1 h-3 w-3" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Holds Section */}
        {localHolds.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-warning bg-warning-50 p-3">
              <Info className="h-4 w-4 text-warning shrink-0" />
              <p className="text-xs text-warning">
                Held salaries are still calculated and statutory deductions still apply — only disbursement is withheld.
              </p>
            </div>

            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold text-text-primary">
              <Shield className="h-4 w-4" />
              Salary Holds
            </h3>
            <div className="space-y-2">
              {localHolds.map(hold => {
                const emp = employees.find(e => e.id === hold.employeeId)
                if (!emp) return null
                return (
                  <div key={hold.holdId} className="flex items-center justify-between rounded-lg border border-border p-3">
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
                        variant={hold.action === 'hold' ? 'destructive' : 'outline'}
                        onClick={() => updateHoldAction(hold.holdId, 'hold')}
                      >
                        Keep Hold
                      </Button>
                      <Button
                        size="sm"
                        variant={hold.action === 'release' ? 'default' : 'outline'}
                        onClick={() => updateHoldAction(hold.holdId, 'release')}
                      >
                        Release
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
