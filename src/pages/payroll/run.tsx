import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { payrollStore } from '@/lib/payroll-store'
import { employees } from '@/data/mock'
import { useToast } from '@/components/ui/toast'
import {
  ArrowLeft,
  Check,
  X,
  Calculator,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  FileText,
  Download,
  Loader2,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export function PayrollRun() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)

  const employeeSalaries = payrollStore.getEmployeeSalaries()
  const periods = payrollStore.getPeriods()
  const existingPeriod = periods.find(p => p.month === selectedMonth && p.year === selectedYear)

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const eligibleEmployees = employeeSalaries.map(es => {
    const emp = employees.find(e => e.id === es.employeeId)
    return emp ? { ...es, employee: emp } : null
  }).filter(Boolean)

  const selectedEmployeeData = eligibleEmployees.filter(es => selectedEmployees.includes(es!.employeeId))

  const totalGross = selectedEmployeeData.reduce((sum, es) => sum + es!.grossSalary, 0)
  const totalDeductions = selectedEmployeeData.reduce((sum, es) => {
    const pf = Math.min(Math.round(es!.grossSalary * 0.12), 1800)
    const esi = es!.grossSalary <= 21000 ? Math.round(es!.grossSalary * 0.0075 * 100) / 100 : 0
    const pt = 200
    const tds = Math.round(es!.grossSalary * 0.1)
    return sum + pf + esi + pt + tds
  }, 0)
  const totalNet = totalGross - totalDeductions

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const toggleEmployee = (id: string) => {
    setSelectedEmployees(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelectedEmployees(eligibleEmployees.map(es => es!.employeeId))
  }

  const deselectAll = () => {
    setSelectedEmployees([])
  }

  const handleProcess = async () => {
    if (selectedEmployees.length === 0) {
      toast('Please select at least one employee', 'error')
      return
    }

    setProcessing(true)
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    let period = existingPeriod
    if (!period) {
      period = payrollStore.createPeriod(selectedMonth, selectedYear)
    }

    payrollStore.generatePayslips(period.id)
    payrollStore.processPayroll(period.id, 'HR Admin')
    
    setProcessing(false)
    setProcessed(true)
    toast(`Payroll processed for ${selectedEmployees.length} employees!`, 'success')
  }

  const handleMarkPaid = () => {
    if (existingPeriod) {
      payrollStore.markPaid(existingPeriod.id)
      toast('Payroll marked as paid!', 'success')
      setTimeout(() => navigate('/payroll'), 1000)
    }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Back Button */}
      <motion.div variants={item}>
        <Button variant="ghost" onClick={() => navigate('/payroll')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Payroll
        </Button>
      </motion.div>

      {/* Page Header */}
      <motion.div variants={item}>
        <h1 className="text-sm font-bold text-text-primary">Run Payroll</h1>
        <p className="mt-1 text-text-secondary">Process salaries and generate payslips for your employees.</p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {[
                { id: 1, label: 'Select Period', icon: Clock },
                { id: 2, label: 'Select Employees', icon: Users },
                { id: 3, label: 'Review & Process', icon: Calculator },
                { id: 4, label: 'Complete', icon: CheckCircle },
              ].map((s, index) => (
                <div key={s.id} className="flex items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                        step > s.id
                          ? 'bg-success text-white'
                          : step === s.id
                          ? 'bg-primary text-white'
                          : 'bg-background text-text-secondary'
                      }`}
                    >
                      {step > s.id ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <s.icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-text-primary hidden sm:block">
                      {s.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`mx-4 h-0.5 w-8 sm:w-16 ${step > s.id ? 'bg-success' : 'bg-border'}`} />
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
            <CardHeader>
              <CardTitle>Select Payroll Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    options={[
                      { value: '2025', label: '2025' },
                      { value: '2026', label: '2026' },
                      { value: '2027', label: '2027' },
                    ]}
                    value={String(selectedYear)}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  />
                </div>
              </div>

              {existingPeriod && (
                <div className={`rounded-xl border p-4 ${
                  existingPeriod.status === 'paid' ? 'border-success bg-success-50' :
                  existingPeriod.status === 'processed' ? 'border-warning bg-warning-50' :
                  'border-border bg-background'
                }`}>
                  <div className="flex items-center gap-3">
                    {existingPeriod.status === 'paid' ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : existingPeriod.status === 'processed' ? (
                      <AlertCircle className="h-5 w-5 text-warning" />
                    ) : (
                      <Clock className="h-5 w-5 text-text-secondary" />
                    )}
                    <div>
                      <p className="font-medium text-text-primary">
                        {monthNames[selectedMonth - 1]} {selectedYear} payroll
                      </p>
                      <p className="text-xs text-text-secondary">
                        Status: <span className="capitalize font-medium">{existingPeriod.status}</span>
                      </p>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Select Employees ({selectedEmployees.length} selected)</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>Deselect All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {eligibleEmployees.map((es) => {
                  if (!es) return null
                  const isSelected = selectedEmployees.includes(es.employeeId)
                  return (
                    <div
                      key={es.employeeId}
                      onClick={() => toggleEmployee(es.employeeId)}
                      className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary-50'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar
                          initials={`${es.employee.firstName[0]}${es.employee.lastName[0]}`}
                          size="md"
                          color={isSelected ? '#2563EB' : '#94A3B8'}
                        />
                        <div>
                          <p className="font-medium text-text-primary">
                            {es.employee.firstName} {es.employee.lastName}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {es.employee.department} • {es.employee.designation}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-text-primary">{formatCurrency(es.grossSalary)}</p>
                        <p className="text-xs text-text-secondary">Gross / month</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={selectedEmployees.length === 0}>
                  Review Payroll
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Review & Process */}
      {step === 3 && !processed && (
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Review Payroll Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-text-secondary">Total Gross</p>
                  <p className="mt-1 text-sm font-bold text-text-primary">{formatCurrency(totalGross)}</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-text-secondary">Total Deductions</p>
                  <p className="mt-1 text-sm font-bold text-danger">{formatCurrency(totalDeductions)}</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-text-secondary">Total Net Pay</p>
                  <p className="mt-1 text-sm font-bold text-success">{formatCurrency(totalNet)}</p>
                </div>
              </div>

              {/* Employee Breakdown */}
              <div>
                <h3 className="mb-3 font-medium text-text-primary">Employee Breakdown</h3>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-background/50">
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-text-secondary">Employee</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-text-secondary">Gross</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-text-secondary">Deductions</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-text-secondary">Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedEmployeeData.map((es) => {
                        if (!es) return null
                        const pf = Math.min(Math.round(es.grossSalary * 0.12), 1800)
                        const esi = es.grossSalary <= 21000 ? Math.round(es.grossSalary * 0.0075 * 100) / 100 : 0
                        const pt = 200
                        const tds = Math.round(es.grossSalary * 0.1)
                        const deductions = pf + esi + pt + tds
                        return (
                          <tr key={es.employeeId} className="hover:bg-background/50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  initials={`${es.employee.firstName[0]}${es.employee.lastName[0]}`}
                                  size="sm"
                                  color="#2563EB"
                                />
                                <span className="font-medium text-text-primary">
                                  {es.employee.firstName} {es.employee.lastName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-text-primary">{formatCurrency(es.grossSalary)}</td>
                            <td className="px-4 py-3 text-right text-danger">{formatCurrency(deductions)}</td>
                            <td className="px-4 py-3 text-right font-medium text-success">{formatCurrency(es.grossSalary - deductions)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleProcess} disabled={processing} size="lg">
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
        </motion.div>
      )}

      {/* Step 4: Complete */}
      {step === 3 && processed && (
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-50 mb-6">
                  <CheckCircle className="h-10 w-10 text-success" />
                </div>
                <h2 className="text-sm font-bold text-text-primary">Payroll Processed Successfully!</h2>
                <p className="mt-2 text-text-secondary">
                  {selectedEmployees.length} employees payroll has been processed for {monthNames[selectedMonth - 1]} {selectedYear}.
                </p>
                
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-2xl mx-auto">
                  <div className="rounded-xl bg-background p-4">
                    <p className="text-xs text-text-secondary">Total Gross</p>
                    <p className="text-sm font-bold text-text-primary">{formatCurrency(totalGross)}</p>
                  </div>
                  <div className="rounded-xl bg-background p-4">
                    <p className="text-xs text-text-secondary">Total Deductions</p>
                    <p className="text-sm font-bold text-danger">{formatCurrency(totalDeductions)}</p>
                  </div>
                  <div className="rounded-xl bg-background p-4">
                    <p className="text-xs text-text-secondary">Total Net Pay</p>
                    <p className="text-sm font-bold text-success">{formatCurrency(totalNet)}</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button variant="outline" onClick={handleMarkPaid}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </Button>
                  <Button onClick={() => navigate('/payroll/payslips')}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Payslips
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/payroll')}>
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
