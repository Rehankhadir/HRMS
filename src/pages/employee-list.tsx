import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/contexts/auth-context'
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Users,
  ChevronRight,
} from 'lucide-react'
import { employees, departments } from '@/data/mock'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export function EmployeeList() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const canManageEmployees = user?.role === 'admin' || user?.role === 'hr'
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter
    const matchesDept = deptFilter === 'all' || emp.department === deptFilter
    return matchesSearch && matchesStatus && matchesDept
  })

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Department', 'Designation', 'Status', 'Joining Date']
    const rows = filteredEmployees.map(emp => [
      `${emp.firstName} ${emp.lastName}`,
      emp.email,
      emp.department,
      emp.designation,
      emp.status,
      emp.joiningDate,
    ])
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employees.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast('Employee data exported successfully!', 'success')
  }

  const statusColors: Record<string, 'success' | 'danger' | 'warning' | 'secondary'> = {
    active: 'success',
    inactive: 'danger',
    'on-leave': 'warning',
    terminated: 'secondary',
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
          <h1 className="text-sm sm:text-base font-bold text-text-primary">Employees</h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">Manage your team members and their information.</p>
        </div>
        {canManageEmployees && (
          <Button asChild className="w-full sm:w-auto">
            <Link to="/employees/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'on-leave', label: 'On Leave' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 min-w-[140px]"
          />
          <Select
            options={[
              { value: 'all', label: 'All Departments' },
              ...departments.map(d => ({ value: d.name, label: d.name })),
            ]}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="flex-1 min-w-[140px]"
          />
          <Button variant="outline" className="hidden sm:flex" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Employee List */}
      <motion.div variants={item}>
        {filteredEmployees.length > 0 ? (
          <>
            {/* Desktop Table */}
            <Card className="hidden md:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-background/50">
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                          Employee
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                          Department
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                          Designation
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                          Joined
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-background/50 transition-colors">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                initials={`${emp.firstName[0]}${emp.lastName[0]}`}
                                size="md"
                                color="#2563EB"
                              />
                              <div>
                                <p className="font-medium text-text-primary">
                                  {emp.firstName} {emp.lastName}
                                </p>
                                <p className="text-xs text-text-secondary">{emp.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="text-xs text-text-primary">{emp.department}</span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="text-xs text-text-primary">{emp.designation}</span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <Badge variant={statusColors[emp.status]}>
                              {emp.status.replace('-', ' ')}
                            </Badge>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="text-xs text-text-secondary">
                              {new Date(emp.joiningDate).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/employees/${emp.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/employees/${emp.id}`)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filteredEmployees.map((emp) => (
                <Link key={emp.id} to={`/employees/${emp.id}`}>
                  <Card className="active:scale-[0.98] transition-transform">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          initials={`${emp.firstName[0]}${emp.lastName[0]}`}
                          size="md"
                          color="#2563EB"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-text-primary truncate">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <Badge variant={statusColors[emp.status]} className="shrink-0">
                              {emp.status.replace('-', ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-text-secondary truncate">{emp.designation}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-text-secondary">{emp.department}</span>
                            <span className="text-xs text-text-secondary">•</span>
                            <span className="text-xs text-text-secondary">
                              {new Date(emp.joiningDate).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-text-secondary shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="No employees found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={
              canManageEmployees ? (
                <Button asChild>
                  <Link to="/employees/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Link>
                </Button>
              ) : undefined
            }
          />
        )}
      </motion.div>

      {/* Pagination */}
      {filteredEmployees.length > 0 && (
        <motion.div variants={item} className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-text-secondary">
            Showing {filteredEmployees.length} of {employees.length}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-white">
              1
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
