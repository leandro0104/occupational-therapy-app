import * as React from "react"
import { cn } from "@/lib/utils"
import { ObjectiveStatus } from "@/types"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "lime" | "status"
  status?: ObjectiveStatus
}

export function Badge({
  className,
  variant = "default",
  status,
  children,
  ...props
}: BadgeProps) {
  if (variant === "status" && status) {
    const statusConfig = {
      logrado: {
        bg: "bg-lime-100 text-lime-800 border-lime-300",
        label: "Logrado",
        icon: "✓",
      },
      parcialmente_logrado: {
        bg: "bg-amber-100 text-amber-800 border-amber-300",
        label: "Parcialmente Logrado",
        icon: "◐",
      },
      no_logrado: {
        bg: "bg-rose-100 text-rose-800 border-rose-300",
        label: "No Logrado",
        icon: "✕",
      },
      en_proceso: {
        bg: "bg-sky-100 text-sky-800 border-sky-300",
        label: "En Proceso",
        icon: "⋯",
      },
    }[status]

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors shadow-2xs",
          statusConfig?.bg,
          className
        )}
        {...props}
      >
        <span className="font-bold text-[11px]">{statusConfig?.icon}</span>
        <span>{children || statusConfig?.label}</span>
      </span>
    )
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-zinc-900 text-zinc-50 shadow-xs": variant === "default",
          "border-transparent bg-lime-500 text-white shadow-xs": variant === "lime",
          "border-transparent bg-zinc-100 text-zinc-900": variant === "secondary",
          "border-zinc-300 text-zinc-700 bg-white": variant === "outline",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
