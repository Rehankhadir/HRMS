import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  color?: string
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, change, changeType = 'neutral', icon, color = '#2563EB', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-text-secondary">{title}</p>
            <p className="text-sm font-bold tracking-tight text-text-primary">{value}</p>
            {change && (
              <p className={cn(
                "text-xs font-medium",
                changeType === 'positive' && 'text-success',
                changeType === 'negative' && 'text-danger',
                changeType === 'neutral' && 'text-text-secondary'
              )}>
                {change}
              </p>
            )}
          </div>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {icon}
          </div>
        </div>
      </div>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard }
