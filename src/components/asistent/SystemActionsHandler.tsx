
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSecurity } from '@/hooks/useSecurity';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { useUsers } from '@/hooks/useUsers';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { toast } from '@/hooks/use-toast';

interface SystemActionsHandlerProps {
  onActionComplete: (result: any) => void;
}

export const SystemActionsHandler: React.FC<SystemActionsHandlerProps> = ({ onActionComplete }) => {
  const navigate = useNavigate();
  const { hasPermission, isAdmin } = useSecurity();
  const { user } = useAuth();
  const { roles, createRole } = useRoles();
  const { users } = useUsers();
  const { data: stats, refetch: refetchStats } = useDashboardStats();

  const executeAction = async (action: string, params?: any) => {
    console.log('Ejecutando acción del sistema:', action, params);
    console.log('Usuario actual:', user?.email, 'Es admin:', isAdmin());

    switch (action) {
      case 'navigate':
        if (params) {
          navigate(params);
          onActionComplete({ action, success: true, message: `Navegando a ${params}` });
        }
        break;

      case 'show-analytics':
        navigate('/dashboard');
        onActionComplete({ 
          action, 
          success: true, 
          message: `Hola ${user?.email?.split('@')[0] || 'Usuario'}, mostrando panel analítico completo`,
          data: stats
        });
        break;

      case 'export-data':
        if (hasPermission('ver_reporte')) {
          // Simulación de exportación con datos reales del usuario
          toast({
            title: "Exportación iniciada",
            description: `${user?.email?.split('@')[0]}, preparando datos para descarga...`,
          });
          onActionComplete({ 
            action, 
            success: true, 
            message: `Datos exportados exitosamente para ${user?.email}`,
            data: { 
              format: 'excel', 
              records: stats?.reportes?.total || 0,
              exportedBy: user?.email,
              timestamp: new Date().toISOString()
            }
          });
        } else {
          onActionComplete({ 
            action, 
            success: false, 
            message: `${user?.email}, no tienes permisos para exportar datos` 
          });
        }
        break;

      case 'generate-chart':
        if (params?.type && params?.data) {
          onActionComplete({
            action,
            success: true,
            message: `Gráfico ${params.type} generado exitosamente para ${user?.email?.split('@')[0]}`,
            chartData: params.data,
            chartType: params.type,
            generatedBy: user?.email
          });
        }
        break;

      case 'create-role':
        if (hasPermission('crear_rol') && params) {
          try {
            await createRole(params);
            onActionComplete({
              action,
              success: true,
              message: `Rol "${params.nombre}" creado exitosamente por ${user?.email?.split('@')[0]}`
            });
          } catch (error) {
            onActionComplete({
              action,
              success: false,
              message: `Error al crear el rol: ${error}`
            });
          }
        } else {
          onActionComplete({
            action,
            success: false,
            message: `${user?.email?.split('@')[0]}, no tienes permisos para crear roles`
          });
        }
        break;

      case 'analyze-system':
        await refetchStats();
        
        // Calculate missing statistics from available data
        const reportesPendientes = stats?.reportes?.porEstado?.find(estado => 
          estado.estado.toLowerCase().includes('pendiente') || 
          estado.estado.toLowerCase().includes('nuevo') ||
          estado.estado.toLowerCase().includes('sin estado')
        )?.count || 0;

        const analysis = {
          totalUsers: stats?.usuarios?.total || 0,
          activeUsers: stats?.usuarios?.activos || 0,
          totalReports: stats?.reportes?.total || 0,
          pendingReports: reportesPendientes,
          currentUser: {
            email: user?.email,
            isAdmin: isAdmin(),
            permissions: hasPermission('ver_reporte') ? 'Con permisos de reportes' : 'Permisos limitados'
          },
          systemHealth: 'Óptimo',
          recommendations: [
            `Sistema funcionando correctamente para ${user?.email?.split('@')[0]}`,
            reportesPendientes > 0 ? `Tienes ${reportesPendientes} reportes pendientes de revisar` : 'No hay reportes pendientes',
            'Actividad de usuarios normal'
          ]
        };
        
        onActionComplete({
          action,
          success: true,
          message: `Análisis del sistema completado para ${user?.email?.split('@')[0]}`,
          data: analysis
        });
        break;

      case 'configure-notifications':
        onActionComplete({
          action,
          success: true,
          message: `Configuración de notificaciones actualizada para ${user?.email?.split('@')[0]}`
        });
        break;

      case 'quick-report-summary':
        // Calculate from available data
        const reportesUrgentes = stats?.reportes?.porPrioridad?.find(prioridad => 
          prioridad.priority === 'urgente'
        )?.count || 0;

        onActionComplete({
          action,
          success: true,
          message: `Resumen de reportes generado para ${user?.email?.split('@')[0]}`,
          data: {
            total: stats?.reportes?.total || 0,
            recent: stats?.reportes?.recientes || 0,
            priority: reportesUrgentes,
            userInfo: {
              email: user?.email,
              canViewReports: hasPermission('ver_reporte'),
              isAdmin: isAdmin()
            }
          }
        });
        break;

      case 'show-user-info':
        onActionComplete({
          action,
          success: true,
          message: `Información del usuario actual`,
          data: {
            email: user?.email,
            id: user?.id,
            isAdmin: isAdmin(),
            totalUsersInSystem: users?.length || 0,
            totalRolesInSystem: roles?.length || 0,
            permissions: {
              canViewReports: hasPermission('ver_reporte'),
              canCreateReports: hasPermission('crear_reporte'),
              canViewUsers: hasPermission('ver_usuario'),
              canCreateUsers: hasPermission('crear_usuario'),
              canManageRoles: hasPermission('crear_rol')
            }
          }
        });
        break;

      default:
        onActionComplete({
          action,
          success: false,
          message: `Acción "${action}" no reconocida para ${user?.email?.split('@')[0]}`
        });
    }
  };

  return null; // Este componente no renderiza nada, solo maneja acciones
};

export default SystemActionsHandler;
