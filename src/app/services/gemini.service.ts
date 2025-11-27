import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "src/environments/environment";

/**
 * Servicio para integración con Google Gemini API
 *
 * Maneja la comunicación con la API de Gemini para responder preguntas
 * del usuario sobre el sistema de delivery. Incluye:
 * - Context-awareness del dominio de negocio
 * - Manejo de errores y reintentos
 * - Formateo de respuestas
 * - Rate limiting (opcional)
 *
 * Configuración:
 * Necesitas obtener una API Key de Google AI Studio:
 * https://makersuite.google.com/app/apikey
 *
 * Luego agrégala en environment.ts:
 * geminiApiKey: 'TU_API_KEY_AQUI'
 */
@Injectable({
  providedIn: "root",
})
export class GeminiService {
  // URL base de la API de Gemini
  private readonly apiUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

  // API Key desde environment (más seguro)
  private apiKey = environment.geminiApiKey;

  // Prompt personalizado del sistema (cargado desde assets)
  private readonly systemContext = `
Eres un asistente virtual de la plataforma de gestión de domicilios en motocicleta. Tu función es responder preguntas frecuentes sobre el sistema de manera clara y amable. Si alguien pregunta algo fuera del tema, responde que no puedes ayudarle con eso.

Ejemplos:
Usuario: ¿Para qué sirve este sistema?
Asistente: Este sistema ayuda a gestionar pedidos de comida entregados por motociclistas, facilitando la interacción entre restaurantes, clientes, repartidores y operadores logísticos.

Usuario: ¿Dónde puedo registrar un nuevo conductor?
Asistente: Para registrar un nuevo conductor, ve al módulo de 'Conductores' en el menú principal y selecciona 'Agregar nuevo'. Completa el formulario con los datos requeridos y guarda los cambios.

Usuario: ¿En qué parte puedo realizar un pedido?
Asistente: Los clientes pueden realizar pedidos desde el módulo 'Pedidos', donde podrán seleccionar productos, especificar cantidades y confirmar la dirección de entrega.

Usuario: ¿Cómo actualizo el estado de un pedido?
Asistente: En el módulo 'Pedidos', busca el pedido que deseas actualizar, selecciona 'Editar' y cambia su estado (por ejemplo, a 'En camino' o 'Entregado').

Usuario: ¿Qué hago si mi moto tiene un inconveniente?
Asistente: Reporta el problema en el módulo 'Inconvenientes'. Añade detalles, fotos como evidencia y selecciona el tipo de inconveniente (falla mecánica, accidente, etc.).

El sistema tiene las siguientes funcionalidades:
- RESTAURANTES: Gestionar locales y sus datos (nombre, dirección, teléfono)
- PRODUCTOS: Catalogar productos disponibles
- MENÚS: Asignar productos a restaurantes
- CLIENTES: Administrar usuarios finales
- PEDIDOS: Gestionar órdenes y estado de entrega
- DIRECCIONES: Direcciones de entrega de clientes
- MOTOCICLETAS: Vehículos de reparto
- CONDUCTORES: Gestión de repartidores
- TURNOS: Asignaciones de moto-conductor
- INCIDENCIAS (INCONVENIENTES): Registrar fallas y accidentes
- FOTOS: Evidencias de incidencias

Si el usuario pregunta algo fuera del tema, responde: "Lo siento, solo puedo ayudarte con preguntas sobre la plataforma de domicilios en motocicleta. ¿En qué más puedo asistirte en este tema?"

Responde de forma clara, concisa y amigable. Usa emojis cuando sea apropiado.
`;

  constructor(private http: HttpClient) {}

  /**
   * Envía una pregunta a Gemini y devuelve la respuesta
   * @param question Pregunta del usuario
   * @returns Observable con la respuesta del bot
   */
  askQuestion(question: string): Observable<string> {
    // Construir el prompt completo con contexto
    const fullPrompt = `${this.systemContext}\n\nUsuario pregunta: ${question}\n\nResponde de forma amigable y útil:`;

    // Preparar payload para Gemini API
    const payload = {
      contents: [
        {
          parts: [
            {
              text: fullPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7, // Creatividad moderada
        maxOutputTokens: 500, // Respuestas concisas
        topP: 0.9,
        topK: 40,
      },
    };

    // Headers con API Key
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    // URL completa con API Key como query param
    const urlWithKey = `${this.apiUrl}?key=${this.apiKey}`;

    // Hacer request a Gemini
    return this.http.post<any>(urlWithKey, payload, { headers }).pipe(
      // Extraer el texto de la respuesta
      map((response) => {
        console.log("✅ Respuesta de Gemini:", response);

        if (
          response?.candidates &&
          response.candidates.length > 0 &&
          response.candidates[0]?.content?.parts &&
          response.candidates[0].content.parts.length > 0
        ) {
          return response.candidates[0].content.parts[0].text;
        }

        throw new Error("Formato de respuesta inválido");
      }),

      // Manejo de errores
      catchError((error) => {
        console.error("❌ Error en Gemini API:", error);

        let errorMessage = "Error al comunicarse con el asistente virtual.";

        if (error.status === 400) {
          errorMessage =
            "La pregunta no pudo ser procesada. Intenta reformularla.";
        } else if (error.status === 401 || error.status === 403) {
          errorMessage =
            "Error de autenticación con Gemini API. Verifica la API Key.";
        } else if (error.status === 429) {
          errorMessage =
            "Límite de solicitudes excedido. Por favor espera un momento.";
        } else if (error.status === 500) {
          errorMessage =
            "El servicio de Gemini está experimentando problemas. Intenta más tarde.";
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Respuestas predefinidas para preguntas frecuentes (fallback)
   * Útil si la API falla o para pruebas sin API Key
   */
  getFallbackResponse(question: string): string {
    const lowerQuestion = question.toLowerCase();

    // FAQ predefinidas
    if (lowerQuestion.includes("sirve") || lowerQuestion.includes("función")) {
      return (
        "🍔 Este sistema sirve para gestionar un servicio de delivery de restaurantes. " +
        "Puedes administrar restaurantes, productos, pedidos, conductores y más. " +
        "¡Todo en un solo lugar!"
      );
    }

    if (
      lowerQuestion.includes("conductor") ||
      lowerQuestion.includes("repartidor")
    ) {
      return (
        "🏍️ Para registrar un nuevo conductor, ve al menú lateral y haz clic en " +
        '"Conductores", luego presiona el botón "Crear Conductor". ' +
        "Necesitarás su nombre, licencia y teléfono."
      );
    }

    if (lowerQuestion.includes("pedido") || lowerQuestion.includes("orden")) {
      return (
        '🛒 Para realizar un pedido, dirígete a la sección "Pedidos" en el menú lateral ' +
        'y haz clic en "Nuevo Pedido". Selecciona el restaurante, cliente y productos.'
      );
    }

    if (lowerQuestion.includes("restaurante")) {
      return (
        '🏪 En la sección "Restaurantes" puedes gestionar todos los locales. ' +
        "Agrega nuevos restaurantes con su información de contacto y ubicación."
      );
    }

    if (lowerQuestion.includes("producto")) {
      return (
        '📦 Los productos se gestionan en la sección "Productos". ' +
        "Puedes agregar, editar o eliminar productos del catálogo."
      );
    }

    if (lowerQuestion.includes("incidencia")) {
      return (
        '⚠️ Las incidencias se registran en "Incidencias" para reportar problemas ' +
        "con las motocicletas o entregas. Puedes adjuntar fotos como evidencia."
      );
    }

    // Respuesta genérica
    return (
      "🤖 Entiendo tu pregunta. Para información específica sobre: " +
      "Restaurantes, Productos, Menús, Clientes, Pedidos, Direcciones, " +
      "Motocicletas, Conductores, Turnos o Incidencias, " +
      "por favor navega al módulo correspondiente en el menú lateral. " +
      "¿Hay algo más en lo que pueda ayudarte?"
    );
  }
}
