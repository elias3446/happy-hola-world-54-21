
-- Eliminar políticas existentes de la tabla reportes si existen
DROP POLICY IF EXISTS "Users can view their own reportes" ON public.reportes;
DROP POLICY IF EXISTS "Users can create their own reportes" ON public.reportes;
DROP POLICY IF EXISTS "Users can update their own reportes" ON public.reportes;
DROP POLICY IF EXISTS "Users can delete their own reportes" ON public.reportes;

-- Crear políticas basadas en permisos de roles

-- Política para SELECT (ver_reporte)
CREATE POLICY "Users can view reportes based on role permissions" 
ON public.reportes 
FOR SELECT 
TO authenticated
USING (
  public.user_has_role_permission('ver_reporte'::permission_enum)
);

-- Política para INSERT (crear_reporte)
CREATE POLICY "Users can create reportes based on role permissions" 
ON public.reportes 
FOR INSERT 
TO authenticated
WITH CHECK (
  public.user_has_role_permission('crear_reporte'::permission_enum)
  AND auth.uid() = created_by
);

-- Política para UPDATE (editar_reporte)
CREATE POLICY "Users can update reportes based on role permissions" 
ON public.reportes 
FOR UPDATE 
TO authenticated
USING (
  public.user_has_role_permission('editar_reporte'::permission_enum)
)
WITH CHECK (
  public.user_has_role_permission('editar_reporte'::permission_enum)
);

-- Política para DELETE (eliminar_reporte)
CREATE POLICY "Users can delete reportes based on role permissions" 
ON public.reportes 
FOR DELETE 
TO authenticated
USING (
  public.user_has_role_permission('eliminar_reporte'::permission_enum)
);

-- Asegurar que RLS esté habilitado en la tabla reportes
ALTER TABLE public.reportes ENABLE ROW LEVEL SECURITY;
