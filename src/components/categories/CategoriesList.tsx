
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
import { useCategories } from '@/hooks/useCategories';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Category } from '@/types/categories';
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  FolderOpen,
  Lock,
  Upload
} from 'lucide-react';
import { BulkCategoryActionsDialog, type BulkCategoryActionType } from './dialogs/BulkCategoryActionsDialog';

interface CategoriesListProps {
  onCreateCategory: () => void;
  onEditCategory: (category: Category) => void;
  onViewCategory: (category: Category) => void;
  onBulkUpload: () => void;
}

// Define system categories that cannot be modified
const SYSTEM_CATEGORIES = ['Sin categoría'];

const isSystemCategory = (categoryName: string): boolean => {
  return SYSTEM_CATEGORIES.includes(categoryName);
};

export const CategoriesList = ({ onCreateCategory, onEditCategory, onViewCategory, onBulkUpload }: CategoriesListProps) => {
  const { 
    categories, 
    isLoading, 
    deleteCategory, 
    toggleCategoryStatus, 
    isDeleting, 
    isToggling 
  } = useCategories();
  
  const isMobile = useIsMobile();
  const [filters, setFilters] = useDataTableFilters();
  const [filteredData, setFilteredData] = useState<any[]>([]);
  
  // Estados para diálogos de confirmación
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null as Category | null });
  const [statusDialog, setStatusDialog] = useState({ open: false, category: null as Category | null });
  
  // Estados para diálogos de acción masiva
  const [bulkActionDialog, setBulkActionDialog] = useState({
    open: false,
    actionType: 'delete' as BulkCategoryActionType,
    categories: [] as Category[]
  });

  // Filter non-system categories for bulk selection
  const nonSystemCategories = filteredData.filter(category => !isSystemCategory(category.nombre));

  // Bulk selection hook - only for non-system categories
  const {
    selectedItems,
    isAllSelected,
    isIndeterminate,
    handleSelectAll,
    handleSelectItem,
    clearSelection,
    getSelectedData,
    selectedCount,
  } = useBulkSelection(nonSystemCategories);

  // Define columns for the table
  const columns: DataTableColumn[] = [
    { key: 'nombre', label: 'Categoría', searchable: true, sortable: true, filterable: true },
    { key: 'descripcion', label: 'Descripción', searchable: true, sortable: true, filterable: true },
    { key: 'activo_display', label: 'Estado', type: 'text', searchable: false, sortable: true, filterable: true },
    { key: 'created_at_display', label: 'Fecha de Creación', type: 'date', searchable: false, sortable: true, filterable: true },
  ];

  // Sensitive properties for special filters
  const sensitiveProperties = ['activo_display'];

  // Transform categories data for the table with consistent field names
  const transformedCategories = categories.map(category => ({
    ...category,
    activo_display: category.activo ? 'Activo' : 'Inactivo',
    created_at_display: new Date(category.created_at).toLocaleDateString('es-ES'),
  }));

  // Initialize filtered data when categories change
  useEffect(() => {
    setFilteredData(transformedCategories);
  }, [categories]);

  // Handlers para acciones individuales
  const handleDeleteClick = (category: Category) => {
    if (isSystemCategory(category.nombre)) {
      return; // No allow delete for system categories
    }
    setDeleteDialog({ open: true, category });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.category && !isSystemCategory(deleteDialog.category.nombre)) {
      deleteCategory(deleteDialog.category.id);
      setDeleteDialog({ open: false, category: null });
    }
  };

  const handleStatusClick = (category: Category) => {
    if (isSystemCategory(category.nombre)) {
      return; // No allow status change for system categories
    }
    setStatusDialog({ open: true, category });
  };

  const handleStatusConfirm = () => {
    if (statusDialog.category && !isSystemCategory(statusDialog.category.nombre)) {
      toggleCategoryStatus({ id: statusDialog.category.id, activo: !statusDialog.category.activo });
      setStatusDialog({ open: false, category: null });
    }
  };

  const handleEditCategory = (category: Category) => {
    if (isSystemCategory(category.nombre)) {
      return; // No allow edit for system categories
    }
    onEditCategory(category);
  };

  // Handle removing a category from bulk selection
  const handleRemoveFromBulkAction = (categoryId: string) => {
    handleSelectItem(categoryId); // This will deselect the item
    // Update the dialog state to remove the category from the list
    setBulkActionDialog(prev => ({
      ...prev,
      categories: prev.categories.filter(category => category.id !== categoryId)
    }));
  };

  // Handlers para acciones masivas
  const handleBulkDelete = () => {
    const selectedData = getSelectedData();
    setBulkActionDialog({
      open: true,
      actionType: 'delete',
      categories: selectedData
    });
  };

  const handleBulkToggleStatus = () => {
    const selectedData = getSelectedData();
    setBulkActionDialog({
      open: true,
      actionType: 'toggle_status',
      categories: selectedData
    });
  };

  const confirmBulkAction = (data: any) => {
    const { categories } = bulkActionDialog;
    
    switch (bulkActionDialog.actionType) {
      case 'delete':
        categories.forEach(category => deleteCategory(category.id));
        break;
      case 'toggle_status':
        categories.forEach(category => {
          toggleCategoryStatus({ id: category.id, activo: !category.activo });
        });
        break;
    }
    
    clearSelection();
    setBulkActionDialog({ open: false, actionType: 'delete', categories: [] });
  };

  const handleBulkExport = () => {
    const selectedData = getSelectedData();
    handleExport(selectedData);
  };

  const handleExport = (filteredData: any[]) => {
    // Transform data for export
    const exportData = filteredData.map(category => ({
      Categoría: category.nombre,
      Descripción: category.descripcion,
      Estado: category.activo_display,
      'Fecha de Creación': category.created_at_display,
    }));
    
    const csvContent = generateCSV(exportData);
    downloadCSV(csvContent, 'categorias');
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
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Cargando categorías...</p>
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
                <FolderOpen className="h-5 w-5" />
                Gestión de Categorías
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Administra las categorías del sistema
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={onBulkUpload} variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                <Upload className="h-4 w-4" />
                <span className="sm:inline">Carga Masiva</span>
              </Button>
              <Button onClick={onCreateCategory} className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                <span className="sm:inline">Crear Categoría</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Toolbar with filters and search */}
          <DataTableToolbar
            data={transformedCategories}
            columns={columns}
            sensitiveProperties={sensitiveProperties}
            filters={filters}
            onFiltersChange={setFilters}
            onExport={handleExport}
            exportFileName="categorias"
            searchPlaceholder="Buscar categorías por nombre, descripción..."
            className="mb-4"
            onDataFilter={setFilteredData}
          />

          {/* Bulk Actions Bar - only show if there are non-system categories selected */}
          <BulkActionsBar
            selectedCount={selectedCount}
            onClearSelection={clearSelection}
            onBulkDelete={handleBulkDelete}
            onBulkToggleStatus={handleBulkToggleStatus}
            onBulkExport={handleBulkExport}
            isDeleting={isDeleting}
            isToggling={isToggling}
            showStatusToggle={true}
          />

          {/* Categories content */}
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron categorías</h3>
              <p className="text-gray-500 mb-4">
                Comienza creando tu primera categoría del sistema.
              </p>
              <Button onClick={onCreateCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Categoría
              </Button>
            </div>
          ) : (
            <>
              {/* Table View - Both Desktop and Mobile */}
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
                      <TableHead>Categoría</TableHead>
                      <TableHead className="hidden lg:table-cell">Descripción</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="hidden xl:table-cell">Fecha de Creación</TableHead>
                      <TableHead className="w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((category) => {
                      const isSystemCategoryItem = isSystemCategory(category.nombre);
                      
                      return (
                        <TableRow key={category.id}>
                          <TableCell>
                            {isSystemCategoryItem ? (
                              <div title="Categoría del sistema protegida">
                                <Lock className="h-4 w-4 text-gray-400" />
                              </div>
                            ) : (
                              <Checkbox
                                checked={selectedItems.has(category.id)}
                                onCheckedChange={() => handleSelectItem(category.id)}
                              />
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                style={{ backgroundColor: category.color }}
                              >
                                {category.icono.charAt(0)}
                              </div>
                              <div>
                                <button
                                  onClick={() => onViewCategory(category)}
                                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                >
                                  {category.nombre}
                                  {isSystemCategoryItem && (
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      Sistema
                                    </Badge>
                                  )}
                                </button>
                                <p className="text-sm text-gray-500">{category.icono}</p>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="hidden lg:table-cell">
                            <p className="max-w-xs truncate" title={category.descripcion}>
                              {category.descripcion}
                            </p>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={category.activo}
                                onCheckedChange={() => handleStatusClick(category)}
                                disabled={isToggling || isSystemCategoryItem}
                              />
                              <Badge variant={category.activo ? "default" : "secondary"}>
                                {category.activo ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </div>
                          </TableCell>
                          
                          <TableCell className="hidden xl:table-cell">
                            <p className="text-sm">
                              {new Date(category.created_at).toLocaleDateString('es-ES')}
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
                                {!isSystemCategoryItem && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteClick(category)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {isSystemCategoryItem && (
                                  <DropdownMenuItem disabled>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Categoría protegida del sistema
                                  </DropdownMenuItem>
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para eliminación individual */}
      <ConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, category: null })}
        title="¿Estás seguro?"
        description={`Esta acción eliminará la categoría "${deleteDialog.category?.nombre}" de forma permanente. Los reportes con esta categoría perderán esta clasificación.`}
        confirmText="Eliminar"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        variant="destructive"
      />

      {/* Diálogo de confirmación para cambio de estado individual */}
      <ConfirmationDialog
        open={statusDialog.open}
        onOpenChange={(open) => setStatusDialog({ open, category: null })}
        title="Cambiar estado de la categoría"
        description={`¿Estás seguro de que quieres ${statusDialog.category?.activo ? 'desactivar' : 'activar'} la categoría "${statusDialog.category?.nombre}"?`}
        confirmText={statusDialog.category?.activo ? 'Desactivar' : 'Activar'}
        onConfirm={handleStatusConfirm}
        isLoading={isToggling}
      />

      {/* Diálogo de acción masiva */}
      <BulkCategoryActionsDialog
        open={bulkActionDialog.open}
        onOpenChange={(open) => setBulkActionDialog(prev => ({ ...prev, open }))}
        categories={bulkActionDialog.categories}
        actionType={bulkActionDialog.actionType}
        isLoading={isDeleting || isToggling}
        onConfirm={confirmBulkAction}
        onRemoveCategory={handleRemoveFromBulkAction}
      />
    </>
  );
};
