-- ==============================================================================
-- ESQUEMA DE BASE DE DATOS SUPABASE: APP TERAPIA OCUPACIONAL
-- Copia y pega este script completo en el SQL Editor de tu proyecto en Supabase
-- ==============================================================================

-- 1. Tabla de Pacientes (Perfil de la Persona y Evaluación Inicial)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    rut TEXT NOT NULL,
    edad INTEGER,
    telefono TEXT,
    correo TEXT,
    cuidador TEXT,
    motivo_consulta TEXT,
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    
    -- Evaluación Clínica Inicial
    motivo_consulta_detalle TEXT,
    evaluacion_inicial TEXT,
    instrumentos_aplicados TEXT,
    resultados TEXT,
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Sesiones y Evoluciones Clínicas
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    paciente_nombre TEXT,
    paciente_rut TEXT,
    fecha_hora TIMESTAMPTZ DEFAULT NOW(),
    
    -- Objetivos de intervención dinámicos guardados en formato JSONB
    -- Estructura: [{"id": "obj-1", "descripcion": "...", "estado": "logrado"}]
    objetivos JSONB DEFAULT '[]'::JSONB,
    
    descripcion_sesion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para optimizar búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_patients_rut ON public.patients(rut);
CREATE INDEX IF NOT EXISTS idx_patients_nombre ON public.patients(nombre);
CREATE INDEX IF NOT EXISTS idx_sessions_paciente_id ON public.sessions(paciente_id);
CREATE INDEX IF NOT EXISTS idx_sessions_fecha ON public.sessions(fecha_hora DESC);

-- 4. Habilitar Seguridad a Nivel de Fila (Row Level Security - RLS)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acceso para Uso Personal
-- Permitir lectura, inserción, actualización y eliminación
CREATE POLICY "Permitir todo en patients" ON public.patients
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir todo en sessions" ON public.sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- ¡Listo! Las tablas e índices han sido creados correctamente.
-- ==============================================================================
