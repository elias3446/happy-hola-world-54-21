
-- Comprehensive Security Fix: RLS Policy Cleanup and Hardening
-- Phase 1: Remove all conflicting policies and implement secure, consistent access control

-- =============================================================================
-- 1. CLEAN UP ALL CONFLICTING POLICIES
-- =============================================================================

-- Remove all existing policies from all tables to start fresh
DROP POLICY IF EXISTS "Users can view their own reportes" ON public.reportes;
DROP POLICY IF EXISTS "Users can create their own reportes" ON public.reportes;
DROP POLICY IF EXISTS "Users can update their own reportes" ON public.reportes;
DROP POLICY IF EXISTS "Users can delete their own reportes" ON public.reportes;
DROP POLICY IF EXISTS "Users can view reportes based on role permissions" ON public.reportes;
DROP POLICY IF EXISTS "Users can create reportes based on role permissions" ON public.reportes;
DROP POLICY IF EXISTS "Users can update reportes based on role permissions" ON public.reportes;
DROP POLICY IF EXISTS "Users can delete reportes based on role permissions" ON public.reportes;
DROP POLICY IF EXISTS "reportes_select_policy" ON public.reportes;
DROP POLICY IF EXISTS "reportes_insert_policy" ON public.reportes;
DROP POLICY IF EXISTS "reportes_update_policy" ON public.reportes;
DROP POLICY IF EXISTS "reportes_delete_policy" ON public.reportes;

DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can create their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can view categories based on role permissions" ON public.categories;
DROP POLICY IF EXISTS "Users can create categories based on role permissions" ON public.categories;
DROP POLICY IF EXISTS "Users can update categories based on role permissions" ON public.categories;
DROP POLICY IF EXISTS "Users can delete categories based on role permissions" ON public.categories;
DROP POLICY IF EXISTS "categories_select_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_update_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_policy" ON public.categories;

DROP POLICY IF EXISTS "Users can view their own estados" ON public.estados;
DROP POLICY IF EXISTS "Users can create their own estados" ON public.estados;
DROP POLICY IF EXISTS "Users can update their own estados" ON public.estados;
DROP POLICY IF EXISTS "Users can delete their own estados" ON public.estados;
DROP POLICY IF EXISTS "Users can view estados based on role permissions" ON public.estados;
DROP POLICY IF EXISTS "Users can create estados based on role permissions" ON public.estados;
DROP POLICY IF EXISTS "Users can update estados based on role permissions" ON public.estados;
DROP POLICY IF EXISTS "Users can delete estados based on role permissions" ON public.estados;
DROP POLICY IF EXISTS "estados_select_policy" ON public.estados;
DROP POLICY IF EXISTS "estados_insert_policy" ON public.estados;
DROP POLICY IF EXISTS "estados_update_policy" ON public.estados;
DROP POLICY IF EXISTS "estados_delete_policy" ON public.estados;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.roles;
DROP POLICY IF EXISTS "Users can create their own roles" ON public.roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.roles;
DROP POLICY IF EXISTS "Users can view roles based on role permissions" ON public.roles;
DROP POLICY IF EXISTS "Users can create roles based on role permissions" ON public.roles;
DROP POLICY IF EXISTS "Users can update roles based on role permissions" ON public.roles;
DROP POLICY IF EXISTS "Users can delete roles based on role permissions" ON public.roles;
DROP POLICY IF EXISTS "roles_select_policy" ON public.roles;
DROP POLICY IF EXISTS "roles_insert_policy" ON public.roles;
DROP POLICY IF EXISTS "roles_update_policy" ON public.roles;
DROP POLICY IF EXISTS "roles_delete_policy" ON public.roles;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles based on permissions" ON public.profiles;
DROP POLICY IF EXISTS "Users can create profiles based on permissions" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles based on permissions" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete profiles based on permissions" ON public.profiles;
DROP POLICY IF EXISTS "Allow first user creation during initial setup" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_first_user_creation" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_policy" ON public.user_roles;

DROP POLICY IF EXISTS "reporte_historial_select_policy" ON public.reporte_historial;
DROP POLICY IF EXISTS "reporte_historial_insert_policy" ON public.reporte_historial;

DROP POLICY IF EXISTS "actividades_select_policy" ON public.actividades;
DROP POLICY IF EXISTS "actividades_insert_policy" ON public.actividades;

DROP POLICY IF EXISTS "cambios_historial_select_policy" ON public.cambios_historial;
DROP POLICY IF EXISTS "cambios_historial_insert_policy" ON public.cambios_historial;

-- =============================================================================
-- 2. IMPLEMENT SECURE, PERMISSION-BASED RLS POLICIES
-- =============================================================================

-- REPORTES: Secure permission-based access with ownership checks
CREATE POLICY "secure_reportes_select" ON public.reportes
  FOR SELECT TO authenticated
  USING (public.user_has_role_permission('ver_reporte'::permission_enum));

CREATE POLICY "secure_reportes_insert" ON public.reportes
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_has_role_permission('crear_reporte'::permission_enum)
    AND auth.uid() = created_by
  );

CREATE POLICY "secure_reportes_update" ON public.reportes
  FOR UPDATE TO authenticated
  USING (public.user_has_role_permission('editar_reporte'::permission_enum))
  WITH CHECK (public.user_has_role_permission('editar_reporte'::permission_enum));

CREATE POLICY "secure_reportes_delete" ON public.reportes
  FOR DELETE TO authenticated
  USING (public.user_has_role_permission('eliminar_reporte'::permission_enum));

-- CATEGORIES: Secure permission-based access with ownership checks
CREATE POLICY "secure_categories_select" ON public.categories
  FOR SELECT TO authenticated
  USING (public.user_has_role_permission('ver_categoria'::permission_enum));

CREATE POLICY "secure_categories_insert" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_has_role_permission('crear_categoria'::permission_enum)
    AND auth.uid() = created_by
  );

CREATE POLICY "secure_categories_update" ON public.categories
  FOR UPDATE TO authenticated
  USING (public.user_has_role_permission('editar_categoria'::permission_enum))
  WITH CHECK (public.user_has_role_permission('editar_categoria'::permission_enum));

CREATE POLICY "secure_categories_delete" ON public.categories
  FOR DELETE TO authenticated
  USING (public.user_has_role_permission('eliminar_categoria'::permission_enum));

-- ESTADOS: Secure permission-based access with ownership checks
CREATE POLICY "secure_estados_select" ON public.estados
  FOR SELECT TO authenticated
  USING (public.user_has_role_permission('ver_estado'::permission_enum));

CREATE POLICY "secure_estados_insert" ON public.estados
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_has_role_permission('crear_estado'::permission_enum)
    AND auth.uid() = created_by
  );

CREATE POLICY "secure_estados_update" ON public.estados
  FOR UPDATE TO authenticated
  USING (public.user_has_role_permission('editar_estado'::permission_enum))
  WITH CHECK (public.user_has_role_permission('editar_estado'::permission_enum));

CREATE POLICY "secure_estados_delete" ON public.estados
  FOR DELETE TO authenticated
  USING (public.user_has_role_permission('eliminar_estado'::permission_enum));

-- ROLES: Secure permission-based access with ownership checks
CREATE POLICY "secure_roles_select" ON public.roles
  FOR SELECT TO authenticated
  USING (public.user_has_role_permission('ver_rol'::permission_enum));

CREATE POLICY "secure_roles_insert" ON public.roles
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_has_role_permission('crear_rol'::permission_enum)
    AND auth.uid() = created_by
  );

CREATE POLICY "secure_roles_update" ON public.roles
  FOR UPDATE TO authenticated
  USING (public.user_has_role_permission('editar_rol'::permission_enum))
  WITH CHECK (public.user_has_role_permission('editar_rol'::permission_enum));

CREATE POLICY "secure_roles_delete" ON public.roles
  FOR DELETE TO authenticated
  USING (public.user_has_role_permission('eliminar_rol'::permission_enum));

-- PROFILES: Secure access - users can view own profile or with admin permission
CREATE POLICY "secure_profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR 
    public.user_has_role_permission('ver_usuario'::permission_enum)
  );

-- Special policy for initial setup (first user creation) - allows anonymous users to create first profile
CREATE POLICY "secure_profiles_initial_setup" ON public.profiles
  FOR INSERT TO anon
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM public.profiles WHERE deleted_at IS NULL LIMIT 1)
  );

-- Regular profile creation for authenticated users with permission
CREATE POLICY "secure_profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_has_role_permission('crear_usuario'::permission_enum)
  );

-- Profile updates - own profile or with admin permission
CREATE POLICY "secure_profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid() OR 
    public.user_has_role_permission('editar_usuario'::permission_enum)
  )
  WITH CHECK (
    id = auth.uid() OR 
    public.user_has_role_permission('editar_usuario'::permission_enum)
  );

-- Profile deletion - only with admin permission
CREATE POLICY "secure_profiles_delete" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.user_has_role_permission('eliminar_usuario'::permission_enum));

-- USER_ROLES: Secure permission-based access
CREATE POLICY "secure_user_roles_select" ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    public.user_has_role_permission('ver_usuario'::permission_enum)
  );

CREATE POLICY "secure_user_roles_insert" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_has_role_permission('editar_usuario'::permission_enum)
    AND auth.uid() = assigned_by
  );

CREATE POLICY "secure_user_roles_update" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.user_has_role_permission('editar_usuario'::permission_enum))
  WITH CHECK (public.user_has_role_permission('editar_usuario'::permission_enum));

CREATE POLICY "secure_user_roles_delete" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.user_has_role_permission('editar_usuario'::permission_enum));

-- REPORTE_HISTORIAL: Secure access for assignment history
CREATE POLICY "secure_reporte_historial_select" ON public.reporte_historial
  FOR SELECT TO authenticated
  USING (public.user_has_role_permission('ver_reporte'::permission_enum));

CREATE POLICY "secure_reporte_historial_insert" ON public.reporte_historial
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_has_role_permission('editar_reporte'::permission_enum)
    AND auth.uid() = assigned_by
  );

-- ACTIVIDADES: Users can see own activities or with admin permission
CREATE POLICY "secure_actividades_select" ON public.actividades
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    public.user_has_role_permission('ver_usuario'::permission_enum)
  );

CREATE POLICY "secure_actividades_insert" ON public.actividades
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- CAMBIOS_HISTORIAL: Users can see own changes or with admin permission
CREATE POLICY "secure_cambios_historial_select" ON public.cambios_historial
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    public.user_has_role_permission('ver_usuario'::permission_enum)
  );

CREATE POLICY "secure_cambios_historial_insert" ON public.cambios_historial
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

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
-- 4. ENHANCED SECURITY FUNCTIONS
-- =============================================================================

-- Enhanced security event logging function
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
    p_metadata || jsonb_build_object(
      'security_event', true, 
      'event_type', p_event_type,
      'timestamp', now(),
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    )
  ) RETURNING id INTO event_id;

  RETURN event_id;
END;
$$;

-- Enhanced file upload validation with comprehensive security checks
CREATE OR REPLACE FUNCTION public.validate_file_upload(
  p_filename TEXT,
  p_file_size INTEGER,
  p_content_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log file upload attempt with enhanced metadata
  PERFORM public.log_security_event(
    'FILE_UPLOAD_ATTEMPT',
    format('File upload validation: %s', p_filename),
    auth.uid(),
    jsonb_build_object(
      'filename', p_filename,
      'file_size', p_file_size,
      'content_type', p_content_type,
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    )
  );

  -- Enhanced file size validation (max 10MB)
  IF p_file_size > 10485760 THEN
    PERFORM public.log_security_event(
      'FILE_UPLOAD_REJECTED',
      'File size exceeds limit',
      auth.uid(),
      jsonb_build_object('reason', 'file_too_large', 'size', p_file_size, 'limit', 10485760)
    );
    RETURN FALSE;
  END IF;

  -- Enhanced content type validation
  IF p_content_type NOT SIMILAR TO 'image/(jpeg|jpg|png|gif|webp)' THEN
    PERFORM public.log_security_event(
      'FILE_UPLOAD_REJECTED',
      'Invalid or potentially dangerous file type',
      auth.uid(),
      jsonb_build_object('reason', 'invalid_content_type', 'content_type', p_content_type)
    );
    RETURN FALSE;
  END IF;

  -- Enhanced filename security validation
  IF p_filename ~ '[<>:"/\\|?*\x00-\x1f]' 
     OR p_filename ~* '\.(exe|bat|cmd|scr|js|php|asp|jsp|py|rb|pl|sh|vbs)(\.|$)'
     OR length(p_filename) > 255 
     OR p_filename ~ '\.\.'
     OR p_filename ~ '^\.+$' THEN
    PERFORM public.log_security_event(
      'FILE_UPLOAD_REJECTED',
      'Filename contains suspicious patterns',
      auth.uid(),
      jsonb_build_object('reason', 'suspicious_filename', 'filename', p_filename)
    );
    RETURN FALSE;
  END IF;

  -- Log successful validation
  PERFORM public.log_security_event(
    'FILE_UPLOAD_VALIDATED',
    'File passed security validation',
    auth.uid(),
    jsonb_build_object('filename', p_filename, 'content_type', p_content_type)
  );

  RETURN TRUE;
END;
$$;

-- Function to check if system has any users (for initial setup)
CREATE OR REPLACE FUNCTION public.system_has_users()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE deleted_at IS NULL 
    LIMIT 1
  );
$$;

-- Enhanced audit logging trigger for all table changes
CREATE OR REPLACE FUNCTION public.enhanced_audit_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  old_data JSONB;
  new_data JSONB;
  activity_type_val activity_type;
BEGIN
  current_user_id := auth.uid();
  
  -- Skip audit for anonymous operations during initial setup
  IF current_user_id IS NULL AND TG_TABLE_NAME = 'profiles' THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;
  
  -- Skip if no authenticated user for other operations
  IF current_user_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Prepare data based on operation
  CASE TG_OP
    WHEN 'INSERT' THEN
      new_data := to_jsonb(NEW);
      old_data := NULL;
      activity_type_val := 'CREATE';
    WHEN 'UPDATE' THEN
      new_data := to_jsonb(NEW);
      old_data := to_jsonb(OLD);
      activity_type_val := 'UPDATE';
    WHEN 'DELETE' THEN
      new_data := NULL;
      old_data := to_jsonb(OLD);
      activity_type_val := 'DELETE';
  END CASE;

  -- Log the security-enhanced audit trail
  PERFORM public.log_security_event(
    format('DATA_%s', TG_OP),
    format('%s operation on %s', TG_OP, TG_TABLE_NAME),
    current_user_id,
    jsonb_build_object(
      'table_name', TG_TABLE_NAME,
      'operation', TG_OP,
      'old_data', old_data,
      'new_data', new_data,
      'record_id', CASE 
        WHEN TG_OP = 'DELETE' THEN old_data->>'id'
        ELSE new_data->>'id'
      END
    )
  );

  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;
