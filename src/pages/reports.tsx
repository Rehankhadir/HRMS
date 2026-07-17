import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import {
  Download,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { attendanceTrend, departmentDistribution, leaveSummary } from '@/data/mock'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export function Reports() {
  const [activeTab, setActiveTab] = useState('attendance')
  const [dateRange, setDateRange] = useState('this-month')

  const tabs = [
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave', icon: Calendar },
    { id: 'employee', label: 'Employee', icon: Users },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 sm:space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-text-primary">Reports</h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">View and export HR analytics and reports.</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex gap-1 sm:gap-1.5 rounded-lg bg-background p-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 flex-1 sm:flex-none rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
          <Select
            options={[
              { value: 'this-week', label: 'This Week' },
              { value: 'this-month', label: 'This Month' },
              { value: 'this-quarter', label: 'This Quarter' },
              { value: 'this-year', label: 'This Year' },
            ]}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Attendance Report */}
      {activeTab === 'attendance' && (
        <motion.div variants={item} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Attendance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                        }}
                      />
                      <Line type="monotone" dataKey="present" stroke="#22C55E" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="late" stroke="#F59E0B" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Department Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm">Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
                {[
                  { label: 'Avg. Attendance', value: '91.2%' },
                  { label: 'Avg. Late', value: '3.6%' },
                  { label: 'Perfect Attendance', value: '45' },
                  { label: 'Most Punctual', value: 'Engineering' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-border p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-text-secondary">{stat.label}</p>
                    <p className="mt-1 text-base sm:text-sm font-bold text-text-primary">{stat.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Leave Report */}
      {activeTab === 'leave' && (
        <motion.div variants={item} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Leave Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leaveSummary}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="annual" fill="#2563EB" stackId="a" />
                      <Bar dataKey="sick" fill="#EF4444" stackId="a" />
                      <Bar dataKey="personal" fill="#F59E0B" stackId="a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Leave by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Annual', value: 97, color: '#2563EB' },
                          { name: 'Sick', value: 38, color: '#EF4444' },
                          { name: 'Personal', value: 27, color: '#F59E0B' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        <Cell fill="#2563EB" />
                        <Cell fill="#EF4444" />
                        <Cell fill="#F59E0B" />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm">Leave Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
                {[
                  { label: 'Total Leave Days', value: '162' },
                  { label: 'Pending Requests', value: '5' },
                  { label: 'Approval Rate', value: '94%' },
                  { label: 'Most Used Type', value: 'Annual' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-border p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-text-secondary">{stat.label}</p>
                    <p className="mt-1 text-base sm:text-sm font-bold text-text-primary">{stat.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Employee Report */}
      {activeTab === 'employee' && (
        <motion.div variants={item} className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Department Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px] lg:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#64748B" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={12} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                      }}
                    />
                    <Bar dataKey="value" fill="#2563EB" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3">
            {[
              {
                title: 'Hiring Trend',
                stats: [
                  { label: 'This Month', value: '+2' },
                  { label: 'Last Month', value: '+5' },
                  { label: 'This Quarter', value: '+12' },
                  { label: 'This Year', value: '+28' },
                ],
              },
              {
                title: 'Turnover Rate',
                stats: [
                  { label: 'This Month', value: '1.2%' },
                  { label: 'Last Month', value: '0.8%' },
                  { label: 'This Quarter', value: '3.5%' },
                  { label: 'This Year', value: '8.2%' },
                ],
              },
              {
                title: 'Demographics',
                stats: [
                  { label: 'Male', value: '58%' },
                  { label: 'Female', value: '42%' },
                  { label: 'Average Age', value: '32' },
                  { label: 'Avg. Tenure', value: '2.4 yrs' },
                ],
              },
            ].map((card) => (
              <Card key={card.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {card.stats.map((stat) => (
                      <div key={stat.label} className="flex justify-between">
                        <span className="text-xs sm:text-sm text-text-secondary">{stat.label}</span>
                        <span className="text-xs sm:text-sm font-medium text-text-primary">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
