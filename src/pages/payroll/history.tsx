import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { payrollStore } from '@/lib/payroll-store'
import { useToast } from '@/components/ui/toast'
import { generateBulkUploadCSV, downloadCSV } from '@/lib/csv-export'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  FileText,
  Download,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export function PayrollHistory() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [runs, setRuns] = useState(payrollStore.getRuns())

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const statusConfig: Record<string, { color: 'secondary' | 'warning' | 'success' | 'danger'; icon: typeof Clock; label: string }> = {
    draft: { color: 'secondary', icon: Clock, label: 'Draft' },
    processing: { color: 'warning', icon: Clock, label: 'Processing' },
    processed: { color: 'success', icon: CheckCircle, label: 'Processed' },
    paid: { color: 'success', icon: CheckCircle, label: 'Paid' },
    cancelled: { color: 'danger', icon: Clock, label: 'Cancelled' },
    'on-hold': { color: 'warning', icon: Clock, label: 'On Hold' },
  }

  const totalPaid = runs.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.totalNet, 0)
  const totalProcessed = runs.filter(r => r.status === 'processed').reduce((sum, r) => sum + r.totalNet, 0)

  const chartData = runs.map(run => {
    const period = payrollStore.getPeriod(run.periodId)
    return {
      name: period ? `${monthNames[period.month - 1].slice(0, 3)} ${period.year}` : run.id,
      gross: run.totalGross,
      net: run.totalNet,
      deductions: run.totalDeductions,
    }
  }).reverse()

  const handleExportHistory = () => {
    const headers = ['Period', 'Employees', 'Gross', 'Deductions', 'Net', 'Status', 'Processed By', 'Date']
    const rows = runs.map(run => {
      const period = payrollStore.getPeriod(run.periodId)
      return [
        period ? `${monthNames[period.month - 1]} ${period.year}` : run.id,
        run.totalEmployees,
        run.totalGross,
        run.totalDeductions,
        run.totalNet,
        run.status,
        run.processedBy,
        new Date(run.processedAt).toLocaleDateString(),
      ]
    })
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'payroll-history.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast('Payroll history exported!', 'success')
  }

  const handleExportBulkUpload = (run: typeof runs[0]) => {
    const period = payrollStore.getPeriod(run.periodId)
    if (!period) return

    const payslips = payrollStore.getPayslips(run.periodId)
    const rows = payslips.map(p => ({
      employeeId: p.employeeId,
      netPay: p.netSalary,
    }))

    const csv = generateBulkUploadCSV(rows, period.month, period.year)
    const filename = `salary-bulk-upload-${period.year}-${String(period.month).padStart(2, '0')}.csv`
    downloadCSV(csv, filename)
    toast(`CSV exported for ${monthNames[period.month - 1]} ${period.year}`, 'success')
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Back Button */}
      <motion.div variants={item}>
        <Button variant="ghost" onClick={() => navigate('/payroll')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Payroll
        </Button>
      </motion.div>

      {/* Page Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm font-bold text-text-primary">Payroll History</h1>
          <p className="mt-1 text-text-secondary">View all past payroll runs and their details.</p>
        </div>
        <Button variant="outline" onClick={handleExportHistory}>
          <Download className="mr-2 h-4 w-4" />
          Export History
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-secondary">Total Runs</p>
                <p className="mt-2 text-sm font-bold text-text-primary">{runs.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-secondary">Total Paid</p>
                <p className="mt-2 text-sm font-bold text-success">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-secondary">Pending</p>
                <p className="mt-2 text-sm font-bold text-warning">{formatCurrency(totalProcessed)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chart */}
      {chartData.length > 0 && (
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">Payroll Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                      formatter={(value: any) => formatCurrency(Number(value))}
                    />
                    <Area type="monotone" dataKey="gross" stroke="#2563EB" strokeWidth={2} fill="url(#grossGrad)" />
                    <Area type="monotone" dataKey="net" stroke="#22C55E" strokeWidth={2} fill="url(#netGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* History List */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs">All Payroll Runs</CardTitle>
          </CardHeader>
          <CardContent>
            {runs.length > 0 ? (
              <div className="space-y-3">
                {runs.map((run) => {
                  const period = payrollStore.getPeriod(run.periodId)
                  const config = statusConfig[run.status]
                  return (
                    <div key={run.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border p-4 sm:p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 shrink-0">
                          <Calendar className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">
                            {period ? `${monthNames[period.month - 1]} ${period.year}` : run.id}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {run.totalEmployees} employees
                            </span>
                            <span>•</span>
                            <span>Processed by {run.processedBy}</span>
                            <span>•</span>
                            <span>{new Date(run.processedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-text-secondary">Net Pay</p>
                          <p className="text-xs font-bold text-text-primary">{formatCurrency(run.totalNet)}</p>
                        </div>
                        <Badge variant={config.color} className="w-20 justify-center">
                          {config.label}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); handleExportBulkUpload(run) }}
                          className="shrink-0"
                        >
                          <Download className="mr-1 h-3 w-3" />
                          CSV
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-text-secondary" />
                <h3 className="mt-4 text-xs font-medium text-text-primary">No payroll history</h3>
                <p className="mt-2 text-text-secondary">Run your first payroll to see history here.</p>
                <Button className="mt-4" onClick={() => navigate('/payroll/run')}>
                  Run Payroll
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
