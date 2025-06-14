import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  RotateCcw,
  SortAsc,
  SortDesc 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AdvancedFilters, useAdvancedFilters } from '@/hooks/useAdvancedFilters';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useReportes } from '@/hooks/useReportes';
import { SearchCombobox } from './SearchCombobox';

const priorityOptions = [
  { value: 'urgente', label: 'Urgente', color: '#DC2626' },
  { value: 'alto', label: 'Alto', color: '#EA580C' },
  { value: 'medio', label: 'Medio', color: '#D97706' },
  { value: 'bajo', label: 'Bajo', color: '#059669' },
];

interface AdvancedFiltersPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onMultipleReportSelection?: (reportTitles: string[]) => void;
  selectedReportIds?: string[];
}

export const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({
  isOpen,
  onToggle,
  onFiltersChange,
  onMultipleReportSelection,
  selectedReportIds = [],
}) => {
  const { filters, updateFilter, resetFilters, hasActiveFilters } = useAdvancedFilters();
  const { data: stats } = useDashboardStats();
  const { reportes } = useReportes();

  React.useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handlePriorityToggle = (priority: string) => {
    const newPriorities = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority];
    updateFilter('priority', newPriorities);
  };

  const handleEstadoToggle = (estado: string) => {
    const newEstados = filters.estados.includes(estado)
      ? filters.estados.filter(e => e !== estado)
      : [...filters.estados, estado];
    updateFilter('estados', newEstados);
  };

  const handleCategoriaToggle = (categoria: string) => {
    const newCategorias = filters.categorias.includes(categoria)
      ? filters.categorias.filter(c => c !== categoria)
      : [...filters.categorias, categoria];
    updateFilter('categorias', newCategorias);
  };

  // Transform reportes data for the SearchCombobox
  const reportesForSearch = reportes?.map(reporte => ({
    id: reporte.id,
    titulo: reporte.nombre,
    descripcion: reporte.descripcion || '',
    estado: reporte.estado?.nombre || 'Sin estado',
    categoria: reporte.categoria?.nombre || 'Sin categoría',
    prioridad: reporte.priority || 'medio'
  })) || [];

  if (!isOpen) {
    return (
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros Avanzados
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {filters.priority.length + filters.estados.length + filters.categorias.length}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Limpiar
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avanzados
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Limpiar
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Búsqueda con lista desplegable */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Búsqueda de Reportes</label>
          <SearchCombobox
            reportes={reportesForSearch}
            value={filters.searchTerm}
            onValueChange={(value) => {
              updateFilter('searchTerm', value);
              if (onMultipleReportSelection) {
                onMultipleReportSelection(value);
              }
            }}
            placeholder="Buscar reportes..."
          />
          {filters.searchTerm.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {filters.searchTerm.length} reporte(s) seleccionado(s)
            </p>
          )}
        </div>

        {/* Rango de fechas */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Rango de Fechas</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange ? (
                  `${format(filters.dateRange.from, 'dd/MM/yyyy', { locale: es })} - ${format(filters.dateRange.to, 'dd/MM/yyyy', { locale: es })}`
                ) : (
                  'Seleccionar rango de fechas'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={filters.dateRange ? {
                  from: filters.dateRange.from,
                  to: filters.dateRange.to
                } : undefined}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    updateFilter('dateRange', { from: range.from, to: range.to });
                  } else if (!range) {
                    updateFilter('dateRange', null);
                  }
                }}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Separator />

        {/* Prioridad */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Prioridad</label>
          <div className="grid grid-cols-2 gap-2">
            {priorityOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${option.value}`}
                  checked={filters.priority.includes(option.value)}
                  onCheckedChange={() => handlePriorityToggle(option.value)}
                />
                <label
                  htmlFor={`priority-${option.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Estados */}
        {stats && stats.reportes.porEstado.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Estados</label>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
              {stats.reportes.porEstado.map((estado) => (
                <div key={estado.estado} className="flex items-center space-x-2">
                  <Checkbox
                    id={`estado-${estado.estado}`}
                    checked={filters.estados.includes(estado.estado)}
                    onCheckedChange={() => handleEstadoToggle(estado.estado)}
                  />
                  <label
                    htmlFor={`estado-${estado.estado}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: estado.color }}
                    />
                    {estado.estado} ({estado.count})
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Categorías */}
        {stats && stats.reportes.porCategoria.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Categorías</label>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
              {stats.reportes.porCategoria.map((categoria) => (
                <div key={categoria.categoria} className="flex items-center space-x-2">
                  <Checkbox
                    id={`categoria-${categoria.categoria}`}
                    checked={filters.categorias.includes(categoria.categoria)}
                    onCheckedChange={() => handleCategoriaToggle(categoria.categoria)}
                  />
                  <label
                    htmlFor={`categoria-${categoria.categoria}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoria.color }}
                    />
                    {categoria.categoria} ({categoria.count})
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Ordenamiento */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ordenar por</label>
            <Select
              value={filters.sortBy}
              onValueChange={(value: any) => updateFilter('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Fecha de creación</SelectItem>
                <SelectItem value="priority">Prioridad</SelectItem>
                <SelectItem value="estado">Estado</SelectItem>
                <SelectItem value="categoria">Categoría</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Orden</label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value: any) => updateFilter('sortOrder', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">
                  <div className="flex items-center gap-2">
                    <SortDesc className="h-4 w-4" />
                    Descendente
                  </div>
                </SelectItem>
                <SelectItem value="asc">
                  <div className="flex items-center gap-2">
                    <SortAsc className="h-4 w-4" />
                    Ascendente
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
