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
          <svg className="absolute top-0 right-0 h-full w-[55%] text-white/[0.07]" viewBox="0 0 600 200" preserveAspectRatio="none">
            <path d="M600,0 L600,200 L350,200 C380,170 420,130 400,90 C380,50 340,30 300,40 C260,50 230,80 200,100 C170,120 130,130 100,110 C70,90 50,50 80,20 C110,-10 200,0 300,0 C400,0 500,0 600,0 Z" fill="currentColor" />
          </svg>
          <svg className="absolute top-0 right-0 h-full w-[45%] text-white/[0.04]" viewBox="0 0 500 200" preserveAspectRatio="none">
            <path d="M500,0 L500,200 L300,200 C330,160 360,120 340,80 C320,40 280,20 240,30 C200,40 170,70 140,90 C110,110 70,100 50,70 C30,40 60,10 120,0 L500,0 Z" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-0 left-0 w-full h-28 text-white/[0.05]" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,60 C180,100 360,20 540,50 C720,80 900,30 1080,60 C1260,90 1380,40 1440,50 L1440,120 L0,120 Z" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-0 left-0 w-full h-20 text-white/[0.08]" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,80 C240,40 480,100 720,70 C960,40 1200,90 1440,60 L1440,120 L0,120 Z" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-0 left-0 w-full h-12 text-white/[0.10]" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,90 C360,60 720,110 1080,80 C1260,65 1380,95 1440,85 L1440,120 L0,120 Z" fill="currentColor" />
          </svg>
          <svg className="absolute top-0 left-0 w-full h-14 text-white/[0.03]" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,20 C360,60 720,0 1080,30 C1260,45 1380,15 1440,25 L1440,0 L0,0 Z" fill="currentColor" />
          </svg>
          <svg className="absolute -top-8 -left-8 h-56 w-56 text-white/[0.06]" viewBox="0 0 200 200">
            <path d="M45.3,-51.2C58.3,-40.8,68.5,-25.4,71.1,-8.5C73.7,8.4,68.7,26.8,57.5,39.6C46.3,52.4,28.9,59.6,10.8,63.1C-7.3,66.6,-26.1,66.4,-40.8,57.8C-55.5,49.2,-66.1,32.2,-69.5,13.7C-72.9,-4.8,-69.1,-24.8,-58.5,-38.2C-47.9,-51.6,-30.4,-58.4,-13.8,-62.1C2.8,-65.8,32.3,-61.6,45.3,-51.2Z" fill="currentColor" transform="translate(100 100)" />
          </svg>
          <svg className="absolute top-1/3 right-[15%] h-32 w-32 text-white/[0.04]" viewBox="0 0 200 200">
            <path d="M39.9,-47.7C52.5,-37.8,63.6,-25.4,66.7,-10.8C69.8,3.8,64.9,20.6,55.1,33.1C45.3,45.6,30.6,53.8,14.7,58.8C-1.2,63.8,-18.3,65.6,-32.4,59C-46.5,52.4,-57.6,37.4,-62.1,21.1C-66.6,4.8,-64.5,-12.8,-56.2,-26.2C-47.9,-39.6,-33.4,-48.8,-18.7,-56.2C-4,-63.6,10.9,-69.2,24.5,-65.2C38.1,-61.2,50.4,-47.6,39.9,-47.7Z" fill="currentColor" transform="translate(100 100)" />
          </svg>
          <svg className="absolute bottom-8 left-[10%] w-64 h-8 text-white/[0.06]" viewBox="0 0 300 30" preserveAspectRatio="none">
            <path d="M0,15 Q75,0 150,15 Q225,30 300,15" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <svg className="absolute top-1/2 -translate-y-1/2 right-[10%] w-48 h-8 text-white/[0.05]" viewBox="0 0 200 30" preserveAspectRatio="none">
            <path d="M0,15 Q50,0 100,15 Q150,30 200,15" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
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
