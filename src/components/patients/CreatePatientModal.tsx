import React, { useState } from 'react'
import { UserPlus, UserCheck, Stethoscope, Save } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { showToast } from '@/components/ui/toast'
import { Patient } from '@/types'

interface CreatePatientModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (patient: Omit<Patient, 'id' | 'createdAt'>) => void
}

export function CreatePatientModal({
  isOpen,
  onClose,
  onSave
}: CreatePatientModalProps) {
  // Perfil de la Persona
  const [nombre, setNombre] = useState('')
  const [rut, setRut] = useState('')
  const [edad, setEdad] = useState<string | number>('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [cuidador, setCuidador] = useState('')
  const [motivoConsulta, setMotivoConsulta] = useState('')
  const [fechaIngreso, setFechaIngreso] = useState(
    new Date().toISOString().split('T')[0]
  )

  // Evaluación
  const [motivoConsultaDetalle, setMotivoConsultaDetalle] = useState('')
  const [evaluacionInicial, setEvaluacionInicial] = useState('')
  const [instrumentosAplicados, setInstrumentosAplicados] = useState('')
  const [resultados, setResultados] = useState('')

  const resetForm = () => {
    setNombre('')
    setRut('')
    setEdad('')
    setTelefono('')
    setCorreo('')
    setCuidador('')
    setMotivoConsulta('')
    setFechaIngreso(new Date().toISOString().split('T')[0])
    setMotivoConsultaDetalle('')
    setEvaluacionInicial('')
    setInstrumentosAplicados('')
    setResultados('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim() || !rut.trim()) {
      showToast({
        title: 'Campos obligatorios',
        description: 'El Nombre y RUT son obligatorios para crear el usuario.',
        type: 'error'
      })
      return
    }

    const newPatient: Omit<Patient, 'id' | 'createdAt'> = {
      nombre: nombre.trim(),
      rut: rut.trim(),
      edad: edad ? Number(edad) : '',
      telefono: telefono.trim(),
      correo: correo.trim(),
      cuidador: cuidador.trim(),
      motivoConsulta: motivoConsulta.trim(),
      fechaIngreso: fechaIngreso,
      evaluacion: {
        motivoConsultaDetalle: motivoConsultaDetalle.trim() || motivoConsulta.trim(),
        evaluacionInicial: evaluacionInicial.trim(),
        instrumentosAplicados: instrumentosAplicados.trim(),
        resultados: resultados.trim()
      }
    }

    onSave(newPatient)
    showToast({
      title: 'Usuario Registrado',
      description: `${newPatient.nombre} ha sido ingresado al sistema.`,
      type: 'success'
    })
    resetForm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-lime-100 text-lime-800 flex items-center justify-center">
            <UserPlus className="w-4 h-4" />
          </div>
          <span>Registrar Nuevo Usuario / Paciente</span>
        </div>
      }
      description="Completa el perfil general de la persona y la evaluación clínica inicial."
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECCIÓN 1: PERFIL DE LA PERSONA */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
            <UserCheck className="w-4 h-4 text-lime-600" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              Perfil de la Persona
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="nombre" required>
                Nombre Completo
              </Label>
              <Input
                id="nombre"
                placeholder="Ej. Mateo Fernández Silva"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            {/* Rut */}
            <div className="space-y-1.5">
              <Label htmlFor="rut" required>
                RUT
              </Label>
              <Input
                id="rut"
                placeholder="Ej. 22.451.890-K"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                required
              />
            </div>

            {/* Edad */}
            <div className="space-y-1.5">
              <Label htmlFor="edad">
                Edad (Años)
              </Label>
              <Input
                id="edad"
                type="number"
                min="0"
                max="120"
                placeholder="Ej. 7"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
              />
            </div>

            {/* N° Teléfono */}
            <div className="space-y-1.5">
              <Label htmlFor="telefono">
                N° Teléfono
              </Label>
              <Input
                id="telefono"
                placeholder="Ej. +56 9 8456 1234"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            {/* Correo */}
            <div className="space-y-1.5">
              <Label htmlFor="correo">
                Correo Electrónico
              </Label>
              <Input
                id="correo"
                type="email"
                placeholder="Ej. contacto@ejemplo.cl"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            {/* Cuidador/a */}
            <div className="space-y-1.5">
              <Label htmlFor="cuidador">
                Cuidador/a (Nombre y parentesco)
              </Label>
              <Input
                id="cuidador"
                placeholder="Ej. Claudia Silva (Madre)"
                value={cuidador}
                onChange={(e) => setCuidador(e.target.value)}
              />
            </div>

            {/* Fecha de ingreso */}
            <div className="space-y-1.5">
              <Label htmlFor="fechaIngreso" required>
                Fecha de Ingreso
              </Label>
              <Input
                id="fechaIngreso"
                type="date"
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(e.target.value)}
                required
              />
            </div>

            {/* Motivo de consulta */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="motivoConsulta">
                Motivo de Consulta General
              </Label>
              <Input
                id="motivoConsulta"
                placeholder="Ej. Dificultades en integración sensorial y motricidad fina"
                value={motivoConsulta}
                onChange={(e) => setMotivoConsulta(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: EVALUACIÓN */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
            <Stethoscope className="w-4 h-4 text-lime-600" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              Evaluación Clínica Inicial
            </h4>
          </div>

          <div className="space-y-4">
            {/* Motivo de consulta detalle */}
            <div className="space-y-1.5">
              <Label htmlFor="motivoConsultaDetalle">
                Motivo de Consulta Detallado / Antecedentes
              </Label>
              <Textarea
                id="motivoConsultaDetalle"
                placeholder="Detalle derivación, diagnósticos médicos previos, motivo familiar..."
                value={motivoConsultaDetalle}
                onChange={(e) => setMotivoConsultaDetalle(e.target.value)}
                rows={2}
              />
            </div>

            {/* Evaluación inicial */}
            <div className="space-y-1.5">
              <Label htmlFor="evaluacionInicial">
                Evaluación Inicial (Observación Clínica Ocupacional)
              </Label>
              <Textarea
                id="evaluacionInicial"
                placeholder="Observación de desempeño ocupacional, juego, habilidades motoras, sensoriales o psicosociales..."
                value={evaluacionInicial}
                onChange={(e) => setEvaluacionInicial(e.target.value)}
                rows={3}
              />
            </div>

            {/* Instrumentos aplicados */}
            <div className="space-y-1.5">
              <Label htmlFor="instrumentosAplicados">
                Instrumentos Aplicados
              </Label>
              <Input
                id="instrumentosAplicados"
                placeholder="Ej. Perfil Sensorial 2, VMI, PEDI, WeeFIM, FIM, Observaciones Clínicas..."
                value={instrumentosAplicados}
                onChange={(e) => setInstrumentosAplicados(e.target.value)}
              />
            </div>

            {/* Resultados */}
            <div className="space-y-1.5">
              <Label htmlFor="resultados">
                Resultados y Síntesis Evaluativa
              </Label>
              <Textarea
                id="resultados"
                placeholder="Conclusiones principales, hipótesis ocupacionales, áreas prioritarias a intervenir..."
                value={resultados}
                onChange={(e) => setResultados(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="lime"
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar Usuario
          </Button>
        </div>
      </form>
    </Modal>
  )
}
