import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/contexts/auth-context'
import { ExtendedPayrollStore } from '@/lib/payroll-extended'
import { employees } from '@/data/mock'
import {
  Scale,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  IndianRupee,
} from 'lucide-react'

const store = new ExtendedPayrollStore()

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

export function FullFinalSettlement() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [settlements, setSettlements] = useState(store.getSettlements())
  const [form, setForm] = useState({
    employeeId: '', lastWorkingDate: '', noticePeriodDays: '30', noticePeriodServed: '30',
    leaveEncashment: '', gratuity: '', loanRecovery: '', otherDeductions: '',
  })

  const refresh = () => setSettlements(store.getSettlements())

  const filtered = settlements.filter(s => {
    const emp = employees.find(e => e.id === s.employeeId)
    const name = emp ? `${emp.firstName} ${emp.lastName}` : ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const totalNetPayable = settlements.reduce((s, f) => s + f.netPayable, 0)

  const handleAdd = () => {
    if (!form.employeeId || !form.lastWorkingDate) {
      toast('Please fill all required fields', 'error')
      return
    }
    const leaveEncash = Number(form.leaveEncashment) || 0
    const gratuityAmt = Number(form.gratuity) || 0
    const loanRec = Number(form.loanRecovery) || 0
    const otherDed = Number(form.otherDeductions) || 0
    const noticeServed = Number(form.noticePeriodServed)
    const noticeTotal = Number(form.noticePeriodDays)
    const noticeRecovery = noticeServed < noticeTotal ? Math.round((noticeTotal - noticeServed) * 5000) : 0
    const gross = leaveEncash + gratuityAmt
    const totalDeductions = noticeRecovery + loanRec + otherDed
    const netPayable = gross - totalDeductions

    store.createSettlement({
      employeeId: form.employeeId,
      lastWorkingDate: form.lastWorkingDate,
      noticePeriodDays: noticeTotal,
      noticePeriodServed: noticeServed,
      noticePeriodRecovery: noticeRecovery,
      leaveEncashment: leaveEncash,
      gratuity: gratuityAmt,
      loanRecovery: loanRec,
      otherDeductions: otherDed,
      grossAmount: gross,
      totalDeductions,
      netPayable,
      status: 'pending',
    })
    toast('F&F settlement created', 'success')
    refresh()
    setShowAdd(false)
    setForm({ employeeId: '', lastWorkingDate: '', noticePeriodDays: '30', noticePeriodServed: '30', leaveEncashment: '', gratuity: '', loanRecovery: '', otherDeductions: '' })
  }

  const handleProcess = (id: string) => {
    store.processSettlement(id, user?.name || '')
    toast('Settlement processed', 'success')
    refresh()
  }

  const statusBadge = (status: string) => {
    if (status === 'paid') return <Badge variant="success">Paid</Badge>
    if (status === 'processed') return <Badge variant="secondary">Processed</Badge>
    return <Badge variant="warning">Pending</Badge>
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-text-primary">Full & Final Settlement</h1>
          <p className="mt-1 text-xs text-text-secondary">Manage employee exit settlements and final payments</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Settlement
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Settlements</p>
                <p className="text-sm font-bold">{settlements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <IndianRupee className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Pending Payout</p>
                <p className="text-sm font-bold">₹{settlements.filter(s => s.status === 'pending').reduce((s, f) => s + f.netPayable, 0).toLocaleString()}</p>
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
                <p className="text-xs text-text-secondary">Total Net Payable</p>
                <p className="text-sm font-bold">₹{totalNetPayable.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div variants={item}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
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
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Last Working Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Gross</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Deductions</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Net Payable</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((s) => {
                    const emp = employees.find(e => e.id === s.employeeId)
                    return (
                      <tr key={s.id} className="hover:bg-background/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar initials={emp ? `${emp.firstName[0]}${emp.lastName[0]}` : '??'} size="sm" color="#4F46E5" />
                            <span className="text-xs font-medium">{emp ? `${emp.firstName} ${emp.lastName}` : s.employeeId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-text-secondary">{new Date(s.lastWorkingDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-xs">₹{s.grossAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs text-danger">₹{s.totalDeductions.toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs font-semibold">₹{s.netPayable.toLocaleString()}</td>
                        <td className="px-6 py-4">{statusBadge(s.status)}</td>
                        <td className="px-6 py-4 text-right">
                          {s.status === 'pending' && (
                            <Button variant="ghost" size="sm" onClick={() => handleProcess(s.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" /> Process
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-text-secondary">
                      No settlements found. Create one to get started.
                    </td></tr>
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
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-semibold">New F&F Settlement</h2>
              <button onClick={() => setShowAdd(false)}><XCircle className="h-5 w-5 text-text-secondary" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Employee *</label>
                <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="input-modern">
                  <option value="">Select employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Last Working Date *</label>
                <Input type="date" value={form.lastWorkingDate} onChange={(e) => setForm({ ...form, lastWorkingDate: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Notice Period (days)</label>
                  <Input type="number" value={form.noticePeriodDays} onChange={(e) => setForm({ ...form, noticePeriodDays: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Notice Served (days)</label>
                  <Input type="number" value={form.noticePeriodServed} onChange={(e) => setForm({ ...form, noticePeriodServed: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Leave Encashment (₹)</label>
                <Input type="number" value={form.leaveEncashment} onChange={(e) => setForm({ ...form, leaveEncashment: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-medium">Gratuity (₹)</label>
                <Input type="number" value={form.gratuity} onChange={(e) => setForm({ ...form, gratuity: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-medium">Loan Recovery (₹)</label>
                <Input type="number" value={form.loanRecovery} onChange={(e) => setForm({ ...form, loanRecovery: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-medium">Other Deductions (₹)</label>
                <Input type="number" value={form.otherDeductions} onChange={(e) => setForm({ ...form, otherDeductions: e.target.value })} placeholder="0" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleAdd}>Create Settlement</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
