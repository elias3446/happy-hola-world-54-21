
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
  private geminiApiKey: string | null = null;
  
  static getInstance(): JarvisIntelligenceService {
    if (!JarvisIntelligenceService.instance) {
      JarvisIntelligenceService.instance = new JarvisIntelligenceService();
    }
    return JarvisIntelligenceService.instance;
  }

  private async getGeminiApiKey(): Promise<string | null> {
    if (this.geminiApiKey) return this.geminiApiKey;
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('get-gemini-key');
      
      if (error || !data?.apiKey) {
        console.error('Error obteniendo API key de Gemini:', error);
        return null;
      }
      
      this.geminiApiKey = data.apiKey;
      return this.geminiApiKey;
    } catch (error) {
      console.error('Error conectando con Supabase para obtener API key:', error);
      return null;
    }
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

    // Paso 2: Obtener API key de Gemini
    const apiKey = await this.getGeminiApiKey();
    
    if (!apiKey) {
      return {
        id: Date.now().toString(),
        userQuery: query,
        response: '❌ No se pudo conectar con el sistema de inteligencia artificial. Verifica la configuración de API.',
        actionPerformed: false,
        timestamp: new Date(),
        userInfo,
        confidence: 0
      };
    }

    // Paso 3: Construir el prompt para Gemini con el contexto del usuario
    const systemPrompt = this.getJarvisSystemPrompt(userInfo);

    console.log('🧠 JARVIS: Enviando consulta a Gemini con contexto de permisos...');

    try {
      const geminiResponse = await this.callGeminiWithContext(apiKey, systemPrompt, query);
      
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
      
      const userName = userInfo.firstName || userInfo.email.split('@')[0];
      
      return {
        id: Date.now().toString(),
        userQuery: query,
        response: `😅 Disculpa ${userName}, tuve un problema técnico al procesar tu solicitud.

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

  private async callGeminiWithContext(apiKey: string, systemPrompt: string, userQuery: string): Promise<string> {
    const GEMINI_MODEL = 'gemini-1.5-flash-latest';
    
    console.log('🌟 JARVIS: Llamando a Gemini API...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ 
                text: `${systemPrompt}\n\nUsuario pregunta: "${userQuery}"\n\nPor favor, responde de manera contextual considerando sus permisos y capacidades actuales.`
              }],
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            topP: 0.95,
            topK: 40,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error desde API Gemini:', errorData);
      throw new Error(errorData.error?.message || `Error ${response.status} de la API de Gemini`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
      const botResponseText = data.candidates[0].content.parts[0].text;
      console.log('✅ JARVIS: Respuesta recibida de Gemini');
      return botResponseText;
    } else if (data.promptFeedback && data.promptFeedback.blockReason) {
      const reason = data.promptFeedback.blockReason;
      console.warn('⚠️ JARVIS: Respuesta bloqueada por Gemini:', reason);
      throw new Error(`Respuesta bloqueada por políticas de contenido: ${reason}`);
    } else {
      console.error('Respuesta inesperada de Gemini:', data);
      throw new Error('Respuesta inesperada de la API de Gemini.');
    }
  }

  async generateWelcomeMessage(): Promise<JarvisResponse> {
    // Esta función ya no se usa, pero la mantengo por compatibilidad
    const userInfo = await userPermissionService.getCurrentUserInfo();
    
    return {
      id: 'welcome-disabled',
      userQuery: 'Inicialización',
      response: 'Chat iniciado sin mensaje de bienvenida',
      actionPerformed: false,
      timestamp: new Date(),
      userInfo: userInfo || {} as UserInfo,
      confidence: 1.0
    };
  }
}

export const jarvisIntelligenceService = JarvisIntelligenceService.getInstance();
