import React, { useState, useEffect } from 'react'
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: React.ReactNode
  confirmationWord?: string
  isLoading?: boolean
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmationWord = "ELIMINAR",
  isLoading = false
}: DeleteConfirmModalProps) {
  const [inputText, setInputText] = useState('')

  // Reset input text when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setInputText('')
    }
  }, [isOpen])

  const isMatch = inputText.trim().toUpperCase() === confirmationWord.toUpperCase()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isMatch) {
      onConfirm()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2.5 text-red-600">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="font-bold text-zinc-900">{title}</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200/80 flex items-start gap-3 text-xs text-red-900 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            {description}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmationInput" required>
            Para confirmar la eliminación, escribe <span className="font-mono font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded text-xs tracking-wider">{confirmationWord}</span> a continuación:
          </Label>
          <Input
            id="confirmationInput"
            type="text"
            placeholder={`Escribe ${confirmationWord} aquí`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="font-mono uppercase tracking-wider text-sm border-zinc-300 focus-visible:ring-red-500 focus-visible:border-red-500"
            autoFocus
            autoComplete="off"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="destructive"
            disabled={!isMatch || isLoading}
            className="gap-1.5 font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            {isLoading ? 'Eliminando...' : 'Confirmar Eliminación'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
