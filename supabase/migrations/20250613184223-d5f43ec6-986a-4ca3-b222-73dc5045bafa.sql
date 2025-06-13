
-- Crear enum para tipos de operaciones
CREATE TYPE public.operation_type AS ENUM ('INSERT', 'UPDATE', 'DELETE', 'SELECT');

-- Crear enum para tipos de actividades
CREATE TYPE public.activity_type AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SEARCH', 'EXPORT', 'IMPORT');

-- Tabla de actividades generales del usuario
CREATE TABLE public.actividades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  descripcion TEXT NOT NULL,
  tabla_afectada VARCHAR(100),
  registro_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  metadatos JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de cambios históricos específicos para operaciones CRUD
CREATE TABLE public.cambios_historial (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actividad_id UUID NOT NULL REFERENCES public.actividades(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tabla_nombre VARCHAR(100) NOT NULL,
  registro_id VARCHAR(100) NOT NULL,
  operation_type operation_type NOT NULL,
  valores_anteriores JSONB,
  valores_nuevos JSONB,
  campos_modificados TEXT[],
  descripcion_cambio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para optimizar consultas
CREATE INDEX idx_actividades_user_id ON public.actividades(user_id);
CREATE INDEX idx_actividades_created_at ON public.actividades(created_at);
CREATE INDEX idx_actividades_tabla_afectada ON public.actividades(tabla_afectada);
CREATE INDEX idx_cambios_historial_user_id ON public.cambios_historial(user_id);
CREATE INDEX idx_cambios_historial_tabla_nombre ON public.cambios_historial(tabla_nombre);
CREATE INDEX idx_cambios_historial_registro_id ON public.cambios_historial(registro_id);
CREATE INDEX idx_cambios_historial_created_at ON public.cambios_historial(created_at);

-- Habilitar RLS
ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cambios_historial ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para actividades
CREATE POLICY "Los usuarios pueden ver sus propias actividades" 
  ON public.actividades 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Solo el sistema puede insertar actividades" 
  ON public.actividades 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para cambios_historial
CREATE POLICY "Los usuarios pueden ver sus propios cambios" 
  ON public.cambios_historial 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Solo el sistema puede insertar cambios" 
  ON public.cambios_historial 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Función para registrar actividades generales
CREATE OR REPLACE FUNCTION public.registrar_actividad(
  p_activity_type activity_type,
  p_descripcion TEXT,
  p_tabla_afectada VARCHAR(100) DEFAULT NULL,
  p_registro_id VARCHAR(100) DEFAULT NULL,
  p_metadatos JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  actividad_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'No hay usuario autenticado';
  END IF;

  INSERT INTO public.actividades (
    user_id,
    activity_type,
    descripcion,
    tabla_afectada,
    registro_id,
    metadatos
  ) VALUES (
    current_user_id,
    p_activity_type,
    p_descripcion,
    p_tabla_afectada,
    p_registro_id,
    p_metadatos
  ) RETURNING id INTO actividad_id;

  RETURN actividad_id;
END;
$$;

-- Función genérica para auditar cambios CRUD
CREATE OR REPLACE FUNCTION public.audit_table_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  actividad_id UUID;
  current_user_id UUID;
  operation_desc TEXT;
  activity_enum activity_type;
  op_enum operation_type;
  campos_modificados TEXT[] := '{}';
  col_name TEXT;
  old_val TEXT;
  new_val TEXT;
BEGIN
  current_user_id := auth.uid();
  
  -- Si no hay usuario autenticado, no registrar auditoría
  IF current_user_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Determinar el tipo de operación
  CASE TG_OP
    WHEN 'INSERT' THEN
      operation_desc := 'Registro creado en ' || TG_TABLE_NAME;
      activity_enum := 'CREATE';
      op_enum := 'INSERT';
    WHEN 'UPDATE' THEN
      operation_desc := 'Registro actualizado en ' || TG_TABLE_NAME;
      activity_enum := 'UPDATE';
      op_enum := 'UPDATE';
      
      -- Detectar campos modificados
      FOR col_name IN 
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = TG_TABLE_NAME 
        AND table_schema = 'public'
      LOOP
        EXECUTE format('SELECT ($1).%I::TEXT, ($2).%I::TEXT', col_name, col_name) 
        INTO old_val, new_val 
        USING OLD, NEW;
        
        IF old_val IS DISTINCT FROM new_val THEN
          campos_modificados := array_append(campos_modificados, col_name);
        END IF;
      END LOOP;
      
    WHEN 'DELETE' THEN
      operation_desc := 'Registro eliminado de ' || TG_TABLE_NAME;
      activity_enum := 'DELETE';
      op_enum := 'DELETE';
  END CASE;

  -- Registrar actividad general
  actividad_id := public.registrar_actividad(
    activity_enum,
    operation_desc,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN (row_to_json(OLD)->>'id')::TEXT
      ELSE (row_to_json(NEW)->>'id')::TEXT
    END,
    jsonb_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'timestamp', now()
    )
  );

  -- Registrar cambio específico en historial
  INSERT INTO public.cambios_historial (
    actividad_id,
    user_id,
    tabla_nombre,
    registro_id,
    operation_type,
    valores_anteriores,
    valores_nuevos,
    campos_modificados,
    descripcion_cambio
  ) VALUES (
    actividad_id,
    current_user_id,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN (row_to_json(OLD)->>'id')::TEXT
      ELSE (row_to_json(NEW)->>'id')::TEXT
    END,
    op_enum,
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    campos_modificados,
    operation_desc
  );

  -- Retornar el registro apropiado
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Crear triggers de auditoría para todas las tablas principales
CREATE TRIGGER audit_reportes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reportes
  FOR EACH ROW EXECUTE FUNCTION public.audit_table_changes();

CREATE TRIGGER audit_categories_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.audit_table_changes();

CREATE TRIGGER audit_estados_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.estados
  FOR EACH ROW EXECUTE FUNCTION public.audit_table_changes();

CREATE TRIGGER audit_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_table_changes();

CREATE TRIGGER audit_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_table_changes();

CREATE TRIGGER audit_user_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_table_changes();

-- Función para obtener actividades de un usuario
CREATE OR REPLACE FUNCTION public.get_user_activities(
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  activity_type activity_type,
  descripcion TEXT,
  tabla_afectada VARCHAR(100),
  registro_id VARCHAR(100),
  metadatos JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  user_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.activity_type,
    a.descripcion,
    a.tabla_afectada,
    a.registro_id,
    a.metadatos,
    a.created_at,
    p.email
  FROM public.actividades a
  JOIN public.profiles p ON a.user_id = p.id
  WHERE (p_user_id IS NULL OR a.user_id = p_user_id)
  ORDER BY a.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Función para obtener historial de cambios
CREATE OR REPLACE FUNCTION public.get_change_history(
  p_tabla_nombre VARCHAR(100) DEFAULT NULL,
  p_registro_id VARCHAR(100) DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  tabla_nombre VARCHAR(100),
  registro_id VARCHAR(100),
  operation_type operation_type,
  valores_anteriores JSONB,
  valores_nuevos JSONB,
  campos_modificados TEXT[],
  descripcion_cambio TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  user_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ch.id,
    ch.tabla_nombre,
    ch.registro_id,
    ch.operation_type,
    ch.valores_anteriores,
    ch.valores_nuevos,
    ch.campos_modificados,
    ch.descripcion_cambio,
    ch.created_at,
    p.email
  FROM public.cambios_historial ch
  JOIN public.profiles p ON ch.user_id = p.id
  WHERE (p_tabla_nombre IS NULL OR ch.tabla_nombre = p_tabla_nombre)
    AND (p_registro_id IS NULL OR ch.registro_id = p_registro_id)
    AND (p_user_id IS NULL OR ch.user_id = p_user_id)
  ORDER BY ch.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;
