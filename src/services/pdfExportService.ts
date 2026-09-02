import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Patient, SessionEvolution } from '@/types'
import { formatDate, formatDateTime } from '@/lib/utils'

export const pdfExportService = {
  /**
   * Genera y descarga un informe PDF clínico profesional de la ficha del paciente y su historial de atenciones.
   * Diseño estructurado formal tipo informe médico/terapéutico (sin cajas de inputs artificiales).
   */
  async exportPatientClinicalRecord(patient: Patient, sessions: SessionEvolution[]): Promise<void> {
    // Ordenar sesiones cronológicamente (de la primera a la más reciente)
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
    )

    // Crear contenedor temporal fuera de pantalla
    const reportContainer = document.createElement('div')
    reportContainer.id = 'pdf-render-container'
    reportContainer.style.position = 'absolute'
    reportContainer.style.left = '-9999px'
    reportContainer.style.top = '0'
    reportContainer.style.width = '800px'
    reportContainer.style.backgroundColor = '#ffffff'
    reportContainer.style.color = '#1e293b'
    reportContainer.style.fontFamily = 'Helvetica, Arial, sans-serif'
    reportContainer.style.padding = '40px 48px'
    reportContainer.style.boxSizing = 'border-box'

    // Formatear fecha y hora actual de emisión
    const emissionDate = new Date().toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
    const emissionTime = new Date().toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    })

    // Construir HTML de las sesiones
    let sessionsHtml = ''
    if (sortedSessions.length === 0) {
      sessionsHtml = `
        <div style="padding: 16px; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; text-align: center; color: #64748b; font-size: 12px; margin-top: 8px;">
          No se registran atenciones clínicas previas para este paciente.
        </div>
      `
    } else {
      sessionsHtml = sortedSessions
        .map((session, index) => {
          const formattedSessionDate = formatDateTime(session.fechaHora)
          const objectivesHtml = (session.objetivos || [])
            .map((obj) => {
              let badgeColor = '#f1f5f9'
              let badgeText = '#334155'
              let badgeBorder = '#cbd5e1'
              let statusLabel = '⋯ En Proceso'

              if (obj.estado === 'logrado') {
                badgeColor = '#ecfdf5'
                badgeText = '#047857'
                badgeBorder = '#a7f3d0'
                statusLabel = '✓ Logrado'
              } else if (obj.estado === 'parcialmente_logrado') {
                badgeColor = '#fffbeb'
                badgeText = '#b45309'
                badgeBorder = '#fde68a'
                statusLabel = '◐ Parcialmente Logrado'
              } else if (obj.estado === 'no_logrado') {
                badgeColor = '#fff1f2'
                badgeText = '#be123c'
                badgeBorder = '#fecdd3'
                statusLabel = '✕ No Logrado'
              }

              return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; border-bottom: 1px solid #f1f5f9; font-size: 11.5px;">
                  <span style="color: #334155; flex: 1; padding-right: 12px;">• ${obj.descripcion}</span>
                  <span style="background-color: ${badgeColor}; color: ${badgeText}; border: 1px solid ${badgeBorder}; padding: 2px 7px; border-radius: 4px; font-size: 10.5px; font-weight: 600; white-space: nowrap;">
                    ${statusLabel}
                  </span>
                </div>
              `
            })
            .join('')

          const generalObjRow = session.objetivoGeneralTexto
            ? `
              <div style="font-size: 11px; color: #166534; background-color: #f0fdf4; padding: 6px 10px; border-radius: 4px; margin-bottom: 8px;">
                <strong>Objetivo Padre:</strong> "${session.objetivoGeneralTexto}"
              </div>
            `
            : ''

          return `
            <div style="margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; page-break-inside: avoid;">
              <div style="background-color: #f8fafc; padding: 8px 14px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700; color: #166534; font-size: 12.5px;">
                  Sesión de Atención #${index + 1}
                </span>
                <span style="font-size: 11.5px; color: #64748b; font-weight: 500;">
                  📅 ${formattedSessionDate}
                </span>
              </div>

              <div style="padding: 12px 14px;">
                ${generalObjRow}

                <div style="margin-bottom: 10px;">
                  <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; letter-spacing: 0.3px;">
                    Objetivos Trabajados:
                  </div>
                  <div style="border: 1px solid #f1f5f9; border-radius: 4px; background-color: #ffffff;">
                    ${objectivesHtml || '<div style="padding: 6px 10px; font-size: 11px; color: #94a3b8; font-style: italic;">Sin objetivos específicos registrados</div>'}
                  </div>
                </div>

                <div>
                  <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; letter-spacing: 0.3px;">
                    Evolución y Observaciones Clínicas:
                  </div>
                  <div style="font-size: 11.5px; color: #1e293b; line-height: 1.5; padding: 8px 10px; background-color: #f8fafc; border-radius: 4px; white-space: pre-line;">
                    ${session.descripcionSesion || 'Sin observaciones registradas.'}
                  </div>
                </div>
              </div>
            </div>
          `
        })
        .join('')
    }

    // Historial de objetivos generales completados
    let generalObjectivesHistoryHtml = ''
    const historyList = patient.objetivosGeneralesHistorial || []
    if (historyList.length > 0) {
      generalObjectivesHistoryHtml = `
        <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
          <div style="font-size: 11.5px; font-weight: 700; color: #166534; margin-bottom: 6px;">
            Objetivos Generales Alcanzados Previamente (${historyList.length}):
          </div>
          ${historyList
            .map(
              (item, idx) => `
            <div style="padding: 8px 12px; background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 4px; font-size: 11.5px; margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; font-weight: 600; color: #166534; margin-bottom: 2px;">
                <span>#${idx + 1} "${item.objetivoGeneral}"</span>
                <span style="font-size: 10.5px; color: #15803d;">Fecha: ${formatDate(item.fechaCompletado)}</span>
              </div>
              <div style="font-size: 10.5px; color: #475569;">
                Metas logradas: ${
                  (item.objetivosSecundarios || [])
                    .map((s) => s.descripcion)
                    .join(' • ') || 'Objetivos completados'
                }
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `
    }

    // Estructura completa del documento estilo informe clínico formal
    reportContainer.innerHTML = `
      <!-- ENCABEZADO FORMAL INSTITUCIONAL -->
      <div style="border-bottom: 2px solid #166534; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div style="font-size: 18px; font-weight: 800; color: #166534; letter-spacing: -0.3px; text-transform: uppercase;">
            Informe de Terapia Ocupacional
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">
            Fabiola Alarcón S.
          </div>
          <div style="font-size: 11px; color: #64748b;">
            Terapeuta Ocupacional · Licenciada en Ciencias de la Ocupación Humana (UOH)
          </div>
        </div>

        <div style="text-align: right;">
          <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 3px 8px; border-radius: 4px; display: inline-block;">
            Ficha Clínica Integral
          </div>
          <div style="font-size: 10.5px; color: #64748b; margin-top: 4px;">
            Fecha de Emisión: ${emissionDate} • ${emissionTime}
          </div>
        </div>
      </div>

      <!-- SECCIÓN 1: IDENTIFICACIÓN Y ANTECEDENTES DEL PACIENTE -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 12.5px; font-weight: 800; text-transform: uppercase; color: #166534; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0;">
          1. Antecedentes Generales del Paciente
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; margin-top: 4px;">
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 6px 8px; color: #64748b; width: 22%; font-weight: 600;">Nombre Completo:</td>
              <td style="padding: 6px 8px; color: #0f172a; width: 33%; font-weight: 700;">${patient.nombre}</td>
              <td style="padding: 6px 8px; color: #64748b; width: 18%; font-weight: 600;">RUT:</td>
              <td style="padding: 6px 8px; color: #0f172a; width: 27%; font-weight: 700;">${patient.rut}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 6px 8px; color: #64748b; font-weight: 600;">Edad:</td>
              <td style="padding: 6px 8px; color: #0f172a;">${patient.edad ? `${patient.edad} años` : 'No especificada'}</td>
              <td style="padding: 6px 8px; color: #64748b; font-weight: 600;">Fecha de Ingreso:</td>
              <td style="padding: 6px 8px; color: #0f172a;">${formatDate(patient.fechaIngreso)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 6px 8px; color: #64748b; font-weight: 600;">Teléfono de Contacto:</td>
              <td style="padding: 6px 8px; color: #0f172a;">${patient.telefono || 'No registrado'}</td>
              <td style="padding: 6px 8px; color: #64748b; font-weight: 600;">Correo Electrónico:</td>
              <td style="padding: 6px 8px; color: #0f172a;">${patient.correo || 'No registrado'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 6px 8px; color: #64748b; font-weight: 600;">Cuidador / Tutor:</td>
              <td colspan="3" style="padding: 6px 8px; color: #0f172a;">${patient.cuidador || 'No especificado'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 8px; color: #64748b; font-weight: 600; vertical-align: top;">Motivo de Consulta:</td>
              <td colspan="3" style="padding: 6px 8px; color: #0f172a; line-height: 1.4;">${patient.motivoConsulta || 'No especificado'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- SECCIÓN 2: EVALUACIÓN CLÍNICA INICIAL -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 12.5px; font-weight: 800; text-transform: uppercase; color: #166534; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0;">
          2. Evaluación Clínica Inicial
        </div>

        <div style="margin-bottom: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #334155; text-transform: uppercase; margin-bottom: 3px;">
            2.1 Antecedentes y Motivo Detallado:
          </div>
          <div style="font-size: 11.5px; color: #1e293b; line-height: 1.5; padding-left: 10px; border-left: 2px solid #cbd5e1;">
            ${patient.evaluacion?.motivoConsultaDetalle || 'No registrado'}
          </div>
        </div>

        <div style="margin-bottom: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #334155; text-transform: uppercase; margin-bottom: 3px;">
            2.2 Observación Clínica Ocupacional:
          </div>
          <div style="font-size: 11.5px; color: #1e293b; line-height: 1.5; padding-left: 10px; border-left: 2px solid #cbd5e1;">
            ${patient.evaluacion?.evaluacionInicial || 'No registrada'}
          </div>
        </div>

        <div style="margin-bottom: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #334155; text-transform: uppercase; margin-bottom: 3px;">
            2.3 Instrumentos de Evaluación Aplicados:
          </div>
          <div style="font-size: 11.5px; color: #1e293b; line-height: 1.5; padding-left: 10px; border-left: 2px solid #cbd5e1;">
            ${patient.evaluacion?.instrumentosAplicados || 'No registrados'}
          </div>
        </div>

        <div>
          <div style="font-size: 11px; font-weight: 700; color: #334155; text-transform: uppercase; margin-bottom: 3px;">
            2.4 Resultados y Síntesis Evaluativa:
          </div>
          <div style="font-size: 11.5px; color: #1e293b; line-height: 1.5; padding-left: 10px; border-left: 2px solid #cbd5e1;">
            ${patient.evaluacion?.resultados || 'No registrados'}
          </div>
        </div>
      </div>

      <!-- SECCIÓN 3: PLAN TERAPÉUTICO Y OBJETIVOS -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 12.5px; font-weight: 800; text-transform: uppercase; color: #166534; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0;">
          3. Plan Terapéutico y Objetivos
        </div>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; padding: 10px 14px; border-radius: 4px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 3px;">
            Objetivo General Activo (En Curso):
          </div>
          <div style="font-size: 12.5px; font-weight: 700; color: #0f172a; line-height: 1.4;">
            ${patient.objetivoGeneral ? `"${patient.objetivoGeneral}"` : '<span style="color: #64748b; font-weight: normal; font-style: italic;">Sin Objetivo General activo actualmente</span>'}
          </div>
        </div>

        ${generalObjectivesHistoryHtml}
      </div>

      <!-- SECCIÓN 4: REGISTRO CRONOLÓGICO DE ATENCIONES -->
      <div style="margin-bottom: 24px;">
        <div style="font-size: 12.5px; font-weight: 800; text-transform: uppercase; color: #166534; margin-bottom: 12px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0;">
          4. Registro Cronológico de Atenciones (${sortedSessions.length})
        </div>
        ${sessionsHtml}
      </div>

      <!-- PIE DE PÁGINA Y FIRMA DE LA PROFESIONAL -->
      <div style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end; page-break-inside: avoid;">
        <div style="font-size: 10px; color: #64748b; max-width: 440px; line-height: 1.4;">
          * Este documento contiene información clínica confidencial y reservada emitida con fines de registro terapéutico y seguimiento profesional.
        </div>

        <div style="text-align: center; width: 220px;">
          <div style="border-bottom: 1px solid #0f172a; margin-bottom: 6px; height: 35px;"></div>
          <div style="font-size: 11.5px; font-weight: 700; color: #0f172a;">Fabiola Alarcón S.</div>
          <div style="font-size: 10.5px; color: #475569;">Terapeuta Ocupacional</div>
          <div style="font-size: 9.5px; color: #64748b;">Universidad de O'Higgins (UOH)</div>
        </div>
      </div>
    `

    // Agregar al DOM para renderizado
    document.body.appendChild(reportContainer)

    try {
      // Capturar como imagen de alta resolución
      const canvas = await html2canvas(reportContainer, {
        scale: 2, // 2x para nitidez cristalina en fuentes y bordes
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      // Dimensiones de formato A4 en milímetros
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      const pdf = new jsPDF('p', 'mm', 'a4')
      let position = 0

      // Renderizar primera página
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Manejar páginas adicionales si el contenido es largo
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Nombre seguro y descriptivo para el archivo descargado
      const safePatientName = patient.nombre
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '_')
      const fileName = `Informe_Clinico_${safePatientName}.pdf`

      pdf.save(fileName)
    } finally {
      // Limpiar contenedor del DOM
      if (document.body.contains(reportContainer)) {
        document.body.removeChild(reportContainer)
      }
    }
  }
}
