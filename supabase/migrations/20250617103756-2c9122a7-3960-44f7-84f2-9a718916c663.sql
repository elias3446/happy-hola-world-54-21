
-- Eliminar políticas existentes de la tabla roles si existen
DROP POLICY IF EXISTS "Users can view their own roles" ON public.roles;
DROP POLICY IF EXISTS "Users can create their own roles" ON public.roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.roles;

-- Crear políticas basadas en permisos de roles

-- Política para SELECT (ver_rol)
CREATE POLICY "Users can view roles based on role permissions" 
ON public.roles 
FOR SELECT 
TO authenticated
USING (
  public.user_has_role_permission('ver_rol'::permission_enum)
);

-- Política para INSERT (crear_rol)
CREATE POLICY "Users can create roles based on role permissions" 
ON public.roles 
FOR INSERT 
TO authenticated
WITH CHECK (
  public.user_has_role_permission('crear_rol'::permission_enum)
  AND auth.uid() = created_by
);

-- Política para UPDATE (editar_rol)
CREATE POLICY "Users can update roles based on role permissions" 
ON public.roles 
FOR UPDATE 
TO authenticated
USING (
  public.user_has_role_permission('editar_rol'::permission_enum)
)
WITH CHECK (
  public.user_has_role_permission('editar_rol'::permission_enum)
);

-- Política para DELETE (eliminar_rol)
CREATE POLICY "Users can delete roles based on role permissions" 
ON public.roles 
FOR DELETE 
TO authenticated
USING (
  public.user_has_role_permission('eliminar_rol'::permission_enum)
);

-- Asegurar que RLS esté habilitado en la tabla roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
