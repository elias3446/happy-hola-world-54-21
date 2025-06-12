
-- Crear un enum para las prioridades
DO $$ BEGIN
    CREATE TYPE priority_enum AS ENUM ('alto', 'medio', 'bajo', 'urgente');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Agregar la columna priority a la tabla reportes
ALTER TABLE public.reportes 
ADD COLUMN IF NOT EXISTS priority priority_enum NOT NULL DEFAULT 'urgente';

-- Crear un comentario para documentar la columna
COMMENT ON COLUMN public.reportes.priority IS 'Prioridad del reporte: urgente (por defecto), alto, medio, bajo';
