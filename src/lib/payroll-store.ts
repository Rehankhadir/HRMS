import type {
  SalaryStructure,
  EmployeeSalary,
  PayrollPeriod,
  Payslip,
  PayrollRun,
  PayrollSettings,
  PayrollStatus,
  TaxSlab,
  TaxRegime,
} from '@/types'

const STORAGE_KEYS = {
  STRUCTURES: 'hrms_salary_structures',
  EMPLOYEE_SALARIES: 'hrms_employee_salaries',
  PERIODS: 'hrms_payroll_periods',
  PAYSLIPS: 'hrms_payslips',
  RUNS: 'hrms_payroll_runs',
  SETTINGS: 'hrms_payroll_settings',
  DATA_VERSION: 'hrms_data_version',
}

const CURRENT_DATA_VERSION = 3 // Increment this to force data refresh

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    console.error(`Failed to save to ${key}`)
  }
}

export const defaultTaxSlabs: TaxSlab[] = [
  { id: '1', regime: 'old', minIncome: 0, maxIncome: 250000, taxRate: 0, cessRate: 0 },
  { id: '2', regime: 'old', minIncome: 250001, maxIncome: 500000, taxRate: 5, cessRate: 0 },
  { id: '3', regime: 'old', minIncome: 500001, maxIncome: 1000000, taxRate: 20, cessRate: 0 },
  { id: '4', regime: 'old', minIncome: 1000001, maxIncome: null, taxRate: 30, cessRate: 0 },
  { id: '5', regime: 'new', minIncome: 0, maxIncome: 300000, taxRate: 0, cessRate: 0 },
  { id: '6', regime: 'new', minIncome: 300001, maxIncome: 600000, taxRate: 5, cessRate: 0 },
  { id: '7', regime: 'new', minIncome: 600001, maxIncome: 900000, taxRate: 10, cessRate: 0 },
  { id: '8', regime: 'new', minIncome: 900001, maxIncome: 1200000, taxRate: 15, cessRate: 0 },
  { id: '9', regime: 'new', minIncome: 1200001, maxIncome: 1500000, taxRate: 20, cessRate: 0 },
  { id: '10', regime: 'new', minIncome: 1500001, maxIncome: null, taxRate: 30, cessRate: 0 },
]

export const defaultPayrollSettings: PayrollSettings = {
  id: '1',
  pfContribution: {
    id: '1',
    employeeContribution: 12,
    employerContribution: 12,
    adminCharges: 0.5,
    edliCharges: 0.5,
    maxPensionableSalary: 15000,
    employeeRate: 12,
    employerRate: 12,
  },
  esicContribution: {
    id: '1',
    employeeRate: 0.75,
    employerRate: 3.25,
    maxEsiSalary: 21000,
    minEsiSalary: 0,
  },
  professionalTax: {
    enabled: true,
    slabs: [
      { minSalary: 0, maxSalary: 15000, tax: 0 },
      { minSalary: 15001, maxSalary: 20000, tax: 150 },
      { minSalary: 20001, maxSalary: 25000, tax: 200 },
      { minSalary: 25001, maxSalary: 30000, tax: 250 },
      { minSalary: 30001, maxSalary: 35000, tax: 300 },
      { minSalary: 35001, maxSalary: 40000, tax: 350 },
      { minSalary: 40001, maxSalary: 45000, tax: 400 },
      { minSalary: 45001, maxSalary: 50000, tax: 450 },
      { minSalary: 50001, maxSalary: Infinity, tax: 500 },
    ],
  },
  tdsSettings: {
    regime: 'new',
    taxSlabs: defaultTaxSlabs,
    standardDeduction: 75000,
    cessRate: 4,
  },
  gratuityEnabled: true,
  gratuityRate: 4.81,
  lopDeductionRate: 0,
  overtimeRate: 2,
  paymentModes: ['bank-transfer', 'cheque', 'cash'],
}

const defaultStructures: SalaryStructure[] = [
  {
    id: 'structure-1',
    name: 'Standard Structure',
    components: [
      { id: 'c1', name: 'Basic Salary', type: 'earning', value: 50, isPercentage: true, description: '40-50% of CTC' },
      { id: 'c2', name: 'HRA', type: 'earning', value: 20, isPercentage: true, description: 'House Rent Allowance' },
      { id: 'c3', name: 'Special Allowance', type: 'earning', value: 15, isPercentage: true, description: 'Special Allowance' },
      { id: 'c4', name: 'Transport Allowance', type: 'earning', value: 8000, isPercentage: false, description: 'Fixed Transport Allowance' },
      { id: 'c5', name: 'Medical Allowance', type: 'earning', value: 5000, isPercentage: false, description: 'Medical Expenses' },
      { id: 'c6', name: 'PF Employee', type: 'deduction', value: 12, isPercentage: true, maxLimit: 1800, description: 'Provident Fund' },
      { id: 'c7', name: 'ESI Employee', type: 'deduction', value: 0.75, isPercentage: true, maxLimit: 157.5, description: 'Employee State Insurance' },
      { id: 'c8', name: 'Professional Tax', type: 'deduction', value: 200, isPercentage: false, description: 'State Professional Tax' },
      { id: 'c9', name: 'TDS', type: 'deduction', value: 0, isPercentage: false, description: 'Tax Deducted at Source' },
    ],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'structure-2',
    name: 'Senior Management',
    components: [
      { id: 'c10', name: 'Basic Salary', type: 'earning', value: 40, isPercentage: true, description: '40% of CTC' },
      { id: 'c11', name: 'HRA', type: 'earning', value: 25, isPercentage: true, description: 'House Rent Allowance' },
      { id: 'c12', name: 'Special Allowance', type: 'earning', value: 20, isPercentage: true, description: 'Special Allowance' },
      { id: 'c13', name: 'Car Allowance', type: 'earning', value: 15000, isPercentage: false, description: 'Vehicle Maintenance' },
      { id: 'c14', name: 'Phone Allowance', type: 'earning', value: 3000, isPercentage: false, description: 'Communication' },
      { id: 'c15', name: 'PF Employee', type: 'deduction', value: 12, isPercentage: true, maxLimit: 1800, description: 'Provident Fund' },
      { id: 'c16', name: 'ESI Employee', type: 'deduction', value: 0.75, isPercentage: true, maxLimit: 157.5, description: 'Employee State Insurance' },
      { id: 'c17', name: 'Professional Tax', type: 'deduction', value: 200, isPercentage: false, description: 'State Professional Tax' },
      { id: 'c18', name: 'TDS', type: 'deduction', value: 0, isPercentage: false, description: 'Tax Deducted at Source' },
    ],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
]

const defaultEmployeeSalaries: EmployeeSalary[] = [
  // Sarah Chen - Engineering Manager ($165,000)
  {
    id: 'es-1',
    employeeId: '1',
    structureId: 'structure-2',
    basicSalary: 66000,
    grossSalary: 165000,
    netSalary: 142000,
    effectiveFrom: '2026-01-01',
    components: [
      { componentId: 'c10', value: 40, calculatedValue: 66000 },
      { componentId: 'c11', value: 25, calculatedValue: 41250 },
      { componentId: 'c12', value: 20, calculatedValue: 33000 },
      { componentId: 'c13', value: 15000, calculatedValue: 15000 },
      { componentId: 'c14', value: 3000, calculatedValue: 3000 },
      { componentId: 'c15', value: 12, calculatedValue: 1800 },
      { componentId: 'c16', value: 0.75, calculatedValue: 157.5 },
      { componentId: 'c17', value: 200, calculatedValue: 200 },
      { componentId: 'c18', value: 0, calculatedValue: 0 },
    ],
  },
  // Marcus Rivera - Senior Product Designer ($145,000)
  {
    id: 'es-2',
    employeeId: '2',
    structureId: 'structure-2',
    basicSalary: 58000,
    grossSalary: 145000,
    netSalary: 125000,
    effectiveFrom: '2026-01-01',
    components: [
      { componentId: 'c10', value: 40, calculatedValue: 58000 },
      { componentId: 'c11', value: 25, calculatedValue: 36250 },
      { componentId: 'c12', value: 20, calculatedValue: 29000 },
      { componentId: 'c13', value: 15000, calculatedValue: 15000 },
      { componentId: 'c14', value: 3000, calculatedValue: 3000 },
      { componentId: 'c15', value: 12, calculatedValue: 1800 },
      { componentId: 'c16', value: 0.75, calculatedValue: 157.5 },
      { componentId: 'c17', value: 200, calculatedValue: 200 },
      { componentId: 'c18', value: 0, calculatedValue: 0 },
    ],
  },
  // Emily Johnson - Marketing Manager ($135,000)
  {
    id: 'es-3',
    employeeId: '3',
    structureId: 'structure-1',
    basicSalary: 67500,
    grossSalary: 135000,
    netSalary: 117000,
    effectiveFrom: '2026-01-01',
    components: [
      { componentId: 'c1', value: 50, calculatedValue: 67500 },
      { componentId: 'c2', value: 20, calculatedValue: 27000 },
      { componentId: 'c3', value: 15, calculatedValue: 20250 },
      { componentId: 'c4', value: 8000, calculatedValue: 8000 },
      { componentId: 'c5', value: 5000, calculatedValue: 5000 },
      { componentId: 'c6', value: 12, calculatedValue: 1800 },
      { componentId: 'c7', value: 0.75, calculatedValue: 157.5 },
      { componentId: 'c8', value: 200, calculatedValue: 200 },
      { componentId: 'c9', value: 0, calculatedValue: 0 },
    ],
  },
  // David Park - Sales Director ($155,000)
  {
    id: 'es-4',
    employeeId: '4',
    structureId: 'structure-2',
    basicSalary: 62000,
    grossSalary: 155000,
    netSalary: 134000,
    effectiveFrom: '2026-01-01',
    components: [
      { componentId: 'c10', value: 40, calculatedValue: 62000 },
      { componentId: 'c11', value: 25, calculatedValue: 38750 },
      { componentId: 'c12', value: 20, calculatedValue: 31000 },
      { componentId: 'c13', value: 15000, calculatedValue: 15000 },
      { componentId: 'c14', value: 3000, calculatedValue: 3000 },
      { componentId: 'c15', value: 12, calculatedValue: 1800 },
      { componentId: 'c16', value: 0.75, calculatedValue: 157.5 },
      { componentId: 'c17', value: 200, calculatedValue: 200 },
      { componentId: 'c18', value: 0, calculatedValue: 0 },
    ],
  },
  // Lisa Thompson - HR Manager ($125,000)
  {
    id: 'es-5',
    employeeId: '5',
    structureId: 'structure-1',
    basicSalary: 62500,
    grossSalary: 125000,
    netSalary: 108000,
    effectiveFrom: '2026-01-01',
    components: [
      { componentId: 'c1', value: 50, calculatedValue: 62500 },
      { componentId: 'c2', value: 20, calculatedValue: 25000 },
      { componentId: 'c3', value: 15, calculatedValue: 18750 },
      { componentId: 'c4', value: 8000, calculatedValue: 8000 },
      { componentId: 'c5', value: 5000, calculatedValue: 5000 },
      { componentId: 'c6', value: 12, calculatedValue: 1800 },
      { componentId: 'c7', value: 0.75, calculatedValue: 157.5 },
      { componentId: 'c8', value: 200, calculatedValue: 200 },
      { componentId: 'c9', value: 0, calculatedValue: 0 },
    ],
  },
  // Alex Kim - Senior Software Engineer ($155,000)
  {
    id: 'es-6',
    employeeId: '6',
    structureId: 'structure-2',
    basicSalary: 62000,
    grossSalary: 155000,
    netSalary: 134000,
    effectiveFrom: '2026-01-01',
    components: [
      { componentId: 'c10', value: 40, calculatedValue: 62000 },
      { componentId: 'c11', value: 25, calculatedValue: 38750 },
      { componentId: 'c12', value: 20, calculatedValue: 31000 },
      { componentId: 'c13', value: 15000, calculatedValue: 15000 },
      { componentId: 'c14', value: 3000, calculatedValue: 3000 },
      { componentId: 'c15', value: 12, calculatedValue: 1800 },
      { componentId: 'c16', value: 0.75, calculatedValue: 157.5 },
      { componentId: 'c17', value: 200, calculatedValue: 200 },
      { componentId: 'c18', value: 0, calculatedValue: 0 },
    ],
  },
  // Rachel Green - Product Designer ($120,000)
  {
    id: 'es-7',
    employeeId: '7',
    structureId: 'structure-1',
    basicSalary: 60000,
    grossSalary: 120000,
    netSalary: 104000,
    effectiveFrom: '2026-01-01',
    components: [
      { componentId: 'c1', value: 50, calculatedValue: 60000 },
      { componentId: 'c2', value: 20, calculatedValue: 24000 },
      { componentId: 'c3', value: 15, calculatedValue: 18000 },
      { componentId: 'c4', value: 8000, calculatedValue: 8000 },
      { componentId: 'c5', value: 5000, calculatedValue: 5000 },
      { componentId: 'c6', value: 12, calculatedValue: 1800 },
      { componentId: 'c7', value: 0.75, calculatedValue: 157.5 },
      { componentId: 'c8', value: 200, calculatedValue: 200 },
      { componentId: 'c9', value: 0, calculatedValue: 0 },
    ],
  },
  // James Wilson - Finance Director ($160,000)
  {
    id: 'es-8',
    employeeId: '8',
    structureId: 'structure-2',
    basicSalary: 64000,
    grossSalary: 160000,
    netSalary: 138000,
    effectiveFrom: '2026-01-01',
    components: [
      { componentId: 'c10', value: 40, calculatedValue: 64000 },
      { componentId: 'c11', value: 25, calculatedValue: 40000 },
      { componentId: 'c12', value: 20, calculatedValue: 32000 },
      { componentId: 'c13', value: 15000, calculatedValue: 15000 },
      { componentId: 'c14', value: 3000, calculatedValue: 3000 },
      { componentId: 'c15', value: 12, calculatedValue: 1800 },
      { componentId: 'c16', value: 0.75, calculatedValue: 157.5 },
      { componentId: 'c17', value: 200, calculatedValue: 200 },
      { componentId: 'c18', value: 0, calculatedValue: 0 },
    ],
  },
  // Sophia Martinez - Content Strategist ($95,000)
  {
    id: 'es-9',
    employeeId: '9',
    structureId: 'structure-1',
    basicSalary: 47500,
    grossSalary: 95000,
    netSalary: 82000,
    effectiveFrom: '2026-01-01',
    components: [
      { componentId: 'c1', value: 50, calculatedValue: 47500 },
      { componentId: 'c2', value: 20, calculatedValue: 19000 },
      { componentId: 'c3', value: 15, calculatedValue: 14250 },
      { componentId: 'c4', value: 8000, calculatedValue: 8000 },
      { componentId: 'c5', value: 5000, calculatedValue: 5000 },
      { componentId: 'c6', value: 12, calculatedValue: 1800 },
      { componentId: 'c7', value: 0.75, calculatedValue: 157.5 },
      { componentId: 'c8', value: 200, calculatedValue: 200 },
      { componentId: 'c9', value: 0, calculatedValue: 0 },
    ],
  },
  // Michael Brown - Operations Manager ($130,000)
  {
    id: 'es-10',
    employeeId: '10',
    structureId: 'structure-1',
    basicSalary: 65000,
    grossSalary: 130000,
    netSalary: 113000,
    effectiveFrom: '2026-01-01',
    components: [
      { componentId: 'c1', value: 50, calculatedValue: 65000 },
      { componentId: 'c2', value: 20, calculatedValue: 26000 },
      { componentId: 'c3', value: 15, calculatedValue: 19500 },
      { componentId: 'c4', value: 8000, calculatedValue: 8000 },
      { componentId: 'c5', value: 5000, calculatedValue: 5000 },
      { componentId: 'c6', value: 12, calculatedValue: 1800 },
      { componentId: 'c7', value: 0.75, calculatedValue: 157.5 },
      { componentId: 'c8', value: 200, calculatedValue: 200 },
      { componentId: 'c9', value: 0, calculatedValue: 0 },
    ],
  },
]

const defaultPeriods: PayrollPeriod[] = [
  {
    id: 'period-2026-06',
    month: 6,
    year: 2026,
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    status: 'paid',
  },
  {
    id: 'period-2026-07',
    month: 7,
    year: 2026,
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    status: 'processed',
  },
]

const generatePayslips = (periodId: string, month: number, year: number): Payslip[] => {
  return defaultEmployeeSalaries.map((es, index) => {
    const earnings = [
      { name: 'Basic Salary', type: 'earning' as const, amount: es.basicSalary },
      { name: 'HRA', type: 'earning' as const, amount: Math.round(es.grossSalary * 0.2) },
      { name: 'Special Allowance', type: 'earning' as const, amount: Math.round(es.grossSalary * 0.15) },
      { name: 'Transport Allowance', type: 'earning' as const, amount: 8000 },
      { name: 'Medical Allowance', type: 'earning' as const, amount: 5000 },
    ]
    const deductions = [
      { name: 'PF', type: 'deduction' as const, amount: Math.min(Math.round(es.grossSalary * 0.12), 1800) },
      { name: 'ESI', type: 'deduction' as const, amount: es.grossSalary <= 21000 ? Math.round(es.grossSalary * 0.0075 * 100) / 100 : 0 },
      { name: 'Professional Tax', type: 'deduction' as const, amount: 200 },
      { name: 'TDS', type: 'deduction' as const, amount: Math.round(es.grossSalary * 0.1) },
    ]
    const gross = earnings.reduce((sum, e) => sum + e.amount, 0)
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0)
    return {
      id: `payslip-${periodId}-${index + 1}`,
      employeeId: es.employeeId,
      periodId,
      month,
      year,
      generatedAt: new Date().toISOString(),
      status: 'paid' as const,
      earnings,
      deductions,
      grossSalary: gross,
      totalDeductions,
      netSalary: gross - totalDeductions,
      paymentMode: 'bank-transfer' as const,
      paidAt: new Date().toISOString(),
      transactionId: `TXN${Date.now()}${index}`,
      workingDays: 30,
      daysPresent: 28 - Math.floor(Math.random() * 3),
      leaveDays: Math.floor(Math.random() * 3),
      lopDays: 0,
      overtimeHours: Math.floor(Math.random() * 10),
      overtimeAmount: Math.round(es.basicSalary / 30 / 8 * 2 * Math.floor(Math.random() * 10)),
    }
  })
}

const defaultPayslips = generatePayslips('period-2026-06', 6, 2026)

const totalGross = defaultEmployeeSalaries.reduce((sum, es) => sum + es.grossSalary, 0)
const totalDeductions = defaultPayslips.reduce((sum, p) => sum + p.totalDeductions, 0)

const defaultRuns: PayrollRun[] = [
  {
    id: 'run-2026-06',
    periodId: 'period-2026-06',
    processedBy: 'HR Admin',
    processedAt: '2026-06-28T10:00:00Z',
    totalEmployees: 10,
    totalGross,
    totalDeductions,
    totalNet: totalGross - totalDeductions,
    status: 'paid',
    payslipIds: defaultPayslips.map(p => p.id),
  },
]

class PayrollStore {
  private structures: SalaryStructure[]
  private employeeSalaries: EmployeeSalary[]
  private periods: PayrollPeriod[]
  private payslips: Payslip[]
  private runs: PayrollRun[]
  private settings: PayrollSettings

  constructor() {
    // Check data version and reset if needed
    const storedVersion = loadFromStorage(STORAGE_KEYS.DATA_VERSION, 1)
    if (storedVersion < CURRENT_DATA_VERSION) {
      // Clear old data and use defaults
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      saveToStorage(STORAGE_KEYS.DATA_VERSION, CURRENT_DATA_VERSION)
    }

    this.structures = loadFromStorage(STORAGE_KEYS.STRUCTURES, defaultStructures)
    this.employeeSalaries = loadFromStorage(STORAGE_KEYS.EMPLOYEE_SALARIES, defaultEmployeeSalaries)
    this.periods = loadFromStorage(STORAGE_KEYS.PERIODS, defaultPeriods)
    this.payslips = loadFromStorage(STORAGE_KEYS.PAYSLIPS, defaultPayslips)
    this.runs = loadFromStorage(STORAGE_KEYS.RUNS, defaultRuns)
    this.settings = loadFromStorage(STORAGE_KEYS.SETTINGS, defaultPayrollSettings)
  }

  getStructures() { return this.structures }
  getStructure(id: string) { return this.structures.find(s => s.id === id) }
  
  addStructure(structure: Omit<SalaryStructure, 'id' | 'createdAt' | 'updatedAt'>) {
    const newStructure: SalaryStructure = {
      ...structure,
      id: `structure-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.structures = [...this.structures, newStructure]
    saveToStorage(STORAGE_KEYS.STRUCTURES, this.structures)
    return newStructure
  }

  updateStructure(id: string, updates: Partial<SalaryStructure>) {
    this.structures = this.structures.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    )
    saveToStorage(STORAGE_KEYS.STRUCTURES, this.structures)
  }

  deleteStructure(id: string) {
    this.structures = this.structures.filter(s => s.id !== id)
    saveToStorage(STORAGE_KEYS.STRUCTURES, this.structures)
  }

  getEmployeeSalary(employeeId: string) {
    return this.employeeSalaries.find(es => es.employeeId === employeeId)
  }

  getEmployeeSalaries() { return this.employeeSalaries }

  updateEmployeeSalary(employeeId: string, salary: Partial<EmployeeSalary>) {
    const existing = this.employeeSalaries.find(es => es.employeeId === employeeId)
    if (existing) {
      this.employeeSalaries = this.employeeSalaries.map(es =>
        es.employeeId === employeeId ? { ...es, ...salary } : es
      )
    } else {
      this.employeeSalaries = [...this.employeeSalaries, {
        ...salary as EmployeeSalary,
        id: `es-${Date.now()}`,
        employeeId,
      }]
    }
    saveToStorage(STORAGE_KEYS.EMPLOYEE_SALARIES, this.employeeSalaries)
  }

  getPeriods() { return this.periods }
  getPeriod(id: string) { return this.periods.find(p => p.id === id) }

  createPeriod(month: number, year: number) {
    const id = `period-${year}-${String(month).padStart(2, '0')}`
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]
    const newPeriod: PayrollPeriod = {
      id,
      month,
      year,
      startDate,
      endDate,
      status: 'draft',
    }
    this.periods = [...this.periods, newPeriod]
    saveToStorage(STORAGE_KEYS.PERIODS, this.periods)
    return newPeriod
  }

  updatePeriodStatus(id: string, status: PayrollStatus) {
    this.periods = this.periods.map(p =>
      p.id === id ? { ...p, status } : p
    )
    saveToStorage(STORAGE_KEYS.PERIODS, this.periods)
  }

  getPayslips(periodId?: string, employeeId?: string) {
    let result = this.payslips
    if (periodId) {
      result = result.filter(p => p.periodId === periodId)
    }
    if (employeeId) {
      result = result.filter(p => p.employeeId === employeeId)
    }
    return result
  }

  getPayslip(id: string) { return this.payslips.find(p => p.id === id) }

  generatePayslips(periodId: string) {
    const period = this.periods.find(p => p.id === periodId)
    if (!period) return []
    
    const newPayslips = this.employeeSalaries.map((es, index) => {
      const earnings = [
        { name: 'Basic Salary', type: 'earning' as const, amount: es.basicSalary },
        { name: 'HRA', type: 'earning' as const, amount: Math.round(es.grossSalary * 0.2) },
        { name: 'Special Allowance', type: 'earning' as const, amount: Math.round(es.grossSalary * 0.15) },
        { name: 'Transport Allowance', type: 'earning' as const, amount: 8000 },
        { name: 'Medical Allowance', type: 'earning' as const, amount: 5000 },
      ]
      const deductions = [
        { name: 'PF', type: 'deduction' as const, amount: Math.min(Math.round(es.grossSalary * 0.12), 1800) },
        { name: 'ESI', type: 'deduction' as const, amount: es.grossSalary <= 21000 ? Math.round(es.grossSalary * 0.0075 * 100) / 100 : 0 },
        { name: 'Professional Tax', type: 'deduction' as const, amount: 200 },
        { name: 'TDS', type: 'deduction' as const, amount: Math.round(es.grossSalary * 0.1) },
      ]
      const gross = earnings.reduce((sum, e) => sum + e.amount, 0)
      const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0)
      
      return {
        id: `payslip-${periodId}-${index + 1}`,
        employeeId: es.employeeId,
        periodId,
        month: period.month,
        year: period.year,
        generatedAt: new Date().toISOString(),
        status: 'processed' as const,
        earnings,
        deductions,
        grossSalary: gross,
        totalDeductions,
        netSalary: gross - totalDeductions,
        paymentMode: 'bank-transfer' as const,
        workingDays: 30,
        daysPresent: 28,
        leaveDays: 2,
        lopDays: 0,
        overtimeHours: 0,
        overtimeAmount: 0,
      }
    })

    this.payslips = [...this.payslips.filter(p => p.periodId !== periodId), ...newPayslips]
    saveToStorage(STORAGE_KEYS.PAYSLIPS, this.payslips)
    return newPayslips
  }

  processPayroll(periodId: string, processedBy: string) {
    const periodPayslips = this.payslips.filter(p => p.periodId === periodId)
    const totalGross = periodPayslips.reduce((sum, p) => sum + p.grossSalary, 0)
    const totalDeductions = periodPayslips.reduce((sum, p) => sum + p.totalDeductions, 0)
    const totalNet = periodPayslips.reduce((sum, p) => sum + p.netSalary, 0)

    const run: PayrollRun = {
      id: `run-${periodId}`,
      periodId,
      processedBy,
      processedAt: new Date().toISOString(),
      totalEmployees: periodPayslips.length,
      totalGross,
      totalDeductions,
      totalNet,
      status: 'processed',
      payslipIds: periodPayslips.map(p => p.id),
    }

    this.runs = [...this.runs, run]
    this.updatePeriodStatus(periodId, 'processed')
    this.payslips = this.payslips.map(p =>
      p.periodId === periodId ? { ...p, status: 'processed' as const } : p
    )
    saveToStorage(STORAGE_KEYS.RUNS, this.runs)
    saveToStorage(STORAGE_KEYS.PAYSLIPS, this.payslips)
    return run
  }

  markPaid(periodId: string) {
    this.updatePeriodStatus(periodId, 'paid')
    this.payslips = this.payslips.map(p =>
      p.periodId === periodId ? { ...p, status: 'paid' as const, paidAt: new Date().toISOString() } : p
    )
    this.runs = this.runs.map(r =>
      r.periodId === periodId ? { ...r, status: 'paid' as const } : r
    )
    saveToStorage(STORAGE_KEYS.PAYSLIPS, this.payslips)
    saveToStorage(STORAGE_KEYS.RUNS, this.runs)
  }

  getRuns() { return this.runs }
  getRun(id: string) { return this.runs.find(r => r.id === id) }

  getSettings() { return this.settings }
  updateSettings(updates: Partial<PayrollSettings>) {
    this.settings = { ...this.settings, ...updates }
    saveToStorage(STORAGE_KEYS.SETTINGS, this.settings)
  }

  calculateTax(annualIncome: number, regime: TaxRegime): number {
    const slabs = this.settings.tdsSettings.taxSlabs.filter(s => s.regime === regime)
    let tax = 0
    let remaining = annualIncome - this.settings.tdsSettings.standardDeduction
    
    for (const slab of slabs) {
      if (remaining <= 0) break
      const slabMax = slab.maxIncome || Infinity
      const slabIncome = Math.min(remaining, slabMax - slab.minIncome)
      tax += slabIncome * (slab.taxRate / 100)
      remaining -= slabIncome
    }
    
    return Math.round(tax + (tax * this.settings.tdsSettings.cessRate / 100))
  }
}

export const payrollStore = new PayrollStore()
