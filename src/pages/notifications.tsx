import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useLeave } from '@/contexts/leave-context'
import { useAnnouncements } from '@/contexts/announcement-context'
import { employees } from '@/data/mock'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  ArrowLeft,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export function NotificationsPage() {
  const { user } = useAuth()
  const { leaves, getPendingForManager, getEmployeeLeaves } = useLeave()
  const { announcements } = useAnnouncements()
  const navigate = useNavigate()

  const isManager = user?.role === 'manager'
  const myEmployeeId = user?.employeeId || '1'
  const myDirectReportIds = employees
    .filter(e => e.reportingManagerId === myEmployeeId)
    .map(e => e.id)

  const leaveNotifications: {
    id: string
    type: 'success' | 'danger' | 'warning'
    icon: typeof CheckCircle
    title: string
    description: string
    date: string
  }[] = []

  if (isManager) {
    const pending = getPendingForManager(myDirectReportIds)
    pending.forEach(leave => {
      const emp = employees.find(e => e.id === leave.employeeId)
      if (emp) {
        leaveNotifications.push({
          id: `pending-${leave.id}`,
          type: 'warning',
          icon: Clock,
          title: `${emp.firstName} ${emp.lastName} applied for ${leave.type} leave`,
          description: `${new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${leave.reason}`,
          date: leave.appliedOn,
        })
      }
    })
  }

  const myLeaves = getEmployeeLeaves(myEmployeeId)
  myLeaves.forEach(leave => {
    if (leave.status === 'approved' && leave.approvedBy) {
      leaveNotifications.push({
        id: `approved-${leave.id}`,
        type: 'success',
        icon: CheckCircle,
        title: `Your ${leave.type} leave was approved`,
        description: `Approved by ${leave.approvedBy} • ${new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        date: leave.appliedOn,
      })
    } else if (leave.status === 'rejected' && leave.approvedBy) {
      leaveNotifications.push({
        id: `rejected-${leave.id}`,
        type: 'danger',
        icon: XCircle,
        title: `Your ${leave.type} leave was rejected`,
        description: `Rejected by ${leave.approvedBy} • ${new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        date: leave.appliedOn,
      })
    } else if (leave.status === 'pending') {
      leaveNotifications.push({
        id: `pending-mine-${leave.id}`,
        type: 'warning',
        icon: Clock,
        title: `Your ${leave.type} leave is pending`,
        description: `Applied on ${leave.appliedOn} • ${new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        date: leave.appliedOn,
      })
    }
  })

  const allNotifications = [
    ...leaveNotifications.map(n => ({ ...n, category: 'leave' })),
    ...announcements.map(a => ({
      id: `ann-${a.id}`,
      type: 'info' as const,
      icon: Zap,
      title: a.title,
      description: a.content,
      date: a.date,
      category: 'announcement' as const,
      priority: a.priority,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const typeColors = {
    success: 'bg-green-50 text-green-500',
    danger: 'bg-red-50 text-red-500',
    warning: 'bg-amber-50 text-amber-500',
    info: 'bg-blue-50 text-blue-500',
  }

  const typeBadge = {
    success: 'success' as const,
    danger: 'danger' as const,
    warning: 'warning' as const,
    info: 'secondary' as const,
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-6">
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">Your leave updates and company announcements</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pending', count: leaveNotifications.filter(n => n.type === 'warning').length, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Approved', count: leaveNotifications.filter(n => n.type === 'success').length, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Rejected', count: leaveNotifications.filter(n => n.type === 'danger').length, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Announcements', count: announcements.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((stat) => (
            <Card key={stat.label} className="border-gray-100">
              <CardContent className="p-4 text-center">
                <p className={`text-lg font-bold ${stat.color}`}>{stat.count}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Notifications List */}
      <motion.div variants={item}>
        <Card className="border-gray-100">
          <CardContent className="p-4 sm:p-6">
            {allNotifications.length > 0 ? (
              <div className="space-y-2">
                {allNotifications.map((notif) => (
                  <div key={notif.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${typeColors[notif.type]}`}>
                      <notif.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-900">{notif.title}</p>
                        <Badge variant={typeBadge[notif.type]} className="text-[10px] shrink-0">
                          {notif.category === 'announcement' ? (notif as any).priority : notif.type}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{notif.description}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{notif.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
