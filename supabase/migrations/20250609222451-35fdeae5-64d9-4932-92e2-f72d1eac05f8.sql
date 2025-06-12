
-- Crear función para manejar la eliminación de categorías
CREATE OR REPLACE FUNCTION public.handle_category_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- No necesitamos hacer nada especial aquí ya que los reportes mantendrán
  -- la referencia pero las consultas filtrarán categorías eliminadas
  RETURN NEW;
END;
$$;

-- Crear función para manejar la eliminación de estados
CREATE OR REPLACE FUNCTION public.handle_estado_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- No necesitamos hacer nada especial aquí ya que los reportes mantendrán
  -- la referencia pero las consultas filtrarán estados eliminados
  RETURN NEW;
END;
$$;

-- Crear triggers para categorías y estados
DROP TRIGGER IF EXISTS on_category_deletion ON public.categories;
CREATE TRIGGER on_category_deletion
  AFTER UPDATE ON public.categories
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
  EXECUTE FUNCTION public.handle_category_deletion();

DROP TRIGGER IF EXISTS on_estado_deletion ON public.estados;
CREATE TRIGGER on_estado_deletion
  AFTER UPDATE ON public.estados
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
  EXECUTE FUNCTION public.handle_estado_deletion();
