import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { useLeave } from '@/contexts/leave-context'
import { useAnnouncements } from '@/contexts/announcement-context'
import { getNotifications } from '@/lib/notifications'
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Building2,
  Briefcase,
  PartyPopper,
  FileText,
  BarChart3,
  Settings,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Receipt,
  TrendingUp,
  AlertTriangle,
  Shield,
  CreditCard,
  Landmark,
  Calculator,
  FileCheck,
  ClipboardList,
  ScrollText,
  Wallet,
  PiggyBank,
  Scale,
  Bell,
  Zap,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: typeof LayoutDashboard
  permission?: string
  badge?: number
}

interface NavGroup {
  label: string
  items: NavItem[]
  permission?: string
}

const adminNavigation: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    label: '',
    items: [
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Announcements', href: '/announcements', icon: Zap },
    ],
  },
  {
    label: 'People',
    items: [
      { name: 'Employees', href: '/employees', icon: Users, permission: 'employees.view' },
      { name: 'Departments', href: '/departments', icon: Building2, permission: 'departments' },
      { name: 'Designations', href: '/designations', icon: Briefcase, permission: 'designations' },
    ],
  },
  {
    label: 'Workforce',
    items: [
      { name: 'Attendance', href: '/attendance', icon: Clock },
      { name: 'Leave', href: '/leave', icon: CalendarDays },
      { name: 'Holidays', href: '/holidays', icon: PartyPopper, permission: 'holidays' },
    ],
  },
  {
    label: 'Organization',
    items: [
      { name: 'Documents', href: '/documents', icon: FileText },
    ],
  },
  {
    label: 'Payroll',
    items: [
      { name: 'Salary Assignment', href: '/payroll/salary-assignment', icon: Wallet },
      { name: 'Salary Revisions', href: '/payroll/revisions', icon: TrendingUp },
      { name: 'Arrears', href: '/payroll/arrears', icon: AlertTriangle },
      { name: 'Salary Holds', href: '/payroll/holds', icon: AlertTriangle },
      { name: 'Off-Cycle Payouts', href: '/payroll/off-cycle', icon: PiggyBank },
      { name: 'Payroll Run', href: '/payroll/run', icon: ClipboardList },
      { name: 'Payslips', href: '/payroll/payslips', icon: Receipt },
      { name: 'Payroll History', href: '/payroll/history', icon: ScrollText },
      { name: 'Payroll Dashboard', href: '/payroll', icon: DollarSign },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { name: 'Statutory Compliance', href: '/payroll/compliance', icon: Scale },
      { name: 'Investment Declarations', href: '/payroll/declarations', icon: Landmark },
      { name: 'Form 16', href: '/payroll/form16', icon: FileCheck },
      { name: 'ECR Reports', href: '/payroll/ecr', icon: FileText },
    ],
  },
  {
    label: 'Employee Finance',
    items: [
      { name: 'Expense Claims', href: '/payroll/expenses', icon: CreditCard },
      { name: 'Loan Management', href: '/payroll/loans', icon: Calculator },
      { name: 'Leave Encashment', href: '/payroll/encashment', icon: CalendarDays },
      { name: 'Gratuity', href: '/payroll/gratuity', icon: PiggyBank },
      { name: 'Full & Final', href: '/payroll/fnf', icon: Scale },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { name: 'Reports', href: '/reports', icon: BarChart3 },
      { name: 'Variance Analysis', href: '/payroll/variance', icon: TrendingUp },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Audit Trail', href: '/payroll/audit', icon: Shield },
      { name: 'Payroll Settings', href: '/payroll/settings', icon: Settings },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

const hrNavigation: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    label: '',
    items: [
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Announcements', href: '/announcements', icon: Zap },
    ],
  },
  {
    label: 'People',
    items: [
      { name: 'Employees', href: '/employees', icon: Users, permission: 'employees.view' },
      { name: 'Departments', href: '/departments', icon: Building2, permission: 'departments' },
      { name: 'Designations', href: '/designations', icon: Briefcase, permission: 'designations' },
    ],
  },
  {
    label: 'Workforce',
    items: [
      { name: 'Attendance', href: '/attendance', icon: Clock },
      { name: 'Leave', href: '/leave', icon: CalendarDays },
      { name: 'Holidays', href: '/holidays', icon: PartyPopper, permission: 'holidays' },
    ],
  },
  {
    label: 'Organization',
    items: [
      { name: 'Documents', href: '/documents', icon: FileText },
    ],
  },
  {
    label: 'Payroll',
    items: [
      { name: 'Payroll Dashboard', href: '/payroll', icon: DollarSign },
      { name: 'Salary Revisions', href: '/payroll/revisions', icon: TrendingUp },
      { name: 'Arrears', href: '/payroll/arrears', icon: AlertTriangle },
      { name: 'Payroll Run', href: '/payroll/run', icon: ClipboardList },
      { name: 'Payslips', href: '/payroll/payslips', icon: Receipt },
      { name: 'Payroll History', href: '/payroll/history', icon: ScrollText },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { name: 'Statutory Compliance', href: '/payroll/compliance', icon: Scale },
      { name: 'Investment Declarations', href: '/payroll/declarations', icon: Landmark },
      { name: 'Form 16', href: '/payroll/form16', icon: FileCheck },
    ],
  },
  {
    label: 'Employee Finance',
    items: [
      { name: 'Expense Claims', href: '/payroll/expenses', icon: CreditCard },
      { name: 'Loan Management', href: '/payroll/loans', icon: Calculator },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { name: 'Reports', href: '/reports', icon: BarChart3 },
      { name: 'Variance Analysis', href: '/payroll/variance', icon: TrendingUp },
    ],
  },
]

const employeeNavigation: NavGroup[] = [
  {
    label: '',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Announcements', href: '/announcements', icon: Zap },
    ],
  },
  {
    label: 'My Profile',
    items: [
      { name: 'My Attendance', href: '/attendance', icon: Clock },
      { name: 'My Leave', href: '/leave', icon: CalendarDays },
      { name: 'Holidays', href: '/holidays', icon: PartyPopper },
    ],
  },
  {
    label: 'My Finance',
    items: [
      { name: 'My Payslips', href: '/my-payslips', icon: Receipt },
      { name: 'My Expenses', href: '/my-expenses', icon: CreditCard },
      { name: 'My Loans', href: '/my-loans', icon: Calculator },
      { name: 'Tax Planning', href: '/my-tax', icon: Landmark },
      { name: 'Form 16', href: '/my-form16', icon: FileCheck },
    ],
  },
  {
    label: 'Resources',
    items: [
      { name: 'Documents', href: '/documents', icon: FileText },
    ],
  },
]

const accountsNavigation: NavGroup[] = [
  {
    label: '',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Announcements', href: '/announcements', icon: Zap },
    ],
  },
  {
    label: 'Payroll',
    items: [
      { name: 'Payroll Dashboard', href: '/payroll', icon: DollarSign },
      { name: 'Payroll Run', href: '/payroll/run', icon: ClipboardList },
      { name: 'Payslips', href: '/payroll/payslips', icon: Receipt },
      { name: 'Payroll History', href: '/payroll/history', icon: ScrollText },
      { name: 'Salary Assignment', href: '/payroll/salary-assignment', icon: Wallet },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { name: 'Statutory Compliance', href: '/payroll/compliance', icon: Scale },
      { name: 'ECR Reports', href: '/payroll/ecr', icon: FileText },
      { name: 'Form 16', href: '/payroll/form16', icon: FileCheck },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { name: 'Reports', href: '/reports', icon: BarChart3 },
      { name: 'Variance Analysis', href: '/payroll/variance', icon: TrendingUp },
    ],
  },
  {
    label: 'My Profile',
    items: [
      { name: 'My Attendance', href: '/attendance', icon: Clock },
      { name: 'My Leave', href: '/leave', icon: CalendarDays },
      { name: 'Holidays', href: '/holidays', icon: PartyPopper },
    ],
  },
  {
    label: 'My Finance',
    items: [
      { name: 'My Payslips', href: '/my-payslips', icon: Receipt },
      { name: 'My Expenses', href: '/my-expenses', icon: CreditCard },
      { name: 'My Loans', href: '/my-loans', icon: Calculator },
      { name: 'Tax Planning', href: '/my-tax', icon: Landmark },
      { name: 'Form 16', href: '/my-form16', icon: FileCheck },
    ],
  },
]

const managerNavigation: NavGroup[] = [
  {
    label: '',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Announcements', href: '/announcements', icon: Zap },
    ],
  },
  {
    label: 'Team',
    items: [
      { name: 'My Team', href: '/employees', icon: Users },
    ],
  },
  {
    label: 'My Profile',
    items: [
      { name: 'My Attendance', href: '/attendance', icon: Clock },
      { name: 'My Leave', href: '/leave', icon: CalendarDays },
      { name: 'Holidays', href: '/holidays', icon: PartyPopper },
    ],
  },
  {
    label: 'My Finance',
    items: [
      { name: 'My Payslips', href: '/my-payslips', icon: Receipt },
      { name: 'My Expenses', href: '/my-expenses', icon: CreditCard },
      { name: 'My Loans', href: '/my-loans', icon: Calculator },
      { name: 'Tax Planning', href: '/my-tax', icon: Landmark },
      { name: 'Form 16', href: '/my-form16', icon: FileCheck },
    ],
  },
  {
    label: 'Resources',
    items: [
      { name: 'Documents', href: '/documents', icon: FileText },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onClose: () => void
}

export function Sidebar({ collapsed, onToggle, onClose }: SidebarProps) {
  const location = useLocation()
  const { user, hasPermission } = useAuth()
  const { getPendingForManager, getEmployeeLeaves } = useLeave()
  const { announcements } = useAnnouncements()

  const myEmployeeId = user?.employeeId || '1'
  const notificationCount = getNotifications(user?.role, myEmployeeId, getPendingForManager, getEmployeeLeaves).length

  const getNavigation = () => {
    switch (user?.role) {
      case 'admin': return adminNavigation
      case 'hr': return hrNavigation
      case 'accounts': return accountsNavigation
      case 'employee': return employeeNavigation
      case 'manager': return managerNavigation
      default: return adminNavigation
    }
  }

  const navigation = getNavigation()

  const filterItemsByPermission = (items: NavItem[]) => {
    return items.filter(item => {
      if (!item.permission) return true
      return hasPermission(item.permission)
    })
  }

  const filteredNavigation = navigation
    .map(group => ({
      ...group,
      items: filterItemsByPermission(group.items),
    }))
    .filter(group => {
      if (group.permission) return hasPermission(group.permission)
      return group.items.length > 0
    })

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-white border-r border-gray-100 transition-all duration-300 flex flex-col",
        collapsed ? "w-[72px]" : "w-64"
      )}
      style={{ boxShadow: '1px 0 3px 0 rgb(0 0 0 / 0.02)' }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-indigo-500 to-purple-600 text-white font-black text-sm shadow-lg shadow-primary/30 tracking-tighter">
              Z
            </div>
            <span className="text-lg font-black tracking-tighter bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent select-none" style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif", letterSpacing: '-0.05em' }}>
              Zenith
            </span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-indigo-500 to-purple-600 text-white font-black text-sm shadow-lg shadow-primary/30 tracking-tighter">
            Z
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
        {filteredNavigation.map((group) => (
          <div key={group.label || 'root'}>
            {group.label && !collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {group.label}
              </p>
            )}
            {group.label && collapsed && <div className="mx-auto mb-2 h-px w-6 bg-gray-200" />}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      collapsed && "justify-center px-0"
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-gray-400")} />
                    {!collapsed && <span>{item.name}</span>}
                    {!collapsed && item.name === 'Notifications' && notificationCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                    {collapsed && item.name === 'Notifications' && notificationCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-gray-100 p-3 shrink-0">
        <button
          onClick={onToggle}
          className="hidden lg:flex w-full items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}
