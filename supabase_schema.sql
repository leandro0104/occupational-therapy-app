-- =========================================================================
-- ESQUEMA DE BASE DE DATOS SUPABASE - SISTEMA TERAPIA OCUPACIONAL
-- Terapeuta Responsable: Fabiola Alarcón S. (UOH)
-- =========================================================================

-- Habilitar extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabla de Pacientes / Usuarios
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    rut VARCHAR(12) NOT NULL UNIQUE,
    edad INT CHECK (edad >= 0 AND edad <= 120),
    telefono VARCHAR(20),
    correo VARCHAR(100),
    cuidador VARCHAR(100),
    motivo_consulta VARCHAR(200) NOT NULL,
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Relación con Objetivo General Padre
    objetivo_general_id VARCHAR(100),
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

-- Migraciones automáticas para tablas existentes:
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS objetivo_general_id VARCHAR(100);
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS objetivo_general VARCHAR(300);
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS objetivo_general_completado BOOLEAN DEFAULT FALSE;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS objetivos_generales_historial JSONB DEFAULT '[]'::JSONB;

-- 2. Tabla de Sesiones y Evoluciones Clínicas (Relacional)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    paciente_nombre VARCHAR(100),
    paciente_rut VARCHAR(12),
    fecha_hora TIMESTAMPTZ DEFAULT NOW(),
    
    -- Relación formal por ID con el Objetivo General
    objetivo_general_id VARCHAR(100),
    objetivo_general_texto VARCHAR(300),
    
    -- Objetivos de intervención dinámicos guardados en formato JSONB
    -- Estructura: [{"id": "obj-1", "descripcion": "...", "estado": "logrado"}]
    objetivos JSONB DEFAULT '[]'::JSONB,
    
    descripcion_sesion VARCHAR(3000),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migraciones automáticas para la tabla sessions:
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS objetivo_general_id VARCHAR(100);
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS objetivo_general_texto VARCHAR(300);

-- 3. Índices para consultas relacionales ultra-rápidas
CREATE INDEX IF NOT EXISTS idx_patients_rut ON public.patients(rut);
CREATE INDEX IF NOT EXISTS idx_patients_nombre ON public.patients(nombre);
CREATE INDEX IF NOT EXISTS idx_sessions_paciente_id ON public.sessions(paciente_id);
CREATE INDEX IF NOT EXISTS idx_sessions_objetivo_general_id ON public.sessions(objetivo_general_id);
CREATE INDEX IF NOT EXISTS idx_sessions_fecha ON public.sessions(fecha_hora DESC);

-- 4. Políticas de Seguridad (Row Level Security - RLS)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso total pacientes para usuarios autenticados" ON public.patients;
DROP POLICY IF EXISTS "Acceso total sesiones para usuarios autenticados" ON public.sessions;

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
