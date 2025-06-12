
-- Permitir que el campo asset pueda ser null para representar usuarios bloqueados
-- El campo ya permite null según el esquema, pero vamos a asegurar que esté bien configurado
ALTER TABLE public.profiles ALTER COLUMN asset DROP NOT NULL;

-- Comentario: 
-- asset = true: Usuario activo
-- asset = false: Usuario inactivo  
-- asset = null: Usuario bloqueado
