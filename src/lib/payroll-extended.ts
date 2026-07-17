import type {
  InvestmentDeclaration,
  TaxProjection,
  Form16,
  ECRRecord,
  StatutoryCompliance,
  SalaryRevision,
  Arrear,
  OffCyclePayout,
  SalaryHold,
  ExpenseClaim,
  Loan,
  LeaveEncashment,
  Gratuity,
  FullFinalSettlement,
  AuditTrail,
  PayrollVariance,
  CustomReport,
} from '@/types'

const EXT_STORAGE_KEYS = {
  DECLARATIONS: 'hrms_ext_declarations',
  TAX_PROJECTIONS: 'hrms_ext_tax_projections',
  FORM16: 'hrms_ext_form16',
  ECR: 'hrms_ext_ecr',
  COMPLIANCE: 'hrms_ext_compliance',
  REVISIONS: 'hrms_ext_revisions',
  ARREARS: 'hrms_ext_arrears',
  OFF_CYCLE: 'hrms_ext_off_cycle',
  HOLDS: 'hrms_ext_holds',
  EXPENSES: 'hrms_ext_expenses',
  LOANS: 'hrms_ext_loans',
  ENCASHMENTS: 'hrms_ext_encashments',
  GRATUITY: 'hrms_ext_gratuity',
  FNF: 'hrms_ext_fnf',
  AUDIT: 'hrms_ext_audit',
  VARIANCE: 'hrms_ext_variance',
  REPORTS: 'hrms_ext_reports',
  DATA_VERSION: 'hrms_ext_data_version',
}

const EXT_DATA_VERSION = 1

function loadExt<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch { return fallback }
}

function saveExt<T>(key: string, data: T): void {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// Default investment declarations for all employees
const defaultDeclarations: InvestmentDeclaration[] = [
  { id: 'dec-1', employeeId: '1', financialYear: '2025-26', section: '80C', sectionName: 'PPF, ELSS, LIC, NSC', declaredAmount: 150000, status: 'approved', verifiedBy: 'HR Admin', verifiedAt: '2025-04-15', createdAt: '2025-04-01', updatedAt: '2025-04-15' },
  { id: 'dec-2', employeeId: '1', financialYear: '2025-26', section: '80D', sectionName: 'Health Insurance', declaredAmount: 25000, status: 'approved', verifiedBy: 'HR Admin', verifiedAt: '2025-04-15', createdAt: '2025-04-01', updatedAt: '2025-04-15' },
  { id: 'dec-3', employeeId: '2', financialYear: '2025-26', section: '80C', sectionName: 'PPF, ELSS, LIC, NSC', declaredAmount: 120000, status: 'approved', verifiedBy: 'HR Admin', verifiedAt: '2025-04-15', createdAt: '2025-04-01', updatedAt: '2025-04-15' },
  { id: 'dec-4', employeeId: '3', financialYear: '2025-26', section: '80C', sectionName: 'PPF, ELSS, LIC, NSC', declaredAmount: 150000, status: 'approved', verifiedBy: 'HR Admin', verifiedAt: '2025-04-15', createdAt: '2025-04-01', updatedAt: '2025-04-15' },
  { id: 'dec-5', employeeId: '3', financialYear: '2025-26', section: '80D', sectionName: 'Health Insurance', declaredAmount: 25000, status: 'approved', verifiedBy: 'HR Admin', verifiedAt: '2025-04-15', createdAt: '2025-04-01', updatedAt: '2025-04-15' },
  { id: 'dec-6', employeeId: '4', financialYear: '2025-26', section: '80C', sectionName: 'PPF, ELSS, LIC, NSC', declaredAmount: 150000, status: 'pending', createdAt: '2025-04-01', updatedAt: '2025-04-01' },
  { id: 'dec-7', employeeId: '5', financialYear: '2025-26', section: '80C', sectionName: 'PPF, ELSS, LIC, NSC', declaredAmount: 100000, status: 'approved', verifiedBy: 'HR Admin', verifiedAt: '2025-04-15', createdAt: '2025-04-01', updatedAt: '2025-04-15' },
  { id: 'dec-8', employeeId: '6', financialYear: '2025-26', section: '80C', sectionName: 'PPF, ELSS, LIC, NSC', declaredAmount: 150000, status: 'approved', verifiedBy: 'HR Admin', verifiedAt: '2025-04-15', createdAt: '2025-04-01', updatedAt: '2025-04-15' },
  { id: 'dec-9', employeeId: '7', financialYear: '2025-26', section: '80C', sectionName: 'PPF, ELSS, LIC, NSC', declaredAmount: 80000, status: 'approved', verifiedBy: 'HR Admin', verifiedAt: '2025-04-15', createdAt: '2025-04-01', updatedAt: '2025-04-15' },
  { id: 'dec-10', employeeId: '8', financialYear: '2025-26', section: '80C', sectionName: 'PPF, ELSS, LIC, NSC', declaredAmount: 150000, status: 'approved', verifiedBy: 'HR Admin', verifiedAt: '2025-04-15', createdAt: '2025-04-01', updatedAt: '2025-04-15' },
  { id: 'dec-11', employeeId: '9', financialYear: '2025-26', section: '80C', sectionName: 'PPF, ELSS, LIC, NSC', declaredAmount: 50000, status: 'approved', verifiedBy: 'HR Admin', verifiedAt: '2025-04-15', createdAt: '2025-04-01', updatedAt: '2025-04-15' },
  { id: 'dec-12', employeeId: '10', financialYear: '2025-26', section: '80C', sectionName: 'PPF, ELSS, LIC, NSC', declaredAmount: 130000, status: 'approved', verifiedBy: 'HR Admin', verifiedAt: '2025-04-15', createdAt: '2025-04-01', updatedAt: '2025-04-15' },
]

const defaultExpenses: ExpenseClaim[] = [
  { id: 'exp-1', employeeId: '1', expenseType: 'travel', amount: 12500, date: '2026-06-15', description: 'Client visit to Mumbai', status: 'approved', submittedAt: '2026-06-16', reviewedBy: 'HR Admin', reviewedAt: '2026-06-18', reimbursementAmount: 12500, reimbursementDate: '2026-06-30', createdAt: '2026-06-15', updatedAt: '2026-06-30' },
  { id: 'exp-2', employeeId: '2', expenseType: 'office-supplies', amount: 3200, date: '2026-06-20', description: 'Design software subscription', status: 'submitted', submittedAt: '2026-06-21', createdAt: '2026-06-20', updatedAt: '2026-06-21' },
  { id: 'exp-3', employeeId: '3', expenseType: 'food', amount: 4500, date: '2026-06-22', description: 'Team lunch with client', status: 'submitted', submittedAt: '2026-06-23', createdAt: '2026-06-22', updatedAt: '2026-06-23' },
  { id: 'exp-4', employeeId: '6', expenseType: 'travel', amount: 8500, date: '2026-06-18', description: 'Conference travel to Bangalore', status: 'approved', submittedAt: '2026-06-19', reviewedBy: 'HR Admin', reviewedAt: '2026-06-20', reimbursementAmount: 8500, reimbursementDate: '2026-06-30', createdAt: '2026-06-18', updatedAt: '2026-06-30' },
  { id: 'exp-5', employeeId: '4', expenseType: 'communication', amount: 2800, date: '2026-06-25', description: 'Client call charges', status: 'draft', createdAt: '2026-06-25', updatedAt: '2026-06-25' },
]

const defaultLoans: Loan[] = [
  {
    id: 'loan-1', employeeId: '4', loanType: 'vehicle', amount: 300000, tenureMonths: 24, monthlyEMI: 13750, interestRate: 8.5,
    reason: 'Purchase of new car', status: 'active', approvedBy: 'HR Admin', approvedAt: '2026-01-15', disbursedAt: '2026-02-01',
    outstandingAmount: 225000, repayments: [
      { id: 'rep-1', loanId: 'loan-1', month: 2, year: 2026, emiAmount: 13750, principalAmount: 11000, interestAmount: 2750, outstandingBalance: 289000, paidDate: '2026-02-28', status: 'paid' },
      { id: 'rep-2', loanId: 'loan-1', month: 3, year: 2026, emiAmount: 13750, principalAmount: 11100, interestAmount: 2650, outstandingBalance: 277900, paidDate: '2026-03-31', status: 'paid' },
      { id: 'rep-3', loanId: 'loan-1', month: 4, year: 2026, emiAmount: 13750, principalAmount: 11200, interestAmount: 2550, outstandingBalance: 266700, paidDate: '2026-04-30', status: 'paid' },
      { id: 'rep-4', loanId: 'loan-1', month: 5, year: 2026, emiAmount: 13750, principalAmount: 11300, interestAmount: 2450, outstandingBalance: 255400, paidDate: '2026-05-31', status: 'paid' },
      { id: 'rep-5', loanId: 'loan-1', month: 6, year: 2026, emiAmount: 13750, principalAmount: 11400, interestAmount: 2350, outstandingBalance: 244000, paidDate: '2026-06-30', status: 'paid' },
    ],
    createdAt: '2026-01-15',
  },
  {
    id: 'loan-2', employeeId: '7', loanType: 'salary-advance', amount: 50000, tenureMonths: 5, monthlyEMI: 10000, interestRate: 0,
    reason: 'Medical emergency', status: 'active', approvedBy: 'HR Admin', approvedAt: '2026-05-10', disbursedAt: '2026-05-15',
    outstandingAmount: 30000, repayments: [
      { id: 'rep-6', loanId: 'loan-2', month: 5, year: 2026, emiAmount: 10000, principalAmount: 10000, interestAmount: 0, outstandingBalance: 40000, paidDate: '2026-05-31', status: 'paid' },
      { id: 'rep-7', loanId: 'loan-2', month: 6, year: 2026, emiAmount: 10000, principalAmount: 10000, interestAmount: 0, outstandingBalance: 30000, paidDate: '2026-06-30', status: 'paid' },
    ],
    createdAt: '2026-05-10',
  },
]

const defaultRevisions: SalaryRevision[] = [
  { id: 'rev-1', employeeId: '1', revisionType: 'annual', effectiveDate: '2026-04-01', previousCTC: 1500000, newCTC: 1650000, revisionPercentage: 10, revisedBy: 'HR Admin', reason: 'Annual appraisal', status: 'approved', approvedBy: 'Finance Director', approvedAt: '2026-03-25', createdAt: '2026-03-20' },
  { id: 'rev-2', employeeId: '2', revisionType: 'promotion', effectiveDate: '2026-04-01', previousCTC: 1300000, newCTC: 1450000, revisionPercentage: 11.5, revisedBy: 'HR Admin', reason: 'Promotion to Senior Designer', status: 'approved', approvedBy: 'Finance Director', approvedAt: '2026-03-25', createdAt: '2026-03-20' },
  { id: 'rev-3', employeeId: '6', revisionType: 'annual', effectiveDate: '2026-04-01', previousCTC: 1400000, newCTC: 1550000, revisionPercentage: 10.7, revisedBy: 'HR Admin', reason: 'Annual appraisal', status: 'approved', approvedBy: 'Finance Director', approvedAt: '2026-03-25', createdAt: '2026-03-20' },
]

const defaultArrears: Arrear[] = [
  { id: 'arr-1', employeeId: '1', periodId: 'period-2026-04', arrearType: 'salary-revision', fromMonth: 4, fromYear: 2026, toMonth: 4, toYear: 2026, amount: 12500, description: 'Arrear from salary revision effective Apr 2026', status: 'paid', processedAt: '2026-04-30', payslipId: 'payslip-period-2026-04-1', createdAt: '2026-04-01' },
  { id: 'arr-2', employeeId: '2', periodId: 'period-2026-04', arrearType: 'salary-revision', fromMonth: 4, fromYear: 2026, toMonth: 4, toYear: 2026, amount: 12500, description: 'Arrear from promotion effective Apr 2026', status: 'paid', processedAt: '2026-04-30', payslipId: 'payslip-period-2026-04-2', createdAt: '2026-04-01' },
  { id: 'arr-3', employeeId: '6', periodId: 'period-2026-04', arrearType: 'salary-revision', fromMonth: 4, fromYear: 2026, toMonth: 4, toYear: 2026, amount: 12500, description: 'Arrear from salary revision effective Apr 2026', status: 'processed', processedAt: '2026-04-30', createdAt: '2026-04-01' },
]

const defaultOffCycle: OffCyclePayout[] = [
  { id: 'oc-1', employeeId: '1', payoutType: 'incentive', amount: 25000, month: 6, year: 2026, description: 'Q1 performance incentive', approvedBy: 'HR Admin', status: 'paid', processedAt: '2026-06-30', createdAt: '2026-06-25' },
  { id: 'oc-2', employeeId: '3', payoutType: 'bonus', amount: 50000, month: 6, year: 2026, description: 'Campaign success bonus', approvedBy: 'HR Admin', status: 'processed', processedAt: '2026-06-30', createdAt: '2026-06-20' },
]

const defaultHolds: SalaryHold[] = [
  { id: 'hold-1', employeeId: '8', reason: 'Pending clearance verification', heldBy: 'HR Admin', heldAt: '2026-06-15', status: 'held' },
]

const defaultEncashments: LeaveEncashment[] = [
  { id: 'enc-1', employeeId: '5', leaveType: 'annual', encashableDays: 8, perDaySalary: 4167, totalAmount: 33336, financialYear: '2025-26', status: 'approved', processedAt: '2026-03-31', createdAt: '2026-03-15' },
]

const defaultGratuity: Gratuity[] = [
  { id: 'grat-1', employeeId: '5', lastDrawnSalary: 104167, yearsOfService: 6, gratuityAmount: 300000, eligibilityDate: '2026-07-01', status: 'eligible', createdAt: '2026-06-01' },
]

const defaultFnf: FullFinalSettlement[] = []

const defaultAuditLogs: AuditTrail[] = [
  { id: 'audit-1', userId: 'user-1', userName: 'John Admin', userRole: 'admin', action: 'process', module: 'payroll', entityId: 'period-2026-06', entityType: 'PayrollPeriod', description: 'Processed payroll for June 2026', timestamp: '2026-06-28T10:00:00Z' },
  { id: 'audit-2', userId: 'user-1', userName: 'John Admin', userRole: 'admin', action: 'approve', module: 'payroll', entityId: 'rev-1', entityType: 'SalaryRevision', description: 'Approved salary revision for Sarah Chen', oldValues: { ctc: 1500000 }, newValues: { ctc: 1650000 }, timestamp: '2026-03-25T14:00:00Z' },
  { id: 'audit-3', userId: 'user-3', userName: 'Lisa Thompson', userRole: 'hr', action: 'create', module: 'expense', entityId: 'exp-1', entityType: 'ExpenseClaim', description: 'Approved expense claim for Sarah Chen - ₹12,500', timestamp: '2026-06-18T11:00:00Z' },
  { id: 'audit-4', userId: 'user-1', userName: 'John Admin', userRole: 'admin', action: 'update', module: 'settings', entityId: '1', entityType: 'PayrollSettings', description: 'Updated payroll settings', timestamp: '2026-06-01T09:00:00Z' },
  { id: 'audit-5', userId: 'user-1', userName: 'John Admin', userRole: 'admin', action: 'export', module: 'payroll', entityId: 'period-2026-06', entityType: 'PayrollRun', description: 'Exported payroll data for June 2026', timestamp: '2026-06-29T16:00:00Z' },
]

const defaultReports: CustomReport[] = [
  { id: 'rpt-1', name: 'Department-wise Salary Summary', description: 'CTC breakdown by department', module: 'payroll', columns: ['department', 'totalCTC', 'employeeCount', 'averageCTC'], filters: {}, groupBy: 'department', createdBy: 'user-1', createdAt: '2026-05-01' },
  { id: 'rpt-2', name: 'Monthly Attendance Report', description: 'Present/Absent summary by employee', module: 'attendance', columns: ['employee', 'present', 'absent', 'leave'], filters: {}, groupBy: 'employee', createdBy: 'user-3', createdAt: '2026-05-15' },
  { id: 'rpt-3', name: 'Expense Claim Summary', description: 'Pending and approved expenses', module: 'payroll', columns: ['employee', 'type', 'amount', 'status'], filters: {}, sortBy: 'amount', sortOrder: 'desc', createdBy: 'user-1', createdAt: '2026-06-01' },
]

export class ExtendedPayrollStore {
  private declarations: InvestmentDeclaration[]
  private expenses: ExpenseClaim[]
  private loans: Loan[]
  private revisions: SalaryRevision[]
  private arrears: Arrear[]
  private offCycle: OffCyclePayout[]
  private holds: SalaryHold[]
  private encashments: LeaveEncashment[]
  private gratuity: Gratuity[]
  private fnf: FullFinalSettlement[]
  private auditLogs: AuditTrail[]
  private reports: CustomReport[]

  constructor() {
    const storedVersion = loadExt(EXT_STORAGE_KEYS.DATA_VERSION, 0)
    if (storedVersion < EXT_DATA_VERSION) {
      Object.values(EXT_STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
      saveExt(EXT_STORAGE_KEYS.DATA_VERSION, EXT_DATA_VERSION)
    }
    this.declarations = loadExt(EXT_STORAGE_KEYS.DECLARATIONS, defaultDeclarations)
    this.expenses = loadExt(EXT_STORAGE_KEYS.EXPENSES, defaultExpenses)
    this.loans = loadExt(EXT_STORAGE_KEYS.LOANS, defaultLoans)
    this.revisions = loadExt(EXT_STORAGE_KEYS.REVISIONS, defaultRevisions)
    this.arrears = loadExt(EXT_STORAGE_KEYS.ARREARS, defaultArrears)
    this.offCycle = loadExt(EXT_STORAGE_KEYS.OFF_CYCLE, defaultOffCycle)
    this.holds = loadExt(EXT_STORAGE_KEYS.HOLDS, defaultHolds)
    this.encashments = loadExt(EXT_STORAGE_KEYS.ENCASHMENTS, defaultEncashments)
    this.gratuity = loadExt(EXT_STORAGE_KEYS.GRATUITY, defaultGratuity)
    this.fnf = loadExt(EXT_STORAGE_KEYS.FNF, defaultFnf)
    this.auditLogs = loadExt(EXT_STORAGE_KEYS.AUDIT, defaultAuditLogs)
    this.reports = loadExt(EXT_STORAGE_KEYS.REPORTS, defaultReports)
  }

  // ==================== AUDIT ====================
  addAuditLog(log: Omit<AuditTrail, 'id' | 'timestamp'>) {
    const newLog: AuditTrail = { ...log, id: genId('audit'), timestamp: new Date().toISOString() }
    this.auditLogs = [newLog, ...this.auditLogs].slice(0, 500)
    saveExt(EXT_STORAGE_KEYS.AUDIT, this.auditLogs)
    return newLog
  }
  getAuditLogs(filters?: { module?: string; userId?: string; entityId?: string }) {
    let logs = this.auditLogs
    if (filters?.module) logs = logs.filter(l => l.module === filters.module)
    if (filters?.userId) logs = logs.filter(l => l.userId === filters.userId)
    if (filters?.entityId) logs = logs.filter(l => l.entityId === filters.entityId)
    return logs
  }

  // ==================== INVESTMENT DECLARATIONS ====================
  getDeclarations(employeeId?: string, financialYear?: string) {
    let decs = this.declarations
    if (employeeId) decs = decs.filter(d => d.employeeId === employeeId)
    if (financialYear) decs = decs.filter(d => d.financialYear === financialYear)
    return decs
  }
  addDeclaration(decl: Omit<InvestmentDeclaration, 'id' | 'createdAt' | 'updatedAt'>) {
    const newDecl: InvestmentDeclaration = { ...decl, id: genId('dec'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    this.declarations = [...this.declarations, newDecl]
    saveExt(EXT_STORAGE_KEYS.DECLARATIONS, this.declarations)
    this.addAuditLog({ userId: '', userName: '', userRole: '', action: 'create', module: 'declarations', entityId: newDecl.id, entityType: 'InvestmentDeclaration', description: `Added declaration for section ${newDecl.section}` })
    return newDecl
  }
  updateDeclaration(id: string, updates: Partial<InvestmentDeclaration>) {
    this.declarations = this.declarations.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d)
    saveExt(EXT_STORAGE_KEYS.DECLARATIONS, this.declarations)
  }
  verifyDeclaration(id: string, verifiedBy: string, status: 'approved' | 'rejected', remarks?: string) {
    this.declarations = this.declarations.map(d => d.id === id ? { ...d, status, verifiedBy, verifiedAt: new Date().toISOString(), remarks, updatedAt: new Date().toISOString() } : d)
    saveExt(EXT_STORAGE_KEYS.DECLARATIONS, this.declarations)
    this.addAuditLog({ userId: '', userName: verifiedBy, userRole: 'hr', action: status === 'approved' ? 'approve' : 'reject', module: 'declarations', entityId: id, entityType: 'InvestmentDeclaration', description: `${status} declaration` })
  }

  // ==================== TAX PROJECTIONS ====================
  generateTaxProjection(employeeId: string, annualIncome: number, declaredInvestments: number, regime: 'old' | 'new'): TaxProjection {
    const standardDeduction = regime === 'new' ? 75000 : 50000
    const taxableIncome = Math.max(0, annualIncome - standardDeduction - (regime === 'old' ? declaredInvestments : 0))
    const slabs = [
      ...(regime === 'old' ? [
        { min: 0, max: 250000, rate: 0 },
        { min: 250001, max: 500000, rate: 5 },
        { min: 500001, max: 1000000, rate: 20 },
        { min: 1000001, max: Infinity, rate: 30 },
      ] : [
        { min: 0, max: 300000, rate: 0 },
        { min: 300001, max: 600000, rate: 5 },
        { min: 600001, max: 900000, rate: 10 },
        { min: 900001, max: 1200000, rate: 15 },
        { min: 1200001, max: 1500000, rate: 20 },
        { min: 1500001, max: Infinity, rate: 30 },
      ])
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
    const totalTax = Math.round(tax + cess)
    const projection: TaxProjection = {
      id: genId('taxproj'), employeeId, financialYear: '2025-26', regime,
      annualIncome, declaredInvestments, taxableIncome,
      projectedTax: totalTax, monthlyTDS: Math.round(totalTax / 12),
      sections: [
        { section: '80C', name: 'PPF/ELSS/LIC', limit: 150000, declared: Math.min(declaredInvestments, 150000) },
        { section: '80D', name: 'Health Insurance', limit: 25000, declared: 0 },
        { section: '80E', name: 'Education Loan', limit: 0, declared: 0 },
        { section: '80G', name: 'Donations', limit: 0, declared: 0 },
      ],
      generatedAt: new Date().toISOString(),
    }
    return projection
  }
  getTaxProjection(employeeId: string) {
    const empSalary = loadExt('hrms_employee_salaries', []).find((es: any) => es.employeeId === employeeId) as any
    if (!empSalary) return null
    const annualIncome = empSalary.grossSalary * 12
    const decs = this.declarations.filter(d => d.employeeId === employeeId && d.financialYear === '2025-26' && d.status === 'approved')
    const totalDeclared = decs.reduce((sum, d) => sum + d.declaredAmount, 0)
    return this.generateTaxProjection(employeeId, annualIncome, totalDeclared, 'new')
  }

  // ==================== FORM 16 ====================
  generateForm16(employeeId: string, employeeName: string, employeePAN: string): Form16 {
    const empSalary = loadExt('hrms_employee_salaries', []).find((es: any) => es.employeeId === employeeId) as any
    const payslips = loadExt('hrms_payslips', []).filter((p: any) => p.employeeId === employeeId) as any[]
    const grossSalary = empSalary ? empSalary.grossSalary * 12 : 0
    const totalDeductions = payslips.reduce((sum: number, p: any) => sum + (p.totalDeductions || 0), 0)
    const taxableIncome = grossSalary - totalDeductions
    const taxPaid = Math.round(taxableIncome * 0.1)
    const form16: Form16 = {
      id: genId('form16'), employeeId, financialYear: '2025-26', quarter: 4,
      employerTAN: 'ABCTA1234C', employerName: 'Zenith',
      employeeName, employeePAN,
      grossSalary, totalDeductions, taxableIncome,
      taxPaid, surcharge: 0, cess: Math.round(taxPaid * 0.04),
      totalTaxLiability: Math.round(taxPaid * 1.04), taxDeducted: taxPaid, tdsDeposited: taxPaid,
      generatedAt: new Date().toISOString(),
      partA: { summaryOfDeductions: { section80C: 150000, section80D: 25000, section80E: 0, section80G: 0, section80TTA: 0, otherDeductions: 0, totalDeductions: 175000 } },
      partB: {
        salaryBreakup: { basicSalary: empSalary?.basicSalary * 12 || 0, hra: Math.round(grossSalary * 0.2), specialAllowance: Math.round(grossSalary * 0.15), transportAllowance: 96000, medicalAllowance: 60000, otherAllowances: 0, totalSalary: grossSalary },
        deductions: { pf: Math.min(Math.round(grossSalary * 0.12), 21600), esi: 0, professionalTax: 2400, tds: taxPaid, totalDeductions }
      }
    }
    return form16
  }
  getForm16(employeeId: string) { return this.generateForm16(employeeId, '', '') }

  // ==================== ECR ====================
  generateECRRecords(month: number, year: number): ECRRecord[] {
    const salaries = loadExt('hrms_employee_salaries', []) as any[]
    return salaries.map((es: any, index: number) => {
      const epfWages = Math.min(es.grossSalary, 15000)
      const epfContribution = Math.round(epfWages * 0.12)
      const epsContribution = Math.round(epfWages * 0.0833)
      const edliContribution = Math.round(es.grossSalary * 0.005)
      const adminCharges = Math.round(epfContribution * 0.005)
      return {
        id: genId('ecr'), employeeId: es.employeeId, uan: `100${String(100000000 + parseInt(es.employeeId) * 111111).slice(0, 10)}`,
        employeeName: '', grossWages: es.grossSalary, epfWages, edliWages: es.grossSalary,
        epfContribution, epsContribution, edliContribution, adminCharges,
        totalContribution: epfContribution + epsContribution + edliContribution + adminCharges,
        month, year, generatedAt: new Date().toISOString(),
      }
    })
  }
  getECRRecords(month?: number, year?: number) { return [] }

  // ==================== STATUTORY COMPLIANCE ====================
  generateStatutoryCompliance(month: number, year: number): StatutoryCompliance {
    const records = this.generateECRRecords(month, year)
    const totalPF = records.reduce((sum, r) => sum + r.totalContribution, 0)
    const compliance: StatutoryCompliance = {
      id: genId('compliance'), month, year,
      pfChallan: { totalEmployeeContribution: records.reduce((s, r) => s + r.epfContribution, 0), totalEmployerContribution: records.reduce((s, r) => s + r.epsContribution, 0), totalAdminCharges: records.reduce((s, r) => s + r.adminCharges, 0), totalEDLICharges: records.reduce((s, r) => s + r.edliContribution, 0), totalAmount: totalPF, dueDate: `${year}-${String(month + 1).padStart(2, '0')}-15`, status: 'pending' },
      esiChallan: { totalEmployeeContribution: 0, totalEmployerContribution: 0, totalAmount: 0, dueDate: `${year}-${String(month + 1).padStart(2, '0')}-15`, status: 'pending' },
      ptReturn: { totalTax: records.length * 200, dueDate: `${year}-${String(month + 1).padStart(2, '0')}-10`, status: 'pending' },
      tdsReturn: { totalTDS: 0, dueDate: `${year}-${String(month + 1).padStart(2, '0')}-30`, status: 'pending' },
      generatedAt: new Date().toISOString(),
    }
    return compliance
  }
  getCompliance(month?: number, year?: number) { return this.generateStatutoryCompliance(month || 6, year || 2026) }
  updateCompliance(id: string, updates: Partial<StatutoryCompliance>) {}

  // ==================== SALARY REVISIONS ====================
  getRevisions(employeeId?: string) {
    return employeeId ? this.revisions.filter(r => r.employeeId === employeeId) : this.revisions
  }
  addRevision(rev: Omit<SalaryRevision, 'id' | 'createdAt'>) {
    const newRev: SalaryRevision = { ...rev, id: genId('rev'), createdAt: new Date().toISOString() }
    this.revisions = [...this.revisions, newRev]
    saveExt(EXT_STORAGE_KEYS.REVISIONS, this.revisions)
    this.addAuditLog({ userId: '', userName: rev.revisedBy, userRole: 'hr', action: 'create', module: 'revision', entityId: newRev.id, entityType: 'SalaryRevision', description: `Created salary revision for employee ${rev.employeeId}`, newValues: { previousCTC: rev.previousCTC, newCTC: rev.newCTC } })
    return newRev
  }
  approveRevision(id: string, approvedBy: string) {
    this.revisions = this.revisions.map(r => r.id === id ? { ...r, status: 'approved' as const, approvedBy, approvedAt: new Date().toISOString() } : r)
    saveExt(EXT_STORAGE_KEYS.REVISIONS, this.revisions)
    this.addAuditLog({ userId: '', userName: approvedBy, userRole: 'admin', action: 'approve', module: 'revision', entityId: id, entityType: 'SalaryRevision', description: 'Approved salary revision' })
  }

  // ==================== ARREARS ====================
  getArrears(employeeId?: string) {
    return employeeId ? this.arrears.filter(a => a.employeeId === employeeId) : this.arrears
  }
  addArrear(arrear: Omit<Arrear, 'id' | 'createdAt'>) {
    const newArrear: Arrear = { ...arrear, id: genId('arr'), createdAt: new Date().toISOString() }
    this.arrears = [...this.arrears, newArrear]
    saveExt(EXT_STORAGE_KEYS.ARREARS, this.arrears)
    return newArrear
  }
  processArrear(id: string) {
    this.arrears = this.arrears.map(a => a.id === id ? { ...a, status: 'processed' as const, processedAt: new Date().toISOString() } : a)
    saveExt(EXT_STORAGE_KEYS.ARREARS, this.arrears)
  }

  // ==================== OFF-CYCLE PAYOUTS ====================
  getOffCyclePayouts(employeeId?: string) {
    return employeeId ? this.offCycle.filter(o => o.employeeId === employeeId) : this.offCycle
  }
  addOffCyclePayout(payout: Omit<OffCyclePayout, 'id' | 'createdAt'>) {
    const newPayout: OffCyclePayout = { ...payout, id: genId('oc'), createdAt: new Date().toISOString() }
    this.offCycle = [...this.offCycle, newPayout]
    saveExt(EXT_STORAGE_KEYS.OFF_CYCLE, this.offCycle)
    return newPayout
  }
  processOffCyclePayout(id: string) {
    this.offCycle = this.offCycle.map(o => o.id === id ? { ...o, status: 'processed' as const, processedAt: new Date().toISOString() } : o)
    saveExt(EXT_STORAGE_KEYS.OFF_CYCLE, this.offCycle)
  }

  // ==================== SALARY HOLDS ====================
  getHolds(employeeId?: string) {
    return employeeId ? this.holds.filter(h => h.employeeId === employeeId) : this.holds
  }
  addHold(hold: Omit<SalaryHold, 'id'>) {
    const newHold: SalaryHold = { ...hold, id: genId('hold') }
    this.holds = [...this.holds, newHold]
    saveExt(EXT_STORAGE_KEYS.HOLDS, this.holds)
    return newHold
  }
  releaseHold(id: string, releasedBy: string, action: 'process-as-salary' | 'process-as-arrear') {
    this.holds = this.holds.map(h => h.id === id ? { ...h, status: 'released' as const, releasedBy, releasedAt: new Date().toISOString(), releaseAction: action } : h)
    saveExt(EXT_STORAGE_KEYS.HOLDS, this.holds)
  }

  // ==================== EXPENSES ====================
  getExpenses(employeeId?: string) {
    return employeeId ? this.expenses.filter(e => e.employeeId === employeeId) : this.expenses
  }
  addExpense(expense: Omit<ExpenseClaim, 'id' | 'createdAt' | 'updatedAt'>) {
    const newExp: ExpenseClaim = { ...expense, id: genId('exp'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    this.expenses = [...this.expenses, newExp]
    saveExt(EXT_STORAGE_KEYS.EXPENSES, this.expenses)
    return newExp
  }
  submitExpense(id: string) {
    this.expenses = this.expenses.map(e => e.id === id ? { ...e, status: 'submitted' as const, submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : e)
    saveExt(EXT_STORAGE_KEYS.EXPENSES, this.expenses)
  }
  approveExpense(id: string, reviewedBy: string, amount?: number) {
    this.expenses = this.expenses.map(e => e.id === id ? { ...e, status: 'approved' as const, reviewedBy, reviewedAt: new Date().toISOString(), reimbursementAmount: amount || e.amount, updatedAt: new Date().toISOString() } : e)
    saveExt(EXT_STORAGE_KEYS.EXPENSES, this.expenses)
    this.addAuditLog({ userId: '', userName: reviewedBy, userRole: 'hr', action: 'approve', module: 'expense', entityId: id, entityType: 'ExpenseClaim', description: 'Approved expense claim' })
  }
  rejectExpense(id: string, reviewedBy: string, remarks: string) {
    this.expenses = this.expenses.map(e => e.id === id ? { ...e, status: 'rejected' as const, reviewedBy, reviewedAt: new Date().toISOString(), remarks, updatedAt: new Date().toISOString() } : e)
    saveExt(EXT_STORAGE_KEYS.EXPENSES, this.expenses)
  }
  reimburseExpense(id: string) {
    this.expenses = this.expenses.map(e => e.id === id ? { ...e, status: 'reimbursed' as const, reimbursementDate: new Date().toISOString(), updatedAt: new Date().toISOString() } : e)
    saveExt(EXT_STORAGE_KEYS.EXPENSES, this.expenses)
  }

  // ==================== LOANS ====================
  getLoans(employeeId?: string) {
    return employeeId ? this.loans.filter(l => l.employeeId === employeeId) : this.loans
  }
  addLoan(loan: Omit<Loan, 'id' | 'createdAt' | 'repayments' | 'outstandingAmount'>) {
    const newLoan: Loan = { ...loan, id: genId('loan'), repayments: [], outstandingAmount: loan.amount, createdAt: new Date().toISOString() }
    this.loans = [...this.loans, newLoan]
    saveExt(EXT_STORAGE_KEYS.LOANS, this.loans)
    return newLoan
  }
  approveLoan(id: string, approvedBy: string) {
    this.loans = this.loans.map(l => l.id === id ? { ...l, status: 'active' as const, approvedBy, approvedAt: new Date().toISOString(), disbursedAt: new Date().toISOString() } : l)
    saveExt(EXT_STORAGE_KEYS.LOANS, this.loans)
  }
  processRepayment(loanId: string, month: number, year: number) {
    this.loans = this.loans.map(l => {
      if (l.id !== loanId) return l
      const principal = Math.round(l.monthlyEMI * 0.8)
      const interest = l.monthlyEMI - principal
      const repayment = { id: genId('rep'), loanId, month, year, emiAmount: l.monthlyEMI, principalAmount: principal, interestAmount: interest, outstandingBalance: l.outstandingAmount - principal, paidDate: new Date().toISOString(), status: 'paid' as const }
      const updated = { ...l, repayments: [...l.repayments, repayment], outstandingAmount: Math.max(0, l.outstandingAmount - principal) }
      if (updated.outstandingAmount <= 0) updated.status = 'closed' as const
      return updated
    })
    saveExt(EXT_STORAGE_KEYS.LOANS, this.loans)
  }

  // ==================== LEAVE ENCASHMENT ====================
  getEncashments(employeeId?: string) {
    return employeeId ? this.encashments.filter(e => e.employeeId === employeeId) : this.encashments
  }
  addEncashment(enc: Omit<LeaveEncashment, 'id' | 'createdAt'>) {
    const newEnc: LeaveEncashment = { ...enc, id: genId('enc'), createdAt: new Date().toISOString() }
    this.encashments = [...this.encashments, newEnc]
    saveExt(EXT_STORAGE_KEYS.ENCASHMENTS, this.encashments)
    return newEnc
  }
  processEncashment(id: string) {
    this.encashments = this.encashments.map(e => e.id === id ? { ...e, status: 'approved' as const, processedAt: new Date().toISOString() } : e)
    saveExt(EXT_STORAGE_KEYS.ENCASHMENTS, this.encashments)
  }

  // ==================== GRATUITY ====================
  getGratuity(employeeId?: string) {
    return employeeId ? this.gratuity.filter(g => g.employeeId === employeeId) : this.gratuity
  }
  calculateGratuity(lastDrawnSalary: number, yearsOfService: number) {
    return Math.round((lastDrawnSalary * 15 * yearsOfService) / 26)
  }

  // ==================== FULL & FINAL ====================
  getSettlements(employeeId?: string) {
    return employeeId ? this.fnf.filter(f => f.employeeId === employeeId) : this.fnf
  }
  createSettlement(settlement: Omit<FullFinalSettlement, 'id' | 'createdAt'>) {
    const newFnf: FullFinalSettlement = { ...settlement, id: genId('fnf'), createdAt: new Date().toISOString() }
    this.fnf = [...this.fnf, newFnf]
    saveExt(EXT_STORAGE_KEYS.FNF, this.fnf)
    return newFnf
  }
  processSettlement(id: string, processedBy: string) {
    this.fnf = this.fnf.map(f => f.id === id ? { ...f, status: 'processed' as const, processedBy, processedAt: new Date().toISOString() } : f)
    saveExt(EXT_STORAGE_KEYS.FNF, this.fnf)
  }

  // ==================== VARIANCE ====================
  generateVariance(currentPeriodId: string, previousPeriodId: string): PayrollVariance[] {
    const currentPayslips = loadExt('hrms_payslips', []).filter((p: any) => p.periodId === currentPeriodId) as any[]
    const previousPayslips = loadExt('hrms_payslips', []).filter((p: any) => p.periodId === previousPeriodId) as any[]
    return currentPayslips.map(cp => {
      const pp = previousPayslips.find(p => p.employeeId === cp.employeeId)
      if (!pp) return null
      const grossVariance = cp.grossSalary - pp.grossSalary
      const netVariance = cp.netSalary - pp.netSalary
      return {
        id: genId('var'), currentPeriodId, previousPeriodId, employeeId: cp.employeeId,
        currentGross: cp.grossSalary, previousGross: pp.grossSalary, grossVariance, grossVariancePercent: pp.grossSalary ? Math.round((grossVariance / pp.grossSalary) * 100 * 100) / 100 : 0,
        currentNet: cp.netSalary, previousNet: pp.netSalary, netVariance, netVariancePercent: pp.netSalary ? Math.round((netVariance / pp.netSalary) * 100 * 100) / 100 : 0,
        componentVariances: [], generatedAt: new Date().toISOString(),
      }
    }).filter(Boolean) as PayrollVariance[]
  }
  getVariances() { return [] }

  // ==================== CUSTOM REPORTS ====================
  getReports() { return this.reports }
  addReport(report: Omit<CustomReport, 'id' | 'createdAt'>) {
    const newReport: CustomReport = { ...report, id: genId('rpt'), createdAt: new Date().toISOString() }
    this.reports = [...this.reports, newReport]
    saveExt(EXT_STORAGE_KEYS.REPORTS, this.reports)
    return newReport
  }
  runReport(id: string) {
    this.reports = this.reports.map(r => r.id === id ? { ...r, lastRunAt: new Date().toISOString() } : r)
    saveExt(EXT_STORAGE_KEYS.REPORTS, this.reports)
    return { data: [], summary: {} }
  }
}

export const extendedPayrollStore = new ExtendedPayrollStore()
