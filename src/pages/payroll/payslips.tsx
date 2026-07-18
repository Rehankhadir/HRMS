import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'
import { payrollStore } from '@/lib/payroll-store'
import { employees } from '@/data/mock'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/toast'
import { generatePayslipPDF } from '@/lib/pdf-export'
import type { Payslip } from '@/types'
import {
  ArrowLeft,
  Download,
  Eye,
  Search,
  FileText,
  Calendar,
  Hash,
  Receipt,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export function Payslips() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewingPayslip, setViewingPayslip] = useState<Payslip | null>(null)

  const isEmployee = user?.role === 'employee'
  const employeeId = user?.employeeId

  const periods = payrollStore.getPeriods()

  const payslips = isEmployee && employeeId
    ? payrollStore.getPayslips(selectedPeriod !== 'all' ? selectedPeriod : undefined, employeeId)
    : payrollStore.getPayslips(selectedPeriod !== 'all' ? selectedPeriod : undefined)

  const filteredPayslips = isEmployee
    ? payslips
    : payslips.filter(payslip => {
        const emp = employees.find(e => e.id === payslip.employeeId)
        if (!emp) return false
        return (
          emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleDownloadPDF = (payslip: Payslip) => {
    try {
      generatePayslipPDF(payslip, 'download')
      toast('Payslip PDF downloaded successfully!', 'success')
    } catch {
      toast('Failed to generate PDF. Please try again.', 'error')
    }
  }

  const handleViewPDF = (payslip: Payslip) => {
    try {
      generatePayslipPDF(payslip, 'view')
    } catch {
      toast('Failed to generate PDF. Please try again.', 'error')
    }
  }

  const currentEmp = isEmployee && employeeId
    ? employees.find(e => e.id === employeeId)
    : null

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Back Button */}
      <motion.div variants={item}>
        <Button
          variant="ghost"
          onClick={() => navigate(isEmployee ? '/' : '/payroll')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEmployee ? 'Back to Dashboard' : 'Back to Payroll'}
        </Button>
      </motion.div>

      {/* Page Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm font-bold text-text-primary">
            {isEmployee ? 'My Payslips' : 'Payslips'}
          </h1>
          <p className="mt-1 text-text-secondary">
            {isEmployee
              ? 'View and download your salary payslips.'
              : 'View and download employee payslips.'
            }
          </p>
        </div>
        {isEmployee && currentEmp && (
          <div className="flex items-center gap-3">
            <Avatar
              initials={`${currentEmp.firstName[0]}${currentEmp.lastName[0]}`}
              size="lg"
              color="#4F46E5"
            />
            <div>
              <p className="font-semibold text-text-primary">{currentEmp.firstName} {currentEmp.lastName}</p>
              <p className="text-xs text-text-secondary">{currentEmp.department} • {currentEmp.designation}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Employee Stats */}
      {isEmployee && (
        <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Total Payslips</p>
                  <p className="text-sm font-bold text-text-primary">{filteredPayslips.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50">
                  <Calendar className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Latest Pay Period</p>
                  <p className="text-sm font-bold text-text-primary">
                    {filteredPayslips.length > 0
                      ? `${monthNames[filteredPayslips[0].month - 1]} ${filteredPayslips[0].year}`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50">
                  <Download className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Latest Net Pay</p>
                  <p className="text-sm font-bold text-success">
                    {filteredPayslips.length > 0
                      ? formatCurrency(filteredPayslips[0].netSalary)
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {!isEmployee && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
        <Select
          options={[
            { value: 'all', label: 'All Periods' },
            ...periods.map(p => ({
              value: p.id,
              label: `${monthNames[p.month - 1]} ${p.year}`,
            })),
          ]}
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className={isEmployee ? "w-full sm:w-48" : "w-full sm:w-48"}
        />
      </motion.div>

      {/* Payslips List */}
      <motion.div variants={item}>
        {filteredPayslips.length > 0 ? (
          <div className="space-y-3">
            {filteredPayslips.map((payslip) => {
              const emp = employees.find(e => e.id === payslip.employeeId)
              if (!emp) return null
              return (
                <Card key={payslip.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        {!isEmployee && (
                          <Avatar
                            initials={`${emp.firstName[0]}${emp.lastName[0]}`}
                            size="lg"
                            color="#4F46E5"
                          />
                        )}
                        <div>
                          {!isEmployee && (
                            <p className="font-semibold text-text-primary">{emp.firstName} {emp.lastName}</p>
                          )}
                          {isEmployee && (
                            <p className="font-semibold text-text-primary">Salary Payslip</p>
                          )}
                          {!isEmployee && (
                            <p className="text-xs text-text-secondary">{emp.department} • {emp.designation}</p>
                          )}
                          <div className="mt-1 flex items-center gap-4 text-xs text-text-secondary">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {monthNames[payslip.month - 1]} {payslip.year}
                            </span>
                            <span className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {payslip.id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-text-secondary">Net Pay</p>
                          <p className="text-sm font-bold text-success">{formatCurrency(payslip.netSalary)}</p>
                        </div>
                        <Badge variant={payslip.status === 'paid' ? 'success' : 'warning'}>
                          {payslip.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setViewingPayslip(payslip)}
                            title="Preview payslip"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewPDF(payslip)}
                            title="View PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDownloadPDF(payslip)}
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-text-secondary" />
                <h3 className="mt-4 text-xs font-medium text-text-primary">No payslips found</h3>
                <p className="mt-2 text-text-secondary">
                  {isEmployee
                    ? 'No payslips have been generated for your account yet.'
                    : (searchQuery ? 'Try a different search term.' : 'Process payroll to generate payslips.')
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Payslip Preview Modal */}
      {viewingPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
          >
            {(() => {
              const emp = employees.find(e => e.id === viewingPayslip.employeeId)
              if (!emp) return null
              return (
                <div className="p-6 sm:p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between border-b border-border pb-6 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-bold">
                          Z
                        </div>
                        <div>
                          <h2 className="text-sm font-bold text-text-primary">Zenith</h2>
                          <p className="text-xs text-text-secondary">123 Business Street, San Francisco, CA 94102</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <h3 className="text-xs font-semibold text-text-primary">Salary Payslip</h3>
                      <p className="text-xs text-text-secondary">
                        {monthNames[viewingPayslip.month - 1]} {viewingPayslip.year}
                      </p>
                    </div>
                  </div>

                  {/* Employee Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-background rounded-xl">
                    <div>
                      <p className="text-xs text-text-secondary uppercase">Employee Name</p>
                      <p className="font-medium text-text-primary">{emp.firstName} {emp.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary uppercase">Employee ID</p>
                      <p className="font-medium text-text-primary">{emp.id.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary uppercase">Department</p>
                      <p className="font-medium text-text-primary">{emp.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary uppercase">Designation</p>
                      <p className="font-medium text-text-primary">{emp.designation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary uppercase">Working Days</p>
                      <p className="font-medium text-text-primary">{viewingPayslip.workingDays}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary uppercase">Days Present</p>
                      <p className="font-medium text-text-primary">{viewingPayslip.daysPresent}</p>
                    </div>
                  </div>

                  {/* Earnings & Deductions */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
                    {/* Earnings */}
                    <div>
                      <h4 className="text-xs font-semibold text-success mb-3 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-success" />
                        Earnings
                      </h4>
                      <div className="space-y-2">
                        {viewingPayslip.earnings.map((e, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-text-secondary">{e.name}</span>
                            <span className="font-medium text-success">{formatCurrency(e.amount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-xs font-semibold pt-2 border-t border-border">
                          <span className="text-text-primary">Total Earnings</span>
                          <span className="text-success">{formatCurrency(viewingPayslip.grossSalary)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Deductions */}
                    <div>
                      <h4 className="text-xs font-semibold text-danger mb-3 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-danger" />
                        Deductions
                      </h4>
                      <div className="space-y-2">
                        {viewingPayslip.deductions.map((d, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-text-secondary">{d.name}</span>
                            <span className="font-medium text-danger">{formatCurrency(d.amount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-xs font-semibold pt-2 border-t border-border">
                          <span className="text-text-primary">Total Deductions</span>
                          <span className="text-danger">{formatCurrency(viewingPayslip.totalDeductions)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay */}
                  <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold">Net Pay</h3>
                      <span className="text-sm font-bold">{formatCurrency(viewingPayslip.netSalary)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => setViewingPayslip(null)}>
                      Close
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const p = viewingPayslip
                        setViewingPayslip(null)
                        handleViewPDF(p)
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View PDF
                    </Button>
                    <Button onClick={() => {
                      const p = viewingPayslip
                      setViewingPayslip(null)
                      handleDownloadPDF(p)
                    }}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              )
            })()}
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
