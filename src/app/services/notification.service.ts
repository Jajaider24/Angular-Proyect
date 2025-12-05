/**
 * NotificationService
 * -------------------
 * Servicio dedicado a manejar notificaciones visuales y sonoras.
 *
 * Funcionalidades:
 * - Reproducir sonido de notificación cuando llega un nuevo pedido
 * - Mostrar notificaciones toast con SweetAlert2
 * - Solicitar permisos de notificación del navegador (opcional)
 *
 * Uso:
 *   constructor(private notification: NotificationService) {}
 *   this.notification.playOrderSound();
 *   this.notification.showNewOrderAlert(orderData);
 */
import { Injectable } from "@angular/core";
import Swal from "sweetalert2";

@Injectable({ providedIn: "root" })
export class NotificationService {
  /**
   * Instancia del objeto Audio para reproducir sonidos.
   * Se crea una sola vez y se reutiliza para evitar crear múltiples instancias.
   */
  private orderSound: HTMLAudioElement | null = null;

  /**
   * Ruta al archivo de sonido de notificación.
   * Sonido del Correcaminos "Beep Beep" 🏃💨
   */
  private readonly ORDER_SOUND_PATH = "assets/sounds/Correcaminos.mp3";

  /**
   * Indica si el sonido ya fue cargado correctamente
   */
  private soundLoaded = false;

  constructor() {
    // Pre-cargar el sonido para evitar latencia en la primera reproducción
    this.initializeSound();
  }

  /**
   * Inicializa el objeto Audio con el sonido de notificación.
   * Se ejecuta al crear el servicio para tener el sonido listo.
   */
  private initializeSound(): void {
    try {
      this.orderSound = new Audio(this.ORDER_SOUND_PATH);

      // Evento cuando el audio está listo para reproducirse
      this.orderSound.addEventListener("canplaythrough", () => {
        this.soundLoaded = true;
        console.log("[NotificationService] ✅ Sonido cargado y listo");
      });

      // Evento de error al cargar
      this.orderSound.addEventListener("error", (e) => {
        console.error("[NotificationService] ❌ Error cargando sonido:", e);
        console.error("[NotificationService] Ruta:", this.ORDER_SOUND_PATH);
      });

      this.orderSound.load(); // Pre-cargar el archivo
      console.log(
        "[NotificationService] Intentando cargar sonido desde:",
        this.ORDER_SOUND_PATH
      );
    } catch (error) {
      console.warn("[NotificationService] Error inicializando sonido:", error);
    }
  }

  /**
   * Reproduce el sonido de notificación de nuevo pedido.
   * El sonido se reproduce desde el inicio cada vez.
   *
   * Nota: Los navegadores modernos requieren interacción del usuario
   * antes de permitir reproducción automática de audio.
   */
  playOrderSound(): void {
    console.log("[NotificationService] 🔊 Intentando reproducir sonido...");
    console.log(
      "[NotificationService] Estado: soundLoaded =",
      this.soundLoaded
    );

    if (!this.orderSound) {
      console.warn("[NotificationService] ⚠️ Objeto Audio no disponible");
      return;
    }

    try {
      // Reiniciar el sonido al inicio para permitir reproducciones consecutivas
      this.orderSound.currentTime = 0;
      this.orderSound.volume = 1.0; // Volumen al máximo

      // Reproducir el sonido
      const playPromise = this.orderSound.play();

      // Manejar el caso de que el navegador bloquee la reproducción automática
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(
              "[NotificationService] 🔔 Sonido reproducido exitosamente"
            );
          })
          .catch((error) => {
            console.warn(
              "[NotificationService] ⚠️ Reproducción bloqueada por el navegador:",
              error.message
            );
            // Mostrar un toast indicando que el sonido fue bloqueado
            this.showSoundBlockedWarning();
          });
      }
    } catch (error) {
      console.error("[NotificationService] Error reproduciendo sonido:", error);
    }
  }

  /**
   * Muestra una alerta toast cuando llega un nuevo pedido.
   * Incluye información del pedido si está disponible.
   *
   * @param orderData - Datos opcionales del pedido (id, cliente, totalPrice, etc.)
   */
  showNewOrderAlert(orderData?: any): void {
    const title = orderData?.id
      ? `🛵 Pedido #${orderData.id} Creado`
      : "🛵 ¡Nuevo Pedido Creado!";

    // Construir el texto con la información disponible
    let text = "";
    if (orderData?.customerName) {
      text += `Cliente: ${orderData.customerName}`;
    }
    if (orderData?.totalPrice) {
      const formattedPrice = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(orderData.totalPrice);
      text += text ? ` | Total: ${formattedPrice}` : `Total: ${formattedPrice}`;
    }
    if (!text) {
      text = "Se ha creado un nuevo pedido exitosamente";
    }

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "info",
      title: title,
      text: text,
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
      didOpen: (toast) => {
        // Pausar el timer cuando el mouse está sobre el toast
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });
  }

  /**
   * Notificación completa de nuevo pedido: sonido + alerta visual.
   * Método de conveniencia que combina ambas notificaciones.
   *
   * @param orderData - Datos opcionales del pedido
   */
  notifyNewOrder(orderData?: any): void {
    this.playOrderSound();
    this.showNewOrderAlert(orderData);
  }

  /**
   * Muestra advertencia cuando el navegador bloquea el sonido automático.
   * Esto ocurre cuando el usuario no ha interactuado con la página.
   */
  private showSoundBlockedWarning(): void {
    Swal.fire({
      toast: true,
      position: "bottom-end",
      icon: "warning",
      title: "Sonido bloqueado",
      text: "Haz clic en la página para habilitar notificaciones sonoras",
      showConfirmButton: false,
      timer: 3000,
    });
  }

  /**
   * Reproduce un sonido de prueba para verificar que funciona.
   * Útil para configuración inicial o debugging.
   */
  testSound(): void {
    console.log("[NotificationService] Probando sonido...");
    this.playOrderSound();
  }

  /**
   * Solicita permiso para notificaciones del navegador (Web Notifications API).
   * Opcional: para mostrar notificaciones incluso cuando la pestaña está en segundo plano.
   *
   * @returns Promise que resuelve con el estado del permiso
   */
  async requestBrowserNotificationPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("[NotificationService] Notificaciones no soportadas");
      return "denied";
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Muestra una notificación del navegador (funciona en segundo plano).
   * Requiere que el usuario haya otorgado permiso previamente.
   *
   * @param title - Título de la notificación
   * @param options - Opciones adicionales (body, icon, etc.)
   */
  showBrowserNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        icon: "/assets/img/brand/favicon.png",
        badge: "/assets/img/brand/favicon.png",
        ...options,
      });

      // Cerrar automáticamente después de 5 segundos
      setTimeout(() => notification.close(), 5000);

      // Enfocar la ventana cuando se hace clic en la notificación
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }
}
