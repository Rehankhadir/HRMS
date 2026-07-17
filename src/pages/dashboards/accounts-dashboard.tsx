import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/contexts/auth-context'
import {
  Banknote,
  Receipt,
  FileText,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calculator,
  Shield,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { employees } from '@/data/mock'
import { payrollStore } from '@/lib/payroll-store'
import { extendedPayrollStore } from '@/lib/payroll-extended'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export function AccountsDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  const payslips = payrollStore.getPayslips()
  const periods = payrollStore.getPeriods()
  const currentPeriod = periods.length > 0 ? periods[periods.length - 1] : null
  const currentPayslips = currentPeriod
    ? payslips.filter(p => p.periodId === currentPeriod.id)
    : payslips.slice(-10)

  const totalGross = currentPayslips.reduce((sum, p) => sum + p.grossSalary, 0)
  const totalNet = currentPayslips.reduce((sum, p) => sum + p.netSalary, 0)
  const totalDeductions = totalGross - totalNet
  const paidCount = currentPayslips.filter(p => p.status === 'paid').length
  const pendingCount = currentPayslips.filter(p => p.status !== 'paid').length

  const expenses = extendedPayrollStore.getExpenses()
  const pendingExpenses = expenses.filter(e => e.status === 'submitted')
  const approvedExpenses = expenses.filter(e => e.status === 'approved')
  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0)

  const loans = extendedPayrollStore.getLoans()
  const activeLoans = loans.filter(l => l.status === 'active')

  const departmentSalary = employees.reduce((acc, emp) => {
    const salary = payrollStore.getEmployeeSalary(emp.id)
    const existing = acc.find(a => a.department === emp.department)
    if (existing) {
      existing.total += salary?.grossSalary || 0
      existing.count += 1
    } else {
      acc.push({ department: emp.department, total: salary?.grossSalary || 0, count: 1 })
    }
    return acc
  }, [] as { department: string; total: number; count: number }[])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 sm:space-y-8">
      {/* Welcome Header */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-6 sm:p-8 text-white">
          <div className="absolute inset-0 opacity-[0.07]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-white/90" />
                <span className="text-white/90 text-xs font-medium">{getGreeting()}</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white mb-1">
                Welcome back, {user?.name?.split(' ')[0] || 'Accounts'}
              </h1>
              <p className="text-white/80 text-xs sm:text-sm">
                Financial overview • Payroll & compliance at a glance
              </p>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-lg sm:text-xl font-bold">{paidCount}</p>
                <p className="text-white/80 text-xs">Paid</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold">{pendingCount}</p>
                <p className="text-white/80 text-xs">Pending</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold">{pendingExpenses.length}</p>
                <p className="text-white/80 text-xs">Expenses</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Process Payroll', icon: Calculator, color: 'from-blue-500 to-indigo-500', action: () => navigate('/payroll/run') },
            { label: 'Expense Claims', icon: Receipt, color: 'from-amber-500 to-orange-500', action: () => navigate('/payroll/expense-claims') },
            { label: 'Compliance', icon: Shield, color: 'from-emerald-500 to-teal-500', action: () => navigate('/payroll/compliance') },
            { label: 'Payroll History', icon: FileText, color: 'from-purple-500 to-pink-500', action: () => navigate('/payroll/history') },
          ].map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-4 sm:p-5 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Payroll', value: formatCurrency(totalGross), icon: Banknote, color: 'text-primary', bgColor: 'bg-primary/10', sub: 'Current period gross' },
            { label: 'Net Payable', value: formatCurrency(totalNet), icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success/10', sub: 'After deductions' },
            { label: 'Total Deductions', value: formatCurrency(totalDeductions), icon: TrendingUp, color: 'text-warning', bgColor: 'bg-warning/10', sub: 'PF + ESI + TDS + PT' },
            { label: 'Pending Expenses', value: `${pendingExpenses.length} (${formatCurrency(pendingExpenses.reduce((s, e) => s + e.amount, 0))})`, icon: AlertTriangle, color: 'text-danger', bgColor: 'bg-danger/10', sub: 'Awaiting approval' },
          ].map((stat) => (
            <Card key={stat.label} className="border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                  </div>
                  <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="lg:col-span-2 border-gray-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xs font-semibold text-gray-900">Department-wise Payroll</h3>
                  <p className="text-xs text-gray-500">Monthly gross salary distribution</p>
                </div>
              </div>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentSalary}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="department" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="total" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-xs font-semibold text-gray-900 mb-2">Quick Summary</h3>
              <p className="text-xs text-gray-500 mb-4">Financial overview</p>
              <div className="space-y-3">
                {[
                  { label: 'Active Loans', value: activeLoans.length, icon: Banknote, color: 'text-primary' },
                  { label: 'Approved Expenses', value: approvedExpenses.length, icon: CheckCircle2, color: 'text-success' },
                  { label: 'Total Expense Claims', value: formatCurrency(totalExpenseAmount), icon: Receipt, color: 'text-warning' },
                  { label: 'Processed Payslips', value: payslips.length, icon: FileText, color: 'text-purple-500' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{stat.label}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Recent Payslips */}
      <motion.div variants={item}>
        <Card className="border-gray-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-900">Recent Payslips</h3>
                <p className="text-xs text-gray-500">Latest processed payslips</p>
              </div>
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/payroll/payslips')}>
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            {currentPayslips.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-[11px] font-medium text-gray-500">Employee</th>
                      <th className="text-right py-3 px-2 text-[11px] font-medium text-gray-500">Gross</th>
                      <th className="text-right py-3 px-2 text-[11px] font-medium text-gray-500">Deductions</th>
                      <th className="text-right py-3 px-2 text-[11px] font-medium text-gray-500">Net</th>
                      <th className="text-center py-3 px-2 text-[11px] font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPayslips.slice(0, 5).map((payslip) => {
                      const emp = employees.find(e => e.id === payslip.employeeId)
                      return (
                        <tr key={payslip.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2">
                            <p className="text-xs font-medium text-gray-900">{emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'}</p>
                            <p className="text-[10px] text-gray-500">{emp?.department}</p>
                          </td>
                          <td className="text-right py-3 px-2 text-xs text-gray-700">{formatCurrency(payslip.grossSalary)}</td>
                          <td className="text-right py-3 px-2 text-xs text-danger">{formatCurrency(payslip.grossSalary - payslip.netSalary)}</td>
                          <td className="text-right py-3 px-2 text-xs font-medium text-success">{formatCurrency(payslip.netSalary)}</td>
                          <td className="text-center py-3 px-2">
                            <Badge variant={payslip.status === 'paid' ? 'success' : payslip.status === 'processed' ? 'warning' : 'secondary'} className="text-[10px]">
                              {payslip.status}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No payslips generated yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
