import { useState, useMemo } from 'react'
import {
  Search,
  UserPlus,
  Stethoscope,
  Trash2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FilterX,
  Edit3
} from 'lucide-react'
import { Patient } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { EditPatientModal } from '@/components/patients/EditPatientModal'
import { storageService } from '@/services/storageService'

interface PatientTableProps {
  patients: Patient[]
  onOpenCreateModal: () => void
  onOpenAttentionModal: (patient: Patient) => void
  onDeletePatient: (patientId: string) => void
  onUpdatePatient?: (patient: Patient) => void
}

export function PatientTable({
  patients,
  onOpenCreateModal,
  onOpenAttentionModal,
  onDeletePatient,
  onUpdatePatient
}: PatientTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Estado para modal de confirmación de eliminación con palabra clave
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  
  // Estado para modal de edición de ficha
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null)

  // Filter patients by Nombre, Rut, or Correo
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients

    const term = searchTerm.toLowerCase().trim()
    return patients.filter((patient) => {
      const matchName = patient.nombre.toLowerCase().includes(term)
      const matchRut = patient.rut.toLowerCase().includes(term)
      const matchEmail = (patient.correo || '').toLowerCase().includes(term)
      const matchCaregiver = (patient.cuidador || '').toLowerCase().includes(term)
      return matchName || matchRut || matchEmail || matchCaregiver
    })
  }, [patients, searchTerm])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / rowsPerPage))
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedPatients = filteredPatients.slice(
    startIndex,
    startIndex + rowsPerPage
  )

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(paginatedPatients.map((p) => p.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  const handleConfirmDelete = () => {
    if (patientToDelete) {
      onDeletePatient(patientToDelete.id)
      setPatientToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Controls & Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 font-sans">
            Mantenedor de Usuarios
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Gestión integral de fichas clínicas, datos de contacto y registros de atención.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={onOpenCreateModal}
            variant="lime"
            className="h-11 px-5 rounded-xl font-semibold shadow-md shadow-lime-900/10 gap-2 text-sm"
          >
            <UserPlus className="w-4 h-4" />
            + Agregar Usuario
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Filtrar por Nombre, RUT o Correo..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10 h-10 bg-zinc-50/70 border-zinc-200 focus:bg-white text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
            >
              <FilterX className="w-3.5 h-3.5" />
              Limpiar filtro
            </button>
          )}
          <span className="text-xs text-zinc-500 font-medium">
            Total: <strong className="text-zinc-900">{filteredPatients.length}</strong> usuarios
          </span>
        </div>
      </div>

      {/* Patients Table — visible on md+ */}
      <div className="hidden md:block bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200/90 bg-zinc-50/70 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                <th className="py-3.5 pl-4 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={
                      paginatedPatients.length > 0 &&
                      paginatedPatients.every((p) => selectedRows.includes(p.id))
                    }
                    onChange={handleSelectAll}
                    className="rounded border-zinc-300 text-lime-600 focus:ring-lime-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Nombre</th>
                <th className="py-3.5 px-3">RUT</th>
                <th className="py-3.5 px-3 text-center">Edad</th>
                <th className="py-3.5 px-3">N° Teléfono</th>
                <th className="py-3.5 px-3">Correo</th>
                <th className="py-3.5 px-3">Cuidador/a</th>
                <th className="py-3.5 px-4 min-w-[200px]">Motivo de Consulta</th>
                <th className="py-3.5 px-3">Fecha Ingreso</th>
                <th className="py-3.5 pr-4 pl-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-zinc-400">
                    <p className="font-medium text-sm">No se encontraron pacientes que coincidan con la búsqueda.</p>
                    {searchTerm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchTerm('')}
                        className="mt-3 text-xs"
                      >
                        Ver todos los pacientes
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((patient) => {
                  const isSelected = selectedRows.includes(patient.id)
                  return (
                    <tr
                      key={patient.id}
                      className={`hover:bg-lime-50/30 transition-colors group ${
                        isSelected ? 'bg-lime-50/50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(patient.id)}
                          className="rounded border-zinc-300 text-lime-600 focus:ring-lime-500 cursor-pointer"
                        />
                      </td>

                      {/* Nombre */}
                      <td className="py-3.5 px-4 font-semibold text-zinc-900">
                        <button
                          onClick={() => onOpenAttentionModal(patient)}
                          className="text-left font-semibold text-zinc-900 hover:text-lime-700 transition-colors hover:underline"
                        >
                          {patient.nombre}
                        </button>
                      </td>

                      {/* RUT */}
                      <td className="py-3.5 px-3 font-mono text-xs text-zinc-700 font-medium">
                        {patient.rut}
                      </td>

                      {/* Edad */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 text-xs font-bold">
                          {patient.edad !== undefined && patient.edad !== '' ? patient.edad : '-'}
                        </span>
                      </td>

                      {/* N° Teléfono */}
                      <td className="py-3.5 px-3 text-xs text-zinc-600 whitespace-nowrap">
                        {patient.telefono ? (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            {patient.telefono}
                          </span>
                        ) : (
                          <span className="text-zinc-300">-</span>
                        )}
                      </td>

                      {/* Correo */}
                      <td className="py-3.5 px-3 text-xs text-zinc-600 max-w-[150px] truncate">
                        {patient.correo ? (
                          <span className="flex items-center gap-1.5 truncate" title={patient.correo}>
                            <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate">{patient.correo}</span>
                          </span>
                        ) : (
                          <span className="text-zinc-300">-</span>
                        )}
                      </td>

                      {/* Cuidador/a */}
                      <td className="py-3.5 px-3 text-xs text-zinc-700 font-medium max-w-[140px] truncate">
                        {patient.cuidador || <span className="text-zinc-300">-</span>}
                      </td>

                      {/* Motivo de Consulta */}
                      <td className="py-3.5 px-4 text-xs text-zinc-600 max-w-[240px]">
                        <p className="line-clamp-2 leading-relaxed" title={patient.motivoConsulta}>
                          {patient.motivoConsulta || 'Sin motivo registrado'}
                        </p>
                      </td>

                      {/* Fecha Ingreso */}
                      <td className="py-3.5 px-3 text-xs text-zinc-600 whitespace-nowrap">
                        {formatDate(patient.fechaIngreso)}
                      </td>

                      {/* Acciones: Atención, Editar Ficha y Eliminar */}
                      <td className="py-3.5 pr-4 pl-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón Atención */}
                          <button
                            onClick={() => onOpenAttentionModal(patient)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-100 hover:bg-lime-200 text-lime-900 text-xs font-bold transition-all shadow-2xs active:scale-95"
                            title="Registrar o ver atención del usuario"
                          >
                            <Stethoscope className="w-3.5 h-3.5 text-lime-700" />
                            <span>Atención</span>
                          </button>

                          {/* Botón Editar Ficha */}
                          <button
                            onClick={() => setPatientToEdit(patient)}
                            className="p-1.5 rounded-md text-zinc-400 hover:text-lime-700 hover:bg-lime-50 transition-colors"
                            title="Editar ficha del usuario"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Botón Eliminar */}
                          <button
                            onClick={() => setPatientToDelete(patient)}
                            className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Eliminar usuario definitivamente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="px-6 py-4 border-t border-zinc-200/90 bg-zinc-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <div>
            {selectedRows.length} de {filteredPatients.length} fila(s) seleccionada(s).
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span>Filas por página:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="bg-white border border-zinc-300 rounded-md px-2 py-1 text-xs focus:ring-lime-500 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div>
              Página {currentPage} de {totalPages}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1 rounded border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View — visible on < md */}
      <div className="md:hidden space-y-3">
        {paginatedPatients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-10 text-center text-zinc-400">
            <p className="font-medium text-sm">No se encontraron pacientes.</p>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="mt-3 text-xs"
              >
                Ver todos los pacientes
              </Button>
            )}
          </div>
        ) : (
          paginatedPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <button
                    onClick={() => onOpenAttentionModal(patient)}
                    className="text-left font-bold text-zinc-900 hover:text-lime-700 transition-colors text-base leading-tight"
                  >
                    {patient.nombre}
                  </button>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="font-mono text-xs text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md">
                      {patient.rut}
                    </span>
                    {(patient.edad !== undefined && patient.edad !== '') && (
                      <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full font-semibold">
                        {patient.edad} años
                      </span>
                    )}
                    <span className="text-xs text-zinc-400">
                      {formatDate(patient.fechaIngreso)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              {(patient.telefono || patient.correo) && (
                <div className="flex flex-wrap gap-3 text-xs text-zinc-600">
                  {patient.telefono && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      {patient.telefono}
                    </span>
                  )}
                  {patient.correo && (
                    <span className="flex items-center gap-1 truncate max-w-full">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{patient.correo}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Motivo */}
              {patient.motivoConsulta && (
                <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
                  {patient.motivoConsulta}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
                <button
                  onClick={() => onOpenAttentionModal(patient)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-lime-100 hover:bg-lime-200 text-lime-900 text-xs font-bold transition-all active:scale-95"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-lime-700" />
                  Atención
                </button>
                <button
                  onClick={() => setPatientToEdit(patient)}
                  className="flex items-center justify-center p-2.5 rounded-xl text-zinc-500 hover:text-lime-700 hover:bg-lime-50 border border-zinc-200 transition-colors"
                  title="Editar ficha"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPatientToDelete(patient)}
                  className="flex items-center justify-center p-2.5 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 border border-zinc-200 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        {filteredPatients.length > rowsPerPage && (
          <div className="bg-white rounded-2xl border border-zinc-200 px-4 py-3 flex items-center justify-between text-xs text-zinc-600">
            <span>Página {currentPage} de {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación estricta para eliminar paciente */}
      <DeleteConfirmModal
        isOpen={patientToDelete !== null}
        onClose={() => setPatientToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Paciente y su Ficha?"
        description={
          <span>
            Esta acción es irreversible y eliminará permanentemente la ficha clínica de <strong>{patientToDelete?.nombre}</strong> (RUT: {patientToDelete?.rut}), junto con todas sus evaluaciones y sesiones de atención registradas.
          </span>
        }
        confirmationWord="ELIMINAR"
      />

      {/* Modal para Editar Ficha Clínica del Paciente */}
      <EditPatientModal
        isOpen={patientToEdit !== null}
        onClose={() => setPatientToEdit(null)}
        patient={patientToEdit}
        onSave={async (updated) => {
          await storageService.updatePatient(updated)
          if (onUpdatePatient) {
            onUpdatePatient(updated)
          }
          setPatientToEdit(null)
        }}
      />
    </div>
  )
}
