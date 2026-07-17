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
  AlertTriangle,
  Shield,
  Unlock,
  Plus,
  Search,
  XCircle,
} from 'lucide-react'

const store = new ExtendedPayrollStore()

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

export function SalaryHolds() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [holds, setHolds] = useState(store.getHolds())
  const [form, setForm] = useState({ employeeId: '', reason: '' })

  const refresh = () => setHolds(store.getHolds())

  const filtered = holds.filter(h => {
    const emp = employees.find(e => e.id === h.employeeId)
    const name = emp ? `${emp.firstName} ${emp.lastName}` : ''
    return name.toLowerCase().includes(search.toLowerCase()) || h.reason.toLowerCase().includes(search.toLowerCase())
  })

  const activeHolds = holds.filter(h => h.status === 'held')
  const releasedHolds = holds.filter(h => h.status === 'released')

  const handleAdd = () => {
    if (!form.employeeId || !form.reason) {
      toast('Please fill all required fields', 'error')
      return
    }
    store.addHold({
      employeeId: form.employeeId,
      reason: form.reason,
      heldBy: user?.name || '',
      heldAt: new Date().toISOString(),
      status: 'held',
    })
    toast('Salary hold applied successfully', 'success')
    refresh()
    setShowAdd(false)
    setForm({ employeeId: '', reason: '' })
  }

  const handleRelease = (id: string, action: 'process-as-salary' | 'process-as-arrear') => {
    store.releaseHold(id, user?.name || '', action)
    toast('Salary hold released', 'success')
    refresh()
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-text-primary">Salary Holds</h1>
          <p className="mt-1 text-xs text-text-secondary">Manage salary holds and releases for employees</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" /> Hold Salary
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10">
                <AlertTriangle className="h-5 w-5 text-danger" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Active Holds</p>
                <p className="text-sm font-bold">{activeHolds.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <Unlock className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Released</p>
                <p className="text-sm font-bold">{releasedHolds.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Records</p>
                <p className="text-sm font-bold">{holds.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div variants={item}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input placeholder="Search by employee or reason..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
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
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Reason</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Held By</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((h) => {
                    const emp = employees.find(e => e.id === h.employeeId)
                    return (
                      <tr key={h.id} className="hover:bg-background/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar initials={emp ? `${emp.firstName[0]}${emp.lastName[0]}` : '??'} size="sm" color="#EF4444" />
                            <span className="text-xs font-medium">{emp ? `${emp.firstName} ${emp.lastName}` : h.employeeId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-text-secondary max-w-[250px] truncate">{h.reason}</td>
                        <td className="px-6 py-4 text-xs text-text-secondary">{h.heldBy}</td>
                        <td className="px-6 py-4 text-xs text-text-secondary">{new Date(h.heldAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          {h.status === 'held'
                            ? <Badge variant="danger">Held</Badge>
                            : <Badge variant="success">Released</Badge>
                          }
                        </td>
                        <td className="px-6 py-4 text-right">
                          {h.status === 'held' && (
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleRelease(h.id, 'process-as-salary')}>
                                Process as Salary
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleRelease(h.id, 'process-as-arrear')}>
                                Process as Arrear
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-text-secondary">No salary holds found</td></tr>
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
              <h2 className="text-xs font-semibold">Hold Salary</h2>
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
                <label className="text-xs font-medium">Reason *</label>
                <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Enter reason for holding salary" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button className="flex-1 bg-danger hover:bg-danger/90" onClick={handleAdd}>Apply Hold</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
