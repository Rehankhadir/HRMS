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

  const departmentDistribution = Object.entries(
    employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value], i) => ({
    name,
    value,
    color: COLORS[i % COLORS.length],
  }))

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const attendanceTrend = monthNames.slice(1, 7).map((month) => {
    const monthIndex = monthNames.indexOf(month)
    const monthRecords = attendance.filter(a => {
      const d = new Date(a.date)
      return d.getFullYear() === 2026 && d.getMonth() === monthIndex
    })
    return {
      month,
      present: monthRecords.filter(a => a.status === 'present' || a.status === 'late').length,
      absent: monthRecords.filter(a => a.status === 'absent').length,
      late: monthRecords.filter(a => a.status === 'late').length,
    }
  })

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
          {/* Decorative shapes */}
          <svg className="absolute top-0 right-0 h-full w-[55%] text-white/[0.07]" viewBox="0 0 600 200" preserveAspectRatio="none">
            <path d="M600,0 L600,200 L350,200 C380,170 420,130 400,90 C380,50 340,30 300,40 C260,50 230,80 200,100 C170,120 130,130 100,110 C70,90 50,50 80,20 C110,-10 200,0 300,0 C400,0 500,0 600,0 Z" fill="currentColor" />
          </svg>
          <svg className="absolute top-0 right-0 h-full w-[45%] text-white/[0.04]" viewBox="0 0 500 200" preserveAspectRatio="none">
            <path d="M500,0 L500,200 L300,200 C330,160 360,120 340,80 C320,40 280,20 240,30 C200,40 170,70 140,90 C110,110 70,100 50,70 C30,40 60,10 120,0 L500,0 Z" fill="currentColor" />
          </svg>
          {/* Bottom flowing waves */}
          <svg className="absolute bottom-0 left-0 w-full h-28 text-white/[0.05]" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,60 C180,100 360,20 540,50 C720,80 900,30 1080,60 C1260,90 1380,40 1440,50 L1440,120 L0,120 Z" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-0 left-0 w-full h-20 text-white/[0.08]" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,80 C240,40 480,100 720,70 C960,40 1200,90 1440,60 L1440,120 L0,120 Z" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-0 left-0 w-full h-12 text-white/[0.10]" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,90 C360,60 720,110 1080,80 C1260,65 1380,95 1440,85 L1440,120 L0,120 Z" fill="currentColor" />
          </svg>
          {/* Top flowing wave */}
          <svg className="absolute top-0 left-0 w-full h-14 text-white/[0.03]" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,20 C360,60 720,0 1080,30 C1260,45 1380,15 1440,25 L1440,0 L0,0 Z" fill="currentColor" />
          </svg>
          {/* Floating organic blobs */}
          <svg className="absolute -top-8 -left-8 h-56 w-56 text-white/[0.06]" viewBox="0 0 200 200">
            <path d="M45.3,-51.2C58.3,-40.8,68.5,-25.4,71.1,-8.5C73.7,8.4,68.7,26.8,57.5,39.6C46.3,52.4,28.9,59.6,10.8,63.1C-7.3,66.6,-26.1,66.4,-40.8,57.8C-55.5,49.2,-66.1,32.2,-69.5,13.7C-72.9,-4.8,-69.1,-24.8,-58.5,-38.2C-47.9,-51.6,-30.4,-58.4,-13.8,-62.1C2.8,-65.8,32.3,-61.6,45.3,-51.2Z" fill="currentColor" transform="translate(100 100)" />
          </svg>
          <svg className="absolute top-1/3 right-[15%] h-32 w-32 text-white/[0.04]" viewBox="0 0 200 200">
            <path d="M39.9,-47.7C52.5,-37.8,63.6,-25.4,66.7,-10.8C69.8,3.8,64.9,20.6,55.1,33.1C45.3,45.6,30.6,53.8,14.7,58.8C-1.2,63.8,-18.3,65.6,-32.4,59C-46.5,52.4,-57.6,37.4,-62.1,21.1C-66.6,4.8,-64.5,-12.8,-56.2,-26.2C-47.9,-39.6,-33.4,-48.8,-18.7,-56.2C-4,-63.6,10.9,-69.2,24.5,-65.2C38.1,-61.2,50.4,-47.6,39.9,-47.7Z" fill="currentColor" transform="translate(100 100)" />
          </svg>
          {/* Thin accent curves */}
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
