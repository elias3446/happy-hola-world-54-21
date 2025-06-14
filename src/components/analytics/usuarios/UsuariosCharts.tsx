
import React from 'react';
import { InteractiveCharts } from '../InteractiveCharts';

interface UsuariosChartsProps {
  filteredStats: any;
  hasValidFilters: boolean;
}

export const UsuariosCharts: React.FC<UsuariosChartsProps> = ({ filteredStats, hasValidFilters }) => {
  return (
    <>
      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveCharts
          title="Distribución por Estado de Activación"
          description={hasValidFilters ? "Usuarios filtrados según su estado de activación (datos reales, incluyendo usuario actual)" : "Todos los usuarios según su estado de activación (datos reales, incluyendo usuario actual)"}
          data={filteredStats.usuarios.porEstadoActivacion.map((item: any) => ({
            name: item.estado,
            value: item.count,
            color: item.color,
          }))}
        />
        
        <InteractiveCharts
          title="Distribución por Confirmación de Email"
          description={hasValidFilters ? "Usuarios filtrados según su confirmación de email (datos reales, incluyendo usuario actual)" : "Todos los usuarios según su confirmación de email (datos reales, incluyendo usuario actual)"}
          data={filteredStats.usuarios.porConfirmacion.map((item: any) => ({
            name: item.categoria,
            value: item.count,
            color: item.color,
          }))}
        />
      </div>

      {/* Gráficos de Roles y Tipos de Usuario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStats.usuarios.porRoles && filteredStats.usuarios.porRoles.length > 0 && (
          <InteractiveCharts
            title="Distribución por Roles"
            description={hasValidFilters ? "Usuarios filtrados distribuidos por roles asignados (datos reales, incluyendo usuario actual)" : "Todos los usuarios distribuidos por roles asignados (datos reales, incluyendo usuario actual)"}
            data={filteredStats.usuarios.porRoles}
          />
        )}
        
        {filteredStats.usuarios.porTipoUsuario && filteredStats.usuarios.porTipoUsuario.length > 0 && (
          <InteractiveCharts
            title="Distribución por Tipo de Usuario"
            description={hasValidFilters ? "Usuarios filtrados según tipo: solo admin, solo usuario, o ambos (datos reales, incluyendo usuario actual)" : "Todos los usuarios según tipo: solo admin, solo usuario, o ambos (datos reales, incluyendo usuario actual)"}
            data={filteredStats.usuarios.porTipoUsuario}
          />
        )}
      </div>
    </>
  );
};
