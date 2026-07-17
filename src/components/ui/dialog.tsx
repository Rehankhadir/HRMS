import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function Dialog({ open, onClose, children }: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg">
        {children}
      </div>
    </div>
  )
}

interface DialogContentProps {
  children: ReactNode
  onClose?: () => void
}

export function DialogContent({ children, onClose }: DialogContentProps) {
  return (
    <div className="rounded-2xl bg-white shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors z-10"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      )}
      {children}
    </div>
  )
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="px-6 pt-6 pb-4">{children}</div>
}

export function DialogBody({ children }: { children: ReactNode }) {
  return <div className="px-6 pb-4">{children}</div>
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return <div className="px-6 pb-6 flex items-center justify-end gap-3">{children}</div>
}
