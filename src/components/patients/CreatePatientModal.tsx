import React, { useState } from 'react'
import { UserPlus, UserCheck, Stethoscope, Save, Target } from 'lucide-react'
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

  // Objetivo General (Objetivo Padre)
  const [objetivoGeneral, setObjetivoGeneral] = useState('')

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
    setObjetivoGeneral('')
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

    // 2. Validar Objetivo General (Obligatorio)
    if (!objetivoGeneral.trim()) {
      showToast({ title: 'Objetivo General Requerido', description: 'Por favor ingresa el Objetivo General que guiará el tratamiento.', type: 'error' })
      return
    }

    // 3. Validar correo si fue ingresado (es opcional)
    if (correo.trim() && !validateEmail(correo)) {
      showToast({
        title: 'Correo inválido',
        description: 'El correo ingresado no tiene un formato válido (ej: usuario@ejemplo.cl).',
        type: 'error'
      })
      return
    }

    // 4. Validar campos obligatorios de Evaluación Clínica Inicial
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
      correo: correo.trim(),
      cuidador: cuidador.trim(),
      motivoConsulta: motivoConsulta.trim(),
      fechaIngreso: fechaIngreso,
      objetivoGeneral: objetivoGeneral.trim(),
      objetivoGeneralCompletado: false,
      objetivosGeneralesHistorial: [],
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
      description: `${newPatient.nombre} ha sido ingresado con su Objetivo General.`,
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
      description="Completa el perfil de la persona, su objetivo general y la evaluación clínica inicial."
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
            {/* Nombre (Máx 100 caracteres) */}
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="nombre" required>
                  Nombre Completo
                </Label>
                <span className="text-[10px] text-zinc-400 font-mono">{nombre.length}/100</span>
              </div>
              <Input
                id="nombre"
                placeholder="Ej. Mateo Fernández Silva"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            {/* Rut (Máx 12 caracteres) */}
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

            {/* Edad (Número 0 a 120) */}
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
                  maxLength={9}
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

            {/* Correo (OPCIONAL - Máx 100 caracteres) */}
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
                maxLength={100}
              />
            </div>

            {/* Cuidador/a (OPCIONAL - Máx 100 caracteres) */}
            <div className="space-y-1.5">
              <Label htmlFor="cuidador">
                Cuidador/a <span className="text-zinc-400 font-normal">(Opcional)</span>
              </Label>
              <Input
                id="cuidador"
                placeholder="Ej. Claudia Silva (Madre)"
                value={cuidador}
                onChange={(e) => setCuidador(e.target.value)}
                maxLength={100}
              />
            </div>

            {/* Motivo de consulta general (Máx 200 caracteres) */}
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="motivoConsulta" required>
                  Motivo de Consulta General
                </Label>
                <span className="text-[10px] text-zinc-400 font-mono">{motivoConsulta.length}/200</span>
              </div>
              <Input
                id="motivoConsulta"
                placeholder="Ej. Dificultades en integración sensorial y motricidad fina"
                value={motivoConsulta}
                onChange={(e) => setMotivoConsulta(e.target.value)}
                maxLength={200}
                required
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: OBJETIVO GENERAL (OBJETIVO PADRE) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
            <Target className="w-4 h-4 text-lime-700" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              2. Objetivo General Terapéutico (Objetivo Padre)
            </h4>
          </div>

          <div className="space-y-1.5 bg-lime-50/50 p-4 rounded-xl border border-lime-200/80">
            <div className="flex justify-between items-center">
              <Label htmlFor="objetivoGeneral" required className="text-lime-950 font-bold">
                Objetivo General del Plan de Intervención
              </Label>
              <span className="text-[10px] text-lime-700 font-mono">{objetivoGeneral.length}/300</span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed mb-2">
              Meta transversal y principal que guiará el proceso terapéutico del paciente. Los objetivos específicos de las sesiones se desprenderán de este objetivo padre.
            </p>
            <Textarea
              id="objetivoGeneral"
              placeholder="Ej. Desarrollar habilidades de procesamiento sensorial y coordinación motriz fina para lograr la independencia en el desempeño escolar y autocuidado básico..."
              value={objetivoGeneral}
              onChange={(e) => setObjetivoGeneral(e.target.value)}
              maxLength={300}
              rows={2}
              required
              className="bg-white border-lime-300 focus:border-lime-500"
            />
          </div>
        </div>

        {/* SECCIÓN 3: EVALUACIÓN CLÍNICA INICIAL (TODOS OBLIGATORIOS) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
            <Stethoscope className="w-4 h-4 text-lime-600" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              3. Evaluación Clínica Inicial (Obligatoria)
            </h4>
          </div>

          <div className="space-y-4">
            {/* Motivo de consulta detalle (Máx 1000 caracteres) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="motivoConsultaDetalle" required>
                  Motivo de Consulta Detallado / Antecedentes
                </Label>
                <span className="text-[10px] text-zinc-400 font-mono">{motivoConsultaDetalle.length}/1000</span>
              </div>
              <Textarea
                id="motivoConsultaDetalle"
                placeholder="Detalle derivación, diagnósticos médicos previos, motivo familiar..."
                value={motivoConsultaDetalle}
                onChange={(e) => setMotivoConsultaDetalle(e.target.value)}
                maxLength={1000}
                rows={2}
                required
              />
            </div>

            {/* Evaluación inicial (Máx 2000 caracteres) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="evaluacionInicial" required>
                  Evaluación Inicial (Observación Clínica Ocupacional)
                </Label>
                <span className="text-[10px] text-zinc-400 font-mono">{evaluacionInicial.length}/2000</span>
              </div>
              <Textarea
                id="evaluacionInicial"
                placeholder="Observación de desempeño ocupacional, juego, habilidades motoras, sensoriales o psicosociales..."
                value={evaluacionInicial}
                onChange={(e) => setEvaluacionInicial(e.target.value)}
                maxLength={2000}
                rows={3}
                required
              />
            </div>

            {/* Instrumentos aplicados (Máx 300 caracteres) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="instrumentosAplicados" required>
                  Instrumentos Aplicados
                </Label>
                <span className="text-[10px] text-zinc-400 font-mono">{instrumentosAplicados.length}/300</span>
              </div>
              <Input
                id="instrumentosAplicados"
                placeholder="Ej. Perfil Sensorial 2, VMI, PEDI, WeeFIM, FIM, Observaciones Clínicas..."
                value={instrumentosAplicados}
                onChange={(e) => setInstrumentosAplicados(e.target.value)}
                maxLength={300}
                required
              />
            </div>

            {/* Resultados (Máx 2000 caracteres) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="resultados" required>
                  Resultados y Síntesis Evaluativa
                </Label>
                <span className="text-[10px] text-zinc-400 font-mono">{resultados.length}/2000</span>
              </div>
              <Textarea
                id="resultados"
                placeholder="Conclusiones principales, hipótesis ocupacionales, áreas prioritarias a intervenir..."
                value={resultados}
                onChange={(e) => setResultados(e.target.value)}
                maxLength={2000}
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
