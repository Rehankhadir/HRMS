import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { ToastProvider } from '@/components/ui/toast'
import { Layout } from '@/components/layout/layout'
import { LoginPage } from '@/pages/auth/login'
import { Dashboard } from '@/pages/dashboard'
import { EmployeeList } from '@/pages/employee-list'
import { EmployeeProfile } from '@/pages/employee-profile'
import { AddEmployee } from '@/pages/add-employee'
import { Attendance } from '@/pages/attendance'
import { Leave } from '@/pages/leave'
import { Departments } from '@/pages/departments'
import { Designations } from '@/pages/designations'
import { Holidays } from '@/pages/holidays'
import { Documents } from '@/pages/documents'
import { Reports } from '@/pages/reports'
import { Settings } from '@/pages/settings'
import { NotificationsPage } from '@/pages/notifications'
import { AnnouncementsPage } from '@/pages/announcements'
import {
  PayrollDashboard, PayrollRun, Payslips, PayrollHistory, SalarySettings, SalaryAssignment,
  SalaryRevisions, ArrearsManagement, Compliance, InvestmentDeclarations,
  ExpenseClaims, LoanManagement, TaxPlanning,
  AuditTrailPage, VarianceAnalysis, Form16Page,
  OffCyclePayouts, SalaryHolds, LeaveEncashment, GratuityPage, FullFinalSettlement, ECRReports,
} from '@/pages/payroll'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

function HRRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user?.role !== 'admin' && user?.role !== 'hr' && user?.role !== 'accounts' && user?.role !== 'manager') return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* All roles */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/holidays" element={<Holidays />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/my-payslips" element={<Payslips />} />
        <Route path="/my-expenses" element={<ExpenseClaims />} />
        <Route path="/my-loans" element={<LoanManagement />} />
        <Route path="/my-tax" element={<TaxPlanning />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/my-form16" element={<Form16Page />} />

        {/* HR/Admin */}
        <Route path="/employees" element={<HRRoute><EmployeeList /></HRRoute>} />
        <Route path="/employees/new" element={<HRRoute><AddEmployee /></HRRoute>} />
        <Route path="/employees/:id" element={<ProtectedRoute><EmployeeProfile /></ProtectedRoute>} />
        <Route path="/departments" element={<HRRoute><Departments /></HRRoute>} />
        <Route path="/designations" element={<HRRoute><Designations /></HRRoute>} />
        <Route path="/reports" element={<HRRoute><Reports /></HRRoute>} />

        {/* Payroll - HR/Admin */}
        <Route path="/payroll" element={<HRRoute><PayrollDashboard /></HRRoute>} />
        <Route path="/payroll/run" element={<HRRoute><PayrollRun /></HRRoute>} />
        <Route path="/payroll/payslips" element={<HRRoute><Payslips /></HRRoute>} />
        <Route path="/payroll/history" element={<HRRoute><PayrollHistory /></HRRoute>} />
        <Route path="/payroll/revisions" element={<HRRoute><SalaryRevisions /></HRRoute>} />
        <Route path="/payroll/arrears" element={<HRRoute><ArrearsManagement /></HRRoute>} />
        <Route path="/payroll/compliance" element={<HRRoute><Compliance /></HRRoute>} />
        <Route path="/payroll/declarations" element={<HRRoute><InvestmentDeclarations /></HRRoute>} />
        <Route path="/payroll/expenses" element={<HRRoute><ExpenseClaims /></HRRoute>} />
        <Route path="/payroll/loans" element={<HRRoute><LoanManagement /></HRRoute>} />
        <Route path="/payroll/form16" element={<HRRoute><Form16Page /></HRRoute>} />
        <Route path="/payroll/variance" element={<HRRoute><VarianceAnalysis /></HRRoute>} />
        <Route path="/payroll/off-cycle" element={<HRRoute><OffCyclePayouts /></HRRoute>} />
        <Route path="/payroll/holds" element={<HRRoute><SalaryHolds /></HRRoute>} />
        <Route path="/payroll/encashment" element={<HRRoute><LeaveEncashment /></HRRoute>} />
        <Route path="/payroll/gratuity" element={<HRRoute><GratuityPage /></HRRoute>} />
        <Route path="/payroll/fnf" element={<HRRoute><FullFinalSettlement /></HRRoute>} />
        <Route path="/payroll/ecr" element={<HRRoute><ECRReports /></HRRoute>} />

        {/* Admin only */}
        <Route path="/payroll/settings" element={<AdminRoute><SalarySettings /></AdminRoute>} />
        <Route path="/payroll/salary-assignment" element={<AdminRoute><SalaryAssignment /></AdminRoute>} />
        <Route path="/payroll/audit" element={<AdminRoute><AuditTrailPage /></AdminRoute>} />
        <Route path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
