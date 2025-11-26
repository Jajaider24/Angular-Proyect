import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { GeminiService } from "../../../services/gemini.service";

/**
 * Componente ChatBot Inteligente
 *
 * Asistente virtual basado en la API de Gemini que responde preguntas frecuentes
 * sobre el sistema de delivery. Implementa:
 * - Interfaz flotante de chat con avatar animado
 * - Historial de conversación persistente
 * - Integración con Gemini API para respuestas inteligentes
 * - Manejo de estados: abierto/cerrado, cargando, error
 *
 * Características:
 * - Botón flotante para abrir/cerrar el chat
 * - Avatar animado (opcional con voz sintética)
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

  // Historial de mensajes { role: 'user' | 'bot', content: string, timestamp: Date }
  chatHistory: Array<{
    role: "user" | "bot";
    content: string;
    timestamp: Date;
  }> = [];

  // Subject para cleanup de subscripciones
  private destroy$ = new Subject<void>();

  constructor(private geminiService: GeminiService) {}

  ngOnInit(): void {
    // Mensaje de bienvenida inicial
    this.addBotMessage(
      "¡Hola! 👋 Soy tu asistente virtual del sistema de delivery. " +
        "¿En qué puedo ayudarte hoy? Puedes preguntarme sobre restaurantes, pedidos, conductores y más."
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Alternar visibilidad del chatbox
   */
  toggleChat(): void {
    this.isOpen = !this.isOpen;
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
          this.addBotMessage(
            "Lo siento, tuve un problema al procesar tu pregunta. " +
              "Por favor intenta de nuevo o contacta al administrador."
          );
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
   * Agregar mensaje del bot al historial
   */
  private addBotMessage(content: string): void {
    this.chatHistory.push({
      role: "bot",
      content,
      timestamp: new Date(),
    });
    this.scrollToBottom();
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
}
