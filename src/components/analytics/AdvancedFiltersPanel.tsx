import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  RotateCcw,
  Search,
  AlertTriangle,
  CheckCircle,
  Folder
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
  const { filters, updateFilter, resetFilters, hasActiveFilters, isValidForComparison } = useAdvancedFilters();
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
          Filtros de Comparación
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {filters.priority.length + filters.estados.length + filters.categorias.length + (filters.searchTerm.length > 0 ? 1 : 0) + (filters.dateRange ? 1 : 0)}
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
        {!isValidForComparison && hasActiveFilters && (
          <Badge variant="destructive" className="text-xs">
            Selecciona criterios válidos para comparar
          </Badge>
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
            Filtros de Comparación
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
        {!isValidForComparison && hasActiveFilters && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
            <p className="text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Para realizar comparaciones, selecciona al menos 2 reportes en Búsqueda, o selecciona criterios en las otras pestañas.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs 
          value={filters.activeTab} 
          onValueChange={(value) => updateFilter('activeTab', value as any)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 overflow-x-auto">
            <TabsTrigger value="busqueda" className="flex items-center gap-1 min-w-0 text-xs sm:text-sm">
              <Search className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Búsqueda</span>
            </TabsTrigger>
            <TabsTrigger value="fechas" className="flex items-center gap-1 min-w-0 text-xs sm:text-sm">
              <CalendarIcon className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Fechas</span>
            </TabsTrigger>
            <TabsTrigger value="prioridad" className="flex items-center gap-1 min-w-0 text-xs sm:text-sm">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Prioridad</span>
            </TabsTrigger>
            <TabsTrigger value="estados" className="flex items-center gap-1 min-w-0 text-xs sm:text-sm">
              <CheckCircle className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Estados</span>
            </TabsTrigger>
            <TabsTrigger value="categorias" className="flex items-center gap-1 min-w-0 text-xs sm:text-sm">
              <Folder className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Categorías</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="busqueda" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Selecciona Reportes para Comparar (mínimo 2)
              </label>
              <SearchCombobox
                reportes={reportesForSearch}
                value={filters.searchTerm}
                onValueChange={(value) => {
                  updateFilter('searchTerm', value);
                  if (onMultipleReportSelection) {
                    onMultipleReportSelection(value);
                  }
                }}
                placeholder="Buscar reportes para comparar..."
              />
              {filters.searchTerm.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={filters.searchTerm.length >= 2 ? "default" : "secondary"}>
                    {filters.searchTerm.length} reporte(s) seleccionado(s)
                  </Badge>
                  {filters.searchTerm.length >= 2 && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      ✓ Listo para comparar
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="fechas" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Selecciona Rango de Fechas para Comparar
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {filters.dateRange ? (
                        `${format(filters.dateRange.from, 'dd/MM/yyyy', { locale: es })} - ${format(filters.dateRange.to, 'dd/MM/yyyy', { locale: es })}`
                      ) : (
                        'Seleccionar rango de fechas'
                      )}
                    </span>
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
                      } else if (range?.from && !range?.to) {
                        updateFilter('dateRange', { from: range.from, to: range.from });
                      } else if (!range) {
                        updateFilter('dateRange', null);
                      }
                    }}
                    numberOfMonths={2}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              {filters.dateRange && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  ✓ Rango de fechas seleccionado
                </Badge>
              )}
            </div>
          </TabsContent>

          <TabsContent value="prioridad" className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Selecciona Prioridades para Comparar
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: option.color }}
                      />
                      <span className="truncate">{option.label}</span>
                    </label>
                  </div>
                ))}
              </div>
              {filters.priority.length > 0 && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  ✓ {filters.priority.length} prioridad(es) seleccionada(s)
                </Badge>
              )}
            </div>
          </TabsContent>

          <TabsContent value="estados" className="space-y-4">
            {stats && stats.reportes.porEstado.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Selecciona Estados para Comparar
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                  {stats.reportes.porEstado.map((estado) => (
                    <div key={estado.estado} className="flex items-center space-x-2">
                      <Checkbox
                        id={`estado-${estado.estado}`}
                        checked={filters.estados.includes(estado.estado)}
                        onCheckedChange={() => handleEstadoToggle(estado.estado)}
                      />
                      <label
                        htmlFor={`estado-${estado.estado}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 min-w-0 flex-1"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: estado.color }}
                        />
                        <span className="truncate">{estado.estado} ({estado.count})</span>
                      </label>
                    </div>
                  ))}
                </div>
                {filters.estados.length > 0 && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    ✓ {filters.estados.length} estado(s) seleccionado(s)
                  </Badge>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="categorias" className="space-y-4">
            {stats && stats.reportes.porCategoria.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Selecciona Categorías para Comparar
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                  {stats.reportes.porCategoria.map((categoria) => (
                    <div key={categoria.categoria} className="flex items-center space-x-2">
                      <Checkbox
                        id={`categoria-${categoria.categoria}`}
                        checked={filters.categorias.includes(categoria.categoria)}
                        onCheckedChange={() => handleCategoriaToggle(categoria.categoria)}
                      />
                      <label
                        htmlFor={`categoria-${categoria.categoria}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 min-w-0 flex-1"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: categoria.color }}
                        />
                        <span className="truncate">{categoria.categoria} ({categoria.count})</span>
                      </label>
                    </div>
                  ))}
                </div>
                {filters.categorias.length > 0 && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    ✓ {filters.categorias.length} categoría(s) seleccionada(s)
                  </Badge>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
