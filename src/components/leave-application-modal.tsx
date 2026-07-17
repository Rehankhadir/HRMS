import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/contexts/auth-context'
import { useLeave } from '@/contexts/leave-context'
import { CalendarDays } from 'lucide-react'

interface LeaveApplicationModalProps {
  open: boolean
  onClose: () => void
}

export function LeaveApplicationModal({ open, onClose }: LeaveApplicationModalProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const { addLeave } = useLeave()

  const [type, setType] = useState('annual')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      toast('Please select start and end dates', 'error')
      return
    }
    if (!reason.trim()) {
      toast('Please enter a reason for leave', 'error')
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast('End date cannot be before start date', 'error')
      return
    }

    addLeave({
      employeeId: user?.employeeId || '1',
      type: type as any,
      startDate,
      endDate,
      reason: reason.trim(),
    })

    toast('Leave application submitted!', 'success')
    setType('annual')
    setStartDate('')
    setEndDate('')
    setReason('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Apply for Leave</h2>
              <p className="text-xs text-gray-500">Submit a new leave request to your manager</p>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-700">Leave Type</Label>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { value: 'annual', label: 'Annual Leave' },
                  { value: 'sick', label: 'Sick Leave' },
                  { value: 'personal', label: 'Personal Leave' },
                  { value: 'maternity', label: 'Maternity Leave' },
                  { value: 'paternity', label: 'Paternity Leave' },
                  { value: 'unpaid', label: 'Unpaid Leave' },
                ]}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-gray-700">From Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-700">To Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700">Reason for Leave</Label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe the reason for your leave..."
                rows={3}
                className="mt-1.5 flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 resize-none"
              />
            </div>

            {startDate && endDate && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-[11px] text-gray-500">
                  Duration: <span className="font-medium text-gray-700">
                    {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s)
                  </span>
                </p>
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="text-xs">
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
