import { Component, OnDestroy, OnInit } from "@angular/core";
import { AnimationOptions } from "ngx-lottie";
import { Subject, takeUntil } from "rxjs";
import { GeminiService } from "../../../services/gemini.service";

/**
 * Componente ChatBot Inteligente con Avatar Animado y Voz Sintética
 *
 * Asistente virtual basado en la API de Gemini que responde preguntas frecuentes
 * sobre el sistema de delivery. Implementa:
 * - Interfaz flotante de chat con avatar animado Lottie
 * - Historial de conversación persistente
 * - Integración con Gemini API para respuestas inteligentes
 * - Síntesis de voz (Text-to-Speech) para respuestas del bot
 * - Manejo de estados: abierto/cerrado, cargando, error
 *
 * Características:
 * - Botón flotante para abrir/cerrar el chat
 * - Avatar animado Lottie con animaciones suaves
 * - Voz sintética que lee las respuestas del bot
 * - Historial scrolleable de mensajes
 * - Refresh para reiniciar conversación
 * - Context-aware: conoce el dominio del sistema de delivery
 */
@Component({
  selector: "app-chatbot",
  templateUrl: "./chatbot.component.html",
  styleUrls: ["./chatbot.component.scss"],
})
export class ChatbotComponent implements OnInit, OnDestroy {
  // Estado de UI
  isOpen = false;
  loading = false;
  userInput = "";
  isSpeaking = false;

  // Configuración de animación Lottie para el avatar
  avatarOptions: AnimationOptions = {
    path: "/assets/avatar-animation.json",
    loop: true,
    autoplay: true,
  };

  // Historial de mensajes { role: 'user' | 'bot', content: string, timestamp: Date }
  chatHistory: Array<{
    role: "user" | "bot";
    content: string;
    timestamp: Date;
  }> = [];

  // Subject para cleanup de subscripciones
  private destroy$ = new Subject<void>();

  // Instancia de Web Speech API para síntesis de voz
  private speechSynthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor(private geminiService: GeminiService) {
    // Inicializar Web Speech API si está disponible
    this.speechSynthesis = window.speechSynthesis;
  }

  ngOnInit(): void {
    // Mensaje de bienvenida inicial (se agrega al abrir el chat, no al cargar)
    // No se ejecuta automáticamente para evitar que hable al cargar el proyecto
  }

  ngOnDestroy(): void {
    // Detener cualquier voz en reproducción
    this.stopSpeaking();

    // Cleanup de subscripciones
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Alternar visibilidad del chatbox
   * Cuando se abre por primera vez, muestra mensaje de bienvenida
   */
  toggleChat(): void {
    this.isOpen = !this.isOpen;

    // Si se está abriendo el chat y no hay mensajes, mostrar bienvenida
    if (this.isOpen && this.chatHistory.length === 0) {
      const welcomeMessage =
        "¡Hola! 👋 Soy tu asistente virtual del sistema de delivery. " +
        "¿En qué puedo ayudarte hoy? Puedes preguntarme sobre restaurantes, pedidos, conductores y más.";
      this.addBotMessage(welcomeMessage);

      // Hablar mensaje de bienvenida solo al abrir el chat
      setTimeout(() => this.speak(welcomeMessage), 500);
    }
  }

  /**
   * Enviar mensaje del usuario y obtener respuesta del bot
   */
  sendMessage(): void {
    // Validar que hay contenido
    const message = this.userInput.trim();
    if (!message) {
      return;
    }

    // Agregar mensaje del usuario al historial
    this.addUserMessage(message);

    // Limpiar input
    this.userInput = "";

    // Mostrar estado de carga
    this.loading = true;

    // Llamar a Gemini API
    this.geminiService
      .askQuestion(message)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.addBotMessage(response);
          this.loading = false;
        },
        error: (err) => {
          console.error("❌ Error al comunicarse con Gemini:", err);

          // Mostrar el mensaje de error detallado del servicio
          const errorMessage =
            err.message ||
            "Lo siento, tuve un problema al procesar tu pregunta. " +
              "Por favor intenta de nuevo o contacta al administrador.";

          this.addBotMessage(errorMessage);
          this.loading = false;
        },
      });
  }

  /**
   * Reiniciar conversación (limpiar historial)
   */
  refreshChat(): void {
    this.chatHistory = [];
    this.userInput = "";
    this.loading = false;

    // Mensaje de bienvenida nuevamente
    this.addBotMessage(
      "¡Conversación reiniciada! 🔄 ¿En qué más puedo ayudarte?"
    );
  }

  /**
   * Envía una pregunta rápida predefinida al chatbot.
   * Esta función es llamada desde los botones de sugerencias.
   * @param question - La pregunta predefinida a enviar.
   */
  sendQuickQuestion(question: string): void {
    if (!question || !question.trim()) {
      return;
    }

    // Asignar la pregunta al input y enviar
    this.userInput = question;
    this.sendMessage();
  }

  /**
   * Agregar mensaje del usuario al historial
   */
  private addUserMessage(content: string): void {
    this.chatHistory.push({
      role: "user",
      content,
      timestamp: new Date(),
    });
    this.scrollToBottom();
  }

  /**
   * Agregar mensaje del bot al historial y reproducir voz
   */
  private addBotMessage(content: string): void {
    this.chatHistory.push({
      role: "bot",
      content,
      timestamp: new Date(),
    });
    this.scrollToBottom();

    // Reproducir respuesta en voz sintética (con pequeño delay)
    setTimeout(() => this.speak(content), 300);
  }

  /**
   * Hacer scroll al final del historial automáticamente
   */
  private scrollToBottom(): void {
    // Usar setTimeout para esperar a que el DOM se actualice
    setTimeout(() => {
      const chatBox = document.querySelector(".chat-history-box");
      if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    }, 100);
  }

  /**
   * Manejar tecla Enter en el input
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Síntesis de voz: Hace que el avatar "hable" el texto
   * Utiliza Web Speech API para convertir texto a voz
   * @param text Texto que el avatar dirá en voz alta
   */
  speak(text: string): void {
    // Verificar soporte del navegador
    if (!this.speechSynthesis) {
      console.warn("⚠️ Síntesis de voz no disponible en este navegador");
      return;
    }

    // Detener cualquier voz anterior
    this.stopSpeaking();

    // Crear nueva utterance (declaración de voz)
    this.currentUtterance = new SpeechSynthesisUtterance(text);

    // Configurar voz en español
    const voices = this.speechSynthesis.getVoices();
    const spanishVoice = voices.find(
      (voice) => voice.lang.startsWith("es") || voice.lang.startsWith("ES")
    );

    if (spanishVoice) {
      this.currentUtterance.voice = spanishVoice;
    }

    // Configuración de la voz
    this.currentUtterance.lang = "es-ES";
    this.currentUtterance.rate = 1.0; // Velocidad normal
    this.currentUtterance.pitch = 1.0; // Tono normal
    this.currentUtterance.volume = 0.8; // Volumen al 80%

    // Eventos de la voz
    this.currentUtterance.onstart = () => {
      this.isSpeaking = true;
      console.log("🗣️ Avatar hablando...");
    };

    this.currentUtterance.onend = () => {
      this.isSpeaking = false;
      console.log("🔇 Avatar terminó de hablar");
    };

    this.currentUtterance.onerror = (event) => {
      this.isSpeaking = false;
      console.error("❌ Error en síntesis de voz:", event);
    };

    // Reproducir voz
    this.speechSynthesis.speak(this.currentUtterance);
  }

  /**
   * Detener la voz actual
   */
  stopSpeaking(): void {
    if (this.speechSynthesis && this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Alternar voz on/off
   */
  toggleVoice(): void {
    if (this.isSpeaking) {
      this.stopSpeaking();
    }
  }
}
