import { useAuth } from '@/contexts/auth-context'
import { AdminDashboard } from '@/pages/dashboards/admin-dashboard'
import { EmployeeDashboard } from '@/pages/dashboards/employee-dashboard'
import { AccountsDashboard } from '@/pages/dashboards/accounts-dashboard'

export function Dashboard() {
  const { user } = useAuth()

  if (user?.role === 'employee' || user?.role === 'manager') {
    return <EmployeeDashboard />
  }

  if (user?.role === 'accounts') {
    return <AccountsDashboard />
  }

  return <AdminDashboard />
}
