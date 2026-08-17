import React, { useState, useEffect } from 'react'
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
  History
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
  ObjectiveStatus
} from '@/types'
import { storageService } from '@/services/storageService'

interface AttentionSessionModalProps {
  isOpen: boolean
  onClose: () => void
  patient: Patient | null
  onSessionSaved?: () => void
}

export function AttentionSessionModal({
  isOpen,
  onClose,
  patient,
  onSessionSaved
}: AttentionSessionModalProps) {
  // Collapse toggles for patient info
  const [showFullProfile, setShowFullProfile] = useState(true)
  const [activeTab, setActiveTab] = useState<'new_session' | 'history'>('new_session')

  // Form State for Evolution Session
  const [fechaHora, setFechaHora] = useState('')
  const [objetivos, setObjetivos] = useState<InterventionObjective[]>([])
  const [descripcionSesion, setDescripcionSesion] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Past sessions for this patient
  const [pastSessions, setPastSessions] = useState<SessionEvolution[]>([])

  // Format local current datetime for datetime-local input (YYYY-MM-DDTHH:mm)
  const getCurrentLocalDateTime = () => {
    const now = new Date()
    const offset = now.getTimezoneOffset() * 60000
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16)
    return localISOTime
  }

  // Load past sessions and initialize form when patient changes
  useEffect(() => {
    if (patient && isOpen) {
      const sessions = storageService.getSessionsByPatientId(patient.id)
      setPastSessions(sessions)
      initNewSession()
    }
  }, [patient, isOpen])

  const initNewSession = () => {
    setFechaHora(getCurrentLocalDateTime())
    setObjetivos([
      {
        id: 'obj-' + Date.now() + '-1',
        descripcion: '',
        estado: 'en_proceso'
      }
    ])
    setDescripcionSesion('')
    setActiveTab('new_session')
  }

  // Objectives handlers
  const handleAddObjective = () => {
    const newObj: InterventionObjective = {
      id: 'obj-' + Date.now() + '-' + (objetivos.length + 1),
      descripcion: '',
      estado: 'en_proceso'
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
  const handleSaveEvolution = (e: React.FormEvent) => {
    e.preventDefault()
    if (!patient) return

    // Validate at least description or objectives
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

    setTimeout(() => {
      storageService.addSession({
        pacienteId: patient.id,
        pacienteNombre: patient.nombre,
        pacienteRut: patient.rut,
        fechaHora: fechaHora || getCurrentLocalDateTime(),
        objetivos: validObjectives.length > 0 ? validObjectives : objetivos,
        descripcionSesion: descripcionSesion.trim()
      })

      setIsSaving(false)
      showToast({
        title: 'Evolución Guardada',
        description: `Sesión registrada con éxito para ${patient.nombre}.`,
        type: 'success'
      })

      // Refresh patient sessions
      const updatedSessions = storageService.getSessionsByPatientId(patient.id)
      setPastSessions(updatedSessions)

      if (onSessionSaved) {
        onSessionSaved()
      }
    }, 400)
  }

  if (!patient) return null

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

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={activeTab === 'new_session' ? 'lime' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('new_session')}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva Atención
            </Button>
            <Button
              type="button"
              variant={activeTab === 'history' ? 'lime' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('history')}
              className="gap-1.5"
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
        {/* APARTADO SUPERIOR: DATOS REGISTRADOS DEL PACIENTE (PERFIL + EVALUACIÓN)  */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs overflow-hidden transition-all duration-200">
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
                      {patient.correo || '-'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-zinc-400 block font-medium">Cuidador/a:</span>
                    <span className="font-semibold text-zinc-900 flex items-center gap-1">
                      <HeartHandshake className="w-3.5 h-3.5 text-lime-600" />
                      {patient.cuidador || 'No especificado'}
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
                        Motivo de Consulta Detallado:
                      </span>
                      <p className="text-zinc-800 bg-white p-2 rounded-lg border border-zinc-200 mt-0.5 leading-relaxed">
                        {patient.evaluacion.motivoConsultaDetalle}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-zinc-400 block font-medium">
                      Evaluación Inicial (Observación Ocupacional):
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
        {/* TABS BODY: NUEVA ATENCIÓN / EVOLUCIÓN VS HISTORIAL                        */}
        {/* ========================================================================= */}
        {activeTab === 'new_session' ? (
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-6">
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
                    Ingresa los objetivos abordados en la sesión y su nivel de logro alcanzado.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={initNewSession}
                className="text-xs"
              >
                + Nueva Atención (Limpiar formulario)
              </Button>
            </div>

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

              {/* Objetivos de Intervención (Dinámicos) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label required>Objetivos de Intervención</Label>
                    <p className="text-[11px] text-zinc-500">
                      Define los objetivos trabajados y selecciona su estado de logro (Logrado, Parcialmente Logrado, No Logrado, En Proceso).
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
                      <span className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {index + 1}
                      </span>

                      {/* Objective Description */}
                      <div className="flex-1 w-full">
                        <Input
                          placeholder="Ej. Mantener tolerancia táctil con texturas mixtas por 10 min..."
                          value={obj.descripcion}
                          onChange={(e) =>
                            handleUpdateObjectiveText(obj.id, e.target.value)
                          }
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
                          className="h-9 px-3 py-1 text-xs font-semibold rounded-lg border border-zinc-300 bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
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

              {/* Descripción de la Sesión */}
              <div className="space-y-1.5">
                <Label htmlFor="descripcionSesion" required>
                  Descripción de la Sesión (Notas Clínicas y Observaciones)
                </Label>
                <Textarea
                  id="descripcionSesion"
                  placeholder="Detalla las actividades realizadas, respuesta del usuario, niveles de alerta, adaptaciones implementadas y tareas para el hogar..."
                  value={descripcionSesion}
                  onChange={(e) => setDescripcionSesion(e.target.value)}
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
        ) : (
          /* ========================================================================= */
          /* HISTORIAL DE SESIONES PREVIAS DEL PACIENTE                                */
          /* ========================================================================= */
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
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
                className="gap-1.5"
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
                          Objetivos Abordados:
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
                        {session.descripcionSesion}
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
