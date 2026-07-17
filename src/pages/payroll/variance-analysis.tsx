import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { payrollStore } from '@/lib/payroll-store'
import { employees } from '@/data/mock'
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Minus } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

export function VarianceAnalysis() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const periods = payrollStore.getPeriods()

  const sortedPeriods = useMemo(
    () => [...periods].sort((a, b) => b.year - a.year || b.month - a.month),
    [periods]
  )

  const currentPeriod = sortedPeriods[0]
  const previousPeriod = sortedPeriods[1]

  const [currentPeriodId, setCurrentPeriodId] = useState(currentPeriod?.id ?? '')
  const [previousPeriodId, setPreviousPeriodId] = useState(previousPeriod?.id ?? '')

  const periodOptions = sortedPeriods.map((p) => ({
    value: p.id,
    label: `${monthNames[p.month - 1]} ${p.year}`,
  }))

  const currentPayslips = useMemo(() => {
    let slips = payrollStore.getPayslips(currentPeriodId)
    if (slips.length === 0 && currentPeriodId) {
      slips = payrollStore.generatePayslips(currentPeriodId)
    }
    return slips
  }, [currentPeriodId])

  const previousPayslips = useMemo(() => {
    let slips = payrollStore.getPayslips(previousPeriodId)
    if (slips.length === 0 && previousPeriodId) {
      slips = payrollStore.generatePayslips(previousPeriodId)
    }
    return slips
  }, [previousPeriodId])

  const varianceData = useMemo(() => {
    return employees.map((emp) => {
      const current = currentPayslips.find((p) => p.employeeId === emp.id)
      const previous = previousPayslips.find((p) => p.employeeId === emp.id)

      const currentGross = current?.grossSalary ?? 0
      const previousGross = previous?.grossSalary ?? 0
      const currentNet = current?.netSalary ?? 0
      const previousNet = previous?.netSalary ?? 0

      const grossVariance = currentGross - previousGross
      const grossVariancePercent = previousGross > 0 ? (grossVariance / previousGross) * 100 : 0
      const netVariance = currentNet - previousNet
      const netVariancePercent = previousNet > 0 ? (netVariance / previousNet) * 100 : 0

      return {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        currentGross,
        previousGross,
        grossVariance,
        grossVariancePercent,
        currentNet,
        previousNet,
        netVariance,
        netVariancePercent,
      }
    })
  }, [currentPayslips, previousPayslips])

  const summary = useMemo(() => {
    const totalGrossVariance = varianceData.reduce((sum, v) => sum + v.grossVariance, 0)
    const totalNetVariance = varianceData.reduce((sum, v) => sum + v.netVariance, 0)
    const employeesWithIncrease = varianceData.filter((v) => v.grossVariance > 0).length
    const employeesWithDecrease = varianceData.filter((v) => v.grossVariance < 0).length
    return { totalGrossVariance, totalNetVariance, employeesWithIncrease, employeesWithDecrease }
  }, [varianceData])

  if (user?.role !== 'admin' && user?.role !== 'hr') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <BarChart3 className="h-16 w-16 text-text-secondary mb-4" />
        <h2 className="text-sm font-bold text-text-primary">Access Denied</h2>
        <p className="mt-2 text-text-secondary">You don't have permission to view variance analysis.</p>
        <Button className="mt-6" onClick={() => navigate('/payroll')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payroll
        </Button>
      </motion.div>
    )
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
          <h1 className="text-sm font-bold text-text-primary">Variance Analysis</h1>
          <p className="mt-1 text-text-secondary">Compare payroll data across periods.</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-text-secondary">Current Period</span>
          <Select
            options={periodOptions}
            value={currentPeriodId}
            onChange={(e) => setCurrentPeriodId(e.target.value)}
            className="w-full sm:w-48"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-text-secondary">vs Previous Period</span>
          <Select
            options={periodOptions}
            value={previousPeriodId}
            onChange={(e) => setPreviousPeriodId(e.target.value)}
            className="w-full sm:w-48"
          />
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">Total Gross Variance</p>
                <div className="flex items-center gap-2 mt-2">
                  {summary.totalGrossVariance > 0 ? (
                    <TrendingUp className="h-5 w-5 text-success" />
                  ) : summary.totalGrossVariance < 0 ? (
                    <TrendingDown className="h-5 w-5 text-danger" />
                  ) : (
                    <Minus className="h-5 w-5 text-text-secondary" />
                  )}
                  <p className={`text-sm font-bold ${summary.totalGrossVariance > 0 ? 'text-success' : summary.totalGrossVariance < 0 ? 'text-danger' : 'text-text-primary'}`}>
                    {summary.totalGrossVariance >= 0 ? '+' : ''}{formatCurrency(summary.totalGrossVariance)}
                  </p>
                </div>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <BarChart3 className="h-7 w-7 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">Total Net Variance</p>
                <div className="flex items-center gap-2 mt-2">
                  {summary.totalNetVariance > 0 ? (
                    <TrendingUp className="h-5 w-5 text-success" />
                  ) : summary.totalNetVariance < 0 ? (
                    <TrendingDown className="h-5 w-5 text-danger" />
                  ) : (
                    <Minus className="h-5 w-5 text-text-secondary" />
                  )}
                  <p className={`text-sm font-bold ${summary.totalNetVariance > 0 ? 'text-success' : summary.totalNetVariance < 0 ? 'text-danger' : 'text-text-primary'}`}>
                    {summary.totalNetVariance >= 0 ? '+' : ''}{formatCurrency(summary.totalNetVariance)}
                  </p>
                </div>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
                <TrendingUp className="h-7 w-7 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">Employees with Increase</p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <p className="text-sm font-bold text-success">{summary.employeesWithIncrease}</p>
                </div>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10">
                <TrendingUp className="h-7 w-7 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-danger/5 to-danger/10 border-danger/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">Employees with Decrease</p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingDown className="h-5 w-5 text-danger" />
                  <p className="text-sm font-bold text-danger">{summary.employeesWithDecrease}</p>
                </div>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10">
                <TrendingDown className="h-7 w-7 text-danger" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
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
                      Department
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                      Current Gross
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                      Previous Gross
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                      Gross Variance
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                      Current Net
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                      Previous Net
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                      Net Variance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {varianceData.map((row) => (
                    <tr key={row.id} className="hover:bg-background/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="font-medium text-text-primary">{row.name}</p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-xs text-text-secondary">{row.department}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <span className="text-xs text-text-primary">{formatCurrency(row.currentGross)}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <span className="text-xs text-text-primary">{formatCurrency(row.previousGross)}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {row.grossVariance > 0 ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : row.grossVariance < 0 ? (
                            <TrendingDown className="h-4 w-4 text-danger" />
                          ) : (
                            <Minus className="h-4 w-4 text-text-secondary" />
                          )}
                          <div className="text-right">
                            <p className={`text-xs font-medium ${row.grossVariance > 0 ? 'text-success' : row.grossVariance < 0 ? 'text-danger' : 'text-text-secondary'}`}>
                              {row.grossVariance >= 0 ? '+' : ''}{formatCurrency(row.grossVariance)}
                            </p>
                            <p className={`text-xs ${row.grossVariance > 0 ? 'text-success' : row.grossVariance < 0 ? 'text-danger' : 'text-text-secondary'}`}>
                              {row.grossVariancePercent >= 0 ? '+' : ''}{row.grossVariancePercent.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <span className="text-xs text-text-primary">{formatCurrency(row.currentNet)}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <span className="text-xs text-text-primary">{formatCurrency(row.previousNet)}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {row.netVariance > 0 ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : row.netVariance < 0 ? (
                            <TrendingDown className="h-4 w-4 text-danger" />
                          ) : (
                            <Minus className="h-4 w-4 text-text-secondary" />
                          )}
                          <div className="text-right">
                            <p className={`text-xs font-medium ${row.netVariance > 0 ? 'text-success' : row.netVariance < 0 ? 'text-danger' : 'text-text-secondary'}`}>
                              {row.netVariance >= 0 ? '+' : ''}{formatCurrency(row.netVariance)}
                            </p>
                            <p className={`text-xs ${row.netVariance > 0 ? 'text-success' : row.netVariance < 0 ? 'text-danger' : 'text-text-secondary'}`}>
                              {row.netVariancePercent >= 0 ? '+' : ''}{row.netVariancePercent.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-background/80 border-t-2 border-border">
                    <td className="px-6 py-4 text-xs font-semibold text-text-primary" colSpan={2}>
                      Totals
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-semibold text-text-primary">
                      {formatCurrency(varianceData.reduce((sum, v) => sum + v.currentGross, 0))}
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-semibold text-text-primary">
                      {formatCurrency(varianceData.reduce((sum, v) => sum + v.previousGross, 0))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {summary.totalGrossVariance > 0 ? (
                          <TrendingUp className="h-4 w-4 text-success" />
                        ) : summary.totalGrossVariance < 0 ? (
                          <TrendingDown className="h-4 w-4 text-danger" />
                        ) : (
                          <Minus className="h-4 w-4 text-text-secondary" />
                        )}
                        <span className={`text-xs font-bold ${summary.totalGrossVariance > 0 ? 'text-success' : summary.totalGrossVariance < 0 ? 'text-danger' : 'text-text-secondary'}`}>
                          {summary.totalGrossVariance >= 0 ? '+' : ''}{formatCurrency(summary.totalGrossVariance)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-semibold text-text-primary">
                      {formatCurrency(varianceData.reduce((sum, v) => sum + v.currentNet, 0))}
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-semibold text-text-primary">
                      {formatCurrency(varianceData.reduce((sum, v) => sum + v.previousNet, 0))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {summary.totalNetVariance > 0 ? (
                          <TrendingUp className="h-4 w-4 text-success" />
                        ) : summary.totalNetVariance < 0 ? (
                          <TrendingDown className="h-4 w-4 text-danger" />
                        ) : (
                          <Minus className="h-4 w-4 text-text-secondary" />
                        )}
                        <span className={`text-xs font-bold ${summary.totalNetVariance > 0 ? 'text-success' : summary.totalNetVariance < 0 ? 'text-danger' : 'text-text-secondary'}`}>
                          {summary.totalNetVariance >= 0 ? '+' : ''}{formatCurrency(summary.totalNetVariance)}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
