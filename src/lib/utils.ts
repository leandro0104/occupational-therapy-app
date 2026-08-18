import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "-"
  try {
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    return d.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return dateString
  }
}

export function formatDateTime(dateTimeString?: string): string {
  if (!dateTimeString) return "-"
  try {
    const d = new Date(dateTimeString)
    if (isNaN(d.getTime())) return dateTimeString
    return d.toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateTimeString
  }
}

/**
 * Formatea un RUT chileno agregando puntos y guión (ej: 12345678k -> 12.345.678-K)
 */
export function formatRut(rawRut: string): string {
  if (!rawRut) return ''
  // Limpiar caracteres no permitidos (solo números y K)
  const clean = rawRut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length === 0) return ''
  if (clean.length === 1) return clean

  const cuerpo = clean.slice(0, -1)
  const dv = clean.slice(-1)

  // Formatear cuerpo con puntos
  let cuerpoFormateado = ''
  for (let i = cuerpo.length - 1, j = 1; i >= 0; i--, j++) {
    cuerpoFormateado = cuerpo[i] + cuerpoFormateado
    if (j % 3 === 0 && i !== 0) {
      cuerpoFormateado = '.' + cuerpoFormateado
    }
  }

  return `${cuerpoFormateado}-${dv}`
}

/**
 * Valida un RUT chileno usando algoritmo Módulo 11
 */
export function validateRut(rut: string): boolean {
  if (!rut) return false
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length < 2) return false

  const cuerpo = clean.slice(0, -1)
  const dv = clean.slice(-1)

  let suma = 0
  let multiplo = 2

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo
    multiplo = multiplo === 7 ? 2 : multiplo + 1
  }

  const dvEsperadoNum = 11 - (suma % 11)
  let dvEsperado = ''
  if (dvEsperadoNum === 11) dvEsperado = '0'
  else if (dvEsperadoNum === 10) dvEsperado = 'K'
  else dvEsperado = dvEsperadoNum.toString()

  return dv === dvEsperado
}

/**
 * Valida formato de correo electrónico
 */
export function validateEmail(email: string): boolean {
  if (!email) return true // si es opcional y está vacío pasa
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return re.test(email.trim())
}
