import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { extendedPayrollStore } from '@/lib/payroll-extended'
import { useToast } from '@/components/ui/toast'
import { Shield, Download, ChevronDown, ChevronRight, Filter, Activity, Clock, TrendingUp } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const MODULES = ['All', 'Payroll', 'Revision', 'Expense', 'Declarations', 'Settings'] as const
const ACTIONS = ['All', 'Create', 'Update', 'Delete', 'Approve', 'Reject', 'Process', 'Export'] as const

const actionColorMap: Record<string, string> = {
  create: 'bg-success/10 text-success border-success/20',
  update: 'bg-primary/10 text-primary border-primary/20',
  delete: 'bg-danger/10 text-danger border-danger/20',
  approve: 'bg-success/10 text-success border-success/20',
  reject: 'bg-danger/10 text-danger border-danger/20',
  process: 'bg-primary/10 text-primary border-primary/20',
  export: 'bg-warning/10 text-warning border-warning/20',
}

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isSameWeek(a: Date, b: Date) {
  const startOfWeek = new Date(b)
  startOfWeek.setDate(b.getDate() - b.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)
  return a >= startOfWeek && a < endOfWeek
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function ValueDiff({ oldValues, newValues }: { oldValues?: Record<string, any>; newValues?: Record<string, any> }) {
  if (!oldValues && !newValues) return <span className="text-text-secondary text-xs italic">No changes recorded</span>

  const allKeys = new Set([
    ...Object.keys(oldValues || {}),
    ...Object.keys(newValues || {}),
  ])

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-text-secondary mb-2">Value Changes</p>
      {Array.from(allKeys).map((key) => {
        const oldVal = oldValues?.[key]
        const newVal = newValues?.[key]
        const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal)

        return (
          <div key={key} className="flex items-start gap-3 text-xs">
            <span className="min-w-[120px] font-medium text-text-secondary capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            <div className="flex items-center gap-2 flex-1">
              <span className={`px-2 py-0.5 rounded font-mono ${changed ? 'bg-danger/10 text-danger line-through' : 'bg-background text-text-secondary'}`}>
                {oldVal !== undefined ? JSON.stringify(oldVal) : '—'}
              </span>
              {changed && <span className="text-text-secondary">→</span>}
              <span className={`px-2 py-0.5 rounded font-mono ${changed ? 'bg-success/10 text-success' : 'bg-background text-text-secondary'}`}>
                {newVal !== undefined ? JSON.stringify(newVal) : '—'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function exportToCSV(logs: any[]) {
  const headers = ['Timestamp', 'User', 'Role', 'Action', 'Module', 'Description', 'Entity Type', 'Old Values', 'New Values']
  const rows = logs.map((log) => [
    new Date(log.timestamp).toLocaleString('en-IN'),
    log.userName,
    log.userRole,
    log.action,
    log.module,
    log.description,
    log.entityType,
    log.oldValues ? JSON.stringify(log.oldValues) : '',
    log.newValues ? JSON.stringify(log.newValues) : '',
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function AuditTrailPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [moduleFilter, setModuleFilter] = useState<string>('All')
  const [actionFilter, setActionFilter] = useState<string>('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  if (!user || user.role !== 'admin') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-32"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-danger/10 mb-6">
          <Shield className="h-10 w-10 text-danger" />
        </div>
        <h2 className="text-sm font-bold text-text-primary">Access Denied</h2>
        <p className="mt-2 text-text-secondary text-center max-w-md">
          You do not have permission to view the Audit Trail. This page is restricted to administrators only.
        </p>
      </motion.div>
    )
  }

  const allLogs = extendedPayrollStore.getAuditLogs()
  const now = new Date()

  const filteredLogs = allLogs.filter((log) => {
    if (moduleFilter !== 'All' && log.module.toLowerCase() !== moduleFilter.toLowerCase()) return false
    if (actionFilter !== 'All' && log.action !== actionFilter.toLowerCase()) return false
    if (dateFrom) {
      const logDate = new Date(log.timestamp)
      const from = new Date(dateFrom)
      from.setHours(0, 0, 0, 0)
      if (logDate < from) return false
    }
    if (dateTo) {
      const logDate = new Date(log.timestamp)
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      if (logDate > to) return false
    }
    return true
  })

  const todayCount = allLogs.filter((l) => isSameDay(new Date(l.timestamp), now)).length
  const weekCount = allLogs.filter((l) => isSameWeek(new Date(l.timestamp), now)).length
  const monthCount = allLogs.filter((l) => isSameMonth(new Date(l.timestamp), now)).length

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleExport = () => {
    exportToCSV(filteredLogs)
    toast(`${filteredLogs.length} audit logs exported as CSV.`, 'success')
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm font-bold text-text-primary">Audit Trail</h1>
          <p className="mt-1 text-text-secondary">Track all system actions, changes, and approvals across the platform.</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">Actions Today</p>
                <p className="mt-2 text-sm font-bold text-text-primary">{todayCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">Actions This Week</p>
                <p className="mt-2 text-sm font-bold text-text-primary">{weekCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Clock className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-secondary">Actions This Month</p>
                <p className="mt-2 text-sm font-bold text-text-primary">{monthCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-text-secondary" />
              <span className="text-xs font-medium text-text-secondary">Filters</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Module</label>
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {MODULES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Action</label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {ACTIONS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Audit Log Table */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-0">
            {/* Table Header */}
            <div className="hidden lg:grid lg:grid-cols-[1fr_1.2fr_0.6fr_1fr_0.8fr_2.5fr] gap-4 px-6 py-4 border-b border-border">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Timestamp</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">User</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Role</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Action</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Module</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Description</span>
            </div>

            {/* Rows */}
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-text-secondary text-xs">No audit logs found matching your filters.</p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedRows.has(log.id)
                return (
                  <div key={log.id}>
                    {/* Row */}
                    <motion.div
                      layout
                      className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_0.6fr_1fr_0.8fr_2.5fr] gap-3 lg:gap-4 items-center px-6 py-4 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => toggleRow(log.id)}
                    >
                      {/* Timestamp */}
                      <div className="flex items-center gap-2">
                        <span className="lg:hidden text-text-secondary text-xs font-medium">Time:</span>
                        <span className="text-xs text-text-primary font-mono">{formatTimestamp(log.timestamp)}</span>
                      </div>

                      {/* User */}
                      <div className="flex items-center gap-2">
                        <span className="lg:hidden text-text-secondary text-xs font-medium">User:</span>
                        <span className="text-xs font-medium text-text-primary">{log.userName || 'System'}</span>
                      </div>

                      {/* Role */}
                      <div className="flex items-center gap-2">
                        <span className="lg:hidden text-text-secondary text-xs font-medium">Role:</span>
                        <span className="text-xs text-text-secondary capitalize">{log.userRole || '—'}</span>
                      </div>

                      {/* Action Badge */}
                      <div className="flex items-center gap-2">
                        <span className="lg:hidden text-text-secondary text-xs font-medium">Action:</span>
                        <Badge className={`text-xs font-medium border ${actionColorMap[log.action] || 'bg-muted text-text-secondary border-border'}`}>
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                        </Badge>
                      </div>

                      {/* Module */}
                      <div className="flex items-center gap-2">
                        <span className="lg:hidden text-text-secondary text-xs font-medium">Module:</span>
                        <span className="text-xs text-text-secondary capitalize">{log.module}</span>
                      </div>

                      {/* Description + expand icon */}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-text-secondary truncate">{log.description}</span>
                        <button className="shrink-0 text-text-secondary hover:text-text-primary transition-colors">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </div>
                    </motion.div>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-6 py-4 bg-muted/20 border-b border-border"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-xs">
                          <div>
                            <span className="text-text-secondary">Entity Type: </span>
                            <span className="text-text-primary font-medium">{log.entityType}</span>
                          </div>
                          <div>
                            <span className="text-text-secondary">Entity ID: </span>
                            <span className="text-text-primary font-medium font-mono">{log.entityId}</span>
                          </div>
                          {log.ipAddress && (
                            <div>
                              <span className="text-text-secondary">IP Address: </span>
                              <span className="text-text-primary font-medium font-mono">{log.ipAddress}</span>
                            </div>
                          )}
                        </div>
                        <ValueDiff oldValues={log.oldValues} newValues={log.newValues} />
                      </motion.div>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
