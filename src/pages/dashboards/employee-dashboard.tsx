import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/contexts/auth-context'
import { useLeave } from '@/contexts/leave-context'
import { useAnnouncements } from '@/contexts/announcement-context'
import {
  Clock,
  CalendarDays,
  Calendar,
  ChevronRight,
  Zap,
  Sparkles,
  CheckCircle2,
  XCircle,
  Timer,
  FileText,
  Banknote,
} from 'lucide-react'
import { employees, attendance } from '@/data/mock'
import { payrollStore } from '@/lib/payroll-store'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export function EmployeeDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const { getEmployeeLeaves, getPendingForManager } = useLeave()
  const { announcements } = useAnnouncements()

  const employeeId = user?.employeeId || '1'
  const employee = employees.find(e => e.id === employeeId) || employees[0]
  const isManager = user?.role === 'manager'

  const todayStr = '2026-07-15'
  const todayRecord = attendance.find(a => a.employeeId === employeeId && a.date === todayStr)

  const myLeaves = getEmployeeLeaves(employeeId)
  const pendingLeaves = myLeaves.filter(l => l.status === 'pending').length
  const approvedLeaves = myLeaves.filter(l => l.status === 'approved').length

  const myDirectReportIds = employees
    .filter(e => e.reportingManagerId === employeeId)
    .map(e => e.id)
  const pendingApprovals = isManager ? getPendingForManager(myDirectReportIds) : []

  const recentLeaves = myLeaves.slice(0, 3)

  const employeeSalary = payrollStore.getEmployeeSalary(employeeId)
  const latestPayslip = payrollStore.getPayslips(undefined, employeeId).slice(-1)[0]

  const totalLeaveEntitlement = 20 + 10 + 5 // annual + sick + personal
  const totalLeavesUsed = myLeaves.filter(l => l.status === 'approved').length
  const leaveBalance = totalLeaveEntitlement - totalLeavesUsed

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
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
                Welcome back, {employee.firstName}
              </h1>
              <p className="text-white/80 text-xs sm:text-sm">
                {employee.designation} • {employee.department}
              </p>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-lg sm:text-xl font-bold">{todayRecord?.status === 'present' ? '✓' : todayRecord?.status === 'late' ? '⏰' : '—'}</p>
                <p className="text-white/80 text-xs">Today</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold">{approvedLeaves}</p>
                <p className="text-white/80 text-xs">Leaves Taken</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold">{pendingLeaves}</p>
                <p className="text-white/80 text-xs">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Mark Attendance', icon: Clock, color: 'from-emerald-500 to-teal-500', action: () => { toast('Attendance marked successfully!', 'success') } },
            { label: 'Apply Leave', icon: CalendarDays, color: 'from-amber-500 to-orange-500', action: () => navigate('/leave') },
            { label: 'View Payslip', icon: Banknote, color: 'from-purple-500 to-pink-500', action: () => navigate('/payroll/payslips') },
            { label: 'My Documents', icon: FileText, color: 'from-blue-500 to-indigo-500', action: () => navigate('/documents') },
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
            {
              label: 'Attendance Status',
              value: todayRecord ? todayRecord.status.replace('-', ' ') : 'No record',
              icon: todayRecord?.status === 'present' ? CheckCircle2 : todayRecord?.status === 'late' ? Timer : XCircle,
              color: todayRecord?.status === 'present' ? 'text-success' : todayRecord?.status === 'late' ? 'text-warning' : 'text-danger',
              bgColor: todayRecord?.status === 'present' ? 'bg-success/10' : todayRecord?.status === 'late' ? 'bg-warning/10' : 'bg-danger/10',
              sub: todayRecord?.checkIn ? `In: ${todayRecord.checkIn}` : 'Not checked in',
            },
            {
              label: 'Leave Balance',
              value: `${leaveBalance} days`,
              icon: Calendar,
              color: 'text-primary',
              bgColor: 'bg-primary/10',
              sub: `${totalLeavesUsed} used, ${pendingLeaves} pending`,
            },
            {
              label: 'This Month Salary',
              value: employeeSalary ? formatCurrency(employeeSalary.netSalary) : 'Not assigned',
              icon: Banknote,
              color: 'text-success',
              bgColor: 'bg-success/10',
              sub: 'Net take home',
            },
            {
              label: 'Department',
              value: employee.department,
              icon: FileText,
              color: 'text-purple-500',
              bgColor: 'bg-purple-50',
              sub: employee.designation,
            },
          ].map((stat) => (
            <Card key={stat.label} className="border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 capitalize">{stat.value}</p>
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

      {/* Manager Pending Approvals */}
      {isManager && pendingApprovals.length > 0 && (
        <motion.div variants={item}>
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900">Pending Leave Approvals</h3>
                    <p className="text-xs text-gray-500">{pendingApprovals.length} request{pendingApprovals.length > 1 ? 's' : ''} from your team</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-amber-600" onClick={() => navigate('/leave')}>
                  Review <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-2">
                {pendingApprovals.slice(0, 3).map((leave) => {
                  const emp = employees.find(e => e.id === leave.employeeId)
                  if (!emp) return null
                  return (
                    <div key={leave.id} className="flex items-center justify-between p-2 rounded-lg bg-white/60">
                      <div className="flex items-center gap-2">
                        <Avatar initials={`${emp.firstName[0]}${emp.lastName[0]}`} size="sm" color="#F59E0B" />
                        <div>
                          <p className="text-xs font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                          <p className="text-[10px] text-gray-500 capitalize">{leave.type} • {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <Badge variant="warning">pending</Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Bottom Row */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Leave Applications */}
          <Card className="lg:col-span-2 border-gray-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xs font-semibold text-gray-900">My Leave Applications</h3>
                  <p className="text-xs text-gray-500">Recent and pending leave requests</p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/leave')}>
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              {recentLeaves.length > 0 ? (
                <div className="space-y-3">
                  {recentLeaves.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          leave.status === 'approved' ? 'bg-success/10 text-success' :
                          leave.status === 'pending' ? 'bg-warning/10 text-warning' :
                          'bg-danger/10 text-danger'
                        }`}>
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900 capitalize">{leave.type} Leave</p>
                          <p className="text-xs text-gray-500">{leave.startDate} to {leave.endDate}</p>
                        </div>
                      </div>
                      <Badge variant={leave.status === 'approved' ? 'success' : leave.status === 'pending' ? 'warning' : 'danger'}>
                        {leave.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No leave applications yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card className="border-gray-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <h3 className="text-xs font-semibold text-gray-900">Announcements</h3>
                </div>
                {announcements.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/notifications')} className="text-[11px]">
                    View All <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
              {announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.slice(0, 3).map((ann) => (
                    <div key={ann.id} className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-xs font-semibold text-gray-900">{ann.title}</h4>
                        <Badge variant={ann.priority === 'high' ? 'danger' : ann.priority === 'medium' ? 'warning' : 'secondary'} className="text-[10px]">
                          {ann.priority}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-gray-600 line-clamp-2">{ann.content}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{ann.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Zap className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No announcements</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  )
}
