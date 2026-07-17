import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/contexts/auth-context'
import { useLeave } from '@/contexts/leave-context'
import { LeaveApplicationModal } from '@/components/leave-application-modal'
import {
  Plus,
  Check,
  X,
  Clock,
  CalendarDays,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { employees } from '@/data/mock'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

const statusConfig = {
  pending: { color: 'warning' as const, icon: Clock },
  approved: { color: 'success' as const, icon: CheckCircle },
  rejected: { color: 'danger' as const, icon: XCircle },
  cancelled: { color: 'secondary' as const, icon: X },
}

export function Leave() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { leaves, approveLeave, rejectLeave, getEmployeeLeaves, getPendingForManager, getApprovedCount } = useLeave()
  const [activeTab, setActiveTab] = useState('balance')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showApplyModal, setShowApplyModal] = useState(false)

  const isManager = user?.role === 'manager'
  const isEmployee = user?.role === 'employee'
  const managerEmployeeId = user?.employeeId
  const myEmployeeId = user?.employeeId || '1'

  const myLeaves = getEmployeeLeaves(myEmployeeId)
  const myApprovedLeaves = myLeaves.filter(l => l.status === 'approved').length
  const myPendingLeaves = myLeaves.filter(l => l.status === 'pending').length

  const myDirectReportIds = employees
    .filter(e => e.reportingManagerId === managerEmployeeId)
    .map(e => e.id)

  const pendingApprovals = isManager ? getPendingForManager(myDirectReportIds) : []

  const filteredLeaves = isManager
    ? leaves.filter(l => myDirectReportIds.includes(l.employeeId))
    : isEmployee
      ? myLeaves
      : leaves.filter(l => statusFilter === 'all' || l.status === statusFilter)

  const leaveTypes = [
    { type: 'annual', label: 'Annual Leave', total: 20, used: myLeaves.filter(l => l.type === 'annual' && l.status === 'approved').length, color: '#2563EB' },
    { type: 'sick', label: 'Sick Leave', total: 10, used: myLeaves.filter(l => l.type === 'sick' && l.status === 'approved').length, color: '#EF4444' },
    { type: 'personal', label: 'Personal Leave', total: 5, used: myLeaves.filter(l => l.type === 'personal' && l.status === 'approved').length, color: '#F59E0B' },
    { type: 'maternity', label: 'Maternity Leave', total: 90, used: 0, color: '#8B5CF6' },
  ]

  const handleApproveLeave = (leaveId: string) => {
    const emp = employees.find(e => e.id === leaves.find(l => l.id === leaveId)?.employeeId)
    approveLeave(leaveId, user?.name || 'Manager')
    toast(`Leave approved for ${emp?.firstName || 'employee'}!`, 'success')
  }

  const handleRejectLeave = (leaveId: string) => {
    const emp = employees.find(e => e.id === leaves.find(l => l.id === leaveId)?.employeeId)
    rejectLeave(leaveId, user?.name || 'Manager')
    toast(`Leave rejected for ${emp?.firstName || 'employee'}.`, 'error')
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
            {isManager ? 'Leave Approvals' : 'Leave Management'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">
            {isManager ? 'Review and approve leave requests from your team.' : 'Manage leave requests and track balances.'}
          </p>
        </div>
        {!isManager && (
          <Button className="w-full sm:w-auto" onClick={() => setShowApplyModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Apply Leave
          </Button>
        )}
      </motion.div>

      {/* Pending Approvals Banner (Manager only) */}
      {isManager && pendingApprovals.length > 0 && (
        <motion.div variants={item}>
          <div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 sm:p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{pendingApprovals.length} pending approval{pendingApprovals.length > 1 ? 's' : ''}</p>
                <p className="text-xs text-white/80">Your team is waiting for your review</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div variants={item}>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {[
            ...(isManager ? [{ id: 'pending', label: `Pending (${pendingApprovals.length})` }] : []),
            { id: 'balance', label: 'My Balance' },
            { id: 'history', label: isManager ? 'All Requests' : 'My History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Pending Approvals Tab (Manager) */}
      {activeTab === 'pending' && isManager && (
        <motion.div variants={item}>
          <Card className="border-gray-100">
            <CardContent className="p-4 sm:p-6">
              {pendingApprovals.length > 0 ? (
                <div className="space-y-3">
                  {pendingApprovals.map((leave) => {
                    const emp = employees.find(e => e.id === leave.employeeId)
                    if (!emp) return null
                    return (
                      <div key={leave.id} className="rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar initials={`${emp.firstName[0]}${emp.lastName[0]}`} size="sm" color="#4F46E5" />
                            <div>
                              <p className="text-xs font-semibold text-gray-900">{emp.firstName} {emp.lastName}</p>
                              <p className="text-[11px] text-gray-500">{emp.department} • {emp.designation}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs font-medium text-gray-900 capitalize">{leave.type} Leave</p>
                              <p className="text-[11px] text-gray-500">
                                {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="text-success border-success hover:bg-success-50" onClick={() => handleApproveLeave(leave.id)}>
                                <Check className="mr-1 h-4 w-4" /> Approve
                              </Button>
                              <Button variant="outline" size="sm" className="text-danger border-danger hover:bg-danger-50" onClick={() => handleRejectLeave(leave.id)}>
                                <X className="mr-1 h-4 w-4" /> Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                        {leave.reason && <p className="mt-2 ml-11 text-[11px] text-gray-500">Reason: {leave.reason}</p>}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs mt-1">No pending leave requests from your team.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Balance Tab */}
      {activeTab === 'balance' && (
        <motion.div variants={item}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {leaveTypes.map((lt) => (
              <Card key={lt.type} className="border-gray-100">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500">{lt.label}</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">{lt.total - lt.used} <span className="text-xs font-normal text-gray-400">days left</span></p>
                    </div>
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${lt.color}15` }}>
                      <CalendarDays className="h-5 w-5" style={{ color: lt.color }} />
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${(lt.used / lt.total) * 100}%`, backgroundColor: lt.color }} />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-gray-400">{lt.used} used</span>
                    <span className="text-[10px] text-gray-400">{lt.total} total</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* History / All Requests Tab */}
      {activeTab === 'history' && (
        <motion.div variants={item}>
          <Card className="border-gray-100">
            <CardContent className="p-4 sm:p-6">
              {!isManager && (
                <div className="mb-4">
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                  ]} />
                </div>
              )}

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Employee</th>
                      <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Type</th>
                      <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Duration</th>
                      <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Reason</th>
                      <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">Approved By</th>
                      {isManager && <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-gray-500">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLeaves.map((leave) => {
                      const emp = employees.find(e => e.id === leave.employeeId)
                      if (!emp) return null
                      const config = statusConfig[leave.status]
                      return (
                        <tr key={leave.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar initials={`${emp.firstName[0]}${emp.lastName[0]}`} size="sm" color="#4F46E5" />
                              <div>
                                <p className="text-xs font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                                <p className="text-[10px] text-gray-500">{emp.department}</p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3"><span className="text-xs text-gray-700 capitalize">{leave.type}</span></td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className="text-xs text-gray-700">
                              {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                              {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3"><span className="text-xs text-gray-500 max-w-[200px] truncate block">{leave.reason}</span></td>
                          <td className="whitespace-nowrap px-4 py-3"><Badge variant={config.color}>{leave.status}</Badge></td>
                          <td className="whitespace-nowrap px-4 py-3"><span className="text-xs text-gray-500">{leave.approvedBy || '—'}</span></td>
                          {isManager && (
                            <td className="whitespace-nowrap px-4 py-3 text-right">
                              {leave.status === 'pending' && (
                                <div className="flex items-center justify-end gap-2">
                                  <Button variant="ghost" size="icon" className="text-success hover:text-success h-8 w-8" onClick={() => handleApproveLeave(leave.id)}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-danger hover:text-danger h-8 w-8" onClick={() => handleRejectLeave(leave.id)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredLeaves.map((leave) => {
                  const emp = employees.find(e => e.id === leave.employeeId)
                  if (!emp) return null
                  const config = statusConfig[leave.status]
                  return (
                    <div key={leave.id} className="rounded-lg border border-gray-100 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Avatar initials={`${emp.firstName[0]}${emp.lastName[0]}`} size="sm" color="#4F46E5" />
                          <div>
                            <p className="text-xs font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                            <p className="text-[10px] text-gray-500 capitalize">{leave.type} leave</p>
                          </div>
                        </div>
                        <Badge variant={config.color}>{leave.status}</Badge>
                      </div>
                      <div className="mt-2 text-[11px] text-gray-500">
                        {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                        {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      {leave.approvedBy && <p className="mt-1 text-[10px] text-gray-400">By: {leave.approvedBy}</p>}
                      {isManager && leave.status === 'pending' && (
                        <div className="mt-3 flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 text-success border-success hover:bg-success-50" onClick={() => handleApproveLeave(leave.id)}>
                            <Check className="mr-1 h-4 w-4" /> Approve
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 text-danger border-danger hover:bg-danger-50" onClick={() => handleRejectLeave(leave.id)}>
                            <X className="mr-1 h-4 w-4" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {filteredLeaves.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No leave records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Apply Leave Modal */}
      <LeaveApplicationModal open={showApplyModal} onClose={() => setShowApplyModal(false)} />
    </motion.div>
  )
}
