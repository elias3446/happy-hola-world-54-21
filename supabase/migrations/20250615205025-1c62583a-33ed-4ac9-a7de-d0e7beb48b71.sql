
-- Create or replace the trigger function to update the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for the reportes table if it doesn't exist
DROP TRIGGER IF EXISTS update_reportes_updated_at ON public.reportes;
CREATE TRIGGER update_reportes_updated_at
    BEFORE UPDATE ON public.reportes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
