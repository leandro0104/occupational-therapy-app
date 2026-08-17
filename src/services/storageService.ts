import { Patient, SessionEvolution } from '../types'

const PATIENTS_STORAGE_KEY = 'to_app_patients_v1'
const SESSIONS_STORAGE_KEY = 'to_app_sessions_v1'
const USER_STORAGE_KEY = 'to_app_user_v1'

// Datos iniciales de demostración contextualizados en Terapia Ocupacional
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
    evaluacion: {
      motivoConsultaDetalle: 'Familia consulta para potenciar autonomía en alimentación, vestido y juego simbólico.',
      evaluacionInicial: 'Requiere asistencia física moderada para colocarse prendas sin botones, uso de cuchara con derrame parcial, interés lúdico en juegos causa-efecto.',
      instrumentosAplicados: 'PEDI (Pediatric Evaluation of Disability Inventory), Observación clínica estructurada de AVD básicas.',
      resultados: 'PEDI Autocuidado: puntuación estándar 32. Requiere plan de estimulación para pinza tridigital y praxias ideomotoras.'
    },
    createdAt: '2026-04-10T14:30:00.000Z'
  },
  {
    id: 'pat-3',
    nombre: 'Agustín Tapia Muñoz',
    rut: '20.987.654-3',
    edad: 11,
    telefono: '+56 9 9123 4567',
    correo: 'r.tapia@outlook.cl',
    cuidador: 'Roberto Tapia (Padre)',
    motivoConsulta: 'Déficit de autorregulación emocional y coordinación motriz gruesa.',
    fechaIngreso: '2026-05-15',
    evaluacion: {
      motivoConsultaDetalle: 'Dificultades para modular niveles de alerta en aula y frustración ante desafíos motores grupales.',
      evaluacionInicial: 'Buen contacto visual, lenguaje fluido. Dificultad en modulación sensorial y control postural antigravitatorio en bipedestación.',
      instrumentosAplicados: 'SIPT (subpruebas vestibulares), SPM (Sensory Processing Measure), Cuestionario de Rutina Ocupacional.',
      resultados: 'Puntajes atípicos en búsqueda propioceptiva y planeamiento motor bilateral. Alta motivación por actividades de escalada y circuitos.'
    },
    createdAt: '2026-05-15T09:15:00.000Z'
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
      },
      {
        id: 'obj-3',
        descripcion: 'Completar circuito propioceptivo sin desorganización conductual',
        estado: 'logrado'
      }
    ],
    descripcionSesion: 'Se inicia sesión con preparación sensoriomotriz en hamaca vestibular y arrastre en patineta. Mateo participa activamente. Logra tolerar slime adicionando elementos pequeños para rescate con pinzas. Al graficar muestra menor tensión en trazo pero aún requiere recordatorio postural.',
    createdAt: '2026-08-10T16:30:00.000Z'
  },
  {
    id: 'ses-2',
    pacienteId: 'pat-2',
    pacienteNombre: 'Sofía Valenzuela Morales',
    pacienteRut: '24.112.345-8',
    fechaHora: '2026-08-12T11:00',
    objetivos: [
      {
        id: 'obj-4',
        descripcion: 'Desabotonar botones grandes de 2.5cm de forma independiente',
        estado: 'logrado'
      },
      {
        id: 'obj-5',
        descripcion: 'Orientar polera según etiqueta y colocársela con asistencia mínima',
        estado: 'parcialmente_logrado'
      }
    ],
    descripcionSesion: 'Se entrena secuencia de vestido mediante muñecos de tela y luego en sí misma frente a espejo. Sofía logra desabotonar 4 de 4 botones. En postura de polera identifica cuello pero requiere asistencia verbal para pasar los brazos.',
    createdAt: '2026-08-12T12:00:00.000Z'
  }
]

// Funciones del repositorio
export const storageService = {
  // Pacientes
  getPatients(): Patient[] {
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

  savePatients(patients: Patient[]): void {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients))
  },

  getPatientById(id: string): Patient | undefined {
    const patients = this.getPatients()
    return patients.find(p => p.id === id)
  },

  addPatient(patientData: Omit<Patient, 'id' | 'createdAt'>): Patient {
    const patients = this.getPatients()
    const newPatient: Patient = {
      ...patientData,
      id: 'pat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString()
    }
    patients.unshift(newPatient)
    this.savePatients(patients)
    return newPatient
  },

  updatePatient(id: string, updates: Partial<Patient>): Patient | null {
    const patients = this.getPatients()
    const index = patients.findIndex(p => p.id === id)
    if (index === -1) return null
    patients[index] = { ...patients[index], ...updates, updatedAt: new Date().toISOString() }
    this.savePatients(patients)
    return patients[index]
  },

  deletePatient(id: string): boolean {
    const patients = this.getPatients()
    const filtered = patients.filter(p => p.id !== id)
    if (filtered.length === patients.length) return false
    this.savePatients(filtered)
    return true
  },

  // Sesiones de Evolución
  getSessions(): SessionEvolution[] {
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

  saveSessions(sessions: SessionEvolution[]): void {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions))
  },

  getSessionsByPatientId(pacienteId: string): SessionEvolution[] {
    const sessions = this.getSessions()
    return sessions
      .filter(s => s.pacienteId === pacienteId)
      .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime())
  },

  addSession(sessionData: Omit<SessionEvolution, 'id' | 'createdAt'>): SessionEvolution {
    const sessions = this.getSessions()
    const newSession: SessionEvolution = {
      ...sessionData,
      id: 'ses-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString()
    }
    sessions.unshift(newSession)
    this.saveSessions(sessions)
    return newSession
  },

  deleteSession(id: string): boolean {
    const sessions = this.getSessions()
    const filtered = sessions.filter(s => s.id !== id)
    if (filtered.length === sessions.length) return false
    this.saveSessions(filtered)
    return true
  },

  // Usuario / Sesión
  getUser() {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) {
      return null
    }
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
