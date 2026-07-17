import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Avatar } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/contexts/auth-context'
import { ExtendedPayrollStore } from '@/lib/payroll-extended'
import { employees } from '@/data/mock'
import {
  PiggyBank,
  Plus,
  CheckCircle,
  Clock,
  Search,
  XCircle,
} from 'lucide-react'

const store = new ExtendedPayrollStore()

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function OffCyclePayouts() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [payouts, setPayouts] = useState(store.getOffCyclePayouts())
  const [form, setForm] = useState({ employeeId: '', payoutType: 'bonus' as const, amount: '', month: '7', year: '2026', description: '' })

  const refresh = () => setPayouts(store.getOffCyclePayouts())

  const filtered = payouts.filter(p => {
    const emp = employees.find(e => e.id === p.employeeId)
    const name = emp ? `${emp.firstName} ${emp.lastName}` : ''
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter || (statusFilter === 'pending' && p.status === 'draft')
    const matchType = typeFilter === 'all' || p.payoutType === typeFilter
    return matchSearch && matchStatus && matchType
  })

    const totalPending = payouts.filter(p => p.status === 'draft' || p.status === 'processing').reduce((s, p) => s + p.amount, 0)
  const totalProcessed = payouts.filter(p => p.status === 'processed' || p.status === 'paid').reduce((s, p) => s + p.amount, 0)

  const handleAdd = () => {
    if (!form.employeeId || !form.amount || !form.description) {
      toast('Please fill all required fields', 'error')
      return
    }
    store.addOffCyclePayout({
      employeeId: form.employeeId,
      payoutType: form.payoutType,
      amount: Number(form.amount),
      month: Number(form.month),
      year: Number(form.year),
      description: form.description,
      approvedBy: user?.name || '',
      status: 'draft',
    })
    toast('Off-cycle payout created successfully', 'success')
    refresh()
    setShowAdd(false)
    setForm({ employeeId: '', payoutType: 'bonus', amount: '', month: '7', year: '2026', description: '' })
  }

  const handleProcess = (id: string) => {
    store.processOffCyclePayout(id)
    toast('Payout processed successfully', 'success')
    refresh()
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'success' | 'warning' | 'secondary'; label: string }> = {
      draft: { variant: 'warning', label: 'Draft' },
      processing: { variant: 'warning', label: 'Processing' },
      processed: { variant: 'secondary', label: 'Processed' },
      paid: { variant: 'success', label: 'Paid' },
    }
    const cfg = map[status] || { variant: 'secondary' as const, label: status }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  const typeColors: Record<string, string> = {
    bonus: 'bg-purple-100 text-purple-700',
    incentive: 'bg-emerald-100 text-emerald-700',
    arrear: 'bg-amber-100 text-amber-700',
    correction: 'bg-blue-100 text-blue-700',
    advance: 'bg-orange-100 text-orange-700',
    other: 'bg-gray-100 text-gray-700',
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-text-primary">Off-Cycle Payouts</h1>
          <p className="mt-1 text-xs text-text-secondary">Manage bonuses, incentives, and other out-of-cycle payments</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Payout
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <PiggyBank className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Payouts</p>
                <p className="text-sm font-bold">{payouts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Pending Amount</p>
                <p className="text-sm font-bold">₹{totalPending.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Processed Amount</p>
                <p className="text-sm font-bold">₹{totalProcessed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input placeholder="Search payouts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select
            options={[{ value: 'all', label: 'All Types' }, { value: 'bonus', label: 'Bonus' }, { value: 'incentive', label: 'Incentive' }, { value: 'correction', label: 'Correction' }, { value: 'advance', label: 'Advance' }]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-40"
          />
          <Select
            options={[{ value: 'all', label: 'All Status' }, { value: 'draft', label: 'Draft' }, { value: 'processed', label: 'Processed' }, { value: 'paid', label: 'Paid' }]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background/50">
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Period</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p) => {
                    const emp = employees.find(e => e.id === p.employeeId)
                    return (
                      <tr key={p.id} className="hover:bg-background/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar initials={emp ? `${emp.firstName[0]}${emp.lastName[0]}` : '??'} size="sm" color="#4F46E5" />
                            <span className="text-xs font-medium">{emp ? `${emp.firstName} ${emp.lastName}` : p.employeeId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[p.payoutType] || typeColors.other}`}>
                            {p.payoutType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold">₹{p.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs text-text-secondary">{monthNames[p.month - 1]} {p.year}</td>
                        <td className="px-6 py-4 text-xs text-text-secondary max-w-[200px] truncate">{p.description}</td>
                        <td className="px-6 py-4">{statusBadge(p.status)}</td>
                        <td className="px-6 py-4 text-right">
                          {(p.status === 'draft' || p.status === 'processing') && (
                            <Button variant="ghost" size="sm" onClick={() => handleProcess(p.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" /> Process
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-text-secondary">No payouts found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-semibold">New Off-Cycle Payout</h2>
              <button onClick={() => setShowAdd(false)}><XCircle className="h-5 w-5 text-text-secondary" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Employee *</label>
                <Select
                  options={employees.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Payout Type *</label>
                <Select
                  options={[
                    { value: 'bonus', label: 'Bonus' },
                    { value: 'incentive', label: 'Incentive' },
                    { value: 'arrear', label: 'Arrear' },
                    { value: 'correction', label: 'Correction' },
                    { value: 'advance', label: 'Advance' },
                    { value: 'other', label: 'Other' },
                  ]}
                  value={form.payoutType}
                  onChange={(e) => setForm({ ...form, payoutType: e.target.value as any })}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Amount (₹) *</label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Enter amount" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Month</label>
                  <Select
                    options={monthNames.map((m, i) => ({ value: String(i + 1), label: m }))}
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Year</label>
                  <Select
                    options={[{ value: '2025', label: '2025' }, { value: '2026', label: '2026' }]}
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Description *</label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Enter description" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleAdd}>Create Payout</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
