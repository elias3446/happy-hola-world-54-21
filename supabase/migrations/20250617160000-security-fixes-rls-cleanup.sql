

-- Security Fix: Comprehensive RLS Policy Cleanup and Hardening
-- This migration removes conflicting policies and implements secure, permission-based access

-- =============================================================================
-- 1. CLEAN UP CONFLICTING POLICIES
-- =============================================================================

-- Remove all existing conflicting policies from reportes
DROP POLICY IF EXISTS "Users can view their own reportes" ON public.reportes;
DROP POLICY IF EXISTS "Users can create their own reportes" ON public.reportes;
DROP POLICY IF EXISTS "Users can update their own reportes" ON public.reportes;
DROP POLICY IF EXISTS "Users can delete their own reportes" ON public.reportes;
DROP POLICY IF EXISTS "Users can view reportes based on role permissions" ON public.reportes;
DROP POLICY IF EXISTS "Users can create reportes based on role permissions" ON public.reportes;
DROP POLICY IF EXISTS "Users can update reportes based on role permissions" ON public.reportes;
DROP POLICY IF EXISTS "Users can delete reportes based on role permissions" ON public.reportes;

-- Remove conflicting policies from categories
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can create their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can view categories based on role permissions" ON public.categories;
DROP POLICY IF EXISTS "Users can create categories based on role permissions" ON public.categories;
DROP POLICY IF EXISTS "Users can update categories based on role permissions" ON public.categories;
DROP POLICY IF EXISTS "Users can delete categories based on role permissions" ON public.categories;

-- Remove conflicting policies from estados
DROP POLICY IF EXISTS "Users can view their own estados" ON public.estados;
DROP POLICY IF EXISTS "Users can create their own estados" ON public.estados;
DROP POLICY IF EXISTS "Users can update their own estados" ON public.estados;
DROP POLICY IF EXISTS "Users can delete their own estados" ON public.estados;
DROP POLICY IF EXISTS "Users can view estados based on role permissions" ON public.estados;
DROP POLICY IF EXISTS "Users can create estados based on role permissions" ON public.estados;
DROP POLICY IF EXISTS "Users can update estados based on role permissions" ON public.estados;
DROP POLICY IF EXISTS "Users can delete estados based on role permissions" ON public.estados;

-- Remove conflicting policies from roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.roles;
DROP POLICY IF EXISTS "Users can create their own roles" ON public.roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.roles;
DROP POLICY IF EXISTS "Users can view roles based on role permissions" ON public.roles;
DROP POLICY IF EXISTS "Users can create roles based on role permissions" ON public.roles;
DROP POLICY IF EXISTS "Users can update roles based on role permissions" ON public.roles;
DROP POLICY IF EXISTS "Users can delete roles based on role permissions" ON public.roles;

-- Remove conflicting policies from profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles based on permissions" ON public.profiles;
DROP POLICY IF EXISTS "Users can create profiles based on permissions" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles based on permissions" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete profiles based on permissions" ON public.profiles;
DROP POLICY IF EXISTS "Allow first user creation during initial setup" ON public.profiles;

-- =============================================================================
-- 2. IMPLEMENT SECURE, CONSISTENT RLS POLICIES
-- =============================================================================

-- REPORTES: Secure permission-based access
CREATE POLICY "reportes_select_policy" ON public.reportes
  FOR SELECT TO authenticated
  USING (public.user_has_role_permission('ver_reporte'::permission_enum));

CREATE POLICY "reportes_insert_policy" ON public.reportes
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_has_role_permission('crear_reporte'::permission_enum)
    AND auth.uid() = created_by
  );

CREATE POLICY "reportes_update_policy" ON public.reportes
  FOR UPDATE TO authenticated
  USING (public.user_has_role_permission('editar_reporte'::permission_enum))
  WITH CHECK (public.user_has_role_permission('editar_reporte'::permission_enum));

CREATE POLICY "reportes_delete_policy" ON public.reportes
  FOR DELETE TO authenticated
  USING (public.user_has_role_permission('eliminar_reporte'::permission_enum));

-- CATEGORIES: Secure permission-based access
CREATE POLICY "categories_select_policy" ON public.categories
  FOR SELECT TO authenticated
  USING (public.user_has_role_permission('ver_categoria'::permission_enum));

CREATE POLICY "categories_insert_policy" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_has_role_permission('crear_categoria'::permission_enum)
    AND auth.uid() = created_by
  );

CREATE POLICY "categories_update_policy" ON public.categories
  FOR UPDATE TO authenticated
  USING (public.user_has_role_permission('editar_categoria'::permission_enum))
  WITH CHECK (public.user_has_role_permission('editar_categoria'::permission_enum));

CREATE POLICY "categories_delete_policy" ON public.categories
  FOR DELETE TO authenticated
  USING (public.user_has_role_permission('eliminar_categoria'::permission_enum));

-- ESTADOS: Secure permission-based access
CREATE POLICY "estados_select_policy" ON public.estados
  FOR SELECT TO authenticated
  USING (public.user_has_role_permission('ver_estado'::permission_enum));

CREATE POLICY "estados_insert_policy" ON public.estados
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_has_role_permission('crear_estado'::permission_enum)
    AND auth.uid() = created_by
  );

CREATE POLICY "estados_update_policy" ON public.estados
  FOR UPDATE TO authenticated
  USING (public.user_has_role_permission('editar_estado'::permission_enum))
  WITH CHECK (public.user_has_role_permission('editar_estado'::permission_enum));

CREATE POLICY "estados_delete_policy" ON public.estados
  FOR DELETE TO authenticated
  USING (public.user_has_role_permission('eliminar_estado'::permission_enum));

-- ROLES: Secure permission-based access
CREATE POLICY "roles_select_policy" ON public.roles
  FOR SELECT TO authenticated
  USING (public.user_has_role_permission('ver_rol'::permission_enum));

CREATE POLICY "roles_insert_policy" ON public.roles
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_has_role_permission('crear_rol'::permission_enum)
    AND auth.uid() = created_by
  );

CREATE POLICY "roles_update_policy" ON public.roles
  FOR UPDATE TO authenticated
  USING (public.user_has_role_permission('editar_rol'::permission_enum))
  WITH CHECK (public.user_has_role_permission('editar_rol'::permission_enum));

CREATE POLICY "roles_delete_policy" ON public.roles
  FOR DELETE TO authenticated
  USING (public.user_has_role_permission('eliminar_rol'::permission_enum));

-- PROFILES: Secure access - users can view own profile or with permission
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR 
    public.user_has_role_permission('ver_usuario'::permission_enum)
  );

-- Special policy for initial setup (first user creation)
CREATE POLICY "profiles_first_user_creation" ON public.profiles
  FOR INSERT TO anon
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1)
  );

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_has_role_permission('crear_usuario'::permission_enum)
  );

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid() OR 
    public.user_has_role_permission('editar_usuario'::permission_enum)
  )
  WITH CHECK (
    id = auth.uid() OR 
    public.user_has_role_permission('editar_usuario'::permission_enum)
  );

CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.user_has_role_permission('eliminar_usuario'::permission_enum));

-- USER_ROLES: Secure permission-based access
CREATE POLICY "user_roles_select_policy" ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    public.user_has_role_permission('ver_usuario'::permission_enum)
  );

CREATE POLICY "user_roles_insert_policy" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_has_role_permission('editar_usuario'::permission_enum)
    AND auth.uid() = assigned_by
  );

CREATE POLICY "user_roles_update_policy" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.user_has_role_permission('editar_usuario'::permission_enum))
  WITH CHECK (public.user_has_role_permission('editar_usuario'::permission_enum));

CREATE POLICY "user_roles_delete_policy" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.user_has_role_permission('editar_usuario'::permission_enum));

-- REPORTE_HISTORIAL: Secure access for assignment history
CREATE POLICY "reporte_historial_select_policy" ON public.reporte_historial
  FOR SELECT TO authenticated
  USING (public.user_has_role_permission('ver_reporte'::permission_enum));

CREATE POLICY "reporte_historial_insert_policy" ON public.reporte_historial
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_has_role_permission('editar_reporte'::permission_enum)
    AND auth.uid() = assigned_by
  );

-- ACTIVIDADES: Users can only see their own activities or with admin permission
CREATE POLICY "actividades_select_policy" ON public.actividades
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    public.user_has_role_permission('ver_usuario'::permission_enum)
  );

CREATE POLICY "actividades_insert_policy" ON public.actividades
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- CAMBIOS_HISTORIAL: Users can only see their own changes or with admin permission
CREATE POLICY "cambios_historial_select_policy" ON public.cambios_historial
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    public.user_has_role_permission('ver_usuario'::permission_enum)
  );

CREATE POLICY "cambios_historial_insert_policy" ON public.cambios_historial
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 3. ENSURE RLS IS ENABLED ON ALL TABLES
-- =============================================================================

ALTER TABLE public.reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reporte_historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cambios_historial ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. SECURITY LOGGING AND MONITORING
-- =============================================================================

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_description TEXT,
  p_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.actividades (
    user_id,
    activity_type,
    descripcion,
    tabla_afectada,
    registro_id,
    metadatos
  ) VALUES (
    COALESCE(p_user_id, auth.uid()),
    'READ'::activity_type,
    format('SECURITY: %s - %s', p_event_type, p_description),
    'security_events',
    NULL,
    p_metadata || jsonb_build_object('security_event', true, 'event_type', p_event_type)
  ) RETURNING id INTO event_id;

  RETURN event_id;
END;
$$;

-- Create function to validate file uploads securely
CREATE OR REPLACE FUNCTION public.validate_file_upload(
  p_filename TEXT,
  p_file_size INTEGER,
  p_content_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log file upload attempt
  PERFORM public.log_security_event(
    'FILE_UPLOAD_ATTEMPT',
    format('File: %s,Size: %s, Type: %s', p_filename, p_file_size, p_content_type),
    auth.uid(),
    jsonb_build_object(
      'filename', p_filename,
      'file_size', p_file_size,
      'content_type', p_content_type
    )
  );

  -- Validate file size (max 10MB)
  IF p_file_size > 10485760 THEN
    PERFORM public.log_security_event(
      'FILE_UPLOAD_REJECTED',
      'File too large',
      auth.uid(),
      jsonb_build_object('reason', 'file_too_large', 'size', p_file_size)
    );
    RETURN FALSE;
  END IF;

  -- Validate file type (images only)
  IF p_content_type NOT LIKE 'image/%' THEN
    PERFORM public.log_security_event(
      'FILE_UPLOAD_REJECTED',
      'Invalid file type',
      auth.uid(),
      jsonb_build_object('reason', 'invalid_file_type', 'content_type', p_content_type)
    );
    RETURN FALSE;
  END IF;

  -- Validate filename (basic checks)
  IF p_filename ~ '[<>:"/\\|?*]' OR length(p_filename) > 255 THEN
    PERFORM public.log_security_event(
      'FILE_UPLOAD_REJECTED',
      'Invalid filename',
      auth.uid(),
      jsonb_build_object('reason', 'invalid_filename', 'filename', p_filename)
    );
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

