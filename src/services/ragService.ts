
interface Document {
  id: string;
  content: string;
  metadata?: Record<string, any>;
}

class RAGService {
  private documents: Document[] = [];
  private apiKey: string | null = null;
  // Umbral de confianza para determinar si un documento es relevante
  private relevanceThreshold = 60;
  
  constructor() {
    // Initialize with any existing documents from localStorage
    const storedDocuments = localStorage.getItem('ragDocuments');
    if (storedDocuments) {
      try {
        this.documents = JSON.parse(storedDocuments);
      } catch (e) {
        console.error("Error parsing stored documents:", e);
      }
    }
    
    // Intentar recuperar el umbral personalizado del localStorage
    const storedThreshold = localStorage.getItem('ragRelevanceThreshold');
    if (storedThreshold) {
      try {
        this.relevanceThreshold = parseInt(storedThreshold);
      } catch (e) {
        console.error("Error parsing stored threshold:", e);
      }
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Nuevo método para establecer el umbral de relevancia
  setRelevanceThreshold(threshold: number): void {
    if (threshold >= 0 && threshold <= 100) {
      this.relevanceThreshold = threshold;
      localStorage.setItem('ragRelevanceThreshold', threshold.toString());
    } else {
      console.error("Umbral de relevancia debe estar entre 0-100");
    }
  }
  
  // Método para obtener el umbral actual
  getRelevanceThreshold(): number {
    return this.relevanceThreshold;
  }

  addDocument(content: string, metadata?: Record<string, any>): string {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const document: Document = {
      id,
      content,
      metadata
    };
    
    this.documents.push(document);
    this._saveDocuments();
    return id;
  }

  removeDocument(id: string): boolean {
    const initialLength = this.documents.length;
    this.documents = this.documents.filter(doc => doc.id !== id);
    const removed = initialLength > this.documents.length;
    
    if (removed) {
      this._saveDocuments();
    }
    
    return removed;
  }

  getDocuments(): Document[] {
    return [...this.documents];
  }

  clearDocuments(): void {
    this.documents = [];
    this._saveDocuments();
  }

  private _saveDocuments(): void {
    localStorage.setItem('ragDocuments', JSON.stringify(this.documents));
  }

  async retrieveRelevantDocuments(query: string, limit: number = 3): Promise<Document[]> {
    if (!this.apiKey || this.documents.length === 0) {
      console.log("No hay documentos o API key para RAG", {
        hasApiKey: !!this.apiKey,
        docsCount: this.documents.length
      });
      return [];
    }

    try {
      console.log(`Buscando documentos relevantes para: "${query}"`);
      console.log(`Total de documentos disponibles: ${this.documents.length}`);
      console.log(`Umbral de relevancia actual: ${this.relevanceThreshold}`);
      
      // Listamos los documentos disponibles para depuración
      this.documents.forEach((doc, i) => {
        console.log(`Documento ${i+1}: ID=${doc.id}, Título=${doc.metadata?.title || 'Sin título'}`);
        console.log(`Primeros 100 caracteres: ${doc.content.substring(0, 100)}...`);
      });
      
      const GEMINI_MODEL = 'gemini-1.5-flash-latest'; 
      
      // Mejoramos el prompt para puntuación binaria de relevancia
      const requestPrompt = `
      TAREA: Evalúa si cada documento es RELEVANTE o NO RELEVANTE para responder esta consulta específica.
      
      CONSULTA DEL USUARIO: "${query}"
      
      DOCUMENTOS DISPONIBLES:
      ${this.documents.map((doc, idx) => 
        `DOCUMENTO ${idx + 1} (ID: ${doc.id})
        TÍTULO: ${doc.metadata?.title || "Sin título"}
        CONTENIDO: ${doc.content}`
      ).join('\n\n')}
      
      INSTRUCCIONES PARA CLASIFICACIÓN BINARIA:
      1. Para cada documento, determina un NIVEL DE CONFIANZA (0-100) y RELEVANCIA (0-100).
      2. CONFIANZA: ¿Qué tan seguro estás de que el documento contiene información relacionada a la consulta?
      3. RELEVANCIA: ¿Qué tan importante es la información del documento para responder directamente la consulta?
      4. Si un documento no contiene INFORMACIÓN ESPECÍFICA para responder la consulta, debe marcarse como NO RELEVANTE.
      5. CRITERIOS PARA "RELEVANTE": 
         - El documento contiene información que responde DIRECTAMENTE a la consulta
         - El documento proporciona contexto ESENCIAL para comprender la consulta
         - Tanto la confianza como relevancia deben ser ALTAS (>60)
      6. FORMATO DE RESPUESTA: Para cada documento, indica "RELEVANTE" o "NO RELEVANTE", junto con las puntuaciones numéricas.
      
      RESPONDE SOLO en formato JSON tal como se muestra:
      [
        {"id": "id_documento", "isRelevant": true/false, "confidence": valor_confianza, "relevance": valor_relevancia},
        {"id": "id_documento", "isRelevant": true/false, "confidence": valor_confianza, "relevance": valor_relevancia}
      ]`;
      
      console.log("Enviando solicitud a Gemini para clasificación binaria de documentos");
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: requestPrompt }],
            }],
            generationConfig: {
              temperature: 0.1, // Temperatura muy baja para decisiones más precisas
              maxOutputTokens: 800,
            }
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error de la API de Gemini:", errorData);
        return this._fallbackRetrieval(query, limit);
      }

      const data = await response.json();
      console.log("Respuesta completa de Gemini:", JSON.stringify(data, null, 2));
      
      if (data.candidates && data.candidates.length > 0) {
        const resultText = data.candidates[0].content.parts[0].text;
        console.log("Texto de respuesta:", resultText);
        
        // Extraer JSON de la respuesta (más robusto)
        try {
          // Buscamos cualquier estructura que parezca un array JSON
          const jsonMatch = resultText.match(/(\[[\s\S]*?\])/);
          if (jsonMatch && jsonMatch[0]) {
            const jsonText = jsonMatch[0];
            console.log("JSON extraído:", jsonText);
            
            const scores = JSON.parse(jsonText);
            console.log("Evaluaciones binarias parseadas:", scores);
            
            // Garantizamos que el formato sea correcto y tiene los campos que esperamos
            if (Array.isArray(scores) && scores.length > 0 && 
                scores[0].id && typeof scores[0].isRelevant === 'boolean' &&
                typeof scores[0].confidence === 'number' && typeof scores[0].relevance === 'number') {
              
              // FILTRO BINARIO: Solo incluimos documentos clasificados como RELEVANTES y que superen el umbral combinado
              const relevantDocuments = scores.filter(item => {
                // Verificamos que el documento sea marcado como relevante
                const isMarkedRelevant = item.isRelevant === true;
                
                // Verificamos que tanto confianza como relevancia superen el umbral establecido
                const meetsThreshold = item.confidence >= this.relevanceThreshold && 
                                      item.relevance >= this.relevanceThreshold;
                
                // Solo aceptamos documentos que cumplan ambas condiciones
                return isMarkedRelevant && meetsThreshold;
              });
              
              console.log(`Documentos que pasaron el filtro binario: ${relevantDocuments.length}`);
              console.log("Detalles de relevancia:", scores.map(s => 
                `${s.id}: Relevante=${s.isRelevant}, Confianza=${s.confidence}, Relevancia=${s.relevance}`
              ));
              
              // Si no hay documentos relevantes, devolvemos array vacío
              if (relevantDocuments.length === 0) {
                console.log("No se encontraron documentos relevantes que superen el umbral");
                return [];
              }
              
              // Obtener top N resultados ordenados por puntuación combinada (confianza + relevancia)
              const topDocIds = relevantDocuments
                .sort((a, b) => ((b.confidence + b.relevance) - (a.confidence + a.relevance)))
                .slice(0, limit)
                .map(item => item.id);
              
              console.log("IDs de documentos relevantes seleccionados:", topDocIds);
              
              // Devolver los documentos reales
              const relevantDocs = this.documents.filter(doc => topDocIds.includes(doc.id));
              console.log("Documentos relevantes recuperados:", relevantDocs.length);
              return relevantDocs;
            } else {
              console.error("Formato de evaluación binaria inválido:", scores);
            }
          } else {
            console.error("No se pudo encontrar JSON en la respuesta");
          }
        } catch (parseError) {
          console.error("Error al parsear JSON:", parseError, "Texto original:", resultText);
        }
      }
      
      // Si llegamos aquí, usar fallback
      console.log("Usando método de recuperación de respaldo");
      return this._fallbackRetrieval(query, limit);
      
    } catch (error) {
      console.error("Error al recuperar documentos relevantes:", error);
      return this._fallbackRetrieval(query, limit);
    }
  }

  private _fallbackRetrieval(query: string, limit: number): Document[] {
    console.log("Ejecutando recuperación de respaldo basada en palabras clave");
    
    // Limpiamos y normalizamos la consulta
    const cleanQuery = query.toLowerCase().replace(/[^\w\sáéíóúüñ]/gi, '');
    const keywords = cleanQuery.split(/\s+/).filter(k => k.length > 2);
    
    console.log("Palabras clave extraídas:", keywords);
    
    if (keywords.length === 0) {
      console.log("Sin palabras clave útiles, no se devuelven documentos");
      return [];
    }
    
    const scoredDocs = this.documents.map(doc => {
      const content = doc.content.toLowerCase();
      const title = (doc.metadata?.title || '').toLowerCase();
      
      // Calculamos un puntaje basado en frecuencia de palabras clave
      let confidence = 0;
      let relevance = 0;
      
      // Las palabras clave en el título valen más
      keywords.forEach(keyword => {
        if (title.includes(keyword)) {
          confidence += 10;
          relevance += 15;
        }
        
        // Contamos apariciones exactas en el contenido
        let matches = 0;
        let contentPos = 0;
        while ((contentPos = content.indexOf(keyword, contentPos)) !== -1) {
          matches++;
          contentPos += keyword.length;
        }
        confidence += matches * 5;
        relevance += matches * 5;
        
        // Bonus por frases completas de la consulta
        if (content.includes(cleanQuery)) {
          confidence += 25;
          relevance += 30;
        }
      });
      
      // Normalización a escala 0-100
      confidence = Math.min(100, confidence);
      relevance = Math.min(100, relevance);
      
      // Criterio binario para fallback
      const isRelevant = confidence >= this.relevanceThreshold && relevance >= this.relevanceThreshold;
      
      return { 
        doc, 
        isRelevant,
        confidence, 
        relevance,
        combinedScore: confidence + relevance
      };
    });
    
    console.log("Evaluaciones de documentos en fallback:", 
      scoredDocs.map(item => `${item.doc.id} (${item.doc.metadata?.title || 'Sin título'}): 
        Relevante=${item.isRelevant}, Confianza=${item.confidence}, Relevancia=${item.relevance}`));
    
    // Solo documentos que pasan el filtro binario
    const relevantDocs = scoredDocs.filter(item => item.isRelevant);
    
    if (relevantDocs.length === 0) {
      console.log("No se encontraron documentos relevantes en el fallback");
      return [];
    }
    
    const result = relevantDocs
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, limit)
      .map(item => item.doc);
    
    console.log("Documentos de respaldo recuperados:", result.map(doc => doc.id));
    return result;
  }
}

export const ragService = new RAGService();
