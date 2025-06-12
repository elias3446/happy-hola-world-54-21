
-- Actualizar la función para crear categoría y estado por defecto para el primer usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$DECLARE
  es_primer_usuario boolean;
  meta jsonb;
  user_type text;
  asset_value boolean;
  admin_role_id uuid;
  user_role_id uuid;
  default_category_id uuid;
  default_estado_id uuid;
BEGIN
  -- Log para debugging
  RAISE LOG 'Starting handle_new_user for user: %', NEW.id;
  
  -- Obtener los metadatos enviados desde el frontend
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  
  -- Verificar si es el primer usuario registrado
  SELECT COUNT(*) = 0 INTO es_primer_usuario FROM public.profiles;
  
  -- Verificar si debemos saltar la asignación automática de roles
  IF meta ? 'skip_auto_role' AND (meta->>'skip_auto_role')::boolean THEN
    RAISE LOG 'Skipping auto role assignment for user: %', NEW.id;
    
    -- Determinar el tipo de usuario
    IF meta ? 'user_type' THEN
      user_type := meta->>'user_type';
    ELSE
      -- Por defecto: primer usuario es admin y user, resto solo user
      user_type := CASE 
        WHEN es_primer_usuario THEN 'admin'
        ELSE 'user'
      END;
    END IF;

    -- Validar que el tipo sea admin o user
    IF user_type NOT IN ('admin', 'user') THEN
      user_type := 'user';
    END IF;
    
    -- Solo crear el perfil sin asignar roles automáticamente
    INSERT INTO public.profiles (
      id, 
      email, 
      first_name, 
      last_name, 
      role, 
      asset
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(meta->>'first_name', ''),
      COALESCE(meta->>'last_name', ''),
      CASE 
        WHEN es_primer_usuario THEN ARRAY['admin', 'user']
        ELSE ARRAY[user_type]
      END,
      COALESCE((meta->>'asset')::boolean, true)
    );
    
    RETURN NEW;
  END IF;
  
  -- Lógica para registro normal (sin skip_auto_role)
  -- Determinar el tipo de usuario
  IF meta ? 'user_type' THEN
    user_type := meta->>'user_type';
  ELSE
    -- Por defecto: primer usuario es admin y user, resto solo user
    user_type := CASE 
      WHEN es_primer_usuario THEN 'admin'
      ELSE 'user'
    END;
  END IF;

  -- Validar que el tipo sea admin o user
  IF user_type NOT IN ('admin', 'user') THEN
    user_type := 'user';
  END IF;

  -- Procesar el asset enviado desde el frontend, o asignar true si no está
  asset_value := COALESCE((meta->>'asset')::boolean, true);

  -- Insertar el nuevo perfil
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role, 
    asset
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(meta->>'first_name', ''),
    COALESCE(meta->>'last_name', ''),
    CASE 
      WHEN es_primer_usuario THEN ARRAY['admin', 'user']
      ELSE ARRAY[user_type]
    END,
    asset_value
  );

  -- Crear datos por defecto solo si es el primer usuario
  IF es_primer_usuario THEN
    -- Crear categoría por defecto "Sin categoría"
    INSERT INTO public.categories (
      nombre,
      descripcion,
      color,
      icono,
      activo,
      created_by
    )
    VALUES (
      'Sin categoría',
      'Categoría por defecto para reportes sin clasificar',
      '#6B7280',
      'Folder',
      true,
      NEW.id
    )
    RETURNING id INTO default_category_id;

    -- Crear estado por defecto "Sin estado"
    INSERT INTO public.estados (
      nombre,
      descripcion,
      color,
      icono,
      activo,
      created_by
    )
    VALUES (
      'Sin estado',
      'Estado por defecto para reportes nuevos',
      '#6B7280',
      'Circle',
      true,
      NEW.id
    )
    RETURNING id INTO default_estado_id;

    -- Buscar o crear rol de Administrador
    SELECT id INTO admin_role_id 
    FROM public.roles 
    WHERE nombre = 'Administrador' 
    AND deleted_at IS NULL 
    LIMIT 1;
    
    IF admin_role_id IS NULL THEN
      INSERT INTO public.roles (
        nombre,
        descripcion,
        permisos,
        activo,
        color,
        icono,
        created_by
      )
      VALUES (
        'Administrador',
        'Rol de administrador con todos los permisos del sistema',
        ARRAY[
          'ver_reporte'::permission_enum, 
          'crear_reporte'::permission_enum, 
          'editar_reporte'::permission_enum, 
          'eliminar_reporte'::permission_enum, 
          'ver_usuario'::permission_enum, 
          'crear_usuario'::permission_enum, 
          'editar_usuario'::permission_enum, 
          'eliminar_usuario'::permission_enum, 
          'ver_categoria'::permission_enum, 
          'crear_categoria'::permission_enum, 
          'editar_categoria'::permission_enum, 
          'eliminar_categoria'::permission_enum, 
          'ver_estado'::permission_enum, 
          'crear_estado'::permission_enum, 
          'editar_estado'::permission_enum, 
          'eliminar_estado'::permission_enum, 
          'ver_rol'::permission_enum, 
          'crear_rol'::permission_enum, 
          'editar_rol'::permission_enum, 
          'eliminar_rol'::permission_enum
        ],
        true,
        '#DC2626',
        'Shield',
        NEW.id
      )
      RETURNING id INTO admin_role_id;
    END IF;
    
    -- Buscar o crear rol de Usuario
    SELECT id INTO user_role_id 
    FROM public.roles 
    WHERE nombre = 'Usuario' 
    AND deleted_at IS NULL 
    LIMIT 1;
    
    IF user_role_id IS NULL THEN
      INSERT INTO public.roles (
        nombre,
        descripcion,
        permisos,
        activo,
        color,
        icono,
        created_by
      )
      VALUES (
        'Usuario',
        'Rol básico de usuario con permisos limitados',
        ARRAY['ver_reporte'::permission_enum, 'ver_usuario'::permission_enum],
        true,
        '#3B82F6',
        'User',
        NEW.id
      )
      RETURNING id INTO user_role_id;
    END IF;

    -- Asignar ambos roles al primer usuario
    IF admin_role_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role_id, assigned_by)
      VALUES (NEW.id, admin_role_id, NEW.id);
    END IF;
    
    IF user_role_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role_id, assigned_by)
      VALUES (NEW.id, user_role_id, NEW.id);
    END IF;

    RAISE LOG 'Created default category (%) and estado (%) for first user: %', default_category_id, default_estado_id, NEW.id;
  END IF;

  RAISE LOG 'Successfully created user profile for: %', NEW.id;
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user for user %: % %', NEW.id, SQLERRM, SQLSTATE;
    RAISE;
END;$function$
