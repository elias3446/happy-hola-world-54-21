
import { useState, useMemo } from 'react';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface AdvancedFilters {
  dateRange: DateRange | null;
  priority: string[];
  estados: string[];
  categorias: string[];
  searchTerm: string;
  sortBy: 'created_at' | 'priority' | 'estado' | 'categoria';
  sortOrder: 'asc' | 'desc';
}

const defaultFilters: AdvancedFilters = {
  dateRange: null,
  priority: [],
  estados: [],
  categorias: [],
  searchTerm: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
};

export const useAdvancedFilters = () => {
  const [filters, setFilters] = useState<AdvancedFilters>(defaultFilters);

  const updateFilter = <K extends keyof AdvancedFilters>(
    key: K,
    value: AdvancedFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.dateRange !== null ||
      filters.priority.length > 0 ||
      filters.estados.length > 0 ||
      filters.categorias.length > 0 ||
      filters.searchTerm.length > 0
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
  };
};
