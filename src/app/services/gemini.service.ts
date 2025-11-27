import { Injectable } from "@angular/core";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { from, Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "src/environments/environment";

/**
 * Servicio para integración con Google Gemini API usando SDK oficial
 *
 * Maneja la comunicación con la API de Gemini para responder preguntas
 * del usuario sobre el sistema de delivery. Incluye:
 * - Context-awareness del dominio de negocio
 * - Manejo de errores y reintentos
 * - Formateo de respuestas
 * - SDK oficial de Google Generative AI
 *
 * Configuración:
 * Necesitas obtener una API Key de Google AI Studio:
 * https://aistudio.google.com/app/apikey
 *
 * Luego agrégala en environment.ts:
 * geminiApiKey: 'TU_API_KEY_AQUI'
 */
@Injectable({
  providedIn: "root",
})
export class GeminiService {
  // Cliente de Google Generative AI
  private genAI: GoogleGenerativeAI;

  // Modelo a usar
  private model: any;

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

  constructor() {
    // Inicializar el cliente de Google Generative AI con la API Key
    console.log("🚀 Inicializando Google Generative AI SDK...");
    this.genAI = new GoogleGenerativeAI(this.apiKey);

    // Obtener el modelo gemini-2.5-flash (el modelo más reciente)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("✅ Modelo Gemini 2.5 Flash inicializado correctamente");
  }

  /**
   * Envía una pregunta a Gemini y devuelve la respuesta usando el SDK oficial
   * @param question Pregunta del usuario
   * @returns Observable con la respuesta del bot
   */
  askQuestion(question: string): Observable<string> {
    // Verificar que tenemos API Key
    console.log("🔑 Verificando API Key...");
    console.log("📍 API Key presente:", this.apiKey ? "Sí" : "No");
    console.log("📏 Longitud de API Key:", this.apiKey?.length || 0);

    if (!this.apiKey || this.apiKey === "TU_NUEVA_API_KEY_AQUI") {
      return throwError(
        () =>
          new Error(
            "🔑 ERROR: No hay una API Key válida configurada.\n\n" +
              "Por favor:\n" +
              "1. Ve a: https://aistudio.google.com/app/apikey\n" +
              "2. Genera una nueva API Key\n" +
              "3. Actualiza 'src/environments/environment.ts'\n" +
              "4. Reinicia el servidor (ng serve)"
          )
      );
    }

    // Construir el prompt completo con contexto
    const fullPrompt = `${this.systemContext}\n\nUsuario pregunta: ${question}\n\nResponde de forma amigable y útil:`;

    console.log("🌐 Enviando pregunta a Gemini usando SDK oficial...");

    // Usar el SDK de Google Generative AI para generar contenido
    // Convertir la Promise a Observable para mantener la compatibilidad con RxJS
    return from(this.model.generateContent(fullPrompt)).pipe(
      // Extraer el texto de la respuesta
      map((result: any) => {
        console.log("✅ Respuesta recibida de Gemini");

        const response = result.response;
        const text = response.text();

        console.log("📝 Texto extraído:", text.substring(0, 100) + "...");
        return text;
      }),

      // Manejo de errores
      catchError((error) => {
        console.error("❌ Error en Gemini API:", error);
        console.error("📊 Detalles del error:", error);

        let errorMessage = "Error al comunicarse con el asistente virtual.";

        // El SDK puede lanzar diferentes tipos de errores
        if (
          error.message?.includes("API_KEY_INVALID") ||
          error.message?.includes("API key not valid")
        ) {
          errorMessage =
            "🔑 ERROR DE AUTENTICACIÓN: La API Key de Gemini NO es válida.\n\n" +
            "Por favor:\n" +
            "1. Ve a: https://aistudio.google.com/app/apikey\n" +
            "2. Verifica que la API Key sea correcta\n" +
            "3. Asegúrate de haber habilitado la Generative Language API\n" +
            "4. Actualiza 'src/environments/environment.ts'\n" +
            "5. Reinicia el servidor (ng serve)";
        } else if (error.message?.includes("quota")) {
          errorMessage =
            "⏱️ Límite de solicitudes excedido. Por favor espera un momento e intenta de nuevo.";
        } else if (error.message?.includes("SAFETY")) {
          errorMessage =
            "⚠️ La respuesta fue bloqueada por las políticas de seguridad. Intenta reformular tu pregunta.";
        } else if (error.message) {
          errorMessage = `❌ Error: ${error.message}`;
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
