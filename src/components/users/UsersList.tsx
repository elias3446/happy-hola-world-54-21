import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { BulkUserActionsDialog, type BulkUserActionType } from './dialogs/BulkUserActionsDialog';
import { useUsers, type User } from '@/hooks/useUsers';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Users,
  CheckCircle,
  XCircle,
  Shield,
  Ban,
  UserCheck,
  Upload,
  Calendar,
  Mail,
  Crown,
  User as UserIcon
} from 'lucide-react';

interface UsersListProps {
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
  onViewUser: (user: User) => void;
  onBulkUpload: () => void;
}

export const UsersList = ({ onCreateUser, onEditUser, onViewUser, onBulkUpload }: UsersListProps) => {
  const { 
    users, 
    isLoading, 
    deleteUser, 
    toggleUserStatus,
    updateUser,
    isDeleting, 
    isToggling,
    isUpdating
  } = useUsers();
  
  const isMobile = useIsMobile();
  const [filters, setFilters] = useDataTableFilters();
  const [filteredData, setFilteredData] = useState<any[]>([]);
  
  // Estado para diálogo unificado - actualizado para incluir 'block'
  const [bulkActionDialog, setBulkActionDialog] = useState({
    open: false,
    type: 'delete' as BulkUserActionType,
    users: [] as User[]
  });

  // Helper function to get user type display
  const getUserTypeDisplay = (userRoles: string[]) => {
    const hasAdmin = userRoles.includes('admin');
    const hasUser = userRoles.includes('user');
    
    if (hasAdmin && hasUser) {
      return 'Administrador y Usuario';
    } else if (hasAdmin) {
      return 'Administrador';
    } else if (hasUser) {
      return 'Usuario';
    }
    return 'Usuario'; // Default
  };

  // Helper function to get user type badge variant
  const getUserTypeBadge = (userRoles: string[]) => {
    const hasAdmin = userRoles.includes('admin');
    const hasUser = userRoles.includes('user');
    
    if (hasAdmin && hasUser) {
      return {
        variant: "default" as const,
        icon: <Crown className="h-3 w-3" />,
        text: "Admin + Usuario"
      };
    } else if (hasAdmin) {
      return {
        variant: "destructive" as const,
        icon: <Crown className="h-3 w-3" />,
        text: "Administrador"
      };
    } else {
      return {
        variant: "secondary" as const,
        icon: <UserIcon className="h-3 w-3" />,
        text: "Usuario"
      };
    }
  };

  // Transform users data for the table using useMemo to prevent infinite re-renders
  const transformedUsers = useMemo(() => {
    return users.map(user => ({
      ...user,
      full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
      asset_display: user.asset === null ? 'Bloqueado' : (user.asset ? 'Activo' : 'Inactivo'),
      confirmed_display: user.confirmed ? 'Confirmado' : 'Pendiente',
      user_type_display: getUserTypeDisplay(user.role || ['user']),
      roles_display: user.user_roles?.map(ur => ur.roles.nombre) || [],
      created_at_display: new Date(user.created_at).toLocaleDateString('es-ES'),
    }));
  }, [users]);

  // Filter out blocked users for bulk selection (users with asset = null)
  const selectableUsers = useMemo(() => {
    return filteredData.filter(user => user.asset !== null);
  }, [filteredData]);

  // Bulk selection hook - only for selectable users (non-blocked)
  const {
    selectedItems,
    isAllSelected,
    isIndeterminate,
    handleSelectAll,
    handleSelectItem,
    clearSelection,
    getSelectedData,
    selectedCount,
  } = useBulkSelection(selectableUsers);

  // Define columns for the table
  const columns: DataTableColumn[] = [
    { key: 'full_name', label: 'Usuario', searchable: true, sortable: true, filterable: true },
    { key: 'email', label: 'Email', searchable: true, sortable: true, filterable: true },
    { key: 'user_type_display', label: 'Tipo de Usuario', type: 'text', searchable: true, sortable: true, filterable: true },
    { key: 'roles_display', label: 'Roles', type: 'array', searchable: true, sortable: false, filterable: true },
    { key: 'asset_display', label: 'Estado', type: 'text', searchable: false, sortable: true, filterable: true },
    { key: 'confirmed_display', label: 'Confirmado', type: 'text', searchable: false, sortable: true, filterable: true },
    { key: 'created_at_display', label: 'Fecha de Registro', type: 'date', searchable: false, sortable: true, filterable: true },
  ];

  // Sensitive properties for special filters
  const sensitiveProperties = ['asset_display', 'confirmed_display', 'user_type_display', 'roles_display'];

  // Initialize filtered data when transformedUsers change
  useEffect(() => {
    setFilteredData(transformedUsers);
  }, [transformedUsers]);

  const handleDeleteUser = (user: User) => {
    setBulkActionDialog({
      open: true,
      type: 'delete',
      users: [user]
    });
  };

  const handleBlockUser = (user: User) => {
    setBulkActionDialog({
      open: true,
      type: 'block',
      users: [user]
    });
  };

  const handleActivateUser = (user: User) => {
    setBulkActionDialog({
      open: true,
      type: 'activate',
      users: [user]
    });
  };

  const handleToggleStatus = (user: User) => {
    // Cambiar solo entre activo (true) e inactivo (false)
    const newStatus = !user.asset;
    toggleUserStatus({ id: user.id, asset: newStatus });
  };

  // Handlers para acciones masivas actualizados con bloqueo
  const handleBulkDelete = () => {
    const selectedData = getSelectedData();
    setBulkActionDialog({
      open: true,
      type: 'delete',
      users: selectedData
    });
  };

  const handleBulkActivate = () => {
    const selectedData = getSelectedData();
    setBulkActionDialog({
      open: true,
      type: 'activate',
      users: selectedData
    });
  };

  const handleBulkDeactivate = () => {
    const selectedData = getSelectedData();
    setBulkActionDialog({
      open: true,
      type: 'deactivate',
      users: selectedData
    });
  };

  const handleBulkBlock = () => {
    const selectedData = getSelectedData();
    setBulkActionDialog({
      open: true,
      type: 'block',
      users: selectedData
    });
  };

  const handleBulkChangeRoles = () => {
    const selectedData = getSelectedData();
    setBulkActionDialog({
      open: true,
      type: 'change_roles',
      users: selectedData
    });
  };

  // Handle removing a user from bulk selection
  const handleRemoveFromBulkAction = (userId: string) => {
    handleSelectItem(userId); // This will deselect the item
    // Update the dialog state to remove the user from the list
    setBulkActionDialog(prev => ({
      ...prev,
      users: prev.users.filter(user => user.id !== userId)
    }));
  };

  // Confirmación unificada de acciones - actualizada con bloqueo
  const confirmBulkAction = (data: any) => {
    const { type, users: actionUsers } = bulkActionDialog;
    
    switch (type) {
      case 'delete':
        actionUsers.forEach(user => deleteUser(user.id));
        break;
      case 'activate':
        actionUsers.forEach(user => {
          toggleUserStatus({ id: user.id, asset: true });
        });
        break;
      case 'deactivate':
        actionUsers.forEach(user => {
          toggleUserStatus({ id: user.id, asset: false });
        });
        break;
      case 'block':
        actionUsers.forEach(user => {
          toggleUserStatus({ id: user.id, asset: null });
        });
        break;
      case 'change_roles':
        actionUsers.forEach(user => {
          updateUser({
            id: user.id,
            role_ids: data.roleIds
          });
        });
        break;
    }
    
    clearSelection();
    setBulkActionDialog({ open: false, type: 'delete', users: [] });
  };

  const handleBulkExport = () => {
    const selectedData = getSelectedData();
    handleExport(selectedData);
  };

  const handleExport = (filteredData: any[]) => {
    const exportData = filteredData.map(user => ({
      Usuario: user.full_name,
      Email: user.email,
      'Tipo de Usuario': user.user_type_display,
      Roles: Array.isArray(user.roles_display) ? user.roles_display.join(', ') : user.roles_display,
      Estado: user.asset_display,
      Confirmado: user.confirmed_display,
      'Fecha de Registro': user.created_at_display,
    }));
    
    const csvContent = generateCSV(exportData);
    downloadCSV(csvContent, 'usuarios');
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

  // Helper function to get user display name
  const getUserDisplayName = (user: User) => {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
  };

  // Helper function to get status badge variant and icon
  const getStatusBadge = (user: User) => {
    if (user.asset === null) {
      return {
        variant: "destructive" as const,
        icon: <XCircle className="h-3 w-3" />,
        text: "Bloqueado"
      };
    } else if (user.asset) {
      return {
        variant: "default" as const,
        icon: <CheckCircle className="h-3 w-3" />,
        text: "Activo"
      };
    } else {
      return {
        variant: "secondary" as const,
        icon: <XCircle className="h-3 w-3" />,
        text: "Inactivo"
      };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Cargando usuarios...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Usuarios
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Administra los usuarios del sistema y sus roles
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                onClick={onBulkUpload} 
                variant="outline" 
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Upload className="h-4 w-4" />
                <span className="sm:inline">Carga Masiva</span>
              </Button>
              <Button onClick={onCreateUser} className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                <span className="sm:inline">Crear Usuario</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Toolbar with filters and search */}
          <DataTableToolbar
            data={transformedUsers}
            columns={columns}
            sensitiveProperties={sensitiveProperties}
            filters={filters}
            onFiltersChange={setFilters}
            onExport={handleExport}
            exportFileName="usuarios"
            searchPlaceholder="Buscar usuarios por nombre, email, tipo, roles..."
            onDataFilter={setFilteredData}
          />

          {/* Bulk Actions Bar - actualizada con opción de bloqueo */}
          <BulkActionsBar
            selectedCount={selectedCount}
            onClearSelection={clearSelection}
            onBulkDelete={handleBulkDelete}
            onBulkActivate={handleBulkActivate}
            onBulkDeactivate={handleBulkDeactivate}
            onBulkBlock={handleBulkBlock}
            onBulkChangeRoles={handleBulkChangeRoles}
            onBulkExport={handleBulkExport}
            isDeleting={isDeleting}
            isActivating={isToggling}
            isDeactivating={isToggling}
            isBlocking={isToggling}
            isChangingRoles={isUpdating}
            showUserActions={true}
            showRoleChange={true}
          />

          {/* Content */}
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
              <p className="text-gray-500 mb-4">
                Comienza creando tu primer usuario del sistema.
              </p>
              <Button onClick={onCreateUser}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Usuario
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
                    <TableHead className={isMobile ? "min-w-[180px]" : "min-w-[200px]"}>Usuario</TableHead>
                    {!isMobile && <TableHead className="min-w-[200px]">Email</TableHead>}
                    <TableHead className="min-w-[140px]">Tipo de Usuario</TableHead>
                    <TableHead className={isMobile ? "min-w-[120px]" : "min-w-[150px]"}>Roles</TableHead>
                    <TableHead className={isMobile ? "min-w-[100px]" : "min-w-[120px]"}>Estado</TableHead>
                    {!isMobile && <TableHead className="min-w-[100px]">Confirmado</TableHead>}
                    {!isMobile && <TableHead className="min-w-[120px]">Fecha de Registro</TableHead>}
                    <TableHead className="w-[50px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((user) => {
                    const statusBadge = getStatusBadge(user);
                    const typeBadge = getUserTypeBadge(user.role || ['user']);
                    const isBlocked = user.asset === null;

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          {!isBlocked ? (
                            <Checkbox
                              checked={selectedItems.has(user.id)}
                              onCheckedChange={() => handleSelectItem(user.id)}
                            />
                          ) : (
                            <div className="w-4 h-4" /> // Empty space for blocked users
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className={isMobile ? "h-8 w-8" : "h-10 w-10"}>
                              <AvatarImage src={user.avatar || undefined} />
                              <AvatarFallback>
                                {((user.first_name || '').charAt(0) + (user.last_name || '').charAt(0)).toUpperCase() || 
                                 user.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <button
                                onClick={() => onViewUser(user)}
                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left"
                              >
                                <span className={isMobile ? "line-clamp-1 break-words text-sm" : ""}>
                                  {user.full_name}
                                </span>
                              </button>
                              {isMobile && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate">{user.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        
                        {!isMobile && (
                          <TableCell className="max-w-xs">
                            <p className="text-sm truncate" title={user.email}>
                              {user.email}
                            </p>
                          </TableCell>
                        )}
                        
                        <TableCell>
                          <Badge 
                            variant={typeBadge.variant} 
                            className="flex items-center gap-1 text-xs"
                          >
                            {typeBadge.icon}
                            {typeBadge.text}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.user_roles?.slice(0, isMobile ? 1 : 2).map((userRole) => (
                              <Badge 
                                key={userRole.id} 
                                variant="secondary" 
                                className={`${isMobile ? 'text-xs px-1' : 'text-xs'}`}
                                style={{ backgroundColor: userRole.roles.color + '20', color: userRole.roles.color }}
                              >
                                {userRole.roles.nombre}
                              </Badge>
                            ))}
                            {user.user_roles && user.user_roles.length > (isMobile ? 1 : 2) && (
                              <Badge variant="outline" className="text-xs">
                                +{user.user_roles.length - (isMobile ? 1 : 2)}
                              </Badge>
                            )}
                            {(!user.user_roles || user.user_roles.length === 0) && (
                              <Badge variant="outline" className="text-xs">
                                Sin roles
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.asset !== null && (
                              <Switch
                                checked={user.asset}
                                onCheckedChange={() => handleToggleStatus(user)}
                                disabled={isToggling}
                              />
                            )}
                            <Badge 
                              variant={statusBadge.variant} 
                              className="flex items-center gap-1 text-xs"
                            >
                              {statusBadge.icon}
                              {statusBadge.text}
                            </Badge>
                          </div>
                        </TableCell>
                        
                        {!isMobile && (
                          <TableCell>
                            <Badge variant={user.confirmed ? "default" : "secondary"} className="text-xs">
                              {user.confirmed ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Confirmado
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Pendiente
                                </>
                              )}
                            </Badge>
                          </TableCell>
                        )}
                        
                        {!isMobile && (
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(user.created_at).toLocaleDateString('es-ES')}</span>
                            </div>
                          </TableCell>
                        )}
                        
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEditUser(user)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.asset === null && (
                                <DropdownMenuItem onClick={() => handleActivateUser(user)}>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Desbloquear
                                </DropdownMenuItem>
                              )}
                              {user.asset !== null && (
                                <DropdownMenuItem onClick={() => handleBlockUser(user)}>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Bloquear
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
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

      {/* Diálogo de acción masiva unificado - actualizado con bloqueo */}
      <BulkUserActionsDialog
        open={bulkActionDialog.open}
        onOpenChange={(open) => setBulkActionDialog(prev => ({ ...prev, open }))}
        users={bulkActionDialog.users}
        actionType={bulkActionDialog.type}
        isLoading={isDeleting || isToggling || isUpdating}
        onConfirm={confirmBulkAction}
        onRemoveUser={handleRemoveFromBulkAction}
      />
    </>
  );
};

export default UsersList;
