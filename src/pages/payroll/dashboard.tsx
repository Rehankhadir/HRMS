import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { payrollStore } from '@/lib/payroll-store'
import { employees } from '@/data/mock'
import { useToast } from '@/components/ui/toast'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Wallet,
  CreditCard,
  Banknote,
  PieChart,
  BarChart3,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export function PayrollDashboard() {
  const { toast } = useToast()
  const [periods, setPeriods] = useState(payrollStore.getPeriods())
  const [payslips, setPayslips] = useState(payrollStore.getPayslips())
  const [runs, setRuns] = useState(payrollStore.getRuns())
  const [employeeSalaries, setEmployeeSalaries] = useState(payrollStore.getEmployeeSalaries())

  const currentPeriod = periods.find(p => p.status === 'processed') || periods[periods.length - 1]
  const currentPayslips = currentPeriod ? payslips.filter(p => p.periodId === currentPeriod.id) : []

  const totalGross = currentPayslips.reduce((sum, p) => sum + p.grossSalary, 0)
  const totalDeductions = currentPayslips.reduce((sum, p) => sum + p.totalDeductions, 0)
  const totalNet = currentPayslips.reduce((sum, p) => sum + p.netSalary, 0)
  const avgSalary = currentPayslips.length > 0 ? totalGross / currentPayslips.length : 0

  const pendingCount = currentPayslips.filter(p => p.status === 'processed').length
  const paidCount = currentPayslips.filter(p => p.status === 'paid').length

  const deductionBreakdown = [
    { name: 'PF', value: currentPayslips.reduce((sum, p) => sum + (p.deductions.find(d => d.name === 'PF')?.amount || 0), 0) },
    { name: 'ESI', value: currentPayslips.reduce((sum, p) => sum + (p.deductions.find(d => d.name === 'ESI')?.amount || 0), 0) },
    { name: 'TDS', value: currentPayslips.reduce((sum, p) => sum + (p.deductions.find(d => d.name === 'TDS')?.amount || 0), 0) },
    { name: 'PT', value: currentPayslips.reduce((sum, p) => sum + (p.deductions.find(d => d.name === 'Professional Tax')?.amount || 0), 0) },
  ]

  const departmentWise = employees.slice(0, 6).map(emp => {
    const salary = employeeSalaries.find(es => es.employeeId === emp.id)
    return {
      name: emp.firstName,
      gross: salary?.grossSalary || 0,
      net: salary?.netSalary || 0,
    }
  })

  const monthlyTrend = [
    { month: 'Jan', gross: 1200000, net: 1050000 },
    { month: 'Feb', gross: 1250000, net: 1090000 },
    { month: 'Mar', gross: 1300000, net: 1130000 },
    { month: 'Apr', gross: 1280000, net: 1110000 },
    { month: 'May', gross: 1350000, net: 1180000 },
    { month: 'Jun', gross: totalGross, net: totalNet },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm font-bold text-text-primary">Payroll</h1>
          <p className="mt-1 text-text-secondary">Manage salaries, process payroll, and generate payslips.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/payroll/history">
              <Clock className="mr-2 h-4 w-4" />
              History
            </Link>
          </Button>
          <Button asChild>
            <Link to="/payroll/run">
              <DollarSign className="mr-2 h-4 w-4" />
              Run Payroll
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">Total Gross</p>
                <p className="mt-2 text-sm font-bold text-text-primary">{formatCurrency(totalGross)}</p>
                <p className="mt-1 text-xs text-text-secondary">{currentPayslips.length} employees</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Wallet className="h-7 w-7 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-danger/5 to-danger/10 border-danger/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">Total Deductions</p>
                <p className="mt-2 text-sm font-bold text-text-primary">{formatCurrency(totalDeductions)}</p>
                <p className="mt-1 text-xs text-danger">
                  <TrendingDown className="inline h-3 w-3 mr-1" />
                  {((totalDeductions / totalGross) * 100).toFixed(1)}% of gross
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-danger/10">
                <CreditCard className="h-7 w-7 text-danger" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">Total Net Pay</p>
                <p className="mt-2 text-sm font-bold text-text-primary">{formatCurrency(totalNet)}</p>
                <p className="mt-1 text-xs text-success">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  {((totalNet / totalGross) * 100).toFixed(1)}% take home
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-success/10">
                <Banknote className="h-7 w-7 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">Avg. Salary</p>
                <p className="mt-2 text-sm font-bold text-text-primary">{formatCurrency(avgSalary)}</p>
                <p className="mt-1 text-xs text-text-secondary">Per employee</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-warning/10">
                <Users className="h-7 w-7 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Monthly Payroll Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                    formatter={(value: any) => formatCurrency(Number(value))}
                  />
                  <Area type="monotone" dataKey="gross" stroke="#2563EB" strokeWidth={2} fill="url(#grossGradient)" />
                  <Area type="monotone" dataKey="net" stroke="#22C55E" strokeWidth={2} fill="url(#netGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Deduction Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Deduction Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="h-56 w-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={deductionBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {deductionBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {deductionBreakdown.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-xs text-text-secondary">{item.name}</span>
                    </div>
                    <span className="text-xs font-medium text-text-primary">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Department-wise Salary */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Employee Salary Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentWise}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                    formatter={(value: any) => formatCurrency(Number(value))}
                  />
                  <Bar dataKey="gross" fill="#2563EB" radius={[6, 6, 0, 0]} name="Gross" />
                  <Bar dataKey="net" fill="#22C55E" radius={[6, 6, 0, 0]} name="Net" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Payslips */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs">Recent Payslips</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/payroll/payslips">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentPayslips.slice(0, 5).map((payslip) => {
                const emp = employees.find(e => e.id === payslip.employeeId)
                if (!emp) return null
                return (
                  <div key={payslip.id} className="flex items-center justify-between rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                      <Avatar initials={`${emp.firstName[0]}${emp.lastName[0]}`} size="md" color="#2563EB" />
                      <div>
                        <p className="font-medium text-text-primary">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-text-secondary">{emp.department} • {emp.designation}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-text-primary">{formatCurrency(payslip.netSalary)}</p>
                      <Badge variant={payslip.status === 'paid' ? 'success' : 'warning'}>
                        {payslip.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xs font-semibold text-text-primary">Ready to process payroll?</h3>
                <p className="mt-1 text-text-secondary">Process salaries for {currentPeriod ? new Date(currentPeriod.year, currentPeriod.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'current month'}</p>
              </div>
              <Button asChild size="lg">
                <Link to="/payroll/run">
                  Process Payroll
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
