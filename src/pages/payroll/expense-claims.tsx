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
  Receipt,
  Search,
  Plus,
  Upload,
  CheckCircle,
  XCircle,
  Banknote,
  Clock,
  FileText,
  Filter,
  Send,
  Save,
  ArrowLeft,
  X,
  Eye,
} from 'lucide-react'
import type { ExpenseClaim, ExpenseStatus } from '@/types'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

const expenseTypes: ExpenseClaim['expenseType'][] = [
  'travel',
  'food',
  'office-supplies',
  'communication',
  'medical',
  'other',
]

const expenseTypeLabels: Record<ExpenseClaim['expenseType'], string> = {
  travel: 'Travel',
  food: 'Food & Dining',
  'office-supplies': 'Office Supplies',
  communication: 'Communication',
  medical: 'Medical',
  other: 'Other',
}

const statusConfig: Record<ExpenseStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'secondary' | 'outline'; icon: typeof CheckCircle }> = {
  draft: { label: 'Draft', variant: 'secondary', icon: FileText },
  submitted: { label: 'Submitted', variant: 'warning', icon: Send },
  approved: { label: 'Approved', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'danger', icon: XCircle },
  reimbursed: { label: 'Reimbursed', variant: 'success', icon: Banknote },
}

export function ExpenseClaims() {
  const { user } = useAuth()
  const { toast } = useToast()
  const isEmployee = user?.role === 'employee'
  const employeeId = user?.employeeId

  const [expenses, setExpenses] = useState<ExpenseClaim[]>(() =>
    isEmployee && employeeId
      ? extendedPayrollStore.getExpenses(employeeId)
      : extendedPayrollStore.getExpenses()
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [viewingExpense, setViewingExpense] = useState<ExpenseClaim | null>(null)

  const [formData, setFormData] = useState({
    expenseType: 'travel' as ExpenseClaim['expenseType'],
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  })

  const refreshExpenses = () => {
    setExpenses(
      isEmployee && employeeId
        ? extendedPayrollStore.getExpenses(employeeId)
        : extendedPayrollStore.getExpenses()
    )
  }

  const filteredExpenses = expenses.filter((exp) => {
    if (statusFilter !== 'all' && exp.status !== statusFilter) return false
    if (searchQuery) {
      const emp = employees.find((e) => e.id === exp.employeeId)
      const q = searchQuery.toLowerCase()
      if (
        emp &&
        !`${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) &&
        !exp.description.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  const stats = {
    totalSubmitted: expenses.filter(
      (e) => e.status === 'submitted' || e.status === 'approved' || e.status === 'reimbursed'
    ).length,
    totalApproved: expenses.filter((e) => e.status === 'approved' || e.status === 'reimbursed').length,
    totalPending: expenses.filter((e) => e.status === 'submitted').length,
    totalReimbursed: expenses
      .filter((e) => e.status === 'reimbursed')
      .reduce((sum, e) => sum + (e.reimbursementAmount || 0), 0),
  }

  const handleSubmit = (asDraft: boolean) => {
    if (!formData.amount || !formData.description) {
      toast('Please fill in all required fields', 'error')
      return
    }
    extendedPayrollStore.addExpense({
      employeeId: employeeId || '1',
      expenseType: formData.expenseType,
      amount: Number(formData.amount),
      date: formData.date,
      description: formData.description,
      status: asDraft ? 'draft' : 'submitted',
      submittedAt: asDraft ? undefined : new Date().toISOString(),
    })
    refreshExpenses()
    setShowForm(false)
    setFormData({ expenseType: 'travel', amount: '', date: new Date().toISOString().split('T')[0], description: '' })
    toast(asDraft ? 'Expense saved as draft' : 'Expense submitted successfully', 'success')
  }

  const handleApprove = (id: string) => {
    extendedPayrollStore.approveExpense(id, user?.name || 'HR Admin')
    refreshExpenses()
    toast('Expense approved', 'success')
  }

  const handleReject = (id: string) => {
    extendedPayrollStore.rejectExpense(id, user?.name || 'HR Admin', 'Rejected by reviewer')
    refreshExpenses()
    toast('Expense rejected', 'warning')
  }

  const handleReimburse = (id: string) => {
    extendedPayrollStore.reimburseExpense(id)
    refreshExpenses()
    toast('Expense marked as reimbursed', 'success')
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Back Button */}
      <motion.div variants={item}>
        <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </motion.div>

      {/* Page Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm font-bold text-text-primary">Expense Claims</h1>
          <p className="mt-1 text-text-secondary">
            {isEmployee ? 'Submit and track your expense claims.' : 'Review and manage employee expense claims.'}
          </p>
        </div>
        {isEmployee && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Claim
          </Button>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Submitted</p>
                <p className="text-sm font-bold text-text-primary">{stats.totalSubmitted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Approved</p>
                <p className="text-sm font-bold text-text-primary">{stats.totalApproved}</p>
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
                <p className="text-xs text-text-secondary">Pending Review</p>
                <p className="text-sm font-bold text-text-primary">{stats.totalPending}</p>
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
                <p className="text-xs text-text-secondary">Total Reimbursed</p>
                <p className="text-sm font-bold text-success">{formatCurrency(stats.totalReimbursed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {!isEmployee && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by employee or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ExpenseStatus | 'all')}
            className="w-full appearance-none rounded-xl border border-border bg-white pl-10 pr-8 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary sm:w-48"
          >
            <option value="all">All Status</option>
            {expenseTypes.map((s) => (
              <option key={s} value={s}>
                {statusConfig[s as ExpenseStatus]?.label || s}
              </option>
            ))}
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="reimbursed">Reimbursed</option>
          </select>
        </div>
      </motion.div>

      {/* Claims List */}
      <motion.div variants={item}>
        {filteredExpenses.length > 0 ? (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => {
              const emp = employees.find((e) => e.id === expense.employeeId)
              const cfg = statusConfig[expense.status]
              return (
                <Card key={expense.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                          <Receipt className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">
                            {expenseTypeLabels[expense.expenseType]}
                          </p>
                          <p className="text-xs text-text-secondary line-clamp-1">{expense.description}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-text-secondary">
                            {!isEmployee && emp && (
                              <span>{emp.firstName} {emp.lastName}</span>
                            )}
                            <span>{new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {!isEmployee && <span>•</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs font-bold text-text-primary">{formatCurrency(expense.amount)}</p>
                          {expense.reimbursementAmount && (
                            <p className="text-xs text-success">Reimbursed: {formatCurrency(expense.reimbursementAmount)}</p>
                          )}
                        </div>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => setViewingExpense(expense)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!isEmployee && expense.status === 'submitted' && (
                            <>
                              <Button variant="outline" size="icon" className="text-success hover:bg-success-50" onClick={() => handleApprove(expense.id)}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="text-danger hover:bg-danger-50" onClick={() => handleReject(expense.id)}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {!isEmployee && expense.status === 'approved' && (
                            <Button variant="outline" size="icon" className="text-success hover:bg-success-50" onClick={() => handleReimburse(expense.id)}>
                              <Banknote className="h-4 w-4" />
                            </Button>
                          )}
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
                <Receipt className="mx-auto h-12 w-12 text-text-secondary" />
                <h3 className="mt-4 text-xs font-medium text-text-primary">No expense claims found</h3>
                <p className="mt-2 text-text-secondary">
                  {isEmployee ? 'Submit your first expense claim to get started.' : 'No claims match your filters.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Add Claim Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="text-xs font-semibold text-text-primary">New Expense Claim</h2>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1 hover:bg-background">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Expense Type *</label>
                <select
                  value={formData.expenseType}
                  onChange={(e) => setFormData({ ...formData, expenseType: e.target.value as ExpenseClaim['expenseType'] })}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {expenseTypes.map((t) => (
                    <option key={t} value={t}>{expenseTypeLabels[t]}</option>
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
                  <label className="block text-xs font-medium text-text-secondary mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the expense..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Receipt</label>
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-xs text-text-secondary hover:border-primary hover:text-primary transition-colors">
                  <Upload className="h-4 w-4" />
                  Upload receipt (optional)
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-border p-6">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="outline" onClick={() => handleSubmit(true)} className="gap-2">
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button onClick={() => handleSubmit(false)} className="gap-2">
                <Send className="h-4 w-4" />
                Submit
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Expense Modal */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="text-xs font-semibold text-text-primary">Expense Details</h2>
              <button onClick={() => setViewingExpense(null)} className="rounded-lg p-1 hover:bg-background">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              {(() => {
                const emp = employees.find((e) => e.id === viewingExpense.employeeId)
                const cfg = statusConfig[viewingExpense.status]
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
                        <p className="text-xs text-text-secondary uppercase">Type</p>
                        <p className="font-medium text-text-primary">{expenseTypeLabels[viewingExpense.expenseType]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary uppercase">Amount</p>
                        <p className="font-medium text-text-primary">{formatCurrency(viewingExpense.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary uppercase">Date</p>
                        <p className="font-medium text-text-primary">
                          {new Date(viewingExpense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary uppercase">Status</p>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary uppercase mb-1">Description</p>
                      <p className="text-xs text-text-primary">{viewingExpense.description}</p>
                    </div>
                    {viewingExpense.reimbursementAmount && (
                      <div className="rounded-xl bg-success-50 p-3">
                        <p className="text-xs text-success uppercase">Reimbursed Amount</p>
                        <p className="font-bold text-success">{formatCurrency(viewingExpense.reimbursementAmount)}</p>
                      </div>
                    )}
                    {viewingExpense.remarks && (
                      <div>
                        <p className="text-xs text-text-secondary uppercase mb-1">Remarks</p>
                        <p className="text-xs text-text-primary">{viewingExpense.remarks}</p>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
            <div className="flex justify-end border-t border-border p-6">
              <Button variant="outline" onClick={() => setViewingExpense(null)}>Close</Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
