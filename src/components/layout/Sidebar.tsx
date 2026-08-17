import { useState } from 'react'
import { Activity, Users, ClipboardList, LogOut, Database, HardDrive, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { User } from '@/types'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  activeTab: 'patients' | 'history'
  setActiveTab: (tab: 'patients' | 'history') => void
  user: User | null
  onLogout: () => void
  patientCount?: number
  sessionCount?: number
}

export function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  patientCount = 0,
  sessionCount = 0
}: SidebarProps) {
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false)

  const handleConfirmLogout = () => {
    setIsConfirmLogoutOpen(false)
    onLogout()
  }

  return (
    <>
      <aside className="w-64 bg-white border-r border-zinc-200/80 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
        {/* Top Section */}
        <div className="p-4 flex flex-col gap-6">
          {/* Brand Header (Based on Image 2 Acme Inc. style) */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-lime-400 shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-zinc-900 tracking-tight block">
                Terapia Ocupacional
              </span>
              <span className="text-[11px] text-zinc-400 font-medium block">
                Sistema de Atenciones
              </span>
            </div>
          </div>

          {/* Quick info chip con estado de Supabase / Local */}
          <div className="bg-zinc-900 text-white rounded-xl p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isSupabaseConfigured
                    ? "bg-lime-400 animate-pulse"
                    : "bg-amber-400"
                )}
              />
              <span className="text-xs font-semibold">
                {isSupabaseConfigured ? 'Supabase Conectado' : 'Modo Local'}
              </span>
            </div>
            <span className="text-[11px] px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-full font-mono font-medium flex items-center gap-1">
              {isSupabaseConfigured ? (
                <Database className="w-3 h-3 text-lime-400" />
              ) : (
                <HardDrive className="w-3 h-3 text-amber-400" />
              )}
              {isSupabaseConfigured ? 'Cloud' : 'Local'}
            </span>
          </div>

          {/* Navigation Menu */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Navegación
            </div>

            {/* Mantenedor de Usuarios (Pacientes) */}
            <button
              onClick={() => setActiveTab('patients')}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                activeTab === 'patients'
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80"
              )}
            >
              <div className="flex items-center gap-3">
                <Users className={cn(
                  "w-4 h-4 transition-colors",
                  activeTab === 'patients' ? "text-lime-400" : "text-zinc-500 group-hover:text-zinc-900"
                )} />
                <span>Mantenedor de Usuarios</span>
              </div>
              {patientCount > 0 && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  activeTab === 'patients' ? "bg-zinc-800 text-lime-300" : "bg-zinc-100 text-zinc-600"
                )}>
                  {patientCount}
                </span>
              )}
            </button>

            {/* Historial de Atenciones */}
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                activeTab === 'history'
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80"
              )}
            >
              <div className="flex items-center gap-3">
                <ClipboardList className={cn(
                  "w-4 h-4 transition-colors",
                  activeTab === 'history' ? "text-lime-400" : "text-zinc-500 group-hover:text-zinc-900"
                )} />
                <span>Historial de Atenciones</span>
              </div>
              {sessionCount > 0 && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  activeTab === 'history' ? "bg-zinc-800 text-lime-300" : "bg-zinc-100 text-zinc-600"
                )}>
                  {sessionCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Section: User Profile & Logout (Based on Image 2 footer) */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-lime-200 border border-lime-300 flex items-center justify-center text-lime-900 font-bold text-sm shrink-0 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.nombre} className="w-full h-full object-cover" />
                ) : (
                  user?.nombre?.charAt(0) || 'U'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-900 truncate">
                  {user?.nombre || 'Terapeuta Ocupacional'}
                </p>
                <p className="text-[11px] text-zinc-500 truncate">
                  {user?.email || 'terapeuta@to-app.cl'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsConfirmLogoutOpen(true)}
              title="Cerrar sesión"
              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Modal de Confirmación para Cerrar Sesión */}
      <Modal
        isOpen={isConfirmLogoutOpen}
        onClose={() => setIsConfirmLogoutOpen(false)}
        size="sm"
        title={
          <div className="flex items-center gap-2.5 text-zinc-900">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span>¿Cerrar Sesión?</span>
          </div>
        }
        description="¿Estás segura de que deseas salir del sistema de Terapia Ocupacional?"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-zinc-500 leading-relaxed">
            Tendrás que volver a ingresar tu correo y contraseña para acceder a las fichas clínicas de los pacientes.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmLogoutOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmLogout}
              className="gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              Sí, Cerrar Sesión
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
