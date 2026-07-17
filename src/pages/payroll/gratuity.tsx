import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { ExtendedPayrollStore } from '@/lib/payroll-extended'
import { employees } from '@/data/mock'
import {
  PiggyBank,
  Search,
  Award,
  IndianRupee,
} from 'lucide-react'

const store = new ExtendedPayrollStore()

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

export function GratuityPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [records, setRecords] = useState(store.getGratuity())
  const [calcSalary, setCalcSalary] = useState('')
  const [calcYears, setCalcYears] = useState('')

  const refresh = () => setRecords(store.getGratuity())

  const filtered = records.filter(g => {
    const emp = employees.find(e => e.id === g.employeeId)
    const name = emp ? `${emp.firstName} ${emp.lastName}` : ''
    const matchSearch = name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || g.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalGratuity = records.reduce((s, g) => s + g.gratuityAmount, 0)
  const eligibleCount = records.filter(g => g.status === 'eligible').length
  const paidCount = records.filter(g => g.status === 'paid').length

  const calculatedGratuity = calcSalary && calcYears
    ? store.calculateGratuity(Number(calcSalary), Number(calcYears))
    : 0

  const statusBadge = (status: string) => {
    if (status === 'paid') return <Badge variant="success">Paid</Badge>
    if (status === 'claimed') return <Badge variant="warning">Claimed</Badge>
    return <Badge variant="secondary">Eligible</Badge>
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-sm sm:text-base font-bold text-text-primary">Gratuity</h1>
        <p className="mt-1 text-xs text-text-secondary">Track employee gratuity eligibility, claims, and payments</p>
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
                <p className="text-xs text-text-secondary">Total Gratuity</p>
                <p className="text-sm font-bold">₹{totalGratuity.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <PiggyBank className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Eligible</p>
                <p className="text-sm font-bold">{eligibleCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <Award className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Paid</p>
                <p className="text-sm font-bold">{paidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Calculator */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-xs font-semibold mb-4">Gratuity Calculator</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-xs font-medium text-text-secondary">Last Drawn Monthly Salary (₹)</label>
                <Input type="number" value={calcSalary} onChange={(e) => setCalcSalary(e.target.value)} placeholder="e.g. 104167" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary">Years of Service</label>
                <Input type="number" value={calcYears} onChange={(e) => setCalcYears(e.target.value)} placeholder="e.g. 6" />
              </div>
              <div className="rounded-xl bg-primary-50 p-4">
                <p className="text-xs text-text-secondary mb-1">Calculated Gratuity</p>
                <p className="text-sm font-bold text-primary">
                  ₹{calculatedGratuity.toLocaleString()}
                </p>
                <p className="text-[10px] text-text-secondary mt-1">Formula: (Salary × 15 × Years) / 26</p>
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-modern w-full sm:w-40"
          >
            <option value="all">All Status</option>
            <option value="eligible">Eligible</option>
            <option value="claimed">Claimed</option>
            <option value="paid">Paid</option>
          </select>
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
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Last Salary</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Years of Service</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Gratuity Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Eligibility Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((g) => {
                    const emp = employees.find(e => e.id === g.employeeId)
                    return (
                      <tr key={g.id} className="hover:bg-background/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar initials={emp ? `${emp.firstName[0]}${emp.lastName[0]}` : '??'} size="sm" color="#4F46E5" />
                            <span className="text-xs font-medium">{emp ? `${emp.firstName} ${emp.lastName}` : g.employeeId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs">₹{g.lastDrawnSalary.toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs">{g.yearsOfService} years</td>
                        <td className="px-6 py-4 text-xs font-semibold">₹{g.gratuityAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs text-text-secondary">{new Date(g.eligibilityDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{statusBadge(g.status)}</td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-text-secondary">No gratuity records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
