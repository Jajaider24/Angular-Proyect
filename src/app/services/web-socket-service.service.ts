import { EventEmitter, Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { environment } from "src/environments/environment";
import { SecurityService } from "./security.service";

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  callback: EventEmitter<any> = new EventEmitter();
  nameEvent = "";

  constructor(
    private socket: Socket,
    private securityService: SecurityService
  ) {
    // Do not extend Socket (avoids needing super/appRef). Instead, if there's
    // user info available, attach it to the underlying socket options where possible.
    const userId = this.securityService.activeUserSession?.email || "";
    try {
      const io = (this.socket as any).ioSocket;
      // Try common places to attach auth/query before connect
      if (io) {
        if (io.auth !== undefined) {
          io.auth = { user_id: userId };
        } else if (io.io && io.io.opts) {
          io.io.opts.query = { ...io.io.opts.query, user_id: userId };
        } else if ((io as any).opts) {
          (io as any).opts.query = {
            ...((io as any).opts.query || {}),
            user_id: userId,
          };
        }
      }
    } catch (e) {
      // non-fatal; best-effort
      // console.warn('WebSocketService: unable to attach user_id to socket opts', e);
    }
  }

  setNameEvent(nameEvent: string) {
    this.nameEvent = nameEvent;
    this.listen();
  }

  listen() {
    const io = (this.socket as any).ioSocket;
    if (!io) return;
    io.on(this.nameEvent, (res: any) => this.callback.emit(res));
  }

  emitEvent(payload: any) {
    // Prefer the Socket wrapper emit, which will forward to underlying socket
    this.socket.emit(this.nameEvent, payload);
  }

  connect() {
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }
}
