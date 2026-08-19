import React, { useState, useEffect, useMemo } from 'react'
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  User,
  Stethoscope,
  Phone,
  Mail,
  HeartHandshake,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  History,
  Target,
  CheckCircle2,
  Clock3,
  TrendingUp,
  Award,
  Lock
} from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { showToast } from '@/components/ui/toast'
import { formatDate, formatDateTime } from '@/lib/utils'
import {
  Patient,
  SessionEvolution,
  InterventionObjective,
  ObjectiveStatus,
  GeneralObjectiveHistoryItem
} from '@/types'
import { storageService } from '@/services/storageService'

interface ExtendedObjective extends InterventionObjective {
  isFromPreviousSession?: boolean
}

interface AttentionSessionModalProps {
  isOpen: boolean
  onClose: () => void
  patient: Patient | null
  onSessionSaved?: () => void
  onPatientUpdated?: (updatedPatient: Patient) => void
}

export function AttentionSessionModal({
  isOpen,
  onClose,
  patient,
  onSessionSaved,
  onPatientUpdated
}: AttentionSessionModalProps) {
  // Collapse toggles for patient info
  const [showFullProfile, setShowFullProfile] = useState(true)
  const [activeTab, setActiveTab] = useState<'new_session' | 'objectives_summary' | 'history'>('new_session')

  // Form State for Evolution Session
  const [fechaHora, setFechaHora] = useState('')
  const [objetivos, setObjetivos] = useState<ExtendedObjective[]>([])
  const [descripcionSesion, setDescripcionSesion] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Past sessions for this patient
  const [pastSessions, setPastSessions] = useState<SessionEvolution[]>([])

  // Modal / Form state for creating a new General Objective
  const [isCreatingNewGenObj, setIsCreatingNewGenObj] = useState(false)
  const [newGenObjText, setNewGenObjText] = useState('')
  const [isSavingGenObj, setIsSavingGenObj] = useState(false)

  // Format local current datetime for datetime-local input (YYYY-MM-DDTHH:mm)
  const getCurrentLocalDateTime = () => {
    const now = new Date()
    const offset = now.getTimezoneOffset() * 60000
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16)
    return localISOTime
  }

  // Load past sessions and initialize form when patient changes
  useEffect(() => {
    let isMounted = true
    if (patient && isOpen) {
      storageService.getSessionsByPatientId(patient.id).then((sessions) => {
        if (isMounted) {
          setPastSessions(sessions)
          initNewSessionWithPendingObjectives(sessions)
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [patient, isOpen])

  /**
   * Inicializa una nueva atención cargando automáticamente los objetivos
   * de sesiones anteriores que estén en estado distinto a "Logrado".
   */
  const initNewSessionWithPendingObjectives = (sessionsList: SessionEvolution[]) => {
    setFechaHora(getCurrentLocalDateTime())
    setDescripcionSesion('')
    setActiveTab('new_session')

    if (sessionsList.length === 0) {
      setObjetivos([
        {
          id: 'obj-' + Date.now() + '-1',
          descripcion: '',
          estado: 'en_proceso',
          isFromPreviousSession: false
        }
      ])
      return
    }

    const latestSession = sessionsList[0]
    const pendingFromPrevious = (latestSession.objetivos || [])
      .filter((obj) => obj.estado !== 'logrado' && obj.descripcion.trim() !== '')
      .map((obj, idx) => ({
        id: 'obj-' + Date.now() + '-' + (idx + 1),
        descripcion: obj.descripcion,
        estado: obj.estado,
        isFromPreviousSession: true
      }))

    if (pendingFromPrevious.length > 0) {
      setObjetivos(pendingFromPrevious)
    } else {
      setObjetivos([
        {
          id: 'obj-' + Date.now() + '-1',
          descripcion: '',
          estado: 'en_proceso',
          isFromPreviousSession: false
        }
      ])
    }
  }

  const handleManualResetNewSession = () => {
    initNewSessionWithPendingObjectives(pastSessions)
    showToast({
      title: 'Nueva Atención Iniciada',
      description: 'Formulario preparado para registrar una nueva sesión.',
      type: 'info'
    })
  }

  // Objectives handlers
  const handleAddObjective = () => {
    const newObj: ExtendedObjective = {
      id: 'obj-' + Date.now() + '-' + (objetivos.length + 1),
      descripcion: '',
      estado: 'en_proceso',
      isFromPreviousSession: false
    }
    setObjetivos([...objetivos, newObj])
  }

  const handleUpdateObjectiveText = (id: string, text: string) => {
    setObjetivos(
      objetivos.map((o) => (o.id === id ? { ...o, descripcion: text } : o))
    )
  }

  const handleUpdateObjectiveStatus = (id: string, status: ObjectiveStatus) => {
    setObjetivos(
      objetivos.map((o) => (o.id === id ? { ...o, estado: status } : o))
    )
  }

  const handleRemoveObjective = (id: string) => {
    if (objetivos.length <= 1) {
      showToast({
        title: 'Mínimo un objetivo',
        description: 'Debes mantener al menos un objetivo de intervención.',
        type: 'info'
      })
      return
    }
    setObjetivos(objetivos.filter((o) => o.id !== id))
  }

  // Save Evolution Session
  const handleSaveEvolution = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patient) return

    const validObjectives = objetivos.filter((o) => o.descripcion.trim() !== '')
    if (validObjectives.length === 0 && !descripcionSesion.trim()) {
      showToast({
        title: 'Información incompleta',
        description: 'Por favor añade al menos un objetivo o describe la sesión.',
        type: 'error'
      })
      return
    }

    setIsSaving(true)

    try {
      const cleanObjectives: InterventionObjective[] = (
        validObjectives.length > 0 ? validObjectives : objetivos
      ).map(({ id, descripcion, estado }) => ({ id, descripcion, estado }))

      await storageService.addSession({
        pacienteId: patient.id,
        pacienteNombre: patient.nombre,
        pacienteRut: patient.rut,
        fechaHora: fechaHora || getCurrentLocalDateTime(),
        objetivos: cleanObjectives,
        descripcionSesion: descripcionSesion.trim()
      })

      setIsSaving(false)
      showToast({
        title: 'Evolución Guardada',
        description: `Sesión registrada con éxito para ${patient.nombre}.`,
        type: 'success'
      })

      // Refrescar sesiones del paciente
      const updatedSessions = await storageService.getSessionsByPatientId(patient.id)
      setPastSessions(updatedSessions)

      if (onSessionSaved) {
        onSessionSaved()
      }
    } catch (err) {
      setIsSaving(false)
      showToast({
        title: 'Error al guardar',
        description: 'Ocurrió un problema al guardar la evolución.',
        type: 'error'
      })
    }
  }

  // =========================================================================
  // CÁLCULOS DE OBJETIVOS COMPLETADOS VS PENDIENTES DEL USUARIO
  // =========================================================================
  const { completedObjectives, pendingObjectives, achievementRate } = useMemo(() => {
    const achievedMap = new Map<string, { descripcion: string; fechaLogro: string; sesionId: string }>()
    const latestStatusMap = new Map<string, { descripcion: string; estado: ObjectiveStatus; ultimaFecha: string }>()

    const chronologicalSessions = [...pastSessions].reverse()

    chronologicalSessions.forEach((session) => {
      (session.objetivos || []).forEach((obj) => {
        const descKey = obj.descripcion.trim().toLowerCase()
        if (!descKey) return

        if (obj.estado === 'logrado') {
          achievedMap.set(descKey, {
            descripcion: obj.descripcion,
            fechaLogro: session.fechaHora,
            sesionId: session.id
          })
          latestStatusMap.delete(descKey)
        } else {
          if (!achievedMap.has(descKey)) {
            latestStatusMap.set(descKey, {
              descripcion: obj.descripcion,
              estado: obj.estado,
              ultimaFecha: session.fechaHora
            })
          }
        }
      })
    })

    const completed = Array.from(achievedMap.values())
    const pending = Array.from(latestStatusMap.values())
    const total = completed.length + pending.length
    const rate = total > 0 ? Math.round((completed.length / total) * 100) : 0

    return {
      completedObjectives: completed,
      pendingObjectives: pending,
      achievementRate: rate
    }
  }, [pastSessions])

  // =========================================================================
  // MANEJO DE COMPLETAR Y CREAR OBJETIVO GENERAL (OBJETIVO PADRE)
  // =========================================================================
  // Condición: El botón para completar el objetivo general SOLO se habilita cuando
  // no existen objetivos secundarios pendientes (todos logrados) y hay al menos 1 objetivo trabajado
  const canCompleteGeneralObjective =
    Boolean(patient?.objetivoGeneral?.trim()) &&
    pendingObjectives.length === 0 &&
    completedObjectives.length > 0

  const handleCompleteGeneralObjective = async () => {
    if (!patient || !patient.objetivoGeneral) return

    const historyItem: GeneralObjectiveHistoryItem = {
      id: 'gen-obj-' + Date.now(),
      objetivoGeneral: patient.objetivoGeneral,
      fechaCompletado: new Date().toISOString(),
      objetivosSecundarios: completedObjectives.map((o) => ({
        descripcion: o.descripcion,
        estado: 'logrado',
        fechaLogro: o.fechaLogro
      }))
    }

    const currentHistory = Array.isArray(patient.objetivosGeneralesHistorial)
      ? patient.objetivosGeneralesHistorial
      : []

    const updatedPatient: Patient = {
      ...patient,
      objetivoGeneral: '', // Se limpia para que ya no aparezca en la ficha activa
      objetivoGeneralCompletado: true,
      objetivosGeneralesHistorial: [historyItem, ...currentHistory]
    }

    try {
      await storageService.updatePatient(updatedPatient)
      if (onPatientUpdated) {
        onPatientUpdated(updatedPatient)
      }
      showToast({
        title: '🏆 ¡Objetivo General Cumplido!',
        description: 'El objetivo padre ha sido completado y archivado exitosamente en el historial.',
        type: 'success'
      })
    } catch (err) {
      showToast({
        title: 'Error al actualizar',
        description: 'No se pudo dar por completado el objetivo general.',
        type: 'error'
      })
    }
  }

  const handleSaveNewGeneralObjective = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patient || !newGenObjText.trim()) {
      showToast({
        title: 'Campo requerido',
        description: 'Por favor escribe el nuevo Objetivo General.',
        type: 'error'
      })
      return
    }

    setIsSavingGenObj(true)
    const updatedPatient: Patient = {
      ...patient,
      objetivoGeneral: newGenObjText.trim(),
      objetivoGeneralCompletado: false
    }

    try {
      await storageService.updatePatient(updatedPatient)
      if (onPatientUpdated) {
        onPatientUpdated(updatedPatient)
      }
      setIsSavingGenObj(false)
      setIsCreatingNewGenObj(false)
      setNewGenObjText('')
      showToast({
        title: 'Objetivo General Creado',
        description: 'Nuevo objetivo padre establecido para el paciente.',
        type: 'success'
      })
    } catch (err) {
      setIsSavingGenObj(false)
      showToast({
        title: 'Error',
        description: 'No se pudo guardar el nuevo objetivo general.',
        type: 'error'
      })
    }
  }

  if (!patient) return null

  const hasPendingFromPrevious = objetivos.some((o) => o.isFromPreviousSession)
  const completedGeneralHistory = patient.objetivosGeneralesHistorial || []

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      className="max-w-[1200px] h-[94vh] flex flex-col bg-zinc-50"
      title={
        <div className="flex flex-wrap items-center justify-between gap-4 w-full pr-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <ActivityIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-zinc-900">{patient.nombre}</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-zinc-200 text-zinc-800 font-semibold">
                  {patient.rut}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-lime-100 text-lime-800 font-semibold">
                  {patient.edad ? `${patient.edad} años` : 'Edad no reg.'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Ficha Clínica y Registro de Evolución de Terapia Ocupacional
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={activeTab === 'new_session' ? 'lime' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('new_session')}
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva Atención
            </Button>
            <Button
              type="button"
              variant={activeTab === 'objectives_summary' ? 'lime' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('objectives_summary')}
              className="gap-1.5 text-xs font-semibold"
            >
              <Target className="w-3.5 h-3.5" />
              Detalle Objetivos ({completedObjectives.length + pendingObjectives.length})
            </Button>
            <Button
              type="button"
              variant={activeTab === 'history' ? 'lime' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('history')}
              className="gap-1.5 text-xs font-semibold"
            >
              <History className="w-3.5 h-3.5" />
              Historial ({pastSessions.length})
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-4">
        {/* ========================================================================= */}
        {/* APARTADO 1: FICHA DEL PACIENTE (PERFIL & EVALUACIÓN INICIAL)              */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden transition-all duration-200">
          <div
            onClick={() => setShowFullProfile(!showFullProfile)}
            className="px-5 py-3.5 bg-zinc-100/70 border-b border-zinc-200/80 flex items-center justify-between cursor-pointer hover:bg-zinc-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-lime-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                Ficha del Paciente · Perfil & Evaluación Inicial
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
              <span>{showFullProfile ? 'Ocultar detalles' : 'Mostrar ficha completa'}</span>
              {showFullProfile ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>

          {showFullProfile && (
            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white animate-in fade-in duration-150">
              {/* Módulo 1: Perfil de la Persona */}
              <div className="space-y-3 bg-zinc-50/70 rounded-xl p-4 border border-zinc-200/70">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
                  <User className="w-4 h-4 text-lime-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                    1. Perfil de la Persona
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-400 block font-medium">Nombre:</span>
                    <span className="font-semibold text-zinc-900">{patient.nombre}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">RUT:</span>
                    <span className="font-semibold text-zinc-900">{patient.rut}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">Edad:</span>
                    <span className="font-semibold text-zinc-900">
                      {patient.edad ? `${patient.edad} años` : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">Fecha Ingreso:</span>
                    <span className="font-semibold text-zinc-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      {formatDate(patient.fechaIngreso)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">Teléfono:</span>
                    <span className="font-semibold text-zinc-900 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-zinc-400" />
                      {patient.telefono || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">Correo:</span>
                    <span className="font-semibold text-zinc-900 flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                      {patient.correo || <span className="text-zinc-400 italic">No registrado</span>}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400 block font-medium">Cuidador/a:</span>
                    <span className="font-semibold text-zinc-900 flex items-center gap-1">
                      <HeartHandshake className="w-3.5 h-3.5 text-lime-600" />
                      {patient.cuidador || <span className="text-zinc-400 italic">No registrado</span>}
                    </span>
                  </div>
                  <div className="col-span-2 bg-white p-2 rounded-lg border border-zinc-200">
                    <span className="text-zinc-400 block font-medium text-[11px]">
                      Motivo de Consulta General:
                    </span>
                    <p className="text-zinc-800 font-medium mt-0.5 leading-relaxed">
                      {patient.motivoConsulta || 'Sin motivo inicial registrado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Módulo 2: Evaluación */}
              <div className="space-y-3 bg-zinc-50/70 rounded-xl p-4 border border-zinc-200/70">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
                  <Stethoscope className="w-4 h-4 text-lime-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                    2. Evaluación Clínica Inicial
                  </h4>
                </div>

                <div className="space-y-2.5 text-xs">
                  {patient.evaluacion?.motivoConsultaDetalle && (
                    <div>
                      <span className="text-zinc-400 block font-medium">
                        Motivo de Consulta Detallado / Antecedentes:
                      </span>
                      <p className="text-zinc-800 bg-white p-2 rounded-lg border border-zinc-200 mt-0.5 leading-relaxed">
                        {patient.evaluacion.motivoConsultaDetalle}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-zinc-400 block font-medium">
                      Evaluación Inicial (Observación Clínica Ocupacional):
                    </span>
                    <p className="text-zinc-800 bg-white p-2 rounded-lg border border-zinc-200 mt-0.5 leading-relaxed">
                      {patient.evaluacion?.evaluacionInicial || 'No se registraron observaciones iniciales.'}
                    </p>
                  </div>

                  <div>
                    <span className="text-zinc-400 block font-medium">
                      Instrumentos Aplicados:
                    </span>
                    <p className="text-zinc-800 bg-white p-2 rounded-lg border border-zinc-200 mt-0.5 font-medium">
                      {patient.evaluacion?.instrumentosAplicados || 'No especificados'}
                    </p>
                  </div>

                  <div>
                    <span className="text-zinc-400 block font-medium">
                      Resultados y Síntesis:
                    </span>
                    <p className="text-zinc-800 bg-white p-2 rounded-lg border border-zinc-200 mt-0.5 leading-relaxed">
                      {patient.evaluacion?.resultados || 'Pendiente de resultados'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* APARTADO 2: OBJETIVO GENERAL (OBJETIVO PADRE EN LA FICHA CLÍNICA)        */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-lime-100 text-lime-800 flex items-center justify-center font-bold">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                  Objetivo General Terapéutico (Objetivo Padre)
                </h3>
                <p className="text-xs text-zinc-500">
                  Meta principal del plan de intervención del paciente.
                </p>
              </div>
            </div>

            {/* Si no tiene objetivo general activo, botón para plantear uno nuevo */}
            {(!patient.objetivoGeneral || !patient.objetivoGeneral.trim()) && !isCreatingNewGenObj && (
              <Button
                type="button"
                variant="lime"
                size="sm"
                onClick={() => setIsCreatingNewGenObj(true)}
                className="gap-1.5 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                + Plantear Nuevo Objetivo General
              </Button>
            )}
          </div>

          {/* Formulario en línea para plantear nuevo objetivo general si no existe */}
          {isCreatingNewGenObj && (
            <form onSubmit={handleSaveNewGeneralObjective} className="p-4 rounded-xl bg-lime-50/60 border border-lime-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex justify-between items-center">
                <Label htmlFor="newGenObjInput" required className="text-xs font-bold text-lime-950">
                  Definir Nuevo Objetivo General Padre
                </Label>
                <span className="text-[10px] text-lime-700 font-mono">{newGenObjText.length}/300</span>
              </div>
              <Textarea
                id="newGenObjInput"
                placeholder="Escribe la nueva meta transversal y global para el siguiente ciclo terapéutico..."
                value={newGenObjText}
                onChange={(e) => setNewGenObjText(e.target.value)}
                maxLength={300}
                rows={2}
                required
                className="bg-white border-lime-300 text-sm"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreatingNewGenObj(false)
                    setNewGenObjText('')
                  }}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="lime"
                  size="sm"
                  disabled={isSavingGenObj || !newGenObjText.trim()}
                  className="text-xs font-semibold"
                >
                  {isSavingGenObj ? 'Guardando...' : 'Establecer Objetivo General'}
                </Button>
              </div>
            </form>
          )}

          {/* Estado de Objetivo General Activo */}
          {patient.objetivoGeneral && patient.objetivoGeneral.trim() ? (
            <div className="bg-gradient-to-r from-lime-50/90 via-lime-50/50 to-white p-4 rounded-xl border border-lime-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-lime-200 text-lime-900 px-2 py-0.5 rounded-md">
                    En Curso / Activo
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">
                    {completedObjectives.length} de {completedObjectives.length + pendingObjectives.length} objetivos secundarios logrados
                  </span>
                </div>
                <p className="text-sm font-semibold text-zinc-900 leading-relaxed pt-1">
                  "{patient.objetivoGeneral}"
                </p>
              </div>

              {/* Botón para dar por completado el Objetivo General */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Button
                  type="button"
                  variant={canCompleteGeneralObjective ? 'lime' : 'outline'}
                  disabled={!canCompleteGeneralObjective}
                  onClick={handleCompleteGeneralObjective}
                  className={`gap-2 text-xs font-bold ${
                    canCompleteGeneralObjective
                      ? 'shadow-md shadow-lime-900/10 animate-pulse'
                      : 'opacity-60 cursor-not-allowed bg-zinc-100 text-zinc-400'
                  }`}
                  title={
                    canCompleteGeneralObjective
                      ? 'Todos los objetivos secundarios están logrados. Clic para completar objetivo padre.'
                      : `Requiere que todos los objetivos secundarios (${pendingObjectives.length} pendientes) estén logrados.`
                  }
                >
                  {canCompleteGeneralObjective ? (
                    <Award className="w-4 h-4 text-lime-900" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                  Completar Objetivo General
                </Button>

                {!canCompleteGeneralObjective && (
                  <span className="text-[10px] text-amber-700 font-medium flex items-center gap-1">
                    <Clock3 className="w-3 h-3 text-amber-500" />
                    {pendingObjectives.length > 0
                      ? `${pendingObjectives.length} objetivo(s) secundario(s) pendiente(s)`
                      : 'Registra objetivos logrados en sesiones para habilitar'}
                  </span>
                )}
              </div>
            </div>
          ) : (
            !isCreatingNewGenObj && (
              <div className="p-4 rounded-xl bg-zinc-50 border border-dashed border-zinc-200 text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-left">
                  <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0" />
                  <span>
                    El paciente no tiene un Objetivo General activo en este momento (el anterior fue completado o aún no se ha establecido).
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingNewGenObj(true)}
                  className="text-xs gap-1 shrink-0"
                >
                  <Plus className="w-3 h-3" />
                  Plantear Objetivo General
                </Button>
              </div>
            )
          )}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: REGISTRO DE NUEVA ATENCIÓN / EVOLUCIÓN                             */}
        {/* ========================================================================= */}
        {activeTab === 'new_session' && (
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-lime-100 text-lime-800 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    Registro de Evolución de Sesión
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Registra la sesión actual. Los objetivos no completados de sesiones previas se han cargado automáticamente.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleManualResetNewSession}
                className="text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                + Nueva Atención (Recargar)
              </Button>
            </div>

            {/* Aviso si se cargaron objetivos previos */}
            {hasPendingFromPrevious && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs leading-relaxed">
                <Clock3 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Objetivos de sesiones anteriores cargados:</span> Se desplegaron los objetivos que se encontraban en estado pendiente (*Parcialmente logrado*, *No logrado* o *En proceso*) para continuar su seguimiento. Al alcanzarlos, márcalos como <strong>Logrado</strong> para darlos por completados.
                </div>
              </div>
            )}

            <form onSubmit={handleSaveEvolution} className="space-y-6">
              {/* Fecha / Hora */}
              <div className="max-w-xs space-y-1.5">
                <Label htmlFor="fechaHora" required>
                  Fecha y Hora de la Sesión
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <Input
                    id="fechaHora"
                    type="datetime-local"
                    value={fechaHora}
                    onChange={(e) => setFechaHora(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              {/* Objetivos de Intervención (Dinámicos y continuos) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label required>Objetivos de Intervención (Objetivos Secundarios)</Label>
                    <p className="text-[11px] text-zinc-500">
                      Define los objetivos trabajados y selecciona su estado de logro.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="lime"
                    size="sm"
                    onClick={handleAddObjective}
                    className="gap-1 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar Objetivo
                  </Button>
                </div>

                <div className="space-y-3 bg-zinc-50/80 p-4 rounded-xl border border-zinc-200/90">
                  {objetivos.map((obj, index) => (
                    <div
                      key={obj.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-white rounded-xl border border-zinc-200 shadow-2xs animate-in fade-in duration-150"
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        {obj.isFromPreviousSession && (
                          <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                            En seguimiento
                          </span>
                        )}
                      </div>

                      {/* Objective Description con maxLength */}
                      <div className="flex-1 w-full">
                        <Input
                          placeholder="Ej. Mantener tolerancia táctil con texturas mixtas por 10 min..."
                          value={obj.descripcion}
                          onChange={(e) =>
                            handleUpdateObjectiveText(obj.id, e.target.value)
                          }
                          maxLength={250}
                          className="h-9 text-sm"
                        />
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        <select
                          value={obj.estado}
                          onChange={(e) =>
                            handleUpdateObjectiveStatus(
                              obj.id,
                              e.target.value as ObjectiveStatus
                            )
                          }
                          className="h-9 px-3 py-1 text-xs font-semibold rounded-lg border border-zinc-300 bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-lime-500 cursor-pointer"
                        >
                          <option value="logrado">✓ Logrado</option>
                          <option value="parcialmente_logrado">
                            ◐ Parcialmente Logrado
                          </option>
                          <option value="no_logrado">✕ No Logrado</option>
                          <option value="en_proceso">⋯ En Proceso</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveObjective(obj.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar objetivo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Descripción de la Sesión con límite 3000 caracteres */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="descripcionSesion" required>
                    Descripción de la Sesión (Notas Clínicas y Observaciones)
                  </Label>
                  <span className="text-[10px] text-zinc-400 font-mono">{descripcionSesion.length}/3000</span>
                </div>
                <Textarea
                  id="descripcionSesion"
                  placeholder="Detalla las actividades realizadas, respuesta del usuario, niveles de alerta, adaptaciones implementadas y tareas para el hogar..."
                  value={descripcionSesion}
                  onChange={(e) => setDescripcionSesion(e.target.value)}
                  maxLength={3000}
                  rows={4}
                  required
                />
              </div>

              {/* Footer con Botón Guardar Evolución */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cerrar
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    variant="lime"
                    disabled={isSaving}
                    className="gap-2 px-6 h-11 text-base font-semibold shadow-md"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    {isSaving ? 'Guardando...' : 'Guardar Evolución'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DETALLE DE OBJETIVOS Y LOGROS DEL PACIENTE                         */}
        {/* ========================================================================= */}
        {activeTab === 'objectives_summary' && (
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-lime-100 text-lime-800 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    Plan de Objetivos Terapéuticos · {patient.nombre}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Seguimiento detallado del Objetivo General e historial de metas alcanzadas.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="lime"
                  size="sm"
                  onClick={() => setActiveTab('new_session')}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Evaluar en Nueva Atención
                </Button>
              </div>
            </div>

            {/* Métricas de Logro del Paciente */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                  Total Objetivos Secundarios
                </span>
                <p className="text-2xl font-extrabold text-zinc-900 mt-1">
                  {completedObjectives.length + pendingObjectives.length}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Planteados en el ciclo actual</p>
              </div>

              <div className="bg-lime-50/70 p-4 rounded-xl border border-lime-200">
                <span className="text-xs font-bold text-lime-800 uppercase tracking-wider block">
                  Objetivos Logrados
                </span>
                <p className="text-2xl font-extrabold text-lime-700 mt-1">
                  {completedObjectives.length}
                </p>
                <p className="text-[11px] text-lime-700/80 mt-0.5">Completados y finalizados</p>
              </div>

              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  En Seguimiento Activo
                </span>
                <p className="text-2xl font-extrabold text-amber-700 mt-1">
                  {pendingObjectives.length}
                </p>
                <p className="text-[11px] text-amber-700/80 mt-0.5">Pendientes de consolidación</p>
              </div>
            </div>

            {/* Barra de progreso de objetivos */}
            <div className="space-y-1.5 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-700 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-lime-600" />
                  Progreso Terapéutico del Ciclo Actual
                </span>
                <span className="font-bold text-lime-800">{achievementRate}% de Logro</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-lime-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${achievementRate}%` }}
                />
              </div>
            </div>

            {/* 1. SECCIÓN: OBJETIVOS COMPLETADOS / LOGRADOS */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
                <CheckCircle2 className="w-4 h-4 text-lime-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  1. Objetivos Secundarios Completados / Logrados ({completedObjectives.length})
                </h4>
              </div>

              {completedObjectives.length === 0 ? (
                <div className="p-4 rounded-xl bg-zinc-50 border border-dashed border-zinc-200 text-center text-xs text-zinc-400">
                  Aún no hay objetivos marcados como Logrado para este paciente.
                </div>
              ) : (
                <div className="space-y-2">
                  {completedObjectives.map((obj, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-lime-50/40 border border-lime-200/80"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-lime-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ✓
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{obj.descripcion}</p>
                          <span className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            Logrado en sesión del {formatDateTime(obj.fechaLogro)}
                          </span>
                        </div>
                      </div>
                      <Badge variant="status" status="logrado" className="shrink-0 self-start sm:self-auto" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. SECCIÓN: OBJETIVOS EN SEGUIMIENTO ACTIVO / PENDIENTES */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
                <Clock3 className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  2. Objetivos Secundarios en Seguimiento Activo ({pendingObjectives.length})
                </h4>
              </div>

              {pendingObjectives.length === 0 ? (
                <div className="p-4 rounded-xl bg-zinc-50 border border-dashed border-zinc-200 text-center text-xs text-zinc-400">
                  No hay objetivos secundarios pendientes. Todos los objetivos han sido completados.
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingObjectives.map((obj, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/90"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{obj.descripcion}</p>
                          <span className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            Última evaluación: {formatDateTime(obj.ultimaFecha)}
                          </span>
                        </div>
                      </div>
                      <Badge variant="status" status={obj.estado} className="shrink-0 self-start sm:self-auto" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. SECCIÓN: HISTORIAL DE OBJETIVOS GENERALES CUMPLIDOS */}
            <div className="space-y-3 pt-6 border-t border-zinc-200">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
                <Award className="w-4 h-4 text-lime-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  3. Historial de Objetivos Generales Cumplidos ({completedGeneralHistory.length})
                </h4>
              </div>

              {completedGeneralHistory.length === 0 ? (
                <div className="p-4 rounded-xl bg-zinc-50 border border-dashed border-zinc-200 text-center text-xs text-zinc-400">
                  Aún no hay Objetivos Generales archivados como cumplidos para este paciente.
                </div>
              ) : (
                <div className="space-y-3">
                  {completedGeneralHistory.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-xl bg-gradient-to-br from-lime-50/80 to-zinc-50 border border-lime-300/80 space-y-3 shadow-2xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-lime-900 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-lime-700" />
                          Objetivo General #{completedGeneralHistory.length - idx} Alcanzado
                        </span>
                        <span className="text-[11px] text-zinc-500 font-medium">
                          Completado el {formatDate(item.fechaCompletado)}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-zinc-900 bg-white p-3 rounded-lg border border-lime-200 leading-relaxed">
                        "{item.objetivoGeneral}"
                      </p>

                      {item.objetivosSecundarios && item.objetivosSecundarios.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block">
                            Objetivos Secundarios que fundamentaron este logro:
                          </span>
                          <div className="space-y-1">
                            {item.objetivosSecundarios.map((sec, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex items-center justify-between text-xs bg-white/80 p-2 rounded-md border border-zinc-200"
                              >
                                <span className="text-zinc-800 font-medium">✓ {sec.descripcion}</span>
                                <Badge variant="status" status="logrado" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: HISTORIAL DE SESIONES PREVIAS DEL PACIENTE                          */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-lime-700" />
                <h3 className="text-base font-bold text-zinc-900">
                  Historial de Atenciones ({pastSessions.length})
                </h3>
              </div>
              <Button
                type="button"
                variant="lime"
                size="sm"
                onClick={() => setActiveTab('new_session')}
                className="gap-1.5 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                + Nueva Atención
              </Button>
            </div>

            {pastSessions.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Aún no hay atenciones registradas para este paciente.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('new_session')}
                  className="mt-3 text-xs"
                >
                  Registrar Primera Atención
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {pastSessions.map((session, idx) => (
                  <div
                    key={session.id}
                    className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-zinc-900 text-lime-400 text-xs font-bold flex items-center justify-center">
                          #{pastSessions.length - idx}
                        </span>
                        <span className="font-bold text-sm text-zinc-900">
                          {formatDateTime(session.fechaHora)}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">
                        ID: {session.id}
                      </span>
                    </div>

                    {/* Objetivos abordados */}
                    {session.objetivos && session.objetivos.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-zinc-600 block">
                          Objetivos Abordados en esta Sesión:
                        </span>
                        <div className="space-y-1">
                          {session.objetivos.map((obj) => (
                            <div
                              key={obj.id}
                              className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-zinc-200/80"
                            >
                              <span className="text-zinc-800 font-medium">
                                {obj.descripcion || 'Objetivo sin descripción'}
                              </span>
                              <Badge variant="status" status={obj.estado} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Descripción de la sesión */}
                    {session.descripcionSesion && (
                      <div className="bg-white p-3 rounded-lg border border-zinc-200 text-xs text-zinc-700 leading-relaxed">
                        <span className="font-semibold text-zinc-900 block mb-1">
                          Descripción Clínica:
                        </span>
                        <p className="whitespace-pre-line">{session.descripcionSesion}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
