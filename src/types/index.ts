export type EmployeeStatus = 'active' | 'inactive' | 'on-leave' | 'terminated'

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day' | 'on-leave' | 'holiday'

export type Gender = 'male' | 'female' | 'other'

export type LeaveType = 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid'

export type PayrollStatus = 'draft' | 'processing' | 'processed' | 'paid' | 'cancelled' | 'on-hold'

export type PaymentMode = 'bank-transfer' | 'cheque' | 'cash'

export type ComponentType = 'earning' | 'deduction'

export type TaxRegime = 'old' | 'new'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed'

export type LoanStatus = 'active' | 'closed' | 'defaulted'

export type LoanType = 'salary-advance' | 'emergency' | 'education' | 'vehicle' | 'housing'

export type RevisionType = 'annual' | 'promotion' | 'adjustment' | 'correction'

export type AuditAction = 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'process' | 'export'

export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  dateOfBirth: string
  gender: Gender
  department: string
  designation: string
  status: EmployeeStatus
  joiningDate: string
  salary: number
  address: string
  reportingManagerId?: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  bankDetails: {
    accountName: string
    accountNumber: string
    bankName: string
    ifscCode: string
  }
}

export interface Department {
  id: string
  name: string
  head: string
  employeeCount: number
  description: string
  color: string
}

export interface Designation {
  id: string
  name: string
  department: string
  level: string
}

export interface Attendance {
  id: string
  employeeId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: AttendanceStatus
  hours: number
}

export interface Leave {
  id: string
  employeeId: string
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
  appliedOn: string
  approvedBy?: string
}

export interface Holiday {
  id: string
  name: string
  date: string
  type: 'national' | 'company' | 'optional'
}

export interface Document {
  id: string
  employeeId: string
  name: string
  type: string
  category: string
  uploadedAt: string
  size: number
}

export interface Activity {
  id: string
  type: 'attendance' | 'leave' | 'employee' | 'document' | 'system'
  message: string
  timestamp: string
  userId: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  date: string
  priority: 'low' | 'medium' | 'high'
}

export interface SalaryComponent {
  id: string
  name: string
  type: ComponentType
  value: number
  isPercentage: boolean
  maxLimit?: number
  description: string
}

export interface SalaryStructure {
  id: string
  name: string
  components: SalaryComponent[]
  createdAt: string
  updatedAt: string
}

export interface EmployeeSalary {
  id: string
  employeeId: string
  structureId: string
  basicSalary: number
  grossSalary: number
  netSalary: number
  effectiveFrom: string
  components: {
    componentId: string
    value: number
    calculatedValue: number
  }[]
}

export interface PayrollPeriod {
  id: string
  month: number
  year: number
  startDate: string
  endDate: string
  status: PayrollStatus
}

export interface PayslipComponent {
  name: string
  type: ComponentType
  amount: number
}

export interface Payslip {
  id: string
  employeeId: string
  periodId: string
  month: number
  year: number
  generatedAt: string
  status: PayrollStatus
  earnings: PayslipComponent[]
  deductions: PayslipComponent[]
  grossSalary: number
  totalDeductions: number
  netSalary: number
  paymentMode: PaymentMode
  paidAt?: string
  transactionId?: string
  workingDays: number
  daysPresent: number
  leaveDays: number
  lopDays: number
  overtimeHours: number
  overtimeAmount: number
}

export interface PayrollRun {
  id: string
  periodId: string
  processedBy: string
  processedAt: string
  totalEmployees: number
  totalGross: number
  totalDeductions: number
  totalNet: number
  status: PayrollStatus
  payslipIds: string[]
}

export interface TaxSlab {
  id: string
  regime: TaxRegime
  minIncome: number
  maxIncome: number | null
  taxRate: number
  cessRate: number
}

export interface PFContribution {
  id: string
  employeeContribution: number
  employerContribution: number
  adminCharges: number
  edliCharges: number
  maxPensionableSalary: number
  employeeRate: number
  employerRate: number
}

export interface ESContribution {
  id: string
  employeeRate: number
  employerRate: number
  maxEsiSalary: number
  minEsiSalary: number
}

export interface PayrollSettings {
  id: string
  pfContribution: PFContribution
  esicContribution: ESContribution
  professionalTax: {
    enabled: boolean
    slabs: { minSalary: number; maxSalary: number; tax: number }[]
  }
  tdsSettings: {
    regime: TaxRegime
    taxSlabs: TaxSlab[]
    standardDeduction: number
    cessRate: number
  }
  gratuityEnabled: boolean
  gratuityRate: number
  lopDeductionRate: number
  overtimeRate: number
  paymentModes: PaymentMode[]
}

// ============================================
// NEW TYPES - Statutory Compliance
// ============================================

export interface InvestmentDeclaration {
  id: string
  employeeId: string
  financialYear: string
  section: string
  sectionName: string
  declaredAmount: number
  proofUrl?: string
  proofUploadedAt?: string
  status: ApprovalStatus
  verifiedBy?: string
  verifiedAt?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface TaxProjection {
  id: string
  employeeId: string
  financialYear: string
  regime: TaxRegime
  annualIncome: number
  declaredInvestments: number
  taxableIncome: number
  projectedTax: number
  monthlyTDS: number
  sections: {
    section: string
    name: string
    limit: number
    declared: number
  }[]
  generatedAt: string
}

export interface Form16 {
  id: string
  employeeId: string
  financialYear: string
  quarter: 1 | 2 | 3 | 4
  employerTAN: string
  employerName: string
  employeeName: string
  employeePAN: string
  grossSalary: number
  totalDeductions: number
  taxableIncome: number
  taxPaid: number
  surcharge: number
  cess: number
  totalTaxLiability: number
  taxDeducted: number
  tdsDeposited: number
  generatedAt: string
  partA?: {
    summaryOfDeductions: {
      section80C: number
      section80D: number
      section80E: number
      section80G: number
      section80TTA: number
      otherDeductions: number
      totalDeductions: number
    }
  }
  partB?: {
    salaryBreakup: {
      basicSalary: number
      hra: number
      specialAllowance: number
      transportAllowance: number
      medicalAllowance: number
      otherAllowances: number
      totalSalary: number
    }
    deductions: {
      pf: number
      esi: number
      professionalTax: number
      tds: number
      totalDeductions: number
    }
  }
}

export interface ECRRecord {
  id: string
  employeeId: string
  uan: string
  employeeName: string
  grossWages: number
  epfWages: number
  edliWages: number
  epfContribution: number
  epsContribution: number
  edliContribution: number
  adminCharges: number
  totalContribution: number
  month: number
  year: number
  generatedAt: string
}

export interface StatutoryCompliance {
  id: string
  month: number
  year: number
  pfChallan: {
    totalEmployeeContribution: number
    totalEmployerContribution: number
    totalAdminCharges: number
    totalEDLICharges: number
    totalAmount: number
    dueDate: string
    paidDate?: string
    status: 'pending' | 'paid' | 'overdue'
  }
  esiChallan: {
    totalEmployeeContribution: number
    totalEmployerContribution: number
    totalAmount: number
    dueDate: string
    paidDate?: string
    status: 'pending' | 'paid' | 'overdue'
  }
  ptReturn: {
    totalTax: number
    dueDate: string
    paidDate?: string
    status: 'pending' | 'paid' | 'overdue'
  }
  tdsReturn: {
    totalTDS: number
    dueDate: string
    filedDate?: string
    status: 'pending' | 'filed' | 'overdue'
  }
  generatedAt: string
}

// ============================================
// NEW TYPES - Arrears & Revisions
// ============================================

export interface SalaryRevision {
  id: string
  employeeId: string
  revisionType: RevisionType
  effectiveDate: string
  previousCTC: number
  newCTC: number
  revisionPercentage: number
  revisedBy: string
  reason: string
  status: ApprovalStatus
  approvedBy?: string
  approvedAt?: string
  createdAt: string
}

export interface Arrear {
  id: string
  employeeId: string
  periodId: string
  arrearType: 'salary-revision' | 'lop-reversal' | 'bonus' | 'correction' | 'other'
  fromMonth: number
  fromYear: number
  toMonth: number
  toYear: number
  amount: number
  description: string
  status: 'pending' | 'processed' | 'paid'
  processedAt?: string
  payslipId?: string
  createdAt: string
}

export interface OffCyclePayout {
  id: string
  employeeId: string
  payoutType: 'bonus' | 'incentive' | 'arrear' | 'correction' | 'advance' | 'other'
  amount: number
  month: number
  year: number
  description: string
  approvedBy: string
  status: PayrollStatus
  processedAt?: string
  payslipId?: string
  createdAt: string
}

export interface SalaryHold {
  id: string
  employeeId: string
  reason: string
  heldBy: string
  heldAt: string
  releasedBy?: string
  releasedAt?: string
  releaseAction?: 'process-as-salary' | 'process-as-arrear'
  status: 'held' | 'released'
}

// ============================================
// NEW TYPES - Employee Self-Service
// ============================================

export interface ExpenseClaim {
  id: string
  employeeId: string
  expenseType: 'travel' | 'food' | 'office-supplies' | 'communication' | 'medical' | 'other'
  amount: number
  date: string
  description: string
  receiptUrl?: string
  status: ExpenseStatus
  submittedAt?: string
  reviewedBy?: string
  reviewedAt?: string
  remarks?: string
  reimbursementAmount?: number
  reimbursementDate?: string
  createdAt: string
  updatedAt: string
}

export interface Loan {
  id: string
  employeeId: string
  loanType: LoanType
  amount: number
  tenureMonths: number
  monthlyEMI: number
  interestRate: number
  reason: string
  status: LoanStatus
  approvedBy?: string
  approvedAt?: string
  disbursedAt?: string
  closedAt?: string
  outstandingAmount: number
  repayments: LoanRepayment[]
  createdAt: string
}

export interface LoanRepayment {
  id: string
  loanId: string
  month: number
  year: number
  emiAmount: number
  principalAmount: number
  interestAmount: number
  outstandingBalance: number
  paidDate?: string
  status: 'pending' | 'paid'
}

export interface LeaveEncashment {
  id: string
  employeeId: string
  leaveType: LeaveType
  encashableDays: number
  perDaySalary: number
  totalAmount: number
  financialYear: string
  status: ApprovalStatus
  processedAt?: string
  payslipId?: string
  createdAt: string
}

export interface Gratuity {
  id: string
  employeeId: string
  lastDrawnSalary: number
  yearsOfService: number
  gratuityAmount: number
  eligibilityDate: string
  status: 'eligible' | 'claimed' | 'paid'
  claimedAt?: string
  paidAt?: string
  createdAt: string
}

// ============================================
// NEW TYPES - Full & Final Settlement
// ============================================

export interface FullFinalSettlement {
  id: string
  employeeId: string
  lastWorkingDate: string
  noticePeriodDays: number
  noticePeriodServed: number
  noticePeriodRecovery: number
  leaveEncashment: number
  gratuity: number
  loanRecovery: number
  otherDeductions: number
  grossAmount: number
  totalDeductions: number
  netPayable: number
  status: 'pending' | 'processed' | 'paid'
  processedBy?: string
  processedAt?: string
  paidAt?: string
  createdAt: string
}

// ============================================
// NEW TYPES - Audit & Reports
// ============================================

export interface AuditTrail {
  id: string
  userId: string
  userName: string
  userRole: string
  action: AuditAction
  module: string
  entityId: string
  entityType: string
  description: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress?: string
  timestamp: string
}

export interface PayrollVariance {
  id: string
  currentPeriodId: string
  previousPeriodId: string
  employeeId: string
  currentGross: number
  previousGross: number
  grossVariance: number
  grossVariancePercent: number
  currentNet: number
  previousNet: number
  netVariance: number
  netVariancePercent: number
  componentVariances: {
    componentName: string
    currentAmount: number
    previousAmount: number
    variance: number
    variancePercent: number
  }[]
  generatedAt: string
}

export interface CustomReport {
  id: string
  name: string
  description: string
  module: 'payroll' | 'attendance' | 'leave' | 'employee'
  columns: string[]
  filters: Record<string, any>
  groupBy?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  createdBy: string
  createdAt: string
  lastRunAt?: string
}

export interface PayrollDashboardStats {
  totalEmployees: number
  totalGross: number
  totalDeductions: number
  totalNet: number
  averageSalary: number
  ytdGross: number
  ytdDeductions: number
  ytdNet: number
  monthlyTrend: {
    month: number
    year: number
    gross: number
    deductions: number
    net: number
  }[]
  departmentWise: {
    department: string
    totalCTC: number
    employeeCount: number
    averageCTC: number
  }[]
}

export type OnboardingStatus = 'pending' | 'in-progress' | 'completed'

export interface OnboardingTask {
  id: string
  label: string
  completed: boolean
}

export interface OnboardingItem {
  id: string
  employeeId: string
  joiningDate: string
  status: OnboardingStatus
  documents: OnboardingTask[]
  setup: OnboardingTask[]
}

export type ExitStatus = 'serving-notice' | 'exited'

export interface ExitTask {
  id: string
  label: string
  completed: boolean
}

export interface ExitItem {
  id: string
  employeeId: string
  lastWorkingDay: string
  noticeStartDate: string
  status: ExitStatus
  formalities: ExitTask[]
}

// ============================================
// PAYROLL RUN DRAFT — single source of truth
// ============================================

export interface AttendanceResolution {
  date: string
  action: 'regularize' | 'lop'
  resolved: boolean
}

export interface EmployeeAttendanceDraft {
  employeeId: string
  lopDays: number
  resolutions: AttendanceResolution[]
  acknowledged: boolean
}

export interface JoinerDraft {
  employeeId: string
  joiningDate: string
  proRatedGross: number
  edited: boolean
}

export interface ExitDraft {
  employeeId: string
  lastWorkingDay: string
  action: 'pay' | 'hold'
}

export interface ArrearDraft {
  employeeId: string
  revisionId: string
  autoAmount: number
  overrideAmount: number
  comment: string
}

export interface OffCycleDraft {
  id: string
  employeeId: string
  name: string
  amount: number
  taxable: boolean
}

export interface HoldDraft {
  employeeId: string
  holdId: string
  action: 'hold' | 'release'
}

export interface StatutoryOverride {
  employeeId: string
  pt: number
  esi: number
  tds: number
  lwf: number
}

export interface PayrollDraft {
  periodKey: string
  month: number
  year: number
  selectedEmployees: string[]
  lastCompletedStep: number
  updatedAt: string
  attendance: EmployeeAttendanceDraft[]
  joiners: JoinerDraft[]
  exits: ExitDraft[]
  arrears: ArrearDraft[]
  offCyclePayments: OffCycleDraft[]
  holds: HoldDraft[]
  statutoryOverrides: StatutoryOverride[]
  recalculationNeeded: boolean
}
