import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { extendedPayrollStore } from '@/lib/payroll-extended'
import { useAuth } from '@/contexts/auth-context'
import { employees } from '@/data/mock'
import {
  Banknote,
  Plus,
  Search,
  CheckCircle,
  Clock,
  TrendingDown,
  CreditCard,
  ArrowLeft,
  X,
  Eye,
  Calendar,
  Percent,
} from 'lucide-react'
import type { Loan, LoanType, LoanStatus } from '@/types'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

const loanTypes: LoanType[] = ['salary-advance', 'emergency', 'education', 'vehicle', 'housing']

const loanTypeLabels: Record<LoanType, string> = {
  'salary-advance': 'Salary Advance',
  emergency: 'Emergency Loan',
  education: 'Education Loan',
  vehicle: 'Vehicle Loan',
  housing: 'Housing Loan',
}

const statusConfig: Record<LoanStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'secondary' | 'outline' }> = {
  active: { label: 'Active', variant: 'success' },
  closed: { label: 'Closed', variant: 'secondary' },
  defaulted: { label: 'Defaulted', variant: 'danger' },
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function LoanManagement() {
  const { user } = useAuth()
  const { toast } = useToast()
  const isEmployee = user?.role === 'employee'
  const employeeId = user?.employeeId

  const [loans, setLoans] = useState<Loan[]>(() =>
    isEmployee && employeeId
      ? extendedPayrollStore.getLoans(employeeId)
      : extendedPayrollStore.getLoans()
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [viewingLoan, setViewingLoan] = useState<Loan | null>(null)
  const [showRepayment, setShowRepayment] = useState<Loan | null>(null)

  const [formData, setFormData] = useState({
    loanType: 'salary-advance' as LoanType,
    amount: '',
    tenureMonths: '',
    reason: '',
  })

  const refreshLoans = () => {
    setLoans(
      isEmployee && employeeId
        ? extendedPayrollStore.getLoans(employeeId)
        : extendedPayrollStore.getLoans()
    )
  }

  const filteredLoans = loans.filter((loan) => {
    if (searchQuery) {
      const emp = employees.find((e) => e.id === loan.employeeId)
      const q = searchQuery.toLowerCase()
      if (
        emp &&
        !`${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) &&
        !loan.reason.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  const activeLoans = loans.filter((l) => l.status === 'active')
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingAmount, 0)
  const totalLoanAmount = loans.reduce((sum, l) => sum + l.amount, 0)

  const handleSubmit = () => {
    if (!formData.amount || !formData.tenureMonths || !formData.reason) {
      toast('Please fill in all required fields', 'error')
      return
    }
    const amount = Number(formData.amount)
    const tenure = Number(formData.tenureMonths)
    const interestRate = formData.loanType === 'salary-advance' ? 0 : 8.5
    const monthlyInterest = (amount * (interestRate / 100)) / 12
    const monthlyEMI = Math.round((amount + amount * (interestRate / 100) * (tenure / 12)) / tenure)

    extendedPayrollStore.addLoan({
      employeeId: employeeId || '1',
      loanType: formData.loanType,
      amount,
      tenureMonths: tenure,
      monthlyEMI,
      interestRate,
      reason: formData.reason,
      status: 'pending' as any,
    })
    refreshLoans()
    setShowForm(false)
    setFormData({ loanType: 'salary-advance', amount: '', tenureMonths: '', reason: '' })
    toast('Loan application submitted', 'success')
  }

  const handleApprove = (id: string) => {
    extendedPayrollStore.approveLoan(id, user?.name || 'HR Admin')
    refreshLoans()
    toast('Loan approved', 'success')
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const getTenureProgress = (loan: Loan) => {
    const paidEmis = loan.repayments.filter((r) => r.status === 'paid').length
    return Math.round((paidEmis / loan.tenureMonths) * 100)
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </motion.div>

      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm font-bold text-text-primary">Loan Management</h1>
          <p className="mt-1 text-text-secondary">
            {isEmployee ? 'Apply for loans and track your repayments.' : 'Manage employee loans and approvals.'}
          </p>
        </div>
        {isEmployee && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Apply for Loan
          </Button>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Loans</p>
                <p className="text-sm font-bold text-text-primary">{loans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Active Loans</p>
                <p className="text-sm font-bold text-text-primary">{activeLoans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-50">
                <TrendingDown className="h-5 w-5 text-danger" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Outstanding</p>
                <p className="text-sm font-bold text-danger">{formatCurrency(totalOutstanding)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50">
                <Banknote className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Disbursed</p>
                <p className="text-sm font-bold text-text-primary">{formatCurrency(totalLoanAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      {!isEmployee && (
        <motion.div variants={item}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by employee or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </motion.div>
      )}

      {/* Active Loan Cards */}
      {activeLoans.length > 0 && (
        <motion.div variants={item}>
          <h2 className="text-xs font-semibold text-text-primary mb-3">
            {isEmployee ? 'Your Active Loans' : 'Active Loans'}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeLoans.map((loan) => {
              const emp = employees.find((e) => e.id === loan.employeeId)
              const progress = getTenureProgress(loan)
              const cfg = statusConfig[loan.status]
              return (
                <Card key={loan.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-semibold text-text-primary">{loanTypeLabels[loan.loanType]}</p>
                        {!isEmployee && emp && (
                          <p className="text-xs text-text-secondary mt-1">{emp.firstName} {emp.lastName}</p>
                        )}
                      </div>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Loan Amount</span>
                        <span className="font-medium text-text-primary">{formatCurrency(loan.amount)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Outstanding</span>
                        <span className="font-medium text-danger">{formatCurrency(loan.outstandingAmount)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Monthly EMI</span>
                        <span className="font-medium text-text-primary">{formatCurrency(loan.monthlyEMI)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Tenure</span>
                        <span className="font-medium text-text-primary">{loan.tenureMonths} months</span>
                      </div>
                      {loan.interestRate > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-text-secondary">Interest Rate</span>
                          <span className="font-medium text-text-primary">{loan.interestRate}%</span>
                        </div>
                      )}
                      {/* Progress bar */}
                      <div className="pt-2">
                        <div className="flex justify-between text-xs text-text-secondary mb-1">
                          <span>Repayment Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-background">
                          <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-text-secondary mt-1">
                          <span>{loan.repayments.filter((r) => r.status === 'paid').length} EMIs paid</span>
                          <span>{loan.tenureMonths - loan.repayments.filter((r) => r.status === 'paid').length} remaining</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowRepayment(loan)}>
                        <Calendar className="mr-1 h-3 w-3" />
                        EMI Schedule
                      </Button>
                      {!isEmployee && (
                        <Button size="sm" className="flex-1" onClick={() => handleApprove(loan.id)}>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* All Loans Table */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-text-secondary">Loan Type</th>
                    {!isEmployee && <th className="px-4 py-3 text-left text-xs font-medium uppercase text-text-secondary">Employee</th>}
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-text-secondary">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-text-secondary">EMI</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-text-secondary">Outstanding</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase text-text-secondary">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoans.length > 0 ? (
                    filteredLoans.map((loan) => {
                      const emp = employees.find((e) => e.id === loan.employeeId)
                      const cfg = statusConfig[loan.status]
                      return (
                        <tr key={loan.id} className="border-b border-border hover:bg-background/50">
                          <td className="px-4 py-3">
                            <p className="text-xs font-medium text-text-primary">{loanTypeLabels[loan.loanType]}</p>
                            <p className="text-xs text-text-secondary">{loan.reason}</p>
                          </td>
                          {!isEmployee && emp && (
                            <td className="px-4 py-3">
                              <p className="text-xs text-text-primary">{emp.firstName} {emp.lastName}</p>
                            </td>
                          )}
                          <td className="px-4 py-3 text-right text-xs text-text-primary">{formatCurrency(loan.amount)}</td>
                          <td className="px-4 py-3 text-right text-xs text-text-primary">{formatCurrency(loan.monthlyEMI)}</td>
                          <td className="px-4 py-3 text-right text-xs text-danger">{formatCurrency(loan.outstandingAmount)}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={cfg.variant}>{cfg.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setViewingLoan(loan)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={isEmployee ? 6 : 7} className="px-4 py-12 text-center">
                        <Banknote className="mx-auto h-12 w-12 text-text-secondary" />
                        <p className="mt-4 text-xs font-medium text-text-primary">No loans found</p>
                        <p className="mt-2 text-text-secondary">
                          {isEmployee ? 'Apply for a loan to get started.' : 'No loans match your search.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Apply Loan Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="text-xs font-semibold text-text-primary">Apply for Loan</h2>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 hover:bg-background">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Loan Type *</label>
                <select
                  value={formData.loanType}
                  onChange={(e) => setFormData({ ...formData, loanType: e.target.value as LoanType })}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {loanTypes.map((t) => (
                    <option key={t} value={t}>{loanTypeLabels[t]}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Tenure (months) *</label>
                  <input
                    type="number"
                    value={formData.tenureMonths}
                    onChange={(e) => setFormData({ ...formData, tenureMonths: e.target.value })}
                    placeholder="12"
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Reason *</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Explain why you need this loan..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              {formData.amount && formData.tenureMonths && (
                <div className="rounded-xl bg-primary-50 p-4">
                  <p className="text-xs text-text-secondary uppercase mb-2">Estimated EMI</p>
                  <p className="text-sm font-bold text-primary">
                    {formatCurrency(
                      Math.round(
                        (Number(formData.amount) +
                          Number(formData.amount) *
                            ((formData.loanType === 'salary-advance' ? 0 : 8.5) / 100) *
                            (Number(formData.tenureMonths) / 12)) /
                          Number(formData.tenureMonths)
                      )
                    )}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Interest: {formData.loanType === 'salary-advance' ? '0%' : '8.5% p.a.'}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t border-border p-6">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Submit Application</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Loan Details Modal */}
      {viewingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="text-xs font-semibold text-text-primary">Loan Details</h2>
              <button onClick={() => setViewingLoan(null)} className="rounded-lg p-1 hover:bg-background">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              {(() => {
                const emp = employees.find((e) => e.id === viewingLoan.employeeId)
                const cfg = statusConfig[viewingLoan.status]
                const progress = getTenureProgress(viewingLoan)
                return (
                  <>
                    {!isEmployee && emp && (
                      <div className="flex items-center gap-3 pb-3 border-b border-border">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary font-semibold text-xs">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-text-secondary">{emp.department} • {emp.designation}</p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-text-secondary uppercase">Loan Type</p>
                        <p className="font-medium text-text-primary">{loanTypeLabels[viewingLoan.loanType]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary uppercase">Status</p>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary uppercase">Loan Amount</p>
                        <p className="font-medium text-text-primary">{formatCurrency(viewingLoan.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary uppercase">Outstanding</p>
                        <p className="font-medium text-danger">{formatCurrency(viewingLoan.outstandingAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary uppercase">Monthly EMI</p>
                        <p className="font-medium text-text-primary">{formatCurrency(viewingLoan.monthlyEMI)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary uppercase">Interest Rate</p>
                        <p className="font-medium text-text-primary">{viewingLoan.interestRate}% p.a.</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary uppercase">Tenure</p>
                        <p className="font-medium text-text-primary">{viewingLoan.tenureMonths} months</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary uppercase">Disbursed On</p>
                        <p className="font-medium text-text-primary">
                          {viewingLoan.disbursedAt
                            ? new Date(viewingLoan.disbursedAt).toLocaleDateString('en-IN')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary uppercase mb-1">Reason</p>
                      <p className="text-xs text-text-primary">{viewingLoan.reason}</p>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-text-secondary mb-1">
                        <span>Repayment Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-background">
                        <div
                          className="h-3 rounded-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
            <div className="flex justify-end gap-3 border-t border-border p-6">
              <Button variant="outline" onClick={() => { setViewingLoan(null); setShowRepayment(viewingLoan) }} className="gap-2">
                <Calendar className="h-4 w-4" />
                EMI Schedule
              </Button>
              <Button variant="outline" onClick={() => setViewingLoan(null)}>Close</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* EMI Schedule Modal */}
      {showRepayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-6">
              <div>
                <h2 className="text-xs font-semibold text-text-primary">EMI Schedule</h2>
                <p className="text-xs text-text-secondary">{loanTypeLabels[showRepayment.loanType]}</p>
              </div>
              <button onClick={() => setShowRepayment(null)} className="rounded-lg p-1 hover:bg-background">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {showRepayment.repayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase text-text-secondary">Month</th>
                        <th className="px-3 py-2 text-right text-xs font-medium uppercase text-text-secondary">EMI</th>
                        <th className="px-3 py-2 text-right text-xs font-medium uppercase text-text-secondary">Principal</th>
                        <th className="px-3 py-2 text-right text-xs font-medium uppercase text-text-secondary">Interest</th>
                        <th className="px-3 py-2 text-right text-xs font-medium uppercase text-text-secondary">Balance</th>
                        <th className="px-3 py-2 text-center text-xs font-medium uppercase text-text-secondary">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showRepayment.repayments.map((rep) => (
                        <tr key={rep.id} className="border-b border-border hover:bg-background/50">
                          <td className="px-3 py-2 text-xs text-text-primary">
                            {monthNames[rep.month - 1]} {rep.year}
                          </td>
                          <td className="px-3 py-2 text-right text-xs text-text-primary">{formatCurrency(rep.emiAmount)}</td>
                          <td className="px-3 py-2 text-right text-xs text-text-primary">{formatCurrency(rep.principalAmount)}</td>
                          <td className="px-3 py-2 text-right text-xs text-text-primary">{formatCurrency(rep.interestAmount)}</td>
                          <td className="px-3 py-2 text-right text-xs text-text-primary">{formatCurrency(rep.outstandingBalance)}</td>
                          <td className="px-3 py-2 text-center">
                            <Badge variant={rep.status === 'paid' ? 'success' : 'warning'}>{rep.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-text-secondary">
                  <Clock className="mx-auto h-10 w-10 mb-2" />
                  <p>No repayments recorded yet.</p>
                </div>
              )}
            </div>
            <div className="flex justify-end border-t border-border p-6">
              <Button variant="outline" onClick={() => setShowRepayment(null)}>Close</Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
