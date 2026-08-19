import React, { useState, useEffect } from 'react'
import { Award, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CompleteGoalConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  objetivoGeneralTexto: string
  completedObjectivesCount: number
  confirmationWord?: string
}

export function CompleteGoalConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  objetivoGeneralTexto,
  completedObjectivesCount,
  confirmationWord = 'CONFIRMAR'
}: CompleteGoalConfirmModalProps) {
  const [inputText, setInputText] = useState('')

  // Reset input when opened
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
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-lime-100 flex items-center justify-center text-lime-800 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <span className="font-bold text-zinc-900">¿Completar Objetivo General?</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="p-4 rounded-xl bg-lime-50/80 border border-lime-200/90 space-y-2 text-xs text-lime-950 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-lime-900">
            <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0" />
            <span>Todos los objetivos secundarios han sido logrados</span>
          </div>
          <p className="text-zinc-700">
            Esta acción marcará como <strong>Cumplido</strong> el Objetivo General padre:
          </p>
          <div className="p-2.5 rounded-lg bg-white border border-lime-300/80 font-semibold text-zinc-900 italic">
            "{objetivoGeneralTexto}"
          </div>
          <p className="text-[11px] text-zinc-500">
            Se archivará en el historial del paciente junto con sus {completedObjectivesCount} metas secundarias alcanzadas y podrás crear un nuevo ciclo terapéutico cuando lo desees.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="completeConfirmationInput" required className="text-xs">
            Para confirmar la finalización, escribe{' '}
            <span className="font-mono font-bold text-lime-800 bg-lime-100 px-1.5 py-0.5 rounded text-xs tracking-wider">
              {confirmationWord}
            </span>{' '}
            a continuación:
          </Label>
          <Input
            id="completeConfirmationInput"
            type="text"
            placeholder={`Escribe ${confirmationWord} aquí`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="font-mono uppercase tracking-wider text-sm border-zinc-300 focus-visible:ring-lime-500 focus-visible:border-lime-500"
            autoFocus
            autoComplete="off"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="lime"
            disabled={!isMatch}
            className="gap-1.5 font-bold shadow-md shadow-lime-900/10"
          >
            <ShieldCheck className="w-4 h-4" />
            Confirmar y Archivar Logro
          </Button>
        </div>
      </form>
    </Modal>
  )
}
