import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/contexts/auth-context'
import { useAnnouncements } from '@/contexts/announcement-context'
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/dialog'
import {
  Plus,
  Trash2,
  Zap,
  CalendarDays,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export function AnnouncementsPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { announcements, addAnnouncement, deleteAnnouncement } = useAnnouncements()
  const canManage = user?.role === 'admin' || user?.role === 'hr'
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) {
      toast('Please fill in all fields', 'error')
      return
    }
    addAnnouncement({ title: title.trim(), content: content.trim(), priority })
    toast('Announcement created successfully!', 'success')
    setTitle('')
    setContent('')
    setPriority('medium')
    setShowCreate(false)
  }

  const handleDelete = (id: string) => {
    deleteAnnouncement(id)
    toast('Announcement deleted', 'success')
  }

  const priorityColors = {
    low: 'secondary' as const,
    medium: 'warning' as const,
    high: 'danger' as const,
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-6">
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-gray-900">Announcements</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            {canManage ? 'Create and manage company announcements' : 'View company announcements'}
          </p>
        </div>
        {canManage && (
          <Button className="w-full sm:w-auto" onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        )}
      </motion.div>

      {/* Announcements List */}
      <motion.div variants={item}>
        {announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((ann) => (
              <Card key={ann.id} className="border-gray-100 hover:border-gray-200 transition-colors">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 shrink-0">
                        <Zap className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xs font-bold text-gray-900">{ann.title}</h3>
                          <Badge variant={priorityColors[ann.priority]} className="text-[10px]">{ann.priority}</Badge>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{ann.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <CalendarDays className="h-3 w-3 text-gray-400" />
                          <span className="text-[10px] text-gray-400">{ann.date}</span>
                        </div>
                      </div>
                    </div>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500 shrink-0"
                        onClick={() => handleDelete(ann.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-gray-100">
            <CardContent className="p-12 text-center text-gray-400">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No announcements yet</p>
              <p className="text-xs mt-1">Create your first announcement to share with the team</p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Create Announcement Dialog */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)}>
        <DialogContent onClose={() => setShowCreate(false)}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">New Announcement</h2>
                <p className="text-xs text-gray-500">Share an update with your team</p>
              </div>
            </div>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-gray-700">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Company Town Hall"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-700">Content</Label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your announcement content here..."
                  rows={4}
                  className="mt-1.5 flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-700">Priority</Label>
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                  className="mt-1.5"
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)} className="text-xs">Cancel</Button>
            <Button onClick={handleCreate} className="text-xs">Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
