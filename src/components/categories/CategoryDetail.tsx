
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCategories } from '@/hooks/useCategories';
import type { Category } from '@/types/categories';
import { CategoriaAuditoria } from './CategoriaAuditoria';
import { 
  ArrowLeft, 
  Edit, 
  FolderOpen, 
  Calendar,
  CheckCircle,
  XCircle,
  Lock
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface CategoryDetailProps {
  category: Category;
  onEdit: (category: Category) => void;
  onBack: () => void;
}

// Define system categories that cannot be modified
const SYSTEM_CATEGORIES = ['Sin categoría'];

const isSystemCategory = (categoryName: string): boolean => {
  return SYSTEM_CATEGORIES.includes(categoryName);
};

export const CategoryDetail = ({ category: initialCategory, onEdit, onBack }: CategoryDetailProps) => {
  const { toggleCategoryStatus, isToggling, categories } = useCategories();
  const [currentCategory, setCurrentCategory] = useState(initialCategory);

  // Update currentCategory when categories data changes
  useEffect(() => {
    const updatedCategory = categories.find(c => c.id === initialCategory.id);
    if (updatedCategory) {
      setCurrentCategory(updatedCategory);
    }
  }, [categories, initialCategory.id]);

  const handleToggleStatus = () => {
    if (isSystemCategory(currentCategory.nombre)) {
      return; // No allow status change for system categories
    }
    toggleCategoryStatus({ id: currentCategory.id, activo: !currentCategory.activo });
  };

  const handleEdit = () => {
    if (isSystemCategory(currentCategory.nombre)) {
      return; // No allow edit for system categories
    }
    onEdit(currentCategory);
  };

  const isSystemCategoryItem = isSystemCategory(currentCategory.nombre);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Categorías
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium"
              style={{ backgroundColor: currentCategory.color }}
            >
              {currentCategory.icono.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{currentCategory.nombre}</h1>
                {isSystemCategoryItem && (
                  <Badge variant="secondary" className="text-xs">
                    Sistema
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">{currentCategory.descripcion}</p>
            </div>
          </div>
          
          {!isSystemCategoryItem ? (
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editar Categoría
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <Lock className="h-4 w-4" />
              <span className="text-sm">Categoría protegida del sistema</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información General */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre de la Categoría</label>
                <p className="text-lg font-semibold mt-1">{currentCategory.nombre}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <div className="flex items-center gap-3 mt-1">
                  <Switch
                    checked={currentCategory.activo}
                    onCheckedChange={handleToggleStatus}
                    disabled={isToggling || isSystemCategoryItem}
                  />
                  <Badge variant={currentCategory.activo ? "default" : "secondary"} className="flex items-center gap-1">
                    {currentCategory.activo ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {currentCategory.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                  {isSystemCategoryItem && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Protegido
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-gray-700">Descripción</label>
              <p className="text-gray-900 mt-1">{currentCategory.descripcion}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Color</label>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: currentCategory.color }}
                  />
                  <span className="text-gray-900 font-mono">{currentCategory.color}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Ícono</label>
                <p className="text-gray-900 mt-1">{currentCategory.icono}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha de Creación</label>
              <p className="text-gray-900 mt-1">
                {new Date(currentCategory.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Última Actualización</label>
              <p className="text-gray-900 mt-1">
                {new Date(currentCategory.updated_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {isSystemCategoryItem && (
              <>
                <Separator />
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <Lock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Categoría del Sistema</p>
                    <p>Esta categoría está protegida y no puede ser modificada o eliminada.</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Auditoría de la Categoría */}
        <div className="lg:col-span-1">
          <CategoriaAuditoria categoriaId={currentCategory.id} />
        </div>
      </div>
    </div>
  );
};
