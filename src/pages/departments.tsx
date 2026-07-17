import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import {
  Plus,
  Building2,
  Users,
  Edit,
  Trash2,
  X,
} from 'lucide-react'
import { departments, employees } from '@/data/mock'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export function Departments() {
  const { toast } = useToast()
  const [showModal, setShowModal] = useState(false)
  const [editingDept, setEditingDept] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', description: '', color: '#2563EB' })

  const handleAdd = () => {
    setEditingDept(null)
    setFormData({ name: '', description: '', color: '#2563EB' })
    setShowModal(true)
  }

  const handleEdit = (dept: any) => {
    setEditingDept(dept)
    setFormData({ name: dept.name, description: dept.description, color: dept.color })
    setShowModal(true)
  }

  const handleDelete = (dept: any) => {
    toast(`Department "${dept.name}" deleted!`, 'error')
  }

  const handleSave = () => {
    if (!formData.name) {
      toast('Please enter a department name', 'error')
      return
    }
    toast(editingDept ? `Department "${formData.name}" updated!` : `Department "${formData.name}" created!`, 'success')
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
          <h1 className="text-sm sm:text-base font-bold text-text-primary">Departments</h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">Manage your organization's departments.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </motion.div>

      {/* Department Cards */}
      <motion.div variants={item} className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => {
          const head = employees.find(e => `${e.firstName} ${e.lastName}` === dept.head)
          return (
            <Card key={dept.id} className="card-hover">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 sm:pb-0">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg shrink-0"
                    style={{ backgroundColor: `${dept.color}15`, color: dept.color }}
                  >
                    <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xs sm:text-sm">{dept.name}</CardTitle>
                    <p className="text-xs sm:text-sm text-text-secondary line-clamp-1">{dept.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-text-secondary" />
                      <span className="text-xs sm:text-sm text-text-secondary">Employees</span>
                    </div>
                    <Badge variant="secondary">{dept.employeeCount}</Badge>
                  </div>
                  {head && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-text-secondary">Head</span>
                      <div className="flex items-center gap-2">
                        <Avatar
                          initials={`${head.firstName[0]}${head.lastName[0]}`}
                          size="sm"
                          color={dept.color}
                        />
                        <span className="text-xs sm:text-sm font-medium text-text-primary">
                          {head.firstName} {head.lastName}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(dept)}>
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-danger" onClick={() => handleDelete(dept)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-text-primary">
                {editingDept ? 'Edit Department' : 'Add Department'}
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
                  placeholder="Enter department name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-border cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                {editingDept ? 'Update' : 'Create'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
