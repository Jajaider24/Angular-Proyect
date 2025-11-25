import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SocketIoConfig, SocketIoModule } from "ngx-socket-io";
import { environment } from "src/environments/environment";

const socketConfig: SocketIoConfig = {
  url: environment.url_web_socket,
  options: {
    // No conectar automáticamente al cargar la app: esperamos hasta tener user_id
    autoConnect: false,
  },
};

@NgModule({
  declarations: [],
  imports: [CommonModule, SocketIoModule.forRoot(socketConfig)],
  exports: [SocketIoModule],
})
export class CoreModule {}
