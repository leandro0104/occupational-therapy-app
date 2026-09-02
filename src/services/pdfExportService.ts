import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Patient, SessionEvolution } from '@/types'
import { formatDate, formatDateTime } from '@/lib/utils'

export const pdfExportService = {
  /**
   * Genera y descarga un informe PDF completo de la ficha clínica del paciente y su historial de atenciones.
   */
  async exportPatientClinicalRecord(patient: Patient, sessions: SessionEvolution[]): Promise<void> {
    // Ordenar sesiones cronológicamente (de la primera a la más reciente)
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
    )

    // Crear contenedor temporal fuera de pantalla para renderizar el HTML del informe
    const reportContainer = document.createElement('div')
    reportContainer.id = 'pdf-render-container'
    reportContainer.style.position = 'absolute'
    reportContainer.style.left = '-9999px'
    reportContainer.style.top = '0'
    reportContainer.style.width = '800px'
    reportContainer.style.backgroundColor = '#ffffff'
    reportContainer.style.color = '#18181b'
    reportContainer.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    reportContainer.style.padding = '36px 32px'
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
        <div style="padding: 18px; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; text-align: center; color: #64748b; font-size: 13px;">
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
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 6px; font-size: 12px; box-sizing: border-box;">
                  <span style="color: #1e293b; flex: 1; margin-right: 12px; line-height: 1.4;">• ${obj.descripcion}</span>
                  <span style="background-color: ${badgeColor}; color: ${badgeText}; border: 1px solid ${badgeBorder}; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; white-space: nowrap;">
                    ${statusLabel}
                  </span>
                </div>
              `
            })
            .join('')

          const generalObjBadge = session.objetivoGeneralTexto
            ? `
              <div style="margin-bottom: 10px; padding: 6px 12px; background-color: #f7fee7; border: 1px solid #d9f99d; border-left: 3px solid #65a30d; border-radius: 6px; font-size: 11px; color: #365314; line-height: 1.4;">
                <strong>🎯 Objetivo General Asociado:</strong> "${session.objetivoGeneralTexto}"
              </div>
            `
            : ''

          return `
            <div style="margin-bottom: 18px; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; page-break-inside: avoid; box-sizing: border-box;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                <span style="font-weight: 700; color: #15803d; font-size: 13px;">
                  Sesión de Atención #${index + 1}
                </span>
                <span style="color: #64748b; font-size: 12px; font-weight: 500;">
                  📅 ${formattedSessionDate}
                </span>
              </div>

              ${generalObjBadge}

              <div style="margin-bottom: 12px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 6px; letter-spacing: 0.3px;">
                  Objetivos de Intervención:
                </div>
                ${objectivesHtml || '<span style="font-size: 12px; color: #94a3b8; font-style: italic;">Sin objetivos específicos registrados</span>'}
              </div>

              <div>
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 6px; letter-spacing: 0.3px;">
                  Descripción / Evolución Clínica:
                </div>
                <div style="font-size: 12px; color: #1e293b; line-height: 1.6; background-color: #ffffff; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 6px; white-space: pre-line; box-sizing: border-box;">
                  ${session.descripcionSesion || 'Sin observaciones registradas.'}
                </div>
              </div>
            </div>
          `
        })
        .join('')
    }

    // Construir HTML del Historial de Objetivos Generales
    let generalObjectivesHistoryHtml = ''
    const historyList = patient.objetivosGeneralesHistorial || []
    if (historyList.length > 0) {
      generalObjectivesHistoryHtml = `
        <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
          <div style="font-size: 12px; font-weight: 700; color: #15803d; margin-bottom: 8px;">
            🏆 Objetivos Generales Completados en Historial (${historyList.length}):
          </div>
          ${historyList
            .map(
              (item, idx) => `
            <div style="margin-bottom: 8px; padding: 10px 12px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; font-size: 12px; box-sizing: border-box;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 600; color: #166534; margin-bottom: 4px;">
                <span>#${idx + 1} "${item.objetivoGeneral}"</span>
                <span style="font-size: 11px; color: #15803d;">Completado: ${formatDate(item.fechaCompletado)}</span>
              </div>
              <div style="font-size: 11px; color: #334155; line-height: 1.4;">
                Metas alcanzadas: ${
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

    // Inyectar HTML estructurado completo
    reportContainer.innerHTML = `
      <!-- ENCABEZADO INSTITUCIONAL / PROFESIONAL -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 2px solid #15803d; margin-bottom: 22px;">
        <div>
          <div style="font-size: 20px; font-weight: 800; color: #15803d; letter-spacing: -0.5px;">
            TERAPIA OCUPACIONAL
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px;">
            Fabiola Alarcón S.
          </div>
          <div style="font-size: 12px; color: #475569;">
            Terapeuta Ocupacional — Universidad de O'Higgins (UOH)
          </div>
        </div>

        <div style="text-align: right;">
          <div style="display: inline-block; padding: 4px 10px; background-color: #f7fee7; border: 1px solid #bef264; border-radius: 6px; font-size: 11px; font-weight: 700; color: #3f6212; text-transform: uppercase;">
            Ficha Clínica Integral
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
            Emisión: ${emissionDate} • ${emissionTime}
          </div>
        </div>
      </div>

      <!-- 1. DATOS DEL PACIENTE -->
      <div style="margin-bottom: 20px; padding: 16px 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; box-sizing: border-box;">
        <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #15803d; margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
          <span>👤 1. Antecedentes del Paciente</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
          <div style="background-color: #ffffff; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; box-sizing: border-box;">
            <span style="color: #64748b; font-size: 11px; display: block;">Nombre Completo:</span>
            <strong style="color: #0f172a; font-size: 13px; margin-top: 2px; display: block;">${patient.nombre}</strong>
          </div>
          <div style="background-color: #ffffff; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; box-sizing: border-box;">
            <span style="color: #64748b; font-size: 11px; display: block;">RUT:</span>
            <strong style="color: #0f172a; font-size: 13px; margin-top: 2px; display: block;">${patient.rut}</strong>
          </div>
          <div style="background-color: #ffffff; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; box-sizing: border-box;">
            <span style="color: #64748b; font-size: 11px; display: block;">Edad:</span>
            <span style="color: #0f172a; font-weight: 600; margin-top: 2px; display: block;">${patient.edad ? `${patient.edad} años` : 'No especificada'}</span>
          </div>
          <div style="background-color: #ffffff; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; box-sizing: border-box;">
            <span style="color: #64748b; font-size: 11px; display: block;">Fecha de Ingreso:</span>
            <span style="color: #0f172a; font-weight: 600; margin-top: 2px; display: block;">${formatDate(patient.fechaIngreso)}</span>
          </div>
          <div style="background-color: #ffffff; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; box-sizing: border-box;">
            <span style="color: #64748b; font-size: 11px; display: block;">Teléfono de Contacto:</span>
            <span style="color: #0f172a; font-weight: 600; margin-top: 2px; display: block;">${patient.telefono || 'No registrado'}</span>
          </div>
          <div style="background-color: #ffffff; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; box-sizing: border-box;">
            <span style="color: #64748b; font-size: 11px; display: block;">Correo Electrónico:</span>
            <span style="color: #0f172a; font-weight: 600; margin-top: 2px; display: block;">${patient.correo || 'No registrado'}</span>
          </div>
          <div style="grid-column: span 2; background-color: #ffffff; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px; box-sizing: border-box;">
            <span style="color: #64748b; font-size: 11px; display: block;">Cuidador / Tutor Responsable:</span>
            <span style="color: #0f172a; font-weight: 600; margin-top: 2px; display: block;">${patient.cuidador || 'No especificado'}</span>
          </div>
          <div style="grid-column: span 2; background-color: #ffffff; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; box-sizing: border-box;">
            <span style="color: #64748b; font-size: 11px; display: block;">Motivo General de Consulta:</span>
            <span style="color: #0f172a; font-weight: 600; margin-top: 2px; display: block; line-height: 1.5;">${patient.motivoConsulta || 'No especificado'}</span>
          </div>
        </div>
      </div>

      <!-- 2. EVALUACIÓN CLÍNICA INICIAL -->
      <div style="margin-bottom: 20px; padding: 16px 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; box-sizing: border-box;">
        <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #15803d; margin-bottom: 14px;">
          🩺 2. Evaluación Clínica Inicial
        </div>

        <div style="margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.3px;">
            Antecedentes / Motivo Detallado:
          </div>
          <div style="font-size: 12px; color: #0f172a; line-height: 1.6; background-color: #ffffff; padding: 10px 14px; border: 1px solid #e2e8f0; border-left: 3px solid #15803d; border-radius: 6px; box-sizing: border-box;">
            ${patient.evaluacion?.motivoConsultaDetalle || 'No registrado'}
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.3px;">
            Observación Clínica Ocupacional:
          </div>
          <div style="font-size: 12px; color: #0f172a; line-height: 1.6; background-color: #ffffff; padding: 10px 14px; border: 1px solid #e2e8f0; border-left: 3px solid #15803d; border-radius: 6px; box-sizing: border-box;">
            ${patient.evaluacion?.evaluacionInicial || 'No registrada'}
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.3px;">
            Instrumentos Aplicados:
          </div>
          <div style="font-size: 12px; color: #0f172a; line-height: 1.6; background-color: #ffffff; padding: 10px 14px; border: 1px solid #e2e8f0; border-left: 3px solid #15803d; border-radius: 6px; box-sizing: border-box;">
            ${patient.evaluacion?.instrumentosAplicados || 'No registrados'}
          </div>
        </div>

        <div>
          <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.3px;">
            Resultados y Síntesis Evaluativa:
          </div>
          <div style="font-size: 12px; color: #0f172a; line-height: 1.6; background-color: #ffffff; padding: 10px 14px; border: 1px solid #e2e8f0; border-left: 3px solid #15803d; border-radius: 6px; box-sizing: border-box;">
            ${patient.evaluacion?.resultados || 'No registrados'}
          </div>
        </div>
      </div>

      <!-- 3. PLAN TERAPÉUTICO Y OBJETIVO GENERAL -->
      <div style="margin-bottom: 20px; padding: 16px 18px; background-color: #f7fee7; border: 1px solid #d9f99d; border-radius: 10px; box-sizing: border-box;">
        <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #365314; margin-bottom: 10px;">
          🎯 3. Plan Terapéutico y Objetivos
        </div>

        <div style="margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 700; color: #4d7c0f; text-transform: uppercase; letter-spacing: 0.3px;">Objetivo General Activo:</span>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.5; margin-top: 4px; background-color: #ffffff; padding: 10px 14px; border: 1px solid #bef264; border-left: 4px solid #65a30d; border-radius: 6px; box-sizing: border-box;">
            ${patient.objetivoGeneral ? `"${patient.objetivoGeneral}"` : '<span style="color: #64748b; font-weight: normal; font-style: italic;">Sin Objetivo General activo actualmente</span>'}
          </div>
        </div>

        ${generalObjectivesHistoryHtml}
      </div>

      <!-- 4. REGISTRO DE ATENCIONES / EVOLUCIONES CLÍNICAS -->
      <div style="margin-bottom: 20px;">
        <div style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #15803d; margin-bottom: 14px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0;">
          📋 4. Registro Cronológico de Atenciones (${sortedSessions.length})
        </div>
        ${sessionsHtml}
      </div>

      <!-- PIE DE PÁGINA Y FIRMA -->
      <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end; page-break-inside: avoid;">
        <div style="font-size: 11px; color: #64748b; max-width: 420px; line-height: 1.5;">
          * Este documento contiene información clínica confidencial relativa a la intervención y evolución en Terapia Ocupacional del paciente individualizado.
        </div>

        <div style="text-align: center; width: 220px;">
          <div style="border-bottom: 1px solid #0f172a; margin-bottom: 8px; height: 35px;"></div>
          <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Fabiola Alarcón S.</div>
          <div style="font-size: 11px; color: #475569;">Terapeuta Ocupacional</div>
          <div style="font-size: 10px; color: #64748b;">Universidad de O'Higgins</div>
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
      const fileName = `Ficha_Clinica_${safePatientName}.pdf`

      pdf.save(fileName)
    } finally {
      // Limpiar contenedor del DOM
      if (document.body.contains(reportContainer)) {
        document.body.removeChild(reportContainer)
      }
    }
  }
}
