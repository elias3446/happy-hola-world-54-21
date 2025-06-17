
-- Eliminar políticas existentes de la tabla categories si existen
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can create their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;

-- Crear políticas basadas en permisos de roles

-- Política para SELECT (ver_categoria)
CREATE POLICY "Users can view categories based on role permissions" 
ON public.categories 
FOR SELECT 
TO authenticated
USING (
  public.user_has_role_permission('ver_categoria'::permission_enum)
);

-- Política para INSERT (crear_categoria)
CREATE POLICY "Users can create categories based on role permissions" 
ON public.categories 
FOR INSERT 
TO authenticated
WITH CHECK (
  public.user_has_role_permission('crear_categoria'::permission_enum)
  AND auth.uid() = created_by
);

-- Política para UPDATE (editar_categoria)
CREATE POLICY "Users can update categories based on role permissions" 
ON public.categories 
FOR UPDATE 
TO authenticated
USING (
  public.user_has_role_permission('editar_categoria'::permission_enum)
)
WITH CHECK (
  public.user_has_role_permission('editar_categoria'::permission_enum)
);

-- Política para DELETE (eliminar_categoria)
CREATE POLICY "Users can delete categories based on role permissions" 
ON public.categories 
FOR DELETE 
TO authenticated
USING (
  public.user_has_role_permission('eliminar_categoria'::permission_enum)
);

-- Asegurar que RLS esté habilitado en la tabla categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
