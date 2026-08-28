import { useState } from 'react'
import { Activity, Users, ClipboardList, LogOut, Database, HardDrive, AlertTriangle, X } from 'lucide-react'
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
  // Mobile drawer props
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  patientCount = 0,
  sessionCount = 0,
  isMobileOpen = false,
  onMobileClose
}: SidebarProps) {
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false)

  const handleConfirmLogout = () => {
    setIsConfirmLogoutOpen(false)
    onLogout()
  }

  const handleTabChange = (tab: 'patients' | 'history') => {
    setActiveTab(tab)
    // Auto-close drawer on mobile when a tab is selected
    if (onMobileClose) {
      onMobileClose()
    }
  }

  const SidebarContent = () => (
    <aside className="w-64 bg-white border-r border-zinc-200/80 flex flex-col justify-between h-full select-none">
      {/* Top Section */}
      <div className="p-4 flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
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

          {/* Close button - only visible on mobile */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors mr-1"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
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
            onClick={() => handleTabChange('patients')}
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
            onClick={() => handleTabChange('history')}
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

      {/* Bottom Section: User Profile & Logout */}
      <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-11 h-11 rounded-full bg-lime-200 border-2 border-lime-400 flex items-center justify-center text-lime-900 font-bold text-sm shrink-0 overflow-hidden shadow-xs relative">
              <img
                src={user?.avatarUrl || '/avatar_fabiola.jpg'}
                alt={user?.nombre || 'Fabiola Alarcón'}
                className="w-full h-full object-cover scale-[1.38]"
                style={{ objectPosition: 'center 35%' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none'
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">
                {user?.nombre || 'Fabiola Alarcón S.'}
              </p>
              <p className="text-[11px] text-zinc-500 truncate">
                {user?.email || 'Terapeuta Ocupacional'}
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
  )

  return (
    <>
      {/* ============================== */}
      {/* DESKTOP: Sidebar always visible */}
      {/* ============================== */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen">
        <SidebarContent />
      </div>

      {/* ============================== */}
      {/* MOBILE: Drawer overlay          */}
      {/* ============================== */}
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 max-w-[85vw] transition-transform duration-300 ease-in-out lg:hidden shadow-2xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full">
          <SidebarContent />
        </div>
      </div>

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
