import { EventEmitter, Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { environment } from "src/environments/environment";
import { SecurityService } from "./security.service";

@Injectable({
  providedIn: "root",
})
export class WebSocketService extends Socket { //Herencia de la clase Socket para manejar conexiones WebSocket
  callback: EventEmitter<any> = new EventEmitter(); 
  nameEvent: string;  // Nombre del evento al que se va a suscribir
  constructor(private securityService: SecurityService) { // Inyección del servicio de seguridad para obtener información del usuario
    const userId = securityService.activeUserSession?.email || ""; // Asegúrate de que no sea nulo
    super({
      url: environment.url_web_socket,
      options: {  
        query: {  // Configuración de opciones para la conexión WebSocket
          user_id: userId,  // Envía el ID del usuario como parte de la consulta al conectar
        },
      },
    });
    this.nameEvent = "";
    //this.listen()
  }
  setNameEvent(nameEvent: string) {
    this.nameEvent = nameEvent;
    this.listen();
  }
  listen = () => {
    this.ioSocket.on(this.nameEvent, (res: any) => this.callback.emit(res)); // Escucha eventos del servidor y emite los datos recibidos a través del EventEmitter
  };
  // Para llamar este método es necesario inyectar el servicio
  // y enviar el payload
  // emitEvent=(payload={})=>{
  //   this.ioSocket.emit(this.nameEvent,payload)
  // }
}
