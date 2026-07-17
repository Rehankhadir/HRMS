import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { useLeave } from '@/contexts/leave-context'
import { getNotifications } from '@/lib/notifications'
import { Avatar } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import {
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  Menu,
  LogOut,
  User,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  HelpCircle,
  XCircle,
} from 'lucide-react'

interface TopNavProps {
  onMenuClick: () => void
}

const breadcrumbMap: Record<string, string> = {
  '/': 'Dashboard',
  '/employees': 'Employees',
  '/employees/new': 'Add Employee',
  '/attendance': 'Attendance',
  '/leave': 'Leave',
  '/departments': 'Departments',
  '/designations': 'Designations',
  '/holidays': 'Holidays',
  '/documents': 'Documents',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/payroll': 'Payroll',
  '/payroll/run': 'Payroll Run',
  '/payroll/payslips': 'Payslips',
  '/payroll/history': 'Payroll History',
  '/payroll/settings': 'Payroll Settings',
  '/payroll/salary-assignment': 'Salary Assignment',
  '/payroll/revisions': 'Salary Revisions',
  '/payroll/arrears': 'Arrears',
  '/payroll/compliance': 'Statutory Compliance',
  '/payroll/declarations': 'Investment Declarations',
  '/payroll/form16': 'Form 16',
  '/payroll/ecr': 'ECR Reports',
  '/payroll/expenses': 'Expense Claims',
  '/payroll/loans': 'Loan Management',
  '/payroll/variance': 'Variance Analysis',
  '/payroll/audit': 'Audit Trail',
  '/payroll/off-cycle': 'Off-Cycle Payouts',
  '/payroll/holds': 'Salary Holds',
  '/payroll/encashment': 'Leave Encashment',
  '/payroll/gratuity': 'Gratuity',
  '/payroll/fnf': 'Full & Final',
  '/my-payslips': 'My Payslips',
  '/my-expenses': 'My Expenses',
  '/my-loans': 'My Loans',
  '/my-tax': 'Tax Planning',
  '/my-form16': 'Form 16',
  '/notifications': 'Notifications',
  '/announcements': 'Announcements',
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [darkMode, setDarkMode] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { getPendingForManager, getEmployeeLeaves } = useLeave()

  const myEmployeeId = user?.employeeId || '1'
  const notifications = getNotifications(user?.role, myEmployeeId, getPendingForManager, getEmployeeLeaves).slice(0, 5)

  const handleSearch = () => {
    if (searchQuery.trim()) {
      toast(`Searching for "${searchQuery}"...`, 'info')
    }
  }

  const pathSegments = location.pathname.split('/').filter(Boolean)
  const breadcrumbs = pathSegments.length === 0
    ? [{ label: 'Dashboard', href: '/' }]
    : pathSegments.map((segment, index) => ({
        label: breadcrumbMap[`/${segment}`] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        href: '/' + pathSegments.slice(0, index + 1).join('/'),
      }))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-xl px-4 sm:px-6">
      {/* Left: Menu + Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="hidden sm:flex items-center gap-2.5 text-base">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2.5">
              {index > 0 && <span className="text-gray-300 text-sm">/</span>}
              <span
                className={cn(
                  index === breadcrumbs.length - 1
                    ? "font-bold text-gray-900 text-lg"
                    : "text-gray-500 hover:text-gray-700 cursor-pointer"
                )}
                onClick={() => index < breadcrumbs.length - 1 && navigate(crumb.href)}
              >
                {crumb.label}
              </span>
            </div>
          ))}
        </nav>

        {/* Mobile Page Title */}
        <h1 className="sm:hidden text-base font-bold text-gray-900">
          {breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard'}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search - Desktop */}
        <div className={cn(
          "hidden lg:flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 transition-all duration-200",
          searchFocused && "ring-2 ring-primary/20 border-primary bg-white shadow-sm"
        )}>
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none w-48"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <kbd className="hidden xl:inline-flex items-center gap-0.5 rounded-md bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
            ⌘K
          </kbd>
        </div>

        {/* Search - Mobile */}
        <button
          className="lg:hidden rounded-xl p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          onClick={() => toast('Search functionality coming soon!', 'info')}
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Help */}
        <button className="hidden sm:flex rounded-xl p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-xl p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white shadow-sm">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-gray-100 bg-white shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <button className="text-xs text-primary hover:text-primary-dark font-medium" onClick={() => setShowNotifications(false)}>Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-400">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No new notifications</p>
                    </div>
                  ) : notifications.map((notif) => {
                    const IconComponent = notif.type === 'success' ? CheckCircle : notif.type === 'warning' ? Clock : notif.type === 'danger' ? XCircle : AlertCircle
                    return (
                    <div key={notif.id} className="flex items-start gap-3 border-b border-gray-50 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => { setShowNotifications(false); navigate('/notifications') }}>
                      <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
                        notif.type === 'success' ? 'bg-green-50 text-green-500' :
                        notif.type === 'warning' ? 'bg-amber-50 text-amber-500' :
                        notif.type === 'danger' ? 'bg-red-50 text-red-500' :
                        'bg-blue-50 text-blue-500'
                      }`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-700">{notif.message}</p>
                        <p className="mt-1 text-xs text-gray-400">{notif.time}</p>
                      </div>
                    </div>
                    )
                  })}
                </div>
                <div className="border-t border-gray-100 px-4 py-2.5">
                  <button className="w-full text-center text-xs text-primary hover:text-primary-dark font-medium" onClick={() => { setShowNotifications(false); navigate('/notifications') }}>
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 sm:gap-3 rounded-xl p-1.5 sm:pr-3 hover:bg-gray-100 transition-colors"
          >
            <div className="relative">
              <Avatar initials={user?.name?.split(' ').map(n => n[0]).join('') || 'U'} size="sm" color="#4F46E5" />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'Employee'}</p>
            </div>
            <ChevronDown className="hidden md:block h-4 w-4 text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gray-100 bg-white shadow-xl py-2 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                  <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || ''}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    const empId = user?.employeeId || '1'
                    navigate(`/employees/${empId}`)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="h-4 w-4 text-gray-400" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    navigate('/settings')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-4 w-4 text-gray-400" />
                  Settings
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    handleLogout()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
