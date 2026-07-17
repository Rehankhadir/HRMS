import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'
import { payrollStore } from '@/lib/payroll-store'
import { employees } from '@/data/mock'
import { useToast } from '@/components/ui/toast'
import {
  ArrowLeft,
  Plus,
  Edit,
  Upload,
  Download,
  Calculator,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

interface SalaryFormData {
  employeeId: string
  structureId: string
  ctc: number
  components: {
    name: string
    type: 'earning' | 'deduction'
    value: number
    isPercentage: boolean
    calculatedValue: number
  }[]
}

export function SalaryAssignment() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null)
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)

  const structures = payrollStore.getStructures()
  const employeeSalaries = payrollStore.getEmployeeSalaries()

  const [formData, setFormData] = useState<SalaryFormData>({
    employeeId: '',
    structureId: structures[0]?.id || '',
    ctc: 0,
    components: [],
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get employees with their salary info
  const employeesWithSalary = useMemo(() => {
    return employees.map(emp => {
      const salary = employeeSalaries.find(es => es.employeeId === emp.id)
      const structure = salary ? structures.find(s => s.id === salary.structureId) : null
      return {
        ...emp,
        salary,
        structure,
        hasSalary: !!salary,
      }
    })
  }, [employeeSalaries, structures])

  // Filter employees
  const filteredEmployees = employeesWithSalary.filter(emp => {
    const matchesSearch = 
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'assigned' && emp.hasSalary) ||
      (filterStatus === 'unassigned' && !emp.hasSalary)
    
    return matchesSearch && matchesFilter
  })

  const assignedCount = employeesWithSalary.filter(e => e.hasSalary).length
  const unassignedCount = employeesWithSalary.filter(e => !e.hasSalary).length
  const totalGross = employeeSalaries.reduce((sum, es) => sum + es.grossSalary, 0)

  // Calculate components from CTC based on structure
  const calculateComponents = (ctc: number, structureId: string) => {
    const structure = structures.find(s => s.id === structureId)
    if (!structure) return []

    return structure.components.map(comp => {
      let calculatedValue = 0
      if (comp.isPercentage) {
        calculatedValue = Math.round(ctc * (comp.value / 100))
        // Apply limits
        if (comp.maxLimit && calculatedValue > comp.maxLimit) {
          calculatedValue = comp.maxLimit
        }
      } else {
        calculatedValue = comp.value
      }
      return {
        name: comp.name,
        type: comp.type,
        value: comp.value,
        isPercentage: comp.isPercentage,
        calculatedValue,
      }
    })
  }

  // Handle CTC change
  const handleCtcChange = (ctc: number) => {
    const components = calculateComponents(ctc, formData.structureId)
    const earnings = components.filter(c => c.type === 'earning').reduce((sum, c) => sum + c.calculatedValue, 0)
    const deductions = components.filter(c => c.type === 'deduction').reduce((sum, c) => sum + c.calculatedValue, 0)
    
    setFormData(prev => ({
      ...prev,
      ctc,
      components,
    }))
  }

  // Handle structure change
  const handleStructureChange = (structureId: string) => {
    const components = calculateComponents(formData.ctc, structureId)
    setFormData(prev => ({
      ...prev,
      structureId,
      components,
    }))
  }

  // Open assign modal
  const handleAssign = (employeeId?: string) => {
    if (employeeId) {
      const emp = employeesWithSalary.find(e => e.id === employeeId)
      if (emp?.salary) {
        setFormData({
          employeeId,
          structureId: emp.salary.structureId,
          ctc: emp.salary.grossSalary,
          components: emp.salary.components.map(c => ({
            name: structures.find(s => s.id === emp.salary!.structureId)?.components.find(sc => sc.id === c.componentId)?.name || '',
            type: structures.find(s => s.id === emp.salary!.structureId)?.components.find(sc => sc.id === c.componentId)?.type || 'earning',
            value: c.value,
            isPercentage: structures.find(s => s.id === emp.salary!.structureId)?.components.find(sc => sc.id === c.componentId)?.isPercentage || false,
            calculatedValue: c.calculatedValue,
          })),
        })
        setEditingEmployee(employeeId)
      } else {
        setFormData({
          employeeId,
          structureId: structures[0]?.id || '',
          ctc: 0,
          components: [],
        })
        setEditingEmployee(null)
      }
    } else {
      setFormData({
        employeeId: '',
        structureId: structures[0]?.id || '',
        ctc: 0,
        components: [],
      })
      setEditingEmployee(null)
    }
    setShowAssignModal(true)
  }

  // Save salary assignment
  const handleSave = () => {
    if (!formData.employeeId || !formData.structureId || formData.ctc === 0) {
      toast('Please fill in all required fields', 'error')
      return
    }

    const earnings = formData.components.filter(c => c.type === 'earning').reduce((sum, c) => sum + c.calculatedValue, 0)
    const deductions = formData.components.filter(c => c.type === 'deduction').reduce((sum, c) => sum + c.calculatedValue, 0)
    const net = earnings - deductions

    payrollStore.updateEmployeeSalary(formData.employeeId, {
      structureId: formData.structureId,
      basicSalary: formData.components.find(c => c.name.toLowerCase().includes('basic'))?.calculatedValue || earnings * 0.5,
      grossSalary: earnings,
      netSalary: net,
      effectiveFrom: new Date().toISOString().split('T')[0],
      components: formData.components.map((c, i) => ({
        componentId: `c${i + 1}`,
        value: c.value,
        calculatedValue: c.calculatedValue,
      })),
    })

    setShowAssignModal(false)
    toast(editingEmployee ? 'Salary updated!' : 'Salary assigned!', 'success')
  }

  // Bulk upload handler
  const handleBulkUpload = (csvContent: string) => {
    const lines = csvContent.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    let successCount = 0
    let errorCount = 0

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const email = values[headers.indexOf('email')]
      const ctc = Number(values[headers.indexOf('ctc')])
      const structureName = values[headers.indexOf('structure')]

      const emp = employees.find(e => e.email.toLowerCase() === email?.toLowerCase())
      const structure = structures.find(s => s.name.toLowerCase() === structureName?.toLowerCase())

      if (emp && structure && ctc > 0) {
        const components = calculateComponents(ctc, structure.id)
        const earnings = components.filter(c => c.type === 'earning').reduce((sum, c) => sum + c.calculatedValue, 0)
        const deductions = components.filter(c => c.type === 'deduction').reduce((sum, c) => sum + c.calculatedValue, 0)

        payrollStore.updateEmployeeSalary(emp.id, {
          structureId: structure.id,
          basicSalary: components.find(c => c.name.toLowerCase().includes('basic'))?.calculatedValue || earnings * 0.5,
          grossSalary: earnings,
          netSalary: earnings - deductions,
          effectiveFrom: new Date().toISOString().split('T')[0],
          components: components.map((c, j) => ({
            componentId: `c${j + 1}`,
            value: c.value,
            calculatedValue: c.calculatedValue,
          })),
        })
        successCount++
      } else {
        errorCount++
      }
    }

    setShowBulkModal(false)
    toast(`Bulk upload: ${successCount} success, ${errorCount} failed`, successCount > 0 ? 'success' : 'error')
  }

  // Export salary data
  const handleExport = () => {
    const headers = ['Employee', 'Email', 'Department', 'Structure', 'CTC', 'Gross', 'Net', 'Effective From']
    const rows = employeesWithSalary
      .filter(e => e.hasSalary)
      .map(e => [
        `${e.firstName} ${e.lastName}`,
        e.email,
        e.department,
        e.structure?.name || '',
        e.salary?.grossSalary || 0,
        e.salary?.grossSalary || 0,
        e.salary?.netSalary || 0,
        e.salary?.effectiveFrom || '',
      ])
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'salary-data.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast('Salary data exported!', 'success')
  }

  const earnings = formData.components.filter(c => c.type === 'earning').reduce((sum, c) => sum + c.calculatedValue, 0)
  const deductions = formData.components.filter(c => c.type === 'deduction').reduce((sum, c) => sum + c.calculatedValue, 0)

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Back Button */}
      <motion.div variants={item}>
        <Button variant="ghost" onClick={() => navigate('/payroll')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Payroll
        </Button>
      </motion.div>

      {/* Page Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm font-bold text-text-primary">Salary Assignment</h1>
          <p className="mt-1 text-text-secondary">Assign and manage employee salary structures.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowBulkModal(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button onClick={() => handleAssign()}>
            <Plus className="mr-2 h-4 w-4" />
            Assign Salary
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Employees</p>
                <p className="text-sm font-bold text-text-primary">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Assigned</p>
                <p className="text-sm font-bold text-success">{assignedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Unassigned</p>
                <p className="text-sm font-bold text-warning">{unassignedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/5 to-info/10 border-info/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Payroll</p>
                <p className="text-sm font-bold text-text-primary">{formatCurrency(totalGross)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 pl-10 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'assigned', label: 'Assigned' },
            { value: 'unassigned', label: 'Unassigned' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilterStatus(option.value)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                filterStatus === option.value
                  ? 'bg-primary text-white'
                  : 'bg-background text-text-secondary hover:bg-border/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Employee List */}
      <motion.div variants={item}>
        <Card>
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
                      Structure
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                      CTC
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                      Net Pay
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider text-text-secondary">
                      Status
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
                        {emp.structure ? (
                          <Badge variant="success">{emp.structure.name}</Badge>
                        ) : (
                          <Badge variant="secondary">Not Assigned</Badge>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <span className="text-xs font-medium text-text-primary">
                          {emp.salary ? formatCurrency(emp.salary.grossSalary) : '—'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <span className="text-xs font-medium text-success">
                          {emp.salary ? formatCurrency(emp.salary.netSalary) : '—'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        {emp.hasSalary ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAssign(emp.id)}
                        >
                          {emp.hasSalary ? (
                            <>
                              <Edit className="mr-1 h-4 w-4" />
                              Edit
                            </>
                          ) : (
                            <>
                              <Plus className="mr-1 h-4 w-4" />
                              Assign
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Assign/Edit Salary Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl my-8 rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-text-primary">
                {editingEmployee ? 'Edit Salary' : 'Assign Salary'}
              </h2>
              <button onClick={() => setShowAssignModal(false)} className="p-1 hover:bg-background rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Employee Selection */}
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select
                  options={employees.map(e => ({
                    value: e.id,
                    label: `${e.firstName} ${e.lastName} (${e.email})`,
                  }))}
                  value={formData.employeeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                  placeholder="Select employee"
                  disabled={!!editingEmployee}
                />
              </div>

              {/* Structure Selection */}
              <div className="space-y-2">
                <Label>Salary Structure</Label>
                <Select
                  options={structures.map(s => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  value={formData.structureId}
                  onChange={(e) => handleStructureChange(e.target.value)}
                  placeholder="Select structure"
                />
              </div>

              {/* CTC Input */}
              <div className="space-y-2">
                <Label>CTC (Cost to Company) per annum</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                  <Input
                    type="number"
                    value={formData.ctc || ''}
                    onChange={(e) => handleCtcChange(Number(e.target.value))}
                    placeholder="Enter annual CTC"
                    className="pl-10 text-xs font-medium"
                  />
                </div>
                {formData.ctc > 0 && (
                  <p className="text-xs text-text-secondary">
                    Monthly: {formatCurrency(Math.round(formData.ctc / 12))}
                  </p>
                )}
              </div>

              {/* Salary Breakdown */}
              {formData.components.length > 0 && (
                <div className="rounded-xl border border-border p-4">
                  <h3 className="mb-4 font-medium text-text-primary flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Salary Breakdown
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Earnings */}
                    <div>
                      <h4 className="mb-3 text-xs font-medium text-success flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-success" />
                        Earnings
                      </h4>
                      <div className="space-y-2">
                        {formData.components.filter(c => c.type === 'earning').map((comp, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg bg-success-50 p-3">
                            <div>
                              <p className="text-xs font-medium text-text-primary">{comp.name}</p>
                              <p className="text-xs text-text-secondary">
                                {comp.isPercentage ? `${comp.value}% of CTC` : `Fixed: ${formatCurrency(comp.value)}`}
                              </p>
                            </div>
                            <span className="text-xs font-semibold text-success">
                              {formatCurrency(comp.calculatedValue)}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between rounded-lg bg-success p-3 text-white">
                          <span className="font-medium">Total Earnings</span>
                          <span className="font-bold">{formatCurrency(earnings)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Deductions */}
                    <div>
                      <h4 className="mb-3 text-xs font-medium text-danger flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-danger" />
                        Deductions
                      </h4>
                      <div className="space-y-2">
                        {formData.components.filter(c => c.type === 'deduction').map((comp, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg bg-danger-50 p-3">
                            <div>
                              <p className="text-xs font-medium text-text-primary">{comp.name}</p>
                              <p className="text-xs text-text-secondary">
                                {comp.isPercentage ? `${comp.value}% of CTC` : `Fixed: ${formatCurrency(comp.value)}`}
                              </p>
                            </div>
                            <span className="text-xs font-semibold text-danger">
                              {formatCurrency(comp.calculatedValue)}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between rounded-lg bg-danger p-3 text-white">
                          <span className="font-medium">Total Deductions</span>
                          <span className="font-bold">{formatCurrency(deductions)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay */}
                  <div className="mt-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs opacity-90">Net Pay (Annual)</p>
                        <p className="text-sm font-bold">{formatCurrency(earnings - deductions)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-90">Monthly Take Home</p>
                        <p className="text-sm font-bold">{formatCurrency(Math.round((earnings - deductions) / 12))}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowAssignModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={!formData.employeeId || formData.ctc === 0}>
                {editingEmployee ? 'Update Salary' : 'Assign Salary'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-text-primary">Bulk Salary Upload</h2>
              <button onClick={() => setShowBulkModal(false)} className="p-1 hover:bg-background rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
                <FileSpreadsheet className="mx-auto h-10 w-10 text-text-secondary" />
                <h3 className="mt-3 font-medium text-text-primary">Upload CSV File</h3>
                <p className="mt-1 text-xs text-text-secondary">
                  CSV should have columns: email, ctc, structure
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <label>
                    Choose File
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            const content = event.target?.result as string
                            handleBulkUpload(content)
                          }
                          reader.readAsText(file)
                        }
                      }}
                    />
                  </label>
                </Button>
              </div>

              <div className="rounded-xl bg-background p-4">
                <h4 className="font-medium text-text-primary mb-2">CSV Format Example:</h4>
                <code className="text-xs text-text-secondary">
                  email,ctc,structure<br />
                  john@acme.com,1200000,Standard Structure<br />
                  jane@acme.com,1500000,Senior Management
                </code>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowBulkModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
