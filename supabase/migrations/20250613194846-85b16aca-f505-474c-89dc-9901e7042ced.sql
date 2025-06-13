
-- Drop the existing function and recreate it with the correct signature
DROP FUNCTION IF EXISTS public.registrar_actividad(activity_type, text, character varying, character varying, jsonb);

-- Recreate the function with the correct parameter types
CREATE OR REPLACE FUNCTION public.registrar_actividad(
  p_activity_type activity_type,
  p_descripcion TEXT,
  p_tabla_afectada TEXT DEFAULT NULL,
  p_registro_id TEXT DEFAULT NULL,
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
