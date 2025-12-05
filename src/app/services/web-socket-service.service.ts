import { EventEmitter, Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { environment } from "src/environments/environment";
import { SecurityService } from "./security.service";

/**
 * WebSocketService
 * ================
 * Servicio para manejar conexiones WebSocket con el backend Flask-SocketIO.
 *
 * IMPORTANTE: Este servicio extiende Socket de ngx-socket-io y crea su propia
 * conexion con configuracion especifica que incluye:
 * - transports: ['websocket'] -> Evita problemas de CORS usando WebSocket directo
 * - user_id en query -> Identifica al usuario en el backend
 */
@Injectable({
  providedIn: "root",
})
export class WebSocketService extends Socket {
  // EventEmitter que emite los mensajes recibidos del servidor
  callback: EventEmitter<any> = new EventEmitter();

  // Nombre del evento actual que se esta escuchando
  nameEvent: string;

  constructor(private securityService: SecurityService) {
    // Obtener el email del usuario para identificacion en el backend
    const userId = securityService.activeUserSession?.email || "";

    // =========================================================================
    // CONFIGURACION CRITICA DEL SOCKET
    // =========================================================================
    // transports: ['websocket'] -> Fuerza conexion WebSocket directa
    // Esto EVITA el problema de CORS porque WebSocket no usa HTTP polling
    // =========================================================================
    super({
      url: environment.url_webSocket,
      options: {
        query: {
          user_id: userId,
        },
        // SOLUCION CORS: Usar WebSocket directo en lugar de polling HTTP
        transports: ["websocket"],
        upgrade: false,
      },
    });
    this.nameEvent = "";
  }

  /**
   * Configura el evento a escuchar y comienza a escuchar.
   * NOTA: Cada llamada a este metodo reemplaza el evento anterior.
   *
   * @param nameEvent - Nombre del evento WebSocket (ej: placa de moto)
   */
  setNameEvent(nameEvent: string) {
    this.nameEvent = nameEvent;
    this.listen();
  }

  /**
   * Registra un listener para el evento actual.
   * Cuando el servidor emite un mensaje en este canal, se emite por callback.
   */
  listen = () => {
    this.ioSocket.on(this.nameEvent, (res: any) => {
      console.log(
        `[WebSocketService] Mensaje recibido en canal "${this.nameEvent}":`,
        res
      );
      this.callback.emit(res);
    });
  };
}
