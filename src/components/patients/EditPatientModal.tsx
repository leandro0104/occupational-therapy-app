import React, { useState, useEffect } from 'react'
import { UserCheck, Stethoscope, Save, Target, Edit3 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { showToast } from '@/components/ui/toast'
import { formatRut, validateEmail } from '@/lib/utils'
import { Patient } from '@/types'

interface EditPatientModalProps {
  isOpen: boolean
  onClose: () => void
  patient: Patient | null
  onSave: (updatedPatient: Patient) => void
}

export function EditPatientModal({
  isOpen,
  onClose,
  patient,
  onSave
}: EditPatientModalProps) {
  // Perfil de la Persona
  const [nombre, setNombre] = useState('')
  const [rut, setRut] = useState('')
  const [edad, setEdad] = useState<string | number>('')
  const [phoneDigits, setPhoneDigits] = useState('')
  const [correo, setCorreo] = useState('')
  const [cuidador, setCuidador] = useState('')
  const [motivoConsulta, setMotivoConsulta] = useState('')
  const [fechaIngreso, setFechaIngreso] = useState('')

  // Objetivo General
  const [objetivoGeneral, setObjetivoGeneral] = useState('')

  // Evaluación Clínica Inicial
  const [motivoConsultaDetalle, setMotivoConsultaDetalle] = useState('')
  const [evaluacionInicial, setEvaluacionInicial] = useState('')
  const [instrumentosAplicados, setInstrumentosAplicados] = useState('')
  const [resultados, setResultados] = useState('')

  const [isSaving, setIsSaving] = useState(false)

  // Cargar datos del paciente cuando se abre el modal
  useEffect(() => {
    if (patient && isOpen) {
      setNombre(patient.nombre || '')
      setRut(patient.rut || '')
      setEdad(patient.edad !== undefined ? patient.edad : '')
      
      // Extraer dígitos del teléfono sin el prefijo +56 9
      const rawPhone = (patient.telefono || '').replace('+56 9', '').replace(/\D/g, '').slice(0, 8)
      if (rawPhone.length > 4) {
        setPhoneDigits(`${rawPhone.slice(0, 4)} ${rawPhone.slice(4)}`)
      } else {
        setPhoneDigits(rawPhone)
      }

      setCorreo(patient.correo || '')
      setCuidador(patient.cuidador || '')
      setMotivoConsulta(patient.motivoConsulta || '')
      setFechaIngreso(patient.fechaIngreso || new Date().toISOString().split('T')[0])
      setObjetivoGeneral(patient.objetivoGeneral || '')
      setMotivoConsultaDetalle(patient.evaluacion?.motivoConsultaDetalle || '')
      setEvaluacionInicial(patient.evaluacion?.evaluacionInicial || '')
      setInstrumentosAplicados(patient.evaluacion?.instrumentosAplicados || '')
      setResultados(patient.evaluacion?.resultados || '')
    }
  }, [patient, isOpen])

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value)
    setRut(formatted)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8)
    if (raw.length > 4) {
      setPhoneDigits(`${raw.slice(0, 4)} ${raw.slice(4)}`)
    } else {
      setPhoneDigits(raw)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patient) return

    // 1. Validaciones
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
      showToast({ title: 'Teléfono incompleto', description: 'Por favor ingresa los 8 dígitos del número de teléfono.', type: 'error' })
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
    if (correo.trim() && !validateEmail(correo)) {
      showToast({ title: 'Correo inválido', description: 'El formato del correo no es válido.', type: 'error' })
      return
    }
    if (!motivoConsultaDetalle.trim()) {
      showToast({ title: 'Campo requerido', description: 'Por favor ingresa el Motivo de Consulta Detallado.', type: 'error' })
      return
    }
    if (!evaluacionInicial.trim()) {
      showToast({ title: 'Campo requerido', description: 'Por favor ingresa la Evaluación Inicial.', type: 'error' })
      return
    }
    if (!instrumentosAplicados.trim()) {
      showToast({ title: 'Campo requerido', description: 'Por favor indica los Instrumentos Aplicados.', type: 'error' })
      return
    }
    if (!resultados.trim()) {
      showToast({ title: 'Campo requerido', description: 'Por favor ingresa los Resultados y Síntesis.', type: 'error' })
      return
    }

    setIsSaving(true)

    const fullPhoneNumber = `+56 9 ${phoneDigits.trim()}`

    const updatedPatient: Patient = {
      ...patient,
      nombre: nombre.trim(),
      rut: rut.trim(),
      edad: Number(edad),
      telefono: fullPhoneNumber,
      correo: correo.trim(),
      cuidador: cuidador.trim(),
      motivoConsulta: motivoConsulta.trim(),
      fechaIngreso: fechaIngreso,
      objetivoGeneral: objetivoGeneral.trim(),
      evaluacion: {
        motivoConsultaDetalle: motivoConsultaDetalle.trim(),
        evaluacionInicial: evaluacionInicial.trim(),
        instrumentosAplicados: instrumentosAplicados.trim(),
        resultados: resultados.trim()
      }
    }

    try {
      onSave(updatedPatient)
      setIsSaving(false)
      showToast({
        title: 'Ficha Actualizada',
        description: `Los datos de ${updatedPatient.nombre} se guardaron exitosamente.`,
        type: 'success'
      })
      onClose()
    } catch (err) {
      setIsSaving(false)
      showToast({
        title: 'Error al actualizar',
        description: 'Ocurrió un problema al guardar los cambios.',
        type: 'error'
      })
    }
  }

  if (!patient) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-lime-100 text-lime-800 flex items-center justify-center">
            <Edit3 className="w-4 h-4" />
          </div>
          <span>Editar Ficha Clínica · {patient.nombre}</span>
        </div>
      }
      description="Modifica los antecedentes, datos de contacto o evaluación del paciente."
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
              <div className="flex justify-between items-center">
                <Label htmlFor="editNombre" required>
                  Nombre Completo
                </Label>
                <span className="text-[10px] text-zinc-400 font-mono">{nombre.length}/100</span>
              </div>
              <Input
                id="editNombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            {/* Rut */}
            <div className="space-y-1.5">
              <Label htmlFor="editRut" required>
                RUT
              </Label>
              <Input
                id="editRut"
                value={rut}
                onChange={handleRutChange}
                maxLength={12}
                required
              />
            </div>

            {/* Edad */}
            <div className="space-y-1.5">
              <Label htmlFor="editEdad" required>
                Edad (Años)
              </Label>
              <Input
                id="editEdad"
                type="number"
                min="0"
                max="120"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                required
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-1.5">
              <Label htmlFor="editTelefono" required>
                N° Teléfono
              </Label>
              <div className="flex rounded-lg border border-zinc-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-lime-500 focus-within:border-lime-500 transition-colors">
                <span className="inline-flex items-center px-3 bg-zinc-50 border-r border-zinc-200 text-zinc-700 text-xs font-bold select-none shrink-0">
                  🇨🇱 +56 9
                </span>
                <input
                  id="editTelefono"
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
              <Label htmlFor="editFechaIngreso" required>
                Fecha de Ingreso
              </Label>
              <Input
                id="editFechaIngreso"
                type="date"
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(e.target.value)}
                required
              />
            </div>

            {/* Correo */}
            <div className="space-y-1.5">
              <Label htmlFor="editCorreo">
                Correo Electrónico <span className="text-zinc-400 font-normal">(Opcional)</span>
              </Label>
              <Input
                id="editCorreo"
                type="email"
                placeholder="usuario@ejemplo.cl"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                maxLength={100}
              />
            </div>

            {/* Cuidador/a */}
            <div className="space-y-1.5">
              <Label htmlFor="editCuidador">
                Cuidador/a <span className="text-zinc-400 font-normal">(Opcional)</span>
              </Label>
              <Input
                id="editCuidador"
                placeholder="Ej. Claudia Silva (Madre)"
                value={cuidador}
                onChange={(e) => setCuidador(e.target.value)}
                maxLength={100}
              />
            </div>

            {/* Motivo de consulta */}
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="editMotivoConsulta" required>
                  Motivo de Consulta General
                </Label>
                <span className="text-[10px] text-zinc-400 font-mono">{motivoConsulta.length}/200</span>
              </div>
              <Input
                id="editMotivoConsulta"
                value={motivoConsulta}
                onChange={(e) => setMotivoConsulta(e.target.value)}
                maxLength={200}
                required
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: OBJETIVO GENERAL */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
            <Target className="w-4 h-4 text-lime-700" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              2. Objetivo General Terapéutico (Objetivo Padre)
            </h4>
          </div>

          <div className="space-y-1.5 bg-lime-50/50 p-4 rounded-xl border border-lime-200/80">
            <div className="flex justify-between items-center">
              <Label htmlFor="editObjetivoGeneral" className="text-lime-950 font-bold">
                Objetivo General del Plan
              </Label>
              <span className="text-[10px] text-lime-700 font-mono">{objetivoGeneral.length}/300</span>
            </div>
            <Textarea
              id="editObjetivoGeneral"
              placeholder="Meta transversal y principal del paciente..."
              value={objetivoGeneral}
              onChange={(e) => setObjetivoGeneral(e.target.value)}
              maxLength={300}
              rows={2}
              className="bg-white border-lime-300 focus:border-lime-500"
            />
          </div>
        </div>

        {/* SECCIÓN 3: EVALUACIÓN CLÍNICA INICIAL */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
            <Stethoscope className="w-4 h-4 text-lime-600" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
              3. Evaluación Clínica Inicial
            </h4>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="editMotivoConsultaDetalle" required>
                  Motivo de Consulta Detallado / Antecedentes
                </Label>
                <span className="text-[10px] text-zinc-400 font-mono">{motivoConsultaDetalle.length}/1000</span>
              </div>
              <Textarea
                id="editMotivoConsultaDetalle"
                value={motivoConsultaDetalle}
                onChange={(e) => setMotivoConsultaDetalle(e.target.value)}
                maxLength={1000}
                rows={2}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="editEvaluacionInicial" required>
                  Evaluación Inicial (Observación Clínica Ocupacional)
                </Label>
                <span className="text-[10px] text-zinc-400 font-mono">{evaluacionInicial.length}/2000</span>
              </div>
              <Textarea
                id="editEvaluacionInicial"
                value={evaluacionInicial}
                onChange={(e) => setEvaluacionInicial(e.target.value)}
                maxLength={2000}
                rows={3}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="editInstrumentosAplicados" required>
                  Instrumentos Aplicados
                </Label>
                <span className="text-[10px] text-zinc-400 font-mono">{instrumentosAplicados.length}/300</span>
              </div>
              <Input
                id="editInstrumentosAplicados"
                value={instrumentosAplicados}
                onChange={(e) => setInstrumentosAplicados(e.target.value)}
                maxLength={300}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="editResultados" required>
                  Resultados y Síntesis Evaluativa
                </Label>
                <span className="text-[10px] text-zinc-400 font-mono">{resultados.length}/2000</span>
              </div>
              <Textarea
                id="editResultados"
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
            disabled={isSaving}
            className="flex items-center gap-2 font-semibold shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
