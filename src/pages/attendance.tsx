import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/contexts/auth-context'
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { attendance, employees } from '@/data/mock'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

const statusConfig = {
  present: { color: 'success' as const, icon: CheckCircle, label: 'Present', bgColor: 'bg-success' },
  absent: { color: 'danger' as const, icon: XCircle, label: 'Absent', bgColor: 'bg-danger' },
  late: { color: 'warning' as const, icon: AlertCircle, label: 'Late', bgColor: 'bg-warning' },
  'on-leave': { color: 'secondary' as const, icon: Calendar, label: 'On Leave', bgColor: 'bg-secondary' },
  'half-day': { color: 'warning' as const, icon: Clock, label: 'Half Day', bgColor: 'bg-warning' },
  holiday: { color: 'secondary' as const, icon: Calendar, label: 'Holiday', bgColor: 'bg-secondary' },
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function Attendance() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('table')
  const [dateFilter, setDateFilter] = useState('today')
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1)) // July 2026

  const isEmployee = user?.role === 'employee'
  const employeeId = user?.employeeId

  const filteredAttendance = isEmployee && employeeId
    ? attendance.filter(a => a.employeeId === employeeId)
    : attendance

  const getFilteredByDateRange = useMemo(() => {
    const today = new Date(2026, 6, 15) // July 15, 2026
    
    switch (dateFilter) {
      case 'today':
        return filteredAttendance.filter(a => a.date === '2026-07-15')
      case 'week': {
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        return filteredAttendance.filter(a => {
          const d = new Date(a.date)
          return d >= startOfWeek && d <= endOfWeek
        })
      }
      case 'month': {
        return filteredAttendance.filter(a => {
          const d = new Date(a.date)
          return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
        })
      }
      default:
        return filteredAttendance
    }
  }, [filteredAttendance, dateFilter])

  const presentCount = getFilteredByDateRange.filter(a => a.status === 'present' || a.status === 'late').length
  const absentCount = getFilteredByDateRange.filter(a => a.status === 'absent').length
  const lateCount = getFilteredByDateRange.filter(a => a.status === 'late').length

  const handleMarkAttendance = () => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    toast(`Attendance marked at ${timeStr}!`, 'success')
  }

  const handleExport = () => {
    const headers = ['Employee', 'Department', 'Date', 'Check In', 'Check Out', 'Hours', 'Status']
    const rows = getFilteredByDateRange.map(record => {
      const emp = employees.find(e => e.id === record.employeeId)
      return [
        emp ? `${emp.firstName} ${emp.lastName}` : '',
        emp?.department || '',
        record.date,
        record.checkIn || '',
        record.checkOut || '',
        record.hours || '',
        record.status,
      ]
    })
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'attendance.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast('Attendance data exported successfully!', 'success')
  }

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDay = firstDay.getDay()
    const totalDays = lastDay.getDate()
    
    const days: { date: Date; isCurrentMonth: boolean; attendance?: typeof attendance[0] }[] = []
    
    for (let i = 0; i < startDay; i++) {
      const d = new Date(year, month, -startDay + i + 1)
      days.push({ date: d, isCurrentMonth: false })
    }
    
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i)
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const dayAttendance = filteredAttendance.find(a => a.date === dateStr)
      days.push({ date: d, isCurrentMonth: true, attendance: dayAttendance })
    }
    
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      days.push({ date: d, isCurrentMonth: false })
    }
    
    return days
  }, [currentMonth, filteredAttendance])

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 sm:space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-text-primary">
            {isEmployee ? 'My Attendance' : 'Attendance'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">
            {isEmployee ? 'View your attendance records.' : 'Track and manage daily attendance records.'}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button className="flex-1 sm:flex-none" onClick={handleMarkAttendance}>
            <Clock className="mr-2 h-4 w-4" />
            Mark
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        {[
          { label: dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'This Week' : 'This Month', value: getFilteredByDateRange.length, color: 'primary', icon: Clock },
          { label: 'Present', value: presentCount, color: 'success', icon: CheckCircle },
          { label: 'Absent', value: absentCount, color: 'danger', icon: XCircle },
          { label: 'Late', value: lateCount, color: 'warning', icon: AlertCircle },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-${stat.color}-50 text-${stat.color}`}>
                  <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-text-secondary">{stat.label}</p>
                  <p className="text-base sm:text-sm font-bold text-text-primary">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Tabs & Filter */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex gap-1 sm:gap-1.5 rounded-lg bg-background p-1">
            {[
              { id: 'table', label: 'Table' },
              { id: 'calendar', label: 'Calendar' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Select
            options={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
            ]}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div variants={item}>
        {activeTab === 'table' ? (
          <>
            {/* Desktop Table */}
            <Card className="hidden md:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-background/50">
                        {!isEmployee && (
                          <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                            Employee
                          </th>
                        )}
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                          Check In
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                          Check Out
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                          Hours
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {getFilteredByDateRange.map((record) => {
                        const emp = employees.find(e => e.id === record.employeeId)
                        if (!emp) return null
                        const config = statusConfig[record.status]
                        return (
                          <tr key={record.id} className="hover:bg-background/50 transition-colors">
                            {!isEmployee && (
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    initials={`${emp.firstName[0]}${emp.lastName[0]}`}
                                    size="sm"
                                    color="#2563EB"
                                  />
                                  <div>
                                    <p className="font-medium text-text-primary">
                                      {emp.firstName} {emp.lastName}
                                    </p>
                                    <p className="text-xs text-text-secondary">{emp.department}</p>
                                  </div>
                                </div>
                              </td>
                            )}
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="text-xs text-text-primary">
                                {new Date(record.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="text-xs text-text-primary">{record.checkIn || '—'}</span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="text-xs text-text-primary">{record.checkOut || '—'}</span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="text-xs text-text-primary">{record.hours || '—'}</span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <Badge variant={config.color}>{config.label}</Badge>
                            </td>
                          </tr>
                        )
                      })}
                      {getFilteredByDateRange.length === 0 && (
                        <tr>
                          <td colSpan={isEmployee ? 5 : 6} className="px-6 py-12 text-center text-text-secondary">
                            No attendance records found for the selected period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {getFilteredByDateRange.map((record) => {
                const emp = employees.find(e => e.id === record.employeeId)
                if (!emp) return null
                const config = statusConfig[record.status]
                return (
                  <Card key={record.id}>
                    <CardContent className="p-4">
                      {!isEmployee && (
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              initials={`${emp.firstName[0]}${emp.lastName[0]}`}
                              size="sm"
                              color="#2563EB"
                            />
                            <div>
                              <p className="font-medium text-text-primary">
                                {emp.firstName} {emp.lastName}
                              </p>
                              <p className="text-xs text-text-secondary">{emp.department}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-text-secondary">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <Badge variant={config.color}>{config.label}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-background p-2">
                          <p className="text-xs text-text-secondary">Check In</p>
                          <p className="text-xs font-medium">{record.checkIn || '—'}</p>
                        </div>
                        <div className="rounded-lg bg-background p-2">
                          <p className="text-xs text-text-secondary">Check Out</p>
                          <p className="text-xs font-medium">{record.checkOut || '—'}</p>
                        </div>
                        <div className="rounded-lg bg-background p-2">
                          <p className="text-xs text-text-secondary">Hours</p>
                          <p className="text-xs font-medium">{record.hours || '—'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              {getFilteredByDateRange.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-text-secondary">
                    No attendance records found for the selected period.
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : (
          /* Calendar View */
          <Card>
            <CardContent className="p-4 sm:p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h3 className="text-xs font-semibold text-text-primary">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <Button variant="ghost" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-text-secondary py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dateStr = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`
                  const isToday = dateStr === '2026-07-15'
                  const dayAtt = day.attendance
                  const config = dayAtt ? statusConfig[dayAtt.status] : null
                  
                  return (
                    <div
                      key={index}
                      className={`relative min-h-[60px] sm:min-h-[80px] rounded-lg border p-1 sm:p-2 transition-colors ${
                        day.isCurrentMonth
                          ? 'bg-white border-border hover:border-primary/30'
                          : 'bg-background/50 border-transparent text-text-secondary'
                      } ${isToday ? 'ring-2 ring-primary' : ''}`}
                    >
                      <span className={`text-xs sm:text-sm font-medium ${
                        day.isCurrentMonth ? 'text-text-primary' : 'text-text-secondary'
                      } ${isToday ? 'text-primary font-bold' : ''}`}>
                        {day.date.getDate()}
                      </span>
                      {dayAtt && config && (
                        <div className="mt-1">
                          <div className={`w-full h-1.5 sm:h-2 rounded-full ${config.bgColor} opacity-80`} />
                          <p className="text-[10px] sm:text-xs mt-0.5 text-text-secondary hidden sm:block">
                            {config.label}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 pt-4 border-t border-border">
                {Object.entries(statusConfig).map(([key, config]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${config.bgColor}`} />
                    <span className="text-xs text-text-secondary">{config.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  )
}
