
-- Eliminar políticas existentes de la tabla profiles si existen
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- Política para SELECT (ver_usuario) - Los usuarios pueden ver su propio perfil o si tienen permiso ver_usuario
CREATE POLICY "Users can view profiles based on permissions" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  id = auth.uid() OR 
  public.user_has_role_permission('ver_usuario'::permission_enum)
);

-- Política para INSERT (crear_usuario) - Solo durante configuración inicial o con permiso crear_usuario
CREATE POLICY "Users can create profiles based on permissions" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Permitir si es el primer usuario (configuración inicial)
  NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) OR
  -- O si tiene permiso para crear usuarios
  public.user_has_role_permission('crear_usuario'::permission_enum)
);

-- Política especial para permitir la creación del primer usuario sin autenticación
CREATE POLICY "Allow first user creation during initial setup" 
ON public.profiles 
FOR INSERT 
TO anon
WITH CHECK (
  NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1)
);

-- Política para UPDATE (editar_usuario) - Solo su propio perfil o con permiso editar_usuario
CREATE POLICY "Users can update profiles based on permissions" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (
  id = auth.uid() OR 
  public.user_has_role_permission('editar_usuario'::permission_enum)
)
WITH CHECK (
  id = auth.uid() OR 
  public.user_has_role_permission('editar_usuario'::permission_enum)
);

-- Política para DELETE (eliminar_usuario) - Solo con permiso eliminar_usuario
CREATE POLICY "Users can delete profiles based on permissions" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (
  public.user_has_role_permission('eliminar_usuario'::permission_enum)
);

-- Asegurar que RLS esté habilitado en la tabla profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
