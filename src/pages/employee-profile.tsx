import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { payrollStore } from '@/lib/payroll-store'
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  Building2,
  Activity,
  Clock,
  CalendarDays,
  FileText,
  AlertCircle,
  Landmark,
  StickyNote,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from 'lucide-react'
import { employees, attendance, leaves } from '@/data/mock'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const tabs = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: Activity },
  { id: 'personal', label: 'Personal', shortLabel: 'Personal', icon: Edit },
  { id: 'employment', label: 'Employment', shortLabel: 'Employ.', icon: Building2 },
  { id: 'salary', label: 'Salary', shortLabel: 'Salary', icon: DollarSign },
  { id: 'attendance', label: 'Attendance', shortLabel: 'Attend.', icon: Clock },
  { id: 'leave', label: 'Leave', shortLabel: 'Leave', icon: CalendarDays },
  { id: 'documents', label: 'Documents', shortLabel: 'Docs', icon: FileText },
  { id: 'emergency', label: 'Emergency', shortLabel: 'Emerg.', icon: AlertCircle },
  { id: 'bank', label: 'Bank Details', shortLabel: 'Bank', icon: Landmark },
  { id: 'notes', label: 'Notes', shortLabel: 'Notes', icon: StickyNote },
]

export function EmployeeProfile() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  const employee = employees.find(e => e.id === id) || employees[0]
  const reportingManager = employee.reportingManagerId
    ? employees.find(e => e.id === employee.reportingManagerId)
    : null
  const directReports = employees.filter(e => e.reportingManagerId === employee.id)

  const statusColors: Record<string, 'success' | 'danger' | 'warning' | 'secondary'> = {
    active: 'success',
    inactive: 'danger',
    'on-leave': 'warning',
    terminated: 'secondary',
  }

  const activeTabIndex = tabs.findIndex(t => t.id === activeTab)

  const scrollTabs = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left'
      ? Math.max(0, activeTabIndex - 1)
      : Math.min(tabs.length - 1, activeTabIndex + 1)
    setActiveTab(tabs[newIndex].id)
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 sm:space-y-6"
    >
      {/* Back Button */}
      <motion.div variants={item}>
        <Button variant="ghost" asChild className="gap-2">
          <Link to="/employees">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Employees</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </Button>
      </motion.div>

      {/* Profile Header */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar
                initials={`${employee.firstName[0]}${employee.lastName[0]}`}
                size="xl"
                color="#2563EB"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h1 className="text-sm sm:text-base font-bold text-text-primary truncate">
                      {employee.firstName} {employee.lastName}
                    </h1>
                    <p className="text-xs sm:text-sm text-text-secondary truncate">{employee.designation}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Badge variant={statusColors[employee.status]} className="shrink-0">
                      {employee.status.replace('-', ' ')}
                    </Badge>
                    <Button size="sm" className="hidden sm:flex">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button size="icon" className="sm:hidden">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate">{employee.email}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    {employee.phone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    {employee.department}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs - Scrollable on mobile */}
      <motion.div variants={item}>
        <div className="relative">
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollTabs('left')}
              className="shrink-0 p-1.5 rounded-lg bg-white border border-border hover:bg-background transition-colors md:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-1 sm:gap-1.5 rounded-lg bg-background p-1 min-w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        activeTab === tab.id
                          ? "bg-white text-text-primary shadow-sm"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <button
              onClick={() => scrollTabs('right')}
              className="shrink-0 p-1.5 rounded-lg bg-white border border-border hover:bg-background transition-colors md:hidden"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div variants={item}>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs sm:text-sm">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Full Name', value: `${employee.firstName} ${employee.lastName}` },
                  { label: 'Email', value: employee.email },
                  { label: 'Phone', value: employee.phone },
                  { label: 'Date of Birth', value: new Date(employee.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                  { label: 'Gender', value: employee.gender },
                ].map((field) => (
                  <div key={field.label} className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-text-secondary">{field.label}</span>
                    <span className="text-xs sm:text-sm font-medium text-text-primary capitalize">{field.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs sm:text-sm">Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Department', value: employee.department },
                  { label: 'Designation', value: employee.designation },
                  { label: 'Status', value: employee.status.replace('-', ' '), isBadge: true },
                  { label: 'Reporting Manager', value: reportingManager ? `${reportingManager.firstName} ${reportingManager.lastName}` : 'None' },
                  { label: 'Joining Date', value: new Date(employee.joiningDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                  { label: 'Annual Salary', value: `$${employee.salary.toLocaleString()}` },
                ].map((field) => (
                  <div key={field.label} className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-xs sm:text-sm text-text-secondary">{field.label}</span>
                    {field.isBadge ? (
                      <Badge variant={statusColors[employee.status]}>{field.value}</Badge>
                    ) : (
                      <span className="text-xs sm:text-sm font-medium text-text-primary">{field.value}</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {directReports.length > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs sm:text-sm">Direct Reports ({directReports.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {directReports.map((report) => (
                      <div key={report.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <Avatar initials={`${report.firstName[0]}${report.lastName[0]}`} size="sm" color="#4F46E5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{report.firstName} {report.lastName}</p>
                          <p className="text-[10px] text-gray-500 truncate">{report.designation}</p>
                        </div>
                        <Badge variant={report.status === 'active' ? 'success' : 'secondary'} className="text-[10px]">{report.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs sm:text-sm">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { time: 'Today, 9:00 AM', action: 'Checked in', type: 'attendance' },
                    { time: 'Yesterday, 5:30 PM', action: 'Checked out', type: 'attendance' },
                    { time: 'Jul 12, 2026', action: 'Applied for sick leave', type: 'leave' },
                    { time: 'Jul 10, 2026', action: 'Updated profile information', type: 'profile' },
                    { time: 'Jul 8, 2026', action: 'Uploaded new document', type: 'document' },
                  ].map((event, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full shrink-0 ${
                        event.type === 'attendance' ? 'bg-success-50 text-success' :
                        event.type === 'leave' ? 'bg-warning-50 text-warning' :
                        event.type === 'profile' ? 'bg-primary-50 text-primary' :
                        'bg-purple-50 text-purple-500'
                      }`}>
                        <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-text-primary">{event.action}</p>
                        <p className="text-xs text-text-secondary">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'personal' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm">Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                {[
                  { label: 'First Name', value: employee.firstName },
                  { label: 'Last Name', value: employee.lastName },
                  { label: 'Email', value: employee.email },
                  { label: 'Phone', value: employee.phone },
                  { label: 'Date of Birth', value: new Date(employee.dateOfBirth).toLocaleDateString() },
                  { label: 'Gender', value: employee.gender },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-xs sm:text-sm text-text-secondary">{field.label}</label>
                    <p className="mt-1 text-xs font-medium">{field.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs sm:text-sm text-text-secondary">Address</label>
                <p className="mt-1 text-xs font-medium">{employee.address}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'employment' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm">Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                {[
                  { label: 'Department', value: employee.department },
                  { label: 'Designation', value: employee.designation },
                  { label: 'Status', value: employee.status.replace('-', ' ') },
                  { label: 'Reporting Manager', value: reportingManager ? `${reportingManager.firstName} ${reportingManager.lastName}` : 'None' },
                  { label: 'Joining Date', value: new Date(employee.joiningDate).toLocaleDateString() },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-xs sm:text-sm text-text-secondary">{field.label}</label>
                    <p className="mt-1 text-xs font-medium capitalize">{field.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'salary' && (() => {
          const employeeSalary = payrollStore.getEmployeeSalary(employee.id)
          const structure = employeeSalary ? payrollStore.getStructure(employeeSalary.structureId) : null
          
          const formatCurrency = (amount: number) => {
            return new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            }).format(amount)
          }

          return (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Salary Details
                </CardTitle>
                {employeeSalary && (
                  <Badge variant="success">Active</Badge>
                )}
              </CardHeader>
              <CardContent>
                {employeeSalary && structure ? (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 p-4">
                        <p className="text-xs text-text-secondary">Annual CTC</p>
                        <p className="mt-1 text-sm font-bold text-primary">{formatCurrency(employeeSalary.grossSalary)}</p>
                        <p className="text-xs text-text-secondary">Monthly: {formatCurrency(Math.round(employeeSalary.grossSalary / 12))}</p>
                      </div>
                      <div className="rounded-lg bg-gradient-to-br from-success/5 to-success/10 p-4">
                        <p className="text-xs text-text-secondary">Net Pay</p>
                        <p className="mt-1 text-sm font-bold text-success">{formatCurrency(employeeSalary.netSalary)}</p>
                        <p className="text-xs text-text-secondary">Monthly: {formatCurrency(Math.round(employeeSalary.netSalary / 12))}</p>
                      </div>
                      <div className="rounded-lg bg-gradient-to-br from-warning/5 to-warning/10 p-4">
                        <p className="text-xs text-text-secondary">Structure</p>
                        <p className="mt-1 text-xs font-bold text-text-primary">{structure.name}</p>
                        <p className="text-xs text-text-secondary">Effective: {new Date(employeeSalary.effectiveFrom).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Components */}
                    <div>
                      <h4 className="mb-3 font-medium text-text-primary">Salary Components</h4>
                      <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border bg-background/50">
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-text-secondary">Component</th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-text-secondary">Type</th>
                              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-text-secondary">Value</th>
                              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-text-secondary">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {employeeSalary.components.map((comp, index) => {
                              const component = structure.components.find(c => c.id === comp.componentId)
                              return (
                                <tr key={index} className="hover:bg-background/50">
                                  <td className="px-4 py-3 text-xs font-medium text-text-primary">
                                    {component?.name || `Component ${index + 1}`}
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge variant={component?.type === 'earning' ? 'success' : 'danger'}>
                                      {component?.type || 'earning'}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-right text-xs text-text-secondary">
                                    {component?.isPercentage ? `${comp.value}%` : formatCurrency(comp.value)}
                                  </td>
                                  <td className={`px-4 py-3 text-right text-xs font-medium ${component?.type === 'earning' ? 'text-success' : 'text-danger'}`}>
                                    {formatCurrency(comp.calculatedValue)}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-border bg-background/50">
                              <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-text-primary">Total Earnings</td>
                              <td className="px-4 py-3 text-right text-xs font-bold text-success">
                                {formatCurrency(employeeSalary.grossSalary)}
                              </td>
                            </tr>
                            <tr className="bg-background/50">
                              <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-text-primary">Total Deductions</td>
                              <td className="px-4 py-3 text-right text-xs font-bold text-danger">
                                {formatCurrency(employeeSalary.grossSalary - employeeSalary.netSalary)}
                              </td>
                            </tr>
                            <tr className="bg-primary-50">
                              <td colSpan={3} className="px-4 py-3 text-xs font-bold text-primary">Net Pay</td>
                              <td className="px-4 py-3 text-right text-xs font-bold text-primary">
                                {formatCurrency(employeeSalary.netSalary)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* View Full Details */}
                    <div className="flex justify-end">
                      <Button variant="outline" asChild>
                        <Link to="/payroll/salary-assignment">
                          View All Salaries
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="mx-auto h-12 w-12 text-text-secondary" />
                    <h3 className="mt-4 text-xs font-medium text-text-primary">No salary assigned</h3>
                    <p className="mt-2 text-text-secondary">Assign a salary structure to this employee.</p>
                    <Button className="mt-4" asChild>
                      <Link to="/payroll/salary-assignment">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Assign Salary
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })()}

        {activeTab === 'attendance' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm">Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-text-secondary">
                <Clock className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 opacity-50" />
                <p className="text-xs">Attendance data will appear here</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'leave' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm">Leave History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-text-secondary">
                <CalendarDays className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 opacity-50" />
                <p className="text-xs">Leave data will appear here</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'documents' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-text-secondary">
                <FileText className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 opacity-50" />
                <p className="text-xs">No documents uploaded yet</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'emergency' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                {[
                  { label: 'Name', value: employee.emergencyContact.name },
                  { label: 'Phone', value: employee.emergencyContact.phone },
                  { label: 'Relationship', value: employee.emergencyContact.relationship },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-xs sm:text-sm text-text-secondary">{field.label}</label>
                    <p className="mt-1 text-xs font-medium">{field.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'bank' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm">Bank Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                {[
                  { label: 'Account Name', value: employee.bankDetails.accountName },
                  { label: 'Account Number', value: employee.bankDetails.accountNumber },
                  { label: 'Bank Name', value: employee.bankDetails.bankName },
                  { label: 'IFSC Code', value: employee.bankDetails.ifscCode },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-xs sm:text-sm text-text-secondary">{field.label}</label>
                    <p className="mt-1 text-xs font-medium">{field.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'notes' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-text-secondary">
                <StickyNote className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 opacity-50" />
                <p className="text-xs">No notes added yet</p>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  )
}
