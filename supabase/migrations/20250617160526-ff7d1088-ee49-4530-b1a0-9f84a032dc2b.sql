

-- Create security logging function
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
  -- Use the provided user_id or get the current authenticated user
  IF p_user_id IS NULL THEN
    p_user_id := auth.uid();
  END IF;
  
  -- Log the security event as an activity
  event_id := public.registrar_actividad(
    'CREATE'::activity_type,
    p_description,
    'security_events',
    NULL,
    jsonb_build_object(
      'event_type', p_event_type,
      'metadata', p_metadata,
      'timestamp', now()
    )
  );

  RETURN event_id;
END;
$$;

-- Create file upload validation function
CREATE OR REPLACE FUNCTION public.validate_file_upload(
  p_filename TEXT,
  p_file_size BIGINT,
  p_content_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check file size (10MB limit)
  IF p_file_size > 10485760 THEN
    RETURN FALSE;
  END IF;
  
  -- Check allowed content types (images only)
  IF p_content_type NOT IN ('image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp') THEN
    RETURN FALSE;
  END IF;
  
  -- Check filename for suspicious patterns
  IF p_filename ~* '\.(exe|bat|cmd|scr|js|php|asp)$' THEN
    RETURN FALSE;
  END IF;
  
  -- Check for double extensions
  IF (SELECT array_length(string_to_array(p_filename, '.'), 1)) > 2 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

