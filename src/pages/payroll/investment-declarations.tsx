import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { extendedPayrollStore } from '@/lib/payroll-extended'
import { useAuth } from '@/contexts/auth-context'
import { employees } from '@/data/mock'
import { useToast } from '@/components/ui/toast'
import {
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  FileText,
  Eye,
} from 'lucide-react'
import type { InvestmentDeclaration } from '@/types'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

const sectionLimits = [
  { section: '80C', name: 'PPF, ELSS, LIC, NSC', limit: 150000, color: 'bg-primary/10 text-primary' },
  { section: '80D', name: 'Health Insurance', limit: 25000, color: 'bg-success/10 text-success' },
  { section: '80E', name: 'Education Loan Interest', limit: 0, color: 'bg-warning/10 text-warning' },
  { section: '80G', name: 'Donations', limit: 0, color: 'bg-danger/10 text-danger' },
  { section: '80TTA', name: 'Savings Interest', limit: 10000, color: 'bg-info/10 text-info' },
]

const statusConfig = {
  pending: { color: 'bg-warning-50 text-warning border-warning/20', icon: Clock, label: 'Pending' },
  approved: { color: 'bg-success-50 text-success border-success/20', icon: CheckCircle, label: 'Approved' },
  rejected: { color: 'bg-danger-50 text-danger border-danger/20', icon: XCircle, label: 'Rejected' },
}

export function InvestmentDeclarations() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [selectedSection, setSelectedSection] = useState('80C')
  const [declarationAmount, setDeclarationAmount] = useState('')
  const [viewingDeclaration, setViewingDeclaration] = useState<InvestmentDeclaration | null>(null)

  const isHR = user?.role === 'hr' || user?.role === 'admin'
  const employeeId = user?.employeeId

  const allDeclarations = extendedPayrollStore.getDeclarations()
  const currentYear = '2025-26'

  const filteredDeclarations = useMemo(() => {
    let decs = allDeclarations.filter(d => d.financialYear === currentYear)

    if (!isHR && employeeId) {
      decs = decs.filter(d => d.employeeId === employeeId)
    }

    if (statusFilter !== 'all') {
      decs = decs.filter(d => d.status === statusFilter)
    }

    return decs
  }, [allDeclarations, isHR, employeeId, statusFilter, currentYear])

  const sectionSummary = useMemo(() => {
    return sectionLimits.map(section => {
      const declarations = allDeclarations.filter(
        d => d.section === section.section && d.financialYear === currentYear
      )
      const totalDeclared = declarations.reduce((sum, d) => sum + d.declaredAmount, 0)
      return {
        ...section,
        totalDeclared,
        utilization: section.limit > 0 ? Math.min((totalDeclared / section.limit) * 100, 100) : 0,
        count: declarations.length,
      }
    })
  }, [allDeclarations, currentYear])

  const handleAddDeclaration = () => {
    if (!declarationAmount || !selectedSection) {
      toast('Please fill in all fields', 'error')
      return
    }

    const amount = Number(declarationAmount)
    if (amount <= 0) {
      toast('Please enter a valid amount', 'error')
      return
    }

    const section = sectionLimits.find(s => s.section === selectedSection)
    if (section && section.limit > 0 && amount > section.limit) {
      toast(`Amount cannot exceed the limit of ₹${section.limit.toLocaleString('en-IN')}`, 'error')
      return
    }

    extendedPayrollStore.addDeclaration({
      employeeId: employeeId || '1',
      financialYear: currentYear,
      section: selectedSection,
      sectionName: section?.name || '',
      declaredAmount: amount,
      status: 'pending',
    })

    toast('Declaration added successfully!', 'success')
    setDeclarationAmount('')
    setShowForm(false)
  }

  const handleVerify = (id: string, status: 'approved' | 'rejected') => {
    extendedPayrollStore.verifyDeclaration(id, user?.name || 'HR Admin', status)
    toast(`Declaration ${status} successfully!`, 'success')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const statusFilterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ]

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
          <h1 className="text-sm font-bold text-text-primary">Investment Declarations</h1>
          <p className="mt-1 text-text-secondary">
            {isHR ? 'Manage employee investment declarations for tax saving.' : 'Declare your investments for tax saving under various sections.'}
          </p>
        </div>
        {!isHR && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Declaration
          </Button>
        )}
      </motion.div>

      {/* Section Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {sectionSummary.map((section) => (
          <Card key={section.section} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${section.color}`}>
                  {section.section}
                </span>
                <span className="text-xs text-text-secondary">{section.count} declared</span>
              </div>
              <p className="text-xs text-text-secondary truncate">{section.name}</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">Declared</span>
                  <span className="font-medium text-text-primary">{formatCurrency(section.totalDeclared)}</span>
                </div>
                {section.limit > 0 && (
                  <>
                    <div className="w-full bg-background rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${section.utilization}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      Limit: {formatCurrency(section.limit)}
                    </p>
                  </>
                )}
                {section.limit === 0 && (
                  <p className="text-xs text-text-secondary">No limit</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Add Declaration Form */}
      {showForm && !isHR && (
        <motion.div
          variants={item}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-xs font-semibold text-text-primary mb-4">Add New Declaration</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">Section</label>
                  <Select
                    options={sectionLimits.map(s => ({
                      value: s.section,
                      label: `${s.section} - ${s.name}`,
                    }))}
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={declarationAmount}
                    onChange={(e) => setDeclarationAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-xs text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-end gap-3">
                  <Button onClick={handleAddDeclaration} className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    Submit
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      {isHR && (
        <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Select
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48"
          />
        </motion.div>
      )}

      {/* Declarations List */}
      <motion.div variants={item}>
        {filteredDeclarations.length > 0 ? (
          <div className="space-y-3">
            {filteredDeclarations.map((declaration) => {
              const emp = employees.find(e => e.id === declaration.employeeId)
              const statusInfo = statusConfig[declaration.status]
              const StatusIcon = statusInfo.icon
              const section = sectionLimits.find(s => s.section === declaration.section)

              return (
                <Card key={declaration.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        {isHR && emp && (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold">
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                        )}
                        <div>
                          {isHR && emp && (
                            <p className="font-semibold text-text-primary">{emp.firstName} {emp.lastName}</p>
                          )}
                          {!isHR && (
                            <p className="font-semibold text-text-primary">Investment Declaration</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${section?.color || 'bg-background text-text-secondary'}`}>
                              {declaration.section}
                            </span>
                            <span className="text-xs text-text-secondary">{declaration.sectionName}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                            <span>Financial Year: {declaration.financialYear}</span>
                            <span>•</span>
                            <span>Declared: {new Date(declaration.createdAt).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-text-secondary">Amount</p>
                          <p className="text-xs font-bold text-text-primary">{formatCurrency(declaration.declaredAmount)}</p>
                        </div>
                        <Badge variant={declaration.status === 'approved' ? 'success' : declaration.status === 'rejected' ? 'danger' : 'warning'}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                        {isHR && declaration.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerify(declaration.id, 'approved')}
                              className="text-success hover:bg-success/10"
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerify(declaration.id, 'rejected')}
                              className="text-danger hover:bg-danger/10"
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingDeclaration(declaration)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                <h3 className="mt-4 text-xs font-medium text-text-primary">No declarations found</h3>
                <p className="mt-2 text-text-secondary">
                  {isHR
                    ? 'No employee declarations match the current filter.'
                    : 'You haven\'t added any investment declarations yet.'}
                </p>
                {!isHR && (
                  <Button className="mt-4" onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Declaration
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* View Declaration Modal */}
      {viewingDeclaration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl bg-white shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-semibold text-text-primary">Declaration Details</h3>
              <Button variant="ghost" size="icon" onClick={() => setViewingDeclaration(null)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            {(() => {
              const emp = employees.find(e => e.id === viewingDeclaration.employeeId)
              const section = sectionLimits.find(s => s.section === viewingDeclaration.section)
              const statusInfo = statusConfig[viewingDeclaration.status]
              const StatusIcon = statusInfo.icon

              return (
                <div className="space-y-4">
                  {emp && (
                    <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-text-secondary">{emp.department}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-text-secondary">Section</p>
                      <p className="font-medium text-text-primary">{viewingDeclaration.section} - {section?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Financial Year</p>
                      <p className="font-medium text-text-primary">{viewingDeclaration.financialYear}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Amount</p>
                      <p className="font-bold text-xs text-primary">{formatCurrency(viewingDeclaration.declaredAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Status</p>
                      <Badge variant={viewingDeclaration.status === 'approved' ? 'success' : viewingDeclaration.status === 'rejected' ? 'danger' : 'warning'}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>

                  {viewingDeclaration.verifiedBy && (
                    <div className="p-3 bg-background rounded-xl">
                      <p className="text-xs text-text-secondary">Verified by</p>
                      <p className="font-medium text-text-primary">{viewingDeclaration.verifiedBy}</p>
                      <p className="text-xs text-text-secondary mt-1">
                        {viewingDeclaration.verifiedAt && new Date(viewingDeclaration.verifiedAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  )}

                  {viewingDeclaration.remarks && (
                    <div className="p-3 bg-warning-50 rounded-xl">
                      <p className="text-xs text-warning">Remarks</p>
                      <p className="text-xs text-text-primary">{viewingDeclaration.remarks}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button variant="outline" onClick={() => setViewingDeclaration(null)}>
                      Close
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
