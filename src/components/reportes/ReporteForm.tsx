import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useCategories';
import { useEstados } from '@/hooks/useEstados';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import { useCloudinary } from '@/hooks/useCloudinary';
import { useReportes } from '@/hooks/useReportes';
import { MapaNuevaPosicion, MapaReporteEditable } from '@/components/MapaBase';
import { ImageUploader } from './ImageUploader';
import type { Reporte, CreateReporteData, UpdateReporteData } from '@/types/reportes';
import { ArrowLeft, Save, X, FileText, MapPin, AlertTriangle } from 'lucide-react';

const reporteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255, 'El nombre es muy largo'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  categoria_id: z.string().min(1, 'La categoría es requerida'),
  estado_id: z.string().min(1, 'El estado es requerido'),
  assigned_to: z.string().optional(),
  longitud: z.number().optional(),
  latitud: z.number().optional(),
  direccion: z.string().optional(),
  referencia_direccion: z.string().optional(),
  imagenes: z.array(z.string()).optional(),
  activo: z.boolean().optional(),
  priority: z.enum(['alto', 'medio', 'bajo', 'urgente']).optional(),
});

type ReporteFormData = z.infer<typeof reporteSchema>;

interface ReporteFormProps {
  reporte?: Reporte;
  onSubmit: (data: any) => void; // Changed to any to allow pendingImages
  onCancel: () => void;
  isLoading: boolean;
}

const priorityConfig = {
  urgente: { color: '#DC2626', label: 'Urgente' },
  alto: { color: '#EA580C', label: 'Alto' },
  medio: { color: '#D97706', label: 'Medio' },
  bajo: { color: '#059669', label: 'Bajo' },
};

export const ReporteForm = ({ reporte, onSubmit, onCancel, isLoading }: ReporteFormProps) => {
  const { categories } = useCategories();
  const { estados } = useEstados();
  const { users } = useUsers();
  const { user } = useAuth();
  const { isUploading } = useCloudinary();

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const form = useForm<ReporteFormData>({
    resolver: zodResolver(reporteSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      categoria_id: '',
      estado_id: '',
      assigned_to: '',
      longitud: undefined,
      latitud: undefined,
      direccion: '',
      referencia_direccion: '',
      imagenes: [],
      activo: true,
      priority: 'urgente',
    },
  });

  useEffect(() => {
    if (reporte) {
      form.reset({
        nombre: reporte.nombre,
        descripcion: reporte.descripcion,
        categoria_id: reporte.categoria_id,
        estado_id: reporte.estado_id,
        assigned_to: reporte.assigned_to || 'unassigned',
        longitud: reporte.longitud || undefined,
        latitud: reporte.latitud || undefined,
        direccion: reporte.direccion || '',
        referencia_direccion: reporte.referencia_direccion || '',
        imagenes: reporte.imagenes || [],
        activo: reporte.activo,
        priority: reporte.priority || 'urgente',
      });
    }
  }, [reporte, form]);

  const handleSubmit = async (data: ReporteFormData) => {
    try {
      // Convert 'unassigned' back to null for the API
      const processedData = {
        ...data,
        assigned_to: data.assigned_to === 'unassigned' ? undefined : data.assigned_to,
        priority: data.priority || 'urgente', // Default to urgente if not provided
      };

      // Create the submit data with pending images and id if editing
      const submitData = { 
        ...processedData,
        pendingImages: pendingFiles,
        ...(reporte && { id: reporte.id }) // Add id only if editing
      };
      
      onSubmit(submitData);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  const handlePosicionSeleccionada = (pos: [number, number], direccion?: string, referencia?: string) => {
    form.setValue('latitud', pos[0]);
    form.setValue('longitud', pos[1]);
    if (direccion) {
      form.setValue('direccion', direccion);
    }
    if (referencia) {
      form.setValue('referencia_direccion', referencia);
    }
  };

  const handlePosicionActualizada = (nuevaPos: [number, number]) => {
    form.setValue('latitud', nuevaPos[0]);
    form.setValue('longitud', nuevaPos[1]);
  };

  const handleImagesChange = (newImages: string[]) => {
    form.setValue('imagenes', newImages);
  };

  const getProfileName = (userData: any) => {
    if (!userData) return userData;
    return `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email;
  };

  // Filtrar solo usuarios activos (asset = true) y no eliminados
  const activeUsers = users.filter(userItem => 
    userItem.asset === true && !userItem.deleted_at
  );

  // Crear lista de usuarios disponibles para asignación incluyendo el usuario autenticado si está activo
  const availableUsersForAssignment = React.useMemo(() => {
    let usersList = [...activeUsers];
    
    // Si hay un usuario autenticado y está activo, agregarlo si no está en la lista
    if (user && user.user_metadata?.asset !== false && !activeUsers.find(u => u.id === user.id)) {
      const currentUser = {
        id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        role: ['user'], // Agregar rol por defecto
        confirmed: true, // Usuario autenticado ya está confirmado
        asset: true, // Usuario autenticado activo
        avatar: null, // Valor por defecto
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null, // Valor por defecto
        user_roles: []
      };
      usersList.push(currentUser);
    }
    
    return usersList;
  }, [activeUsers, user]);

  const currentLatitud = form.watch('latitud');
  const currentLongitud = form.watch('longitud');
  const currentImages = form.watch('imagenes') || [];
  const currentPriority = form.watch('priority');
  const hasCoordinates = currentLatitud && currentLongitud;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={onCancel}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Reportes
        </Button>
        
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">
              {reporte ? 'Editar Reporte' : 'Crear Nuevo Reporte'}
            </h1>
            <p className="text-gray-600">
              {reporte ? 'Modifica los datos del reporte' : 'Completa la información para crear un nuevo reporte'}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Principal */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Reporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Reporte *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Bache en calle principal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoria_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((categoria) => (
                              <SelectItem key={categoria.id} value={categoria.id}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded"
                                    style={{ backgroundColor: categoria.color }}
                                  />
                                  {categoria.nombre}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estado_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {estados.map((estado) => (
                              <SelectItem key={estado.id} value={estado.id}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded"
                                    style={{ backgroundColor: estado.color }}
                                  />
                                  {estado.nombre}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Prioridad *
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar prioridad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(priorityConfig).map(([value, config]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    style={{ 
                                      backgroundColor: `${config.color}20`,
                                      color: config.color,
                                      borderColor: config.color
                                    }}
                                  >
                                    {config.label}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {currentPriority && (
                          <div className="mt-2">
                            <Badge
                              variant="secondary"
                              style={{ 
                                backgroundColor: `${priorityConfig[currentPriority].color}20`,
                                color: priorityConfig[currentPriority].color,
                                borderColor: priorityConfig[currentPriority].color
                              }}
                            >
                              Prioridad: {priorityConfig[currentPriority].label}
                            </Badge>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assigned_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asignar a Usuario</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar usuario activo (opcional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unassigned">Sin asignar</SelectItem>
                            {availableUsersForAssignment.map((userData) => (
                              <SelectItem key={userData.id} value={userData.id}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                    userData.id === user?.id ? 'bg-green-100' : 'bg-blue-100'
                                  }`}>
                                    {getProfileName(userData).charAt(0).toUpperCase()}
                                  </div>
                                  <span>
                                    {getProfileName(userData)}
                                    {userData.id === user?.id && ' (Yo)'}
                                  </span>
                                  <span className="text-gray-500 text-xs">({userData.email})</span>
                                  <span className="text-green-600 text-xs">(Activo)</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe detalladamente el reporte..."
                          className="min-h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {reporte && (
                  <FormField
                    control={form.control}
                    name="activo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Reporte Activo</FormLabel>
                          <p className="text-sm text-gray-600">
                            El reporte está disponible cuando está activo
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                <Separator />

                <ImageUploader
                  images={currentImages}
                  pendingFiles={pendingFiles}
                  onImagesChange={handleImagesChange}
                  onPendingFilesChange={setPendingFiles}
                  maxImages={10}
                  disabled={isLoading || isUploading}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación del Reporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reporte && hasCoordinates ? (
                  <MapaReporteEditable
                    reporte={reporte}
                    height="h-[400px]"
                    onPosicionActualizada={handlePosicionActualizada}
                  />
                ) : (
                  <MapaNuevaPosicion
                    height="h-[400px]"
                    onPosicionSeleccionada={handlePosicionSeleccionada}
                    initialPosition={hasCoordinates ? [currentLatitud, currentLongitud] : undefined}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={isLoading || isUploading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading || isUploading ? 'Guardando...' : (reporte ? 'Actualizar Reporte' : 'Crear Reporte')}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading || isUploading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
