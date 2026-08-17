import React, { useState } from 'react'
import { Activity, Lock, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { showToast } from '@/components/ui/toast'
import { storageService } from '@/services/storageService'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { User } from '@/types'

interface LoginPageProps {
  onLoginSuccess: (user: User) => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Modal recuperar contraseña
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [isRecovering, setIsRecovering] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      showToast({
        title: 'Campos obligatorios',
        description: 'Por favor ingresa tu correo y contraseña.',
        type: 'error'
      })
      return
    }

    setIsLoading(true)

    // Si Supabase está configurado, autenticamos con Supabase Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        })

        if (error) {
          setIsLoading(false)
          showToast({
            title: 'Error de autenticación',
            description: error.message === 'Invalid login credentials'
              ? 'Correo o contraseña incorrectos. Verifica tus datos.'
              : error.message,
            type: 'error'
          })
          return
        }

        if (data.user) {
          const user: User = {
            id: data.user.id,
            nombre: data.user.user_metadata?.nombre || data.user.email?.split('@')[0] || 'Terapeuta Ocupacional',
            email: data.user.email || email,
            avatarUrl: data.user.user_metadata?.avatarUrl || 'https://images.unsplash.com/photo-1594824813684-904323c2a048?w=150&auto=format&fit=crop&q=80'
          }
          storageService.setUser(user)
          setIsLoading(false)
          showToast({
            title: '¡Sesión iniciada!',
            description: `Bienvenida ${user.nombre}`,
            type: 'success'
          })
          onLoginSuccess(user)
          return
        }
      } catch (err: any) {
        setIsLoading(false)
        showToast({
          title: 'Error de conexión',
          description: 'No se pudo contactar a Supabase. Verifica tu red.',
          type: 'error'
        })
        return
      }
    }

    // Fallback Modo Local (si aún no se configura .env)
    setTimeout(() => {
      setIsLoading(false)
      const user: User = {
        id: 'usr-1',
        nombre: 'Dra. Terapeuta Ocupacional',
        email: email,
        avatarUrl: 'https://images.unsplash.com/photo-1594824813684-904323c2a048?w=150&auto=format&fit=crop&q=80'
      }
      storageService.setUser(user)
      showToast({
        title: '¡Sesión iniciada (Modo Local)!',
        description: `Bienvenida ${user.nombre}`,
        type: 'success'
      })
      onLoginSuccess(user)
    }, 400)
  }

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recoveryEmail) {
      showToast({
        title: 'Correo requerido',
        description: 'Ingresa el correo registrado para enviarte el enlace.',
        type: 'error'
      })
      return
    }

    setIsRecovering(true)

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail.trim())
        setIsRecovering(false)
        if (error) {
          showToast({
            title: 'Error al enviar enlace',
            description: error.message,
            type: 'error'
          })
          return
        }
        setIsForgotModalOpen(false)
        setRecoveryEmail('')
        showToast({
          title: 'Enlace enviado',
          description: `Se enviaron las instrucciones a ${recoveryEmail}.`,
          type: 'success'
        })
        return
      } catch (err: any) {
        setIsRecovering(false)
        showToast({
          title: 'Error',
          description: 'No se pudo procesar la solicitud.',
          type: 'error'
        })
        return
      }
    }

    // Fallback local
    setTimeout(() => {
      setIsRecovering(false)
      setIsForgotModalOpen(false)
      setRecoveryEmail('')
      showToast({
        title: 'Enlace enviado (Simulado)',
        description: `Se han enviado las instrucciones de recuperación a ${recoveryEmail}.`,
        type: 'success'
      })
    }, 700)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-lime-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-lime-100/60 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-8 z-10">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-lime-400 shadow-md">
          <Activity className="w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight text-zinc-900 font-sans">
          Terapia Ocupacional
        </span>
      </div>

      {/* Login Card (Based on Image 1) */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-zinc-200/90 shadow-xl shadow-zinc-200/40 p-8 sm:p-9 z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500 mt-1.5">
            Ingresa tu correo y contraseña para acceder
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" required>
              Correo Electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 text-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" required>
                Contraseña
              </Label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-xs text-zinc-500 hover:text-lime-700 font-medium hover:underline transition-colors"
              >
                Forgot your password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 text-sm"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold bg-zinc-950 text-white hover:bg-zinc-800 hover:text-lime-400 transition-all duration-200 shadow-md group"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Iniciando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Login
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </Button>
        </form>
      </div>

      {/* Footer text */}
      <p className="mt-8 text-center text-xs text-zinc-400 max-w-sm z-10 leading-relaxed">
        Sistema de Fichas Clínicas y Evolución de Pacientes · Terapia Ocupacional
      </p>

      {/* Modal Recuperar Contraseña */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Recuperar Contraseña"
        description="Ingresa tu correo para recibir un enlace de restablecimiento seguro."
        size="sm"
      >
        <form onSubmit={handleRecoverPassword} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="recoveryEmail" required>
              Correo Registrado
            </Label>
            <Input
              id="recoveryEmail"
              type="email"
              placeholder="tu-correo@to-app.cl"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsForgotModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="lime"
              disabled={isRecovering}
            >
              {isRecovering ? 'Enviando...' : 'Enviar Enlace'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
