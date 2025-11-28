import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { SecurityService } from "src/app/services/security.service";

@Injectable({ providedIn: "root" })
export class SocketService {
  constructor(private socket: Socket, private security: SecurityService) {}

  // Wrapper helpers
  fromEvent<T>(eventName: string) {
    return this.socket.fromEvent<T>(eventName);
  }

  emit(eventName: string, data?: any) {
    this.socket.emit(eventName, data);
  }

  connect() {
    try {
      const userId = this.security.activeUserSession?.email || "";
      const io = (this.socket as any).ioSocket;
      if (io) {
        // Fuerza transporte websocket (evita 400 por polling)
        if (io.io && io.io.opts) {
          io.io.opts.transports = ["websocket"];
          io.io.opts.path = "/socket.io";
        } else if ((io as any).opts) {
          (io as any).opts.transports = ["websocket"];
          (io as any).opts.path = "/socket.io";
        }
        // Adjunta user_id en auth o query (compatibilidad v2/v3+)
        if (io.auth !== undefined) {
          io.auth = { user_id: userId };
        } else if (io.io && io.io.opts) {
          io.io.opts.query = { ...(io.io.opts.query || {}), user_id: userId };
        } else if ((io as any).opts) {
          (io as any).opts.query = {
            ...(((io as any).opts.query as any) || {}),
            user_id: userId,
          };
        }
      }
    } catch (_) {
      // best-effort
    }
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }
}
