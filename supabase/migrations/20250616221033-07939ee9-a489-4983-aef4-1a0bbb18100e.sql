
-- Eliminar políticas existentes de la tabla estados si existen
DROP POLICY IF EXISTS "Users can view their own estados" ON public.estados;
DROP POLICY IF EXISTS "Users can create their own estados" ON public.estados;
DROP POLICY IF EXISTS "Users can update their own estados" ON public.estados;
DROP POLICY IF EXISTS "Users can delete their own estados" ON public.estados;

-- Crear políticas basadas en permisos de roles

-- Política para SELECT (ver_estado)
CREATE POLICY "Users can view estados based on role permissions" 
ON public.estados 
FOR SELECT 
TO authenticated
USING (
  public.user_has_role_permission('ver_estado'::permission_enum)
);

-- Política para INSERT (crear_estado)
CREATE POLICY "Users can create estados based on role permissions" 
ON public.estados 
FOR INSERT 
TO authenticated
WITH CHECK (
  public.user_has_role_permission('crear_estado'::permission_enum)
  AND auth.uid() = created_by
);

-- Política para UPDATE (editar_estado)
CREATE POLICY "Users can update estados based on role permissions" 
ON public.estados 
FOR UPDATE 
TO authenticated
USING (
  public.user_has_role_permission('editar_estado'::permission_enum)
)
WITH CHECK (
  public.user_has_role_permission('editar_estado'::permission_enum)
);

-- Política para DELETE (eliminar_estado)
CREATE POLICY "Users can delete estados based on role permissions" 
ON public.estados 
FOR DELETE 
TO authenticated
USING (
  public.user_has_role_permission('eliminar_estado'::permission_enum)
);

-- Asegurar que RLS esté habilitado en la tabla estados
ALTER TABLE public.estados ENABLE ROW LEVEL SECURITY;
