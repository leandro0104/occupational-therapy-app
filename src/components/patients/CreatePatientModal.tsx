import React, { useState } from 'react'
import { UserPlus, UserCheck, Stethoscope, Save } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { showToast } from '@/components/ui/toast'
import { formatRut, validateEmail } from '@/lib/utils'
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
  const [phoneDigits, setPhoneDigits] = useState('') // 8 dígitos después de +56 9
  const [correo, setCorreo] = useState('')
  const [cuidador, setCuidador] = useState('')
  const [motivoConsulta, setMotivoConsulta] = useState('')
  const [fechaIngreso, setFechaIngreso] = useState(
    new Date().toISOString().split('T')[0]
  )

  // Evaluación Clínica Inicial
  const [motivoConsultaDetalle, setMotivoConsultaDetalle] = useState('')
  const [evaluacionInicial, setEvaluacionInicial] = useState('')
  const [instrumentosAplicados, setInstrumentosAplicados] = useState('')
  const [resultados, setResultados] = useState('')

  const resetForm = () => {
    setNombre('')
    setRut('')
    setEdad('')
    setPhoneDigits('')
    setCorreo('')
    setCuidador('')
    setMotivoConsulta('')
    setFechaIngreso(new Date().toISOString().split('T')[0])
    setMotivoConsultaDetalle('')
    setEvaluacionInicial('')
    setInstrumentosAplicados('')
    setResultados('')
  }

  // Handler para formateo automático de RUT chileno (ej: 12.345.678-9)
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value)
    setRut(formatted)
  }

  // Handler para formateo de teléfono (8 dígitos con espacio ej: 8456 1234)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8)
    if (raw.length > 4) {
      setPhoneDigits(`${raw.slice(0, 4)} ${raw.slice(4)}`)
    } else {
      setPhoneDigits(raw)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Validar campos obligatorios de Perfil de la Persona
    if (!nombre.trim()) {
      showToast({ title: 'Campo requerido', description: 'Por favor ingresa el Nombre Completo.', type: 'error' })
      return
    }
    if (!rut.trim() || rut.trim().length < 8) {
      showToast({ title: 'RUT incompleto', description: 'Por favor ingresa un RUT válido con dígito verificador.', type: 'error' })
      return
    }
    if (edad === '' || isNaN(Number(edad)) || Number(edad) < 0) {
      showToast({ title: 'Campo requerido', description: 'Por favor ingresa una Edad válida en años.', type: 'error' })
      return
    }
    const cleanPhone = phoneDigits.replace(/\D/g, '')
    if (cleanPhone.length < 8) {
      showToast({ title: 'Teléfono incompleto', description: 'Por favor ingresa los 8 dígitos del número de teléfono (+56 9 XXXX XXXX).', type: 'error' })
      return
    }
    if (!fechaIngreso) {
      showToast({ title: 'Campo requerido', description: 'Por favor selecciona la Fecha de Ingreso.', type: 'error' })
      return
    }
    if (!motivoConsulta.trim()) {
      showToast({ title: 'Campo requerido', description: 'Por favor ingresa el Motivo de Consulta General.', type: 'error' })
      return
    }

    // 2. Validar correo si fue ingresado (es opcional)
    if (correo.trim() && !validateEmail(correo)) {
      showToast({
        title: 'Correo inválido',
        description: 'El correo ingresado no tiene un formato válido (ej: usuario@ejemplo.cl).',
        type: 'error'
      })
      return
    }

    // 3. Validar campos obligatorios de Evaluación Clínica Inicial
    if (!motivoConsultaDetalle.trim()) {
      showToast({ title: 'Campo requerido', description: 'Por favor ingresa el Motivo de Consulta Detallado / Antecedentes.', type: 'error' })
      return
    }
    if (!evaluacionInicial.trim()) {
      showToast({ title: 'Campo requerido', description: 'Por favor ingresa la Evaluación Inicial (Observación Clínica Ocupacional).', type: 'error' })
      return
    }
    if (!instrumentosAplicados.trim()) {
      showToast({ title: 'Campo requerido', description: 'Por favor indica los Instrumentos Aplicados.', type: 'error' })
      return
    }
    if (!resultados.trim()) {
      showToast({ title: 'Campo requerido', description: 'Por favor ingresa los Resultados y Síntesis Evaluativa.', type: 'error' })
      return
    }

    const fullPhoneNumber = `+56 9 ${phoneDigits.trim()}`

    const newPatient: Omit<Patient, 'id' | 'createdAt'> = {
      nombre: nombre.trim(),
      rut: rut.trim(),
      edad: Number(edad),
      telefono: fullPhoneNumber,
      correo: correo.trim(), // Opcional
      cuidador: cuidador.trim(), // Opcional
      motivoConsulta: motivoConsulta.trim(),
      fechaIngreso: fechaIngreso,
      evaluacion: {
        motivoConsultaDetalle: motivoConsultaDetalle.trim(),
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
      description="Completa el perfil de la persona y la evaluación clínica inicial. Los campos marcados con * son obligatorios."
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECCIÓN 1: PERFIL DE LA PERSONA */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
            <UserCheck className="w-4 h-4 text-lime-600" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              1. Perfil de la Persona
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

            {/* Rut con formateo automático */}
            <div className="space-y-1.5">
              <Label htmlFor="rut" required>
                RUT
              </Label>
              <Input
                id="rut"
                placeholder="Ej. 12.345.678-9"
                value={rut}
                onChange={handleRutChange}
                maxLength={12}
                required
              />
            </div>

            {/* Edad */}
            <div className="space-y-1.5">
              <Label htmlFor="edad" required>
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
                required
              />
            </div>

            {/* N° Teléfono con prefijo fijo +56 9 */}
            <div className="space-y-1.5">
              <Label htmlFor="telefono" required>
                N° Teléfono
              </Label>
              <div className="flex rounded-lg border border-zinc-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-lime-500 focus-within:border-lime-500 transition-colors">
                <span className="inline-flex items-center px-3 bg-zinc-50 border-r border-zinc-200 text-zinc-700 text-xs font-bold select-none shrink-0">
                  🇨🇱 +56 9
                </span>
                <input
                  id="telefono"
                  type="tel"
                  placeholder="8456 1234"
                  value={phoneDigits}
                  onChange={handlePhoneChange}
                  className="flex h-10 w-full bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none"
                  required
                />
              </div>
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

            {/* Correo (OPCIONAL con validación) */}
            <div className="space-y-1.5">
              <Label htmlFor="correo">
                Correo Electrónico <span className="text-zinc-400 font-normal">(Opcional)</span>
              </Label>
              <Input
                id="correo"
                type="email"
                placeholder="usuario@ejemplo.cl"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            {/* Cuidador/a (OPCIONAL) */}
            <div className="space-y-1.5">
              <Label htmlFor="cuidador">
                Cuidador/a <span className="text-zinc-400 font-normal">(Opcional)</span>
              </Label>
              <Input
                id="cuidador"
                placeholder="Ej. Claudia Silva (Madre)"
                value={cuidador}
                onChange={(e) => setCuidador(e.target.value)}
              />
            </div>

            {/* Motivo de consulta general */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="motivoConsulta" required>
                Motivo de Consulta General
              </Label>
              <Input
                id="motivoConsulta"
                placeholder="Ej. Dificultades en integración sensorial y motricidad fina"
                value={motivoConsulta}
                onChange={(e) => setMotivoConsulta(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: EVALUACIÓN (TODOS OBLIGATORIOS) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
            <Stethoscope className="w-4 h-4 text-lime-600" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              2. Evaluación Clínica Inicial (Obligatoria)
            </h4>
          </div>

          <div className="space-y-4">
            {/* Motivo de consulta detalle */}
            <div className="space-y-1.5">
              <Label htmlFor="motivoConsultaDetalle" required>
                Motivo de Consulta Detallado / Antecedentes
              </Label>
              <Textarea
                id="motivoConsultaDetalle"
                placeholder="Detalle derivación, diagnósticos médicos previos, motivo familiar..."
                value={motivoConsultaDetalle}
                onChange={(e) => setMotivoConsultaDetalle(e.target.value)}
                rows={2}
                required
              />
            </div>

            {/* Evaluación inicial */}
            <div className="space-y-1.5">
              <Label htmlFor="evaluacionInicial" required>
                Evaluación Inicial (Observación Clínica Ocupacional)
              </Label>
              <Textarea
                id="evaluacionInicial"
                placeholder="Observación de desempeño ocupacional, juego, habilidades motoras, sensoriales o psicosociales..."
                value={evaluacionInicial}
                onChange={(e) => setEvaluacionInicial(e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Instrumentos aplicados */}
            <div className="space-y-1.5">
              <Label htmlFor="instrumentosAplicados" required>
                Instrumentos Aplicados
              </Label>
              <Input
                id="instrumentosAplicados"
                placeholder="Ej. Perfil Sensorial 2, VMI, PEDI, WeeFIM, FIM, Observaciones Clínicas..."
                value={instrumentosAplicados}
                onChange={(e) => setInstrumentosAplicados(e.target.value)}
                required
              />
            </div>

            {/* Resultados */}
            <div className="space-y-1.5">
              <Label htmlFor="resultados" required>
                Resultados y Síntesis Evaluativa
              </Label>
              <Textarea
                id="resultados"
                placeholder="Conclusiones principales, hipótesis ocupacionales, áreas prioritarias a intervenir..."
                value={resultados}
                onChange={(e) => setResultados(e.target.value)}
                rows={3}
                required
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
            className="flex items-center gap-2 font-semibold shadow-sm"
          >
            <Save className="w-4 h-4" />
            Guardar Usuario
          </Button>
        </div>
      </form>
    </Modal>
  )
}
