import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import {
  Plus,
  Calendar,
  PartyPopper,
  Edit,
  Trash2,
  X,
} from 'lucide-react'
import { holidays } from '@/data/mock'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

const typeConfig = {
  national: { color: 'default' as const, label: 'National' },
  company: { color: 'success' as const, label: 'Company' },
  optional: { color: 'warning' as const, label: 'Optional' },
}

export function Holidays() {
  const { toast } = useToast()
  const [showModal, setShowModal] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', date: '', type: 'national' })

  const upcomingHolidays = holidays.filter(h => new Date(h.date) >= new Date())
  const pastHolidays = holidays.filter(h => new Date(h.date) < new Date())

  const handleAdd = () => {
    setEditingHoliday(null)
    setFormData({ name: '', date: '', type: 'national' })
    setShowModal(true)
  }

  const handleEdit = (holiday: any) => {
    setEditingHoliday(holiday)
    setFormData({ name: holiday.name, date: holiday.date, type: holiday.type })
    setShowModal(true)
  }

  const handleDelete = (holiday: any) => {
    toast(`Holiday "${holiday.name}" deleted!`, 'error')
  }

  const handleSave = () => {
    if (!formData.name || !formData.date) {
      toast('Please fill in all fields', 'error')
      return
    }
    toast(editingHoliday ? `Holiday "${formData.name}" updated!` : `Holiday "${formData.name}" created!`, 'success')
    setShowModal(false)
  }

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
          <h1 className="text-sm sm:text-base font-bold text-text-primary">Holidays</h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">View and manage company holidays.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Holiday
        </Button>
      </motion.div>

      {/* Upcoming Holidays */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-xs sm:text-sm">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Upcoming Holidays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingHolidays.length > 0 ? (
                upcomingHolidays.map((holiday) => {
                  const config = typeConfig[holiday.type]
                  const daysUntil = Math.ceil(
                    (new Date(holiday.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  )
                  return (
                    <div key={holiday.id} className="flex items-center justify-between rounded-xl border border-border p-3 sm:p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-col items-center justify-center rounded-xl bg-primary-50 shrink-0">
                          <span className="text-[10px] sm:text-xs font-medium text-primary">
                            {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-primary">
                            {new Date(holiday.date).getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-text-primary">{holiday.name}</p>
                          <p className="text-xs sm:text-sm text-text-secondary">
                            {daysUntil > 0 ? `In ${daysUntil} days` : 'Today'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Badge variant={config.color} className="hidden sm:inline-flex">{config.label}</Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => handleEdit(holiday)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-danger h-8 w-8 sm:h-10 sm:w-10" onClick={() => handleDelete(holiday)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  <PartyPopper className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 opacity-50" />
                  <p className="text-xs">No upcoming holidays</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Past Holidays */}
      {pastHolidays.length > 0 && (
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm text-text-secondary">Past Holidays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pastHolidays.map((holiday) => {
                  const config = typeConfig[holiday.type]
                  return (
                    <div key={holiday.id} className="flex items-center justify-between rounded-xl border border-border p-3 opacity-60">
                      <div className="flex items-center gap-3">
                        <span className="text-xs sm:text-sm text-text-secondary">
                          {new Date(holiday.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-xs sm:text-sm text-text-primary">{holiday.name}</span>
                      </div>
                      <Badge variant={config.color} className="hidden sm:inline-flex">{config.label}</Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-text-primary">
                {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-background rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter holiday name"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  options={[
                    { value: 'national', label: 'National' },
                    { value: 'company', label: 'Company' },
                    { value: 'optional', label: 'Optional' },
                  ]}
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                {editingHoliday ? 'Update' : 'Create'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
