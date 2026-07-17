import { useState, useMemo } from 'react'
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
  FileText,
  Download,
  RefreshCw,
  Search,
} from 'lucide-react'

const store = new ExtendedPayrollStore()

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function ECRReports() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState('7')
  const [year, setYear] = useState('2026')
  const [records, setRecords] = useState<ReturnType<typeof store.generateECRRecords>>([])

  const generate = () => {
    const data = store.generateECRRecords(Number(month), Number(year))
    setRecords(data)
    toast(`Generated ${data.length} ECR records for ${monthNames[Number(month) - 1]} ${year}`, 'success')
  }

  const filtered = records.filter(r => {
    if (!search) return true
    const emp = employees.find(e => e.id === r.employeeId)
    const name = emp ? `${emp.firstName} ${emp.lastName}` : ''
    return name.toLowerCase().includes(search.toLowerCase()) || r.uan.includes(search)
  })

  const totals = useMemo(() => {
    return {
      grossWages: records.reduce((s, r) => s + r.grossWages, 0),
      epfWages: records.reduce((s, r) => s + r.epfWages, 0),
      epfContribution: records.reduce((s, r) => s + r.epfContribution, 0),
      epsContribution: records.reduce((s, r) => s + r.epsContribution, 0),
      edliContribution: records.reduce((s, r) => s + r.edliContribution, 0),
      adminCharges: records.reduce((s, r) => s + r.adminCharges, 0),
      totalContribution: records.reduce((s, r) => s + r.totalContribution, 0),
    }
  }, [records])

  const handleDownload = () => {
    if (records.length === 0) {
      toast('Generate ECR records first', 'error')
      return
    }
    const headers = ['UAN', 'Employee Name', 'Gross Wages', 'EPF Wages', 'EDLI Wages', 'EPF Contribution', 'EPS Contribution', 'EDLI Contribution', 'Admin Charges', 'Total Contribution']
    const rows = filtered.map(r => {
      const emp = employees.find(e => e.id === r.employeeId)
      return [r.uan, emp ? `${emp.firstName} ${emp.lastName}` : '', r.grossWages, r.epfWages, r.edliWages, r.epfContribution, r.epsContribution, r.edliContribution, r.adminCharges, r.totalContribution]
    })
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ecr-${monthNames[Number(month) - 1]}-${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast('ECR report downloaded', 'success')
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-text-primary">ECR Reports</h1>
          <p className="mt-1 text-xs text-text-secondary">Generate Employee Provident Fund contribution return files</p>
        </div>
        <Button variant="outline" onClick={handleDownload} disabled={records.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Download CSV
        </Button>
      </motion.div>

      {/* Generator */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-xs font-semibold mb-4">Generate ECR</h3>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="w-full sm:w-40">
                <label className="text-xs font-medium text-text-secondary">Month</label>
                <Select
                  options={monthNames.map((m, i) => ({ value: String(i + 1), label: m }))}
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-32">
                <label className="text-xs font-medium text-text-secondary">Year</label>
                <Select
                  options={[{ value: '2025', label: '2025' }, { value: '2026', label: '2026' }]}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
              <Button onClick={generate} className="w-full sm:w-auto">
                <RefreshCw className="mr-2 h-4 w-4" /> Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary */}
      {records.length > 0 && (
        <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-text-secondary">Employees</p>
              <p className="text-sm font-bold">{records.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-text-secondary">Total EPF</p>
              <p className="text-sm font-bold">₹{totals.epfContribution.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-text-secondary">Total EPS</p>
              <p className="text-sm font-bold">₹{totals.epsContribution.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-text-secondary">Total Contribution</p>
              <p className="text-sm font-bold text-primary">₹{totals.totalContribution.toLocaleString()}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search */}
      {records.length > 0 && (
        <motion.div variants={item}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input placeholder="Search by employee name or UAN..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background/50">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">UAN</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">Gross</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">EPF Wages</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">EPF</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">EPS</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">EDLI</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">Admin</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((r) => {
                    const emp = employees.find(e => e.id === r.employeeId)
                    return (
                      <tr key={r.id} className="hover:bg-background/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar initials={emp ? `${emp.firstName[0]}${emp.lastName[0]}` : '??'} size="sm" color="#4F46E5" />
                            <span className="text-xs font-medium">{emp ? `${emp.firstName} ${emp.lastName}` : r.employeeId}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-text-secondary">{r.uan}</td>
                        <td className="px-4 py-3 text-xs text-right">₹{r.grossWages.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs text-right">₹{r.epfWages.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs text-right">₹{r.epfContribution.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs text-right">₹{r.epsContribution.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs text-right">₹{r.edliContribution.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs text-right">₹{r.adminCharges.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs text-right font-semibold">₹{r.totalContribution.toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
                {records.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-border bg-gray-50">
                      <td className="px-4 py-3 text-xs font-semibold" colSpan={2}>Totals</td>
                      <td className="px-4 py-3 text-xs text-right font-semibold">₹{totals.grossWages.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-right font-semibold">₹{totals.epfWages.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-right font-semibold">₹{totals.epfContribution.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-right font-semibold">₹{totals.epsContribution.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-right font-semibold">₹{totals.edliContribution.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-right font-semibold">₹{totals.adminCharges.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-right font-bold text-primary">₹{totals.totalContribution.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
              {records.length === 0 && (
                <div className="px-6 py-12 text-center text-text-secondary">
                  <FileText className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p>Select a month and year, then click Generate to create ECR records.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
