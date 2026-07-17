import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { ExtendedPayrollStore } from '@/lib/payroll-extended'
import { employees } from '@/data/mock'
import {
  CalendarDays,
  Plus,
  CheckCircle,
  Search,
  XCircle,
  IndianRupee,
} from 'lucide-react'

const store = new ExtendedPayrollStore()

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

const leaveTypes = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'casual', label: 'Casual Leave' },
]

export function LeaveEncashment() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [encashments, setEncashments] = useState(store.getEncashments())
  const [form, setForm] = useState({ employeeId: '', leaveType: 'annual', encashableDays: '', perDaySalary: '' })

  const refresh = () => setEncashments(store.getEncashments())

  const filtered = encashments.filter(e => {
    const emp = employees.find(em => em.id === e.employeeId)
    const name = emp ? `${emp.firstName} ${emp.lastName}` : ''
    const matchSearch = name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || e.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalAmount = encashments.reduce((s, e) => s + e.totalAmount, 0)
  const approvedAmount = encashments.filter(e => e.status === 'approved').reduce((s, e) => s + e.totalAmount, 0)
  const pendingAmount = encashments.filter(e => e.status === 'pending').reduce((s, e) => s + e.totalAmount, 0)

  const handleAdd = () => {
    if (!form.employeeId || !form.encashableDays || !form.perDaySalary) {
      toast('Please fill all required fields', 'error')
      return
    }
    const days = Number(form.encashableDays)
    const perDay = Number(form.perDaySalary)
    store.addEncashment({
      employeeId: form.employeeId,
      leaveType: form.leaveType as any,
      encashableDays: days,
      perDaySalary: perDay,
      totalAmount: days * perDay,
      financialYear: '2025-26',
      status: 'pending',
    })
    toast('Encashment request created', 'success')
    refresh()
    setShowAdd(false)
    setForm({ employeeId: '', leaveType: 'annual', encashableDays: '', perDaySalary: '' })
  }

  const handleProcess = (id: string) => {
    store.processEncashment(id)
    toast('Encashment processed successfully', 'success')
    refresh()
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-text-primary">Leave Encashment</h1>
          <p className="mt-1 text-xs text-text-secondary">Manage leave encashment requests and processing</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Encashment
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Amount</p>
                <p className="text-sm font-bold">₹{totalAmount.toLocaleString()}</p>
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
                <p className="text-xs text-text-secondary">Approved</p>
                <p className="text-sm font-bold">₹{approvedAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <CalendarDays className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Pending</p>
                <p className="text-sm font-bold">₹{pendingAmount.toLocaleString()}</p>
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
            <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select
            options={[{ value: 'all', label: 'All Status' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }]}
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
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Leave Type</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Days</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Per Day Salary</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Total Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">FY</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((e) => {
                    const emp = employees.find(em => em.id === e.employeeId)
                    return (
                      <tr key={e.id} className="hover:bg-background/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar initials={emp ? `${emp.firstName[0]}${emp.lastName[0]}` : '??'} size="sm" color="#4F46E5" />
                            <span className="text-xs font-medium">{emp ? `${emp.firstName} ${emp.lastName}` : e.employeeId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs capitalize">{e.leaveType}</td>
                        <td className="px-6 py-4 text-xs font-medium">{e.encashableDays}</td>
                        <td className="px-6 py-4 text-xs">₹{e.perDaySalary.toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs font-semibold">₹{e.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs text-text-secondary">{e.financialYear}</td>
                        <td className="px-6 py-4">
                          {e.status === 'approved'
                            ? <Badge variant="success">Approved</Badge>
                            : <Badge variant="warning">Pending</Badge>
                          }
                        </td>
                        <td className="px-6 py-4 text-right">
                          {e.status === 'pending' && (
                            <Button variant="ghost" size="sm" onClick={() => handleProcess(e.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="px-6 py-12 text-center text-text-secondary">No encashment records found</td></tr>
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
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-semibold">New Leave Encashment</h2>
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
                <label className="text-xs font-medium">Leave Type *</label>
                <Select
                  options={leaveTypes}
                  value={form.leaveType}
                  onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Encashable Days *</label>
                  <Input type="number" value={form.encashableDays} onChange={(e) => setForm({ ...form, encashableDays: e.target.value })} placeholder="Days" />
                </div>
                <div>
                  <label className="text-xs font-medium">Per Day Salary (₹) *</label>
                  <Input type="number" value={form.perDaySalary} onChange={(e) => setForm({ ...form, perDaySalary: e.target.value })} placeholder="Amount" />
                </div>
              </div>
              {form.encashableDays && form.perDaySalary && (
                <div className="rounded-xl bg-primary-50 p-3 text-xs">
                  <span className="text-text-secondary">Total Amount: </span>
                  <span className="font-bold text-primary">₹{(Number(form.encashableDays) * Number(form.perDaySalary)).toLocaleString()}</span>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleAdd}>Create Request</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
