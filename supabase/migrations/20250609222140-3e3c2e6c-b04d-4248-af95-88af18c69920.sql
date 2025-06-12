
-- Agregar columna deleted_at a la tabla user_roles si no existe
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Crear función para manejar la eliminación de roles
CREATE OR REPLACE FUNCTION public.handle_role_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Marcar como eliminadas todas las asignaciones de roles cuando se elimina un rol
  UPDATE public.user_roles 
  SET deleted_at = now()
  WHERE role_id = NEW.id 
    AND NEW.deleted_at IS NOT NULL 
    AND OLD.deleted_at IS NULL;
  
  RETURN NEW;
END;
$$;

-- Crear trigger para ejecutar la función cuando se actualiza un rol
DROP TRIGGER IF EXISTS on_role_deletion ON public.roles;
CREATE TRIGGER on_role_deletion
  AFTER UPDATE ON public.roles
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
  EXECUTE FUNCTION public.handle_role_deletion();
