import { useState, useEffect } from 'react'
import { LoginPage } from './components/auth/LoginPage'
import { Sidebar } from './components/layout/Sidebar'
import { PatientTable } from './components/patients/PatientTable'
import { CreatePatientModal } from './components/patients/CreatePatientModal'
import { AttentionSessionModal } from './components/sessions/AttentionSessionModal'
import { SessionHistoryView } from './components/sessions/SessionHistoryView'
import { ToastContainer, showToast } from './components/ui/toast'
import { storageService } from './services/storageService'
import { Patient, SessionEvolution, User } from './types'

export function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // Navigation tab: 'patients' (Mantenedor) or 'history' (Historial de Atenciones)
  const [activeTab, setActiveTab] = useState<'patients' | 'history'>('patients')

  // Data states
  const [patients, setPatients] = useState<Patient[]>([])
  const [sessions, setSessions] = useState<SessionEvolution[]>([])

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedPatientForAttention, setSelectedPatientForAttention] =
    useState<Patient | null>(null)
  const [isAttentionModalOpen, setIsAttentionModalOpen] = useState(false)

  // Initial load
  useEffect(() => {
    const savedUser = storageService.getUser()
    if (savedUser) {
      setUser(savedUser)
    }
    refreshData()
    setIsInitializing(false)
  }, [])

  const refreshData = () => {
    setPatients(storageService.getPatients())
    setSessions(storageService.getSessions())
  }

  // Handlers
  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser)
    refreshData()
  }

  const handleLogout = () => {
    storageService.clearUser()
    setUser(null)
    showToast({
      title: 'Sesión Cerrada',
      description: 'Has cerrado sesión exitosamente.',
      type: 'info'
    })
  }

  const handleCreatePatient = (
    newPatientData: Omit<Patient, 'id' | 'createdAt'>
  ) => {
    storageService.addPatient(newPatientData)
    refreshData()
  }

  const handleDeletePatient = (patientId: string) => {
    storageService.deletePatient(patientId)
    showToast({
      title: 'Usuario Eliminado',
      description: 'El paciente ha sido removido del sistema.',
      type: 'info'
    })
    refreshData()
  }

  const handleOpenAttentionModal = (patient: Patient) => {
    setSelectedPatientForAttention(patient)
    setIsAttentionModalOpen(true)
  }

  const handleCloseAttentionModal = () => {
    setIsAttentionModalOpen(false)
    setSelectedPatientForAttention(null)
    refreshData()
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="flex items-center gap-3 text-zinc-600 font-medium">
          <div className="w-5 h-5 border-2 border-lime-600 border-t-transparent rounded-full animate-spin" />
          <span>Cargando sistema...</span>
        </div>
      </div>
    )
  }

  // If not authenticated, show Login View (Based on Image 1)
  if (!user) {
    return (
      <>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        <ToastContainer />
      </>
    )
  }

  // Main Authenticated Dashboard (Based on Image 2)
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col md:flex-row antialiased">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        patientCount={patients.length}
        sessionCount={sessions.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto min-h-screen">
        {activeTab === 'patients' ? (
          <PatientTable
            patients={patients}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenAttentionModal={handleOpenAttentionModal}
            onDeletePatient={handleDeletePatient}
          />
        ) : (
          <SessionHistoryView
            sessions={sessions}
            patients={patients}
            onRefresh={refreshData}
            onOpenPatientAttention={handleOpenAttentionModal}
          />
        )}
      </main>

      {/* Modal: Crear Usuario / Paciente */}
      <CreatePatientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreatePatient}
      />

      {/* Modal Grande: Registrar Atención & Evolución */}
      <AttentionSessionModal
        isOpen={isAttentionModalOpen}
        onClose={handleCloseAttentionModal}
        patient={selectedPatientForAttention}
        onSessionSaved={refreshData}
      />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  )
}

export default App
