import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { employees } from '@/data/mock'
import { extendedPayrollStore } from '@/lib/payroll-extended'
import { payrollStore } from '@/lib/payroll-store'
import { useToast } from '@/components/ui/toast'
import { ArrowLeft, FileText, Download, Eye, X, Building2, User } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

const financialYears = ['2025-26', '2024-25']

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function Form16Page() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [selectedFY, setSelectedFY] = useState('2025-26')
  const [viewingForm16, setViewingForm16] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const isEmployee = user?.role === 'employee'
  const isHR = user?.role === 'hr' || user?.role === 'admin'
  const employeeId = user?.employeeId

  const handleGenerate = (empId: string) => {
    const emp = employees.find(e => e.id === empId)
    if (!emp) return

    const form16 = extendedPayrollStore.generateForm16(
      empId,
      `${emp.firstName} ${emp.lastName}`,
      getEmpPAN(empId)
    )

    setViewingForm16(form16)
    toast('Form 16 generated successfully!', 'success')
  }

  const handleDownload = (form16: any) => {
    const emp = employees.find(e => e.id === form16.employeeId)
    if (!emp) return

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Form 16 - ${form16.employeeName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; background: #fff; }
    .header { text-align: center; border-bottom: 3px solid #2563EB; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 24px; color: #2563EB; margin-bottom: 8px; }
    .header h2 { font-size: 18px; color: #1a1a1a; margin-bottom: 4px; }
    .header p { color: #64748b; font-size: 14px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; padding: 10px 15px; border-radius: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; padding: 20px; background: #f8fafc; border-radius: 12px; }
    .info-group label { font-size: 12px; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 4px; }
    .info-group p { font-size: 14px; font-weight: 500; color: #1a1a1a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { text-align: left; padding: 12px; background: #f1f5f9; font-size: 12px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
    th:last-child, td:last-child { text-align: right; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .total-row { font-weight: 600; background: #f8fafc; }
    .green { color: #16a34a; }
    .red { color: #dc2626; }
    .summary-box { background: linear-gradient(135deg, #2563EB, #1d4ed8); color: white; padding: 20px; border-radius: 12px; margin-top: 20px; }
    .summary-box h3 { font-size: 16px; margin-bottom: 12px; }
    .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .summary-row.total { border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px; font-weight: 700; font-size: 16px; }
    .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>FORM 16</h1>
    <h2>Certificate under Section 203 of the Income-tax Act, 1961</h2>
    <p>Tax deducted at source from income chargeable under the head "Salaries"</p>
    <p>Financial Year: ${form16.financialYear} | Quarter: Q${form16.quarter}</p>
  </div>

  <div class="section">
    <h3 class="section-title">Employer & Employee Details</h3>
    <div class="info-grid">
      <div class="info-group">
        <label>Employer Name</label>
        <p>${form16.employerName}</p>
      </div>
      <div class="info-group">
        <label>Employer TAN</label>
        <p>${form16.employerTAN}</p>
      </div>
      <div class="info-group">
        <label>Employee Name</label>
        <p>${form16.employeeName}</p>
      </div>
      <div class="info-group">
        <label>Employee PAN</label>
        <p>${form16.employeePAN}</p>
      </div>
      <div class="info-group">
        <label>Employee ID</label>
        <p>${emp.id.toUpperCase()}</p>
      </div>
      <div class="info-group">
        <label>Department</label>
        <p>${emp.department}</p>
      </div>
    </div>
  </div>

  ${form16.partA ? `
  <div class="section">
    <h3 class="section-title">Part A - Summary of Deductions under Chapter VI-A</h3>
    <table>
      <thead>
        <tr><th>Section</th><th>Description</th><th>Amount</th></tr>
      </thead>
      <tbody>
        <tr><td>80C</td><td>PPF, ELSS, LIC, NSC, etc.</td><td class="green">${formatCurrency(form16.partA.summaryOfDeductions.section80C)}</td></tr>
        <tr><td>80D</td><td>Health Insurance Premium</td><td class="green">${formatCurrency(form16.partA.summaryOfDeductions.section80D)}</td></tr>
        <tr><td>80E</td><td>Education Loan Interest</td><td class="green">${formatCurrency(form16.partA.summaryOfDeductions.section80E)}</td></tr>
        <tr><td>80G</td><td>Donations</td><td class="green">${formatCurrency(form16.partA.summaryOfDeductions.section80G)}</td></tr>
        <tr><td>80TTA</td><td>Savings Account Interest</td><td class="green">${formatCurrency(form16.partA.summaryOfDeductions.section80TTA)}</td></tr>
        <tr><td>Other</td><td>Other Deductions</td><td class="green">${formatCurrency(form16.partA.summaryOfDeductions.otherDeductions)}</td></tr>
        <tr class="total-row"><td colspan="2">Total Deductions</td><td class="green">${formatCurrency(form16.partA.summaryOfDeductions.totalDeductions)}</td></tr>
      </tbody>
    </table>
  </div>
  ` : ''}

  ${form16.partB ? `
  <div class="section">
    <h3 class="section-title">Part B - Breakup of Salary and Deductions</h3>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div>
        <h4 style="font-size: 14px; margin-bottom: 10px; color: #16a34a;">Salary Breakup</h4>
        <table>
          <thead>
            <tr><th>Component</th><th>Amount</th></tr>
          </thead>
          <tbody>
            <tr><td>Basic Salary</td><td>${formatCurrency(form16.partB.salaryBreakup.basicSalary)}</td></tr>
            <tr><td>HRA</td><td>${formatCurrency(form16.partB.salaryBreakup.hra)}</td></tr>
            <tr><td>Special Allowance</td><td>${formatCurrency(form16.partB.salaryBreakup.specialAllowance)}</td></tr>
            <tr><td>Transport Allowance</td><td>${formatCurrency(form16.partB.salaryBreakup.transportAllowance)}</td></tr>
            <tr><td>Medical Allowance</td><td>${formatCurrency(form16.partB.salaryBreakup.medicalAllowance)}</td></tr>
            <tr><td>Other Allowances</td><td>${formatCurrency(form16.partB.salaryBreakup.otherAllowances)}</td></tr>
            <tr class="total-row"><td>Gross Salary</td><td class="green">${formatCurrency(form16.partB.salaryBreakup.totalSalary)}</td></tr>
          </tbody>
        </table>
      </div>
      <div>
        <h4 style="font-size: 14px; margin-bottom: 10px; color: #dc2626;">Deductions</h4>
        <table>
          <thead>
            <tr><th>Component</th><th>Amount</th></tr>
          </thead>
          <tbody>
            <tr><td>PF</td><td class="red">${formatCurrency(form16.partB.deductions.pf)}</td></tr>
            <tr><td>ESI</td><td class="red">${formatCurrency(form16.partB.deductions.esi)}</td></tr>
            <tr><td>Professional Tax</td><td class="red">${formatCurrency(form16.partB.deductions.professionalTax)}</td></tr>
            <tr><td>TDS</td><td class="red">${formatCurrency(form16.partB.deductions.tds)}</td></tr>
            <tr class="total-row"><td>Total Deductions</td><td class="red">${formatCurrency(form16.partB.deductions.totalDeductions)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  ` : ''}

  <div class="summary-box">
    <h3>Tax Summary</h3>
    <div class="summary-row"><span>Gross Salary</span><span>${formatCurrency(form16.grossSalary)}</span></div>
    <div class="summary-row"><span>Total Deductions</span><span>${formatCurrency(form16.totalDeductions)}</span></div>
    <div class="summary-row"><span>Taxable Income</span><span>${formatCurrency(form16.taxableIncome)}</span></div>
    <div class="summary-row"><span>Tax Paid</span><span>${formatCurrency(form16.taxPaid)}</span></div>
    <div class="summary-row"><span>Surcharge</span><span>${formatCurrency(form16.surcharge)}</span></div>
    <div class="summary-row"><span>Health & Education Cess (4%)</span><span>${formatCurrency(form16.cess)}</span></div>
    <div class="summary-row total"><span>Total Tax Liability</span><span>${formatCurrency(form16.totalTaxLiability)}</span></div>
  </div>

  <div class="footer">
    <p>This is a computer-generated Form 16 and does not require a signature.</p>
    <p>Generated on ${new Date(form16.generatedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Form16-${emp.firstName}-${emp.lastName}-${form16.financialYear}.html`
    a.click()
    URL.revokeObjectURL(url)
    toast('Form 16 downloaded successfully!', 'success')
  }

  const displayEmployees = isEmployee && employeeId
    ? employees.filter(e => e.id === employeeId)
    : employees.filter(emp => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
          emp.firstName.toLowerCase().includes(q) ||
          emp.lastName.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q)
        )
      })

  const getEmpForm16Status = (empId: string) => {
    const salary = payrollStore.getEmployeeSalary(empId)
    if (!salary) return 'not-configured'
    return 'available'
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
        <Button
          variant="ghost"
          onClick={() => navigate(isEmployee ? '/' : '/payroll')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEmployee ? 'Back to Dashboard' : 'Back to Payroll'}
        </Button>
      </motion.div>

      {/* Page Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm font-bold text-text-primary">
            {isEmployee ? 'My Form 16' : 'Form 16'}
          </h1>
          <p className="mt-1 text-text-secondary">
            {isEmployee
              ? 'View and download your Form 16 for tax filing.'
              : 'Generate and manage Form 16 for employees.'}
          </p>
        </div>
      </motion.div>

      {/* Financial Year Selector */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-secondary">Financial Year:</span>
          <div className="flex gap-2">
            {financialYears.map(fy => (
              <Button
                key={fy}
                variant={selectedFY === fy ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFY(fy)}
              >
                {fy}
              </Button>
            ))}
          </div>
        </div>
        {!isEmployee && (
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary sm:max-w-xs"
            />
          </div>
        )}
      </motion.div>

      {/* Employee Form 16 Cards */}
      <motion.div variants={item}>
        {displayEmployees.length > 0 ? (
          <div className="space-y-3">
            {displayEmployees.map(emp => {
              const status = getEmpForm16Status(emp.id)
              return (
                <Card key={emp.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary font-bold text-xs">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-text-secondary">{emp.department} &bull; {emp.designation}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-text-secondary">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {emp.id.toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              PAN: {getEmpPAN(emp.id)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant={status === 'available' ? 'success' : 'secondary'}>
                          {status === 'available' ? 'Available' : 'Not Configured'}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerate(emp.id)}
                            disabled={status !== 'available'}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Generate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleGenerate(emp.id)
                              setTimeout(() => {
                                const form16 = extendedPayrollStore.generateForm16(
                                  emp.id,
                                  `${emp.firstName} ${emp.lastName}`,
                                  getEmpPAN(emp.id)
                                )
                                handleDownload(form16)
                              }, 100)
                            }}
                            disabled={status !== 'available'}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-text-secondary" />
                <h3 className="mt-4 text-xs font-medium text-text-primary">No employees found</h3>
                <p className="mt-2 text-text-secondary">
                  {searchQuery ? 'Try a different search term.' : 'No employee data available.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Form 16 Preview Modal */}
      {viewingForm16 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-border pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-bold">
                    F
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-text-primary">Form 16</h2>
                    <p className="text-xs text-text-secondary">
                      Financial Year: {viewingForm16.financialYear} | Quarter: Q{viewingForm16.quarter}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingForm16(null)}
                  className="rounded-lg p-2 hover:bg-background transition-colors"
                >
                  <X className="h-5 w-5 text-text-secondary" />
                </button>
              </div>

              {/* Employer & Employee Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-background rounded-xl">
                <div>
                  <p className="text-xs text-text-secondary uppercase">Employer</p>
                  <p className="font-medium text-text-primary">{viewingForm16.employerName}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary uppercase">Employer TAN</p>
                  <p className="font-medium text-text-primary">{viewingForm16.employerTAN}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary uppercase">Employee</p>
                  <p className="font-medium text-text-primary">{viewingForm16.employeeName}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary uppercase">PAN</p>
                  <p className="font-medium text-text-primary">{viewingForm16.employeePAN}</p>
                </div>
              </div>

              {/* Part A */}
              {viewingForm16.partA && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Part A - Summary of Deductions (Chapter VI-A)
                  </h3>
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-background">
                          <th className="text-left text-xs font-medium text-text-secondary uppercase px-4 py-3">Section</th>
                          <th className="text-left text-xs font-medium text-text-secondary uppercase px-4 py-3">Description</th>
                          <th className="text-right text-xs font-medium text-text-secondary uppercase px-4 py-3">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { section: '80C', name: 'PPF, ELSS, LIC, NSC', amount: viewingForm16.partA.summaryOfDeductions.section80C },
                          { section: '80D', name: 'Health Insurance Premium', amount: viewingForm16.partA.summaryOfDeductions.section80D },
                          { section: '80E', name: 'Education Loan Interest', amount: viewingForm16.partA.summaryOfDeductions.section80E },
                          { section: '80G', name: 'Donations', amount: viewingForm16.partA.summaryOfDeductions.section80G },
                          { section: '80TTA', name: 'Savings Account Interest', amount: viewingForm16.partA.summaryOfDeductions.section80TTA },
                          { section: 'Other', name: 'Other Deductions', amount: viewingForm16.partA.summaryOfDeductions.otherDeductions },
                        ].map((row, i) => (
                          <tr key={i} className="border-t border-border">
                            <td className="px-4 py-3 text-xs font-medium text-text-primary">{row.section}</td>
                            <td className="px-4 py-3 text-xs text-text-secondary">{row.name}</td>
                            <td className="px-4 py-3 text-xs font-medium text-right text-success">{formatCurrency(row.amount)}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-border bg-background font-semibold">
                          <td className="px-4 py-3 text-xs text-text-primary" colSpan={2}>Total Deductions</td>
                          <td className="px-4 py-3 text-xs text-right text-success">{formatCurrency(viewingForm16.partA.summaryOfDeductions.totalDeductions)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Part B */}
              {viewingForm16.partB && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    Part B - Salary Breakup & Deductions
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Salary Breakup */}
                    <div className="border border-border rounded-xl overflow-hidden">
                      <div className="bg-success-50 px-4 py-2.5 border-b border-border">
                        <h4 className="text-xs font-semibold text-success uppercase">Salary Components</h4>
                      </div>
                      <table className="w-full">
                        <tbody>
                          {[
                            { name: 'Basic Salary', amount: viewingForm16.partB.salaryBreakup.basicSalary },
                            { name: 'HRA', amount: viewingForm16.partB.salaryBreakup.hra },
                            { name: 'Special Allowance', amount: viewingForm16.partB.salaryBreakup.specialAllowance },
                            { name: 'Transport Allowance', amount: viewingForm16.partB.salaryBreakup.transportAllowance },
                            { name: 'Medical Allowance', amount: viewingForm16.partB.salaryBreakup.medicalAllowance },
                            { name: 'Other Allowances', amount: viewingForm16.partB.salaryBreakup.otherAllowances },
                          ].map((row, i) => (
                            <tr key={i} className="border-t border-border">
                              <td className="px-4 py-2.5 text-xs text-text-secondary">{row.name}</td>
                              <td className="px-4 py-2.5 text-xs font-medium text-right text-text-primary">{formatCurrency(row.amount)}</td>
                            </tr>
                          ))}
                          <tr className="border-t-2 border-border bg-success-50 font-semibold">
                            <td className="px-4 py-2.5 text-xs text-text-primary">Gross Salary</td>
                            <td className="px-4 py-2.5 text-xs text-right text-success">{formatCurrency(viewingForm16.partB.salaryBreakup.totalSalary)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Deductions */}
                    <div className="border border-border rounded-xl overflow-hidden">
                      <div className="bg-danger-50 px-4 py-2.5 border-b border-border">
                        <h4 className="text-xs font-semibold text-danger uppercase">Statutory Deductions</h4>
                      </div>
                      <table className="w-full">
                        <tbody>
                          {[
                            { name: 'PF', amount: viewingForm16.partB.deductions.pf },
                            { name: 'ESI', amount: viewingForm16.partB.deductions.esi },
                            { name: 'Professional Tax', amount: viewingForm16.partB.deductions.professionalTax },
                            { name: 'TDS', amount: viewingForm16.partB.deductions.tds },
                          ].map((row, i) => (
                            <tr key={i} className="border-t border-border">
                              <td className="px-4 py-2.5 text-xs text-text-secondary">{row.name}</td>
                              <td className="px-4 py-2.5 text-xs font-medium text-right text-danger">{formatCurrency(row.amount)}</td>
                            </tr>
                          ))}
                          <tr className="border-t-2 border-border bg-danger-50 font-semibold">
                            <td className="px-4 py-2.5 text-xs text-text-primary">Total Deductions</td>
                            <td className="px-4 py-2.5 text-xs text-right text-danger">{formatCurrency(viewingForm16.partB.deductions.totalDeductions)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tax Summary */}
              <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white">
                <h3 className="text-xs font-semibold mb-3 opacity-90">Tax Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="opacity-80">Gross Salary</span>
                    <span>{formatCurrency(viewingForm16.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="opacity-80">Total Deductions</span>
                    <span>{formatCurrency(viewingForm16.totalDeductions)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="opacity-80">Taxable Income</span>
                    <span>{formatCurrency(viewingForm16.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="opacity-80">Tax Paid</span>
                    <span>{formatCurrency(viewingForm16.taxPaid)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="opacity-80">Surcharge</span>
                    <span>{formatCurrency(viewingForm16.surcharge)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="opacity-80">Cess (4%)</span>
                    <span>{formatCurrency(viewingForm16.cess)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold pt-2 border-t border-white/20">
                    <span>Total Tax Liability</span>
                    <span>{formatCurrency(viewingForm16.totalTaxLiability)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setViewingForm16(null)}>
                  Close
                </Button>
                <Button onClick={() => handleDownload(viewingForm16)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download as HTML
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

function getEmpPAN(empId: string): string {
  const panMap: Record<string, string> = {
    '1': 'ABCPA1234C',
    '2': 'BCDPB2345D',
    '3': 'CDEPC3456E',
    '4': 'DEFQD4567F',
    '5': 'EFGRE5678G',
    '6': 'FGHSF6789H',
    '7': 'GHITG7890I',
    '8': 'HIJUH8901J',
    '9': 'IJKVI9012K',
    '10': 'JKLVJ0123L',
  }
  return panMap[empId] || 'ABCDE1234F'
}
