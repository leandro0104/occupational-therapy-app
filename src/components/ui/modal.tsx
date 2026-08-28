import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "5xl" | "full"
  className?: string
  hideCloseButton?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
  hideCloseButton = false,
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
    "2xl": "max-w-4xl",
    "4xl": "max-w-5xl",
    "5xl": "max-w-6xl",
    full: "max-w-[95vw] h-[92vh]",
  }[size]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog container */}
      <div
        className={cn(
          // Mobile: full-width, rounded top corners, slides from bottom
          "relative z-50 w-full bg-white border border-zinc-200/80 flex flex-col overflow-hidden",
          "rounded-t-2xl sm:rounded-2xl",
          "max-h-[92dvh] sm:max-h-[92vh]",
          "shadow-2xl",
          // Mobile: full width bottom sheet, desktop: constrained
          "sm:mx-auto",
          sizeClasses,
          // Animation: slide up on mobile, zoom on desktop
          "animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200",
          className
        )}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-zinc-300 rounded-full" />
        </div>

        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between border-b border-zinc-100 px-4 sm:px-6 py-3 sm:py-4 bg-zinc-50/50 flex-shrink-0">
            <div>
              {title && (
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 leading-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-zinc-500 mt-1 font-normal">
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors ml-2 flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
