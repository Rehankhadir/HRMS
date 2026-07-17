import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { payrollStore } from '@/lib/payroll-store'
import { useToast } from '@/components/ui/toast'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  ToggleLeft,
  ToggleRight,
  Calculator,
  DollarSign,
  Percent,
  Info,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export function SalarySettings() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [structures, setStructures] = useState(payrollStore.getStructures())
  const [settings, setSettings] = useState(payrollStore.getSettings())
  const [showStructureModal, setShowStructureModal] = useState(false)
  const [editingStructure, setEditingStructure] = useState<any>(null)
  const [showTaxModal, setShowTaxModal] = useState(false)
  const [activeTab, setActiveTab] = useState('structures')

  const [structureForm, setStructureForm] = useState({
    name: '',
    components: [] as any[],
  })

  const [taxForm, setTaxForm] = useState({
    regime: settings.tdsSettings.regime,
    standardDeduction: settings.tdsSettings.standardDeduction,
    cessRate: settings.tdsSettings.cessRate,
  })

  const handleAddStructure = () => {
    setEditingStructure(null)
    setStructureForm({
      name: '',
      components: [
        { id: '1', name: 'Basic Salary', type: 'earning', value: 50, isPercentage: true, description: '40-50% of CTC' },
        { id: '2', name: 'HRA', type: 'earning', value: 20, isPercentage: true, description: 'House Rent Allowance' },
        { id: '3', name: 'Special Allowance', type: 'earning', value: 15, isPercentage: true, description: 'Special Allowance' },
        { id: '4', name: 'PF Employee', type: 'deduction', value: 12, isPercentage: true, maxLimit: 1800, description: 'Provident Fund' },
        { id: '5', name: 'ESI Employee', type: 'deduction', value: 0.75, isPercentage: true, maxLimit: 157.5, description: 'Employee State Insurance' },
        { id: '6', name: 'Professional Tax', type: 'deduction', value: 200, isPercentage: false, description: 'State Professional Tax' },
      ],
    })
    setShowStructureModal(true)
  }

  const handleEditStructure = (structure: any) => {
    setEditingStructure(structure)
    setStructureForm({
      name: structure.name,
      components: [...structure.components],
    })
    setShowStructureModal(true)
  }

  const handleDeleteStructure = (id: string) => {
    payrollStore.deleteStructure(id)
    setStructures(payrollStore.getStructures())
    toast('Structure deleted!', 'error')
  }

  const handleSaveStructure = () => {
    if (!structureForm.name) {
      toast('Please enter a structure name', 'error')
      return
    }

    if (editingStructure) {
      payrollStore.updateStructure(editingStructure.id, {
        name: structureForm.name,
        components: structureForm.components,
      })
    } else {
      payrollStore.addStructure({
        name: structureForm.name,
        components: structureForm.components,
      })
    }

    setStructures(payrollStore.getStructures())
    setShowStructureModal(false)
    toast(editingStructure ? 'Structure updated!' : 'Structure created!', 'success')
  }

  const handleAddComponent = (type: 'earning' | 'deduction') => {
    const newComponent = {
      id: String(Date.now()),
      name: '',
      type,
      value: 0,
      isPercentage: false,
      description: '',
    }
    setStructureForm(prev => ({
      ...prev,
      components: [...prev.components, newComponent],
    }))
  }

  const handleUpdateComponent = (id: string, updates: any) => {
    setStructureForm(prev => ({
      ...prev,
      components: prev.components.map(c => c.id === id ? { ...c, ...updates } : c),
    }))
  }

  const handleRemoveComponent = (id: string) => {
    setStructureForm(prev => ({
      ...prev,
      components: prev.components.filter(c => c.id !== id),
    }))
  }

  const handleSaveTaxSettings = () => {
    payrollStore.updateSettings({
      tdsSettings: {
        ...settings.tdsSettings,
        regime: taxForm.regime,
        standardDeduction: taxForm.standardDeduction,
        cessRate: taxForm.cessRate,
      },
    })
    setSettings(payrollStore.getSettings())
    setShowTaxModal(false)
    toast('Tax settings updated!', 'success')
  }

  const handleTogglePF = () => {
    const newEnabled = !settings.gratuityEnabled
    payrollStore.updateSettings({ gratuityEnabled: newEnabled })
    setSettings(payrollStore.getSettings())
    toast(`Gratuity ${newEnabled ? 'enabled' : 'disabled'}!`, 'success')
  }

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
          <h1 className="text-sm font-bold text-text-primary">Payroll Settings</h1>
          <p className="mt-1 text-text-secondary">Configure salary structures, tax rules, and deductions.</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <div className="flex gap-1 rounded-xl bg-background p-1">
          {[
            { id: 'structures', label: 'Salary Structures' },
            { id: 'deductions', label: 'Deductions & Tax' },
            { id: 'general', label: 'General' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Salary Structures */}
      {activeTab === 'structures' && (
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Salary Structures</CardTitle>
              <Button onClick={handleAddStructure}>
                <Plus className="mr-2 h-4 w-4" />
                Add Structure
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {structures.map((structure) => (
                  <div key={structure.id} className="rounded-xl border border-border p-4 sm:p-6 hover:shadow-sm transition-shadow">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                            <Calculator className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-text-primary">{structure.name}</h3>
                            <p className="text-xs text-text-secondary">{structure.components.length} components</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {structure.components.filter(c => c.type === 'earning').map((c) => (
                            <Badge key={c.id} variant="success" className="text-xs">
                              {c.name}: {c.isPercentage ? `${c.value}%` : `₹${c.value}`}
                            </Badge>
                          ))}
                          {structure.components.filter(c => c.type === 'deduction').map((c) => (
                            <Badge key={c.id} variant="danger" className="text-xs">
                              {c.name}: {c.isPercentage ? `${c.value}%` : `₹${c.value}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditStructure(structure)}>
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-danger" onClick={() => handleDeleteStructure(structure.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Deductions & Tax */}
      {activeTab === 'deductions' && (
        <motion.div variants={item} className="space-y-6">
          {/* PF Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Provident Fund (PF)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Employee Contribution</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={settings.pfContribution.employeeRate}
                      onChange={(e) => {
                        const newRate = Number(e.target.value)
                        payrollStore.updateSettings({
                          pfContribution: { ...settings.pfContribution, employeeRate: newRate },
                        })
                        setSettings(payrollStore.getSettings())
                      }}
                      className="flex-1"
                    />
                    <Percent className="h-4 w-4 text-text-secondary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Employer Contribution</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={settings.pfContribution.employerRate}
                      onChange={(e) => {
                        const newRate = Number(e.target.value)
                        payrollStore.updateSettings({
                          pfContribution: { ...settings.pfContribution, employerRate: newRate },
                        })
                        setSettings(payrollStore.getSettings())
                      }}
                      className="flex-1"
                    />
                    <Percent className="h-4 w-4 text-text-secondary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Max Pensionable Salary (₹)</Label>
                  <Input
                    type="number"
                    value={settings.pfContribution.maxPensionableSalary}
                    onChange={(e) => {
                      payrollStore.updateSettings({
                        pfContribution: { ...settings.pfContribution, maxPensionableSalary: Number(e.target.value) },
                      })
                      setSettings(payrollStore.getSettings())
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Employee Max Limit (₹)</Label>
                  <Input
                    type="number"
                    value={settings.pfContribution.employeeContribution}
                    onChange={(e) => {
                      payrollStore.updateSettings({
                        pfContribution: { ...settings.pfContribution, employeeContribution: Number(e.target.value) },
                      })
                      setSettings(payrollStore.getSettings())
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ESIC Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-warning" />
                Employee State Insurance (ESIC)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Employee Rate</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.esicContribution.employeeRate}
                      onChange={(e) => {
                        payrollStore.updateSettings({
                          esicContribution: { ...settings.esicContribution, employeeRate: Number(e.target.value) },
                        })
                        setSettings(payrollStore.getSettings())
                      }}
                      className="flex-1"
                    />
                    <Percent className="h-4 w-4 text-text-secondary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Employer Rate</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.esicContribution.employerRate}
                      onChange={(e) => {
                        payrollStore.updateSettings({
                          esicContribution: { ...settings.esicContribution, employerRate: Number(e.target.value) },
                        })
                        setSettings(payrollStore.getSettings())
                      }}
                      className="flex-1"
                    />
                    <Percent className="h-4 w-4 text-text-secondary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Max ESI Salary (₹)</Label>
                  <Input
                    type="number"
                    value={settings.esicContribution.maxEsiSalary}
                    onChange={(e) => {
                      payrollStore.updateSettings({
                        esicContribution: { ...settings.esicContribution, maxEsiSalary: Number(e.target.value) },
                      })
                      setSettings(payrollStore.getSettings())
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TDS Settings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-danger" />
                TDS / Income Tax
              </CardTitle>
              <Button variant="outline" onClick={() => setShowTaxModal(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Tax Settings
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-background p-4">
                  <p className="text-xs text-text-secondary">Tax Regime</p>
                  <p className="mt-1 text-xs font-semibold text-text-primary capitalize">{settings.tdsSettings.regime}</p>
                </div>
                <div className="rounded-xl bg-background p-4">
                  <p className="text-xs text-text-secondary">Standard Deduction</p>
                  <p className="mt-1 text-xs font-semibold text-text-primary">₹{settings.tdsSettings.standardDeduction.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-background p-4">
                  <p className="text-xs text-text-secondary">Cess Rate</p>
                  <p className="mt-1 text-xs font-semibold text-text-primary">{settings.tdsSettings.cessRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* General */}
      {activeTab === 'general' && (
        <motion.div variants={item} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-xl border border-border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Gratuity</p>
                    <p className="text-xs text-text-secondary">Enable gratuity calculation for employees</p>
                  </div>
                </div>
                <button onClick={handleTogglePF}>
                  {settings.gratuityEnabled ? (
                    <ToggleRight className="h-8 w-8 text-primary" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-text-secondary" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Gratuity Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.gratuityRate}
                    onChange={(e) => {
                      payrollStore.updateSettings({ gratuityRate: Number(e.target.value) })
                      setSettings(payrollStore.getSettings())
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Overtime Rate (x)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.overtimeRate}
                    onChange={(e) => {
                      payrollStore.updateSettings({ overtimeRate: Number(e.target.value) })
                      setSettings(payrollStore.getSettings())
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => toast('Settings saved!', 'success')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Structure Modal */}
      {showStructureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-text-primary">
                {editingStructure ? 'Edit Structure' : 'Add Structure'}
              </h2>
              <button onClick={() => setShowStructureModal(false)} className="p-1 hover:bg-background rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Structure Name</Label>
                <Input
                  value={structureForm.name}
                  onChange={(e) => setStructureForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Standard Structure"
                />
              </div>

              {/* Earnings */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-success">Earnings</h3>
                  <Button variant="outline" size="sm" onClick={() => handleAddComponent('earning')}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {structureForm.components.filter(c => c.type === 'earning').map((comp) => (
                    <div key={comp.id} className="flex items-center gap-2 rounded-xl border border-border p-3">
                      <Input
                        value={comp.name}
                        onChange={(e) => handleUpdateComponent(comp.id, { name: e.target.value })}
                        placeholder="Component name"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={comp.value}
                        onChange={(e) => handleUpdateComponent(comp.id, { value: Number(e.target.value) })}
                        className="w-24"
                      />
                      <button
                        onClick={() => handleUpdateComponent(comp.id, { isPercentage: !comp.isPercentage })}
                        className="px-2 py-1 text-xs rounded bg-background"
                      >
                        {comp.isPercentage ? '%' : '₹'}
                      </button>
                      <button onClick={() => handleRemoveComponent(comp.id)} className="text-danger">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-danger">Deductions</h3>
                  <Button variant="outline" size="sm" onClick={() => handleAddComponent('deduction')}>
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {structureForm.components.filter(c => c.type === 'deduction').map((comp) => (
                    <div key={comp.id} className="flex items-center gap-2 rounded-xl border border-border p-3">
                      <Input
                        value={comp.name}
                        onChange={(e) => handleUpdateComponent(comp.id, { name: e.target.value })}
                        placeholder="Component name"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={comp.value}
                        onChange={(e) => handleUpdateComponent(comp.id, { value: Number(e.target.value) })}
                        className="w-24"
                      />
                      <button
                        onClick={() => handleUpdateComponent(comp.id, { isPercentage: !comp.isPercentage })}
                        className="px-2 py-1 text-xs rounded bg-background"
                      >
                        {comp.isPercentage ? '%' : '₹'}
                      </button>
                      <button onClick={() => handleRemoveComponent(comp.id)} className="text-danger">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowStructureModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveStructure}>
                {editingStructure ? 'Update' : 'Create'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tax Modal */}
      {showTaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-text-primary">Tax Settings</h2>
              <button onClick={() => setShowTaxModal(false)} className="p-1 hover:bg-background rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tax Regime</Label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTaxForm(prev => ({ ...prev, regime: 'old' as const }))}
                    className={`flex-1 rounded-xl border-2 p-3 text-center transition-colors ${
                      taxForm.regime === 'old' ? 'border-primary bg-primary-50' : 'border-border'
                    }`}
                  >
                    <p className="font-medium">Old Regime</p>
                    <p className="text-xs text-text-secondary">With exemptions</p>
                  </button>
                  <button
                    onClick={() => setTaxForm(prev => ({ ...prev, regime: 'new' as const }))}
                    className={`flex-1 rounded-xl border-2 p-3 text-center transition-colors ${
                      taxForm.regime === 'new' ? 'border-primary bg-primary-50' : 'border-border'
                    }`}
                  >
                    <p className="font-medium">New Regime</p>
                    <p className="text-xs text-text-secondary">Lower rates, no exemptions</p>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Standard Deduction (₹)</Label>
                <Input
                  type="number"
                  value={taxForm.standardDeduction}
                  onChange={(e) => setTaxForm(prev => ({ ...prev, standardDeduction: Number(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Cess Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={taxForm.cessRate}
                  onChange={(e) => setTaxForm(prev => ({ ...prev, cessRate: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowTaxModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveTaxSettings}>
                Save
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
