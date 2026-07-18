import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { payrollStore } from '@/lib/payroll-store'
import { employees } from '@/data/mock'
import { generateBulkUploadCSV, downloadCSV } from '@/lib/csv-export'
import { useToast } from '@/components/ui/toast'
import type {
  EmployeeAttendanceDraft,
  JoinerDraft,
  ExitDraft,
  ArrearDraft,
  OffCycleDraft,
  HoldDraft,
  StatutoryOverride,
} from '@/types'
import {
  ArrowLeft,
  CheckCircle,
  Calculator,
  FileText,
  History,
  AlertTriangle,
  Info,
  Loader2,
  Download,
} from 'lucide-react'

interface StepFinalReviewProps {
  selectedEmployees: string[]
  month: number
  year: number
  attendance: EmployeeAttendanceDraft[]
  joiners: JoinerDraft[]
  exits: ExitDraft[]
  arrears: ArrearDraft[]
  offCyclePayments: OffCycleDraft[]
  holds: HoldDraft[]
  draftStatutoryOverrides: StatutoryOverride[]
  onUpdateStatutory: (overrides: StatutoryOverride[]) => void
  onBack: () => void
  onRecalculate: () => void
  needsRecalculation: boolean
}

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

interface EmployeeRow {
  employeeId: string
  fullName: string
  department: string
  fullGross: number
  proRatedGross: number
  lopDays: number
  lopDeduction: number
  arrears: number
  offCycle: number
  pf: number
  esi: number
  pt: number
  tds: number
  lwf: number
  isOnHold: boolean
  isJoiner: boolean
  isExit: boolean
}

function getWorkingDaysInMonth(month: number, year: number): number {
  const daysInMonth = new Date(year, month, 0).getDate()
  let count = 0
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month - 1, d).getDay()
    if (dow !== 0 && dow !== 6) count++
  }
  return count
}

export function StepFinalReview({
  selectedEmployees,
  month,
  year,
  attendance,
  joiners,
  exits,
  arrears,
  offCyclePayments,
  holds,
  draftStatutoryOverrides,
  onUpdateStatutory,
  onBack,
  onRecalculate,
  needsRecalculation,
}: StepFinalReviewProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)
  const [localStatutory, setLocalStatutory] = useState<StatutoryOverride[]>(draftStatutoryOverrides)
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)
  const workingDays = getWorkingDaysInMonth(month, year)

  const rows: EmployeeRow[] = useMemo(() => {
    return selectedEmployees.map(empId => {
      const emp = employees.find(e => e.id === empId)
      if (!emp) return null

      const salary = payrollStore.getEmployeeSalary(empId)
      const fullGross = salary?.grossSalary || 0

      const joiner = joiners.find(j => j.employeeId === empId)
      const exit = exits.find(e => e.employeeId === empId)
      const empArrears = arrears.find(a => a.employeeId === empId)
      const empOffCycle = offCyclePayments.filter(o => o.employeeId === empId)
      const hold = holds.find(h => h.employeeId === empId)
      const empAttendance = attendance.find(a => a.employeeId === empId)

      const proRatedGross = joiner ? joiner.proRatedGross : fullGross
      const lopDays = empAttendance?.lopDays || 0
      const lopDeduction = lopDays > 0 ? Math.round((fullGross / workingDays) * lopDays) : 0
      const arrearAmount = empArrears?.overrideAmount || 0
      const offCycleAmount = empOffCycle.reduce((sum, o) => sum + o.amount, 0)

      const effectiveGross = proRatedGross - lopDeduction + arrearAmount + offCycleAmount
      const pf = Math.min(Math.round(effectiveGross * 0.12), 1800)
      const esi = effectiveGross <= 21000 ? Math.round(effectiveGross * 0.0075 * 100) / 100 : 0
      const pt = 200
      const tds = Math.round(effectiveGross * 0.1)
      const lwf = 0

      return {
        employeeId: empId,
        fullName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        fullGross,
        proRatedGross,
        lopDays,
        lopDeduction,
        arrears: arrearAmount,
        offCycle: offCycleAmount,
        pf, esi, pt, tds, lwf,
        isOnHold: hold?.action === 'hold',
        isJoiner: !!joiner,
        isExit: !!exit,
      }
    }).filter(Boolean) as EmployeeRow[]
  }, [selectedEmployees, joiners, exits, arrears, offCyclePayments, holds, attendance, workingDays])

  const updateStatutoryField = (empId: string, field: keyof StatutoryOverride, value: number) => {
    setLocalStatutory(prev => {
      const existing = prev.find(s => s.employeeId === empId)
      const updated = existing
        ? prev.map(s => s.employeeId === empId ? { ...s, [field]: value } : s)
        : [...prev, { employeeId: empId, pt: 200, esi: 0, tds: 0, lwf: 0, [field]: value }]
      onUpdateStatutory(updated)
      return updated
    })
  }

  const getStatutory = (empId: string) => {
    return localStatutory.find(s => s.employeeId === empId) || { employeeId: empId, pt: 200, esi: 0, tds: 0, lwf: 0 }
  }

  const totalGross = rows.reduce((sum, r) => sum + r.proRatedGross - r.lopDeduction + r.arrears + r.offCycle, 0)
  const totalDeductions = rows.reduce((sum, r) => {
    const s = getStatutory(r.employeeId)
    return sum + r.pf + s.esi + s.pt + s.tds + s.lwf
  }, 0)
  const totalNet = totalGross - totalDeductions
  const heldCount = rows.filter(r => r.isOnHold).length
  const statutoryOverrides = localStatutory.filter(s =>
    rows.some(r => r.employeeId === s.employeeId && (s.pt !== 200 || s.tds !== Math.round((r.proRatedGross - r.lopDeduction + r.arrears + r.offCycle) * 0.1)))
  ).length

  const handleProcess = async () => {
    setProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    let period = payrollStore.getPeriods().find(p => p.month === month && p.year === year)
    if (!period) {
      period = payrollStore.createPeriod(month, year)
    }
    payrollStore.generatePayslips(period.id)
    payrollStore.processPayroll(period.id, 'HR Admin')
    payrollStore.clearDraft(month, year)

    setProcessing(false)
    setProcessed(true)
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const handleExportCSV = () => {
    const csvData = rows.map(row => {
      const s = getStatutory(row.employeeId)
      const effectiveGross = row.proRatedGross - row.lopDeduction + row.arrears + row.offCycle
      const totalEmpDeductions = row.pf + s.esi + s.pt + s.tds + s.lwf
      const netPay = effectiveGross - totalEmpDeductions
      return { employeeId: row.employeeId, netPay }
    })

    const csv = generateBulkUploadCSV(csvData, month, year)
    const filename = `salary-bulk-upload-${year}-${String(month).padStart(2, '0')}.csv`
    downloadCSV(csv, filename)
    toast(`CSV exported for ${rows.length} employees`, 'success')
  }

  if (processed) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-50 mb-6">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-sm font-bold text-text-primary">Payroll Processed Successfully!</h2>
            <p className="mt-2 text-text-secondary">
              {selectedEmployees.length} employees for {monthNames[month - 1]} {year}.
            </p>
            <div className="mt-2">
              <Badge variant="warning" className="text-xs">Period is now locked</Badge>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-2xl mx-auto">
              <div className="rounded-lg bg-background p-4">
                <p className="text-xs text-text-secondary">Total Gross</p>
                <p className="text-sm font-bold text-text-primary">{formatCurrency(totalGross)}</p>
              </div>
              <div className="rounded-lg bg-background p-4">
                <p className="text-xs text-text-secondary">Total Deductions</p>
                <p className="text-sm font-bold text-danger">{formatCurrency(totalDeductions)}</p>
              </div>
              <div className="rounded-lg bg-background p-4">
                <p className="text-xs text-text-secondary">Total Net Pay</p>
                <p className="text-sm font-bold text-success">{formatCurrency(totalNet)}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export Salary Upload CSV
              </Button>
              <Button variant="outline" onClick={() => navigate('/payroll/payslips')}>
                <FileText className="mr-2 h-4 w-4" />
                View Payslips
              </Button>
              <Button variant="outline" onClick={() => navigate('/payroll/history')}>
                <History className="mr-2 h-4 w-4" />
                Payroll History
              </Button>
              <Button variant="outline" onClick={() => navigate('/payroll')}>
                Back to Dashboard
              </Button>
            </div>

            <p className="mt-4 text-[10px] text-text-secondary">
              CSV includes employee names, bank accounts, IFSC codes, and net pay — compatible with NEFT/RTGS bulk upload for most Indian banks.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Final Review & Process — {monthNames[month - 1]} {year}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {needsRecalculation && (
          <div className="flex items-center justify-between rounded-lg border border-warning bg-warning-50 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-xs font-medium text-warning">Recalculation needed</p>
                <p className="text-xs text-warning/80">You modified an earlier step. Click recalculate to update numbers.</p>
              </div>
            </div>
            <Button size="sm" onClick={onRecalculate}>
              <Calculator className="mr-1 h-3 w-3" />
              Recalculate
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-text-secondary">Total Gross</p>
            <p className="mt-1 text-sm font-bold text-text-primary">{formatCurrency(totalGross)}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-text-secondary">Total Deductions</p>
            <p className="mt-1 text-sm font-bold text-danger">{formatCurrency(totalDeductions)}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-text-secondary">Total Net Pay</p>
            <p className="mt-1 text-sm font-bold text-success">{formatCurrency(totalNet)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-text-secondary">
          <span>{heldCount} on hold</span>
          <span>{statutoryOverrides} statutory overrides</span>
          <span>0 unresolved exceptions</span>
        </div>

        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase text-text-secondary">Employee</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase text-text-secondary">
                  <span className="cursor-help" title="Step 2: Base salary from employee record">Gross</span>
                </th>
                <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase text-text-secondary">
                  <span className="cursor-help" title="Step 3: LOP deduction">LOP</span>
                </th>
                <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase text-text-secondary">
                  <span className="cursor-help" title="Step 5: Revision arrears">Arrears</span>
                </th>
                <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase text-text-secondary">
                  <span className="cursor-help" title="Step 6: Off-cycle payments">Off-Cycle</span>
                </th>
                <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase text-text-secondary">PF</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase text-text-secondary">ESI</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase text-text-secondary">PT</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase text-text-secondary">TDS</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-medium uppercase text-text-secondary">Net Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(row => {
                const s = getStatutory(row.employeeId)
                const effectiveGross = row.proRatedGross - row.lopDeduction + row.arrears + row.offCycle
                const totalEmpDeductions = row.pf + s.esi + s.pt + s.tds + s.lwf
                const netPay = effectiveGross - totalEmpDeductions

                return (
                  <tr key={row.employeeId} className={`hover:bg-background/50 ${row.isOnHold ? 'bg-warning-50/50' : ''}`}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar initials={row.fullName.split(' ').map(n => n[0]).join('')} size="sm" color="#2563EB" />
                        <div>
                          <p className="text-xs font-medium text-text-primary">{row.fullName}</p>
                          <p className="text-[10px] text-text-secondary">{row.department}</p>
                        </div>
                        {row.isOnHold && <Badge variant="warning" className="text-[10px]">Hold</Badge>}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs text-text-primary" title="Step 2: Base gross salary">
                      {formatCurrency(row.proRatedGross)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs" title="Step 3: LOP deduction">
                      {row.lopDeduction > 0 ? (
                        <span className="text-danger">{formatCurrency(row.lopDeduction)}</span>
                      ) : (
                        <span className="text-text-secondary">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs" title="Step 5: Revision arrears">
                      {row.arrears > 0 ? (
                        <span className="text-primary">{formatCurrency(row.arrears)}</span>
                      ) : (
                        <span className="text-text-secondary">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs" title="Step 6: Off-cycle payments">
                      {row.offCycle > 0 ? (
                        <span className="text-primary">{formatCurrency(row.offCycle)}</span>
                      ) : (
                        <span className="text-text-secondary">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs text-text-primary">{formatCurrency(row.pf)}</td>
                    <td className="px-3 py-2.5 text-right text-xs" title="Editable — statutory">
                      <Input
                        type="number"
                        value={s.esi}
                        onChange={(e) => updateStatutoryField(row.employeeId, 'esi', Number(e.target.value))}
                        className="h-7 w-20 text-right text-[10px] px-1"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs" title="Editable — statutory">
                      <Input
                        type="number"
                        value={s.pt}
                        onChange={(e) => updateStatutoryField(row.employeeId, 'pt', Number(e.target.value))}
                        className="h-7 w-20 text-right text-[10px] px-1"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs" title="Editable — statutory">
                      <Input
                        type="number"
                        value={s.tds}
                        onChange={(e) => updateStatutoryField(row.employeeId, 'tds', Number(e.target.value))}
                        className="h-7 w-20 text-right text-[10px] px-1"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs font-bold text-success">
                      {formatCurrency(netPay)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-background/50 p-3">
          <Info className="h-4 w-4 text-text-secondary shrink-0" />
          <p className="text-xs text-text-secondary">
            Only statutory values (PT, ESI, TDS) are editable. To change other values, go back to the relevant step.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleProcess} disabled={processing || needsRecalculation} size="lg">
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Process Payroll
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
