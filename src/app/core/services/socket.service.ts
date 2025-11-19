import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { environment } from "src/environments/environment";

@Injectable({ providedIn: "root" })
export class SocketService extends Socket {
  constructor() {
    super({
      url: environment.url_web_socket,
      options: {},
    });
  }

  // You can add typed helpers here, e.g.:
  // onNewOrder() { return this.fromEvent<any>('new-order'); }
}
