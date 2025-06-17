import { useState, useEffect, useCallback } from 'react';
import { Message, GeminiMessageContent } from '@/types/chat';
import { toast } from "@/hooks/use-toast";
import { ragService } from '@/services/ragService';
import { supabase } from '@/integrations/supabase/client';

const CONVERSATION_CONTEXT_KEY = 'conversationContext';
const CONVERSATION_MEMORY_KEY = 'conversationMemory';
// Usaremos gemini-1.5-flash-latest que es rápido y potente.
const GEMINI_MODEL = 'gemini-1.5-flash-latest'; 

export const useGeminiChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [conversationContext, setConversationContext] = useState<string>('');
  const [conversationMemory, setConversationMemory] = useState<Record<string, any>>({});
  const [isDocumentUploaderOpen, setIsDocumentUploaderOpen] = useState(false);

  // Recuperar información guardada del localStorage y API key de Supabase
  useEffect(() => {
    const storedContext = localStorage.getItem(CONVERSATION_CONTEXT_KEY);
    const storedMemory = localStorage.getItem(CONVERSATION_MEMORY_KEY);
    
    // Obtener API key desde Supabase Edge Function
    const getApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-gemini-key');
        if (error) {
          console.error('Error obteniendo API key:', error);
          toast({ title: "Error", description: "No se pudo obtener la API key de Gemini.", variant: "destructive" });
        } else if (data?.apiKey) {
          setApiKey(data.apiKey);
          ragService.setApiKey(data.apiKey);
        }
      } catch (error) {
        console.error('Error al conectar con Supabase:', error);
        toast({ title: "Error", description: "Error de conexión con el servidor.", variant: "destructive" });
      }
    };

    getApiKey();

    if (storedContext) {
      setConversationContext(storedContext);
    }

    if (storedMemory) {
      try {
        setConversationMemory(JSON.parse(storedMemory));
      } catch (e) {
        console.error("Error parsing conversation memory:", e);
      }
    }
  }, []);

  // Guardar el contexto y memoria en localStorage cuando cambian
  useEffect(() => {
    if (conversationContext) {
      localStorage.setItem(CONVERSATION_CONTEXT_KEY, conversationContext);
    }
    
    if (Object.keys(conversationMemory).length > 0) {
      localStorage.setItem(CONVERSATION_MEMORY_KEY, JSON.stringify(conversationMemory));
    }
  }, [conversationContext, conversationMemory]);

  const addMessage = (text: string, sender: "user" | "bot", retrievedDocuments?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      retrievedDocuments
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    return newMessage;
  };

  // Función para actualizar el contexto resumido de la conversación
  const updateConversationContext = async (userMessageText: string, botResponse: string) => {
    if (!apiKey) return;
    
    try {
      // Solo si ya tenemos suficiente conversación para resumir (al menos 3 intercambios)
      if (messages.length >= 6) {
        // Solicitamos a Gemini que actualice nuestro contexto resumido
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                role: 'user',
                parts: [{ 
                  text: `Por favor, actualiza este resumen del contexto de nuestra conversación 
                  para incluir la nueva información relevante:

                  Contexto actual: "${conversationContext}"
                  
                  Mi último mensaje: "${userMessageText}"
                  
                  Tu respuesta: "${botResponse}"
                  
                  Crea un nuevo resumen conciso que capture los puntos clave y la información importante 
                  que has aprendido sobre mí o sobre el tema que estamos discutiendo. 
                  Esta información te ayudará a mantener el contexto en futuras interacciones.
                  No uses más de 200 palabras y enfócate solo en información relevante y significativa.
                  NO INCLUYAS FRASES COMO "El contexto actualizado es" o similar. SOLO EL CONTENIDO DEL RESUMEN`
                }],
              }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 300,
              }
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.candidates && data.candidates.length > 0) {
            const newContext = data.candidates[0].content.parts[0].text.trim();
            setConversationContext(newContext);
          }
        }
      } else if (!conversationContext) {
        // Si es una de las primeras interacciones, establecemos un contexto inicial
        setConversationContext(`La conversación comenzó. El usuario dijo: "${userMessageText}".`);
      }
    } catch (error) {
      console.error("Error al actualizar el contexto:", error);
    }
  };

  // Función mejorada para detectar y guardar información personal sin modificar datos existentes
  const updateMemory = async (userMessageText: string, botResponse: string) => {
    if (!apiKey) return;
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ 
                text: `Analiza esta interacción para extraer NUEVA información personal relevante del usuario:
                
                Mensaje del usuario: "${userMessageText}"
                Tu respuesta: "${botResponse}"
                
                INSTRUCCIONES IMPORTANTES:
                1. Extrae SOLO información nueva o actualizada sobre el usuario (nombres, apellidos, apodos, preferencias, datos personales, etc.)
                2. NUNCA modifiques información existente a menos que sea explícitamente corregida por el usuario
                3. Genera un objeto JSON limpio con la nueva información identificada
                4. Si detectas información contradictoria, MANTÉN la nueva versión proporcionada por el usuario
                
                Información ya conocida sobre el usuario:
                ${JSON.stringify(conversationMemory, null, 2)}
                
                RESPONDE ÚNICAMENTE con un objeto JSON válido. Si no hay información nueva, devuelve un objeto vacío {}.
                No incluyas texto explicativo, solo el JSON. Formato:
                {
                  "clave1": "valor1",
                  "clave2": "valor2"
                }`
              }],
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 500,
            }
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
          const memoryText = data.candidates[0].content.parts[0].text.trim();
          
          try {
            // Extrae solo el objeto JSON de la respuesta
            const jsonMatch = memoryText.match(/(\{[\s\S]*\})/);
            if (jsonMatch && jsonMatch[0]) {
              const newMemoryObject = JSON.parse(jsonMatch[0]);
              
              console.log("Nueva información detectada:", newMemoryObject);
              
              // Solo actualizar con nuevos datos, sin modificar los existentes
              if (Object.keys(newMemoryObject).length > 0) {
                setConversationMemory(prevMemory => {
                  const updatedMemory = { ...prevMemory };
                  
                  // Añadir solo datos nuevos o actualizados explícitamente
                  Object.entries(newMemoryObject).forEach(([key, value]) => {
                    // Si es un nuevo campo o si el usuario lo actualizó explícitamente
                    if (userMessageText.toLowerCase().includes(key.toLowerCase()) || 
                        !updatedMemory.hasOwnProperty(key)) {
                      updatedMemory[key] = value;
                    }
                  });
                  
                  console.log("Memoria actualizada:", updatedMemory);
                  return updatedMemory;
                });
              }
            }
          } catch (error) {
            console.error("Error al procesar la memoria:", error, "Texto recibido:", memoryText);
          }
        }
      }
    } catch (error) {
      console.error("Error al actualizar la memoria:", error);
    }
  };

  // Función para detectar si la entrada del usuario contiene una solicitud de acción
  const isActionRequest = (userText: string): boolean => {
    const actionPatterns = [
      /\b(crear|crea|haz|has|genera|generar|añade|añadir|agrega|agregar|construye|construir|produce|producir)\b/i,
      /\b(ejecuta|ejecutar|realiza|realizar|implementa|implementar|desarrolla|desarrollar|lleva a cabo|llevar a cabo)\b/i,
      /\b(modifica|modificar|cambia|cambiar|actualiza|actualizar|edita|editar|ajusta|ajustar|corrige|corregir)\b/i,
      /\b(elimina|eliminar|borra|borrar|quita|quitar|remueve|remover|descarta|descartar)\b/i,
      /\b(muestra|mostrar|enseña|enseñar|visualiza|visualizar|ver|ve)\b/i,
      /\b(busca|buscar|encuentra|encontrar|localiza|localizar|explora|explorar|recupera|recuperar)\b/i,
      /\b(configura|configurar|establece|establecer|define|definir|ajusta|ajustar|personaliza|personalizar)\b/i,
      /\b(calcula|calcular|computa|computar|procesa|procesar|evalúa|evaluar|estima|estimar)\b/i,
      /\b(organiza|organizar|clasifica|clasificar|ordena|ordenar|estructura|estructurar)\b/i,
      /\b(analiza|analizar|examina|examinar|evalúa|evaluar|revisa|revisar|inspecciona|inspeccionar)\b/i,
      /\b(optimiza|optimizar|mejora|mejorar|refina|refinar|perfecciona|perfeccionar)\b/i,
      /\b(sugiere|sugerir|recomienda|recomendar|propone|proponer|ofrece|ofrecer)\b/i,
      /\b(consulta|consultar|pregunta|preguntar|interroga|interrogar|indaga|indagar)\b/i,
      /\b(guarda|guardar|almacena|almacenar|registra|registrar|documenta|documentar)\b/i,
      /\b(visualiza|visualizar|muestra|mostrar|ilustra|ilustrar|expone|exponer)\b/i,
    ];
    
    return actionPatterns.some(pattern => pattern.test(userText));
  };

  // Extraer partes de la respuesta (acción, preguntas, recomendaciones)
  const extractResponseParts = (text: string): { 
    actionResponse: string, 
    followupQuestions: string | null,
    recommendations: string | null 
  } => {
    // Patrones para identificar cada sección
    const recommendationsPattern = /RECOMENDACIONES:[\s\S]*$/i;
    const questionsPattern = /PREGUNTAS ADICIONALES:[\s\S]*?(RECOMENDACIONES:|$)/i;
    
    let remainingText = text;
    let recommendations = null;
    let followupQuestions = null;
    
    // Extraer recomendaciones primero
    const recsMatch = remainingText.match(recommendationsPattern);
    if (recsMatch) {
      recommendations = recsMatch[0];
      remainingText = remainingText.replace(recommendationsPattern, '').trim();
    }
    
    // Extraer preguntas adicionales
    const questionsMatch = remainingText.match(questionsPattern);
    if (questionsMatch) {
      // Eliminar "RECOMENDACIONES:" si está al final del texto de preguntas
      followupQuestions = questionsMatch[0].replace(/RECOMENDACIONES:$/, '').trim();
      remainingText = remainingText.replace(questionsPattern, '').trim();
    }
    
    return { 
      actionResponse: remainingText, 
      followupQuestions, 
      recommendations 
    };
  };

  const sendMessageToGemini = useCallback(async (userMessageText: string) => {
    if (!apiKey) {
      toast({ title: "Error", description: "API Key de Gemini no disponible.", variant: "destructive" });
      return;
    }

    addMessage(userMessageText, "user");
    setIsLoading(true);

    try {
      // Implementación de RAG: Recuperar documentos relevantes
      console.log("Iniciando recuperación de documentos relevantes para:", userMessageText);
      const relevantDocs = await ragService.retrieveRelevantDocuments(userMessageText);
      console.log("Documentos relevantes recuperados:", relevantDocs);
      
      // Variable para indicar si los documentos son realmente útiles
      const hasRelevantDocs = relevantDocs.length > 0;
      
      // Documentos para incluir en el contexto de Gemini solo si son relevantes
      const docsContext = hasRelevantDocs 
        ? `DOCUMENTOS RELEVANTES PARA RESPONDER:
          ${relevantDocs.map((doc, i) => `
          DOCUMENTO ${i + 1} - ${doc.metadata?.title || 'Sin título'}:
          ${doc.content.trim()}
          `).join('\n\n')}`
        : '';

      // Preparamos el contenido para enviar a Gemini
      const recentMessages = messages
        .slice(-6) // Tomamos solo los mensajes más recientes (3 intercambios)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        })) as GeminiMessageContent[];
      
      // Construimos un prompt con el contexto, memoria y mensajes recientes
      let memoryContext = "";
      if (Object.keys(conversationMemory).length > 0) {
        memoryContext = "Información importante sobre el usuario:\n" + 
          Object.entries(conversationMemory)
            .map(([key, value]) => `- ${key}: ${value}`)
            .join("\n");
      }

      const nombrePreferido = conversationMemory.nombrePreferido || 
                             conversationMemory.nombre ||
                             conversationMemory.nombreReal || 
                             "el usuario";

      // Detectamos si es una solicitud de acción
      const actionRequested = isActionRequest(userMessageText);

      // Sistema prompt especializado para asistente de gestión con información del usuario
      const systemPrompt: GeminiMessageContent = {
        role: 'model',
        parts: [{ text: `Eres un ASISTENTE INTELIGENTE DE GESTIÓN DE SISTEMAS especializado en ayudar con la administración completa de una plataforma de reportes y gestión de usuarios.

        INFORMACIÓN DEL USUARIO ACTUAL (DATOS REALES DEL SISTEMA):
        - Email: ${conversationMemory.email || 'usuario@sistema.com'}
        - Nombre preferido: ${nombrePreferido}
        - Es administrador: ${conversationMemory.isAdmin || 'No definido'}
        - Permisos disponibles: ${conversationMemory.permissions || 'Consultando...'}
        - ID de usuario: ${conversationMemory.userId || 'Sistema'}
        
        CONTEXTO DEL SISTEMA ACTUAL:
        - Sistema de gestión con reportes, usuarios, roles, categorías, estados y auditoría
        - Usuario actual conectado y autenticado en el sistema
        - Tienes acceso a datos en tiempo real del sistema y del usuario
        - Puedes ejecutar acciones reales del sistema según los permisos del usuario
        - Conoces el estado actual de reportes, usuarios y configuraciones
        
        ${conversationContext ? `CONTEXTO DE LA CONVERSACIÓN:\n${conversationContext}\n\n` : ''}
        ${memoryContext ? `${memoryContext}\n\n` : ''}
        
        ${hasRelevantDocs ? `
        INFORMACIÓN DE DOCUMENTOS:
        ${docsContext}
        
        INSTRUCCIONES CRÍTICAS SOBRE DOCUMENTOS:
        - Usa la información de los documentos cuando sea relevante para la consulta
        - Menciona explícitamente cuando uses información de documentos
        ` : ''}
        
        CAPACIDADES COMO ASISTENTE INTELIGENTE:
        1. EJECUTAR ACCIONES REALES DEL SISTEMA:
           - Crear/editar/eliminar reportes, usuarios, roles (según permisos del usuario)
           - Generar gráficos y análisis dinámicos personalizados
           - Navegar a secciones específicas del sistema
           - Exportar datos y generar reportes con información del usuario
           - Mostrar información personalizada del usuario actual
           
        2. ANÁLISIS INTELIGENTE PERSONALIZADO:
           - Analizar métricas del sistema según el rol del usuario
           - Generar insights y recomendaciones contextuales para ${nombrePreferido}
           - Crear visualizaciones dinámicas basadas en permisos
           - Detectar patrones y tendencias relevantes para el usuario actual
           
        3. GESTIÓN PROACTIVA PERSONALIZADA:
           - Sugerir acciones basadas en el estado del sistema y rol del usuario
           - Recordatorios y alertas personalizadas para ${nombrePreferido}
           - Optimizaciones de flujo de trabajo según permisos
           - Resolución de problemas específicos del usuario

        INSTRUCCIONES CRÍTICAS:
        1. SIEMPRE actúa como un asistente que CONOCE al usuario actual y sus permisos
        2. Cuando el usuario pida algo, HAZLO inmediatamente si tiene permisos
        3. Personaliza TODAS las respuestas usando el nombre del usuario (${nombrePreferido})
        4. Ofrece opciones concretas y ejecutables según los permisos del usuario
        5. Proporciona análisis basados en datos reales del sistema y usuario
        6. Sugiere mejoras específicas para el rol y permisos del usuario actual
        7. SIEMPRE menciona información específica del usuario cuando sea relevante
        8. Utiliza los datos reales del sistema para dar respuestas precisas

        ${actionRequested ? `
        FORMATO DE RESPUESTA PARA ACCIONES (OBLIGATORIO):
        1. EJECUTA la acción inmediatamente (si ${nombrePreferido} tiene permisos)
        2. CONFIRMA qué has hecho específicamente para ${nombrePreferido}
        3. INCLUYE "PREGUNTAS ADICIONALES:" para información que mejoraría el resultado
        4. INCLUYE "RECOMENDACIONES:" con sugerencias relacionadas y próximos pasos personalizados
        5. SÉ ESPECÍFICO sobre qué datos o métricas del usuario has usado
        ` : `
        RESPUESTA NORMAL:
        - Proporciona información útil y específica del sistema para ${nombrePreferido}
        - Ofrece acciones concretas que puede ejecutar según sus permisos
        - Menciona métricas relevantes del sistema y del usuario
        - Personaliza la respuesta con información del usuario actual
        `}

        IMPORTANTE: Eres un asistente PERSONAL que conoce a ${nombrePreferido}, sus permisos, y puede ejecutar tareas reales del sistema.` }]
      };
      
      console.log("Construyendo mensaje para Gemini con información del usuario:", nombrePreferido);
      console.log("Permisos del usuario:", conversationMemory.permissions);
      
      const currentMessageContent: GeminiMessageContent[] = [
        systemPrompt,
        ...recentMessages,
        { role: 'user', parts: [{ text: userMessageText }] }
      ];

      console.log("Enviando solicitud a Gemini");
      
      // Agregamos un parámetro adicional para asegurar que Gemini comprenda la urgencia de usar documentos cuando sean relevantes
      const generationConfig = {
        temperature: hasRelevantDocs ? 0.3 : 0.6, // Temperatura más baja cuando hay documentos para ser más preciso
        maxOutputTokens: 1200,
        topP: 0.95,
        topK: hasRelevantDocs ? 20 : 40, // Más restrictivo cuando hay documentos relevantes
      };
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            contents: currentMessageContent,
            generationConfig
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
        console.log("Respuesta recibida de Gemini");
        
        // Analizamos si la respuesta realmente contiene información de los documentos
        const responseContainsDocInfo = hasRelevantDocs && (
          botResponseText.toLowerCase().includes("según los documentos") ||
          botResponseText.toLowerCase().includes("en los documentos") ||
          botResponseText.toLowerCase().includes("documento mencionado") ||
          botResponseText.toLowerCase().includes("documentos proporcionados")
        );
        
        console.log("¿Respuesta contiene referencia a documentos?", responseContainsDocInfo);
        
        // Solo añadimos los IDs de documentos si realmente fueron mencionados en la respuesta
        const docIds = responseContainsDocInfo ? relevantDocs.map(doc => doc.id) : undefined;
        
        // Extraer partes de la respuesta para mostrarlas en mensajes separados
        const { actionResponse, followupQuestions, recommendations } = extractResponseParts(botResponseText);
        
        // Añadir la respuesta principal (acción ejecutada)
        addMessage(actionResponse, "bot", docIds);
        
        // Si hay preguntas adicionales, añadirlas como un mensaje separado
        if (followupQuestions) {
          setTimeout(() => {
            addMessage(followupQuestions, "bot");
          }, 500);
        }
        
        // Si hay recomendaciones, añadirlas como un mensaje separado después
        if (recommendations) {
          setTimeout(() => {
            addMessage(recommendations, "bot");
          }, followupQuestions ? 1000 : 500);
        }
        
        // Actualizamos el contexto y la memoria en segundo plano
        updateConversationContext(userMessageText, botResponseText);
        updateMemory(userMessageText, botResponseText);
      } else if (data.promptFeedback && data.promptFeedback.blockReason) {
        // Contenido bloqueado por filtros de seguridad
        const reason = data.promptFeedback.blockReason;
        const safetyRatingsInfo = data.promptFeedback.safetyRatings?.map(r => `${r.category}: ${r.probability}`).join(', ') || 'No safety ratings details';
        const errorMessage = `Respuesta bloqueada por Gemini. Razón: ${reason}. Detalles: ${safetyRatingsInfo}`;
        console.warn(errorMessage, data.promptFeedback);
        addMessage(`Lo siento ${nombrePreferido}, no puedo generar una respuesta para eso debido a las políticas de contenido. (${reason})`, "bot");
        toast({ title: "Respuesta Bloqueada", description: `Razón: ${reason}`, variant: "destructive" });
      }
      else {
        console.error('Respuesta inesperada de Gemini:', data);
        throw new Error('Respuesta inesperada de la API de Gemini.');
      }

    } catch (error) {
      console.error("Error al enviar mensaje a Gemini:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al contactar a Gemini.";
      addMessage(`Error para ${nombrePreferido}: ${errorMessage}`, "bot");
      toast({ title: "Error de API", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, messages, conversationContext, conversationMemory]);

  const clearMemory = () => {
    setConversationContext('');
    setConversationMemory({});
    localStorage.removeItem(CONVERSATION_CONTEXT_KEY);
    localStorage.removeItem(CONVERSATION_MEMORY_KEY);
    toast({ title: "Memoria y contexto borrados." });
  };

  return {
    messages,
    isLoading,
    sendMessage: sendMessageToGemini,
    apiKey,
    clearMemory,
    conversationContext,
    conversationMemory,
    isDocumentUploaderOpen,
    openDocumentUploader: () => setIsDocumentUploaderOpen(true),
    closeDocumentUploader: () => setIsDocumentUploaderOpen(false),
  };
};
