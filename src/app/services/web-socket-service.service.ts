import { EventEmitter, Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { environment } from "src/environments/environment";
import { SecurityService } from "./security.service";

@Injectable({
  providedIn: "root",
})
export class WebSocketService extends Socket {
  callback: EventEmitter<any> = new EventEmitter(); // llegada de algo desde el servidor (información) => {hacer algo}
  nameEvent: string; // nombre del evento del cual va a estar pendiente o escuchando.
  constructor(private securityService: SecurityService) {
    const userId = securityService.activeUserSession?.email || ""; // Asegúrate de que no sea nulo // Esto lo usamos para identificarnoss con el backend
    super({
      url: environment.url_webSocket,
      options: {
        query: {
          user_id: userId,
        },
        // Forzar transports para evitar problemas de compatibilidad
        transports: ['websocket', 'polling'],
        // Habilitar reconexión automática
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      },
    });
    this.nameEvent = "";
    //this.listen()
  }
  setNameEvent(nameEvent: string) {
    this.nameEvent = nameEvent; // Este es el canal por el cual vamos a escuchar o estar pendientes del backend
    this.listen();
  }
  listen = () => {
    this.ioSocket.on(this.nameEvent, (res: any) => this.callback.emit(res)); // Aqui le pedimos al socket que este pendie nte de todas las respuestas que vengan por el canal nameEvent y mandelas al que este pendiente del callback.
  };
  // Para llamar este método es necesario inyectar el servicio
  // y enviar el payload
  // emitEvent=(payload={})=>{
  //   this.ioSocket.emit(this.nameEvent,payload)
  // }
}
