
import { userPermissionService, UserInfo } from './userPermissionService';
import { useGeminiChat } from '@/hooks/useGeminiChat';

export interface JarvisResponse {
  id: string;
  userQuery: string;
  response: string;
  actionPerformed?: boolean;
  actionResult?: any;
  timestamp: Date;
  userInfo: UserInfo;
  confidence: number;
}

export class JarvisIntelligenceService {
  private static instance: JarvisIntelligenceService;
  
  static getInstance(): JarvisIntelligenceService {
    if (!JarvisIntelligenceService.instance) {
      JarvisIntelligenceService.instance = new JarvisIntelligenceService();
    }
    return JarvisIntelligenceService.instance;
  }

  private getJarvisSystemPrompt(userInfo: UserInfo): string {
    const now = new Date().toLocaleString('es-CO', { 
      timeZone: 'America/Bogota',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `Eres JARVIS, un asistente virtual inteligente para gestión de reportes.

INFORMACIÓN DEL USUARIO ACTUAL:
- Nombre: ${userInfo.firstName || 'No especificado'} ${userInfo.lastName || ''}
- Email: ${userInfo.email}
- Es Administrador: ${userInfo.isAdmin ? 'SÍ' : 'NO'}
- Roles: ${userInfo.roles.map(r => r.nombre).join(', ') || 'Sin roles'}
- Permisos disponibles: ${userInfo.allPermissions.join(', ') || 'Sin permisos específicos'}

FECHA Y HORA ACTUAL: ${now} (Zona horaria: America/Bogota UTC-5)

CAPACIDADES BASADAS EN PERMISOS DEL USUARIO:
${this.generateCapabilitiesText(userInfo)}

INSTRUCCIONES:
1. Responde SIEMPRE en español de manera conversacional y amigable
2. Usa emojis apropiados para hacer la conversación más natural
3. Si el usuario solicita una acción que NO tiene permisos para realizar, explícale claramente qué permisos necesita y sugiere alternativas
4. Proporciona respuestas contextuales basadas en los permisos reales del usuario
5. Mantén un tono profesional pero amigable, como si fueras un asistente personal
6. Si no estás seguro de algo, pregunta por más detalles antes de proceder

IMPORTANTE: Solo puedes realizar acciones para las cuales el usuario tiene permisos explícitos.`;
  }

  private generateCapabilitiesText(userInfo: UserInfo): string {
    const capabilities = [];
    
    if (userInfo.allPermissions.includes('ver_reporte')) {
      capabilities.push('📊 Ver y consultar reportes');
    }
    if (userInfo.allPermissions.includes('crear_reporte')) {
      capabilities.push('📝 Crear nuevos reportes');
    }
    if (userInfo.allPermissions.includes('editar_reporte')) {
      capabilities.push('✏️ Editar reportes existentes');
    }
    if (userInfo.allPermissions.includes('eliminar_reporte')) {
      capabilities.push('🗑️ Eliminar reportes');
    }
    if (userInfo.allPermissions.includes('ver_usuario')) {
      capabilities.push('👥 Ver información de usuarios');
    }
    if (userInfo.allPermissions.includes('crear_usuario')) {
      capabilities.push('➕ Crear nuevos usuarios');
    }
    if (userInfo.allPermissions.includes('crear_rol') || userInfo.allPermissions.includes('editar_rol')) {
      capabilities.push('🎭 Gestionar roles y permisos');
    }
    if (userInfo.allPermissions.includes('crear_categoria') || userInfo.allPermissions.includes('editar_categoria')) {
      capabilities.push('📂 Gestionar categorías');
    }
    if (userInfo.allPermissions.includes('crear_estado') || userInfo.allPermissions.includes('editar_estado')) {
      capabilities.push('🔄 Gestionar estados');
    }

    if (capabilities.length === 0) {
      return '⚠️ PERMISOS LIMITADOS: El usuario tiene acceso muy restringido al sistema.';
    }

    return capabilities.join('\n');
  }

  async processUserQuery(query: string): Promise<JarvisResponse> {
    console.log('🤖 JARVIS: Procesando consulta del usuario:', query);
    
    // Paso 1: Obtener información actualizada del usuario
    const userInfo = await userPermissionService.getCurrentUserInfo();
    
    if (!userInfo) {
      return {
        id: Date.now().toString(),
        userQuery: query,
        response: '❌ Lo siento, no puedo verificar tu identidad en este momento. Por favor, asegúrate de estar correctamente autenticado.',
        actionPerformed: false,
        timestamp: new Date(),
        userInfo: {} as UserInfo,
        confidence: 0
      };
    }

    console.log('✅ JARVIS: Usuario identificado:', userInfo.email, 'con', userInfo.allPermissions.length, 'permisos');

    // Paso 2: Construir el prompt para Gemini con el contexto del usuario
    const systemPrompt = this.getJarvisSystemPrompt(userInfo);
    const userPrompt = `Usuario pregunta: "${query}"

Por favor, responde de manera contextual considerando sus permisos y capacidades actuales.`;

    console.log('🧠 JARVIS: Enviando consulta a Gemini con contexto de permisos...');

    try {
      // Aquí integraremos con Gemini - por ahora simulamos la respuesta
      const geminiResponse = await this.callGeminiWithContext(systemPrompt, userPrompt);
      
      return {
        id: Date.now().toString(),
        userQuery: query,
        response: geminiResponse,
        actionPerformed: false,
        timestamp: new Date(),
        userInfo,
        confidence: 0.9
      };

    } catch (error) {
      console.error('💥 JARVIS: Error procesando con Gemini:', error);
      
      return {
        id: Date.now().toString(),
        userQuery: query,
        response: `😅 Disculpa ${userInfo.firstName || userInfo.email.split('@')[0]}, tuve un problema técnico. 

🔍 Pero puedo decirte que tienes estos permisos disponibles:
${userInfo.allPermissions.length > 0 ? userInfo.allPermissions.map(p => `• ${p}`).join('\n') : '• Sin permisos específicos asignados'}

¿Podrías repetir tu solicitud?`,
        actionPerformed: false,
        timestamp: new Date(),
        userInfo,
        confidence: 0.3
      };
    }
  }

  private async callGeminiWithContext(systemPrompt: string, userPrompt: string): Promise<string> {
    // Por ahora, retornamos una respuesta simulada
    // En el siguiente paso integraremos con el hook de Gemini real
    return `¡Hola! Soy JARVIS y he analizado tus permisos en el sistema. 

Basándome en tu consulta y tus capacidades actuales, puedo ayudarte con las funciones para las que tienes autorización.

¿Qué específicamente te gustaría hacer? 🤖`;
  }

  async generateWelcomeMessage(): Promise<JarvisResponse> {
    const userInfo = await userPermissionService.getCurrentUserInfo();
    
    if (!userInfo) {
      return {
        id: 'welcome-error',
        userQuery: 'Inicialización',
        response: '❌ No se pudo cargar la información del usuario. Por favor, verifica tu autenticación.',
        actionPerformed: false,
        timestamp: new Date(),
        userInfo: {} as UserInfo,
        confidence: 0
      };
    }

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
    const userName = userInfo.firstName || userInfo.email.split('@')[0];

    const welcomeMessage = `${greeting}, ${userName}! 👋

Soy JARVIS, tu asistente virtual inteligente para gestión de reportes.

📋 **Tu información actual:**
• Email: ${userInfo.email}
• Roles: ${userInfo.roles.map(r => r.nombre).join(', ') || 'Sin roles asignados'}
• Nivel: ${userInfo.isAdmin ? 'Administrador 🔑' : 'Usuario estándar 👤'}
• Permisos activos: ${userInfo.allPermissions.length} disponibles

🎯 **Capacidades disponibles para ti:**
${this.generateCapabilitiesText(userInfo)}

💬 **¿Cómo puedo ayudarte hoy?**
Simplemente dime qué necesitas en lenguaje natural y yo me encargaré del resto, respetando siempre tus permisos de acceso.`;

    return {
      id: 'welcome-message',
      userQuery: 'Inicialización',
      response: welcomeMessage,
      actionPerformed: false,
      timestamp: new Date(),
      userInfo,
      confidence: 1.0
    };
  }
}

export const jarvisIntelligenceService = JarvisIntelligenceService.getInstance();
