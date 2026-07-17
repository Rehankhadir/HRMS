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
  Clock,
  DollarSign,
  Search,
  Wallet,
  X,
  Filter,
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

const arrearTypes = [
  { value: 'salary-revision', label: 'Salary Revision' },
  { value: 'lop-reversal', label: 'LOP Reversal' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'correction', label: 'Correction' },
]

const monthOptions = monthNames.map((name, i) => ({
  value: String(i + 1),
  label: name,
}))

const yearOptions = Array.from({ length: 5 }, (_, i) => ({
  value: String(new Date().getFullYear() - 2 + i),
  label: String(new Date().getFullYear() - 2 + i),
}))

interface ArrearFormData {
  employeeId: string
  arrearType: string
  fromMonth: string
  fromYear: string
  toMonth: string
  toYear: string
  amount: number
  description: string
}

export function ArrearsManagement() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()))
  const [showAddModal, setShowAddModal] = useState(false)

  const [formData, setFormData] = useState<ArrearFormData>({
    employeeId: '',
    arrearType: 'salary-revision',
    fromMonth: String(new Date().getMonth() + 1),
    fromYear: String(new Date().getFullYear()),
    toMonth: String(new Date().getMonth() + 1),
    toYear: String(new Date().getFullYear()),
    amount: 0,
    description: '',
  })

  const arrears = extendedPayrollStore.getArrears()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const arrearsWithEmployee = useMemo(() => {
    return arrears.map(arr => {
      const emp = employees.find(e => e.id === arr.employeeId)
      return { ...arr, employee: emp }
    })
  }, [arrears])

  const filteredArrears = arrearsWithEmployee.filter(arr => {
    const emp = arr.employee
    if (!emp) return false
    const matchesSearch =
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      filterStatus === 'all' || arr.status === filterStatus
    const matchesMonth =
      filterMonth === 'all' || String(arr.fromMonth) === filterMonth
    const matchesYear = arr.fromYear === Number(filterYear)
    return matchesSearch && matchesStatus && matchesMonth && matchesYear
  })

  const totalPending = arrears.filter(a => a.status === 'pending').reduce((sum, a) => sum + a.amount, 0)
  const totalProcessed = arrears.filter(a => a.status === 'processed').reduce((sum, a) => sum + a.amount, 0)
  const totalPaid = arrears.filter(a => a.status === 'paid').reduce((sum, a) => sum + a.amount, 0)

  const handleSave = () => {
    if (!formData.employeeId || !formData.amount || !formData.description) {
      toast('Please fill in all required fields', 'error')
      return
    }

    const periodId = `period-${formData.fromYear}-${formData.fromMonth.padStart(2, '0')}`

    extendedPayrollStore.addArrear({
      employeeId: formData.employeeId,
      periodId,
      arrearType: formData.arrearType as any,
      fromMonth: Number(formData.fromMonth),
      fromYear: Number(formData.fromYear),
      toMonth: Number(formData.toMonth),
      toYear: Number(formData.toYear),
      amount: formData.amount,
      description: formData.description,
      status: 'pending',
    })

    setShowAddModal(false)
    setFormData({
      employeeId: '',
      arrearType: 'salary-revision',
      fromMonth: String(new Date().getMonth() + 1),
      fromYear: String(new Date().getFullYear()),
      toMonth: String(new Date().getMonth() + 1),
      toYear: String(new Date().getFullYear()),
      amount: 0,
      description: '',
    })
    toast('Arrear record created successfully!', 'success')
  }

  const handleProcess = (id: string) => {
    extendedPayrollStore.processArrear(id)
    toast('Arrear marked as processed!', 'success')
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
          <h1 className="text-sm font-bold text-text-primary">Arrears Management</h1>
          <p className="mt-1 text-text-secondary">Track and process salary arrears, LOP reversals, and corrections.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Arrear
        </Button>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Pending</p>
                <p className="text-sm font-bold text-warning">{formatCurrency(totalPending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/5 to-info/10 border-info/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Processed</p>
                <p className="text-sm font-bold text-primary">{formatCurrency(totalProcessed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <Wallet className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Paid</p>
                <p className="text-sm font-bold text-success">{formatCurrency(totalPaid)}</p>
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
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-secondary" />
          <Select
            options={[
              { value: 'all', label: 'All Months' },
              ...monthOptions,
            ]}
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full sm:w-36"
          />
          <Select
            options={yearOptions}
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full sm:w-28"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'processed', label: 'Processed' },
            { value: 'paid', label: 'Paid' },
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
        {filteredArrears.length > 0 ? (
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
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                        Period
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                        Amount
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
                    {filteredArrears.map((arr) => (
                      <tr key={arr.id} className="hover:bg-background/50 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <p className="font-medium text-text-primary">
                              {arr.employee ? `${arr.employee.firstName} ${arr.employee.lastName}` : 'Unknown'}
                            </p>
                            <p className="text-xs text-text-secondary">{arr.description}</p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Badge variant="default">
                            {arr.arrearType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-xs text-text-primary">
                            {monthNames[arr.fromMonth - 1]} {arr.fromYear}
                            {arr.fromMonth !== arr.toMonth || arr.fromYear !== arr.toYear
                              ? ` – ${monthNames[arr.toMonth - 1]} ${arr.toYear}`
                              : ''
                            }
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <span className="text-xs font-semibold text-text-primary">{formatCurrency(arr.amount)}</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <Badge
                            variant={
                              arr.status === 'paid' ? 'success'
                                : arr.status === 'processed' ? 'default'
                                : 'warning'
                            }
                          >
                            {arr.status}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          {arr.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleProcess(arr.id)}
                              className="text-primary hover:text-primary"
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Process
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
                <h3 className="mt-4 text-xs font-medium text-text-primary">No arrears found</h3>
                <p className="mt-2 text-text-secondary">
                  {searchQuery ? 'Try a different search term.' : 'Create a new arrear record to get started.'}
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
            className="w-full max-w-lg my-8 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-text-primary">New Arrear Record</h2>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                  placeholder="Select employee"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    options={arrearTypes}
                    value={formData.arrearType}
                    onChange={(e) => setFormData(prev => ({ ...prev, arrearType: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>From Period</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    options={monthOptions}
                    value={formData.fromMonth}
                    onChange={(e) => setFormData(prev => ({ ...prev, fromMonth: e.target.value }))}
                  />
                  <Select
                    options={yearOptions}
                    value={formData.fromYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, fromYear: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>To Period</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    options={monthOptions}
                    value={formData.toMonth}
                    onChange={(e) => setFormData(prev => ({ ...prev, toMonth: e.target.value }))}
                  />
                  <Select
                    options={yearOptions}
                    value={formData.toYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, toYear: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Arrear from salary revision effective Apr 2026"
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
                disabled={!formData.employeeId || !formData.amount || !formData.description}
              >
                Create Arrear
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
