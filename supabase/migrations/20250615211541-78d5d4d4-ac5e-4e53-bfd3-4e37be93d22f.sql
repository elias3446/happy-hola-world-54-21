
-- Create the trigger for the estados table if it doesn't exist
DROP TRIGGER IF EXISTS update_estados_updated_at ON public.estados;
CREATE TRIGGER update_estados_updated_at
    BEFORE UPDATE ON public.estados
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
