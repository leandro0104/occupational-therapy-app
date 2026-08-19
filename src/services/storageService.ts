import { Patient, SessionEvolution } from '../types'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const PATIENTS_STORAGE_KEY = 'to_app_patients_v1'
const SESSIONS_STORAGE_KEY = 'to_app_sessions_v1'
const USER_STORAGE_KEY = 'to_app_user_v1'

// Datos iniciales de demostración
const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    nombre: 'Mateo Fernández Silva',
    rut: '22.451.890-K',
    edad: 7,
    telefono: '+56 9 8456 1234',
    correo: 'claudia.silva@email.com',
    cuidador: 'Claudia Silva (Madre)',
    motivoConsulta: 'Dificultades en integración sensorial y motricidad fina en contexto escolar.',
    fechaIngreso: '2026-03-01',
    objetivoGeneral: 'Desarrollar habilidades sensoriomotoras y de procesamiento táctil para favorecer la autonomía en el desempeño escolar y actividades de la vida diaria.',
    objetivoGeneralCompletado: false,
    objetivosGeneralesHistorial: [],
    evaluacion: {
      motivoConsultaDetalle: 'Derivado por neurólogo infantil y colegio debido a problemas de atención, hipersensibilidad táctil y dificultades en agarre de lápiz.',
      evaluacionInicial: 'Se observa prensión trípode estática, fatiga temprana durante actividades de grafomotricidad, hiperreactividad ante texturas ásperas y búsqueda de estímulo propioceptivo.',
      instrumentosAplicados: 'Perfil Sensorial 2 de Winnie Dunn, VMI (Test Beery-Buktenica de Integración Visomotriz), Escala de Evaluación del Juego.',
      resultados: 'Perfil de procesamiento sensorial con hiperrespuesta táctil (desempeño típico en vestibular). VMI percentil 25. Dificultad moderada en coordinación bimanual.'
    },
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'pat-2',
    nombre: 'Sofía Valenzuela Morales',
    rut: '24.112.345-8',
    edad: 5,
    telefono: '+56 9 7654 9870',
    correo: 'm.valenzuela@gmail.com',
    cuidador: 'Marcela Morales (Madre)',
    motivoConsulta: 'Retraso en el desarrollo psicomotor e independencia en actividades de la vida diaria (AVD).',
    fechaIngreso: '2026-04-10',
    objetivoGeneral: 'Incrementar la independencia en AVD básicas (vestido y alimentación) mediante estimulación psicomotriz y praxias bimanuales.',
    objetivoGeneralCompletado: false,
    objetivosGeneralesHistorial: [],
    evaluacion: {
      motivoConsultaDetalle: 'Familia consulta para potenciar autonomía en alimentación, vestido y juego simbólico.',
      evaluacionInicial: 'Requiere asistencia física moderada para colocarse prendas sin botones, uso de cuchara con derrame parcial, interés lúdico en juegos causa-efecto.',
      instrumentosAplicados: 'PEDI (Pediatric Evaluation of Disability Inventory), Observación clínica estructurada de AVD básicas.',
      resultados: 'PEDI Autocuidado: puntuación estándar 32. Requiere plan de estimulación para pinza tridigital y praxias ideomotoras.'
    },
    createdAt: '2026-04-10T14:30:00.000Z'
  }
]

const INITIAL_SESSIONS: SessionEvolution[] = [
  {
    id: 'ses-1',
    pacienteId: 'pat-1',
    pacienteNombre: 'Mateo Fernández Silva',
    pacienteRut: '22.451.890-K',
    fechaHora: '2026-08-10T15:30',
    objetivos: [
      {
        id: 'obj-1',
        descripcion: 'Tolerar exploración táctil de masas y slime durante al menos 10 minutos',
        estado: 'logrado'
      },
      {
        id: 'obj-2',
        descripcion: 'Mantener prensión trípode dinámica en recorte de líneas rectas',
        estado: 'parcialmente_logrado'
      }
    ],
    descripcionSesion: 'Se inicia sesión con preparación sensoriomotriz en hamaca vestibular y arrastre en patineta. Mateo participa activamente.',
    createdAt: '2026-08-10T16:30:00.000Z'
  }
]

// Mapeos de DB a TypeScript
interface DbPatientRow {
  id: string
  nombre: string
  rut: string
  edad: number | null
  telefono: string | null
  correo: string | null
  cuidador: string | null
  motivo_consulta: string | null
  fecha_ingreso: string | null
  objetivo_general?: string | null
  objetivo_general_completado?: boolean | null
  objetivos_generales_historial?: any
  motivo_consulta_detalle: string | null
  evaluacion_inicial: string | null
  instrumentos_aplicados: string | null
  resultados: string | null
  created_at: string
}

interface DbSessionRow {
  id: string
  paciente_id: string
  paciente_nombre: string
  paciente_rut: string
  fecha_hora: string
  objetivo_general_texto?: string | null
  objetivos: any
  descripcion_sesion: string
  created_at: string
}

function mapDbToPatient(row: DbPatientRow): Patient {
  return {
    id: row.id,
    nombre: row.nombre,
    rut: row.rut,
    edad: row.edad ?? '',
    telefono: row.telefono ?? '',
    correo: row.correo ?? '',
    cuidador: row.cuidador ?? '',
    motivoConsulta: row.motivo_consulta ?? '',
    fechaIngreso: row.fecha_ingreso ?? new Date().toISOString().split('T')[0],
    objetivoGeneral: row.objetivo_general ?? '',
    objetivoGeneralCompletado: row.objetivo_general_completado ?? false,
    objetivosGeneralesHistorial: Array.isArray(row.objetivos_generales_historial)
      ? row.objetivos_generales_historial
      : [],
    evaluacion: {
      motivoConsultaDetalle: row.motivo_consulta_detalle ?? '',
      evaluacionInicial: row.evaluacion_inicial ?? '',
      instrumentosAplicados: row.instrumentos_aplicados ?? '',
      resultados: row.resultados ?? ''
    },
    createdAt: row.created_at
  }
}

function mapDbToSession(row: DbSessionRow): SessionEvolution {
  return {
    id: row.id,
    pacienteId: row.paciente_id,
    pacienteNombre: row.paciente_nombre,
    pacienteRut: row.paciente_rut,
    fechaHora: row.fecha_hora,
    objetivoGeneralTexto: row.objetivo_general_texto ?? '',
    objetivos: Array.isArray(row.objetivos) ? row.objetivos : [],
    descripcionSesion: row.descripcion_sesion ?? '',
    createdAt: row.created_at
  }
}

export const storageService = {
  isSupabaseActive(): boolean {
    return isSupabaseConfigured && supabase !== null
  },

  // ==========================================
  // PACIENTES
  // ==========================================
  async getPatients(): Promise<Patient[]> {
    if (this.isSupabaseActive()) {
      try {
        const { data, error } = await supabase!
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error cargando pacientes de Supabase:', error)
          return this.getLocalPatients()
        }
        return (data as DbPatientRow[]).map(mapDbToPatient)
      } catch (err) {
        console.error('Fallo de conexión a Supabase:', err)
        return this.getLocalPatients()
      }
    }
    return this.getLocalPatients()
  },

  getLocalPatients(): Patient[] {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS))
      return INITIAL_PATIENTS
    }
    try {
      return JSON.parse(raw)
    } catch {
      return INITIAL_PATIENTS
    }
  },

  async addPatient(patientData: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> {
    if (this.isSupabaseActive()) {
      try {
        const { data, error } = await supabase!
          .from('patients')
          .insert({
            nombre: patientData.nombre,
            rut: patientData.rut,
            edad: patientData.edad ? Number(patientData.edad) : null,
            telefono: patientData.telefono || null,
            correo: patientData.correo || null,
            cuidador: patientData.cuidador || null,
            motivo_consulta: patientData.motivoConsulta || null,
            fecha_ingreso: patientData.fechaIngreso || null,
            objetivo_general: patientData.objetivoGeneral || null,
            objetivo_general_completado: patientData.objetivoGeneralCompletado ?? false,
            objetivos_generales_historial: patientData.objetivosGeneralesHistorial || [],
            motivo_consulta_detalle: patientData.evaluacion?.motivoConsultaDetalle || null,
            evaluacion_inicial: patientData.evaluacion?.evaluacionInicial || null,
            instrumentos_aplicados: patientData.evaluacion?.instrumentosAplicados || null,
            resultados: patientData.evaluacion?.resultados || null
          })
          .select()
          .single()

        if (error) {
          console.error('Error insertando paciente en Supabase:', error)
        } else if (data) {
          return mapDbToPatient(data as DbPatientRow)
        }
      } catch (err) {
        console.error('Excepción al guardar paciente en Supabase:', err)
      }
    }

    // Fallback local
    const local = this.getLocalPatients()
    const newPatient: Patient = {
      ...patientData,
      id: 'pat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString()
    }
    local.unshift(newPatient)
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(local))
    return newPatient
  },

  async updatePatient(patient: Patient): Promise<Patient> {
    if (this.isSupabaseActive()) {
      try {
        const { data, error } = await supabase!
          .from('patients')
          .update({
            nombre: patient.nombre,
            rut: patient.rut,
            edad: patient.edad ? Number(patient.edad) : null,
            telefono: patient.telefono || null,
            correo: patient.correo || null,
            cuidador: patient.cuidador || null,
            motivo_consulta: patient.motivoConsulta || null,
            fecha_ingreso: patient.fechaIngreso || null,
            objetivo_general: patient.objetivoGeneral || null,
            objetivo_general_completado: patient.objetivoGeneralCompletado ?? false,
            objetivos_generales_historial: patient.objetivosGeneralesHistorial || [],
            motivo_consulta_detalle: patient.evaluacion?.motivoConsultaDetalle || null,
            evaluacion_inicial: patient.evaluacion?.evaluacionInicial || null,
            instrumentos_aplicados: patient.evaluacion?.instrumentosAplicados || null,
            resultados: patient.evaluacion?.resultados || null
          })
          .eq('id', patient.id)
          .select()
          .single()

        if (error) {
          console.error('Error actualizando paciente en Supabase:', error)
        } else if (data) {
          return mapDbToPatient(data as DbPatientRow)
        }
      } catch (err) {
        console.error('Excepción al actualizar paciente en Supabase:', err)
      }
    }

    // Fallback local
    const local = this.getLocalPatients()
    const index = local.findIndex(p => p.id === patient.id)
    if (index !== -1) {
      local[index] = { ...patient, updatedAt: new Date().toISOString() }
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(local))
    }
    return patient
  },

  async deletePatient(id: string): Promise<boolean> {
    if (this.isSupabaseActive()) {
      try {
        const { error } = await supabase!
          .from('patients')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error eliminando paciente en Supabase:', error)
        }
      } catch (err) {
        console.error('Excepción al eliminar paciente en Supabase:', err)
      }
    }

    const local = this.getLocalPatients()
    const filtered = local.filter(p => p.id !== id)
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(filtered))
    return true
  },

  // ==========================================
  // SESIONES / EVOLUCIONES
  // ==========================================
  async getSessions(): Promise<SessionEvolution[]> {
    if (this.isSupabaseActive()) {
      try {
        const { data, error } = await supabase!
          .from('sessions')
          .select('*')
          .order('fecha_hora', { ascending: false })

        if (error) {
          console.error('Error cargando sesiones de Supabase:', error)
          return this.getLocalSessions()
        }
        return (data as DbSessionRow[]).map(mapDbToSession)
      } catch (err) {
        console.error('Fallo de conexión a sesiones Supabase:', err)
        return this.getLocalSessions()
      }
    }
    return this.getLocalSessions()
  },

  getLocalSessions(): SessionEvolution[] {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(INITIAL_SESSIONS))
      return INITIAL_SESSIONS
    }
    try {
      return JSON.parse(raw)
    } catch {
      return INITIAL_SESSIONS
    }
  },

  async getSessionsByPatientId(pacienteId: string): Promise<SessionEvolution[]> {
    const sessions = await this.getSessions()
    return sessions
      .filter(s => s.pacienteId === pacienteId)
      .sort((a, b) => {
        const timeA = new Date(a.fechaHora).getTime()
        const timeB = new Date(b.fechaHora).getTime()
        if (timeB !== timeA) return timeB - timeA
        const createA = new Date(a.createdAt || 0).getTime()
        const createB = new Date(b.createdAt || 0).getTime()
        return createB - createA
      })
  },

  async addSession(sessionData: Omit<SessionEvolution, 'id' | 'createdAt'>): Promise<SessionEvolution> {
    if (this.isSupabaseActive()) {
      try {
        const { data, error } = await supabase!
          .from('sessions')
          .insert({
            paciente_id: sessionData.pacienteId.startsWith('pat-') ? null : sessionData.pacienteId,
            paciente_nombre: sessionData.pacienteNombre,
            paciente_rut: sessionData.pacienteRut,
            fecha_hora: sessionData.fechaHora,
            objetivo_general_texto: sessionData.objetivoGeneralTexto || null,
            objetivos: sessionData.objetivos,
            descripcion_sesion: sessionData.descripcionSesion
          })
          .select()
          .single()

        if (error) {
          console.error('Error insertando sesión en Supabase:', error)
        } else if (data) {
          return mapDbToSession(data as DbSessionRow)
        }
      } catch (err) {
        console.error('Excepción al guardar sesión en Supabase:', err)
      }
    }

    // Fallback local
    const local = this.getLocalSessions()
    const newSession: SessionEvolution = {
      ...sessionData,
      id: 'ses-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString()
    }
    local.unshift(newSession)
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(local))
    return newSession
  },

  async deleteSession(id: string): Promise<boolean> {
    if (this.isSupabaseActive()) {
      try {
        const { error } = await supabase!
          .from('sessions')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error eliminando sesión en Supabase:', error)
        }
      } catch (err) {
        console.error('Excepción al eliminar sesión en Supabase:', err)
      }
    }

    const local = this.getLocalSessions()
    const filtered = local.filter(s => s.id !== id)
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(filtered))
    return true
  },

  // ==========================================
  // USUARIO / AUTH LOCAL
  // ==========================================
  getUser() {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },

  setUser(user: { id: string; nombre: string; email: string; avatarUrl?: string }) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  },

  clearUser() {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
}
