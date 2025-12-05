import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SocketIoConfig, SocketIoModule } from "ngx-socket-io";
import { environment } from "src/environments/environment";

/**
 * Configuración de Socket.IO para conexión con el backend Flask
 * =============================================================================
 * IMPORTANTE: Para evitar problemas de CORS, configuramos:
 * - transports: ['websocket'] → Fuerza WebSocket directo, evitando polling HTTP
 *   que es el que causa problemas de CORS
 * - autoConnect: false → No conectar hasta tener user_id autenticado
 * =============================================================================
 */
const socketConfig: SocketIoConfig = {
  url: environment.url_webSocket,
  options: {
    // No conectar automáticamente al cargar la app: esperamos hasta tener user_id
    autoConnect: false,
    // =========================================================================
    // SOLUCIÓN CORS: Forzar transporte WebSocket directo
    // =========================================================================
    // Por defecto Socket.IO intenta 'polling' primero (HTTP long-polling),
    // que requiere cabeceras CORS. Al forzar 'websocket', la conexión
    // se hace directamente via WebSocket protocol, evitando el problema.
    // =========================================================================
    transports: ["websocket"],
    // Desactivar upgrade automático desde polling a websocket
    upgrade: false,
  },
};

@NgModule({
  declarations: [],
  imports: [CommonModule, SocketIoModule.forRoot(socketConfig)],
  exports: [SocketIoModule],
})
export class CoreModule {}
