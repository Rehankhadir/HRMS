import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/contexts/auth-context'
import { useAnnouncements } from '@/contexts/announcement-context'
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CalendarDays,
  Plus,
  ChevronRight,
  Activity,
  Cake,
  Award,
  Zap,
  Sparkles,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  employees,
  attendance,
  attendanceTrend,
  departmentDistribution,
  activities,
} from '@/data/mock'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export function AdminDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const { announcements } = useAnnouncements()

  const todayStr = '2026-07-15'
  const todayAttendance = attendance.filter(a => a.date === todayStr)
  const presentToday = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length
  const absentToday = todayAttendance.filter(a => a.status === 'absent').length
  const onLeaveToday = todayAttendance.filter(a => a.status === 'on-leave').length

  const upcomingBirthdays = employees
    .filter(e => {
      const dob = new Date(e.dateOfBirth)
      const today = new Date()
      const thisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
      const diff = thisYear.getTime() - today.getTime()
      return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000
    })
    .slice(0, 4)

  const workAnniversaries = employees
    .filter(e => {
      const joinDate = new Date(e.joiningDate)
      const today = new Date()
      return joinDate.getMonth() === today.getMonth()
    })
    .slice(0, 4)

  const quickActions = [
    { label: 'Add Employee', icon: Plus, color: 'from-blue-500 to-indigo-500', action: () => navigate('/employees/new') },
    { label: 'Mark Attendance', icon: Clock, color: 'from-emerald-500 to-teal-500', action: () => { toast('Attendance marked successfully!', 'success') } },
    { label: 'Apply Leave', icon: CalendarDays, color: 'from-amber-500 to-orange-500', action: () => navigate('/leave') },
    { label: 'View Reports', icon: Sparkles, color: 'from-purple-500 to-pink-500', action: () => navigate('/reports') },
  ]

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
                Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
              </h1>
              <p className="text-white/80 text-xs sm:text-sm max-w-lg">
                Here's your organization overview. Manage employees, payroll, and HR operations.
              </p>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-lg sm:text-xl font-bold">{presentToday}</p>
                <p className="text-white/80 text-xs">Present</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold">{absentToday}</p>
                <p className="text-white/80 text-xs">Absent</p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold">{onLeaveToday}</p>
                <p className="text-white/80 text-xs">On Leave</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action) => (
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
            { label: 'Total Employees', value: employees.length, icon: Users, color: 'text-primary', bgColor: 'bg-primary/10', change: '+2 this month', changeColor: 'text-success' },
            { label: 'Present Today', value: presentToday, icon: UserCheck, color: 'text-success', bgColor: 'bg-success/10', change: `${Math.round(presentToday / employees.length * 100)}% attendance`, changeColor: 'text-success' },
            { label: 'Absent Today', value: absentToday, icon: UserX, color: 'text-danger', bgColor: 'bg-danger/10', change: `${Math.round(absentToday / employees.length * 100)}% absent`, changeColor: 'text-danger' },
            { label: 'On Leave', value: onLeaveToday, icon: CalendarDays, color: 'text-warning', bgColor: 'bg-warning/10', change: 'Pending approvals', changeColor: 'text-warning' },
          ].map((stat) => (
            <Card key={stat.label} className="border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-xs mt-1 ${stat.changeColor}`}>{stat.change}</p>
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
                  <h3 className="text-xs font-semibold text-gray-900">Attendance Trend</h3>
                  <p className="text-xs text-gray-500">Monthly attendance overview</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <span className="text-gray-500">Present</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-danger" />
                    <span className="text-gray-500">Absent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-warning" />
                    <span className="text-gray-500">Late</span>
                  </div>
                </div>
              </div>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceTrend} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="present" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="late" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-xs font-semibold text-gray-900 mb-2">Departments</h3>
              <p className="text-xs text-gray-500 mb-4">Team distribution</p>
              <div className="h-48 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={departmentDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {departmentDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {departmentDistribution.slice(0, 4).map((dept, index) => (
                  <div key={dept.name} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs text-gray-600 truncate">{dept.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Bottom Row */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="lg:col-span-2 border-gray-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xs font-semibold text-gray-900">Recent Activity</h3>
                  <p className="text-xs text-gray-500">Latest updates from your team</p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${
                      activity.type === 'attendance' ? 'bg-success/10 text-success' :
                      activity.type === 'leave' ? 'bg-warning/10 text-warning' :
                      activity.type === 'employee' ? 'bg-primary/10 text-primary' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {activity.type === 'attendance' ? <Clock className="h-4 w-4" /> :
                       activity.type === 'leave' ? <CalendarDays className="h-4 w-4" /> :
                       activity.type === 'employee' ? <Users className="h-4 w-4" /> :
                       <Activity className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700">{activity.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-xs font-semibold text-gray-900 mb-2">Upcoming Events</h3>
              <p className="text-xs text-gray-500 mb-4">Birthdays & Anniversaries</p>
              <div className="space-y-4">
                {upcomingBirthdays.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Cake className="h-4 w-4 text-pink-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Birthdays</span>
                    </div>
                    <div className="space-y-2">
                      {upcomingBirthdays.map((emp) => (
                        <div key={emp.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <Avatar initials={`${emp.firstName[0]}${emp.lastName[0]}`} size="sm" color="#EC4899" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-gray-500">{new Date(emp.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {workAnniversaries.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Work Anniversaries</span>
                    </div>
                    <div className="space-y-2">
                      {workAnniversaries.map((emp) => (
                        <div key={emp.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <Avatar initials={`${emp.firstName[0]}${emp.lastName[0]}`} size="sm" color="#F59E0B" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-gray-500">{emp.designation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {upcomingBirthdays.length === 0 && workAnniversaries.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No upcoming events</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <motion.div variants={item}>
          <Card className="border-gray-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <h3 className="text-xs font-semibold text-gray-900">Announcements</h3>
                </div>
                {announcements.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/announcements')} className="text-[11px]">
                    View All <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{ann.title}</h4>
                      <Badge variant={ann.priority === 'high' ? 'danger' : ann.priority === 'medium' ? 'warning' : 'secondary'}>
                        {ann.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{ann.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{ann.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
