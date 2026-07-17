import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { Plus, Briefcase, Edit, Trash2, X } from 'lucide-react'
import { designations, departments } from '@/data/mock'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export function Designations() {
  const { toast } = useToast()
  const [showModal, setShowModal] = useState(false)
  const [editingDesig, setEditingDesig] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', department: '', level: '' })

  const handleAdd = () => {
    setEditingDesig(null)
    setFormData({ name: '', department: '', level: '' })
    setShowModal(true)
  }

  const handleEdit = (desig: any) => {
    setEditingDesig(desig)
    setFormData({ name: desig.name, department: desig.department, level: desig.level })
    setShowModal(true)
  }

  const handleDelete = (desig: any) => {
    toast(`Designation "${desig.name}" deleted!`, 'error')
  }

  const handleSave = () => {
    if (!formData.name || !formData.department || !formData.level) {
      toast('Please fill in all fields', 'error')
      return
    }
    toast(editingDesig ? `Designation "${formData.name}" updated!` : `Designation "${formData.name}" created!`, 'success')
    setShowModal(false)
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 sm:space-y-6"
    >
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-text-primary">Designations</h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">Manage job titles and roles in your organization.</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Designation
        </Button>
      </motion.div>

      <motion.div variants={item}>
        {/* Desktop Table */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-background/50">
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                      Designation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                      Level
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {designations.map((desig) => (
                    <tr key={desig.id} className="hover:bg-background/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <span className="font-medium text-text-primary">{desig.name}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge variant="secondary">{desig.department}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-xs text-text-primary">{desig.level}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(desig)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-danger" onClick={() => handleDelete(desig)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {designations.map((desig) => (
            <Card key={desig.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary shrink-0">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{desig.name}</p>
                      <p className="text-xs text-text-secondary">{desig.department} • {desig.level}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(desig)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-danger h-8 w-8" onClick={() => handleDelete(desig)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
                {editingDesig ? 'Edit Designation' : 'Add Designation'}
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
                  placeholder="Enter designation name"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  options={departments.map(d => ({ value: d.name, label: d.name }))}
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Select department"
                />
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <Select
                  options={[
                    { value: 'Junior', label: 'Junior' },
                    { value: 'Mid-Level', label: 'Mid-Level' },
                    { value: 'Senior', label: 'Senior' },
                    { value: 'Lead', label: 'Lead' },
                    { value: 'Manager', label: 'Manager' },
                    { value: 'Director', label: 'Director' },
                  ]}
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  placeholder="Select level"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                {editingDesig ? 'Update' : 'Create'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
