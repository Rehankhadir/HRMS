import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import {
  Settings as SettingsIcon,
  Building2,
  Shield,
  Bell,
  Palette,
  Save,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export function Settings() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('company')

  const handleSave = (section: string) => {
    toast(`${section} settings saved successfully!`, 'success')
  }

  const tabs = [
    { id: 'company', label: 'Company', shortLabel: 'Company', icon: Building2 },
    { id: 'roles', label: 'Roles', shortLabel: 'Roles', icon: Shield },
    { id: 'general', label: 'General', shortLabel: 'General', icon: SettingsIcon },
    { id: 'theme', label: 'Theme', shortLabel: 'Theme', icon: Palette },
    { id: 'notifications', label: 'Notifications', shortLabel: 'Notify', icon: Bell },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 sm:space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={item}>
        <h1 className="text-sm sm:text-base font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-xs sm:text-sm text-text-secondary">Manage your organization settings and preferences.</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <div className="flex gap-1 sm:gap-1.5 rounded-lg bg-background p-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div variants={item}>
        {activeTab === 'company' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm">Company Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-xs sm:text-sm">Company Name</Label>
                  <Input id="companyName" defaultValue="Zenith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm">Company Email</Label>
                  <Input id="email" type="email" defaultValue="info@acme.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs sm:text-sm">Phone</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-xs sm:text-sm">Website</Label>
                  <Input id="website" defaultValue="https://acme.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs sm:text-sm">Address</Label>
                <Input id="address" defaultValue="123 Business Street, San Francisco, CA 94102" />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave('Company')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'roles' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xs sm:text-sm">Roles & Permissions</CardTitle>
              <Button size="sm" onClick={() => toast('Role creation form opened!', 'info')}>Add Role</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Admin', description: 'Full access to all features', users: 2 },
                  { name: 'HR Manager', description: 'Manage employees and leave', users: 3 },
                  { name: 'Manager', description: 'View team and approve leaves', users: 8 },
                  { name: 'Employee', description: 'Self-service access only', users: 129 },
                ].map((role) => (
                  <div key={role.name} className="flex items-center justify-between rounded-lg border border-border p-3 sm:p-4">
                    <div>
                      <p className="text-xs font-medium text-text-primary">{role.name}</p>
                      <p className="text-xs text-text-secondary">{role.description}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <span className="text-xs text-text-secondary">{role.users} users</span>
                      <Button variant="outline" size="sm" onClick={() => toast(`Editing role "${role.name}"...`, 'info')}>Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'general' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-xs sm:text-sm">Timezone</Label>
                  <Input id="timezone" defaultValue="Pacific Time (PT)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-xs sm:text-sm">Language</Label>
                  <Input id="language" defaultValue="English" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat" className="text-xs sm:text-sm">Date Format</Label>
                  <Input id="dateFormat" defaultValue="MM/DD/YYYY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-xs sm:text-sm">Currency</Label>
                  <Input id="currency" defaultValue="USD" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave('General')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'theme' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm">Theme Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div>
                <Label className="text-xs sm:text-sm">Color Theme</Label>
                <div className="mt-3 flex gap-3 sm:gap-4">
                  {['Light', 'Dark', 'System'].map((theme) => (
                    <button
                      key={theme}
                      className={`flex h-16 sm:h-20 w-full sm:w-32 items-center justify-center rounded-lg border-2 transition-colors ${
                        theme === 'Light'
                          ? 'border-primary bg-white'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-medium">{theme}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs sm:text-sm">Accent Color</Label>
                <div className="mt-3 flex gap-2 sm:gap-3">
                  {['#2563EB', '#8B5CF6', '#EC4899', '#22C55E', '#F59E0B', '#EF4444'].map((color) => (
                    <button
                      key={color}
                      className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full transition-transform hover:scale-110 ${
                        color === '#2563EB' ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave('Theme')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Email notifications for new leave requests', checked: true },
                { label: 'Email notifications for attendance alerts', checked: true },
                { label: 'Push notifications for approvals', checked: false },
                { label: 'Weekly attendance summary', checked: true },
                { label: 'Monthly leave balance reminder', checked: true },
                { label: 'Birthday and anniversary alerts', checked: true },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border border-border p-3 sm:p-4">
                  <span className="text-xs sm:text-sm text-text-primary pr-4">{item.label}</span>
                  <button
                    className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 shrink-0 items-center rounded-full transition-colors ${
                      item.checked ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        item.checked ? 'translate-x-4 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <Button onClick={() => handleSave('Notifications')}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  )
}
