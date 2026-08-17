import { useState, useMemo } from 'react'
import {
  History,
  Search,
  Calendar,
  User,
  FilterX,
  Target,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { SessionEvolution, Patient } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { storageService } from '@/services/storageService'
import { showToast } from '@/components/ui/toast'

interface SessionHistoryViewProps {
  sessions: SessionEvolution[]
  patients: Patient[]
  onRefresh: () => void
  onOpenPatientAttention: (patient: Patient) => void
}

export function SessionHistoryView({
  sessions,
  patients,
  onRefresh,
  onOpenPatientAttention
}: SessionHistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Metrics calculation
  const totalObjectives = useMemo(() => {
    return sessions.reduce((acc, s) => acc + (s.objetivos?.length || 0), 0)
  }, [sessions])

  const achievedObjectives = useMemo(() => {
    return sessions.reduce(
      (acc, s) =>
        acc + (s.objetivos?.filter((o) => o.estado === 'logrado').length || 0),
      0
    )
  }, [sessions])

  const achievementRate =
    totalObjectives > 0
      ? Math.round((achievedObjectives / totalObjectives) * 100)
      : 0

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const term = searchTerm.toLowerCase().trim()
      const matchSearch =
        !term ||
        session.pacienteNombre.toLowerCase().includes(term) ||
        session.pacienteRut.toLowerCase().includes(term) ||
        session.descripcionSesion.toLowerCase().includes(term)

      const matchStatus =
        statusFilter === 'all' ||
        session.objetivos?.some((o) => o.estado === statusFilter)

      return matchSearch && matchStatus
    })
  }, [sessions, searchTerm, statusFilter])

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('¿Estás seguro de eliminar este registro de atención?')) {
      storageService.deleteSession(sessionId)
      showToast({
        title: 'Atención Eliminada',
        description: 'El registro ha sido eliminado del historial.',
        type: 'info'
      })
      onRefresh()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 font-sans">
            Historial de Atenciones
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Registro cronológico de todas las evoluciones y sesiones de terapia ocupacional realizadas.
          </p>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Total Atenciones
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <History className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 mt-2">
            {sessions.length}
          </p>
          <p className="text-xs text-zinc-400 mt-1">Sesiones registradas en el sistema</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Objetivos Abordados
            </span>
            <div className="w-8 h-8 rounded-lg bg-lime-100 flex items-center justify-center text-lime-800">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-lime-700 mt-2">
            {totalObjectives}
          </p>
          <p className="text-xs text-zinc-400 mt-1">{achievedObjectives} logrados exitosamente</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Tasa de Logro
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-lime-400">
              <span className="text-xs font-bold">%</span>
            </div>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 mt-2">
            {achievementRate}%
          </p>
          <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-lime-500 h-1.5 rounded-full transition-all"
              style={{ width: `${achievementRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Buscar por Paciente, RUT o contenido de la sesión..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-zinc-50/70 border-zinc-200 focus:bg-white text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-lime-500 focus:outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="logrado">✓ Logrado</option>
              <option value="parcialmente_logrado">◐ Parcialmente Logrado</option>
              <option value="no_logrado">✕ No Logrado</option>
              <option value="en_proceso">⋯ En Proceso</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
              }}
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 ml-auto md:ml-0"
            >
              <FilterX className="w-3.5 h-3.5" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center text-zinc-400">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30 text-zinc-400" />
            <h4 className="text-base font-bold text-zinc-700">No se encontraron atenciones</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              No hay registros que coincidan con los filtros de búsqueda aplicados.
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const patient = patients.find((p) => p.id === session.pacienteId)

            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-zinc-200 shadow-2xs hover:shadow-md transition-all p-5 sm:p-6 space-y-4"
              >
                {/* Header of session card */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-lime-100 text-lime-800 font-bold flex items-center justify-center text-sm">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-zinc-900">
                          {session.pacienteNombre}
                        </h3>
                        <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-medium">
                          {session.pacienteRut}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{formatDateTime(session.fechaHora)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {patient && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenPatientAttention(patient)}
                        className="gap-1.5 text-xs text-lime-800 hover:text-lime-900 hover:bg-lime-50 border-lime-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver Ficha Completa
                      </Button>
                    )}
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar atención"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Objetivos de la sesión */}
                {session.objetivos && session.objetivos.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                      Objetivos Abordados
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {session.objetivos.map((obj) => (
                        <div
                          key={obj.id}
                          className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs"
                        >
                          <span className="text-zinc-800 font-medium leading-relaxed">
                            {obj.descripcion || 'Sin descripción'}
                          </span>
                          <Badge
                            variant="status"
                            status={obj.estado}
                            className="shrink-0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Descripción Clínica */}
                {session.descripcionSesion && (
                  <div className="bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-200/80 text-xs text-zinc-700 leading-relaxed">
                    <span className="font-bold text-zinc-900 block mb-1">
                      Descripción de la Sesión & Observaciones:
                    </span>
                    <p className="whitespace-pre-line">{session.descripcionSesion}</p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
