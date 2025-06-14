
import React, { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Reporte {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  categoria: string;
  prioridad: string;
}

interface SearchComboboxProps {
  reportes: Reporte[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const SearchCombobox: React.FC<SearchComboboxProps> = ({
  reportes,
  value,
  onValueChange,
  placeholder = "Buscar reportes..."
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
  };

  const selectedReporte = reportes.find(reporte => 
    reporte.titulo === value || reporte.id === value
  );

  // Filtrar reportes basado en la búsqueda interna del componente, no en el valor seleccionado
  const filteredReportes = reportes.filter(reporte => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      reporte.titulo.toLowerCase().includes(query) ||
      reporte.descripcion.toLowerCase().includes(query) ||
      reporte.estado.toLowerCase().includes(query) ||
      reporte.categoria.toLowerCase().includes(query) ||
      reporte.prioridad.toLowerCase().includes(query)
    );
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? (
            <span className="truncate">
              {selectedReporte ? selectedReporte.titulo : value}
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <CommandInput 
            placeholder="Buscar reportes..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList className="max-h-60">
            <CommandEmpty>No se encontraron reportes.</CommandEmpty>
            <CommandGroup>
              {filteredReportes.map((reporte) => (
                <CommandItem
                  key={reporte.id}
                  value={reporte.titulo}
                  onSelect={() => handleSelect(reporte.titulo)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === reporte.titulo ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium truncate">{reporte.titulo}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {reporte.descripcion}
                    </span>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                        {reporte.categoria}
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                        {reporte.estado}
                      </span>
                      <span className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
                        {reporte.prioridad}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
