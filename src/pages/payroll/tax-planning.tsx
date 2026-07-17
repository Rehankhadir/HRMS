import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { extendedPayrollStore } from '@/lib/payroll-extended'
import { useAuth } from '@/contexts/auth-context'
import { employees } from '@/data/mock'
import {
  ArrowLeft,
  TrendingUp,
  Calculator,
  Shield,
  Edit3,
  CheckCircle,
  Plus,
  X,
  Save,
  PieChart,
  ArrowRightLeft,
} from 'lucide-react'
import type { InvestmentDeclaration, TaxProjection } from '@/types'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export function TaxPlanning() {
  const { user } = useAuth()
  const { toast } = useToast()
  const employeeId = user?.employeeId || '1'

  const [regime, setRegime] = useState<'old' | 'new'>('new')
  const [declarations, setDeclarations] = useState<InvestmentDeclaration[]>(() =>
    extendedPayrollStore.getDeclarations(employeeId, '2025-26')
  )
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDeclaration, setNewDeclaration] = useState({
    section: '80C',
    sectionName: 'PPF, ELSS, LIC, NSC',
    declaredAmount: '',
  })

  const emp = employees.find((e) => e.id === employeeId)
  const empSalary = (JSON.parse(localStorage.getItem('hrms_employee_salaries') || '[]') as any[]).find(
    (s) => s.employeeId === employeeId
  )

  const annualIncome = empSalary?.grossSalary ? empSalary.grossSalary * 12 : 1500000

  const totalDeclared80C = declarations
    .filter((d) => d.section === '80C')
    .reduce((sum, d) => sum + d.declaredAmount, 0)

  const totalDeclared80D = declarations
    .filter((d) => d.section === '80D')
    .reduce((sum, d) => sum + d.declaredAmount, 0)

  const totalDeclared = declarations.reduce((sum, d) => sum + d.declaredAmount, 0)

  const oldRegimeProjection = useMemo(() => {
    const standardDeduction = 50000
    const taxableIncome = Math.max(0, annualIncome - standardDeduction - totalDeclared)
    const slabs = [
      { min: 0, max: 250000, rate: 0 },
      { min: 250001, max: 500000, rate: 5 },
      { min: 500001, max: 1000000, rate: 20 },
      { min: 1000001, max: Infinity, rate: 30 },
    ]
    let tax = 0
    let remaining = taxableIncome
    for (const slab of slabs) {
      if (remaining <= 0) break
      const slabIncome = Math.min(remaining, (slab.max === Infinity ? taxableIncome : slab.max) - slab.min + 1)
      tax += slabIncome * (slab.rate / 100)
      remaining -= slabIncome
    }
    const cess = tax * 0.04
    return {
      standardDeduction,
      taxableIncome,
      tax: Math.round(tax + cess),
      monthlyTDS: Math.round((tax + cess) / 12),
    }
  }, [annualIncome, totalDeclared])

  const newRegimeProjection = useMemo(() => {
    const standardDeduction = 75000
    const taxableIncome = Math.max(0, annualIncome - standardDeduction)
    const slabs = [
      { min: 0, max: 300000, rate: 0 },
      { min: 300001, max: 600000, rate: 5 },
      { min: 600001, max: 900000, rate: 10 },
      { min: 900001, max: 1200000, rate: 15 },
      { min: 1200001, max: 1500000, rate: 20 },
      { min: 1500001, max: Infinity, rate: 30 },
    ]
    let tax = 0
    let remaining = taxableIncome
    for (const slab of slabs) {
      if (remaining <= 0) break
      const slabIncome = Math.min(remaining, (slab.max === Infinity ? taxableIncome : slab.max) - slab.min + 1)
      tax += slabIncome * (slab.rate / 100)
      remaining -= slabIncome
    }
    const cess = tax * 0.04
    return {
      standardDeduction,
      taxableIncome,
      tax: Math.round(tax + cess),
      monthlyTDS: Math.round((tax + cess) / 12),
    }
  }, [annualIncome])

  const activeProjection = regime === 'old' ? oldRegimeProjection : newRegimeProjection
  const savingsVsOther = regime === 'old'
    ? newRegimeProjection.tax - oldRegimeProjection.tax
    : oldRegimeProjection.tax - newRegimeProjection.tax

  const refreshDeclarations = () => {
    setDeclarations(extendedPayrollStore.getDeclarations(employeeId, '2025-26'))
  }

  const handleSaveEdit = (id: string) => {
    const amount = Number(editAmount)
    if (isNaN(amount) || amount < 0) {
      toast('Please enter a valid amount', 'error')
      return
    }
    extendedPayrollStore.updateDeclaration(id, { declaredAmount: amount })
    refreshDeclarations()
    setEditingSection(null)
    toast('Declaration updated', 'success')
  }

  const handleAddDeclaration = () => {
    const amount = Number(newDeclaration.declaredAmount)
    if (isNaN(amount) || amount <= 0) {
      toast('Please enter a valid amount', 'error')
      return
    }
    extendedPayrollStore.addDeclaration({
      employeeId,
      financialYear: '2025-26',
      section: newDeclaration.section,
      sectionName: newDeclaration.sectionName,
      declaredAmount: amount,
      status: 'pending',
    })
    refreshDeclarations()
    setShowAddForm(false)
    setNewDeclaration({ section: '80C', sectionName: 'PPF, ELSS, LIC, NSC', declaredAmount: '' })
    toast('Declaration added', 'success')
  }

  const section80CProgress = Math.min((totalDeclared80C / 150000) * 100, 100)
  const section80DProgress = Math.min((totalDeclared80D / 25000) * 100, 100)

  const sectionDetails = [
    { section: '80C', name: 'PPF, ELSS, LIC, NSC, etc.', limit: 150000, declared: totalDeclared80C, color: '#2563EB' },
    { section: '80D', name: 'Health Insurance Premium', limit: 25000, declared: totalDeclared80D, color: '#22C55E' },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </motion.div>

      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm font-bold text-text-primary">Tax Planning</h1>
          <p className="mt-1 text-text-secondary">
            Plan your taxes, declare investments, and compare regimes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {emp && (
            <div className="text-right hidden sm:block">
              <p className="font-medium text-text-primary">{emp.firstName} {emp.lastName}</p>
              <p className="text-xs text-text-secondary">FY 2025-26</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tax Projection Summary */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-text-primary">Tax Projection</h2>
                    <p className="text-xs text-text-secondary">FY 2025-26</p>
                  </div>
                </div>

                {/* Regime Toggle */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setRegime('old')}
                    className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                      regime === 'old'
                        ? 'bg-primary text-white'
                        : 'bg-white text-text-secondary hover:bg-background'
                    }`}
                  >
                    Old Regime
                  </button>
                  <button
                    onClick={() => setRegime('new')}
                    className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                      regime === 'new'
                        ? 'bg-primary text-white'
                        : 'bg-white text-text-secondary hover:bg-background'
                    }`}
                  >
                    New Regime
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-text-secondary uppercase">Annual Income</p>
                    <p className="text-xs font-bold text-text-primary">{formatCurrency(annualIncome)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase">Standard Deduction</p>
                    <p className="text-xs font-bold text-text-primary">{formatCurrency(activeProjection.standardDeduction)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase">Taxable Income</p>
                    <p className="text-xs font-bold text-text-primary">{formatCurrency(activeProjection.taxableIncome)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase">Projected Tax</p>
                    <p className="text-xs font-bold text-danger">{formatCurrency(activeProjection.tax)}</p>
                  </div>
                </div>
              </div>

              {/* Monthly TDS Highlight */}
              <div className="flex-shrink-0 rounded-xl bg-white p-5 shadow-sm text-center min-w-[180px]">
                <p className="text-xs text-text-secondary uppercase mb-1">Monthly TDS</p>
                <p className="text-sm font-bold text-primary">{formatCurrency(activeProjection.monthlyTDS)}</p>
                <p className="text-xs text-text-secondary mt-1">per month</p>
                {savingsVsOther > 0 && (
                  <div className="mt-3 rounded-lg bg-success-50 px-3 py-1.5">
                    <p className="text-xs font-medium text-success">
                      Save {formatCurrency(savingsVsOther)} vs {regime === 'old' ? 'New' : 'Old'} regime
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Old vs New Regime Comparison */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <ArrowRightLeft className="h-5 w-5 text-text-secondary" />
              <h2 className="text-xs font-semibold text-text-primary">Regime Comparison</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Old Regime */}
              <div className={`rounded-xl border-2 p-5 transition-colors ${regime === 'old' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-text-primary">Old Regime</h3>
                  {regime === 'old' && <Badge variant="default">Selected</Badge>}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Standard Deduction</span>
                    <span className="font-medium">{formatCurrency(oldRegimeProjection.standardDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Investments Deducted</span>
                    <span className="font-medium">{formatCurrency(totalDeclared)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Taxable Income</span>
                    <span className="font-medium">{formatCurrency(oldRegimeProjection.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-semibold text-text-primary">Total Tax (incl. 4% cess)</span>
                    <span className="font-bold text-danger">{formatCurrency(oldRegimeProjection.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Monthly TDS</span>
                    <span className="font-medium text-primary">{formatCurrency(oldRegimeProjection.monthlyTDS)}</span>
                  </div>
                </div>
                <Button
                  variant={regime === 'old' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => setRegime('old')}
                >
                  {regime === 'old' ? 'Active' : 'Select Old Regime'}
                </Button>
              </div>

              {/* New Regime */}
              <div className={`rounded-xl border-2 p-5 transition-colors ${regime === 'new' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-text-primary">New Regime</h3>
                  {regime === 'new' && <Badge variant="default">Selected</Badge>}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Standard Deduction</span>
                    <span className="font-medium">{formatCurrency(newRegimeProjection.standardDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Investments Deducted</span>
                    <span className="font-medium text-text-secondary">N/A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Taxable Income</span>
                    <span className="font-medium">{formatCurrency(newRegimeProjection.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-semibold text-text-primary">Total Tax (incl. 4% cess)</span>
                    <span className="font-bold text-danger">{formatCurrency(newRegimeProjection.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Monthly TDS</span>
                    <span className="font-medium text-primary">{formatCurrency(newRegimeProjection.monthlyTDS)}</span>
                  </div>
                </div>
                <Button
                  variant={regime === 'new' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => setRegime('new')}
                >
                  {regime === 'new' ? 'Active' : 'Select New Regime'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section-wise Deductions */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-text-secondary" />
                <h2 className="text-xs font-semibold text-text-primary">Investment Declarations</h2>
              </div>
              <Button size="sm" onClick={() => setShowAddForm(true)}>
                <Plus className="mr-1 h-3 w-3" />
                Add Declaration
              </Button>
            </div>

            {/* Progress Bars */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
              {sectionDetails.map((sec) => {
                const progress = Math.min((sec.declared / sec.limit) * 100, 100)
                return (
                  <div key={sec.section}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs font-semibold text-text-primary">Section {sec.section}</p>
                        <p className="text-xs text-text-secondary">{sec.name}</p>
                      </div>
                      <p className="text-xs font-medium text-text-primary">
                        {formatCurrency(sec.declared)} / {formatCurrency(sec.limit)}
                      </p>
                    </div>
                    <div className="h-3 w-full rounded-full bg-background">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-3 rounded-full"
                        style={{ backgroundColor: progress >= 100 ? '#22C55E' : sec.color }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-text-secondary">{progress.toFixed(0)}% utilized</span>
                      {progress >= 100 ? (
                        <span className="text-xs font-medium text-success">Max limit reached</span>
                      ) : (
                        <span className="text-xs text-text-secondary">
                          {formatCurrency(sec.limit - sec.declared)} remaining
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Declarations Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-text-secondary">Section</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-text-secondary">Name</th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase text-text-secondary">Declared</th>
                    <th className="px-3 py-2 text-center text-xs font-medium uppercase text-text-secondary">Status</th>
                    <th className="px-3 py-2 text-center text-xs font-medium uppercase text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {declarations.length > 0 ? (
                    declarations.map((decl) => (
                      <tr key={decl.id} className="border-b border-border hover:bg-background/50">
                        <td className="px-3 py-3 text-xs font-medium text-text-primary">{decl.section}</td>
                        <td className="px-3 py-3 text-xs text-text-secondary">{decl.sectionName}</td>
                        <td className="px-3 py-3 text-right">
                          {editingSection === decl.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <input
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                className="w-28 rounded-lg border border-border px-2 py-1 text-xs text-right focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleSaveEdit(decl.id)}>
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingSection(null)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-text-primary">{formatCurrency(decl.declaredAmount)}</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Badge variant={decl.status === 'approved' ? 'success' : decl.status === 'pending' ? 'warning' : 'danger'}>
                            {decl.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {editingSection !== decl.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                setEditingSection(decl.id)
                                setEditAmount(String(decl.declaredAmount))
                              }}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-text-secondary">
                        No declarations yet. Click "Add Declaration" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 80D Summary Card */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-success" />
              <h2 className="text-xs font-semibold text-text-primary">Section 80D - Health Insurance</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs text-text-secondary uppercase">Self & Family</p>
                <p className="text-sm font-bold text-text-primary mt-1">{formatCurrency(Math.min(totalDeclared80D, 25000))}</p>
                <p className="text-xs text-text-secondary">Limit: ₹25,000</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs text-text-secondary uppercase">Parents</p>
                <p className="text-sm font-bold text-text-primary mt-1">{formatCurrency(0)}</p>
                <p className="text-xs text-text-secondary">Limit: ₹25,000</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-xs text-text-secondary uppercase">Total Declared</p>
                <p className="text-sm font-bold text-success mt-1">{formatCurrency(totalDeclared80D)}</p>
                <p className="text-xs text-text-secondary">Combined limit: ₹50,000</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-text-secondary mb-1">
                <span>80D Utilization</span>
                <span>{section80DProgress.toFixed(0)}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-background">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${section80DProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-2.5 rounded-full bg-success"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Info */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary">Tax Saving Tips</h3>
                <p className="text-xs text-text-secondary mt-1">
                  {regime === 'old'
                    ? 'Under the old regime, you can claim deductions under 80C, 80D, HRA, LTA and other sections. Maximize your 80C limit of ₹1,50,000 to reduce tax liability.'
                    : 'The new regime offers lower tax rates but no deductions. Compare both regimes to find the best option for you.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Declaration Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="text-xs font-semibold text-text-primary">Add Declaration</h2>
              <button onClick={() => setShowAddForm(false)} className="rounded-lg p-1 hover:bg-background">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Section *</label>
                <select
                  value={newDeclaration.section}
                  onChange={(e) => {
                    const val = e.target.value
                    const names: Record<string, string> = {
                      '80C': 'PPF, ELSS, LIC, NSC',
                      '80D': 'Health Insurance',
                      '80E': 'Education Loan Interest',
                      '80G': 'Donations',
                    }
                    setNewDeclaration({ ...newDeclaration, section: val, sectionName: names[val] || val })
                  }}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="80C">Section 80C</option>
                  <option value="80D">Section 80D</option>
                  <option value="80E">Section 80E</option>
                  <option value="80G">Section 80G</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  value={newDeclaration.declaredAmount}
                  onChange={(e) => setNewDeclaration({ ...newDeclaration, declaredAmount: e.target.value })}
                  placeholder="0"
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="rounded-xl bg-background p-3">
                <p className="text-xs text-text-secondary">
                  {newDeclaration.section === '80C' && `Maximum limit: ₹1,50,000. Current declared: ${formatCurrency(totalDeclared80C)}`}
                  {newDeclaration.section === '80D' && `Maximum limit: ₹25,000. Current declared: ${formatCurrency(totalDeclared80D)}`}
                  {newDeclaration.section === '80E' && 'No upper limit on interest paid on education loan.'}
                  {newDeclaration.section === '80G' && 'Donations eligible for 50% or 100% deduction.'}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-border p-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button onClick={handleAddDeclaration}>Add Declaration</Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
