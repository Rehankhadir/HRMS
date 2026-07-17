import * as React from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/50 px-6 py-16 text-center",
          className
        )}
        {...props}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-50 text-primary">
          {icon}
        </div>
        <h3 className="mt-4 text-xs font-semibold text-text-primary">{title}</h3>
        <p className="mt-2 max-w-sm text-xs text-text-secondary">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState }
