-- ==============================================================================
-- ESQUEMA DE BASE DE DATOS SUPABASE: APP TERAPIA OCUPACIONAL (ACTUALIZADO)
-- Copia y pega este script completo en el SQL Editor de tu proyecto en Supabase
-- ==============================================================================

-- 1. Tabla de Pacientes (Perfil de la Persona, Objetivo General y Evaluación Inicial)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    rut VARCHAR(12) NOT NULL,
    edad INTEGER NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100),
    cuidador VARCHAR(100),
    motivo_consulta VARCHAR(200) NOT NULL,
    fecha_ingreso DATE DEFAULT CURRENT_DATE NOT NULL,
    
    -- Objetivo General (Objetivo Padre del paciente)
    objetivo_general VARCHAR(300),
    objetivo_general_completado BOOLEAN DEFAULT FALSE,
    objetivos_generales_historial JSONB DEFAULT '[]'::JSONB,
    
    -- Evaluación Clínica Inicial
    motivo_consulta_detalle VARCHAR(1000) NOT NULL,
    evaluacion_inicial VARCHAR(2000) NOT NULL,
    instrumentos_aplicados VARCHAR(300) NOT NULL,
    resultados VARCHAR(2000) NOT NULL,
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Si la tabla ya existe, agregar las columnas de Objetivo General en caso de que falten:
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS objetivo_general VARCHAR(300);
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS objetivo_general_completado BOOLEAN DEFAULT FALSE;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS objetivos_generales_historial JSONB DEFAULT '[]'::JSONB;

-- 2. Tabla de Sesiones y Evoluciones Clínicas
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    paciente_nombre VARCHAR(100),
    paciente_rut VARCHAR(12),
    fecha_hora TIMESTAMPTZ DEFAULT NOW(),
    
    -- Objetivos de intervención dinámicos guardados en formato JSONB
    -- Estructura: [{"id": "obj-1", "descripcion": "...", "estado": "logrado"}]
    objetivos JSONB DEFAULT '[]'::JSONB,
    
    descripcion_sesion VARCHAR(3000),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_patients_rut ON public.patients(rut);
CREATE INDEX IF NOT EXISTS idx_patients_nombre ON public.patients(nombre);
CREATE INDEX IF NOT EXISTS idx_sessions_paciente_id ON public.sessions(paciente_id);
CREATE INDEX IF NOT EXISTS idx_sessions_fecha ON public.sessions(fecha_hora DESC);

-- 4. Habilitar Seguridad a Nivel de Fila (Row Level Security - RLS)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 5. Eliminar políticas previas si existiesen
DROP POLICY IF EXISTS "Permitir todo en patients" ON public.patients;
DROP POLICY IF EXISTS "Permitir todo en sessions" ON public.sessions;
DROP POLICY IF EXISTS "Acceso total pacientes para usuarios autenticados" ON public.patients;
DROP POLICY IF EXISTS "Acceso total sesiones para usuarios autenticados" ON public.sessions;

-- 6. Políticas de Acceso para Terapeuta Autenticado (Seguro y sin advertencias)
CREATE POLICY "Acceso total pacientes para usuarios autenticados" ON public.patients
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Acceso total sesiones para usuarios autenticados" ON public.sessions
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
