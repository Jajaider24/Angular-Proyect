/**
 * TrackingService
 * ---------------
 * Servicio dedicado al rastreo en tiempo real de motocicletas.
 *
 * Usa WebSocketService (ngx-socket-io) para escuchar los eventos emitidos
 * por el backend Flask-SocketIO. El backend emite coordenadas usando el
 * nombre del evento igual a la placa de la moto (ej: "ABC123").
 *
 * Endpoints del backend:
 *  - POST /motorcycles/track/{plate}  → inicia transmisión de coordenadas
 *  - POST /motorcycles/stop/{plate}   → detiene la transmisión
 *
 * El backend emite cada 5 segundos un objeto { lat, lng } por el canal
 * correspondiente a la placa.
 */
import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject, Subscription } from "rxjs";
import { WebSocketService } from "src/app/services/web-socket-service.service";
import { environment } from "src/environments/environment";

/**
 * Interfaz que representa una posición geográfica.
 * Coincide con el formato que emite el backend: { lat, lng }
 */
export interface Position {
  lat: number;
  lng: number;
}

@Injectable({ providedIn: "root" })
export class TrackingService implements OnDestroy {
  /**
   * Almacena las suscripciones activas por placa para poder limpiarlas.
   */
  private subscriptions: Map<string, Subscription> = new Map();

  /**
   * Subject que emite posiciones recibidas del WebSocket.
   * Los componentes se suscriben a esto para recibir actualizaciones.
   */
  private positionSubject = new Subject<{
    plate: string;
    position: Position;
  }>();

  /**
   * Observable público para que los componentes escuchen las posiciones.
   */
  public positions$ = this.positionSubject.asObservable();

  constructor(
    private http: HttpClient,
    private webSocketService: WebSocketService
  ) {}

  /**
   * Inicia el tracking de una motocicleta en el backend.
   * Hace POST a /motorcycles/track/{plate} y luego se suscribe
   * al evento WebSocket de la placa.
   *
   * @param plate - Placa de la motocicleta (ej: "ABC123")
   * @returns Observable con la respuesta del backend
   */
  start(plate: string): Observable<any> {
    const key = (plate || "").trim().toUpperCase();
    if (!key) {
      return new Observable((sub) => sub.complete());
    }

    // Llamar al endpoint del backend para iniciar la transmisión
    // POST /motorcycles/track/{plate}
    return new Observable((observer) => {
      this.http
        .post(`${environment.apiUrl}/motorcycles/track/${key}`, {})
        .subscribe({
          next: (response) => {
            console.log(
              `[TrackingService] Tracking iniciado para ${key}:`,
              response
            );

            // Suscribirse al evento WebSocket de la placa
            this.subscribeToPlate(key);

            observer.next(response);
            observer.complete();
          },
          error: (err) => {
            console.error(
              `[TrackingService] Error iniciando tracking para ${key}:`,
              err
            );
            observer.error(err);
          },
        });
    });
  }

  /**
   * Suscribe el servicio al evento WebSocket de una placa específica.
   * Usa el patrón del WebSocketService: setNameEvent() + callback.subscribe()
   *
   * @param plate - Placa normalizada (mayúsculas, sin espacios)
   */
  private subscribeToPlate(plate: string): void {
    // Evitar suscripciones duplicadas
    if (this.subscriptions.has(plate)) {
      console.log(`[TrackingService] Ya existe suscripción para ${plate}`);
      return;
    }

    // Configurar el WebSocketService para escuchar el evento de la placa
    // Nota: El backend emite con el nombre del evento = placa
    this.webSocketService.setNameEvent(plate);

    // Suscribirse al callback del WebSocketService
    const sub = this.webSocketService.callback.subscribe((message: any) => {
      console.log(`[TrackingService] Mensaje recibido para ${plate}:`, message);

      // Validar que el mensaje tenga lat y lng
      const lat = message?.lat ?? message?.latitude;
      const lng = message?.lng ?? message?.longitude;

      if (typeof lat === "number" && typeof lng === "number") {
        // Emitir la posición a través del subject
        this.positionSubject.next({
          plate,
          position: { lat, lng },
        });
      } else {
        console.warn(
          `[TrackingService] Mensaje sin coordenadas válidas:`,
          message
        );
      }
    });

    // Guardar la suscripción para poder cancelarla después
    this.subscriptions.set(plate, sub);
  }

  /**
   * Detiene el tracking de una motocicleta en el backend.
   * Hace POST a /motorcycles/stop/{plate} y cancela la suscripción WebSocket.
   *
   * @param plate - Placa de la motocicleta
   * @returns Observable con la respuesta del backend
   */
  stop(plate: string): Observable<any> {
    const key = (plate || "").trim().toUpperCase();
    if (!key) {
      return new Observable((sub) => sub.complete());
    }

    // Cancelar la suscripción WebSocket local
    this.unsubscribeFromPlate(key);

    // Llamar al endpoint del backend para detener la transmisión
    // POST /motorcycles/stop/{plate}
    return this.http.post(`${environment.apiUrl}/motorcycles/stop/${key}`, {});
  }

  /**
   * Cancela la suscripción WebSocket de una placa específica.
   *
   * @param plate - Placa normalizada
   */
  private unsubscribeFromPlate(plate: string): void {
    const sub = this.subscriptions.get(plate);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(plate);
      console.log(`[TrackingService] Suscripción cancelada para ${plate}`);
    }
  }

  /**
   * Obtiene un Observable que emite posiciones solo para una placa específica.
   * Útil cuando se quiere filtrar las posiciones de una sola moto.
   *
   * @param plate - Placa de la motocicleta
   * @returns Observable que emite Position cuando llegan coordenadas de esa placa
   */
  positionsForPlate$(plate: string): Observable<Position> {
    const key = (plate || "").trim().toUpperCase();
    return new Observable<Position>((observer) => {
      const sub = this.positions$.subscribe(({ plate: p, position }) => {
        if (p === key) {
          observer.next(position);
        }
      });

      // Al desuscribirse del observable, cancelar la suscripción interna
      return () => sub.unsubscribe();
    });
  }

  /**
   * Limpieza al destruir el servicio.
   * Cancela todas las suscripciones activas.
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub, plate) => {
      sub.unsubscribe();
      console.log(
        `[TrackingService] Limpieza: cancelada suscripción para ${plate}`
      );
    });
    this.subscriptions.clear();
    this.positionSubject.complete();
  }
}
