import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { payrollStore } from '@/lib/payroll-store'
import { employees } from '@/data/mock'
import { useToast } from '@/components/ui/toast'
import { StepLeaveAttendance } from '@/components/payroll-run/step-leave-attendance'
import { StepJoinerExit } from '@/components/payroll-run/step-joiner-exit'
import { StepRevisionArrear } from '@/components/payroll-run/step-revision-arrear'
import { StepOffCycleHolds } from '@/components/payroll-run/step-offcycle-holds'
import { StepFinalReview } from '@/components/payroll-run/step-final-review'
import type {
  PayrollDraft,
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
  Check,
  Users,
  Clock,
  CheckCircle,
  ChevronRight,
  Calendar,
  UserPlus,
  TrendingUp,
  Wallet,
  Calculator,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

const STEPS = [
  { id: 1, label: 'Period', icon: Clock },
  { id: 2, label: 'Employees', icon: Users },
  { id: 3, label: 'Attendance', icon: Calendar },
  { id: 4, label: 'Joiners & Exits', icon: UserPlus },
  { id: 5, label: 'Revisions', icon: TrendingUp },
  { id: 6, label: 'Off-Cycle & Holds', icon: Wallet },
  { id: 7, label: 'Review', icon: Calculator },
]

export function PayrollRun() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])

  const [attendance, setAttendance] = useState<EmployeeAttendanceDraft[]>([])
  const [joiners, setJoiners] = useState<JoinerDraft[]>([])
  const [exits, setExits] = useState<ExitDraft[]>([])
  const [arrears, setArrears] = useState<ArrearDraft[]>([])
  const [offCyclePayments, setOffCyclePayments] = useState<OffCycleDraft[]>([])
  const [holds, setHolds] = useState<HoldDraft[]>([])
  const [statutoryOverrides, setStatutoryOverrides] = useState<StatutoryOverride[]>([])
  const [recalculationNeeded, setRecalculationNeeded] = useState(false)

  const periodKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`

  const employeeSalaries = payrollStore.getEmployeeSalaries()
  const periods = payrollStore.getPeriods()
  const existingPeriod = periods.find(p => p.month === selectedMonth && p.year === selectedYear)

  const eligibleEmployees = employeeSalaries.map(es => {
    const emp = employees.find(e => e.id === es.employeeId)
    return emp ? { ...es, employee: emp } : null
  }).filter(Boolean)

  const selectedEmployeeData = eligibleEmployees.filter(es => selectedEmployees.includes(es!.employeeId))

  // Load draft on mount or period change
  useEffect(() => {
    const draft = payrollStore.getDraft(selectedMonth, selectedYear)
    if (draft) {
      setSelectedEmployees(draft.selectedEmployees)
      setStep(draft.lastCompletedStep + 1)
      setAttendance(draft.attendance)
      setJoiners(draft.joiners)
      setExits(draft.exits)
      setArrears(draft.arrears)
      setOffCyclePayments(draft.offCyclePayments)
      setHolds(draft.holds)
      setStatutoryOverrides(draft.statutoryOverrides)
      setRecalculationNeeded(draft.recalculationNeeded)
    }
  }, [selectedMonth, selectedYear])

  // Save draft on every state change
  const saveDraft = useCallback((currentStep: number) => {
    const draft: PayrollDraft = {
      periodKey,
      month: selectedMonth,
      year: selectedYear,
      selectedEmployees,
      lastCompletedStep: currentStep,
      updatedAt: new Date().toISOString(),
      attendance,
      joiners,
      exits,
      arrears,
      offCyclePayments,
      holds,
      statutoryOverrides,
      recalculationNeeded,
    }
    payrollStore.saveDraft(draft)
  }, [periodKey, selectedMonth, selectedYear, selectedEmployees, attendance, joiners, exits, arrears, offCyclePayments, holds, statutoryOverrides, recalculationNeeded])

  useEffect(() => {
    if (step > 1) saveDraft(step - 1)
  }, [step, saveDraft])

  // Mark recalculation needed when going back and changing early steps
  const markRecalcNeeded = () => {
    if (step >= 7) setRecalculationNeeded(true)
  }

  const handleRecalculate = () => {
    setRecalculationNeeded(false)
    toast('Recalculated successfully', 'success')
  }

  const toggleEmployee = (id: string) => {
    markRecalcNeeded()
    setSelectedEmployees(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    )
  }

  const selectAll = () => setSelectedEmployees(eligibleEmployees.map(es => es!.employeeId))
  const deselectAll = () => { setSelectedEmployees([]); markRecalcNeeded() }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Button variant="ghost" onClick={() => navigate('/payroll')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Payroll
        </Button>
      </motion.div>

      <motion.div variants={item}>
        <h1 className="text-sm font-bold text-text-primary">Run Payroll</h1>
        <p className="mt-1 text-text-secondary">Process salaries with attendance, revisions, and statutory compliance.</p>
      </motion.div>

      {/* Stepper Header */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between overflow-x-auto">
              {STEPS.map((s, index) => (
                <div key={s.id} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                        step > s.id ? 'bg-success text-white'
                          : step === s.id ? 'bg-primary text-white'
                          : 'bg-background text-text-secondary'
                      }`}
                    >
                      {step > s.id ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                    </div>
                    <span className="text-[11px] font-medium text-text-primary hidden md:block">{s.label}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`mx-2 h-0.5 w-4 lg:w-8 ${step > s.id ? 'bg-success' : 'bg-border'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Step 1: Select Period */}
      {step === 1 && (
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6 space-y-6">
              <Label className="text-xs font-semibold text-text-primary">Select Payroll Period</Label>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select
                    options={monthNames.map((m, i) => ({ value: String(i + 1), label: m }))}
                    value={String(selectedMonth)}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select
                    options={[{ value: '2025', label: '2025' }, { value: '2026', label: '2026' }, { value: '2027', label: '2027' }]}
                    value={String(selectedYear)}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  />
                </div>
              </div>

              {existingPeriod && (
                <div className={`rounded-lg border p-4 ${
                  existingPeriod.status === 'paid' ? 'border-success bg-success-50' :
                  existingPeriod.status === 'processed' ? 'border-warning bg-warning-50' :
                  'border-border bg-background'
                }`}>
                  <div className="flex items-center gap-3">
                    {existingPeriod.status === 'paid' ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : existingPeriod.status === 'processed' ? (
                      <Clock className="h-5 w-5 text-warning" />
                    ) : (
                      <Clock className="h-5 w-5 text-text-secondary" />
                    )}
                    <div>
                      <p className="font-medium text-text-primary">{monthNames[selectedMonth - 1]} {selectedYear} payroll</p>
                      <p className="text-xs text-text-secondary">Status: <span className="capitalize font-medium">{existingPeriod.status}</span></p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={existingPeriod?.status === 'paid'}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Select Employees */}
      {step === 2 && (
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-text-primary">Select Employees ({selectedEmployees.length} selected)</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
                  <Button variant="outline" size="sm" onClick={deselectAll}>Deselect All</Button>
                </div>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {eligibleEmployees.map((es) => {
                  if (!es) return null
                  const isSelected = selectedEmployees.includes(es.employeeId)
                  return (
                    <div
                      key={es.employeeId}
                      onClick={() => toggleEmployee(es.employeeId)}
                      className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all ${
                        isSelected ? 'border-primary bg-primary-50' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar initials={`${es.employee.firstName[0]}${es.employee.lastName[0]}`} size="sm" color={isSelected ? '#2563EB' : '#94A3B8'} />
                        <div>
                          <p className="font-medium text-text-primary">{es.employee.firstName} {es.employee.lastName}</p>
                          <p className="text-xs text-text-secondary">{es.employee.department} · {es.employee.designation}</p>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-text-primary">{formatCurrency(es.grossSalary)}</p>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={selectedEmployees.length === 0}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Leave & Attendance */}
      {step === 3 && (
        <motion.div variants={item}>
          <StepLeaveAttendance
            selectedEmployees={selectedEmployees}
            month={selectedMonth}
            year={selectedYear}
            draftAttendance={attendance}
            onUpdate={(a) => { setAttendance(a); markRecalcNeeded() }}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        </motion.div>
      )}

      {/* Step 4: Joiners & Exits */}
      {step === 4 && (
        <motion.div variants={item}>
          <StepJoinerExit
            selectedEmployees={selectedEmployees}
            month={selectedMonth}
            year={selectedYear}
            draftJoiners={joiners}
            draftExits={exits}
            onUpdateJoiners={(j) => { setJoiners(j); markRecalcNeeded() }}
            onUpdateExits={(e) => { setExits(e); markRecalcNeeded() }}
            onBack={() => setStep(3)}
            onNext={() => setStep(5)}
          />
        </motion.div>
      )}

      {/* Step 5: Revisions & Arrears */}
      {step === 5 && (
        <motion.div variants={item}>
          <StepRevisionArrear
            selectedEmployees={selectedEmployees}
            month={selectedMonth}
            year={selectedYear}
            draftArrears={arrears}
            onUpdate={(a) => { setArrears(a); markRecalcNeeded() }}
            onBack={() => setStep(4)}
            onNext={() => setStep(6)}
          />
        </motion.div>
      )}

      {/* Step 6: Off-Cycle & Holds */}
      {step === 6 && (
        <motion.div variants={item}>
          <StepOffCycleHolds
            selectedEmployees={selectedEmployees}
            month={selectedMonth}
            year={selectedYear}
            draftOffCycle={offCyclePayments}
            draftHolds={holds}
            onUpdateOffCycle={(o) => { setOffCyclePayments(o); markRecalcNeeded() }}
            onUpdateHolds={(h) => { setHolds(h); markRecalcNeeded() }}
            onBack={() => setStep(5)}
            onNext={() => setStep(7)}
          />
        </motion.div>
      )}

      {/* Step 7: Final Review & Process */}
      {step === 7 && (
        <motion.div variants={item}>
          <StepFinalReview
            selectedEmployees={selectedEmployees}
            month={selectedMonth}
            year={selectedYear}
            attendance={attendance}
            joiners={joiners}
            exits={exits}
            arrears={arrears}
            offCyclePayments={offCyclePayments}
            holds={holds}
            draftStatutoryOverrides={statutoryOverrides}
            onUpdateStatutory={setStatutoryOverrides}
            onBack={() => setStep(6)}
            onRecalculate={handleRecalculate}
            needsRecalculation={recalculationNeeded}
          />
        </motion.div>
      )}
    </motion.div>
  )
}
