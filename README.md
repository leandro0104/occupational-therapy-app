# 🌿 Terapia Ocupacional - App de Registro y Evolución de Atenciones

Aplicación web moderna y profesional diseñada para terapeutas ocupacionales, orientada al registro clínico integral de pacientes, gestión de evaluaciones iniciales y seguimiento de evoluciones de sesiones con objetivos de intervención dinámicos.

---

## 🚀 Características Principales

- 🔐 **Autenticación Limpia**: Pantalla de login minimalista inspirada en `shadcn/ui` con recuperación de contraseña.
- 📋 **Mantenedor de Usuarios / Pacientes**:
  - Buscador en tiempo real por **Nombre**, **RUT** o **Correo**.
  - Visualización tabular completa: Nombre, RUT, Edad, Teléfono, Correo, Cuidador/a, Motivo de consulta y Fecha de ingreso.
  - Paginación y selección de filas por página.
- 📝 **Modal de Creación de Usuarios**:
  - Módulo 1: **Perfil de la Persona**.
  - Módulo 2: **Evaluación Clínica Inicial** (motivo detallado, observación inicial, instrumentos aplicados y resultados).
- 🩺 **Modal Grande de Atención y Evolución**:
  - Resumen visual de la ficha del paciente (Perfil y Evaluación).
  - Registro de sesión con fecha y hora.
  - **Objetivos de intervención dinámicos** con selector de estado:
    - 🟢 *Logrado*
    - 🟡 *Parcialmente Logrado*
    - 🔴 *No Logrado*
    - 🔵 *En Proceso*
  - Campo de descripción cualitativa de la sesión.
  - Historial de atenciones previas del paciente y botón *+ Nueva Atención*.
- 📑 **Historial Global de Atenciones**:
  - Métricas generales (total de sesiones, objetivos abordados y tasa de logro %).
  - Filtros avanzados por paciente y estado de objetivos.
- 🎨 **Diseño y Estilos**: Construido con **Tailwind CSS**, componentes inspirados en **shadcn/ui** y paleta temática **Lime**.
- ⚡ **Listo para Supabase**: Capa de datos desacoplada y tipada en TypeScript para conectar Supabase fácilmente.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **Estilos & UI**: Tailwind CSS, Lucide Icons, Shadcn UI Design System
- **Almacenamiento**: Persistencia local estructurada (compatible con Supabase)

---

## 💻 Instalación y Uso Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/leandro0104/occupational-therapy-app.git
   cd occupational-therapy-app
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Compilar para producción:
   ```bash
   npm run build
   ```

---

## 📄 Licencia

Este proyecto es privado y para uso clínico en Terapia Ocupacional.
