
-- Actualizar la función handle_user_delete para desasignar reportes
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Desasignar todos los reportes asignados al usuario que se está eliminando
  UPDATE public.reportes 
  SET assigned_to = NULL,
      updated_at = now()
  WHERE assigned_to = OLD.id;
  
  -- Eliminar el perfil asociado cuando se elimina el usuario
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$;
