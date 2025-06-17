
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

  // Sistema de prompt personalizado JARVIS
  private getJarvisSystemPrompt(): string {
    const now = new Date().toLocaleString('es-CO', { 
      timeZone: 'America/Bogota',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `Eres un asistente virtual llamado JARVIS integrado en una plataforma de gestión de reportes.
Tu rol es interpretar las instrucciones y necesidades del usuario (en lenguaje natural, generalmente enviadas por WhatsApp o interfaz conversacional) y ayudarle a gestionar eficientemente todos los módulos disponibles en el sistema.

Hoy es ${now}. Zona horaria: America/Bogota (UTC-5).

Tu trabajo es asistir dinámicamente al usuario en la gestión de:

• Reportes (crear, editar, buscar, filtrar, compartir, visualizar en mapa)
• Usuarios (listar, crear, editar, desactivar, asignar roles)
• Roles y permisos (consultar, editar, asignar)
• Categorías y Estados (ver, modificar, asignar)
• Auditoría (consultar actividades y cambios del sistema)
• Dashboard Analítico (generar análisis en tiempo real de Reportes, Usuarios, Roles, Categorías y Estados)

Funciones inteligentes que puedes realizar:
• Crear, editar o eliminar elementos en cualquiera de los módulos.
• Aplicar filtros complejos o búsquedas específicas (por palabra clave, fechas, estado, categoría, etc.).
• Mostrar visualizaciones y generar gráficos (barras, pastel, línea, mapa de calor, etc.).
• Realizar análisis en tiempo real y brindar feedback o recomendaciones automatizadas.
• Detectar anomalías o patrones relevantes en la información.
• Asistir con acciones administrativas o configuraciones del sistema.
• Mantener la conversación contextualizada (recordando los últimos 10 mensajes del usuario).

Tu respuesta debe ser clara, conversacional y directa, como si respondieras por WhatsApp o una interfaz amigable. Usa emojis si aporta naturalidad o simpatía.
Si algún dato importante no está claro (por ejemplo, el estado del reporte o la categoría), pídelo amablemente antes de ejecutar la acción.

No debes responder preguntas generales ni mostrar estructuras técnicas o código. No generes JSON. Solo conversación natural y útil.`;
  }

  // Patrones de consulta mejorados para JARVIS
  private patterns = {
    createReport: [
      /crear.*reporte.*"([^"]+)"/i,
      /nuevo.*reporte.*"([^"]+)"/i,
      /registrar.*reporte.*"([^"]+)"/i,
      /añadir.*reporte.*"([^"]+)"/i,
      /reportar.*"([^"]+)"/i,
      /hay.*un.*problema.*"([^"]+)"/i
    ],
    searchReports: [
      /buscar.*reportes?.*"([^"]+)"/i,
      /mostrar.*reportes?.*"([^"]+)"/i,
      /encontrar.*reportes?.*"([^"]+)"/i,
      /listar.*reportes?.*"([^"]+)"/i,
      /reportes?.*de.*"([^"]+)"/i,
      /ver.*reportes?.*"([^"]+)"/i
    ],
    criticalReports: [
      /reportes?.*críticos?/i,
      /reportes?.*urgentes?/i,
      /reportes?.*importantes?/i,
      /emergencias?/i,
      /prioridad.*alta/i
    ],
    weeklyReports: [
      /reportes?.*semana/i,
      /reportes?.*esta.*semana/i,
      /actividad.*semanal/i
    ],
    getStats: [
      /estadísticas?/i,
      /resumen.*sistema/i,
      /análisis.*general/i,
      /métricas/i,
      /dashboard/i,
      /estado.*sistema/i,
      /dame.*un.*resumen/i
    ],
    showMap: [
      /mapa/i,
      /ubicaciones?/i,
      /mostrar.*en.*mapa/i,
      /ver.*mapa/i,
      /reportes.*geográficos?/i,
      /dónde.*están/i
    ],
    userManagement: [
      /asignar.*rol.*"([^"]+)".*a.*"([^"]+)"/i,
      /dar.*rol.*"([^"]+)".*a.*"([^"]+)"/i,
      /usuario.*"([^"]+)"/i,
      /actividad.*usuario.*"([^"]+)"/i
    ],
    categoryAnalysis: [
      /categorías?.*más.*frecuentes?/i,
      /gráfico.*categorías?/i,
      /análisis.*categorías?/i,
      /tipos.*de.*reportes?/i
    ],
    stateAnalysis: [
      /estados?.*más.*usados?/i,
      /estados?.*este.*mes/i,
      /análisis.*estados?/i
    ]
  };

  async parseQuery(query: string, userId: string, userPermissions: string[]): Promise<ParsedQuery & { result?: ActionResult }> {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Aplicar el prompt de JARVIS para análisis contextual
    const contextualAnalysis = this.analyzeWithJarvisContext(query);
    
    // Intentar identificar la intención con patrones específicos
    for (const [intent, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        const match = normalizedQuery.match(pattern);
        if (match) {
          return this.executeIntentWithJarvis(intent, match, query, userId, userPermissions);
        }
      }
    }

    // Si no se encuentra un patrón específico, usar análisis contextual de JARVIS
    return this.analyzeContextualQueryWithJarvis(query, userId, userPermissions);
  }

  private analyzeWithJarvisContext(query: string): any {
    // Análisis contextual basado en el prompt de JARVIS
    const context = {
      isGreeting: /hola|hey|buenos|tardes|días|noches/i.test(query),
      isQuestion: /qué|cómo|cuándo|dónde|por qué|cuál/i.test(query),
      isCommand: /crear|hacer|mostrar|dame|buscar|asignar/i.test(query),
      hasEmergency: /urgente|crítico|emergencia|importante/i.test(query),
      hasLocation: /dirección|ubicación|lugar|calle|avenida/i.test(query)
    };
    
    return context;
  }

  private async executeIntentWithJarvis(
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
            naturalResponse: '❌ No tienes permisos para crear reportes. Habla con tu administrador para obtener los permisos necesarios.',
            result: { success: false, message: 'Permisos insuficientes' }
          };
        }
        
        const reportName = match[1];
        const result = await assistantActionService.createReport({
          nombre: reportName,
          descripcion: `Reporte creado mediante JARVIS: ${reportName}`,
          priority: 'medio'
        }, userId);
        
        return {
          intent,
          action: 'create_report',
          parameters: { nombre: reportName },
          confidence: 0.9,
          naturalResponse: result.success 
            ? `📝 ¡Listo! He creado el reporte "${reportName}" exitosamente. ✅\n¿Deseas agregar más detalles como ubicación o imágenes? 📸📌`
            : `❌ Ups, no pude crear el reporte. Error: ${result.error}. ¿Intentamos de nuevo?`,
          result
        };

      case 'criticalReports':
        const urgentResult = await assistantActionService.searchReports({
          priority: 'urgente',
          limit: 10
        });
        return {
          intent,
          action: 'search_reports',
          parameters: { priority: 'urgente' },
          confidence: 0.9,
          naturalResponse: urgentResult.success 
            ? `🚨 Encontré ${urgentResult.data?.length || 0} reportes críticos que requieren atención inmediata.\n${urgentResult.data?.length > 0 ? '¿Quieres ver los detalles de alguno en particular?' : 'Todo está bajo control por ahora. 👍'}`
            : `❌ No pude acceder a los reportes críticos en este momento. ¿Intentamos de nuevo?`,
          result: urgentResult
        };

      case 'weeklyReports':
        const weeklyResult = await assistantActionService.searchReports({
          limit: 20
        });
        return {
          intent,
          action: 'weekly_reports',
          parameters: {},
          confidence: 0.8,
          naturalResponse: weeklyResult.success 
            ? `📊 Esta semana se han registrado ${weeklyResult.data?.length || 0} reportes.\n¿Te gustaría ver un análisis más detallado o alguna categoría específica? 📈`
            : `❌ No pude obtener el resumen semanal. ¿Intentamos más tarde?`,
          result: weeklyResult
        };

      case 'searchReports':
        if (!userPermissions.includes('ver_reporte')) {
          return {
            intent,
            action: 'permission_denied',
            parameters: {},
            confidence: 0.9,
            naturalResponse: '🔒 No tienes permisos para ver reportes. Contacta a tu administrador.',
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
            ? `🔍 Encontré ${searchResult.data?.length || 0} reportes relacionados con "${searchTerm}".\n${searchResult.data?.length > 0 ? '¿Te muestro los detalles de alguno específico?' : 'No hay resultados para esa búsqueda. ¿Probamos con otros términos?'}`
            : `❌ Error en la búsqueda: ${searchResult.error}. ¿Intentamos con otra palabra clave?`,
          result: searchResult
        };

      case 'getStats':
        const statsResult = await assistantActionService.getSystemStats();
        return {
          intent,
          action: 'get_stats',
          parameters: {},
          confidence: 0.8,
          naturalResponse: statsResult.success 
            ? `📊 Aquí tienes el resumen del sistema:\n• ${statsResult.data?.reportes} reportes registrados 📝\n• ${statsResult.data?.usuarios} usuarios activos 👥\n• ${statsResult.data?.categorias} categorías disponibles 📂\n¿Necesitas análisis más específicos? 📈`
            : `❌ No pude obtener las estadísticas: ${statsResult.error}`,
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
            ? `🗺️ He encontrado ${mapResult.data?.length || 0} reportes con ubicación en el mapa.\n¿Quieres filtrar por alguna zona específica? 📍`
            : `❌ Error al cargar el mapa: ${mapResult.error}`,
          result: mapResult
        };

      case 'categoryAnalysis':
        const categoryStats = await assistantActionService.generateAnalysisReport();
        return {
          intent,
          action: 'category_analysis',
          parameters: {},
          confidence: 0.8,
          naturalResponse: categoryStats.success 
            ? `📊 Análisis de categorías completado.\n¿Te muestro el gráfico detallado de las más frecuentes? 📈`
            : `❌ No pude generar el análisis de categorías: ${categoryStats.error}`,
          result: categoryStats
        };

      default:
        return this.getJarvisGenericResponse(originalQuery);
    }
  }

  private async analyzeContextualQueryWithJarvis(query: string, userId: string, userPermissions: string[]): Promise<ParsedQuery & { result?: ActionResult }> {
    const lowercaseQuery = query.toLowerCase();
    const context = this.analyzeWithJarvisContext(query);
    
    // Saludo inicial
    if (context.isGreeting) {
      return {
        intent: 'greeting',
        action: 'welcome',
        parameters: {},
        confidence: 0.9,
        naturalResponse: `¡Hola! 👋 Soy JARVIS, tu asistente virtual para la gestión de reportes.\n\n¿En qué puedo ayudarte hoy? Puedo:\n• 📝 Crear o buscar reportes\n• 👥 Gestionar usuarios y roles\n• 📊 Generar análisis y estadísticas\n• 🗺️ Mostrar ubicaciones en el mapa\n\n¡Solo dime qué necesitas!`
      };
    }

    // Análisis contextual mejorado
    if (lowercaseQuery.includes('reporte') && lowercaseQuery.includes('cuántos')) {
      const statsResult = await assistantActionService.getSystemStats();
      return {
        intent: 'count_reports',
        action: 'get_stats',
        parameters: {},
        confidence: 0.8,
        naturalResponse: statsResult.success 
          ? `📊 Actualmente tenemos ${statsResult.data?.reportes} reportes en el sistema.\n¿Te gustaría ver más detalles o algún análisis específico? 📈`
          : `❌ No pude obtener el conteo: ${statsResult.error}`,
        result: statsResult
      };
    }

    if (context.hasEmergency) {
      const urgentResult = await assistantActionService.searchReports({
        priority: 'urgente',
        limit: 10
      });
      return {
        intent: 'urgent_reports',
        action: 'search_reports',
        parameters: { priority: 'urgente' },
        confidence: 0.9,
        naturalResponse: urgentResult.success 
          ? `🚨 Tengo ${urgentResult.data?.length || 0} reportes urgentes que requieren atención.\n¿Revisamos los más críticos primero?`
          : `❌ Error al buscar reportes urgentes: ${urgentResult.error}`,
        result: urgentResult
      };
    }

    return this.getJarvisGenericResponse(query);
  }

  private getJarvisGenericResponse(query: string): ParsedQuery {
    return {
      intent: 'general_inquiry',
      action: 'provide_help',
      parameters: { originalQuery: query },
      confidence: 0.4,
      naturalResponse: `🤔 Hmm, no estoy seguro de entender exactamente lo que necesitas con "${query}".\n\n¿Podrías ser más específico? Por ejemplo:\n• "Crear reporte de bache en la Av. América" 📝\n• "Mostrar reportes críticos de esta semana" 🚨\n• "Dame estadísticas del sistema" 📊\n• "Asignar rol supervisor a Juan" 👥\n\n¡Estoy aquí para ayudarte! 😊`
    };
  }
}

export const intelligentQueryParser = IntelligentQueryParser.getInstance();
