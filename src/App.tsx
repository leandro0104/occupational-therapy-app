import React, { useState, useEffect } from 'react'
import { LoginPage } from './components/auth/LoginPage'
import { Sidebar } from './components/layout/Sidebar'
import { PatientTable } from './components/patients/PatientTable'
import { CreatePatientModal } from './components/patients/CreatePatientModal'
import { AttentionSessionModal } from './components/sessions/AttentionSessionModal'
import { SessionHistoryView } from './components/sessions/SessionHistoryView'
import { ToastContainer, showToast } from './components/ui/toast'
import { Modal } from './components/ui/modal'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { storageService } from './services/storageService'
import { Patient, SessionEvolution, User } from './types'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import { KeyRound } from 'lucide-react'

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

  // Password Recovery state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Initial load
  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        // 1. Check Supabase session if configured
        if (isSupabaseConfigured && supabase) {
          try {
            const { data } = await supabase.auth.getSession()
            if (data.session?.user && isMounted) {
              const authUser: User = {
                id: data.session.user.id,
                nombre:
                  data.session.user.user_metadata?.nombre ||
                  'Fabiola Alarcón S.',
                email: data.session.user.email || 'fabiola.alarcon@to-app.cl',
                avatarUrl:
                  data.session.user.user_metadata?.avatarUrl ||
                  '/avatar_fabiola.jpg'
              }
              setUser(authUser)
              storageService.setUser(authUser)
            }
          } catch (authErr) {
            console.warn('Error verificando sesión de Supabase:', authErr)
          }

          // Listener for Password Recovery and Auth Events
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (!isMounted) return
              if (event === 'PASSWORD_RECOVERY') {
                setIsResetModalOpen(true)
              } else if (event === 'SIGNED_IN' && session?.user) {
                const authUser: User = {
                  id: session.user.id,
                  nombre:
                    session.user.user_metadata?.nombre ||
                    'Fabiola Alarcón S.',
                  email: session.user.email || 'fabiola.alarcon@to-app.cl',
                  avatarUrl:
                    session.user.user_metadata?.avatarUrl ||
                    '/avatar_fabiola.jpg'
                }
                setUser(authUser)
                storageService.setUser(authUser)
              } else if (event === 'SIGNED_OUT') {
                setUser(null)
                storageService.clearUser()
              }
            }
          )

          // Timeout de seguridad de 3 segundos para cargar datos iniciales
          await Promise.race([
            refreshData(),
            new Promise((resolve) => setTimeout(resolve, 2000))
          ])

          return () => {
            authListener.subscription.unsubscribe()
          }
        } else {
          const savedUser = storageService.getUser()
          if (savedUser && isMounted) {
            setUser(savedUser)
          }
          await refreshData()
        }
      } catch (err) {
        console.error('Error durante la inicialización:', err)
      } finally {
        if (isMounted) {
          setIsInitializing(false)
        }
      }
    }

    init()

    return () => {
      isMounted = false
    }
  }, [])

  // Auto-Logout por inactividad clínica (30 minutos)
  useEffect(() => {
    if (!user) return

    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutos
    let timer: any

    const handleInactivityLogout = async () => {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut()
      }
      storageService.clearUser()
      setUser(null)
      showToast({
        title: 'Sesión Cerrada por Inactividad',
        description: 'Por seguridad de los datos de los pacientes, la sesión se cerró tras 30 minutos de inactividad.',
        type: 'info'
      })
    }

    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(handleInactivityLogout, INACTIVITY_TIMEOUT_MS)
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    )

    resetTimer()

    return () => {
      clearTimeout(timer)
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      )
    }
  }, [user])

  const refreshData = async () => {
    try {
      const [fetchedPatients, fetchedSessions] = await Promise.all([
        storageService.getPatients(),
        storageService.getSessions()
      ])
      setPatients(fetchedPatients)
      setSessions(fetchedSessions)
    } catch (err) {
      console.error('Error refrescando datos:', err)
    }
  }

  // Handlers
  const handleLoginSuccess = async (loggedInUser: User) => {
    setUser(loggedInUser)
    await refreshData()
  }

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
    storageService.clearUser()
    setUser(null)
    showToast({
      title: 'Sesión Cerrada',
      description: 'Has cerrado sesión exitosamente.',
      type: 'info'
    })
  }

  const handleCreatePatient = async (
    newPatientData: Omit<Patient, 'id' | 'createdAt'>
  ) => {
    await storageService.addPatient(newPatientData)
    await refreshData()
  }

  const handleDeletePatient = async (patientId: string) => {
    await storageService.deletePatient(patientId)
    showToast({
      title: 'Usuario Eliminado',
      description: 'El paciente ha sido removido del sistema.',
      type: 'info'
    })
    await refreshData()
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

  const handlePatientUpdated = (updatedPatient: Patient) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    )
    setSelectedPatientForAttention(updatedPatient)
  }

  // Update Password after Recovery Link
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      showToast({
        title: 'Contraseña muy corta',
        description: 'La contraseña debe tener al menos 6 caracteres.',
        type: 'error'
      })
      return
    }

    if (newPassword !== confirmPassword) {
      showToast({
        title: 'Las contraseñas no coinciden',
        description: 'Verifica que ambas contraseñas sean idénticas.',
        type: 'error'
      })
      return
    }

    setIsUpdatingPassword(true)

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        })

        setIsUpdatingPassword(false)

        if (error) {
          showToast({
            title: 'Error al actualizar',
            description: error.message,
            type: 'error'
          })
          return
        }

        setIsResetModalOpen(false)
        setNewPassword('')
        setConfirmPassword('')
        showToast({
          title: '¡Contraseña Actualizada!',
          description: 'Tu nueva contraseña ha sido guardada con éxito.',
          type: 'success'
        })
        return
      } catch (err: any) {
        setIsUpdatingPassword(false)
        showToast({
          title: 'Error',
          description: 'No se pudo actualizar la contraseña.',
          type: 'error'
        })
        return
      }
    }

    setIsUpdatingPassword(false)
    setIsResetModalOpen(false)
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
        {/* Reset Password Modal in case user lands on recovery URL */}
        <Modal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          title={
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-lime-600" />
              <span>Establecer Nueva Contraseña</span>
            </div>
          }
          description="Ingresa tu nueva contraseña para acceder a la aplicación."
          size="sm"
        >
          <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" required>
                Nueva Contraseña
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" required>
                Confirmar Contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResetModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="lime"
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? 'Guardando...' : 'Guardar Contraseña'}
              </Button>
            </div>
          </form>
        </Modal>
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
        onPatientUpdated={handlePatientUpdated}
      />

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-lime-600" />
            <span>Establecer Nueva Contraseña</span>
          </div>
        }
        description="Ingresa tu nueva contraseña para acceder a la aplicación."
        size="sm"
      >
        <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="newPasswordAuth" required>
              Nueva Contraseña
            </Label>
            <Input
              id="newPasswordAuth"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPasswordAuth" required>
              Confirmar Contraseña
            </Label>
            <Input
              id="confirmPasswordAuth"
              type="password"
              placeholder="Repite la contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResetModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="lime"
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? 'Guardando...' : 'Guardar Contraseña'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  )
}

export default App
