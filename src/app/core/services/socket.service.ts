import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";

@Injectable({ providedIn: "root" })
export class SocketService {
  constructor(private socket: Socket) {}

  // Wrapper helpers
  fromEvent<T>(eventName: string) {
    return this.socket.fromEvent<T>(eventName);
  }

  emit(eventName: string, data?: any) {
    this.socket.emit(eventName, data);
  }

  connect() {
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }
}
