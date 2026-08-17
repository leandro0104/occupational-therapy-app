import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "lime" | "outline" | "secondary" | "ghost" | "destructive" | "dark"
  size?: "default" | "sm" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            // Default Lime Theme
            "bg-lime-600 text-white hover:bg-lime-700 shadow-sm shadow-lime-900/10 font-semibold": variant === "default" || variant === "lime",
            // Dark button (similar to 'Save Preferences' in Image 2)
            "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm": variant === "dark",
            // Outline
            "border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 hover:text-zinc-900": variant === "outline",
            // Secondary
            "bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80": variant === "secondary",
            // Ghost
            "hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900": variant === "ghost",
            // Destructive
            "bg-red-500 text-white hover:bg-red-600 shadow-sm": variant === "destructive",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-11 rounded-lg px-6 text-base font-semibold": size === "lg",
            "h-9 w-9 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
