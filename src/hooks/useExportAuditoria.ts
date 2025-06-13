
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Actividad, CambioHistorial } from '@/hooks/useAuditoria';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const useExportAuditoria = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    // Crear el contenido CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escapar comillas y envolver en comillas si contiene comas
          const stringValue = String(value).replace(/"/g, '""');
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        }).join(',')
      )
    ].join('\n');

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const exportActividades = async (actividades: Actividad[]) => {
    setIsExporting(true);
    
    try {
      const headers = [
        'Tipo',
        'Descripción',
        'Usuario',
        'Tabla Afectada',
        'ID Registro',
        'Fecha'
      ];

      const dataToExport = actividades.map(actividad => ({
        'Tipo': actividad.activity_type,
        'Descripción': actividad.descripcion,
        'Usuario': actividad.user_email,
        'Tabla Afectada': actividad.tabla_afectada || '',
        'ID Registro': actividad.registro_id || '',
        'Fecha': format(new Date(actividad.created_at), 'dd/MM/yyyy HH:mm', { locale: es })
      }));

      exportToCSV(dataToExport, 'actividades_auditoria', headers);
      
      toast({
        title: "Exportación exitosa",
        description: `Se exportaron ${actividades.length} actividades correctamente`
      });
    } catch (error) {
      console.error('Error exporting actividades:', error);
      toast({
        title: "Error en la exportación",
        description: "No se pudieron exportar las actividades",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportCambiosHistorial = async (cambios: CambioHistorial[]) => {
    setIsExporting(true);
    
    try {
      const headers = [
        'Operación',
        'Tabla',
        'ID Registro',
        'Descripción',
        'Campos Modificados',
        'Usuario',
        'Fecha'
      ];

      const dataToExport = cambios.map(cambio => ({
        'Operación': cambio.operation_type,
        'Tabla': cambio.tabla_nombre,
        'ID Registro': cambio.registro_id,
        'Descripción': cambio.descripcion_cambio,
        'Campos Modificados': (cambio.campos_modificados || []).join('; '),
        'Usuario': cambio.user_email,
        'Fecha': format(new Date(cambio.created_at), 'dd/MM/yyyy HH:mm', { locale: es })
      }));

      exportToCSV(dataToExport, 'cambios_historial_auditoria', headers);
      
      toast({
        title: "Exportación exitosa",
        description: `Se exportaron ${cambios.length} cambios del historial correctamente`
      });
    } catch (error) {
      console.error('Error exporting cambios historial:', error);
      toast({
        title: "Error en la exportación",
        description: "No se pudieron exportar los cambios del historial",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportActividades,
    exportCambiosHistorial,
    isExporting
  };
};
