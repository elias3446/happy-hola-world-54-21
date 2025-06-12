
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableToolbar, useDataTableFilters, type DataTableColumn } from '@/components/ui/data-table-toolbar';
import { BulkActionsBar } from '@/components/ui/bulk-actions-bar';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { BulkEstadoActionsDialog, type BulkEstadoActionType } from './dialogs/BulkEstadoActionsDialog';
import { useEstados } from '@/hooks/useEstados';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Estado } from '@/types/estados';
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Circle,
  Lock,
  Upload
} from 'lucide-react';

interface EstadosListProps {
  onCreateEstado: () => void;
  onEditEstado: (estado: Estado) => void;
  onViewEstado: (estado: Estado) => void;
  onBulkUpload: () => void;
}

// Define system estados that cannot be modified
const SYSTEM_ESTADOS = ['Sin estado'];

const isSystemEstado = (estadoName: string): boolean => {
  return SYSTEM_ESTADOS.includes(estadoName);
};

export const EstadosList = ({ onCreateEstado, onEditEstado, onViewEstado, onBulkUpload }: EstadosListProps) => {
  const { 
    estados, 
    isLoading, 
    deleteEstado, 
    toggleEstadoStatus, 
    isDeleting, 
    isToggling 
  } = useEstados();
  
  const isMobile = useIsMobile();
  const [filters, setFilters] = useDataTableFilters();
  const [estadoToDelete, setEstadoToDelete] = useState<Estado | null>(null);
  const [estadoToToggle, setEstadoToToggle] = useState<Estado | null>(null);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean;
    type: BulkEstadoActionType | null;
    estados: Estado[];
  }>({ open: false, type: null, estados: [] });

  // Filter out system estados for bulk selection
  const selectableEstados = filteredData.filter(estado => !isSystemEstado(estado.nombre));

  // Bulk selection hook with only selectable estados
  const {
    selectedItems,
    isAllSelected,
    isIndeterminate,
    handleSelectAll,
    handleSelectItem,
    clearSelection,
    getSelectedData,
    selectedCount,
  } = useBulkSelection(selectableEstados);

  const columns: DataTableColumn[] = [
    { key: 'nombre', label: 'Estado', searchable: true, sortable: true, filterable: true },
    { key: 'descripcion', label: 'Descripción', searchable: true, sortable: true, filterable: true },
    { key: 'activo_display', label: 'Estado', type: 'text', searchable: false, sortable: true, filterable: true },
    { key: 'created_at_display', label: 'Fecha de Creación', type: 'date', searchable: false, sortable: true, filterable: true },
  ];

  const sensitiveProperties = ['activo_display'];

  const transformedEstados = estados.map(estado => ({
    ...estado,
    activo_display: estado.activo ? 'Activo' : 'Inactivo',
    created_at_display: new Date(estado.created_at).toLocaleDateString('es-ES'),
  }));

  useEffect(() => {
    setFilteredData(transformedEstados);
  }, [estados]);

  const handleDeleteEstado = () => {
    if (estadoToDelete && !isSystemEstado(estadoToDelete.nombre)) {
      deleteEstado(estadoToDelete.id);
      setEstadoToDelete(null);
    }
  };

  const handleToggleStatus = (estado: Estado) => {
    if (isSystemEstado(estado.nombre)) return;
    setEstadoToToggle(estado);
  };

  const confirmToggleStatus = () => {
    if (estadoToToggle && !isSystemEstado(estadoToToggle.nombre)) {
      toggleEstadoStatus({ id: estadoToToggle.id, activo: !estadoToToggle.activo });
      setEstadoToToggle(null);
    }
  };

  const handleEditEstadoClick = (estado: Estado) => {
    if (isSystemEstado(estado.nombre)) return;
    onEditEstado(estado);
  };

  const handleDeleteClick = (estado: Estado) => {
    if (isSystemEstado(estado.nombre)) return;
    setEstadoToDelete(estado);
  };

  // Bulk actions
  const handleBulkDelete = () => {
    const selectedData = getSelectedData();
    setBulkActionDialog({
      open: true,
      type: 'delete',
      estados: selectedData
    });
  };

  const handleBulkToggleStatus = () => {
    const selectedData = getSelectedData();
    setBulkActionDialog({
      open: true,
      type: 'toggle_status',
      estados: selectedData
    });
  };

  const handleBulkActionConfirm = (data: any) => {
    const { type, estados: estadosToProcess } = bulkActionDialog;
    
    if (type === 'delete') {
      estadosToProcess.forEach(estado => deleteEstado(estado.id));
    } else if (type === 'toggle_status') {
      estadosToProcess.forEach(estado => {
        toggleEstadoStatus({ id: estado.id, activo: !estado.activo });
      });
    }
    
    clearSelection();
    setBulkActionDialog({ open: false, type: null, estados: [] });
  };

  const handleRemoveEstadoFromBulkAction = (estadoId: string) => {
    setBulkActionDialog(prev => ({
      ...prev,
      estados: prev.estados.filter(estado => estado.id !== estadoId)
    }));
    
    // Remove from selection in the main table
    handleSelectItem(estadoId);
  };

  const handleBulkExport = () => {
    const selectedData = getSelectedData();
    handleExport(selectedData);
  };

  const handleExport = (filteredData: any[]) => {
    const exportData = filteredData.map(estado => ({
      Estado: estado.nombre,
      Descripción: estado.descripcion,
      Activo: estado.activo_display,
      'Fecha de Creación': estado.created_at_display,
    }));
    
    const csvContent = generateCSV(exportData);
    downloadCSV(csvContent, 'estados');
  };

  const generateCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item =>
      Object.values(item).map(value => {
        const stringValue = String(value || '');
        return `"${stringValue.replace(/"/g, '""')}"`;
      }).join(',')
    );
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Circle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Cargando estados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Circle className="h-5 w-5" />
                Gestión de Estados
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Administra los estados del sistema
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={onBulkUpload} variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                <Upload className="h-4 w-4" />
                <span className="sm:inline">Carga Masiva</span>
              </Button>
              <Button onClick={onCreateEstado} className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                <span className="sm:inline">Crear Estado</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <DataTableToolbar
            data={transformedEstados}
            columns={columns}
            sensitiveProperties={sensitiveProperties}
            filters={filters}
            onFiltersChange={setFilters}
            onExport={handleExport}
            exportFileName="estados"
            searchPlaceholder="Buscar estados por nombre, descripción..."
            className="mb-4"
            onDataFilter={setFilteredData}
          />

          {/* Bulk Actions Bar */}
          <BulkActionsBar
            selectedCount={selectedCount}
            onClearSelection={clearSelection}
            onBulkDelete={handleBulkDelete}
            onBulkToggleStatus={handleBulkToggleStatus}
            onBulkExport={handleBulkExport}
            isDeleting={isDeleting}
            isToggling={isToggling}
          />

          {estados.length === 0 ? (
            <div className="text-center py-12">
              <Circle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron estados</h3>
              <p className="text-gray-500 mb-4">
                Comienza creando tu primer estado del sistema.
              </p>
              <Button onClick={onCreateEstado}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Estado
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        ref={(el) => {
                          if (el && 'indeterminate' in el) {
                            (el as any).indeterminate = isIndeterminate;
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden lg:table-cell">Descripción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden xl:table-cell">Fecha de Creación</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((estado) => {
                    const isSystemEstadoItem = isSystemEstado(estado.nombre);
                    
                    return (
                      <TableRow key={estado.id}>
                        <TableCell>
                          {isSystemEstadoItem ? (
                            <Lock className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Checkbox
                              checked={selectedItems.has(estado.id)}
                              onCheckedChange={() => handleSelectItem(estado.id)}
                            />
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                              style={{ backgroundColor: estado.color }}
                            >
                              {estado.icono.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onViewEstado(estado)}
                                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                >
                                  {estado.nombre}
                                </button>
                                {isSystemEstadoItem && (
                                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                    <Lock className="h-3 w-3" />
                                    Sistema
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{estado.icono}</p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="hidden lg:table-cell">
                          <p className="max-w-xs truncate" title={estado.descripcion}>
                            {estado.descripcion}
                          </p>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={estado.activo}
                              onCheckedChange={() => handleToggleStatus(estado)}
                              disabled={isToggling || isSystemEstadoItem}
                            />
                            <Badge variant={estado.activo ? "default" : "secondary"}>
                              {estado.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                        </TableCell>
                        
                        <TableCell className="hidden xl:table-cell">
                          <p className="text-sm">
                            {new Date(estado.created_at).toLocaleDateString('es-ES')}
                          </p>
                        </TableCell>
                        
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleEditEstadoClick(estado)}
                                disabled={isSystemEstadoItem}
                              >
                                {isSystemEstadoItem ? (
                                  <Lock className="h-4 w-4 mr-2" />
                                ) : (
                                  <Edit className="h-4 w-4 mr-2" />
                                )}
                                {isSystemEstadoItem ? 'Protegido' : 'Editar'}
                              </DropdownMenuItem>
                              {!isSystemEstadoItem && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteClick(estado)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual delete confirmation dialog */}
      <ConfirmationDialog
        open={!!estadoToDelete}
        onOpenChange={(open) => !open && setEstadoToDelete(null)}
        title="¿Estás seguro?"
        description={`Esta acción eliminará el estado "${estadoToDelete?.nombre}" de forma permanente. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        onConfirm={handleDeleteEstado}
        isLoading={isDeleting}
        variant="destructive"
      />

      {/* Individual status change confirmation dialog */}
      <ConfirmationDialog
        open={!!estadoToToggle}
        onOpenChange={(open) => !open && setEstadoToToggle(null)}
        title="¿Estás seguro?"
        description={`Esta acción ${estadoToToggle?.activo ? 'desactivará' : 'activará'} el estado "${estadoToToggle?.nombre}".`}
        confirmText={estadoToToggle?.activo ? 'Desactivar' : 'Activar'}
        onConfirm={confirmToggleStatus}
        isLoading={isToggling}
      />

      {/* Bulk actions dialog */}
      <BulkEstadoActionsDialog
        open={bulkActionDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setBulkActionDialog({ open: false, type: null, estados: [] });
          }
        }}
        estados={bulkActionDialog.estados}
        actionType={bulkActionDialog.type || 'toggle_status'}
        onConfirm={handleBulkActionConfirm}
        onRemoveEstado={handleRemoveEstadoFromBulkAction}
        isLoading={isDeleting || isToggling}
      />
    </>
  );
};
