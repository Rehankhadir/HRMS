import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { extendedPayrollStore } from '@/lib/payroll-extended'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/toast'
import {
  FileText,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Building2,
  Receipt,
  Landmark,
  RefreshCw,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const statusConfig = {
  pending: { color: 'bg-warning-50 text-warning border-warning/20', icon: Clock, label: 'Pending' },
  paid: { color: 'bg-success-50 text-success border-success/20', icon: CheckCircle, label: 'Paid' },
  overdue: { color: 'bg-danger-50 text-danger border-danger/20', icon: AlertCircle, label: 'Overdue' },
  filed: { color: 'bg-success-50 text-success border-success/20', icon: CheckCircle, label: 'Filed' },
}

export function Compliance() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear] = useState(new Date().getFullYear())

  const compliance = extendedPayrollStore.getCompliance(selectedMonth, selectedYear)
  const isHR = user?.role === 'hr' || user?.role === 'admin'

  const monthOptions = monthNames.map((name, i) => ({
    value: String(i + 1),
    label: name,
  }))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleGenerateReport = () => {
    toast('Compliance report generated successfully!', 'success')
  }

  const handleDownload = () => {
    const reportContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Statutory Compliance Report - ${monthNames[selectedMonth - 1]} ${selectedYear}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; }
    .header { text-align: center; border-bottom: 3px solid #2563EB; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 24px; color: #2563EB; }
    .header p { color: #64748b; font-size: 14px; margin-top: 5px; }
    .section { margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #2563EB; }
    .section-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #1a1a1a; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .row:last-child { border-bottom: none; }
    .label { color: #64748b; font-size: 14px; }
    .value { font-weight: 600; color: #1a1a1a; }
    .total { font-size: 18px; font-weight: 700; color: #2563EB; margin-top: 15px; padding-top: 15px; border-top: 2px solid #2563EB; }
    .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Statutory Compliance Report</h1>
    <p>${monthNames[selectedMonth - 1]} ${selectedYear} | Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="section">
    <h3 class="section-title">PF Challan</h3>
    <div class="row"><span class="label">Employee Contribution</span><span class="value">${formatCurrency(compliance.pfChallan.totalEmployeeContribution)}</span></div>
    <div class="row"><span class="label">Employer Contribution</span><span class="value">${formatCurrency(compliance.pfChallan.totalEmployerContribution)}</span></div>
    <div class="row"><span class="label">Admin Charges</span><span class="value">${formatCurrency(compliance.pfChallan.totalAdminCharges)}</span></div>
    <div class="row"><span class="label">EDLI Charges</span><span class="value">${formatCurrency(compliance.pfChallan.totalEDLICharges)}</span></div>
    <div class="total">Total: ${formatCurrency(compliance.pfChallan.totalAmount)}</div>
  </div>

  <div class="section">
    <h3 class="section-title">ESI Challan</h3>
    <div class="row"><span class="label">Employee Contribution</span><span class="value">${formatCurrency(compliance.esiChallan.totalEmployeeContribution)}</span></div>
    <div class="row"><span class="label">Employer Contribution</span><span class="value">${formatCurrency(compliance.esiChallan.totalEmployerContribution)}</span></div>
    <div class="total">Total: ${formatCurrency(compliance.esiChallan.totalAmount)}</div>
  </div>

  <div class="section">
    <h3 class="section-title">Professional Tax</h3>
    <div class="total">Total: ${formatCurrency(compliance.ptReturn.totalTax)}</div>
  </div>

  <div class="section">
    <h3 class="section-title">TDS Return</h3>
    <div class="total">Total: ${formatCurrency(compliance.tdsReturn.totalTDS)}</div>
  </div>

  <div class="footer">
    <p>This is a system-generated compliance report.</p>
  </div>
</body>
</html>
    `

    const blob = new Blob([reportContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compliance-report-${monthNames[selectedMonth - 1]}-${selectedYear}.html`
    a.click()
    URL.revokeObjectURL(url)
    toast('Report downloaded successfully!', 'success')
  }

  const challanCards = [
    {
      title: 'PF Challan',
      icon: Landmark,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      details: [
        { label: 'Employee Contribution', value: compliance.pfChallan.totalEmployeeContribution },
        { label: 'Employer Contribution', value: compliance.pfChallan.totalEmployerContribution },
        { label: 'Admin Charges', value: compliance.pfChallan.totalAdminCharges },
        { label: 'EDLI Charges', value: compliance.pfChallan.totalEDLICharges },
      ],
      total: compliance.pfChallan.totalAmount,
      dueDate: compliance.pfChallan.dueDate,
      status: compliance.pfChallan.status,
    },
    {
      title: 'ESI Challan',
      icon: Building2,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      details: [
        { label: 'Employee Contribution', value: compliance.esiChallan.totalEmployeeContribution },
        { label: 'Employer Contribution', value: compliance.esiChallan.totalEmployerContribution },
      ],
      total: compliance.esiChallan.totalAmount,
      dueDate: compliance.esiChallan.dueDate,
      status: compliance.esiChallan.status,
    },
    {
      title: 'Professional Tax',
      icon: Receipt,
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
      details: [],
      total: compliance.ptReturn.totalTax,
      dueDate: compliance.ptReturn.dueDate,
      status: compliance.ptReturn.status,
    },
    {
      title: 'TDS Return',
      icon: FileText,
      iconBg: 'bg-danger/10',
      iconColor: 'text-danger',
      details: [],
      total: compliance.tdsReturn.totalTDS,
      dueDate: compliance.tdsReturn.dueDate,
      status: compliance.tdsReturn.status as 'pending' | 'paid' | 'overdue' | 'filed',
    },
  ]

  const overallStatus = challanCards.some(c => c.status === 'overdue')
    ? 'overdue'
    : challanCards.every(c => c.status === 'paid' || c.status === 'filed')
    ? 'paid'
    : 'pending'

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm font-bold text-text-primary">Statutory Compliance</h1>
          <p className="mt-1 text-text-secondary">Manage PF, ESI, PT, and TDS compliance filings.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button onClick={handleGenerateReport}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </motion.div>

      {/* Month Filter & Status */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-text-secondary" />
          <Select
            options={monthOptions}
            value={String(selectedMonth)}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-full sm:w-48"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Overall Status:</span>
          <Badge variant={overallStatus === 'paid' ? 'success' : overallStatus === 'overdue' ? 'danger' : 'warning'}>
            {statusConfig[overallStatus].label}
          </Badge>
        </div>
      </motion.div>

      {/* Compliance Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {challanCards.map((card) => {
          const Icon = card.icon
          const statusInfo = statusConfig[card.status]
          const StatusIcon = statusInfo.icon
          return (
            <Card key={card.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                      <Icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-text-primary">{card.title}</h3>
                  </div>
                  <Badge variant={(card.status === 'paid' || card.status === 'filed') ? 'success' : card.status === 'overdue' ? 'danger' : 'warning'}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {statusInfo.label}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {card.details.map((detail) => (
                    <div key={detail.label} className="flex justify-between text-xs">
                      <span className="text-text-secondary">{detail.label}</span>
                      <span className="font-medium text-text-primary">{formatCurrency(detail.value)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-text-secondary">Total</span>
                    <span className="text-xs font-bold text-text-primary">{formatCurrency(card.total)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-text-secondary">Due Date</span>
                    <span className="text-xs font-medium text-text-primary">
                      {new Date(card.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Detailed Summary Table */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xs font-semibold text-text-primary mb-4">Compliance Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary">Type</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary">Amount</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary">Due Date</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-xs font-medium text-text-primary">PF Challan</td>
                    <td className="py-3 px-4 text-xs text-right font-medium text-text-primary">{formatCurrency(compliance.pfChallan.totalAmount)}</td>
                    <td className="py-3 px-4 text-xs text-right text-text-secondary">
                      {new Date(compliance.pfChallan.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={compliance.pfChallan.status === 'paid' ? 'success' : compliance.pfChallan.status === 'overdue' ? 'danger' : 'warning'}>
                        {statusConfig[compliance.pfChallan.status].label}
                      </Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-xs font-medium text-text-primary">ESI Challan</td>
                    <td className="py-3 px-4 text-xs text-right font-medium text-text-primary">{formatCurrency(compliance.esiChallan.totalAmount)}</td>
                    <td className="py-3 px-4 text-xs text-right text-text-secondary">
                      {new Date(compliance.esiChallan.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={compliance.esiChallan.status === 'paid' ? 'success' : compliance.esiChallan.status === 'overdue' ? 'danger' : 'warning'}>
                        {statusConfig[compliance.esiChallan.status].label}
                      </Badge>
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-xs font-medium text-text-primary">Professional Tax</td>
                    <td className="py-3 px-4 text-xs text-right font-medium text-text-primary">{formatCurrency(compliance.ptReturn.totalTax)}</td>
                    <td className="py-3 px-4 text-xs text-right text-text-secondary">
                      {new Date(compliance.ptReturn.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={compliance.ptReturn.status === 'paid' ? 'success' : compliance.ptReturn.status === 'overdue' ? 'danger' : 'warning'}>
                        {statusConfig[compliance.ptReturn.status].label}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-xs font-medium text-text-primary">TDS Return</td>
                    <td className="py-3 px-4 text-xs text-right font-medium text-text-primary">{formatCurrency(compliance.tdsReturn.totalTDS)}</td>
                    <td className="py-3 px-4 text-xs text-right text-text-secondary">
                      {new Date(compliance.tdsReturn.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={compliance.tdsReturn.status === 'filed' ? 'success' : compliance.tdsReturn.status === 'overdue' ? 'danger' : 'warning'}>
                        {statusConfig[compliance.tdsReturn.status].label}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-background">
                    <td className="py-3 px-4 text-xs font-semibold text-text-primary">Grand Total</td>
                    <td className="py-3 px-4 text-xs text-right font-bold text-primary">
                      {formatCurrency(
                        compliance.pfChallan.totalAmount +
                        compliance.esiChallan.totalAmount +
                        compliance.ptReturn.totalTax +
                        compliance.tdsReturn.totalTDS
                      )}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-text-primary">Compliance Actions</h3>
                  <p className="text-xs text-text-secondary">Generate reports and download compliance data</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => {
                  setSelectedMonth(new Date().getMonth() + 1)
                  toast('Refreshed compliance data', 'info')
                }}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download HTML
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
