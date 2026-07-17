import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { extendedPayrollStore } from '@/lib/payroll-extended'
import { useAuth } from '@/contexts/auth-context'
import { employees } from '@/data/mock'
import { useToast } from '@/components/ui/toast'
import {
  ArrowLeft,
  Plus,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Percent,
  X,
  Search,
  FileText,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const revisionTypes = [
  { value: 'annual', label: 'Annual' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'correction', label: 'Correction' },
]

interface RevisionFormData {
  employeeId: string
  revisionType: string
  effectiveDate: string
  previousCTC: number
  newCTC: number
  reason: string
}

export function SalaryRevisions() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const [formData, setFormData] = useState<RevisionFormData>({
    employeeId: '',
    revisionType: 'annual',
    effectiveDate: new Date().toISOString().split('T')[0],
    previousCTC: 0,
    newCTC: 0,
    reason: '',
  })

  const revisions = extendedPayrollStore.getRevisions()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const revisionsWithEmployee = useMemo(() => {
    return revisions.map(rev => {
      const emp = employees.find(e => e.id === rev.employeeId)
      return { ...rev, employee: emp }
    })
  }, [revisions])

  const filteredRevisions = revisionsWithEmployee.filter(rev => {
    const emp = rev.employee
    if (!emp) return false
    const matchesSearch =
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filterStatus === 'all' || rev.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const currentYear = new Date().getFullYear()
  const revisionsThisYear = revisions.filter(r => {
    const d = new Date(r.createdAt)
    return d.getFullYear() === currentYear
  })

  const totalRevisions = revisionsThisYear.length
  const avgRevision = totalRevisions > 0
    ? Math.round(revisionsThisYear.reduce((sum, r) => sum + r.revisionPercentage, 0) / totalRevisions * 10) / 10
    : 0

  const handleEmployeeSelect = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId)
    setFormData(prev => ({
      ...prev,
      employeeId,
      previousCTC: emp ? emp.salary : 0,
    }))
  }

  const revisionPct = formData.previousCTC > 0 && formData.newCTC > 0
    ? Math.round(((formData.newCTC - formData.previousCTC) / formData.previousCTC) * 100 * 10) / 10
    : 0

  const handleSave = () => {
    if (!formData.employeeId || !formData.newCTC || !formData.reason) {
      toast('Please fill in all required fields', 'error')
      return
    }

    extendedPayrollStore.addRevision({
      employeeId: formData.employeeId,
      revisionType: formData.revisionType as any,
      effectiveDate: formData.effectiveDate,
      previousCTC: formData.previousCTC,
      newCTC: formData.newCTC,
      revisionPercentage: revisionPct,
      revisedBy: user?.name || 'HR Admin',
      reason: formData.reason,
      status: 'pending',
    })

    setShowAddModal(false)
    setFormData({
      employeeId: '',
      revisionType: 'annual',
      effectiveDate: new Date().toISOString().split('T')[0],
      previousCTC: 0,
      newCTC: 0,
      reason: '',
    })
    toast('Salary revision created successfully!', 'success')
  }

  const handleApprove = (id: string) => {
    extendedPayrollStore.approveRevision(id, user?.name || 'Admin')
    toast('Salary revision approved!', 'success')
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <Button variant="ghost" onClick={() => navigate('/payroll')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Payroll
        </Button>
      </motion.div>

      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm font-bold text-text-primary">Salary Revisions</h1>
          <p className="mt-1 text-text-secondary">Track and manage employee salary revisions and promotions.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Revision
        </Button>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Revisions ({currentYear})</p>
                <p className="text-sm font-bold text-text-primary">{totalRevisions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <Percent className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Avg Revision %</p>
                <p className="text-sm font-bold text-success">{avgRevision}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Pending Approvals</p>
                <p className="text-sm font-bold text-warning">
                  {revisions.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by employee name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 pl-10 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterStatus(option.value)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                filterStatus === option.value
                  ? 'bg-primary text-white'
                  : 'bg-background text-text-secondary hover:bg-border/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item}>
        {filteredRevisions.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-background/50">
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                        Employee
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                        Type
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                        Previous CTC
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                        New CTC
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                        Revision %
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                        Effective Date
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider text-text-secondary">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRevisions.map((rev) => (
                      <tr key={rev.id} className="hover:bg-background/50 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <p className="font-medium text-text-primary">
                              {rev.employee ? `${rev.employee.firstName} ${rev.employee.lastName}` : 'Unknown'}
                            </p>
                            <p className="text-xs text-text-secondary">{rev.employee?.department}</p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Badge variant="default">{rev.revisionType}</Badge>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <span className="text-xs text-text-secondary">{formatCurrency(rev.previousCTC)}</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <span className="text-xs font-medium text-text-primary">{formatCurrency(rev.newCTC)}</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <span className="text-xs font-semibold text-success">+{rev.revisionPercentage}%</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-xs text-text-primary">
                            {new Date(rev.effectiveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <Badge
                            variant={
                              rev.status === 'approved' ? 'success'
                                : rev.status === 'rejected' ? 'danger'
                                : 'warning'
                            }
                          >
                            {rev.status}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          {rev.status === 'pending' && isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(rev.id)}
                              className="text-success hover:text-success"
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <DollarSign className="mx-auto h-12 w-12 text-text-secondary" />
                <h3 className="mt-4 text-xs font-medium text-text-primary">No revisions found</h3>
                <p className="mt-2 text-text-secondary">
                  {searchQuery ? 'Try a different search term.' : 'Create a new salary revision to get started.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg my-8 rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-text-primary">New Salary Revision</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-background rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select
                  options={employees.map(e => ({
                    value: e.id,
                    label: `${e.firstName} ${e.lastName} (${e.department})`,
                  }))}
                  value={formData.employeeId}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  placeholder="Select employee"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Revision Type</Label>
                  <Select
                    options={revisionTypes}
                    value={formData.revisionType}
                    onChange={(e) => setFormData(prev => ({ ...prev, revisionType: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Effective Date</Label>
                  <Input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Previous CTC (per annum)</Label>
                  <Input
                    type="number"
                    value={formData.previousCTC || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, previousCTC: Number(e.target.value) }))}
                    placeholder="Auto-filled"
                  />
                </div>
                <div className="space-y-2">
                  <Label>New CTC (per annum)</Label>
                  <Input
                    type="number"
                    value={formData.newCTC || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, newCTC: Number(e.target.value) }))}
                    placeholder="Enter new CTC"
                  />
                </div>
              </div>

              {formData.previousCTC > 0 && formData.newCTC > 0 && (
                <div className="rounded-xl bg-background p-3">
                  <p className="text-xs text-text-secondary">
                    Revision: <span className={`font-semibold ${revisionPct >= 0 ? 'text-success' : 'text-danger'}`}>
                      {revisionPct >= 0 ? '+' : ''}{revisionPct}%
                    </span>
                    <span className="ml-2 text-text-secondary">
                      ({formatCurrency(formData.newCTC - formData.previousCTC)})
                    </span>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Reason</Label>
                <Input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. Annual appraisal, promotion to Senior"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={!formData.employeeId || !formData.newCTC || !formData.reason}
              >
                Create Revision
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
