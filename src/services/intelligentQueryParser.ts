
import { assistantActionService, ActionResult } from './assistantActionService';

export interface ParsedQuery {
  intent: string;
  action: string;
  parameters: Record<string, any>;
  confidence: number;
  naturalResponse: string;
}

export class IntelligentQueryParser {
  private static instance: IntelligentQueryParser;
  
  static getInstance(): IntelligentQueryParser {
    if (!IntelligentQueryParser.instance) {
      IntelligentQueryParser.instance = new IntelligentQueryParser();
    }
    return IntelligentQueryParser.instance;
  }

  // Patrones de consulta para diferentes intenciones
  private patterns = {
    createReport: [
      /crear.*reporte.*"([^"]+)"/i,
      /nuevo.*reporte.*"([^"]+)"/i,
      /registrar.*reporte.*"([^"]+)"/i,
      /añadir.*reporte.*"([^"]+)"/i
    ],
    searchReports: [
      /buscar.*reportes?.*"([^"]+)"/i,
      /mostrar.*reportes?.*"([^"]+)"/i,
      /encontrar.*reportes?.*"([^"]+)"/i,
      /listar.*reportes?.*"([^"]+)"/i,
      /reportes?.*de.*"([^"]+)"/i
    ],
    getStats: [
      /estadísticas?/i,
      /resumen.*sistema/i,
      /análisis.*general/i,
      /métricas/i,
      /dashboard/i,
      /estado.*sistema/i
    ],
    showMap: [
      /mapa/i,
      /ubicaciones?/i,
      /mostrar.*en.*mapa/i,
      /ver.*mapa/i,
      /reportes.*geográficos?/i
    ],
    updateStatus: [
      /cambiar.*estado.*reporte.*"([^"]+)".*a.*"([^"]+)"/i,
      /actualizar.*estado.*"([^"]+)".*"([^"]+)"/i,
      /marcar.*reporte.*"([^"]+)".*como.*"([^"]+)"/i
    ],
    assignReport: [
      /asignar.*reporte.*"([^"]+)".*a.*"([^"]+)"/i,
      /asignar.*"([^"]+)".*reporte.*"([^"]+)"/i
    ],
    createCategory: [
      /crear.*categoría.*"([^"]+)"/i,
      /nueva.*categoría.*"([^"]+)"/i,
      /añadir.*categoría.*"([^"]+)"/i
    ],
    reportDetails: [
      /detalles.*reporte.*"([^"]+)"/i,
      /información.*reporte.*"([^"]+)"/i,
      /ver.*reporte.*"([^"]+)"/i,
      /mostrar.*reporte.*"([^"]+)"/i
    ]
  };

  async parseQuery(query: string, userId: string, userPermissions: string[]): Promise<ParsedQuery & { result?: ActionResult }> {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Intentar identificar la intención
    for (const [intent, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        const match = normalizedQuery.match(pattern);
        if (match) {
          return this.executeIntent(intent, match, query, userId, userPermissions);
        }
      }
    }

    // Si no se encuentra un patrón específico, intentar análisis contextual
    return this.analyzeContextualQuery(query, userId, userPermissions);
  }

  private async executeIntent(
    intent: string, 
    match: RegExpMatchArray, 
    originalQuery: string, 
    userId: string, 
    userPermissions: string[]
  ): Promise<ParsedQuery & { result?: ActionResult }> {
    switch (intent) {
      case 'createReport':
        if (!userPermissions.includes('crear_reporte')) {
          return {
            intent,
            action: 'permission_denied',
            parameters: {},
            confidence: 0.9,
            naturalResponse: 'No tienes permisos para crear reportes.',
            result: { success: false, message: 'Permisos insuficientes' }
          };
        }
        
        const reportName = match[1];
        const result = await assistantActionService.createReport({
          nombre: reportName,
          descripcion: `Reporte creado mediante asistente: ${reportName}`,
          priority: 'medio'
        }, userId);
        
        return {
          intent,
          action: 'create_report',
          parameters: { nombre: reportName },
          confidence: 0.9,
          naturalResponse: result.success 
            ? `✅ He creado el reporte "${reportName}" exitosamente.`
            : `❌ Error al crear el reporte: ${result.error}`,
          result
        };

      case 'searchReports':
        if (!userPermissions.includes('ver_reporte')) {
          return {
            intent,
            action: 'permission_denied',
            parameters: {},
            confidence: 0.9,
            naturalResponse: 'No tienes permisos para ver reportes.',
            result: { success: false, message: 'Permisos insuficientes' }
          };
        }

        const searchTerm = match[1];
        const searchResult = await assistantActionService.searchReports({
          search: searchTerm,
          limit: 10
        });
        
        return {
          intent,
          action: 'search_reports',
          parameters: { search: searchTerm },
          confidence: 0.9,
          naturalResponse: searchResult.success 
            ? `🔍 Encontré ${searchResult.data?.length || 0} reportes relacionados con "${searchTerm}".`
            : `❌ Error en la búsqueda: ${searchResult.error}`,
          result: searchResult
        };

      case 'getStats':
        if (!userPermissions.includes('ver_reporte')) {
          return {
            intent,
            action: 'permission_denied',
            parameters: {},
            confidence: 0.8,
            naturalResponse: 'No tienes permisos para ver estadísticas.',
            result: { success: false, message: 'Permisos insuficientes' }
          };
        }

        const statsResult = await assistantActionService.getSystemStats();
        return {
          intent,
          action: 'get_stats',
          parameters: {},
          confidence: 0.8,
          naturalResponse: statsResult.success 
            ? `📊 Estadísticas del sistema: ${statsResult.data?.reportes} reportes, ${statsResult.data?.usuarios} usuarios, ${statsResult.data?.categorias} categorías.`
            : `❌ Error al obtener estadísticas: ${statsResult.error}`,
          result: statsResult
        };

      case 'showMap':
        const mapResult = await assistantActionService.getReportsByLocation();
        return {
          intent,
          action: 'show_map',
          parameters: {},
          confidence: 0.8,
          naturalResponse: mapResult.success 
            ? `🗺️ He encontrado ${mapResult.data?.length || 0} reportes con ubicación en el mapa.`
            : `❌ Error al cargar el mapa: ${mapResult.error}`,
          result: mapResult
        };

      case 'reportDetails':
        if (!userPermissions.includes('ver_reporte')) {
          return {
            intent,
            action: 'permission_denied',
            parameters: {},
            confidence: 0.9,
            naturalResponse: 'No tienes permisos para ver detalles de reportes.',
            result: { success: false, message: 'Permisos insuficientes' }
          };
        }

        const reportQuery = match[1];
        // Buscar reporte por nombre para obtener el ID
        const reportSearch = await assistantActionService.searchReports({
          search: reportQuery,
          limit: 1
        });

        if (reportSearch.success && reportSearch.data?.length > 0) {
          const detailsResult = await assistantActionService.getReportDetails(reportSearch.data[0].id);
          return {
            intent,
            action: 'report_details',
            parameters: { reportId: reportSearch.data[0].id },
            confidence: 0.9,
            naturalResponse: detailsResult.success 
              ? `📋 Aquí están los detalles del reporte "${reportQuery}".`
              : `❌ Error al obtener detalles: ${detailsResult.error}`,
            result: detailsResult
          };
        } else {
          return {
            intent,
            action: 'report_not_found',
            parameters: { search: reportQuery },
            confidence: 0.9,
            naturalResponse: `❓ No encontré ningún reporte con el nombre "${reportQuery}".`,
            result: { success: false, message: 'Reporte no encontrado' }
          };
        }

      default:
        return this.getGenericResponse(originalQuery);
    }
  }

  private async analyzeContextualQuery(query: string, userId: string, userPermissions: string[]): Promise<ParsedQuery & { result?: ActionResult }> {
    const lowercaseQuery = query.toLowerCase();
    
    // Análisis contextual básico
    if (lowercaseQuery.includes('reporte') && lowercaseQuery.includes('cuántos')) {
      const statsResult = await assistantActionService.getSystemStats();
      return {
        intent: 'count_reports',
        action: 'get_stats',
        parameters: {},
        confidence: 0.7,
        naturalResponse: statsResult.success 
          ? `📊 Actualmente hay ${statsResult.data?.reportes} reportes en el sistema.`
          : `❌ Error al obtener el conteo: ${statsResult.error}`,
        result: statsResult
      };
    }

    if (lowercaseQuery.includes('urgente') || lowercaseQuery.includes('prioridad alta')) {
      const urgentResult = await assistantActionService.searchReports({
        priority: 'urgente',
        limit: 10
      });
      return {
        intent: 'urgent_reports',
        action: 'search_reports',
        parameters: { priority: 'urgente' },
        confidence: 0.8,
        naturalResponse: urgentResult.success 
          ? `🚨 Encontré ${urgentResult.data?.length || 0} reportes urgentes.`
          : `❌ Error al buscar reportes urgentes: ${urgentResult.error}`,
        result: urgentResult
      };
    }

    return this.getGenericResponse(query);
  }

  private getGenericResponse(query: string): ParsedQuery {
    return {
      intent: 'general_inquiry',
      action: 'provide_help',
      parameters: { originalQuery: query },
      confidence: 0.3,
      naturalResponse: `🤔 Entiendo que preguntas sobre "${query}". Puedo ayudarte con:\n` +
        `• Crear reportes: "crear reporte 'nombre del reporte'"\n` +
        `• Buscar reportes: "buscar reportes 'término'"\n` +
        `• Ver estadísticas: "estadísticas del sistema"\n` +
        `• Mostrar mapa: "mostrar mapa de reportes"\n` +
        `• Ver detalles: "detalles del reporte 'nombre'"\n\n` +
        `¿Qué te gustaría hacer?`
    };
  }
}

export const intelligentQueryParser = IntelligentQueryParser.getInstance();
