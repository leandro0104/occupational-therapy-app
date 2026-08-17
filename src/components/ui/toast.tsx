import React, { useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  type?: 'success' | 'error' | 'info'
}

let addToastGlobal: ((toast: Omit<ToastMessage, 'id'>) => void) | null = null

export function showToast(toast: Omit<ToastMessage, 'id'>) {
  if (addToastGlobal) {
    addToastGlobal(toast)
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  React.useEffect(() => {
    addToastGlobal = ({ title, description, type = 'success' }) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5)
      setToasts((prev) => [...prev, { id, title, description, type }])

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4000)
    }

    return () => {
      addToastGlobal = null
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5",
            {
              "bg-zinc-950 text-white border-zinc-800": toast.type === 'success',
              "bg-red-950 text-white border-red-800": toast.type === 'error',
              "bg-zinc-900 text-white border-zinc-700": toast.type === 'info',
            }
          )}
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="h-5 w-5 text-lime-400 shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 text-sm">
            <h4 className="font-semibold">{toast.title}</h4>
            {toast.description && (
              <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">{toast.description}</p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
