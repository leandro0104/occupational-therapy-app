export type ObjectiveStatus = 'logrado' | 'parcialmente_logrado' | 'no_logrado' | 'en_proceso'

export interface InterventionObjective {
  id: string
  descripcion: string
  estado: ObjectiveStatus
}

export interface PatientEvaluation {
  motivoConsultaDetalle?: string
  evaluacionInicial: string
  instrumentosAplicados: string
  resultados: string
}

export interface GeneralObjectiveHistoryItem {
  id: string
  objetivoGeneral: string
  fechaCompletado: string
  objetivosSecundarios: {
    descripcion: string
    estado: ObjectiveStatus
    fechaLogro?: string
  }[]
  notasCierre?: string
}

export interface Patient {
  id: string
  // Perfil de la persona
  nombre: string
  rut: string
  edad: number | string
  telefono: string
  correo: string
  cuidador: string
  motivoConsulta: string
  fechaIngreso: string

  // Objetivo General (Objetivo Padre del paciente)
  objetivoGeneralId?: string
  objetivoGeneral?: string
  objetivoGeneralCompletado?: boolean
  objetivosGeneralesHistorial?: GeneralObjectiveHistoryItem[]
  
  // Evaluación inicial
  evaluacion?: PatientEvaluation

  // Metadatos
  createdAt?: string
  updatedAt?: string
}

export interface SessionEvolution {
  id: string
  pacienteId: string
  pacienteNombre: string
  pacienteRut: string
  fechaHora: string // ISO date string
  objetivoGeneralId?: string // ID de relación al Objetivo General en la BD
  objetivoGeneralTexto?: string // Texto descriptivo del Objetivo General
  objetivos: InterventionObjective[]
  descripcionSesion: string
  createdAt: string
}

export interface User {
  id: string
  nombre: string
  email: string
  avatarUrl?: string
}
