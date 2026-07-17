export type UserRole = 'admin' | 'hr' | 'employee' | 'accounts' | 'manager'

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
  employeeId?: string // Links to employee record for HR/Employee roles
  avatar?: string
}

export interface RolePermissions {
  dashboard: boolean
  employees: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    viewSalary: boolean
  }
  departments: boolean
  designations: boolean
  attendance: {
    viewAll: boolean
    markOwn: boolean
    editAll: boolean
  }
  leave: {
    apply: boolean
    approve: boolean
    viewAll: boolean
  }
  holidays: boolean
  documents: {
    viewAll: boolean
    upload: boolean
    delete: boolean
  }
  payroll: {
    view: boolean
    process: boolean
    viewSalary: boolean
    editSalary: boolean
  }
  reports: boolean
  settings: boolean
}

export const users: User[] = [
  // Admin Users
  {
    id: 'user-1',
    email: 'admin@acme.com',
    password: 'admin123',
    name: 'John Admin',
    role: 'admin',
  },
  {
    id: 'user-2',
    email: 'superadmin@acme.com',
    password: 'super123',
    name: 'Super Admin',
    role: 'admin',
  },

  // HR Users
  {
    id: 'user-3',
    email: 'hr@acme.com',
    password: 'hr123',
    name: 'Lisa Thompson',
    role: 'hr',
    employeeId: '5', // Links to HR Manager employee record
  },
  {
    id: 'user-4',
    email: 'hrmanager@acme.com',
    password: 'hrm123',
    name: 'HR Manager',
    role: 'hr',
    employeeId: '5',
  },

  // Employee Users
  {
    id: 'user-5',
    email: 'sarah@acme.com',
    password: 'emp123',
    name: 'Sarah Chen',
    role: 'employee',
    employeeId: '1', // Engineering Manager
  },
  {
    id: 'user-6',
    email: 'marcus@acme.com',
    password: 'emp123',
    name: 'Marcus Rivera',
    role: 'employee',
    employeeId: '2', // Senior Product Designer
  },
  {
    id: 'user-7',
    email: 'emily@acme.com',
    password: 'emp123',
    name: 'Emily Johnson',
    role: 'employee',
    employeeId: '3', // Marketing Manager
  },
  {
    id: 'user-8',
    email: 'david@acme.com',
    password: 'emp123',
    name: 'David Park',
    role: 'employee',
    employeeId: '4', // Sales Director
  },
  {
    id: 'user-9',
    email: 'alex@acme.com',
    password: 'emp123',
    name: 'Alex Kim',
    role: 'employee',
    employeeId: '6', // Senior Software Engineer
  },
  {
    id: 'user-10',
    email: 'rachel@acme.com',
    password: 'emp123',
    name: 'Rachel Green',
    role: 'employee',
    employeeId: '7', // Product Designer
  },
  {
    id: 'user-11',
    email: 'james@acme.com',
    password: 'emp123',
    name: 'James Wilson',
    role: 'employee',
    employeeId: '8', // Finance Director
  },
  {
    id: 'user-12',
    email: 'sophia@acme.com',
    password: 'emp123',
    name: 'Sophia Martinez',
    role: 'employee',
    employeeId: '9', // Content Strategist
  },
  {
    id: 'user-13',
    email: 'michael@acme.com',
    password: 'emp123',
    name: 'Michael Brown',
    role: 'employee',
    employeeId: '10', // Operations Manager
  },

  // Accounts Users
  {
    id: 'user-14',
    email: 'accounts@zenith.com',
    password: 'acc123',
    name: 'Priya Sharma',
    role: 'accounts',
    employeeId: '8', // Finance Director
  },

  // Manager Users
  {
    id: 'user-15',
    email: 'david@acme.com',
    password: 'mgr123',
    name: 'David Park',
    role: 'manager',
    employeeId: '4', // Sales Director
  },
]

export const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    dashboard: true,
    employees: { view: true, create: true, edit: true, delete: true, viewSalary: true },
    departments: true,
    designations: true,
    attendance: { viewAll: true, markOwn: true, editAll: true },
    leave: { apply: true, approve: true, viewAll: true },
    holidays: true,
    documents: { viewAll: true, upload: true, delete: true },
    payroll: { view: true, process: true, viewSalary: true, editSalary: true },
    reports: true,
    settings: true,
  },
  hr: {
    dashboard: true,
    employees: { view: true, create: true, edit: true, delete: false, viewSalary: true },
    departments: true,
    designations: true,
    attendance: { viewAll: true, markOwn: true, editAll: false },
    leave: { apply: true, approve: true, viewAll: true },
    holidays: true,
    documents: { viewAll: true, upload: true, delete: false },
    payroll: { view: true, process: true, viewSalary: true, editSalary: false },
    reports: true,
    settings: false,
  },
  employee: {
    dashboard: true,
    employees: { view: false, create: false, edit: false, delete: false, viewSalary: false },
    departments: false,
    designations: false,
    attendance: { viewAll: false, markOwn: true, editAll: false },
    leave: { apply: true, approve: false, viewAll: false },
    holidays: true,
    documents: { viewAll: false, upload: true, delete: false },
    payroll: { view: false, process: false, viewSalary: false, editSalary: false },
    reports: false,
    settings: false,
  },
  accounts: {
    dashboard: true,
    employees: { view: true, create: false, edit: false, delete: false, viewSalary: true },
    departments: false,
    designations: false,
    attendance: { viewAll: false, markOwn: true, editAll: false },
    leave: { apply: true, approve: false, viewAll: false },
    holidays: true,
    documents: { viewAll: true, upload: false, delete: false },
    payroll: { view: true, process: true, viewSalary: true, editSalary: false },
    reports: true,
    settings: false,
  },
  manager: {
    dashboard: true,
    employees: { view: true, create: false, edit: false, delete: false, viewSalary: false },
    departments: false,
    designations: false,
    attendance: { viewAll: false, markOwn: true, editAll: false },
    leave: { apply: true, approve: true, viewAll: false },
    holidays: true,
    documents: { viewAll: false, upload: true, delete: false },
    payroll: { view: false, process: false, viewSalary: false, editSalary: false },
    reports: false,
    settings: false,
  },
}

// Manager has all employee permissions + approve leave + view team
// This is handled by combining employee permissions with manager-specific overrides

export function authenticateUser(email: string, password: string): User | null {
  const user = users.find(u => u.email === email && u.password === password)
  return user || null
}

export function getUserPermissions(role: UserRole): RolePermissions {
  return rolePermissions[role]
}

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = rolePermissions[role]
  const keys = permission.split('.')
  
  let current: any = permissions
  for (const key of keys) {
    if (current === undefined || current === null) return false
    current = current[key]
  }
  
  return !!current
}
