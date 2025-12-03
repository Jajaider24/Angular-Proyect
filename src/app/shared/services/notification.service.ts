import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export interface AppNotification {
  title: string;
  message: string;
  level: "info" | "success" | "warning" | "error";
  icon?: string; // nombre de icono lucide o ni-*
}

@Injectable({ providedIn: "root" })
export class NotificationService {
  private queue$ = new Subject<AppNotification>();

  // Audio para alertas sonoras
  private audio?: HTMLAudioElement;

  constructor() {
    // Preparar audio (el archivo debe existir en assets/sounds)
    try {
      this.audio = new Audio("assets/sounds/new-order.mp3");
      this.audio.preload = "auto";
      this.audio.volume = 1.0; // volumen máximo por defecto
    } catch {
      // Ignorar si el navegador bloquea
    }
  }

  // Observable para consumir notificaciones
  stream() {
    return this.queue$.asObservable();
  }

  // Emitir notificación y reproducir sonido si corresponde
  notify(n: AppNotification, playSound = false) {
    this.queue$.next(n);
    if (playSound) {
      this.playAlert();
    }
  }

  // Reproducir sonido con manejo de errores
  private playAlert() {
    try {
      this.audio?.currentTime && (this.audio.currentTime = 0);
      this.audio?.play().catch(() => {
        // Algunos navegadores requieren interacción previa; silenciar error
      });
    } catch {
      // Silenciar cualquier error de reproducción
    }
  }
}
